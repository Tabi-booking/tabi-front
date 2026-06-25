import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Shield,
  Store,
  UserCircle,
  Users,
} from "lucide-react";

export type SettingsGroup = "cuenta" | "restaurante" | "equipo" | "ayuda";

export interface SettingsLink {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  group: SettingsGroup;
  /** Si se define, el enlace solo se muestra cuando la función retorna true */
  visible?: (ctx: SettingsVisibilityContext) => boolean;
}

export interface SettingsVisibilityContext {
  isAdmin: boolean;
  canReadUsers: boolean;
  canWriteRestaurant: boolean;
  canReadRestaurant: boolean;
}

export const SETTINGS_GROUPS: Record<
  SettingsGroup,
  { label: string; description: string }
> = {
  cuenta: {
    label: "Tu cuenta",
    description: "Perfil personal y seguridad de acceso",
  },
  restaurante: {
    label: "Restaurante",
    description: "Perfil, horarios y cómo te ven los comensales",
  },
  equipo: {
    label: "Equipo",
    description: "Personas, roles y accesos al panel",
  },
  ayuda: {
    label: "Ayuda",
    description: "Guías para sacarle provecho a Tabi",
  },
};

export const SETTINGS_GROUP_ORDER: SettingsGroup[] = [
  "cuenta",
  "restaurante",
  "equipo",
  "ayuda",
];

export const SETTINGS_LINKS: SettingsLink[] = [
  {
    id: "cuenta",
    title: "Editar mi perfil",
    description: "Nombre, teléfono, documento y contraseña.",
    href: "/cuenta",
    icon: UserCircle,
    group: "cuenta",
  },
  {
    id: "restaurante",
    title: "Perfil del restaurante",
    description: "Datos del local, horarios, fotos y ficha pública.",
    href: "/restaurante/editar",
    icon: Store,
    group: "restaurante",
    visible: (ctx) => ctx.canReadRestaurant || ctx.canWriteRestaurant,
  },
  {
    id: "usuarios",
    title: "Equipo y empleados",
    description: "Invita a tu equipo y define quién puede hacer qué.",
    href: "/usuarios",
    icon: Users,
    group: "equipo",
    visible: (ctx) => ctx.canReadUsers,
  },
  {
    id: "roles",
    title: "Roles y permisos",
    description: "Mesero, cajero, admin: qué puede hacer cada rol.",
    href: "/roles",
    icon: Shield,
    group: "equipo",
    visible: (ctx) => ctx.canReadUsers,
  },
  {
    id: "manuales",
    title: "Manuales de uso",
    description: "Paso a paso para reservas, el local y el equipo.",
    href: "/manuales",
    icon: BookOpen,
    group: "ayuda",
  },
];
