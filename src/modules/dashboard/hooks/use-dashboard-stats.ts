import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClientes } from "@/modules/clientes/services/cliente.service";
import { fetchPagos } from "@/modules/dashboard/services/pago.service";
import {
  buildBehaviorInsights,
  buildDailyTrend,
  buildEstadoDistribution,
  buildPeakHours,
  buildTopClientes,
  compareWithPreviousPeriod,
  computeKpis,
  filterReservasByPeriod,
  type DashboardPeriod,
} from "@/modules/dashboard/lib/dashboard-analytics";
import { useReservasQuery } from "@/shared/hooks/use-reservas-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import { todayISO } from "@/shared/lib/utils";

export function useDashboardStats() {
  const [period, setPeriod] = useState<DashboardPeriod>("7d");

  const reservasQuery = useReservasQuery({ scope: "dashboard" });

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
  const today = todayISO();

  const analytics = useMemo(() => {
    const periodReservas = filterReservasByPeriod(reservas, period);
    const kpis = computeKpis(reservas, pagos, period);
    const dailyTrend = buildDailyTrend(reservas, pagos, period);
    const estadoDistribution = buildEstadoDistribution(periodReservas);
    const peakHours = buildPeakHours(periodReservas);
    const topClientes = buildTopClientes(periodReservas, clientes);
    const insights = buildBehaviorInsights(reservas, pagos, period, topClientes);
    const comparison = compareWithPreviousPeriod(reservas, period);

    const upcoming = [...reservas]
      .filter((r) => r.Fecha >= today && r.Estado !== "CANCELADA")
      .sort((a, b) => `${a.Fecha}${a.Hora}`.localeCompare(`${b.Fecha}${b.Hora}`))
      .slice(0, 5);

    const activity = [...reservas]
      .sort((a, b) => `${b.Fecha}${b.Hora}`.localeCompare(`${a.Fecha}${a.Hora}`))
      .slice(0, 8)
      .map((r) => ({
        id: r.ID_Key,
        text: `Reserva ${r.Codigo_reserva || r.ID_Key.slice(0, 8)} — ${r.Estado ?? "PENDIENTE"}`,
        fecha: r.Fecha,
      }));

    return {
      kpis,
      dailyTrend,
      estadoDistribution,
      peakHours,
      topClientes,
      insights,
      comparison,
      upcoming,
      activity,
      clientes,
    };
  }, [reservas, pagos, clientes, period, today]);

  const hasReservas = reservas.length > 0 || reservasQuery.isSuccess;

  return {
    period,
    setPeriod,
    isLoading: reservasQuery.isLoading && pagosQuery.isLoading && clientesQuery.isLoading,
    loadingReservas: reservasQuery.isLoading,
    loadingPagos: pagosQuery.isLoading,
    loadingClientes: clientesQuery.isLoading,
    isErrorReservas: reservasQuery.isError,
    isErrorPagos: pagosQuery.isError,
    isError: reservasQuery.isError || pagosQuery.isError,
    hasReservas,
    isPartialReservas: reservasQuery.isPartialData,
    reservasLimit: reservasQuery.effectiveLimit,
    refetchReservas: reservasQuery.refetch,
    refetchPagos: pagosQuery.refetch,
    refetchClientes: clientesQuery.refetch,
    refetch: () => {
      void reservasQuery.refetch();
      void pagosQuery.refetch();
      void clientesQuery.refetch();
    },
    ...analytics,
  };
}
