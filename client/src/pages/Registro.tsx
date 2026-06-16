import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, Phone, Lock, MapPin, Store, FileText, Image as ImageIcon } from 'lucide-react';
import Logo from '../components/Logo';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';

export default function Registro() {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    password: '',
    direccion: '',
    rol: 'CLIENTE' as 'CLIENTE' | 'PROVEEDOR',
    nombreNegocio: '',
    descripcion: '',
    fotoUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api<{ token: string; usuario: any }>('/auth/registro', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setAuth(r.token, r.usuario);
      navigate(r.usuario.rol === 'PROVEEDOR' ? '/admin' : '/proveedores');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-crema">
      <div className="w-full max-w-md card">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-center">Crear cuenta</h2>
        <p className="text-amasa-700 mb-6 text-center">Únete a Acopio en segundos.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Soy</label>
            <div className="grid grid-cols-2 gap-2">
              {(['CLIENTE', 'PROVEEDOR'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm({ ...form, rol: r })}
                  className={`rounded-2xl py-3 font-semibold border-2 transition ${
                    form.rol === r
                      ? 'border-amasa-500 bg-amasa-50 text-amasa-900'
                      : 'border-amasa-100 bg-white text-amasa-700 hover:border-amasa-300'
                  }`}
                >
                  {r === 'CLIENTE' ? '🛒 Mayorista' : '� Proveedor'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Nombre</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-amasa-400" size={20} />
              <input
                className="input pl-12"
                placeholder="Tu nombre completo"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-amasa-400" size={20} />
              <input
                className="input pl-12"
                inputMode="tel"
                placeholder="09XXXXXXXX"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
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
                placeholder="Mínimo 4 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={4}
              />
            </div>
          </div>

          {form.rol === 'PROVEEDOR' && (
            <>
              <div>
                <label className="label">Nombre del negocio</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-amasa-400" size={20} />
                  <input
                    className="input pl-12"
                    placeholder="Ej. Distribuidora La Cosecha"
                    value={form.nombreNegocio}
                    onChange={(e) => setForm({ ...form, nombreNegocio: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Descripción breve</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3 text-amasa-400" size={20} />
                  <textarea
                    className="input pl-12 pt-2.5"
                    rows={2}
                    placeholder="¿Qué vendes? ¿A quién?"
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Foto / logo URL (opcional)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-amasa-400" size={20} />
                  <input
                    className="input pl-12"
                    placeholder="https://..."
                    value={form.fotoUrl}
                    onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="label">Dirección (opcional)</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-amasa-400" size={20} />
              <input
                className="input pl-12"
                placeholder="Tu barrio o calle"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creando…' : (<>Crear cuenta <ArrowRight size={18} /></>)}
          </button>
        </form>

        <p className="mt-6 text-center text-amasa-700">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-amasa-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
