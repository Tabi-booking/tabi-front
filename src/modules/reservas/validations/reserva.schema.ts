import { z } from "zod";

export const reservaSchema = z.object({
  ID_Cliente: z.string().min(1, "Selecciona un cliente"),
  Fecha: z.string().min(1, "Fecha requerida"),
  Hora: z.string().min(1, "Hora requerida"),
  Cantidad_personas: z.number().min(1).max(50),
  Comentarios: z.string().optional(),
  Precio: z.number().min(0),
  Preorden: z.boolean(),
  Estado: z.string().optional(),
  Codigo_reserva: z.string().optional(),
  ID_Restaurante: z.string().optional(),
});

export type ReservaFormValues = z.infer<typeof reservaSchema>;

export const clienteSchema = z.object({
  Nombre: z.string().min(2, "Nombre requerido (mín. 2 caracteres)"),
  Apellido: z.string().min(2, "Apellido requerido (mín. 2 caracteres)"),
  Telefono: z.string().min(7, "Teléfono inválido"),
  Correo: z.string().email("Correo inválido"),
  Tipo_Documento: z.string().min(1, "Tipo de documento requerido"),
  Numero_Documento: z.string().min(5, "Documento inválido"),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
