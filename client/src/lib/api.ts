// Cliente HTTP simple para la API de Amasa
const API_BASE = '/api';

function getToken() {
  try {
    const raw = localStorage.getItem('amasa-auth');
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
