"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  reservas: "Reservas",
  calendario: "Calendario",
  clientes: "Clientes",
  restaurante: "Mi restaurante",
  editar: "Editar",
  analitica: "Analítica",
  "analitica-metricas": "Métricas",
  reportes: "Reportes",
  configuraciones: "Configuraciones",
  cuenta: "Mi cuenta",
  manuales: "Manuales",
  usuarios: "Usuarios",
  roles: "Roles",
  onboarding: "Onboarding",
  login: "Iniciar sesión",
  registro: "Registro",
  negocio: "Negocio",
  ubicacion: "Ubicación",
  horarios: "Horarios",
  branding: "Branding",
  exito: "Completado",
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}>
      <Link href="/dashboard" className="hover:text-foreground" aria-label="Ir al panel">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label = LABELS[segment] ?? segment;

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
