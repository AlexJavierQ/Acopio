import { Wheat } from 'lucide-react';

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-2xl bg-amasa-500 text-white grid place-items-center shadow-suave"
        style={{ width: size + 12, height: size + 12 }}
      >
        <Wheat size={size - 4} strokeWidth={2.2} />
      </div>
      <span className="text-2xl font-extrabold tracking-tight text-amasa-900">
        Amasa
      </span>
    </div>
  );
}
