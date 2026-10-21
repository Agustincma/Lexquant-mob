import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/theme";

export function ColumnChart({
  points,
  formatValue,
}: {
  points: { label: string; value: number }[];
  formatValue: (value: number) => string;
}) {
  const { colors } = useTheme();
  const max = Math.max(...points.map((point) => point.value), 1);

  if (points.length === 0) {
    return <Text style={{ color: colors.muted, fontSize: 13 }}>Sin datos para graficar.</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {points.map((point) => (
        <View key={point.label} style={styles.col}>
          <Text style={[styles.value, { color: colors.inkSoft }]} numberOfLines={1}>
            {formatValue(point.value)}
          </Text>
          <View style={[styles.track, { backgroundColor: colors.track }]}>
            <View
              style={{
                height: `${Math.max(4, (point.value / max) * 100)}%`,
                backgroundColor: colors.primary,
                borderRadius: 6,
              }}
            />
          </View>
          <Text style={[styles.label, { color: colors.muted }]} numberOfLines={2}>
            {point.label}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "flex-end", gap: 10, paddingBottom: 4 },
  col: { width: 64, alignItems: "center", gap: 6 },
  value: { fontSize: 10, fontVariant: ["tabular-nums"] },
  track: { height: 120, width: 22, borderRadius: 8, justifyContent: "flex-end", overflow: "hidden" },
  label: { fontSize: 10, textAlign: "center", minHeight: 28 },
});
