import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, MessageCircle, Plus, Minus, ShoppingCart, Send } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import { useCarrito, ProductoMin } from '../../store/carrito';

interface Detalle {
  id: number;
  nombre: string;
  nombreNegocio: string | null;
  descripcion: string | null;
  fotoUrl: string | null;
  direccion: string | null;
  productos: (ProductoMin & { descripcion: string; activo: boolean })[];
  miAfiliacion: { id: number; estado: string; mensaje?: string | null } | null;
}

export default function ProveedorDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Detalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const carrito = useCarrito();

  async function cargar() {
    setLoading(true);
    try {
      const d = await api<Detalle>(`/proveedores/${id}`);
      setData(d);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, [id]);

  // Asegurar que el carrito esté sincronizado con este proveedor
  useEffect(() => {
    if (data) carrito.setProveedor(data.id, data.nombreNegocio || data.nombre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  async function solicitar() {
    if (!data) return;
    setEnviando(true);
    try {
      await api('/afiliaciones', {
        method: 'POST',
        body: JSON.stringify({ proveedorId: data.id, mensaje: mensaje || undefined }),
      });
      setMensaje('');
      await cargar();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (loading || !data) return <p className="text-amasa-600">Cargando...</p>;

  const afi = data.miAfiliacion;
  const aprobado = afi?.estado === 'APROBADA';

  return (
    <div className="space-y-6">
      <Link to="/proveedores" className="inline-flex items-center gap-2 text-amasa-700 hover:text-amasa-900 font-semibold">
        <ArrowLeft size={18} /> Volver
      </Link>

      {/* Hero del proveedor */}
      <div className="card bg-gradient-to-br from-amasa-100 to-amasa-50">
        <div className="flex items-start gap-4">
          <div
            className="w-24 h-24 rounded-2xl bg-amasa-200 bg-cover bg-center shrink-0 border-2 border-white shadow-suave"
            style={data.fotoUrl ? { backgroundImage: `url(${data.fotoUrl})` } : {}}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-amasa-900">{data.nombreNegocio || data.nombre}</h1>
            <p className="text-sm text-amasa-700">{data.nombre}</p>
            {data.direccion && (
              <p className="flex items-center gap-1 text-xs text-amasa-600 mt-1"><MapPin size={12} />{data.direccion}</p>
            )}
            {data.descripcion && <p className="text-sm text-amasa-800 mt-3">{data.descripcion}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/chat/${data.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-white border border-amasa-200 text-amasa-800 text-sm font-semibold transition"
          >
            <MessageCircle size={16} /> Chatear
          </Link>
        </div>
      </div>

      {/* Estado de afiliación */}
      {!afi && (
        <div className="card border-2 border-dashed border-amasa-300">
          <h3 className="font-bold text-amasa-900 mb-2">Solicita afiliación para hacer pedidos</h3>
          <p className="text-sm text-amasa-700 mb-3">
            El proveedor debe aprobarte. Cuéntale brevemente sobre tu negocio.
          </p>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Hola, somos [tu negocio], queremos empezar a hacer pedidos mayoristas..."
            rows={3}
            className="input-glass w-full px-3 py-2 text-sm mb-3"
          />
          <button
            onClick={solicitar}
            disabled={enviando}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-amasa-500 to-amasa-600 text-white font-semibold shadow-lg disabled:opacity-50"
          >
            <Send size={16} /> {enviando ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      )}
      {afi?.estado === 'PENDIENTE' && (
        <div className="card bg-amber-50 border border-amber-200">
          <p className="text-amber-800 font-semibold">⏳ Tu solicitud está pendiente de aprobación.</p>
          {afi.mensaje && <p className="text-amber-700 text-sm mt-1">"{afi.mensaje}"</p>}
        </div>
      )}
      {afi?.estado === 'RECHAZADA' && (
        <div className="card bg-red-50 border border-red-200 space-y-3">
          <p className="text-red-800 font-semibold">Tu solicitud fue rechazada.</p>
          <button
            onClick={solicitar}
            disabled={enviando}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold"
          >
            Volver a solicitar
          </button>
        </div>
      )}

      {/* Catálogo */}
      <section>
        <h2 className="text-xl font-bold text-amasa-900 mb-3">Catálogo</h2>
        {data.productos.length === 0 ? (
          <p className="text-amasa-600">Este proveedor aún no publicó productos.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.productos.map((p) => (
              <ProductoCard key={p.id} producto={p} aprobado={aprobado} />
            ))}
          </div>
        )}
      </section>

      {/* Botón flotante "Ir al carrito" */}
      {aprobado && carrito.cantidadTotal() > 0 && (
        <Link
          to={`/proveedores/${data.id}/pedido`}
          className="fixed bottom-24 right-4 z-30 px-5 py-3 rounded-full bg-gradient-to-br from-amasa-500 to-amasa-600 text-white font-bold shadow-2xl flex items-center gap-2 active:scale-95"
        >
          <ShoppingCart size={18} /> {carrito.cantidadTotal()} · {formatoUSD(carrito.total())}
        </Link>
      )}
    </div>
  );
}

function ProductoCard({
  producto,
  aprobado,
}: {
  producto: ProductoMin & { descripcion: string };
  aprobado: boolean;
}) {
  const items = useCarrito((s) => s.items);
  const agregar = useCarrito((s) => s.agregar);
  const setCantidad = useCarrito((s) => s.setCantidad);
  const cant = items[producto.id]?.cantidad || 0;

  return (
    <div className="card overflow-hidden p-0">
      <div className="aspect-video bg-amasa-100 bg-cover bg-center" style={{ backgroundImage: `url(${producto.imagenUrl})` }} />
      <div className="p-3">
        <h3 className="font-bold text-amasa-900 text-sm">{producto.nombre}</h3>
        <p className="text-xs text-amasa-600 line-clamp-2">{producto.descripcion}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-amasa-700">{formatoUSD(producto.precio)}</span>
          {!aprobado ? (
            <span className="text-[10px] text-amasa-500 italic">Necesitas aprobación</span>
          ) : cant === 0 ? (
            <button
              onClick={() => agregar(producto)}
              className="px-3 py-1.5 rounded-xl bg-amasa-500 hover:bg-amasa-600 text-white text-xs font-bold transition"
            >
              + Agregar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setCantidad(producto.id, cant - 1)} className="w-7 h-7 rounded-lg bg-amasa-100 grid place-items-center"><Minus size={14} /></button>
              <span className="font-bold w-6 text-center">{cant}</span>
              <button onClick={() => setCantidad(producto.id, cant + 1)} className="w-7 h-7 rounded-lg bg-amasa-500 text-white grid place-items-center"><Plus size={14} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
