import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Save, Package } from 'lucide-react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { api } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';
import type { InventarioStackParamList } from '../../navigation/types';

interface Insumo {
  id: number;
  nombre: string;
  unidad: string;
}

type Nav = NativeStackNavigationProp<InventarioStackParamList, 'RecetaEditor'>;

export default function RecetaEditorScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<InventarioStackParamList, 'RecetaEditor'>>();
  const { productoId, nombre } = route.params;

  const [insumos, setInsumos] = useState<Insumo[]>([]);
  // cantidades por insumoId (string para el input)
  const [cantidades, setCantidades] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [ins, prod] = await Promise.all([
        api<Insumo[]>('/insumos'),
        api<{ recetas: { insumoId: number; cantidad: number }[] }>(`/productos/${productoId}`),
      ]);
      setInsumos(ins);
      const map: Record<number, string> = {};
      for (const r of prod.recetas) map[r.insumoId] = String(r.cantidad);
      setCantidades(map);
    } finally {
      setLoading(false);
    }
  }, [productoId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function guardar() {
    setGuardando(true);
    try {
      const items = Object.entries(cantidades)
        .map(([insumoId, v]) => ({ insumoId: Number(insumoId), cantidad: Number(v) }))
        .filter((i) => i.cantidad > 0);
      await api(`/productos/${productoId}/receta`, {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          ¿Cuánto de cada materia prima se usa para hacer <Text style={{ fontWeight: '800', color: colors.text }}>1 unidad</Text> de "{nombre}"? Deja en blanco lo que no use.
        </Text>

        {insumos.length === 0 ? (
          <Card style={{ alignItems: 'center', gap: spacing(2), paddingVertical: spacing(8) }}>
            <Package size={44} color={colors.primaryLight} />
            <Text style={styles.muted}>Primero registra materias primas en Inventario.</Text>
          </Card>
        ) : (
          <Card style={{ gap: spacing(1) }} padded={false}>
            {insumos.map((i, idx) => (
              <View key={i.id} style={[styles.row, idx > 0 && styles.rowBorder]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.insumoNombre}>{i.nombre}</Text>
                  <Text style={styles.muted}>por unidad ({i.unidad})</Text>
                </View>
                <TextInput
                  value={cantidades[i.id] ?? ''}
                  onChangeText={(v) => setCantidades((c) => ({ ...c, [i.id]: v }))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textSubtle}
                  style={styles.input}
                />
                <Text style={styles.unidad}>{i.unidad}</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      {insumos.length > 0 && (
        <View style={styles.footer}>
          <Button
            title={guardando ? 'Guardando…' : 'Guardar receta'}
            onPress={guardar}
            loading={guardando}
            icon={<Save size={18} color={colors.white} />}
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(6), gap: spacing(3) },
  intro: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  muted: { color: colors.textMuted, fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), paddingVertical: spacing(3), paddingHorizontal: spacing(3) },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  insumoNombre: { fontWeight: '700', color: colors.text, fontSize: 15 },
  input: {
    width: 84,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(2),
    color: colors.text,
    backgroundColor: colors.white,
    fontSize: 15,
    textAlign: 'right',
  },
  unidad: { width: 56, color: colors.textMuted, fontSize: 12 },
  footer: { padding: spacing(4), borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
});
