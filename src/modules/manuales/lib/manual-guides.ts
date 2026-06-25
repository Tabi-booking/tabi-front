import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Rocket,
  Shield,
  Store,
  Users,
} from "lucide-react";

export type ManualCategory =
  | "inicio"
  | "operacion"
  | "restaurante"
  | "equipo"
  | "analitica";

export interface ManualGuide {
  id: string;
  title: string;
  summary: string;
  category: ManualCategory;
  icon: LucideIcon;
  steps: string[];
  tips?: string[];
  relatedHref?: string;
  relatedLabel?: string;
  /** Solo visible para admins de equipo */
  adminOnly?: boolean;
}

export const MANUAL_CATEGORIES: Record<
  ManualCategory,
  { label: string; description: string; icon: LucideIcon }
> = {
  inicio: {
    label: "Primeros pasos",
    description: "Arranque rápido con tu cuenta y el panel",
    icon: Rocket,
  },
  operacion: {
    label: "Operación diaria",
    description: "Reservas, clientes y el turno del día",
    icon: CalendarDays,
  },
  restaurante: {
    label: "Mi restaurante",
    description: "Perfil, horarios e imágenes del local",
    icon: Store,
  },
  equipo: {
    label: "Equipo",
    description: "Usuarios, roles y permisos",
    icon: Users,
  },
  analitica: {
    label: "Analítica",
    description: "Métricas, reportes y lectura del negocio",
    icon: BarChart3,
  },
};

export const MANUAL_GUIDES: ManualGuide[] = [
  {
    id: "bienvenida",
    title: "Primer recorrido por Tabi",
    summary: "Lo esencial para orientarte en el panel antes del servicio.",
    category: "inicio",
    icon: Rocket,
    steps: [
      "Inicia sesión con el correo y contraseña de tu cuenta.",
      "Revisa el resumen operativo para ver reservas e ingresos del día.",
      "Completa el perfil en Mi restaurante → Editar.",
      "Invita al equipo desde Usuarios (solo propietario o administrador).",
      "Estas guías están en el menú lateral y en Configuraciones.",
    ],
    tips: [
      "⌘K o Ctrl+K abre la búsqueda rápida de páginas.",
      "En celular, el botón + crea una reserva al toque.",
    ],
    relatedHref: "/dashboard",
    relatedLabel: "Ir al resumen operativo",
  },
  {
    id: "reservas-lista",
    title: "Gestionar reservas",
    summary: "Crea, edita y da seguimiento a las reservas desde la lista.",
    category: "operacion",
    icon: CalendarDays,
    steps: [
      "Entra a Reservas → Lista para ver todas las reservas.",
      "Pulsa Nueva reserva para registrar una mesa manualmente.",
      "Selecciona o crea el cliente vinculado a la reserva.",
      "Indica fecha, hora, cantidad de personas y estado.",
      "Usa los filtros y la búsqueda para encontrar reservas del día.",
    ],
    tips: [
      "El calendario muestra la ocupación por día de forma visual.",
      "Los estados (Confirmada, Pendiente, etc.) ayudan al equipo de sala.",
    ],
    relatedHref: "/reservas",
    relatedLabel: "Abrir reservas",
  },
  {
    id: "reservas-calendario",
    title: "Calendario de reservas",
    summary: "Visualiza la agenda y planifica la capacidad del restaurante.",
    category: "operacion",
    icon: CalendarDays,
    steps: [
      "Ve a Reservas → Calendario.",
      "Navega entre semanas para planificar con anticipación.",
      "Haz clic en un día para ver el detalle de reservas.",
      "Coordina con el equipo según los horarios de mayor demanda.",
    ],
    relatedHref: "/reservas/calendario",
    relatedLabel: "Abrir calendario",
  },
  {
    id: "clientes",
    title: "Base de clientes (CRM)",
    summary: "Registra clientes y consulta su historial de visitas.",
    category: "operacion",
    icon: Users,
    steps: [
      "Abre Clientes desde el menú lateral.",
      "Crea un cliente con nombre, correo, teléfono y documento.",
      "Al crear reservas, vincula el cliente para mantener historial.",
      "Busca por nombre, correo o documento desde la barra de búsqueda.",
      "Edita o elimina registros según los permisos de tu rol.",
    ],
    relatedHref: "/clientes",
    relatedLabel: "Ir a clientes",
  },
  {
    id: "restaurante-perfil",
    title: "Editar perfil del restaurante",
    summary: "Mantén actualizada la información pública y operativa del local.",
    category: "restaurante",
    icon: Store,
    steps: [
      "Entra a Mi restaurante → Editar mi restaurante.",
      "Completa perfil, contacto, ubicación y características.",
      "Configura horarios de apertura por día de la semana.",
      "Sube logo, portada y fotos de galería (requiere permiso de subida).",
      "Guarda cada sección; los cambios se reflejan en tu ficha.",
    ],
    tips: [
      "Un perfil completo mejora la confianza de los comensales.",
      "Revisa el rango de precios y etiquetas del local.",
    ],
    relatedHref: "/restaurante/editar",
    relatedLabel: "Editar restaurante",
  },
  {
    id: "usuarios",
    title: "Agregar empleados",
    summary: "Invita al equipo y asigna el rol adecuado a cada persona.",
    category: "equipo",
    icon: Users,
    adminOnly: true,
    steps: [
      "Solo Propietario o Administrador puede gestionar empleados.",
      "Ve a Usuarios y pulsa Nuevo empleado.",
      "Completa datos personales, correo y contraseña temporal.",
      "Asigna un rol: Administrador, Mesero, Cocinero o Cajero.",
      "El empleado inicia sesión con su correo y la contraseña definida.",
    ],
    tips: [
      "No se puede asignar el rol Propietario manualmente.",
      "Usa contraseñas seguras y cámbialas en el primer acceso.",
    ],
    relatedHref: "/usuarios",
    relatedLabel: "Gestionar usuarios",
  },
  {
    id: "roles",
    title: "Roles y permisos",
    summary: "Entiende qué puede hacer cada rol en el restaurante.",
    category: "equipo",
    icon: Shield,
    adminOnly: true,
    steps: [
      "Abre Roles desde el menú o Configuraciones.",
      "Consulta la matriz de permisos por rol.",
      "Mesero: reservas, pedidos y clientes.",
      "Cocinero: pedidos y menú en lectura.",
      "Cajero: pedidos, pagos y clientes.",
      "Administrador y Propietario: acceso completo al restaurante.",
    ],
    relatedHref: "/roles",
    relatedLabel: "Ver roles",
  },
  {
    id: "analitica",
    title: "Analítica y reportes",
    summary: "Lee el rendimiento del local con datos que ya tienes en Tabi.",
    category: "analitica",
    icon: BarChart3,
    steps: [
      "Resumen operativo: vista del día con lo más urgente.",
      "Analítica: gráficos de reservas, ingresos y tendencias.",
      "Reportes: profundiza y exporta por periodo.",
      "Cambia el rango (hoy, 7 o 30 días) para comparar.",
      "Úsalo para ajustar turnos y personal en horas pico.",
    ],
    relatedHref: "/analitica",
    relatedLabel: "Ver analítica",
  },
  {
    id: "atajos",
    title: "Atajos y buenas prácticas",
    summary: "Consejos para un uso eficiente del panel Tabi.",
    category: "inicio",
    icon: BookOpen,
    steps: [
      "Mantén el perfil del restaurante actualizado.",
      "Registra clientes al tomar reservas para fidelización.",
      "Revisa el dashboard al inicio de cada turno.",
      "Asigna roles acordes a las funciones de cada empleado.",
      "Ante un error de permiso (403), contacta al administrador.",
    ],
    relatedHref: "/configuraciones",
    relatedLabel: "Ver configuraciones",
  },
];
