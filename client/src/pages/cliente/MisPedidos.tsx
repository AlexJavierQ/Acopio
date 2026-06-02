import { useEffect, useState } from 'react';
import { Clock, ShoppingBag } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import EstadoChip from '../../components/EstadoChip';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<any[]>('/pedidos')
      .then(setPedidos)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-amasa-700">Cargando…</p>;

  if (pedidos.length === 0) {
    return (
      <div className="card text-center py-16">
        <ShoppingBag className="mx-auto text-amasa-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">Aún no tienes pedidos</h2>
        <p className="text-amasa-700">¡Haz tu primer pedido desde el catálogo!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Mis pedidos</h1>

      {pedidos.map((p) => (
        <div key={p.id} className="card !p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-amasa-600">Pedido #{p.id}</p>
              <p className="text-sm text-amasa-700 flex items-center gap-1">
                <Clock size={14} /> Entrega: {p.horaEntrega}
              </p>
            </div>
            <EstadoChip estado={p.estado} />
          </div>
          <div className="space-y-1 text-sm">
            {p.items.map((it: any) => (
              <div key={it.id} className="flex justify-between text-amasa-800">
                <span>
                  {it.cantidad}× {it.producto.nombre}
                </span>
                <span>{formatoUSD(it.cantidad * it.precioUnitario)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-amasa-100 mt-3 pt-3 flex justify-between font-extrabold">
            <span>Total</span>
            <span className="text-amasa-600">{formatoUSD(p.total)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
