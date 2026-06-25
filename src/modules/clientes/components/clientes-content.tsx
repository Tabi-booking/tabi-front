"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Search } from "lucide-react";
import {
  eliminarCliente,
  fetchClienteByDocumento,
  fetchClientes,
  getClienteNombre,
} from "@/modules/clientes/services/cliente.service";
import { ClienteFormSheet } from "@/modules/clientes/components/cliente-form-sheet";
import type { Cliente } from "@/modules/clientes/types/cliente";
import { useReservasQuery } from "@/shared/hooks/use-reservas-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import { EstadoReservaBadge } from "@/modules/reservas/components/estado-reserva-badge";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { ConfirmDialog } from "@/shared/components/patterns/confirm-dialog";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { TableSkeleton } from "@/shared/components/patterns/table-skeleton";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Drawer, DrawerBody, DrawerHeader, DrawerTitle } from "@/shared/components/native/drawer";
import { formatDate, formatTime } from "@/shared/lib/utils";
import { PermissionDenied } from "@/shared/components/patterns/permission-denied";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { Plus } from "lucide-react";

function ClienteProfileSheet({
  open,
  onOpenChange,
  cliente,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onEdit: () => void;
}) {
  const { data: reservasData } = useReservasQuery({
    scope: "operational",
    enabled: open && Boolean(cliente),
  });

  const historial = (reservasData?.items ?? []).filter((r) => r.ID_Cliente === cliente?.ID_Key);

  if (!cliente) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="w-full sm:max-w-md">
      <DrawerHeader>
        <DrawerTitle>{getClienteNombre(cliente)}</DrawerTitle>
      </DrawerHeader>
      <DrawerBody>
        <div className="space-y-4">
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Correo:</span> {cliente.Correo}
            </p>
            <p>
              <span className="text-muted-foreground">Teléfono:</span> {cliente.Telefono}
            </p>
            <p>
              <span className="text-muted-foreground">Documento:</span> {cliente.Tipo_Documento}{" "}
              {cliente.Numero_Documento}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Editar perfil
          </Button>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Historial de reservas</h4>
            {historial.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin reservas registradas.</p>
            ) : (
              <ul className="space-y-2">
                {historial.map((r) => (
                  <li key={r.ID_Key} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                    <div>
                      <p>{formatDate(r.Fecha)} · {formatTime(r.Hora)}</p>
                      <p className="text-muted-foreground">{r.Cantidad_personas} personas</p>
                    </div>
                    <EstadoReservaBadge estado={r.Estado} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DrawerBody>
    </Drawer>
  );
}

export function ClientesContent() {
  const queryClient = useQueryClient();
  const { canReadClients, canWriteClients } = usePermissions();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);

  const { data: clientes = [], isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.clientes,
    queryFn: fetchClientes,
    staleTime: STALE.catalog,
    enabled: canReadClients,
  });

  const docSearch = useMutation({
    mutationFn: (doc: string) => fetchClienteByDocumento(doc),
    onSuccess: (results) => {
      if (results.length === 1) {
        setSelected(results[0]);
        setProfileOpen(true);
      }
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        getClienteNombre(c).toLowerCase().includes(q) ||
        c.Correo.toLowerCase().includes(q) ||
        c.Numero_Documento.includes(q),
    );
  }, [clientes, search]);

  const deleteMutation = useMutation({
    mutationFn: (c: Cliente) => eliminarCliente(c.ID_Key, c),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes });
      toast.success("Cliente eliminado");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Error al eliminar"),
  });

  if (!canReadClients) {
    return (
      <PermissionDenied
        title="Sin acceso a clientes"
        description="Tu rol no incluye permiso para ver clientes (clients.read)."
      />
    );
  }

  return (
    <>
      <AppPageShell
        title="Clientes"
        description="CRM de clientes del restaurante"
        actions={
          canWriteClients ? (
            <Button
              onClick={() => {
                setSelected(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Nuevo cliente
            </Button>
          ) : undefined
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, correo o documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              if (search.length >= 5) docSearch.mutate(search);
            }}
          >
            Buscar por documento
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <EmptyState
            icon={Users}
            title="Error al cargar"
            description="No pudimos obtener los clientes. Revisa tu conexión e intenta de nuevo."
            actionLabel="Reintentar"
            onAction={() => refetch()}
          />
        ) : clientes.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin clientes"
            description="Agrega clientes para vincularlos a reservas."
            actionLabel={canWriteClients ? "Nuevo cliente" : undefined}
            onAction={
              canWriteClients
                ? () => {
                    setSelected(null);
                    setFormOpen(true);
                  }
                : undefined
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin resultados"
            description="Ningún cliente coincide con tu búsqueda."
            actionLabel="Limpiar búsqueda"
            onAction={() => setSearch("")}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium">Correo</th>
                  <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                  <th className="px-4 py-3 text-left font-medium">Documento</th>
                  {canWriteClients && (
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.ID_Key} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{getClienteNombre(c)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.Correo}</td>
                    <td className="px-4 py-3">{c.Telefono}</td>
                    <td className="px-4 py-3">{c.Numero_Documento}</td>
                    {canWriteClients && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelected(c);
                            setProfileOpen(true);
                          }}
                        >
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelected(c);
                            setFormOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setDeleteTarget(c)}
                        >
                          Eliminar
                        </Button>
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

      {canWriteClients && (
        <ClienteFormSheet open={formOpen} onOpenChange={setFormOpen} cliente={selected} />
      )}
      <ClienteProfileSheet
        open={profileOpen}
        onOpenChange={setProfileOpen}
        cliente={selected}
        onEdit={
          canWriteClients
            ? () => {
                setProfileOpen(false);
                setFormOpen(true);
              }
            : () => setProfileOpen(false)
        }
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar cliente"
        description={
          deleteTarget
            ? `¿Eliminar a ${getClienteNombre(deleteTarget)}? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
    </>
  );
}
