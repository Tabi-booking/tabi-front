"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { RestaurantMeResponse } from "@/modules/restaurant/types/restaurant-profile";
import {
  contactSectionSchema,
  type ContactSectionValues,
} from "@/modules/restaurant/validations/restaurant-profile.schema";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { ApiError } from "@/shared/lib/api-client";

interface ContactSectionProps {
  data: RestaurantMeResponse;
  isSaving: boolean;
  onSave: (body: Parameters<typeof import("@/modules/restaurant/services/restaurant-profile.service").patchRestaurantMe>[0]) => Promise<unknown>;
}

export function ContactSection({ data, isSaving, onSave }: ContactSectionProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactSectionValues>({
    resolver: zodResolver(contactSectionSchema),
    defaultValues: {
      telefono: data.contact.telefono ?? "",
      owner_nombre: data.contact.owner?.nombre ?? "",
      owner_apellido: data.contact.owner?.apellido ?? "",
      owner_correo: data.contact.owner?.correo ?? "",
      owner_telefono: data.contact.owner?.telefono ?? "",
    },
  });

  useEffect(() => {
    reset({
      telefono: data.contact.telefono ?? "",
      owner_nombre: data.contact.owner?.nombre ?? "",
      owner_apellido: data.contact.owner?.apellido ?? "",
      owner_correo: data.contact.owner?.correo ?? "",
      owner_telefono: data.contact.owner?.telefono ?? "",
    });
  }, [data, reset]);

  const onSubmit = async (values: ContactSectionValues) => {
    try {
      await onSave({
        contact: {
          telefono: values.telefono || undefined,
          owner: {
            nombre: values.owner_nombre || undefined,
            apellido: values.owner_apellido || undefined,
            correo: values.owner_correo || undefined,
            telefono: values.owner_telefono || undefined,
          },
        },
      });
      toast.success("Contacto actualizado");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al guardar");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono del restaurante</Label>
        <Input id="telefono" {...register("telefono")} />
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="mb-4 text-sm font-semibold">Dueño / responsable</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="owner_nombre">Nombre</Label>
            <Input id="owner_nombre" {...register("owner_nombre")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_apellido">Apellido</Label>
            <Input id="owner_apellido" {...register("owner_apellido")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_correo">Correo</Label>
            <Input id="owner_correo" type="email" {...register("owner_correo")} />
            {errors.owner_correo && (
              <p className="text-xs text-destructive">{errors.owner_correo.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_telefono">Teléfono</Label>
            <Input id="owner_telefono" {...register("owner_telefono")} />
          </div>
        </div>
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Guardando..." : "Guardar contacto"}
      </Button>
    </form>
  );
}
