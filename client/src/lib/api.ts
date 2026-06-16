// Cliente HTTP simple para la API de Acopio.
// En dev usa proxy de Vite (`/api`). En prod usa VITE_API_URL (ej. https://acopio-api.vercel.app/api).
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

function getToken() {
  try {
    const raw = localStorage.getItem('acopio-auth');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token || null;
  } catch {
    return null;
  }
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = 'Error en la solicitud';
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const formatoUSD = (n: number) =>
  new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
