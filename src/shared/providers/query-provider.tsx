"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/shared/lib/api-client";
import { STALE } from "@/shared/lib/query-config";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
        { ssr: false },
      )
    : () => null;

function handleForbiddenError(error: unknown): void {
  if (error instanceof ApiError && error.status === 403) {
    toast.error(error.message);
  }
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleForbiddenError,
        }),
        defaultOptions: {
          queries: {
            staleTime: STALE.operational,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            onError: handleForbiddenError,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
