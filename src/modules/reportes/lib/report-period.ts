import {
  getPeriodStart,
  PERIOD_LABELS,
  type DashboardPeriod,
} from "@/modules/dashboard/lib/dashboard-analytics";
import { formatDate, todayISO } from "@/shared/lib/utils";

export function formatPeriodRange(period: DashboardPeriod): string {
  const end = todayISO();
  if (period === "today") return formatDate(end);
  return `${formatDate(getPeriodStart(period))} — ${formatDate(end)}`;
}

export function formatGeneratedAt(): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function buildReportFilename(base: string, period: DashboardPeriod): string {
  const suffix = period === "today" ? todayISO() : `${getPeriodStart(period)}_${todayISO()}`;
  return `tabi-${base}-${suffix}.pdf`;
}

export function getPeriodLabel(period: DashboardPeriod): string {
  return PERIOD_LABELS[period];
}
