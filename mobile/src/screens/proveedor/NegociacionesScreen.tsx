import React, { useCallback, useEffect, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { Handshake, Percent, DollarSign, Gift, Plus, Minus, Trash2 } from 'lucide-react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { api, formatoUSD } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl: string;
}
interface Negociacion {
  id: number;
  estado: 'SOLICITADA' | 'ACEPTADA' | 'RECHAZADA' | 'CONTRA_PROPUESTA';
  mensajeCliente: string | null;
  tipo: 'PORCENTAJE' | 'MONTO_FIJO' | 'BONO' | null;
  valor: number | null;
  notaProveedor: string | null;
  bonos: { id: number; cantidad: number; producto: Producto }[];
  pedido: {
    id: number;
    horaEntrega: string;
    subtotal: number;
    total: number;
    cliente: { id: number; nombre: string; telefono: string };
    items: { id: number; cantidad: number; esBono: boolean; producto: Producto }[];
  };
}

type Tab = 'SOLICITADA' | 'ACEPTADA' | 'RECHAZADA';
const TABS: { key: Tab; label: string }[] = [
  { key: 'SOLICITADA', label: 'Pendientes' },
  { key: 'ACEPTADA', label: 'Aceptadas' },
  { key: 'RECHAZADA', label: 'Rechazadas' },
];

export default function NegociacionesScreen() {
  const [tab, setTab] = useState<Tab>('SOLICITADA');
  const [items, setItems] = useState<Negociacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [responder, setResponder] = useState<Negociacion | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Negociacion[]>(`/negociaciones?estado=${tab}`);
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(n) => String(n.id)}
        ListHeaderComponent={
          <View style={{ gap: spacing(3), marginBottom: spacing(1) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Handshake size={24} color={colors.text} />
              <Text style={styles.h1}>Negociaciones</Text>
            </View>
            <View style={styles.tabs}>
              {TABS.map((t) => {
                const activo = tab === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setTab(t.key)}
                    style={[styles.tab, activo && styles.tabActivo]}
                  >
                    <Text style={[styles.tabText, activo && { color: colors.white }]}>{t.label}</Text>
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
              {tab === 'SOLICITADA' ? 'No hay solicitudes pendientes 🙌' : 'Vacío.'}
            </Text>
          )
        }
        renderItem={({ item: n }) => {
          const productos = n.pedido.items.filter((i) => !i.esBono);
          return (
            <Card style={{ gap: spacing(3) }}>
              <View>
                <Text style={styles.titulo}>
                  Pedido #{n.pedido.id} · {n.pedido.cliente.nombre}
                </Text>
                <Text style={styles.muted}>
                  Subtotal: {formatoUSD(n.pedido.subtotal)} · Entrega: {n.pedido.horaEntrega}
                </Text>
              </View>

              <View style={styles.chipsRow}>
                {productos.slice(0, 4).map((it) => (
                  <View key={it.id} style={styles.prodChip}>
                    <Text style={styles.prodChipText}>
                      {it.cantidad}× {it.producto.nombre}
                    </Text>
                  </View>
                ))}
                {productos.length > 4 && (
                  <View style={styles.prodChip}>
                    <Text style={styles.prodChipText}>+{productos.length - 4} más</Text>
                  </View>
                )}
              </View>

              {n.mensajeCliente ? (
                <View style={styles.mensajeBox}>
                  <Text style={styles.mensajeLabel}>MENSAJE DEL CLIENTE</Text>
                  <Text style={styles.mensajeText}>"{n.mensajeCliente}"</Text>
                </View>
              ) : null}

              {n.estado === 'ACEPTADA' && (
                <View style={[styles.resultBox, { backgroundColor: colors.successBg }]}>
                  <Text style={[styles.resultText, { color: colors.success }]}>
                    ✅ Aceptada —{' '}
                    {n.tipo === 'PORCENTAJE' && `Descuento ${n.valor}%`}
                    {n.tipo === 'MONTO_FIJO' && `Descuento ${formatoUSD(n.valor || 0)}`}
                    {n.tipo === 'BONO' &&
                      `Bono: ${n.bonos.map((b) => `${b.cantidad}× ${b.producto.nombre}`).join(', ')}`}
                  </Text>
                  {n.notaProveedor ? (
                    <Text style={[styles.resultText, { fontStyle: 'italic' }]}>"{n.notaProveedor}"</Text>
                  ) : null}
                </View>
              )}
              {n.estado === 'RECHAZADA' && (
                <View style={[styles.resultBox, { backgroundColor: colors.dangerBg }]}>
                  <Text style={[styles.resultText, { color: colors.danger }]}>
                    ❌ Rechazada {n.notaProveedor ? `— "${n.notaProveedor}"` : ''}
                  </Text>
                </View>
              )}

              {n.estado === 'SOLICITADA' && (
                <Button title="Responder" onPress={() => setResponder(n)} fullWidth />
              )}
            </Card>
          );
        }}
      />

      {responder && (
        <ModalResponder
          neg={responder}
          onClose={() => setResponder(null)}
          onHecho={() => {
            setResponder(null);
            cargar();
          }}
        />
      )}
    </View>
  );
}

function ModalResponder({
  neg,
  onClose,
  onHecho,
}: {
  neg: Negociacion;
  onClose: () => void;
  onHecho: () => void;
}) {
  const [tipo, setTipo] = useState<'PORCENTAJE' | 'MONTO_FIJO' | 'BONO'>('PORCENTAJE');
  const [valor, setValor] = useState('10');
  const [bonos, setBonos] = useState<{ productoId: number; cantidad: number; nombre: string }[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState<'aceptar' | 'rechazar' | null>(null);

  useEffect(() => {
    api<Producto[]>('/productos').then(setProductos).catch(() => {});
  }, []);

  function agregarBono(p: Producto) {
    setBonos((arr) => {
      const ex = arr.find((b) => b.productoId === p.id);
      if (ex) return arr.map((b) => (b.productoId === p.id ? { ...b, cantidad: b.cantidad + 1 } : b));
      return [...arr, { productoId: p.id, cantidad: 1, nombre: p.nombre }];
    });
  }
  function cambiarBono(productoId: number, cantidad: number) {
    if (cantidad <= 0) setBonos((arr) => arr.filter((b) => b.productoId !== productoId));
    else setBonos((arr) => arr.map((b) => (b.productoId === productoId ? { ...b, cantidad } : b)));
  }

  async function aceptar() {
    setEnviando('aceptar');
    try {
      const body: any = { tipo, notaProveedor: nota || undefined };
      if (tipo === 'BONO') {
        if (bonos.length === 0) {
          Alert.alert('Falta un bono', 'Agrega al menos un producto extra.');
          setEnviando(null);
          return;
        }
        body.bonos = bonos.map((b) => ({ productoId: b.productoId, cantidad: b.cantidad }));
      } else {
        body.valor = Number(valor);
      }
      await api(`/negociaciones/${neg.id}/aceptar`, { method: 'PATCH', body: JSON.stringify(body) });
      onHecho();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setEnviando(null);
    }
  }

  async function rechazar() {
    setEnviando('rechazar');
    try {
      await api(`/negociaciones/${neg.id}/rechazar`, {
        method: 'PATCH',
        body: JSON.stringify({ notaProveedor: nota || undefined }),
      });
      onHecho();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setEnviando(null);
    }
  }

  const subtotal = neg.pedido.subtotal;
  let descuento = 0;
  if (tipo === 'PORCENTAJE') descuento = (subtotal * (Number(valor) || 0)) / 100;
  else if (tipo === 'MONTO_FIJO') descuento = Math.min(subtotal, Number(valor) || 0);
  const totalFinal = Math.max(0, subtotal - descuento);

  const tipos = [
    { key: 'PORCENTAJE', label: 'Porcentaje', Icon: Percent },
    { key: 'MONTO_FIJO', label: 'Monto $', Icon: DollarSign },
    { key: 'BONO', label: 'Bono', Icon: Gift },
  ] as const;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={{ padding: spacing(5), gap: spacing(4) }}>
            <View>
              <Text style={styles.modalTitulo}>Responder negociación</Text>
              <Text style={styles.muted}>
                Pedido #{neg.pedido.id} · {neg.pedido.cliente.nombre}
              </Text>
            </View>

            <View style={styles.tipoRow}>
              {tipos.map((t) => {
                const activo = tipo === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setTipo(t.key)}
                    style={[styles.tipoBtn, activo && styles.tipoBtnActivo]}
                  >
                    <t.Icon size={20} color={activo ? colors.primaryDark : colors.textMuted} />
                    <Text style={[styles.tipoText, activo && { color: colors.text }]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {tipo !== 'BONO' ? (
              <View style={{ gap: spacing(2) }}>
                <Text style={styles.label}>
                  {tipo === 'PORCENTAJE' ? '% de descuento' : 'Monto $ a descontar'}
                </Text>
                <TextInput
                  value={valor}
                  onChangeText={setValor}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <View style={styles.resumen}>
                  <Text style={styles.resumenText}>Subtotal: {formatoUSD(subtotal)}</Text>
                  <Text style={[styles.resumenText, { color: colors.success }]}>
                    Descuento: - {formatoUSD(descuento)}
                  </Text>
                  <Text style={[styles.resumenText, { fontWeight: '800', color: colors.text }]}>
                    Total final: {formatoUSD(totalFinal)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ gap: spacing(2) }}>
                <Text style={styles.label}>Productos extra de regalo</Text>
                {bonos.map((b) => (
                  <View key={b.productoId} style={styles.bonoRow}>
                    <Text style={{ flex: 1, fontWeight: '700', color: colors.text }}>{b.nombre}</Text>
                    <Pressable onPress={() => cambiarBono(b.productoId, b.cantidad - 1)} style={styles.stepBtn}>
                      <Minus size={14} color={colors.text} />
                    </Pressable>
                    <Text style={styles.stepCant}>{b.cantidad}</Text>
                    <Pressable
                      onPress={() => cambiarBono(b.productoId, b.cantidad + 1)}
                      style={[styles.stepBtn, { backgroundColor: colors.primary }]}
                    >
                      <Plus size={14} color={colors.white} />
                    </Pressable>
                    <Pressable onPress={() => cambiarBono(b.productoId, 0)} style={{ padding: 4 }}>
                      <Trash2 size={14} color={colors.danger} />
                    </Pressable>
                  </View>
                ))}
                <Text style={[styles.muted, { marginTop: spacing(1) }]}>Agregar producto:</Text>
                <View style={styles.prodGrid}>
                  {productos.map((p) => (
                    <Pressable key={p.id} onPress={() => agregarBono(p)} style={styles.prodAddBtn}>
                      <Text style={styles.prodAddNombre} numberOfLines={1}>
                        {p.nombre}
                      </Text>
                      <Text style={styles.muted}>{formatoUSD(p.precio)}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <TextInput
              value={nota}
              onChangeText={setNota}
              placeholder="Nota para el cliente (opcional)"
              placeholderTextColor={colors.textSubtle}
              multiline
              style={[styles.input, { minHeight: 56, textAlignVertical: 'top' }]}
            />

            <View style={{ flexDirection: 'row', gap: spacing(2) }}>
              <Button title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
              <Button
                title="Rechazar"
                variant="danger"
                onPress={rechazar}
                loading={enviando === 'rechazar'}
                style={{ flex: 1 }}
              />
              <Button
                title="Aceptar"
                onPress={aceptar}
                loading={enviando === 'aceptar'}
                style={{ flex: 1, backgroundColor: colors.success }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(3) },
  h1: { fontSize: fonts.h1, fontWeight: '800', color: colors.text },
  muted: { color: colors.textMuted, fontSize: 13 },
  tabs: { flexDirection: 'row', gap: spacing(2) },
  tab: {
    flex: 1,
    paddingVertical: spacing(2),
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontWeight: '700', color: colors.textMuted, fontSize: 13 },
  titulo: { fontWeight: '800', color: colors.text, fontSize: 15 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  prodChip: { backgroundColor: colors.primaryLight, borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 4 },
  prodChipText: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  mensajeBox: { backgroundColor: colors.warningBg, borderWidth: 1, borderColor: '#fcd34d', borderRadius: radii.md, padding: spacing(3) },
  mensajeLabel: { fontSize: 10, fontWeight: '800', color: colors.warning, marginBottom: 2 },
  mensajeText: { fontSize: 13, color: colors.warning, fontStyle: 'italic' },
  resultBox: { borderRadius: radii.md, padding: spacing(3), gap: 2 },
  resultText: { fontSize: 13 },
  // modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(58,42,26,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.card, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, maxHeight: '92%' },
  modalTitulo: { fontSize: fonts.h2, fontWeight: '800', color: colors.text },
  tipoRow: { flexDirection: 'row', gap: spacing(2) },
  tipoBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing(3),
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  tipoBtnActivo: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  tipoText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
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
  resumen: { backgroundColor: colors.primarySoft, borderRadius: radii.md, padding: spacing(3), gap: 3 },
  resumenText: { fontSize: 13, color: colors.textMuted },
  bonoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), backgroundColor: colors.primarySoft, borderRadius: radii.md, padding: spacing(2) },
  stepBtn: { width: 28, height: 28, borderRadius: radii.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  stepCant: { fontWeight: '800', color: colors.text, minWidth: 20, textAlign: 'center' },
  prodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  prodAddBtn: {
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing(2),
    backgroundColor: colors.white,
  },
  prodAddNombre: { fontWeight: '700', color: colors.text, fontSize: 13 },
});
