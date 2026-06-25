import { api, apiPublic } from "@/shared/lib/api-client";
import type {
  AuthMeResponse,
  AuthSession,
  LoginPayload,
  LoginResponse,
  RegistroRestaurantePayload,
} from "@/shared/types/auth";

export async function fetchAuthMe(): Promise<AuthMeResponse> {
  return api<AuthMeResponse>("/auth/me");
}

export function mergeAuthProfile(session: AuthSession, profile: AuthMeResponse): AuthSession {
  return {
    ...session,
    kind: profile.kind,
    restaurant_id: profile.restaurant_id,
    user_id: profile.user_id,
    email: profile.email,
    nombre: profile.nombre,
    apellido: profile.apellido,
    rol: profile.rol,
    permissions: profile.permissions ?? [],
    is_admin: profile.is_admin,
  };
}

export async function enrichSession(session: LoginResponse): Promise<AuthSession> {
  try {
    const profile = await api<AuthMeResponse>("/auth/me", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    return mergeAuthProfile(session, profile);
  } catch {
    return session;
  }
}

export async function refreshSessionProfile(stored: AuthSession): Promise<AuthSession> {
  const profile = await fetchAuthMe();
  return mergeAuthProfile(stored, profile);
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiPublic<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface RegistroRestauranteResponse {
  restaurante: Record<string, unknown>;
  empleado: Record<string, unknown> | null;
}

export async function registroRestaurante(
  payload: RegistroRestaurantePayload,
): Promise<RegistroRestauranteResponse> {
  return apiPublic<RegistroRestauranteResponse>("/auth/registro/restaurante", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
