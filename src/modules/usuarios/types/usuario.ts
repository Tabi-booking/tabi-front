import type { LegacyResult } from "@/shared/types/api";

export interface Usuario extends LegacyResult {
  ID_Key: string;
  Nombre: string;
  Apellido: string;
  Telefono: string;
  Correo: string;
  Contrasena?: string;
  Tipo_Documento: string;
  Numero_Documento: string;
  ID_Rol: string;
  ID_Restaurante: string;
}
