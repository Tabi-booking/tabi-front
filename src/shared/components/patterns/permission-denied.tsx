import type { LucideIcon } from "lucide-react";
import { ShieldX } from "lucide-react";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { EmptyState } from "@/shared/components/patterns/empty-state";

interface PermissionDeniedProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

export function PermissionDenied({
  title = "Sin permisos",
  description = "Tu rol no tiene acceso a esta sección. Si crees que es un error, contacta al administrador del restaurante.",
  icon = ShieldX,
}: PermissionDeniedProps) {
  return (
    <AppPageShell title={title}>
      <EmptyState icon={icon} title={title} description={description} />
    </AppPageShell>
  );
}
