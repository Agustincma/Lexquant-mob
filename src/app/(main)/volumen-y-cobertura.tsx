import { StyleSheet, Text, View } from "react-native";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { PageGate } from "@/components/dashboard/page-gate";
import { Card } from "@/components/ui/card";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { formatMonthRange, formatNumber, formatVariacion } from "@/dashboard/format";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";
import type { ResumenEjecutivo } from "@/types/api";

export default function VolumenScreen() {
  return (
    <PageGate flag="page.volumen-y-cobertura">
      <DashboardScreen subtitle="Fallos, personas y alcance del universo analizado.">
        {(data) => <VolumenBody data={data} />}
      </DashboardScreen>
    </PageGate>
  );
}

function VolumenBody({ data }: { data: ResumenEjecutivo }) {
  const { colors } = useTheme();
  const { valor: total, desde, variacion_pct, variacion_comparacion } = data.kpis.sentencias_analizadas;
  const jurisdicciones = [...data.diferencias_territoriales.jurisdicciones].sort((a, b) => b.n_sentencias - a.n_sentencias);
  const lider = jurisdicciones[0];

  return (
    <View style={styles.stack}>
      <KpiGrid>
        <KpiCard label="Sentencias" value={formatNumber(total)} detail={desde ? `desde ${desde}` : "sin datos"} />
        <KpiCard label="Jurisdicciones" value={formatNumber(jurisdicciones.length)} detail="con datos" />
        <KpiCard
          label="Variación interanual"
          value={formatVariacion(variacion_pct)}
          detail={variacion_comparacion ? `${formatMonthRange(variacion_comparacion)} vs. año anterior` : "sin período comparable"}
        />
        <KpiCard label="Jurisdicción líder" value={lider?.jurisdiccion ?? "—"} detail={`${formatNumber(lider?.n_sentencias ?? 0)} sentencias`} />
      </KpiGrid>
      <Card title="Cantidad de fallos" subtitle="Segmentación por jurisdicción, con el tamaño de muestra al lado">
        {jurisdicciones.map((item) => (
          <View key={item.jurisdiccion} style={[styles.row, { borderColor: colors.lineSoft, backgroundColor: colors.surfaceAlt }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase" }}>{item.provincia}</Text>
              <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "600", marginTop: 2 }}>{item.jurisdiccion}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700", fontVariant: ["tabular-nums"] }}>{formatNumber(item.n_sentencias)}</Text>
              <Text style={{ color: colors.primary, fontSize: 12 }}>sentencias</Text>
            </View>
          </View>
        ))}
      </Card>
      <Card title="Calidad de cobertura" subtitle="La cantidad de casos acompaña la lectura de cada jurisdicción">
        <Text style={{ color: colors.inkSoft, fontSize: 14, lineHeight: 21 }}>
          La base contiene {formatNumber(total)} sentencias distribuidas en {formatNumber(jurisdicciones.length)} jurisdicciones. Los porcentajes deben interpretarse junto con el tamaño de muestra.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  row: { borderWidth: 1, borderRadius: radius.md, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
});
