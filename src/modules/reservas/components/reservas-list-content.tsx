"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cambiarEstadoReserva } from "@/modules/reservas/services/reserva.service";
import { useReservasQuery } from "@/shared/hooks/use-reservas-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import type { Reserva } from "@/modules/reservas/types/reserva";
import { fetchClientes, getClienteNombre } from "@/modules/clientes/services/cliente.service";
import { ESTADOS_OPCIONES } from "@/modules/reservas/lib/reserva-estado-ui";
import { EstadoReservaBadge } from "@/modules/reservas/components/estado-reserva-badge";
import { ReservaFormSheet } from "@/modules/reservas/components/reserva-form-sheet";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { TableSkeleton } from "@/shared/components/patterns/table-skeleton";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { SelectField } from "@/shared/components/native/select-field";
import { formatDate, formatTime } from "@/shared/lib/utils";
import { PermissionDenied } from "@/shared/components/patterns/permission-denied";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { CalendarDays, Plus } from "lucide-react";

export function ReservasListContent() {
  const queryClient = useQueryClient();
  const { canReadReservations, canWriteReservations } = usePermissions();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Reserva | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<string>("all");
  const [fechaFilter, setFechaFilter] = useState("");
  const [pendingEstadoId, setPendingEstadoId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      setSelected(null);
      setSheetOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

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

  const reservas = useMemo(() => {
    let items = data?.items ?? [];
    if (estadoFilter !== "all") {
      items = items.filter((r) => (r.Estado ?? "PENDIENTE") === estadoFilter);
    }
    if (fechaFilter) {
      items = items.filter((r) => r.Fecha === fechaFilter);
    }
    return items;
  }, [data?.items, estadoFilter, fechaFilter]);

  const allReservas = data?.items ?? [];

  const clearFilters = () => {
    setEstadoFilter("all");
    setFechaFilter("");
  };

  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      cambiarEstadoReserva(id, estado),
    onMutate: ({ id }) => setPendingEstadoId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservasAll });
      toast.success("Estado actualizado");
    },
    onError: () => toast.error("Error al cambiar estado"),
    onSettled: () => setPendingEstadoId(null),
  });

  const openCreate = () => {
    setSelected(null);
    setSheetOpen(true);
  };

  const openEdit = (r: Reserva) => {
    setSelected(r);
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
        title="Lista de reservas"
        description="Todas las reservas de tu restaurante"
        actions={
          canWriteReservations ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Nueva reserva
            </Button>
          ) : undefined
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
          <SelectField
            value={estadoFilter}
            onValueChange={setEstadoFilter}
            className="w-44"
            options={[
              { value: "all", label: "Todos los estados" },
              ...ESTADOS_OPCIONES.map((e) => ({ value: e, label: e })),
            ]}
          />
          <Input
            type="date"
            value={fechaFilter}
            onChange={(e) => setFechaFilter(e.target.value)}
            className="w-44"
          />
          {fechaFilter && (
            <Button variant="ghost" size="sm" onClick={() => setFechaFilter("")}>
              Limpiar fecha
            </Button>
          )}
          <span className="ml-auto text-sm text-muted-foreground">
            {reservas.length} reserva{reservas.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <EmptyState
            icon={CalendarDays}
            title="Error al cargar reservas"
            description="No pudimos obtener las reservas. Revisa tu conexión e intenta de nuevo."
            actionLabel="Reintentar"
            onAction={() => refetch()}
          />
        ) : allReservas.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Sin reservas"
            description="Crea tu primera reserva para comenzar."
            actionLabel={canWriteReservations ? "Nueva reserva" : undefined}
            onAction={canWriteReservations ? openCreate : undefined}
          />
        ) : reservas.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Sin resultados"
            description="Ninguna reserva coincide con los filtros aplicados."
            actionLabel="Limpiar filtros"
            onAction={clearFilters}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium">Hora</th>
                  <th className="px-4 py-3 text-left font-medium">Pax</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  {canWriteReservations && (
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr
                    key={r.ID_Key}
                    className="border-b border-border last:border-0 transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3">{getClienteNombre(clienteMap[r.ID_Cliente])}</td>
                    <td className="px-4 py-3">{formatDate(r.Fecha)}</td>
                    <td className="px-4 py-3">{formatTime(r.Hora)}</td>
                    <td className="px-4 py-3">{r.Cantidad_personas}</td>
                    <td className="px-4 py-3">
                      <EstadoReservaBadge estado={r.Estado} />
                    </td>
                    {canWriteReservations && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                          Editar
                        </Button>
                        {r.Estado !== "CONFIRMADA" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pendingEstadoId === r.ID_Key}
                            onClick={() =>
                              estadoMutation.mutate({ id: r.ID_Key, estado: "CONFIRMADA" })
                            }
                          >
                            {pendingEstadoId === r.ID_Key ? "Confirmando..." : "Confirmar"}
                          </Button>
                        )}
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AppPageShell>

      {canWriteReservations && (
        <ReservaFormSheet open={sheetOpen} onOpenChange={setSheetOpen} reserva={selected} />
      )}
    </>
  );
}
