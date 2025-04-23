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
      <div className="relative">
        <div className="overflow-hidden">
          <div className="relative grid grid-cols-3 gap-4 mb-4">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={step.title}
                  className="relative"
                  onClick={() => {
                    trackInteraction({
                      element: 'stepper_step',
                      category: 'navigation',
                      label: step.title,
                      step_index: index,
                      is_active: isActive,
                      is_completed: isCompleted
                    });
                  }}
                >
                  <div
                    className={`
                      h-2 rounded-full transition-all duration-300
                      ${
                        isCompleted
                          ? 'bg-primary'
                          : isActive
                          ? 'bg-primary/50'
                          : 'bg-gray-200'
                      }
                    `}
                  />
                  <div className="mt-2">
                    <p
                      className={`
                        text-sm font-medium
                        ${isActive ? 'text-primary' : 'text-gray-500'}
                      `}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}