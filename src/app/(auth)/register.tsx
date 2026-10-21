import { Link, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/auth/auth-context";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, nombre);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Text style={[styles.brand, { color: colors.primary }]}>LEXQUANT</Text>
        <Text style={[styles.title, { color: colors.ink }]}>Crear cuenta</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <TextField label="Nombre" value={nombre} onChangeText={setNombre} autoComplete="name" textContentType="name" />
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
            autoComplete="new-password"
            textContentType="newPassword"
          />
          {error ? <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text> : null}
          <Button label="Crear cuenta" onPress={() => void onSubmit()} loading={loading} disabled={!email || !password} />
        </View>
        <Text style={{ color: colors.muted, textAlign: "center" }}>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" style={{ color: colors.primary, fontWeight: "700" }}>
            Iniciá sesión
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", padding: 20, gap: 14, maxWidth: 460, width: "100%", alignSelf: "center" },
  brand: { textAlign: "center", letterSpacing: 3, fontWeight: "700", fontSize: 13 },
  title: { textAlign: "center", fontSize: 28, fontWeight: "700" },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: 16, gap: 14 },
});
