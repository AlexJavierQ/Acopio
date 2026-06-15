import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireProveedor, AuthedRequest } from '../auth';

const router = Router();

router.use(requireAuth, requireProveedor);

/**
 * Lista los CLIENTES AFILIADOS (estado APROBADA) al proveedor logueado.
 * Usa ?q= para filtrar por nombre o teléfono.
 */
router.get('/', async (req: AuthedRequest, res) => {
  const proveedorId = req.user!.id;
  const q = String(req.query.q || '').trim();

  const afiliaciones = await prisma.afiliacion.findMany({
    where: {
      proveedorId,
      estado: 'APROBADA',
      ...(q
        ? { cliente: { OR: [{ nombre: { contains: q, mode: 'insensitive' } }, { telefono: { contains: q } }] } }
        : {}),
    },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true, direccion: true } },
    },
    orderBy: { cliente: { nombre: 'asc' } },
  });

  // Anotar conteo de pedidos del cliente con ESTE proveedor
  const clienteIds = afiliaciones.map((a) => a.clienteId);
  const conteos = await prisma.pedido.groupBy({
    by: ['clienteId'],
    where: { proveedorId, clienteId: { in: clienteIds } },
    _count: { _all: true },
  });
  const conteoMap = new Map(conteos.map((c) => [c.clienteId, c._count._all]));

  res.json(
    afiliaciones.map((a) => ({
      ...a.cliente,
      afiliadoDesde: a.resueltoEn || a.creadoEn,
      pedidosConmigo: conteoMap.get(a.clienteId) ?? 0,
    })),
  );
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const proveedorId = req.user!.id;

  // Verificar afiliación aprobada
  const afi = await prisma.afiliacion.findUnique({
    where: { clienteId_proveedorId: { clienteId: id, proveedorId } },
  });
  if (!afi || afi.estado !== 'APROBADA') {
    return res.status(403).json({ error: 'Cliente no afiliado a tu negocio' });
  }

  const cliente = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, nombre: true, telefono: true, direccion: true, rol: true },
  });
  if (!cliente) return res.status(404).json({ error: 'No encontrado' });

  const pedidos = await prisma.pedido.findMany({
    where: { clienteId: id, proveedorId },
    include: { items: { include: { producto: true } }, negociacion: true },
    orderBy: { fecha: 'desc' },
  });

  res.json({ ...cliente, afiliadoDesde: afi.resueltoEn || afi.creadoEn, pedidos });
});

export default router;
