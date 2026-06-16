import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Check, X, UserPlus, Users, Phone, MapPin, MessageCircle } from 'lucide-react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { api } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';

interface Afiliacion {
  id: number;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  origen: 'SOLICITUD' | 'MANUAL';
  mensaje: string | null;
  creadoEn: string;
  cliente: { id: number; nombre: string; telefono: string; direccion: string | null };
}

type Tab = 'PENDIENTE' | 'APROBADA';

export default function AfiliadosScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<Tab>('PENDIENTE');
  const [items, setItems] = useState<Afiliacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolviendo, setResolviendo] = useState<number | null>(null);
  const [agregando, setAgregando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Afiliacion[]>(`/afiliaciones?estado=${tab}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function resolver(id: number, estado: 'APROBADA' | 'RECHAZADA') {
    setResolviendo(id);
    try {
      await api(`/afiliaciones/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      await cargar();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setResolviendo(null);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(a) => String(a.id)}
        ListHeaderComponent={
          <View style={{ gap: spacing(3), marginBottom: spacing(1) }}>
            <View style={styles.headerRow}>
              <Text style={styles.h1}>Afiliados</Text>
              <Pressable onPress={() => setAgregando(true)} style={styles.addBtn}>
                <UserPlus size={16} color={colors.white} />
                <Text style={styles.addBtnText}>Agregar</Text>
              </Pressable>
            </View>
            <View style={styles.tabs}>
              {(['PENDIENTE', 'APROBADA'] as Tab[]).map((t) => {
                const activo = tab === t;
                return (
                  <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, activo && styles.tabActivo]}>
                    <Text style={[styles.tabText, activo && { color: colors.white }]}>
                      {t === 'PENDIENTE' ? 'Pendientes' : 'Aprobados'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing(8) }} />
          ) : (
            <Text style={[styles.muted, { textAlign: 'center', marginTop: spacing(8) }]}>
              {tab === 'PENDIENTE' ? 'No tienes solicitudes pendientes 🙌' : 'Aún no tienes afiliados aprobados.'}
            </Text>
          )
        }
        renderItem={({ item: a }) => (
          <Card style={{ gap: spacing(3) }}>
            <View style={{ flexDirection: 'row', gap: spacing(3) }}>
              <View style={styles.avatar}>
                <Users size={22} color={colors.primaryDark} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.nombre} numberOfLines={1}>
                  {a.cliente.nombre}
                </Text>
                <View style={styles.metaRow}>
                  <Phone size={11} color={colors.textMuted} />
                  <Text style={styles.muted}>{a.cliente.telefono}</Text>
                </View>
                {a.cliente.direccion ? (
                  <View style={styles.metaRow}>
                    <MapPin size={11} color={colors.textMuted} />
                    <Text style={styles.muted} numberOfLines={1}>
                      {a.cliente.direccion}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {a.mensaje ? (
              <Text style={styles.mensaje}>"{a.mensaje}"</Text>
            ) : null}

            {a.estado === 'PENDIENTE' ? (
              <View style={{ flexDirection: 'row', gap: spacing(2) }}>
                <Button
                  title="Aprobar"
                  onPress={() => resolver(a.id, 'APROBADA')}
                  loading={resolviendo === a.id}
                  icon={<Check size={15} color={colors.white} />}
                  style={{ flex: 1, backgroundColor: colors.success }}
                />
                <Button
                  title="Rechazar"
                  variant="danger"
                  onPress={() => resolver(a.id, 'RECHAZADA')}
                  loading={resolviendo === a.id}
                  icon={<X size={15} color={colors.danger} />}
                  style={{ flex: 1 }}
                />
              </View>
            ) : (
              <Button
                title="Chatear con el cliente"
                variant="secondary"
                icon={<MessageCircle size={15} color={colors.text} />}
                onPress={() =>
                  navigation.getParent()?.navigate('Mensajes', {
                    screen: 'Chat',
                    params: { otroId: a.cliente.id, nombre: a.cliente.nombre },
                  })
                }
                fullWidth
              />
            )}
          </Card>
        )}
      />

      {agregando && <ModalAgregar onClose={() => setAgregando(false)} onCreado={cargar} />}
    </View>
  );
}

function ModalAgregar({ onClose, onCreado }: { onClose: () => void; onCreado: () => void }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', direccion: '', passwordTemporal: '' });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    if (!form.nombre || !form.telefono) {
      Alert.alert('Faltan datos', 'Nombre y teléfono son obligatorios.');
      return;
    }
    setEnviando(true);
    try {
      const res = await api<{ creadoUsuario: boolean; cliente: { nombre: string } }>('/afiliaciones/manual', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setExito(
        res.creadoUsuario
          ? `✅ ${res.cliente.nombre} agregado. Se creó cuenta con clave temporal.`
          : `✅ ${res.cliente.nombre} ya existía y quedó afiliado.`
      );
      onCreado();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={{ padding: spacing(5), gap: spacing(3) }}>
            <View>
              <Text style={styles.modalTitulo}>Agregar cliente</Text>
              <Text style={styles.muted}>Si el teléfono no existe, le creamos cuenta con clave temporal.</Text>
            </View>

            {exito ? (
              <>
                <View style={styles.exitoBox}>
                  <Text style={{ color: colors.success }}>{exito}</Text>
                </View>
                <Button title="Cerrar" onPress={onClose} fullWidth />
              </>
            ) : (
              <>
                <TextInput placeholder="Nombre" placeholderTextColor={colors.textSubtle} value={form.nombre} onChangeText={(v) => set('nombre', v)} style={styles.input} />
                <TextInput placeholder="Teléfono (ej: 0999000099)" placeholderTextColor={colors.textSubtle} keyboardType="phone-pad" value={form.telefono} onChangeText={(v) => set('telefono', v)} style={styles.input} />
                <TextInput placeholder="Dirección / Negocio (opcional)" placeholderTextColor={colors.textSubtle} value={form.direccion} onChangeText={(v) => set('direccion', v)} style={styles.input} />
                <TextInput placeholder="Clave temporal (opcional, default: cliente123)" placeholderTextColor={colors.textSubtle} value={form.passwordTemporal} onChangeText={(v) => set('passwordTemporal', v)} style={styles.input} />
                <View style={{ flexDirection: 'row', gap: spacing(2) }}>
                  <Button title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
                  <Button title={enviando ? 'Agregando…' : 'Agregar'} onPress={submit} loading={enviando} style={{ flex: 1 }} />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(3) },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h1: { fontSize: fonts.h1, fontWeight: '800', color: colors.text },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.md,
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  tabs: { flexDirection: 'row', gap: spacing(2) },
  tab: { flex: 1, paddingVertical: spacing(2), borderRadius: radii.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  tabActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontWeight: '700', color: colors.textMuted, fontSize: 13 },
  avatar: { width: 48, height: 48, borderRadius: radii.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  nombre: { fontWeight: '800', color: colors.text, fontSize: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  muted: { color: colors.textMuted, fontSize: 13 },
  mensaje: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', backgroundColor: colors.primarySoft, padding: spacing(2), borderRadius: radii.md },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(58,42,26,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.card, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, maxHeight: '90%' },
  modalTitulo: { fontSize: fonts.h2, fontWeight: '800', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    color: colors.text,
    backgroundColor: colors.white,
    fontSize: 15,
  },
  exitoBox: { backgroundColor: colors.successBg, padding: spacing(3), borderRadius: radii.md },
});
