import { fetchList } from "@/shared/lib/fetch-paginated-list";
import { api } from "@/shared/lib/api-client";
import type { Usuario } from "@/modules/usuarios/types/usuario";
import { isLegacyFailure } from "@/shared/types/api";

export async function fetchUsuarios(): Promise<Usuario[]> {
  return fetchList<Usuario>("/ConsultarUsuario");
}

export async function fetchUsuarioById(id: string): Promise<Usuario> {
  return api<Usuario>(`/ConsultarUsuarioId?ID_Key=${encodeURIComponent(id)}`);
}

export async function crearUsuario(
  payload: Omit<Usuario, "ID_Key" | "resultado">,
): Promise<Usuario> {
  const res = await api<Usuario>("/IngresarUsuario", {
    method: "POST",
    body: JSON.stringify({ ...payload, ID_Key: "" }),
  });
  if (isLegacyFailure(res.resultado)) throw new Error(res.resultado);
  return res;
}

export async function modificarUsuario(id: string, payload: Usuario): Promise<Usuario> {
  const res = await api<Usuario>(`/ModificarUsuario?ID_Key=${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, ID_Key: id }),
  });
  if (isLegacyFailure(res.resultado)) throw new Error(res.resultado);
  return res;
}

export async function eliminarUsuario(id: string, payload: Usuario): Promise<void> {
  await api(`/EliminarUsuario?ID_Key=${encodeURIComponent(id)}`, {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}

export function getUsuarioNombre(usuario: Usuario | undefined): string {
  if (!usuario) return "—";
  return `${usuario.Nombre} ${usuario.Apellido}`.trim();
}
