export type StorageBucket = 'products' | 'avatars' | 'documents' | 'receipts' | 'suppliers';
export interface UploadedFile {
  bucket: StorageBucket;
  path: string;
  publicUrl: string;
  size: number;
  mimeType: string;
}
export interface UploadPayload {
  bucket: StorageBucket;
  fileName: string;
  base64Data: string;
  mimeType: string;
}