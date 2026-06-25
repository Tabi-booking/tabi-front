"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Plus, Shield } from "lucide-react";
import { eliminarRol, fetchRoles } from "@/modules/roles/services/rol.service";
import { fetchRolesPermissionsMatrix } from "@/modules/roles/services/permissions.service";
import {
  collectUniquePermissions,
  getPermissionGroup,
  getPermissionLabel,
} from "@/modules/roles/lib/permission-labels";
import { RolFormSheet } from "@/modules/roles/components/rol-form-sheet";
import type { Rol } from "@/modules/roles/types/rol";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { ConfirmDialog } from "@/shared/components/patterns/confirm-dialog";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { Button } from "@/shared/components/native/button";
import { Skeleton } from "@/shared/components/native/skeleton";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import { ApiError } from "@/shared/lib/api-client";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { cn } from "@/shared/lib/utils";

export function RolesContent() {
  const queryClient = useQueryClient();
  const { canReadUsers, canWriteUsers } = usePermissions();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Rol | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Rol | null>(null);

  const { data: roles = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.roles,
    queryFn: fetchRoles,
    staleTime: STALE.catalog,
    enabled: canReadUsers,
  });

  const { data: matrix, isLoading: matrixLoading } = useQuery({
    queryKey: queryKeys.rolesPermissionsMatrix,
    queryFn: fetchRolesPermissionsMatrix,
  });

  const matrixRoles = useMemo(() => {
    if (!matrix?.roles) return [];
    return Object.keys(matrix.roles).sort((a, b) => a.localeCompare(b, "es"));
  }, [matrix]);

  const permissions = useMemo(
    () => (matrix?.roles ? collectUniquePermissions(matrix.roles) : []),
    [matrix],
  );

  const deleteMutation = useMutation({
    mutationFn: (r: Rol) => eliminarRol(r.ID_Key, r),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles });
      toast.success("Rol eliminado");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Error al eliminar"),
  });

  if (!canReadUsers) {
    return (
      <AppPageShell title="Roles" description="Roles y permisos del restaurante">
        <EmptyState
          icon={Shield}
          title="Sin permisos"
          description="No tienes permiso para ver roles y permisos. Solo Propietario y Administrador pueden acceder."
        />
      </AppPageShell>
    );
  }

  const forbidden = error instanceof ApiError && error.status === 403;

  return (
    <>
      <AppPageShell
        title="Roles"
        description="Roles y permisos del restaurante"
        actions={
          canWriteUsers ? (
            <Button
              onClick={() => {
                setSelected(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Nuevo rol
            </Button>
          ) : undefined
        }
      >
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Roles registrados</h2>
            <p className="text-sm text-muted-foreground">
              Asigna estos roles a los usuarios del restaurante.
            </p>
          </div>

          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : isError ? (
            <EmptyState
              icon={Shield}
              title={forbidden ? "Acceso denegado" : "Error al cargar"}
              description={forbidden ? (error as ApiError).message : undefined}
              actionLabel="Reintentar"
              onAction={() => refetch()}
            />
          ) : roles.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="Sin roles"
              description="Crea roles para organizar el acceso de tu equipo."
              actionLabel={canWriteUsers ? "Nuevo rol" : undefined}
              onAction={canWriteUsers ? () => setFormOpen(true) : undefined}
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left font-medium">Nombre</th>
                    <th className="px-4 py-3 text-left font-medium">Permisos</th>
                    {canWriteUsers && (
                      <th className="px-4 py-3 text-right font-medium">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => {
                    const rolePermissions = matrix?.roles[r.Nombre] ?? [];
                    return (
                      <tr key={r.ID_Key} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{r.Nombre}</td>
                        <td className="px-4 py-3">
                          {rolePermissions.length === 0 ? (
                            <span className="text-muted-foreground">Sin permisos definidos</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {rolePermissions.slice(0, 4).map((p) => (
                                <span
                                  key={p}
                                  className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                                >
                                  {getPermissionLabel(p)}
                                </span>
                              ))}
                              {rolePermissions.length > 4 && (
                                <span className="text-xs text-muted-foreground">
                                  +{rolePermissions.length - 4} más
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        {canWriteUsers && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelected(r);
                                  setFormOpen(true);
                                }}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => setDeleteTarget(r)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-10 space-y-4">
          <div>
            <h2 className="text-base font-semibold">Matriz de permisos</h2>
            <p className="text-sm text-muted-foreground">
              Referencia de permisos por rol (catálogo público del backend).
            </p>
          </div>

          {matrixLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : matrixRoles.length === 0 || permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay datos de permisos disponibles.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="sticky left-0 z-10 bg-secondary/50 px-4 py-3 text-left font-medium">
                      Permiso
                    </th>
                    {matrixRoles.map((roleName) => (
                      <th key={roleName} className="px-4 py-3 text-center font-medium whitespace-nowrap">
                        {roleName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission} className="border-b border-border last:border-0">
                      <td className="sticky left-0 z-10 bg-background px-4 py-3">
                        <div className="font-medium">{getPermissionLabel(permission)}</div>
                        <div className="text-xs text-muted-foreground">
                          {getPermissionGroup(permission)}
                        </div>
                      </td>
                      {matrixRoles.map((roleName) => {
                        const hasIt = matrix?.roles[roleName]?.includes(permission);
                        return (
                          <td key={roleName} className="px-4 py-3 text-center">
                            <span
                              className={cn(
                                "inline-flex h-6 w-6 items-center justify-center rounded-full",
                                hasIt ? "bg-primary/10 text-primary" : "text-muted-foreground/30",
                              )}
                              aria-label={hasIt ? "Sí" : "No"}
                            >
                              {hasIt ? <Check className="h-3.5 w-3.5" /> : "—"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AppPageShell>

      {canWriteUsers && (
        <RolFormSheet open={formOpen} onOpenChange={setFormOpen} rol={selected} />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar rol"
        description={
          deleteTarget
            ? `¿Eliminar el rol "${deleteTarget.Nombre}"? Los usuarios asignados podrían perder permisos.`
            : undefined
        }
        confirmLabel="Eliminar"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
    </>
  );
}
