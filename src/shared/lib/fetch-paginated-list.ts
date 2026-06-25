import { api } from "@/shared/lib/api-client";
import { normalizeApiArray } from "@/shared/lib/normalize-api-array";
import type { PaginatedResponse } from "@/shared/types/api";

export async function fetchPaginatedList<T>(
  path: string,
): Promise<PaginatedResponse<T>> {
  const data = await api<PaginatedResponse<T> | T[]>(path);

  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      limit: data.length,
      offset: 0,
    };
  }

  return {
    items: data.items ?? [],
    total: data.total ?? data.items?.length ?? 0,
    limit: data.limit ?? 50,
    offset: data.offset ?? 0,
  };
}

export async function fetchList<T>(path: string): Promise<T[]> {
  const data = await api<T[] | { items?: T[] } | Record<string, T[]>>(path);
  return normalizeApiArray<T>(data);
}
