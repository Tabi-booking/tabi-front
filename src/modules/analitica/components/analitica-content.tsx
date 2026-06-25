"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Clock,
  DollarSign,
  Download,
  Lightbulb,
  RefreshCw,
  UserCheck,
  Users,
  WifiOff,
} from "lucide-react";
import { useAnaliticaStats } from "@/modules/analitica/hooks/use-analitica-stats";
import {
  DeltaBadge,
  SectionHeading,
} from "@/modules/analitica/lib/analitica-ui";
import { PERIOD_LABELS, type DashboardPeriod } from "@/modules/dashboard/lib/dashboard-analytics";
import { formatPeriodRange } from "@/modules/reportes/lib/report-period";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { AsyncSection } from "@/shared/components/patterns/async-section";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { StatCard } from "@/shared/components/patterns/stat-card";
import { Card, CardContent, CardHeader } from "@/shared/components/native/card";
import { Skeleton } from "@/shared/components/native/skeleton";
import { PermissionDenied } from "@/shared/components/patterns/permission-denied";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { buttonClass } from "@/shared/lib/ui-classes";
import { cn, formatCurrency } from "@/shared/lib/utils";

const PERIODS: DashboardPeriod[] = ["today", "7d", "30d"];

const AnaliticaDailyTrendChart = dynamic(
  () =>
    import("@/modules/analitica/components/analitica-charts").then((m) => m.AnaliticaDailyTrendChart),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);

const AnaliticaEstadoCharts = dynamic(
  () =>
    import("@/modules/analitica/components/analitica-charts").then((m) => m.AnaliticaEstadoCharts),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full" /> },
);

const AnaliticaPeakHoursChart = dynamic(
  () =>
    import("@/modules/analitica/components/analitica-charts").then((m) => m.AnaliticaPeakHoursChart),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);

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

function formatLastUpdated(ts: number) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(ts));
}

function SummaryHero({
  period,
  canReadReservations,
  canReadPayments,
  kpis,
}: {
  period: DashboardPeriod;
  canReadReservations: boolean;
  canReadPayments: boolean;
  kpis: ReturnType<typeof useAnaliticaStats>["kpis"];
}) {
  const highlights = [
    canReadReservations && {
      label: "Reservas activas",
      value: String(kpis.reservas),
      sub: `${kpis.confirmadas} confirmadas`,
    },
    canReadReservations && {
      label: "Comensales",
      value: String(kpis.personas),
      sub: `~${kpis.paxPromedio} pax / reserva`,
    },
    canReadPayments && {
      label: "Ingresos",
      value: formatCurrency(kpis.ingresos),
      sub: kpis.ticketPromedio > 0 ? `Ticket ${formatCurrency(kpis.ticketPromedio)}` : "Sin pagos",
    },
  ].filter(Boolean) as { label: string; value: string; sub: string }[];

  if (highlights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Resumen del periodo</p>
          <p className="mt-1 text-sm text-muted-foreground">{formatPeriodRange(period)}</p>
        </div>
        <BarChart3 className="hidden h-8 w-8 text-primary/40 sm:block" />
      </div>
      <div
        className={cn(
          "grid gap-4",
          highlights.length === 1 && "sm:grid-cols-1",
          highlights.length === 2 && "sm:grid-cols-2",
          highlights.length >= 3 && "sm:grid-cols-3",
        )}
      >
        {highlights.map((item) => (
          <div key={item.label} className="rounded-xl border border-border/60 bg-card/80 p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{item.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnaliticaContent() {
  const { canAccessAnalytics, canReadOrders } = usePermissions();
  const {
    period,
    setPeriod,
    loadingReservas,
    loadingPagos,
    loadingClientes,
    isFetching,
    isError,
    lastUpdated,
    refetch,
    isPartialReservas,
    canReadReservations,
    canReadPayments,
    canReadClients,
    kpis,
    dailyTrend,
    estadoDistribution,
    peakHours,
    topClientes,
    insights,
    comparison,
    ingresosComparison,
  } = useAnaliticaStats();

  if (!canAccessAnalytics) {
    return (
      <PermissionDenied
        title="Sin acceso a analítica"
        description="Tu rol no incluye permisos para ver métricas operativas."
      />
    );
  }

  const hasOperationalData = canReadReservations || canReadPayments;

  const reservasTrend =
    comparison && comparison.reservasDelta !== 0
      ? `${comparison.reservasDelta > 0 ? "+" : ""}${comparison.reservasDelta}% ${comparison.label}`
      : undefined;

  const ingresosTrend =
    ingresosComparison && ingresosComparison.ingresosDelta !== 0
      ? `${ingresosComparison.ingresosDelta > 0 ? "+" : ""}${ingresosComparison.ingresosDelta}% ${ingresosComparison.label}`
      : undefined;

  const trendIsEmpty =
    canReadReservations || canReadPayments
      ? dailyTrend.every((d) => {
          const noReservas = !canReadReservations || d.reservas === 0;
          const noIngresos = !canReadPayments || d.ingresos === 0;
          return noReservas && noIngresos;
        })
      : true;

  const kpiLoading =
    (canReadReservations && loadingReservas) || (canReadPayments && loadingPagos);

  if (isError && !canReadReservations && !canReadPayments) {
    return (
      <AppPageShell title="Analítica">
        <EmptyState
          icon={WifiOff}
          title="Error al cargar analítica"
          description="No pudimos obtener las métricas en tiempo real."
          actionLabel="Reintentar"
          onAction={refetch}
        />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell
      title="Analítica"
      description="Comportamiento en tiempo real de tu restaurante"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refetch}
            disabled={isFetching}
            className={buttonClass("outline", "default", "gap-2")}
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Actualizar
          </button>
          <Link href="/reportes" className={buttonClass("outline", "default", "gap-2")}>
            <Download className="h-4 w-4" />
            Reportes
          </Link>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <PeriodToggle value={period} onChange={setPeriod} />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin text-primary")} />
            Actualizado {formatLastUpdated(lastUpdated)}
            {isFetching && !kpiLoading && " · actualizando…"}
          </span>
          {isPartialReservas && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Muestra parcial de reservas en caché
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {comparison && comparison.reservasDelta !== 0 && canReadReservations && (
            <DeltaBadge delta={comparison.reservasDelta} label={comparison.label} />
          )}
          {ingresosComparison &&
            ingresosComparison.ingresosDelta !== 0 &&
            canReadPayments && (
              <DeltaBadge
                delta={ingresosComparison.ingresosDelta}
                label={ingresosComparison.label}
              />
            )}
        </div>
      </div>

      {!hasOperationalData && canReadOrders && (
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={BarChart3}
              title="Métricas de pedidos"
              description="Las analíticas de pedidos estarán disponibles cuando el módulo esté integrado."
            />
          </CardContent>
        </Card>
      )}

      {hasOperationalData && (
        <>
          {kpiLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: canReadReservations && canReadPayments ? 4 : 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : (
            <SummaryHero
              period={period}
              canReadReservations={canReadReservations}
              canReadPayments={canReadPayments}
              kpis={kpis}
            />
          )}

          <div
            className={cn(
              "grid gap-4",
              canReadReservations && canReadPayments
                ? "sm:grid-cols-2 xl:grid-cols-4"
                : "sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {canReadReservations &&
              (loadingReservas ? (
                <>
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </>
              ) : (
                <>
                  <StatCard
                    title="Reservas"
                    value={kpis.reservas}
                    icon={CalendarDays}
                    description={`${kpis.confirmadas} confirmadas · ${kpis.pendientes} pendientes`}
                    trend={reservasTrend}
                  />
                  <StatCard
                    title="Comensales"
                    value={kpis.personas}
                    icon={Users}
                    description={`Promedio ${kpis.paxPromedio} pax por reserva`}
                  />
                  <StatCard
                    title="Ocupación est."
                    value={`${kpis.ocupacionEstimada}%`}
                    icon={UserCheck}
                    description={`${kpis.tasaConfirmacion}% confirmación · ${kpis.tasaCancelacion}% cancelación`}
                  />
                </>
              ))}
            {canReadPayments &&
              (loadingPagos ? (
                <Skeleton className="h-28 w-full" />
              ) : (
                <StatCard
                  title="Ingresos"
                  value={formatCurrency(kpis.ingresos)}
                  icon={DollarSign}
                  description={
                    kpis.ticketPromedio > 0
                      ? `Ticket promedio ${formatCurrency(kpis.ticketPromedio)}`
                      : "Sin pagos en el periodo"
                  }
                  trend={ingresosTrend}
                />
              ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <SectionHeading
                  title="Tendencia diaria"
                  hint={
                    canReadReservations && canReadPayments
                      ? "Reservas e ingresos por día"
                      : canReadPayments
                        ? "Ingresos por día"
                        : "Reservas por día"
                  }
                  icon={BarChart3}
                />
              </CardHeader>
              <CardContent className="h-72">
                <AsyncSection
                  loading={(canReadReservations && loadingReservas) || (canReadPayments && loadingPagos)}
                  skeletonClassName="h-full w-full"
                >
                  <AnaliticaDailyTrendChart
                    dailyTrend={dailyTrend}
                    canReadReservations={canReadReservations}
                    canReadPayments={canReadPayments}
                    trendIsEmpty={trendIsEmpty}
                  />
                </AsyncSection>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionHeading
                  title="Insights"
                  hint="Patrones detectados en el periodo"
                  icon={Lightbulb}
                />
              </CardHeader>
              <CardContent>
                {insights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aún no hay suficientes datos para generar insights.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {insights.map((text) => (
                      <li key={text} className="flex gap-2 text-sm text-muted-foreground">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {canReadReservations && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <SectionHeading title="Estados de reserva" icon={CalendarDays} />
                </CardHeader>
                <CardContent>
                  <AsyncSection loading={loadingReservas} skeletonClassName="h-48 w-full">
                    <AnaliticaEstadoCharts estadoDistribution={estadoDistribution} />
                  </AsyncSection>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <SectionHeading title="Horas pico" hint="Distribución por hora" icon={Clock} />
                </CardHeader>
                <CardContent className="h-56">
                  <AsyncSection loading={loadingReservas} skeletonClassName="h-full w-full">
                    <AnaliticaPeakHoursChart peakHours={peakHours} />
                  </AsyncSection>
                </CardContent>
              </Card>
            </div>
          )}

          {canReadClients && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <SectionHeading
                  title="Clientes más frecuentes"
                  hint="Top del periodo seleccionado"
                  icon={Users}
                />
                <Link
                  href="/clientes"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ver todos
                </Link>
              </CardHeader>
              <CardContent>
                {loadingClientes ? (
                  <Skeleton className="h-24 w-full" />
                ) : topClientes.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Sin clientes recurrentes en el periodo.
                    </p>
                    <Link
                      href="/clientes"
                      className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      Ir a clientes
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {topClientes.map((c, i) => (
                      <Link
                        key={c.id}
                        href="/clientes"
                        className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:border-primary/30 hover:bg-muted/40"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{c.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.count} reserva{c.count === 1 ? "" : "s"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </AppPageShell>
  );
}
