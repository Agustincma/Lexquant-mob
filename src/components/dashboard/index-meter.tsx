import { StyleSheet, Text, View } from "react-native";
import { formatIndex } from "@/dashboard/format";
import { useTheme } from "@/theme/theme";

export function IndexMeter({ label, value, color }: { label: string; value: number | null; color: string }) {
  const { colors } = useTheme();
  const ratio = value === null || value <= 0 ? 0 : Math.max(0.08, Math.min(value, 180) / 180);
  return (
    <View style={styles.wrap}>
      <View style={styles.caption}>
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.value, { color }]}>{formatIndex(value)}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.track }]}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 5, minWidth: 92 },
  caption: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  label: { fontSize: 11 },
  value: { fontSize: 12, fontWeight: "700", fontVariant: ["tabular-nums"] },
  track: { height: 5, borderRadius: 99, overflow: "hidden" },
  fill: { height: 5, borderRadius: 99 },
});
