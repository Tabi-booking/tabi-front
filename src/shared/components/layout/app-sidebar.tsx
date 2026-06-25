"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Eye,
  FileText,
  LayoutDashboard,
  LineChart,
  List,
  LogOut,
  Pencil,
  Settings,
  Shield,
  Store,
  UserCog,
  Users,
} from "lucide-react";
import { useRestaurantProfile } from "@/modules/restaurant/hooks/use-restaurant-profile";
import { BrandLogo } from "@/shared/components/brand/brand-logo";
import { Button } from "@/shared/components/native/button";
import { ScrollArea } from "@/shared/components/native/scroll-area";
import { Skeleton } from "@/shared/components/native/skeleton";
import { RemoteImage } from "@/shared/components/patterns/remote-image";
import { cn } from "@/shared/lib/utils";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useRoutePrefetch } from "@/shared/hooks/use-route-prefetch";
import { useAuth } from "@/shared/providers/auth-provider";
import type { AuthSession } from "@/shared/types/auth";

const RESERVAS_CHILDREN = [
  { href: "/reservas", label: "Lista", icon: List },
  { href: "/reservas/calendario", label: "Calendario", icon: Calendar },
];

const ANALITICA_CHILDREN = [
  { href: "/analitica", label: "Analítica", icon: LineChart },
  { href: "/reportes", label: "Reportes", icon: FileText },
];

const RESTAURANTE_CHILDREN_ALL = [
  { href: "/restaurante", label: "Ver mi restaurante", icon: Eye, needsWrite: false },
  { href: "/restaurante/editar", label: "Editar mi restaurante", icon: Pencil, needsWrite: true },
] as const;

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

function getUserDisplayName(session: AuthSession | null): string {
  if (!session) return "Usuario";
  const fullName = [session.nombre, session.apellido].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  if (session.email) return session.email.split("@")[0] ?? session.email;
  return session.kind === "super" ? "Super Admin" : "Usuario";
}

function getUserInitials(session: AuthSession | null): string {
  if (!session) return "?";
  if (session.kind === "super") return "SA";
  const nombre = session.nombre?.trim();
  const apellido = session.apellido?.trim();
  if (nombre && apellido) {
    return `${nombre[0]}${apellido[0]}`.toUpperCase();
  }
  if (nombre) return nombre.slice(0, 2).toUpperCase();
  if (session.email) return session.email.slice(0, 2).toUpperCase();
  return "US";
}

function SidebarRestaurantBrandSkeleton({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return <Skeleton className="mx-auto h-10 w-10 rounded-xl" />;
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function SidebarRestaurantBrand({
  collapsed,
  restaurantName,
  logoUrl,
  isLoading,
  showRestaurant,
}: {
  collapsed?: boolean;
  restaurantName: string;
  logoUrl?: string | null;
  isLoading?: boolean;
  showRestaurant: boolean;
}) {
  if (isLoading && showRestaurant) {
    return <SidebarRestaurantBrandSkeleton collapsed={collapsed} />;
  }

  if (!showRestaurant) {
    if (collapsed) {
      return (
        <Link
          href="/dashboard"
          className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border bg-white shadow-sm"
          title="Tabi"
        >
          <BrandLogo variant="isotipo" className="h-7 w-7" />
        </Link>
      );
    }

    return <BrandLogo variant="imagotipo" inverted href="/dashboard" />;
  }

  if (collapsed) {
    return (
      <Link
        href="/restaurante"
        className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border bg-white shadow-sm"
        title={restaurantName}
      >
        {logoUrl?.trim() ? (
          <RemoteImage
            src={logoUrl}
            alt={restaurantName}
            className="h-full w-full object-cover"
          />
        ) : (
          <Store className="h-5 w-5 text-primary" />
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/restaurante"
      className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl transition-colors hover:bg-white/60"
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/80 bg-white shadow-sm ring-2 ring-primary/10">
        {logoUrl?.trim() ? (
          <RemoteImage src={logoUrl} alt={restaurantName} fill />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-secondary">
            <Store className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight text-foreground">{restaurantName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground group-hover:text-foreground/70">
          Tu restaurante
        </p>
      </div>
    </Link>
  );
}

function SidebarUserCard({
  collapsed,
  session,
  onLogout,
}: {
  collapsed?: boolean;
  session: AuthSession | null;
  onLogout: () => void;
}) {
  const displayName = getUserDisplayName(session);
  const initials = getUserInitials(session);
  const email = session?.email;

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-tabi-navy/10 text-xs font-semibold text-tabi-navy ring-2 ring-primary/15"
          title={displayName}
        >
          {initials}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
          onClick={onLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sidebar-border bg-gradient-to-br from-secondary/80 to-sidebar-accent p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-tabi-navy/10 text-sm font-semibold text-tabi-navy ring-2 ring-primary/15">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
          {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
        </div>
      </div>
      <Button
        variant="ghost"
        className="mt-2 h-8 w-full justify-start gap-2 rounded-xl px-2 text-xs text-muted-foreground hover:bg-white/70 hover:text-destructive"
        onClick={onLogout}
      >
        <LogOut className="h-3.5 w-3.5" />
        Cerrar sesión
      </Button>
    </div>
  );
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const {
    canReadUsers,
    canReadReservations,
    canReadClients,
    canReadRestaurant,
    canWriteRestaurant,
    canAccessAnalytics,
  } = usePermissions();
  const { data: restaurant, restaurantName, isLoading: isRestaurantLoading } = useRestaurantProfile();
  const logoUrl = restaurant?.media?.logo_url;
  const showRestaurant =
    Boolean(restaurant) ||
    (session?.kind === "user" && Boolean(session?.restaurant_id));

  const restauranteChildren = useMemo(
    () =>
      RESTAURANTE_CHILDREN_ALL.filter((item) =>
        item.needsWrite ? canWriteRestaurant : canReadRestaurant,
      ),
    [canReadRestaurant, canWriteRestaurant],
  );

  const showRestauranteNav = restauranteChildren.length > 0;
  const reservasActive = pathname.startsWith("/reservas");
  const analiticaActive =
    pathname.startsWith("/analitica") || pathname.startsWith("/reportes");
  const restauranteActive = pathname.startsWith("/restaurante");
  const [reservasOpen, setReservasOpen] = useState(reservasActive);
  const [analiticaOpen, setAnaliticaOpen] = useState(analiticaActive);
  const [restauranteOpen, setRestauranteOpen] = useState(restauranteActive);

  useEffect(() => {
    if (reservasActive) setReservasOpen(true);
  }, [reservasActive]);

  useEffect(() => {
    if (analiticaActive) setAnaliticaOpen(true);
  }, [analiticaActive]);

  useEffect(() => {
    if (restauranteActive) setRestauranteOpen(true);
  }, [restauranteActive]);

  const { prefetchForHref } = useRoutePrefetch();
  const prefetchProps = (href: string) => ({
    onMouseEnter: () => prefetchForHref(href),
    onFocus: () => prefetchForHref(href),
  });

  return (
    <aside
      className={cn(
        "flex h-svh flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "border-b border-sidebar-border",
          collapsed ? "px-2 py-3" : "bg-gradient-to-br from-secondary/60 via-sidebar to-sidebar-accent/40 p-3",
        )}
      >
        <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
          <SidebarRestaurantBrand
            collapsed={collapsed}
            restaurantName={restaurantName}
            logoUrl={logoUrl}
            isLoading={isRestaurantLoading}
            showRestaurant={showRestaurant}
          />
          {onToggle && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "shrink-0 rounded-xl text-muted-foreground hover:bg-white/70",
                collapsed ? "mx-auto" : "ml-auto",
              )}
              onClick={onToggle}
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        {!collapsed && (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menú
          </p>
        )}
        <nav className="flex flex-col gap-1">
          <Link
            href="/dashboard"
            {...prefetchProps("/dashboard")}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/dashboard")
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? "Dashboard" : undefined}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed && "Dashboard"}
          </Link>

          {canReadReservations &&
            (collapsed ? (
            <Link
              href="/reservas"
              {...prefetchProps("/reservas")}
              className={cn(
                "flex items-center justify-center rounded-xl px-2 py-2 text-sm font-medium transition-colors",
                reservasActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
              title="Reservas"
            >
              <CalendarDays className="h-4 w-4 shrink-0" />
            </Link>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setReservasOpen((o) => !o)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  reservasActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">Reservas</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 transition-transform", reservasOpen && "rotate-180")}
                />
              </button>
              {reservasOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border/80 pl-3">
                  {RESERVAS_CHILDREN.map(({ href, label, icon: Icon }) => {
                    const active =
                      href === "/reservas"
                        ? pathname === "/reservas"
                        : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "font-medium text-primary"
                            : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {canReadClients && (
          <Link
            href="/clientes"
            {...prefetchProps("/clientes")}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/clientes")
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? "Clientes" : undefined}
          >
            <Users className="h-4 w-4 shrink-0" />
            {!collapsed && "Clientes"}
          </Link>
          )}

          {canReadUsers && (
            <>
              <Link
                href="/usuarios"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/usuarios")
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? "Usuarios" : undefined}
              >
                <UserCog className="h-4 w-4 shrink-0" />
                {!collapsed && "Usuarios"}
              </Link>
              <Link
                href="/roles"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/roles")
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? "Roles" : undefined}
              >
                <Shield className="h-4 w-4 shrink-0" />
                {!collapsed && "Roles"}
              </Link>
            </>
          )}

          {showRestauranteNav &&
            (collapsed ? (
            <Link
              href={restauranteChildren[0]?.href ?? "/restaurante"}
              className={cn(
                "flex items-center justify-center rounded-xl px-2 py-2 text-sm font-medium transition-colors",
                restauranteActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
              title="Mi restaurante"
            >
              <Store className="h-4 w-4 shrink-0" />
            </Link>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setRestauranteOpen((o) => !o)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  restauranteActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <Store className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">Mi restaurante</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 transition-transform", restauranteOpen && "rotate-180")}
                />
              </button>
              {restauranteOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border/80 pl-3">
                  {restauranteChildren.map(({ href, label, icon: Icon }) => {
                    const active =
                      href === "/restaurante"
                        ? pathname === "/restaurante"
                        : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "font-medium text-primary"
                            : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {canAccessAnalytics &&
            (collapsed ? (
            <Link
              href="/analitica"
              className={cn(
                "flex items-center justify-center rounded-xl px-2 py-2 text-sm font-medium transition-colors",
                analiticaActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
              title="Analítica"
            >
              <BarChart3 className="h-4 w-4 shrink-0" />
            </Link>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setAnaliticaOpen((o) => !o)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  analiticaActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">Analítica</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 transition-transform", analiticaOpen && "rotate-180")}
                />
              </button>
              {analiticaOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border/80 pl-3">
                  {ANALITICA_CHILDREN.map(({ href, label, icon: Icon }) => {
                    const active =
                      href === "/analitica"
                        ? pathname === "/analitica" || pathname.startsWith("/analitica-metricas")
                        : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "font-medium text-primary"
                            : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <div className={cn("my-2", collapsed ? "px-2" : "px-3")}>
            {!collapsed && (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sistema
              </p>
            )}
            <div className="flex flex-col gap-1">
              <Link
                href="/configuraciones"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/configuraciones")
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? "Configuraciones" : undefined}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && "Configuraciones"}
              </Link>
              <Link
                href="/manuales"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/manuales")
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? "Manuales" : undefined}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                {!collapsed && "Manuales"}
              </Link>
            </div>
          </div>
        </nav>
      </ScrollArea>

      <div className={cn("border-t border-sidebar-border", collapsed ? "p-2" : "p-3")}>
        <SidebarUserCard collapsed={collapsed} session={session} onLogout={logout} />
      </div>
    </aside>
  );
}
