"use client";

import Link from "next/link";
import { ChevronRight, Shield, Sparkles, UserCircle } from "lucide-react";
import {
  SETTINGS_GROUP_ORDER,
  SETTINGS_GROUPS,
  SETTINGS_LINKS,
  type SettingsGroup,
  type SettingsLink,
} from "@/modules/configuraciones/lib/settings-sections";
import { getPermissionLabel } from "@/modules/roles/lib/permission-labels";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { Badge } from "@/shared/components/native/badge";
import { buttonClass } from "@/shared/lib/ui-classes";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useAuth } from "@/shared/providers/auth-provider";
import { cn } from "@/shared/lib/utils";

function getDisplayName(nombre?: string, apellido?: string, email?: string): string {
  const full = [nombre, apellido].filter(Boolean).join(" ").trim();
  if (full) return full;
  return email ?? "Usuario";
}

function getInitials(nombre?: string, apellido?: string, email?: string): string {
  const n = nombre?.trim();
  const a = apellido?.trim();
  if (n && a) return `${n[0]}${a[0]}`.toUpperCase();
  if (n) return n.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "TB";
}

function SettingsRow({ link }: { link: SettingsLink }) {
  const Icon = link.icon;

  return (
    <li>
      <Link
        href={link.href}
        className={cn(
          "group flex items-center gap-4 px-4 py-4 transition-colors sm:px-5",
          "hover:bg-accent/40",
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-[18px] w-[18px] text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{link.title}</p>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{link.description}</p>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
          aria-hidden
        />
      </Link>
    </li>
  );
}

function SettingsGroupSection({
  group,
  links,
}: {
  group: SettingsGroup;
  links: SettingsLink[];
}) {
  if (links.length === 0) return null;

  const meta = SETTINGS_GROUPS[group];

  return (
    <section>
      <div className="mb-3 px-1">
        <h2 className="text-sm font-semibold text-foreground">{meta.label}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{meta.description}</p>
      </div>
      <nav aria-label={meta.label}>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {links.map((link) => (
            <SettingsRow key={link.id} link={link} />
          ))}
        </ul>
      </nav>
    </section>
  );
}

export function ConfiguracionesContent() {
  const { session } = useAuth();
  const { permissions, isAdmin, canReadUsers, can } = usePermissions();

  const visibility = {
    isAdmin,
    canReadUsers,
    canWriteRestaurant: can("restaurant.write"),
    canReadRestaurant: can("restaurant.read"),
  };

  const links = SETTINGS_LINKS.filter((link) => !link.visible || link.visible(visibility));
  const linksByGroup = SETTINGS_GROUP_ORDER.reduce(
    (acc, group) => {
      acc[group] = links.filter((link) => link.group === group);
      return acc;
    },
    {} as Record<SettingsGroup, SettingsLink[]>,
  );

  const displayName = getDisplayName(session?.nombre, session?.apellido, session?.email);

  return (
    <AppPageShell
      title="Configuraciones"
      description="Tu cuenta, el restaurante y los accesos del equipo"
      className="max-w-2xl"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
            {getInitials(session?.nombre, session?.apellido, session?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold tracking-tight text-foreground">{displayName}</p>
              {isAdmin && (
                <Badge variant="secondary" className="gap-1 border-primary/20 bg-primary/10 text-primary">
                  <Sparkles className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{session?.email ?? "—"}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Rol:{" "}
              <span className="font-medium text-foreground">{session?.rol ?? "Sin asignar"}</span>
            </p>
            <Link
              href="/cuenta"
              className={buttonClass("outline", "sm", "mt-4 inline-flex gap-2")}
            >
              <UserCircle className="h-4 w-4" />
              Editar perfil
            </Link>
          </div>
        </div>
        {session?.restaurant_id && (
          <div className="border-t border-border bg-secondary/30 px-5 py-2.5 sm:px-6">
            <p className="text-xs text-muted-foreground">
              Local activo · <span className="font-medium text-foreground">#{session.restaurant_id}</span>
            </p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {SETTINGS_GROUP_ORDER.map((group) => (
          <SettingsGroupSection key={group} group={group} links={linksByGroup[group]} />
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Permisos de tu rol</h2>
              {permissions.length > 0 && (
                <Badge variant="outline" className="text-muted-foreground">
                  {permissions.length}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Acciones disponibles en el panel. El servidor valida cada operación.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {permissions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-6 text-center text-sm text-muted-foreground">
              No hay permisos cargados. Cierra sesión y vuelve a entrar.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <li
                  key={permission}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {getPermissionLabel(permission)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppPageShell>
  );
}
