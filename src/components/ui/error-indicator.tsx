import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ErrorIndicator({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute -inset-1 rounded-full bg-red-400/20 blur-sm animate-pulse" />
      <div className="relative rounded-full bg-gradient-to-br from-red-500 to-red-600 p-4">
        <XCircle className="h-8 w-8 text-white animate-[error_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}