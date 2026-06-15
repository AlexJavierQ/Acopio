import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth, AuthedRequest } from '../auth';

const router = Router();
router.use(requireAuth);

/**
 * GET /mensajes/conversaciones
 * Lista las conversaciones del usuario actual (último mensaje + no leídos por interlocutor).
 */
router.get('/conversaciones', async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  // Tomar todos los mensajes donde participa, agrupar por interlocutor.
  const mensajes = await prisma.mensaje.findMany({
    where: { OR: [{ remitenteId: userId }, { destinatarioId: userId }] },
    orderBy: { creadoEn: 'desc' },
    take: 500,
  });

  const porInterlocutor = new Map<number, { ultimo: typeof mensajes[number]; noLeidos: number }>();
  for (const m of mensajes) {
    const otroId = m.remitenteId === userId ? m.destinatarioId : m.remitenteId;
    if (!porInterlocutor.has(otroId)) {
      porInterlocutor.set(otroId, { ultimo: m, noLeidos: 0 });
    }
    if (m.destinatarioId === userId && !m.leido) {
      porInterlocutor.get(otroId)!.noLeidos++;
    }
  }

  const otroIds = Array.from(porInterlocutor.keys());
  const usuarios = await prisma.usuario.findMany({
    where: { id: { in: otroIds } },
    select: { id: true, nombre: true, telefono: true, rol: true, nombreNegocio: true, fotoUrl: true },
  });
  const userMap = new Map(usuarios.map((u) => [u.id, u]));

  const conversaciones = otroIds.map((otroId) => {
    const c = porInterlocutor.get(otroId)!;
    return {
      otroUsuario: userMap.get(otroId),
      ultimoMensaje: c.ultimo,
      noLeidos: c.noLeidos,
    };
  }).sort((a, b) => +new Date(b.ultimoMensaje.creadoEn) - +new Date(a.ultimoMensaje.creadoEn));

  res.json(conversaciones);
});

/**
 * GET /mensajes/conversacion/:otroId  — historial con el otro usuario
 * GET /mensajes/conversacion/:otroId?desde=ISODATE  — para polling incremental
 */
router.get('/conversacion/:otroId', async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const otroId = Number(req.params.otroId);
  const desde = req.query.desde ? new Date(String(req.query.desde)) : null;

  const mensajes = await prisma.mensaje.findMany({
    where: {
      AND: [
        {
          OR: [
            { remitenteId: userId, destinatarioId: otroId },
            { remitenteId: otroId, destinatarioId: userId },
          ],
        },
        ...(desde ? [{ creadoEn: { gt: desde } }] : []),
      ],
    },
    orderBy: { creadoEn: 'asc' },
  });
  res.json(mensajes);
});

const enviarSchema = z.object({
  destinatarioId: z.number().int(),
  contenido: z.string().min(1).max(2000),
});
router.post('/', async (req: AuthedRequest, res) => {
  const parsed = enviarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Datos inválidos' });
  const { destinatarioId, contenido } = parsed.data;
  if (destinatarioId === req.user!.id) return res.status(400).json({ error: 'No puedes enviarte mensajes a ti mismo' });

  const dest = await prisma.usuario.findUnique({ where: { id: destinatarioId } });
  if (!dest) return res.status(404).json({ error: 'Destinatario no existe' });

  const m = await prisma.mensaje.create({
    data: { remitenteId: req.user!.id, destinatarioId, contenido },
  });
  res.json(m);
});

// Marcar como leídos todos los mensajes que vienen de otroId hacia mí.
router.post('/leer/:otroId', async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const otroId = Number(req.params.otroId);
  await prisma.mensaje.updateMany({
    where: { remitenteId: otroId, destinatarioId: userId, leido: false },
    data: { leido: true },
  });
  res.json({ ok: true });
});

export default router;
