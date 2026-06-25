import { fetchList } from "@/shared/lib/fetch-paginated-list";
import { api } from "@/shared/lib/api-client";
import type { Cliente } from "@/modules/clientes/types/cliente";
import { isLegacyFailure } from "@/shared/types/api";

export async function fetchClientes(): Promise<Cliente[]> {
  return fetchList<Cliente>("/ConsultarCliente");
}

export async function fetchClienteById(id: string): Promise<Cliente> {
  return api<Cliente>(`/ConsultarClienteId?ID_Key=${encodeURIComponent(id)}`);
}

export async function fetchClienteByDocumento(numero: string): Promise<Cliente[]> {
  const data = await api<Cliente | Cliente[]>(
    `/ConsultarClientePorNumeroDocumento?Numero_Documento=${encodeURIComponent(numero)}`,
  );
  return Array.isArray(data) ? data : [data];
}

export async function crearCliente(payload: Omit<Cliente, "ID_Key" | "resultado">): Promise<Cliente> {
  const res = await api<Cliente>("/IngresarCliente", {
    method: "POST",
    body: JSON.stringify({ ...payload, ID_Key: "", Contrasena: payload.Contrasena ?? "" }),
  });
  if (isLegacyFailure(res.resultado)) throw new Error(res.resultado);
  return res;
}

export async function modificarCliente(id: string, payload: Cliente): Promise<Cliente> {
  const res = await api<Cliente>(`/ModificarCliente?ID_Key=${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, ID_Key: id }),
  });
  if (isLegacyFailure(res.resultado)) throw new Error(res.resultado);
  return res;
}

export async function eliminarCliente(id: string, payload: Cliente): Promise<void> {
  await api(`/EliminarCliente?ID_Key=${encodeURIComponent(id)}`, {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}

export function getClienteNombre(cliente: Cliente | undefined): string {
  if (!cliente) return "—";
  return `${cliente.Nombre} ${cliente.Apellido}`.trim();
}
