/**
 * Logo de Acopio: 3 círculos apilados que evocan sacos/cajas en bodega.
 * Geometría monoline cálida, paleta tierra.
 */
export default function Logo({ size = 32 }: { size?: number }) {
  const box = size + 12;
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-2xl bg-gradient-to-br from-amasa-500 to-amasa-700 text-white grid place-items-center shadow-suave border border-white/20"
        style={{ width: box, height: box }}
      >
        <AcopioMark size={size - 4} />
      </div>
      <span className="text-2xl font-extrabold tracking-tight text-amasa-900">
        Acopio
      </span>
    </div>
  );
}

function AcopioMark({ size = 28 }: { size?: number }) {
  // 3 círculos apilados en pirámide invertida (acopio / depósito)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="16" r="3.5" />
      <circle cx="17" cy="16" r="3.5" />
      <circle cx="12" cy="7" r="3.5" />
    </svg>
  );
}
