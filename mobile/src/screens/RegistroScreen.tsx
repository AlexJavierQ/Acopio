import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Phone, Lock, MapPin, Store, FileText, ArrowRight, ArrowLeft } from 'lucide-react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { api } from '../lib/api';
import { useAuth, Usuario, Rol } from '../store/auth';
import { colors, fonts, radii, spacing } from '../theme';
import type { AuthStackParamList } from '../navigation/types';

export default function RegistroScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const setAuth = useAuth((s) => s.setAuth);
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    password: '',
    direccion: '',
    rol: 'CLIENTE' as Rol,
    nombreNegocio: '',
    descripcion: '',
    fotoUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function crear() {
    if (!form.nombre || !form.telefono || form.password.length < 4) {
      Alert.alert('Faltan datos', 'Nombre, teléfono y contraseña (mín. 4) son obligatorios.');
      return;
    }
    if (form.rol === 'PROVEEDOR' && !form.nombreNegocio) {
      Alert.alert('Falta el negocio', 'Los proveedores necesitan un nombre de negocio.');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        nombre: form.nombre,
        telefono: form.telefono,
        password: form.password,
        rol: form.rol,
        direccion: form.direccion || undefined,
      };
      if (form.rol === 'PROVEEDOR') {
        payload.nombreNegocio = form.nombreNegocio;
        payload.descripcion = form.descripcion || undefined;
        payload.fotoUrl = form.fotoUrl || undefined;
      }
      const r = await api<{ token: string; usuario: Usuario }>('/auth/registro', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAuth(r.token, r.usuario);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={10}>
            <ArrowLeft size={18} color={colors.textMuted} />
            <Text style={styles.backText}>Volver</Text>
          </Pressable>

          <Text style={styles.h1}>Crear cuenta</Text>
          <Text style={styles.muted}>Únete a Acopio en segundos.</Text>

          <Text style={styles.label}>Soy</Text>
          <View style={styles.rolRow}>
            {(['CLIENTE', 'PROVEEDOR'] as const).map((r) => {
              const activo = form.rol === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => set('rol', r)}
                  style={[styles.rolBtn, activo && styles.rolBtnActivo]}
                >
                  <Text style={[styles.rolText, activo && styles.rolTextActivo]}>
                    {r === 'CLIENTE' ? '🛒 Mayorista' : '🏪 Proveedor'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ gap: 14, marginTop: spacing(4) }}>
            <Input
              label="Nombre"
              placeholder="Tu nombre completo"
              value={form.nombre}
              onChangeText={(v) => set('nombre', v)}
              icon={<User size={18} color={colors.textMuted} />}
            />
            <Input
              label="Teléfono"
              placeholder="09XXXXXXXX"
              keyboardType="phone-pad"
              value={form.telefono}
              onChangeText={(v) => set('telefono', v)}
              icon={<Phone size={18} color={colors.textMuted} />}
            />
            <Input
              label="Contraseña"
              placeholder="Mínimo 4 caracteres"
              secureTextEntry
              value={form.password}
              onChangeText={(v) => set('password', v)}
              icon={<Lock size={18} color={colors.textMuted} />}
            />

            {form.rol === 'PROVEEDOR' && (
              <>
                <Input
                  label="Nombre del negocio"
                  placeholder="Ej. Distribuidora La Cosecha"
                  value={form.nombreNegocio}
                  onChangeText={(v) => set('nombreNegocio', v)}
                  icon={<Store size={18} color={colors.textMuted} />}
                />
                <Input
                  label="Descripción breve"
                  placeholder="¿Qué vendes? ¿A quién?"
                  value={form.descripcion}
                  onChangeText={(v) => set('descripcion', v)}
                  multiline
                  icon={<FileText size={18} color={colors.textMuted} />}
                />
                <Input
                  label="Foto / logo URL (opcional)"
                  placeholder="https://..."
                  autoCapitalize="none"
                  value={form.fotoUrl}
                  onChangeText={(v) => set('fotoUrl', v)}
                />
              </>
            )}

            <Input
              label="Dirección (opcional)"
              placeholder="Tu barrio o calle"
              value={form.direccion}
              onChangeText={(v) => set('direccion', v)}
              icon={<MapPin size={18} color={colors.textMuted} />}
            />

            <Button
              title={loading ? 'Creando…' : 'Crear cuenta'}
              onPress={crear}
              loading={loading}
              icon={<ArrowRight size={18} color={colors.white} />}
              fullWidth
            />
          </View>

          <Pressable onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing(5), alignSelf: 'center' }}>
            <Text style={styles.muted}>
              ¿Ya tienes cuenta? <Text style={styles.link}>Inicia sesión</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(12) },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing(3) },
  backText: { color: colors.textMuted, fontWeight: '600' },
  h1: { fontSize: fonts.h1, fontWeight: '800', color: colors.text },
  muted: { color: colors.textMuted, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: spacing(5), marginBottom: spacing(2) },
  rolRow: { flexDirection: 'row', gap: spacing(2) },
  rolBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  rolBtnActivo: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  rolText: { fontWeight: '700', color: colors.textMuted },
  rolTextActivo: { color: colors.text },
});
