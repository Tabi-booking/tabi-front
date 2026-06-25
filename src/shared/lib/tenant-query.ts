import { getRestaurantId, getSessionKind } from "@/shared/lib/auth/session";

export function appendTenantQuery(path: string): string {
  const kind = getSessionKind();
  const restaurantId = getRestaurantId();
  if (kind !== "super" || !restaurantId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}id_restaurante=${encodeURIComponent(restaurantId)}`;
}
