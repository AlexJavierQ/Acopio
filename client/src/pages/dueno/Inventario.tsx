import { useEffect, useState } from 'react';
import { AlertTriangle, Save, Package } from 'lucide-react';
import { api } from '../../lib/api';

interface Insumo {
  id: number;
  nombre: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
}

export default function Inventario() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [edits, setEdits] = useState<Record<number, number>>({});
  const [guardando, setGuardando] = useState<number | null>(null);

  async function cargar() {
    setInsumos(await api<Insumo[]>('/insumos'));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function guardar(id: number) {
    if (edits[id] === undefined) return;
    setGuardando(id);
    try {
      await api(`/insumos/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stockActual: edits[id] }),
      });
      setEdits((e) => {
        const { [id]: _, ...rest } = e;
        return rest;
      });
      cargar();
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="text-amasa-500" />
        <h1 className="text-3xl font-extrabold">Inventario de insumos</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {insumos.map((i) => {
          const valorActual = edits[i.id] ?? i.stockActual;
          const bajo = valorActual <= i.stockMinimo;
          const dirty = edits[i.id] !== undefined;
          return (
            <div
              key={i.id}
              className={`card !p-5 border-2 ${
                bajo ? 'border-red-200 bg-red-50' : 'border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{i.nombre}</h3>
                {bajo && (
                  <span className="chip bg-red-100 text-red-700">
                    <AlertTriangle size={14} /> Bajo
                  </span>
                )}
              </div>
              <p className="text-xs text-amasa-600 mb-3">
                Mínimo: {i.stockMinimo} {i.unidad}
              </p>
              <label className="label">Stock actual ({i.unidad})</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={valorActual}
                  onChange={(e) =>
                    setEdits((prev) => ({ ...prev, [i.id]: Number(e.target.value) }))
                  }
                />
                <button
                  onClick={() => guardar(i.id)}
                  disabled={!dirty || guardando === i.id}
                  className="btn-primary !py-3 !px-4"
                >
                  <Save size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
