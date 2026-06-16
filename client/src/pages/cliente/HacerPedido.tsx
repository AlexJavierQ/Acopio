import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus, Trash2, Clock, Send, ShoppingBasket, Handshake, ArrowLeft, Store } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import { useCarrito } from '../../store/carrito';

interface ProveedorInfo {
  id: number;
  nombre: string;
  nombreNegocio: string | null;
  fotoUrl: string | null;
  afiliacion: { id: number; estado: string } | null;
}

export default function HacerPedido() {
  const { id } = useParams<{ id: string }>();
  const proveedorId = id ? Number(id) : null;
  const carrito = useCarrito();
  const items = Object.values(carrito.items);
  const [horaEntrega, setHoraEntrega] = useState('07:30');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [pedirDescuento, setPedirDescuento] = useState(false);
  const [mensajeNegociacion, setMensajeNegociacion] = useState('');
  const [proveedor, setProveedor] = useState<ProveedorInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!proveedorId) return;
    api<ProveedorInfo>(`/proveedores/${proveedorId}`).then(setProveedor).catch(() => {});
  }, [proveedorId]);

  const carritoEsDeOtro = carrito.proveedorId !== null && carrito.proveedorId !== proveedorId;

  async function enviar() {
    if (!proveedorId) return;
    setError('');
    setEnviando(true);
    try {
      const pedido = await api<any>('/pedidos', {
        method: 'POST',
        body: JSON.stringify({
          proveedorId,
          horaEntrega,
          items: items.map((it) => ({ productoId: it.producto.id, cantidad: it.cantidad })),
          solicitarNegociacion: pedirDescuento,
          mensajeNegociacion: pedirDescuento ? mensajeNegociacion : undefined,
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

  if (!proveedorId) {
    return <Navigate to="/proveedores" />;
  }

  // Si no hay afiliación aprobada, no se puede pedir
  const afiliado = proveedor?.afiliacion?.estado === 'APROBADA';

  if (proveedor && !afiliado) {
    return (
      <div className="card text-center py-12 space-y-3">
        <Handshake className="mx-auto text-amasa-300" size={56} />
        <h2 className="text-xl font-bold text-amasa-900">Necesitas afiliarte primero</h2>
        <p className="text-amasa-700">Para hacer pedidos a {proveedor.nombreNegocio || proveedor.nombre} debes ser un afiliado aprobado.</p>
        <Link to={`/proveedores/${proveedorId}`} className="btn-primary inline-flex">
          <ArrowLeft size={16} /> Ir al perfil del proveedor
        </Link>
      </div>
    );
  }

  if (carritoEsDeOtro) {
    return (
      <div className="card text-center py-12 space-y-3">
        <ShoppingBasket className="mx-auto text-amasa-300" size={56} />
        <h2 className="text-xl font-bold text-amasa-900">Tienes un carrito con otro proveedor</h2>
        <p className="text-amasa-700">{carrito.proveedorNombre}</p>
        <div className="flex gap-2 justify-center">
          <button onClick={() => carrito.vaciar()} className="px-4 py-2 rounded-xl border border-red-300 text-red-700 font-semibold">
            Vaciar carrito
          </button>
          <Link to={`/proveedores/${carrito.proveedorId}`} className="btn-primary inline-flex">
            Ver ese carrito
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card text-center py-16">
        <ShoppingBasket className="mx-auto text-amasa-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">Tu pedido está vacío</h2>
        <p className="text-amasa-700 mb-6">Vuelve al catálogo y elige tus productos.</p>
        <Link to={`/proveedores/${proveedorId}`} className="btn-primary inline-flex">
          <ArrowLeft size={16} /> Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Link to={`/proveedores/${proveedorId}`} className="p-2 rounded-xl bg-white text-amasa-700 hover:bg-white">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amasa-900">Tu pedido</h1>
          {proveedor && (
            <p className="text-sm text-amasa-700 flex items-center gap-1 truncate">
              <Store size={14} /> {proveedor.nombreNegocio || proveedor.nombre}
            </p>
          )}
        </div>
      </header>

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
        <div>
          <label className="label flex items-center gap-2">
            <Clock size={18} /> Hora / fecha de entrega
          </label>
          <input
            type="time"
            className="input"
            value={horaEntrega}
            onChange={(e) => setHoraEntrega(e.target.value)}
          />
        </div>

        <div className="rounded-2xl border-2 border-dashed border-amasa-200 p-3 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={pedirDescuento}
              onChange={(e) => setPedirDescuento(e.target.checked)}
              className="mt-1 w-5 h-5 accent-amasa-500"
            />
            <span>
              <span className="font-bold text-amasa-900 flex items-center gap-1">
                <Handshake size={16} /> Solicitar descuento o bono
              </span>
              <span className="text-sm text-amasa-700 block">
                Tu proveedor revisará el pedido y podrá ofrecerte un % menos, monto fijo o productos extra.
              </span>
            </span>
          </label>
          {pedirDescuento && (
            <textarea
              value={mensajeNegociacion}
              onChange={(e) => setMensajeNegociacion(e.target.value)}
              placeholder="Mensaje para el proveedor (opcional, ej. 'volumen recurrente, ¿algo de descuento?')"
              rows={2}
              className="input-glass w-full px-3 py-2 text-sm"
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-amasa-100 pt-4">
          <span className="text-amasa-700">Subtotal</span>
          <span className="text-2xl font-extrabold text-amasa-600">
            {formatoUSD(carrito.total())}
          </span>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
        )}

        <button onClick={enviar} disabled={enviando} className="btn-primary w-full">
          <Send size={18} />
          {enviando ? 'Enviando…' : pedirDescuento ? 'Enviar pedido y abrir negociación' : 'Enviar pedido'}
        </button>
      </div>
    </div>
  );
}

function Navigate({ to }: { to: string }) {
  const nav = useNavigate();
  useEffect(() => { nav(to, { replace: true }); }, [nav, to]);
  return null;
}
