"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  IdCard,
  KeyRound,
  Loader2,
  Mail,
  Shield,
  UserRound,
  WifiOff,
} from "lucide-react";
import { useMyProfile } from "@/modules/cuenta/hooks/use-my-profile";
import {
  cuentaProfileSchema,
  type CuentaFormValues,
} from "@/modules/cuenta/validations/cuenta.schema";
import { profileToFormValues } from "@/modules/cuenta/services/cuenta.service";
import { FormSection } from "@/modules/reservas/components/form-section";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { Badge } from "@/shared/components/native/badge";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { SelectField } from "@/shared/components/native/select-field";
import { Skeleton } from "@/shared/components/native/skeleton";
import { cn } from "@/shared/lib/utils";

const DOCUMENTO_OPTIONS = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PA", label: "Pasaporte" },
  { value: "NIT", label: "NIT" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function PasswordInput({
  id,
  error,
  placeholder,
  autoComplete,
  ...props
}: React.ComponentProps<typeof Input> & { error?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn("pr-10", error && "border-destructive")}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

function getInitials(nombre: string, apellido: string, email: string): string {
  const n = nombre.trim();
  const a = apellido.trim();
  if (n && a) return `${n[0]}${a[0]}`.toUpperCase();
  if (n) return n.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "TB";
}

export function CuentaContent() {
  const { session, profile, isLoading, isError, refetch, save, isSaving } = useMyProfile();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<CuentaFormValues>({
    resolver: zodResolver(cuentaProfileSchema),
    defaultValues: {
      Nombre: "",
      Apellido: "",
      Telefono: "",
      Tipo_Documento: "CC",
      Numero_Documento: "",
      ContrasenaActual: "",
      Contrasena: "",
      ContrasenaConfirm: "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    reset(profileToFormValues(profile));
  }, [profile, reset]);

  const onSubmit = async (values: CuentaFormValues) => {
    await save(values);
    reset({
      ...values,
      ContrasenaActual: "",
      Contrasena: "",
      ContrasenaConfirm: "",
    });
  };

  if (isLoading) {
    return (
      <AppPageShell title="Mi cuenta" description="Datos personales y seguridad de acceso">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </AppPageShell>
    );
  }

  if (isError || !profile) {
    return (
      <AppPageShell title="Mi cuenta">
        <EmptyState
          icon={WifiOff}
          title="No se pudo cargar tu perfil"
          description="Verifica tu conexión e inténtalo de nuevo."
          actionLabel="Reintentar"
          onAction={() => void refetch()}
        />
      </AppPageShell>
    );
  }

  const displayName = [profile.nombre, profile.apellido].filter(Boolean).join(" ").trim();

  return (
    <AppPageShell
      title="Mi cuenta"
      description="Actualiza tus datos personales y contraseña"
      className="max-w-2xl"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
            {getInitials(profile.nombre, profile.apellido, profile.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {displayName || "Usuario"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
            {profile.rol && (
              <Badge variant="secondary" className="mt-2 capitalize">
                {profile.rol}
              </Badge>
            )}
          </div>
        </div>
        {session?.is_admin && (
          <div className="border-t border-border bg-secondary/30 px-5 py-2.5 sm:px-6">
            <p className="text-xs text-muted-foreground">
              Administrador del equipo · acceso ampliado al panel
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection
          icon={UserRound}
          title="Información personal"
          description="Nombre y contacto que usamos en el panel"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" autoComplete="given-name" {...register("Nombre")} />
              <FieldError message={errors.Nombre?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" autoComplete="family-name" {...register("Apellido")} />
              <FieldError message={errors.Apellido?.message} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="correo"
                  value={profile.email}
                  readOnly
                  disabled
                  className="bg-muted/40 pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                El correo no se puede cambiar desde aquí. Contacta a un administrador si necesitas
                actualizarlo.
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" autoComplete="tel" inputMode="tel" {...register("Telefono")} />
              <FieldError message={errors.Telefono?.message} />
            </div>
          </div>
        </FormSection>

        <FormSection
          icon={IdCard}
          title="Documento de identidad"
          description="Datos de identificación del empleado"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipo-documento">Tipo</Label>
              <Controller
                name="Tipo_Documento"
                control={control}
                render={({ field }) => (
                  <SelectField
                    id="tipo-documento"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={DOCUMENTO_OPTIONS}
                  />
                )}
              />
              <FieldError message={errors.Tipo_Documento?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero-documento">Número</Label>
              <Input id="numero-documento" {...register("Numero_Documento")} />
              <FieldError message={errors.Numero_Documento?.message} />
            </div>
          </div>
        </FormSection>

        <FormSection
          icon={KeyRound}
          title="Seguridad"
          description="Deja en blanco si no quieres cambiar la contraseña"
        >
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="contrasena-actual">Contraseña actual</Label>
              <PasswordInput
                id="contrasena-actual"
                autoComplete="current-password"
                placeholder="Solo si vas a cambiar la contraseña"
                error={errors.ContrasenaActual?.message}
                {...register("ContrasenaActual")}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contrasena">Nueva contraseña</Label>
                <PasswordInput
                  id="contrasena"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  error={errors.Contrasena?.message}
                  {...register("Contrasena")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contrasena-confirm">Confirmar contraseña</Label>
                <PasswordInput
                  id="contrasena-confirm"
                  autoComplete="new-password"
                  placeholder="Repite la nueva contraseña"
                  error={errors.ContrasenaConfirm?.message}
                  {...register("ContrasenaConfirm")}
                />
              </div>
            </div>
          </div>
        </FormSection>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/configuraciones"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Volver a configuraciones
          </Link>
          <Button type="submit" disabled={isSaving || !isDirty} className="gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>

      <section className="rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Rol y permisos</p>
            <p className="mt-1">
              Tu rol <span className="capitalize text-foreground">{profile.rol ?? "sin asignar"}</span>{" "}
              define qué módulos puedes ver. Solo un administrador puede cambiarlo desde{" "}
              <Link href="/usuarios" className="text-primary hover:underline">
                Equipo
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </AppPageShell>
  );
}
