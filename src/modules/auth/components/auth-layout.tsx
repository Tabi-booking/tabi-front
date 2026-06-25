import Image from "next/image";
import { ReactNode } from "react";
import { BrandLogo, BRAND } from "@/shared/components/brand/brand-logo";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/img/auth-restaurant.jpg"
          alt="Interior de restaurante"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tabi-navy via-tabi-navy/75 to-tabi-navy/40" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <BrandLogo href="/login" />
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
              {BRAND.tagline}
            </p>
            <h2 className="max-w-md text-3xl font-bold tracking-tight">{BRAND.headline}</h2>
            <p className="mt-4 max-w-md text-base font-light text-white/85">
              Gestiona reservas, clientes y operaciones con la calidez de Tabi y la precisión de un SaaS moderno.
            </p>
          </div>
          <p className="text-xs text-white/50">© Tabi — Civicoin</p>
        </div>
      </div>
      <div className="auth-light flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandLogo variant="imagotipo" href="/login" />
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm font-normal text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
