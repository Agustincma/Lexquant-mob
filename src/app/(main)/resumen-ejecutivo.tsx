import { StyleSheet, Text, View } from "react-native";
import { BarList } from "@/components/charts/bar-list";
import { ColumnChart } from "@/components/charts/column-chart";
import { CostLineChart } from "@/components/charts/line-chart";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { IndexMeter } from "@/components/dashboard/index-meter";
import { PageGate } from "@/components/dashboard/page-gate";
import { Card } from "@/components/ui/card";
import { KpiCarousel } from "@/components/ui/kpi-carousel";
import { formatCurrency, formatNumber } from "@/dashboard/format";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";
import type { ResumenEjecutivo } from "@/types/api";

export default function ResumenEjecutivoScreen() {
  return (
    <PageGate flag="page.resumen-ejecutivo">
      <DashboardScreen subtitle="Mercado judicial de RC lesiones y muertes">
        {(data) => <ResumenBody data={data} />}
      </DashboardScreen>
    </PageGate>
  );
}

function ResumenBody({ data }: { data: ResumenEjecutivo }) {
  const { colors } = useTheme();
  const { kpis, distribucion_incapacidades: incapacidad, composicion_capital_indemnizatorio: composicion } = data;
  const ipc = data.meta.actualizacion.ipc_actualizado_al?.split("-").reverse().join("-");
  const top = data.diferencias_territoriales.jurisdicciones.slice(0, 8);

  return (
    <View style={styles.stack}>
      <KpiCarousel
        items={[
          { label: "Sentencias analizadas", value: formatNumber(kpis.sentencias_analizadas.valor), detail: kpis.sentencias_analizadas.desde ? `desde ${kpis.sentencias_analizadas.desde}` : "sin corte" },
          { label: "Capital medio", value: formatCurrency(kpis.capital_indemnizatorio_medio.valor), detail: "promedio por sentencia" },
          { label: "Costo por punto", value: formatCurrency(kpis.costo_implicito_punto.media, 2), detail: "promedio" },
          { label: "Demora mediana", value: `${kpis.demora_mediana_anios} años`, detail: "hecho → sentencia" },
          { label: "Doctrina Barrientos", value: `${kpis.doctrina_barrientos_pct.aplicada}%`, detail: "de las sentencias" },
        ]}
      />

      <Card title="Evolución del costo por punto" subtitle="Media y mediana del período filtrado">
        <CostLineChart points={data.evolucion_mensual_costo_punto} />
      </Card>

      <Card title="Composición del capital" subtitle="Participación de cada rubro sobre el total indemnizado">
        <BarList items={composicion.rubros.map((rubro) => ({ label: rubro.rubro, pct: rubro.pct, detail: rubro.monto != null ? formatCurrency(rubro.monto) : undefined }))} />
      </Card>

      <Card title="Criterio de intereses" subtitle="Porcentaje de fallos con criterio informado">
        <BarList
          color={colors.chartAmber}
          items={data.distribucion_cantidad_fallos.map((item) => ({
            label: item.categoria,
            pct: item.pct,
            detail: `${formatNumber(item.n_fallos)} fallos`,
          }))}
        />
      </Card>

      <Card title="Distribución de incapacidad" subtitle={`Mediana ${incapacidad.mediana_pct}% · media ${incapacidad.media_pct}% · P90 ${incapacidad.p90_pct}%`}>
        <ColumnChart
          points={incapacidad.buckets.map((bucket) => ({ label: bucket.rango, value: bucket.pct }))}
          formatValue={(value) => `${value}%`}
        />
      </Card>

      <Card title="Lecturas principales">
        <Text style={[styles.copy, { color: colors.inkSoft }]}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>{formatCurrency(kpis.costo_implicito_punto.mediana, 2)}</Text>
          {" es el costo mediano por punto."}
        </Text>
        <Text style={[styles.copy, { color: colors.inkSoft }]}>
          La incapacidad mediana es de <Text style={{ color: colors.primary, fontWeight: "700" }}>{incapacidad.mediana_pct}%</Text>.
        </Text>
        <Text style={[styles.copy, { color: colors.inkSoft }]}>
          El <Text style={{ color: colors.primary, fontWeight: "700" }}>{kpis.doctrina_barrientos_pct.aplicada}%</Text> de los fallos se inscribe en la doctrina Barrientos.
        </Text>
        <View style={[styles.note, { borderTopColor: colors.line }]}>
          <Text style={[styles.noteTitle, { color: colors.ink }]}>Aclaraciones</Text>
          <Note text="Sentencias analizadas son todas las prosperadas (excluidos los rechazos totales y las sentencias procesales)." />
          <Note text={`Valores actualizados por IPC${ipc ? ` al ${ipc}` : ""}.`} />
          <Note text="Los % de incapacidad agregan las de tipo física y psíquica." />
          <Note text="Costo por punto de incapacidad solo para lesionados (excluidos derechohabientes y lesionados sin incapacidad), y rubros personales, normalizado a responsabilidad demandado = 100%." />
          <Note text="Doctrina Barrientos: capital a fecha de sentencia y tasa pura al lapso fecha hecho – fecha sentencia." />
        </View>
      </Card>

      <Card title="Diferencias territoriales" subtitle="Índice nacional = 100 · primeras jurisdicciones">
        {top.map((row) => (
          <View key={row.jurisdiccion} style={[styles.territory, { borderColor: colors.lineSoft }]}>
            <View style={styles.territoryHead}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontWeight: "600" }}>{row.jurisdiccion}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{row.provincia}</Text>
              </View>
              <Text style={{ color: colors.inkSoft, fontVariant: ["tabular-nums"] }}>{formatNumber(row.n_sentencias)}</Text>
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

function Note({ text }: { text: string }) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>• {text}</Text>;
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  copy: { fontSize: 14, lineHeight: 21 },
  note: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, gap: 8, marginTop: 4 },
  noteTitle: { fontSize: 14, fontWeight: "600" },
  territory: { borderWidth: 1, borderRadius: radius.md, padding: 12, gap: 10 },
  territoryHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  meters: { flexDirection: "row", gap: 10 },
});
