import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth, requireProveedor, AuthedRequest } from '../auth';

const router = Router();
router.use(requireAuth);

/**
 * GET /afiliaciones
 *   - PROVEEDOR: lista las afiliaciones que recibió. Filtros: ?estado=PENDIENTE|APROBADA|RECHAZADA
 *   - CLIENTE:   lista sus solicitudes/afiliaciones (a todos los proveedores)
 */
router.get('/', async (req: AuthedRequest, res) => {
  const { rol, id: userId } = req.user!;
  const estado = req.query.estado as string | undefined;
  const where: any = rol === 'PROVEEDOR' ? { proveedorId: userId } : { clienteId: userId };
  if (estado) where.estado = estado;

  const afis = await prisma.afiliacion.findMany({
    where,
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true, direccion: true } },
      proveedor: { select: { id: true, nombre: true, nombreNegocio: true, fotoUrl: true, descripcion: true } },
    },
    orderBy: { creadoEn: 'desc' },
  });
  res.json(afis);
});

// CLIENTE solicita afiliación a un proveedor
const solicitarSchema = z.object({
  proveedorId: z.number().int().positive(),
  mensaje: z.string().max(500).optional(),
});
router.post('/', async (req: AuthedRequest, res) => {
  if (req.user!.rol !== 'CLIENTE') return res.status(403).json({ error: 'Solo clientes solicitan afiliación' });
  const parsed = solicitarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos' });

  const { proveedorId, mensaje } = parsed.data;
  const proveedor = await prisma.usuario.findUnique({ where: { id: proveedorId } });
  if (!proveedor || proveedor.rol !== 'PROVEEDOR') {
    return res.status(404).json({ error: 'Proveedor no existe' });
  }

  const existe = await prisma.afiliacion.findUnique({
    where: { clienteId_proveedorId: { clienteId: req.user!.id, proveedorId } },
  });
  if (existe) {
    if (existe.estado === 'RECHAZADA') {
      // Permitir reabrir solicitud rechazada
      const reabierta = await prisma.afiliacion.update({
        where: { id: existe.id },
        data: { estado: 'PENDIENTE', mensaje: mensaje ?? null, origen: 'SOLICITUD', resueltoEn: null },
      });
      return res.json(reabierta);
    }
    return res.status(409).json({ error: `Ya existe una afiliación en estado ${existe.estado}` });
  }

  const afi = await prisma.afiliacion.create({
    data: { clienteId: req.user!.id, proveedorId, mensaje, origen: 'SOLICITUD', estado: 'PENDIENTE' },
  });
  res.json(afi);
});

// PROVEEDOR aprueba/rechaza una afiliación recibida
const resolverSchema = z.object({ estado: z.enum(['APROBADA', 'RECHAZADA']) });
router.patch('/:id', requireProveedor, async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const parsed = resolverSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Estado inválido' });

  const afi = await prisma.afiliacion.findUnique({ where: { id } });
  if (!afi) return res.status(404).json({ error: 'No encontrada' });
  if (afi.proveedorId !== req.user!.id) return res.status(403).json({ error: 'No es tuya' });

  const out = await prisma.afiliacion.update({
    where: { id },
    data: { estado: parsed.data.estado, resueltoEn: new Date() },
    include: { cliente: { select: { id: true, nombre: true, telefono: true, direccion: true } } },
  });
  res.json(out);
});

/**
 * PROVEEDOR agrega un cliente manualmente.
 *   - Si el teléfono no existe, crea el usuario CLIENTE con password aleatoria temporal.
 *   - Si existe pero es PROVEEDOR, error.
 *   - Crea afiliación APROBADA directamente.
 */
const manualSchema = z.object({
  telefono: z.string().min(7),
  nombre: z.string().min(2),
  direccion: z.string().optional(),
  passwordTemporal: z.string().min(4).optional(),
});
router.post('/manual', requireProveedor, async (req: AuthedRequest, res) => {
  const parsed = manualSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos' });
  const { telefono, nombre, direccion, passwordTemporal } = parsed.data;

  let cliente = await prisma.usuario.findUnique({ where: { telefono } });
  if (cliente && cliente.rol !== 'CLIENTE') {
    return res.status(400).json({ error: 'Ese teléfono pertenece a un proveedor' });
  }
  if (!cliente) {
    cliente = await prisma.usuario.create({
      data: {
        nombre, telefono, direccion,
        rol: 'CLIENTE',
        password: bcrypt.hashSync(passwordTemporal || 'cliente123', 10),
      },
    });
  }

  // Crear o reabrir afiliación
  const existente = await prisma.afiliacion.findUnique({
    where: { clienteId_proveedorId: { clienteId: cliente.id, proveedorId: req.user!.id } },
  });
  const afi = existente
    ? await prisma.afiliacion.update({
        where: { id: existente.id },
        data: { estado: 'APROBADA', origen: 'MANUAL', resueltoEn: new Date() },
      })
    : await prisma.afiliacion.create({
        data: {
          clienteId: cliente.id, proveedorId: req.user!.id,
          estado: 'APROBADA', origen: 'MANUAL', resueltoEn: new Date(),
        },
      });

  res.json({
    afiliacion: afi,
    cliente: { id: cliente.id, nombre: cliente.nombre, telefono: cliente.telefono, direccion: cliente.direccion },
    creadoUsuario: !existente,
  });
});

export default router;
