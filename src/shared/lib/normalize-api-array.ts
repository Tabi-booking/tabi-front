export function normalizeApiArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    const firstArray = Object.values(obj).find(Array.isArray);
    if (firstArray) return firstArray as T[];
  }
  return [];
}
