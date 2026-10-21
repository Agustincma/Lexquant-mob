import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { formatCurrency, formatMonth } from "@/dashboard/format";
import { useTheme } from "@/theme/theme";

type Point = { mes: string; media: number; mediana: number };

function path(values: number[], width: number, height: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const padX = 8;
  const padY = 12;
  return values
    .map((value, index) => {
      const x = padX + (index * (width - padX * 2)) / Math.max(values.length - 1, 1);
      const y = padY + (1 - (value - min) / span) * (height - padY * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

export function CostLineChart({ points }: { points: Point[] }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const height = 168;

  if (points.length < 2) {
    return <Text style={{ color: colors.muted, fontSize: 13 }}>No hay suficientes períodos para la serie.</Text>;
  }

  const values = points.flatMap((point) => [point.media, point.mediana]);

  return (
    <View style={styles.wrap} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.legend}>
        <Legend color={colors.primary} label="Media" />
        <Legend color={colors.chartBlue} label="Mediana" />
      </View>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Polyline points={path(points.map((point) => point.media), width, height)} fill="none" stroke={colors.primary} strokeWidth={2.4} />
          <Polyline points={path(points.map((point) => point.mediana), width, height)} fill="none" stroke={colors.chartBlue} strokeWidth={2.4} />
        </Svg>
      ) : null}
      <View style={styles.axis}>
        <Text style={[styles.tick, { color: colors.muted }]}>{formatMonth(points[0].mes)}</Text>
        <Text style={[styles.tick, { color: colors.subtle }]}>
          {formatCurrency(Math.min(...values), 2)} – {formatCurrency(Math.max(...values), 2)}
        </Text>
        <Text style={[styles.tick, { color: colors.muted }]}>{formatMonth(points[points.length - 1].mes)}</Text>
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={{ color: colors.inkSoft, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  legend: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  swatch: { width: 14, height: 3, borderRadius: 99 },
  axis: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  tick: { fontSize: 11 },
});
