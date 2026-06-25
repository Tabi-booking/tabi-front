import { z } from "zod";

export const rolSchema = z.object({
  Nombre: z.string().min(1, "Nombre requerido"),
});

export type RolFormValues = z.infer<typeof rolSchema>;
