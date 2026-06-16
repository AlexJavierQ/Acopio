import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radii } from '../theme';

interface Props extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export default function Input({ label, icon, error, style, ...rest }: Props) {
  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.wrap, error && { borderColor: colors.danger }]}>
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={colors.textSubtle}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  error: { fontSize: 12, color: colors.danger },
});
