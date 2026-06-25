"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { RestaurantMeResponse } from "@/modules/restaurant/types/restaurant-profile";
import {
  operationsSectionSchema,
  type OperationsSectionValues,
} from "@/modules/restaurant/validations/restaurant-profile.schema";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { ApiError } from "@/shared/lib/api-client";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface OperationsSectionProps {
  data: RestaurantMeResponse;
  isSaving: boolean;
  onSave: (body: Parameters<typeof import("@/modules/restaurant/services/restaurant-profile.service").patchRestaurantMe>[0]) => Promise<unknown>;
}

export function OperationsSection({ data, isSaving, onSave }: OperationsSectionProps) {
  const { register, handleSubmit, reset } = useForm<OperationsSectionValues>({
    resolver: zodResolver(operationsSectionSchema),
    defaultValues: {
      capacidad_asientos:
        data.operations.capacidad_asientos != null ? String(data.operations.capacidad_asientos) : "",
      numero_mesas:
        data.operations.numero_mesas != null ? String(data.operations.numero_mesas) : "",
    },
  });

  useEffect(() => {
    reset({
      capacidad_asientos:
        data.operations.capacidad_asientos != null ? String(data.operations.capacidad_asientos) : "",
      numero_mesas:
        data.operations.numero_mesas != null ? String(data.operations.numero_mesas) : "",
    });
  }, [data, reset]);

  const onSubmit = async (values: OperationsSectionValues) => {
    try {
      const capacidad = values.capacidad_asientos?.trim();
      const mesas = values.numero_mesas?.trim();
      await onSave({
        operations: {
          capacidad_asientos: capacidad ? Number(capacidad) : undefined,
          numero_mesas: mesas ? Number(mesas) : undefined,
        },
      });
      toast.success("Operaciones actualizadas");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al guardar");
    }
  };

  const horarios = data.operations.horarios ?? [];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="capacidad_asientos">Capacidad (asientos)</Label>
            <Input id="capacidad_asientos" type="number" min={0} {...register("capacidad_asientos")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero_mesas">Número de mesas</Label>
            <Input id="numero_mesas" type="number" min={0} {...register("numero_mesas")} />
          </div>
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar operaciones"}
        </Button>
      </form>

      <div className="rounded-xl border border-border p-4">
        <p className="mb-3 text-sm font-semibold">Horarios</p>
        {data.operations.horarios_resumen && (
          <p className="mb-3 text-sm text-muted-foreground">{data.operations.horarios_resumen}</p>
        )}
        {horarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin horarios detallados. Edítalos desde el registro si aún no están configurados.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {horarios.map((h, i) => (
              <li key={h.id ?? i} className="flex justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span>{DAY_LABELS[h.dia_semana ?? 0] ?? `Día ${h.dia_semana}`}</span>
                <span className="text-muted-foreground">
                  {h.hora_apertura?.slice(0, 5)} — {h.hora_cierre?.slice(0, 5)}
                  {!h.activo && " (inactivo)"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
