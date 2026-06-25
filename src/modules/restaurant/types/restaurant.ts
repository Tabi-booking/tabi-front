export interface Restaurante {
  ID_Key: string;
  id_acceso: string;
  Nombre: string;
  Direccion: string;
  Telefono: string;
  Calificacion: number;
  Horarios: string;
  Imagen_destacada: string;
  Google_maps: string;
  Rango_de_precios: number;
  ID_Ubicacion: string;
  ID_categorias: string;
  ID_Etiqueta: string;
  resultado?: string;
}

export interface MiRestauranteResponse {
  restaurante: Restaurante;
  horarios: Horario[];
  rangos_precio: RangoPrecio[];
  calificacion_promedio: number;
  calificacion_cantidad: number;
}

export interface Horario {
  ID_Key: string;
  ID_Restaurante: string;
  Dia_semana: number;
  Hora_apertura: string;
  Hora_cierre: string;
  Etiqueta_dia?: string;
  Activo: boolean;
  resultado?: string;
}

export interface RangoPrecio {
  ID_Key: string;
  ID_Restaurante: string;
  Nivel: string;
  Es_principal: boolean;
  Notas: string;
  resultado?: string;
}
