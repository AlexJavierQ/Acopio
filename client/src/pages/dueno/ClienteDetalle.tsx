import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Clock } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import EstadoChip from '../../components/EstadoChip';

export default function ClienteDetalle() {
  const { id } = useParams();
  const [cliente, setCliente] = useState<any>(null);

  useEffect(() => {
    if (id) api(`/clientes/${id}`).then(setCliente);
  }, [id]);

  if (!cliente) return <p className="text-amasa-700">Cargando…</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/admin/clientes" className="btn-ghost">
        <ArrowLeft size={18} /> Clientes
      </Link>

      <div className="card flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-20 h-20 rounded-2xl bg-amasa-500 text-white grid place-items-center text-3xl font-extrabold">
          {cliente.nombre.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">{cliente.nombre}</h1>
          <p className="text-amasa-700 flex items-center gap-2">
            <Phone size={16} /> {cliente.telefono}
          </p>
          {cliente.direccion && (
            <p className="text-amasa-700 flex items-center gap-2">
              <MapPin size={16} /> {cliente.direccion}
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">Historial de pedidos ({cliente.pedidos.length})</h2>
        {cliente.pedidos.length === 0 ? (
          <p className="text-amasa-700">Aún no tiene pedidos.</p>
        ) : (
          <div className="space-y-3">
            {cliente.pedidos.map((p: any) => (
              <div key={p.id} className="card !p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold">#{p.id}</p>
                    <p className="text-xs text-amasa-700 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(p.fecha).toLocaleDateString('es-EC')} · Entrega {p.horaEntrega}
                    </p>
                  </div>
                  <EstadoChip estado={p.estado} />
                </div>
                <div className="text-sm text-amasa-800 space-y-0.5">
                  {p.items.map((it: any) => (
                    <div key={it.id} className="flex justify-between">
                      <span>{it.cantidad}× {it.producto.nombre}</span>
                      <span>{formatoUSD(it.cantidad * it.precioUnitario)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-amasa-100 mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-amasa-600">{formatoUSD(p.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
