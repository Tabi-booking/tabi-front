const DEFAULT_REGISTRO_URL = "https://registro.tabiapp.tech/registro";

export function getRegistroUrl(): string {
  return process.env.NEXT_PUBLIC_REGISTRO_URL ?? DEFAULT_REGISTRO_URL;
}
