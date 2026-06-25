import { z } from "zod";

export const loginSchema = z.object({
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registroSchema = z.object({
  id_acceso: z.string().min(3, "Mínimo 3 caracteres"),
  Nombre: z.string().min(2, "Nombre del restaurante requerido"),
  Direccion: z.string().min(5, "Dirección requerida"),
  Telefono: z.string().min(7, "Teléfono requerido"),
  Rango_de_precios: z.number().min(1).max(4),
  empleadoNombre: z.string().min(2),
  empleadoApellido: z.string().min(2),
  empleadoTelefono: z.string().min(7),
  empleadoCorreo: z.string().email(),
  empleadoContrasena: z.string().min(8, "Mínimo 8 caracteres"),
  empleadoTipoDocumento: z.string().min(1),
  empleadoNumeroDocumento: z.string().min(5),
});

export type RegistroFormValues = z.infer<typeof registroSchema>;
