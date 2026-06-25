"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { toast } from "sonner";
import { crearRol, modificarRol } from "@/modules/roles/services/rol.service";
import { rolSchema, type RolFormValues } from "@/modules/roles/validations/rol.schema";
import type { Rol } from "@/modules/roles/types/rol";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { Drawer, DrawerBody, DrawerHeader, DrawerTitle } from "@/shared/components/native/drawer";

interface RolFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol?: Rol | null;
}

export function RolFormSheet({ open, onOpenChange, rol }: RolFormSheetProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(rol?.ID_Key);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<RolFormValues>({
    resolver: zodResolver(rolSchema),
  });

  useEffect(() => {
    if (open) {
      reset(rol ? { Nombre: rol.Nombre } : { Nombre: "" });
    }
  }, [rol, open, reset]);

  const mutation = useMutation({
    mutationFn: async (values: RolFormValues) => {
      if (isEdit && rol) {
        return modificarRol(rol.ID_Key, { ...rol, ...values });
      }
      return crearRol(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles });
      toast.success(isEdit ? "Rol actualizado" : "Rol creado");
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message || "Error al guardar"),
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="w-full sm:max-w-md">
      <DrawerHeader>
        <DrawerTitle>{isEdit ? "Editar rol" : "Nuevo rol"}</DrawerTitle>
      </DrawerHeader>
      <DrawerBody>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="Nombre">Nombre del rol</Label>
            <Input id="Nombre" {...register("Nombre")} placeholder="Ej. Mesero" />
          </div>
          <p className="text-xs text-muted-foreground">
            Los permisos del rol se definen en el sistema. Consulta la matriz de permisos abajo.
          </p>
          <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
            Guardar
          </Button>
        </form>
      </DrawerBody>
    </Drawer>
  );
}
