import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireDueno } from '../auth';

const router = Router();

router.use(requireAuth, requireDueno);

router.get('/hoy', async (_req, res) => {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date();
  fin.setHours(23, 59, 59, 999);

  const pedidos = await prisma.pedido.findMany({
    where: { fecha: { gte: inicio, lte: fin } },
    include: { items: true },
  });

  const totalPedidos = pedidos.length;
  const totalUnidades = pedidos.reduce(
    (s, p) => s + p.items.reduce((a, i) => a + i.cantidad, 0),
    0
  );
  const totalFacturar = pedidos.reduce((s, p) => s + p.total, 0);

  const insumosBajos = await prisma.insumo.findMany({
    where: { stockActual: { lte: prisma.insumo.fields.stockMinimo } },
  });

  res.json({
    totalPedidos,
    totalUnidades,
    totalFacturar: Number(totalFacturar.toFixed(2)),
    insumosBajos: insumosBajos.length,
  });
});

export default router;
