import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorIndicator } from '@/components/ui/error-indicator';

export function ErrorPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Card className="p-6 text-center">
          {/* <div className="flex justify-center mb-8">
            <ErrorIndicator />
          </div> */}
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          
          <p className="text-gray-600 mb-6">
            We're unable to load your order details at the moment. This could be due to a temporary connection issue or server maintenance.
          </p>

          <div className="space-y-4">
            <Button 
              onClick={handleRefresh}
              className="w-full"
            >
              Try Again
            </Button>
            
            <a 
              href="mailto:support@capturehealth.io"
              className="block text-sm text-gray-600 hover:text-gray-900"
            >
              Contact Support →
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}