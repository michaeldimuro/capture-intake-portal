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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const formSchema = z.object({
  nameOnCard: z.string().min(2, "Name on card is required"),
  cardNumber: z.string().min(15, "Invalid card number"),
  expiryMonth: z.string().min(1, "Month is required"),
  expiryYear: z.string().min(4, "Year is required"),
  cvv: z.string().min(3, "Invalid CVV"),
  sameAsShipping: z.boolean(),
  billingAddress1: z.string().refine((val) => {
    if (!val) return false;
    return val.length >= 5;
  }, "Address is required"),
  billingAddress2: z.string().optional(),
  billingCity: z.string().min(2, "City is required"),
  billingState: z.string().min(2, "State is required"),
  billingZipCode: z.string().min(5, "Valid ZIP code required"),
  billingCountry: z.string().optional().default("US"),
});

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
    script.src = 'https://js.authorize.net/v1/Accept.js'
    script.async = true;
    script.onerror = () => {
      toast.error("Failed to load payment system");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
        <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl">
          <CreditCard className="h-6 w-6 md:h-7 md:w-7" />
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
  // Generate months array (01-12)
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });

  // Generate years array (current year + 20 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 21 },
    (_, i) => (currentYear + i).toString()
  );

  const handleSubmit = async (formData: any) => {
    if (typeof Accept === 'undefined') {
      toast.error('Payment system not initialized');
      return;
    }

    const cardNumber = formData.cardNumber;
    if (!cardNumber) {
      toast.error('Please enter card number');
      return;
    }

    const lastFour = cardNumber.slice(-4);
    setCardLastFour(lastFour);
    
    try {
      const { apiLoginId, clientKey } = await getDecryptedCredentials(authNetCredentials);

      const secureData = {
        authData: {
          clientKey: clientKey,
          apiLoginID: apiLoginId
        },
        cardData: {
          cardNumber,
          month: formData.expiryMonth,
          year: formData.expiryYear,
          cardCode: formData.cvv
        }
      };

      // Send card data directly to Authorize.net for tokenization
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
      
      // PCI compliance: Create a sanitized copy of formData without sensitive card details
      const sanitizedFormData = { ...formData };
      
      // Remove sensitive card data, replacing with PCI-compliant values
      delete sanitizedFormData.cardNumber;
      delete sanitizedFormData.cvv;
      
      // Submit only the token and non-sensitive data
      onSubmit({
        ...sanitizedFormData,
        paymentMethodId: opaqueData.dataValue,
        paymentDescriptor: opaqueData.dataDescriptor,
        cardLastFour: lastFour
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <FormField
        control={form.control}
        name="nameOnCard"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Name on Card</FormLabel>
            <FormControl>
              <Input {...field} className="h-12" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Card Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="expiryMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Expiry Month</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="expiryYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Expiry Year</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cvv"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel className="text-base">CVV</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="123"
                    maxLength={4}
                    className="h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="sameAsShipping"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  setSameAsShipping(checked as boolean);
                }}
                className={field.value ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}
              />
            </FormControl>
            <div className="leading-none">
              <FormLabel className="text-base">Same as Shipping Address</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {!sameAsShipping && (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="billingAddress1"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Billing Address Line 1</FormLabel>
                <FormControl>
                  <Input {...field} className="h-12" />
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
                <FormLabel className="text-base">Billing Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} className="h-12" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="billingCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">City</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12" />
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
                  <FormLabel className="text-base">State</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="billingZipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">ZIP Code</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-12" />
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
                  <FormLabel className="text-base">Country</FormLabel>
                  <FormControl>
                    <Input {...field} value="US" disabled className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
      <Button type="submit" className="w-full h-12 text-base">
        Continue
      </Button>
    </form>
  );
}