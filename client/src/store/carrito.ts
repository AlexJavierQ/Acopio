import { create } from 'zustand';

export interface ProductoMin {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl: string;
}

interface CarritoState {
  items: Record<number, { producto: ProductoMin; cantidad: number }>;
  agregar: (p: ProductoMin) => void;
  quitar: (id: number) => void;
  setCantidad: (id: number, cantidad: number) => void;
  vaciar: () => void;
  cargar: (items: { producto: ProductoMin; cantidad: number }[]) => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCarrito = create<CarritoState>((set, get) => ({
  items: {},
  agregar: (p) =>
    set((s) => {
      const cur = s.items[p.id];
      return {
        items: {
          ...s.items,
          [p.id]: { producto: p, cantidad: (cur?.cantidad || 0) + 1 },
        },
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
  vaciar: () => set({ items: {} }),
  cargar: (arr) =>
    set({
      items: Object.fromEntries(arr.map((x) => [x.producto.id, x])),
    }),
  total: () =>
    Object.values(get().items).reduce(
      (s, it) => s + it.cantidad * it.producto.precio,
      0
    ),
  cantidadTotal: () =>
    Object.values(get().items).reduce((s, it) => s + it.cantidad, 0),
}));
