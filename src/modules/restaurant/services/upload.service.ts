import { api } from "@/shared/lib/api-client";
import type {
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  PresignedUploadRequest,
  PresignedUploadResponse,
  UploadDocumentType,
} from "@/modules/restaurant/types/restaurant-profile";

export async function requestPresignedUpload(
  payload: PresignedUploadRequest,
): Promise<PresignedUploadResponse> {
  return api<PresignedUploadResponse>("/uploads/presigned", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function confirmUpload(payload: ConfirmUploadRequest): Promise<ConfirmUploadResponse> {
  return api<ConfirmUploadResponse>("/uploads/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  mimeType: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Error al subir archivo (${res.status})`);
  }
}

export async function uploadRestaurantFile(
  file: File,
  documentType: UploadDocumentType,
): Promise<ConfirmUploadResponse> {
  const mimeType = file.type || "application/octet-stream";
  const presigned = await requestPresignedUpload({
    document_type: documentType,
    filename: file.name,
    mime_type: mimeType,
  });

  await uploadToPresignedUrl(presigned.upload_url, file, mimeType);

  return confirmUpload({
    document_type: documentType,
    storage_key: presigned.storage_key,
    filename: file.name,
    mime_type: mimeType,
    size_bytes: file.size,
  });
}
