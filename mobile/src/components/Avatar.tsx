import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { Store, User } from 'lucide-react-native';
import { colors } from '../theme';

export default function Avatar({
  uri,
  size = 48,
  rol = 'PROVEEDOR',
  radius,
}: {
  uri?: string | null;
  size?: number;
  rol?: 'CLIENTE' | 'PROVEEDOR';
  radius?: number;
}) {
  const br = radius ?? size / 2;
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: br, backgroundColor: colors.primaryLight }} />;
  }
  const Icon = rol === 'PROVEEDOR' ? Store : User;
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: br }]}>
      <Icon size={size * 0.42} color={colors.primaryDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
