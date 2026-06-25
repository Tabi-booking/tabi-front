import { fetchPaginatedList } from "@/shared/lib/fetch-paginated-list";
import { api } from "@/shared/lib/api-client";
import type { PaginatedResponse } from "@/shared/types/api";
import type { Reserva, ReservaAlta, ReservaEstado } from "@/modules/reservas/types/reserva";
import { isLegacyFailure } from "@/shared/types/api";

export async function fetchReservas(
  limit = 50,
  offset = 0,
): Promise<PaginatedResponse<Reserva>> {
  return fetchPaginatedList<Reserva>(`/ConsultarReserva?limit=${limit}&offset=${offset}`);
}

export async function fetchReservaById(id: string): Promise<Reserva> {
  return api<Reserva>(`/ConsultarReservaId?ID_Key=${encodeURIComponent(id)}`);
}

export async function crearReserva(payload: ReservaAlta): Promise<Reserva> {
  const res = await api<Reserva>("/IngresarReserva", {
    method: "POST",
    body: JSON.stringify({ ...payload, ID_Key: "" }),
  });
  if (isLegacyFailure(res.resultado)) throw new Error(res.resultado);
  return res;
}

export async function modificarReserva(id: string, payload: Reserva): Promise<Reserva> {
  const res = await api<Reserva>(`/ModificarReserva/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, ID_Key: id }),
  });
  if (isLegacyFailure(res.resultado)) throw new Error(res.resultado);
  return res;
}

export async function cambiarEstadoReserva(id: string, estado: ReservaEstado): Promise<Reserva> {
  return api<Reserva>(`/Reserva/${encodeURIComponent(id)}/estado`, {
    method: "PUT",
    body: JSON.stringify({ Estado: estado }),
  });
}

export async function eliminarReserva(id: string, payload: Reserva): Promise<void> {
  await api(`/EliminarReserva?ID_Key=${encodeURIComponent(id)}`, {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}
