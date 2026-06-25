import { fetchList } from "@/shared/lib/fetch-paginated-list";
import { api } from "@/shared/lib/api-client";
import type { Rol } from "@/modules/roles/types/rol";
import { isLegacyFailure } from "@/shared/types/api";

export async function fetchRoles(): Promise<Rol[]> {
  return fetchList<Rol>("/ConsultarRol");
}

export async function fetchRolById(id: string): Promise<Rol> {
  return api<Rol>(`/ConsultarRolId?ID_Key=${encodeURIComponent(id)}`);
}

export async function crearRol(payload: Pick<Rol, "Nombre">): Promise<Rol> {
  const res = await api<Rol>("/IngresarRol", {
    method: "POST",
    body: JSON.stringify({ ID_Key: "", Nombre: payload.Nombre }),
  });
  if (isLegacyFailure(res.resultado)) throw new Error(res.resultado);
  return res;
}

export async function modificarRol(id: string, payload: Rol): Promise<Rol> {
  const res = await api<Rol>(`/ModificarRol?ID_Key=${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, ID_Key: id }),
  });
  if (isLegacyFailure(res.resultado)) throw new Error(res.resultado);
  return res;
}

export async function eliminarRol(id: string, payload: Rol): Promise<void> {
  await api(`/EliminarRol?ID_Key=${encodeURIComponent(id)}`, {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}
