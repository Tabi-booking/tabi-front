import type { AuthSession, SessionKind } from "@/shared/types/auth";

const SESSION_KEY = "tabi_session";

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getAccessToken(): string | null {
  return getSession()?.access_token ?? null;
}

export function getRestaurantId(): string | null {
  return getSession()?.restaurant_id ?? null;
}

export function getSessionKind(): SessionKind | null {
  return getSession()?.kind ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
