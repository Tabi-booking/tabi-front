/**
 * Centralized React Query keys.
 *
 * Future API contracts (backend):
 * - GET /dashboard/summary?period=7d
 * - GET /reservas?from=&to=&limit=
 * - GET /analytics?period=30d
 */

export type ReservasScope = "operational" | "dashboard" | "analytics";

export const RESERVAS_LIMITS: Record<ReservasScope, number> = {
  operational: 100,
  dashboard: 200,
  analytics: 500,
};

export const queryKeys = {
  reservas: (params: { limit: number; offset?: number }) =>
    ["reservas", params] as const,
  reservasAll: ["reservas"] as const,
  clientes: ["clientes"] as const,
  pagos: ["pagos"] as const,
  restaurantMe: ["restaurant", "me"] as const,
  miRestaurante: ["mi-restaurante"] as const,
  horarios: ["horarios"] as const,
  departamentos: ["departamentos"] as const,
  ciudades: (deptId: string) => ["ciudades", deptId] as const,
  ubicaciones: ["ubicaciones"] as const,
  categorias: ["categorias"] as const,
  etiquetas: ["etiquetas"] as const,
  usuarios: ["usuarios"] as const,
  roles: ["roles"] as const,
  rolesPermissionsMatrix: ["roles-permissions-matrix"] as const,
  myProfile: ["my-profile"] as const,
  myUsuario: (userId: string) => ["my-usuario", userId] as const,
};
