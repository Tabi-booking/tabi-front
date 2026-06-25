import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const ESTADO_CHART_COLORS: Record<string, string> = {
  CONFIRMADA: "#16a34a",
  PENDIENTE: "#d97706",
  CANCELADA: "#dc2626",
  SENTADA: "#64748b",
  COMPLETADA: "#f55e57",
  NO_SHOW: "#b91c1c",
};

export const ESTADO_BAR_COLORS: Record<string, string> = {
  CONFIRMADA: "bg-success",
  PENDIENTE: "bg-warning",
  CANCELADA: "bg-destructive",
  SENTADA: "bg-secondary",
  COMPLETADA: "bg-primary/60",
  NO_SHOW: "bg-destructive/70",
};

export function SectionHeading({
  title,
  hint,
  icon: Icon,
}: {
  title: string;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {title}
      </h2>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function DeltaBadge({
  delta,
  label,
  positiveIsGood = true,
}: {
  delta: number;
  label: string;
  positiveIsGood?: boolean;
}) {
  const isPositive = delta > 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        isGood ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
      )}
    >
      {isPositive ? "+" : ""}
      {delta}% {label}
    </span>
  );
}
