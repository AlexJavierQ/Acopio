import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InventarioScreen from '../screens/proveedor/InventarioScreen';
import RecetasScreen from '../screens/proveedor/RecetasScreen';
import RecetaEditorScreen from '../screens/proveedor/RecetaEditorScreen';
import RequerimientosScreen from '../screens/proveedor/RequerimientosScreen';
import VentasScreen from '../screens/proveedor/VentasScreen';
import LogoutButton from '../components/LogoutButton';
import { headerOpts } from './options';
import type { InventarioStackParamList } from './types';

const Stack = createNativeStackNavigator<InventarioStackParamList>();

export default function InventarioStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen
        name="Insumos"
        component={InventarioScreen}
        options={{ title: 'Inventario', headerRight: () => <LogoutButton /> }}
      />
      <Stack.Screen name="Recetas" component={RecetasScreen} options={{ title: 'Recetas' }} />
      <Stack.Screen
        name="RecetaEditor"
        component={RecetaEditorScreen}
        options={({ route }) => ({ title: route.params?.nombre || 'Receta' })}
      />
      <Stack.Screen name="Requerimientos" component={RequerimientosScreen} options={{ title: 'Requerimientos' }} />
      <Stack.Screen name="Ventas" component={VentasScreen} options={{ title: 'Ventas y ganancias' }} />
    </Stack.Navigator>
  );
}
