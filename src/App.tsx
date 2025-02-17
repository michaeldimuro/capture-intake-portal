import { useEffect, useState } from "react";
import { ThemeProvider } from "@/lib/theme-context";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { ProductConfirmation } from "@/components/checkout/ProductConfirmation";
import { CustomerForm } from "@/components/checkout/CustomerForm";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { Questionnaire } from "@/components/checkout/Questionnaire";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { LoadingScreen } from "@/components/loading-screen";
import { ErrorPage } from "@/components/error-page";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showingSummary, setShowingSummary] = useState(false);
  const [company, setCompany] = useState<any | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [authNetCredentials, setAuthNetCredentials] = useState<string | null>(null);
  const [apiError, setApiError] = useState<any>(null);

  const [formData, setFormData] = useState({
    offeringId: null,
    customer: null,
    shipping: null,
    payment: null,
    questionnaire: null,
  });

  const params = new URLSearchParams(window.location.search);

  useEffect(() => {
    const session = params.get("sid");
    if (!session) {
      window.location.href = "https://capturehealth.io";
    } else {
      setSessionKey(session);
    }
  }, [params]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev}));
  }, [sessionKey]);

  // DEBUG
  // useEffect(() => {
  //   console.log("Form Data: ", formData);
  // }, [formData]);

  const fetchConfig = async (sessionKey: string) => {
    try {
      const config = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/intake/session?sid=${sessionKey}`
      )
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            setApiError(true);
          }
        })
        .catch((e) => setApiError(true));

      const { company, offering, questionnaire, authNetCredentials } = config;

      setCompany(company);
      setProduct(offering);
      setQuestions(questionnaire?.questions);
      setAuthNetCredentials(authNetCredentials);

      setFormData((prev) => ({ ...prev, offeringId: offering?.variant?.id }));
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Failed to load configuration");
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionKey) {
      fetchConfig(sessionKey);
    }
  }, [sessionKey]);

  const handleProductConfirm = () => setCurrentStep(1);

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
    setShowingSummary(true);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/intake/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionKey,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      toast.success("Order completed successfully!", {
        description: "Thank you for your purchase. We'll be in touch soon.",
      });

      // OPTIONAL - Redirect to success page after showing the success message
      // setTimeout(() => {
      //   window.location.href = "https://capturehealth.io/success";
      // }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Failed to complete order", {
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (showingSummary) {
      return (
        <OrderSummary
          product={product as Product}
          customer={formData.customer!}
          shipping={formData.shipping!}
          onSubmit={handlePlaceOrder}
          isSubmitting={isSubmitting}
        />
      );
    }

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
            authNetCredentials={authNetCredentials as string}
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

  if (isLoading) {
    return (
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  if (apiError) {
    return (
      <ThemeProvider>
        <ErrorPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        {company?.logo && (
          <div className="flex max-w-4xl mx-auto my-8 justify-center">
            <img
              src="https://capture-health-media-prod.s3.us-east-1.amazonaws.com/Assets/hard_logo_slogan.png"
              alt={`${company?.name} Logo`}
              width={240}
            />
          </div>
        )}

        <div className="max-w-4xl mx-auto bg-background rounded-xl shadow-lg p-6">
          <CheckoutStepper 
            steps={steps} 
            currentStep={showingSummary ? steps.length : currentStep} 
          />
          <div className="flex justify-center">{renderStep()}</div>
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