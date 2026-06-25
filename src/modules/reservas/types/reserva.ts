export type ReservaEstado = "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | string;

export interface Reserva {
  ID_Key: string;
  Cantidad_personas: number;
  Fecha: string;
  Hora: string;
  Codigo_reserva: string;
  Comentarios: string;
  Precio: number;
  Preorden: boolean;
  ID_Restaurante: string;
  ID_Cliente: string;
  Estado: ReservaEstado | null;
  resultado?: string;
}

export interface ReservaAlta extends Omit<Reserva, "ID_Key" | "resultado"> {
  ID_Key?: string;
}
