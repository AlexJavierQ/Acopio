import { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';

import Login from './pages/Login';
import Registro from './pages/Registro';
import AppPreview from './pages/AppPreview';

import LayoutCliente from './layouts/LayoutCliente';
import Proveedores from './pages/cliente/Proveedores';
import ProveedorDetalle from './pages/cliente/ProveedorDetalle';
import HacerPedido from './pages/cliente/HacerPedido';
import Confirmacion from './pages/cliente/Confirmacion';
import MisPedidos from './pages/cliente/MisPedidos';
import MisAfiliaciones from './pages/cliente/MisAfiliaciones';

import LayoutDueno from './layouts/LayoutDueno';
import Dashboard from './pages/dueno/Dashboard';
import Pedidos from './pages/dueno/Pedidos';
import NotaVentaPage from './pages/dueno/NotaVenta';
import Produccion from './pages/dueno/Produccion';
import Inventario from './pages/dueno/Inventario';
import Clientes from './pages/dueno/Clientes';
import ClienteDetalle from './pages/dueno/ClienteDetalle';
import Ofertas from './pages/dueno/Ofertas';
import Afiliados from './pages/dueno/Afiliados';
import Negociaciones from './pages/dueno/Negociaciones';

import Chat from './pages/comun/Chat';

/** Pantallas accesibles para CUALQUIER usuario autenticado (en cualquier modo). */
function ProtegidaAuth({ children }: { children: ReactNode }) {
  const { token, usuario } = useAuth();
  if (!token || !usuario) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Solo si el usuario está en modo CLIENTE (rol CLIENTE, o PROVEEDOR con modo=CLIENTE). */
function ProtegidaModoCliente({ children }: { children: ReactNode }) {
  const { token, usuario, modo } = useAuth();
  if (!token || !usuario) return <Navigate to="/login" replace />;
  if (usuario.rol === 'PROVEEDOR' && modo === 'PROVEEDOR') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

/** Solo si el usuario es PROVEEDOR y está en modo PROVEEDOR. */
function ProtegidaProveedor({ children }: { children: ReactNode }) {
  const { token, usuario, modo } = useAuth();
  if (!token || !usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== 'PROVEEDOR') return <Navigate to="/proveedores" replace />;
  if (modo !== 'PROVEEDOR') return <Navigate to="/proveedores" replace />;
  return <>{children}</>;
}

function Inicio() {
  const { usuario, modo } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol === 'PROVEEDOR' && modo === 'PROVEEDOR') return <Navigate to="/admin" replace />;
  return <Navigate to="/proveedores" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/app-preview" element={<AppPreview />} />

      {/* Modo CLIENTE: descubrir proveedores, pedir, ver mis pedidos, mis afiliaciones */}
      <Route
        element={
          <ProtegidaModoCliente>
            <LayoutCliente />
          </ProtegidaModoCliente>
        }
      >
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/proveedores/:id" element={<ProveedorDetalle />} />
        <Route path="/proveedores/:id/pedido" element={<HacerPedido />} />
        <Route path="/confirmacion/:id" element={<Confirmacion />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/mis-afiliaciones" element={<MisAfiliaciones />} />
        {/* Compat: catálogo viejo redirige a proveedores */}
        <Route path="/catalogo" element={<Navigate to="/proveedores" replace />} />
      </Route>

      {/* Chat es accesible desde cualquier modo (es el mismo chat) */}
      <Route
        path="/chat"
        element={
          <ProtegidaAuth>
            <Chat />
          </ProtegidaAuth>
        }
      />
      <Route
        path="/chat/:otroId"
        element={
          <ProtegidaAuth>
            <Chat />
          </ProtegidaAuth>
        }
      />

      {/* Modo PROVEEDOR: panel completo */}
      <Route
        path="/admin"
        element={
          <ProtegidaProveedor>
            <LayoutDueno />
          </ProtegidaProveedor>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="pedidos/:id/nota" element={<NotaVentaPage />} />
        <Route path="produccion" element={<Produccion />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:id" element={<ClienteDetalle />} />
        <Route path="afiliados" element={<Afiliados />} />
        <Route path="negociaciones" element={<Negociaciones />} />
        <Route path="ofertas" element={<Ofertas />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
