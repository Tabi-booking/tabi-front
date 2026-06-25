import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Car,
  ChefHat,
  Coffee,
  Dog,
  Footprints,
  Globe,
  Leaf,
  Music,
  Phone,
  Sparkles,
  Sun,
  Tag,
  UtensilsCrossed,
  Wifi,
  Wine,
} from "lucide-react";

export type FeatureCategory =
  | "restaurant_venue"
  | "cuisine"
  | "cuisine_types"
  | "services"
  | "reservations";

export interface FeatureOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

const RESTAURANT_VENUE_TYPES: FeatureOption[] = [
  { value: "fine_dining", label: "Alta cocina", icon: Wine },
  { value: "casual_dining", label: "Casual", icon: UtensilsCrossed },
  { value: "fast_casual", label: "Casual rápido", icon: ChefHat },
  { value: "fast_food", label: "Comida rápida", icon: UtensilsCrossed },
  { value: "cafe", label: "Café", icon: Coffee },
  { value: "bar", label: "Bar", icon: Wine },
  { value: "pub", label: "Pub", icon: Wine },
  { value: "bakery", label: "Panadería", icon: Sparkles },
  { value: "food_truck", label: "Food truck", icon: Car },
  { value: "buffet", label: "Buffet", icon: UtensilsCrossed },
  { value: "bistro", label: "Bistro", icon: ChefHat },
  { value: "pizzeria", label: "Pizzería", icon: ChefHat },
  { value: "steakhouse", label: "Parrilla", icon: ChefHat },
];

const CUISINE_PRIMARY: FeatureOption[] = [
  { value: "Italiana", label: "Italiana", icon: ChefHat },
  { value: "Colombiana", label: "Colombiana", icon: UtensilsCrossed },
  { value: "Mexicana", label: "Mexicana", icon: ChefHat },
  { value: "Asiática", label: "Asiática", icon: UtensilsCrossed },
  { value: "Mediterránea", label: "Mediterránea", icon: Leaf },
  { value: "Mariscos", label: "Mariscos", icon: UtensilsCrossed },
  { value: "Parrilla", label: "Parrilla", icon: ChefHat },
  { value: "Fusión", label: "Fusión", icon: Sparkles },
  { value: "Vegetariana", label: "Vegetariana", icon: Leaf },
  { value: "Café", label: "Café", icon: Coffee },
];

const CUISINE_TYPES: FeatureOption[] = [
  ...CUISINE_PRIMARY,
  { value: "Japonesa", label: "Japonesa", icon: UtensilsCrossed },
  { value: "Peruana", label: "Peruana", icon: ChefHat },
  { value: "Francesa", label: "Francesa", icon: Wine },
  { value: "Americana", label: "Americana", icon: UtensilsCrossed },
  { value: "Brunch", label: "Brunch", icon: Coffee },
  { value: "Postres", label: "Postres", icon: Sparkles },
];

const SERVICES: FeatureOption[] = [
  { value: "WiFi", label: "WiFi", icon: Wifi },
  { value: "Terraza", label: "Terraza", icon: Sun },
  { value: "Parqueadero", label: "Parqueadero", icon: Car },
  { value: "Música en vivo", label: "Música en vivo", icon: Music },
  { value: "Pet friendly", label: "Pet friendly", icon: Dog },
  { value: "Menú infantil", label: "Menú infantil", icon: Baby },
  { value: "Opciones veganas", label: "Opciones veganas", icon: Leaf },
  { value: "Bar / cocteles", label: "Bar / cocteles", icon: Wine },
  { value: "Delivery", label: "Delivery", icon: UtensilsCrossed },
  { value: "Para llevar", label: "Para llevar", icon: ChefHat },
];

const RESERVATIONS: FeatureOption[] = [
  { value: "online", label: "Reserva en línea", icon: Globe },
  { value: "phone", label: "Por teléfono", icon: Phone },
  { value: "walk_in", label: "Sin reserva", icon: Footprints },
];

export const FEATURE_CATALOG: Record<FeatureCategory, FeatureOption[]> = {
  restaurant_venue: RESTAURANT_VENUE_TYPES,
  cuisine: CUISINE_PRIMARY,
  cuisine_types: CUISINE_TYPES,
  services: SERVICES,
  reservations: RESERVATIONS,
};

function humanizeFeatureSlug(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const ICON_BY_VALUE = new Map<string, LucideIcon>();
for (const list of Object.values(FEATURE_CATALOG)) {
  for (const opt of list) {
    ICON_BY_VALUE.set(opt.value.toLowerCase(), opt.icon);
    ICON_BY_VALUE.set(opt.label.toLowerCase(), opt.icon);
  }
}

export function getFeatureIcon(value: string): LucideIcon {
  return ICON_BY_VALUE.get(value.toLowerCase()) ?? Tag;
}

export function getFeatureLabel(value: string, category?: FeatureCategory): string {
  const normalized = value.trim();
  const lists = category ? [FEATURE_CATALOG[category]] : Object.values(FEATURE_CATALOG);

  for (const list of lists) {
    const found = list.find(
      (option) =>
        option.value.toLowerCase() === normalized.toLowerCase() ||
        option.label.toLowerCase() === normalized.toLowerCase(),
    );
    if (found) return found.label;
  }

  return humanizeFeatureSlug(normalized);
}

export function normalizeFeatureValue(value: string): string {
  return value.trim();
}
