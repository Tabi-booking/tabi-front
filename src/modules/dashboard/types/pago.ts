export interface Pago {
  ID_Key: string;
  Nombre_Cliente: string;
  Subtotal: number;
  Iva: number;
  Total: number;
  Metodo_de_pago: string;
  Fecha: string;
  ID_Pedido: string;
}
