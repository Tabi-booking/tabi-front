"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { resolveSupabaseMediaUrl } from "@/shared/lib/supabase-media-url";
import { cn } from "@/shared/lib/utils";

interface RemoteImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  fallbackClassName?: string;
  priority?: boolean;
  sizes?: string;
}

function toProxyUrl(url: string): string {
  return `/api/media?src=${encodeURIComponent(url)}`;
}

function isOptimizableUrl(url: string): boolean {
  return url.startsWith("/api/media") || url.includes("supabase.co");
}

export function RemoteImage({
  src,
  alt,
  className,
  fill,
  fallbackClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 400px",
}: RemoteImageProps) {
  const resolvedSrc = resolveSupabaseMediaUrl(src);
  const [imgSrc, setImgSrc] = useState<string | null>(resolvedSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(resolveSupabaseMediaUrl(src));
    setFailed(false);
  }, [src]);

  if (!resolvedSrc?.trim() || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/40 text-muted-foreground",
          fill && "h-full w-full",
          fallbackClassName,
          className,
        )}
      >
        <ImageIcon className="h-8 w-8 opacity-40" />
      </div>
    );
  }

  const handleError = () => {
    if (imgSrc && !imgSrc.startsWith("/api/media") && resolvedSrc.includes("supabase.co")) {
      setImgSrc(toProxyUrl(resolvedSrc));
      return;
    }
    setFailed(true);
  };

  const currentSrc = imgSrc ?? resolvedSrc;

  if (!isOptimizableUrl(currentSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        className={cn(fill && "h-full w-full object-cover", className)}
        loading={priority ? "eager" : "lazy"}
        referrerPolicy="no-referrer"
        onError={handleError}
      />
    );
  }

  if (fill) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <Image
          src={currentSrc}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
          priority={priority}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={400}
      height={300}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  );
}
