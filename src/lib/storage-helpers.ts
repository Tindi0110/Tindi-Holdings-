import { supabase } from "@/integrations/supabase/client";

export interface ImageValidationOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

export interface UploadImageResult {
  success: boolean;
  publicUrl?: string;
  filePath?: string;
  error?: string;
}

export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export const DEFAULT_MAX_IMAGE_SIZE_MB = 5;

/**
 * Validates file type and size before sending across the network.
 */
export function validateImageFile(
  file: File,
  options: ImageValidationOptions = {},
): { valid: boolean; error?: string } {
  const maxSize = options.maxSizeInMB ?? DEFAULT_MAX_IMAGE_SIZE_MB;
  const allowed = options.allowedTypes ?? DEFAULT_ALLOWED_IMAGE_TYPES;

  if (!allowed.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported format (${file.type || "unknown"}). Allowed formats: JPEG, PNG, WebP, GIF, AVIF.`,
    };
  }

  if (file.size > maxSize * 1024 * 1024) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeInMB}MB). Maximum allowed size is ${maxSize}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Generates a clean, unique file path using UUID to avoid collisions and overwrites.
 */
export function generateUniqueFilePath(file: File, folder = ""): string {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const cleanExt = fileExt.replace(/[^a-z0-9]/gi, "");
  const uniqueId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

  const fileName = `${uniqueId}.${cleanExt}`;
  return folder ? `${folder.replace(/\/+$/, "")}/${fileName}` : fileName;
}

/**
 * Uploads an image file to Supabase Storage and returns the permanent public URL.
 */
export async function uploadImageToSupabase(
  file: File,
  bucket = "products",
  folder = "uploads",
  validationOptions?: ImageValidationOptions,
): Promise<UploadImageResult> {
  try {
    // 1. Validate file
    const validation = validateImageFile(file, validationOptions);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 2. Generate unique path
    const filePath = generateUniqueFilePath(file, folder);

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      // If RLS policy or storage bucket issue occurs, provide clear actionable message
      console.warn(`[Supabase Storage] Upload error in bucket '${bucket}':`, uploadError.message);
      return { success: false, error: uploadError.message };
    }

    // 4. Retrieve Public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: data.publicUrl,
      filePath,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred during image upload.",
    };
  }
}

/**
 * Deletes an image from Supabase Storage by its path or public URL.
 */
export async function deleteImageFromSupabase(
  bucket = "products",
  pathOrUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    let filePath = pathOrUrl;

    // If a full public URL was passed, extract relative storage path
    if (pathOrUrl.includes(`/storage/v1/object/public/${bucket}/`)) {
      filePath = pathOrUrl.split(`/storage/v1/object/public/${bucket}/`)[1] || pathOrUrl;
    }

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove image from storage." };
  }
}
