import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Battery,
  Bell,
  ChefHat,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Cookie,
  DollarSign,
  Factory,
  Lock,
  LayoutDashboard,
  Minus,
  Package,
  Pencil,
  Phone,
  Plus,
  Repeat,
  Save,
  Search,
  Send,
  ShoppingCart,
  Signal,
  ShieldCheck,
  Store,
  Trash2,
  TrendingUp,
  Wheat,
  Wifi,
  Zap,
} from 'lucide-react';
import Logo from '../components/Logo';

/**
 * Prototipo visual de la app móvil de Amasa.
 * Datos completamente hardcodeados — no consume la API.
 * Sirve para mostrar a clientes/inversores cómo se vería la versión nativa.
 */

type Modo = 'cliente' | 'panadero';
type Pantalla =
  | 'splash'
  | 'login'
  | 'catalogo'
  | 'carrito'
  | 'confirmacion'
  | 'pedidos'
  | 'admin-dashboard'
  | 'admin-pedidos'
  | 'admin-produccion'
  | 'admin-inventario';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

const productos: Producto[] = [
  {
    id: 1,
    nombre: 'Pan de yema',
    descripcion: 'Tradicional lojano',
    precio: 0.20,
    imagen: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600',
  },
  {
    id: 2,
    nombre: 'Empanada de queso',
    descripcion: 'Queso fresco lojano',
    precio: 0.50,
    imagen: 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=600',
  },
  {
    id: 3,
    nombre: 'Enrollado de canela',
    descripcion: 'Bollo dulce',
    precio: 0.60,
    imagen: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600',
  },
  {
    id: 4,
    nombre: 'Croissant',
    descripcion: 'De mantequilla',
    precio: 0.80,
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
  },
  {
    id: 5,
    nombre: 'Torta de chocolate',
    descripcion: 'Porción individual',
    precio: 1.50,
    imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
  },
  {
    id: 6,
    nombre: 'Galleta de avena',
    descripcion: 'Con pasas',
    precio: 0.35,
    imagen: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600',
  },
];

const formato = (n: number) => `$${n.toFixed(2)}`;

export default function AppPreview() {
  const [modo, setModo] = useState<Modo>('cliente');
  const [pantalla, setPantalla] = useState<Pantalla>('splash');
  const [carrito, setCarrito] = useState<Record<number, number>>({
    1: 12,
    2: 4,
    4: 2,
  });

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo);
    setPantalla('splash');
  }

  const cantidadTotal = Object.values(carrito).reduce((s, n) => s + n, 0);
  const total = Object.entries(carrito).reduce((s, [id, c]) => {
    const p = productos.find((x) => x.id === Number(id));
    return p ? s + c * p.precio : s;
  }, 0);

  function setCantidad(id: number, n: number) {
    setCarrito((c) => {
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  }

  const pantallasCliente: [Pantalla, string][] = [
    ['splash', 'Splash'],
    ['login', 'Login'],
    ['catalogo', 'Catálogo'],
    ['carrito', 'Carrito'],
    ['confirmacion', 'Confirmación'],
    ['pedidos', 'Mis pedidos'],
  ];
  const pantallasPanadero: [Pantalla, string][] = [
    ['splash', 'Splash'],
    ['login', 'Login'],
    ['admin-dashboard', 'Dashboard'],
    ['admin-pedidos', 'Pedidos'],
    ['admin-produccion', 'Producción'],
    ['admin-inventario', 'Inventario'],
  ];
  const pantallas = modo === 'cliente' ? pantallasCliente : pantallasPanadero;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amasa-100 via-crema to-amasa-200 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-amasa-700 hover:text-amasa-900 text-sm font-semibold w-fit">
            <ArrowLeft size={16} /> Volver a la web
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-amasa-900">
                Amasa <span className="text-amasa-500">Mobile</span>
              </h1>
              <p className="text-amasa-700">
                Prototipo navegable de la app nativa.
              </p>
            </div>

            {/* Toggle modo */}
            <div className="inline-flex bg-white rounded-2xl p-1 border-2 border-amasa-100 shadow-suave w-fit">
              <button
                onClick={() => cambiarModo('cliente')}
                className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
                  modo === 'cliente'
                    ? 'bg-amasa-500 text-white shadow-suave'
                    : 'text-amasa-700'
                }`}
              >
                <ShoppingCart size={16} /> Cliente
              </button>
              <button
                onClick={() => cambiarModo('panadero')}
                className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
                  modo === 'panadero'
                    ? 'bg-amasa-500 text-white shadow-suave'
                    : 'text-amasa-700'
                }`}
              >
                <ChefHat size={16} /> Panadera/o
              </button>
            </div>
          </div>

          {/* Botones de pantallas */}
          <div className="flex flex-wrap gap-2">
            {pantallas.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setPantalla(id)}
                className={`px-3 py-2 rounded-2xl text-xs font-semibold transition ${
                  pantalla === id
                    ? 'bg-amasa-500 text-white shadow-suave'
                    : 'bg-white text-amasa-800 border-2 border-amasa-100 hover:border-amasa-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Phone */}
          <div className="flex justify-center lg:sticky lg:top-6">
            <PhoneFrame>
              {/* CLIENTE */}
              {pantalla === 'splash' && (
                <Splash
                  modo={modo}
                  onContinuar={() => setPantalla('login')}
                />
              )}
              {pantalla === 'login' && (
                <LoginMobile
                  modo={modo}
                  onIngresar={() =>
                    setPantalla(modo === 'cliente' ? 'catalogo' : 'admin-dashboard')
                  }
                />
              )}
              {pantalla === 'catalogo' && (
                <CatalogoMobile
                  carrito={carrito}
                  setCantidad={setCantidad}
                  cantidadTotal={cantidadTotal}
                  total={total}
                  onIrCarrito={() => setPantalla('carrito')}
                  onIrPedidos={() => setPantalla('pedidos')}
                />
              )}
              {pantalla === 'carrito' && (
                <CarritoMobile
                  carrito={carrito}
                  setCantidad={setCantidad}
                  total={total}
                  onConfirmar={() => setPantalla('confirmacion')}
                  onVolver={() => setPantalla('catalogo')}
                />
              )}
              {pantalla === 'confirmacion' && (
                <ConfirmacionMobile
                  total={total}
                  onSeguir={() => setPantalla('catalogo')}
                  onPedidos={() => setPantalla('pedidos')}
                />
              )}
              {pantalla === 'pedidos' && (
                <MisPedidosMobile
                  onCatalogo={() => setPantalla('catalogo')}
                  onCarrito={() => setPantalla('carrito')}
                  cantidadTotal={cantidadTotal}
                />
              )}

              {/* PANADERO */}
              {pantalla === 'admin-dashboard' && (
                <AdminDashboardMobile
                  onPedidos={() => setPantalla('admin-pedidos')}
                  onProduccion={() => setPantalla('admin-produccion')}
                  onInventario={() => setPantalla('admin-inventario')}
                />
              )}
              {pantalla === 'admin-pedidos' && (
                <AdminPedidosMobile
                  onDashboard={() => setPantalla('admin-dashboard')}
                  onProduccion={() => setPantalla('admin-produccion')}
                  onInventario={() => setPantalla('admin-inventario')}
                />
              )}
              {pantalla === 'admin-produccion' && (
                <AdminProduccionMobile
                  onDashboard={() => setPantalla('admin-dashboard')}
                  onPedidos={() => setPantalla('admin-pedidos')}
                  onInventario={() => setPantalla('admin-inventario')}
                />
              )}
              {pantalla === 'admin-inventario' && (
                <AdminInventarioMobile
                  onDashboard={() => setPantalla('admin-dashboard')}
                  onPedidos={() => setPantalla('admin-pedidos')}
                  onProduccion={() => setPantalla('admin-produccion')}
                />
              )}
            </PhoneFrame>
          </div>

          {/* Texto descriptivo según modo */}
          {modo === 'cliente' ? <PanelCliente /> : <PanelPanadero />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Paneles laterales ---------- */

function PanelCliente() {
  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amasa-500 text-white grid place-items-center">
            <ShoppingCart />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold leading-tight">App del Cliente</h2>
            <p className="text-amasa-700 text-sm">Pedir nunca fue tan fácil.</p>
          </div>
        </div>
        <p className="text-amasa-800 mb-4">
          Tu cliente abre la app y en <strong>menos de 30 segundos</strong> tiene su pedido enviado,
          sin llamadas ni mensajes que se pierden en WhatsApp.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <Feature icon={<Zap />} titulo="Pedidos en segundos" desc="Catálogo con fotos, contador +/- y total en vivo." />
          <Feature icon={<Repeat />} titulo="Pedido habitual" desc="Un toque para repetir lo que siempre compra." />
          <Feature icon={<Clock />} titulo="Hora de entrega" desc="Elige a qué hora pasarás a recoger." />
          <Feature icon={<Bell />} titulo="Tracking en vivo" desc="Estados Recibido → En producción → Listo → Entregado." />
          <Feature icon={<ClipboardList />} titulo="Historial completo" desc="Ve todos sus pedidos pasados con totales." />
          <Feature icon={<CheckCircle2 />} titulo="Cero errores" desc="El pedido llega exacto: nada de 'fueron 12, no 10'." />
        </div>
      </div>

      <div className="card !bg-amasa-50 border-2 border-amasa-200">
        <h3 className="font-bold mb-1 flex items-center gap-2">
          <TrendingUp size={18} /> Por qué importa
        </h3>
        <p className="text-sm text-amasa-800">
          Cada cliente que pide solo desde la app es <strong>una llamada menos</strong> que
          interrumpe el horneado, <strong>un pedido más exacto</strong> y un cliente que
          vuelve porque la experiencia es buena.
        </p>
      </div>

    </div>
  );
}

function PanelPanadero() {
  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amasa-700 text-white grid place-items-center">
            <ChefHat />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold leading-tight">App del Panadero</h2>
            <p className="text-amasa-700 text-sm">Tu panadería en el bolsillo.</p>
          </div>
        </div>
        <p className="text-amasa-800 mb-4">
          La dueña/o ve <strong>todo lo importante de un vistazo</strong>: cuántos pedidos, cuánto
          producir, qué insumos faltan. Sin abrir el computador, sin perder tiempo.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <Feature icon={<LayoutDashboard />} titulo="Dashboard del día" desc="Pedidos, unidades, $ a facturar e insumos bajos en una pantalla." />
          <Feature icon={<Zap />} titulo="Estado con un toque" desc="Marca pedidos como En producción, Listos o Entregados sin escribir." />
          <Feature icon={<Factory />} titulo="Producción inteligente" desc="Calcula automáticamente cuánto hornear según las recetas." />
          <Feature icon={<Package />} titulo="Inventario al día" desc="Edita stock al instante y recibe alertas cuando algo está bajo." />
          <Feature icon={<Bell />} titulo="Notificaciones" desc="Aviso inmediato cuando llega un pedido nuevo." />
          <Feature icon={<TrendingUp />} titulo="Decisiones claras" desc="Sabe qué producto se vende más y cuándo." />
        </div>
      </div>

      <div className="card !bg-orange-50 border-2 border-orange-200">
        <h3 className="font-bold mb-1 flex items-center gap-2 text-orange-900">
          <Zap size={18} /> Casos típicos
        </h3>
        <ul className="text-sm text-orange-900 space-y-1.5">
          <li>📲 Llega pedido nuevo → notificación push → un toque y queda en "En producción".</li>
          <li>🥖 6:00 AM, antes de hornear → abre Producción → ve cuánto pan y harina necesita.</li>
          <li>⚠️ Manteca por debajo del mínimo → app le avisa antes de que se acabe.</li>
          <li>📋 Cliente pregunta su pedido → buscador instantáneo y ve historial completo.</li>
        </ul>
      </div>

    </div>
  );
}

function Feature({ icon, titulo, desc }: { icon: any; titulo: string; desc: string }) {
  return (
    <div className="bg-amasa-50 rounded-2xl p-3">
      <div className="flex items-center gap-2 mb-1 text-amasa-700">
        <span className="w-6 h-6">{icon}</span>
        <p className="font-bold text-sm text-amasa-900">{titulo}</p>
      </div>
      <p className="text-xs text-amasa-700">{desc}</p>
    </div>
  );
}

/* ---------- Blobs decorativos para liquid glass ---------- */

function Blobs({ variant = 'cliente' }: { variant?: 'cliente' | 'panadero' }) {
  if (variant === 'panadero') {
    return (
      <>
        <div className="blob bg-amasa-300" style={{ width: 220, height: 220, top: -60, left: -40 }} />
        <div className="blob bg-orange-300" style={{ width: 180, height: 180, top: 140, right: -60 }} />
        <div className="blob bg-amasa-200" style={{ width: 200, height: 200, bottom: 80, left: -50 }} />
      </>
    );
  }
  return (
    <>
      <div className="blob bg-amasa-300" style={{ width: 220, height: 220, top: -50, left: -50 }} />
      <div className="blob bg-amasa-200" style={{ width: 180, height: 180, top: 200, right: -60 }} />
      <div className="blob bg-orange-200" style={{ width: 200, height: 200, bottom: 60, left: -40 }} />
    </>
  );
}

/* ---------- Marco de teléfono ---------- */

function PhoneFrame({ children }: { children: any }) {
  const ahora = new Date();
  const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String(
    ahora.getMinutes()
  ).padStart(2, '0')}`;

  return (
    <div className="relative w-[340px] h-[700px] bg-marron rounded-[48px] shadow-2xl p-3 ring-1 ring-black/10">
      {/* Botones laterales */}
      <div className="absolute -left-1 top-32 w-1 h-12 bg-marron/80 rounded-l" />
      <div className="absolute -left-1 top-48 w-1 h-20 bg-marron/80 rounded-l" />
      <div className="absolute -right-1 top-40 w-1 h-16 bg-marron/80 rounded-r" />

      <div className="relative w-full h-full bg-crema rounded-[36px] overflow-hidden flex flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-bold text-marron z-10">
          <span>{hora}</span>
          {/* notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-24 h-6 bg-marron rounded-full" />
          <div className="flex items-center gap-1">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={14} />
          </div>
        </div>

        {/* Pantalla */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2 pt-1">
          <div className="w-32 h-1 bg-marron/50 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Splash ---------- */

function Splash({ modo, onContinuar }: { modo: Modo; onContinuar: () => void }) {
  const esCliente = modo === 'cliente';
  return (
    <div className="h-full relative text-white flex flex-col items-center justify-between p-8 overflow-hidden">
      {/* Imagen de fondo */}
      <img
        src="/imgs/background-inicio.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay para legibilidad */}
      <div
        className={`absolute inset-0 ${
          esCliente
            ? 'bg-gradient-to-b from-amasa-700/70 via-amasa-700/50 to-amasa-900/90'
            : 'bg-gradient-to-b from-marron/70 via-amasa-900/60 to-marron/95'
        }`}
      />

      {/* Contenido */}
      <div className="relative z-10" />
      <div className="relative z-10 text-center">
        <div className="w-28 h-28 mx-auto rounded-[32px] bg-white/15 grid place-items-center mb-6 border border-white/30 shadow-2xl">
          {esCliente ? <Wheat size={56} strokeWidth={2.2} /> : <ChefHat size={56} strokeWidth={2.2} />}
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight mb-2 drop-shadow-lg">Amasa</h1>
        <p className="text-white/90 text-lg drop-shadow">
          {esCliente ? 'Pan calientito, sin llamadas.' : 'Tu panadería en el bolsillo.'}
        </p>
        {!esCliente && (
          <p className="mt-4 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/30">
            <ChefHat size={12} /> Modo Panadera/o
          </p>
        )}
      </div>
      <div className="relative z-10 w-full">
        <button
          onClick={onContinuar}
          className="w-full bg-white text-amasa-700 rounded-2xl py-4 font-bold flex items-center justify-center gap-2 shadow-2xl hover:bg-amasa-50 transition"
        >
          Comenzar <ArrowRight size={18} />
        </button>
        <p className="text-center text-white/80 text-xs mt-4 drop-shadow">Hecho en Loja, Ecuador 🌾</p>
      </div>
    </div>
  );
}

/* ---------- Login móvil ---------- */

function LoginMobile({ modo, onIngresar }: { modo: Modo; onIngresar: () => void }) {
  const esCliente = modo === 'cliente';
  return (
    <div className="h-full relative p-6 flex flex-col bg-crema overflow-hidden">
      <Blobs variant={modo} />

      <div className="relative z-10 flex items-center justify-center mb-6 mt-4">
        <Logo size={28} />
      </div>
      <h2 className="relative z-10 text-2xl font-extrabold mb-1">
        {esCliente ? 'Bienvenido' : 'Hola, panadera/o'}
      </h2>
      <p className="relative z-10 text-amasa-700 text-sm mb-6">Ingresa con tu teléfono.</p>

      <div className="relative z-10 space-y-4">
        <div>
          <label className="label text-xs">Teléfono</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-amasa-500 z-10" size={18} />
            <input
              className="w-full glass rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none"
              defaultValue={esCliente ? '0999000002' : '0999000001'}
              readOnly
            />
          </div>
        </div>
        <div>
          <label className="label text-xs">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-amasa-500 z-10" size={18} />
            <input
              className="w-full glass rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none"
              type="password"
              defaultValue={esCliente ? 'cliente123' : 'amasa123'}
              readOnly
            />
          </div>
        </div>
      </div>

      <button
        onClick={onIngresar}
        className="relative z-10 w-full mt-6 bg-gradient-to-br from-amasa-500 to-amasa-600 text-white rounded-2xl py-3 font-bold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(200,137,63,0.4)] border border-white/20 active:scale-[0.98] transition"
      >
        Ingresar <ArrowRight size={18} />
      </button>

      <p className="relative z-10 text-center text-amasa-700 text-sm mt-auto pb-2">
        ¿No tienes cuenta?{' '}
        <span className="font-semibold text-amasa-600">Regístrate</span>
      </p>
    </div>
  );
}

/* ---------- Catálogo móvil ---------- */

function CatalogoMobile({
  carrito,
  setCantidad,
  cantidadTotal,
  total,
  onIrCarrito,
  onIrPedidos,
}: {
  carrito: Record<number, number>;
  setCantidad: (id: number, n: number) => void;
  cantidadTotal: number;
  total: number;
  onIrCarrito: () => void;
  onIrPedidos: () => void;
}) {
  return (
    <div className="h-full relative flex flex-col bg-crema overflow-hidden">
      <Blobs variant="cliente" />

      {/* Top glass */}
      <div className="relative z-10 px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-amasa-700">Hola,</p>
          <p className="font-extrabold text-lg">Juan Pérez</p>
        </div>
        <div className="relative">
          <button className="w-10 h-10 rounded-2xl glass grid place-items-center text-amasa-700">
            <Bell size={18} />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full grid place-items-center font-bold border-2 border-crema">
            2
          </span>
        </div>
      </div>

      <div className="relative z-10 px-5 pb-3">
        <h2 className="text-2xl font-extrabold leading-tight text-amasa-900">
          Horneado<br />de hoy 🥖
        </h2>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amasa-500 z-10" size={16} />
          <input
            className="w-full glass rounded-2xl pl-9 pr-4 py-2.5 text-sm placeholder:text-amasa-600 focus:outline-none"
            placeholder="Buscar producto"
            readOnly
          />
        </div>

        <button className="mt-3 w-full glass rounded-2xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2 text-amasa-900 active:scale-[0.98] transition">
          <Repeat size={16} className="text-amasa-600" /> Repetir mi pedido habitual
        </button>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-3 pb-32">
        <div className="grid grid-cols-2 gap-2">
          {productos.map((p) => {
            const enCarrito = carrito[p.id] || 0;
            return (
              <div key={p.id} className="glass rounded-2xl overflow-hidden">
                <div className="aspect-square">
                  <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="font-bold text-xs leading-tight text-amasa-900">{p.nombre}</p>
                  <p className="text-[10px] text-amasa-700 mb-1.5 truncate">{p.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amasa-700 font-extrabold text-sm">
                      {formato(p.precio)}
                    </span>
                    {enCarrito > 0 ? (
                      <div className="flex items-center gap-0.5 bg-white border border-white/60 rounded-xl">
                        <button
                          onClick={() => setCantidad(p.id, enCarrito - 1)}
                          className="w-6 h-6 grid place-items-center text-amasa-700"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{enCarrito}</span>
                        <button
                          onClick={() => setCantidad(p.id, enCarrito + 1)}
                          className="w-6 h-6 grid place-items-center text-amasa-700"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCantidad(p.id, 1)}
                        className="w-7 h-7 bg-amasa-500 text-white rounded-xl grid place-items-center shadow-suave active:scale-95 transition"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating cart */}
      {cantidadTotal > 0 && (
        <button
          onClick={onIrCarrito}
          className="absolute bottom-20 left-4 right-4 bg-gradient-to-br from-amasa-500 to-amasa-600 text-white rounded-2xl py-3 px-4 flex items-center justify-between font-semibold shadow-[0_8px_32px_rgba(200,137,63,0.45)] border border-white/20 active:scale-[0.98] transition z-20"
        >
          <span className="flex items-center gap-2">
            <ShoppingCart size={18} />
            {cantidadTotal} productos
          </span>
          <span>{formato(total)}</span>
        </button>
      )}

      <BottomNav activa="catalogo" onCatalogo={() => {}} onCarrito={onIrCarrito} onPedidos={onIrPedidos} cantidad={cantidadTotal} />
    </div>
  );
}

/* ---------- Carrito móvil ---------- */

function CarritoMobile({
  carrito,
  setCantidad,
  total,
  onConfirmar,
  onVolver,
}: {
  carrito: Record<number, number>;
  setCantidad: (id: number, n: number) => void;
  total: number;
  onConfirmar: () => void;
  onVolver: () => void;
}) {
  const items = Object.entries(carrito).map(([id, c]) => ({
    producto: productos.find((p) => p.id === Number(id))!,
    cantidad: c,
  }));

  return (
    <div className="h-full relative flex flex-col bg-crema overflow-hidden">
      <Blobs variant="cliente" />

      <div className="relative z-10 px-5 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onVolver} className="w-9 h-9 rounded-xl glass grid place-items-center text-amasa-700">
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-extrabold text-lg">Tu pedido</h2>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-amasa-700 mt-10">Tu carrito está vacío.</p>
        ) : (
          items.map(({ producto, cantidad }) => (
            <div key={producto.id} className="glass rounded-2xl p-3 flex items-center gap-3">
              <img src={producto.imagen} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{producto.nombre}</p>
                <p className="text-xs text-amasa-700">{formato(producto.precio)} c/u</p>
              </div>
              <div className="flex items-center gap-0.5 bg-white border border-white/60 rounded-xl">
                <button
                  onClick={() => setCantidad(producto.id, cantidad - 1)}
                  className="w-7 h-7 grid place-items-center text-amasa-700"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold w-5 text-center">{cantidad}</span>
                <button
                  onClick={() => setCantidad(producto.id, cantidad + 1)}
                  className="w-7 h-7 grid place-items-center text-amasa-700"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => setCantidad(producto.id, 0)}
                className="text-red-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}

        <div className="glass rounded-2xl p-4">
          <label className="text-xs font-semibold text-amasa-900 flex items-center gap-1 mb-2">
            <Clock size={14} /> Hora de entrega
          </label>
          <input
            type="time"
            defaultValue="07:30"
            className="w-full bg-white border border-white/60 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none"
            readOnly
          />
        </div>
      </div>

      {/* Footer glass con CTA */}
      <div className="relative z-10 glass-strong border-t border-white/40 p-4 space-y-3 mb-0">
        <div className="flex items-center justify-between">
          <span className="text-amasa-700 text-sm">Total</span>
          <span className="text-2xl font-extrabold text-amasa-700">{formato(total)}</span>
        </div>
        <button
          onClick={onConfirmar}
          disabled={items.length === 0}
          className="w-full bg-gradient-to-br from-amasa-500 to-amasa-600 text-white rounded-2xl py-3 font-bold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(200,137,63,0.4)] border border-white/20 active:scale-[0.98] transition disabled:opacity-50"
        >
          <Send size={18} /> Enviar pedido
        </button>
      </div>
    </div>
  );
}

/* ---------- Confirmación ---------- */

function ConfirmacionMobile({
  total,
  onSeguir,
  onPedidos,
}: {
  total: number;
  onSeguir: () => void;
  onPedidos: () => void;
}) {
  return (
    <div className="h-full relative flex flex-col items-center justify-center bg-crema p-6 text-center overflow-hidden">
      <Blobs variant="cliente" />

      <div className="relative z-10 w-24 h-24 rounded-full bg-green-100/70 border border-green-200/60 grid place-items-center mb-4 shadow-[0_8px_32px_rgba(34,197,94,0.25)] animate-pulse">
        <CheckCircle2 className="text-green-600" size={56} />
      </div>
      <h2 className="relative z-10 text-3xl font-extrabold mb-1">¡Pedido enviado!</h2>
      <p className="relative z-10 text-amasa-700 mb-6 text-sm">
        La panadería ya lo recibió.<br />Te avisaremos cuando esté listo.
      </p>

      <div className="relative z-10 w-full glass rounded-2xl p-4 space-y-2 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-amasa-700">N° de pedido</span>
          <span className="font-bold">#1248</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-amasa-700">Hora de entrega</span>
          <span className="font-bold">07:30</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-amasa-700">Estado</span>
          <span className="chip bg-amasa-100/80 text-amasa-900 !text-[10px] border border-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amasa-500" />
            Recibido
          </span>
        </div>
        <div className="border-t border-white/40 pt-2 flex justify-between font-extrabold">
          <span>Total</span>
          <span className="text-amasa-700">{formato(total)}</span>
        </div>
      </div>

      <div className="relative z-10 flex gap-2 w-full mt-6">
        <button onClick={onSeguir} className="flex-1 glass rounded-2xl py-3 font-semibold text-sm text-amasa-900 active:scale-95 transition">
          Seguir comprando
        </button>
        <button onClick={onPedidos} className="flex-1 bg-gradient-to-br from-amasa-500 to-amasa-600 text-white rounded-2xl py-3 font-bold text-sm shadow-[0_8px_24px_rgba(200,137,63,0.4)] border border-white/20 active:scale-95 transition">
          Ver pedidos
        </button>
      </div>
    </div>
  );
}

/* ---------- Mis pedidos ---------- */

function MisPedidosMobile({
  onCatalogo,
  onCarrito,
  cantidadTotal,
}: {
  onCatalogo: () => void;
  onCarrito: () => void;
  cantidadTotal: number;
}) {
  const pedidos = [
    {
      id: 1248,
      hora: '07:30',
      fecha: 'Hoy',
      estado: 'Recibido',
      color: 'bg-amasa-100 text-amasa-900',
      total: 8.10,
      items: ['12× Pan de yema', '4× Empanada de queso', '2× Croissant'],
    },
    {
      id: 1244,
      hora: '08:00',
      fecha: 'Ayer',
      estado: 'Entregado',
      color: 'bg-green-100 text-green-700',
      total: 5.00,
      items: ['25× Pan de yema'],
    },
    {
      id: 1239,
      hora: '07:00',
      fecha: 'Lun 28 may',
      estado: 'Entregado',
      color: 'bg-green-100 text-green-700',
      total: 12.40,
      items: ['8× Torta de chocolate', '1× Humita'],
    },
  ];

  return (
    <div className="h-full relative flex flex-col bg-crema overflow-hidden">
      <Blobs variant="cliente" />

      <div className="relative z-10 px-5 pt-4 pb-3">
        <h2 className="font-extrabold text-2xl">Mis pedidos</h2>
        <p className="text-xs text-amasa-700">{pedidos.length} pedidos en total</p>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-2 space-y-2 pb-24">
        {pedidos.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-amasa-700">Pedido #{p.id}</p>
                <p className="text-xs text-amasa-700 flex items-center gap-1">
                  <Clock size={12} /> {p.fecha} · {p.hora}
                </p>
              </div>
              <span className={`chip ${p.color} !text-[10px] border border-white/50`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {p.estado}
              </span>
            </div>
            <div className="text-xs text-amasa-800 space-y-0.5 mb-2">
              {p.items.map((it, i) => (
                <p key={i}>{it}</p>
              ))}
            </div>
            <div className="border-t border-white/40 pt-2 flex justify-between items-center">
              <span className="font-extrabold text-amasa-700">{formato(p.total)}</span>
              <button className="text-amasa-600 text-xs font-semibold flex items-center gap-1">
                Ver detalle <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav activa="pedidos" onCatalogo={onCatalogo} onCarrito={onCarrito} onPedidos={() => {}} cantidad={cantidadTotal} />
    </div>
  );
}

/* ---------- Bottom nav reusable ---------- */

function BottomNav({
  activa,
  onCatalogo,
  onCarrito,
  onPedidos,
  cantidad,
}: {
  activa: 'catalogo' | 'carrito' | 'pedidos';
  onCatalogo: () => void;
  onCarrito: () => void;
  onPedidos: () => void;
  cantidad: number;
}) {
  const Item = ({
    id,
    icon,
    label,
    onClick,
    badge,
  }: {
    id: typeof activa;
    icon: any;
    label: string;
    onClick: () => void;
    badge?: number;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-1 ${
        activa === id ? 'text-amasa-600' : 'text-amasa-700'
      }`}
    >
      <div className="relative">
        {icon}
        {badge && badge > 0 && (
          <span className="absolute -top-2 -right-3 bg-amasa-500 text-white text-[9px] rounded-full w-4 h-4 grid place-items-center font-bold">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="absolute bottom-2 left-3 right-3 glass-strong rounded-2xl grid grid-cols-3 px-2 py-2 z-30">
      <Item id="catalogo" icon={<Store size={20} />} label="Catálogo" onClick={onCatalogo} />
      <Item id="carrito" icon={<ShoppingCart size={20} />} label="Mi pedido" onClick={onCarrito} badge={cantidad} />
      <Item id="pedidos" icon={<ClipboardList size={20} />} label="Pedidos" onClick={onPedidos} />
    </div>
  );
}

/* ============================================================
   PANTALLAS DEL PANADERO (admin móvil)
   ============================================================ */

interface PedidoAdmin {
  id: number;
  cliente: string;
  hora: string;
  total: number;
  estado: 'RECIBIDO' | 'EN_PRODUCCION' | 'LISTO' | 'ENTREGADO';
  items: { nombre: string; cantidad: number }[];
}

const pedidosAdminMock: PedidoAdmin[] = [
  {
    id: 1248,
    cliente: 'Juan Pérez',
    hora: '07:30',
    total: 8.10,
    estado: 'RECIBIDO',
    items: [
      { nombre: 'Pan de yema', cantidad: 12 },
      { nombre: 'Empanada de queso', cantidad: 4 },
    ],
  },
  {
    id: 1247,
    cliente: 'Lucía Jaramillo',
    hora: '08:00',
    total: 14.40,
    estado: 'EN_PRODUCCION',
    items: [
      { nombre: 'Croissant', cantidad: 12 },
      { nombre: 'Enrollado de canela', cantidad: 8 },
    ],
  },
  {
    id: 1246,
    cliente: 'Carlos Ordóñez',
    hora: '09:00',
    total: 20.40,
    estado: 'LISTO',
    items: [
      { nombre: 'Torta de chocolate', cantidad: 8 },
      { nombre: 'Galleta de avena', cantidad: 24 },
    ],
  },
  {
    id: 1245,
    cliente: 'María Reyes',
    hora: '10:00',
    total: 13.50,
    estado: 'RECIBIDO',
    items: [
      { nombre: 'Humita', cantidad: 10 },
      { nombre: 'Pan de yema', cantidad: 30 },
    ],
  },
];

const estadoEstilo: Record<PedidoAdmin['estado'], string> = {
  RECIBIDO: 'bg-amasa-100 text-amasa-900',
  EN_PRODUCCION: 'bg-orange-100 text-orange-700',
  LISTO: 'bg-green-100 text-green-700',
  ENTREGADO: 'bg-amasa-200 text-amasa-900',
};

const estadoLabel: Record<PedidoAdmin['estado'], string> = {
  RECIBIDO: 'Recibido',
  EN_PRODUCCION: 'En producción',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
};

/* ---------- Admin: Dashboard ---------- */

function AdminDashboardMobile({
  onPedidos,
  onProduccion,
  onInventario,
}: {
  onPedidos: () => void;
  onProduccion: () => void;
  onInventario: () => void;
}) {
  const proximoPedido = pedidosAdminMock[0];

  return (
    <div className="h-full relative flex flex-col bg-crema overflow-hidden">
      <Blobs variant="panadero" />

      {/* Header simple */}
      <div className="relative z-10 px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-amasa-700 font-semibold">Lunes, 2 de junio</p>
          <p className="font-extrabold text-2xl text-amasa-900">Buen día, María 👋</p>
        </div>
        <div className="relative">
          <button className="w-10 h-10 rounded-2xl glass grid place-items-center text-amasa-700">
            <Bell size={18} />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full grid place-items-center font-bold border-2 border-crema">
            3
          </span>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-24 space-y-4">
        {/* HERO con liquid glass sobre degradado */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-amasa-500/95 to-amasa-700/95 text-white shadow-[0_12px_40px_rgba(200,137,63,0.35)] relative overflow-hidden border border-white/20">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-md" />
          <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/10 blur-md" />
          <p className="text-xs font-bold uppercase tracking-wider opacity-90 relative">Hoy hornearás</p>
          <p className="text-6xl font-extrabold leading-none mt-1 relative">186</p>
          <p className="text-sm opacity-95 mb-4 relative">unidades para 12 pedidos</p>
          <div className="flex gap-2 relative">
            <span className="bg-white/25-md rounded-full px-3 py-1 text-xs font-bold border border-white/20">
              💰 $84.20
            </span>
            <span className="bg-white/25-md rounded-full px-3 py-1 text-xs font-bold border border-white/20">
              ⏰ 7:30 primer pedido
            </span>
          </div>
        </div>

        {/* Alerta crítica con glass rojo */}
        <button
          onClick={onInventario}
          className="w-full bg-red-50/70 border border-red-200/70 rounded-2xl p-3 flex items-center gap-3 text-left active:scale-[0.98] transition shadow-[0_8px_24px_rgba(220,38,38,0.12)]"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white grid place-items-center shrink-0 shadow-suave">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-red-900">Te falta manteca</p>
            <p className="text-xs text-red-700">Necesitas 0.91 kg y solo tienes 0.40 kg</p>
          </div>
          <ChevronRight size={18} className="text-red-600 shrink-0" />
        </button>

        {/* Próximo pedido con glass */}
        <div>
          <p className="text-xs font-bold text-amasa-700 uppercase mb-2 flex items-center gap-1">
            <Clock size={12} /> Próximo en entregar
          </p>
          <button
            onClick={onPedidos}
            className="w-full glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amasa-500 to-amasa-600 text-white grid place-items-center font-extrabold text-lg shrink-0 shadow-suave">
              {proximoPedido.cliente.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{proximoPedido.cliente}</p>
              <p className="text-xs text-amasa-700">
                {proximoPedido.items.length} productos · {formato(proximoPedido.total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-amasa-600 uppercase font-bold">en</p>
              <p className="font-extrabold text-amasa-700">{proximoPedido.hora}</p>
            </div>
          </button>
        </div>

        {/* Acciones grandes con glass */}
        <div>
          <p className="text-xs font-bold text-amasa-700 uppercase mb-2">¿Qué quieres hacer?</p>
          <div className="grid grid-cols-2 gap-3">
            <BigAction
              onClick={onProduccion}
              icon={<Factory size={22} />}
              titulo="Producción"
              detalle="Ver qué hornear hoy"
              color="bg-orange-500"
              tint="bg-orange-50"
            />
            <BigAction
              onClick={onPedidos}
              icon={<ClipboardList size={22} />}
              titulo="Pedidos"
              detalle="2 nuevos pendientes"
              color="bg-amasa-500"
              tint="bg-amasa-50"
              badge={2}
            />
            <BigAction
              onClick={onInventario}
              icon={<Package size={22} />}
              titulo="Inventario"
              detalle="1 insumo bajo"
              color="bg-red-500"
              tint="bg-red-50"
              badge={1}
            />
            <BigAction
              onClick={() => {}}
              icon={<TrendingUp size={22} />}
              titulo="Reportes"
              detalle="Ventas de la semana"
              color="bg-green-600"
              tint="bg-green-50"
            />
          </div>
        </div>
      </div>

      <BottomNavAdmin activa="dashboard" onDashboard={() => {}} onPedidos={onPedidos} onProduccion={onProduccion} onInventario={onInventario} badge={2} />
    </div>
  );
}

function BigAction({
  onClick,
  icon,
  titulo,
  detalle,
  color,
  badge,
}: {
  onClick: () => void;
  icon: any;
  titulo: string;
  detalle: string;
  color: string;
  tint?: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="glass rounded-2xl p-4 text-left active:scale-[0.97] transition relative overflow-hidden"
    >
      <div className={`w-11 h-11 rounded-2xl ${color} text-white grid place-items-center mb-2 shadow-suave`}>
        {icon}
      </div>
      <p className="font-extrabold text-sm text-amasa-900">{titulo}</p>
      <p className="text-[11px] text-amasa-700 leading-tight">{detalle}</p>
      {badge && badge > 0 && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 grid place-items-center font-bold shadow-suave">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ---------- Admin: Pedidos ---------- */

// Generamos más pedidos para mostrar realismo de "muchos pedidos"
const pedidosMuchos: PedidoAdmin[] = [
  ...pedidosAdminMock,
  { id: 1244, cliente: 'Pedro Salinas', hora: '07:00', total: 4.20, estado: 'EN_PRODUCCION', items: [{ nombre: 'Pan de yema', cantidad: 21 }] },
  { id: 1243, cliente: 'Ana Tapia', hora: '06:45', total: 6.00, estado: 'LISTO', items: [{ nombre: 'Croissant', cantidad: 5 }, { nombre: 'Galleta', cantidad: 8 }] },
  { id: 1242, cliente: 'Diego Carrión', hora: '08:30', total: 3.60, estado: 'RECIBIDO', items: [{ nombre: 'Empanada de queso', cantidad: 6 }] },
  { id: 1241, cliente: 'Sofía León', hora: '09:30', total: 9.00, estado: 'RECIBIDO', items: [{ nombre: 'Torta de chocolate', cantidad: 6 }] },
  { id: 1240, cliente: 'Roberto Vega', hora: '06:00', total: 2.40, estado: 'ENTREGADO', items: [{ nombre: 'Pan de yema', cantidad: 12 }] },
  { id: 1239, cliente: 'Valeria Cuesta', hora: '06:15', total: 5.40, estado: 'ENTREGADO', items: [{ nombre: 'Humita', cantidad: 6 }, { nombre: 'Pan de yema', cantidad: 6 }] },
];

function AdminPedidosMobile({
  onDashboard,
  onProduccion,
  onInventario,
}: {
  onDashboard: () => void;
  onProduccion: () => void;
  onInventario: () => void;
}) {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>(pedidosMuchos);
  const [tab, setTab] = useState<PedidoAdmin['estado']>('RECIBIDO');
  const [expandido, setExpandido] = useState<number | null>(null);

  function avanzar(id: number) {
    const orden: PedidoAdmin['estado'][] = ['RECIBIDO', 'EN_PRODUCCION', 'LISTO', 'ENTREGADO'];
    setPedidos((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        const idx = orden.indexOf(p.estado);
        return { ...p, estado: orden[Math.min(idx + 1, orden.length - 1)] };
      })
    );
  }

  const conteo = (e: PedidoAdmin['estado']) => pedidos.filter((p) => p.estado === e).length;
  const filtrados = pedidos.filter((p) => p.estado === tab);

  const tabs: { id: PedidoAdmin['estado']; label: string; color: string }[] = [
    { id: 'RECIBIDO', label: 'Nuevos', color: 'bg-amasa-500' },
    { id: 'EN_PRODUCCION', label: 'Hornear', color: 'bg-orange-500' },
    { id: 'LISTO', label: 'Listos', color: 'bg-green-600' },
    { id: 'ENTREGADO', label: 'Entreg.', color: 'bg-amasa-300' },
  ];

  const tabActivo = tabs.find((t) => t.id === tab)!;

  return (
    <div className="h-full relative flex flex-col bg-crema overflow-hidden">
      <Blobs variant="panadero" />

      {/* Header con tabs glass */}
      <div className="relative z-10 glass-strong border-b border-white/40">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <h2 className="font-extrabold text-lg">Pedidos de hoy</h2>
          <span className="text-xs text-amasa-700 font-semibold">{pedidos.length} totales</span>
        </div>
        {/* Tabs segmentados con contador */}
        <div className="grid grid-cols-4 px-3 pb-2 gap-1">
          {tabs.map((t) => {
            const activo = tab === t.id;
            const n = conteo(t.id);
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setExpandido(null);
                }}
                className={`relative py-2 rounded-xl text-[10px] font-bold transition ${
                  activo
                    ? `${t.color} text-white shadow-suave`
                    : 'bg-white text-amasa-700 border border-white/40'
                }`}
              >
                <span className="block text-base">{n}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista compacta con glass */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-3 space-y-2 pb-24">
        {filtrados.length === 0 ? (
          <div className="text-center pt-12">
            <div className="w-16 h-16 rounded-2xl glass grid place-items-center mx-auto mb-3 text-amasa-400">
              <ClipboardList size={28} />
            </div>
            <p className="text-amasa-700 text-sm">Sin pedidos en {tabActivo.label.toLowerCase()}</p>
          </div>
        ) : (
          filtrados.map((p) => {
            const abierto = expandido === p.id;
            return (
              <div
                key={p.id}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandido(abierto ? null : p.id)}
                  className="w-full px-3 py-3 flex items-center gap-3 text-left active:bg-white/30 transition"
                >
                  {/* Avatar con hora */}
                  <div className={`w-12 h-12 rounded-2xl ${tabActivo.color} text-white grid place-items-center shrink-0`}>
                    <div className="text-center leading-none">
                      <p className="text-[9px] font-bold opacity-80">ENTREGA</p>
                      <p className="text-sm font-extrabold">{p.hora}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{p.cliente}</p>
                    <p className="text-[11px] text-amasa-700">
                      #{p.id} · {p.items.reduce((s, i) => s + i.cantidad, 0)} unid · {formato(p.total)}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-amasa-400 transition ${abierto ? 'rotate-90' : ''}`}
                  />
                </button>

                {/* Expandible */}
                {abierto && (
                  <div className="px-3 pb-3 space-y-2 border-t border-white/40">
                    <div className="bg-white rounded-xl p-2 space-y-0.5 mt-2 border border-white/40">
                      {p.items.map((it, i) => (
                        <p key={i} className="text-xs text-amasa-800 flex justify-between">
                          <span><strong>{it.cantidad}×</strong> {it.nombre}</span>
                        </p>
                      ))}
                    </div>
                    {p.estado !== 'ENTREGADO' && (
                      <button
                        onClick={() => avanzar(p.id)}
                        className={`w-full ${tabActivo.color} text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition`}
                      >
                        <Zap size={14} />
                        {p.estado === 'RECIBIDO' && 'Empezar a hornear'}
                        {p.estado === 'EN_PRODUCCION' && 'Marcar como listo'}
                        {p.estado === 'LISTO' && 'Marcar entregado'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <BottomNavAdmin activa="pedidos" onDashboard={onDashboard} onPedidos={() => {}} onProduccion={onProduccion} onInventario={onInventario} badge={conteo('RECIBIDO')} />
    </div>
  );
}

/* ---------- Admin: Producción ---------- */

function AdminProduccionMobile({
  onDashboard,
  onPedidos,
  onInventario,
}: {
  onDashboard: () => void;
  onPedidos: () => void;
  onInventario: () => void;
}) {
  const productos = [
    { nombre: 'Pan de yema', cantidad: 50, emoji: '🥖' },
    { nombre: 'Empanada de queso', cantidad: 6, emoji: '🥟' },
    { nombre: 'Enrollado de canela', cantidad: 8, emoji: '🥐' },
    { nombre: 'Croissant', cantidad: 12, emoji: '🥐' },
    { nombre: 'Humita', cantidad: 10, emoji: '🌽' },
  ];
  const insumos = [
    { nombre: 'Harina de trigo', necesario: 4.88, stock: 25, unidad: 'kg', alcanza: true },
    { nombre: 'Huevos', necesario: 14.9, stock: 60, unidad: 'unid', alcanza: true },
    { nombre: 'Manteca', necesario: 0.91, stock: 0.4, unidad: 'kg', alcanza: false },
    { nombre: 'Queso fresco', necesario: 0.58, stock: 3, unidad: 'kg', alcanza: true },
    { nombre: 'Leche', necesario: 0.68, stock: 8, unidad: 'lt', alcanza: true },
  ];

  const [tab, setTab] = useState<'productos' | 'insumos'>('productos');
  const totalUnidades = productos.reduce((s, p) => s + p.cantidad, 0);
  const faltantes = insumos.filter((i) => !i.alcanza).length;
  const todoAlcanza = faltantes === 0;

  return (
    <div className="h-full relative flex flex-col bg-crema overflow-hidden">
      <Blobs variant="panadero" />

      {/* Hero compacto con glass sobre degradado */}
      <div className="relative z-10 bg-gradient-to-br from-orange-500/95 to-orange-600/95 text-white px-5 pt-4 pb-7 overflow-hidden border-b border-white/20 shadow-[0_8px_32px_rgba(234,124,28,0.3)]">
        <div className="absolute -right-4 -bottom-4 opacity-20">
          <Factory size={120} />
        </div>
        <p className="text-xs font-bold uppercase opacity-90 relative">A hornear hoy</p>
        <div className="flex items-baseline gap-2 relative">
          <p className="text-5xl font-extrabold leading-none">{totalUnidades}</p>
          <p className="text-sm opacity-90">unidades · 3 pedidos</p>
        </div>
        {!todoAlcanza && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-red-600/90 rounded-full px-3 py-1 text-xs font-bold relative border border-white/20">
            <AlertTriangle size={12} />
            Falta manteca · revisa antes de empezar
          </div>
        )}
        {todoAlcanza && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-green-600/90 rounded-full px-3 py-1 text-xs font-bold relative border border-white/20">
            <CheckCircle2 size={12} />
            Todo listo
          </div>
        )}
      </div>

      {/* Tabs glass flotante */}
      <div className="px-3 -mt-4 relative z-20">
        <div className="glass-strong rounded-2xl p-1 grid grid-cols-2">
          <button
            onClick={() => setTab('productos')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'productos' ? 'bg-amasa-500 text-white shadow-suave' : 'text-amasa-700'
            }`}
          >
            <Cookie size={14} /> Qué hornear
          </button>
          <button
            onClick={() => setTab('insumos')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'insumos' ? 'bg-amasa-500 text-white shadow-suave' : 'text-amasa-700'
            }`}
          >
            <Wheat size={14} /> Insumos
            {faltantes > 0 && (
              <span className={`${tab === 'insumos' ? 'bg-white text-red-600' : 'bg-red-500 text-white'} text-[9px] rounded-full px-1.5 py-0.5 font-bold`}>
                {faltantes}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-3 pt-3 pb-24">
        {tab === 'productos' ? (
          <div className="glass rounded-2xl divide-y divide-white/40 overflow-hidden">
            {productos.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-white/50 grid place-items-center text-xl">
                  {p.emoji}
                </div>
                <span className="flex-1 font-semibold text-sm">{p.nombre}</span>
                <span className="text-xl font-extrabold text-amasa-600 tabular-nums">
                  {p.cantidad}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Bajos primero */}
            {[...insumos].sort((a, b) => Number(a.alcanza) - Number(b.alcanza)).map((i, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-3 ${i.alcanza ? 'glass' : 'bg-red-50/70 border border-red-200/70 shadow-[0_8px_24px_rgba(220,38,38,0.1)]'}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {i.alcanza ? (
                      <ShieldCheck size={16} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-red-600" />
                    )}
                    <span className="font-bold text-sm">{i.nombre}</span>
                  </div>
                  {!i.alcanza && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                      Falta {(i.necesario - i.stock).toFixed(2)} {i.unidad}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-amasa-700 mb-1.5">
                  <span>Necesito <strong className="text-amasa-900">{i.necesario}{i.unidad}</strong></span>
                  <span className="text-amasa-300">•</span>
                  <span>Tengo <strong className="text-amasa-900">{i.stock}{i.unidad}</strong></span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden border border-white/50">
                  <div
                    className={`h-full ${i.alcanza ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (i.stock / Math.max(i.necesario, 0.001)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavAdmin activa="produccion" onDashboard={onDashboard} onPedidos={onPedidos} onProduccion={() => {}} onInventario={onInventario} badge={faltantes} />
    </div>
  );
}

/* ---------- Admin: Inventario ---------- */

function AdminInventarioMobile({
  onDashboard,
  onPedidos,
  onProduccion,
}: {
  onDashboard: () => void;
  onPedidos: () => void;
  onProduccion: () => void;
}) {
  const [insumos, setInsumos] = useState([
    { id: 1, nombre: 'Harina', stock: 25, minimo: 10, unidad: 'kg', emoji: '🌾' },
    { id: 2, nombre: 'Azúcar', stock: 12, minimo: 5, unidad: 'kg', emoji: '🍬' },
    { id: 3, nombre: 'Huevos', stock: 60, minimo: 30, unidad: 'unid', emoji: '🥚' },
    { id: 4, nombre: 'Manteca', stock: 0.4, minimo: 5, unidad: 'kg', emoji: '🧈' },
    { id: 5, nombre: 'Levadura', stock: 1.2, minimo: 0.5, unidad: 'kg', emoji: '🦠' },
    { id: 6, nombre: 'Leche', stock: 8, minimo: 4, unidad: 'lt', emoji: '🥛' },
    { id: 7, nombre: 'Queso', stock: 1.5, minimo: 2, unidad: 'kg', emoji: '🧀' },
    { id: 8, nombre: 'Chocolate', stock: 2, minimo: 1, unidad: 'kg', emoji: '🍫' },
  ]);
  const [tab, setTab] = useState<'todos' | 'bajos'>('todos');
  const [editando, setEditando] = useState<number | null>(null);
  const [fabAbierto, setFabAbierto] = useState(false);

  function ajustar(id: number, delta: number) {
    setInsumos((arr) =>
      arr.map((i) => (i.id === id ? { ...i, stock: Math.max(0, +(i.stock + delta).toFixed(2)) } : i))
    );
  }

  const bajos = insumos.filter((i) => i.stock <= i.minimo);
  const visibles = tab === 'bajos' ? bajos : insumos;

  return (
    <div className="h-full relative flex flex-col bg-crema overflow-hidden">
      <Blobs variant="panadero" />

      {/* Header glass */}
      <div className="relative z-10 glass-strong border-b border-white/40 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-lg flex items-center gap-2">
            <Package size={20} className="text-amasa-500" /> Inventario
          </h2>
          <button className="w-9 h-9 rounded-xl glass grid place-items-center text-amasa-700">
            <Search size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl p-1 grid grid-cols-2 gap-1 border border-white/50">
          <button
            onClick={() => setTab('todos')}
            className={`py-1.5 rounded-lg text-xs font-bold transition ${
              tab === 'todos' ? 'bg-white text-amasa-900 shadow-suave' : 'text-amasa-700'
            }`}
          >
            Todos · {insumos.length}
          </button>
          <button
            onClick={() => setTab('bajos')}
            className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
              tab === 'bajos' ? 'bg-red-500 text-white shadow-suave' : 'text-red-600'
            }`}
          >
            {bajos.length > 0 && <AlertTriangle size={12} />}
            Bajos · {bajos.length}
          </button>
        </div>
      </div>

      {/* Grid 2 columnas compacto */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-3 pb-24">
        {visibles.length === 0 ? (
          <div className="text-center pt-12">
            <CheckCircle2 className="mx-auto text-green-500 mb-2" size={48} />
            <p className="font-bold text-amasa-900">¡Todo bien!</p>
            <p className="text-xs text-amasa-700">No hay insumos por reabastecer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {visibles.map((i) => {
              const bajo = i.stock <= i.minimo;
              const enEdit = editando === i.id;
              return (
                <div
                  key={i.id}
                  className={`rounded-2xl p-3 ${
                    bajo
                      ? 'bg-red-50/70 border border-red-200/70 shadow-[0_8px_24px_rgba(220,38,38,0.1)]'
                      : 'glass'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">{i.emoji}</span>
                    {bajo && <AlertTriangle size={14} className="text-red-600" />}
                  </div>
                  <p className="font-bold text-sm leading-tight truncate">{i.nombre}</p>
                  <p className="text-[10px] text-amasa-600 mb-2">mín {i.minimo}{i.unidad}</p>

                  {enEdit ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => ajustar(i.id, -1)}
                        className="w-7 h-7 grid place-items-center bg-white border border-white/60 text-amasa-700 rounded-lg active:scale-95"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="flex-1 text-center text-sm font-extrabold tabular-nums">
                        {i.stock}
                      </span>
                      <button
                        onClick={() => ajustar(i.id, 1)}
                        className="w-7 h-7 grid place-items-center bg-amasa-500 text-white rounded-lg active:scale-95 shadow-suave"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditando(i.id)}
                      className="w-full rounded-lg py-1.5 text-center active:scale-95 transition bg-white border border-white/60"
                    >
                      <span className={`text-lg font-extrabold tabular-nums ${bajo ? 'text-red-700' : 'text-amasa-900'}`}>
                        {i.stock}
                      </span>
                      <span className="text-[10px] text-amasa-700 ml-0.5">{i.unidad}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {editando !== null && (
          <button
            onClick={() => setEditando(null)}
            className="mt-3 w-full bg-amasa-500 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-suave"
          >
            <Save size={14} /> Guardar cambios
          </button>
        )}
      </div>

      {/* FAB con menú de acciones */}
      {fabAbierto && (
        <div
          className="absolute inset-0 bg-marron/20 z-20"
          onClick={() => setFabAbierto(false)}
        />
      )}
      <div className="absolute right-4 bottom-20 z-30 flex flex-col items-end gap-2">
        {fabAbierto && (
          <>
            <FabAction icon={<Plus size={16} />} label="Agregar insumo" color="bg-green-600" onClick={() => setFabAbierto(false)} />
            <FabAction icon={<Pencil size={16} />} label="Editar productos" color="bg-orange-500" onClick={() => setFabAbierto(false)} />
            <FabAction icon={<TrendingUp size={16} />} label="Reabastecer" color="bg-amasa-600" onClick={() => setFabAbierto(false)} />
          </>
        )}
        <button
          onClick={() => setFabAbierto((v) => !v)}
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-amasa-500 to-amasa-600 text-white grid place-items-center shadow-[0_8px_24px_rgba(200,137,63,0.45)] active:scale-95 transition border border-white/30 ${fabAbierto ? 'rotate-45' : ''}`}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>

      <BottomNavAdmin activa="inventario" onDashboard={onDashboard} onPedidos={onPedidos} onProduccion={onProduccion} onInventario={() => {}} badge={bajos.length} />
    </div>
  );
}

function FabAction({
  icon,
  label,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 active:scale-95 transition"
    >
      <span className="glass-strong rounded-xl px-3 py-1.5 text-xs font-bold text-amasa-900">
        {label}
      </span>
      <span className={`w-11 h-11 rounded-2xl ${color} text-white grid place-items-center shadow-suave border border-white/30`}>
        {icon}
      </span>
    </button>
  );
}

/* ---------- Bottom nav admin ---------- */

function BottomNavAdmin({
  activa,
  onDashboard,
  onPedidos,
  onProduccion,
  onInventario,
  badge,
}: {
  activa: 'dashboard' | 'pedidos' | 'produccion' | 'inventario';
  onDashboard: () => void;
  onPedidos: () => void;
  onProduccion: () => void;
  onInventario: () => void;
  badge?: number;
}) {
  const Item = ({
    id,
    icon,
    label,
    onClick,
    badgeNum,
  }: {
    id: typeof activa;
    icon: any;
    label: string;
    onClick: () => void;
    badgeNum?: number;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-1 ${
        activa === id ? 'text-amasa-600' : 'text-amasa-700'
      }`}
    >
      <div className="relative">
        {icon}
        {badgeNum && badgeNum > 0 && (
          <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 grid place-items-center font-bold">
            {badgeNum}
          </span>
        )}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="absolute bottom-2 left-3 right-3 glass-strong rounded-2xl grid grid-cols-4 px-2 py-2 z-30">
      <Item id="dashboard" icon={<LayoutDashboard size={20} />} label="Inicio" onClick={onDashboard} />
      <Item id="pedidos" icon={<ClipboardList size={20} />} label="Pedidos" onClick={onPedidos} badgeNum={activa !== 'pedidos' ? badge : undefined} />
      <Item id="produccion" icon={<Factory size={20} />} label="Producir" onClick={onProduccion} />
      <Item id="inventario" icon={<Package size={20} />} label="Stock" onClick={onInventario} />
    </div>
  );
}
