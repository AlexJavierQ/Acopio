import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConversacionesScreen from '../screens/comun/ConversacionesScreen';
import ChatScreen from '../screens/comun/ChatScreen';
import LogoutButton from '../components/LogoutButton';
import { headerOpts } from './options';
import type { MensajesStackParamList } from './types';

const Stack = createNativeStackNavigator<MensajesStackParamList>();

export default function MensajesStack() {
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen
        name="Conversaciones"
        component={ConversacionesScreen}
        options={{ title: 'Mensajes', headerRight: () => <LogoutButton /> }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params?.nombre || 'Chat' })}
      />
    </Stack.Navigator>
  );
}
