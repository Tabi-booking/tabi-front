import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClientes } from "@/modules/clientes/services/cliente.service";
import {
  buildBehaviorInsights,
  buildDailyTrend,
  buildEstadoDistribution,
  buildPeakHours,
  buildTopClientes,
  compareIngresosWithPreviousPeriod,
  compareWithPreviousPeriod,
  computeKpis,
  filterReservasByPeriod,
  type DashboardPeriod,
} from "@/modules/dashboard/lib/dashboard-analytics";
import { fetchPagos } from "@/modules/dashboard/services/pago.service";
import { usePageVisibility } from "@/shared/hooks/use-page-visibility";
import { useReservasQuery } from "@/shared/hooks/use-reservas-query";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { queryKeys } from "@/shared/lib/query-keys";
import { ANALYTICS_REFETCH_MS, STALE } from "@/shared/lib/query-config";

export function useAnaliticaStats() {
  const [period, setPeriod] = useState<DashboardPeriod>("7d");
  const isVisible = usePageVisibility();
  const {
    canReadReservations,
    canReadPayments,
    canReadClients,
  } = usePermissions();

  const refetchInterval = isVisible ? ANALYTICS_REFETCH_MS : false;

  const reservasQuery = useReservasQuery({
    scope: "analytics",
    enabled: canReadReservations,
    refetchInterval: canReadReservations ? refetchInterval : false,
  });

  const pagosQuery = useQuery({
    queryKey: queryKeys.pagos,
    queryFn: fetchPagos,
    staleTime: STALE.analytics,
    refetchInterval: canReadPayments ? refetchInterval : false,
    enabled: canReadPayments,
  });

  const clientesQuery = useQuery({
    queryKey: queryKeys.clientes,
    queryFn: fetchClientes,
    staleTime: STALE.catalog,
    refetchInterval: canReadClients ? refetchInterval : false,
    enabled: canReadClients,
  });

  const reservas = useMemo(() => reservasQuery.data?.items ?? [], [reservasQuery.data?.items]);
  const pagos = useMemo(() => pagosQuery.data ?? [], [pagosQuery.data]);
  const clientes = useMemo(() => clientesQuery.data ?? [], [clientesQuery.data]);

  const analytics = useMemo(() => {
    const periodReservas = filterReservasByPeriod(reservas, period);
    const kpis = computeKpis(reservas, pagos, period);
    const dailyTrend = buildDailyTrend(reservas, pagos, period);
    const estadoDistribution = buildEstadoDistribution(periodReservas);
    const peakHours = buildPeakHours(periodReservas);
    const topClientes = buildTopClientes(periodReservas, clientes, 8);
    const insights = buildBehaviorInsights(reservas, pagos, period, topClientes);
    const comparison = compareWithPreviousPeriod(reservas, period);
    const ingresosComparison = compareIngresosWithPreviousPeriod(pagos, period);

    return {
      kpis,
      dailyTrend,
      estadoDistribution,
      peakHours,
      topClientes,
      insights,
      comparison,
      ingresosComparison,
    };
  }, [reservas, pagos, clientes, period]);

  const lastUpdated = useMemo(() => {
    const times = [
      reservasQuery.dataUpdatedAt,
      pagosQuery.dataUpdatedAt,
      clientesQuery.dataUpdatedAt,
    ].filter(Boolean);
    return times.length ? Math.max(...times) : Date.now();
  }, [reservasQuery.dataUpdatedAt, pagosQuery.dataUpdatedAt, clientesQuery.dataUpdatedAt]);

  const isLoading =
    (canReadReservations && reservasQuery.isLoading) ||
    (canReadPayments && pagosQuery.isLoading) ||
    (canReadClients && clientesQuery.isLoading);

  const isFetching =
    (canReadReservations && reservasQuery.isFetching) ||
    (canReadPayments && pagosQuery.isFetching) ||
    (canReadClients && clientesQuery.isFetching);

  const isError =
    (canReadReservations && reservasQuery.isError) ||
    (canReadPayments && pagosQuery.isError);

  return {
    period,
    setPeriod,
    isLoading,
    loadingReservas: canReadReservations && reservasQuery.isLoading,
    loadingPagos: canReadPayments && pagosQuery.isLoading,
    loadingClientes: canReadClients && clientesQuery.isLoading,
    isErrorReservas: canReadReservations && reservasQuery.isError,
    isErrorPagos: canReadPayments && pagosQuery.isError,
    isFetching,
    isError,
    lastUpdated,
    isPartialReservas: reservasQuery.isPartialData,
    canReadReservations,
    canReadPayments,
    canReadClients,
    refetchReservas: reservasQuery.refetch,
    refetchPagos: pagosQuery.refetch,
    refetchClientes: clientesQuery.refetch,
    refetch: () => {
      if (canReadReservations) void reservasQuery.refetch();
      if (canReadPayments) void pagosQuery.refetch();
      if (canReadClients) void clientesQuery.refetch();
    },
    ...analytics,
  };
}
