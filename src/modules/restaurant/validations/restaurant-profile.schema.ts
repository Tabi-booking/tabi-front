import { z } from "zod";

export const profileSectionSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  razon_social: z.string().optional(),
  descripcion: z.string().optional(),
  sitio_web: z.string().url("URL inválida").optional().or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
});

export const locationSectionSchema = z.object({
  pais: z.string().optional(),
  departamento: z.string().optional(),
  ciudad: z.string().optional(),
  barrio: z.string().optional(),
  direccion: z.string().optional(),
  google_maps: z.string().optional(),
});

export const contactSectionSchema = z.object({
  telefono: z.string().optional(),
  owner_nombre: z.string().optional(),
  owner_apellido: z.string().optional(),
  owner_correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  owner_telefono: z.string().optional(),
});

export const operationsSectionSchema = z.object({
  capacidad_asientos: z.string().optional(),
  numero_mesas: z.string().optional(),
});

export const featuresSectionSchema = z.object({
  cuisine_types: z.string().optional(),
  services_offered: z.string().optional(),
  reservation_types: z.string().optional(),
});

export type ProfileSectionValues = z.infer<typeof profileSectionSchema>;
export type LocationSectionValues = z.infer<typeof locationSectionSchema>;
export type ContactSectionValues = z.infer<typeof contactSectionSchema>;
export type OperationsSectionValues = z.infer<typeof operationsSectionSchema>;
export type FeaturesSectionValues = z.infer<typeof featuresSectionSchema>;

export function splitList(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinList(items: string[] | undefined): string {
  return (items ?? []).join(", ");
}
