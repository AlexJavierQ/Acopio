import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Rol = 'CLIENTE' | 'PROVEEDOR';

export interface Usuario {
  id: number;
  nombre: string;
  telefono: string;
  rol: Rol;
  direccion: string | null;
  nombreNegocio: string | null;
  descripcion: string | null;
  fotoUrl: string | null;
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  modo: Rol; // qué cara de la app está usando ahora
  hidratado: boolean; // true cuando AsyncStorage terminó de cargar
  setAuth: (token: string, usuario: Usuario) => void;
  setModo: (modo: Rol) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      modo: 'CLIENTE',
      hidratado: false,
      setAuth: (token, usuario) =>
        set({ token, usuario, modo: usuario.rol }),
      setModo: (modo) => set({ modo }),
      logout: () => set({ token: null, usuario: null, modo: 'CLIENTE' }),
    }),
    {
      name: 'acopio-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // No persistimos `hidratado` (es estado de runtime).
      partialize: (s) => ({ token: s.token, usuario: s.usuario, modo: s.modo }),
      onRehydrateStorage: () => () => {
        // Se ejecuta cuando termina la rehidratación desde AsyncStorage.
        useAuth.setState({ hidratado: true });
      },
    }
  )
);
