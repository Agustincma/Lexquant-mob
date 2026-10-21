import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

export type SelectOption = { value: string; label: string };

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Seleccionar",
  disabled = false,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.inkSoft }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.trigger, { borderColor: colors.lineStrong, backgroundColor: colors.surfaceAlt, opacity: disabled ? 0.55 : 1 }]}
      >
        <Text numberOfLines={1} style={{ color: selected ? colors.ink : colors.subtle, fontSize: 14, flex: 1 }}>
          {selected?.label ?? placeholder}
        </Text>
        <Text style={{ color: colors.muted }}>▾</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Text style={[styles.sheetTitle, { color: colors.ink }]}>{label}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value || "empty"}
            renderItem={({ item }) => {
              const active = item.value === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={[styles.option, { backgroundColor: active ? colors.primarySoft : "transparent" }]}
                >
                  <Text style={{ color: active ? colors.primaryStrong : colors.ink, fontWeight: active ? "600" : "400" }}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: "500" },
  trigger: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backdrop: { flex: 1, backgroundColor: "rgba(12,22,24,0.45)" },
  sheet: {
    maxHeight: "72%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    paddingTop: 14,
    paddingBottom: 24,
  },
  sheetTitle: { fontSize: 16, fontWeight: "600", paddingHorizontal: 18, marginBottom: 8 },
  option: { paddingHorizontal: 18, paddingVertical: 13 },
});
