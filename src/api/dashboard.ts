import { api } from "@/api/client";
import type { DashboardFiltros, FeatureFlags, ResumenEjecutivo } from "@/types/api";

export function getResumenEjecutivo(query: string) {
  return api<ResumenEjecutivo>(`/api/dashboard/resumen-ejecutivo${query ? `?${query}` : ""}`);
}

export function getDashboardFiltros() {
  return api<DashboardFiltros>("/api/dashboard/filtros");
}

export function getMyFlags() {
  return api<{ flags: FeatureFlags }>("/api/feature-flags/me");
}
