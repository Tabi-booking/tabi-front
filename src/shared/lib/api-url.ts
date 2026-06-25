export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

export function getApiV1Url(): string {
  return `${getApiBaseUrl()}/api/v1`;
}
