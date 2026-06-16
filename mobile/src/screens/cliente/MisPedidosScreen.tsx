import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Clock, ShoppingBag, Store, Handshake, Gift, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import EstadoChip, { Estado } from '../../components/EstadoChip';
import { animateLayout } from '../../components/Motion';
import { api, formatoUSD } from '../../lib/api';
import { colors, radii, spacing } from '../../theme';

interface Pedido {
  id: number;
  fecha: string;
  horaEntrega: string;
  estado: string;
  subtotal: number;
  descuento: number;
  total: number;
  proveedor: { id: number; nombre: string; nombreNegocio: string | null; fotoUrl: string | null };
  items: {
    id: number;
    cantidad: number;
    precioUnitario: number;
    esBono: boolean;
    producto: { id: number; nombre: string; imagenUrl: string };
  }[];
  negociacion: null | {
    id: number;
    estado: string;
    tipo: string | null;
    valor: number | null;
    notaProveedor: string | null;
  };
}

export default function MisPedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const data = await api<Pedido[]>('/pedidos');
      setPedidos(data);
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

  if (pedidos.length === 0) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={<ShoppingBag size={64} color={colors.primaryLight} />}
          titulo="Aún no tienes pedidos"
          texto="Descubre proveedores y haz tu primer pedido."
        />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.list}
      data={pedidos}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => <PedidoCard pedido={item} />}
    />
  );
}

function PedidoCard({ pedido: p }: { pedido: Pedido }) {
  const navigation = useNavigation<any>();
  const [abierto, setAbierto] = useState(false);
  const productos = p.items.filter((i) => !i.esBono);
  const bonos = p.items.filter((i) => i.esBono);
  const nProductos = productos.reduce((s, i) => s + i.cantidad, 0);

  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      {/* Cabecera siempre visible */}
      <Pressable
        onPress={() => {
          animateLayout();
          setAbierto((v) => !v);
        }}
        style={({ pressed }) => [styles.headerBtn, pressed && { backgroundColor: colors.primarySoft }]}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.storeRow}>
            <Store size={14} color={colors.text} />
            <Text style={styles.store} numberOfLines={1}>
              {p.proveedor.nombreNegocio || p.proveedor.nombre}
            </Text>
          </View>
          <Text style={styles.resumen}>
            #{p.id} · {nProductos} {nProductos === 1 ? 'producto' : 'productos'} · {formatoUSD(p.total)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <EstadoChip estado={p.estado as Estado} />
          {abierto ? (
            <ChevronUp size={18} color={colors.textMuted} />
          ) : (
            <ChevronDown size={18} color={colors.textMuted} />
          )}
        </View>
      </Pressable>

      {/* Detalle desplegable */}
      {abierto && (
        <View style={styles.detalle}>
          <View style={styles.metaRow}>
            <Clock size={13} color={colors.textMuted} />
            <Text style={styles.muted}>
              Entrega: {p.horaEntrega} · {new Date(p.fecha).toLocaleDateString('es-EC')}
            </Text>
          </View>

          <View style={{ gap: 4 }}>
            {productos.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <Text style={styles.itemText}>
                  {it.cantidad}× {it.producto.nombre}
                </Text>
                <Text style={styles.itemText}>{formatoUSD(it.cantidad * it.precioUnitario)}</Text>
              </View>
            ))}
            {bonos.length > 0 && (
              <View style={styles.bonoBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <Gift size={12} color={colors.success} />
                  <Text style={styles.bonoTitulo}>Bonos incluidos</Text>
                </View>
                {bonos.map((b) => (
                  <Text key={b.id} style={styles.bonoText}>
                    + {b.cantidad}× {b.producto.nombre}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {p.negociacion && (
            <View style={[styles.negBox, { backgroundColor: negStyle(p.negociacion.estado).backgroundColor }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Handshake size={12} color={negStyle(p.negociacion.estado).color} />
                <Text style={[styles.negText, { color: negStyle(p.negociacion.estado).color, fontWeight: '800' }]}>
                  {p.negociacion.estado === 'SOLICITADA' && 'Negociación pendiente'}
                  {p.negociacion.estado === 'ACEPTADA' && 'Negociación aceptada'}
                  {p.negociacion.estado === 'RECHAZADA' && 'Negociación rechazada'}
                </Text>
              </View>
              {p.negociacion.notaProveedor ? (
                <Text style={[styles.negText, { color: negStyle(p.negociacion.estado).color }]}>
                  "{p.negociacion.notaProveedor}"
                </Text>
              ) : null}
            </View>
          )}

          <View style={styles.totales}>
            <View style={styles.itemRow}>
              <Text style={styles.muted}>Subtotal</Text>
              <Text style={styles.muted}>{formatoUSD(p.subtotal)}</Text>
            </View>
            {p.descuento > 0 && (
              <View style={styles.itemRow}>
                <Text style={styles.descuento}>Descuento</Text>
                <Text style={styles.descuento}>- {formatoUSD(p.descuento)}</Text>
              </View>
            )}
            <View style={styles.itemRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValor}>{formatoUSD(p.total)}</Text>
            </View>
          </View>

          <Pressable
            onPress={() =>
              navigation.getParent()?.navigate('Mensajes', {
                screen: 'Chat',
                params: {
                  otroId: p.proveedor.id,
                  nombre: p.proveedor.nombreNegocio || p.proveedor.nombre,
                },
              })
            }
            style={styles.chatLink}
          >
            <MessageCircle size={13} color={colors.primaryDark} />
            <Text style={styles.chatText}>Chatear con el proveedor</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

function negStyle(estado: string) {
  if (estado === 'ACEPTADA') return { backgroundColor: colors.successBg, color: colors.success };
  if (estado === 'RECHAZADA') return { backgroundColor: colors.dangerBg, color: colors.danger };
  return { backgroundColor: colors.warningBg, color: colors.warning };
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  list: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(3) },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), padding: spacing(4) },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  store: { fontWeight: '800', color: colors.text, flexShrink: 1 },
  resumen: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  detalle: {
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(4),
    gap: spacing(3),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing(3),
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  muted: { color: colors.textMuted, fontSize: 13 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemText: { color: colors.text, fontSize: 13 },
  bonoBox: {
    marginTop: spacing(1),
    padding: spacing(2),
    borderRadius: radii.md,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  bonoTitulo: { fontWeight: '800', color: colors.success, fontSize: 12 },
  bonoText: { color: colors.success, fontSize: 12 },
  negBox: { borderRadius: radii.md, padding: spacing(3), gap: 2 },
  negText: { fontSize: 12 },
  totales: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing(3), gap: 4 },
  descuento: { color: colors.success, fontWeight: '700', fontSize: 13 },
  totalLabel: { fontWeight: '800', color: colors.text },
  totalValor: { fontWeight: '800', color: colors.primaryDark },
  chatLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chatText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
});
