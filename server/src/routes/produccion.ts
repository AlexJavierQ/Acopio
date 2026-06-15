import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireProveedor, AuthedRequest } from '../auth';

const router = Router();

router.use(requireAuth, requireProveedor);

// Reporte de producción del día: calcula 4 pasos (scoped al proveedor logueado)
router.get('/hoy', async (req: AuthedRequest, res) => {
  const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
  const fin = new Date(); fin.setHours(23, 59, 59, 999);

  // Solo pedidos no entregados de este proveedor (aún por producir)
  const pedidos = await prisma.pedido.findMany({
    where: {
      proveedorId: req.user!.id,
      fecha: { gte: inicio, lte: fin },
      estado: { in: ['RECIBIDO', 'EN_PRODUCCION'] },
    },
    include: { items: { include: { producto: true } } },
  });

  // (a) y (b) unidades por producto y total a producir
  const porProducto = new Map<number, { producto: any; cantidad: number }>();
  for (const p of pedidos) {
    for (const it of p.items) {
      const cur = porProducto.get(it.productoId);
      if (cur) cur.cantidad += it.cantidad;
      else porProducto.set(it.productoId, { producto: it.producto, cantidad: it.cantidad });
    }
  }
  const unidadesPorProducto = Array.from(porProducto.values()).sort((a, b) =>
    a.producto.nombre.localeCompare(b.producto.nombre)
  );
  const totalAProducir = unidadesPorProducto.reduce((s, x) => s + x.cantidad, 0);

  // (c) insumos necesarios usando recetas
  const recetas = await prisma.recetaItem.findMany({
    where: { productoId: { in: Array.from(porProducto.keys()) } },
    include: { insumo: true },
  });

  const insumoMap = new Map<number, { insumo: any; necesario: number }>();
  for (const { productoId, cantidad } of unidadesPorProducto.map((u) => ({
    productoId: u.producto.id,
    cantidad: u.cantidad,
  }))) {
    const recsProd = recetas.filter((r) => r.productoId === productoId);
    for (const r of recsProd) {
      const acumulado = (insumoMap.get(r.insumoId)?.necesario || 0) + r.cantidad * cantidad;
      insumoMap.set(r.insumoId, { insumo: r.insumo, necesario: acumulado });
    }
  }

  // (d) validación contra stock
  const insumosNecesarios = Array.from(insumoMap.values())
    .map((x) => ({
      id: x.insumo.id,
      nombre: x.insumo.nombre,
      unidad: x.insumo.unidad,
      necesario: Number(x.necesario.toFixed(3)),
      stockActual: x.insumo.stockActual,
      stockMinimo: x.insumo.stockMinimo,
      alcanza: x.insumo.stockActual >= x.necesario,
      faltante: Math.max(0, Number((x.necesario - x.insumo.stockActual).toFixed(3))),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  res.json({
    cantidadPedidos: pedidos.length,
    unidadesPorProducto: unidadesPorProducto.map((u) => ({
      productoId: u.producto.id,
      nombre: u.producto.nombre,
      cantidad: u.cantidad,
    })),
    totalAProducir,
    insumosNecesarios,
    todoAlcanza: insumosNecesarios.every((i) => i.alcanza),
  });
});

export default router;
