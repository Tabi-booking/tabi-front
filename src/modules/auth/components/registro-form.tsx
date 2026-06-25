"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registroRestaurante } from "@/modules/auth/services/auth.service";
import { useAuth } from "@/shared/providers/auth-provider";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { registroSchema, type RegistroFormValues } from "@/modules/auth/validations/auth.schema";
import { ApiError } from "@/shared/lib/api-client";
import { SelectField } from "@/shared/components/native/select-field";

const RANGO_OPTIONS = [
  { value: "1", label: "$" },
  { value: "2", label: "$$" },
  { value: "3", label: "$$$" },
  { value: "4", label: "$$$$" },
];

export function RegistroForm() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      Rango_de_precios: 2,
      empleadoTipoDocumento: "CC",
    },
  });

  const rango = watch("Rango_de_precios");

  const onSubmit = async (values: RegistroFormValues) => {
    try {
      await registroRestaurante({
        id_acceso: values.id_acceso,
        Nombre: values.Nombre,
        Direccion: values.Direccion,
        Telefono: values.Telefono,
        Rango_de_precios: values.Rango_de_precios,
        empleado: {
          Nombre: values.empleadoNombre,
          Apellido: values.empleadoApellido,
          Telefono: values.empleadoTelefono,
          Correo: values.empleadoCorreo,
          Contrasena: values.empleadoContrasena,
          Tipo_Documento: values.empleadoTipoDocumento,
          Numero_Documento: values.empleadoNumeroDocumento,
        },
      });

      await login({ correo: values.empleadoCorreo, contrasena: values.empleadoContrasena });
      toast.success("Restaurante registrado correctamente");
      router.push("/onboarding/ubicacion");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error al registrar";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Restaurante</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="Nombre">Nombre del restaurante</Label>
            <Input id="Nombre" {...register("Nombre")} />
            {errors.Nombre && <p className="text-xs text-destructive">{errors.Nombre.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_acceso">Código de acceso (slug)</Label>
            <Input id="id_acceso" placeholder="mi-restaurante" {...register("id_acceso")} />
            {errors.id_acceso && <p className="text-xs text-destructive">{errors.id_acceso.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Rango de precios</Label>
            <SelectField
              value={String(rango)}
              onValueChange={(v) => setValue("Rango_de_precios", Number(v))}
              options={RANGO_OPTIONS}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="Direccion">Dirección</Label>
            <Input id="Direccion" {...register("Direccion")} />
            {errors.Direccion && <p className="text-xs text-destructive">{errors.Direccion.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="Telefono">Teléfono</Label>
            <Input id="Telefono" {...register("Telefono")} />
            {errors.Telefono && <p className="text-xs text-destructive">{errors.Telefono.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Administrador</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="empleadoNombre">Nombre</Label>
            <Input id="empleadoNombre" {...register("empleadoNombre")} />
            {errors.empleadoNombre && <p className="text-xs text-destructive">{errors.empleadoNombre.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="empleadoApellido">Apellido</Label>
            <Input id="empleadoApellido" {...register("empleadoApellido")} />
            {errors.empleadoApellido && <p className="text-xs text-destructive">{errors.empleadoApellido.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="empleadoCorreo">Correo</Label>
            <Input id="empleadoCorreo" type="email" {...register("empleadoCorreo")} />
            {errors.empleadoCorreo && <p className="text-xs text-destructive">{errors.empleadoCorreo.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="empleadoContrasena">Contraseña</Label>
            <Input id="empleadoContrasena" type="password" {...register("empleadoContrasena")} />
            {errors.empleadoContrasena && <p className="text-xs text-destructive">{errors.empleadoContrasena.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="empleadoTelefono">Teléfono</Label>
            <Input id="empleadoTelefono" {...register("empleadoTelefono")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="empleadoNumeroDocumento">Documento</Label>
            <Input id="empleadoNumeroDocumento" {...register("empleadoNumeroDocumento")} />
            {errors.empleadoNumeroDocumento && (
              <p className="text-xs text-destructive">{errors.empleadoNumeroDocumento.message}</p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
