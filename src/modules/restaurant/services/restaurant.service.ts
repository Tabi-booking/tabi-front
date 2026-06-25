/** @deprecated Prefer fetchRestaurantMe / patchRestaurantMe from restaurant-profile.service */
import { api } from "@/shared/lib/api-client";
import type { MiRestauranteResponse, Restaurante } from "@/modules/restaurant/types/restaurant";

export async function fetchMiRestaurante(): Promise<MiRestauranteResponse> {
  return api<MiRestauranteResponse>("/restaurantes/mi");
}

export async function modificarRestaurante(
  id: string,
  payload: Partial<Restaurante>,
): Promise<Restaurante> {
  return api<Restaurante>(`/ModificarRestaurante?ID_Key=${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, ID_Key: id }),
  });
}
