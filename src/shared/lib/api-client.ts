import { clearSession, getAccessToken } from "@/shared/lib/auth/session";
import { getApiV1Url } from "@/shared/lib/api-url";
import type { ApiErrorBody } from "@/shared/types/api";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function formatApiErrorMessage(status: number, body: ApiErrorBody | null): string {
  if (typeof body?.detail === "string") {
    if (status === 403) {
      if (body.detail.startsWith("Permiso requerido:")) {
        const permission = body.detail.replace("Permiso requerido:", "").trim();
        return `Acción no permitida para tu rol (${permission})`;
      }
      return body.detail;
    }
    return body.detail;
  }

  if (Array.isArray(body?.detail)) {
    return body.detail.map((e) => e.msg).join(", ");
  }

  return `Error ${status}`;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  clearSession();
  const path = window.location.pathname;
  if (!path.startsWith("/login") && !path.startsWith("/registro")) {
    window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  { skipAuth = false }: { skipAuth?: boolean } = {},
): Promise<T> {
  const token = skipAuth ? null : getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${getApiV1Url()}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !skipAuth) {
    redirectToLogin();
    throw new ApiError("Sesión expirada", 401);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const body = data as ApiErrorBody | null;
    const message = formatApiErrorMessage(res.status, body);
    throw new ApiError(message, res.status, body);
  }

  return data as T;
}

export async function apiPublic<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return api<T>(path, options, { skipAuth: true });
}
