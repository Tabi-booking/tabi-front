"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import type { RestaurantMeResponse } from "@/modules/restaurant/types/restaurant-profile";
import { getFeatureLabel } from "@/modules/restaurant/lib/feature-catalog";
import { RemoteImage } from "@/shared/components/patterns/remote-image";
import { buttonClass } from "@/shared/lib/ui-classes";

interface RestaurantEditHeaderProps {
  data: RestaurantMeResponse;
}

export function RestaurantEditHeader({ data }: RestaurantEditHeaderProps) {
  const completion = data.onboarding?.pct ?? 0;
  const venueLabel = data.profile.restaurant_type
    ? getFeatureLabel(data.profile.restaurant_type, "restaurant_venue")
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-tabi-navy" />
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-primary/20 bg-primary/5 shadow-md ring-2 ring-primary/10">
            <RemoteImage src={data.media.logo_url} alt={data.profile.nombre} fill />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-foreground">{data.profile.nombre}</p>
            {venueLabel && (
              <p className="text-sm font-medium text-primary">{venueLabel}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="w-full sm:w-48">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Perfil completado</span>
              <span className="font-semibold text-foreground">{completion}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-tabi-navy transition-all"
                style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
              />
            </div>
          </div>
          <Link href="/restaurante" className={buttonClass("outline", "sm", "gap-2 self-start sm:self-auto")}>
            <Eye className="h-3.5 w-3.5" />
            Vista previa
          </Link>
        </div>
      </div>
    </div>
  );
}
