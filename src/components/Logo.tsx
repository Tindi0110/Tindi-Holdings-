import React from "react";

export const APP_LOGO_URL =
  "https://tyhdjsgnyccpsihfvstr.supabase.co/storage/v1/object/public/uploads/logos/logo.jpeg";

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <img
      src={APP_LOGO_URL}
      alt="Tindi Holdings Ltd Logo"
      loading="eager"
      className={`object-contain rounded-md ${className}`}
    />
  );
}
