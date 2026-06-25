"use client";

import type { RestaurantMeResponse } from "@/modules/restaurant/types/restaurant-profile";
import type { ConfirmUploadResponse } from "@/modules/restaurant/types/restaurant-profile";
import { ImageUploadField } from "@/modules/restaurant/components/image-upload-field";
import { RemoteImage } from "@/shared/components/patterns/remote-image";

interface MediaSectionProps {
  data: RestaurantMeResponse;
  onUploaded: (result: ConfirmUploadResponse) => void;
}

export function MediaSection({ data, onUploaded }: MediaSectionProps) {
  const covers = (data.media.covers ?? []).filter((cover) => cover.id !== "logo-cover");

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        El logo y las portadas se muestran en tu perfil público. Sube imágenes en formato JPG o PNG.
      </p>

      <ImageUploadField
        label="Logo"
        hint="PNG o JPG, recomendado cuadrado"
        currentUrl={data.media.logo_url}
        documentType="logo"
        onUploaded={onUploaded}
      />

      <div className="space-y-4">
        <ImageUploadField
          label="Nueva imagen de portada"
          hint="Se agregará a la galería de portadas del perfil"
          documentType="cover"
          onUploaded={onUploaded}
        />
        {covers.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-medium">Portadas actuales</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {covers.map((cover) => (
                <div
                  key={cover.id}
                  className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted/30"
                >
                  <RemoteImage src={cover.url} alt="Portada" fill />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(data.media.documents ?? []).length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Documentos</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {data.media.documents?.map((doc) => (
              <li key={doc.id ?? doc.storage_key}>{doc.filename ?? doc.storage_key}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
