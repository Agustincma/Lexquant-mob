import { StyleSheet, Text, View } from "react-native";
import { BarList } from "@/components/charts/bar-list";
import { ColumnChart } from "@/components/charts/column-chart";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { PageGate } from "@/components/dashboard/page-gate";
import { Card } from "@/components/ui/card";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { formatCurrency, formatNumber } from "@/dashboard/format";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";
import type { ResumenEjecutivo } from "@/types/api";

export default function CostosScreen() {
  return (
    <PageGate flag="page.rubros-severidad">
      <DashboardScreen subtitle="Qué determina el monto indemnizatorio y cómo se distribuye la incapacidad.">
        {(data) => <CostosBody data={data} />}
      </DashboardScreen>
    </PageGate>
  );
}

function CostosBody({ data }: { data: ResumenEjecutivo }) {
  const { colors } = useTheme();
  const { kpis, composicion_capital_indemnizatorio: composicion, distribucion_incapacidades: incapacidad } = data;
  const dispersion = [
    ["P10", kpis.costo_implicito_punto.p10],
    ["P25", kpis.costo_implicito_punto.p25],
    ["Mediana", kpis.costo_implicito_punto.mediana],
    ["Media", kpis.costo_implicito_punto.media],
    ["P75", kpis.costo_implicito_punto.p75],
    ["P90", kpis.costo_implicito_punto.p90],
  ] as const;

  return (
    <View style={styles.stack}>
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
        Montos sobre sentencias prosperadas ({formatNumber(data.meta.n_fallos)}) y costo por punto sobre lesionados ({formatNumber(data.meta.n_lesionados)}).
      </Text>
      <KpiGrid>
        <KpiCard label="Capital total" value={formatCurrency(composicion.total_indemnizado)} detail="todos los rubros" />
        <KpiCard label="Capital medio" value={formatCurrency(kpis.capital_indemnizatorio_medio.valor)} detail="por sentencia prosperada" />
        <KpiCard label="Costo por punto" value={formatCurrency(kpis.costo_implicito_punto.media, 2)} detail="promedio" />
        <KpiCard label="Incapacidad mediana" value={`${incapacidad.mediana_pct}%`} detail={`P90 ${incapacidad.p90_pct}% · sin IS ${incapacidad.casos_sin_is_pct}%`} />
      </KpiGrid>
      <Card title="Composición del capital" subtitle="Participación de cada rubro sobre el total indemnizado">
        <BarList
          items={composicion.rubros.map((rubro) => ({
            label: rubro.rubro,
            pct: rubro.pct,
            detail: rubro.monto != null ? formatCurrency(rubro.monto) : undefined,
          }))}
        />
      </Card>
      <Card title="Distribución de incapacidad por persona" subtitle="Porcentaje de personas en cada rango">
        <ColumnChart
          points={incapacidad.buckets.map((bucket) => ({ label: bucket.rango, value: bucket.pct }))}
          formatValue={(value) => `${value}%`}
        />
      </Card>
      <Card title="Dispersión del costo" subtitle="Percentiles del costo implícito por punto">
        <View style={styles.grid}>
          {dispersion.map(([label, value]) => (
            <View key={label} style={[styles.tile, { backgroundColor: colors.surfaceHover }]}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
              <Text style={{ color: colors.ink, fontWeight: "700", marginTop: 4 }}>{formatCurrency(value, 2)}</Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { flexBasis: "47%", flexGrow: 1, borderRadius: radius.md, padding: 12 },
});
