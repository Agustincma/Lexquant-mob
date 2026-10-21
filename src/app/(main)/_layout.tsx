import { Drawer } from "expo-router/drawer";
import { Redirect } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useAuth } from "@/auth/auth-context";
import { AppDrawer } from "@/components/navigation/app-drawer";
import { BootScreen } from "@/components/ui/boot-screen";
import { FiltersProvider } from "@/dashboard/filters";
import { useTheme } from "@/theme/theme";

export default function MainLayout() {
  const { status } = useAuth();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const permanent = width >= 960;

  if (status === "loading") return <BootScreen />;
  if (status !== "authenticated") return <Redirect href="/login" />;

  return (
    <FiltersProvider>
      <Drawer
        drawerContent={(props) => <AppDrawer {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface, borderBottomColor: colors.line, borderBottomWidth: 1 },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: "600", fontSize: 16, color: colors.ink },
          headerShadowVisible: false,
          sceneStyle: { backgroundColor: colors.background },
          drawerStyle: { width: 304, backgroundColor: colors.surface },
          drawerType: permanent ? "permanent" : "front",
          swipeEnabled: !permanent,
          overlayColor: "rgba(12,22,24,0.35)",
        }}
      >
        <Drawer.Screen name="resumen-ejecutivo" options={{ title: "Resumen ejecutivo" }} />
        <Drawer.Screen name="volumen-y-cobertura" options={{ title: "Volumen y cobertura" }} />
        <Drawer.Screen name="rubros-severidad" options={{ title: "Costos y severidad" }} />
        <Drawer.Screen name="jurisdicciones" options={{ title: "Jurisdicciones" }} />
        <Drawer.Screen name="fallos-y-personas" options={{ title: "Personas y resultados" }} />
        <Drawer.Screen name="carga" options={{ title: "Carga de datos" }} />
        <Drawer.Screen name="administracion" options={{ title: "Administración" }} />
        <Drawer.Screen name="sin-acceso" options={{ title: "Sin acceso", headerShown: false }} />
      </Drawer>
    </FiltersProvider>
  );
}
