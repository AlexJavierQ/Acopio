import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';

export default function Login() {
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api<{ token: string; usuario: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ telefono, password }),
      });
      setAuth(r.token, r.usuario);
      navigate(r.usuario.rol === 'DUENO' ? '/admin' : '/catalogo');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Lado decorativo */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-amasa-500 to-amasa-700 text-white">
        <Logo size={36} />
        <div>
          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            Pan calientito,<br />pedidos sin llamadas.
          </h1>
          <p className="text-amasa-100 text-lg max-w-md">
            Amasa es el CRM hecho en Loja para panaderías y pastelerías que
            quieren producir lo justo, vender más y dormir tranquilas.
          </p>
        </div>
        <div className="flex gap-2 text-amasa-100 text-sm">
          <span>🌾 Hecho en Loja, Ecuador</span>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold mb-2">Bienvenido de nuevo</h2>
          <p className="text-amasa-700 mb-8">Ingresa con tu teléfono.</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-amasa-400" size={20} />
                <input
                  className="input pl-12"
                  inputMode="tel"
                  placeholder="0999000001"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amasa-400" size={20} />
                <input
                  className="input pl-12"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Ingresando…' : (<>Ingresar <ArrowRight size={18} /></>)}
            </button>
          </form>

          <p className="mt-6 text-center text-amasa-700">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-amasa-600 hover:underline">
              Regístrate
            </Link>
          </p>

          <div className="mt-8 p-4 rounded-2xl bg-amasa-50 border border-amasa-100 text-sm text-amasa-900">
            <p className="font-semibold mb-1">Cuentas de prueba:</p>
            <p>👩‍🍳 Dueña: <code>0999000001</code> / <code>amasa123</code></p>
            <p>🛒 Cliente: <code>0999000002</code> / <code>cliente123</code></p>
          </div>

          <Link
            to="/app-preview"
            className="mt-4 block text-center rounded-2xl border-2 border-dashed border-amasa-300 px-4 py-3 text-amasa-700 hover:bg-amasa-50 transition text-sm font-semibold"
          >
            📱 Ver prototipo de la app móvil
          </Link>
        </div>
      </div>
    </div>
  );
}
