import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireProveedor, AuthedRequest } from '../auth';

const router = Router();

router.use(requireAuth);

const incluirCompleto = {
  items: { include: { producto: true } },
  cliente: { select: { id: true, nombre: true, telefono: true, direccion: true } },
  proveedor: { select: { id: true, nombre: true, nombreNegocio: true, telefono: true, direccion: true } },
  negociacion: { include: { bonos: { include: { producto: true } } } },
  notaVenta: true,
} as const;

/**
 * GET /pedidos
 *  - CLIENTE: lista sus pedidos (puede filtrar por ?proveedorId=X)
 *  - PROVEEDOR: lista los pedidos que ha recibido
 */
router.get('/', async (req: AuthedRequest, res) => {
  const { rol, id: userId } = req.user!;
  const where: any = rol === 'PROVEEDOR' ? { proveedorId: userId } : { clienteId: userId };
  if (rol === 'CLIENTE' && req.query.proveedorId) {
    where.proveedorId = Number(req.query.proveedorId);
  }
  const pedidos = await prisma.pedido.findMany({
    where,
    include: incluirCompleto,
    orderBy: { fecha: 'desc' },
  });
  res.json(pedidos);
});

// Pedidos del día (solo proveedor, scope a sus pedidos)
router.get('/hoy', requireProveedor, async (req: AuthedRequest, res) => {
  const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
  const fin = new Date(); fin.setHours(23, 59, 59, 999);

  const pedidos = await prisma.pedido.findMany({
    where: { proveedorId: req.user!.id, fecha: { gte: inicio, lte: fin } },
    include: incluirCompleto,
    orderBy: { horaEntrega: 'asc' },
  });
  res.json(pedidos);
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const pedido = await prisma.pedido.findUnique({ where: { id }, include: incluirCompleto });
  if (!pedido) return res.status(404).json({ error: 'No encontrado' });
  const { rol, id: userId } = req.user!;
  const permitido = (rol === 'PROVEEDOR' && pedido.proveedorId === userId) ||
                    (rol === 'CLIENTE' && pedido.clienteId === userId);
  if (!permitido) return res.status(403).json({ error: 'Sin permiso' });
  res.json(pedido);
});

/**
 * Crear pedido (cliente). Requiere proveedorId y afiliación APROBADA.
 */
router.post('/', async (req: AuthedRequest, res) => {
  if (req.user!.rol !== 'CLIENTE') return res.status(403).json({ error: 'Solo clientes crean pedidos' });

  const { proveedorId, horaEntrega, items, mensajeNegociacion, solicitarNegociacion } = req.body as {
    proveedorId: number;
    horaEntrega: string;
    items: { productoId: number; cantidad: number }[];
    mensajeNegociacion?: string;
    solicitarNegociacion?: boolean;
  };
  const abrirNegociacion = !!solicitarNegociacion || !!(mensajeNegociacion && mensajeNegociacion.trim());
  if (!proveedorId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'proveedorId y al menos un producto son requeridos' });
  }

  // Verificar afiliación aprobada
  const afi = await prisma.afiliacion.findUnique({
    where: { clienteId_proveedorId: { clienteId: req.user!.id, proveedorId } },
  });
  if (!afi || afi.estado !== 'APROBADA') {
    return res.status(403).json({ error: 'No estás afiliado/aprobado con este proveedor' });
  }

  // Validar que TODOS los productos pertenezcan al proveedor
  const productos = await prisma.producto.findMany({
    where: { id: { in: items.map((i) => i.productoId) }, proveedorId, activo: true },
  });
  if (productos.length !== items.length) {
    return res.status(400).json({ error: 'Algún producto no pertenece a este proveedor o no está activo' });
  }

  const itemsConPrecio = items.map((i) => {
    const p = productos.find((x) => x.id === i.productoId)!;
    return { productoId: i.productoId, cantidad: i.cantidad, precioUnitario: p.precio };
  });
  const subtotal = itemsConPrecio.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);

  const pedido = await prisma.pedido.create({
    data: {
      clienteId: req.user!.id, proveedorId, horaEntrega,
      subtotal, descuento: 0, total: subtotal,
      items: { create: itemsConPrecio },
      ...(abrirNegociacion ? {
        negociacion: { create: { estado: 'SOLICITADA', mensajeCliente: mensajeNegociacion || null } },
      } : {}),
    },
    include: incluirCompleto,
  });

  // HU15: generar la nota de venta automáticamente al crear el pedido.
  const numeroNota = `NV-${String((await prisma.notaVenta.count()) + 1).padStart(6, '0')}`;
  await prisma.notaVenta.create({ data: { pedidoId: pedido.id, numero: numeroNota, total: pedido.total } });

  const completo = await prisma.pedido.findUnique({ where: { id: pedido.id }, include: incluirCompleto });
  res.json(completo);
});

// HU11: el cliente cancela su pedido mientras siga RECIBIDO (aún sin producción).
router.patch('/:id/cancelar', async (req: AuthedRequest, res) => {
  if (req.user!.rol !== 'CLIENTE') return res.status(403).json({ error: 'Solo el cliente cancela su pedido' });
  const id = Number(req.params.id);
  const pedido = await prisma.pedido.findUnique({ where: { id } });
  if (!pedido) return res.status(404).json({ error: 'No encontrado' });
  if (pedido.clienteId !== req.user!.id) return res.status(403).json({ error: 'No es tu pedido' });
  if (pedido.estado !== 'RECIBIDO') {
    return res.status(400).json({ error: 'Ya no puedes cancelar: el pedido entró en producción' });
  }
  const out = await prisma.pedido.update({ where: { id }, data: { estado: 'CANCELADO' } });
  res.json(out);
});

// Cambiar estado (solo proveedor del pedido)
router.patch('/:id/estado', requireProveedor, async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body;
  const validos = ['RECIBIDO', 'EN_PRODUCCION', 'LISTO', 'ENTREGADO', 'CANCELADO'];
  if (!validos.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });

  const existe = await prisma.pedido.findUnique({ where: { id } });
  if (!existe) return res.status(404).json({ error: 'No encontrado' });
  if (existe.proveedorId !== req.user!.id) return res.status(403).json({ error: 'No es tuyo' });

  const pedido = await prisma.pedido.update({ where: { id }, data: { estado } });
  res.json(pedido);
});

/**
 * "Repetir mi pedido habitual" — último pedido del cliente con un proveedor dado.
 * GET /pedidos/cliente/habitual?proveedorId=X
 */
router.get('/cliente/habitual', async (req: AuthedRequest, res) => {
  const proveedorId = req.query.proveedorId ? Number(req.query.proveedorId) : undefined;
  const ultimo = await prisma.pedido.findFirst({
    where: { clienteId: req.user!.id, ...(proveedorId ? { proveedorId } : {}) },
    include: { items: { include: { producto: true } } },
    orderBy: { fecha: 'desc' },
  });
  res.json(ultimo);
});

export default router;
