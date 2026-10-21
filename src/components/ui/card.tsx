import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

export function Card({
  title,
  subtitle,
  children,
  style,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }, style]}>
      {title ? (
        <View style={[styles.head, { borderBottomColor: colors.line }]}>
          <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  head: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 4 },
  title: { fontSize: 15, fontWeight: "600" },
  subtitle: { fontSize: 12, lineHeight: 17 },
  body: { padding: 16, gap: 12 },
});
