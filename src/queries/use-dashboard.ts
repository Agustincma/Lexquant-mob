import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getResumenEjecutivo } from "@/api/dashboard";
import { useFilters } from "@/dashboard/filters";

export function useResumen() {
  const { query } = useFilters();
  return useQuery({
    queryKey: ["resumen-ejecutivo", query],
    queryFn: () => getResumenEjecutivo(query),
    placeholderData: keepPreviousData,
  });
}
