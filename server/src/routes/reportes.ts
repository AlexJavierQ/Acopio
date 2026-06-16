import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireProveedor, AuthedRequest } from '../auth';

const router = Router();
router.use(requireAuth, requireProveedor);

/**
 * GET /reportes?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Reporte de ventas y ganancias del proveedor en un rango (default: últimos 30 días).
 *  - ventas: suma de totales de pedidos no cancelados
 *  - costo:  estimado con recetas × costoUnitario de cada insumo
 *  - ganancia = ventas - costo
 *  - serie:   desglose diario (para gráfico)
 *  - historial: lista de pedidos del rango (HU28)
 */
router.get('/', async (req: AuthedRequest, res) => {
  const proveedorId = req.user!.id;

  const hasta = req.query.hasta ? new Date(String(req.query.hasta)) : new Date();
  const desde = req.query.desde
    ? new Date(String(req.query.desde))
    : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  desde.setHours(0, 0, 0, 0);
  hasta.setHours(23, 59, 59, 999);

  const pedidos = await prisma.pedido.findMany({
    where: { proveedorId, fecha: { gte: desde, lte: hasta }, estado: { not: 'CANCELADO' } },
    include: { items: true, cliente: { select: { id: true, nombre: true } } },
    orderBy: { fecha: 'desc' },
  });

  // Costo por producto = suma de (cantidad de receta × costo del insumo)
  const productoIds = [...new Set(pedidos.flatMap((p) => p.items.map((i) => i.productoId)))];
  const recetas = productoIds.length
    ? await prisma.recetaItem.findMany({
        where: { productoId: { in: productoIds } },
        include: { insumo: { select: { costoUnitario: true } } },
      })
    : [];
  const costoProducto = new Map<number, number>();
  for (const r of recetas) {
    costoProducto.set(
      r.productoId,
      (costoProducto.get(r.productoId) || 0) + r.cantidad * (r.insumo.costoUnitario || 0)
    );
  }

  let ventas = 0;
  let costo = 0;
  let unidades = 0;
  const porDia = new Map<string, { ventas: number; costo: number; pedidos: number }>();
  const historial: any[] = [];

  for (const p of pedidos) {
    const costoP = p.items.reduce((s, it) => s + (costoProducto.get(it.productoId) || 0) * it.cantidad, 0);
    ventas += p.total;
    costo += costoP;
    unidades += p.items.reduce((s, it) => s + it.cantidad, 0);

    const key = p.fecha.toISOString().slice(0, 10);
    const d = porDia.get(key) || { ventas: 0, costo: 0, pedidos: 0 };
    d.ventas += p.total;
    d.costo += costoP;
    d.pedidos += 1;
    porDia.set(key, d);

    historial.push({
      id: p.id,
      fecha: p.fecha,
      cliente: p.cliente.nombre,
      total: p.total,
      estado: p.estado,
      ganancia: Number((p.total - costoP).toFixed(2)),
    });
  }

  const serie = Array.from(porDia.entries())
    .map(([fecha, d]) => ({
      fecha,
      ventas: Number(d.ventas.toFixed(2)),
      costo: Number(d.costo.toFixed(2)),
      ganancia: Number((d.ventas - d.costo).toFixed(2)),
      pedidos: d.pedidos,
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const sinReceta = productoIds.filter((id) => !costoProducto.has(id)).length;

  res.json({
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
    ventas: Number(ventas.toFixed(2)),
    costo: Number(costo.toFixed(2)),
    ganancia: Number((ventas - costo).toFixed(2)),
    margen: ventas > 0 ? Number((((ventas - costo) / ventas) * 100).toFixed(1)) : 0,
    nPedidos: pedidos.length,
    unidades,
    ticketPromedio: pedidos.length ? Number((ventas / pedidos.length).toFixed(2)) : 0,
    serie,
    historial,
    costeoIncompleto: sinReceta > 0,
  });
});

export default router;
