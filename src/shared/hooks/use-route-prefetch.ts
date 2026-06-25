"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchClientes } from "@/modules/clientes/services/cliente.service";
import { fetchPagos } from "@/modules/dashboard/services/pago.service";
import { fetchReservas } from "@/modules/reservas/services/reserva.service";
import { queryKeys, RESERVAS_LIMITS } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";

export function useRoutePrefetch() {
  const queryClient = useQueryClient();

  const prefetchClientes = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.clientes,
      queryFn: fetchClientes,
      staleTime: STALE.catalog,
    });
  }, [queryClient]);

  const prefetchPagos = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.pagos,
      queryFn: fetchPagos,
      staleTime: STALE.analytics,
    });
  }, [queryClient]);

  const prefetchReservasOperational = useCallback(() => {
    const limit = RESERVAS_LIMITS.operational;
    void queryClient.prefetchQuery({
      queryKey: queryKeys.reservas({ limit, offset: 0 }),
      queryFn: () => fetchReservas(limit, 0),
      staleTime: STALE.operational,
    });
  }, [queryClient]);

  const prefetchDashboard = useCallback(() => {
    prefetchClientes();
    prefetchPagos();
    prefetchReservasOperational();
  }, [prefetchClientes, prefetchPagos, prefetchReservasOperational]);

  const prefetchReservas = useCallback(() => {
    prefetchReservasOperational();
    prefetchClientes();
  }, [prefetchReservasOperational, prefetchClientes]);

  const prefetchForHref = useCallback(
    (href: string) => {
      if (href === "/dashboard") {
        prefetchDashboard();
        return;
      }
      if (href.startsWith("/reservas")) {
        prefetchReservas();
        return;
      }
      if (href.startsWith("/clientes")) {
        prefetchClientes();
      }
    },
    [prefetchDashboard, prefetchReservas, prefetchClientes],
  );

  return { prefetchForHref, prefetchDashboard, prefetchReservas, prefetchClientes, prefetchPagos };
}
