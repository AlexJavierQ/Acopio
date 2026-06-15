import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireProveedor, AuthedRequest } from '../auth';

const router = Router();

router.use(requireAuth, requireProveedor);

router.get('/hoy', async (req: AuthedRequest, res) => {
  const proveedorId = req.user!.id;
  const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
  const fin = new Date(); fin.setHours(23, 59, 59, 999);

  const [pedidos, insumosBajos, afiliacionesPendientes, negociacionesPendientes] = await Promise.all([
    prisma.pedido.findMany({
      where: { proveedorId, fecha: { gte: inicio, lte: fin } },
      include: { items: true },
    }),
    prisma.insumo.findMany({
      where: { proveedorId, stockActual: { lte: prisma.insumo.fields.stockMinimo } },
    }),
    prisma.afiliacion.count({ where: { proveedorId, estado: 'PENDIENTE' } }),
    prisma.negociacion.count({
      where: { estado: 'SOLICITADA', pedido: { proveedorId } },
    }),
  ]);

  const totalPedidos = pedidos.length;
  const totalUnidades = pedidos.reduce((s, p) => s + p.items.reduce((a, i) => a + i.cantidad, 0), 0);
  const totalFacturar = pedidos.reduce((s, p) => s + p.total, 0);

  res.json({
    totalPedidos,
    totalUnidades,
    totalFacturar: Number(totalFacturar.toFixed(2)),
    insumosBajos: insumosBajos.length,
    afiliacionesPendientes,
    negociacionesPendientes,
  });
});

export default router;
