import { fetchAuthMe, mergeAuthProfile } from "@/modules/auth/services/auth.service";
import { fetchUsuarioById, modificarUsuario } from "@/modules/usuarios/services/usuario.service";
import type { Usuario } from "@/modules/usuarios/types/usuario";
import type { CuentaFormValues } from "@/modules/cuenta/validations/cuenta.schema";
import { api, ApiError } from "@/shared/lib/api-client";
import type { AuthMeResponse, AuthSession } from "@/shared/types/auth";

export interface MyProfileDetails {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  rol: string | null;
  userId: string | null;
  restaurantId: string | null;
}

export interface PatchAuthMePayload {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  tipo_documento?: string;
  numero_documento?: string;
  contrasena_actual?: string;
  contrasena?: string;
}

function mapAuthMeToProfile(me: AuthMeResponse): MyProfileDetails {
  return {
    nombre: me.nombre ?? "",
    apellido: me.apellido ?? "",
    email: me.email ?? "",
    telefono: me.telefono ?? "",
    tipoDocumento: me.tipo_documento ?? "CC",
    numeroDocumento: me.numero_documento ?? "",
    rol: me.rol,
    userId: me.user_id ?? null,
    restaurantId: me.restaurant_id,
  };
}

function mapUsuarioToProfile(usuario: Usuario, me: AuthMeResponse): MyProfileDetails {
  return {
    nombre: usuario.Nombre || me.nombre || "",
    apellido: usuario.Apellido || me.apellido || "",
    email: usuario.Correo || me.email || "",
    telefono: usuario.Telefono ?? "",
    tipoDocumento: usuario.Tipo_Documento || "CC",
    numeroDocumento: usuario.Numero_Documento ?? "",
    rol: me.rol,
    userId: usuario.ID_Key || me.user_id || null,
    restaurantId: me.restaurant_id,
  };
}

export async function fetchMyProfile(): Promise<MyProfileDetails> {
  const me = await fetchAuthMe();

  if (me.user_id) {
    try {
      const usuario = await fetchUsuarioById(me.user_id);
      return mapUsuarioToProfile(usuario, me);
    } catch {
      return mapAuthMeToProfile(me);
    }
  }

  return mapAuthMeToProfile(me);
}

function toPatchPayload(values: CuentaFormValues): PatchAuthMePayload {
  const payload: PatchAuthMePayload = {
    nombre: values.Nombre.trim(),
    apellido: values.Apellido.trim(),
    telefono: values.Telefono.trim(),
    tipo_documento: values.Tipo_Documento,
    numero_documento: values.Numero_Documento.trim(),
  };

  const password = values.Contrasena?.trim();
  const current = values.ContrasenaActual?.trim();
  if (password) {
    payload.contrasena = password;
    if (current) payload.contrasena_actual = current;
  }

  return payload;
}

function toLegacyUsuario(
  usuario: Usuario,
  values: CuentaFormValues,
  session: AuthSession,
): Usuario {
  const password = values.Contrasena?.trim();
  return {
    ...usuario,
    Nombre: values.Nombre.trim(),
    Apellido: values.Apellido.trim(),
    Telefono: values.Telefono.trim(),
    Tipo_Documento: values.Tipo_Documento,
    Numero_Documento: values.Numero_Documento.trim(),
    Correo: usuario.Correo || session.email || "",
    ID_Rol: usuario.ID_Rol,
    ID_Restaurante: usuario.ID_Restaurante || session.restaurant_id || "",
    ...(password ? { Contrasena: password } : {}),
  };
}

export async function updateMyProfile(
  session: AuthSession,
  usuario: Usuario | null,
  values: CuentaFormValues,
): Promise<AuthSession> {
  const patchPayload = toPatchPayload(values);

  try {
    const updated = await api<AuthMeResponse>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(patchPayload),
    });
    return mergeAuthProfile(session, updated);
  } catch (err) {
    const canFallback =
      err instanceof ApiError &&
      (err.status === 404 || err.status === 405 || err.status === 501) &&
      Boolean(session.user_id && usuario);

    if (!canFallback || !session.user_id || !usuario) throw err;

    await modificarUsuario(session.user_id, toLegacyUsuario(usuario, values, session));
    const refreshed = await fetchAuthMe();
    return mergeAuthProfile(session, refreshed);
  }
}

export function profileToFormValues(profile: MyProfileDetails): CuentaFormValues {
  return {
    Nombre: profile.nombre,
    Apellido: profile.apellido,
    Telefono: profile.telefono,
    Tipo_Documento: profile.tipoDocumento || "CC",
    Numero_Documento: profile.numeroDocumento,
    ContrasenaActual: "",
    Contrasena: "",
    ContrasenaConfirm: "",
  };
}
