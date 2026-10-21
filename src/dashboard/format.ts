import type { Frecuencia, MonthRange } from "@/types/api";

export function formatNumber(value: number) {
  return value.toLocaleString("es-AR");
}

export function formatCurrency(value: number, digits = 1) {
  return `$${(value / 1_000_000).toLocaleString("es-AR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} MM`;
}

export function formatMonth(value: string) {
  const quarter = /^(\d{4})-Q([1-4])$/.exec(value);
  if (quarter) return `${quarter[2]}T ${quarter[1]}`;
  const semester = /^(\d{4})-S([12])$/.exec(value);
  if (semester) return `${semester[2]}S ${semester[1]}`;
  const [year, month] = value.split("-");
  return new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1, 1),
  );
}

export function frecuenciaCopy(frecuencia: Frecuencia = "mensual") {
  if (frecuencia === "trimestral") {
    return { por: "trimestre", detalle: "Detalle trimestral", columna: "Trimestre", evolucion: "Evolución trimestral" };
  }
  return { por: "mes", detalle: "Detalle mensual", columna: "Mes", evolucion: "Evolución mensual" };
}

export function formatMonthRange({ desde, hasta }: MonthRange) {
  return desde === hasta ? formatMonth(desde) : `${formatMonth(desde)} – ${formatMonth(hasta)}`;
}

export function formatIndex(value: number | null) {
  return value === null ? "—" : value.toLocaleString("es-AR");
}

export function formatVariacion(value: number | null) {
  if (value === null) return "—";
  return `${value > 0 ? "+" : ""}${value.toLocaleString("es-AR")}%`;
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-AR");
}

export function withCount(label: string, count: number) {
  return `${label} (${count.toLocaleString("es-AR")})`;
}
