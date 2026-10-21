import { ScrollView, StyleSheet, View, type RefreshControlProps } from "react-native";
import type { ReactNode } from "react";
import { useTheme } from "@/theme/theme";

export function Screen({
  children,
  refreshControl,
}: {
  children: ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  inner: { width: "100%", maxWidth: 920, alignSelf: "center", gap: 14 },
});
