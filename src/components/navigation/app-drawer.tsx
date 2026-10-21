import { DrawerContentScrollView, type DrawerContentComponentProps } from "expo-router/drawer";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/auth/auth-context";
import { useFlags } from "@/features/flags-context";
import { radius } from "@/theme/palette";
import { useTheme } from "@/theme/theme";
import { isPageEnabled, PAGE_FLAGS } from "@/types/api";

const NAV = PAGE_FLAGS.filter((page) => page.key !== "page.carga");

export function AppDrawer(props: DrawerContentComponentProps) {
  const { colors, scheme, toggleScheme } = useTheme();
  const { user, logout } = useAuth();
  const { flags } = useFlags();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const carga = PAGE_FLAGS.find((page) => page.key === "page.carga");

  function go(href: string) {
    router.push(href);
    props.navigation.closeDrawer();
  }

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 16, backgroundColor: colors.surface }]}
    >
      <Text style={[styles.brand, { color: colors.primary }]}>LEXQUANT</Text>
      <Text style={[styles.tag, { color: colors.muted }]}>Mercado judicial</Text>

      <View style={styles.nav}>
        {NAV.filter((page) => isPageEnabled(flags, page.key)).map((page) => {
          const active = pathname === page.href;
          return (
            <Pressable
              key={page.key}
              onPress={() => go(page.href)}
              style={[styles.item, { backgroundColor: active ? colors.primarySoft : "transparent" }]}
            >
              <View style={[styles.mark, { backgroundColor: active ? colors.primary : colors.lineStrong }]} />
              <Text style={{ color: active ? colors.primaryStrong : colors.inkSoft, fontWeight: active ? "700" : "500", fontSize: 15 }}>
                {page.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {(carga && isPageEnabled(flags, carga.key)) || user?.role === "admin" ? (
        <View style={[styles.section, { borderTopColor: colors.line }]}>
          {carga && isPageEnabled(flags, carga.key) ? (
            <Pressable onPress={() => go(carga.href)} style={[styles.item, { backgroundColor: pathname === carga.href ? colors.primarySoft : "transparent" }]}>
              <View style={[styles.mark, { backgroundColor: pathname === carga.href ? colors.primary : colors.lineStrong }]} />
              <Text style={{ color: pathname === carga.href ? colors.primaryStrong : colors.inkSoft, fontSize: 15, fontWeight: "500" }}>Carga de datos</Text>
            </Pressable>
          ) : null}
          {user?.role === "admin" ? (
            <Pressable onPress={() => go("/administracion")} style={[styles.item, { backgroundColor: pathname === "/administracion" ? colors.primarySoft : "transparent" }]}>
              <View style={[styles.mark, { backgroundColor: pathname === "/administracion" ? colors.primary : colors.lineStrong }]} />
              <Text style={{ color: pathname === "/administracion" ? colors.primaryStrong : colors.inkSoft, fontSize: 15, fontWeight: "500" }}>Administración</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.footer, { borderTopColor: colors.line }]}>
        <Pressable onPress={toggleScheme} style={[styles.theme, { backgroundColor: colors.surfaceHover }]}>
          <Text style={{ color: colors.ink, fontSize: 13, fontWeight: "600" }}>{scheme === "dark" ? "Tema oscuro" : "Tema claro"}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Cambiar</Text>
        </Pressable>
        {user ? (
          <View style={styles.user}>
            <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
              <Text style={{ color: colors.primaryStrong, fontWeight: "700" }}>{initials(user.nombre || user.email)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: colors.ink, fontWeight: "600" }}>{user.nombre || user.email}</Text>
              <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 12 }}>{user.email}</Text>
            </View>
          </View>
        ) : null}
        <Pressable
          onPress={() => {
            void logout().then(() => router.replace("/login"));
          }}
          style={[styles.logout, { borderColor: colors.line }]}
        >
          <Text style={{ color: colors.inkSoft, fontWeight: "600" }}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

function initials(value: string) {
  const parts = value.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "L") + (parts[1]?.[0] ?? "")).toUpperCase();
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 14 },
  brand: { fontSize: 13, fontWeight: "700", letterSpacing: 2.8, paddingHorizontal: 10 },
  tag: { fontSize: 12, paddingHorizontal: 10, marginTop: 4, marginBottom: 18 },
  nav: { gap: 4 },
  item: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 12 },
  mark: { width: 7, height: 7, borderRadius: 99 },
  section: { marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 4 },
  footer: { marginTop: "auto" as const, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, gap: 12 },
  theme: { borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between" },
  user: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  logout: { borderWidth: 1, borderRadius: radius.md, alignItems: "center", paddingVertical: 11 },
});
