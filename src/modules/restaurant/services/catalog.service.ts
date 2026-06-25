import { fetchList } from "@/shared/lib/fetch-paginated-list";
import type { Categoria, Etiqueta } from "@/modules/restaurant/types/catalog";

export async function fetchCategorias(): Promise<Categoria[]> {
  return fetchList<Categoria>("/ConsultarCategorias");
}

export async function fetchEtiquetas(): Promise<Etiqueta[]> {
  return fetchList<Etiqueta>("/ConsultarEtiquetas");
}
