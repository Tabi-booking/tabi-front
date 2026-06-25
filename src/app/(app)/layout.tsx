import { AuthGuard } from "@/shared/components/layout/auth-guard";
import { AppShell } from "@/shared/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AuthGuard>{children}</AuthGuard>
    </AppShell>
  );
}
