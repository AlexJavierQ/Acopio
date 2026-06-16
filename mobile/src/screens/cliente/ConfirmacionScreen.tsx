import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle2, ShoppingBag, Handshake, MessageCircle, Store } from 'lucide-react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { api, formatoUSD } from '../../lib/api';
import { colors, fonts, spacing } from '../../theme';
import type { ProveedoresStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProveedoresStackParamList, 'Confirmacion'>;

export default function ConfirmacionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<ProveedoresStackParamList, 'Confirmacion'>>();
  const { pedidoId } = route.params;
  const [pedido, setPedido] = useState<any>(null);

  useEffect(() => {
    api(`/pedidos/${pedidoId}`).then(setPedido).catch(() => {});
  }, [pedidoId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.scroll}>
      <Card style={styles.heroCard}>
        <CheckCircle2 size={72} color={colors.success} />
        <Text style={styles.h1}>¡Pedido enviado!</Text>
        <Text style={styles.muted}>Tu proveedor ya recibió la solicitud.</Text>
      </Card>

      {pedido && (
        <Card style={{ gap: spacing(3) }}>
          <View>
            <Text style={styles.pid}>Pedido #{pedido.id}</Text>
            <View style={styles.storeRow}>
              <Store size={14} color={colors.text} />
              <Text style={styles.store}>
                {pedido.proveedor?.nombreNegocio || pedido.proveedor?.nombre}
              </Text>
            </View>
            <Text style={styles.muted}>Entrega: {pedido.horaEntrega}</Text>
          </View>

          {pedido.negociacion && (
            <View style={styles.negBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Handshake size={14} color={colors.warning} />
                <Text style={[styles.negText, { fontWeight: '800' }]}>Negociación abierta</Text>
              </View>
              <Text style={styles.negText}>El proveedor revisará tu solicitud y te responderá pronto.</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.muted}>Total</Text>
            <Text style={styles.total}>{formatoUSD(pedido.total)}</Text>
          </View>
        </Card>
      )}

      <View style={{ gap: spacing(2) }}>
        <Button
          title="Ver mis pedidos"
          icon={<ShoppingBag size={16} color={colors.white} />}
          onPress={() => navigation.getParent()?.navigate('MisPedidos')}
          fullWidth
        />
        {pedido?.proveedor?.id && (
          <Button
            title="Chatear con el proveedor"
            variant="secondary"
            icon={<MessageCircle size={16} color={colors.text} />}
            onPress={() =>
              navigation.getParent()?.navigate('Mensajes', {
                screen: 'Chat',
                params: {
                  otroId: pedido.proveedor.id,
                  nombre: pedido.proveedor.nombreNegocio || pedido.proveedor.nombre,
                },
              })
            }
            fullWidth
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing(4), gap: spacing(4) },
  heroCard: { alignItems: 'center', gap: spacing(2), paddingVertical: spacing(8) },
  h1: { fontSize: fonts.h1, fontWeight: '800', color: colors.text },
  muted: { color: colors.textMuted },
  pid: { fontSize: 12, color: colors.textMuted },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  store: { fontWeight: '800', color: colors.text },
  negBox: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 12,
    padding: spacing(3),
    gap: 2,
  },
  negText: { color: colors.warning, fontSize: 13 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing(3),
  },
  total: { fontSize: fonts.h2, fontWeight: '800', color: colors.primaryDark },
});
