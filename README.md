# 🥖 Amasa

CRM web para panaderías y pastelerías de **Loja, Ecuador**. Los clientes hacen
pedidos desde la app y la dueña gestiona producción, insumos, notas de venta y
clientes desde un panel hermoso y moderno.

> Stack: **React + Vite + TypeScript + Tailwind** (cliente) · **Node + Express + TypeScript + Prisma + SQLite** (API) · **JWT** auth.

---

## 🧁 Características

### Cliente
- Login / registro con teléfono + contraseña.
- Catálogo de productos con foto, precio y descripción.
- Botón "**Repetir mi pedido habitual**".
- Carrito con contador (+/-), subtotal en vivo, hora de entrega.
- Confirmación con resumen del pedido.
- Historial "Mis pedidos" con estado en tiempo real.

### Dueño/a (panel admin con sidebar)
- **Dashboard** con tarjetas resumen del día (pedidos, unidades, facturación, insumos bajos).
- **Pedidos**: lista por cliente, productos y cantidades, estado editable con un clic.
- **Nota de venta** generada automáticamente por pedido, con vista para imprimir/descargar.
- **Reporte de producción** (corazón del sistema) en 4 pasos visuales:
  1. Unidades pedidas por producto.
  2. Total a producir.
  3. Insumos necesarios calculados con las recetas.
  4. Validación contra stock — verde si alcanza, rojo si falta.
- **Inventario** de insumos con edición de stock y alerta visible al estar bajo el mínimo.
- **Clientes** con buscador y ficha con historial completo.

---

## 🚀 Cómo correr en local

### Requisitos
- Node.js 18 o superior
- npm 9+

### 1. Instalar dependencias y preparar la base de datos
```bash
npm run setup
```
Esto:
1. Instala dependencias del root, `client/` y `server/`.
2. Aplica las migraciones de Prisma sobre SQLite.
3. Siembra datos de ejemplo (productos, recetas, insumos, clientes y pedidos).

### 2. Levantar todo
```bash
npm run dev
```
- API: http://localhost:4000
- App: http://localhost:5173

### 3. Cuentas de prueba
| Rol | Teléfono | Contraseña |
|---|---|---|
| 👩‍🍳 Dueña | `0999000001` | `amasa123` |
| 🛒 Cliente | `0999000002` | `cliente123` |
| 🛒 Cliente | `0999000003` | `cliente123` |
| 🛒 Cliente | `0999000004` | `cliente123` |

---

## 🧱 Estructura del proyecto

```
DESARROLLO/
├─ package.json          # scripts del monorepo
├─ client/               # React + Vite + TS + Tailwind
│  ├─ src/
│  │  ├─ pages/          # Login, Registro, cliente/*, dueno/*
│  │  ├─ layouts/        # LayoutCliente, LayoutDueno
│  │  ├─ components/     # Logo, EstadoChip
│  │  ├─ store/          # Zustand: auth, carrito
│  │  └─ lib/            # api.ts (cliente HTTP)
│  └─ vite.config.ts     # proxy /api → :4000
└─ server/               # Express + TS + Prisma
   ├─ prisma/
   │  ├─ schema.prisma   # modelo de datos
   │  └─ seed.ts         # datos de ejemplo
   └─ src/
      ├─ index.ts
      ├─ auth.ts         # JWT + middleware de roles
      ├─ prisma.ts
      └─ routes/         # auth, productos, insumos, pedidos, notas, produccion, clientes, dashboard
```

---

## 🔌 API

Todas las rutas viven bajo `/api`. Las marcadas con 🔒 requieren JWT (`Authorization: Bearer <token>`); 👑 requiere rol `DUENO`.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/registro` | Registro |
| POST | `/api/auth/login` | Login |
| GET | `/api/productos` | Catálogo activo |
| 👑 POST/PUT/DELETE | `/api/productos[/id]` | Gestión |
| 👑 GET/POST/PUT/DELETE | `/api/insumos[/id]` | Gestión inventario |
| 👑 PATCH | `/api/insumos/:id/stock` | Actualizar stock rápido |
| 🔒 GET | `/api/pedidos` | Cliente: los suyos · Dueño: todos |
| 👑 GET | `/api/pedidos/hoy` | Pedidos del día |
| 🔒 POST | `/api/pedidos` | Crear pedido (cliente) |
| 👑 PATCH | `/api/pedidos/:id/estado` | Cambiar estado |
| 🔒 GET | `/api/pedidos/cliente/habitual` | Último pedido del cliente |
| 👑 POST | `/api/notas/pedido/:pedidoId` | Generar nota de venta |
| 👑 GET | `/api/notas/pedido/:pedidoId` | Obtener nota |
| 👑 GET | `/api/produccion/hoy` | Reporte de producción del día |
| 👑 GET | `/api/clientes?q=` | Buscar clientes |
| 👑 GET | `/api/clientes/:id` | Detalle + historial |
| 👑 GET | `/api/dashboard/hoy` | Resumen del día |

---

## 🎨 Diseño

- **Paleta**: dorado/marrón pan tostado (`#C8893F`, `#E3A857`), crema (`#FFF8F0`), marrón oscuro (`#3A2A1A`).
- **Tipografía**: Plus Jakarta Sans (Google Fonts).
- **Estética**: panadería artesanal, cálida y acogedora. Tarjetas con sombra suave, botones grandes redondeados, microtransiciones.
- **Responsivo**: móvil primero (bottom nav del cliente). Sidebar lateral en escritorio para el panel del dueño.
- Todos los textos en **español**.

---

## ☁️ Deploy en Vercel

El repo viene listo para desplegar la app cliente como sitio estático y la API
como funciones serverless. La estrategia recomendada:

### Opción rápida (recomendada): dos proyectos en Vercel

1. **API** (`server/`):
   - Importa el repo en Vercel y elige `server` como *Root Directory*.
   - Agrega variables de entorno:
     - `DATABASE_URL` → conexión Postgres (ej. Vercel Postgres / Neon / Supabase).
     - `JWT_SECRET` → cualquier string secreto.
   - Cambia `provider = "sqlite"` por `provider = "postgresql"` en `server/prisma/schema.prisma`.
   - Comando de build: `npm run build && npx prisma migrate deploy`.
   - Comando de inicio: `npm run start`.

2. **App** (`client/`):
   - Importa el repo y elige `client` como *Root Directory*.
   - Framework preset: **Vite**.
   - Variable: `VITE_API_BASE` (opcional) → URL pública de la API.
   - En `client/src/lib/api.ts` se puede leer `import.meta.env.VITE_API_BASE` si quieres separar dominios.

### Migrar a Postgres
1. En `server/prisma/schema.prisma` cambia `provider = "postgresql"` y la `DATABASE_URL`.
2. Ejecuta `npx prisma migrate deploy`.
3. Opcional: corre el seed en producción una sola vez con `npm run db:seed` (¡ten cuidado con datos reales!).

---

## 🧪 Scripts útiles

| Comando | Qué hace |
|---|---|
| `npm run setup` | Instala todo + migra + seed |
| `npm run dev` | Levanta cliente y servidor en paralelo |
| `npm run db:migrate` | Aplica migraciones de Prisma |
| `npm run db:seed` | Vuelve a sembrar datos |
| `npm run build` | Compila API y app |

---

Hecho con 🌾 en Loja, Ecuador.
