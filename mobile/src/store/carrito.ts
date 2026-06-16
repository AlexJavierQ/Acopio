import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProductoMin {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl: string;
}

interface CarritoState {
  proveedorId: number | null;
  proveedorNombre: string | null;
  items: Record<number, { producto: ProductoMin; cantidad: number }>;
  /** Setea el proveedor del carrito; si cambia respecto al actual, vacía los items. */
  setProveedor: (proveedorId: number, proveedorNombre: string) => void;
  agregar: (p: ProductoMin) => void;
  quitar: (id: number) => void;
  setCantidad: (id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCarrito = create<CarritoState>()(
  persist(
    (set, get) => ({
      proveedorId: null,
      proveedorNombre: null,
      items: {},
      setProveedor: (proveedorId, proveedorNombre) =>
        set((s) =>
          s.proveedorId === proveedorId
            ? { proveedorId, proveedorNombre }
            : { proveedorId, proveedorNombre, items: {} }
        ),
      agregar: (p) =>
        set((s) => {
          const cur = s.items[p.id];
          return {
            items: { ...s.items, [p.id]: { producto: p, cantidad: (cur?.cantidad || 0) + 1 } },
          };
        }),
      quitar: (id) =>
        set((s) => {
          const next = { ...s.items };
          delete next[id];
          return { items: next };
        }),
      setCantidad: (id, cantidad) =>
        set((s) => {
          if (cantidad <= 0) {
            const next = { ...s.items };
            delete next[id];
            return { items: next };
          }
          const cur = s.items[id];
          if (!cur) return s;
          return { items: { ...s.items, [id]: { ...cur, cantidad } } };
        }),
      vaciar: () => set({ items: {}, proveedorId: null, proveedorNombre: null }),
      total: () =>
        Object.values(get().items).reduce((s, it) => s + it.cantidad * it.producto.precio, 0),
      cantidadTotal: () =>
        Object.values(get().items).reduce((s, it) => s + it.cantidad, 0),
    }),
    {
      name: 'acopio-carrito',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
