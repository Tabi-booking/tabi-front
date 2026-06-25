export const STALE = {
  catalog: 10 * 60_000,
  operational: 60_000,
  analytics: 2 * 60_000,
} as const;

export const ANALYTICS_REFETCH_MS = 30_000;
