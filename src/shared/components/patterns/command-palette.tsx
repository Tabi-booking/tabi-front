"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { getVisibleNavItems } from "@/shared/lib/auth/nav-access";
import { Modal } from "@/shared/components/native/modal";
import { inputClass } from "@/shared/lib/ui-classes";
import { cn } from "@/shared/lib/utils";
import { usePermissions } from "@/shared/hooks/use-permissions";

interface CommandPaletteProps {
  onNewReserva?: () => void;
}

export function CommandPalette({ onNewReserva }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { session, canWriteReservations } = usePermissions();

  const navItems = useMemo(() => getVisibleNavItems(session), [session]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [query, navItems]);

  const showNewReserva =
    canWriteReservations && (!query.trim() || "nueva reserva".includes(query.trim().toLowerCase()));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-md border border-border bg-background p-2 text-muted-foreground hover:bg-accent md:hidden"
        aria-label="Buscar páginas"
      >
        <Search className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent md:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Buscar...</span>
        <kbd className="pointer-events-none ml-4 rounded border border-border bg-secondary px-1.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <Modal open={open} onOpenChange={setOpen} className="overflow-hidden sm:max-w-lg">
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar páginas y acciones..."
            className={cn(inputClass, "h-12 border-0 bg-transparent shadow-none focus-visible:ring-0")}
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredNav.length === 0 && !showNewReserva ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Sin resultados.</p>
          ) : (
            <>
              {filteredNav.length > 0 && (
                <div className="mb-2">
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Navegación</p>
                  <ul>
                    {filteredNav.map(({ path, label, icon: Icon }) => (
                      <li key={path}>
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                          onClick={() => navigate(path)}
                        >
                          <Icon className="h-4 w-4" /> {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {showNewReserva && (
                <div>
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Acciones</p>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setOpen(false);
                      onNewReserva?.();
                      router.push("/reservas");
                    }}
                  >
                    <Plus className="h-4 w-4" /> Nueva reserva
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
