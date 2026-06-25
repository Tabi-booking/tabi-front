import { fetchList } from "@/shared/lib/fetch-paginated-list";
import { api } from "@/shared/lib/api-client";

export interface Departamento {
  ID_Key: string;
  Nombre: string;
  Codigo_iso: string;
  Activo: boolean;
}

export interface Ciudad {
  ID_Key: string;
  ID_Departamento: string;
  Nombre: string;
}

export interface Ubicacion {
  ID_Key: string;
  Pais: string;
  Departamento: string;
  Ciudad: string;
  Barrio: string;
  ID_Ciudad: string;
}

export async function fetchDepartamentos(): Promise<Departamento[]> {
  return fetchList<Departamento>("/ConsultarDepartamentos");
}

export async function fetchCiudades(idDepartamento: string): Promise<Ciudad[]> {
  return fetchList<Ciudad>(`/ConsultarCiudadPorDepartamento?ID_Departamento=${encodeURIComponent(idDepartamento)}`);
}

export async function fetchUbicaciones(): Promise<Ubicacion[]> {
  return fetchList<Ubicacion>("/ConsultarUbicacion");
}

export async function ingresarUbicacion(payload: Omit<Ubicacion, "ID_Key">): Promise<Ubicacion> {
  return api<Ubicacion>("/IngresarUbicacion", {
    method: "POST",
    body: JSON.stringify({ ...payload, ID_Key: "" }),
  });
}
