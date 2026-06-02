import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Package,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Factory,
  Users,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import EstadoChip, { ESTADOS, Estado, labelEstado } from '../../components/EstadoChip';
import { useAuth } from '../../store/auth';

interface Resumen {
  totalPedidos: number;
  totalUnidades: number;
  totalFacturar: number;
  insumosBajos: number;
}

export default function Dashboard() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const usuario = useAuth((s) => s.usuario);

  async function cargar() {
    const [r, p] = await Promise.all([
      api<Resumen>('/dashboard/hoy'),
      api<any[]>('/pedidos/hoy'),
    ]);
    setResumen(r);
    setPedidos(p);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstado(id: number, estado: Estado) {
    await api(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
    cargar();
  }

  const fecha = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* Hero saludo */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-sm text-amasa-700 capitalize">{fecha}</p>
          <h1 className="text-4xl font-extrabold text-amasa-900">
            Buen día, {usuario?.nombre.split(' ')[0]} 👋
          </h1>
          <p className="text-amasa-700">Aquí está el horneado del día.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/produccion" className="btn-primary !py-2.5 !px-4 text-sm">
            <Factory size={16} /> Ver producción
          </Link>
          <Link to="/admin/ofertas" className="btn-secondary !py-2.5 !px-4 text-sm">
            <Megaphone size={16} /> Ofertas
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tarjeta
          icon={<ClipboardList />}
          label="Pedidos del día"
          valor={resumen?.totalPedidos ?? '—'}
          color="from-amasa-500 to-amasa-600"
          tend="+18%"
        />
        <Tarjeta
          icon={<Package />}
          label="Unidades a producir"
          valor={resumen?.totalUnidades ?? '—'}
          color="from-orange-500 to-orange-600"
          tend="+12%"
        />
        <Tarjeta
          icon={<DollarSign />}
          label="Total a facturar"
          valor={resumen ? formatoUSD(resumen.totalFacturar) : '—'}
          color="from-green-500 to-green-700"
          tend="+24%"
        />
        <Tarjeta
          icon={<AlertTriangle />}
          label="Insumos bajos"
          valor={resumen?.insumosBajos ?? '—'}
          color="from-red-500 to-red-600"
          link="/admin/inventario"
        />
      </div>

      {/* Grid principal */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pedidos de hoy */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pedidos de hoy</h2>
            <Link to="/admin/pedidos" className="text-amasa-600 font-semibold flex items-center gap-1 hover:underline text-sm">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>

          {pedidos.length === 0 ? (
            <p className="text-amasa-700 text-center py-8">Sin pedidos aún.</p>
          ) : (
            <div className="divide-y divide-white/40">
              {pedidos.map((p) => (
                <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amasa-500 to-amasa-600 text-white grid place-items-center font-extrabold shrink-0">
                    {p.cliente.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm">#{p.id}</span>
                      <span className="text-amasa-300">·</span>
                      <span className="font-semibold truncate">{p.cliente.nombre}</span>
                    </div>
                    <p className="text-xs text-amasa-700 flex items-center gap-1">
                      <Clock size={12} /> {p.horaEntrega} · {formatoUSD(p.total)} ·{' '}
                      {p.items.reduce((s: number, it: any) => s + it.cantidad, 0)} unid
                    </p>
                  </div>
                  <select
                    value={p.estado}
                    onChange={(e) => cambiarEstado(p.id, e.target.value as Estado)}
                    className="rounded-xl bg-white/60 backdrop-blur border border-white/60 px-2.5 py-1.5 font-semibold text-xs focus:outline-none focus:border-amasa-400"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>{labelEstado(e)}</option>
                    ))}
                  </select>
                  <EstadoChip estado={p.estado} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Crecimiento */}
          <div className="card relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-amasa-200/40 blur-2xl" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amasa-500 to-amasa-600 text-white grid place-items-center mb-3 shadow-suave">
                <TrendingUp size={20} />
              </div>
              <p className="text-sm text-amasa-700 mb-1">Esta semana</p>
              <p className="text-3xl font-extrabold">+24% ventas</p>
              <p className="text-xs text-amasa-700 mt-1">vs semana pasada</p>

              <div className="mt-4 h-16 flex items-end gap-1.5">
                {[40, 55, 35, 70, 60, 85, 95].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-amasa-500 to-amasa-300"
                    style={{ height: `${v}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-amasa-600 mt-1 font-semibold uppercase">
                <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
              </div>
            </div>
          </div>

          {/* Sugerencia IA */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-amasa-700 to-marron text-white relative overflow-hidden border border-white/15 shadow-[0_12px_40px_rgba(58,42,26,0.25)]">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-amasa-400/30 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} />
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">Insight del día</p>
              </div>
              <p className="font-bold leading-tight mb-3">
                Tienes 8 clientes que no piden hace 3+ semanas
              </p>
              <p className="text-xs text-amasa-100 mb-3">
                Envíales un cupón del 15% para reactivarlos.
              </p>
              <Link
                to="/admin/ofertas"
                className="inline-flex items-center gap-1 bg-white/20 backdrop-blur rounded-xl px-3 py-1.5 text-xs font-bold border border-white/30 hover:bg-white/30 transition"
              >
                <Megaphone size={12} /> Crear oferta
              </Link>
            </div>
          </div>

          {/* Atajos */}
          <div className="card">
            <p className="text-xs font-bold text-amasa-700 uppercase mb-3">Atajos</p>
            <div className="grid grid-cols-2 gap-2">
              <Atajo to="/admin/clientes" icon={<Users size={16} />} label="Clientes" />
              <Atajo to="/admin/inventario" icon={<Package size={16} />} label="Stock" />
              <Atajo to="/admin/produccion" icon={<Factory size={16} />} label="Producir" />
              <Atajo to="/admin/ofertas" icon={<Megaphone size={16} />} label="Ofertas" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tarjeta({
  icon,
  label,
  valor,
  color,
  tend,
  link,
}: {
  icon: any;
  label: string;
  valor: any;
  color: string;
  tend?: string;
  link?: string;
}) {
  const inner = (
    <div className="card !p-5 relative overflow-hidden hover:scale-[1.02] transition group">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white grid place-items-center mb-3 shadow-suave`}>
        {icon}
      </div>
      <p className="text-amasa-700 text-sm">{label}</p>
      <div className="flex items-baseline justify-between mt-1">
        <p className="text-3xl font-extrabold">{valor}</p>
        {tend && (
          <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
            <TrendingUp size={10} /> {tend}
          </span>
        )}
      </div>
    </div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
}

function Atajo({ to, icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/50 backdrop-blur border border-white/60 hover:bg-amasa-50/70 transition font-semibold text-sm text-amasa-800"
    >
      <span className="text-amasa-600">{icon}</span>
      {label}
    </Link>
  );
}
