import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth, requireProveedor, AuthedRequest } from '../auth';

const router = Router();
router.use(requireAuth);

/**
 * Calcula el total final del pedido aplicando la negociación aceptada.
 * - PORCENTAJE: total = subtotal * (1 - valor/100)
 * - MONTO_FIJO: total = subtotal - valor
 * - BONO: total = subtotal (los bonos se agregan como PedidoItem.esBono=true)
 */
function calcularDescuento(subtotal: number, tipo: string, valor: number | null): number {
  if (tipo === 'PORCENTAJE' && valor != null) return Math.round(subtotal * (valor / 100) * 100) / 100;
  if (tipo === 'MONTO_FIJO' && valor != null) return Math.min(subtotal, valor);
  return 0;
}

/**
 * GET /negociaciones?estado=SOLICITADA  (PROVEEDOR ve las pendientes en sus pedidos)
 *                  ?mias=1               (CLIENTE ve sus negociaciones)
 */
router.get('/', async (req: AuthedRequest, res) => {
  const { rol, id: userId } = req.user!;
  const estado = req.query.estado as string | undefined;

  const where: any = {};
  if (rol === 'PROVEEDOR') where.pedido = { proveedorId: userId };
  else where.pedido = { clienteId: userId };
  if (estado) where.estado = estado;

  const negs = await prisma.negociacion.findMany({
    where,
    include: {
      bonos: { include: { producto: true } },
      pedido: {
        include: {
          cliente: { select: { id: true, nombre: true, telefono: true } },
          proveedor: { select: { id: true, nombre: true, nombreNegocio: true } },
          items: { include: { producto: true } },
        },
      },
    },
    orderBy: { creadoEn: 'desc' },
  });
  res.json(negs);
});

// CLIENTE solicita descuento sobre un pedido suyo (que aún no tiene negociación)
const solicitarSchema = z.object({ pedidoId: z.number().int(), mensaje: z.string().min(1).max(500) });
router.post('/', async (req: AuthedRequest, res) => {
  if (req.user!.rol !== 'CLIENTE') return res.status(403).json({ error: 'Solo clientes solicitan descuento' });
  const parsed = solicitarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos' });

  const pedido = await prisma.pedido.findUnique({ where: { id: parsed.data.pedidoId }, include: { negociacion: true } });
  if (!pedido) return res.status(404).json({ error: 'Pedido no existe' });
  if (pedido.clienteId !== req.user!.id) return res.status(403).json({ error: 'No es tu pedido' });
  if (pedido.negociacion) return res.status(409).json({ error: 'Ya hay una negociación en este pedido' });

  const neg = await prisma.negociacion.create({
    data: { pedidoId: pedido.id, estado: 'SOLICITADA', mensajeCliente: parsed.data.mensaje },
  });
  res.json(neg);
});

/**
 * PROVEEDOR acepta la negociación, definiendo descuento.
 * Body:
 *   { tipo: 'PORCENTAJE', valor: 10 }
 *   { tipo: 'MONTO_FIJO', valor: 0.50 }
 *   { tipo: 'BONO', bonos: [{ productoId, cantidad }, ...] }
 *   notaProveedor opcional
 */
const aceptarSchema = z.object({
  tipo: z.enum(['PORCENTAJE', 'MONTO_FIJO', 'BONO']),
  valor: z.number().nonnegative().optional(),
  bonos: z.array(z.object({ productoId: z.number().int(), cantidad: z.number().int().positive() })).optional(),
  notaProveedor: z.string().max(500).optional(),
});
router.patch('/:id/aceptar', requireProveedor, async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const parsed = aceptarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos' });
  const { tipo, valor, bonos, notaProveedor } = parsed.data;

  const neg = await prisma.negociacion.findUnique({
    where: { id },
    include: { pedido: true },
  });
  if (!neg) return res.status(404).json({ error: 'No encontrada' });
  if (neg.pedido.proveedorId !== req.user!.id) return res.status(403).json({ error: 'No es tuya' });

  if (tipo === 'BONO' && (!bonos || bonos.length === 0)) {
    return res.status(400).json({ error: 'BONO requiere al menos un producto extra' });
  }
  if ((tipo === 'PORCENTAJE' || tipo === 'MONTO_FIJO') && valor == null) {
    return res.status(400).json({ error: 'Debe enviar valor numérico para este tipo' });
  }

  // Si BONO, validar que los productos sean del proveedor
  if (tipo === 'BONO' && bonos) {
    const ids = bonos.map((b) => b.productoId);
    const productos = await prisma.producto.findMany({ where: { id: { in: ids }, proveedorId: req.user!.id } });
    if (productos.length !== ids.length) return res.status(400).json({ error: 'Algún producto extra no es tuyo' });
  }

  const descuento = calcularDescuento(neg.pedido.subtotal, tipo, valor ?? null);
  const totalFinal = Math.max(0, neg.pedido.subtotal - descuento);

  // Transacción: actualizar negociación + pedido + (si BONO) crear bonos y PedidoItems regalo
  const [actualizada] = await prisma.$transaction([
    prisma.negociacion.update({
      where: { id },
      data: {
        estado: 'ACEPTADA', tipo, valor: valor ?? null,
        notaProveedor: notaProveedor ?? null, resueltoEn: new Date(),
      },
      include: { bonos: { include: { producto: true } } },
    }),
    prisma.pedido.update({
      where: { id: neg.pedidoId },
      data: { descuento, total: totalFinal },
    }),
    ...(tipo === 'BONO' && bonos
      ? bonos.flatMap((b) => [
          prisma.negociacionBono.create({ data: { negociacionId: id, productoId: b.productoId, cantidad: b.cantidad } }),
          prisma.pedidoItem.create({
            data: { pedidoId: neg.pedidoId, productoId: b.productoId, cantidad: b.cantidad, precioUnitario: 0, esBono: true },
          }),
        ])
      : []),
  ]);

  res.json(actualizada);
});

router.patch('/:id/rechazar', requireProveedor, async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const { notaProveedor } = req.body || {};
  const neg = await prisma.negociacion.findUnique({ where: { id }, include: { pedido: true } });
  if (!neg) return res.status(404).json({ error: 'No encontrada' });
  if (neg.pedido.proveedorId !== req.user!.id) return res.status(403).json({ error: 'No es tuya' });

  const out = await prisma.negociacion.update({
    where: { id },
    data: { estado: 'RECHAZADA', notaProveedor: notaProveedor ?? null, resueltoEn: new Date() },
  });
  res.json(out);
});

export default router;
