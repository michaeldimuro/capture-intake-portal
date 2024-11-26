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

let steps = [
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

const stripePublishableKey = 'pk_test_51Pr9I8P9FTx6jjDplhrzT6ggqFpVQwsGsNtu9BLXlOZ4AFjqiZUqrAiElgW1H0NSMjBpyBQ4QHIsnWgCJRXCcDUm00TOJB1lpY'

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<any | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [offeringId, setOfferingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    offeringId: offeringId,
    customer: null,
    shipping: null,
    payment: null,
    questionnaire: null,
  });

  const params = new URLSearchParams(window.location.search);

  useEffect(() => {
    const oid = params.get('oid');
    if (!oid) {
      window.location.href = 'https://capturehealth.io';
    } else {
      setOfferingId(oid);
    }
  }, [params])

  useEffect(() => {
    setFormData((prev) => ({ ...prev, offeringId: offeringId }));
  }, [offeringId])


  const fetchConfig = async (offeringId: string) => {
    const config = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/intake/settings/${offeringId}`
    ).then((res) => res.json());

    const { company, offering, questions } = config;

    setCompany(company);
    setProduct(offering);
    setQuestions(questions);
    // setProduct({
    //   ...p,
    //   image:
    //     "https://www.ziphealth.co/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fzh_sildenafil_PDP-ecom-hero_A_desktop.1853e43a.jpg&w=3840&q=75",
    //   price: 23.99,
    // });
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("Offering ID: ", offeringId);
    if (offeringId) {
      fetchConfig(offeringId);
    }
  }, [offeringId]);

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
        return (
          <PaymentForm 
            onSubmit={handlePaymentSubmit} 
            shippingDetails={formData.shipping!}
            stripePublishableKey={stripePublishableKey}
          />
        );
      case 4:
        return (
          <Questionnaire
            onSubmit={handleQuestionnaireSubmit}
            questions={questions as Question[]}
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
          <span className="text-slate-700">Powered by Capture Health</span>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
