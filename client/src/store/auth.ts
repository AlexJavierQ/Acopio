import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Rol = 'CLIENTE' | 'DUENO';

export interface Usuario {
  id: number;
  nombre: string;
  telefono: string;
  rol: Rol;
  direccion?: string | null;
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  setAuth: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      setAuth: (token, usuario) => set({ token, usuario }),
      logout: () => set({ token: null, usuario: null }),
    }),
    { name: 'amasa-auth' }
  )
);
