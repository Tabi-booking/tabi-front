export type SessionKind = "user" | "super";

export interface AuthMeProfile {
  user_id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string | null;
  permissions: string[];
  is_admin: boolean;
  telefono?: string;
  tipo_documento?: string;
  numero_documento?: string;
}

export interface AuthSession {
  access_token: string;
  token_type: "bearer";
  kind: SessionKind;
  restaurant_id: string | null;
  user_id?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  rol?: string | null;
  permissions?: string[];
  is_admin?: boolean;
}

export interface AuthMeResponse extends AuthMeProfile {
  kind: SessionKind;
  restaurant_id: string | null;
}

export interface LoginPayload {
  correo: string;
  contrasena: string;
}

export type LoginResponse = AuthSession;

export interface EmpleadoRegistro {
  Nombre: string;
  Apellido: string;
  Telefono: string;
  Correo: string;
  Contrasena: string;
  Tipo_Documento: string;
  Numero_Documento: string;
  ID_Rol?: string;
}

export interface RegistroRestaurantePayload {
  id_acceso?: string;
  Nombre: string;
  Direccion: string;
  Telefono: string;
  Calificacion?: number;
  Horarios?: string;
  Imagen_destacada?: string;
  Google_maps?: string;
  Rango_de_precios?: number;
  ID_Ubicacion?: string;
  ID_categorias?: string;
  ID_Etiqueta?: string;
  empleado?: EmpleadoRegistro;
}
