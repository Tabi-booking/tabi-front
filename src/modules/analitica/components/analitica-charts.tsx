"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ESTADO_BAR_COLORS,
  ESTADO_CHART_COLORS,
} from "@/modules/analitica/lib/analitica-ui";
import type { buildDailyTrend } from "@/modules/dashboard/lib/dashboard-analytics";
import { cn, formatCurrency } from "@/shared/lib/utils";

type DailyTrendPoint = ReturnType<typeof buildDailyTrend>[number];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string; payload?: { personas?: number } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="text-muted-foreground">
          {entry.name}:{" "}
          <span className="font-semibold text-foreground">
            {entry.name === "Ingresos" ? formatCurrency(entry.value) : entry.value}
          </span>
        </p>
      ))}
      {payload[0]?.payload?.personas != null && payload[0].payload.personas > 0 && (
        <p className="mt-0.5 text-muted-foreground">
          Comensales:{" "}
          <span className="font-semibold text-foreground">{payload[0].payload.personas}</span>
        </p>
      )}
    </div>
  );
}

interface AnaliticaDailyTrendChartProps {
  dailyTrend: DailyTrendPoint[];
  canReadReservations: boolean;
  canReadPayments: boolean;
  trendIsEmpty: boolean;
}

export function AnaliticaDailyTrendChart({
  dailyTrend,
  canReadReservations,
  canReadPayments,
  trendIsEmpty,
}: AnaliticaDailyTrendChartProps) {
  if (trendIsEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-foreground">Sin actividad en este periodo</p>
        <p className="text-xs text-muted-foreground">Prueba otro rango o crea una reserva.</p>
        {canReadReservations && (
          <Link href="/reservas" className="mt-2 text-sm font-medium text-primary hover:underline">
            Ver reservas
          </Link>
        )}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={dailyTrend}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
        {canReadReservations && (
          <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        )}
        {canReadPayments && (
          <YAxis
            yAxisId="right"
            orientation="right"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
        )}
        <Tooltip content={<ChartTooltip />} />
        {canReadReservations && (
          <Bar
            yAxisId="left"
            dataKey="reservas"
            name="Reservas"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            opacity={0.85}
          />
        )}
        {canReadPayments && (
          <Line
            yAxisId={canReadReservations ? "right" : "left"}
            type="monotone"
            dataKey="ingresos"
            name="Ingresos"
            stroke="var(--tabi-navy)"
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

interface AnaliticaEstadoChartsProps {
  estadoDistribution: { estado: string; label: string; count: number }[];
}

export function AnaliticaEstadoCharts({ estadoDistribution }: AnaliticaEstadoChartsProps) {
  if (estadoDistribution.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin datos de estados.</p>;
  }

  const maxEstado = Math.max(...estadoDistribution.map((e) => e.count), 1);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={estadoDistribution}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
            >
              {estadoDistribution.map((entry) => (
                <Cell
                  key={entry.estado}
                  fill={ESTADO_CHART_COLORS[entry.estado] ?? "#94a3b8"}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {estadoDistribution.map(({ estado, label, count }) => (
          <div key={estado}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{label}</span>
              <span className="text-muted-foreground">{count}</span>
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
        ))}
      </div>
    </div>
  );
}

interface AnaliticaPeakHoursChartProps {
  peakHours: { hour: string; count: number }[];
}

export function AnaliticaPeakHoursChart({ peakHours }: AnaliticaPeakHoursChartProps) {
  if (peakHours.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin horarios registrados.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={peakHours}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="hour" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="count" name="Reservas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
