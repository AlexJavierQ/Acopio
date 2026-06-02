import { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';

import Login from './pages/Login';
import Registro from './pages/Registro';
import AppPreview from './pages/AppPreview';

import LayoutCliente from './layouts/LayoutCliente';
import Catalogo from './pages/cliente/Catalogo';
import HacerPedido from './pages/cliente/HacerPedido';
import Confirmacion from './pages/cliente/Confirmacion';
import MisPedidos from './pages/cliente/MisPedidos';

import LayoutDueno from './layouts/LayoutDueno';
import Dashboard from './pages/dueno/Dashboard';
import Pedidos from './pages/dueno/Pedidos';
import NotaVentaPage from './pages/dueno/NotaVenta';
import Produccion from './pages/dueno/Produccion';
import Inventario from './pages/dueno/Inventario';
import Clientes from './pages/dueno/Clientes';
import ClienteDetalle from './pages/dueno/ClienteDetalle';
import Ofertas from './pages/dueno/Ofertas';

function ProtegidaCliente({ children }: { children: ReactNode }) {
  const { token, usuario } = useAuth();
  if (!token || !usuario) return <Navigate to="/login" replace />;
  if (usuario.rol === 'DUENO') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function ProtegidaDueno({ children }: { children: ReactNode }) {
  const { token, usuario } = useAuth();
  if (!token || !usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== 'DUENO') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Inicio() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return <Navigate to={usuario.rol === 'DUENO' ? '/admin' : '/catalogo'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/app-preview" element={<AppPreview />} />

      <Route
        element={
          <ProtegidaCliente>
            <LayoutCliente />
          </ProtegidaCliente>
        }
      >
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/pedido" element={<HacerPedido />} />
        <Route path="/confirmacion/:id" element={<Confirmacion />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtegidaDueno>
            <LayoutDueno />
          </ProtegidaDueno>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="pedidos/:id/nota" element={<NotaVentaPage />} />
        <Route path="produccion" element={<Produccion />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:id" element={<ClienteDetalle />} />
        <Route path="ofertas" element={<Ofertas />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
