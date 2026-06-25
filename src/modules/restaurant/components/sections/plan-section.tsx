import type { RestaurantMeResponse } from "@/modules/restaurant/types/restaurant-profile";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
};

const CYCLE_LABELS: Record<string, string> = {
  monthly: "Mensual",
  annual: "Anual",
};

interface PlanSectionProps {
  data: RestaurantMeResponse;
}

export function PlanSection({ data }: PlanSectionProps) {
  const { subscription, onboarding } = data;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plan</p>
        <p className="mt-1 text-lg font-semibold">
          {PLAN_LABELS[subscription.plan ?? ""] ?? subscription.plan ?? "—"}
        </p>
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Facturación</p>
        <p className="mt-1 text-lg font-semibold">
          {CYCLE_LABELS[subscription.ciclo_facturacion ?? ""] ?? subscription.ciclo_facturacion ?? "—"}
        </p>
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estado</p>
        <p className="mt-1 text-lg font-semibold capitalize">{subscription.estado ?? "—"}</p>
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Onboarding</p>
        <p className="mt-1 text-lg font-semibold capitalize">
          {onboarding.estado ?? "—"}
          {onboarding.pct != null && ` (${onboarding.pct}%)`}
        </p>
      </div>
    </div>
  );
}
