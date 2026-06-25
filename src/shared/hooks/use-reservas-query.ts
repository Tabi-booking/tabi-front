"use client";

import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { fetchReservas } from "@/modules/reservas/services/reserva.service";
import type { PaginatedResponse } from "@/shared/types/api";
import type { Reserva } from "@/modules/reservas/types/reserva";
import {
  queryKeys,
  RESERVAS_LIMITS,
  type ReservasScope,
} from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";

function getBestCachedLimit(
  queryClient: ReturnType<typeof useQueryClient>,
  minLimit: number,
): number | null {
  const entries = queryClient.getQueriesData<PaginatedResponse<Reserva>>({
    queryKey: queryKeys.reservasAll,
  });

  let best: number | null = null;
  for (const [key, data] of entries) {
    const params = key[1] as { limit?: number } | undefined;
    const limit = params?.limit ?? 0;
    const count = data?.items?.length ?? 0;
    if (count >= minLimit && (best === null || limit > best)) {
      best = limit;
    }
  }
  return best;
}

export interface UseReservasQueryOptions {
  scope: ReservasScope;
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useReservasQuery({
  scope,
  enabled = true,
  refetchInterval = false,
}: UseReservasQueryOptions): UseQueryResult<PaginatedResponse<Reserva>> & {
  effectiveLimit: number;
  isPartialData: boolean;
} {
  const queryClient = useQueryClient();
  const requiredLimit = RESERVAS_LIMITS[scope];
  const cachedLimit = getBestCachedLimit(queryClient, requiredLimit);
  const effectiveLimit = cachedLimit ?? requiredLimit;
  const isPartialData = effectiveLimit < requiredLimit;

  const staleTime =
    scope === "analytics" ? STALE.analytics : STALE.operational;

  const query = useQuery({
    queryKey: queryKeys.reservas({ limit: effectiveLimit, offset: 0 }),
    queryFn: () => fetchReservas(effectiveLimit, 0),
    enabled,
    staleTime,
    refetchInterval: refetchInterval || undefined,
  });

  return { ...query, effectiveLimit, isPartialData };
}
