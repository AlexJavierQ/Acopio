import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import productosRoutes from './routes/productos';
import insumosRoutes from './routes/insumos';
import pedidosRoutes from './routes/pedidos';
import notasRoutes from './routes/notas';
import produccionRoutes from './routes/produccion';
import clientesRoutes from './routes/clientes';
import dashboardRoutes from './routes/dashboard';
import afiliacionesRoutes from './routes/afiliaciones';
import negociacionesRoutes from './routes/negociaciones';
import mensajesRoutes from './routes/mensajes';
import proveedoresRoutes from './routes/proveedores';

const app = express();

// CORS configurable. En prod definir CORS_ORIGIN como dominio del cliente Vercel.
const corsOrigin = process.env.CORS_ORIGIN || true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'Acopio' }));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/produccion', produccionRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/afiliaciones', afiliacionesRoutes);
app.use('/api/negociaciones', negociacionesRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/proveedores', proveedoresRoutes);

// Manejo de errores
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error interno' });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`📦 Acopio API escuchando en http://localhost:${PORT}`);
});
