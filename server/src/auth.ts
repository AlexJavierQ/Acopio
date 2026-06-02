import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'amasa-dev-secret';

export interface AuthPayload {
  id: number;
  rol: 'CLIENTE' | 'DUENO';
  nombre: string;
}

export interface AuthedRequest extends Request {
  user?: AuthPayload;
}

export const firmar = (payload: AuthPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireDueno(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.rol !== 'DUENO') {
    return res.status(403).json({ error: 'Acceso solo para dueños' });
  }
  next();
}
