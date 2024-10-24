import { useEffect, useState } from "react";
import { ThemeProvider } from "@/lib/theme-context";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { ProductConfirmation } from "@/components/checkout/ProductConfirmation";
import { CustomerForm } from "@/components/checkout/CustomerForm";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { Questionnaire } from "@/components/checkout/Questionnaire";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Product, Question } from "./lib/types";

const steps = [
  {
    title: "Confirm",
    description: "Review selection",
  },
  {
    title: "Details",
    description: "Personal info",
  },
  {
    title: "Shipping",
    description: "Delivery info",
  },
  {
    title: "Payment",
    description: "Payment details",
  },
  {
    title: "Survey",
    description: "Quick questions",
  },
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    customer: null,
    shipping: null,
    payment: null,
    questionnaire: null,
  });

  // const searchParams = useSearchParams();
  const productId = "9a12e826-dc28-4c44-b7a3-091521fa9b7a";

  const fetchProduct = async (productId: string) => {
    const p = await fetch(
      `http://localhost:3030/dev/company/product-details/${productId}`
    ).then((res) => res.json());
    setProduct({
      ...p,
      image:
        "https://www.ziphealth.co/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fzh_sildenafil_PDP-ecom-hero_A_desktop.1853e43a.jpg&w=3840&q=75",
      price: 23.99,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProduct(productId);
  }, [productId]);

  useEffect(() => {
    console.log("Updated Form Data: ", formData);
  }, [formData]);

  const handleProductConfirm = () => {
    setCurrentStep(1);
  };

  const handleCustomerSubmit = (data: any) => {
    setFormData((prev) => ({ ...prev, customer: data }));
    setCurrentStep(2);
  };

  const handleShippingSubmit = (data: any) => {
    setFormData((prev) => ({ ...prev, shipping: data }));
    setCurrentStep(3);
  };

  const handlePaymentSubmit = (data: any) => {
    setFormData((prev) => ({ ...prev, payment: data }));
    setCurrentStep(4);
  };

  const handleQuestionnaireSubmit = (data: any) => {
    setFormData((prev) => ({ ...prev, questionnaire: data }));
    // Here you would typically submit all the collected data to your backend
    toast.success("Order completed successfully!", {
      description: "Thank you for your purchase.",
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProductConfirmation
            product={product as Product}
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
        return (
          <Questionnaire
            onSubmit={handleQuestionnaireSubmit}
            questions={product?.questions as Question[]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">

        <div className="flex max-w-4xl mx-auto my-8 justify-center">
          <img
            src="https://theme.zdassets.com/theme_assets/2078614/82ac03808ea5074dffd64685ecb1572b7902dfc8.png"
            alt="Company Logo"
            width={150}
          />
        </div>

        <div className="max-w-4xl mx-auto bg-background rounded-xl shadow-lg p-6">
          <CheckoutStepper steps={steps} currentStep={currentStep} />
          <div className="flex justify-center">
            {isLoading ? <div>Loading...</div> : renderStep()}
          </div>
        </div>

        <div className="flex max-w-4xl mx-auto my-6 justify-center">
          <span className='text-slate-700'>Powered by Capture Health</span>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
