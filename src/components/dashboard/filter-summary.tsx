import { StyleSheet, Text, View } from "react-native";
import { formatDate, formatMonthRange, formatNumber } from "@/dashboard/format";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";
import type { ResumenEjecutivo } from "@/types/api";

export function FilterSummary({ meta }: { meta: ResumenEjecutivo["meta"] }) {
  const { colors } = useTheme();
  const actualizado = formatDate(meta.actualizacion.importado_en);
  const ipc = meta.actualizacion.ipc_actualizado_al?.split("-").reverse().join("-");

  return (
    <View style={styles.wrap}>
      <Text style={[styles.meta, { color: colors.muted }]}>
        Base: {formatNumber(meta.n_fallos)} sentencias · {formatNumber(meta.n_lesionados)} lesionados · {formatMonthRange(meta.periodo)} · actualizada el {actualizado}
        {ipc ? ` · IPC al ${ipc}` : ""}
      </Text>
      {meta.n_fallos === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.surfaceAlt, borderColor: colors.line }]}>
          <Text style={{ color: colors.inkSoft, fontSize: 14, lineHeight: 20 }}>
            No hay sentencias para esta combinación de filtros. Probá ampliando el período o la jurisdicción.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  meta: { fontSize: 12, lineHeight: 18 },
  empty: { borderWidth: 1, borderRadius: radius.lg, padding: 14 },
});
