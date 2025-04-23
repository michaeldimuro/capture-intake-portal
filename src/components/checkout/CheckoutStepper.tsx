import { useTrackInteraction } from '@/hooks/useTrackInteraction';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

interface CheckoutStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  analyticsId?: string | null;
}

export function CheckoutStepper({
  steps,
  currentStep,
  className,
  analyticsId = null,
}: CheckoutStepperProps) {
  const trackInteraction = useTrackInteraction(analyticsId);

  return (
    <div className={cn('w-full max-w-3xl mx-auto mb-8', className)}>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;

          return (
            <div
              key={step.title}
              className={cn(
                'flex flex-col items-center relative flex-1',
              )}
            >
              {/* Progress Line */}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-4 left-[calc(50%+1rem)] right-[calc(50%+1rem)] h-0.5 -translate-y-1/2',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                />
              )}
              
              {/* Circle */}
              <div
                className={cn(
                  'relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCurrent
                    ? 'border-primary text-primary bg-background'
                    : 'border-muted-foreground/20 text-muted-foreground bg-background'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Text */}
              <div className="text-center mt-2">
                <div
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1 hidden md:block">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}