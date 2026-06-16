import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Handshake, MessageCircle, Store } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';

export default function Confirmacion() {
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    api(`/pedidos/${id}`).then(setPedido).catch(() => {});
  }, [id]);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="card text-center py-10 space-y-3">
        <CheckCircle2 className="mx-auto text-green-500" size={72} />
        <h1 className="text-3xl font-extrabold text-amasa-900">¡Pedido enviado!</h1>
        <p className="text-amasa-700">Tu proveedor ya recibió la solicitud.</p>
      </div>

      {pedido && (
        <div className="card space-y-3">
          <div>
            <p className="text-xs text-amasa-600">Pedido #{pedido.id}</p>
            <p className="font-bold text-amasa-900 flex items-center gap-1">
              <Store size={14} /> {pedido.proveedor?.nombreNegocio || pedido.proveedor?.nombre}
            </p>
            <p className="text-sm text-amasa-700">Entrega: {pedido.horaEntrega}</p>
          </div>

          {pedido.negociacion && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-amber-900 text-sm">
              <p className="font-bold flex items-center gap-1"><Handshake size={14} /> Negociación abierta</p>
              <p>El proveedor revisará tu solicitud y te responderá pronto.</p>
            </div>
          )}

          <div className="flex justify-between text-sm border-t border-amasa-100 pt-3">
            <span className="text-amasa-700">Subtotal</span>
            <span className="font-semibold">{formatoUSD(pedido.subtotal || pedido.total)}</span>
          </div>
          <div className="flex justify-between font-extrabold">
            <span>Total</span>
            <span className="text-amasa-600">{formatoUSD(pedido.total)}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/mis-pedidos" className="btn-primary w-full justify-center">
          <ShoppingBag size={16} /> Mis pedidos
        </Link>
        {pedido?.proveedor?.id && (
          <Link
            to={`/chat/${pedido.proveedor.id}`}
            className="px-4 py-3 rounded-2xl bg-white border border-amasa-200 text-amasa-800 font-semibold flex items-center justify-center gap-1"
          >
            <MessageCircle size={16} /> Chat
          </Link>
        )}
      </div>
    </div>
  );
}
