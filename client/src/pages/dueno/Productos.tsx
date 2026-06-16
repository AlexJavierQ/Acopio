import { useEffect, useState, type ReactNode } from 'react';
import { Plus, Pencil, Eye, EyeOff, X, Save, Croissant } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  activo: boolean;
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editar, setEditar] = useState<Producto | null>(null);
  const [creando, setCreando] = useState(false);

  async function cargar() {
    setLoading(true);
    try {
      setProductos(await api<Producto[]>('/productos'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    cargar();
  }, []);

  async function toggleActivo(p: Producto) {
    await api(`/productos/${p.id}`, { method: 'PUT', body: JSON.stringify({ ...p, activo: !p.activo }) });
    cargar();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-amasa-900">Productos</h1>
          <p className="text-amasa-600 mt-1">Tu catálogo: lo que tus clientes pueden pedir.</p>
        </div>
        <button onClick={() => setCreando(true)} className="btn-primary self-start">
          <Plus size={18} /> Nuevo producto
        </button>
      </header>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-56 skeleton" />
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="card text-center py-16">
          <Croissant className="mx-auto text-amasa-200 mb-3" size={48} />
          <p className="text-amasa-600 mb-4">Aún no tienes productos.</p>
          <button onClick={() => setCreando(true)} className="btn-primary inline-flex">
            <Plus size={16} /> Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map((p) => (
            <div key={p.id} className={`card !p-0 overflow-hidden lift animate-fade-up ${!p.activo ? 'opacity-60' : ''}`}>
              <div className="aspect-video bg-amasa-100 bg-cover bg-center" style={{ backgroundImage: `url(${p.imagenUrl})` }} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-amasa-900">{p.nombre}</h3>
                  <span className="font-bold text-amasa-700 whitespace-nowrap">{formatoUSD(p.precio)}</span>
                </div>
                <p className="text-sm text-amasa-500 line-clamp-2 mt-1 min-h-[2.5rem]">{p.descripcion}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => setEditar(p)} className="btn-secondary !py-2 !px-3 text-sm flex-1">
                    <Pencil size={15} /> Editar
                  </button>
                  <button
                    onClick={() => toggleActivo(p)}
                    className={`!py-2 !px-3 rounded-xl text-sm font-semibold border flex items-center gap-1.5 ${
                      p.activo ? 'border-amasa-200 text-amasa-700 hover:bg-amasa-50' : 'border-green-200 text-green-700 bg-green-50'
                    }`}
                    title={p.activo ? 'Desactivar' : 'Activar'}
                  >
                    {p.activo ? <EyeOff size={15} /> : <Eye size={15} />}
                    {p.activo ? 'Ocultar' : 'Activar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creando || editar) && (
        <ProductoModal
          producto={editar}
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

function ProductoModal({
  producto,
  onClose,
  onGuardado,
}: {
  producto: Producto | null;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const esEdicion = !!producto;
  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio: String(producto?.precio ?? ''),
    imagenUrl: producto?.imagenUrl ?? '',
  });
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (!form.nombre.trim() || !(Number(form.precio) > 0)) {
      alert('Nombre y precio (mayor a 0) son obligatorios');
      return;
    }
    setGuardando(true);
    try {
      const body = JSON.stringify({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        imagenUrl: form.imagenUrl.trim() || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
        ...(esEdicion ? { activo: producto!.activo } : {}),
      });
      if (esEdicion) await api(`/productos/${producto!.id}`, { method: 'PUT', body });
      else await api('/productos', { method: 'POST', body });
      onGuardado();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ModalShell title={esEdicion ? 'Editar producto' : 'Nuevo producto'} onClose={onClose}>
      <div className="space-y-4">
        {form.imagenUrl ? (
          <div className="aspect-video rounded-xl bg-amasa-100 bg-cover bg-center" style={{ backgroundImage: `url(${form.imagenUrl})` }} />
        ) : null}
        <div>
          <label className="label">Nombre</label>
          <input className="input" placeholder="Ej. Pan integral" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea className="input" rows={2} placeholder="Breve descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Precio ($)</label>
            <input className="input" type="number" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Imagen (URL)</label>
          <input className="input" placeholder="https://..." value={form.imagenUrl} onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })} />
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={guardar} disabled={guardando} className="btn-primary flex-1">
            <Save size={16} /> {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-marron/40 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
