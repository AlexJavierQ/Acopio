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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Plus,
  AlertTriangle,
  Package,
  ClipboardList,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Trash2,
  BarChart3,
  PlusCircle,
  Croissant,
} from 'lucide-react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FadeInView, Pulse } from '../../components/Motion';
import { api } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';
import type { InventarioStackParamList } from '../../navigation/types';

interface Insumo {
  id: number;
  nombre: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  costoUnitario: number;
}

type Nav = NativeStackNavigationProp<InventarioStackParamList, 'Insumos'>;

export default function InventarioScreen() {
  const navigation = useNavigation<Nav>();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [req, setReq] = useState<{ todoAlcanza: boolean; cantidadPedidos: number; listaCompras: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editar, setEditar] = useState<Insumo | null>(null);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [ins, rq] = await Promise.all([
        api<Insumo[]>('/insumos'),
        api<any>('/produccion/requerimientos').catch(() => null),
      ]);
      setInsumos(ins);
      setReq(rq);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const faltan = req?.listaCompras?.length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        contentContainerStyle={styles.list}
        data={insumos}
        keyExtractor={(i) => String(i.id)}
        ListHeaderComponent={
          <View style={{ gap: spacing(3), marginBottom: spacing(1) }}>
            {/* Banner de requerimientos */}
            <FadeInView>
            <Pressable onPress={() => navigation.navigate('Requerimientos')}>
              <Card
                style={[
                  styles.banner,
                  { backgroundColor: req && !req.todoAlcanza ? colors.warningBg : colors.successBg },
                ]}
              >
                {req && !req.todoAlcanza ? (
                  <Pulse>
                    <AlertTriangle size={28} color={colors.warning} />
                  </Pulse>
                ) : (
                  <CheckCircle2 size={28} color={colors.success} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bannerTitulo, { color: req && !req.todoAlcanza ? colors.warning : colors.success }]}>
                    {req && !req.todoAlcanza
                      ? `Faltan ${faltan} insumo${faltan === 1 ? '' : 's'} para tus pedidos`
                      : 'Tu inventario alcanza para los pedidos'}
                  </Text>
                  <Text style={styles.bannerSub}>
                    {req?.cantidadPedidos ?? 0} pedido{(req?.cantidadPedidos ?? 0) === 1 ? '' : 's'} pendiente
                    {(req?.cantidadPedidos ?? 0) === 1 ? '' : 's'} · ver requerimientos
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </Card>
            </Pressable>
            </FadeInView>

            {/* Acceso a recetas */}
            <Pressable onPress={() => navigation.navigate('Recetas')}>
              <Card style={styles.linkRow}>
                <BookOpen size={20} color={colors.primaryDark} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.linkTitulo}>Recetas de productos</Text>
                  <Text style={styles.bannerSub}>Define qué insumos usa cada producto</Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </Card>
            </Pressable>

            {/* Acceso a productos */}
            <Pressable onPress={() => navigation.navigate('Productos')}>
              <Card style={styles.linkRow}>
                <Croissant size={20} color={colors.primaryDark} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.linkTitulo}>Productos</Text>
                  <Text style={styles.bannerSub}>Tu catálogo: crea y edita lo que vendes</Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </Card>
            </Pressable>

            {/* Acceso a ventas y ganancias */}
            <Pressable onPress={() => navigation.navigate('Ventas')}>
              <Card style={styles.linkRow}>
                <BarChart3 size={20} color={colors.primaryDark} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.linkTitulo}>Ventas y ganancias</Text>
                  <Text style={styles.bannerSub}>Ingresos, costos y ganancia del periodo</Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </Card>
            </Pressable>

            {/* Encabezado materias primas */}
            <View style={styles.seccionRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Package size={20} color={colors.text} />
                <Text style={styles.seccion}>Materias primas</Text>
              </View>
              <Pressable onPress={() => setCreando(true)} style={styles.addBtn}>
                <Plus size={16} color={colors.white} />
                <Text style={styles.addBtnText}>Agregar</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Card style={{ alignItems: 'center', gap: spacing(2), paddingVertical: spacing(8) }}>
            <Package size={48} color={colors.primaryLight} />
            <Text style={styles.muted}>Aún no registras materias primas.</Text>
            <Button title="Agregar la primera" onPress={() => setCreando(true)} icon={<Plus size={16} color={colors.white} />} />
          </Card>
        }
        renderItem={({ item: i }) => {
          const bajo = i.stockActual <= i.stockMinimo;
          return (
            <Pressable onPress={() => setEditar(i)}>
              <Card style={[styles.insumoCard, bajo && { borderColor: '#fca5a5', backgroundColor: colors.dangerBg }]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.insumoNombre}>{i.nombre}</Text>
                  <Text style={styles.muted}>
                    Mínimo: {i.stockMinimo} {i.unidad}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[styles.stockNum, bajo && { color: colors.danger }]}>
                    {i.stockActual} {i.unidad}
                  </Text>
                  {bajo && (
                    <View style={styles.bajoChip}>
                      <AlertTriangle size={11} color={colors.danger} />
                      <Text style={styles.bajoText}>Bajo</Text>
                    </View>
                  )}
                </View>
              </Card>
            </Pressable>
          );
        }}
      />

      {(creando || editar) && (
        <InsumoModal
          insumo={editar}
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

function InsumoModal({
  insumo,
  onClose,
  onGuardado,
}: {
  insumo: Insumo | null;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const esEdicion = !!insumo;
  const [nombre, setNombre] = useState(insumo?.nombre ?? '');
  const [unidad, setUnidad] = useState(insumo?.unidad ?? 'kg');
  const [stockActual, setStockActual] = useState(String(insumo?.stockActual ?? ''));
  const [stockMinimo, setStockMinimo] = useState(String(insumo?.stockMinimo ?? ''));
  const [costoUnitario, setCostoUnitario] = useState(String(insumo?.costoUnitario ?? ''));
  const [guardando, setGuardando] = useState(false);
  const [compraCant, setCompraCant] = useState('');
  const [comprando, setComprando] = useState(false);

  async function registrarCompra() {
    const cantidad = Number(compraCant);
    if (!(cantidad > 0)) {
      Alert.alert('Cantidad inválida', 'Ingresa una cantidad mayor a 0.');
      return;
    }
    setComprando(true);
    try {
      await api(`/insumos/${insumo!.id}/compra`, { method: 'POST', body: JSON.stringify({ cantidad }) });
      setCompraCant('');
      onGuardado();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setComprando(false);
    }
  }

  async function guardar() {
    if (!nombre.trim() || !unidad.trim()) {
      Alert.alert('Faltan datos', 'Nombre y unidad son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const body = JSON.stringify({
        nombre: nombre.trim(),
        unidad: unidad.trim(),
        stockActual: Number(stockActual) || 0,
        stockMinimo: Number(stockMinimo) || 0,
        costoUnitario: Number(costoUnitario) || 0,
      });
      if (esEdicion) await api(`/insumos/${insumo!.id}`, { method: 'PUT', body });
      else await api('/insumos', { method: 'POST', body });
      onGuardado();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setGuardando(false);
    }
  }

  function eliminar() {
    Alert.alert('Eliminar insumo', `¿Eliminar "${insumo!.nombre}"? Se quitará de las recetas que lo usen.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api(`/insumos/${insumo!.id}`, { method: 'DELETE' });
            onGuardado();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  }

  const unidades = ['kg', 'g', 'lt', 'ml', 'unidades'];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={{ padding: spacing(5), gap: spacing(3) }}>
            <Text style={styles.modalTitulo}>{esEdicion ? 'Editar insumo' : 'Nuevo insumo'}</Text>

            <View style={{ gap: spacing(1) }}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput value={nombre} onChangeText={setNombre} placeholder="Ej. Harina de trigo" placeholderTextColor={colors.textSubtle} style={styles.input} />
            </View>

            <View style={{ gap: spacing(1) }}>
              <Text style={styles.label}>Unidad</Text>
              <View style={styles.unidadRow}>
                {unidades.map((u) => {
                  const activo = unidad === u;
                  return (
                    <Pressable key={u} onPress={() => setUnidad(u)} style={[styles.unidadBtn, activo && styles.unidadBtnActivo]}>
                      <Text style={[styles.unidadText, activo && { color: colors.white }]}>{u}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: spacing(3) }}>
              <View style={{ flex: 1, gap: spacing(1) }}>
                <Text style={styles.label}>Stock actual</Text>
                <TextInput value={stockActual} onChangeText={setStockActual} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textSubtle} style={styles.input} />
              </View>
              <View style={{ flex: 1, gap: spacing(1) }}>
                <Text style={styles.label}>Stock mínimo</Text>
                <TextInput value={stockMinimo} onChangeText={setStockMinimo} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textSubtle} style={styles.input} />
              </View>
            </View>

            <View style={{ gap: spacing(1) }}>
              <Text style={styles.label}>Costo por {unidad} ($)</Text>
              <TextInput
                value={costoUnitario}
                onChangeText={setCostoUnitario}
                keyboardType="numeric"
                placeholder="Para calcular la ganancia"
                placeholderTextColor={colors.textSubtle}
                style={styles.input}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: spacing(2), marginTop: spacing(1) }}>
              <Button title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
              <Button title={guardando ? 'Guardando…' : 'Guardar'} onPress={guardar} loading={guardando} style={{ flex: 1 }} />
            </View>

            {esEdicion && (
              <View style={styles.compraBox}>
                <Text style={styles.compraTitulo}>Registrar compra (suma al stock)</Text>
                <View style={{ flexDirection: 'row', gap: spacing(2) }}>
                  <TextInput
                    value={compraCant}
                    onChangeText={setCompraCant}
                    keyboardType="numeric"
                    placeholder={`Cantidad en ${unidad}`}
                    placeholderTextColor={colors.textSubtle}
                    style={[styles.input, { flex: 1 }]}
                  />
                  <Button
                    title={comprando ? '…' : 'Sumar'}
                    variant="secondary"
                    onPress={registrarCompra}
                    loading={comprando}
                    icon={<PlusCircle size={16} color={colors.text} />}
                  />
                </View>
              </View>
            )}

            {esEdicion && (
              <Pressable onPress={eliminar} style={styles.eliminar}>
                <Trash2 size={15} color={colors.danger} />
                <Text style={styles.eliminarText}>Eliminar insumo</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  list: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(3) },
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  bannerTitulo: { fontWeight: '800', fontSize: 15 },
  bannerSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  linkTitulo: { fontWeight: '800', color: colors.text, fontSize: 15 },
  seccionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing(2) },
  seccion: { fontSize: fonts.h3, fontWeight: '800', color: colors.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: spacing(3), paddingVertical: spacing(2), borderRadius: radii.md },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  muted: { color: colors.textMuted, fontSize: 13 },
  insumoCard: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  insumoNombre: { fontWeight: '800', color: colors.text, fontSize: 15 },
  stockNum: { fontWeight: '800', color: colors.text, fontSize: 15 },
  bajoChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fecaca', paddingHorizontal: 7, paddingVertical: 2, borderRadius: radii.pill },
  bajoText: { color: colors.danger, fontSize: 10, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(58,42,26,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.card, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, maxHeight: '90%' },
  modalTitulo: { fontSize: fonts.h2, fontWeight: '800', color: colors.text },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, paddingHorizontal: spacing(3), paddingVertical: spacing(3), color: colors.text, backgroundColor: colors.white, fontSize: 15 },
  unidadRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  unidadBtn: { paddingHorizontal: spacing(3), paddingVertical: spacing(2), borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  unidadBtnActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  unidadText: { fontSize: 13, fontWeight: '700', color: colors.text },
  eliminar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing(2) },
  eliminarText: { color: colors.danger, fontWeight: '700' },
  compraBox: { backgroundColor: colors.primarySoft, borderRadius: radii.md, padding: spacing(3), gap: spacing(2) },
  compraTitulo: { fontWeight: '700', color: colors.text, fontSize: 13 },
});
