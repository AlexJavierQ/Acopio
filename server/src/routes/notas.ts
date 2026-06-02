import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireDueno } from '../auth';

const router = Router();

router.use(requireAuth, requireDueno);

// Generar/obtener nota de venta para un pedido
router.post('/pedido/:pedidoId', async (req, res) => {
  const pedidoId = Number(req.params.pedidoId);
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { items: { include: { producto: true } }, cliente: true, notaVenta: true },
  });
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

  if (pedido.notaVenta) {
    return res.json({ ...pedido.notaVenta, pedido });
  }

  const count = await prisma.notaVenta.count();
  const numero = `NV-${String(count + 1).padStart(6, '0')}`;

  const nota = await prisma.notaVenta.create({
    data: { pedidoId, numero, total: pedido.total },
  });
  res.json({ ...nota, pedido });
});

router.get('/pedido/:pedidoId', async (req, res) => {
  const pedidoId = Number(req.params.pedidoId);
  const nota = await prisma.notaVenta.findUnique({
    where: { pedidoId },
  });
  if (!nota) return res.status(404).json({ error: 'Sin nota generada' });
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { items: { include: { producto: true } }, cliente: true },
  });
  res.json({ ...nota, pedido });
});

export default router;
