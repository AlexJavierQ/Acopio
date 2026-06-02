import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import EstadoChip from '../../components/EstadoChip';

export default function Confirmacion() {
  const { id } = useParams();
  const [pedido, setPedido] = useState<any>(null);

  useEffect(() => {
    if (id) api(`/pedidos/${id}`).then(setPedido).catch(() => {});
  }, [id]);

  if (!pedido) return <p className="text-amasa-700">Cargando…</p>;

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center">
      <div className="card">
        <CheckCircle2 className="mx-auto text-green-500 mb-4" size={72} />
        <h1 className="text-3xl font-extrabold mb-1">¡Pedido enviado!</h1>
        <p className="text-amasa-700 mb-6">
          La panadería ya lo recibió. Te avisaremos cuando esté listo.
        </p>

        <div className="text-left bg-amasa-50 rounded-2xl p-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-amasa-700">Número de pedido</span>
            <span className="font-bold">#{pedido.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-amasa-700 flex items-center gap-1">
              <Clock size={14} /> Hora de entrega
            </span>
            <span className="font-bold">{pedido.horaEntrega}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-amasa-700">Estado</span>
            <EstadoChip estado={pedido.estado} />
          </div>
        </div>

        <div className="text-left divide-y divide-amasa-100 mb-4">
          {pedido.items.map((it: any) => (
            <div key={it.id} className="py-2 flex justify-between">
              <span>
                {it.cantidad}× {it.producto.nombre}
              </span>
              <span className="font-semibold">
                {formatoUSD(it.cantidad * it.precioUnitario)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-lg font-extrabold">
          <span>Total</span>
          <span className="text-amasa-600">{formatoUSD(pedido.total)}</span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link to="/catalogo" className="btn-secondary">Seguir comprando</Link>
        <Link to="/mis-pedidos" className="btn-primary">Ver mis pedidos</Link>
      </div>
    </div>
  );
}
