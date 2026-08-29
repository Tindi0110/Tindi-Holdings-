import React, { useState, useEffect } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  fallbackIcon?: React.ReactNode;
  aspectRatio?: "square" | "video" | "auto" | "wide";
  objectFit?: "contain" | "cover" | "fill" | "none";
  containerClassName?: string;
  showSkeleton?: boolean;
}

export function SafeImage({
  src,
  alt,
  className,
  fallbackText = "Image unavailable",
  fallbackIcon,
  aspectRatio = "auto",
  objectFit = "contain",
  containerClassName,
  showSkeleton = true,
  loading = "lazy",
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state if src changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[16/9]",
    auto: "",
  };

  const objectFitClasses = {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    none: "object-none",
  };

  const isInvalidSrc = !src || src.trim() === "";

  if (isInvalidSrc || hasError) {
    return (
      <div
        className={cn(
          "w-full h-full min-h-[80px] bg-muted/40 rounded-xl flex flex-col items-center justify-center p-3 text-muted-foreground select-none border border-border/50",
          aspectClasses[aspectRatio],
          containerClassName
        )}
        aria-label={alt}
        role="img"
      >
        {fallbackIcon || <ImageOff className="h-6 w-6 mb-1 opacity-50" />}
        <span className="text-[11px] font-medium text-center opacity-70 line-clamp-1">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden w-full h-full flex items-center justify-center bg-muted/20",
        aspectClasses[aspectRatio],
        containerClassName
      )}
    >
      {isLoading && showSkeleton && (
        <div className="absolute inset-0 bg-muted/50 animate-pulse flex items-center justify-center z-10">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/40" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={cn(
          "w-full h-full transition-opacity duration-300",
          objectFitClasses[objectFit],
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        {...props}
      />
    </div>
  );
}
