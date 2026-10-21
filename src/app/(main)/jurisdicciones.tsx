import { StyleSheet, Text, View } from "react-native";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { IndexMeter } from "@/components/dashboard/index-meter";
import { PageGate } from "@/components/dashboard/page-gate";
import { Card } from "@/components/ui/card";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { formatIndex, formatNumber } from "@/dashboard/format";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";
import type { ResumenEjecutivo } from "@/types/api";

type Row = ResumenEjecutivo["diferencias_territoriales"]["jurisdicciones"][number];

function topBy(rows: Row[], key: "costo_x_punto_indice" | "doctrina_barrientos_indice") {
  return rows.filter((row) => row[key] !== null).sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))[0];
}

export default function JurisdiccionesScreen() {
  return (
    <PageGate flag="page.jurisdicciones">
      <DashboardScreen subtitle="Diferencias territoriales de costo, demora y aplicación de doctrina.">
        {(data) => <JurisdiccionesBody data={data} />}
      </DashboardScreen>
    </PageGate>
  );
}

function JurisdiccionesBody({ data }: { data: ResumenEjecutivo }) {
  const { colors } = useTheme();
  const rows = [...data.diferencias_territoriales.jurisdicciones].sort(
    (a, b) => (b.costo_x_punto_indice ?? -1) - (a.costo_x_punto_indice ?? -1),
  );
  const topCost = topBy(rows, "costo_x_punto_indice");
  const topDoctrine = topBy(rows, "doctrina_barrientos_indice");
  const totalCases = rows.reduce((sum, row) => sum + row.n_sentencias, 0);
  const nacional = data.diferencias_territoriales.total_argentina;

  return (
    <View style={styles.stack}>
      <KpiGrid>
        <KpiCard label="Mayor costo relativo" value={topCost?.jurisdiccion ?? "—"} detail={`${formatIndex(topCost?.costo_x_punto_indice ?? null)} índice`} />
        <KpiCard label="Demora mediana" value={`${data.kpis.demora_mediana_anios} años`} detail={`media ${data.kpis.demora_media_anios} años`} />
        <KpiCard label="Mayor aplicación" value={topDoctrine?.jurisdiccion ?? "—"} detail={`${formatIndex(topDoctrine?.doctrina_barrientos_indice ?? null)} índice`} />
        <KpiCard label="Casos comparados" value={formatNumber(totalCases)} detail={`${formatNumber(rows.length)} jurisdicciones`} />
      </KpiGrid>
      <Card title="Argentina = 100" subtitle="Referencia nacional de las tres métricas">
        <IndexMeter label="Costo x punto" value={nacional.costo_x_punto_indice} color={colors.chartBlue} />
        <IndexMeter label="Demora" value={nacional.demora_indice} color={colors.chartCoral} />
        <IndexMeter label="Doctrina" value={nacional.doctrina_barrientos_indice} color={colors.primary} />
      </Card>
      <Card title="Comparación territorial" subtitle="Índice nacional = 100 · — sin datos suficientes">
        {rows.map((row) => (
          <View key={row.jurisdiccion} style={[styles.row, { borderColor: colors.lineSoft }]}>
            <View style={styles.head}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontWeight: "600", fontSize: 15 }}>{row.jurisdiccion}</Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{row.provincia}</Text>
              </View>
              <Text style={{ color: colors.inkSoft, fontVariant: ["tabular-nums"] }}>{formatNumber(row.n_sentencias)} sent.</Text>
            </View>
            <View style={styles.meters}>
              <IndexMeter label="Costo" value={row.costo_x_punto_indice} color={colors.chartBlue} />
              <IndexMeter label="Demora" value={row.demora_indice} color={colors.chartCoral} />
              <IndexMeter label="Doctrina" value={row.doctrina_barrientos_indice} color={colors.primary} />
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  row: { borderWidth: 1, borderRadius: radius.md, padding: 12, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  meters: { flexDirection: "row", gap: 10 },
});
