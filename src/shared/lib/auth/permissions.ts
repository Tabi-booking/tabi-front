import type { AuthSession, SessionKind } from "@/shared/types/auth";

export function getPermissions(session: AuthSession | null): string[] {
  return session?.permissions ?? [];
}

/** Comprueba un permiso explícito. `permissions` es la fuente de verdad. */
export function can(session: AuthSession | null, permission: string): boolean {
  if (!session) return false;
  if (session.kind === "super") return true;
  return session.permissions?.includes(permission) ?? false;
}

export function canAny(session: AuthSession | null, permissions: string[]): boolean {
  if (!session) return false;
  if (session.kind === "super") return true;
  return permissions.some((p) => session.permissions?.includes(p));
}

export function hasPermission(session: AuthSession | null, permission: string): boolean {
  return can(session, permission);
}

/** Propietario o Administrador — atajo para secciones de equipo/configuración. */
export function isTeamAdmin(session: AuthSession | null): boolean {
  if (!session) return false;
  if (session.kind === "super") return true;
  return session.is_admin === true;
}

export function canReadReservations(session: AuthSession | null): boolean {
  return can(session, "reservations.read");
}

export function canWriteReservations(session: AuthSession | null): boolean {
  return can(session, "reservations.write");
}

export function canReadClients(session: AuthSession | null): boolean {
  return can(session, "clients.read");
}

export function canWriteClients(session: AuthSession | null): boolean {
  return can(session, "clients.write");
}

export function canReadRestaurant(session: AuthSession | null): boolean {
  return can(session, "restaurant.read");
}

export function canWriteRestaurant(session: AuthSession | null): boolean {
  return can(session, "restaurant.write");
}

export function canReadOrders(session: AuthSession | null): boolean {
  return can(session, "orders.read");
}

export function canWriteOrders(session: AuthSession | null): boolean {
  return can(session, "orders.write");
}

export function canReadPayments(session: AuthSession | null): boolean {
  return can(session, "payments.read");
}

export function canWritePayments(session: AuthSession | null): boolean {
  return can(session, "payments.write");
}

export function canReadUsers(session: AuthSession | null): boolean {
  return can(session, "users.read") || isTeamAdmin(session);
}

export function canWriteUsers(session: AuthSession | null): boolean {
  return can(session, "users.write");
}

/** Analítica/reportes: al menos un permiso operativo de lectura. */
export function canAccessAnalytics(session: AuthSession | null): boolean {
  return canAny(session, ["reservations.read", "orders.read", "payments.read"]);
}

export function canWriteCatalog(kind: SessionKind | null): boolean {
  return kind === "super";
}

export function canAccessMiRestaurante(kind: SessionKind | null): boolean {
  return kind === "user";
}

export function canManageTenantResources(kind: SessionKind | null): boolean {
  return kind === "user" || kind === "super";
}
