import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useAuth } from './src/store/auth';
import AuthNavigator from './src/navigation/AuthNavigator';
import ClienteNavigator from './src/navigation/ClienteNavigator';
import ProveedorNavigator from './src/navigation/ProveedorNavigator';
import { colors } from './src/theme';

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  const token = useAuth((s) => s.token);
  const usuario = useAuth((s) => s.usuario);
  const hidratado = useAuth((s) => s.hidratado);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {!hidratado ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <NavigationContainer theme={navTheme}>
            {!token || !usuario ? (
              <AuthNavigator />
            ) : usuario.rol === 'PROVEEDOR' ? (
              <ProveedorNavigator />
            ) : (
              <ClienteNavigator />
            )}
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
