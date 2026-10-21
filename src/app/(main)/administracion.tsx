import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { getAdminUserPages, listAdminFlags, searchAdminUsers, setFlagEnabled, setUserPages } from "@/api/admin";
import { ApiError } from "@/api/client";
import { useAuth } from "@/auth/auth-context";
import { BootScreen } from "@/components/ui/boot-screen";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { formatDate } from "@/dashboard/format";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";
import { PAGE_FLAGS, pageLabel, type AdminUserPages, type FlagKey } from "@/types/api";

export default function AdministracionScreen() {
  const { user, status } = useAuth();
  if (status === "loading") return <BootScreen />;
  if (user?.role !== "admin") return <Redirect href="/" />;
  return (
    <Screen>
      <Intro />
      <UsersPanel />
      <FlagsPanel />
    </Screen>
  );
}

function Intro() {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700", letterSpacing: 1.1 }}>SOLO ADMINISTRADORES</Text>
      <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
        El acceso por correo y el encendido de cada pantalla se guardan en la misma base que usa la web.
      </Text>
    </View>
  );
}

function UsersPanel() {
  const { colors } = useTheme();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const client = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(q.trim()), 280);
    return () => clearTimeout(timer);
  }, [q]);

  const search = useQuery({
    queryKey: ["admin-users", debounced],
    queryFn: () => searchAdminUsers(debounced),
    enabled: debounced.length >= 2,
  });
  const selected = useQuery({
    queryKey: ["admin-user-pages", email],
    queryFn: () => getAdminUserPages(email!),
    enabled: Boolean(email),
  });
  const save = useMutation({
    mutationFn: ({ nextEmail, pages }: { nextEmail: string; pages: FlagKey[] }) => setUserPages(nextEmail, pages),
    onSuccess: (data) => {
      client.setQueryData(["admin-user-pages", data.email], data);
      void client.invalidateQueries({ queryKey: ["admin-flags"] });
      void client.invalidateQueries({ queryKey: ["feature-flags"] });
    },
  });

  function toggle(user: AdminUserPages, key: FlagKey) {
    const pages = user.pages.includes(key) ? user.pages.filter((page) => page !== key) : [...user.pages, key];
    save.mutate({ nextEmail: user.email, pages });
  }

  return (
    <Card title="Acceso por usuario" subtitle="Buscá un correo y marcá las pantallas. Los admins ven todas las que estén prendidas.">
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Al menos 2 letras del correo o nombre"
        placeholderTextColor={colors.subtle}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: colors.ink, borderColor: colors.lineStrong, backgroundColor: colors.surfaceAlt }]}
      />
      {debounced.length >= 2 && search.isFetching ? <Text style={{ color: colors.muted }}>Buscando…</Text> : null}
      {debounced.length >= 2 && search.data?.users.length === 0 && !search.isFetching ? (
        <Text style={{ color: colors.muted }}>No hay usuarios que coincidan.</Text>
      ) : null}
      {(search.data?.users ?? []).map((match) => (
        <Pressable key={match.id} onPress={() => setEmail(match.email)} style={[styles.user, { backgroundColor: email === match.email ? colors.primarySoft : colors.surfaceHover }]}>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>{match.nombre || match.email}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{match.email}{match.role === "admin" ? " · Admin" : ""}</Text>
        </Pressable>
      ))}
      {save.error ? <Text style={{ color: colors.danger }}>{save.error instanceof ApiError ? save.error.message : "No se pudo guardar"}</Text> : null}
      {selected.isLoading ? <Text style={{ color: colors.muted }}>Cargando pantallas…</Text> : null}
      {selected.isError ? <Text style={{ color: colors.danger }}>{selected.error instanceof ApiError ? selected.error.message : "No se pudo leer el acceso"}</Text> : null}
      {selected.data ? (
        <View style={styles.pages}>
          <View style={styles.selectedHead}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.ink, fontWeight: "600" }}>{selected.data.nombre || selected.data.email}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{selected.data.email}</Text>
              <Text style={{ color: colors.subtle, fontSize: 11, marginTop: 4, letterSpacing: 0.4 }}>
                {selected.data.role === "admin" ? "ADMIN" : "USUARIO"}
                {save.isPending ? " · GUARDANDO" : ""}
              </Text>
            </View>
            <Pressable onPress={() => setEmail(null)}>
              <Text style={{ color: colors.primaryStrong, fontWeight: "600" }}>Cambiar</Text>
            </Pressable>
          </View>
          {PAGE_FLAGS.map((page) => (
            <View key={page.key} style={[styles.check, { borderColor: colors.lineSoft }]}>
              <Text style={{ color: colors.ink, flex: 1 }}>{page.label}</Text>
              <Switch
                value={selected.data.pages.includes(page.key)}
                disabled={save.isPending}
                onValueChange={() => toggle(selected.data, page.key)}
                trackColor={{ true: colors.primary, false: colors.track }}
              />
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function FlagsPanel() {
  const { colors } = useTheme();
  const client = useQueryClient();
  const flags = useQuery({ queryKey: ["admin-flags"], queryFn: listAdminFlags });
  const save = useMutation({
    mutationFn: ({ key, enabled }: { key: FlagKey; enabled: boolean }) => setFlagEnabled(key, enabled),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin-flags"] });
      void client.invalidateQueries({ queryKey: ["feature-flags"] });
    },
  });

  if (flags.isLoading) return <BootScreen label="Cargando flags" />;
  if (flags.isError || !flags.data) {
    return <ErrorState message={flags.error instanceof ApiError ? flags.error.message : "No se pudieron leer las flags"} onRetry={() => void flags.refetch()} />;
  }

  return (
    <Card title="Feature flags" subtitle="Apagada, no la ve nadie. Prendida, la ven los admins y los correos de la whitelist.">
      {save.error ? <Text style={{ color: colors.danger }}>{save.error instanceof ApiError ? save.error.message : "No se pudo actualizar"}</Text> : null}
      {flags.data.flags.map((flag) => (
        <View key={flag.key} style={[styles.flag, { borderColor: colors.lineSoft }]}>
          <View style={styles.flagHead}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: colors.ink, fontWeight: "600" }}>{pageLabel(flag.key)}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{flag.key}</Text>
            </View>
            <Switch
              value={flag.enabled}
              disabled={save.isPending && save.variables?.key === flag.key}
              onValueChange={(enabled) => save.mutate({ key: flag.key, enabled })}
              trackColor={{ true: colors.primary, false: colors.track }}
            />
          </View>
          <Text style={{ color: flag.enabled ? colors.primaryStrong : colors.muted, fontSize: 12, fontWeight: "600" }}>
            {flag.enabled ? "Prendida" : "Apagada"}
          </Text>
          <Text style={{ color: colors.inkSoft, fontSize: 13, lineHeight: 18 }}>
            {flag.whitelist.length === 0 ? "Sin correos en la whitelist." : `${flag.whitelist.length} correo${flag.whitelist.length === 1 ? "" : "s"} en la whitelist.`}
          </Text>
          <View style={styles.chips}>
            {flag.whitelist.slice(0, 8).map((email) => (
              <View key={email} style={[styles.chip, { backgroundColor: colors.primarySoft }]}>
                <Text style={{ color: colors.primaryStrong, fontSize: 12 }}>{email}</Text>
              </View>
            ))}
            {flag.whitelist.length > 8 ? <Text style={{ color: colors.muted, fontSize: 12 }}>+{flag.whitelist.length - 8}</Text> : null}
          </View>
          <Text style={{ color: colors.subtle, fontSize: 11 }}>
            Actualizada {formatDate(flag.updatedAt)}{flag.updatedBy ? ` · ${flag.updatedBy}` : ""}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 44, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 12, fontSize: 15 },
  user: { borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, gap: 2 },
  pages: { gap: 8, marginTop: 4 },
  selectedHead: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  check: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  flag: { borderWidth: 1, borderRadius: radius.md, padding: 12, gap: 6 },
  flagHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 },
});
