import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma';
import { firmar } from '../auth';

const router = Router();

const registroSchema = z.object({
  nombre: z.string().min(2),
  telefono: z.string().min(7),
  password: z.string().min(4),
  rol: z.enum(['CLIENTE', 'PROVEEDOR']).default('CLIENTE'),
  direccion: z.string().optional(),
  // Solo para proveedores:
  nombreNegocio: z.string().optional(),
  descripcion: z.string().optional(),
  fotoUrl: z.string().url().optional(),
});

const sanitizarUsuario = (u: any) => ({
  id: u.id,
  nombre: u.nombre,
  telefono: u.telefono,
  rol: u.rol as 'CLIENTE' | 'PROVEEDOR',
  direccion: u.direccion,
  nombreNegocio: u.nombreNegocio,
  descripcion: u.descripcion,
  fotoUrl: u.fotoUrl,
});

router.post('/registro', async (req, res) => {
  const parsed = registroSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos' });
  const { nombre, telefono, password, rol, direccion, nombreNegocio, descripcion, fotoUrl } = parsed.data;

  const existe = await prisma.usuario.findUnique({ where: { telefono } });
  if (existe) return res.status(409).json({ error: 'Ese teléfono ya está registrado' });

  if (rol === 'PROVEEDOR' && !nombreNegocio) {
    return res.status(400).json({ error: 'Los proveedores requieren nombreNegocio' });
  }

  const usuario = await prisma.usuario.create({
    data: {
      nombre, telefono,
      password: bcrypt.hashSync(password, 10),
      rol, direccion,
      nombreNegocio: rol === 'PROVEEDOR' ? nombreNegocio : null,
      descripcion: rol === 'PROVEEDOR' ? descripcion : null,
      fotoUrl: rol === 'PROVEEDOR' ? fotoUrl : null,
    },
  });

  const token = firmar({ id: usuario.id, rol: usuario.rol as 'CLIENTE' | 'PROVEEDOR', nombre: usuario.nombre });
  res.json({ token, usuario: sanitizarUsuario(usuario) });
});

const loginSchema = z.object({
  telefono: z.string(),
  password: z.string(),
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos' });
  const telefono = parsed.data.telefono.trim();
  const password = parsed.data.password;

  const usuario = await prisma.usuario.findUnique({ where: { telefono } });
  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });
  if (!bcrypt.compareSync(password, usuario.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = firmar({ id: usuario.id, rol: usuario.rol as 'CLIENTE' | 'PROVEEDOR', nombre: usuario.nombre });
  res.json({ token, usuario: sanitizarUsuario(usuario) });
});

export default router;
