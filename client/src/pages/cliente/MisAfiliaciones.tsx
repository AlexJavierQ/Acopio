import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, Store } from 'lucide-react';
import { api } from '../../lib/api';

interface Afiliacion {
  id: number;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  origen: 'SOLICITUD' | 'MANUAL';
  mensaje: string | null;
  creadoEn: string;
  resueltoEn: string | null;
  proveedor: {
    id: number;
    nombre: string;
    nombreNegocio: string | null;
    descripcion: string | null;
    fotoUrl: string | null;
  };
}

export default function MisAfiliaciones() {
  const [items, setItems] = useState<Afiliacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Afiliacion[]>('/afiliaciones').then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-amasa-600">Cargando...</p>;

  const aprobadas = items.filter((i) => i.estado === 'APROBADA');
  const pendientes = items.filter((i) => i.estado === 'PENDIENTE');
  const rechazadas = items.filter((i) => i.estado === 'RECHAZADA');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-amasa-900">Mis afiliaciones</h1>
        <p className="text-amasa-700">Tus solicitudes y proveedores aprobados.</p>
      </header>

      {items.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <p className="text-amasa-700">No has solicitado afiliación a ningún proveedor.</p>
          <Link to="/proveedores" className="inline-block px-4 py-2 rounded-xl bg-amasa-500 text-white font-semibold">
            Ver proveedores
          </Link>
        </div>
      ) : (
        <>
          {pendientes.length > 0 && <Seccion titulo="Pendientes" items={pendientes} icono={Clock} color="amber" />}
          {aprobadas.length > 0 && <Seccion titulo="Aprobadas" items={aprobadas} icono={CheckCircle} color="green" />}
          {rechazadas.length > 0 && <Seccion titulo="Rechazadas" items={rechazadas} icono={XCircle} color="red" />}
        </>
      )}
    </div>
  );
}

function Seccion({
  titulo, items, icono: Icono, color,
}: {
  titulo: string;
  items: Afiliacion[];
  icono: any;
  color: 'amber' | 'green' | 'red';
}) {
  const colorMap = {
    amber: 'text-amber-600',
    green: 'text-green-600',
    red: 'text-red-600',
  };
  return (
    <section>
      <h2 className={`flex items-center gap-2 font-bold mb-3 ${colorMap[color]}`}>
        <Icono size={18} /> {titulo} ({items.length})
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((a) => (
          <Link
            key={a.id}
            to={`/proveedores/${a.proveedor.id}`}
            className="card flex items-center gap-3 hover:shadow-lg transition"
          >
            <div
              className="w-14 h-14 rounded-xl bg-amasa-100 bg-cover bg-center shrink-0 border border-white/60"
              style={a.proveedor.fotoUrl ? { backgroundImage: `url(${a.proveedor.fotoUrl})` } : {}}
            >
              {!a.proveedor.fotoUrl && <Store className="m-3 text-amasa-500" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-amasa-900 truncate">{a.proveedor.nombreNegocio || a.proveedor.nombre}</h3>
              {a.mensaje && <p className="text-xs text-amasa-600 italic line-clamp-2">"{a.mensaje}"</p>}
              <p className="text-[10px] text-amasa-500 mt-0.5">
                {a.origen === 'MANUAL' ? 'Te agregaron manualmente' : 'Solicitud enviada'} ·{' '}
                {new Date(a.creadoEn).toLocaleDateString('es-EC')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
