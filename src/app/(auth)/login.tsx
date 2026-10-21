import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiBaseUrl } from "@/api/config";
import { useAuth } from "@/auth/auth-context";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await login(email, password, remember);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Text style={[styles.brand, { color: colors.primary }]}>LEXQUANT</Text>
        <Text style={[styles.title, { color: colors.ink }]}>Iniciar sesión</Text>
        <Text style={[styles.lead, { color: colors.muted }]}>Los mismos usuarios, flags y datos que la web.</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <TextField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
          />
          <Pressable onPress={() => setRemember((value) => !value)} style={styles.remember}>
            <View style={[styles.box, { borderColor: colors.primary, backgroundColor: remember ? colors.primary : "transparent" }]}>
              {remember ? <Text style={{ color: colors.onPrimary, fontSize: 12, fontWeight: "700" }}>✓</Text> : null}
            </View>
            <Text style={{ color: colors.inkSoft }}>Recordarme en este dispositivo</Text>
          </Pressable>
          {error ? <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text> : null}
          <Button label="Ingresar" onPress={() => void onSubmit()} loading={loading} disabled={!email || !password} />
        </View>
        <Text style={{ color: colors.muted, textAlign: "center" }}>
          ¿No tenés cuenta?{" "}
          <Link href="/register" style={{ color: colors.primary, fontWeight: "700" }}>
            Registrate
          </Link>
        </Text>
        {__DEV__ ? <Text style={[styles.dev, { color: colors.subtle }]}>{apiBaseUrl()}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", padding: 20, gap: 14, maxWidth: 460, width: "100%", alignSelf: "center" },
  brand: { textAlign: "center", letterSpacing: 3, fontWeight: "700", fontSize: 13 },
  title: { textAlign: "center", fontSize: 28, fontWeight: "700" },
  lead: { textAlign: "center", fontSize: 14, marginTop: -6 },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: 16, gap: 14 },
  remember: { flexDirection: "row", alignItems: "center", gap: 10 },
  box: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  dev: { textAlign: "center", fontSize: 11 },
});
