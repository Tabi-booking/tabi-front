"use client";

import type { RestaurantCover } from "@/modules/restaurant/types/restaurant-profile";
import { ImageCarousel } from "@/shared/components/patterns/image-carousel";
import { RemoteImage } from "@/shared/components/patterns/remote-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/native/card";

interface RestaurantGalleryProps {
  covers: RestaurantCover[];
  logoUrl?: string | null;
}

export function RestaurantGallery({ covers, logoUrl }: RestaurantGalleryProps) {
  const items = covers.filter((cover) => {
    const url = cover.url?.trim();
    if (!url) return false;
    if (cover.id === "logo-cover" && logoUrl && url === logoUrl) return false;
    return true;
  });

  if (items.length === 0) return null;

  const slides = items.map((cover) => ({
    id: cover.id,
    url: cover.url,
    alt: "Foto del restaurante",
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Galería
          {items.length > 1 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({items.length} fotos)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 1 ? (
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted/30 sm:aspect-[21/9]">
            <ImageCarousel
              images={slides}
              intervalMs={12_000}
              imageAlt="Foto del restaurante"
              controlsVariant="on-image"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted/30">
            <RemoteImage
              src={items[0].url}
              alt="Foto del restaurante"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
