import { Badge } from "@/shared/components/native/badge";
import { getEstadoConfig } from "@/modules/reservas/lib/reserva-estado-ui";
import type { ReservaEstado } from "@/modules/reservas/types/reserva";

export function EstadoReservaBadge({ estado }: { estado: ReservaEstado | null | undefined }) {
  const config = getEstadoConfig(estado);
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
