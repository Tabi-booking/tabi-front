"use client";

import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { Skeleton } from "@/shared/components/native/skeleton";
import { cn } from "@/shared/lib/utils";

interface AsyncSectionProps {
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  skeletonClassName?: string;
  errorTitle?: string;
  errorDescription?: string;
  errorIcon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function AsyncSection({
  loading = false,
  error = false,
  onRetry,
  skeletonClassName = "h-72 w-full",
  errorTitle = "No se pudieron cargar los datos",
  errorDescription = "Revisa tu conexión e intenta de nuevo.",
  errorIcon = AlertCircle,
  children,
  className,
}: AsyncSectionProps) {
  if (loading) {
    return <Skeleton className={cn(skeletonClassName, className)} />;
  }

  if (error) {
    return (
      <div className={className}>
        <EmptyState
          icon={errorIcon}
          title={errorTitle}
          description={errorDescription}
          actionLabel={onRetry ? "Reintentar" : undefined}
          onAction={onRetry}
        />
      </div>
    );
  }

  return <>{children}</>;
}
