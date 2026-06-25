import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

type BrandLogoVariant = "imagotipo" | "isotipo" | "icon";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  href?: string;
  className?: string;
  /** For imagotipo on light backgrounds */
  inverted?: boolean;
}

export function BrandLogo({
  variant = "imagotipo",
  href,
  className,
  inverted = false,
}: BrandLogoProps) {
  const content =
    variant === "icon" ? (
      <Image
        src="/img/tabi-icon.png"
        alt="Tabi"
        width={40}
        height={40}
        className={cn("h-10 w-10 rounded-2xl object-contain", className)}
        priority
      />
    ) : variant === "isotipo" ? (
      <Image
        src="/img/tabi-isotipo.png"
        alt="Tabi"
        width={36}
        height={36}
        className={cn("h-9 w-9 object-contain", className)}
        priority
      />
    ) : inverted ? (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        <Image src="/img/tabi-isotipo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" priority />
        <span className="text-xl font-bold tracking-tight text-foreground">Tabi</span>
      </span>
    ) : (
      <Image
        src="/img/tabi-logo-dark.png"
        alt="Tabi"
        width={120}
        height={36}
        className={cn("h-8 w-auto object-contain", className)}
        priority
      />
    );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

export const BRAND = {
  name: "Tabi",
  tagline: "Tu próxima mesa, a solo un clic.",
  headline: "Reservar nunca fue tan delicioso.",
} as const;
