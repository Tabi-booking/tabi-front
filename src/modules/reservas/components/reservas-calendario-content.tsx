"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import type { Reserva } from "@/modules/reservas/types/reserva";
import { fetchClientes } from "@/modules/clientes/services/cliente.service";
import { useReservasQuery } from "@/shared/hooks/use-reservas-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import { ReservaFormSheet } from "@/modules/reservas/components/reserva-form-sheet";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { Button } from "@/shared/components/native/button";
import { Skeleton } from "@/shared/components/native/skeleton";
import { PermissionDenied } from "@/shared/components/patterns/permission-denied";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { CalendarDays, Plus } from "lucide-react";

const ReservasCalendar = dynamic(
  () => import("@/modules/reservas/components/reservas-calendar").then((m) => m.ReservasCalendar),
  { ssr: false, loading: () => <Skeleton className="h-[600px] w-full" /> },
);

export function ReservasCalendarioContent() {
  const { canReadReservations, canWriteReservations } = usePermissions();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Reserva | null>(null);
  const [defaultFecha, setDefaultFecha] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new" && canWriteReservations) {
      setSelected(null);
      setSheetOpen(true);
    }
  }, [canWriteReservations]);

  const { data, isLoading, isError, refetch } = useReservasQuery({
    scope: "operational",
    enabled: canReadReservations,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: queryKeys.clientes,
    queryFn: fetchClientes,
    staleTime: STALE.catalog,
    enabled: canReadReservations,
  });

  const clienteMap = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.ID_Key, c])),
    [clientes],
  );

  const openCreate = (fecha?: string) => {
    setSelected(null);
    setDefaultFecha(fecha);
    setSheetOpen(true);
  };

  const openEdit = (r: Reserva) => {
    setSelected(r);
    setDefaultFecha(undefined);
    setSheetOpen(true);
  };

  if (!canReadReservations) {
    return (
      <PermissionDenied
        title="Sin acceso a reservas"
        description="Tu rol no incluye permiso para ver reservas (reservations.read)."
      />
    );
  }

  return (
    <>
      <AppPageShell
        title="Calendario"
        description="Vista semanal y mensual de reservas"
        actions={
          canWriteReservations ? (
            <Button onClick={() => openCreate()}>
              <Plus className="h-4 w-4" /> Nueva reserva
            </Button>
          ) : undefined
        }
      >
        {isLoading ? (
          <Skeleton className="h-[720px] w-full rounded-xl" />
        ) : isError ? (
          <EmptyState
            icon={CalendarDays}
            title="Error al cargar calendario"
            actionLabel="Reintentar"
            onAction={() => refetch()}
          />
        ) : (
          <ReservasCalendar
            reservas={data?.items ?? []}
            clientes={clienteMap}
            onSelect={canWriteReservations ? openEdit : () => undefined}
            onDateClick={canWriteReservations ? (date) => openCreate(date) : undefined}
          />
        )}
      </AppPageShell>

      {canWriteReservations && (
        <ReservaFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          reserva={selected}
          defaultFecha={defaultFecha}
        />
      )}
    </>
  );
}
