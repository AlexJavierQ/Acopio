import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, ClipboardList, LogOut, Store, MessageCircle, UserCheck, Repeat } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../store/auth';
import { useCarrito } from '../store/carrito';

export default function LayoutCliente() {
  const { usuario, setModo, logout } = useAuth();
  const cantidad = useCarrito((s) => s.cantidadTotal());
  const navigate = useNavigate();

  function salir() {
    logout();
    navigate('/login');
  }

  function volverAModoProveedor() {
    setModo('PROVEEDOR');
    navigate('/admin');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-[11px] font-semibold transition ${
      isActive ? 'text-amasa-600' : 'text-amasa-700 hover:text-amasa-600'
    }`;

  const esProveedor = usuario?.rol === 'PROVEEDOR';

  return (
    <div className="min-h-screen flex flex-col bg-crema relative">
      {/* Header */}
      <header className="bg-white border-b border-amasa-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size={28} />
          <div className="flex items-center gap-2">
            {esProveedor && (
              <button
                onClick={volverAModoProveedor}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amasa-100 hover:bg-amasa-200 text-amasa-800 text-xs font-semibold transition"
                title="Volver a tu panel de proveedor"
              >
                <Repeat size={14} />
                Mi negocio
              </button>
            )}
            <span className="hidden sm:block text-sm text-amasa-700 px-2">
              Hola, <strong>{usuario?.nombre.split(' ')[0]}</strong>
            </span>
            <button
              onClick={salir}
              className="p-2 rounded-xl hover:bg-amasa-50 text-amasa-700"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-28 relative">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="bg-white border-t border-amasa-100 fixed bottom-0 inset-x-0 z-20">
        <div className={`max-w-5xl mx-auto grid ${esProveedor ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <NavLink to="/proveedores" className={linkClass}>
            <Store size={20} />
            Proveedores
          </NavLink>
          <NavLink to="/mis-afiliaciones" className={linkClass}>
            <UserCheck size={20} />
            Afiliados
          </NavLink>
          <NavLink to="/mis-pedidos" className={linkClass}>
            <ClipboardList size={20} />
            Pedidos
          </NavLink>
          <NavLink to="/chat" className={linkClass}>
            <MessageCircle size={20} />
            Chat
          </NavLink>
          {/* Carrito (vínculo al detalle del proveedor activo) */}
          <CarritoLink linkClass={linkClass} cantidad={cantidad} />
          {esProveedor && (
            <button
              onClick={volverAModoProveedor}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-[11px] font-semibold text-amasa-700 hover:text-amasa-600 transition`}
              title="Volver a mi negocio"
            >
              <Repeat size={20} />
              Mi negocio
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

function CarritoLink({
  linkClass,
  cantidad,
}: {
  linkClass: ({ isActive }: { isActive: boolean }) => string;
  cantidad: number;
}) {
  const proveedorId = useCarrito((s) => s.proveedorId);
  const to = proveedorId ? `/proveedores/${proveedorId}/pedido` : '/proveedores';
  return (
    <NavLink to={to} className={linkClass}>
      <div className="relative">
        <ShoppingCart size={20} />
        {cantidad > 0 && (
          <span className="absolute -top-2 -right-3 bg-amasa-500 text-white text-[10px] rounded-full w-5 h-5 grid place-items-center font-bold">
            {cantidad}
          </span>
        )}
      </div>
      Carrito
    </NavLink>
  );
}
