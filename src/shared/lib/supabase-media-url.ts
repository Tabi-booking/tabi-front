const STORAGE_PUBLIC_PREFIX = "/storage/v1/object/public/";

function getSupabaseBaseUrl(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return null;
}

function getStorageBucket(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "restaurants";
}

function buildPublicObjectUrl(baseUrl: string, objectPath: string): string {
  const normalized = objectPath.replace(/^\/+/, "");
  return `${baseUrl}${STORAGE_PUBLIC_PREFIX}${normalized}`;
}

/**
 * Normalizes Supabase Storage URLs returned by the API.
 * The backend may omit `/storage/v1/object/public/` and serve paths like
 * `https://<project>.supabase.co/restaurants/24/logo/file.png`.
 */
export function resolveSupabaseMediaUrl(urlOrKey?: string | null): string | null {
  const trimmed = urlOrKey?.trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith("http")) {
    const baseUrl = getSupabaseBaseUrl();
    if (!baseUrl) return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

    const bucket = getStorageBucket();
    const key = trimmed.replace(/^\/+/, "");
    const objectPath = key.startsWith(`${bucket}/`) ? key : `${bucket}/${key}`;
    return buildPublicObjectUrl(baseUrl, objectPath);
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname.endsWith(".supabase.co")) {
      return trimmed;
    }

    if (parsed.pathname.includes("/storage/v1/object/")) {
      return trimmed;
    }

    const objectPath = parsed.pathname.replace(/^\/+/, "");
    if (!objectPath) return trimmed;

    return buildPublicObjectUrl(parsed.origin, objectPath);
  } catch {
    return trimmed;
  }
}
