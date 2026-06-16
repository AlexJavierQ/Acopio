import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../theme';

export default function EmptyState({
  icon,
  titulo,
  texto,
  children,
}: {
  icon?: React.ReactNode;
  titulo: string;
  texto?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      {icon}
      <Text style={styles.titulo}>{titulo}</Text>
      {texto ? <Text style={styles.texto}>{texto}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing(12), gap: spacing(2) },
  titulo: { fontSize: fonts.h3, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: spacing(2) },
  texto: { color: colors.textMuted, textAlign: 'center', maxWidth: 300, lineHeight: 20 },
});
