"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Sparkles,
  Store,
  Users,
  WifiOff,
} from "lucide-react";
import { useRestaurantProfile } from "@/modules/restaurant/hooks/use-restaurant-profile";
import { getFeatureIcon, getFeatureLabel } from "@/modules/restaurant/lib/feature-catalog";
import { getRestaurantHoursLabel } from "@/modules/restaurant/lib/restaurant-hours";
import { RestaurantGallery } from "@/modules/restaurant/components/restaurant-gallery";
import { RestaurantProfileHero } from "@/modules/restaurant/components/restaurant-profile-hero";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/native/card";
import { Skeleton } from "@/shared/components/native/skeleton";
import { PermissionDenied } from "@/shared/components/patterns/permission-denied";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getRegistroUrl } from "@/shared/lib/registro-url";
import { buttonClass } from "@/shared/lib/ui-classes";

function SimpleTag({
  value,
  category,
}: {
  value: string;
  category: "restaurant_venue" | "cuisine_types" | "services" | "reservations";
}) {
  const Icon = getFeatureIcon(value);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1 text-sm text-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {getFeatureLabel(value, category)}
    </span>
  );
}

function TagGroup({
  label,
  items,
  category,
  empty,
}: {
  label: string;
  items: string[];
  category: "restaurant_venue" | "cuisine_types" | "services" | "reservations";
  empty: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <SimpleTag key={item} value={item} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  href?: string;
}) {
  if (!value?.trim()) return null;

  const content = (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-all text-foreground">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block rounded-lg hover:bg-accent/50">
        {content}
      </a>
    );
  }

  return content;
}

export function RestauranteVerContent() {
  const { canReadRestaurant, canWriteRestaurant } = usePermissions();
  const { data, isLoading, isError, refetch } = useRestaurantProfile();

  if (!canReadRestaurant) {
    return (
      <PermissionDenied
        title="Sin acceso al restaurante"
        description="Tu rol no incluye permiso para ver el perfil del local (restaurant.read)."
      />
    );
  }

  if (isLoading) {
    return (
      <AppPageShell title="Mi restaurante">
        <Skeleton className="h-80 w-full rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </AppPageShell>
    );
  }

  if (isError || !data) {
    return (
      <AppPageShell title="Mi restaurante">
        <EmptyState
          icon={WifiOff}
          title="No se pudo cargar"
          description="Verifica tu conexión."
          actionLabel="Reintentar"
          onAction={refetch}
        />
      </AppPageShell>
    );
  }

  const isDraft = data.onboarding?.estado === "draft";
  const owner = data.contact.owner;
  const cuisineTypes = data.features.cuisine_types ?? [];
  const hoursLabel = getRestaurantHoursLabel(data);
  const ownerName = owner?.nombre
    ? `${owner.nombre}${owner.apellido ? ` ${owner.apellido}` : ""}`
    : null;

  return (
    <AppPageShell
      title="Mi restaurante"
      actions={
        canWriteRestaurant ? (
          <Link href="/restaurante/editar" className={buttonClass("default", "default", "gap-2")}>
            <Pencil className="h-4 w-4" />
            Editar perfil
          </Link>
        ) : undefined
      }
      className="max-w-5xl"
    >
      {isDraft && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">Tu registro está incompleto.</p>
          <a href={getRegistroUrl()} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Continuar registro <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <RestaurantProfileHero data={data} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              Características
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {data.profile.restaurant_type && (
              <TagGroup
                label="Tipo de restaurante"
                items={[data.profile.restaurant_type]}
                category="restaurant_venue"
                empty="Sin definir"
              />
            )}
            <TagGroup label="Tipos de cocina" items={cuisineTypes} category="cuisine_types" empty="Sin definir" />
            <TagGroup
              label="Servicios"
              items={data.features.services_offered ?? []}
              category="services"
              empty="Sin servicios registrados"
            />
            <TagGroup
              label="Tipos de reserva"
              items={data.features.reservation_types ?? []}
              category="reservations"
              empty="Sin tipos de reserva"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Phone className="h-4 w-4 text-primary" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <ContactItem icon={Phone} label="Teléfono" value={data.contact.telefono} />
            <ContactItem icon={Mail} label="Correo" value={owner?.correo} />
            <ContactItem icon={Store} label="Responsable" value={ownerName} />
            <ContactItem icon={Globe} label="Sitio web" value={data.profile.sitio_web} href={data.profile.sitio_web ?? undefined} />
            <ContactItem icon={MapPin} label="Dirección" value={data.location.direccion} />
            {data.location.google_maps && (
              <a
                href={data.location.google_maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ver en Google Maps <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Clock className="h-4 w-4 text-primary" />
              Operación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Horario</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {hoursLabel ?? "Sin horario definido"}
              </p>
            </div>
            <div className="flex gap-8 border-t border-border pt-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Asientos
                </p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {data.operations.capacidad_asientos ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mesas</p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {data.operations.numero_mesas ?? "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted-foreground">Plan actual</span>
              <span className="font-semibold capitalize text-foreground">
                {data.subscription.plan ?? "Sin plan"}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted-foreground">Estado</span>
              <span className="font-medium capitalize text-foreground">
                {data.subscription.estado ?? "—"}
              </span>
            </div>
            {data.subscription.ciclo_facturacion && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Facturación</span>
                <span className="font-medium text-foreground">
                  {data.subscription.ciclo_facturacion === "monthly" ? "Mensual" : "Anual"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RestaurantGallery covers={data.media.covers ?? []} logoUrl={data.media.logo_url} />
    </AppPageShell>
  );
}
