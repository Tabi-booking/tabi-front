import { fetchList } from "@/shared/lib/fetch-paginated-list";
import type { Pago } from "@/modules/dashboard/types/pago";

export async function fetchPagos(): Promise<Pago[]> {
  return fetchList<Pago>("/ConsultarPagos");
}
