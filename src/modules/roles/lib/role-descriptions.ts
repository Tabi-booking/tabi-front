export const ROLE_DESCRIPTIONS: Record<string, string> = {
  Administrador: "Acceso completo: empleados, reservas, pedidos, menú, pagos y configuración.",
  Mesero: "Reservas, pedidos, clientes y consulta del menú.",
  Cocinero: "Gestión de pedidos y consulta del menú.",
  Cajero: "Pedidos, pagos, clientes y lectura de reservas.",
};

export function getRoleDescription(roleName: string | undefined): string | null {
  if (!roleName) return null;
  return ROLE_DESCRIPTIONS[roleName] ?? null;
}
