import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DollarSign, Receipt, Wallet, Percent, AlertTriangle } from 'lucide-react-native';
import Card from '../../components/Card';
import EstadoChip, { Estado } from '../../components/EstadoChip';
import { FadeInView } from '../../components/Motion';
import { api, formatoUSD } from '../../lib/api';
import { colors, fonts, radii, spacing } from '../../theme';

interface Serie {
  fecha: string;
  ventas: number;
  ganancia: number;
}
interface Reporte {
  ventas: number;
  costo: number;
  ganancia: number;
  margen: number;
  nPedidos: number;
  unidades: number;
  ticketPromedio: number;
  serie: Serie[];
  historial: { id: number; fecha: string; cliente: string; total: number; estado: string; ganancia: number }[];
  costeoIncompleto: boolean;
}

type Periodo = 'hoy' | '7d' | '30d';

function rango(p: Periodo) {
  const hasta = new Date();
  const desde = new Date();
  if (p === 'hoy') desde.setHours(0, 0, 0, 0);
  else if (p === '7d') desde.setDate(desde.getDate() - 6);
  else desde.setDate(desde.getDate() - 29);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { desde: fmt(desde), hasta: fmt(hasta) };
}

export default function VentasScreen() {
  const [periodo, setPeriodo] = useState<Periodo>('7d');
  const [data, setData] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { desde, hasta } = rango(periodo);
      const d = await api<Reporte>(`/reportes?desde=${desde}&hasta=${hasta}`);
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const periodos: { key: Periodo; label: string }[] = [
    { key: 'hoy', label: 'Hoy' },
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
  ];
  const maxVenta = Math.max(1, ...(data?.serie.map((s) => s.ventas) ?? [1]));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.scroll}>
      {/* Selector de periodo */}
      <View style={styles.tabs}>
        {periodos.map((p) => {
          const activo = periodo === p.key;
          return (
            <Pressable key={p.key} onPress={() => setPeriodo(p.key)} style={[styles.tab, activo && styles.tabActivo]}>
              <Text style={[styles.tabText, activo && { color: colors.white }]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading || !data ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing(10) }} />
      ) : (
        <>
          {data.costeoIncompleto && (
            <View style={styles.aviso}>
              <AlertTriangle size={16} color={colors.warning} />
              <Text style={styles.avisoText}>
                Ganancia aproximada: faltan recetas o costos de insumos. Complétalos en Inventario.
              </Text>
            </View>
          )}

          {/* KPIs */}
          <FadeInView>
            <View style={styles.kpiRow}>
              <Kpi icon={<DollarSign size={16} color={colors.primaryDark} />} label="Ventas" valor={formatoUSD(data.ventas)} />
              <Kpi icon={<Receipt size={16} color={colors.textMuted} />} label="Costo" valor={formatoUSD(data.costo)} />
            </View>
            <View style={styles.kpiRow}>
              <Kpi
                icon={<Wallet size={16} color={data.ganancia >= 0 ? colors.success : colors.danger} />}
                label="Ganancia"
                valor={formatoUSD(data.ganancia)}
                color={data.ganancia >= 0 ? colors.success : colors.danger}
              />
              <Kpi icon={<Percent size={16} color={colors.textMuted} />} label="Margen" valor={`${data.margen.toFixed(1)}%`} />
            </View>
          </FadeInView>

          <Text style={styles.sub}>
            {data.nPedidos} pedido{data.nPedidos === 1 ? '' : 's'} · {data.unidades} unidades · ticket {formatoUSD(data.ticketPromedio)}
          </Text>

          {/* Gráfico diario */}
          <Card>
            <Text style={styles.cardTitulo}>Ventas por día</Text>
            {data.serie.length === 0 ? (
              <Text style={styles.muted}>Sin ventas en este periodo.</Text>
            ) : (
              <View style={styles.chart}>
                {data.serie.map((s) => {
                  const h = Math.max(4, (s.ventas / maxVenta) * 100);
                  const ganPct = s.ventas > 0 ? Math.max(0, (s.ganancia / s.ventas) * 100) : 0;
                  return (
                    <View key={s.fecha} style={styles.barCol}>
                      <View style={styles.barTrack}>
                        <View style={[styles.bar, { height: `${h}%` }]}>
                          <View style={[styles.barGan, { height: `${ganPct}%` }]} />
                        </View>
                      </View>
                      <Text style={styles.barLabel}>{s.fecha.slice(8, 10)}</Text>
                    </View>
                  );
                })}
              </View>
            )}
            <View style={styles.leyenda}>
              <View style={styles.leyItem}>
                <View style={[styles.leyDot, { backgroundColor: colors.primaryLight }]} />
                <Text style={styles.muted}>Ventas</Text>
              </View>
              <View style={styles.leyItem}>
                <View style={[styles.leyDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.muted}>Ganancia</Text>
              </View>
            </View>
          </Card>

          {/* Historial */}
          <Text style={styles.seccion}>Historial</Text>
          {data.historial.length === 0 ? (
            <Text style={styles.muted}>Sin pedidos en este periodo.</Text>
          ) : (
            <Card padded={false} style={{ overflow: 'hidden' }}>
              {data.historial.map((h, idx) => (
                <View key={h.id} style={[styles.histRow, idx > 0 && styles.histBorder]}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.histCliente} numberOfLines={1}>
                      #{h.id} · {h.cliente}
                    </Text>
                    <Text style={styles.muted}>{new Date(h.fecha).toLocaleDateString('es-EC')}</Text>
                  </View>
                  <EstadoChip estado={h.estado as Estado} />
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.histTotal}>{formatoUSD(h.total)}</Text>
                    <Text style={styles.histGan}>+{formatoUSD(h.ganancia)}</Text>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Kpi({ icon, label, valor, color }: { icon: React.ReactNode; label: string; valor: string; color?: string }) {
  return (
    <Card style={styles.kpi}>
      <View style={styles.kpiIcon}>{icon}</View>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValor, color && { color }]}>{valor}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing(4), paddingBottom: spacing(10), gap: spacing(3) },
  tabs: { flexDirection: 'row', gap: spacing(2) },
  tab: { flex: 1, paddingVertical: spacing(2), borderRadius: radii.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  tabActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontWeight: '700', color: colors.textMuted, fontSize: 13 },
  aviso: { flexDirection: 'row', gap: spacing(2), backgroundColor: colors.warningBg, borderWidth: 1, borderColor: '#fcd34d', borderRadius: radii.md, padding: spacing(3) },
  avisoText: { flex: 1, color: colors.warning, fontSize: 12 },
  kpiRow: { flexDirection: 'row', gap: spacing(3), marginBottom: spacing(3) },
  kpi: { flex: 1, gap: 2 },
  kpiIcon: { width: 32, height: 32, borderRadius: radii.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  kpiLabel: { color: colors.textMuted, fontSize: 12 },
  kpiValor: { fontSize: fonts.h3, fontWeight: '800', color: colors.text },
  sub: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  cardTitulo: { fontWeight: '800', color: colors.text, fontSize: 15, marginBottom: spacing(3) },
  muted: { color: colors.textMuted, fontSize: 12 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 140 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { width: '100%', height: 120, justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: colors.primaryLight, borderTopLeftRadius: 4, borderTopRightRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barGan: { width: '100%', backgroundColor: colors.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barLabel: { fontSize: 8, color: colors.textSubtle },
  leyenda: { flexDirection: 'row', gap: spacing(4), marginTop: spacing(3) },
  leyItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leyDot: { width: 10, height: 10, borderRadius: 3 },
  seccion: { fontSize: fonts.h3, fontWeight: '800', color: colors.text, marginTop: spacing(1) },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), padding: spacing(3) },
  histBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  histCliente: { fontWeight: '700', color: colors.text, fontSize: 14 },
  histTotal: { fontWeight: '800', color: colors.text, fontSize: 14 },
  histGan: { color: colors.success, fontSize: 11, fontWeight: '700' },
});
