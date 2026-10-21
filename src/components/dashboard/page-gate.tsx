import { Redirect } from "expo-router";
import type { ReactNode } from "react";
import { BootScreen } from "@/components/ui/boot-screen";
import { ErrorState } from "@/components/ui/error-state";
import { useFlags } from "@/features/flags-context";
import { isPageEnabled, type FlagKey } from "@/types/api";

export function PageGate({ flag, children }: { flag: FlagKey; children: ReactNode }) {
  const { status, flags, homeHref, refetch } = useFlags();
  if (status === "loading" || status === "idle") return <BootScreen />;
  if (status === "error") return <ErrorState message="No se pudieron leer las feature flags." onRetry={refetch} />;
  if (!isPageEnabled(flags, flag)) return <Redirect href={homeHref} />;
  return children;
}
