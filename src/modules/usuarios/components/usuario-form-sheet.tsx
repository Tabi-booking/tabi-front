"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  IdCard,
  KeyRound,
  Loader2,
  Shield,
  UserRound,
} from "lucide-react";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import { crearUsuario, modificarUsuario } from "@/modules/usuarios/services/usuario.service";
import { fetchRoles } from "@/modules/roles/services/rol.service";
import { filterAssignableRoles, isPropietarioRole } from "@/modules/roles/lib/assignable-roles";
import { getRoleDescription } from "@/modules/roles/lib/role-descriptions";
import {
  usuarioCreateSchema,
  usuarioEditSchema,
  type UsuarioFormValues,
} from "@/modules/usuarios/validations/usuario.schema";
import type { Usuario } from "@/modules/usuarios/types/usuario";
import { FormSection } from "@/modules/reservas/components/form-section";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { SelectField } from "@/shared/components/native/select-field";
import {
  Drawer,
  DrawerBody,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/native/drawer";
import { Skeleton } from "@/shared/components/native/skeleton";
import { getRestaurantId } from "@/shared/lib/auth/session";
import { cn } from "@/shared/lib/utils";

const DOCUMENTO_OPTIONS = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PA", label: "Pasaporte" },
  { value: "NIT", label: "NIT" },
];

const EMPTY_VALUES: UsuarioFormValues = {
  Nombre: "",
  Apellido: "",
  Telefono: "",
  Correo: "",
  Contrasena: "",
  ContrasenaConfirm: "",
  Tipo_Documento: "CC",
  Numero_Documento: "",
  ID_Rol: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function PasswordInput({
  id,
  error,
  placeholder,
  ...props
}: React.ComponentProps<typeof Input> & { error?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
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

interface UsuarioFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: Usuario | null;
}

export function UsuarioFormSheet({ open, onOpenChange, usuario }: UsuarioFormSheetProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(usuario?.ID_Key);

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: queryKeys.roles,
    queryFn: fetchRoles,
    staleTime: STALE.catalog,
    enabled: open,
  });

  const assignableRoles = useMemo(
    () => filterAssignableRoles(roles, usuario?.ID_Rol),
    [roles, usuario?.ID_Rol],
  );

  const currentRole = roles.find((r) => r.ID_Key === usuario?.ID_Rol);
  const isPropietario = isPropietarioRole(currentRole);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(isEdit ? usuarioEditSchema : usuarioCreateSchema),
    defaultValues: EMPTY_VALUES,
  });

  const selectedRoleId = watch("ID_Rol");
  const selectedRole = assignableRoles.find((r) => r.ID_Key === selectedRoleId);
  const roleDescription = getRoleDescription(selectedRole?.Nombre ?? currentRole?.Nombre);

  useEffect(() => {
    if (!open) return;

    reset(
      usuario
        ? {
            Nombre: usuario.Nombre,
            Apellido: usuario.Apellido,
            Telefono: usuario.Telefono,
            Correo: usuario.Correo,
            Contrasena: "",
            ContrasenaConfirm: "",
            Tipo_Documento: usuario.Tipo_Documento,
            Numero_Documento: usuario.Numero_Documento,
            ID_Rol: usuario.ID_Rol,
          }
        : {
            ...EMPTY_VALUES,
            ID_Rol: assignableRoles[0]?.ID_Key ?? "",
          },
    );
  }, [usuario, open, reset, assignableRoles]);

  const mutation = useMutation({
    mutationFn: async (values: UsuarioFormValues) => {
      const restaurantId = getRestaurantId();
      if (!restaurantId) throw new Error("No hay restaurante en sesión");

      const payload = {
        Nombre: values.Nombre,
        Apellido: values.Apellido,
        Telefono: values.Telefono,
        Correo: values.Correo,
        Tipo_Documento: values.Tipo_Documento,
        Numero_Documento: values.Numero_Documento,
        ID_Rol: values.ID_Rol,
        Contrasena: values.Contrasena?.trim() || usuario?.Contrasena || "",
        ID_Restaurante: restaurantId,
      };

      if (isEdit && usuario) {
        return modificarUsuario(usuario.ID_Key, { ...usuario, ...payload });
      }
      return crearUsuario(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuarios });
      toast.success(isEdit ? "Empleado actualizado" : "Empleado creado");
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message || "Error al guardar"),
  });

  const roleOptions = assignableRoles.map((r) => ({ value: r.ID_Key, label: r.Nombre }));

  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="w-full sm:max-w-lg">
      <DrawerHeader>
        <DrawerTitle>{isEdit ? "Editar empleado" : "Nuevo empleado"}</DrawerTitle>
        <DrawerDescription>
          {isEdit
            ? "Actualiza los datos del miembro del equipo. El correo se usa para iniciar sesión."
            : "Agrega un miembro al equipo. Recibirá acceso con el correo y contraseña que definas."}
        </DrawerDescription>
      </DrawerHeader>

      <DrawerBody>
        <form
          id="usuario-form"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-5"
        >
          <FormSection
            icon={UserRound}
            title="Datos personales"
            description="Nombre y documento de identificación"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="Nombre">Nombre</Label>
                <Input
                  id="Nombre"
                  placeholder="Ana"
                  autoComplete="given-name"
                  className={cn(errors.Nombre && "border-destructive")}
                  {...register("Nombre")}
                />
                <FieldError message={errors.Nombre?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Apellido">Apellido</Label>
                <Input
                  id="Apellido"
                  placeholder="García"
                  autoComplete="family-name"
                  className={cn(errors.Apellido && "border-destructive")}
                  {...register("Apellido")}
                />
                <FieldError message={errors.Apellido?.message} />
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={IdCard}
            title="Contacto"
            description="Correo y teléfono de contacto"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="Correo">Correo electrónico</Label>
                <Input
                  id="Correo"
                  type="email"
                  placeholder="empleado@restaurante.com"
                  autoComplete="email"
                  className={cn(errors.Correo && "border-destructive")}
                  {...register("Correo")}
                />
                <FieldError message={errors.Correo?.message} />
                <p className="text-xs text-muted-foreground">Será su usuario para ingresar al panel.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="Telefono">Teléfono</Label>
                <Input
                  id="Telefono"
                  type="tel"
                  placeholder="300 123 4567"
                  autoComplete="tel"
                  className={cn(errors.Telefono && "border-destructive")}
                  {...register("Telefono")}
                />
                <FieldError message={errors.Telefono?.message} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de documento</Label>
                  <Controller
                    name="Tipo_Documento"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onValueChange={field.onChange}
                        options={DOCUMENTO_OPTIONS}
                      />
                    )}
                  />
                  <FieldError message={errors.Tipo_Documento?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Numero_Documento">Número de documento</Label>
                  <Input
                    id="Numero_Documento"
                    placeholder="1234567890"
                    inputMode="numeric"
                    className={cn(errors.Numero_Documento && "border-destructive")}
                    {...register("Numero_Documento")}
                  />
                  <FieldError message={errors.Numero_Documento?.message} />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={Shield}
            title="Rol y acceso"
            description="Define qué puede hacer en el restaurante"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                {rolesLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : isEdit && isPropietario ? (
                  <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm">
                    <p className="font-medium">{currentRole?.Nombre ?? "Propietario"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      El rol Propietario no se puede reasignar.
                    </p>
                  </div>
                ) : roleOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay roles disponibles. Crea roles en la sección Roles.
                  </p>
                ) : (
                  <Controller
                    name="ID_Rol"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onValueChange={field.onChange}
                        options={roleOptions}
                        placeholder="Seleccionar rol"
                      />
                    )}
                  />
                )}
                <FieldError message={errors.ID_Rol?.message} />
                {roleDescription && (
                  <p className="rounded-md bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                    {roleDescription}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={KeyRound}
            title="Contraseña"
            description={
              isEdit
                ? "Déjala en blanco para mantener la actual"
                : "Mínimo 8 caracteres, con letras y números"
            }
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="Contrasena">
                  {isEdit ? "Nueva contraseña" : "Contraseña"}
                </Label>
                <PasswordInput
                  id="Contrasena"
                  placeholder={isEdit ? "Sin cambios" : "••••••••"}
                  error={errors.Contrasena?.message}
                  {...register("Contrasena")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ContrasenaConfirm">Confirmar contraseña</Label>
                <PasswordInput
                  id="ContrasenaConfirm"
                  placeholder={isEdit ? "Repite si cambias la contraseña" : "Repite la contraseña"}
                  error={errors.ContrasenaConfirm?.message}
                  {...register("ContrasenaConfirm")}
                />
              </div>
            </div>
          </FormSection>
        </form>
      </DrawerBody>

      <DrawerFooter className="flex flex-row justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={mutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="usuario-form"
          disabled={isSubmitting || mutation.isPending || rolesLoading || (!isEdit && roleOptions.length === 0)}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isEdit ? (
            "Guardar cambios"
          ) : (
            "Crear empleado"
          )}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
}
