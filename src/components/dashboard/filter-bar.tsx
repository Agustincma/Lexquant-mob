import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SelectField } from "@/components/ui/select-field";
import { useFilters } from "@/dashboard/filters";
import { withCount } from "@/dashboard/format";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

export function FilterBar({ updating = false }: { updating?: boolean }) {
  const { colors } = useTheme();
  const filters = useFilters();
  const [open, setOpen] = useState(false);
  const { filtros } = filters;
  const frecuencia = filters.displayed.frecuencia;
  const frecuencias = filtros?.frecuencias ?? [
    { value: "mensual", label: "Mensual" },
    { value: "trimestral", label: "Trimestral" },
  ];
  const periodoLabel = filtros?.periodos.find((item) => item.value === filters.displayed.periodo)?.label ?? "Todo el período";
  const provincia = filtros?.provincias.find((item) => item.provincia === filters.state.provincia);
  const jurisdicciones = filters.state.provincia
    ? (provincia?.jurisdicciones ?? []).map((item) => ({ value: item.nombre, label: withCount(item.nombre, item.n_sentencias) }))
    : (filtros?.provincias ?? []).flatMap((item) =>
        item.jurisdicciones.map((jurisdiccion) => ({
          value: jurisdiccion.nombre,
          label: `${item.provincia} · ${withCount(jurisdiccion.nombre, jurisdiccion.n_sentencias)}`,
        })),
      );

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryText}>
          <Text style={[styles.kicker, { color: colors.muted }]}>Filtros{updating ? " · actualizando" : ""}</Text>
          <Text style={[styles.summary, { color: colors.ink }]} numberOfLines={2}>
            {periodoLabel} · {frecuencias.find((item) => item.value === frecuencia)?.label ?? frecuencia}
            {filters.state.provincia ? ` · ${filters.state.provincia}` : ""}
            {filters.state.jurisdiccion ? ` · ${filters.state.jurisdiccion}` : ""}
          </Text>
        </View>
        <Pressable onPress={() => setOpen((value) => !value)} style={[styles.toggle, { backgroundColor: colors.primarySoft }]}>
          <Text style={{ color: colors.primaryStrong, fontWeight: "600", fontSize: 13 }}>{open ? "Ocultar" : "Editar"}</Text>
        </Pressable>
      </View>
      {open ? (
        <View style={styles.form}>
          <SelectField
            label="Período"
            value={filters.displayed.periodo}
            disabled={!filtros}
            options={filtros?.periodos ?? [{ value: filters.displayed.periodo, label: periodoLabel }]}
            onChange={filters.setPeriodo}
          />
          <View style={styles.segmentWrap}>
            <Text style={[styles.segmentLabel, { color: colors.inkSoft }]}>Frecuencia</Text>
            <View style={[styles.segment, { borderColor: colors.lineStrong, backgroundColor: colors.surfaceAlt }]}>
              {frecuencias.map((option) => {
                const active = frecuencia === option.value;
                return (
                  <Pressable
                    key={option.value}
                    disabled={!filtros}
                    onPress={() => filters.setFrecuencia(option.value)}
                    style={[styles.segmentItem, { backgroundColor: active ? colors.primarySoft : "transparent" }]}
                  >
                    <Text style={{ color: active ? colors.primaryStrong : colors.muted, fontWeight: "600", fontSize: 13 }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <SelectField
            label="Provincia"
            value={filters.state.provincia}
            disabled={!filtros}
            placeholder="Todas"
            options={[
              { value: "", label: "Todas" },
              ...(filtros?.provincias.map((item) => ({ value: item.provincia, label: withCount(item.provincia, item.n_sentencias) })) ?? []),
            ]}
            onChange={filters.setProvincia}
          />
          <SelectField
            label="Jurisdicción"
            value={filters.state.jurisdiccion}
            disabled={!filtros}
            placeholder="Todas"
            options={[{ value: "", label: "Todas" }, ...jurisdicciones]}
            onChange={filters.setJurisdiccion}
          />
          <SelectField
            label="Instancia"
            value={filters.state.instancia}
            disabled={!filtros}
            placeholder="Todas"
            options={[
              { value: "", label: "Todas" },
              ...(filtros?.instancias.map((item) => ({ value: item.value, label: withCount(item.label, item.n_sentencias) })) ?? []),
            ]}
            onChange={filters.setInstancia}
          />
          <SelectField
            label="Aseguradora"
            value={filters.state.aseguradora}
            disabled={!filtros}
            placeholder="Todas"
            options={[
              { value: "", label: "Todas" },
              ...(filtros?.aseguradoras.map((item) => ({ value: item.value, label: withCount(item.label, item.n_sentencias) })) ?? []),
            ]}
            onChange={filters.setAseguradora}
          />
          {filters.hasActive ? (
            <Pressable onPress={filters.reset} style={styles.clear}>
              <Text style={{ color: colors.primaryStrong, fontWeight: "600" }}>Limpiar filtros</Text>
            </Pressable>
          ) : null}
          {filters.isError ? (
            <Pressable onPress={filters.refetch}>
              <Text style={{ color: colors.danger, fontSize: 13 }}>No se pudieron cargar los filtros. Reintentar.</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, padding: 12, gap: 12 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryText: { flex: 1, gap: 3 },
  kicker: { fontSize: 11, fontWeight: "600", letterSpacing: 0.4, textTransform: "uppercase" },
  summary: { fontSize: 14, fontWeight: "500" },
  toggle: { borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 },
  form: { gap: 12 },
  segmentWrap: { gap: 6 },
  segmentLabel: { fontSize: 13, fontWeight: "500" },
  segment: { flexDirection: "row", borderWidth: 1, borderRadius: radius.md, padding: 4, gap: 4 },
  segmentItem: { flex: 1, alignItems: "center", borderRadius: 10, paddingVertical: 8 },
  clear: { alignSelf: "flex-start", paddingVertical: 4 },
});
