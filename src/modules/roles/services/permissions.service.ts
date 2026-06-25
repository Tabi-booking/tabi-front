import { apiPublic } from "@/shared/lib/api-client";
import type { RolesPermissionMatrix } from "@/modules/roles/types/permissions";

export async function fetchRolesPermissionsMatrix(): Promise<RolesPermissionMatrix> {
  return apiPublic<RolesPermissionMatrix>("/auth/roles/permissions");
}
