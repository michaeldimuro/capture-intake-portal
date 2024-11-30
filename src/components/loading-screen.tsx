import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size={48} className="text-primary mb-4" />
        <p className="text-lg text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}