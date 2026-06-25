"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import { toast } from "sonner";
import { useState } from "react";
import { OnboardingLayout } from "@/modules/onboarding/components/onboarding-layout";
import { fetchMiRestaurante, modificarRestaurante } from "@/modules/restaurant/services/restaurant.service";
import {
  fetchCiudades,
  fetchDepartamentos,
  fetchUbicaciones,
} from "@/modules/restaurant/services/geografia.service";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { SelectField } from "@/shared/components/native/select-field";
import { Skeleton } from "@/shared/components/native/skeleton";

export function UbicacionStep() {
  const router = useRouter();
  const [deptId, setDeptId] = useState("");
  const [ciudadId, setCiudadId] = useState("");
  const [barrio, setBarrio] = useState("");
  const [googleMaps, setGoogleMaps] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: mi, isLoading } = useQuery({
    queryKey: queryKeys.miRestaurante,
    queryFn: fetchMiRestaurante,
  });

  const { data: departamentos = [] } = useQuery({
    queryKey: queryKeys.departamentos,
    queryFn: fetchDepartamentos,
    staleTime: STALE.catalog,
  });

  const { data: ciudades = [] } = useQuery({
    queryKey: queryKeys.ciudades(deptId),
    queryFn: () => fetchCiudades(deptId),
    enabled: Boolean(deptId),
  });

  const { data: ubicaciones = [] } = useQuery({
    queryKey: queryKeys.ubicaciones,
    queryFn: fetchUbicaciones,
    staleTime: STALE.catalog,
  });

  const filteredUbicaciones = ubicaciones.filter(
    (u) => !ciudadId || u.ID_Ciudad === ciudadId || u.Ciudad === ciudades.find((c) => c.ID_Key === ciudadId)?.Nombre,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mi?.restaurante?.ID_Key) return;

    const ciudad = ciudades.find((c) => c.ID_Key === ciudadId);
    const selectedUbicacion = filteredUbicaciones.find(
      (u) => u.Barrio === barrio || u.ID_Key === barrio,
    );

    if (!selectedUbicacion?.ID_Key) {
      toast.error("Selecciona una ubicación del catálogo");
      return;
    }

    setSaving(true);
    try {
      await modificarRestaurante(mi.restaurante.ID_Key, {
        ...mi.restaurante,
        ID_Ubicacion: selectedUbicacion.ID_Key,
        Google_maps: googleMaps,
        Direccion: `${selectedUbicacion.Barrio}, ${ciudad?.Nombre ?? selectedUbicacion.Ciudad}`,
      });

      toast.success("Ubicación guardada");
      router.push("/onboarding/horarios");
    } catch {
      toast.error("No se pudo guardar la ubicación");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <OnboardingLayout title="Ubicación">
        <Skeleton className="h-64 w-full" />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout title="Ubicación" description="Indica dónde está tu restaurante">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="departamento">Departamento</Label>
          <SelectField
            id="departamento"
            value={deptId}
            onValueChange={(value) => {
              setDeptId(value);
              setCiudadId("");
              setBarrio("");
            }}
            placeholder="Seleccionar departamento"
            options={departamentos.map((d) => ({ value: d.ID_Key, label: d.Nombre }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          <SelectField
            id="ciudad"
            value={ciudadId}
            onValueChange={(value) => {
              setCiudadId(value);
              setBarrio("");
            }}
            disabled={!deptId}
            placeholder="Seleccionar ciudad"
            options={ciudades.map((c) => ({ value: c.ID_Key, label: c.Nombre }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barrio">Barrio / Zona</Label>
          <SelectField
            id="barrio"
            value={barrio}
            onValueChange={setBarrio}
            disabled={!ciudadId}
            placeholder="Seleccionar ubicación"
            options={filteredUbicaciones.map((u) => ({
              value: u.Barrio || u.ID_Key,
              label: `${u.Barrio} — ${u.Ciudad}`,
            }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maps">Enlace Google Maps (opcional)</Label>
          <Input id="maps" value={googleMaps} onChange={(e) => setGoogleMaps(e.target.value)} placeholder="https://maps.google.com/..." />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={saving || !ciudadId}>
            {saving ? "Guardando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  );
}
