"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Settings, UserCircle } from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import { Button } from "@/shared/components/native/button";
import { Separator } from "@/shared/components/native/separator";

function getUserInitials(session: ReturnType<typeof useAuth>["session"]): string {
  if (!session) return "?";
  if (session.kind === "super") return "SA";
  const nombre = session.nombre?.trim();
  const apellido = session.apellido?.trim();
  if (nombre && apellido) return `${nombre[0]}${apellido[0]}`.toUpperCase();
  if (nombre) return nombre.slice(0, 2).toUpperCase();
  if (session.email) return session.email.slice(0, 2).toUpperCase();
  return "US";
}

export function UserNav() {
  const { session, logout } = useAuth();
  const initials = getUserInitials(session);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const displayName = [session?.nombre, session?.apellido].filter(Boolean).join(" ").trim();

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="ghost"
        className="relative h-9 w-9 rounded-full p-0"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
          {initials}
        </span>
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-popover p-1 shadow-md"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium">{displayName || "Mi cuenta"}</p>
            <p className="truncate text-xs text-muted-foreground">{session?.email}</p>
            {session?.rol && (
              <p className="mt-0.5 text-xs capitalize text-muted-foreground">{session.rol}</p>
            )}
          </div>
          <Separator className="my-1" />
          <Link
            href="/cuenta"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            <UserCircle className="h-4 w-4" />
            Mi cuenta
          </Link>
          <Link
            href="/configuraciones"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4" />
            Configuraciones
          </Link>
          <Link
            href="/manuales"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            <BookOpen className="h-4 w-4" />
            Manuales de uso
          </Link>
          <Separator className="my-1" />
          <button
            type="button"
            role="menuitem"
            className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
