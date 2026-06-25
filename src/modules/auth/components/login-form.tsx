"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/auth-provider";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { loginSchema, type LoginFormValues } from "@/modules/auth/validations/auth.schema";
import { ApiError } from "@/shared/lib/api-client";
import { getRegistroUrl } from "@/shared/lib/registro-url";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correo: "", contrasena: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      toast.success("Bienvenido a Tabi");
      router.push(redirect);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error al iniciar sesión";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="correo">Correo</Label>
        <Input id="correo" type="email" placeholder="tu@restaurante.com" {...register("correo")} />
        {errors.correo && <p className="text-xs text-destructive">{errors.correo.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="contrasena">Contraseña</Label>
        <Input id="contrasena" type="password" {...register("contrasena")} />
        {errors.contrasena && <p className="text-xs text-destructive">{errors.contrasena.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <a href={getRegistroUrl()} className="font-medium text-primary hover:underline">
          Registra tu restaurante
        </a>
      </p>
    </form>
  );
}
