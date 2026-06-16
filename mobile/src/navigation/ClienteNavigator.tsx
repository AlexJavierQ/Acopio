import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Store, ShoppingBag, Handshake, MessageCircle } from 'lucide-react-native';

import ProveedoresScreen from '../screens/cliente/ProveedoresScreen';
import ProveedorDetalleScreen from '../screens/cliente/ProveedorDetalleScreen';
import HacerPedidoScreen from '../screens/cliente/HacerPedidoScreen';
import ConfirmacionScreen from '../screens/cliente/ConfirmacionScreen';
import MisPedidosScreen from '../screens/cliente/MisPedidosScreen';
import MisAfiliacionesScreen from '../screens/cliente/MisAfiliacionesScreen';
import MensajesStack from './MensajesStack';
import LogoutButton from '../components/LogoutButton';

import { headerOpts, tabHeaderOpts } from './options';
import { colors } from '../theme';
import type { ProveedoresStackParamList, ClienteTabParamList } from './types';

const Tab = createBottomTabNavigator<ClienteTabParamList>();
const ProvStack = createNativeStackNavigator<ProveedoresStackParamList>();

function ProveedoresStack() {
  return (
    <ProvStack.Navigator screenOptions={headerOpts}>
      <ProvStack.Screen
        name="ProveedoresLista"
        component={ProveedoresScreen}
        options={{ title: 'Proveedores', headerRight: () => <LogoutButton /> }}
      />
      <ProvStack.Screen
        name="ProveedorDetalle"
        component={ProveedorDetalleScreen}
        options={({ route }) => ({ title: route.params?.nombre || 'Proveedor' })}
      />
      <ProvStack.Screen name="HacerPedido" component={HacerPedidoScreen} options={{ title: 'Tu pedido' }} />
      <ProvStack.Screen
        name="Confirmacion"
        component={ConfirmacionScreen}
        options={{ title: 'Confirmación', headerBackVisible: false, gestureEnabled: false }}
      />
    </ProvStack.Navigator>
  );
}

export default function ClienteNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, paddingTop: 4, height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Proveedores"
        component={ProveedoresStack}
        options={{ tabBarLabel: 'Proveedores', tabBarIcon: ({ color, size }) => <Store color={color} size={size} /> }}
      />
      <Tab.Screen
        name="MisPedidos"
        component={MisPedidosScreen}
        options={{
          headerShown: true,
          title: 'Mis pedidos',
          ...tabHeaderOpts,
          headerRight: () => <LogoutButton />,
          tabBarLabel: 'Pedidos',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Afiliaciones"
        component={MisAfiliacionesScreen}
        options={{
          headerShown: true,
          title: 'Mis afiliaciones',
          ...tabHeaderOpts,
          headerRight: () => <LogoutButton />,
          tabBarLabel: 'Afiliaciones',
          tabBarIcon: ({ color, size }) => <Handshake color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Mensajes"
        component={MensajesStack}
        options={{ tabBarLabel: 'Mensajes', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
