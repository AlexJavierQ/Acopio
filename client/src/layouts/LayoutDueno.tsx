import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen flex bg-gradient-to-br from-amasa-50 via-crema to-amasa-100 relative overflow-hidden">
      {/* Blobs decorativos para liquid glass */}
      <div className="blob bg-amasa-300" style={{ width: 500, height: 500, top: -150, left: -100, opacity: 0.3 }} />
      <div className="blob bg-orange-200" style={{ width: 400, height: 400, top: 200, right: -120, opacity: 0.35 }} />
      <div className="blob bg-amasa-200" style={{ width: 450, height: 450, bottom: -150, left: 200, opacity: 0.3 }} />

      {/* Sidebar glass */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white/65 backdrop-blur-2xl border-r border-white/60 transform transition-transform lg:translate-x-0 shadow-[0_0_40px_rgba(58,42,26,0.05)] ${
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
                `flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-br from-amasa-500 to-amasa-600 text-white shadow-[0_8px_24px_rgba(200,137,63,0.35)] border border-white/20'
                    : 'text-amasa-800 hover:bg-white/50 hover:backdrop-blur'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-white/50 bg-white/40 backdrop-blur-xl space-y-3">
          <button
            onClick={cambiarAModoCliente}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/70 hover:bg-white border border-amasa-200 text-amasa-800 text-sm font-semibold transition active:scale-[0.98]"
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
          className="fixed inset-0 bg-marron/30 backdrop-blur-sm z-20 lg:hidden"
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
        <main className="p-4 lg:p-8 max-w-7xl mx-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
