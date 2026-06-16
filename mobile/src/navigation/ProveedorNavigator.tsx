import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ClipboardList, Package, Handshake, Users, MessageCircle } from 'lucide-react-native';

import PedidosScreen from '../screens/proveedor/PedidosScreen';
import NegociacionesScreen from '../screens/proveedor/NegociacionesScreen';
import AfiliadosScreen from '../screens/proveedor/AfiliadosScreen';
import InventarioStack from './InventarioStack';
import MensajesStack from './MensajesStack';
import LogoutButton from '../components/LogoutButton';

import { tabHeaderOpts } from './options';
import { colors } from '../theme';
import type { ProveedorTabParamList } from './types';

const Tab = createBottomTabNavigator<ProveedorTabParamList>();

export default function ProveedorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...tabHeaderOpts,
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, paddingTop: 4, height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Pedidos"
        component={PedidosScreen}
        options={{ title: 'Pedidos', tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Inventario"
        component={InventarioStack}
        options={{ headerShown: false, tabBarLabel: 'Inventario', tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Negociaciones"
        component={NegociacionesScreen}
        options={{ headerShown: false, tabBarLabel: 'Negociar', tabBarIcon: ({ color, size }) => <Handshake color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Afiliados"
        component={AfiliadosScreen}
        options={{ headerShown: false, tabBarLabel: 'Afiliados', tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Mensajes"
        component={MensajesStack}
        options={{ headerShown: false, tabBarLabel: 'Chat', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
