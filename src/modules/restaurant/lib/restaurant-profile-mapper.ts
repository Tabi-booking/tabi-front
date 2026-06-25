import type { MiRestauranteResponse } from "@/modules/restaurant/types/restaurant";
import type {
  ConfirmUploadResponse,
  RestaurantMeResponse,
} from "@/modules/restaurant/types/restaurant-profile";
import { resolveSupabaseMediaUrl } from "@/shared/lib/supabase-media-url";

function pickMediaUrl(...candidates: (string | null | undefined)[]): string | null {
  for (const c of candidates) {
    const resolved = resolveSupabaseMediaUrl(c);
    if (resolved) return resolved;
  }
  return null;
}

export function mapLegacyRestaurantToProfile(legacy: MiRestauranteResponse): RestaurantMeResponse {
  const r = legacy.restaurante;
  const logo = pickMediaUrl(r.Imagen_destacada);

  return {
    id: r.ID_Key,
    profile: {
      nombre: r.Nombre ?? "Mi restaurante",
      descripcion: null,
      sitio_web: null,
      redes_sociales: {},
      restaurant_type: null,
    },
    location: {
      direccion: r.Direccion ?? null,
      google_maps: r.Google_maps ?? null,
    },
    contact: {
      telefono: r.Telefono ?? null,
    },
    operations: {
      horarios_resumen: r.Horarios ?? null,
      horarios: legacy.horarios?.map((h) => ({
        id: h.ID_Key,
        dia_semana: h.Dia_semana,
        hora_apertura: h.Hora_apertura,
        hora_cierre: h.Hora_cierre,
        activo: h.Activo,
      })),
    },
    features: {},
    media: {
      logo_url: logo,
      covers: logo ? [{ id: "legacy-cover", url: logo, orden: 0 }] : [],
      documents: [],
    },
    subscription: {},
    onboarding: { estado: "submitted" },
    meta: {
      calificacion_promedio: legacy.calificacion_promedio,
      calificacion_cantidad: legacy.calificacion_cantidad,
      activo: true,
      id_acceso: r.id_acceso,
    },
  };
}

export function normalizeRestaurantProfile(data: RestaurantMeResponse): RestaurantMeResponse {
  const media = data.media ?? {};
  const logo = pickMediaUrl(media.logo_url);
  const covers = (media.covers ?? [])
    .map((cover) => ({
      ...cover,
      url: pickMediaUrl(cover.url, cover.storage_key) ?? cover.url,
    }))
    .filter((cover) => cover.url?.trim());

  const coverUrls = new Set(covers.map((cover) => cover.url));
  if (logo && !coverUrls.has(logo)) {
    covers.unshift({ id: "logo-cover", url: logo, orden: -1 });
  }

  const documents = (media.documents ?? [])
    .map((doc) => ({
      ...doc,
      url: pickMediaUrl(doc.url, doc.storage_key) ?? doc.url,
    }))
    .filter((doc) => doc.url?.trim() || doc.storage_key?.trim());

  return {
    ...data,
    media: {
      ...media,
      logo_url: logo,
      covers,
      documents,
    },
  };
}

export function mergeUploadResult(
  profile: RestaurantMeResponse,
  upload: ConfirmUploadResponse,
): RestaurantMeResponse {
  const url = resolveSupabaseMediaUrl(upload.public_url) ?? upload.public_url;

  if (upload.document_type === "logo") {
    return normalizeRestaurantProfile({
      ...profile,
      media: {
        ...profile.media,
        logo_url: url,
      },
    });
  }

  if (upload.document_type === "cover") {
    const covers = profile.media.covers ?? [];
    const alreadyExists = covers.some(
      (cover) => cover.storage_key === upload.storage_key || cover.url === url,
    );
    if (alreadyExists) {
      return normalizeRestaurantProfile(profile);
    }

    return normalizeRestaurantProfile({
      ...profile,
      media: {
        ...profile.media,
        covers: [
          ...covers,
          {
            id: upload.storage_key,
            url,
            storage_key: upload.storage_key,
            orden: covers.length,
          },
        ],
      },
    });
  }

  return profile;
}
