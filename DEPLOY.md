# Despliegue de Acopio en Vercel + Neon

Guía paso a paso para publicar la API y el cliente como **dos proyectos Vercel separados**, usando **Neon** como Postgres.

---

## 1. Base de datos (Neon)

1. Crea un proyecto en https://neon.tech.
2. En el panel de Neon copia las dos connection strings:
   - **Pooled** (con `-pooler` en el host) → la usaremos en runtime con pgBouncer.
   - **Direct** (sin `-pooler`) → la necesita Prisma para `migrate deploy`.
3. Asegúrate de añadir a la pooled estos parámetros: `?sslmode=require&pgbouncer=true&connection_limit=1`.

### Migrar y sembrar (una sola vez, desde tu máquina)

```powershell
cd server
copy .env.example .env
# Edita .env con tu DATABASE_URL y DATABASE_URL_UNPOOLED reales

npm install
npx prisma migrate deploy   # aplica migraciones a Neon
npm run seed                # crea proveedores, clientes y datos demo
```

> El seed crea cuentas de prueba:
> - Proveedor A: `0999000001` / `acopio123`
> - Proveedor B: `0999000003` / `acopio123`
> - Cliente: `0999000010` / `cliente123`

---

## 2. Desplegar la API (`server/`)

1. En Vercel: **Add New → Project**, importa el repo y selecciona `server` como **Root Directory**.
2. **Framework Preset**: `Other`.
3. **Build/Install command**: déjalos por defecto (Vercel detecta `package.json`; el `postinstall` corre `prisma generate`).
4. **Environment Variables** (Production):
   - `DATABASE_URL` = (Neon **pooled**)
   - `DATABASE_URL_UNPOOLED` = (Neon **direct**)
   - `JWT_SECRET` = una cadena larga y secreta
   - `CORS_ORIGIN` = la URL del cliente (ej. `https://acopio-client.vercel.app`)
5. Deploy. Cuando termine, prueba: `https://<tu-api>.vercel.app/api/health` debe devolver `{"ok":true,"app":"Acopio"}`.

---

## 3. Desplegar el cliente (`client/`)

1. En Vercel: **Add New → Project**, mismo repo, esta vez **Root Directory** = `client`.
2. **Framework Preset**: `Vite` (auto-detectado).
3. **Environment Variables** (Production):
   - `VITE_API_URL` = `https://<tu-api>.vercel.app/api`
4. Deploy. Visita la URL final para probar.
5. Si cambia la URL del cliente, actualiza `CORS_ORIGIN` en el proyecto API y vuelve a desplegar.

---

## 4. Comandos útiles

```powershell
# Levantar todo localmente (en dos terminales)
cd server; npm run dev      # http://localhost:4000
cd client; npm run dev      # http://localhost:5173

# Reset completo de la base (¡borra todo!)
cd server
npx prisma migrate reset --force
npm run seed
```

---

## 5. Notas

- Las funciones serverless tienen un límite de 30s; el `vercel.json` del server ya lo deja en 30.
- Prisma necesita `binaryTargets = ["native", "rhel-openssl-3.0.x"]` para Vercel (ya configurado en `schema.prisma`).
- En Neon usar la **pooled** con `connection_limit=1` evita agotar conexiones desde varias funciones lambda concurrentes.
