import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Package, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface ProveedorPublico {
  id: number;
  nombre: string;
  nombreNegocio: string | null;
  descripcion: string | null;
  fotoUrl: string | null;
  direccion: string | null;
  totalAfiliados: number;
  totalProductos: number;
  miAfiliacion: { estado: string } | null;
}

export default function Proveedores() {
  const [items, setItems] = useState<ProveedorPublico[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  async function cargar(buscar = '') {
    setLoading(true);
    try {
      const data = await api<ProveedorPublico[]>(`/proveedores${buscar ? `?q=${encodeURIComponent(buscar)}` : ''}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold text-amasa-900">Descubre proveedores</h1>
        <p className="text-amasa-700">
          Encuentra mayoristas en Loja, solicita afiliación y empieza a hacer pedidos.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); cargar(q); }}
          className="relative max-w-xl"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amasa-500" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o tipo de negocio..."
            className="input-glass w-full pl-11 pr-4 py-3"
          />
        </form>
      </header>

      {loading ? (
        <p className="text-amasa-600">Cargando...</p>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-amasa-700">No hay proveedores con esa búsqueda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link
              key={p.id}
              to={`/proveedores/${p.id}`}
              className="card group hover:shadow-lg transition active:scale-[0.99]"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-20 h-20 rounded-2xl bg-amasa-100 bg-cover bg-center shrink-0 border border-white/60"
                  style={p.fotoUrl ? { backgroundImage: `url(${p.fotoUrl})` } : {}}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-amasa-900 truncate">{p.nombreNegocio || p.nombre}</h3>
                  <p className="text-xs text-amasa-600 truncate">{p.nombre}</p>
                  {p.miAfiliacion && <BadgeAfiliacion estado={p.miAfiliacion.estado} />}
                </div>
              </div>
              {p.descripcion && (
                <p className="text-sm text-amasa-700 mt-3 line-clamp-2">{p.descripcion}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-amasa-600">
                {p.direccion && (
                  <span className="flex items-center gap-1"><MapPin size={12} />{p.direccion.split(',')[0]}</span>
                )}
                <span className="flex items-center gap-1"><Package size={12} />{p.totalProductos} productos</span>
                <span className="flex items-center gap-1"><Users size={12} />{p.totalAfiliados} clientes</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function BadgeAfiliacion({ estado }: { estado: string }) {
  const config = {
    APROBADA: { icon: CheckCircle, text: 'Afiliado', cls: 'bg-green-100 text-green-700' },
    PENDIENTE: { icon: Clock, text: 'Solicitud pendiente', cls: 'bg-amber-100 text-amber-700' },
    RECHAZADA: { icon: XCircle, text: 'Rechazada', cls: 'bg-red-100 text-red-700' },
  }[estado] || { icon: Clock, text: estado, cls: 'bg-gray-100 text-gray-700' };
  const Icon = config.icon;
  return (
    <span className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.cls}`}>
      <Icon size={10} />
      {config.text}
    </span>
  );
}
