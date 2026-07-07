import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class StorageRepository {
  static async upload(bucket: string, path: string, buffer: Buffer, mimeType: string) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, { contentType: mimeType, upsert: true });
    if (error) throw new Error(`[StorageRepository] upload: ${error.message}`);
    return data;
  }

  static async remove(bucket: string, path: string) {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    if (error) throw new Error(`[StorageRepository] remove: ${error.message}`);
  }

  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}