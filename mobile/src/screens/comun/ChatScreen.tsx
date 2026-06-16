import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { Send } from 'lucide-react-native';
import { api } from '../../lib/api';
import { useAuth } from '../../store/auth';
import { colors, radii, spacing } from '../../theme';
import type { MensajesStackParamList } from '../../navigation/types';

interface Mensaje {
  id: number;
  remitenteId: number;
  destinatarioId: number;
  contenido: string;
  creadoEn: string;
}

const POLL_MS = 3000;

export default function ChatScreen() {
  const route = useRoute<RouteProp<MensajesStackParamList, 'Chat'>>();
  const { otroId } = route.params;
  const usuario = useAuth((s) => s.usuario);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const listRef = useRef<FlatList<Mensaje>>(null);

  const cargar = useCallback(async () => {
    try {
      const ms = await api<Mensaje[]>(`/mensajes/conversacion/${otroId}`);
      setMensajes(ms);
      api(`/mensajes/leer/${otroId}`, { method: 'POST' }).catch(() => {});
    } catch {
      /* noop */
    }
  }, [otroId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
      const t = setInterval(cargar, POLL_MS);
      return () => clearInterval(t);
    }, [cargar])
  );

  useEffect(() => {
    if (mensajes.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [mensajes.length]);

  async function enviar() {
    const contenido = texto.trim();
    if (!contenido) return;
    setEnviando(true);
    try {
      const m = await api<Mensaje>('/mensajes', {
        method: 'POST',
        body: JSON.stringify({ destinatarioId: otroId, contenido }),
      });
      setMensajes((arr) => [...arr, m]);
      setTexto('');
    } catch {
      /* noop */
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={mensajes}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={<Text style={styles.vacio}>Sé el primero en escribir.</Text>}
        renderItem={({ item: m }) => {
          const mio = m.remitenteId === usuario?.id;
          return (
            <View style={[styles.burbujaWrap, mio ? styles.derecha : styles.izquierda]}>
              <View style={[styles.burbuja, mio ? styles.mia : styles.suya]}>
                <Text style={[styles.texto, mio && { color: colors.white }]}>{m.contenido}</Text>
                <Text style={[styles.hora, mio ? { color: 'rgba(255,255,255,0.7)' } : { color: colors.textSubtle }]}>
                  {new Date(m.creadoEn).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.composer}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribe un mensaje…"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          multiline
        />
        <Pressable
          onPress={enviar}
          disabled={!texto.trim() || enviando}
          style={[styles.sendBtn, (!texto.trim() || enviando) && { opacity: 0.5 }]}
        >
          <Send size={18} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing(3), gap: spacing(2), flexGrow: 1 },
  vacio: { textAlign: 'center', color: colors.textMuted, marginTop: spacing(10) },
  burbujaWrap: { flexDirection: 'row' },
  derecha: { justifyContent: 'flex-end' },
  izquierda: { justifyContent: 'flex-start' },
  burbuja: { maxWidth: '78%', paddingHorizontal: spacing(3), paddingVertical: spacing(2), borderRadius: radii.lg },
  mia: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  suya: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  texto: { fontSize: 14, color: colors.text, lineHeight: 19 },
  hora: { fontSize: 10, marginTop: 3, alignSelf: 'flex-end' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing(2),
    padding: spacing(3),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
    paddingVertical: Platform.OS === 'ios' ? spacing(3) : spacing(2),
    color: colors.text,
    backgroundColor: colors.white,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
