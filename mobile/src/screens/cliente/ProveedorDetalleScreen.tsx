import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, MessageCircle, Plus, Minus, ShoppingCart, Send } from 'lucide-react-native';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import { api, formatoUSD } from '../../lib/api';
import { useCarrito, ProductoMin } from '../../store/carrito';
import { colors, fonts, radii, spacing } from '../../theme';
import type { ProveedoresStackParamList } from '../../navigation/types';

interface Detalle {
  id: number;
  nombre: string;
  nombreNegocio: string | null;
  descripcion: string | null;
  fotoUrl: string | null;
  direccion: string | null;
  productos: (ProductoMin & { descripcion: string; activo: boolean })[];
  miAfiliacion: { id: number; estado: string; mensaje?: string | null } | null;
}

type Nav = NativeStackNavigationProp<ProveedoresStackParamList, 'ProveedorDetalle'>;

export default function ProveedorDetalleScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<ProveedoresStackParamList, 'ProveedorDetalle'>>();
  const { id } = route.params;
  const [data, setData] = useState<Detalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const carrito = useCarrito();

  const cargar = useCallback(async () => {
    try {
      const d = await api<Detalle>(`/proveedores/${id}`);
      setData(d);
      carrito.setProveedor(d.id, d.nombreNegocio || d.nombre);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function solicitar() {
    if (!data) return;
    setEnviando(true);
    try {
      await api('/afiliaciones', {
        method: 'POST',
        body: JSON.stringify({ proveedorId: data.id, mensaje: mensaje || undefined }),
      });
      setMensaje('');
      await cargar();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const afi = data.miAfiliacion;
  const aprobado = afi?.estado === 'APROBADA';
  const cantTotal = carrito.cantidadTotal();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <Card style={[styles.hero, { backgroundColor: colors.primarySoft }]}>
          <View style={{ flexDirection: 'row', gap: spacing(3) }}>
            <Avatar uri={data.fotoUrl} size={84} radius={radii.lg} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.titulo}>{data.nombreNegocio || data.nombre}</Text>
              <Text style={styles.sub}>{data.nombre}</Text>
              {data.direccion ? (
                <View style={styles.metaRow}>
                  <MapPin size={12} color={colors.textMuted} />
                  <Text style={styles.metaText}>{data.direccion}</Text>
                </View>
              ) : null}
            </View>
          </View>
          {data.descripcion ? <Text style={styles.desc}>{data.descripcion}</Text> : null}
          <Button
            title="Chatear"
            variant="secondary"
            icon={<MessageCircle size={16} color={colors.text} />}
            onPress={() =>
              navigation.getParent()?.navigate('Mensajes', {
                screen: 'Chat',
                params: { otroId: data.id, nombre: data.nombreNegocio || data.nombre },
              })
            }
            style={{ alignSelf: 'flex-start', marginTop: spacing(3) }}
          />
        </Card>

        {/* Estado de afiliación */}
        {!afi && (
          <Card style={styles.afiCard}>
            <Text style={styles.afiTitulo}>Solicita afiliación para hacer pedidos</Text>
            <Text style={styles.muted}>El proveedor debe aprobarte. Cuéntale sobre tu negocio.</Text>
            <TextInput
              value={mensaje}
              onChangeText={setMensaje}
              placeholder="Hola, somos [tu negocio], queremos hacer pedidos mayoristas…"
              placeholderTextColor={colors.textSubtle}
              multiline
              style={styles.textarea}
            />
            <Button
              title={enviando ? 'Enviando…' : 'Enviar solicitud'}
              onPress={solicitar}
              loading={enviando}
              icon={<Send size={16} color={colors.white} />}
              fullWidth
            />
          </Card>
        )}
        {afi?.estado === 'PENDIENTE' && (
          <Card style={[styles.aviso, { backgroundColor: colors.warningBg, borderColor: '#fcd34d' }]}>
            <Text style={[styles.avisoText, { color: colors.warning }]}>
              ⏳ Tu solicitud está pendiente de aprobación.
            </Text>
            {afi.mensaje ? <Text style={styles.avisoSub}>"{afi.mensaje}"</Text> : null}
          </Card>
        )}
        {afi?.estado === 'RECHAZADA' && (
          <Card style={[styles.aviso, { backgroundColor: colors.dangerBg, borderColor: '#fca5a5' }]}>
            <Text style={[styles.avisoText, { color: colors.danger }]}>Tu solicitud fue rechazada.</Text>
            <Button
              title="Volver a solicitar"
              variant="danger"
              onPress={solicitar}
              loading={enviando}
              style={{ marginTop: spacing(2) }}
            />
          </Card>
        )}

        {/* Catálogo */}
        <Text style={styles.seccion}>Catálogo</Text>
        {data.productos.length === 0 ? (
          <Text style={styles.muted}>Este proveedor aún no publicó productos.</Text>
        ) : (
          <View style={{ gap: spacing(3) }}>
            {data.productos.map((p) => (
              <ProductoCard key={p.id} producto={p} aprobado={aprobado} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Botón flotante al carrito */}
      {aprobado && cantTotal > 0 && (
        <Pressable
          onPress={() => navigation.navigate('HacerPedido', { proveedorId: data.id })}
          style={styles.fab}
        >
          <ShoppingCart size={18} color={colors.white} />
          <Text style={styles.fabText}>
            {cantTotal} · {formatoUSD(carrito.total())}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function ProductoCard({
  producto,
  aprobado,
}: {
  producto: ProductoMin & { descripcion: string };
  aprobado: boolean;
}) {
  const items = useCarrito((s) => s.items);
  const agregar = useCarrito((s) => s.agregar);
  const setCantidad = useCarrito((s) => s.setCantidad);
  const cant = items[producto.id]?.cantidad || 0;

  return (
    <Card padded={false} style={styles.prodCard}>
      <View style={{ flexDirection: 'row' }}>
        <Image source={{ uri: producto.imagenUrl }} style={styles.prodImg} />
        <View style={{ flex: 1, padding: spacing(3), justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.prodNombre}>{producto.nombre}</Text>
            {producto.descripcion ? (
              <Text style={styles.prodDesc} numberOfLines={2}>
                {producto.descripcion}
              </Text>
            ) : null}
          </View>
          <View style={styles.prodFooter}>
            <Text style={styles.precio}>{formatoUSD(producto.precio)}</Text>
            {!aprobado ? (
              <Text style={styles.necesita}>Necesitas aprobación</Text>
            ) : cant === 0 ? (
              <Pressable onPress={() => agregar(producto)} style={styles.addBtn}>
                <Plus size={14} color={colors.white} />
                <Text style={styles.addText}>Agregar</Text>
              </Pressable>
            ) : (
              <View style={styles.stepper}>
                <Pressable onPress={() => setCantidad(producto.id, cant - 1)} style={styles.stepBtn}>
                  <Minus size={14} color={colors.text} />
                </Pressable>
                <Text style={styles.stepCant}>{cant}</Text>
                <Pressable
                  onPress={() => setCantidad(producto.id, cant + 1)}
                  style={[styles.stepBtn, { backgroundColor: colors.primary }]}
                >
                  <Plus size={14} color={colors.white} />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(20), gap: spacing(4) },
  hero: { gap: spacing(2) },
  titulo: { fontSize: fonts.h2, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 12, color: colors.textMuted },
  desc: { fontSize: 14, color: colors.text, marginTop: spacing(2), lineHeight: 20 },
  muted: { color: colors.textMuted, lineHeight: 20 },
  afiCard: { borderStyle: 'dashed', borderColor: colors.primary, borderWidth: 2, gap: spacing(2) },
  afiTitulo: { fontWeight: '800', color: colors.text, fontSize: fonts.h3 },
  textarea: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing(3),
    color: colors.text,
    textAlignVertical: 'top',
    backgroundColor: colors.white,
  },
  aviso: { gap: spacing(1) },
  avisoText: { fontWeight: '700' },
  avisoSub: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic' },
  seccion: { fontSize: fonts.h2, fontWeight: '800', color: colors.text },
  prodCard: { overflow: 'hidden' },
  prodImg: { width: 104, height: 104, backgroundColor: colors.primaryLight },
  prodNombre: { fontWeight: '800', color: colors.text, fontSize: 15 },
  prodDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  prodFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing(2) },
  precio: { fontWeight: '800', color: colors.primaryDark, fontSize: 15 },
  necesita: { fontSize: 11, color: colors.textSubtle, fontStyle: 'italic' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
  addText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCant: { fontWeight: '800', color: colors.text, minWidth: 22, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: spacing(6),
    right: spacing(5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.primary,
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
    borderRadius: radii.pill,
    shadowColor: '#3a2a1a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: { color: colors.white, fontWeight: '800' },
});
