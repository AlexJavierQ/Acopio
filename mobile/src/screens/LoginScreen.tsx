import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Phone, Lock, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/Button';
import Input from '../components/Input';
import { api } from '../lib/api';
import { useAuth, Usuario } from '../store/auth';
import { colors, fonts, radii, spacing } from '../theme';
import type { AuthStackParamList } from '../navigation/types';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const setAuth = useAuth((s) => s.setAuth);
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function ingresar() {
    if (!telefono || !password) {
      Alert.alert('Faltan datos', 'Ingresa teléfono y contraseña');
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ token: string; usuario: Usuario }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ telefono, password }),
      });
      setAuth(res.token, res.usuario);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  function rellenarDemo(tel: string, pass: string) {
    setTelefono(tel);
    setPassword(pass);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.logo}>
              <View style={[styles.logoCircle, { top: 0 }]} />
              <View style={[styles.logoCircle, { top: 14, backgroundColor: colors.primaryDark }]} />
              <View style={[styles.logoCircle, { top: 28, backgroundColor: '#7a3e15' }]} />
            </View>
            <Text style={styles.brand}>Acopio</Text>
            <Text style={styles.tagline}>Mayoristas y proveedores, conectados.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.h2}>Bienvenido</Text>
            <Text style={styles.muted}>Ingresa con tu teléfono.</Text>

            <View style={{ gap: 14, marginTop: 18 }}>
              <Input
                label="Teléfono"
                placeholder="0999000001"
                keyboardType="phone-pad"
                value={telefono}
                onChangeText={setTelefono}
                icon={<Phone size={18} color={colors.textMuted} />}
              />
              <Input
                label="Contraseña"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                icon={<Lock size={18} color={colors.textMuted} />}
              />
              <Button
                title="Ingresar"
                onPress={ingresar}
                loading={loading}
                icon={<ArrowRight size={18} color={colors.white} />}
                fullWidth
              />
              <Button
                title="Crear cuenta"
                variant="ghost"
                onPress={() => navigation.navigate('Registro')}
                fullWidth
              />
            </View>
          </View>

          <View style={styles.demo}>
            <Text style={styles.demoTitle}>Cuentas de prueba</Text>
            <DemoRow label="Proveedor A · Panadería Acopio" tel="0999000001" pass="acopio123" onPress={rellenarDemo} />
            <DemoRow label="Proveedor B · El Granero" tel="0999000010" pass="acopio123" onPress={rellenarDemo} />
            <DemoRow label="Cliente · Tienda San Juan" tel="0999000002" pass="cliente123" onPress={rellenarDemo} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DemoRow({
  label, tel, pass, onPress,
}: { label: string; tel: string; pass: string; onPress: (t: string, p: string) => void }) {
  return (
    <View style={styles.demoRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.demoLabel}>{label}</Text>
        <Text style={styles.demoCreds}>{tel} · {pass}</Text>
      </View>
      <Button title="Usar" variant="secondary" onPress={() => onPress(tel, pass)} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), gap: spacing(5) },
  hero: { alignItems: 'center', marginTop: spacing(4), gap: spacing(2) },
  logo: { width: 64, height: 64, position: 'relative' },
  logoCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    position: 'absolute', left: 14,
    borderWidth: 3, borderColor: colors.bg,
  },
  brand: { fontSize: 32, fontWeight: '800', color: colors.text, marginTop: spacing(8) },
  tagline: { color: colors.textMuted, textAlign: 'center', maxWidth: 280 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing(5),
    borderWidth: 1, borderColor: colors.border,
  },
  h2: { fontSize: fonts.h2, fontWeight: '800', color: colors.text },
  muted: { color: colors.textMuted, marginTop: 4 },
  demo: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: spacing(4),
    gap: spacing(2),
  },
  demoTitle: { fontWeight: '700', color: colors.text, marginBottom: spacing(1) },
  demoRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing(2),
  },
  demoLabel: { fontWeight: '600', color: colors.text, fontSize: 13 },
  demoCreds: { color: colors.textMuted, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
