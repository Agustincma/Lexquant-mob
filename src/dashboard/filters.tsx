import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getDashboardFiltros } from "@/api/dashboard";
import type { DashboardFiltros, Frecuencia } from "@/types/api";

export type FilterState = {
  periodo: string;
  frecuencia: string;
  provincia: string;
  jurisdiccion: string;
  instancia: string;
  aseguradora: string;
};

const EMPTY: FilterState = {
  periodo: "",
  frecuencia: "",
  provincia: "",
  jurisdiccion: "",
  instancia: "",
  aseguradora: "",
};

const FILTER_KEYS = ["periodo", "frecuencia", "provincia", "jurisdiccion", "instancia", "aseguradora"] as const;

type FiltersContextValue = {
  filtros?: DashboardFiltros;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  state: FilterState;
  query: string;
  hasActive: boolean;
  displayed: { periodo: string; frecuencia: Frecuencia };
  setPeriodo: (value: string) => void;
  setFrecuencia: (value: string) => void;
  setProvincia: (value: string) => void;
  setJurisdiccion: (value: string) => void;
  setInstancia: (value: string) => void;
  setAseguradora: (value: string) => void;
  reset: () => void;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

function toQuery(state: FilterState, defaults: { periodo: string; frecuencia: string }) {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = state[key];
    if (!value) continue;
    if ((key === "periodo" || key === "frecuencia") && value === defaults[key]) continue;
    params.set(key, value);
  }
  return params.toString();
}

export function FiltersProvider({ children }: { children: ReactNode }) {
  const filtrosQuery = useQuery({ queryKey: ["dashboard-filtros"], queryFn: getDashboardFiltros });
  const [state, setState] = useState<FilterState>(EMPTY);
  const defaults = {
    periodo: filtrosQuery.data?.defaults.periodo ?? "todo",
    frecuencia: filtrosQuery.data?.defaults.frecuencia ?? "mensual",
  };
  const query = useMemo(() => toQuery(state, defaults), [state, defaults.periodo, defaults.frecuencia]);
  const hasActive = FILTER_KEYS.some((key) => Boolean(state[key]));

  const value = useMemo<FiltersContextValue>(
    () => ({
      filtros: filtrosQuery.data,
      isLoading: filtrosQuery.isLoading,
      isError: filtrosQuery.isError,
      refetch: () => {
        void filtrosQuery.refetch();
      },
      state,
      query,
      hasActive,
      displayed: {
        periodo: state.periodo || defaults.periodo,
        frecuencia: (state.frecuencia || defaults.frecuencia) as Frecuencia,
      },
      setPeriodo: (value) => setState((prev) => ({ ...prev, periodo: value === defaults.periodo ? "" : value })),
      setFrecuencia: (value) => setState((prev) => ({ ...prev, frecuencia: value === defaults.frecuencia ? "" : value })),
      setProvincia: (value) =>
        setState((prev) => {
          const province = filtrosQuery.data?.provincias.find((item) => item.provincia === value);
          const keep = province?.jurisdicciones.some((item) => item.nombre === prev.jurisdiccion);
          return { ...prev, provincia: value, jurisdiccion: keep ? prev.jurisdiccion : "" };
        }),
      setJurisdiccion: (value) => setState((prev) => ({ ...prev, jurisdiccion: value })),
      setInstancia: (value) => setState((prev) => ({ ...prev, instancia: value })),
      setAseguradora: (value) => setState((prev) => ({ ...prev, aseguradora: value })),
      reset: () => setState(EMPTY),
    }),
    [defaults.frecuencia, defaults.periodo, filtrosQuery, hasActive, query, state],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const value = useContext(FiltersContext);
  if (!value) throw new Error("useFilters tiene que usarse dentro de FiltersProvider");
  return value;
}
