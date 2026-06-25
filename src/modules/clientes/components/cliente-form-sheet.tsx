"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { crearCliente, modificarCliente } from "@/modules/clientes/services/cliente.service";
import { clienteSchema, type ClienteFormValues } from "@/modules/reservas/validations/reserva.schema";
import type { Cliente } from "@/modules/clientes/types/cliente";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { queryKeys } from "@/shared/lib/query-keys";
import {
  Drawer,
  DrawerBody,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/native/drawer";

interface ClienteFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  onCreated?: (cliente: Cliente) => void;
}

export function ClienteFormSheet({
  open,
  onOpenChange,
  cliente,
  onCreated,
}: ClienteFormSheetProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(cliente?.ID_Key);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        cliente
          ? {
              Nombre: cliente.Nombre,
              Apellido: cliente.Apellido,
              Telefono: cliente.Telefono,
              Correo: cliente.Correo,
              Tipo_Documento: cliente.Tipo_Documento,
              Numero_Documento: cliente.Numero_Documento,
            }
          : {
              Tipo_Documento: "CC",
            },
      );
    }
  }, [cliente, open, reset]);

  const mutation = useMutation({
    mutationFn: async (values: ClienteFormValues) => {
      if (isEdit && cliente) {
        return modificarCliente(cliente.ID_Key, { ...cliente, ...values });
      }
      return crearCliente(values);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes });
      toast.success(isEdit ? "Cliente actualizado" : "Cliente creado");
      if (!isEdit) onCreated?.(saved);
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message || "Error al guardar"),
  });

  const saving = isSubmitting || mutation.isPending;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="w-full sm:max-w-md">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex h-full flex-col">
        <DrawerHeader>
          <DrawerTitle>{isEdit ? "Editar cliente" : "Nuevo cliente"}</DrawerTitle>
          <DrawerDescription>
            {isEdit
              ? "Actualiza los datos de contacto del cliente."
              : "Agrega un cliente para vincularlo a reservas."}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="Nombre">Nombre</Label>
              <Input id="Nombre" {...register("Nombre")} />
              {errors.Nombre && (
                <p className="text-xs text-destructive">{errors.Nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="Apellido">Apellido</Label>
              <Input id="Apellido" {...register("Apellido")} />
              {errors.Apellido && (
                <p className="text-xs text-destructive">{errors.Apellido.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="Correo">Correo</Label>
            <Input id="Correo" type="email" {...register("Correo")} />
            {errors.Correo && <p className="text-xs text-destructive">{errors.Correo.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="Telefono">Teléfono</Label>
            <Input id="Telefono" {...register("Telefono")} />
            {errors.Telefono && (
              <p className="text-xs text-destructive">{errors.Telefono.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="Numero_Documento">Documento</Label>
            <Input id="Numero_Documento" {...register("Numero_Documento")} />
            {errors.Numero_Documento && (
              <p className="text-xs text-destructive">{errors.Numero_Documento.message}</p>
            )}
          </div>
        </DrawerBody>
        <DrawerFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-[2]" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cliente"}
          </Button>
        </DrawerFooter>
      </form>
    </Drawer>
  );
}
