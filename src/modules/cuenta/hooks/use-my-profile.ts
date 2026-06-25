"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchMyProfile,
  updateMyProfile,
} from "@/modules/cuenta/services/cuenta.service";
import type { CuentaFormValues } from "@/modules/cuenta/validations/cuenta.schema";
import { fetchUsuarioById } from "@/modules/usuarios/services/usuario.service";
import type { Usuario } from "@/modules/usuarios/types/usuario";
import { ApiError } from "@/shared/lib/api-client";
import { setSession } from "@/shared/lib/auth/session";
import { queryKeys } from "@/shared/lib/query-keys";
import { useAuth } from "@/shared/providers/auth-provider";

export function useMyProfile() {
  const { session, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: queryKeys.myProfile,
    queryFn: fetchMyProfile,
    enabled: Boolean(session?.access_token),
  });

  const usuarioQuery = useQuery({
    queryKey: queryKeys.myUsuario(session?.user_id ?? ""),
    queryFn: () => fetchUsuarioById(session!.user_id!),
    enabled: Boolean(session?.user_id),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: CuentaFormValues) => {
      if (!session) throw new Error("Sesión no disponible");
      const usuario = (usuarioQuery.data as Usuario | undefined) ?? null;
      return updateMyProfile(session, usuario, values);
    },
    onSuccess: async (updatedSession) => {
      setSession(updatedSession);
      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
      if (session?.user_id) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.myUsuario(session.user_id),
        });
      }
      toast.success("Perfil actualizado");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el perfil");
    },
  });

  return {
    session,
    profile: profileQuery.data,
    usuario: usuarioQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    refetch: profileQuery.refetch,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
