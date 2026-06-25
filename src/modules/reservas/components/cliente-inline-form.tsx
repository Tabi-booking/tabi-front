"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { crearCliente } from "@/modules/clientes/services/cliente.service";
import { clienteSchema, type ClienteFormValues } from "@/modules/reservas/validations/reserva.schema";
import type { Cliente } from "@/modules/clientes/types/cliente";
import { queryKeys } from "@/shared/lib/query-keys";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";

interface ClienteInlineFormProps {
  onCreated: (cliente: Cliente) => void;
  onCancel: () => void;
  initialSearch?: string;
}

export function ClienteInlineForm({ onCreated, onCancel, initialSearch = "" }: ClienteInlineFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      Tipo_Documento: "CC",
      Nombre: initialSearch.split(" ")[0] ?? "",
      Apellido: initialSearch.split(" ").slice(1).join(" ") ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: crearCliente,
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes });
      toast.success("Cliente creado");
      onCreated(saved);
    },
    onError: (err: Error) => toast.error(err.message || "Error al crear cliente"),
  });

  return (
    <form
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="space-y-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4"
    >
      <p className="text-sm font-medium text-foreground">Nuevo cliente</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="inline-nombre">Nombre</Label>
          <Input id="inline-nombre" {...register("Nombre")} />
          {errors.Nombre && <p className="text-xs text-destructive">{errors.Nombre.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="inline-apellido">Apellido</Label>
          <Input id="inline-apellido" {...register("Apellido")} />
          {errors.Apellido && <p className="text-xs text-destructive">{errors.Apellido.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="inline-telefono">Teléfono</Label>
          <Input id="inline-telefono" {...register("Telefono")} />
          {errors.Telefono && <p className="text-xs text-destructive">{errors.Telefono.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="inline-documento">Documento</Label>
          <Input id="inline-documento" {...register("Numero_Documento")} />
          {errors.Numero_Documento && (
            <p className="text-xs text-destructive">{errors.Numero_Documento.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="inline-correo">Correo</Label>
        <Input id="inline-correo" type="email" {...register("Correo")} />
        {errors.Correo && <p className="text-xs text-destructive">{errors.Correo.message}</p>}
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting || mutation.isPending}>
          {mutation.isPending ? "Creando..." : "Crear y seleccionar"}
        </Button>
      </div>
    </form>
  );
}
