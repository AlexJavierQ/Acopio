import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireDueno } from '../auth';

const router = Router();

router.use(requireAuth, requireDueno);

router.get('/', async (_req, res) => {
  const insumos = await prisma.insumo.findMany({ orderBy: { nombre: 'asc' } });
  res.json(insumos);
});

router.post('/', async (req, res) => {
  const { nombre, unidad, stockActual, stockMinimo } = req.body;
  const i = await prisma.insumo.create({ data: { nombre, unidad, stockActual, stockMinimo } });
  res.json(i);
});

router.put('/:id', async (req, res) => {
  const { nombre, unidad, stockActual, stockMinimo } = req.body;
  const i = await prisma.insumo.update({
    where: { id: Number(req.params.id) },
    data: { nombre, unidad, stockActual, stockMinimo },
  });
  res.json(i);
});

router.patch('/:id/stock', async (req, res) => {
  const { stockActual } = req.body;
  const i = await prisma.insumo.update({
    where: { id: Number(req.params.id) },
    data: { stockActual: Number(stockActual) },
  });
  res.json(i);
});

router.delete('/:id', async (req, res) => {
  await prisma.insumo.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

export default router;
