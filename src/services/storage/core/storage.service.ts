import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { StorageRepository } from "../repositories/storage.repository";

export const uploadFile = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        bucket: z.enum(["products", "avatars", "documents", "receipts", "suppliers"]),
        fileName: z.string(),
        base64Data: z.string(),
        mimeType: z.string(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const buffer = Buffer.from(data.base64Data, "base64");
    const path = `${Date.now()}-${data.fileName}`;
    await StorageRepository.upload(data.bucket, path, buffer, data.mimeType);
    const publicUrl = StorageRepository.getPublicUrl(data.bucket, path);
    return { bucket: data.bucket, path, publicUrl, size: buffer.length, mimeType: data.mimeType };
  });

export const deleteFile = createServerFn({ method: "POST" })
  .inputValidator((input: { bucket: string; path: string }) =>
    z.object({ bucket: z.string(), path: z.string() }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    await StorageRepository.remove(data.bucket, data.path);
    return { success: true };
  });
