import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireProveedor, AuthedRequest } from '../auth';

const router = Router();

/**
 * GET /productos?proveedorId=X
 *  - Sin auth (público): si pasa ?proveedorId, devuelve los activos de ese proveedor.
 *  - Con auth y rol PROVEEDOR sin query: devuelve todos sus productos (incluido inactivos).
 */
router.get('/', async (req: AuthedRequest, res) => {
  const proveedorId = req.query.proveedorId ? Number(req.query.proveedorId) : null;

  if (proveedorId) {
    const productos = await prisma.producto.findMany({
      where: { proveedorId, activo: true },
      orderBy: { id: 'asc' },
    });
    return res.json(productos);
  }
  // Lista del proveedor logueado
  if (req.user?.rol !== 'PROVEEDOR') {
    return res.status(400).json({ error: 'Pasa ?proveedorId para listar productos' });
  }
  const productos = await prisma.producto.findMany({
    where: { proveedorId: req.user.id },
    orderBy: { id: 'asc' },
    include: { _count: { select: { recetas: true } } },
  });
  res.json(productos);
});

router.get('/:id', async (req, res) => {
  const producto = await prisma.producto.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      recetas: { include: { insumo: true } },
      proveedor: { select: { id: true, nombre: true, nombreNegocio: true } },
    },
  });
  if (!producto) return res.status(404).json({ error: 'No encontrado' });
  res.json(producto);
});

router.post('/', requireAuth, requireProveedor, async (req: AuthedRequest, res) => {
  const { nombre, descripcion, precio, imagenUrl } = req.body;
  const p = await prisma.producto.create({
    data: { nombre, descripcion, precio, imagenUrl, proveedorId: req.user!.id },
  });
  res.json(p);
});

router.put('/:id', requireAuth, requireProveedor, async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const existe = await prisma.producto.findUnique({ where: { id } });
  if (!existe) return res.status(404).json({ error: 'No encontrado' });
  if (existe.proveedorId !== req.user!.id) return res.status(403).json({ error: 'No es tuyo' });

  const { nombre, descripcion, precio, imagenUrl, activo } = req.body;
  const p = await prisma.producto.update({
    where: { id },
    data: { nombre, descripcion, precio, imagenUrl, activo },
  });
  res.json(p);
});

router.delete('/:id', requireAuth, requireProveedor, async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const existe = await prisma.producto.findUnique({ where: { id } });
  if (!existe) return res.status(404).json({ error: 'No encontrado' });
  if (existe.proveedorId !== req.user!.id) return res.status(403).json({ error: 'No es tuyo' });

  await prisma.producto.update({ where: { id }, data: { activo: false } });
  res.json({ ok: true });
});

/**
 * PUT /productos/:id/receta — reemplaza por completo la receta del producto.
 * Body: { items: [{ insumoId, cantidad }] }  (cantidad = consumo por 1 unidad producida)
 * Valida que el producto y todos los insumos pertenezcan al proveedor.
 */
router.put('/:id/receta', requireAuth, requireProveedor, async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const producto = await prisma.producto.findUnique({ where: { id } });
  if (!producto) return res.status(404).json({ error: 'No encontrado' });
  if (producto.proveedorId !== req.user!.id) return res.status(403).json({ error: 'No es tuyo' });

  const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
  // Normalizar: un solo registro por insumo, cantidad > 0
  const porInsumo = new Map<number, number>();
  for (const it of rawItems) {
    const insumoId = Number(it?.insumoId);
    const cantidad = Number(it?.cantidad);
    if (!insumoId || !(cantidad > 0)) continue;
    porInsumo.set(insumoId, cantidad);
  }
  const items = Array.from(porInsumo.entries()).map(([insumoId, cantidad]) => ({ insumoId, cantidad }));

  // Validar que los insumos sean del proveedor
  if (items.length) {
    const insumos = await prisma.insumo.findMany({
      where: { id: { in: items.map((i) => i.insumoId) }, proveedorId: req.user!.id },
      select: { id: true },
    });
    if (insumos.length !== items.length) {
      return res.status(400).json({ error: 'Algún insumo no existe o no es tuyo' });
    }
  }

  await prisma.$transaction([
    prisma.recetaItem.deleteMany({ where: { productoId: id } }),
    ...items.map((i) =>
      prisma.recetaItem.create({ data: { productoId: id, insumoId: i.insumoId, cantidad: i.cantidad } })
    ),
  ]);

  const out = await prisma.producto.findUnique({
    where: { id },
    include: { recetas: { include: { insumo: true } } },
  });
  res.json(out);
});

export default router;
