import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

export function ErrorState({
  title = "No se pudo cargar la información",
  message = "Revisá la conexión con la API y volvé a intentar.",
  onRetry,
  retrying = false,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
        {onRetry ? <Button label="Reintentar" onPress={onRetry} loading={retrying} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", padding: 24 },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: 20, gap: 12, maxWidth: 460, alignSelf: "center", width: "100%" },
  title: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  message: { fontSize: 14, lineHeight: 20, textAlign: "center" },
});
