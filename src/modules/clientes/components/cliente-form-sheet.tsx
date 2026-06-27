"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IdCard, Loader2, Mail, UserRound } from "lucide-react";
import { crearCliente, modificarCliente } from "@/modules/clientes/services/cliente.service";
import { clienteSchema, type ClienteFormValues } from "@/modules/reservas/validations/reserva.schema";
import { FormSection } from "@/modules/reservas/components/form-section";
import type { Cliente } from "@/modules/clientes/types/cliente";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { SelectField } from "@/shared/components/native/select-field";
import { queryKeys } from "@/shared/lib/query-keys";
import { cn } from "@/shared/lib/utils";
import {
  Drawer,
  DrawerBody,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/native/drawer";

const DOCUMENTO_OPTIONS = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PA", label: "Pasaporte" },
  { value: "NIT", label: "NIT" },
];

const EMPTY_VALUES: ClienteFormValues = {
  Nombre: "",
  Apellido: "",
  Telefono: "",
  Correo: "",
  Tipo_Documento: "CC",
  Numero_Documento: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function ClienteAvatarPreview({ nombre, apellido }: { nombre: string; apellido: string }) {
  const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.trim().toUpperCase() || "?";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
      {initials}
    </div>
  );
}

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
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: EMPTY_VALUES,
  });

  const nombre = watch("Nombre") ?? "";
  const apellido = watch("Apellido") ?? "";
  const correo = watch("Correo") ?? "";
  const telefono = watch("Telefono") ?? "";
  const tipoDocumento = watch("Tipo_Documento") ?? "CC";
  const numeroDocumento = watch("Numero_Documento") ?? "";

  useEffect(() => {
    if (!open) return;

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
        : EMPTY_VALUES,
    );
  }, [cliente, open, reset]);

  const mutation = useMutation({
    mutationFn: async (values: ClienteFormValues) => {
      if (isEdit && cliente) {
        return modificarCliente(cliente.ID_Key, { ...cliente, ...values });
      }
      return crearCliente(values);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<Cliente[]>(queryKeys.clientes, (current) => {
        const list = current ?? [];
        const exists = list.some((c) => c.ID_Key === saved.ID_Key);
        if (isEdit) {
          return list.map((c) => (c.ID_Key === saved.ID_Key ? saved : c));
        }
        if (exists) return list;
        return [saved, ...list];
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes });
      toast.success(isEdit ? "Cliente actualizado" : "Cliente creado");
      if (!isEdit) onCreated?.(saved);
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message || "Error al guardar"),
  });

  const saving = isSubmitting || mutation.isPending;
  const showPreview = Boolean(nombre.trim() && apellido.trim());

  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="w-full sm:max-w-lg">
      <DrawerHeader>
        <DrawerTitle>{isEdit ? "Editar cliente" : "Nuevo cliente"}</DrawerTitle>
        <DrawerDescription>
          {isEdit
            ? "Actualiza los datos de contacto e identificación del cliente."
            : "Registra un cliente para vincularlo a reservas y llevar su historial."}
        </DrawerDescription>
      </DrawerHeader>

      <DrawerBody>
        <form
          id="cliente-form"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-5"
        >
          <FormSection
            icon={UserRound}
            title="Datos personales"
            description="Nombre con el que aparecerá en reservas"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="Nombre">Nombre</Label>
                <Input
                  id="Nombre"
                  placeholder="María"
                  autoComplete="given-name"
                  className={cn(errors.Nombre && "border-destructive")}
                  {...register("Nombre")}
                />
                <FieldError message={errors.Nombre?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Apellido">Apellido</Label>
                <Input
                  id="Apellido"
                  placeholder="López"
                  autoComplete="family-name"
                  className={cn(errors.Apellido && "border-destructive")}
                  {...register("Apellido")}
                />
                <FieldError message={errors.Apellido?.message} />
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={Mail}
            title="Contacto"
            description="Para confirmaciones y recordatorios de reserva"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="Correo">Correo electrónico</Label>
                <Input
                  id="Correo"
                  type="email"
                  placeholder="cliente@email.com"
                  autoComplete="email"
                  className={cn(errors.Correo && "border-destructive")}
                  {...register("Correo")}
                />
                <FieldError message={errors.Correo?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Telefono">Teléfono</Label>
                <Input
                  id="Telefono"
                  type="tel"
                  placeholder="300 123 4567"
                  autoComplete="tel"
                  className={cn(errors.Telefono && "border-destructive")}
                  {...register("Telefono")}
                />
                <FieldError message={errors.Telefono?.message} />
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={IdCard}
            title="Identificación"
            description="Documento para evitar duplicados en tu base"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de documento</Label>
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
                <FieldError message={errors.Tipo_Documento?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Numero_Documento">Número de documento</Label>
                <Input
                  id="Numero_Documento"
                  placeholder="1234567890"
                  inputMode="numeric"
                  className={cn(errors.Numero_Documento && "border-destructive")}
                  {...register("Numero_Documento")}
                />
                <FieldError message={errors.Numero_Documento?.message} />
              </div>
            </div>
          </FormSection>
        </form>
      </DrawerBody>

      <DrawerFooter className="flex flex-col gap-3">
        {showPreview && (
          <div className="flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <ClienteAvatarPreview nombre={nombre} apellido={apellido} />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">
                {[nombre, apellido].filter(Boolean).join(" ")}
              </p>
              <p className="truncate text-muted-foreground">
                {correo || "Sin correo"}
                {telefono ? ` · ${telefono}` : ""}
              </p>
              {numeroDocumento && (
                <p className="truncate text-xs text-muted-foreground">
                  {tipoDocumento} {numeroDocumento}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex w-full gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" form="cliente-form" className="flex-[2]" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEdit ? (
              "Guardar cambios"
            ) : (
              "Crear cliente"
            )}
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
