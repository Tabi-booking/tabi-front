import { api, ApiError } from "@/shared/lib/api-client";
import {
  mapLegacyRestaurantToProfile,
  mergeUploadResult,
  normalizeRestaurantProfile,
} from "@/modules/restaurant/lib/restaurant-profile-mapper";
import type { MiRestauranteResponse } from "@/modules/restaurant/types/restaurant";
import type {
  ConfirmUploadResponse,
  RestaurantMePatch,
  RestaurantMeResponse,
} from "@/modules/restaurant/types/restaurant-profile";

const RESTAURANT_ME_PATH = "/restaurants/me";
const LEGACY_ME_PATH = "/restaurantes/mi";

async function fetchLegacyRestaurantMe(): Promise<RestaurantMeResponse> {
  const legacy = await api<MiRestauranteResponse>(LEGACY_ME_PATH);
  return normalizeRestaurantProfile(mapLegacyRestaurantToProfile(legacy));
}

function hasMediaFromApi(media: RestaurantMeResponse["media"]): boolean {
  return (
    Boolean(media.logo_url?.trim()) ||
    (media.covers ?? []).some((cover) => cover.url?.trim()) ||
    (media.documents ?? []).some((doc) => doc.url?.trim() || doc.storage_key?.trim())
  );
}

async function enrichMediaFromLegacy(normalized: RestaurantMeResponse): Promise<RestaurantMeResponse> {
  if (hasMediaFromApi(normalized.media)) {
    return normalized;
  }

  try {
    return await fetchLegacyRestaurantMe();
  } catch {
    return normalized;
  }
}

export function applyUploadToRestaurantProfile(
  profile: RestaurantMeResponse,
  upload: ConfirmUploadResponse,
): RestaurantMeResponse {
  return mergeUploadResult(profile, upload);
}

export async function fetchRestaurantMe(): Promise<RestaurantMeResponse> {
  try {
    const data = await api<RestaurantMeResponse>(RESTAURANT_ME_PATH);
    const normalized = normalizeRestaurantProfile(data);
    return enrichMediaFromLegacy(normalized);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
      return fetchLegacyRestaurantMe();
    }
    throw err;
  }
}

export async function patchRestaurantMe(body: RestaurantMePatch): Promise<RestaurantMeResponse> {
  try {
    const data = await api<RestaurantMeResponse>(RESTAURANT_ME_PATH, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return normalizeRestaurantProfile(data);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
      throw new ApiError(
        "La edición no está disponible. Verifica que el backend exponga PUT /restaurants/me.",
        err.status,
      );
    }
    throw err;
  }
}

export function getRestaurantDisplayName(data: RestaurantMeResponse | undefined): string {
  return data?.profile?.nombre?.trim() || "Mi restaurante";
}
