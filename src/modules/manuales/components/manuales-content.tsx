"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, Lightbulb, Search } from "lucide-react";
import {
  MANUAL_GUIDES,
  MANUAL_CATEGORIES,
  type ManualCategory,
  type ManualGuide,
} from "@/modules/manuales/lib/manual-guides";
import { AppPageShell } from "@/shared/components/layout/app-page-shell";
import { buttonClass } from "@/shared/lib/ui-classes";
import { Input } from "@/shared/components/native/input";
import { cn } from "@/shared/lib/utils";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { useMemo, useState } from "react";

function FeaturedGuideCard({ guide }: { guide: ManualGuide }) {
  const Icon = guide.icon;

  return (
    <article
      id={guide.id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.04] shadow-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Guía recomendada
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              {guide.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{guide.summary}</p>
          </div>
        </div>

        <ol className="mt-6 space-y-3">
          {guide.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span className="pt-0.5 leading-relaxed text-foreground">{step}</span>
            </li>
          ))}
        </ol>

        {guide.tips && guide.tips.length > 0 && (
          <div className="mt-5 rounded-xl border border-border bg-card/80 px-4 py-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5" />
              Consejos
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {guide.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {guide.relatedHref && guide.relatedLabel && (
          <div className="mt-5">
            <Link
              href={guide.relatedHref}
              className={cn(buttonClass("default", "sm"), "inline-flex gap-1.5")}
            >
              {guide.relatedLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

function ManualGuideArticle({
  guide,
  compact = false,
}: {
  guide: ManualGuide;
  compact?: boolean;
}) {
  const Icon = guide.icon;

  return (
    <article
      id={guide.id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={cn("p-5", !compact && "sm:p-6")}>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold tracking-tight text-foreground">{guide.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{guide.summary}</p>
          </div>
        </div>

        <ol className="mt-5 space-y-3 border-t border-border pt-5">
          {guide.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/60 text-xs font-semibold text-foreground">
                {index + 1}
              </span>
              <span className="pt-0.5 leading-relaxed text-foreground">{step}</span>
            </li>
          ))}
        </ol>

        {guide.tips && guide.tips.length > 0 && (
          <div className="mt-4 rounded-xl bg-secondary/40 px-4 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5" />
              Consejos
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {guide.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {guide.relatedHref && guide.relatedLabel && (
          <div className="mt-4">
            <Link
              href={guide.relatedHref}
              className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
            >
              {guide.relatedLabel}
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

function GuideQuickLink({ guide }: { guide: ManualGuide }) {
  const Icon = guide.icon;

  return (
    <a
      href={`#${guide.id}`}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:border-primary/25 hover:bg-accent/30"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{guide.title}</p>
        <p className="truncate text-xs text-muted-foreground">{guide.summary}</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

const CATEGORY_ORDER = Object.keys(MANUAL_CATEGORIES) as ManualCategory[];

export function ManualesContent() {
  const { isAdmin } = usePermissions();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ManualCategory | "all">("all");

  const visibleGuides = useMemo(() => {
    return MANUAL_GUIDES.filter((guide) => !guide.adminOnly || isAdmin);
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleGuides.filter((guide) => {
      const matchesCategory = category === "all" || guide.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        guide.title.toLowerCase().includes(q) ||
        guide.summary.toLowerCase().includes(q) ||
        guide.steps.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [visibleGuides, search, category]);

  const grouped = useMemo(() => {
    const map = new Map<ManualCategory, ManualGuide[]>();
    for (const guide of filtered) {
      const list = map.get(guide.category) ?? [];
      list.push(guide);
      map.set(guide.category, list);
    }
    return map;
  }, [filtered]);

  const featuredGuide = visibleGuides.find((g) => g.id === "bienvenida");
  const showFeatured = !search && category === "all" && featuredGuide;
  const showQuickNav = !search && category === "all";

  return (
    <AppPageShell
      title="Guías de uso"
      description="Todo lo que necesitas para operar tu restaurante con Tabi"
      className="max-w-3xl"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Aprende a tu ritmo
              </h2>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
                Guías cortas y prácticas para reservas, tu local y el equipo. Sin tecnicismos.
              </p>
            </div>
          </div>
          <p className="shrink-0 text-sm text-muted-foreground">
            {visibleGuides.length} guías disponibles
          </p>
        </div>

        <div className="border-t border-border bg-secondary/20 px-5 py-4 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por tema o palabra clave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-border bg-card pl-10 shadow-none"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por tema">
            <button
              type="button"
              role="tab"
              aria-selected={category === "all"}
              onClick={() => setCategory("all")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground",
              )}
            >
              Todas
            </button>
            {CATEGORY_ORDER.map((key) => {
              const CategoryIcon = MANUAL_CATEGORIES[key].icon;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={category === key}
                  onClick={() => setCategory(key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    category === key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground",
                  )}
                >
                  <CategoryIcon className="h-3.5 w-3.5" />
                  {MANUAL_CATEGORIES[key].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showQuickNav && (
        <div className="grid gap-2 sm:grid-cols-2">
          {visibleGuides
            .filter((g) => g.id !== "bienvenida")
            .slice(0, 4)
            .map((guide) => (
              <GuideQuickLink key={guide.id} guide={guide} />
            ))}
        </div>
      )}

      {showFeatured && featuredGuide && <FeaturedGuideCard guide={featuredGuide} />}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-14 text-center">
          <p className="text-sm font-medium text-foreground">Sin resultados</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba otro término o cambia el filtro de categoría.
          </p>
        </div>
      ) : category === "all" ? (
        <div className="space-y-10">
          {CATEGORY_ORDER.map((key) => {
            const guides = grouped.get(key);
            if (!guides?.length) return null;
            const meta = MANUAL_CATEGORIES[key];
            const CategoryIcon = meta.icon;
            const sectionGuides =
              !search && category === "all"
                ? guides.filter((g) => g.id !== "bienvenida")
                : guides;
            if (sectionGuides.length === 0) return null;

            return (
              <section key={key}>
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <CategoryIcon className="h-4 w-4 text-primary" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                      {meta.label}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">{meta.description}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {sectionGuides.map((guide) => (
                    <ManualGuideArticle key={guide.id} guide={guide} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((guide) => (
            <ManualGuideArticle key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </AppPageShell>
  );
}
