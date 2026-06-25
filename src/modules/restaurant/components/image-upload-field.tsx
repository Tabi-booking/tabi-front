"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadRestaurantFile } from "@/modules/restaurant/services/upload.service";
import type { ConfirmUploadResponse, UploadDocumentType } from "@/modules/restaurant/types/restaurant-profile";
import { RemoteImage } from "@/shared/components/patterns/remote-image";
import { ApiError } from "@/shared/lib/api-client";
import { buttonClass } from "@/shared/lib/ui-classes";
import { cn } from "@/shared/lib/utils";

interface ImageUploadFieldProps {
  label: string;
  hint?: string;
  currentUrl?: string | null;
  documentType: UploadDocumentType;
  accept?: string;
  onUploaded: (result: ConfirmUploadResponse) => void;
  disabled?: boolean;
}

export function ImageUploadField({
  label,
  hint,
  currentUrl,
  documentType,
  accept = "image/png,image/jpeg,image/webp",
  onUploaded,
  disabled,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || disabled) return;
    setUploading(true);
    try {
      const result = await uploadRestaurantFile(file, documentType);
      toast.success("Archivo subido correctamente");
      onUploaded(result);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 503
            ? "El almacenamiento no está disponible. Contacta soporte."
            : err.message
          : err instanceof Error
            ? err.message
            : "Error al subir archivo";
      toast.error(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-border bg-muted/30">
        <RemoteImage src={currentUrl} alt={label} fill fallbackClassName="text-xs" />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(buttonClass("outline", "sm", "gap-2"))}
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Subiendo..." : currentUrl ? "Cambiar" : "Subir"}
      </button>
    </div>
  );
}
