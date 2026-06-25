import { ReactNode } from "react";
import { BrandLogo } from "@/shared/components/brand/brand-logo";
import { OnboardingStepper } from "@/modules/onboarding/components/onboarding-stepper";

export function OnboardingLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8 md:py-12">
      <BrandLogo variant="imagotipo" inverted href="/dashboard" className="mb-6" />
      <OnboardingStepper />
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm font-normal text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
