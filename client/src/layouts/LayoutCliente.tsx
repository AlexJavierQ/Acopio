import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, ClipboardList, LogOut, Store } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../store/auth';
import { useCarrito } from '../store/carrito';

export default function LayoutCliente() {
  const { usuario, logout } = useAuth();
  const cantidad = useCarrito((s) => s.cantidadTotal());
  const navigate = useNavigate();

  function salir() {
    logout();
    navigate('/login');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition ${
      isActive ? 'text-amasa-600' : 'text-amasa-700 hover:text-amasa-600'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-amasa-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size={28} />
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-amasa-700">
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom nav móvil */}
      <nav className="bg-white border-t border-amasa-100 fixed bottom-0 inset-x-0">
        <div className="max-w-5xl mx-auto grid grid-cols-3">
          <NavLink to="/catalogo" className={linkClass}>
            <Store size={22} />
            Catálogo
          </NavLink>
          <NavLink to="/pedido" className={linkClass}>
            <div className="relative">
              <ShoppingCart size={22} />
              {cantidad > 0 && (
                <span className="absolute -top-2 -right-3 bg-amasa-500 text-white text-[10px] rounded-full w-5 h-5 grid place-items-center font-bold">
                  {cantidad}
                </span>
              )}
            </div>
            Mi pedido
          </NavLink>
          <NavLink to="/mis-pedidos" className={linkClass}>
            <ClipboardList size={22} />
            Mis pedidos
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
