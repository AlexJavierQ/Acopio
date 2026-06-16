import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors } from '../theme';

// Estilo de cabecera común (subconjunto compatible con stack y tabs).
export const tabHeaderOpts = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '800' as const, color: colors.text },
  headerShadowVisible: false,
};

// Opciones completas para los native-stack (incluye fondo del contenido).
export const headerOpts: NativeStackNavigationOptions = {
  ...tabHeaderOpts,
  contentStyle: { backgroundColor: colors.bg },
};
