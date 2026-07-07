import { Skeleton } from "@/components/ui/skeleton";

export function LoadingOverlay({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95">
      <div className="w-full max-w-sm space-y-4 p-6">
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-6 w-3/4 rounded-full" />
        <Skeleton className="h-6 w-1/2 rounded-full" />
      </div>
    </div>
  );
}
