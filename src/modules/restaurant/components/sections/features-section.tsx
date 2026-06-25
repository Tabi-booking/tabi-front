"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, ChefHat, ConciergeBell, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { TagChipEditor } from "@/modules/restaurant/components/tag-chip-editor";
import type { RestaurantMePatch, RestaurantMeResponse } from "@/modules/restaurant/types/restaurant-profile";
import { Button } from "@/shared/components/native/button";
import { ApiError } from "@/shared/lib/api-client";

interface FeaturesSectionProps {
  data: RestaurantMeResponse;
  isSaving: boolean;
  onSave: (body: RestaurantMePatch) => Promise<unknown>;
}

export function FeaturesSection({ data, isSaving, onSave }: FeaturesSectionProps) {
  const [restaurantType, setRestaurantType] = useState<string[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [reservations, setReservations] = useState<string[]>([]);

  useEffect(() => {
    const venueType = data.profile.restaurant_type?.trim();
    setRestaurantType(venueType ? [venueType] : []);
    setCuisineTypes(data.features.cuisine_types ?? []);
    setServices(data.features.services_offered ?? []);
    setReservations(data.features.reservation_types ?? []);
  }, [data]);

  const handleSave = async () => {
    try {
      await onSave({
        profile: {
          restaurant_type: restaurantType[0] || undefined,
        },
        features: {
          cuisine_types: cuisineTypes,
          services_offered: services,
          reservation_types: reservations,
        },
      });
      toast.success("Características actualizadas");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Error al guardar");
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Selecciona las opciones que aplican a tu restaurante o agrega las tuyas. Los cambios se
        guardan al pulsar el botón inferior.
      </p>

      <TagChipEditor
        category="restaurant_venue"
        title="Tipo de restaurante"
        description="El estilo o formato de tu negocio (ej. alta cocina, casual, café)"
        icon={ChefHat}
        selected={restaurantType}
        onChange={setRestaurantType}
        single
      />

      <TagChipEditor
        category="cuisine_types"
        title="Tipos de cocina"
        description="Puedes elegir varios estilos o especialidades"
        icon={UtensilsCrossed}
        selected={cuisineTypes}
        onChange={setCuisineTypes}
      />

      <TagChipEditor
        category="services"
        title="Servicios"
        description="Comodidades y servicios que ofreces a tus comensales"
        icon={ConciergeBell}
        selected={services}
        onChange={setServices}
      />

      <TagChipEditor
        category="reservations"
        title="Tipos de reserva"
        description="Cómo pueden reservar tus clientes"
        icon={CalendarCheck}
        selected={reservations}
        onChange={setReservations}
      />

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar características"}
        </Button>
      </div>
    </div>
  );
}
