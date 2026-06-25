import type { Cliente } from "@/modules/clientes/types/cliente";
import { getClienteNombre } from "@/modules/clientes/services/cliente.service";
import {
  buildBehaviorInsights,
  buildDailyTrend,
  buildEstadoDistribution,
  buildPeakHours,
  buildTopClientes,
  computeKpis,
  filterPagosByPeriod,
  filterReservasByPeriod,
  type DashboardPeriod,
} from "@/modules/dashboard/lib/dashboard-analytics";
import type { Pago } from "@/modules/dashboard/types/pago";
import {
  addBulletList,
  addSectionTitle,
  addTable,
  createReportDocument,
  drawReportHeader,
  ensureSpace,
  getTableEndY,
  loadTabiLogo,
  saveReport,
} from "@/modules/reportes/lib/pdf-report-builder";
import {
  buildReportFilename,
  formatGeneratedAt,
  formatPeriodRange,
  getPeriodLabel,
} from "@/modules/reportes/lib/report-period";
import type { ReportContext, ReportKind } from "@/modules/reportes/types/report";
import { getEstadoConfig } from "@/modules/reservas/lib/reserva-estado-ui";
import type { Reserva } from "@/modules/reservas/types/reserva";
import { formatCurrency, formatDate, formatTime } from "@/shared/lib/utils";
import type { jsPDF } from "jspdf";

export interface ReportDataBundle {
  reservas: Reserva[];
  pagos: Pago[];
  clientes: Cliente[];
  restaurantName: string;
}

function buildContext(data: ReportDataBundle, period: DashboardPeriod): ReportContext {
  return {
    restaurantName: data.restaurantName,
    period,
    periodLabel: formatPeriodRange(period),
    generatedAt: formatGeneratedAt(),
  };
}

function clienteMap(clientes: Cliente[]) {
  return Object.fromEntries(clientes.map((c) => [c.ID_Key, c]));
}

function appendResumenSection(
  doc: jsPDF,
  ctx: ReportContext,
  data: ReportDataBundle,
  startY: number,
): number {
  const periodReservas = filterReservasByPeriod(data.reservas, ctx.period);
  const kpis = computeKpis(data.reservas, data.pagos, ctx.period);
  const estados = buildEstadoDistribution(periodReservas);

  let y = addSectionTitle(doc, startY, "Indicadores clave");
  addTable(
    doc,
    y,
    [["Indicador", "Valor"]],
    [
      ["Reservas activas", String(kpis.reservas)],
      ["Personas atendidas", String(kpis.personas)],
      ["Ingresos", formatCurrency(kpis.ingresos)],
      ["Confirmadas", String(kpis.confirmadas)],
      ["Pendientes", String(kpis.pendientes)],
      ["Canceladas", String(kpis.canceladas)],
      ["Tasa de confirmación", `${kpis.tasaConfirmacion}%`],
      ["Tasa de cancelación", `${kpis.tasaCancelacion}%`],
      ["Ticket promedio", formatCurrency(kpis.ticketPromedio)],
      ["Pax promedio", String(kpis.paxPromedio)],
    ],
  );
  y = ensureSpace(doc, getTableEndY(doc, y + 50));

  y = addSectionTitle(doc, y, "Distribución por estado");
  addTable(
    doc,
    y,
    [["Estado", "Cantidad"]],
    estados.map((e) => [e.label, String(e.count)]),
  );
  return getTableEndY(doc, y + 20);
}

function appendReservasSection(
  doc: jsPDF,
  ctx: ReportContext,
  data: ReportDataBundle,
  startY: number,
): number {
  const periodReservas = filterReservasByPeriod(data.reservas, ctx.period).sort((a, b) =>
    `${a.Fecha}${a.Hora}`.localeCompare(`${b.Fecha}${b.Hora}`),
  );
  const map = clienteMap(data.clientes);

  const y = addSectionTitle(doc, startY, `Reservas (${periodReservas.length})`);
  if (periodReservas.length === 0) {
    doc.setFontSize(9);
    doc.text("No hay reservas en el periodo seleccionado.", 14, y);
    return y + 10;
  }

  addTable(
    doc,
    y,
    [["Código", "Cliente", "Fecha", "Hora", "Pax", "Estado"]],
    periodReservas.map((r) => [
      r.Codigo_reserva || r.ID_Key.slice(0, 8),
      getClienteNombre(map[r.ID_Cliente]),
      formatDate(r.Fecha),
      formatTime(r.Hora),
      String(r.Cantidad_personas ?? "—"),
      getEstadoConfig(r.Estado).label,
    ]),
    { columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 40 } } },
  );
  return getTableEndY(doc, y + 20);
}

function appendIngresosSection(
  doc: jsPDF,
  ctx: ReportContext,
  data: ReportDataBundle,
  startY: number,
): number {
  const pagos = filterPagosByPeriod(data.pagos, ctx.period).sort((a, b) =>
    b.Fecha.localeCompare(a.Fecha),
  );
  const total = pagos.reduce((s, p) => s + (p.Total ?? 0), 0);

  const y = addSectionTitle(doc, startY, `Ingresos — Total ${formatCurrency(total)}`);
  if (pagos.length === 0) {
    doc.setFontSize(9);
    doc.text("No hay pagos registrados en el periodo.", 14, y);
    return y + 10;
  }

  addTable(
    doc,
    y,
    [["Fecha", "Cliente", "Método", "Subtotal", "IVA", "Total"]],
    pagos.map((p) => [
      formatDate(p.Fecha),
      p.Nombre_Cliente || "—",
      p.Metodo_de_pago || "—",
      formatCurrency(p.Subtotal ?? 0),
      formatCurrency(p.Iva ?? 0),
      formatCurrency(p.Total ?? 0),
    ]),
  );
  return getTableEndY(doc, y + 20);
}

function appendClientesSection(
  doc: jsPDF,
  ctx: ReportContext,
  data: ReportDataBundle,
  startY: number,
): number {
  const periodReservas = filterReservasByPeriod(data.reservas, ctx.period);
  const top = buildTopClientes(periodReservas, data.clientes, 15);

  const y = addSectionTitle(doc, startY, "Clientes más frecuentes");
  if (top.length === 0) {
    doc.setFontSize(9);
    doc.text("No hay clientes con reservas en el periodo.", 14, y);
    return y + 10;
  }

  addTable(
    doc,
    y,
    [["#", "Cliente", "Reservas"]],
    top.map((c, i) => [String(i + 1), c.nombre, String(c.count)]),
  );
  return getTableEndY(doc, y + 20);
}

function appendComportamientoSection(
  doc: jsPDF,
  ctx: ReportContext,
  data: ReportDataBundle,
  startY: number,
): number {
  const periodReservas = filterReservasByPeriod(data.reservas, ctx.period);
  const topClientes = buildTopClientes(periodReservas, data.clientes);
  const insights = buildBehaviorInsights(data.reservas, data.pagos, ctx.period, topClientes);
  const peakHours = buildPeakHours(periodReservas);
  const dailyTrend = buildDailyTrend(data.reservas, data.pagos, ctx.period);

  let y = addSectionTitle(doc, startY, "Insights de operación");
  y = addBulletList(doc, y, insights);
  y = ensureSpace(doc, y, 50);

  y = addSectionTitle(doc, y, "Horas pico");
  if (peakHours.length === 0) {
    doc.setFontSize(9);
    doc.text("Sin datos de horarios en el periodo.", 14, y);
    y += 10;
  } else {
    addTable(
      doc,
      y,
      [["Hora", "Reservas"]],
      peakHours.map((h) => [h.hour, String(h.count)]),
    );
    y = getTableEndY(doc, y + 20);
  }

  y = ensureSpace(doc, y, 50);
  y = addSectionTitle(doc, y, "Tendencia diaria");
  addTable(
    doc,
    y,
    [["Día", "Reservas", "Personas", "Ingresos"]],
    dailyTrend.map((d) => [
      d.label,
      String(d.reservas),
      String(d.personas),
      formatCurrency(d.ingresos),
    ]),
  );
  return getTableEndY(doc, y + 20);
}

const SECTION_BUILDERS: Record<
  Exclude<ReportKind, "completo">,
  (doc: jsPDF, ctx: ReportContext, data: ReportDataBundle, startY: number) => number
> = {
  resumen: appendResumenSection,
  reservas: appendReservasSection,
  ingresos: appendIngresosSection,
  clientes: appendClientesSection,
  comportamiento: appendComportamientoSection,
};

const REPORT_TITLES: Record<ReportKind, string> = {
  resumen: "Resumen operativo",
  reservas: "Listado de reservas",
  ingresos: "Reporte de ingresos",
  clientes: "Clientes frecuentes",
  comportamiento: "Análisis de comportamiento",
  completo: "Reporte completo",
};

export async function generateReportPdf(
  kind: ReportKind,
  data: ReportDataBundle,
  period: DashboardPeriod,
  filenameBase: string,
): Promise<void> {
  const logo = await loadTabiLogo();
  const ctx = buildContext(data, period);
  const doc = createReportDocument();
  const title = REPORT_TITLES[kind];

  let y = drawReportHeader(doc, ctx, title, logo);

  if (kind === "completo") {
    const sections: Exclude<ReportKind, "completo">[] = [
      "resumen",
      "reservas",
      "ingresos",
      "clientes",
      "comportamiento",
    ];
    for (let i = 0; i < sections.length; i++) {
      if (i > 0) {
        doc.addPage();
        y = 20;
      }
      y = SECTION_BUILDERS[sections[i]](doc, ctx, data, y);
    }
  } else {
    SECTION_BUILDERS[kind](doc, ctx, data, y);
  }

  saveReport(doc, buildReportFilename(filenameBase, period));
}

export { getPeriodLabel };
