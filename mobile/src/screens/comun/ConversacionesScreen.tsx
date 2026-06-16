import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessageCircle } from 'lucide-react-native';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { colors, radii, spacing } from '../../theme';
import type { MensajesStackParamList } from '../../navigation/types';

interface OtroUsuario {
  id: number;
  nombre: string;
  rol: 'CLIENTE' | 'PROVEEDOR';
  nombreNegocio: string | null;
  fotoUrl: string | null;
}
interface Conversacion {
  otroUsuario: OtroUsuario;
  ultimoMensaje: { contenido: string; creadoEn: string };
  noLeidos: number;
}

const POLL_MS = 4000;

export default function ConversacionesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MensajesStackParamList>>();
  const [items, setItems] = useState<Conversacion[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const data = await api<Conversacion[]>('/mensajes/conversaciones');
      setItems(data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
      const t = setInterval(cargar, POLL_MS);
      return () => clearInterval(t);
    }, [cargar])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={<MessageCircle size={56} color={colors.primaryLight} />}
          titulo="Sin conversaciones"
          texto="Tus chats con clientes y proveedores aparecerán aquí."
        />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing(3) }}
      data={items}
      keyExtractor={(c) => String(c.otroUsuario.id)}
      ItemSeparatorComponent={() => <View style={{ height: spacing(1) }} />}
      renderItem={({ item: c }) => {
        const u = c.otroUsuario;
        return (
          <Pressable
            onPress={() =>
              navigation.navigate('Chat', {
                otroId: u.id,
                nombre: u.nombreNegocio || u.nombre,
              })
            }
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.primarySoft }]}
          >
            <Avatar uri={u.fotoUrl} size={48} rol={u.rol} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.topRow}>
                <Text style={styles.nombre} numberOfLines={1}>
                  {u.nombreNegocio || u.nombre}
                </Text>
                {c.noLeidos > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{c.noLeidos}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {c.ultimoMensaje.contenido}
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    padding: spacing(3),
    borderRadius: radii.lg,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing(2) },
  nombre: { fontWeight: '800', color: colors.text, flexShrink: 1 },
  preview: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '800' },
});
