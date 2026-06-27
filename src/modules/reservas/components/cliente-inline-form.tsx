"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IdCard, Mail, UserPlus, UserRound } from "lucide-react";
import { crearCliente } from "@/modules/clientes/services/cliente.service";
import { clienteSchema, type ClienteFormValues } from "@/modules/reservas/validations/reserva.schema";
import type { Cliente } from "@/modules/clientes/types/cliente";
import { queryKeys } from "@/shared/lib/query-keys";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { SelectField } from "@/shared/components/native/select-field";
import { cn } from "@/shared/lib/utils";

const DOCUMENTO_OPTIONS = [
  { value: "CC", label: "CC" },
  { value: "CE", label: "CE" },
  { value: "PA", label: "Pasaporte" },
  { value: "NIT", label: "NIT" },
];

interface ClienteInlineFormProps {
  onCreated: (cliente: Cliente) => void;
  onCancel: () => void;
  initialSearch?: string;
}

function InlineFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function ClienteInlineForm({ onCreated, onCancel, initialSearch = "" }: ClienteInlineFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
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
      queryClient.setQueryData<Cliente[]>(queryKeys.clientes, (current) => {
        const list = current ?? [];
        if (list.some((c) => c.ID_Key === saved.ID_Key)) return list;
        return [saved, ...list];
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes });
      toast.success("Cliente creado");
      onCreated(saved);
    },
    onError: (err: Error) => toast.error(err.message || "Error al crear cliente"),
  });

  const submit = handleSubmit((v) => mutation.mutate(v));

  return (
    <div
      className="overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-b from-primary/8 to-primary/3"
      onKeyDown={(e) => {
        if (e.key !== "Enter" || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        e.stopPropagation();
        void submit();
      }}
    >
      <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/5 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <UserPlus className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Nuevo cliente</p>
          <p className="text-xs text-muted-foreground">Se vinculará a esta reserva</p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <UserRound className="h-3.5 w-3.5" />
            Datos personales
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inline-nombre">Nombre</Label>
              <Input
                id="inline-nombre"
                placeholder="María"
                className={cn("bg-background", errors.Nombre && "border-destructive")}
                {...register("Nombre")}
              />
              <InlineFieldError message={errors.Nombre?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inline-apellido">Apellido</Label>
              <Input
                id="inline-apellido"
                placeholder="López"
                className={cn("bg-background", errors.Apellido && "border-destructive")}
                {...register("Apellido")}
              />
              <InlineFieldError message={errors.Apellido?.message} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            Contacto
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inline-telefono">Teléfono</Label>
              <Input
                id="inline-telefono"
                type="tel"
                placeholder="300 123 4567"
                className={cn("bg-background", errors.Telefono && "border-destructive")}
                {...register("Telefono")}
              />
              <InlineFieldError message={errors.Telefono?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inline-correo">Correo</Label>
              <Input
                id="inline-correo"
                type="email"
                placeholder="correo@email.com"
                className={cn("bg-background", errors.Correo && "border-destructive")}
                {...register("Correo")}
              />
              <InlineFieldError message={errors.Correo?.message} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <IdCard className="h-3.5 w-3.5" />
            Identificación
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Controller
                name="Tipo_Documento"
                control={control}
                render={({ field }) => (
                  <SelectField
                    value={field.value}
                    onValueChange={field.onChange}
                    options={DOCUMENTO_OPTIONS}
                  />
                )}
              />
              <InlineFieldError message={errors.Tipo_Documento?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inline-documento">Número</Label>
              <Input
                id="inline-documento"
                placeholder="1234567890"
                inputMode="numeric"
                className={cn("bg-background", errors.Numero_Documento && "border-destructive")}
                {...register("Numero_Documento")}
              />
              <InlineFieldError message={errors.Numero_Documento?.message} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-primary/10 pt-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1"
            disabled={isSubmitting || mutation.isPending}
            onClick={() => void submit()}
          >
            {mutation.isPending ? "Creando..." : "Crear y seleccionar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
