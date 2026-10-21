import type { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

export function KpiCard({
  label,
  value,
  detail,
  style,
}: {
  label: string;
  value: string;
  detail?: string;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }, style]}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.ink }]} numberOfLines={2}>
        {value}
      </Text>
      {detail ? <Text style={[styles.detail, { color: colors.inkSoft }]}>{detail}</Text> : <View style={styles.spacer} />}
    </View>
  );
}

export function KpiGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 104,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.4, textTransform: "uppercase" },
  value: { fontSize: 20, fontWeight: "600", fontVariant: ["tabular-nums"] },
  detail: { fontSize: 12 },
  spacer: { height: 14 },
});
