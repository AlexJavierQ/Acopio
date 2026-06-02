import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Clock, Send, ShoppingBasket } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import { useCarrito } from '../../store/carrito';

export default function HacerPedido() {
  const carrito = useCarrito();
  const items = Object.values(carrito.items);
  const [horaEntrega, setHoraEntrega] = useState('07:30');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function enviar() {
    setError('');
    setEnviando(true);
    try {
      const pedido = await api<any>('/pedidos', {
        method: 'POST',
        body: JSON.stringify({
          horaEntrega,
          items: items.map((it) => ({ productoId: it.producto.id, cantidad: it.cantidad })),
        }),
      });
      carrito.vaciar();
      navigate(`/confirmacion/${pedido.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="card text-center py-16">
        <ShoppingBasket className="mx-auto text-amasa-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">Tu pedido está vacío</h2>
        <p className="text-amasa-700 mb-6">Vuelve al catálogo y elige tus favoritos.</p>
        <Link to="/catalogo" className="btn-primary inline-flex">Ir al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Tu pedido</h1>

      <div className="card !p-3 divide-y divide-amasa-100">
        {items.map(({ producto, cantidad }) => (
          <div key={producto.id} className="flex items-center gap-3 py-3">
            <img src={producto.imagenUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{producto.nombre}</p>
              <p className="text-sm text-amasa-600">{formatoUSD(producto.precio)} c/u</p>
            </div>
            <div className="flex items-center gap-1 bg-amasa-50 rounded-2xl p-1">
              <button
                onClick={() => carrito.setCantidad(producto.id, cantidad - 1)}
                className="w-8 h-8 grid place-items-center rounded-xl hover:bg-amasa-100 text-amasa-700"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold">{cantidad}</span>
              <button
                onClick={() => carrito.setCantidad(producto.id, cantidad + 1)}
                className="w-8 h-8 grid place-items-center rounded-xl hover:bg-amasa-100 text-amasa-700"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => carrito.quitar(producto.id)}
              className="p-2 rounded-xl hover:bg-red-50 text-red-500"
              title="Quitar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="card space-y-4">
        <label className="label flex items-center gap-2">
          <Clock size={18} /> Hora de entrega
        </label>
        <input
          type="time"
          className="input"
          value={horaEntrega}
          onChange={(e) => setHoraEntrega(e.target.value)}
        />

        <div className="flex items-center justify-between border-t border-amasa-100 pt-4">
          <span className="text-amasa-700">Total a pagar</span>
          <span className="text-2xl font-extrabold text-amasa-600">
            {formatoUSD(carrito.total())}
          </span>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
        )}

        <button onClick={enviar} disabled={enviando} className="btn-primary w-full">
          <Send size={18} />
          {enviando ? 'Enviando…' : 'Enviar pedido'}
        </button>
      </div>
    </div>
  );
}
