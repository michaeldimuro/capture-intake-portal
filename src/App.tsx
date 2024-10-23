import { useState } from 'react';
import { ThemeProvider } from '@/lib/theme-context';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { ProductConfirmation } from '@/components/checkout/ProductConfirmation';
import { CustomerForm } from '@/components/checkout/CustomerForm';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { Questionnaire } from '@/components/checkout/Questionnaire';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Mock product data (in real app, this would come from the previous page)
const mockProduct = {
  id: '1',
  name: 'Premium Product',
  price: 99.99,
  description: 'High-quality premium product with amazing features',
  image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
};

const steps = [
  {
    title: 'Confirm',
    description: 'Review selection',
  },
  {
    title: 'Details',
    description: 'Personal info',
  },
  {
    title: 'Shipping',
    description: 'Delivery info',
  },
  {
    title: 'Payment',
    description: 'Payment details',
  },
  {
    title: 'Survey',
    description: 'Quick questions',
  },
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    customer: null,
    shipping: null,
    payment: null,
    questionnaire: null,
  });

  const handleProductConfirm = () => {
    setCurrentStep(1);
  };

  const handleCustomerSubmit = (data) => {
    setFormData((prev) => ({ ...prev, customer: data }));
    setCurrentStep(2);
  };

  const handleShippingSubmit = (data) => {
    setFormData((prev) => ({ ...prev, shipping: data }));
    setCurrentStep(3);
  };

  const handlePaymentSubmit = (data) => {
    setFormData((prev) => ({ ...prev, payment: data }));
    setCurrentStep(4);
  };

  const handleQuestionnaireSubmit = (data) => {
    setFormData((prev) => ({ ...prev, questionnaire: data }));
    // Here you would typically submit all the collected data to your backend
    toast.success('Order completed successfully!', {
      description: 'Thank you for your purchase.',
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProductConfirmation
            product={mockProduct}
            onConfirm={handleProductConfirm}
          />
        );
      case 1:
        return <CustomerForm onSubmit={handleCustomerSubmit} />;
      case 2:
        return <ShippingForm onSubmit={handleShippingSubmit} />;
      case 3:
        return <PaymentForm onSubmit={handlePaymentSubmit} />;
      case 4:
        return <Questionnaire onSubmit={handleQuestionnaireSubmit} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-background rounded-xl shadow-lg p-6">
          <CheckoutStepper steps={steps} currentStep={currentStep} />
          <div className="flex justify-center">
            {renderStep()}
          </div>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;