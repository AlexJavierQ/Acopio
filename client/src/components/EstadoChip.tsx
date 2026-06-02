export type Estado = 'RECIBIDO' | 'EN_PRODUCCION' | 'LISTO' | 'ENTREGADO';

const estilos: Record<Estado, string> = {
  RECIBIDO: 'bg-amasa-100 text-amasa-900',
  EN_PRODUCCION: 'bg-orange-100 text-orange-700',
  LISTO: 'bg-green-100 text-green-700',
  ENTREGADO: 'bg-amasa-200 text-amasa-900',
};

const labels: Record<Estado, string> = {
  RECIBIDO: 'Recibido',
  EN_PRODUCCION: 'En producción',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
};

export default function EstadoChip({ estado }: { estado: Estado }) {
  return (
    <span className={`chip ${estilos[estado]}`}>
      <span className="w-2 h-2 rounded-full bg-current opacity-70" />
      {labels[estado]}
    </span>
  );
}

export const ESTADOS: Estado[] = ['RECIBIDO', 'EN_PRODUCCION', 'LISTO', 'ENTREGADO'];
export const labelEstado = (e: Estado) => labels[e];
