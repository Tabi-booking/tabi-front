import type { ReservaEstado } from "@/modules/reservas/types/reserva";

export const ESTADO_CONFIG: Record<
  string,
  { label: string; variant: "warning" | "success" | "destructive" | "secondary" | "outline" }
> = {
  PENDIENTE: { label: "Pendiente", variant: "warning" },
  CONFIRMADA: { label: "Confirmada", variant: "success" },
  CANCELADA: { label: "Cancelada", variant: "destructive" },
  SENTADA: { label: "Sentada", variant: "secondary" },
  COMPLETADA: { label: "Completada", variant: "outline" },
  NO_SHOW: { label: "No show", variant: "destructive" },
};

export function getEstadoConfig(estado: ReservaEstado | null | undefined) {
  const key = (estado ?? "PENDIENTE").toUpperCase();
  return ESTADO_CONFIG[key] ?? { label: key, variant: "outline" as const };
}

export const ESTADOS_OPCIONES = ["PENDIENTE", "CONFIRMADA", "CANCELADA"] as const;
