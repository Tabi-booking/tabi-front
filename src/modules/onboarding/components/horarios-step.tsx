"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import { toast } from "sonner";
import { OnboardingLayout } from "@/modules/onboarding/components/onboarding-layout";
import { fetchMiRestaurante } from "@/modules/restaurant/services/restaurant.service";
import { fetchHorarios, ingresarHorario } from "@/modules/restaurant/services/horario.service";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { Skeleton } from "@/shared/components/native/skeleton";
import { useState } from "react";

const DIAS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export function HorariosStep() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<Record<number, { open: string; close: string; active: boolean }>>(
    Object.fromEntries(DIAS.map((d) => [d.value, { open: "12:00", close: "22:00", active: d.value >= 1 && d.value <= 5 }])),
  );

  const { isLoading } = useQuery({
    queryKey: queryKeys.miRestaurante,
    queryFn: fetchMiRestaurante,
  });

  const { data: existing = [] } = useQuery({
    queryKey: queryKeys.horarios,
    queryFn: fetchHorarios,
    staleTime: STALE.catalog,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      for (const dia of DIAS) {
        const slot = schedule[dia.value];
        if (!slot.active) continue;
        const existingDay = existing.find((h) => h.Dia_semana === dia.value);
        await ingresarHorario({
          ID_Restaurante: existingDay?.ID_Restaurante ?? "",
          Dia_semana: dia.value,
          Hora_apertura: `${slot.open}:00`,
          Hora_cierre: `${slot.close}:00`,
          Etiqueta_dia: dia.label,
          Activo: true,
        });
      }
      toast.success("Horarios configurados");
      router.push("/onboarding/branding");
    } catch {
      toast.error("Error al guardar horarios");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <OnboardingLayout title="Horarios">
        <Skeleton className="h-64 w-full" />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout title="Horarios" description="Define cuándo recibes reservas">
      <form onSubmit={handleSubmit} className="space-y-4">
        {DIAS.map((dia) => {
          const slot = schedule[dia.value];
          return (
            <div key={dia.value} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4">
              <label className="flex w-28 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={slot.active}
                  onChange={(e) =>
                    setSchedule((s) => ({
                      ...s,
                      [dia.value]: { ...s[dia.value], active: e.target.checked },
                    }))
                  }
                  className="rounded border-border"
                />
                {dia.label}
              </label>
              <div className="flex items-center gap-2">
                <Label className="sr-only">Apertura</Label>
                <Input
                  type="time"
                  value={slot.open}
                  disabled={!slot.active}
                  onChange={(e) =>
                    setSchedule((s) => ({
                      ...s,
                      [dia.value]: { ...s[dia.value], open: e.target.value },
                    }))
                  }
                  className="w-32"
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="time"
                  value={slot.close}
                  disabled={!slot.active}
                  onChange={(e) =>
                    setSchedule((s) => ({
                      ...s,
                      [dia.value]: { ...s[dia.value], close: e.target.value },
                    }))
                  }
                  className="w-32"
                />
              </div>
            </div>
          );
        })}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  );
}
