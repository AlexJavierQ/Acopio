import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Package,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  Factory,
  Users,
  Handshake,
  UserPlus,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import EstadoChip, { ESTADOS, Estado, labelEstado } from '../../components/EstadoChip';
import { useAuth } from '../../store/auth';

interface Resumen {
  totalPedidos: number;
  totalUnidades: number;
  totalFacturar: number;
  insumosBajos: number;
  afiliacionesPendientes: number;
  negociacionesPendientes: number;
}
interface Req {
  cantidadPedidos: number;
  todoAlcanza: boolean;
  listaCompras: any[];
}

/* Número que cuenta hacia arriba al montar — animación sutil y constante */
function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

function CountUp({ value, format }: { value: number; format?: (n: number) => string }) {
  const v = useCountUp(value);
  return <>{format ? format(v) : Math.round(v)}</>;
}

export default function Dashboard() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [req, setReq] = useState<Req | null>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const usuario = useAuth((s) => s.usuario);

  async function cargar() {
    const [r, p, rq] = await Promise.all([
      api<Resumen>('/dashboard/hoy'),
      api<any[]>('/pedidos/hoy'),
      api<Req>('/produccion/requerimientos').catch(() => null),
    ]);
    setResumen(r);
    setPedidos(p);
    setReq(rq);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstado(id: number, estado: Estado) {
    await api(`/pedidos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) });
    cargar();
  }

  const fecha = new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-amasa-500 capitalize">{fecha}</p>
          <h1 className="text-3xl font-bold text-amasa-900">
            Hola, {usuario?.nombre.split(' ')[0]}
          </h1>
        </div>
        <Link to="/admin/inventario" className="btn-secondary text-sm self-start sm:self-auto">
          <Factory size={16} /> Requerimientos
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={<ClipboardList size={18} />} label="Pedidos del día" className="delay-1">
          {resumen ? <CountUp value={resumen.totalPedidos} /> : '—'}
        </Kpi>
        <Kpi icon={<Package size={18} />} label="Unidades a producir" className="delay-2">
          {resumen ? <CountUp value={resumen.totalUnidades} /> : '—'}
        </Kpi>
        <Kpi icon={<DollarSign size={18} />} label="Total a facturar" className="delay-3">
          {resumen ? <CountUp value={resumen.totalFacturar} format={formatoUSD} /> : '—'}
        </Kpi>
        <Link to="/admin/inventario">
          <Kpi
            icon={<AlertTriangle size={18} />}
            label="Insumos bajos"
            danger={!!resumen && resumen.insumosBajos > 0}
            className="delay-4"
          >
            {resumen ? <CountUp value={resumen.insumosBajos} /> : '—'}
          </Kpi>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Pedidos de hoy */}
        <div className="card lg:col-span-2 animate-fade-up delay-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-amasa-900">Pedidos de hoy</h2>
            <Link to="/admin/pedidos" className="text-amasa-600 font-semibold flex items-center gap-1 hover:underline text-sm">
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>

          {pedidos.length === 0 ? (
            <p className="text-amasa-500 text-center py-10">Sin pedidos aún hoy.</p>
          ) : (
            <div className="divide-y divide-amasa-100">
              {pedidos.map((p) => (
                <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amasa-100 text-amasa-700 grid place-items-center font-bold shrink-0">
                    {p.cliente.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">#{p.id}</span>
                      <span className="text-amasa-300">·</span>
                      <span className="font-semibold truncate text-sm">{p.cliente.nombre}</span>
                    </div>
                    <p className="text-xs text-amasa-500 flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {p.horaEntrega} · {formatoUSD(p.total)} ·{' '}
                      {p.items.reduce((s: number, it: any) => s + it.cantidad, 0)} unid
                    </p>
                  </div>
                  <select
                    value={p.estado}
                    onChange={(e) => cambiarEstado(p.id, e.target.value as Estado)}
                    className="rounded-lg bg-white border border-amasa-200 px-2.5 py-1.5 font-semibold text-xs focus:outline-none focus:border-amasa-400"
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
        <div className="space-y-5">
          {/* Estado de inventario (real) */}
          <Link to="/admin/inventario" className="block lift">
            <div className={`card ${req && !req.todoAlcanza ? 'border-amber-200 bg-amber-50' : ''}`}>
              <div className="flex items-center gap-3">
                {req && !req.todoAlcanza ? (
                  <AlertTriangle className="text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="text-green-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-amasa-900">
                    {!req
                      ? 'Inventario'
                      : req.cantidadPedidos === 0
                      ? 'Sin pedidos por producir'
                      : req.todoAlcanza
                      ? 'Inventario al día'
                      : `Faltan ${req.listaCompras.length} insumo(s)`}
                  </p>
                  <p className="text-xs text-amasa-500 flex items-center gap-1">
                    <ShoppingCart size={12} /> Ver requerimientos
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Pendientes (real) */}
          <div className="card">
            <p className="text-xs font-bold text-amasa-500 uppercase tracking-wide mb-3">Pendientes</p>
            <div className="space-y-2">
              <Pendiente
                to="/admin/afiliados"
                icon={<UserPlus size={16} />}
                label="Solicitudes de afiliación"
                n={resumen?.afiliacionesPendientes ?? 0}
              />
              <Pendiente
                to="/admin/negociaciones"
                icon={<Handshake size={16} />}
                label="Negociaciones por responder"
                n={resumen?.negociacionesPendientes ?? 0}
              />
            </div>
          </div>

          {/* Atajos */}
          <div className="card">
            <p className="text-xs font-bold text-amasa-500 uppercase tracking-wide mb-3">Atajos</p>
            <div className="grid grid-cols-2 gap-2">
              <Atajo to="/admin/clientes" icon={<Users size={16} />} label="Clientes" />
              <Atajo to="/admin/inventario" icon={<Package size={16} />} label="Inventario" />
              <Atajo to="/admin/pedidos" icon={<ClipboardList size={16} />} label="Pedidos" />
              <Atajo to="/admin/produccion" icon={<Factory size={16} />} label="Producción" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  children,
  danger,
  className = '',
}: {
  icon: any;
  label: string;
  children: any;
  danger?: boolean;
  className?: string;
}) {
  return (
    <div className={`card !p-4 lift animate-fade-up ${className} ${danger ? 'border-amber-200 bg-amber-50' : ''}`}>
      <div className={`w-9 h-9 rounded-lg grid place-items-center mb-2 ${danger ? 'bg-amber-100 text-amber-700' : 'bg-amasa-50 text-amasa-600'}`}>
        {icon}
      </div>
      <p className="text-amasa-500 text-xs">{label}</p>
      <p className="text-2xl font-bold text-amasa-900 mt-0.5 tabular-nums">{children}</p>
    </div>
  );
}

function Pendiente({ to, icon, label, n }: { to: string; icon: any; label: string; n: number }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-amasa-50 transition">
      <span className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${n > 0 ? 'bg-amasa-100 text-amasa-700' : 'bg-amasa-50 text-amasa-400'}`}>
        {icon}
      </span>
      <span className="flex-1 text-sm text-amasa-800">{label}</span>
      {n > 0 ? (
        <span className="min-w-6 h-6 px-1.5 rounded-full bg-amasa-600 text-white text-xs font-bold grid place-items-center animate-pulse-soft">
          {n}
        </span>
      ) : (
        <CheckCircle2 size={16} className="text-green-500" />
      )}
    </Link>
  );
}

function Atajo({ to, icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amasa-50 hover:bg-amasa-100 transition font-semibold text-sm text-amasa-800"
    >
      <span className="text-amasa-600">{icon}</span>
      {label}
    </Link>
  );
}
