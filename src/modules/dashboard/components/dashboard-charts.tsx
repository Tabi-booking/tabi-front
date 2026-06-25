"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { buildDailyTrend } from "@/modules/dashboard/lib/dashboard-analytics";

type DailyTrendPoint = ReturnType<typeof buildDailyTrend>[number];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-muted-foreground">
          {entry.name}:{" "}
          <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

interface DashboardTrendChartProps {
  dailyTrend: DailyTrendPoint[];
}

export function DashboardTrendChart({ dailyTrend }: DashboardTrendChartProps) {
  if (dailyTrend.every((d) => d.reservas === 0)) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Sin movimiento en este periodo.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dailyTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="reservas"
          name="Reservas"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--primary)" }}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="personas"
          name="Comensales"
          stroke="var(--muted-foreground)"
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="4 3"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface DashboardPeakHoursChartProps {
  peakHours: { hour: string; count: number }[];
}

export function DashboardPeakHoursChart({ peakHours }: DashboardPeakHoursChartProps) {
  if (peakHours.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin horarios registrados aún.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={peakHours} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Bar
          dataKey="count"
          name="Reservas"
          fill="var(--primary)"
          radius={[4, 4, 0, 0]}
          opacity={0.85}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
