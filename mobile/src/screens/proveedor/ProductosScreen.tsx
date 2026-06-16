import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Pencil, Eye, EyeOff, Save } from 'lucide-react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { api, formatoUSD } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  activo: boolean;
}

export default function ProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editar, setEditar] = useState<Producto | null>(null);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setProductos(await api<Producto[]>('/productos'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function toggleActivo(p: Producto) {
    try {
      await api(`/productos/${p.id}`, { method: 'PUT', body: JSON.stringify({ ...p, activo: !p.activo }) });
      cargar();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        contentContainerStyle={styles.list}
        data={productos}
        keyExtractor={(p) => String(p.id)}
        ListHeaderComponent={
          <Pressable onPress={() => setCreando(true)} style={styles.addBtn}>
            <Plus size={18} color={colors.white} />
            <Text style={styles.addBtnText}>Nuevo producto</Text>
          </Pressable>
        }
        ListEmptyComponent={
          <EmptyState titulo="Sin productos" texto="Crea tu primer producto para que los clientes puedan pedirlo." />
        }
        renderItem={({ item: p }) => (
          <Card padded={false} style={[styles.prodCard, !p.activo && { opacity: 0.6 }]}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={{ uri: p.imagenUrl }} style={styles.img} />
              <View style={{ flex: 1, padding: spacing(3) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing(2) }}>
                  <Text style={styles.nombre} numberOfLines={1}>
                    {p.nombre}
                  </Text>
                  <Text style={styles.precio}>{formatoUSD(p.precio)}</Text>
                </View>
                <Text style={styles.desc} numberOfLines={2}>
                  {p.descripcion}
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing(2), marginTop: spacing(2) }}>
                  <Pressable onPress={() => setEditar(p)} style={styles.accion}>
                    <Pencil size={14} color={colors.text} />
                    <Text style={styles.accionText}>Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => toggleActivo(p)} style={[styles.accion, !p.activo && { borderColor: colors.success }]}>
                    {p.activo ? <EyeOff size={14} color={colors.textMuted} /> : <Eye size={14} color={colors.success} />}
                    <Text style={[styles.accionText, !p.activo && { color: colors.success }]}>
                      {p.activo ? 'Ocultar' : 'Activar'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Card>
        )}
      />

      {(creando || editar) && (
        <ProductoModal
          producto={editar}
          onClose={() => {
            setCreando(false);
            setEditar(null);
          }}
          onGuardado={() => {
            setCreando(false);
            setEditar(null);
            cargar();
          }}
        />
      )}
    </View>
  );
}

function ProductoModal({
  producto,
  onClose,
  onGuardado,
}: {
  producto: Producto | null;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const esEdicion = !!producto;
  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio: String(producto?.precio ?? ''),
    imagenUrl: producto?.imagenUrl ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function guardar() {
    if (!form.nombre.trim() || !(Number(form.precio) > 0)) {
      Alert.alert('Faltan datos', 'Nombre y precio (mayor a 0) son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const body = JSON.stringify({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        imagenUrl: form.imagenUrl.trim() || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
        ...(esEdicion ? { activo: producto!.activo } : {}),
      });
      if (esEdicion) await api(`/productos/${producto!.id}`, { method: 'PUT', body });
      else await api('/productos', { method: 'POST', body });
      onGuardado();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={{ padding: spacing(5), gap: spacing(3) }}>
            <Text style={styles.modalTitulo}>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</Text>

            {form.imagenUrl ? <Image source={{ uri: form.imagenUrl }} style={styles.preview} /> : null}

            <View style={{ gap: spacing(1) }}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput value={form.nombre} onChangeText={(v) => set('nombre', v)} placeholder="Ej. Pan integral" placeholderTextColor={colors.textSubtle} style={styles.input} />
            </View>
            <View style={{ gap: spacing(1) }}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput value={form.descripcion} onChangeText={(v) => set('descripcion', v)} placeholder="Breve descripción" placeholderTextColor={colors.textSubtle} multiline style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]} />
            </View>
            <View style={{ gap: spacing(1) }}>
              <Text style={styles.label}>Precio ($)</Text>
              <TextInput value={form.precio} onChangeText={(v) => set('precio', v)} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textSubtle} style={styles.input} />
            </View>
            <View style={{ gap: spacing(1) }}>
              <Text style={styles.label}>Imagen (URL)</Text>
              <TextInput value={form.imagenUrl} onChangeText={(v) => set('imagenUrl', v)} autoCapitalize="none" placeholder="https://..." placeholderTextColor={colors.textSubtle} style={styles.input} />
            </View>

            <View style={{ flexDirection: 'row', gap: spacing(2), marginTop: spacing(1) }}>
              <Button title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
              <Button title={guardando ? 'Guardando…' : 'Guardar'} onPress={guardar} loading={guardando} icon={<Save size={16} color={colors.white} />} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  list: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(3) },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: spacing(3),
    borderRadius: radii.lg,
    marginBottom: spacing(1),
  },
  addBtnText: { color: colors.white, fontWeight: '700' },
  prodCard: { overflow: 'hidden' },
  img: { width: 96, height: 96, backgroundColor: colors.primaryLight },
  nombre: { fontWeight: '800', color: colors.text, fontSize: 15, flex: 1 },
  precio: { fontWeight: '800', color: colors.primaryDark, fontSize: 14 },
  desc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  accionText: { fontSize: 12, fontWeight: '700', color: colors.text },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(58,42,26,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.card, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, maxHeight: '92%' },
  modalTitulo: { fontSize: fonts.h2, fontWeight: '800', color: colors.text },
  preview: { width: '100%', height: 150, borderRadius: radii.lg, backgroundColor: colors.primaryLight },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
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
});
