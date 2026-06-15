import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireProveedor, AuthedRequest } from '../auth';

const router = Router();

router.use(requireAuth, requireProveedor);

// Helper: validar que el insumo pertenece al proveedor logueado
async function asegurarInsumoPropio(id: number, proveedorId: number) {
  const i = await prisma.insumo.findUnique({ where: { id } });
  if (!i) return { error: 404, msg: 'No encontrado' };
  if (i.proveedorId !== proveedorId) return { error: 403, msg: 'No es tuyo' };
  return { ok: true as const };
}

router.get('/', async (req: AuthedRequest, res) => {
  const insumos = await prisma.insumo.findMany({
    where: { proveedorId: req.user!.id },
    orderBy: { nombre: 'asc' },
  });
  res.json(insumos);
});

router.post('/', async (req: AuthedRequest, res) => {
  const { nombre, unidad, stockActual, stockMinimo } = req.body;
  const i = await prisma.insumo.create({
    data: { nombre, unidad, stockActual, stockMinimo, proveedorId: req.user!.id },
  });
  res.json(i);
});

router.put('/:id', async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const check = await asegurarInsumoPropio(id, req.user!.id);
  if (!('ok' in check)) return res.status(check.error).json({ error: check.msg });

  const { nombre, unidad, stockActual, stockMinimo } = req.body;
  const i = await prisma.insumo.update({
    where: { id },
    data: { nombre, unidad, stockActual, stockMinimo },
  });
  res.json(i);
});

router.patch('/:id/stock', async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const check = await asegurarInsumoPropio(id, req.user!.id);
  if (!('ok' in check)) return res.status(check.error).json({ error: check.msg });

  const { stockActual } = req.body;
  const i = await prisma.insumo.update({ where: { id }, data: { stockActual: Number(stockActual) } });
  res.json(i);
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const check = await asegurarInsumoPropio(id, req.user!.id);
  if (!('ok' in check)) return res.status(check.error).json({ error: check.msg });

  await prisma.insumo.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
