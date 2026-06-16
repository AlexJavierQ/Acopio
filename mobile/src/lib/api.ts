// Cliente HTTP para la API de Acopio.
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE: string =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ||
  'https://acopio-api.vercel.app/api';

async function getToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem('acopio-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
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
  `$${n.toFixed(2)}`;

export const apiBase = API_BASE;
