import React from 'react';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { colors, radii, shadow, spacing } from '../theme';

export default function Card({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  return <View style={[styles.card, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  padded: { padding: spacing(4) },
});
