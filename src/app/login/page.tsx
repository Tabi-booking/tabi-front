import { Suspense } from "react";
import { AuthLayout } from "@/modules/auth/components/auth-layout";
import { LoginForm } from "@/modules/auth/components/login-form";
import { Skeleton } from "@/shared/components/native/skeleton";

export default function LoginPage() {
  return (
    <AuthLayout title="Iniciar sesión" subtitle="Accede a tu panel de operaciones">
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
