import { z } from "zod";

const telefonoSchema = z
  .string()
  .min(7, "Mínimo 7 dígitos")
  .regex(/^[\d\s+()-]+$/, "Solo números y símbolos de teléfono");

const documentoSchema = z.string().min(5, "Mínimo 5 caracteres");

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Za-z]/, "Debe incluir al menos una letra")
  .regex(/\d/, "Debe incluir al menos un número");

export const cuentaProfileSchema = z
  .object({
    Nombre: z.string().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),
    Apellido: z.string().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),
    Telefono: telefonoSchema,
    Tipo_Documento: z.string().min(1, "Tipo de documento requerido"),
    Numero_Documento: documentoSchema,
    ContrasenaActual: z.string().optional(),
    Contrasena: z.string().optional(),
    ContrasenaConfirm: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const password = data.Contrasena?.trim() ?? "";
    const confirm = data.ContrasenaConfirm?.trim() ?? "";
    const current = data.ContrasenaActual?.trim() ?? "";

    if (!password && !confirm && !current) return;

    if (password) {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: passwordResult.error.issues[0]?.message ?? "Contraseña inválida",
          path: ["Contrasena"],
        });
      }

      if (!current) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresa tu contraseña actual",
          path: ["ContrasenaActual"],
        });
      }
    }

    if (password !== confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
        path: ["ContrasenaConfirm"],
      });
    }
  });

export type CuentaFormValues = z.infer<typeof cuentaProfileSchema>;
