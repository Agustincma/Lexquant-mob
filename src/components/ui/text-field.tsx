import { StyleSheet, Text, TextInput, View } from "react-native";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

export function TextField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "sentences",
  autoComplete,
  textContentType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "decimal-pad" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  autoComplete?: "email" | "password" | "name" | "new-password" | "off";
  textContentType?: "emailAddress" | "password" | "name" | "newPassword" | "none";
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.inkSoft }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtle}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={label}
        autoComplete={autoComplete}
        textContentType={textContentType}
        style={[
          styles.input,
          { color: colors.ink, backgroundColor: colors.surfaceAlt, borderColor: error ? colors.danger : colors.lineStrong },
        ]}
      />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: "500" },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  error: { fontSize: 12 },
});
