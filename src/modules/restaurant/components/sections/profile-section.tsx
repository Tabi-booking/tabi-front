"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { RestaurantMeResponse } from "@/modules/restaurant/types/restaurant-profile";
import {
  profileSectionSchema,
  type ProfileSectionValues,
} from "@/modules/restaurant/validations/restaurant-profile.schema";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { ApiError } from "@/shared/lib/api-client";

interface ProfileSectionProps {
  data: RestaurantMeResponse;
  isSaving: boolean;
  onSave: (body: Parameters<typeof import("@/modules/restaurant/services/restaurant-profile.service").patchRestaurantMe>[0]) => Promise<unknown>;
}

export function ProfileSection({ data, isSaving, onSave }: ProfileSectionProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileSectionValues>({
    resolver: zodResolver(profileSectionSchema),
    defaultValues: {
      nombre: data.profile.nombre ?? "",
      razon_social: data.profile.razon_social ?? "",
      descripcion: data.profile.descripcion ?? "",
      sitio_web: data.profile.sitio_web ?? "",
      instagram: data.profile.redes_sociales?.instagram ?? "",
      facebook: data.profile.redes_sociales?.facebook ?? "",
    },
  });

  useEffect(() => {
    reset({
      nombre: data.profile.nombre ?? "",
      razon_social: data.profile.razon_social ?? "",
      descripcion: data.profile.descripcion ?? "",
      sitio_web: data.profile.sitio_web ?? "",
      instagram: data.profile.redes_sociales?.instagram ?? "",
      facebook: data.profile.redes_sociales?.facebook ?? "",
    });
  }, [data, reset]);

  const onSubmit = async (values: ProfileSectionValues) => {
    try {
      await onSave({
        profile: {
          nombre: values.nombre,
          razon_social: values.razon_social || undefined,
          descripcion: values.descripcion || undefined,
          sitio_web: values.sitio_web || undefined,
          redes_sociales: {
            instagram: values.instagram ?? "",
            facebook: values.facebook ?? "",
          },
        },
      });
      toast.success("Perfil actualizado");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al guardar");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nombre">Nombre del restaurante</Label>
          <Input id="nombre" {...register("nombre")} />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="razon_social">Razón social</Label>
          <Input id="razon_social" {...register("razon_social")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <textarea
            id="descripcion"
            rows={3}
            className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register("descripcion")}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="sitio_web">Sitio web</Label>
          <Input id="sitio_web" type="url" placeholder="https://" {...register("sitio_web")} />
          {errors.sitio_web && <p className="text-xs text-destructive">{errors.sitio_web.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input id="instagram" placeholder="https://instagram.com/..." {...register("instagram")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input id="facebook" placeholder="https://facebook.com/..." {...register("facebook")} />
        </div>
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Guardando..." : "Guardar perfil"}
      </Button>
    </form>
  );
}
