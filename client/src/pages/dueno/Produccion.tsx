import { useEffect, useState } from 'react';
import { Cookie, Wheat, ListChecks, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

interface Reporte {
  cantidadPedidos: number;
  unidadesPorProducto: { productoId: number; nombre: string; cantidad: number }[];
  totalAProducir: number;
  insumosNecesarios: {
    id: number;
    nombre: string;
    unidad: string;
    necesario: number;
    stockActual: number;
    stockMinimo: number;
    alcanza: boolean;
    faltante: number;
  }[];
  todoAlcanza: boolean;
}

export default function Produccion() {
  const [reporte, setReporte] = useState<Reporte | null>(null);

  useEffect(() => {
    api<Reporte>('/produccion/hoy').then(setReporte);
  }, []);

  if (!reporte) return <p className="text-amasa-700">Calculando producción…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Reporte de producción</h1>
        <p className="text-amasa-700">
          Calculado a partir de {reporte.cantidadPedidos} pedidos pendientes de hoy.
        </p>
      </div>

      {/* Banner global */}
      <div
        className={`rounded-2xl p-5 flex items-center gap-4 ${
          reporte.todoAlcanza
            ? 'bg-green-50 border-2 border-green-200 text-green-800'
            : 'bg-red-50 border-2 border-red-200 text-red-800'
        }`}
      >
        {reporte.todoAlcanza ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
        <div>
          <p className="font-bold text-lg">
            {reporte.todoAlcanza
              ? '¡Todo en orden! Tienes todos los insumos.'
              : 'Atención: faltan insumos para cubrir hoy.'}
          </p>
          <p className="text-sm">
            {reporte.todoAlcanza
              ? 'Puedes comenzar a hornear con tranquilidad.'
              : 'Revisa los marcados en rojo y abastécete antes de empezar.'}
          </p>
        </div>
      </div>

      {/* Paso 1 */}
      <Paso n={1} icon={<Cookie />} titulo="Unidades pedidas por producto">
        {reporte.unidadesPorProducto.length === 0 ? (
          <p className="text-amasa-700">No hay pedidos pendientes.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reporte.unidadesPorProducto.map((u) => (
              <div
                key={u.productoId}
                className="bg-amasa-50 rounded-2xl p-4 flex items-center justify-between"
              >
                <span className="font-semibold">{u.nombre}</span>
                <span className="text-2xl font-extrabold text-amasa-600">{u.cantidad}</span>
              </div>
            ))}
          </div>
        )}
      </Paso>

      {/* Paso 2 */}
      <Paso n={2} icon={<ListChecks />} titulo="Total a producir">
        <p className="text-5xl font-extrabold text-orange-500">
          {reporte.totalAProducir} <span className="text-lg text-amasa-700 font-semibold">unidades</span>
        </p>
      </Paso>

      {/* Paso 3 y 4 */}
      <Paso n={3} icon={<Wheat />} titulo="Insumos necesarios y validación contra stock">
        {reporte.insumosNecesarios.length === 0 ? (
          <p className="text-amasa-700">Sin insumos requeridos.</p>
        ) : (
          <div className="space-y-3">
            {reporte.insumosNecesarios.map((i) => (
              <div
                key={i.id}
                className={`rounded-2xl p-4 border-2 ${
                  i.alcanza
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {i.alcanza ? (
                      <ShieldCheck className="text-green-600" />
                    ) : (
                      <AlertTriangle className="text-red-600" />
                    )}
                    <span className="font-bold">{i.nombre}</span>
                  </div>
                  <span
                    className={`chip ${
                      i.alcanza ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {i.alcanza ? 'Alcanza' : `Falta ${i.faltante} ${i.unidad}`}
                  </span>
                </div>
                <div className="grid grid-cols-3 text-sm gap-3">
                  <Stat label="Necesario" valor={`${i.necesario} ${i.unidad}`} />
                  <Stat label="Stock actual" valor={`${i.stockActual} ${i.unidad}`} />
                  <Stat label="Stock mínimo" valor={`${i.stockMinimo} ${i.unidad}`} />
                </div>
                <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full ${i.alcanza ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{
                      width: `${Math.min(100, (i.stockActual / Math.max(i.necesario, 0.0001)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Paso>
    </div>
  );
}

function Paso({
  n,
  icon,
  titulo,
  children,
}: {
  n: number;
  icon: any;
  titulo: string;
  children: any;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-amasa-500 text-white grid place-items-center font-extrabold">
          {n}
        </div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-amasa-500">{icon}</span>
          {titulo}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-amasa-600 uppercase">{label}</p>
      <p className="font-bold">{valor}</p>
    </div>
  );
}
