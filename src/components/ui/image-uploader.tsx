import React, { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { uploadImageToSupabase, validateImageFile } from "@/lib/storage-helpers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  bucket = "products",
  folder = "uploads",
  maxSizeMB = 5,
  label = "Product Image",
  helperText = `Supports JPEG, PNG, WebP, AVIF up to ${maxSizeMB}MB`,
  className,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview if value changes externally
  React.useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const processFile = async (file: File) => {
    // 1. Client validation
    const validation = validateImageFile(file, { maxSizeInMB: maxSizeMB });
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file selected.");
      return;
    }

    // 2. Set instant local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      // 3. Upload to Supabase Storage
      const result = await uploadImageToSupabase(file, bucket, folder, { maxSizeInMB: maxSizeMB });

      if (result.success && result.publicUrl) {
        onChange(result.publicUrl);
        setPreviewUrl(result.publicUrl);
        toast.success("Image uploaded successfully to cloud storage");
      } else {
        // Fallback: If cloud storage bucket or RLS is not configured, convert to base64 so user's work is not lost
        console.warn("[ImageUploader] Cloud upload fallback to data URL:", result.error);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onChange(base64);
          setPreviewUrl(base64);
          toast.info("Image saved locally (Configure Supabase Storage for CDN hosting)");
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Clear input so same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setPreviewUrl(null);
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
            {label}
          </label>
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Remove image
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative group border border-border rounded-2xl overflow-hidden bg-card/50 aspect-video max-h-[220px] flex items-center justify-center p-3 shadow-xs">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-contain rounded-lg"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-semibold text-foreground">Uploading to Supabase...</span>
            </div>
          )}
          {!isUploading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl text-xs font-bold shadow-md"
              >
                Change Image
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                className="rounded-xl text-xs font-bold shadow-md"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center bg-card/30 hover:bg-card/60",
            isDragging
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border hover:border-primary/40",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-bold text-foreground">Uploading image...</p>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{helperText}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
