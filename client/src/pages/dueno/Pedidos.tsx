import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Clock } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import EstadoChip, { ESTADOS, Estado, labelEstado } from '../../components/EstadoChip';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<'TODOS' | Estado>('TODOS');

  async function cargar() {
    const p = await api<any[]>('/pedidos');
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

  const filtrados = pedidos.filter((p) => filtro === 'TODOS' || p.estado === filtro);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Pedidos</h1>

      <div className="flex flex-wrap gap-2">
        {(['TODOS', ...ESTADOS] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-2xl font-semibold text-sm transition ${
              filtro === f
                ? 'bg-amasa-500 text-white shadow-suave'
                : 'bg-white text-amasa-800 border-2 border-amasa-100 hover:border-amasa-300'
            }`}
          >
            {f === 'TODOS' ? 'Todos' : labelEstado(f as Estado)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtrados.map((p) => (
          <div key={p.id} className="card">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl font-extrabold">#{p.id}</span>
                  <EstadoChip estado={p.estado} />
                </div>
                <p className="font-semibold">{p.cliente.nombre}</p>
                <p className="text-sm text-amasa-700">
                  {p.cliente.telefono} · {p.cliente.direccion || 'Sin dirección'}
                </p>
                <p className="text-sm text-amasa-700 flex items-center gap-1 mt-1">
                  <Clock size={14} /> Entrega: {p.horaEntrega} ·{' '}
                  {new Date(p.fecha).toLocaleDateString('es-EC')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={p.estado}
                  onChange={(e) => cambiarEstado(p.id, e.target.value as Estado)}
                  className="rounded-2xl border-2 border-amasa-100 bg-white px-3 py-2 font-semibold text-sm"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{labelEstado(e)}</option>
                  ))}
                </select>
                <Link to={`/admin/pedidos/${p.id}/nota`} className="btn-secondary !py-2 !px-4 text-sm">
                  <Receipt size={16} /> Nota de venta
                </Link>
              </div>
            </div>

            <div className="bg-amasa-50 rounded-2xl p-4 divide-y divide-amasa-100">
              {p.items.map((it: any) => (
                <div key={it.id} className="py-2 flex justify-between text-sm">
                  <span className="font-semibold">
                    {it.cantidad}× {it.producto.nombre}
                  </span>
                  <span>{formatoUSD(it.cantidad * it.precioUnitario)}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between font-extrabold">
                <span>Total</span>
                <span className="text-amasa-600">{formatoUSD(p.total)}</span>
              </div>
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="text-amasa-700 text-center py-8">Sin pedidos en este filtro.</p>
        )}
      </div>
    </div>
  );
}
