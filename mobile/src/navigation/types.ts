// Param lists para la navegación de Acopio.
import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Registro: undefined;
};

// --- Cliente ---
export type ProveedoresStackParamList = {
  ProveedoresLista: undefined;
  ProveedorDetalle: { id: number; nombre?: string };
  HacerPedido: { proveedorId: number };
  Confirmacion: { pedidoId: number };
};

export type MensajesStackParamList = {
  Conversaciones: undefined;
  Chat: { otroId: number; nombre?: string };
};

export type ClienteTabParamList = {
  Proveedores: NavigatorScreenParams<ProveedoresStackParamList>;
  MisPedidos: undefined;
  Afiliaciones: undefined;
  Mensajes: NavigatorScreenParams<MensajesStackParamList>;
};

// --- Proveedor ---
export type InventarioStackParamList = {
  Insumos: undefined;
  Recetas: undefined;
  RecetaEditor: { productoId: number; nombre: string };
  Requerimientos: undefined;
};

export type ProveedorTabParamList = {
  Pedidos: undefined;
  Inventario: NavigatorScreenParams<InventarioStackParamList>;
  Negociaciones: undefined;
  Afiliados: undefined;
  Mensajes: NavigatorScreenParams<MensajesStackParamList>;
};
