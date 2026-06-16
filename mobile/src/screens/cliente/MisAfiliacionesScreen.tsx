import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { CheckCircle, Clock, XCircle } from 'lucide-react-native';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';

interface Afiliacion {
  id: number;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  origen: 'SOLICITUD' | 'MANUAL';
  mensaje: string | null;
  creadoEn: string;
  proveedor: {
    id: number;
    nombre: string;
    nombreNegocio: string | null;
    descripcion: string | null;
    fotoUrl: string | null;
  };
}

export default function MisAfiliacionesScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<Afiliacion[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const data = await api<Afiliacion[]>('/afiliaciones');
      setItems(data);
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

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <EmptyState
          titulo="Sin afiliaciones"
          texto="No has solicitado afiliación a ningún proveedor todavía."
        />
      </View>
    );
  }

  const grupos = [
    { key: 'PENDIENTE', titulo: 'Pendientes', Icon: Clock, color: colors.warning },
    { key: 'APROBADA', titulo: 'Aprobadas', Icon: CheckCircle, color: colors.success },
    { key: 'RECHAZADA', titulo: 'Rechazadas', Icon: XCircle, color: colors.danger },
  ] as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.scroll}>
      {grupos.map((g) => {
        const lista = items.filter((i) => i.estado === g.key);
        if (lista.length === 0) return null;
        return (
          <View key={g.key} style={{ gap: spacing(2) }}>
            <View style={styles.seccionRow}>
              <g.Icon size={18} color={g.color} />
              <Text style={[styles.seccion, { color: g.color }]}>
                {g.titulo} ({lista.length})
              </Text>
            </View>
            {lista.map((a) => (
              <Pressable
                key={a.id}
                onPress={() =>
                  navigation.getParent()?.navigate('Proveedores', {
                    screen: 'ProveedorDetalle',
                    params: { id: a.proveedor.id, nombre: a.proveedor.nombreNegocio || a.proveedor.nombre },
                  })
                }
              >
                <Card style={styles.card}>
                  <Avatar uri={a.proveedor.fotoUrl} size={52} radius={radii.md} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.nombre} numberOfLines={1}>
                      {a.proveedor.nombreNegocio || a.proveedor.nombre}
                    </Text>
                    {a.mensaje ? (
                      <Text style={styles.mensaje} numberOfLines={2}>
                        "{a.mensaje}"
                      </Text>
                    ) : null}
                    <Text style={styles.fecha}>
                      {a.origen === 'MANUAL' ? 'Te agregaron manualmente' : 'Solicitud enviada'} ·{' '}
                      {new Date(a.creadoEn).toLocaleDateString('es-EC')}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(5) },
  seccionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seccion: { fontSize: fonts.h3, fontWeight: '800' },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  nombre: { fontWeight: '800', color: colors.text },
  mensaje: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginTop: 2 },
  fecha: { fontSize: 10, color: colors.textSubtle, marginTop: 4 },
});
