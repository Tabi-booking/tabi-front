"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { UserNav } from "@/shared/components/layout/user-nav";
import { Button } from "@/shared/components/native/button";
import { Skeleton } from "@/shared/components/native/skeleton";
import { Drawer } from "@/shared/components/native/drawer";
import { usePermissions } from "@/shared/hooks/use-permissions";

const CommandPalette = dynamic(
  () =>
    import("@/shared/components/patterns/command-palette").then((m) => m.CommandPalette),
  {
    ssr: false,
    loading: () => <Skeleton className="h-9 w-9 rounded-md" />,
  },
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { showNewReservaFab } = usePermissions();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 hidden h-svh shrink-0 md:block">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />
      </div>

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} side="left" className="w-64 p-0">
        <AppSidebar />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Breadcrumbs className="hidden sm:flex" />
          <div className="ml-auto flex items-center gap-2">
            <CommandPalette />
            <UserNav />
          </div>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>

        {showNewReservaFab && (
          <Link
            href="/reservas?action=new"
            className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 md:hidden"
            aria-label="Nueva reserva"
          >
            <Plus className="h-6 w-6" />
          </Link>
        )}
      </div>
    </div>
  );
}
