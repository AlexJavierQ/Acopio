import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, MapPin, Package, Users, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Input from '../../components/Input';
import { api } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';
import type { ProveedoresStackParamList } from '../../navigation/types';

interface ProveedorPublico {
  id: number;
  nombre: string;
  nombreNegocio: string | null;
  descripcion: string | null;
  fotoUrl: string | null;
  direccion: string | null;
  totalAfiliados: number;
  totalProductos: number;
  miAfiliacion: { estado: string } | null;
}

export default function ProveedoresScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProveedoresStackParamList>>();
  const [items, setItems] = useState<ProveedorPublico[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async (buscar = '') => {
    try {
      const data = await api<ProveedorPublico[]>(
        `/proveedores${buscar ? `?q=${encodeURIComponent(buscar)}` : ''}`
      );
      setItems(data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar(q);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cargar])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              cargar(q);
            }}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: spacing(3), marginBottom: spacing(2) }}>
            <Text style={styles.h1}>Descubre proveedores</Text>
            <Text style={styles.muted}>Mayoristas en Loja: solicita afiliación y haz pedidos.</Text>
            <Input
              placeholder="Buscar por nombre o negocio…"
              value={q}
              onChangeText={setQ}
              onSubmitEditing={() => cargar(q)}
              returnKeyType="search"
              icon={<Search size={18} color={colors.textMuted} />}
            />
          </View>
        }
        renderItem={({ item: p }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('ProveedorDetalle', { id: p.id, nombre: p.nombreNegocio || p.nombre })
            }
            style={({ pressed }) => pressed && { opacity: 0.85 }}
          >
            <Card style={styles.card}>
              <View style={{ flexDirection: 'row', gap: spacing(3) }}>
                <Avatar uri={p.fotoUrl} size={64} radius={radii.lg} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.nombre} numberOfLines={1}>
                    {p.nombreNegocio || p.nombre}
                  </Text>
                  <Text style={styles.sub} numberOfLines={1}>
                    {p.nombre}
                  </Text>
                  {p.miAfiliacion && <BadgeAfiliacion estado={p.miAfiliacion.estado} />}
                </View>
              </View>
              {p.descripcion ? (
                <Text style={styles.desc} numberOfLines={2}>
                  {p.descripcion}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                {p.direccion ? (
                  <Meta icon={<MapPin size={12} color={colors.textMuted} />} text={p.direccion.split(',')[0]} />
                ) : null}
                <Meta icon={<Package size={12} color={colors.textMuted} />} text={`${p.totalProductos} productos`} />
                <Meta icon={<Users size={12} color={colors.textMuted} />} text={`${p.totalAfiliados} clientes`} />
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing(10) }} />
          ) : (
            <Text style={[styles.muted, { textAlign: 'center', marginTop: spacing(10) }]}>
              No hay proveedores con esa búsqueda.
            </Text>
          )
        }
      />
    </View>
  );
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.meta}>
      {icon}
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function BadgeAfiliacion({ estado }: { estado: string }) {
  const config =
    {
      APROBADA: { Icon: CheckCircle, text: 'Afiliado', bg: colors.successBg, fg: colors.success },
      PENDIENTE: { Icon: Clock, text: 'Solicitud pendiente', bg: colors.warningBg, fg: colors.warning },
      RECHAZADA: { Icon: XCircle, text: 'Rechazada', bg: colors.dangerBg, fg: colors.danger },
    }[estado] || { Icon: Clock, text: estado, bg: colors.border, fg: colors.textMuted };
  const { Icon } = config;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Icon size={11} color={config.fg} />
      <Text style={[styles.badgeText, { color: config.fg }]}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(3) },
  h1: { fontSize: fonts.h1, fontWeight: '800', color: colors.text },
  muted: { color: colors.textMuted, lineHeight: 20 },
  card: { gap: spacing(3) },
  nombre: { fontSize: fonts.h3, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted },
  desc: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3) },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textMuted },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    marginTop: 6,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
});
