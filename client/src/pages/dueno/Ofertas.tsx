import { useState } from 'react';
import {
  Megaphone,
  Sparkles,
  Users,
  TrendingUp,
  Sunrise,
  Heart,
  Cake,
  Wheat,
  AlertCircle,
  Plus,
  Tag,
  Percent,
  Gift,
  Send,
  Eye,
  CheckCircle2,
  ArrowRight,
  X,
  Calendar,
  Target,
  Zap,
} from 'lucide-react';

/**
 * Página de Ofertas y Marketing con prototipo de clustering.
 * Datos completamente hardcodeados para demostración.
 * En producción esto consumiría endpoints del backend con segmentación real.
 */

interface Cluster {
  id: string;
  nombre: string;
  emoji: string;
  icon: any;
  color: string;
  gradient: string;
  clientes: number;
  descripcion: string;
  caracteristicas: string[];
  ticketPromedio: number;
  frecuencia: string;
  recomendacion: string;
}

const clusters: Cluster[] = [
  {
    id: 'madrugadores',
    nombre: 'Madrugadores fieles',
    emoji: '🌅',
    icon: Sunrise,
    color: 'orange',
    gradient: 'from-orange-400 to-orange-600',
    clientes: 12,
    descripcion: 'Clientes que pasan a recoger antes de las 7am, todos los días.',
    caracteristicas: ['Pedido antes de 7:00 AM', 'Compra diaria', 'Pan tradicional'],
    ticketPromedio: 3.20,
    frecuencia: 'Diaria',
    recomendacion: 'Ofrece un combo "Desayuno completo" con descuento.',
  },
  {
    id: 'familias',
    nombre: 'Familias de fin de semana',
    emoji: '👨‍👩‍👧',
    icon: Users,
    color: 'amasa',
    gradient: 'from-amasa-500 to-amasa-700',
    clientes: 24,
    descripcion: 'Pedidos grandes los sábados y domingos en la mañana.',
    caracteristicas: ['Sábado/domingo', 'Más de $10 por pedido', 'Variedad de productos'],
    ticketPromedio: 14.80,
    frecuencia: 'Semanal',
    recomendacion: '2x1 en humitas los domingos para fidelizar.',
  },
  {
    id: 'dulceros',
    nombre: 'Dulceros',
    emoji: '🍰',
    icon: Cake,
    color: 'pink',
    gradient: 'from-pink-400 to-pink-600',
    clientes: 18,
    descripcion: 'Compran principalmente productos dulces y postres.',
    caracteristicas: ['80% productos dulces', 'Tortas y galletas', 'Compras grandes ocasionales'],
    ticketPromedio: 9.50,
    frecuencia: 'Quincenal',
    recomendacion: 'Promociona nuevas tortas con foto al WhatsApp.',
  },
  {
    id: 'pan-diario',
    nombre: 'Pan diario',
    emoji: '🥖',
    icon: Wheat,
    color: 'green',
    gradient: 'from-green-500 to-green-700',
    clientes: 35,
    descripcion: 'Tu base de clientes recurrentes que compran pan todos los días.',
    caracteristicas: ['Pan de yema', 'Visita diaria', 'Ticket bajo y constante'],
    ticketPromedio: 1.80,
    frecuencia: 'Diaria',
    recomendacion: 'Programa de fidelidad: 10º pan gratis.',
  },
  {
    id: 'inactivos',
    nombre: 'Inactivos 30 días',
    emoji: '😴',
    icon: AlertCircle,
    color: 'red',
    gradient: 'from-red-400 to-red-600',
    clientes: 8,
    descripcion: 'No pasan a comprar hace más de 30 días. Hay que reactivarlos.',
    caracteristicas: ['Sin pedidos > 30 días', 'Antes eran frecuentes', 'Riesgo de pérdida'],
    ticketPromedio: 0,
    frecuencia: 'Inactivos',
    recomendacion: 'Cupón 15% por WhatsApp con mensaje personal.',
  },
  {
    id: 'nuevos',
    nombre: 'Nuevos clientes',
    emoji: '✨',
    icon: Sparkles,
    color: 'purple',
    gradient: 'from-purple-400 to-purple-600',
    clientes: 6,
    descripcion: 'Pidieron por primera vez en los últimos 14 días.',
    caracteristicas: ['Primer pedido reciente', 'Sin patrón aún', 'Oportunidad de oro'],
    ticketPromedio: 4.20,
    frecuencia: 'Una vez',
    recomendacion: 'Bienvenida con descuento en el segundo pedido.',
  },
];

interface Oferta {
  id: number;
  titulo: string;
  cluster: string;
  tipo: string;
  estado: 'ACTIVA' | 'PROGRAMADA' | 'FINALIZADA';
  alcance: number;
  conversion: number;
  vence: string;
}

const ofertasActivas: Oferta[] = [
  {
    id: 1,
    titulo: '15% de descuento en tu próximo pedido',
    cluster: 'Inactivos 30 días',
    tipo: 'Descuento',
    estado: 'ACTIVA',
    alcance: 8,
    conversion: 3,
    vence: '5 jun',
  },
  {
    id: 2,
    titulo: '2x1 en empanadas los domingos',
    cluster: 'Familias de fin de semana',
    tipo: '2x1',
    estado: 'ACTIVA',
    alcance: 24,
    conversion: 11,
    vence: '15 jun',
  },
  {
    id: 3,
    titulo: 'Combo desayuno por $1.50',
    cluster: 'Madrugadores fieles',
    tipo: 'Combo',
    estado: 'PROGRAMADA',
    alcance: 12,
    conversion: 0,
    vence: '10 jun',
  },
];

export default function Ofertas() {
  const [tab, setTab] = useState<'clusters' | 'ofertas'>('clusters');
  const [clusterSel, setClusterSel] = useState<Cluster | null>(null);
  const [crearAbierto, setCrearAbierto] = useState(false);

  const totalClientes = clusters.reduce((s, c) => s + c.clientes, 0);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-amasa-700 to-marron text-white relative overflow-hidden border border-white/15 shadow-[0_12px_40px_rgba(58,42,26,0.25)]">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-amasa-400/30 blur-3xl" />
        <div className="absolute -right-4 -bottom-12 w-48 h-48 rounded-full bg-orange-400/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold border border-white/20 mb-3">
              <Sparkles size={14} /> IA + Clustering
            </div>
            <h1 className="text-4xl font-extrabold mb-1">Ofertas y Marketing</h1>
            <p className="text-amasa-100 max-w-xl">
              Tus clientes están agrupados automáticamente por hábitos.
              Crea campañas dirigidas que de verdad funcionen.
            </p>
          </div>
          <button
            onClick={() => setCrearAbierto(true)}
            className="bg-white text-amasa-700 rounded-2xl px-5 py-3 font-bold flex items-center gap-2 shadow-2xl border border-white/40 hover:bg-amasa-50 transition shrink-0"
          >
            <Plus size={18} /> Crear oferta
          </button>
        </div>

        {/* Stats inline */}
        <div className="relative mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatHero icon={<Users size={16} />} label="Total clientes" valor={String(totalClientes)} />
          <StatHero icon={<Target size={16} />} label="Segmentos" valor={String(clusters.length)} />
          <StatHero icon={<Megaphone size={16} />} label="Ofertas activas" valor="2" />
          <StatHero icon={<TrendingUp size={16} />} label="Conversión" valor="42%" />
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-strong rounded-2xl p-1 inline-flex">
        <button
          onClick={() => setTab('clusters')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            tab === 'clusters' ? 'bg-amasa-500 text-white shadow-suave' : 'text-amasa-700'
          }`}
        >
          <Target size={16} /> Segmentos de clientes
        </button>
        <button
          onClick={() => setTab('ofertas')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            tab === 'ofertas' ? 'bg-amasa-500 text-white shadow-suave' : 'text-amasa-700'
          }`}
        >
          <Tag size={16} /> Ofertas ({ofertasActivas.length})
        </button>
      </div>

      {tab === 'clusters' ? (
        <ClustersGrid clusters={clusters} totalClientes={totalClientes} onSelect={setClusterSel} />
      ) : (
        <OfertasList ofertas={ofertasActivas} onCrear={() => setCrearAbierto(true)} />
      )}

      {/* Modal cluster detalle */}
      {clusterSel && <ClusterDetalle cluster={clusterSel} onClose={() => setClusterSel(null)} onCrear={() => { setClusterSel(null); setCrearAbierto(true); }} />}

      {/* Modal crear oferta */}
      {crearAbierto && <CrearOferta onClose={() => setCrearAbierto(false)} />}
    </div>
  );
}

/* ----------- Componentes ----------- */

function StatHero({ icon, label, valor }: { icon: any; label: string; valor: string }) {
  return (
    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20">
      <div className="flex items-center gap-1.5 text-xs opacity-90 mb-1">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      <p className="text-2xl font-extrabold">{valor}</p>
    </div>
  );
}

function ClustersGrid({
  clusters,
  totalClientes,
  onSelect,
}: {
  clusters: Cluster[];
  totalClientes: number;
  onSelect: (c: Cluster) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Visualización tipo "constelación" */}
      <div className="card relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-amasa-500" size={20} />
          <h2 className="text-xl font-bold">Distribución de tu base de clientes</h2>
        </div>

        {/* Barra de proporciones */}
        <div className="flex h-12 rounded-2xl overflow-hidden border border-white/60 mb-3 shadow-suave">
          {clusters.map((c) => (
            <div
              key={c.id}
              className={`bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white font-bold text-xs relative group cursor-pointer hover:brightness-110 transition`}
              style={{ width: `${(c.clientes / totalClientes) * 100}%` }}
              onClick={() => onSelect(c)}
              title={c.nombre}
            >
              {(c.clientes / totalClientes) > 0.08 && c.emoji}
              <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <span className="text-[10px] font-bold">{c.clientes}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {clusters.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1 text-amasa-700">
              <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${c.gradient}`} />
              {c.emoji} {c.nombre} ({c.clientes})
            </span>
          ))}
        </div>
      </div>

      {/* Grid de tarjetas de cluster */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Segmentos detectados</h2>
          <span className="text-xs text-amasa-700 font-semibold">
            Actualizado hace 2h · Clustering K-means
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusters.map((c) => (
            <ClusterCard key={c.id} cluster={c} onSelect={() => onSelect(c)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClusterCard({ cluster, onSelect }: { cluster: Cluster; onSelect: () => void }) {
  const Icon = cluster.icon;
  return (
    <button
      onClick={onSelect}
      className="card !p-0 overflow-hidden text-left hover:scale-[1.02] transition group relative"
    >
      {/* Banda de color top */}
      <div className={`h-1.5 bg-gradient-to-r ${cluster.gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cluster.gradient} text-white grid place-items-center shadow-suave relative`}>
            <Icon size={22} />
            <span className="absolute -bottom-1 -right-1 text-2xl">{cluster.emoji}</span>
          </div>
          <span className="text-3xl font-extrabold text-amasa-900">{cluster.clientes}</span>
        </div>

        <h3 className="font-extrabold text-lg leading-tight">{cluster.nombre}</h3>
        <p className="text-xs text-amasa-700 mb-3 leading-relaxed line-clamp-2">{cluster.descripcion}</p>

        <div className="flex items-center justify-between text-xs">
          <div className="text-amasa-700">
            <span className="font-semibold">Ticket:</span> ${cluster.ticketPromedio.toFixed(2)}
          </div>
          <div className="text-amasa-700">
            <span className="font-semibold">Frec:</span> {cluster.frecuencia}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/40 flex items-center justify-between text-xs text-amasa-600 font-semibold">
          <span>Ver clientes y crear oferta</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
        </div>
      </div>
    </button>
  );
}

function ClusterDetalle({
  cluster,
  onClose,
  onCrear,
}: {
  cluster: Cluster;
  onClose: () => void;
  onCrear: () => void;
}) {
  const Icon = cluster.icon;
  // Mock de clientes en el cluster
  const clientesMock = [
    'Juan Pérez', 'Lucía Jaramillo', 'Carlos Ordóñez', 'María Reyes',
    'Pedro Salinas', 'Ana Tapia', 'Diego Carrión', 'Sofía León',
  ].slice(0, Math.min(cluster.clientes, 8));

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-marron/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto !p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradient */}
        <div className={`relative bg-gradient-to-br ${cluster.gradient} text-white p-6 overflow-hidden`}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/20 backdrop-blur grid place-items-center hover:bg-white/30 transition"
          >
            <X size={18} />
          </button>
          <div className="relative flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur grid place-items-center border border-white/30 shrink-0">
              <Icon size={32} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase opacity-90">{cluster.emoji} Segmento</p>
              <h2 className="text-3xl font-extrabold">{cluster.nombre}</h2>
              <p className="text-sm opacity-95">{cluster.descripcion}</p>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-3 mt-6">
            <StatHero icon={<Users size={14} />} label="Clientes" valor={String(cluster.clientes)} />
            <StatHero icon={<TrendingUp size={14} />} label="Ticket prom." valor={`$${cluster.ticketPromedio.toFixed(2)}`} />
            <StatHero icon={<Calendar size={14} />} label="Frecuencia" valor={cluster.frecuencia} />
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-bold text-amasa-700 uppercase mb-2">Características del segmento</p>
            <div className="flex flex-wrap gap-2">
              {cluster.caracteristicas.map((c, i) => (
                <span key={i} className="bg-white/60 backdrop-blur border border-white/60 rounded-full px-3 py-1 text-xs font-semibold text-amasa-900">
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>

          {/* Recomendación IA */}
          <div className="bg-gradient-to-br from-amasa-50 to-amasa-100 backdrop-blur-xl border border-white/60 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amasa-500 to-amasa-700 text-white grid place-items-center shadow-suave">
                <Sparkles size={14} />
              </div>
              <p className="text-xs font-bold text-amasa-900 uppercase">Sugerencia de Amasa IA</p>
            </div>
            <p className="text-sm text-amasa-900 font-semibold">{cluster.recomendacion}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-amasa-700 uppercase mb-2">
              Clientes en este segmento ({cluster.clientes})
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
              {clientesMock.map((nombre, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/40 backdrop-blur border border-white/50">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cluster.gradient} text-white grid place-items-center font-bold text-xs shrink-0`}>
                    {nombre.charAt(0)}
                  </div>
                  <span className="font-semibold text-sm flex-1">{nombre}</span>
                  <span className="text-xs text-amasa-600">099900000{i}</span>
                </div>
              ))}
              {cluster.clientes > clientesMock.length && (
                <p className="text-xs text-center text-amasa-600 py-1">
                  + {cluster.clientes - clientesMock.length} más
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-white/40">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cerrar
            </button>
            <button onClick={onCrear} className="btn-primary flex-1">
              <Megaphone size={16} /> Crear oferta para este segmento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfertasList({ ofertas, onCrear }: { ofertas: Oferta[]; onCrear: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Tus ofertas</h2>
        <button onClick={onCrear} className="btn-primary !py-2 !px-4 text-sm">
          <Plus size={16} /> Nueva
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {ofertas.map((o) => (
          <div key={o.id} className="card !p-5 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-amasa-200/40 blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`chip ${
                    o.estado === 'ACTIVA'
                      ? 'bg-green-100/80 text-green-700'
                      : o.estado === 'PROGRAMADA'
                      ? 'bg-amasa-100/80 text-amasa-900'
                      : 'bg-gray-100/80 text-gray-700'
                  } backdrop-blur border border-white/50`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                  {o.estado}
                </span>
                <span className="text-xs text-amasa-700 font-semibold flex items-center gap-1">
                  <Calendar size={12} /> Vence {o.vence}
                </span>
              </div>
              <h3 className="text-lg font-extrabold leading-tight mb-1">{o.titulo}</h3>
              <p className="text-xs text-amasa-700 mb-4 flex items-center gap-1">
                <Target size={12} /> Para: <strong>{o.cluster}</strong>
              </p>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/50 backdrop-blur border border-white/60 rounded-xl p-2">
                  <p className="text-[10px] text-amasa-600 font-semibold uppercase">Alcance</p>
                  <p className="text-lg font-extrabold">{o.alcance}</p>
                </div>
                <div className="bg-white/50 backdrop-blur border border-white/60 rounded-xl p-2">
                  <p className="text-[10px] text-amasa-600 font-semibold uppercase">Convirtieron</p>
                  <p className="text-lg font-extrabold text-green-600">{o.conversion}</p>
                </div>
                <div className="bg-white/50 backdrop-blur border border-white/60 rounded-xl p-2">
                  <p className="text-[10px] text-amasa-600 font-semibold uppercase">Tasa</p>
                  <p className="text-lg font-extrabold text-amasa-600">
                    {o.alcance ? Math.round((o.conversion / o.alcance) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-white/60 backdrop-blur border border-white/60 text-amasa-800 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 hover:bg-white/80 transition">
                  <Eye size={12} /> Ver detalle
                </button>
                <button className="flex-1 bg-amasa-500 text-white rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 hover:bg-amasa-600 transition">
                  <Send size={12} /> Reenviar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrearOferta({ onClose }: { onClose: () => void }) {
  const [paso, setPaso] = useState(1);
  const [clusterId, setClusterId] = useState<string>('');
  const [tipo, setTipo] = useState<'descuento' | '2x1' | 'combo' | 'gratis'>('descuento');
  const [valor, setValor] = useState('15');
  const [mensaje, setMensaje] = useState('Hola {nombre}, tenemos algo especial para ti 🥖');
  const [confirmado, setConfirmado] = useState(false);

  const cluster = clusters.find((c) => c.id === clusterId);

  const tipos = [
    { id: 'descuento' as const, label: 'Descuento %', icon: <Percent size={20} />, desc: 'Ej: 15% off' },
    { id: '2x1' as const, label: '2x1', icon: <Tag size={20} />, desc: 'Lleva 2 paga 1' },
    { id: 'combo' as const, label: 'Combo', icon: <Gift size={20} />, desc: 'Precio especial' },
    { id: 'gratis' as const, label: 'Producto gratis', icon: <Sparkles size={20} />, desc: 'Al alcanzar $X' },
  ];

  if (confirmado) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-marron/30 backdrop-blur-sm">
        <div className="card max-w-md w-full text-center !p-8">
          <div className="w-20 h-20 rounded-full bg-green-100/70 backdrop-blur-xl border border-green-200/60 grid place-items-center mb-4 mx-auto shadow-[0_8px_32px_rgba(34,197,94,0.25)]">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
          <h2 className="text-2xl font-extrabold mb-2">¡Oferta enviada!</h2>
          <p className="text-amasa-700 text-sm mb-6">
            Notificamos a {cluster?.clientes} clientes del segmento <strong>{cluster?.nombre}</strong> por la app y WhatsApp.
          </p>
          <button onClick={onClose} className="btn-primary w-full">
            Volver a ofertas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-marron/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-amasa-700 font-bold uppercase">Paso {paso} de 3</p>
            <h2 className="text-2xl font-extrabold flex items-center gap-2">
              <Megaphone className="text-amasa-500" /> Nueva oferta
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/60 backdrop-blur border border-white/60 grid place-items-center hover:bg-white/80 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((p) => (
            <div
              key={p}
              className={`flex-1 h-1.5 rounded-full transition ${
                p <= paso ? 'bg-gradient-to-r from-amasa-500 to-amasa-600' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {paso === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Target size={18} className="text-amasa-500" /> ¿A qué segmento le envías?</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {clusters.map((c) => {
                const sel = clusterId === c.id;
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => setClusterId(c.id)}
                    className={`text-left rounded-2xl p-3 border-2 transition ${
                      sel
                        ? `bg-gradient-to-br ${c.gradient} text-white border-white/30 shadow-suave`
                        : 'bg-white/60 backdrop-blur border-white/60 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={18} />
                      <span className="font-bold text-sm flex-1">{c.nombre}</span>
                      <span className="text-2xl">{c.emoji}</span>
                    </div>
                    <p className={`text-xs ${sel ? 'opacity-90' : 'text-amasa-700'}`}>
                      {c.clientes} clientes · ticket ${c.ticketPromedio.toFixed(2)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Tag size={18} className="text-amasa-500" /> ¿Qué tipo de oferta?</h3>
            <div className="grid grid-cols-2 gap-2">
              {tipos.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTipo(t.id)}
                  className={`text-left rounded-2xl p-4 border-2 transition ${
                    tipo === t.id
                      ? 'bg-gradient-to-br from-amasa-500 to-amasa-600 text-white border-white/30 shadow-suave'
                      : 'bg-white/60 backdrop-blur border-white/60 hover:bg-white/80'
                  }`}
                >
                  <div className="mb-2">{t.icon}</div>
                  <p className="font-extrabold">{t.label}</p>
                  <p className={`text-xs ${tipo === t.id ? 'opacity-90' : 'text-amasa-700'}`}>{t.desc}</p>
                </button>
              ))}
            </div>

            {tipo === 'descuento' && (
              <div>
                <label className="label">Porcentaje de descuento</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="input-glass !py-3 text-2xl font-extrabold text-center"
                    min={5}
                    max={50}
                  />
                  <span className="text-2xl font-extrabold text-amasa-700">%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Send size={18} className="text-amasa-500" /> Mensaje y vigencia</h3>
            <div>
              <label className="label">Mensaje a enviar</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={3}
                className="input-glass resize-none"
              />
              <p className="text-[10px] text-amasa-600 mt-1">
                Usa <code className="bg-white/60 px-1 rounded">{'{nombre}'}</code> para personalizar.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Válida hasta</label>
                <input type="date" defaultValue="2026-06-15" className="input-glass" />
              </div>
              <div>
                <label className="label">Canal</label>
                <select className="input-glass" defaultValue="ambos">
                  <option value="app">Solo en la app</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="ambos">App + WhatsApp</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            {cluster && (
              <div className="bg-gradient-to-br from-amasa-50 to-amasa-100 backdrop-blur-xl border border-white/60 rounded-2xl p-4">
                <p className="text-xs font-bold text-amasa-700 uppercase mb-2 flex items-center gap-1">
                  <Eye size={12} /> Vista previa
                </p>
                <div className="bg-white/70 backdrop-blur border border-white/60 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cluster.gradient} text-white grid place-items-center text-sm font-bold shadow-suave`}>
                      🥖
                    </div>
                    <div>
                      <p className="font-bold text-sm">Amasa Panadería</p>
                      <p className="text-[10px] text-amasa-600">Hace 1 min</p>
                    </div>
                  </div>
                  <p className="text-sm text-amasa-900 mb-2">{mensaje}</p>
                  <div className="bg-gradient-to-br from-amasa-500 to-amasa-600 text-white rounded-xl p-3 text-center">
                    <p className="text-xs font-bold opacity-90 uppercase">Tu beneficio</p>
                    <p className="text-2xl font-extrabold">
                      {tipo === 'descuento' && `${valor}% OFF`}
                      {tipo === '2x1' && '2x1'}
                      {tipo === 'combo' && 'Combo $1.50'}
                      {tipo === 'gratis' && 'Pan gratis'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center text-amasa-700 mt-2">
                  <Zap className="inline text-amasa-500" size={12} /> Estimado: <strong>{cluster.clientes}</strong> personas alcanzadas · ~<strong>{Math.round(cluster.clientes * 0.42)}</strong> conversiones
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botones de paso */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-white/40">
          {paso > 1 && (
            <button onClick={() => setPaso(paso - 1)} className="btn-secondary flex-1">
              Atrás
            </button>
          )}
          {paso < 3 ? (
            <button
              onClick={() => setPaso(paso + 1)}
              disabled={paso === 1 && !clusterId}
              className="btn-primary flex-1"
            >
              Continuar <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={() => setConfirmado(true)} className="btn-primary flex-1">
              <Send size={16} /> Enviar oferta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
