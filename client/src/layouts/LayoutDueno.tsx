import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Factory,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  Megaphone,
  UserPlus,
  Handshake,
  MessageCircle,
  Repeat,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../store/auth';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/pedidos', icon: ClipboardList, label: 'Pedidos' },
  { to: '/admin/negociaciones', icon: Handshake, label: 'Negociaciones' },
  { to: '/admin/afiliados', icon: UserPlus, label: 'Afiliados' },
  { to: '/admin/clientes', icon: Users, label: 'Clientes' },
  { to: '/admin/produccion', icon: Factory, label: 'Producción' },
  { to: '/admin/inventario', icon: Package, label: 'Inventario' },
  { to: '/admin/ofertas', icon: Megaphone, label: 'Ofertas y Marketing' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
];

export default function LayoutDueno() {
  const { usuario, setModo, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  function salir() {
    logout();
    navigate('/login');
  }

  function cambiarAModoCliente() {
    setModo('CLIENTE');
    navigate('/proveedores');
  }

  return (
    <div className="min-h-screen flex bg-crema app-bg">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-amasa-100 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <Logo size={28} />
          <button className="lg:hidden text-amasa-700" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        <nav className="px-4 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-amasa-600 text-white'
                    : 'text-amasa-800 hover:bg-amasa-50'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-amasa-100 bg-white space-y-3">
          <button
            onClick={cambiarAModoCliente}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amasa-50 hover:bg-amasa-100 border border-amasa-100 text-amasa-800 text-sm font-semibold transition active:scale-[0.98]"
            title="Actuar como cliente para hacerle pedidos a otros proveedores"
          >
            <Repeat size={16} />
            Cambiar a modo cliente
          </button>
          <div className="flex items-center justify-between">
            <div className="text-sm min-w-0">
              <p className="font-semibold text-amasa-900 truncate">
                {usuario?.nombreNegocio || usuario?.nombre}
              </p>
              <p className="text-amasa-600 text-xs">Proveedor/a · {usuario?.nombre.split(' ')[0]}</p>
            </div>
            <button
              onClick={salir}
              className="p-2 rounded-xl hover:bg-amasa-50 text-amasa-700 transition shrink-0"
              title="Salir"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-marron/30 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Contenido */}
      <div className="flex-1 min-w-0 relative">
        <header className="lg:hidden glass-strong border-b border-white/40 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setOpen(true)} className="text-amasa-700">
            <Menu />
          </button>
          <Logo size={24} />
          <div className="w-6" />
        </header>
        <main key={location.pathname} className="p-4 lg:p-8 max-w-7xl mx-auto relative animate-fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
