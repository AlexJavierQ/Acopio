import { useEffect, useState } from 'react';
import { Check, X, UserPlus, Users, Phone, MapPin, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface Afiliacion {
  id: number;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  origen: 'SOLICITUD' | 'MANUAL';
  mensaje: string | null;
  creadoEn: string;
  cliente: { id: number; nombre: string; telefono: string; direccion: string | null };
}

type Tab = 'PENDIENTE' | 'APROBADA';

export default function Afiliados() {
  const [tab, setTab] = useState<Tab>('PENDIENTE');
  const [items, setItems] = useState<Afiliacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [resolviendo, setResolviendo] = useState<number | null>(null);

  async function cargar() {
    setLoading(true);
    try {
      const data = await api<Afiliacion[]>(`/afiliaciones?estado=${tab}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, [tab]);

  async function resolver(id: number, estado: 'APROBADA' | 'RECHAZADA') {
    setResolviendo(id);
    try {
      await api(`/afiliaciones/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      await cargar();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setResolviendo(null);
    }
  }

  const pendientes = items.filter((i) => i.estado === 'PENDIENTE').length;
  const tabCls = (active: boolean) =>
    `flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-semibold transition ${
      active ? 'bg-amasa-500 text-white shadow-lg' : 'bg-white/60 text-amasa-800 hover:bg-white'
    }`;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-amasa-900">Afiliados</h1>
          <p className="text-amasa-700">Solicitudes de clientes y manejo de tu lista de afiliados.</p>
        </div>
        <button
          onClick={() => setAgregando(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-amasa-500 to-amasa-600 text-white font-semibold shadow-lg active:scale-[0.98]"
        >
          <UserPlus size={18} /> Agregar manualmente
        </button>
      </header>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTab('PENDIENTE')} className={tabCls(tab === 'PENDIENTE')}>
          Pendientes {tab === 'PENDIENTE' && pendientes > 0 ? `(${pendientes})` : ''}
        </button>
        <button onClick={() => setTab('APROBADA')} className={tabCls(tab === 'APROBADA')}>
          Aprobados
        </button>
      </div>

      {loading ? (
        <p className="text-amasa-600">Cargando...</p>
      ) : items.length === 0 ? (
        <div className="card text-center py-12 text-amasa-600">
          {tab === 'PENDIENTE' ? 'No tienes solicitudes pendientes 🙌' : 'Aún no tienes afiliados aprobados.'}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((a) => (
            <div key={a.id} className="card space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-amasa-100 grid place-items-center shrink-0">
                  <Users className="text-amasa-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-amasa-900 truncate">{a.cliente.nombre}</h3>
                  <p className="flex items-center gap-1 text-xs text-amasa-600"><Phone size={11} />{a.cliente.telefono}</p>
                  {a.cliente.direccion && (
                    <p className="flex items-center gap-1 text-xs text-amasa-600 truncate"><MapPin size={11} />{a.cliente.direccion}</p>
                  )}
                </div>
              </div>
              {a.mensaje && (
                <p className="text-sm text-amasa-700 italic bg-amasa-50/70 px-3 py-2 rounded-lg border border-amasa-100">
                  "{a.mensaje}"
                </p>
              )}
              {a.estado === 'PENDIENTE' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => resolver(a.id, 'APROBADA')}
                    disabled={resolviendo === a.id}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm disabled:opacity-60"
                  >
                    {resolviendo === a.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Aprobar
                  </button>
                  <button
                    onClick={() => resolver(a.id, 'RECHAZADA')}
                    disabled={resolviendo === a.id}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/70 hover:bg-white border border-red-300 text-red-700 font-semibold text-sm disabled:opacity-60"
                  >
                    <X size={14} /> Rechazar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to={`/admin/clientes/${a.cliente.id}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/70 hover:bg-white border border-amasa-200 text-amasa-800 text-sm font-semibold text-center"
                  >
                    Ver historial
                  </Link>
                  <Link
                    to={`/chat/${a.cliente.id}`}
                    className="px-3 py-2 rounded-xl bg-white/70 hover:bg-white border border-amasa-200 text-amasa-800"
                    title="Chat"
                  >
                    <MessageCircle size={16} />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {agregando && <ModalAgregar onClose={() => setAgregando(false)} onCreado={cargar} />}
    </div>
  );
}

function ModalAgregar({ onClose, onCreado }: { onClose: () => void; onCreado: () => void }) {
  const [form, setForm] = useState({ telefono: '', nombre: '', direccion: '', passwordTemporal: '' });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await api<{ creadoUsuario: boolean; cliente: { nombre: string } }>('/afiliaciones/manual', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setExito(
        res.creadoUsuario
          ? `✅ ${res.cliente.nombre} agregado. Se creó cuenta con clave temporal.`
          : `✅ ${res.cliente.nombre} ya existía y quedó afiliado.`,
      );
      onCreado();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-marron/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <header>
          <h3 className="text-xl font-bold text-amasa-900">Agregar cliente</h3>
          <p className="text-sm text-amasa-700">Si el teléfono no existe, le creamos cuenta con clave temporal.</p>
        </header>
        {exito ? (
          <div className="space-y-3">
            <p className="text-green-700 bg-green-50 p-3 rounded-xl text-sm">{exito}</p>
            <button onClick={onClose} className="w-full px-4 py-2 rounded-xl bg-amasa-500 text-white font-semibold">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              required
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="input-glass w-full px-3 py-2"
            />
            <input
              required
              placeholder="Teléfono (ej: 0999000099)"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="input-glass w-full px-3 py-2"
            />
            <input
              placeholder="Dirección / Negocio (opcional)"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="input-glass w-full px-3 py-2"
            />
            <input
              placeholder="Clave temporal (opcional, default: cliente123)"
              value={form.passwordTemporal}
              onChange={(e) => setForm({ ...form, passwordTemporal: e.target.value })}
              className="input-glass w-full px-3 py-2"
            />
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-amasa-200 text-amasa-800 font-semibold">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-br from-amasa-500 to-amasa-600 text-white font-semibold disabled:opacity-60"
              >
                {enviando ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
