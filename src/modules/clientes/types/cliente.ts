export interface Cliente {
  ID_Key: string;
  Nombre: string;
  Apellido: string;
  Telefono: string;
  Correo: string;
  Contrasena?: string;
  Tipo_Documento: string;
  Numero_Documento: string;
  resultado?: string;
}
