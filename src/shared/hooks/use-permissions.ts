"use client";

import {
  can,
  canAccessAnalytics,
  canAny,
  canReadClients,
  canReadOrders,
  canReadPayments,
  canReadReservations,
  canReadRestaurant,
  canReadUsers,
  canWriteClients,
  canWriteOrders,
  canWritePayments,
  canWriteReservations,
  canWriteRestaurant,
  canWriteUsers,
  getPermissions,
  isTeamAdmin,
} from "@/shared/lib/auth/permissions";
import { canAccessPath, showNewReservaFab } from "@/shared/lib/auth/nav-access";
import { useAuth } from "@/shared/providers/auth-provider";

export function usePermissions() {
  const { session } = useAuth();
  const permissions = getPermissions(session);

  return {
    session,
    permissions,
    isAdmin: isTeamAdmin(session),
    can: (permission: string) => can(session, permission),
    canAny: (perms: string[]) => canAny(session, perms),
    hasPermission: (permission: string) => can(session, permission),
    canAccessPath: (path: string) => canAccessPath(session, path),
    canReadReservations: canReadReservations(session),
    canWriteReservations: canWriteReservations(session),
    canReadClients: canReadClients(session),
    canWriteClients: canWriteClients(session),
    canReadRestaurant: canReadRestaurant(session),
    canWriteRestaurant: canWriteRestaurant(session),
    canReadOrders: canReadOrders(session),
    canWriteOrders: canWriteOrders(session),
    canReadPayments: canReadPayments(session),
    canWritePayments: canWritePayments(session),
    canReadUsers: canReadUsers(session),
    canWriteUsers: canWriteUsers(session),
    canAccessAnalytics: canAccessAnalytics(session),
    showNewReservaFab: showNewReservaFab(session),
  };
}

export function usePermission(permission: string): boolean {
  const { session } = useAuth();
  return can(session, permission);
}
