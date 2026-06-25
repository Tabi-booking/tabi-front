import type { RestaurantMeResponse } from "@/modules/restaurant/types/restaurant-profile";

function formatHour(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.length >= 5 ? trimmed.slice(0, 5) : trimmed;
}

export function getRestaurantHoursLabel(data: RestaurantMeResponse): string | null {
  const resumen = data.operations.horarios_resumen?.trim();
  if (resumen) return resumen;

  const schedule = data.operations.horarios?.find((h) => h.activo !== false) ?? data.operations.horarios?.[0];
  const open = formatHour(schedule?.hora_apertura);
  const close = formatHour(schedule?.hora_cierre);

  if (open && close) return `${open} – ${close}`;
  if (open) return `Desde ${open}`;
  if (close) return `Hasta ${close}`;

  return null;
}
