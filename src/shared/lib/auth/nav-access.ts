import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Eye,
  FileText,
  LayoutDashboard,
  LineChart,
  List,
  Pencil,
  Settings,
  Shield,
  Store,
  UserCog,
  Users,
} from "lucide-react";
import type { AuthSession } from "@/shared/types/auth";
import {
  canAccessAnalytics,
  canReadClients,
  canReadReservations,
  canReadRestaurant,
  canReadUsers,
  canWriteRestaurant,
  canWriteReservations,
} from "@/shared/lib/auth/permissions";

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  visible: (session: AuthSession | null) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    visible: (s) => Boolean(s?.access_token),
  },
  {
    path: "/reservas",
    label: "Lista de reservas",
    icon: List,
    visible: (s) => canReadReservations(s),
  },
  {
    path: "/reservas/calendario",
    label: "Calendario",
    icon: Calendar,
    visible: (s) => canReadReservations(s),
  },
  {
    path: "/clientes",
    label: "Clientes",
    icon: Users,
    visible: (s) => canReadClients(s),
  },
  {
    path: "/usuarios",
    label: "Usuarios",
    icon: UserCog,
    visible: (s) => canReadUsers(s),
  },
  {
    path: "/roles",
    label: "Roles y permisos",
    icon: Shield,
    visible: (s) => canReadUsers(s),
  },
  {
    path: "/restaurante",
    label: "Ver mi restaurante",
    icon: Eye,
    visible: (s) => canReadRestaurant(s),
  },
  {
    path: "/restaurante/editar",
    label: "Editar mi restaurante",
    icon: Pencil,
    visible: (s) => canWriteRestaurant(s),
  },
  {
    path: "/analitica",
    label: "Analítica",
    icon: LineChart,
    visible: (s) => canAccessAnalytics(s),
  },
  {
    path: "/reportes",
    label: "Reportes",
    icon: FileText,
    visible: (s) => canAccessAnalytics(s),
  },
  {
    path: "/configuraciones",
    label: "Configuraciones",
    icon: Settings,
    visible: (s) => Boolean(s?.access_token),
  },
  {
    path: "/manuales",
    label: "Manuales de uso",
    icon: BookOpen,
    visible: (s) => Boolean(s?.access_token),
  },
];

export function getVisibleNavItems(session: AuthSession | null): NavItem[] {
  return NAV_ITEMS.filter((item) => item.visible(session));
}

export function canAccessPath(session: AuthSession | null, path: string): boolean {
  const sorted = [...NAV_ITEMS].sort((a, b) => b.path.length - a.path.length);
  const item = sorted.find((n) => path === n.path || path.startsWith(`${n.path}/`));
  if (!item) return Boolean(session?.access_token);
  return item.visible(session);
}

export function showReservasNav(session: AuthSession | null): boolean {
  return canReadReservations(session);
}

export function showClientesNav(session: AuthSession | null): boolean {
  return canReadClients(session);
}

export function showTeamNav(session: AuthSession | null): boolean {
  return canReadUsers(session);
}

export function showRestauranteNav(session: AuthSession | null): boolean {
  return canReadRestaurant(session) || canWriteRestaurant(session);
}

export function showAnaliticaNav(session: AuthSession | null): boolean {
  return canAccessAnalytics(session);
}

export function showNewReservaFab(session: AuthSession | null): boolean {
  return canWriteReservations(session);
}

export const SIDEBAR_ANALITICA_ICON = BarChart3;
export const SIDEBAR_RESTAURANTE_ICON = Store;
