import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShoppingBag, Store, Handshake, Gift, MessageCircle, Ban } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import EstadoChip, { Estado } from '../../components/EstadoChip';

interface Pedido {
  id: number;
  fecha: string;
  horaEntrega: string;
  estado: string;
  subtotal: number;
  descuento: number;
  total: number;
  proveedor: { id: number; nombre: string; nombreNegocio: string | null; fotoUrl: string | null };
  items: { id: number; cantidad: number; precioUnitario: number; esBono: boolean; producto: { id: number; nombre: string; imagenUrl: string } }[];
  negociacion: null | {
    id: number; estado: string; tipo: string | null; valor: number | null; notaProveedor: string | null;
    bonos: { id: number; cantidad: number; producto: { nombre: string } }[];
  };
}

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState<number | null>(null);

  function cargar() {
    api<Pedido[]>('/pedidos')
      .then(setPedidos)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cancelar(id: number) {
    if (!confirm('¿Cancelar este pedido? No se puede deshacer.')) return;
    setCancelando(id);
    try {
      await api(`/pedidos/${id}/cancelar`, { method: 'PATCH' });
      cargar();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCancelando(null);
    }
  }

  if (loading) return <p className="text-amasa-700">Cargando…</p>;

  if (pedidos.length === 0) {
    return (
      <div className="card text-center py-16">
        <ShoppingBag className="mx-auto text-amasa-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">Aún no tienes pedidos</h2>
        <p className="text-amasa-700 mb-6">Descubre proveedores y haz tu primer pedido.</p>
        <Link to="/proveedores" className="btn-primary inline-flex">Ver proveedores</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Mis pedidos</h1>

      {pedidos.map((p) => {
        const productos = p.items.filter((i) => !i.esBono);
        const bonos = p.items.filter((i) => i.esBono);
        return (
          <div key={p.id} className="card !p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-amasa-600">Pedido #{p.id} · {new Date(p.fecha).toLocaleDateString('es-EC')}</p>
                <Link to={`/proveedores/${p.proveedor.id}`} className="font-bold text-amasa-900 flex items-center gap-1 hover:underline truncate">
                  <Store size={14} /> {p.proveedor.nombreNegocio || p.proveedor.nombre}
                </Link>
                <p className="text-sm text-amasa-700 flex items-center gap-1">
                  <Clock size={14} /> Entrega: {p.horaEntrega}
                </p>
              </div>
              <EstadoChip estado={p.estado as Estado} />
            </div>

            <div className="space-y-1 text-sm">
              {productos.map((it) => (
                <div key={it.id} className="flex justify-between text-amasa-800">
                  <span>{it.cantidad}× {it.producto.nombre}</span>
                  <span>{formatoUSD(it.cantidad * it.precioUnitario)}</span>
                </div>
              ))}
              {bonos.length > 0 && (
                <div className="mt-2 p-2 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900">
                  <p className="font-bold flex items-center gap-1 mb-1"><Gift size={12} /> Bonos incluidos</p>
                  {bonos.map((b) => (
                    <div key={b.id}>+ {b.cantidad}× {b.producto.nombre}</div>
                  ))}
                </div>
              )}
            </div>

            {p.negociacion && (
              <div className={`text-xs rounded-xl px-3 py-2 ${
                p.negociacion.estado === 'ACEPTADA' ? 'bg-green-50 text-green-900 border border-green-200'
                : p.negociacion.estado === 'RECHAZADA' ? 'bg-red-50 text-red-900 border border-red-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                <p className="font-bold flex items-center gap-1"><Handshake size={12} />
                  {p.negociacion.estado === 'SOLICITADA' && 'Negociación pendiente'}
                  {p.negociacion.estado === 'ACEPTADA' && 'Negociación aceptada'}
                  {p.negociacion.estado === 'RECHAZADA' && 'Negociación rechazada'}
                </p>
                {p.negociacion.notaProveedor && <p className="italic mt-1">"{p.negociacion.notaProveedor}"</p>}
              </div>
            )}

            <div className="border-t border-amasa-100 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-amasa-700">
                <span>Subtotal</span>
                <span>{formatoUSD(p.subtotal)}</span>
              </div>
              {p.descuento > 0 && (
                <div className="flex justify-between text-sm text-green-700 font-semibold">
                  <span>Descuento</span>
                  <span>- {formatoUSD(p.descuento)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold">
                <span>Total</span>
                <span className="text-amasa-600">{formatoUSD(p.total)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Link
                to={`/chat/${p.proveedor.id}`}
                className="text-xs text-amasa-700 hover:text-amasa-900 inline-flex items-center gap-1 font-semibold"
              >
                <MessageCircle size={12} /> Chatear con el proveedor
              </Link>
              {p.estado === 'RECIBIDO' && (
                <button
                  onClick={() => cancelar(p.id)}
                  disabled={cancelando === p.id}
                  className="text-xs inline-flex items-center gap-1 font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Ban size={13} /> {cancelando === p.id ? 'Cancelando…' : 'Cancelar pedido'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
