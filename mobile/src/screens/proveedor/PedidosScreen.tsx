import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Clock,
  Handshake,
  Gift,
  MessageCircle,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import Card from '../../components/Card';
import EstadoChip, { ESTADOS, Estado, labelEstado } from '../../components/EstadoChip';
import { api, formatoUSD } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<'TODOS' | Estado>('TODOS');
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const p = await api<any[]>('/pedidos');
      setPedidos(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function cambiarEstado(id: number, estado: Estado) {
    setPedidos((arr) => arr.map((p) => (p.id === id ? { ...p, estado } : p)));
    try {
      await api(`/pedidos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) });
    } catch {
      cargar();
    }
  }

  const filtrados = pedidos.filter((p) => filtro === 'TODOS' || p.estado === filtro);
  const filtros: ('TODOS' | Estado)[] = ['TODOS', ...ESTADOS];

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
      data={filtrados}
      keyExtractor={(p) => String(p.id)}
      ListHeaderComponent={
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
          {filtros.map((f) => {
            const activo = filtro === f;
            return (
              <Pressable key={f} onPress={() => setFiltro(f)} style={[styles.filtroBtn, activo && styles.filtroActivo]}>
                <Text style={[styles.filtroText, activo && styles.filtroTextActivo]}>
                  {f === 'TODOS' ? 'Todos' : labelEstado(f as Estado)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      }
      ListEmptyComponent={
        <Text style={[styles.muted, { textAlign: 'center', marginTop: spacing(8) }]}>Sin pedidos en este filtro.</Text>
      }
      renderItem={({ item }) => <PedidoCard pedido={item} onCambiarEstado={cambiarEstado} />}
    />
  );
}

function PedidoCard({
  pedido: p,
  onCambiarEstado,
}: {
  pedido: any;
  onCambiarEstado: (id: number, estado: Estado) => void;
}) {
  const navigation = useNavigation<any>();
  const [abierto, setAbierto] = useState(false);
  const productos = p.items.filter((it: any) => !it.esBono);
  const bonos = p.items.filter((it: any) => it.esBono);
  const nProductos = productos.reduce((s: number, i: any) => s + i.cantidad, 0);
  const negPendiente = p.negociacion && p.negociacion.estado === 'SOLICITADA';

  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <Pressable
        onPress={() => setAbierto((v) => !v)}
        style={({ pressed }) => [styles.headerBtn, pressed && { backgroundColor: colors.primarySoft }]}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2) }}>
            <Text style={styles.pid}>#{p.id}</Text>
            <EstadoChip estado={p.estado} />
            {negPendiente && <View style={styles.dotAlert} />}
          </View>
          <Text style={styles.cliente} numberOfLines={1}>
            {p.cliente.nombre}
          </Text>
          <Text style={styles.resumen}>
            {nProductos} {nProductos === 1 ? 'producto' : 'productos'} · {formatoUSD(p.total)} · {p.horaEntrega}
          </Text>
        </View>
        {abierto ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
      </Pressable>

      {abierto && (
        <View style={styles.detalle}>
          <View>
            <View style={styles.metaRow}>
              <Phone size={12} color={colors.textMuted} />
              <Text style={styles.muted}>{p.cliente.telefono}</Text>
            </View>
            {p.cliente.direccion ? (
              <View style={styles.metaRow}>
                <MapPin size={12} color={colors.textMuted} />
                <Text style={styles.muted} numberOfLines={1}>
                  {p.cliente.direccion}
                </Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <Clock size={12} color={colors.textMuted} />
              <Text style={styles.muted}>
                Entrega: {p.horaEntrega} · {new Date(p.fecha).toLocaleDateString('es-EC')}
              </Text>
            </View>
          </View>

          {negPendiente && (
            <Pressable
              onPress={() => navigation.navigate('Negociaciones')}
              style={[styles.negBox, { backgroundColor: colors.warningBg, borderColor: '#fcd34d' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Handshake size={13} color={colors.warning} />
                <Text style={[styles.negText, { fontWeight: '800' }]}>Negociación pendiente — responder →</Text>
              </View>
              {p.negociacion.mensajeCliente ? (
                <Text style={styles.negText}>"{p.negociacion.mensajeCliente}"</Text>
              ) : null}
            </Pressable>
          )}

          <View style={styles.itemsBox}>
            {productos.map((it: any) => (
              <View key={it.id} style={styles.itemRow}>
                <Text style={styles.itemText}>
                  {it.cantidad}× {it.producto.nombre}
                </Text>
                <Text style={styles.itemText}>{formatoUSD(it.cantidad * it.precioUnitario)}</Text>
              </View>
            ))}
            {bonos.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Gift size={12} color={colors.success} />
                  <Text style={styles.bonoTitulo}>Bonos</Text>
                </View>
                {bonos.map((it: any) => (
                  <Text key={it.id} style={styles.bonoText}>
                    + {it.cantidad}× {it.producto.nombre}
                  </Text>
                ))}
              </View>
            )}
            <View style={styles.totales}>
              <View style={styles.itemRow}>
                <Text style={styles.muted}>Subtotal</Text>
                <Text style={styles.muted}>{formatoUSD(p.subtotal ?? p.total)}</Text>
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
          </View>

          <View>
            <Text style={styles.cambiarLabel}>Cambiar estado</Text>
            <View style={styles.estadoRow}>
              {ESTADOS.map((e) => {
                const activo = p.estado === e;
                return (
                  <Pressable
                    key={e}
                    onPress={() => onCambiarEstado(p.id, e)}
                    style={[styles.estadoBtn, activo && styles.estadoBtnActivo]}
                  >
                    <Text style={[styles.estadoBtnText, activo && { color: colors.white }]}>{labelEstado(e)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() =>
              navigation.getParent()?.navigate('Mensajes', {
                screen: 'Chat',
                params: { otroId: p.cliente.id, nombre: p.cliente.nombre },
              })
            }
            style={styles.chatLink}
          >
            <MessageCircle size={13} color={colors.primaryDark} />
            <Text style={styles.chatText}>Chatear con el cliente</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  list: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(3) },
  filtros: { gap: spacing(2), paddingBottom: spacing(3) },
  filtroBtn: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filtroActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtroText: { fontWeight: '700', color: colors.textMuted, fontSize: 13 },
  filtroTextActivo: { color: colors.white },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), padding: spacing(4) },
  pid: { fontSize: fonts.h3, fontWeight: '800', color: colors.text },
  dotAlert: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warning },
  cliente: { fontWeight: '700', color: colors.text, marginTop: spacing(1) },
  resumen: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  detalle: {
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(4),
    gap: spacing(3),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing(3),
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  muted: { color: colors.textMuted, fontSize: 13 },
  negBox: { borderRadius: radii.md, padding: spacing(3), gap: 2, borderWidth: 1 },
  negText: { color: colors.warning, fontSize: 12 },
  itemsBox: { backgroundColor: colors.primarySoft, borderRadius: radii.md, padding: spacing(3), gap: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  bonoTitulo: { fontWeight: '800', color: colors.success, fontSize: 12 },
  bonoText: { color: colors.success, fontSize: 12 },
  totales: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing(2), marginTop: spacing(1), gap: 3 },
  descuento: { color: colors.success, fontWeight: '700', fontSize: 13 },
  totalLabel: { fontWeight: '800', color: colors.text },
  totalValor: { fontWeight: '800', color: colors.primaryDark },
  cambiarLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: spacing(2) },
  estadoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  estadoBtn: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  estadoBtnActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  estadoBtnText: { fontSize: 12, fontWeight: '700', color: colors.text },
  chatLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chatText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
});
