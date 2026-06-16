import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, shadow } from '../theme';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({
  title, onPress, variant = 'primary', loading, disabled, icon, style, fullWidth,
}: Props) {
  const isDisabled = !!(loading || disabled);
  const stylesByVariant: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.primary, ...shadow },
    secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger },
  };
  const textColor =
    variant === 'primary' ? colors.white :
    variant === 'danger' ? colors.danger :
    colors.text;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        stylesByVariant[variant],
        fullWidth && { alignSelf: 'stretch' },
        pressed && !isDisabled && { transform: [{ scale: 0.98 }], opacity: 0.95 },
        isDisabled && { opacity: 0.55 },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, { color: textColor }]}>{title}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 15, fontWeight: '700' },
});
