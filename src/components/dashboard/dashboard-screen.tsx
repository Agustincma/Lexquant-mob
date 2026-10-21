import { RefreshControl, Text } from "react-native";
import type { ReactNode } from "react";
import { ApiError } from "@/api/client";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { FilterSummary } from "@/components/dashboard/filter-summary";
import { BootScreen } from "@/components/ui/boot-screen";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { useResumen } from "@/queries/use-dashboard";
import { useTheme } from "@/theme/theme";
import type { ResumenEjecutivo } from "@/types/api";

export function DashboardScreen({
  subtitle,
  children,
}: {
  subtitle: string;
  children: (data: ResumenEjecutivo) => ReactNode;
}) {
  const { colors } = useTheme();
  const query = useResumen();

  if (query.isLoading && !query.data) return <BootScreen label="Cargando el panel" />;
  if (query.isError || !query.data) {
    const message = query.error instanceof ApiError ? query.error.message : "No se pudo leer el dashboard.";
    return <ErrorState message={message} onRetry={() => void query.refetch()} retrying={query.isFetching} />;
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={query.isFetching && !query.isPlaceholderData}
          onRefresh={() => void query.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>{subtitle}</Text>
      <FilterBar updating={Boolean(query.isPlaceholderData)} />
      <FilterSummary meta={query.data.meta} />
      {children(query.data)}
    </Screen>
  );
}
