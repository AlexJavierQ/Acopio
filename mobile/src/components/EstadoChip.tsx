import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

export type Estado = 'RECIBIDO' | 'EN_PRODUCCION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';

export const ESTADOS: Estado[] = ['RECIBIDO', 'EN_PRODUCCION', 'LISTO', 'ENTREGADO'];

const labels: Record<Estado, string> = {
  RECIBIDO: 'Recibido',
  EN_PRODUCCION: 'En producción',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const estilos: Record<Estado, { bg: string; fg: string }> = {
  RECIBIDO: { bg: colors.primaryLight, fg: colors.primaryDark },
  EN_PRODUCCION: { bg: '#ffedd5', fg: '#c2410c' },
  LISTO: { bg: colors.successBg, fg: colors.success },
  ENTREGADO: { bg: '#e7d9c3', fg: colors.text },
  CANCELADO: { bg: colors.dangerBg, fg: colors.danger },
};

export const labelEstado = (e: Estado) => labels[e] ?? e;

export default function EstadoChip({ estado }: { estado: Estado }) {
  const s = estilos[estado] ?? estilos.RECIBIDO;
  return (
    <View style={[styles.chip, { backgroundColor: s.bg }]}>
      <View style={[styles.dot, { backgroundColor: s.fg }]} />
      <Text style={[styles.text, { color: s.fg }]}>{labelEstado(estado)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 7, height: 7, borderRadius: 4, opacity: 0.8 },
  text: { fontSize: 12, fontWeight: '700' },
});
