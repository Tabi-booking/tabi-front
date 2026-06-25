import { api } from "@/shared/lib/api-client";
import { appendTenantQuery } from "@/shared/lib/tenant-query";
import type { Horario } from "@/modules/restaurant/types/restaurant";

export async function fetchHorarios(): Promise<Horario[]> {
  return api<Horario[]>(appendTenantQuery("/ConsultarHorarios"));
}

export async function ingresarHorario(payload: Omit<Horario, "ID_Key" | "resultado">): Promise<Horario> {
  return api<Horario>("/IngresarHorario", {
    method: "POST",
    body: JSON.stringify({ ...payload, ID_Key: "" }),
  });
}

export async function modificarHorario(id: string, payload: Horario): Promise<Horario> {
  return api<Horario>(`/ModificarHorario/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
