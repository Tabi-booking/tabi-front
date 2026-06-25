"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { RestaurantMeResponse } from "@/modules/restaurant/types/restaurant-profile";
import {
  locationSectionSchema,
  type LocationSectionValues,
} from "@/modules/restaurant/validations/restaurant-profile.schema";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { ApiError } from "@/shared/lib/api-client";

interface LocationSectionProps {
  data: RestaurantMeResponse;
  isSaving: boolean;
  onSave: (body: Parameters<typeof import("@/modules/restaurant/services/restaurant-profile.service").patchRestaurantMe>[0]) => Promise<unknown>;
}

export function LocationSection({ data, isSaving, onSave }: LocationSectionProps) {
  const { register, handleSubmit, reset } = useForm<LocationSectionValues>({
    resolver: zodResolver(locationSectionSchema),
    defaultValues: {
      pais: data.location.pais ?? "",
      departamento: data.location.departamento ?? "",
      ciudad: data.location.ciudad ?? "",
      barrio: data.location.barrio ?? "",
      direccion: data.location.direccion ?? "",
      google_maps: data.location.google_maps ?? "",
    },
  });

  useEffect(() => {
    reset({
      pais: data.location.pais ?? "",
      departamento: data.location.departamento ?? "",
      ciudad: data.location.ciudad ?? "",
      barrio: data.location.barrio ?? "",
      direccion: data.location.direccion ?? "",
      google_maps: data.location.google_maps ?? "",
    });
  }, [data, reset]);

  const onSubmit = async (values: LocationSectionValues) => {
    try {
      await onSave({ location: values });
      toast.success("Ubicación actualizada");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al guardar");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pais">País</Label>
          <Input id="pais" {...register("pais")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="departamento">Departamento</Label>
          <Input id="departamento" {...register("departamento")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input id="ciudad" {...register("ciudad")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barrio">Barrio</Label>
          <Input id="barrio" {...register("barrio")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Input id="direccion" {...register("direccion")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="google_maps">Enlace Google Maps</Label>
          <Input id="google_maps" placeholder="https://maps.google.com/..." {...register("google_maps")} />
        </div>
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Guardando..." : "Guardar ubicación"}
      </Button>
    </form>
  );
}
