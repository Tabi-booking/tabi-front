"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Plus, X } from "lucide-react";
import {
  type FeatureCategory,
  FEATURE_CATALOG,
  getFeatureIcon,
  getFeatureLabel,
  normalizeFeatureValue,
} from "@/modules/restaurant/lib/feature-catalog";
import { Input } from "@/shared/components/native/input";
import { cn } from "@/shared/lib/utils";

interface TagChipEditorProps {
  category: FeatureCategory;
  title: string;
  description?: string;
  icon: LucideIcon;
  selected: string[];
  onChange: (values: string[]) => void;
  allowCustom?: boolean;
  single?: boolean;
}

export function TagChipEditor({
  category,
  title,
  description,
  icon: TitleIcon,
  selected,
  onChange,
  allowCustom = true,
  single = false,
}: TagChipEditorProps) {
  const [customInput, setCustomInput] = useState("");
  const presets = FEATURE_CATALOG[category];

  const toggle = (value: string) => {
    const normalized = normalizeFeatureValue(value);
    if (!normalized) return;

    if (single) {
      onChange(selected.includes(normalized) ? [] : [normalized]);
      return;
    }

    if (selected.some((s) => s.toLowerCase() === normalized.toLowerCase())) {
      onChange(selected.filter((s) => s.toLowerCase() !== normalized.toLowerCase()));
    } else {
      onChange([...selected, normalized]);
    }
  };

  const remove = (value: string) => {
    onChange(selected.filter((s) => s.toLowerCase() !== value.toLowerCase()));
  };

  const addCustom = () => {
    const normalized = normalizeFeatureValue(customInput);
    if (!normalized) return;
    if (single) {
      onChange([normalized]);
    } else if (!selected.some((s) => s.toLowerCase() === normalized.toLowerCase())) {
      onChange([...selected, normalized]);
    }
    setCustomInput("");
  };

  const isSelected = (value: string) =>
    selected.some((s) => s.toLowerCase() === value.toLowerCase());

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-primary/[0.03] to-card p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <TitleIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selected.map((value) => {
            const Icon = getFeatureIcon(value);
            return (
              <span
                key={value}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {getFeatureLabel(value, category)}
                <button
                  type="button"
                  onClick={() => remove(value)}
                  className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-primary/20 hover:text-foreground"
                  aria-label={`Quitar ${value}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {presets.map(({ value, label, icon: Icon }) => {
          const active = isSelected(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {allowCustom && (
        <div className="mt-4 flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Agregar otro..."
            className="h-9 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>
      )}
    </div>
  );
}
