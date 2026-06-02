import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireDueno } from '../auth';

const router = Router();

router.get('/', async (_req, res) => {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    orderBy: { id: 'asc' },
  });
  res.json(productos);
});

router.get('/:id', async (req, res) => {
  const producto = await prisma.producto.findUnique({
    where: { id: Number(req.params.id) },
    include: { recetas: { include: { insumo: true } } },
  });
  if (!producto) return res.status(404).json({ error: 'No encontrado' });
  res.json(producto);
});

router.post('/', requireAuth, requireDueno, async (req, res) => {
  const { nombre, descripcion, precio, imagenUrl } = req.body;
  const p = await prisma.producto.create({ data: { nombre, descripcion, precio, imagenUrl } });
  res.json(p);
});

router.put('/:id', requireAuth, requireDueno, async (req, res) => {
  const { nombre, descripcion, precio, imagenUrl, activo } = req.body;
  const p = await prisma.producto.update({
    where: { id: Number(req.params.id) },
    data: { nombre, descripcion, precio, imagenUrl, activo },
  });
  res.json(p);
});

router.delete('/:id', requireAuth, requireDueno, async (req, res) => {
  await prisma.producto.update({
    where: { id: Number(req.params.id) },
    data: { activo: false },
  });
  res.json({ ok: true });
});

export default router;
