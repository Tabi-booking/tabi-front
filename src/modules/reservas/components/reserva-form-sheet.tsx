"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, User, Users } from "lucide-react";
import { crearReserva, modificarReserva } from "@/modules/reservas/services/reserva.service";
import { reservaSchema, type ReservaFormValues } from "@/modules/reservas/validations/reserva.schema";
import type { Reserva } from "@/modules/reservas/types/reserva";
import { fetchClientes, getClienteNombre } from "@/modules/clientes/services/cliente.service";
import { ClienteReservaField } from "@/modules/reservas/components/cliente-reserva-field";
import { FormSection } from "@/modules/reservas/components/form-section";
import { HoraQuickPicks } from "@/modules/reservas/components/hora-quick-picks";
import { PersonasStepper } from "@/modules/reservas/components/personas-stepper";
import { ESTADOS_OPCIONES, getEstadoConfig } from "@/modules/reservas/lib/reserva-estado-ui";
import { EstadoReservaBadge } from "@/modules/reservas/components/estado-reserva-badge";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { SelectField } from "@/shared/components/native/select-field";
import {
  Drawer,
  DrawerBody,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/native/drawer";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import { textareaClass } from "@/shared/lib/ui-classes";
import { formatDate, formatTime, todayISO } from "@/shared/lib/utils";

interface ReservaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserva?: Reserva | null;
  defaultFecha?: string;
}

export function ReservaFormSheet({
  open,
  onOpenChange,
  reserva,
  defaultFecha,
}: ReservaFormSheetProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(reserva?.ID_Key);

  const { data: clientes = [] } = useQuery({
    queryKey: queryKeys.clientes,
    queryFn: fetchClientes,
    staleTime: STALE.catalog,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReservaFormValues>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      Fecha: todayISO(),
      Hora: "19:00",
      Cantidad_personas: 2,
      Precio: 0,
      Preorden: false,
      Estado: "PENDIENTE",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (reserva) {
      reset({
        ID_Cliente: reserva.ID_Cliente,
        Fecha: reserva.Fecha,
        Hora: reserva.Hora?.slice(0, 5) ?? "19:00",
        Cantidad_personas: reserva.Cantidad_personas,
        Comentarios: reserva.Comentarios,
        Precio: reserva.Precio,
        Preorden: reserva.Preorden,
        Estado: reserva.Estado ?? "PENDIENTE",
        Codigo_reserva: reserva.Codigo_reserva,
      });
    } else {
      reset({
        ID_Cliente: "",
        Fecha: defaultFecha ?? todayISO(),
        Hora: "19:00",
        Cantidad_personas: 2,
        Precio: 0,
        Preorden: false,
        Estado: "PENDIENTE",
      });
    }
  }, [reserva, reset, open, defaultFecha]);

  const clienteId = watch("ID_Cliente");
  const fecha = watch("Fecha");
  const hora = watch("Hora");
  const personas = watch("Cantidad_personas");
  const estado = watch("Estado") ?? "PENDIENTE";
  const confirmarAlCrear = estado === "CONFIRMADA";

  const cliente = clientes.find((c) => c.ID_Key === clienteId);
  const canSubmit = Boolean(clienteId && fecha && hora && personas >= 1);

  const mutation = useMutation({
    mutationFn: async (values: ReservaFormValues) => {
      const payload = {
        ...values,
        Hora: values.Hora.length === 5 ? `${values.Hora}:00` : values.Hora,
        Codigo_reserva: values.Codigo_reserva ?? `RV-${Date.now()}`,
        Comentarios: values.Comentarios ?? "",
        ID_Restaurante: "",
        Estado: values.Estado ?? "PENDIENTE",
        Preorden: values.Preorden ?? false,
      };

      if (isEdit && reserva) {
        return modificarReserva(reserva.ID_Key, { ...reserva, ...payload });
      }
      return crearReserva(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservasAll });
      toast.success(isEdit ? "Reserva actualizada" : "Reserva creada");
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message || "Error al guardar"),
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="w-full sm:max-w-lg">
      <DrawerHeader>
        <DrawerTitle>{isEdit ? "Editar reserva" : "Nueva reserva"}</DrawerTitle>
        <DrawerDescription>
          {isEdit
            ? "Actualiza los datos de la reserva."
            : "Registra una reserva manual en pocos pasos."}
        </DrawerDescription>
      </DrawerHeader>

      <DrawerBody className="space-y-4">
        <form
          id="reserva-form"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
        >
          <FormSection icon={User} title="Cliente" description="Busca un cliente existente o créalo al vuelo.">
            <ClienteReservaField
              clientes={clientes}
              value={clienteId ?? ""}
              onChange={(v) => setValue("ID_Cliente", v, { shouldValidate: true })}
              error={errors.ID_Cliente?.message}
            />
          </FormSection>

          <FormSection icon={CalendarDays} title="Fecha y hora" description="Cuándo llegará el cliente.">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="Fecha">Fecha</Label>
                  <Input id="Fecha" type="date" {...register("Fecha")} />
                  {errors.Fecha && <p className="text-xs text-destructive">{errors.Fecha.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Hora">Hora</Label>
                  <Input
                    id="Hora"
                    type="time"
                    value={hora}
                    onChange={(e) => setValue("Hora", e.target.value, { shouldValidate: true })}
                  />
                  {errors.Hora && <p className="text-xs text-destructive">{errors.Hora.message}</p>}
                </div>
              </div>
              <HoraQuickPicks value={hora} onChange={(v) => setValue("Hora", v, { shouldValidate: true })} />
            </div>
          </FormSection>

          <FormSection icon={Users} title="Detalles" description="Comensales y notas para el servicio.">
            <div className="space-y-4">
              <PersonasStepper
                value={personas}
                onChange={(n) => setValue("Cantidad_personas", n, { shouldValidate: true })}
              />
              <div className="space-y-2">
                <Label htmlFor="Comentarios">Comentarios (opcional)</Label>
                <textarea
                  id="Comentarios"
                  className={textareaClass}
                  placeholder="Mesa cerca a la ventana, cumpleaños, alergias..."
                  {...register("Comentarios")}
                />
              </div>

              {!isEdit && (
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={confirmarAlCrear}
                    onChange={(e) =>
                      setValue("Estado", e.target.checked ? "CONFIRMADA" : "PENDIENTE")
                    }
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">
                    <span className="font-medium text-foreground">Confirmar al crear</span>
                    <span className="block text-xs text-muted-foreground">
                      Si no marcas esto, la reserva queda pendiente.
                    </span>
                  </span>
                </label>
              )}

              {isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="Estado">Estado</Label>
                  <SelectField
                    id="Estado"
                    value={estado}
                    onValueChange={(v) => setValue("Estado", v)}
                    options={ESTADOS_OPCIONES.map((e) => ({
                      value: e,
                      label: getEstadoConfig(e).label,
                    }))}
                  />
                </div>
              )}
            </div>
          </FormSection>
        </form>
      </DrawerBody>

      <DrawerFooter className="space-y-3">
          {cliente && fecha && hora && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{getClienteNombre(cliente)}</p>
                <p className="text-muted-foreground">
                  {formatDate(fecha)} · {formatTime(hora)} · {personas} pax
                </p>
              </div>
              <EstadoReservaBadge estado={estado} />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="reserva-form"
              className="flex-[2]"
              disabled={!canSubmit || isSubmitting || mutation.isPending}
            >
              {isSubmitting || mutation.isPending
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Crear reserva"}
            </Button>
          </div>
        </DrawerFooter>
    </Drawer>
  );
}
