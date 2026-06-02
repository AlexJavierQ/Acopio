import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { api } from '../../lib/api';

interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string | null;
  _count: { pedidos: number };
}

export default function Clientes() {
  const [q, setQ] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);

  async function buscar() {
    const r = await api<Cliente[]>(`/clientes?q=${encodeURIComponent(q)}`);
    setClientes(r);
  }

  useEffect(() => {
    const t = setTimeout(buscar, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Clientes</h1>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amasa-400" size={20} />
        <input
          className="input pl-12"
          placeholder="Buscar por nombre o teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((c) => (
          <Link
            key={c.id}
            to={`/admin/clientes/${c.id}`}
            className="card !p-5 hover:shadow-media transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amasa-100 text-amasa-700 grid place-items-center font-extrabold text-lg">
                {c.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold leading-tight">{c.nombre}</p>
                <p className="text-xs text-amasa-600 flex items-center gap-1">
                  <Phone size={12} /> {c.telefono}
                </p>
              </div>
            </div>
            {c.direccion && (
              <p className="text-xs text-amasa-700 flex items-center gap-1 mb-2">
                <MapPin size={12} /> {c.direccion}
              </p>
            )}
            <p className="text-sm text-amasa-700 flex items-center gap-1">
              <ShoppingBag size={14} /> {c._count.pedidos} pedidos
            </p>
          </Link>
        ))}
        {clientes.length === 0 && (
          <p className="text-amasa-700 col-span-full text-center py-8">Sin resultados.</p>
        )}
      </div>
    </div>
  );
}
