import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle2, AlertTriangle, ShoppingCart, Boxes, Factory, BookOpen } from 'lucide-react-native';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';
import type { InventarioStackParamList } from '../../navigation/types';

interface InsumoNecesario {
  id: number;
  nombre: string;
  unidad: string;
  necesario: number;
  stockActual: number;
  alcanza: boolean;
  faltante: number;
}
interface Requerimientos {
  cantidadPedidos: number;
  totalAProducir: number;
  unidadesPorProducto: { productoId: number; nombre: string; cantidad: number }[];
  insumosNecesarios: InsumoNecesario[];
  listaCompras: InsumoNecesario[];
  productosSinReceta: { productoId: number; nombre: string; cantidad: number }[];
  todoAlcanza: boolean;
}

type Nav = NativeStackNavigationProp<InventarioStackParamList, 'Requerimientos'>;

export default function RequerimientosScreen() {
  const navigation = useNavigation<Nav>();
  const [data, setData] = useState<Requerimientos | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const d = await api<Requerimientos>('/produccion/requerimientos');
      setData(d);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  if (!data || data.cantidadPedidos === 0) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={<Factory size={56} color={colors.primaryLight} />}
          titulo="Sin pedidos pendientes"
          texto="Cuando tengas pedidos por producir, aquí verás si tu inventario alcanza."
        />
      </View>
    );
  }

  const alcanza = data.todoAlcanza;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            cargar();
          }}
          tintColor={colors.primary}
        />
      }
    >
      {/* Estado general */}
      <Card style={[styles.banner, { backgroundColor: alcanza ? colors.successBg : colors.warningBg }]}>
        {alcanza ? <CheckCircle2 size={40} color={colors.success} /> : <AlertTriangle size={40} color={colors.warning} />}
        <Text style={[styles.bannerTitulo, { color: alcanza ? colors.success : colors.warning }]}>
          {alcanza ? 'Tu inventario alcanza' : 'Te faltan insumos'}
        </Text>
        <Text style={styles.bannerSub}>
          {alcanza
            ? `Puedes producir los ${data.cantidadPedidos} pedido${data.cantidadPedidos === 1 ? '' : 's'} pendiente${data.cantidadPedidos === 1 ? '' : 's'}.`
            : `Necesitas comprar ${data.listaCompras.length} insumo${data.listaCompras.length === 1 ? '' : 's'} para cumplir los pedidos.`}
        </Text>
      </Card>

      {/* Resumen */}
      <View style={styles.statsRow}>
        <Stat icon={<Boxes size={18} color={colors.primaryDark} />} valor={data.cantidadPedidos} label="Pedidos" />
        <Stat icon={<Factory size={18} color={colors.primaryDark} />} valor={data.totalAProducir} label="Unidades" />
      </View>

      {/* Lista de compras */}
      {data.listaCompras.length > 0 && (
        <View>
          <View style={styles.seccionRow}>
            <ShoppingCart size={18} color={colors.danger} />
            <Text style={styles.seccion}>Lista de compras</Text>
          </View>
          <Card style={{ gap: spacing(1), borderColor: '#fca5a5' }} padded={false}>
            {data.listaCompras.map((i, idx) => (
              <View key={i.id} style={[styles.compraRow, idx > 0 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.insumoNombre}>{i.nombre}</Text>
                  <Text style={styles.muted}>
                    Tienes {i.stockActual} · necesitas {i.necesario} {i.unidad}
                  </Text>
                </View>
                <View style={styles.faltanteBadge}>
                  <Text style={styles.faltanteText}>
                    +{i.faltante} {i.unidad}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Todos los insumos necesarios */}
      {data.insumosNecesarios.length > 0 && (
        <View>
          <View style={styles.seccionRow}>
            <Boxes size={18} color={colors.text} />
            <Text style={styles.seccion}>Insumos necesarios</Text>
          </View>
          <Card style={{ gap: spacing(1) }} padded={false}>
            {data.insumosNecesarios.map((i, idx) => (
              <View key={i.id} style={[styles.row, idx > 0 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.insumoNombre}>{i.nombre}</Text>
                  <Text style={styles.muted}>
                    Necesario: {i.necesario} {i.unidad} · Stock: {i.stockActual} {i.unidad}
                  </Text>
                </View>
                {i.alcanza ? (
                  <CheckCircle2 size={20} color={colors.success} />
                ) : (
                  <AlertTriangle size={20} color={colors.danger} />
                )}
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Productos a producir */}
      <View>
        <View style={styles.seccionRow}>
          <Factory size={18} color={colors.text} />
          <Text style={styles.seccion}>A producir</Text>
        </View>
        <Card style={{ gap: spacing(1) }} padded={false}>
          {data.unidadesPorProducto.map((u, idx) => (
            <View key={u.productoId} style={[styles.row, idx > 0 && styles.rowBorder]}>
              <Text style={styles.insumoNombre}>{u.nombre}</Text>
              <Text style={styles.cantProd}>{u.cantidad} u</Text>
            </View>
          ))}
        </Card>
      </View>

      {/* Productos sin receta */}
      {data.productosSinReceta.length > 0 && (
        <Pressable onPress={() => navigation.navigate('Recetas')}>
          <Card style={[styles.avisoReceta]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <BookOpen size={16} color={colors.warning} />
              <Text style={styles.avisoTitulo}>Productos sin receta</Text>
            </View>
            <Text style={styles.muted}>
              No se incluyeron en el cálculo: {data.productosSinReceta.map((p) => p.nombre).join(', ')}. Toca para definir
              sus recetas.
            </Text>
          </Card>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Stat({ icon, valor, label }: { icon: React.ReactNode; valor: number; label: string }) {
  return (
    <Card style={styles.stat}>
      {icon}
      <Text style={styles.statValor}>{valor}</Text>
      <Text style={styles.muted}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(4) },
  banner: { alignItems: 'center', gap: spacing(1), paddingVertical: spacing(5) },
  bannerTitulo: { fontWeight: '800', fontSize: fonts.h2 },
  bannerSub: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: spacing(3) },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValor: { fontSize: fonts.h1, fontWeight: '800', color: colors.text },
  seccionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing(2) },
  seccion: { fontSize: fonts.h3, fontWeight: '800', color: colors.text },
  muted: { color: colors.textMuted, fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2), paddingVertical: spacing(3), paddingHorizontal: spacing(3) },
  compraRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), paddingVertical: spacing(3), paddingHorizontal: spacing(3) },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  insumoNombre: { fontWeight: '700', color: colors.text, fontSize: 14 },
  faltanteBadge: { backgroundColor: colors.dangerBg, borderRadius: radii.md, paddingHorizontal: spacing(2), paddingVertical: spacing(1) },
  faltanteText: { color: colors.danger, fontWeight: '800', fontSize: 13 },
  cantProd: { fontWeight: '800', color: colors.primaryDark, fontSize: 14 },
  avisoReceta: { backgroundColor: colors.warningBg, gap: spacing(1) },
  avisoTitulo: { fontWeight: '800', color: colors.warning },
});
