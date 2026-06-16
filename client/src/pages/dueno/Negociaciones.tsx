import { useEffect, useState } from 'react';
import { Handshake, Check, X, Plus, Minus, Trash2, Percent, DollarSign, Gift, Loader2 } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl: string;
}
interface PedidoItem {
  id: number;
  cantidad: number;
  precioUnitario: number;
  esBono: boolean;
  producto: Producto;
}
interface Negociacion {
  id: number;
  estado: 'SOLICITADA' | 'CONTRA_PROPUESTA' | 'ACEPTADA' | 'RECHAZADA';
  mensajeCliente: string | null;
  tipo: 'PORCENTAJE' | 'MONTO_FIJO' | 'BONO' | null;
  valor: number | null;
  notaProveedor: string | null;
  creadoEn: string;
  resueltoEn: string | null;
  bonos: { id: number; cantidad: number; producto: Producto }[];
  pedido: {
    id: number;
    horaEntrega: string;
    estado: string;
    subtotal: number;
    total: number;
    cliente: { id: number; nombre: string; telefono: string };
    items: PedidoItem[];
  };
}

type Tab = 'SOLICITADA' | 'ACEPTADA' | 'RECHAZADA';

export default function Negociaciones() {
  const [tab, setTab] = useState<Tab>('SOLICITADA');
  const [items, setItems] = useState<Negociacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [responderEn, setResponderEn] = useState<Negociacion | null>(null);

  async function cargar() {
    setLoading(true);
    try {
      const data = await api<Negociacion[]>(`/negociaciones?estado=${tab}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, [tab]);

  const tabCls = (active: boolean) =>
    `flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-semibold transition ${
      active ? 'bg-amasa-500 text-white shadow-lg' : 'bg-white text-amasa-800 hover:bg-white'
    }`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-amasa-900 flex items-center gap-2">
          <Handshake /> Negociaciones
        </h1>
        <p className="text-amasa-700">Solicitudes de descuento o bonos sobre tus pedidos.</p>
      </header>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTab('SOLICITADA')} className={tabCls(tab === 'SOLICITADA')}>Pendientes</button>
        <button onClick={() => setTab('ACEPTADA')} className={tabCls(tab === 'ACEPTADA')}>Aceptadas</button>
        <button onClick={() => setTab('RECHAZADA')} className={tabCls(tab === 'RECHAZADA')}>Rechazadas</button>
      </div>

      {loading ? (
        <p className="text-amasa-600">Cargando...</p>
      ) : items.length === 0 ? (
        <div className="card text-center py-12 text-amasa-600">
          {tab === 'SOLICITADA' ? 'No hay solicitudes pendientes 🙌' : 'Vacío.'}
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((n) => (
            <NegociacionCard key={n.id} n={n} onResponder={() => setResponderEn(n)} />
          ))}
        </div>
      )}

      {responderEn && (
        <ModalResponder
          neg={responderEn}
          onClose={() => setResponderEn(null)}
          onHecho={() => { setResponderEn(null); cargar(); }}
        />
      )}
    </div>
  );
}

function NegociacionCard({ n, onResponder }: { n: Negociacion; onResponder: () => void }) {
  const items = n.pedido.items.filter((i) => !i.esBono);
  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-amasa-900">
            Pedido #{n.pedido.id} · {n.pedido.cliente.nombre}
          </h3>
          <p className="text-xs text-amasa-600">
            Subtotal: <strong>{formatoUSD(n.pedido.subtotal)}</strong> · Entrega: {n.pedido.horaEntrega}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {items.slice(0, 3).map((it) => (
            <span key={it.id} className="px-2 py-1 rounded-lg bg-amasa-100 text-amasa-800 font-semibold">
              {it.cantidad}× {it.producto.nombre}
            </span>
          ))}
          {items.length > 3 && (
            <span className="px-2 py-1 rounded-lg bg-amasa-50 text-amasa-700">+{items.length - 3} más</span>
          )}
        </div>
      </div>

      {n.mensajeCliente && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">Mensaje del cliente</p>
          <p className="text-sm text-amber-900 italic">"{n.mensajeCliente}"</p>
        </div>
      )}

      {n.estado === 'ACEPTADA' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-900">
          ✅ Aceptada — {n.tipo === 'PORCENTAJE' && `Descuento ${n.valor}%`}
          {n.tipo === 'MONTO_FIJO' && `Descuento ${formatoUSD(n.valor || 0)}`}
          {n.tipo === 'BONO' && `Bono: ${n.bonos.map((b) => `${b.cantidad}× ${b.producto.nombre}`).join(', ')}`}
          {n.notaProveedor && <p className="text-xs mt-1 italic">"{n.notaProveedor}"</p>}
        </div>
      )}
      {n.estado === 'RECHAZADA' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-900">
          ❌ Rechazada {n.notaProveedor && `— "${n.notaProveedor}"`}
        </div>
      )}

      {n.estado === 'SOLICITADA' && (
        <button
          onClick={onResponder}
          className="w-full px-4 py-2 rounded-xl bg-gradient-to-br from-amasa-500 to-amasa-600 text-white font-semibold shadow-lg active:scale-[0.98]"
        >
          Responder
        </button>
      )}
    </div>
  );
}

function ModalResponder({
  neg, onClose, onHecho,
}: {
  neg: Negociacion;
  onClose: () => void;
  onHecho: () => void;
}) {
  const [tipo, setTipo] = useState<'PORCENTAJE' | 'MONTO_FIJO' | 'BONO'>('PORCENTAJE');
  const [valor, setValor] = useState<string>('10');
  const [bonos, setBonos] = useState<{ productoId: number; cantidad: number; nombre: string; precio: number }[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState<'aceptar' | 'rechazar' | null>(null);

  useEffect(() => {
    api<Producto[]>('/productos').then(setProductos);
  }, []);

  function agregarBono(p: Producto) {
    setBonos((arr) => {
      const ex = arr.find((b) => b.productoId === p.id);
      if (ex) return arr.map((b) => b.productoId === p.id ? { ...b, cantidad: b.cantidad + 1 } : b);
      return [...arr, { productoId: p.id, cantidad: 1, nombre: p.nombre, precio: p.precio }];
    });
  }
  function cambiarBono(productoId: number, cantidad: number) {
    if (cantidad <= 0) {
      setBonos((arr) => arr.filter((b) => b.productoId !== productoId));
    } else {
      setBonos((arr) => arr.map((b) => b.productoId === productoId ? { ...b, cantidad } : b));
    }
  }

  async function aceptar() {
    setEnviando('aceptar');
    try {
      const body: any = { tipo, notaProveedor: nota || undefined };
      if (tipo === 'BONO') {
        if (bonos.length === 0) { alert('Agrega al menos un producto extra'); setEnviando(null); return; }
        body.bonos = bonos.map((b) => ({ productoId: b.productoId, cantidad: b.cantidad }));
      } else {
        body.valor = Number(valor);
      }
      await api(`/negociaciones/${neg.id}/aceptar`, { method: 'PATCH', body: JSON.stringify(body) });
      onHecho();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEnviando(null);
    }
  }

  async function rechazar() {
    setEnviando('rechazar');
    try {
      await api(`/negociaciones/${neg.id}/rechazar`, {
        method: 'PATCH',
        body: JSON.stringify({ notaProveedor: nota || undefined }),
      });
      onHecho();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEnviando(null);
    }
  }

  // Estimar descuento
  const subtotal = neg.pedido.subtotal;
  let descuentoEstimado = 0;
  if (tipo === 'PORCENTAJE') descuentoEstimado = (subtotal * (Number(valor) || 0)) / 100;
  else if (tipo === 'MONTO_FIJO') descuentoEstimado = Math.min(subtotal, Number(valor) || 0);
  const totalFinal = Math.max(0, subtotal - descuentoEstimado);

  const tipoBtn = (
    activo: boolean,
    onClick: () => void,
    Icon: any,
    text: string,
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 font-semibold transition ${
        activo
          ? 'border-amasa-500 bg-amasa-50 text-amasa-900'
          : 'border-amasa-100 bg-white text-amasa-700 hover:bg-white'
      }`}
    >
      <Icon size={20} />
      <span className="text-xs">{text}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-marron/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 my-8">
        <header>
          <h3 className="text-xl font-bold text-amasa-900">Responder negociación</h3>
          <p className="text-sm text-amasa-700">
            Pedido #{neg.pedido.id} · {neg.pedido.cliente.nombre}
          </p>
        </header>

        {/* Selector de tipo */}
        <div className="flex gap-2">
          {tipoBtn(tipo === 'PORCENTAJE', () => setTipo('PORCENTAJE'), Percent, 'Porcentaje')}
          {tipoBtn(tipo === 'MONTO_FIJO', () => setTipo('MONTO_FIJO'), DollarSign, 'Monto $')}
          {tipoBtn(tipo === 'BONO', () => setTipo('BONO'), Gift, 'Bono')}
        </div>

        {/* Valor o bonos */}
        {tipo !== 'BONO' ? (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amasa-800">
              {tipo === 'PORCENTAJE' ? '% de descuento' : 'Monto $ a descontar'}
            </label>
            <input
              type="number"
              step={tipo === 'PORCENTAJE' ? 1 : 0.5}
              min={0}
              max={tipo === 'PORCENTAJE' ? 100 : subtotal}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="input-glass w-full px-3 py-2"
            />
            <div className="text-sm text-amasa-700 bg-amasa-50 px-3 py-2 rounded-xl">
              <p>Subtotal: <strong>{formatoUSD(subtotal)}</strong></p>
              <p>Descuento: <strong className="text-green-700">- {formatoUSD(descuentoEstimado)}</strong></p>
              <p>Total final: <strong className="text-amasa-900">{formatoUSD(totalFinal)}</strong></p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-amasa-800">Productos extra de regalo</label>
            {bonos.length > 0 && (
              <div className="space-y-2">
                {bonos.map((b) => (
                  <div key={b.productoId} className="flex items-center gap-2 p-2 bg-amasa-50 rounded-xl">
                    <span className="flex-1 text-sm font-semibold text-amasa-900">{b.nombre}</span>
                    <button onClick={() => cambiarBono(b.productoId, b.cantidad - 1)} className="w-7 h-7 rounded-lg bg-white grid place-items-center"><Minus size={14} /></button>
                    <span className="w-6 text-center font-bold">{b.cantidad}</span>
                    <button onClick={() => cambiarBono(b.productoId, b.cantidad + 1)} className="w-7 h-7 rounded-lg bg-amasa-500 text-white grid place-items-center"><Plus size={14} /></button>
                    <button onClick={() => cambiarBono(b.productoId, 0)} className="text-red-600 ml-1"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            <div>
              <p className="text-xs text-amasa-600 mb-2">Agregar producto:</p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {productos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => agregarBono(p)}
                    className="text-left p-2 bg-white hover:bg-white border border-amasa-100 rounded-lg text-xs"
                  >
                    <p className="font-semibold text-amasa-900 truncate">{p.nombre}</p>
                    <p className="text-amasa-600">{formatoUSD(p.precio)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Nota para el cliente (opcional)"
          rows={2}
          className="input-glass w-full px-3 py-2 text-sm"
        />

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-amasa-200 text-amasa-800 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={rechazar}
            disabled={enviando !== null}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-white border border-red-300 text-red-700 font-semibold hover:bg-red-50 disabled:opacity-60"
          >
            {enviando === 'rechazar' ? <Loader2 className="animate-spin" size={14} /> : <X size={16} />} Rechazar
          </button>
          <button
            onClick={aceptar}
            disabled={enviando !== null}
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold disabled:opacity-60"
          >
            {enviando === 'aceptar' ? <Loader2 className="animate-spin" size={14} /> : <Check size={16} />} Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
