import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Repeat, ShoppingCart } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import { useCarrito, ProductoMin } from '../../store/carrito';

interface Producto extends ProductoMin {
  descripcion: string;
}

export default function Catalogo() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const carrito = useCarrito();

  useEffect(() => {
    api<Producto[]>('/productos')
      .then(setProductos)
      .finally(() => setLoading(false));
  }, []);

  async function repetirHabitual() {
    try {
      const ultimo = await api<any>('/pedidos/cliente/habitual');
      if (!ultimo) {
        setMensaje('Aún no tienes pedidos previos.');
        return;
      }
      carrito.cargar(
        ultimo.items.map((it: any) => ({
          producto: {
            id: it.producto.id,
            nombre: it.producto.nombre,
            precio: it.producto.precio,
            imagenUrl: it.producto.imagenUrl,
          },
          cantidad: it.cantidad,
        }))
      );
      setMensaje('Listo, agregamos tu pedido habitual al carrito.');
    } catch (e: any) {
      setMensaje(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Nuestro horneado del día</h1>
          <p className="text-amasa-700">
            Elige lo que más te gusta y arma tu pedido en segundos.
          </p>
        </div>
        <button onClick={repetirHabitual} className="btn-secondary">
          <Repeat size={18} />
          Repetir mi pedido habitual
        </button>
      </div>

      {mensaje && (
        <div className="rounded-2xl bg-amasa-50 border border-amasa-100 px-4 py-3 text-amasa-900">
          {mensaje}
        </div>
      )}

      {loading ? (
        <p className="text-amasa-700">Cargando...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map((p) => {
            const enCarrito = carrito.items[p.id]?.cantidad || 0;
            return (
              <div key={p.id} className="card !p-3 hover:shadow-media transition-shadow">
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-amasa-100 mb-3">
                  <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-amasa-900 leading-tight">{p.nombre}</h3>
                <p className="text-xs text-amasa-700 line-clamp-2 mb-2">{p.descripcion}</p>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amasa-600">{formatoUSD(p.precio)}</span>
                  <button
                    onClick={() => carrito.agregar(p)}
                    className="bg-amasa-500 text-white rounded-xl px-3 py-2 hover:bg-amasa-600 transition flex items-center gap-1"
                  >
                    <Plus size={16} />
                    {enCarrito > 0 ? enCarrito : 'Agregar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {carrito.cantidadTotal() > 0 && (
        <Link
          to="/pedido"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 btn-primary shadow-media"
        >
          <ShoppingCart size={18} />
          Ver mi pedido ({carrito.cantidadTotal()}) · {formatoUSD(carrito.total())}
        </Link>
      )}
    </div>
  );
}
