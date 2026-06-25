"use client";

import type { ComponentType, ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock,
  DollarSign,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  Users,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useDashboardStats } from "@/modules/dashboard/hooks/use-dashboard-stats";
import { PERIOD_LABELS, type DashboardPeriod } from "@/modules/dashboard/lib/dashboard-analytics";
import { EstadoReservaBadge } from "@/modules/reservas/components/estado-reserva-badge";
import { getClienteNombre } from "@/modules/clientes/services/cliente.service";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { AsyncSection } from "@/shared/components/patterns/async-section";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { StatCard } from "@/shared/components/patterns/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/native/card";
import { Skeleton } from "@/shared/components/native/skeleton";
import { buttonClass } from "@/shared/lib/ui-classes";
import { cn, formatCurrency, formatDate, formatTime } from "@/shared/lib/utils";

const DashboardTrendChart = dynamic(
  () =>
    import("@/modules/dashboard/components/dashboard-charts").then((m) => m.DashboardTrendChart),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);

const DashboardPeakHoursChart = dynamic(
  () =>
    import("@/modules/dashboard/components/dashboard-charts").then((m) => m.DashboardPeakHoursChart),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);

const PERIODS: DashboardPeriod[] = ["today", "7d", "30d"];

const ESTADO_BAR_COLORS: Record<string, string> = {
  CONFIRMADA: "bg-success",
  PENDIENTE: "bg-warning",
  CANCELADA: "bg-destructive",
  SENTADA: "bg-muted-foreground/50",
  COMPLETADA: "bg-primary/60",
  NO_SHOW: "bg-destructive/60",
};

function SectionHeading({
  children,
  hint,
  icon: Icon,
}: {
  children: ReactNode;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {children}
      </h2>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PeriodToggle({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (p: DashboardPeriod) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-card p-1"
      role="group"
      aria-label="Periodo de análisis"
    >
      {PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
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

function KpiSkeleton() {
  return <Skeleton className="h-28 w-full" />;
}

export function DashboardContent() {
  const {
    period,
    setPeriod,
    loadingReservas,
    loadingPagos,
    loadingClientes,
    isErrorReservas,
    isErrorPagos,
    refetch,
    refetchReservas,
    isPartialReservas,
    reservasLimit,
    kpis,
    dailyTrend,
    estadoDistribution,
    peakHours,
    topClientes,
    insights,
    comparison,
    upcoming,
    activity,
    clientes,
  } = useDashboardStats();

  const clienteMap = Object.fromEntries(clientes.map((c) => [c.ID_Key, c]));
  const maxEstado = Math.max(...estadoDistribution.map((e) => e.count), 1);

  const trendLabel =
    comparison && comparison.reservasDelta !== 0
      ? `${comparison.reservasDelta > 0 ? "+" : ""}${comparison.reservasDelta}% ${comparison.label}`
      : undefined;

  const showFatalError = isErrorReservas && isErrorPagos;

  if (showFatalError) {
    return (
      <AppPageShell title="Panel">
        <EmptyState
          icon={XCircle}
          title="No se pudieron cargar los datos"
          description="Revisa tu conexión e intenta de nuevo."
          actionLabel="Reintentar"
          onAction={refetch}
        />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell
      title="Panel"
      description="Resumen de reservas, ingresos y actividad del local"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/reservas/calendario" className={buttonClass("outline", "sm")}>
            Calendario
          </Link>
          <Link href="/reservas?action=new" className={buttonClass("default", "sm")}>
            Nueva reserva
          </Link>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodToggle value={period} onChange={setPeriod} />
        <div className="flex flex-wrap items-center gap-2">
          {isPartialReservas && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Basado en las últimas {reservasLimit} reservas
            </span>
          )}
          {comparison && comparison.reservasDelta !== 0 && !loadingReservas && (
            <p
              className={cn(
                "flex items-center gap-1.5 text-sm",
                comparison.reservasDelta > 0 ? "text-success" : "text-destructive",
              )}
            >
              {comparison.reservasDelta > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">{trendLabel}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loadingReservas ? (
          <KpiSkeleton />
        ) : (
          <StatCard
            title="Reservas"
            value={kpis.reservas}
            description={`${kpis.confirmadas} confirmadas · ${kpis.pendientes} pendientes`}
            icon={CalendarDays}
            trend={trendLabel}
          />
        )}
        {loadingReservas ? (
          <KpiSkeleton />
        ) : (
          <StatCard
            title="Comensales"
            value={kpis.personas}
            description={`Promedio ~${kpis.paxPromedio} por mesa`}
            icon={Users}
          />
        )}
        {loadingPagos ? (
          <KpiSkeleton />
        ) : (
          <StatCard
            title="Ingresos"
            value={formatCurrency(kpis.ingresos)}
            description={
              kpis.ticketPromedio > 0
                ? `Ticket promedio ${formatCurrency(kpis.ticketPromedio)}`
                : "Sin pagos en el periodo"
            }
            icon={DollarSign}
          />
        )}
        {loadingReservas ? (
          <KpiSkeleton />
        ) : (
          <StatCard
            title="Ocupación estimada"
            value={`${kpis.ocupacionEstimada}%`}
            description={`${kpis.tasaConfirmacion}% confirmación · ${kpis.tasaCancelacion}% cancelación`}
            icon={UserCheck}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading hint="Reservas y comensales por día" icon={BarChart3}>
            Tendencia
          </SectionHeading>
          <AsyncSection
            loading={loadingReservas || loadingPagos}
            error={isErrorReservas || isErrorPagos}
            onRetry={refetch}
            skeletonClassName="h-72 w-full"
          >
            <Card>
              <CardContent className="h-72 pt-6">
                <DashboardTrendChart dailyTrend={dailyTrend} />
              </CardContent>
            </Card>
          </AsyncSection>
        </div>

        <div>
          <SectionHeading icon={CalendarDays}>Próximas reservas</SectionHeading>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {PERIOD_LABELS[period]}
              </CardTitle>
              <Link
                href="/reservas"
                className="text-xs font-medium text-primary hover:underline"
              >
                Ver todas
              </Link>
            </CardHeader>
            <CardContent>
              {loadingReservas ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">No hay reservas próximas.</p>
                  <Link
                    href="/reservas?action=new"
                    className={cn(buttonClass("outline", "sm"), "mt-4 inline-flex")}
                  >
                    Agendar reserva
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {upcoming.map((r) => (
                    <li key={r.ID_Key} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {getClienteNombre(clienteMap[r.ID_Cliente])}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(r.Fecha)} · {formatTime(r.Hora)} · {r.Cantidad_personas} pax
                        </p>
                      </div>
                      <EstadoReservaBadge estado={r.Estado} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <SectionHeading hint="Distribución en el periodo" icon={BarChart3}>
            Estados de reserva
          </SectionHeading>
          <Card>
            <CardContent className="space-y-4 pt-6">
              {loadingReservas ? (
                <Skeleton className="h-32 w-full" />
              ) : estadoDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no hay reservas en este rango.</p>
              ) : (
                estadoDistribution.map(({ estado, label, count }) => (
                  <div key={estado}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{label}</span>
                      <span className="tabular-nums text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          ESTADO_BAR_COLORS[estado] ?? "bg-primary/50",
                        )}
                        style={{ width: `${(count / maxEstado) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <SectionHeading hint="Horarios con más demanda" icon={Clock}>
            Horas pico
          </SectionHeading>
          <AsyncSection
            loading={loadingReservas}
            error={isErrorReservas}
            onRetry={() => void refetchReservas()}
            skeletonClassName="h-56 w-full"
          >
            <Card>
              <CardContent className="h-56 pt-6">
                <DashboardPeakHoursChart peakHours={peakHours} />
              </CardContent>
            </Card>
          </AsyncSection>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading icon={Activity}>Actividad reciente</SectionHeading>
          <Card>
            <CardContent className="pt-6">
              {loadingReservas ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin actividad registrada.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {activity.map((a) => (
                    <li key={a.id} className="py-3 text-sm first:pt-0 last:pb-0">
                      <span className="text-muted-foreground">{a.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <SectionHeading icon={Lightbulb}>Observaciones</SectionHeading>
          <Card className="h-full">
            <CardContent className="space-y-4 pt-6">
              {loadingReservas || loadingPagos ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : insights.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sigue registrando reservas para ver sugerencias útiles.
                </p>
              ) : (
                <ul className="space-y-3">
                  {insights.map((text) => (
                    <li key={text} className="text-sm leading-relaxed text-muted-foreground">
                      {text}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/manuales"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ver guías de uso
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <SectionHeading>Clientes frecuentes</SectionHeading>
        <Card>
          <CardContent className="pt-6">
            {loadingReservas || loadingClientes ? (
              <Skeleton className="h-24 w-full" />
            ) : topClientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Vincula clientes al crear reservas para ver quién repite.
              </p>
            ) : (
              <ul className="divide-y divide-border sm:grid sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
                {topClientes.map((c, i) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 py-3 sm:border-b sm:border-border sm:last:border-b-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.count} visita{c.count === 1 ? "" : "s"} en el periodo
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppPageShell>
  );
}
