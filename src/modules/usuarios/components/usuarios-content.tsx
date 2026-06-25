"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, UserCog } from "lucide-react";
import {
  eliminarUsuario,
  fetchUsuarios,
  getUsuarioNombre,
} from "@/modules/usuarios/services/usuario.service";
import { fetchRoles } from "@/modules/roles/services/rol.service";
import { UsuarioFormSheet } from "@/modules/usuarios/components/usuario-form-sheet";
import type { Usuario } from "@/modules/usuarios/types/usuario";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { ConfirmDialog } from "@/shared/components/patterns/confirm-dialog";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { TableSkeleton } from "@/shared/components/patterns/table-skeleton";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import { ApiError } from "@/shared/lib/api-client";
import { usePermissions } from "@/shared/hooks/use-permissions";

export function UsuariosContent() {
  const queryClient = useQueryClient();
  const { canReadUsers, canWriteUsers, isAdmin } = usePermissions();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);

  const { data: usuarios = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.usuarios,
    queryFn: fetchUsuarios,
    enabled: canReadUsers,
  });

  const { data: roles = [] } = useQuery({
    queryKey: queryKeys.roles,
    queryFn: fetchRoles,
    staleTime: STALE.catalog,
    enabled: canReadUsers,
  });

  const roleNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const rol of roles) {
      map.set(rol.ID_Key, rol.Nombre);
    }
    return map;
  }, [roles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) =>
        getUsuarioNombre(u).toLowerCase().includes(q) ||
        u.Correo.toLowerCase().includes(q) ||
        u.Numero_Documento.includes(q) ||
        (roleNameById.get(u.ID_Rol) ?? "").toLowerCase().includes(q),
    );
  }, [usuarios, search, roleNameById]);

  const deleteMutation = useMutation({
    mutationFn: (u: Usuario) => eliminarUsuario(u.ID_Key, u),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuarios });
      toast.success("Usuario eliminado");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Error al eliminar"),
  });

  if (!canReadUsers) {
    return (
      <AppPageShell title="Usuarios" description="Gestión de empleados del restaurante">
        <EmptyState
          icon={UserCog}
          title="Sin permisos"
          description="No tienes permiso para ver el equipo. Solo Propietario y Administrador pueden gestionar empleados."
        />
      </AppPageShell>
    );
  }

  const forbidden = error instanceof ApiError && error.status === 403;

  return (
    <>
      <AppPageShell
        title="Usuarios"
        description={
          isAdmin
            ? "Gestión de empleados del restaurante"
            : "Listado de empleados del restaurante"
        }
        actions={
          canWriteUsers ? (
            <Button
              onClick={() => {
                setSelected(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Nuevo usuario
            </Button>
          ) : undefined
        }
      >
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, correo, documento o rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <EmptyState
            icon={UserCog}
            title={forbidden ? "Acceso denegado" : "Error al cargar"}
            description={forbidden ? (error as ApiError).message : undefined}
            actionLabel="Reintentar"
            onAction={() => refetch()}
          />
        ) : usuarios.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="Sin usuarios"
            description="Agrega usuarios para que accedan al panel."
            actionLabel={canWriteUsers ? "Nuevo usuario" : undefined}
            onAction={canWriteUsers ? () => setFormOpen(true) : undefined}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="Sin resultados"
            description="Ningún usuario coincide con tu búsqueda."
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
                  <th className="px-4 py-3 text-left font-medium">Rol</th>
                  {canWriteUsers && (
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.ID_Key} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{getUsuarioNombre(u)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.Correo}</td>
                    <td className="px-4 py-3">{u.Telefono}</td>
                    <td className="px-4 py-3">
                      {u.Tipo_Documento} {u.Numero_Documento}
                    </td>
                    <td className="px-4 py-3">{roleNameById.get(u.ID_Rol) ?? "—"}</td>
                    {canWriteUsers && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelected(u);
                              setFormOpen(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setDeleteTarget(u)}
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

      {canWriteUsers && (
        <UsuarioFormSheet open={formOpen} onOpenChange={setFormOpen} usuario={selected} />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar usuario"
        description={
          deleteTarget
            ? `¿Eliminar a ${getUsuarioNombre(deleteTarget)}? Perderá acceso al panel.`
            : undefined
        }
        confirmLabel="Eliminar"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
    </>
  );
}
