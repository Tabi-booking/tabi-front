import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClientes } from "@/modules/clientes/services/cliente.service";
import {
  filterPagosByPeriod,
  filterReservasByPeriod,
  type DashboardPeriod,
} from "@/modules/dashboard/lib/dashboard-analytics";
import { fetchPagos } from "@/modules/dashboard/services/pago.service";
import { useRestaurantProfile } from "@/modules/restaurant/hooks/use-restaurant-profile";
import { useReservasQuery } from "@/shared/hooks/use-reservas-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";

export function useReportesData() {
  const [period, setPeriod] = useState<DashboardPeriod>("7d");
  const [downloading, setDownloading] = useState<string | null>(null);

  const { restaurantName, isLoading: restaurantLoading, refetch: refetchRestaurant } =
    useRestaurantProfile();

  const reservasQuery = useReservasQuery({ scope: "analytics" });

  const pagosQuery = useQuery({
    queryKey: queryKeys.pagos,
    queryFn: fetchPagos,
    staleTime: STALE.analytics,
  });

  const clientesQuery = useQuery({
    queryKey: queryKeys.clientes,
    queryFn: fetchClientes,
    staleTime: STALE.catalog,
  });

  const reservas = useMemo(() => reservasQuery.data?.items ?? [], [reservasQuery.data?.items]);
  const pagos = useMemo(() => pagosQuery.data ?? [], [pagosQuery.data]);
  const clientes = useMemo(() => clientesQuery.data ?? [], [clientesQuery.data]);

  const periodReservas = useMemo(
    () => filterReservasByPeriod(reservas, period),
    [reservas, period],
  );
  const periodPagos = useMemo(
    () => filterPagosByPeriod(pagos, period),
    [pagos, period],
  );

  const reportBundle = useMemo(
    () => ({
      reservas,
      pagos,
      clientes,
      restaurantName,
    }),
    [reservas, pagos, clientes, restaurantName],
  );

  return {
    period,
    setPeriod,
    downloading,
    setDownloading,
    reportBundle,
    isLoading:
      reservasQuery.isLoading &&
      pagosQuery.isLoading &&
      clientesQuery.isLoading &&
      restaurantLoading,
    loadingReservas: reservasQuery.isLoading,
    loadingPagos: pagosQuery.isLoading,
    loadingClientes: clientesQuery.isLoading,
    loadingRestaurant: restaurantLoading,
    isErrorReservas: reservasQuery.isError,
    isErrorPagos: pagosQuery.isError,
    isError: reservasQuery.isError || pagosQuery.isError,
    isPartialReservas: reservasQuery.isPartialData,
    counts: {
      reservas: periodReservas.length,
      pagos: periodPagos.length,
      clientes: clientes.length,
    },
    refetchReservas: reservasQuery.refetch,
    refetchPagos: pagosQuery.refetch,
    refetchClientes: clientesQuery.refetch,
    refetch: () => {
      void reservasQuery.refetch();
      void pagosQuery.refetch();
      void clientesQuery.refetch();
      void refetchRestaurant();
    },
  };
}
