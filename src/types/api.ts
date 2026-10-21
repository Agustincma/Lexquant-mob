export type Rol = "user" | "admin";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  role: Rol;
  createdAt: string;
  updatedAt: string;
}

export interface MonthRange {
  desde: string;
  hasta: string;
}

export type Frecuencia = "mensual" | "trimestral";

export interface ResumenEjecutivo {
  filtros?: {
    periodo: string;
    frecuencia: Frecuencia;
    provincia?: string;
    jurisdiccion?: string;
    instancia?: string;
    aseguradora?: string;
  };
  meta: {
    periodo: MonthRange;
    fechas_sentencia: { desde: string | null; hasta: string | null };
    n_fallos: number;
    n_lesionados: number;
    costo_punto_desde: string;
    actualizacion: {
      importado_en: string;
      ipc_actualizado_al: string | null;
      fuentes: { fallos: string; personas: string };
    };
  };
  kpis: {
    sentencias_analizadas: {
      valor: number;
      desde: string;
      variacion_pct: number | null;
      variacion_comparacion: MonthRange | null;
    };
    capital_indemnizatorio_medio: { valor: number; moneda: string; n_fallos: number };
    costo_implicito_punto: { mediana: number; media: number; p10: number; p25: number; p75: number; p90: number };
    demora_mediana_anios: number;
    demora_media_anios: number;
    doctrina_barrientos_pct: { aplicada: number; no_aplicada: number; no_clasificada: number };
  };
  evolucion_mensual_costo_punto: {
    mes: string;
    media: number;
    mediana: number;
    p10: number;
    p25: number;
    p75: number;
    p90: number;
    n_personas: number;
  }[];
  composicion_capital_indemnizatorio: {
    rubros: { rubro: string; campo?: string; monto?: number; pct: number }[];
    total_indemnizado: number;
  };
  distribucion_cantidad_fallos: { categoria: string; n_fallos: number; pct: number }[];
  distribucion_incapacidades: {
    buckets: { rango: string; n_personas: number; pct: number }[];
    mediana_pct: number;
    media_pct: number;
    p90_pct: number;
    casos_sin_is_pct: number;
  };
  diferencias_territoriales: {
    total_argentina: { costo_x_punto_indice: number; demora_indice: number; doctrina_barrientos_indice: number };
    jurisdicciones: {
      jurisdiccion: string;
      provincia: string;
      n_sentencias: number;
      costo_x_punto_indice: number | null;
      demora_indice: number | null;
      doctrina_barrientos_indice: number | null;
    }[];
  };
  fallos_y_personas: {
    mes: string;
    fallos: number;
    lesionados: number;
    fallecidos: number;
    derechohabientes: number;
    lesionados_por_fallo: number;
    derechohabientes_por_fallecido: number;
  }[];
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface CountedFilterOption extends FilterOption {
  n_sentencias: number;
}

export interface DashboardFiltros {
  rango: MonthRange;
  periodos: FilterOption[];
  provincias: {
    provincia: string;
    n_sentencias: number;
    jurisdicciones: { nombre: string; n_sentencias: number }[];
  }[];
  instancias: CountedFilterOption[];
  aseguradoras: CountedFilterOption[];
  frecuencias?: FilterOption[];
  defaults: { periodo: string; frecuencia?: Frecuencia };
  actualizacion?: ResumenEjecutivo["meta"]["actualizacion"];
}

export interface AdminUserMatch {
  id: string;
  email: string;
  nombre: string;
  role: Rol;
}

export interface AdminUserPages {
  email: string;
  nombre: string;
  role: Rol;
  pages: FlagKey[];
}

export interface AdminFlag {
  key: FlagKey;
  description: string;
  enabled: boolean;
  whitelist: string[];
  updatedAt: string;
  updatedBy: string | null;
}

export const PAGE_FLAGS = [
  { key: "page.resumen-ejecutivo", href: "/resumen-ejecutivo", label: "Resumen ejecutivo" },
  { key: "page.volumen-y-cobertura", href: "/volumen-y-cobertura", label: "Volumen y cobertura" },
  { key: "page.rubros-severidad", href: "/rubros-severidad", label: "Costos y severidad" },
  { key: "page.jurisdicciones", href: "/jurisdicciones", label: "Jurisdicciones" },
  { key: "page.fallos-y-personas", href: "/fallos-y-personas", label: "Personas y resultados" },
  { key: "page.carga", href: "/carga", label: "Carga de datos" },
] as const;

export type FlagKey = (typeof PAGE_FLAGS)[number]["key"];

export type FeatureFlags = Partial<Record<FlagKey, boolean>>;

export const NO_ACCESS_HREF = "/sin-acceso";

export function isPageEnabled(flags: FeatureFlags, key: FlagKey) {
  return flags[key] === true;
}

export function firstEnabledHref(flags: FeatureFlags) {
  return PAGE_FLAGS.find(({ key }) => isPageEnabled(flags, key))?.href ?? NO_ACCESS_HREF;
}

export function pageLabel(key: FlagKey) {
  return PAGE_FLAGS.find((page) => page.key === key)?.label ?? key;
}
