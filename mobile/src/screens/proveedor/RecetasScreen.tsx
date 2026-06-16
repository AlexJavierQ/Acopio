import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react-native';
import Card from '../../components/Card';
import { api, formatoUSD } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';
import type { InventarioStackParamList } from '../../navigation/types';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl: string;
  activo: boolean;
  _count?: { recetas: number };
}

type Nav = NativeStackNavigationProp<InventarioStackParamList, 'Recetas'>;

export default function RecetasScreen() {
  const navigation = useNavigation<Nav>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const data = await api<Producto[]>('/productos');
      setProductos(data.filter((p) => p.activo));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={styles.list}
      data={productos}
      keyExtractor={(p) => String(p.id)}
      ListHeaderComponent={
        <Text style={styles.intro}>
          Define qué materias primas y cuánto usa cada producto. Con esto la app calcula si tu inventario alcanza para los
          pedidos.
        </Text>
      }
      ListEmptyComponent={
        <Text style={[styles.muted, { textAlign: 'center', marginTop: spacing(8) }]}>
          No tienes productos. Crea productos para definir sus recetas.
        </Text>
      }
      renderItem={({ item: p }) => {
        const conReceta = (p._count?.recetas ?? 0) > 0;
        return (
          <Pressable onPress={() => navigation.navigate('RecetaEditor', { productoId: p.id, nombre: p.nombre })}>
            <Card style={styles.row}>
              <Image source={{ uri: p.imagenUrl }} style={styles.img} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.nombre} numberOfLines={1}>
                  {p.nombre}
                </Text>
                <Text style={styles.muted}>{formatoUSD(p.precio)}</Text>
                <View style={styles.estadoRow}>
                  {conReceta ? (
                    <>
                      <CheckCircle2 size={13} color={colors.success} />
                      <Text style={[styles.estadoText, { color: colors.success }]}>
                        {p._count!.recetas} insumo{p._count!.recetas === 1 ? '' : 's'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={13} color={colors.warning} />
                      <Text style={[styles.estadoText, { color: colors.warning }]}>Sin receta</Text>
                    </>
                  )}
                </View>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </Card>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  list: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(3) },
  intro: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: spacing(1) },
  muted: { color: colors.textMuted, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  img: { width: 52, height: 52, borderRadius: radii.md, backgroundColor: colors.primaryLight },
  nombre: { fontWeight: '800', color: colors.text, fontSize: 15 },
  estadoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  estadoText: { fontSize: 12, fontWeight: '700' },
});
