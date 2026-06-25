"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/shared/lib/query-keys";
import { STALE } from "@/shared/lib/query-config";
import { toast } from "sonner";
import { useState } from "react";
import { OnboardingLayout } from "@/modules/onboarding/components/onboarding-layout";
import { fetchCategorias, fetchEtiquetas } from "@/modules/restaurant/services/catalog.service";
import { fetchMiRestaurante, modificarRestaurante } from "@/modules/restaurant/services/restaurant.service";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { Label } from "@/shared/components/native/label";
import { SelectField } from "@/shared/components/native/select-field";
import { Skeleton } from "@/shared/components/native/skeleton";
import { buttonClass } from "@/shared/lib/ui-classes";

const RANGO_OPTIONS = [
  { value: "1", label: "$" },
  { value: "2", label: "$$" },
  { value: "3", label: "$$$" },
  { value: "4", label: "$$$$" },
];

export function BrandingStep() {
  const router = useRouter();
  const [imagen, setImagen] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [etiquetaId, setEtiquetaId] = useState("");
  const [rango, setRango] = useState("2");
  const [saving, setSaving] = useState(false);

  const { data: mi, isLoading } = useQuery({
    queryKey: queryKeys.miRestaurante,
    queryFn: fetchMiRestaurante,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: queryKeys.categorias,
    queryFn: fetchCategorias,
    staleTime: STALE.catalog,
  });

  const { data: etiquetas = [] } = useQuery({
    queryKey: queryKeys.etiquetas,
    queryFn: fetchEtiquetas,
    staleTime: STALE.catalog,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mi?.restaurante?.ID_Key) return;

    setSaving(true);
    try {
      await modificarRestaurante(mi.restaurante.ID_Key, {
        ...mi.restaurante,
        Imagen_destacada: imagen || mi.restaurante.Imagen_destacada,
        Rango_de_precios: Number(rango),
        ID_categorias: categoriaId || mi.restaurante.ID_categorias,
        ID_Etiqueta: etiquetaId || mi.restaurante.ID_Etiqueta,
      });
      toast.success("Branding actualizado");
      router.push("/onboarding/exito");
    } catch {
      toast.error("Error al guardar branding");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <OnboardingLayout title="Branding">
        <Skeleton className="h-48 w-full" />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout title="Branding" description="Personaliza la presencia de tu restaurante">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imagen">URL imagen destacada</Label>
          <Input
            id="imagen"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <SelectField
            id="categoria"
            value={categoriaId}
            onValueChange={setCategoriaId}
            placeholder="Tipo de restaurante"
            options={categorias.map((c) => ({ value: c.ID_Key, label: c.Nombre }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="etiqueta">Etiqueta</Label>
          <SelectField
            id="etiqueta"
            value={etiquetaId}
            onValueChange={setEtiquetaId}
            placeholder="Etiqueta"
            options={etiquetas.map((e) => ({ value: e.ID_Key, label: e.Nombre }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rango">Rango de precios</Label>
          <SelectField id="rango" value={rango} onValueChange={setRango} options={RANGO_OPTIONS} />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Finalizar"}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  );
}

export function ExitoStep() {
  return (
    <OnboardingLayout title="¡Todo listo!" description="Tu restaurante está configurado">
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-2xl">
          ✓
        </div>
        <p className="text-muted-foreground">
          Ya puedes gestionar reservas, clientes y operaciones desde tu dashboard.
        </p>
        <Link href="/dashboard" className={buttonClass(undefined, undefined, "mt-6 inline-flex")}>
          Ir al dashboard
        </Link>
      </div>
    </OnboardingLayout>
  );
}
