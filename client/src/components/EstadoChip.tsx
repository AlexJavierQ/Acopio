export type Estado = 'RECIBIDO' | 'EN_PRODUCCION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';

const estilos: Record<Estado, string> = {
  RECIBIDO: 'bg-amasa-100 text-amasa-900',
  EN_PRODUCCION: 'bg-orange-100 text-orange-700',
  LISTO: 'bg-green-100 text-green-700',
  ENTREGADO: 'bg-amasa-200 text-amasa-900',
  CANCELADO: 'bg-red-100 text-red-700',
};

const labels: Record<Estado, string> = {
  RECIBIDO: 'Recibido',
  EN_PRODUCCION: 'En producción',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
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
// CANCELADO no entra en el flujo normal del proveedor (lo dispara el cliente).
export const labelEstado = (e: Estado) => labels[e];
