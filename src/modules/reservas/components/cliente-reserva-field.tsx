"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Search, UserPlus, X } from "lucide-react";
import type { Cliente } from "@/modules/clientes/types/cliente";
import { getClienteNombre } from "@/modules/clientes/services/cliente.service";
import { ClienteInlineForm } from "@/modules/reservas/components/cliente-inline-form";
import { Button } from "@/shared/components/native/button";
import { Input } from "@/shared/components/native/input";
import { ScrollArea } from "@/shared/components/native/scroll-area";
import { cn } from "@/shared/lib/utils";

interface ClienteReservaFieldProps {
  clientes: Cliente[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

const RECENT_LIMIT = 6;

export function ClienteReservaField({
  clientes,
  value,
  onChange,
  error,
}: ClienteReservaFieldProps) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const selected = clientes.find((c) => c.ID_Key === value);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes.slice(0, RECENT_LIMIT);
    return clientes.filter(
      (c) =>
        getClienteNombre(c).toLowerCase().includes(q) ||
        c.Correo.toLowerCase().includes(q) ||
        c.Numero_Documento.includes(q) ||
        c.Telefono.includes(q),
    );
  }, [clientes, search]);

  const handleCreated = (cliente: Cliente) => {
    onChange(cliente.ID_Key);
    setSearch("");
    setShowCreate(false);
  };

  if (selected) {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {selected.Nombre.charAt(0)}
            {selected.Apellido.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{getClienteNombre(selected)}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              {selected.Telefono || "Sin teléfono"}
            </p>
            {selected.Correo && (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                {selected.Correo}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {selected.Tipo_Documento} {selected.Numero_Documento}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onChange("")}
            aria-label="Cambiar cliente"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showCreate ? (
        <ClienteInlineForm
          initialSearch={search}
          onCreated={handleCreated}
          onCancel={() => setShowCreate(false)}
        />
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="pl-9"
              autoFocus
            />
          </div>

          <ScrollArea className="max-h-44 rounded-lg border border-border">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {search.trim() ? "Sin resultados para esa búsqueda." : "Aún no hay clientes."}
                </p>
              </div>
            ) : (
              <ul>
                {!search.trim() && (
                  <li className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Recientes
                  </li>
                )}
                {filtered.map((c) => (
                  <li key={c.ID_Key}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-secondary/60"
                      onClick={() => {
                        onChange(c.ID_Key);
                        setSearch("");
                      }}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                        {c.Nombre.charAt(0)}
                        {c.Apellido.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{getClienteNombre(c)}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {c.Telefono || c.Correo || c.Numero_Documento}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("w-full", search.trim() && "border-primary/40 text-primary")}
            onClick={() => setShowCreate(true)}
          >
            <UserPlus className="h-4 w-4" />
            {search.trim() ? `Crear "${search.trim()}"` : "Crear nuevo cliente"}
          </Button>
        </>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
