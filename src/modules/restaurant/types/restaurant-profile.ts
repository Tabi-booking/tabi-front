export interface RestaurantProfile {
  nombre: string;
  razon_social?: string | null;
  descripcion?: string | null;
  sitio_web?: string | null;
  redes_sociales?: Record<string, string>;
  restaurant_type?: string | null;
}

export interface RestaurantLocation {
  pais?: string | null;
  departamento?: string | null;
  ciudad?: string | null;
  barrio?: string | null;
  direccion?: string | null;
  google_maps?: string | null;
}

export interface RestaurantOwner {
  nombre?: string | null;
  apellido?: string | null;
  correo?: string | null;
  telefono?: string | null;
}

export interface RestaurantContact {
  telefono?: string | null;
  owner?: RestaurantOwner | null;
}

export interface RestaurantHorario {
  id?: string;
  dia_semana?: number;
  hora_apertura?: string;
  hora_cierre?: string;
  activo?: boolean;
}

export interface RestaurantOperations {
  horarios_resumen?: string | null;
  capacidad_asientos?: number | null;
  numero_mesas?: number | null;
  horarios?: RestaurantHorario[];
}

export interface RestaurantFeatures {
  cuisine_types?: string[];
  services_offered?: string[];
  reservation_types?: string[];
}

export interface RestaurantCover {
  id: string;
  url: string;
  storage_key?: string;
  orden?: number;
}

export interface RestaurantDocument {
  id?: string;
  url?: string;
  storage_key?: string;
  filename?: string;
}

export interface RestaurantMedia {
  logo_url?: string | null;
  covers?: RestaurantCover[];
  documents?: RestaurantDocument[];
}

export interface RestaurantSubscription {
  plan?: string | null;
  ciclo_facturacion?: string | null;
  estado?: string | null;
}

export interface RestaurantOnboarding {
  paso?: number;
  estado?: "draft" | "submitted" | string;
  pct?: number;
  enviado_en?: string | null;
}

export interface RestaurantMeta {
  calificacion_promedio?: number | null;
  calificacion_cantidad?: number;
  rangos_precio?: unknown[];
  activo?: boolean;
  id_acceso?: string | null;
}

export interface RestaurantMeResponse {
  id: string;
  profile: RestaurantProfile;
  location: RestaurantLocation;
  contact: RestaurantContact;
  operations: RestaurantOperations;
  features: RestaurantFeatures;
  media: RestaurantMedia;
  subscription: RestaurantSubscription;
  onboarding: RestaurantOnboarding;
  meta: RestaurantMeta;
}

export interface RestaurantMePatch {
  profile?: Partial<RestaurantProfile>;
  location?: Partial<RestaurantLocation>;
  contact?: Partial<RestaurantContact>;
  operations?: Partial<RestaurantOperations>;
  features?: Partial<RestaurantFeatures>;
}

export type UploadDocumentType = "logo" | "cover" | "business_doc";

export interface PresignedUploadRequest {
  document_type: UploadDocumentType;
  filename: string;
  mime_type: string;
}

export interface PresignedUploadResponse {
  storage_key: string;
  upload_url: string;
  expires_in: number;
}

export interface ConfirmUploadRequest {
  document_type: UploadDocumentType;
  storage_key: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
}

export interface ConfirmUploadResponse {
  storage_key: string;
  public_url: string;
  document_type: UploadDocumentType;
}
