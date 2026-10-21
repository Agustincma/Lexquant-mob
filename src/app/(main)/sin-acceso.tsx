import { Redirect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useFlags } from "@/features/flags-context";
import { BootScreen } from "@/components/ui/boot-screen";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";
import { NO_ACCESS_HREF } from "@/types/api";

export default function SinAccesoScreen() {
  const { colors } = useTheme();
  const { status, homeHref } = useFlags();
  if (status === "loading" || status === "idle") return <BootScreen />;
  if (status === "ready" && homeHref !== NO_ACCESS_HREF) return <Redirect href={homeHref} />;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
          <Text style={{ color: colors.primaryStrong, fontWeight: "700" }}>LQ</Text>
        </View>
        <Text style={[styles.title, { color: colors.ink }]}>Todavía no tenés pantallas habilitadas</Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          Pedile a un administrador que te dé acceso a las secciones del dashboard. El acceso sale de las mismas feature flags y la misma whitelist que la web.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", padding: 24 },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: 24, gap: 12, maxWidth: 440, alignSelf: "center", width: "100%" },
  badge: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  body: { fontSize: 14, lineHeight: 21 },
});
