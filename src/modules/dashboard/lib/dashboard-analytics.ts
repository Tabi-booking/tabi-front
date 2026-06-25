import type { Reserva } from "@/modules/reservas/types/reserva";
import type { Pago } from "@/modules/dashboard/types/pago";
import type { Cliente } from "@/modules/clientes/types/cliente";
import { getClienteNombre } from "@/modules/clientes/services/cliente.service";
import { getEstadoConfig } from "@/modules/reservas/lib/reserva-estado-ui";
import { todayISO } from "@/shared/lib/utils";

export type DashboardPeriod = "today" | "7d" | "30d";

export const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: "Hoy",
  "7d": "7 días",
  "30d": "30 días",
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getPeriodStart(period: DashboardPeriod): string {
  const today = todayISO();
  if (period === "today") return today;
  if (period === "7d") return addDays(today, -6);
  return addDays(today, -29);
}

export function getPeriodDays(period: DashboardPeriod): string[] {
  const today = todayISO();
  const count = period === "today" ? 1 : period === "7d" ? 7 : 30;
  const start = period === "today" ? today : addDays(today, -(count - 1));
  const days: string[] = [];
  for (let i = 0; i < count; i++) {
    days.push(addDays(start, i));
  }
  return days;
}

export function filterReservasByPeriod(reservas: Reserva[], period: DashboardPeriod): Reserva[] {
  const start = getPeriodStart(period);
  const end = todayISO();
  return reservas.filter((r) => r.Fecha >= start && r.Fecha <= end);
}

export function filterPagosByPeriod(pagos: Pago[], period: DashboardPeriod): Pago[] {
  const start = getPeriodStart(period);
  const end = todayISO();
  return pagos.filter((p) => p.Fecha >= start && p.Fecha <= end);
}

function formatDayLabel(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric" }).format(
    new Date(iso + "T12:00:00"),
  );
}

export function buildDailyTrend(
  reservas: Reserva[],
  pagos: Pago[],
  period: DashboardPeriod,
) {
  const days = getPeriodDays(period);
  return days.map((date) => {
    const dayReservas = reservas.filter((r) => r.Fecha === date && r.Estado !== "CANCELADA");
    const dayPagos = pagos.filter((p) => p.Fecha === date);
    return {
      date,
      label: period === "today" ? "Hoy" : formatDayLabel(date),
      reservas: dayReservas.length,
      personas: dayReservas.reduce((s, r) => s + (r.Cantidad_personas ?? 0), 0),
      ingresos: dayPagos.reduce((s, p) => s + (p.Total ?? 0), 0),
    };
  });
}

export function buildEstadoDistribution(reservas: Reserva[]) {
  const counts = new Map<string, number>();
  for (const r of reservas) {
    const key = (r.Estado ?? "PENDIENTE").toUpperCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([estado, count]) => ({
      estado,
      label: getEstadoConfig(estado).label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function buildPeakHours(reservas: Reserva[]) {
  const active = reservas.filter((r) => r.Estado !== "CANCELADA");
  const buckets = new Map<number, number>();
  for (const r of active) {
    const h = parseInt(r.Hora?.split(":")[0] ?? "0", 10);
    if (h >= 8 && h <= 23) {
      buckets.set(h, (buckets.get(h) ?? 0) + 1);
    }
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([hour, count]) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      count,
    }));
}

export function buildTopClientes(reservas: Reserva[], clientes: Cliente[], limit = 5) {
  const counts = new Map<string, number>();
  for (const r of reservas.filter((x) => x.Estado !== "CANCELADA")) {
    counts.set(r.ID_Cliente, (counts.get(r.ID_Cliente) ?? 0) + 1);
  }
  const clienteMap = Object.fromEntries(clientes.map((c) => [c.ID_Key, c]));
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id, count]) => ({
      id,
      nombre: getClienteNombre(clienteMap[id]),
      count,
    }));
}

export interface DashboardKpis {
  reservas: number;
  personas: number;
  ingresos: number;
  confirmadas: number;
  pendientes: number;
  canceladas: number;
  tasaConfirmacion: number;
  tasaCancelacion: number;
  ticketPromedio: number;
  paxPromedio: number;
  ocupacionEstimada: number;
}

export function computeKpis(
  reservas: Reserva[],
  pagos: Pago[],
  period: DashboardPeriod,
): DashboardKpis {
  const inPeriod = filterReservasByPeriod(reservas, period);
  const pagosPeriod = filterPagosByPeriod(pagos, period);
  const activas = inPeriod.filter((r) => r.Estado !== "CANCELADA");
  const confirmadas = inPeriod.filter((r) => r.Estado === "CONFIRMADA").length;
  const pendientes = inPeriod.filter((r) => (r.Estado ?? "PENDIENTE") === "PENDIENTE").length;
  const canceladas = inPeriod.filter((r) => r.Estado === "CANCELADA").length;
  const personas = activas.reduce((s, r) => s + (r.Cantidad_personas ?? 0), 0);
  const ingresos = pagosPeriod.reduce((s, p) => s + (p.Total ?? 0), 0);
  const total = inPeriod.length || 1;

  return {
    reservas: activas.length,
    personas,
    ingresos,
    confirmadas,
    pendientes,
    canceladas,
    tasaConfirmacion: Math.round((confirmadas / total) * 100),
    tasaCancelacion: Math.round((canceladas / total) * 100),
    ticketPromedio: pagosPeriod.length ? Math.round(ingresos / pagosPeriod.length) : 0,
    paxPromedio: activas.length ? Math.round((personas / activas.length) * 10) / 10 : 0,
    ocupacionEstimada: personas > 0 ? Math.min(100, Math.round((personas / (period === "today" ? 80 : 400)) * 100)) : 0,
  };
}

export function buildBehaviorInsights(
  reservas: Reserva[],
  pagos: Pago[],
  period: DashboardPeriod,
  topClientes: ReturnType<typeof buildTopClientes>,
): string[] {
  const inPeriod = filterReservasByPeriod(reservas, period);
  const activas = inPeriod.filter((r) => r.Estado !== "CANCELADA");
  const insights: string[] = [];

  if (activas.length === 0) {
    insights.push("Aún no hay reservas en este periodo. Crea la primera desde Reservas.");
    return insights;
  }

  const kpis = computeKpis(reservas, pagos, period);
  const peak = buildPeakHours(inPeriod);
  const topPeak = [...peak].sort((a, b) => b.count - a.count)[0];

  if (topPeak) {
    insights.push(`La franja más demandada es alrededor de las ${topPeak.hour}.`);
  }

  if (kpis.paxPromedio > 0) {
    insights.push(`El tamaño promedio de grupo es de ${kpis.paxPromedio} personas.`);
  }

  if (kpis.tasaCancelacion > 0) {
    insights.push(`Tasa de cancelación del ${kpis.tasaCancelacion}% en el periodo seleccionado.`);
  } else {
    insights.push("Sin cancelaciones registradas en este periodo.");
  }

  if (topClientes.length >= 2) {
    const topShare = Math.round(
      (topClientes.slice(0, 3).reduce((s, c) => s + c.count, 0) / activas.length) * 100,
    );
    insights.push(`Tus 3 clientes más frecuentes concentran el ${topShare}% de las reservas.`);
  }

  const withPreorden = activas.filter((r) => r.Preorden).length;
  if (withPreorden > 0) {
    const pct = Math.round((withPreorden / activas.length) * 100);
    insights.push(`El ${pct}% de las reservas incluyen preorden.`);
  }

  if (kpis.pendientes > 0) {
    insights.push(`Tienes ${kpis.pendientes} reserva${kpis.pendientes === 1 ? "" : "s"} pendiente${kpis.pendientes === 1 ? "" : "s"} de confirmar.`);
  }

  return insights.slice(0, 5);
}

export function compareWithPreviousPeriod(
  reservas: Reserva[],
  period: DashboardPeriod,
): { reservasDelta: number; label: string } | null {
  if (period === "today") return null;

  const days = period === "7d" ? 7 : 30;
  const today = todayISO();
  const currentStart = getPeriodStart(period);
  const prevEnd = addDays(currentStart, -1);
  const prevStart = addDays(prevEnd, -(days - 1));

  const current = reservas.filter(
    (r) => r.Fecha >= currentStart && r.Fecha <= today && r.Estado !== "CANCELADA",
  ).length;
  const previous = reservas.filter(
    (r) => r.Fecha >= prevStart && r.Fecha <= prevEnd && r.Estado !== "CANCELADA",
  ).length;

  if (previous === 0) return null;

  const delta = Math.round(((current - previous) / previous) * 100);
  return {
    reservasDelta: delta,
    label: period === "7d" ? "vs semana anterior" : "vs mes anterior",
  };
}

export function compareIngresosWithPreviousPeriod(
  pagos: Pago[],
  period: DashboardPeriod,
): { ingresosDelta: number; label: string } | null {
  if (period === "today") return null;

  const days = period === "7d" ? 7 : 30;
  const today = todayISO();
  const currentStart = getPeriodStart(period);
  const prevEnd = addDays(currentStart, -1);
  const prevStart = addDays(prevEnd, -(days - 1));

  const sum = (from: string, to: string) =>
    pagos.filter((p) => p.Fecha >= from && p.Fecha <= to).reduce((s, p) => s + (p.Total ?? 0), 0);

  const current = sum(currentStart, today);
  const previous = sum(prevStart, prevEnd);

  if (previous === 0) return null;

  const delta = Math.round(((current - previous) / previous) * 100);
  return {
    ingresosDelta: delta,
    label: period === "7d" ? "vs semana anterior" : "vs mes anterior",
  };
}
