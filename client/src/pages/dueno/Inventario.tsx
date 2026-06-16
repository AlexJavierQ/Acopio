import { useEffect, useState, type ReactNode } from 'react';
import {
  Package,
  BookOpen,
  ClipboardCheck,
  Plus,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  ShoppingCart,
  Factory,
  Boxes,
  X,
  Save,
} from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';

type Tab = 'insumos' | 'recetas' | 'requerimientos';

export default function Inventario() {
  const [tab, setTab] = useState<Tab>('insumos');

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'insumos', label: 'Materias primas', icon: Package },
    { key: 'recetas', label: 'Recetas', icon: BookOpen },
    { key: 'requerimientos', label: 'Requerimientos', icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-amasa-900">Inventario</h1>
        <p className="text-amasa-600 mt-1">
          Registra tus materias primas, define recetas y revisa si te alcanzan para los pedidos.
        </p>
      </header>

      <div className="flex gap-1 p-1 bg-amasa-50 rounded-xl w-full sm:w-fit border border-amasa-100">
        {tabs.map((t) => {
          const Icon = t.icon;
          const activo = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activo ? 'bg-white text-amasa-900 shadow-sm' : 'text-amasa-600 hover:text-amasa-900'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'insumos' && <TabInsumos />}
      {tab === 'recetas' && <TabRecetas />}
      {tab === 'requerimientos' && <TabRequerimientos />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Materias primas                                                     */
/* ------------------------------------------------------------------ */
interface Insumo {
  id: number;
  nombre: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  costoUnitario: number;
}

function TabInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [editar, setEditar] = useState<Insumo | null>(null);
  const [creando, setCreando] = useState(false);

  async function cargar() {
    setInsumos(await api<Insumo[]>('/insumos'));
  }
  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setCreando(true)} className="btn-primary">
          <Plus size={18} /> Agregar materia prima
        </button>
      </div>

      {insumos.length === 0 ? (
        <div className="card text-center py-12 text-amasa-600">
          <Package className="mx-auto text-amasa-200 mb-3" size={48} />
          <p>Aún no registras materias primas.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {insumos.map((i) => {
            const bajo = i.stockActual <= i.stockMinimo;
            return (
              <button
                key={i.id}
                onClick={() => setEditar(i)}
                className={`card text-left hover:border-amasa-300 transition ${bajo ? 'border-red-200 bg-red-50/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-amasa-900">{i.nombre}</h3>
                  {bajo && (
                    <span className="chip bg-red-100 text-red-700">
                      <AlertTriangle size={12} /> Bajo
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-amasa-900 mt-2">
                  {i.stockActual}
                  <span className="text-sm font-medium text-amasa-500"> {i.unidad}</span>
                </p>
                <p className="text-xs text-amasa-500 mt-1">
                  Mínimo: {i.stockMinimo} {i.unidad}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {(creando || editar) && (
        <InsumoModal
          insumo={editar}
          onClose={() => {
            setCreando(false);
            setEditar(null);
          }}
          onGuardado={() => {
            setCreando(false);
            setEditar(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

function InsumoModal({
  insumo,
  onClose,
  onGuardado,
}: {
  insumo: Insumo | null;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const esEdicion = !!insumo;
  const [form, setForm] = useState({
    nombre: insumo?.nombre ?? '',
    unidad: insumo?.unidad ?? 'kg',
    stockActual: String(insumo?.stockActual ?? ''),
    stockMinimo: String(insumo?.stockMinimo ?? ''),
    costoUnitario: String(insumo?.costoUnitario ?? ''),
  });
  const [guardando, setGuardando] = useState(false);
  const unidades = ['kg', 'g', 'lt', 'ml', 'unidades'];

  async function guardar() {
    if (!form.nombre.trim()) return alert('El nombre es obligatorio');
    setGuardando(true);
    try {
      const body = JSON.stringify({
        nombre: form.nombre.trim(),
        unidad: form.unidad,
        stockActual: Number(form.stockActual) || 0,
        stockMinimo: Number(form.stockMinimo) || 0,
        costoUnitario: Number(form.costoUnitario) || 0,
      });
      if (esEdicion) await api(`/insumos/${insumo!.id}`, { method: 'PUT', body });
      else await api('/insumos', { method: 'POST', body });
      onGuardado();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar "${insumo!.nombre}"?`)) return;
    try {
      await api(`/insumos/${insumo!.id}`, { method: 'DELETE' });
      onGuardado();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <ModalShell title={esEdicion ? 'Editar materia prima' : 'Nueva materia prima'} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="label">Nombre</label>
          <input
            className="input"
            placeholder="Ej. Harina de trigo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Unidad</label>
          <div className="flex flex-wrap gap-2">
            {unidades.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setForm({ ...form, unidad: u })}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                  form.unidad === u ? 'bg-amasa-600 text-white border-amasa-600' : 'bg-white text-amasa-700 border-amasa-200'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Stock actual</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={form.stockActual}
              onChange={(e) => setForm({ ...form, stockActual: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Stock mínimo</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={form.stockMinimo}
              onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Costo por {form.unidad} ($)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="Para calcular la ganancia"
            value={form.costoUnitario}
            onChange={(e) => setForm({ ...form, costoUnitario: e.target.value })}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando} className="btn-primary flex-1">
            <Save size={16} /> {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
        {esEdicion && (
          <button onClick={eliminar} className="w-full flex items-center justify-center gap-2 text-red-600 text-sm font-semibold py-2 hover:bg-red-50 rounded-lg">
            <Trash2 size={15} /> Eliminar
          </button>
        )}
      </div>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Recetas                                                             */
/* ------------------------------------------------------------------ */
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl: string;
  activo: boolean;
  _count?: { recetas: number };
}

function TabRecetas() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [editar, setEditar] = useState<Producto | null>(null);

  async function cargar() {
    const data = await api<Producto[]>('/productos');
    setProductos(data.filter((p) => p.activo));
  }
  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-amasa-600">
        Define qué materias primas (y cuánto) usa <strong>1 unidad</strong> de cada producto. Con esto se calcula si tu
        inventario alcanza.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {productos.map((p) => {
          const n = p._count?.recetas ?? 0;
          return (
            <button
              key={p.id}
              onClick={() => setEditar(p)}
              className="card flex items-center gap-4 text-left hover:border-amasa-300 transition"
            >
              <div className="w-14 h-14 rounded-xl bg-amasa-100 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${p.imagenUrl})` }} />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-amasa-900 truncate">{p.nombre}</h3>
                <p className="text-sm text-amasa-500">{formatoUSD(p.precio)}</p>
                {n > 0 ? (
                  <span className="chip bg-green-100 text-green-700 mt-1">
                    <CheckCircle2 size={12} /> {n} insumo{n === 1 ? '' : 's'}
                  </span>
                ) : (
                  <span className="chip bg-amber-100 text-amber-700 mt-1">
                    <AlertTriangle size={12} /> Sin receta
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {editar && <RecetaModal producto={editar} onClose={() => setEditar(null)} onGuardado={() => { setEditar(null); cargar(); }} />}
    </div>
  );
}

function RecetaModal({
  producto,
  onClose,
  onGuardado,
}: {
  producto: Producto;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    (async () => {
      const [ins, prod] = await Promise.all([
        api<Insumo[]>('/insumos'),
        api<{ recetas: { insumoId: number; cantidad: number }[] }>(`/productos/${producto.id}`),
      ]);
      setInsumos(ins);
      const map: Record<number, string> = {};
      for (const r of prod.recetas) map[r.insumoId] = String(r.cantidad);
      setCantidades(map);
      setCargando(false);
    })();
  }, [producto.id]);

  async function guardar() {
    setGuardando(true);
    try {
      const items = Object.entries(cantidades)
        .map(([insumoId, v]) => ({ insumoId: Number(insumoId), cantidad: Number(v) }))
        .filter((i) => i.cantidad > 0);
      await api(`/productos/${producto.id}/receta`, { method: 'PUT', body: JSON.stringify({ items }) });
      onGuardado();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ModalShell title={`Receta · ${producto.nombre}`} onClose={onClose}>
      {cargando ? (
        <p className="text-amasa-600 py-6 text-center">Cargando…</p>
      ) : insumos.length === 0 ? (
        <p className="text-amasa-600 py-6 text-center">Primero registra materias primas.</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-amasa-600">Cantidad por <strong>1 unidad</strong> producida. Deja en 0 lo que no use.</p>
          <div className="divide-y divide-amasa-100 -mx-2">
            {insumos.map((i) => (
              <div key={i.id} className="flex items-center gap-3 py-2.5 px-2">
                <span className="flex-1 font-medium text-amasa-900">{i.nombre}</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  className="input !w-24 !py-2 text-right"
                  placeholder="0"
                  value={cantidades[i.id] ?? ''}
                  onChange={(e) => setCantidades((c) => ({ ...c, [i.id]: e.target.value }))}
                />
                <span className="w-16 text-sm text-amasa-500">{i.unidad}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={guardar} disabled={guardando} className="btn-primary flex-1">
              <Save size={16} /> {guardando ? 'Guardando…' : 'Guardar receta'}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Requerimientos                                                      */
/* ------------------------------------------------------------------ */
interface InsumoNecesario {
  id: number;
  nombre: string;
  unidad: string;
  necesario: number;
  stockActual: number;
  alcanza: boolean;
  faltante: number;
}
interface Requerimientos {
  cantidadPedidos: number;
  totalAProducir: number;
  unidadesPorProducto: { productoId: number; nombre: string; cantidad: number }[];
  insumosNecesarios: InsumoNecesario[];
  listaCompras: InsumoNecesario[];
  productosSinReceta: { productoId: number; nombre: string }[];
  todoAlcanza: boolean;
}

function TabRequerimientos() {
  const [data, setData] = useState<Requerimientos | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Requerimientos>('/produccion/requerimientos')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-amasa-600">Cargando…</p>;
  if (!data || data.cantidadPedidos === 0) {
    return (
      <div className="card text-center py-12 text-amasa-600">
        <Factory className="mx-auto text-amasa-200 mb-3" size={48} />
        <p>No tienes pedidos pendientes por producir.</p>
      </div>
    );
  }

  const alcanza = data.todoAlcanza;

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className={`rounded-2xl p-5 flex items-center gap-4 border ${alcanza ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        {alcanza ? <CheckCircle2 className="text-green-600 shrink-0" size={36} /> : <AlertTriangle className="text-amber-600 shrink-0" size={36} />}
        <div>
          <h2 className={`font-bold text-lg ${alcanza ? 'text-green-800' : 'text-amber-800'}`}>
            {alcanza ? 'Tu inventario alcanza' : 'Te faltan insumos'}
          </h2>
          <p className="text-sm text-amasa-700">
            {alcanza
              ? `Puedes producir los ${data.cantidadPedidos} pedido(s) pendientes.`
              : `Necesitas comprar ${data.listaCompras.length} insumo(s) para cumplir los pedidos.`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <Boxes className="text-amasa-500" />
          <div>
            <p className="text-2xl font-bold text-amasa-900">{data.cantidadPedidos}</p>
            <p className="text-xs text-amasa-500">Pedidos pendientes</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <Factory className="text-amasa-500" />
          <div>
            <p className="text-2xl font-bold text-amasa-900">{data.totalAProducir}</p>
            <p className="text-xs text-amasa-500">Unidades a producir</p>
          </div>
        </div>
      </div>

      {/* Lista de compras */}
      {data.listaCompras.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 font-bold text-amasa-900 mb-2">
            <ShoppingCart size={18} className="text-red-600" /> Lista de compras
          </h3>
          <div className="card !p-0 divide-y divide-amasa-100 border-red-200">
            {data.listaCompras.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-amasa-900">{i.nombre}</p>
                  <p className="text-xs text-amasa-500">
                    Tienes {i.stockActual} · necesitas {i.necesario} {i.unidad}
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-bold text-sm whitespace-nowrap">
                  + {i.faltante} {i.unidad}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Insumos necesarios */}
      <section>
        <h3 className="flex items-center gap-2 font-bold text-amasa-900 mb-2">
          <Boxes size={18} /> Insumos necesarios
        </h3>
        <div className="card !p-0 divide-y divide-amasa-100">
          {data.insumosNecesarios.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-amasa-900">{i.nombre}</p>
                <p className="text-xs text-amasa-500">
                  Necesario {i.necesario} {i.unidad} · Stock {i.stockActual} {i.unidad}
                </p>
              </div>
              {i.alcanza ? <CheckCircle2 className="text-green-600 shrink-0" size={20} /> : <AlertTriangle className="text-red-600 shrink-0" size={20} />}
            </div>
          ))}
          {data.insumosNecesarios.length === 0 && <p className="p-4 text-amasa-500 text-sm">Sin insumos calculados (faltan recetas).</p>}
        </div>
      </section>

      {/* A producir */}
      <section>
        <h3 className="flex items-center gap-2 font-bold text-amasa-900 mb-2">
          <Factory size={18} /> A producir
        </h3>
        <div className="card !p-0 divide-y divide-amasa-100">
          {data.unidadesPorProducto.map((u) => (
            <div key={u.productoId} className="flex items-center justify-between p-4">
              <span className="font-medium text-amasa-900">{u.nombre}</span>
              <span className="font-bold text-amasa-700">{u.cantidad} u</span>
            </div>
          ))}
        </div>
      </section>

      {/* Productos sin receta */}
      {data.productosSinReceta.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <p className="font-semibold text-amber-800 flex items-center gap-2 mb-1">
            <BookOpen size={16} /> Productos sin receta
          </p>
          <p className="text-sm text-amber-700">
            No se incluyeron en el cálculo: {data.productosSinReceta.map((p) => p.nombre).join(', ')}. Defínelas en la
            pestaña <strong>Recetas</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell de modal minimalista                                          */
/* ------------------------------------------------------------------ */
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-marron/40 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-amasa-100 sticky top-0 bg-white">
          <h3 className="font-bold text-amasa-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-amasa-50 text-amasa-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
