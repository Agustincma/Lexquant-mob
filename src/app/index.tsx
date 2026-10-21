import { Redirect } from "expo-router";
import { BootScreen } from "@/components/ui/boot-screen";
import { ErrorState } from "@/components/ui/error-state";
import { useAuth } from "@/auth/auth-context";
import { useFlags } from "@/features/flags-context";

export default function Index() {
  const { status } = useAuth();
  const flags = useFlags();

  if (status === "loading") return <BootScreen />;
  if (status === "anonymous") return <Redirect href="/login" />;
  if (flags.status === "error") {
    return <ErrorState message="No se pudieron leer las pantallas habilitadas para tu usuario." onRetry={flags.refetch} />;
  }
  if (flags.status !== "ready") return <BootScreen label="Leyendo tus accesos" />;
  return <Redirect href={flags.homeHref} />;
}
