import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <LoadingSpinner size={48} className="text-primary" />
        </div>
        <p className="text-lg text-muted-foreground animate-pulse mt-24">
          One moment.. We're getting your order ready.
        </p>
      </div>
    </div>
  );
}