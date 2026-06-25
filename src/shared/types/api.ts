export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiErrorBody {
  detail: string | Array<{ msg: string; loc: string[] }>;
  error_type?: string;
}

export interface LegacyResult {
  resultado?: string;
}

export function isLegacyFailure(resultado?: string): boolean {
  return Boolean(resultado?.includes("Fallido:"));
}
