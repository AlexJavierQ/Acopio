import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Minus, Plus, Trash2, Clock, Send, ShoppingBasket, Handshake } from 'lucide-react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { api, formatoUSD } from '../../lib/api';
import { useCarrito } from '../../store/carrito';
import { colors, fonts, radii, spacing } from '../../theme';
import type { ProveedoresStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProveedoresStackParamList, 'HacerPedido'>;

export default function HacerPedidoScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<ProveedoresStackParamList, 'HacerPedido'>>();
  const { proveedorId } = route.params;
  const carrito = useCarrito();
  const items = Object.values(carrito.items);

  const [horaEntrega, setHoraEntrega] = useState('07:30');
  const [pedirDescuento, setPedirDescuento] = useState(false);
  const [mensajeNegociacion, setMensajeNegociacion] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    try {
      const pedido = await api<{ id: number }>('/pedidos', {
        method: 'POST',
        body: JSON.stringify({
          proveedorId,
          horaEntrega,
          items: items.map((it) => ({ productoId: it.producto.id, cantidad: it.cantidad })),
          solicitarNegociacion: pedirDescuento,
          mensajeNegociacion: pedirDescuento ? mensajeNegociacion : undefined,
        }),
      });
      carrito.vaciar();
      navigation.replace('Confirmacion', { pedidoId: pedido.id });
    } catch (e: any) {
      Alert.alert('No se pudo enviar', e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<ShoppingBasket size={64} color={colors.primaryLight} />}
          titulo="Tu pedido está vacío"
          texto="Vuelve al catálogo y elige tus productos."
        >
          <Button title="Ver catálogo" onPress={() => navigation.goBack()} style={{ marginTop: spacing(3) }} />
        </EmptyState>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Card padded={false} style={{ padding: spacing(2) }}>
        {items.map(({ producto, cantidad }, idx) => (
          <View key={producto.id} style={[styles.row, idx > 0 && styles.rowBorder]}>
            <Image source={{ uri: producto.imagenUrl }} style={styles.img} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.nombre} numberOfLines={1}>
                {producto.nombre}
              </Text>
              <Text style={styles.cu}>{formatoUSD(producto.precio)} c/u</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable onPress={() => carrito.setCantidad(producto.id, cantidad - 1)} style={styles.stepBtn}>
                <Minus size={14} color={colors.text} />
              </Pressable>
              <Text style={styles.stepCant}>{cantidad}</Text>
              <Pressable
                onPress={() => carrito.setCantidad(producto.id, cantidad + 1)}
                style={[styles.stepBtn, { backgroundColor: colors.primary }]}
              >
                <Plus size={14} color={colors.white} />
              </Pressable>
            </View>
            <Pressable onPress={() => carrito.quitar(producto.id)} hitSlop={8} style={{ padding: 4 }}>
              <Trash2 size={18} color={colors.danger} />
            </Pressable>
          </View>
        ))}
      </Card>

      <Card style={{ gap: spacing(4) }}>
        <View>
          <View style={styles.labelRow}>
            <Clock size={18} color={colors.text} />
            <Text style={styles.label}>Hora de entrega</Text>
          </View>
          <TextInput
            value={horaEntrega}
            onChangeText={setHoraEntrega}
            placeholder="07:30"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
          />
        </View>

        <View style={styles.descBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Handshake size={16} color={colors.text} />
              <Text style={styles.descTitulo}>Solicitar descuento o bono</Text>
            </View>
            <Switch
              value={pedirDescuento}
              onValueChange={setPedirDescuento}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
          <Text style={styles.muted}>
            Tu proveedor revisará el pedido y podrá ofrecerte un % menos, monto fijo o productos extra.
          </Text>
          {pedirDescuento && (
            <TextInput
              value={mensajeNegociacion}
              onChangeText={setMensajeNegociacion}
              placeholder="Mensaje para el proveedor (opcional)"
              placeholderTextColor={colors.textSubtle}
              multiline
              style={[styles.input, { minHeight: 64, textAlignVertical: 'top', marginTop: spacing(2) }]}
            />
          )}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.muted}>Subtotal</Text>
          <Text style={styles.total}>{formatoUSD(carrito.total())}</Text>
        </View>

        <Button
          title={
            enviando
              ? 'Enviando…'
              : pedirDescuento
              ? 'Enviar pedido y abrir negociación'
              : 'Enviar pedido'
          }
          onPress={enviar}
          loading={enviando}
          icon={<Send size={18} color={colors.white} />}
          fullWidth
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(4) },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingVertical: spacing(2), paddingHorizontal: spacing(2) },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  img: { width: 56, height: 56, borderRadius: radii.md, backgroundColor: colors.primaryLight },
  nombre: { fontWeight: '700', color: colors.text },
  cu: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing(1) },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCant: { fontWeight: '800', color: colors.text, minWidth: 20, textAlign: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing(2) },
  label: { fontWeight: '700', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    color: colors.text,
    backgroundColor: colors.white,
    fontSize: 15,
  },
  descBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing(3),
    gap: spacing(2),
  },
  descTitulo: { fontWeight: '800', color: colors.text },
  muted: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing(4),
  },
  total: { fontSize: fonts.h1, fontWeight: '800', color: colors.primaryDark },
});
