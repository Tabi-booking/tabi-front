import type { Rol } from "@/modules/roles/types/rol";

export const PROPIETARIO_ROLE_NAME = "Propietario";

/** Roles que no se pueden asignar al crear/editar empleados (salvo conservar el actual). */
export function filterAssignableRoles(
  roles: Rol[],
  currentRoleId?: string | null,
): Rol[] {
  return roles.filter((rol) => {
    if (rol.Nombre !== PROPIETARIO_ROLE_NAME) return true;
    return Boolean(currentRoleId && rol.ID_Key === currentRoleId);
  });
}

export function isPropietarioRole(rol: Rol | undefined): boolean {
  return rol?.Nombre === PROPIETARIO_ROLE_NAME;
}
