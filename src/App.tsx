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
import { 
  useAnalytics, 
  trackFormProgress, 
  trackFormCompletion, 
  trackFormAbandonment
} from "@/lib/analytics";
import { usePurchaseTracking } from "@/hooks/useTrackInteraction";

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
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any | null>(null);
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

  // Initialize analytics with the company's GA measurement ID (which might be null)
  const { isEnabled: analyticsEnabled } = useAnalytics({ measurementId: company?.googleAnalyticsId ?? null });

  // Initialize purchase tracking
  const {
    trackCheckoutStart,
    trackAddPayment,
    trackAddShipping,
    trackCompletePurchase
  } = usePurchaseTracking(company?.googleAnalyticsId ?? null, company?.name);

  console.log("DEBUG >> isAnalyticsEnabled: ", analyticsEnabled);

  // Track form progress when step changes
  useEffect(() => {
    if (currentStep >= 0 && !showingSummary && analyticsEnabled) {
      trackFormProgress('checkout', currentStep + 1, steps.length, company?.googleAnalyticsId ?? null);
    }
  }, [currentStep, showingSummary, analyticsEnabled, company?.googleAnalyticsId]);

  // Track begin_checkout when user starts the checkout process
  useEffect(() => {
    if (product && analyticsEnabled && currentStep === 0) {
      trackCheckoutStart(product);
    }
  }, [product, analyticsEnabled, currentStep, trackCheckoutStart]);

  useEffect(() => {
    if (shippingMethods.length === 1) {
      setSelectedShippingMethod(shippingMethods[0]);
    }
  }, [shippingMethods]);

  // Track shipping info when shipping method is selected
  useEffect(() => {
    if (selectedShippingMethod && analyticsEnabled && product) {
      const totalValue = Number(product.price) + Number(selectedShippingMethod.price);
      trackAddShipping(totalValue, selectedShippingMethod);
    }
  }, [selectedShippingMethod, analyticsEnabled, product, trackAddShipping]);

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

      const { company, offering, questionnaire, authNetCredentials, shippingMethods: methods } = config;

      setCompany(company);
      
      // Use the utility function to adapt the product structure
      setProduct(offering);
      
      setQuestions(questionnaire?.questions || []);
      setAuthNetCredentials(authNetCredentials);
      setShippingMethods(methods || []);

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
    
    // Track add_payment_info event
    if (analyticsEnabled && product) {
      const totalValue = selectedShippingMethod 
        ? Number(product.price) + Number(selectedShippingMethod.price)
        : Number(product.price);
      
      trackAddPayment(totalValue);
    }
    
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuestionnaireSubmit = (data: any) => {
    setFormData((prev) => ({ ...prev, questionnaire: data }));
    setShowingSummary(true);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);

    try {
      // Ensure payment data is properly sanitized before sending to API
      const paymentData = formData.payment ? {
        paymentMethodId: formData.payment.paymentMethodId,
        paymentDescriptor: formData.payment.paymentDescriptor,
        cardLastFour: formData.payment.cardLastFour,
        nameOnCard: formData.payment.nameOnCard,
        sameAsShipping: formData.payment.sameAsShipping,
        billingAddress1: formData.payment.billingAddress1,
        billingAddress2: formData.payment.billingAddress2,
        billingCity: formData.payment.billingCity,
        billingState: formData.payment.billingState,
        billingZipCode: formData.payment.billingZipCode,
        billingCountry: formData.payment.billingCountry
      } : null;

      // Prepare sanitized request body
      const requestBody = {
        sessionKey,
        offeringId: formData.offeringId,
        customer: formData.customer,
        shipping: formData.shipping,
        payment: paymentData,
        questionnaire: formData.questionnaire,
        shippingMethodId: selectedShippingMethod?.id
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/intake/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const responseData = await response.json();
      
      setIsOrderComplete(true);
      
      // Track purchase completion
      if (analyticsEnabled && product) {
        trackCompletePurchase(product, selectedShippingMethod, responseData.orderId);
        trackFormCompletion('checkout', company?.googleAnalyticsId ?? null);
      }

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

  // Track form abandonment
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isOrderComplete && analyticsEnabled) {
        trackFormAbandonment('checkout', currentStep + 1, steps.length, company?.googleAnalyticsId ?? null);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, isOrderComplete, analyticsEnabled, company?.googleAnalyticsId]);

  const renderStep = () => {
    if (showingSummary) {
      return (
        <OrderSummary
          product={product as Product}
          customer={formData.customer!}
          shipping={formData.shipping!}
          payment={formData.payment}
          shippingMethods={shippingMethods}
          selectedShippingMethod={selectedShippingMethod}
          onShippingMethodSelect={setSelectedShippingMethod}
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