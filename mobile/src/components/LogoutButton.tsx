import React from 'react';
import { Alert, Pressable } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../store/auth';
import { useCarrito } from '../store/carrito';
import { colors } from '../theme';

export default function LogoutButton() {
  const logout = useAuth((s) => s.logout);
  const vaciar = useCarrito((s) => s.vaciar);

  function confirmar() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          vaciar();
          logout();
        },
      },
    ]);
  }

  return (
    <Pressable onPress={confirmar} hitSlop={10} style={{ marginRight: 4, padding: 4 }}>
      <LogOut size={20} color={colors.textMuted} />
    </Pressable>
  );
}
