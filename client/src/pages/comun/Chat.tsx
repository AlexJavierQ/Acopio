import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Store, User } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../store/auth';

interface OtroUsuario {
  id: number;
  nombre: string;
  telefono: string;
  rol: 'CLIENTE' | 'PROVEEDOR';
  nombreNegocio: string | null;
  fotoUrl: string | null;
}
interface Mensaje {
  id: number;
  remitenteId: number;
  destinatarioId: number;
  contenido: string;
  leido: boolean;
  creadoEn: string;
}
interface Conversacion {
  otroUsuario: OtroUsuario;
  ultimoMensaje: Mensaje;
  noLeidos: number;
}

const POLL_INTERVAL_MS = 3000;

export default function Chat() {
  const { otroId } = useParams<{ otroId?: string }>();
  const otroIdNum = otroId ? Number(otroId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amasa-50 via-crema to-amasa-100 p-4">
      <div className="max-w-5xl mx-auto h-[calc(100vh-2rem)] grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
        <ListaConversaciones activeId={otroIdNum} />
        <Ventana otroId={otroIdNum} />
      </div>
    </div>
  );
}

function ListaConversaciones({ activeId }: { activeId: number | null }) {
  const navigate = useNavigate();
  const { modo, usuario } = useAuth();
  const [items, setItems] = useState<Conversacion[]>([]);
  const [loading, setLoading] = useState(true);

  async function cargar() {
    try {
      const data = await api<Conversacion[]>('/mensajes/conversaciones');
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className={`card p-3 overflow-y-auto ${activeId ? 'hidden md:block' : ''}`}>
      <div className="flex items-center justify-between mb-3 px-2">
        <h2 className="text-lg font-bold text-amasa-900 flex items-center gap-2">
          <MessageCircle size={18} /> Mensajes
        </h2>
        <Link
          to={modo === 'PROVEEDOR' ? '/admin' : '/proveedores'}
          className="text-xs text-amasa-700 hover:text-amasa-900 font-semibold"
        >
          ← Volver
        </Link>
      </div>
      {loading ? (
        <p className="text-amasa-600 text-sm px-2">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-amasa-600 text-sm px-2 py-6 text-center">
          Aún no tienes conversaciones.<br />
          {usuario?.rol === 'CLIENTE'
            ? <>Empieza una desde un <Link to="/proveedores" className="text-amasa-700 underline">proveedor</Link>.</>
            : 'Tus clientes podrán escribirte aquí.'}
        </p>
      ) : (
        <ul className="space-y-1">
          {items.map((c) => {
            const u = c.otroUsuario;
            const activo = c.otroUsuario.id === activeId;
            return (
              <li key={c.otroUsuario.id}>
                <button
                  onClick={() => navigate(`/chat/${c.otroUsuario.id}`)}
                  className={`w-full text-left flex items-center gap-3 p-2 rounded-xl transition ${
                    activo ? 'bg-amasa-100' : 'hover:bg-white'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full bg-amasa-200 bg-cover bg-center grid place-items-center text-amasa-700 shrink-0"
                    style={u.fotoUrl ? { backgroundImage: `url(${u.fotoUrl})` } : {}}
                  >
                    {!u.fotoUrl && (u.rol === 'PROVEEDOR' ? <Store size={16} /> : <User size={16} />)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-amasa-900 truncate text-sm">
                        {u.nombreNegocio || u.nombre}
                      </span>
                      {c.noLeidos > 0 && (
                        <span className="bg-amasa-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0">
                          {c.noLeidos}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amasa-600 truncate">{c.ultimoMensaje.contenido}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

function Ventana({ otroId }: { otroId: number | null }) {
  const { usuario } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [otro, setOtro] = useState<OtroUsuario | null>(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fin = useRef<HTMLDivElement>(null);

  async function cargarHistorial() {
    if (!otroId) return;
    const ms = await api<Mensaje[]>(`/mensajes/conversacion/${otroId}`);
    setMensajes(ms);
    api(`/mensajes/leer/${otroId}`, { method: 'POST' }).catch(() => {});
  }

  async function cargarOtro() {
    if (!otroId) return;
    // Truco: usar /proveedores/:id si es proveedor, o intentar afiliaciones
    try {
      const p = await api<{ rol: string; nombre: string; nombreNegocio?: string; fotoUrl?: string; id: number; telefono?: string }>(`/proveedores/${otroId}`);
      setOtro({
        id: p.id, nombre: p.nombre,
        telefono: p.telefono || '',
        rol: 'PROVEEDOR',
        nombreNegocio: p.nombreNegocio || null,
        fotoUrl: p.fotoUrl || null,
      });
    } catch {
      // Si no es proveedor, lo dejamos como cliente con datos parciales (de la conversación si los hay)
      setOtro({
        id: otroId, nombre: `Usuario #${otroId}`,
        telefono: '', rol: 'CLIENTE', nombreNegocio: null, fotoUrl: null,
      });
    }
  }

  useEffect(() => {
    if (!otroId) { setMensajes([]); setOtro(null); return; }
    cargarHistorial();
    cargarOtro();
    const t = setInterval(cargarHistorial, POLL_INTERVAL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otroId]);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes.length]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!otroId || !texto.trim()) return;
    setEnviando(true);
    try {
      const m = await api<Mensaje>('/mensajes', {
        method: 'POST',
        body: JSON.stringify({ destinatarioId: otroId, contenido: texto.trim() }),
      });
      setMensajes((arr) => [...arr, m]);
      setTexto('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!otroId) {
    return (
      <section className="card hidden md:flex items-center justify-center text-amasa-600">
        Elige una conversación
      </section>
    );
  }

  return (
    <section className="card p-0 flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/60 bg-white">
        <Link to="/chat" className="md:hidden text-amasa-700"><ArrowLeft /></Link>
        {otro && (
          <>
            <div
              className="w-10 h-10 rounded-full bg-amasa-200 bg-cover bg-center grid place-items-center text-amasa-700 shrink-0"
              style={otro.fotoUrl ? { backgroundImage: `url(${otro.fotoUrl})` } : {}}
            >
              {!otro.fotoUrl && (otro.rol === 'PROVEEDOR' ? <Store size={16} /> : <User size={16} />)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-amasa-900 truncate">{otro.nombreNegocio || otro.nombre}</h3>
              <p className="text-xs text-amasa-600">{otro.rol === 'PROVEEDOR' ? 'Proveedor' : 'Cliente'}</p>
            </div>
          </>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-amasa-50/30 to-transparent">
        {mensajes.length === 0 ? (
          <p className="text-center text-amasa-600 text-sm py-8">Sé el primero en escribir.</p>
        ) : (
          mensajes.map((m) => {
            const mio = m.remitenteId === usuario?.id;
            return (
              <div key={m.id} className={`flex ${mio ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${
                    mio
                      ? 'bg-gradient-to-br from-amasa-500 to-amasa-600 text-white rounded-br-md'
                      : 'bg-white/80 text-amasa-900 rounded-bl-md border border-white/60'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{m.contenido}</p>
                  <p className={`text-[10px] mt-1 ${mio ? 'text-white/70' : 'text-amasa-500'}`}>
                    {new Date(m.creadoEn).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={fin} />
      </div>

      <form onSubmit={enviar} className="flex items-center gap-2 p-3 border-t border-white/60 bg-white">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="input-glass flex-1 px-3 py-2"
        />
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          className="p-2.5 rounded-xl bg-gradient-to-br from-amasa-500 to-amasa-600 text-white shadow-lg disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}
