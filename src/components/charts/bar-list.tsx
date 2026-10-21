import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/theme";

export function BarList({
  items,
  color,
}: {
  items: { label: string; pct: number; detail?: string }[];
  color?: string;
}) {
  const { colors } = useTheme();
  const fill = color ?? colors.chartBlue;
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.label} style={styles.row}>
          <View style={styles.caption}>
            <Text style={[styles.label, { color: colors.inkSoft }]} numberOfLines={2}>
              {item.label}
            </Text>
            <Text style={[styles.pct, { color: colors.ink }]}>{item.pct.toLocaleString("es-AR")}%</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.track }]}>
            <View style={[styles.fill, { width: `${Math.max(0, Math.min(item.pct, 100))}%`, backgroundColor: fill }]} />
          </View>
          {item.detail ? <Text style={[styles.detail, { color: colors.muted }]}>{item.detail}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  row: { gap: 6 },
  caption: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  label: { flex: 1, fontSize: 13 },
  pct: { fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },
  track: { height: 8, borderRadius: 99, overflow: "hidden" },
  fill: { height: 8, borderRadius: 99 },
  detail: { fontSize: 11 },
});
