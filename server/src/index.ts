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

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'Amasa' }));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/produccion', produccionRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Manejo de errores
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error interno' });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`🥖 Amasa API escuchando en http://localhost:${PORT}`);
});
