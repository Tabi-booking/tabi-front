import type { DashboardPeriod } from "@/modules/dashboard/lib/dashboard-analytics";

export type ReportKind =
  | "resumen"
  | "reservas"
  | "ingresos"
  | "clientes"
  | "comportamiento"
  | "completo";

export interface ReportDefinition {
  id: ReportKind;
  title: string;
  description: string;
  filename: string;
}

export interface ReportContext {
  restaurantName: string;
  period: DashboardPeriod;
  periodLabel: string;
  generatedAt: string;
}

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    id: "resumen",
    title: "Resumen operativo",
    description: "KPIs, estados de reserva e indicadores clave del periodo.",
    filename: "resumen-operativo",
  },
  {
    id: "reservas",
    title: "Listado de reservas",
    description: "Detalle completo de reservas con cliente, fecha, hora y estado.",
    filename: "reservas",
  },
  {
    id: "ingresos",
    title: "Reporte de ingresos",
    description: "Pagos registrados, totales y desglose por transacción.",
    filename: "ingresos",
  },
  {
    id: "clientes",
    title: "Clientes frecuentes",
    description: "Ranking de clientes con más reservas en el periodo.",
    filename: "clientes",
  },
  {
    id: "comportamiento",
    title: "Análisis de comportamiento",
    description: "Horas pico, tendencia diaria e insights de operación.",
    filename: "comportamiento",
  },
  {
    id: "completo",
    title: "Reporte completo",
    description: "Todos los reportes en un solo documento PDF.",
    filename: "reporte-completo",
  },
];
