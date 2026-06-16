import { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  Percent,
  ShoppingBag,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import CountUp from '../../components/CountUp';
import EstadoChip, { Estado } from '../../components/EstadoChip';

interface Serie {
  fecha: string;
  ventas: number;
  costo: number;
  ganancia: number;
  pedidos: number;
}
interface Reporte {
  desde: string;
  hasta: string;
  ventas: number;
  costo: number;
  ganancia: number;
  margen: number;
  nPedidos: number;
  unidades: number;
  ticketPromedio: number;
  serie: Serie[];
  historial: { id: number; fecha: string; cliente: string; total: number; estado: string; ganancia: number }[];
  costeoIncompleto: boolean;
}

type Periodo = 'hoy' | '7d' | '30d';

function rango(periodo: Periodo) {
  const hasta = new Date();
  const desde = new Date();
  if (periodo === 'hoy') desde.setHours(0, 0, 0, 0);
  else if (periodo === '7d') desde.setDate(desde.getDate() - 6);
  else desde.setDate(desde.getDate() - 29);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { desde: fmt(desde), hasta: fmt(hasta) };
}

export default function Reportes() {
  const [periodo, setPeriodo] = useState<Periodo>('7d');
  const [data, setData] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { desde, hasta } = rango(periodo);
    api<Reporte>(`/reportes?desde=${desde}&hasta=${hasta}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [periodo]);

  const maxVenta = useMemo(() => Math.max(1, ...(data?.serie.map((s) => s.ventas) ?? [1])), [data]);

  const periodos: { key: Periodo; label: string }[] = [
    { key: 'hoy', label: 'Hoy' },
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-amasa-900">Ventas y ganancias</h1>
          <p className="text-amasa-600 mt-1">Tu desempeño del periodo, con costo estimado por recetas.</p>
        </div>
        <div className="flex gap-1 p-1 bg-amasa-50 rounded-xl border border-amasa-100 self-start">
          {periodos.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriodo(p.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                periodo === p.key ? 'bg-white text-amasa-900 shadow-sm' : 'text-amasa-600 hover:text-amasa-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {loading || !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card !p-4 h-24 skeleton" />
          ))}
        </div>
      ) : (
        <>
          {data.costeoIncompleto && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2 text-sm text-amber-800">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>
                Algunos productos no tienen receta o sus insumos no tienen costo, así que la <strong>ganancia es
                aproximada</strong>. Complétalos en Inventario para mayor precisión.
              </span>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi icon={<DollarSign size={18} />} label="Ventas" tone="amasa" className="delay-1">
              <CountUp value={data.ventas} format={formatoUSD} />
            </Kpi>
            <Kpi icon={<Receipt size={18} />} label="Costo estimado" tone="neutral" className="delay-2">
              <CountUp value={data.costo} format={formatoUSD} />
            </Kpi>
            <Kpi icon={<Wallet size={18} />} label="Ganancia estimada" tone={data.ganancia >= 0 ? 'green' : 'red'} className="delay-3">
              <CountUp value={data.ganancia} format={formatoUSD} />
            </Kpi>
            <Kpi icon={<Percent size={18} />} label="Margen" tone="neutral" className="delay-4">
              <CountUp value={data.margen} format={(n) => `${n.toFixed(1)}%`} />
            </Kpi>
          </div>

          {/* Secundarios */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card !p-4 flex items-center gap-3">
              <ShoppingBag className="text-amasa-500" />
              <div>
                <p className="text-2xl font-bold text-amasa-900"><CountUp value={data.nPedidos} /></p>
                <p className="text-xs text-amasa-500">Pedidos · {data.unidades} unidades</p>
              </div>
            </div>
            <div className="card !p-4 flex items-center gap-3">
              <TrendingUp className="text-amasa-500" />
              <div>
                <p className="text-2xl font-bold text-amasa-900">{formatoUSD(data.ticketPromedio)}</p>
                <p className="text-xs text-amasa-500">Ticket promedio</p>
              </div>
            </div>
          </div>

          {/* Gráfico diario */}
          <div className="card">
            <h2 className="text-lg font-bold text-amasa-900 mb-4">Ventas por día</h2>
            {data.serie.length === 0 ? (
              <p className="text-amasa-500 text-center py-8">Sin ventas en este periodo.</p>
            ) : (
              <div className="flex items-end gap-1.5 h-44">
                {data.serie.map((s) => {
                  const h = Math.max(4, (s.ventas / maxVenta) * 100);
                  const gan = s.ventas > 0 ? Math.max(0, (s.ganancia / s.ventas) * h) : 0;
                  return (
                    <div key={s.fecha} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                      <div className="w-full flex flex-col justify-end items-stretch relative" style={{ height: '100%' }}>
                        {/* tooltip */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition bg-marron text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                          {formatoUSD(s.ventas)} · gan {formatoUSD(s.ganancia)}
                        </div>
                        <div className="w-full rounded-t-md bg-amasa-200 relative overflow-hidden" style={{ height: `${h}%` }}>
                          <div className="absolute bottom-0 inset-x-0 bg-amasa-600 rounded-t-md" style={{ height: `${(gan / h) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-[9px] text-amasa-400 truncate w-full text-center">
                        {s.fecha.slice(8, 10)}/{s.fecha.slice(5, 7)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-amasa-600">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amasa-200 inline-block" /> Ventas</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amasa-600 inline-block" /> Ganancia</span>
            </div>
          </div>

          {/* Historial */}
          <div>
            <h2 className="text-lg font-bold text-amasa-900 mb-2">Historial de pedidos</h2>
            {data.historial.length === 0 ? (
              <div className="card text-center py-8 text-amasa-500">Sin pedidos en este periodo.</div>
            ) : (
              <div className="card !p-0 divide-y divide-amasa-100">
                {data.historial.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-amasa-900 text-sm truncate">
                        #{h.id} · {h.cliente}
                      </p>
                      <p className="text-xs text-amasa-500">{new Date(h.fecha).toLocaleDateString('es-EC')}</p>
                    </div>
                    <EstadoChip estado={h.estado as Estado} />
                    <div className="text-right shrink-0">
                      <p className="font-bold text-amasa-900">{formatoUSD(h.total)}</p>
                      <p className="text-[11px] text-green-600">+{formatoUSD(h.ganancia)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({
  icon,
  label,
  children,
  tone,
  className = '',
}: {
  icon: any;
  label: string;
  children: any;
  tone: 'amasa' | 'green' | 'red' | 'neutral';
  className?: string;
}) {
  const tones: Record<string, string> = {
    amasa: 'bg-amasa-50 text-amasa-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    neutral: 'bg-amasa-50 text-amasa-500',
  };
  return (
    <div className={`card !p-4 lift animate-fade-up ${className}`}>
      <div className={`w-9 h-9 rounded-lg grid place-items-center mb-2 ${tones[tone]}`}>{icon}</div>
      <p className="text-amasa-500 text-xs">{label}</p>
      <p className="text-2xl font-bold text-amasa-900 mt-0.5 tabular-nums">{children}</p>
    </div>
  );
}
