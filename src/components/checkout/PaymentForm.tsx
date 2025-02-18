import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PaymentDetails, ShippingDetails } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { decrypt } from "@/lib/utils";

declare const Accept: any;

interface AuthNetCredentials {
  apiLoginId: string;
  clientKey: string;
}

interface PaymentFormProps {
  onSubmit: (data: PaymentDetails) => void;
  shippingDetails: ShippingDetails;
  authNetCredentials: string;
}

// Decrypt credentials only when needed
const getDecryptedCredentials = async (authNetCredentials: string): Promise<AuthNetCredentials> => {
  try {
    return JSON.parse(await decrypt(authNetCredentials));
  } catch (error) {
    console.error('Error decrypting credentials');
    toast.error("Payment system configuration error");
    throw new Error('Failed to initialize payment system');
  }
};

export function PaymentForm({
  onSubmit,
  shippingDetails,
  authNetCredentials
}: PaymentFormProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [cardLastFour, setCardLastFour] = useState<string>("");

  useEffect(() => {
    const script = document.createElement('script');
    // Always use HTTPS for payment-related scripts
    script.src = 'https://js.authorize.net/v1/Accept.js'
    // import.meta.env.PROD 
    //   ? 'https://js.authorize.net/v1/Accept.js'
    //   : "https://jstest.authorize.net/v1/Accept.js";
    script.async = true;
    script.onerror = () => {
      toast.error("Failed to load payment system");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const formSchema = z.object({
    nameOnCard: z.string().min(2, "Name on card is required"),
    sameAsShipping: z.boolean(),
    billingAddress1: z.string().refine((val) => {
      if (!sameAsShipping) {
        return val.length >= 5;
      }
      return true;
    }, "Address is required"),
    billingAddress2: z.string().optional(),
    billingCity: z.string().refine((val) => {
      if (!sameAsShipping) {
        return val.length >= 2;
      }
      return true;
    }, "City is required"),
    billingState: z.string().refine((val) => {
      if (!sameAsShipping) {
        return val.length >= 2;
      }
      return true;
    }, "State is required"),
    billingZipCode: z.string().refine((val) => {
      if (!sameAsShipping) {
        return val.length >= 5;
      }
      return true;
    }, "Valid ZIP code required"),
    billingCountry: z.string().refine((val) => {
      if (!sameAsShipping) {
        return val.length >= 2;
      }
      return true;
    }, "Country is required"),
  });

  const form = useForm<PaymentDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sameAsShipping: true,
      billingAddress1: shippingDetails?.address1,
      billingAddress2: shippingDetails?.address2,
      billingCity: shippingDetails?.city,
      billingState: shippingDetails?.state,
      billingZipCode: shippingDetails?.zipCode,
      billingCountry: shippingDetails?.country,
    },
  });

  useEffect(() => {
    if (sameAsShipping) {
      form.setValue("billingAddress1", shippingDetails?.address1);
      form.setValue("billingAddress2", shippingDetails?.address2);
      form.setValue("billingCity", shippingDetails?.city);
      form.setValue("billingState", shippingDetails?.state);
      form.setValue("billingZipCode", shippingDetails?.zipCode);
      form.setValue("billingCountry", shippingDetails?.country);
    } else {
      form.setValue("billingAddress1", "");
      form.setValue("billingAddress2", "");
      form.setValue("billingCity", "");
      form.setValue("billingState", "");
      form.setValue("billingZipCode", "");
      form.setValue("billingCountry", "");
    }
  }, [sameAsShipping, shippingDetails, form]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <PaymentFormInner
            form={form}
            sameAsShipping={sameAsShipping}
            setSameAsShipping={setSameAsShipping}
            onSubmit={onSubmit}
            authNetCredentials={authNetCredentials}
            setCardLastFour={setCardLastFour}
          />
        </Form>
      </CardContent>
    </Card>
  );
}

interface PaymentFormInnerProps {
  form: any;
  sameAsShipping: boolean;
  setSameAsShipping: (value: boolean) => void;
  onSubmit: (data: PaymentDetails) => void;
  authNetCredentials: string;
  setCardLastFour: (value: string) => void;
}

function PaymentFormInner({
  form,
  sameAsShipping,
  setSameAsShipping,
  onSubmit,
  authNetCredentials,
  setCardLastFour,
}: PaymentFormInnerProps) {
  const handleSubmit = async (formData: any) => {
    if (typeof Accept === 'undefined') {
      toast.error('Payment system not initialized');
      return;
    }

    const cardNumber = (document.getElementById('cardNumber') as HTMLInputElement)?.value;
    if (!cardNumber) {
      toast.error('Please enter card number');
      return;
    }

    // Capture last 4 digits before sending to Authorize.net
    const lastFour = cardNumber.slice(-4);
    setCardLastFour(lastFour);
    const { apiLoginId, clientKey } = await getDecryptedCredentials(authNetCredentials);

    console.log("DEBUG >> apiLoginId: ", apiLoginId)
    console.log("DEBUG >> clientKey: ", clientKey)

    const secureData = {
      authData: {
        clientKey: clientKey,
        apiLoginID: apiLoginId
      },
      cardData: {
        cardNumber,
        month: (document.getElementById('expiryMonth') as HTMLInputElement)?.value,
        year: (document.getElementById('expiryYear') as HTMLInputElement)?.value,
        cardCode: (document.getElementById('cvv') as HTMLInputElement)?.value
      }
    };

    try {
      Accept.dispatchData(secureData, responseHandler);
    } catch (error) {
      toast.error('Payment processing error');
      console.error('Accept.js error:', error);
    }

    function responseHandler(response: any) {
      if (response.messages.resultCode === 'Error') {
        const errorMessage = response.messages.message[0].text;
        console.error('Error creating payment token:', errorMessage);
        toast.error(errorMessage);
        return;
      }

      const opaqueData = response.opaqueData;
      onSubmit({
        ...formData,
        paymentMethodId: opaqueData.dataValue,
        paymentDescriptor: opaqueData.dataDescriptor,
        cardLastFour: lastFour
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="nameOnCard"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name on Card</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="space-y-4">
        <FormItem>
          <FormLabel>Card Number</FormLabel>
          <FormControl>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              maxLength={16}
            />
          </FormControl>
        </FormItem>

        <div className="grid grid-cols-3 gap-4">
          <FormItem>
            <FormLabel>Expiry Month</FormLabel>
            <FormControl>
              <Input
                id="expiryMonth"
                type="text"
                placeholder="MM"
                maxLength={2}
              />
            </FormControl>
          </FormItem>
          
          <FormItem>
            <FormLabel>Expiry Year</FormLabel>
            <FormControl>
              <Input
                id="expiryYear"
                type="text"
                placeholder="YYYY"
                maxLength={4}
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>CVV</FormLabel>
            <FormControl>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                maxLength={4}
              />
            </FormControl>
          </FormItem>
        </div>
      </div>

      <FormField
        control={form.control}
        name="sameAsShipping"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  setSameAsShipping(checked as boolean);
                }}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Same as Shipping Address</FormLabel>
            </div>
          </FormItem>
        )}
      />
      {!sameAsShipping && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="billingAddress1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Address Line 1</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingAddress2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billingCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billingZipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} value="US" disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}