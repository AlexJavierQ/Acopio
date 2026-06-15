import { Router } from 'express';
import { prisma } from '../prisma';
import { AuthedRequest } from '../auth';
import jwt from 'jsonwebtoken';

const router = Router();

// Auth opcional: si hay token, decodifica al usuario; si no, sigue sin user.
const JWT_SECRET = process.env.JWT_SECRET || 'acopio-dev-secret';
function authOpcional(req: AuthedRequest, _res: any, next: any) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), JWT_SECRET) as any;
    } catch { /* ignorar token inválido */ }
  }
  next();
}

router.use(authOpcional);

/**
 * GET /proveedores  — directorio público de proveedores.
 * Si hay un cliente autenticado, anota su afiliación con cada proveedor.
 */
router.get('/', async (req: AuthedRequest, res) => {
  const q = String(req.query.q || '').trim();
  const proveedores = await prisma.usuario.findMany({
    where: {
      rol: 'PROVEEDOR',
      ...(q
        ? {
            OR: [
              { nombre: { contains: q, mode: 'insensitive' } },
              { nombreNegocio: { contains: q, mode: 'insensitive' } },
              { descripcion: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    select: {
      id: true, nombre: true, nombreNegocio: true, descripcion: true,
      fotoUrl: true, direccion: true,
      _count: { select: { afiliacionesComoProveedor: { where: { estado: 'APROBADA' } }, productos: true } },
    },
    orderBy: { nombreNegocio: 'asc' },
  });

  // Si es cliente, anotar afiliación
  let afiPorProveedor = new Map<number, any>();
  if (req.user?.rol === 'CLIENTE') {
    const afis = await prisma.afiliacion.findMany({
      where: { clienteId: req.user.id, proveedorId: { in: proveedores.map((p) => p.id) } },
    });
    afiPorProveedor = new Map(afis.map((a) => [a.proveedorId, a]));
  }

  res.json(
    proveedores.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      nombreNegocio: p.nombreNegocio,
      descripcion: p.descripcion,
      fotoUrl: p.fotoUrl,
      direccion: p.direccion,
      totalAfiliados: p._count.afiliacionesComoProveedor,
      totalProductos: p._count.productos,
      miAfiliacion: afiPorProveedor.get(p.id) || null,
    })),
  );
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const p = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true, nombre: true, nombreNegocio: true, descripcion: true,
      fotoUrl: true, direccion: true, rol: true,
    },
  });
  if (!p || p.rol !== 'PROVEEDOR') return res.status(404).json({ error: 'Proveedor no existe' });

  const productos = await prisma.producto.findMany({
    where: { proveedorId: id, activo: true },
    orderBy: { nombre: 'asc' },
  });

  let miAfiliacion = null;
  if (req.user?.rol === 'CLIENTE') {
    miAfiliacion = await prisma.afiliacion.findUnique({
      where: { clienteId_proveedorId: { clienteId: req.user.id, proveedorId: id } },
    });
  }

  res.json({ ...p, productos, miAfiliacion });
});

export default router;
