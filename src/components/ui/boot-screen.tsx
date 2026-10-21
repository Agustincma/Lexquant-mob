import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/theme";

export function BootScreen({ label = "Cargando Lexquant" }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Text style={[styles.brand, { color: colors.primary }]}>LEXQUANT</Text>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 },
  brand: { fontSize: 13, fontWeight: "700", letterSpacing: 3.2 },
  label: { fontSize: 13 },
});
