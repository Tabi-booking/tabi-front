"use client";

import Link from "next/link";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  Receipt,
  Users,
  WifiOff,
} from "lucide-react";
import { PERIOD_LABELS, type DashboardPeriod } from "@/modules/dashboard/lib/dashboard-analytics";
import { formatPeriodRange } from "@/modules/reportes/lib/report-period";
import { useReportesData } from "@/modules/reportes/hooks/use-reportes-data";
import { REPORT_DEFINITIONS, type ReportKind } from "@/modules/reportes/types/report";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/native/card";
import { Skeleton } from "@/shared/components/native/skeleton";
import { PermissionDenied } from "@/shared/components/patterns/permission-denied";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { buttonClass } from "@/shared/lib/ui-classes";
import { cn } from "@/shared/lib/utils";

const PERIODS: DashboardPeriod[] = ["today", "7d", "30d"];

const REPORT_ICONS: Record<ReportKind, typeof FileText> = {
  resumen: BarChart3,
  reservas: FileSpreadsheet,
  ingresos: Receipt,
  clientes: Users,
  comportamiento: Lightbulb,
  completo: FileText,
};

function PeriodToggle({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (p: DashboardPeriod) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-card p-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            value === p
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

function getPreviewCount(kind: ReportKind, counts: { reservas: number; pagos: number; clientes: number }) {
  switch (kind) {
    case "resumen":
      return "KPIs y estados";
    case "reservas":
      return `${counts.reservas} reserva${counts.reservas === 1 ? "" : "s"}`;
    case "ingresos":
      return `${counts.pagos} pago${counts.pagos === 1 ? "" : "s"}`;
    case "clientes":
      return "Top clientes del periodo";
    case "comportamiento":
      return "Insights y tendencias";
    case "completo":
      return "5 secciones incluidas";
  }
}

export function ReportesContent() {
  const { canAccessAnalytics } = usePermissions();
  const {
    period,
    setPeriod,
    downloading,
    setDownloading,
    reportBundle,
    loadingReservas,
    loadingPagos,
    loadingClientes,
    loadingRestaurant,
    isError,
    counts,
    refetch,
  } = useReportesData();

  const dataLoading = loadingReservas || loadingPagos || loadingClientes || loadingRestaurant;

  const handleDownload = async (kind: ReportKind, filename: string) => {
    setDownloading(kind);
    try {
      const { generateReportPdf } = await import("@/modules/reportes/lib/generate-reports");
      await generateReportPdf(kind, reportBundle, period, filename);
    } finally {
      setDownloading(null);
    }
  };

  if (!canAccessAnalytics) {
    return (
      <PermissionDenied
        title="Sin acceso a reportes"
        description="Tu rol no incluye permisos para ver reportes operativos."
      />
    );
  }

  return (
    <AppPageShell
      title="Reportes"
      description="Descarga reportes en PDF con el logo de Tabi y la información organizada por periodo."
      actions={
        <Link href="/analitica" className={buttonClass("outline", "default", "gap-2")}>
          <BarChart3 className="h-4 w-4" />
          Ver analítica
        </Link>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Periodo seleccionado:{" "}
        <span className="font-medium text-foreground">{formatPeriodRange(period)}</span>
        {" · "}
        Restaurante:{" "}
        <span className="font-medium text-foreground">{reportBundle.restaurantName}</span>
      </div>

      {isError && (
        <EmptyState
          icon={WifiOff}
          title="No se pudieron cargar los datos"
          description="Verifica tu conexión e intenta de nuevo."
          actionLabel="Reintentar"
          onAction={refetch}
        />
      )}

      {!isError && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {REPORT_DEFINITIONS.map((report) => {
            const Icon = REPORT_ICONS[report.id];
            const isDownloading = downloading === report.id;

            return (
              <Card key={report.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">{report.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-3 pt-0">
                  {dataLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {getPreviewCount(report.id, counts)}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={dataLoading || isDownloading}
                    onClick={() => handleDownload(report.id, report.filename)}
                    className={cn(
                      buttonClass(
                        report.id === "completo" ? "default" : "outline",
                        "default",
                        "w-full justify-center gap-2",
                      ),
                    )}
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading ? "Generando PDF..." : "Descargar PDF"}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-dashed">
        <CardContent className="flex flex-col gap-2 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Los PDF incluyen el logo de Tabi, nombre del restaurante, periodo analizado y fecha de
            generación. Paginación automática en reportes extensos.
          </p>
        </CardContent>
      </Card>
    </AppPageShell>
  );
}
