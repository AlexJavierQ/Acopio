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
  rol: z.enum(['CLIENTE', 'DUENO']).default('CLIENTE'),
  direccion: z.string().optional(),
});

router.post('/registro', async (req, res) => {
  const parsed = registroSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos' });
  const { nombre, telefono, password, rol, direccion } = parsed.data;

  const existe = await prisma.usuario.findUnique({ where: { telefono } });
  if (existe) return res.status(409).json({ error: 'Ese teléfono ya está registrado' });

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      telefono,
      password: bcrypt.hashSync(password, 10),
      rol,
      direccion,
    },
  });

  const token = firmar({ id: usuario.id, rol: usuario.rol, nombre: usuario.nombre });
  res.json({
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, telefono: usuario.telefono, rol: usuario.rol, direccion: usuario.direccion },
  });
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

  const token = firmar({ id: usuario.id, rol: usuario.rol, nombre: usuario.nombre });
  res.json({
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, telefono: usuario.telefono, rol: usuario.rol, direccion: usuario.direccion },
  });
});

export default router;
