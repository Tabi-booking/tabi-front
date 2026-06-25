const PERMISSION_LABELS: Record<string, string> = {
  "clients.read": "Ver clientes",
  "clients.write": "Gestionar clientes",
  "menu.read": "Ver menú",
  "menu.write": "Gestionar menú",
  "orders.read": "Ver pedidos",
  "orders.write": "Gestionar pedidos",
  "payments.read": "Ver pagos",
  "payments.write": "Gestionar pagos",
  "reservations.read": "Ver reservas",
  "reservations.write": "Gestionar reservas",
  "restaurant.read": "Ver restaurante",
  "restaurant.write": "Editar restaurante",
  "restaurant.submit_onboarding": "Enviar onboarding",
  "reviews.read": "Ver reseñas",
  "schedules.read": "Ver horarios",
  "schedules.write": "Gestionar horarios",
  "uploads.write": "Subir archivos",
  "users.read": "Ver usuarios",
  "users.write": "Gestionar usuarios",
};

const PERMISSION_GROUPS: Record<string, string> = {
  clients: "Clientes",
  menu: "Menú",
  orders: "Pedidos",
  payments: "Pagos",
  reservations: "Reservas",
  restaurant: "Restaurante",
  reviews: "Reseñas",
  schedules: "Horarios",
  uploads: "Archivos",
  users: "Usuarios",
};

export function getPermissionLabel(permission: string): string {
  return PERMISSION_LABELS[permission] ?? permission;
}

export function getPermissionGroup(permission: string): string {
  const [group] = permission.split(".");
  return PERMISSION_GROUPS[group] ?? group;
}

export function collectUniquePermissions(matrix: Record<string, string[]>): string[] {
  const set = new Set<string>();
  for (const permissions of Object.values(matrix)) {
    for (const permission of permissions) {
      set.add(permission);
    }
  }
  return Array.from(set).sort((a, b) => {
    const groupDiff = getPermissionGroup(a).localeCompare(getPermissionGroup(b), "es");
    if (groupDiff !== 0) return groupDiff;
    return a.localeCompare(b, "es");
  });
}
