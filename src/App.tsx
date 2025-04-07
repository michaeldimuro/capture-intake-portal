import { useEffect, useState, useRef } from "react";
import { ThemeProvider } from "@/lib/theme-context";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { InitialForm } from "@/components/checkout/InitialForm";
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
    title: "Details",
    description: "Personal info",
  },
  {
    title: "Payment",
    description: "Payment details",
  },
  {
    title: "Screening",
    description: "Quick questions",
  },
];

interface FormData {
  offeringId: string | null;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
  } | null;
  shipping: {
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  payment: any | null;
  questionnaire: any | null;
}

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
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
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

  // Scroll to top when showing summary
  useEffect(() => {
    if (showingSummary && contentRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showingSummary]);

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
      
      // Use the utility function to adapt the product structure
      setProduct(offering);
      
      setQuestions(questionnaire?.questions || []);
      setAuthNetCredentials(authNetCredentials);

      setFormData((prev) => ({ ...prev, offeringId: offering?.id }));
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

  const handleInitialSubmit = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      customer: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      },
      shipping: {
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      }
    }));
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = (data: any) => {
    setFormData((prev) => ({ ...prev, payment: data }));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuestionnaireSubmit = (data: any) => {
    setFormData((prev) => ({ ...prev, questionnaire: data }));
    setShowingSummary(true);
    // Scroll to top is handled in the useEffect
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

      setIsOrderComplete(true);

      toast.success("Order completed successfully!", {
        description: "Thank you for your purchase. We'll be in touch soon.",
      });

      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            type: 'CHECKOUT_COMPLETE',
            success: true,
          }, '*');
        } catch (err) {
          console.error('Failed to notify parent window:', err);
        }
      }

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
          payment={formData.payment}
          onSubmit={handlePlaceOrder}
          isSubmitting={isSubmitting}
          isOrderComplete={isOrderComplete}
        />
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <InitialForm
            product={product as Product}
            onSubmit={handleInitialSubmit}
          />
        );
      case 1:
        return (
          <PaymentForm
            onSubmit={handlePaymentSubmit}
            shippingDetails={formData.shipping!}
            authNetCredentials={authNetCredentials as string}
          />
        );
      case 2:
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
        {false && company?.logo && (
          <div className="flex max-w-4xl mx-auto my-8 justify-center">
            <img
              src="https://capture-health-media-prod.s3.us-east-1.amazonaws.com/Assets/hard_logo_slogan.png"
              alt={`${company?.name} Logo`}
              width={240}
            />
          </div>
        )}

        <div ref={contentRef} className="max-w-4xl mx-auto bg-background rounded-xl shadow-lg py-6 pb-0 md:pb-6">
          <CheckoutStepper 
            steps={steps} 
            currentStep={showingSummary ? steps.length : currentStep} 
          />
          <div className="flex justify-center">{renderStep()}</div>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;