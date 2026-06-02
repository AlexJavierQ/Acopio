import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireDueno, AuthedRequest } from '../auth';

const router = Router();

router.use(requireAuth);

// Listar pedidos del usuario actual (cliente) o todos si es dueño
router.get('/', async (req: AuthedRequest, res) => {
  const where = req.user!.rol === 'DUENO' ? {} : { clienteId: req.user!.id };
  const pedidos = await prisma.pedido.findMany({
    where,
    include: {
      items: { include: { producto: true } },
      cliente: { select: { id: true, nombre: true, telefono: true, direccion: true } },
    },
    orderBy: { fecha: 'desc' },
  });
  res.json(pedidos);
});

// Pedidos del día (solo dueño)
router.get('/hoy', requireDueno, async (_req, res) => {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date();
  fin.setHours(23, 59, 59, 999);

  const pedidos = await prisma.pedido.findMany({
    where: { fecha: { gte: inicio, lte: fin } },
    include: {
      items: { include: { producto: true } },
      cliente: { select: { id: true, nombre: true, telefono: true, direccion: true } },
    },
    orderBy: { horaEntrega: 'asc' },
  });
  res.json(pedidos);
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      items: { include: { producto: true } },
      cliente: { select: { id: true, nombre: true, telefono: true, direccion: true } },
      notaVenta: true,
    },
  });
  if (!pedido) return res.status(404).json({ error: 'No encontrado' });
  if (req.user!.rol !== 'DUENO' && pedido.clienteId !== req.user!.id) {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  res.json(pedido);
});

// Crear pedido (cliente)
router.post('/', async (req: AuthedRequest, res) => {
  const { horaEntrega, items } = req.body as {
    horaEntrega: string;
    items: { productoId: number; cantidad: number }[];
  };
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Debe incluir productos' });
  }

  const productos = await prisma.producto.findMany({
    where: { id: { in: items.map((i) => i.productoId) } },
  });

  const itemsConPrecio = items.map((i) => {
    const p = productos.find((p) => p.id === i.productoId);
    if (!p) throw new Error(`Producto ${i.productoId} no existe`);
    return { productoId: i.productoId, cantidad: i.cantidad, precioUnitario: p.precio };
  });

  const total = itemsConPrecio.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);

  const pedido = await prisma.pedido.create({
    data: {
      clienteId: req.user!.id,
      horaEntrega,
      total,
      items: { create: itemsConPrecio },
    },
    include: { items: { include: { producto: true } } },
  });

  res.json(pedido);
});

// Cambiar estado (solo dueño)
router.patch('/:id/estado', requireDueno, async (req, res) => {
  const { estado } = req.body;
  const validos = ['RECIBIDO', 'EN_PRODUCCION', 'LISTO', 'ENTREGADO'];
  if (!validos.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
  const pedido = await prisma.pedido.update({
    where: { id: Number(req.params.id) },
    data: { estado },
  });
  res.json(pedido);
});

// "Repetir mi pedido habitual": último pedido del cliente
router.get('/cliente/habitual', async (req: AuthedRequest, res) => {
  const ultimo = await prisma.pedido.findFirst({
    where: { clienteId: req.user!.id },
    include: { items: { include: { producto: true } } },
    orderBy: { fecha: 'desc' },
  });
  res.json(ultimo);
});

export default router;
