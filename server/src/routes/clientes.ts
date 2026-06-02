import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireDueno } from '../auth';

const router = Router();

router.use(requireAuth, requireDueno);

router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const where: any = { rol: 'CLIENTE' };
  if (q) {
    where.OR = [
      { nombre: { contains: q } },
      { telefono: { contains: q } },
    ];
  }
  const clientes = await prisma.usuario.findMany({
    where,
    select: {
      id: true,
      nombre: true,
      telefono: true,
      direccion: true,
      _count: { select: { pedidos: true } },
    },
    orderBy: { nombre: 'asc' },
  });
  res.json(clientes);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const cliente = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      telefono: true,
      direccion: true,
      rol: true,
      pedidos: {
        include: { items: { include: { producto: true } } },
        orderBy: { fecha: 'desc' },
      },
    },
  });
  if (!cliente) return res.status(404).json({ error: 'No encontrado' });
  res.json(cliente);
});

export default router;
