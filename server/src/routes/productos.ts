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

export default router;
