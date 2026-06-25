"use client";

import Link from "next/link";
import { Globe, MapPin, Star, Store, Users } from "lucide-react";
import type { RestaurantMeResponse } from "@/modules/restaurant/types/restaurant-profile";
import { getFeatureLabel } from "@/modules/restaurant/lib/feature-catalog";
import { ImageCarousel } from "@/shared/components/patterns/image-carousel";
import { RemoteImage } from "@/shared/components/patterns/remote-image";
import { cn } from "@/shared/lib/utils";

interface RestaurantProfileHeroProps {
  data: RestaurantMeResponse;
  className?: string;
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
    >
      <Globe className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

export function RestaurantProfileHero({ data, className }: RestaurantProfileHeroProps) {
  const coverSlides = (data.media.covers ?? [])
    .filter((cover) => cover.url?.trim())
    .map((cover) => ({
      id: cover.id,
      url: cover.url,
      alt: `Portada de ${data.profile.nombre}`,
    }));
  const locationLine = [data.location.barrio, data.location.ciudad, data.location.departamento]
    .filter(Boolean)
    .join(", ");
  const venueLabel = data.profile.restaurant_type
    ? getFeatureLabel(data.profile.restaurant_type, "restaurant_venue")
    : null;
  const instagram = data.profile.redes_sociales?.instagram?.trim();
  const isActive = data.meta.activo !== false;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg",
        className,
      )}
    >
      <div className="relative h-56 sm:h-64 md:h-80">
        {coverSlides.length > 0 ? (
          <ImageCarousel
            images={coverSlides}
            intervalMs={12_000}
            imageAlt="Portada"
            dotsClassName="bottom-28 sm:bottom-32"
            controlsVariant="on-image"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-tabi-navy via-tabi-navy-muted to-primary/50" />
        )}

        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(245,94,87,0.35),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-tabi-navy via-tabi-navy/50 to-tabi-navy/10" />

        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {venueLabel && (
              <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-md">
                {venueLabel}
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md",
                isActive
                  ? "border border-emerald-300/40 bg-emerald-500/20 text-emerald-50"
                  : "border border-white/20 bg-white/10 text-white/90",
              )}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
            {coverSlides.length > 1 && (
              <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                {coverSlides.length} fotos
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-[3px] border-white/90 bg-white shadow-xl ring-4 ring-primary/30 sm:h-28 sm:w-28">
                {data.media.logo_url ? (
                  <RemoteImage src={data.media.logo_url} alt={data.profile.nombre} fill />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-tabi-navy/10 text-primary">
                    <Store className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="min-w-0 pb-0.5 text-white">
                <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm sm:text-3xl">
                  {data.profile.nombre}
                </h1>
                {data.profile.razon_social && data.profile.razon_social !== data.profile.nombre && (
                  <p className="mt-0.5 text-sm text-white/75">{data.profile.razon_social}</p>
                )}
                {locationLine && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{locationLine}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {data.meta.calificacion_promedio != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  {data.meta.calificacion_promedio.toFixed(1)}
                  {data.meta.calificacion_cantidad != null && (
                    <span className="font-normal text-white/70">({data.meta.calificacion_cantidad})</span>
                  )}
                </span>
              )}
              {data.operations.capacidad_asientos != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
                  <Users className="h-4 w-4 text-primary" />
                  {data.operations.capacidad_asientos} pax
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-gradient-to-b from-primary/[0.04] to-card px-4 py-5 sm:px-6">
        {data.profile.descripcion ? (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {data.profile.descripcion}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Aún no has añadido una descripción. Cuéntale a tus clientes qué hace especial a tu restaurante.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {instagram && <SocialLink href={instagram} label="Instagram" />}
          {data.profile.sitio_web && (
            <a
              href={data.profile.sitio_web}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Sitio web
            </a>
          )}
          {data.location.google_maps && (
            <Link
              href={data.location.google_maps}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-tabi-navy/80 hover:text-primary hover:underline"
            >
              Ver en mapa
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
