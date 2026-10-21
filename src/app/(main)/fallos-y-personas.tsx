import { StyleSheet, Text, View } from "react-native";
import { ColumnChart } from "@/components/charts/column-chart";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { PageGate } from "@/components/dashboard/page-gate";
import { Card } from "@/components/ui/card";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { formatMonth, formatNumber, frecuenciaCopy } from "@/dashboard/format";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";
import type { ResumenEjecutivo } from "@/types/api";

export default function PersonasScreen() {
  return (
    <PageGate flag="page.fallos-y-personas">
      <DashboardScreen subtitle="Fallos y personas alcanzadas según los filtros seleccionados.">
        {(data) => <PersonasBody data={data} />}
      </DashboardScreen>
    </PageGate>
  );
}

function PersonasBody({ data }: { data: ResumenEjecutivo }) {
  const { colors } = useTheme();
  const copy = frecuenciaCopy(data.filtros?.frecuencia);
  const rows = data.fallos_y_personas;
  const totalFallos = rows.reduce((sum, row) => sum + row.fallos, 0);
  const totalLesionados = rows.reduce((sum, row) => sum + row.lesionados, 0);
  const totalFallecidos = rows.reduce((sum, row) => sum + row.fallecidos, 0);
  const totalDerechohabientes = rows.reduce((sum, row) => sum + row.derechohabientes, 0);

  return (
    <View style={styles.stack}>
      <KpiGrid>
        <KpiCard label="Fallos" value={formatNumber(totalFallos)} detail="período" />
        <KpiCard label="Lesionados" value={formatNumber(totalLesionados)} detail="personas" />
        <KpiCard label="Fallecidos" value={formatNumber(totalFallecidos)} detail="personas" />
        <KpiCard label="Derechohabientes" value={formatNumber(totalDerechohabientes)} detail="personas" />
      </KpiGrid>
      <Card title={`${copy.evolucion} de fallos`} subtitle={copy.detalle}>
        <ColumnChart
          points={rows.map((row) => ({ label: formatMonth(row.mes), value: row.fallos }))}
          formatValue={(value) => formatNumber(value)}
        />
      </Card>
      <Card title="Cantidad de fallos y personas" subtitle={copy.detalle}>
        {rows.map((row) => (
          <View key={row.mes} style={[styles.row, { borderColor: colors.lineSoft }]}>
            <Text style={{ color: colors.ink, fontWeight: "600" }}>{formatMonth(row.mes)}</Text>
            <View style={styles.metrics}>
              <Metric label="Fallos" value={formatNumber(row.fallos)} />
              <Metric label="Lesionados" value={formatNumber(row.lesionados)} />
              <Metric label="Fallecidos" value={formatNumber(row.fallecidos)} />
              <Metric label="Derechohab." value={formatNumber(row.derechohabientes)} />
              <Metric label="Les. x fallo" value={row.lesionados_por_fallo.toFixed(2)} />
              <Metric label="DH x fallecido" value={row.derechohabientes_por_fallecido.toFixed(2)} />
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.metric, { backgroundColor: colors.surfaceHover }]}>
      <Text style={{ color: colors.muted, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: colors.ink, fontWeight: "700", fontVariant: ["tabular-nums"] }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  row: { borderWidth: 1, borderRadius: radius.md, padding: 12, gap: 10 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metric: { flexBasis: "30%", flexGrow: 1, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 7, gap: 2 },
});
