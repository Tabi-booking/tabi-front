"use client";

import { useState } from "react";
import {
  CalendarClock,
  CreditCard,
  ExternalLink,
  ImageIcon,
  MapPin,
  Phone,
  Sparkles,
  Store,
  WifiOff,
} from "lucide-react";
import { useRestaurantProfile } from "@/modules/restaurant/hooks/use-restaurant-profile";
import { RestaurantEditHeader } from "@/modules/restaurant/components/restaurant-edit-header";
import { ContactSection } from "@/modules/restaurant/components/sections/contact-section";
import { FeaturesSection } from "@/modules/restaurant/components/sections/features-section";
import { LocationSection } from "@/modules/restaurant/components/sections/location-section";
import { MediaSection } from "@/modules/restaurant/components/sections/media-section";
import { OperationsSection } from "@/modules/restaurant/components/sections/operations-section";
import { PlanSection } from "@/modules/restaurant/components/sections/plan-section";
import { ProfileSection } from "@/modules/restaurant/components/sections/profile-section";
import type { RestaurantMePatch } from "@/modules/restaurant/types/restaurant-profile";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { EmptyState } from "@/shared/components/patterns/empty-state";
import { Skeleton } from "@/shared/components/native/skeleton";
import { PermissionDenied } from "@/shared/components/patterns/permission-denied";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { getRegistroUrl } from "@/shared/lib/registro-url";
import { cn } from "@/shared/lib/utils";

const SECTIONS = [
  { id: "perfil", label: "Perfil", icon: Store, description: "Nombre, descripción y presencia" },
  { id: "ubicacion", label: "Ubicación", icon: MapPin, description: "Dónde te encuentran" },
  { id: "contacto", label: "Contacto", icon: Phone, description: "Teléfono y responsable" },
  { id: "operaciones", label: "Operaciones", icon: CalendarClock, description: "Horarios y capacidad" },
  { id: "caracteristicas", label: "Características", icon: Sparkles, description: "Cocina, servicios y reservas" },
  { id: "imagenes", label: "Imágenes", icon: ImageIcon, description: "Logo y portadas" },
  { id: "plan", label: "Plan", icon: CreditCard, description: "Suscripción Tabi" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function RestauranteEditarContent() {
  const { canWriteRestaurant } = usePermissions();
  const [activeSection, setActiveSection] = useState<SectionId>("perfil");
  const { data, isLoading, isError, isSaving, refetch, applyUpload, save } = useRestaurantProfile();

  if (!canWriteRestaurant) {
    return (
      <PermissionDenied
        title="Sin permiso de edición"
        description="Tu rol no incluye permiso para editar el restaurante (restaurant.write)."
      />
    );
  }

  if (isLoading) {
    return (
      <AppPageShell title="Editar perfil">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </AppPageShell>
    );
  }

  if (isError || !data) {
    return (
      <AppPageShell title="Editar perfil">
        <EmptyState
          icon={WifiOff}
          title="No se pudo cargar"
          actionLabel="Reintentar"
          onAction={refetch}
        />
      </AppPageShell>
    );
  }

  const isDraft = data.onboarding?.estado === "draft";
  const handleSave = (body: RestaurantMePatch) => save(body);
  const activeMeta = SECTIONS.find((s) => s.id === activeSection)!;
  const ActiveIcon = activeMeta.icon;

  return (
    <AppPageShell
      title="Editar perfil"
      description="Cada cambio refleja cómo se ve tu restaurante en Tabi"
      className="max-w-6xl"
    >
      {isDraft && (
        <div className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-gradient-to-r from-warning/10 to-warning/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">Completa tu registro para publicar el perfil.</p>
          <a href={getRegistroUrl()} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Continuar registro <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <RestaurantEditHeader data={data} />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={cn(
                "group relative flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition-all lg:w-full",
                activeSection === id
                  ? "bg-tabi-navy text-white shadow-md"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
              )}
            >
              {activeSection === id && (
                <span className="absolute left-0 top-1/2 hidden h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary lg:block" />
              )}
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                  activeSection === id
                    ? "bg-white/15 text-white"
                    : "bg-secondary text-tabi-navy group-hover:bg-primary/10 group-hover:text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="pr-1">{label}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-gradient-to-r from-primary/8 via-transparent to-tabi-navy/5 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <ActiveIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">{activeMeta.label}</h2>
                <p className="text-sm text-muted-foreground">{activeMeta.description}</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {activeSection === "perfil" && (
              <ProfileSection data={data} isSaving={isSaving} onSave={handleSave} />
            )}
            {activeSection === "ubicacion" && (
              <LocationSection data={data} isSaving={isSaving} onSave={handleSave} />
            )}
            {activeSection === "contacto" && (
              <ContactSection data={data} isSaving={isSaving} onSave={handleSave} />
            )}
            {activeSection === "operaciones" && (
              <OperationsSection data={data} isSaving={isSaving} onSave={handleSave} />
            )}
            {activeSection === "caracteristicas" && (
              <FeaturesSection data={data} isSaving={isSaving} onSave={handleSave} />
            )}
            {activeSection === "imagenes" && (
              <MediaSection
                data={data}
                onUploaded={(result) => {
                  applyUpload(result);
                  void refetch();
                }}
              />
            )}
            {activeSection === "plan" && <PlanSection data={data} />}
          </div>
        </div>
      </div>
    </AppPageShell>
  );
}
