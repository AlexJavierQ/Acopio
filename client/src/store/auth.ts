import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Rol = 'CLIENTE' | 'PROVEEDOR';

/**
 * "Modo" actual de visualización. Solo aplica a usuarios con rol PROVEEDOR
 * (que pueden alternar entre ver su panel de proveedor y actuar como cliente
 * de otros proveedores). Un CLIENTE siempre está en modo CLIENTE.
 */
export type Modo = 'CLIENTE' | 'PROVEEDOR';

export interface Usuario {
  id: number;
  nombre: string;
  telefono: string;
  rol: Rol;
  direccion?: string | null;
  nombreNegocio?: string | null;
  descripcion?: string | null;
  fotoUrl?: string | null;
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  modo: Modo;
  setAuth: (token: string, usuario: Usuario) => void;
  setModo: (modo: Modo) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      modo: 'CLIENTE',
      setAuth: (token, usuario) =>
        set({ token, usuario, modo: usuario.rol === 'PROVEEDOR' ? 'PROVEEDOR' : 'CLIENTE' }),
      setModo: (modo) => set({ modo }),
      logout: () => set({ token: null, usuario: null, modo: 'CLIENTE' }),
    }),
    { name: 'acopio-auth' },
  ),
);
