"use client";

import type { FeatureCategory } from "@/modules/restaurant/lib/feature-catalog";
import { getFeatureIcon, getFeatureLabel } from "@/modules/restaurant/lib/feature-catalog";
import { cn } from "@/shared/lib/utils";

interface RestaurantChipProps {
  value: string;
  category: FeatureCategory;
  variant?: "default" | "featured";
}

export function RestaurantChip({ value, category, variant = "default" }: RestaurantChipProps) {
  const Icon = getFeatureIcon(value);
  const label = getFeatureLabel(value, category);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        variant === "featured"
          ? "border border-primary/25 bg-primary/10 text-tabi-navy shadow-sm"
          : "border border-border/80 bg-white text-foreground shadow-sm",
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5", variant === "featured" ? "text-primary" : "text-tabi-navy/70")}
      />
      {label}
    </span>
  );
}

interface RestaurantChipListProps {
  items: string[];
  category: FeatureCategory;
  empty: string;
  featuredFirst?: boolean;
}

export function RestaurantChipList({
  items,
  category,
  empty,
  featuredFirst = false,
}: RestaurantChipListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <RestaurantChip
          key={item}
          value={item}
          category={category}
          variant={featuredFirst && index === 0 ? "featured" : "default"}
        />
      ))}
    </div>
  );
}
