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
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

interface PaymentFormProps {
  onSubmit: (data: PaymentDetails) => void;
  shippingDetails: ShippingDetails;
  stripePublishableKey: string;
}

export function PaymentForm({
  onSubmit,
  shippingDetails,
  stripePublishableKey,
}: PaymentFormProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Load your Stripe publishable key
  const stripePromise = loadStripe(stripePublishableKey);

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
      // nameOnCard: 'Michael DiMuro',
      sameAsShipping: true,
      billingAddress1: shippingDetails?.address1 || "546 Stonewall Drive",
      billingAddress2: shippingDetails?.address2 || "",
      billingCity: shippingDetails?.city || "Galloway",
      billingState: shippingDetails?.state || "NJ",
      billingZipCode: shippingDetails?.zipCode || "08205",
      billingCountry: shippingDetails?.country || "US",
    },
  });

  useEffect(() => {
    if (sameAsShipping) {
      form.setValue(
        "billingAddress1",
        shippingDetails?.address1 || "546 Stonewall Drive"
      );
      form.setValue("billingAddress2", shippingDetails?.address2 || "");
      form.setValue("billingCity", shippingDetails?.city || "Galloway");
      form.setValue("billingState", shippingDetails?.state || "NJ");
      form.setValue("billingZipCode", shippingDetails?.zipCode || "08205");
      form.setValue("billingCountry", shippingDetails?.country || "US");
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
    <Elements stripe={stripePromise}>
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
            />
          </Form>
        </CardContent>
      </Card>
    </Elements>
  );
}

function PaymentFormInner({
  form,
  sameAsShipping,
  setSameAsShipping,
  onSubmit,
}: any) {
  const stripe = useStripe();
  const elements = useElements();

  const cardElementOptions = {
    disableLink: true,
    hidePostalCode: true,
    style: {
      base: {
        color: "#333333",
        fontSize: "1em",
        fontFamily: "'Roboto', sans-serif",
        "::placeholder": {
          color: "#888888",
        },
        padding: "10px",
      },
      invalid: {
        color: "#ff5252",
      },
    },
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      console.error("Card Element not found");
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: form.getValues("nameOnCard"),
        address: {
          line1: form.getValues("billingAddress1"),
          city: form.getValues("billingCity"),
          state: form.getValues("billingState"),
          postal_code: form.getValues("billingZipCode"),
          country: form.getValues("billingCountry"),
        },
      },
    });

    if (error) {
      console.error("Error creating payment method:", error.message);
    } else {
      console.log("Payment Method Created:", paymentMethod);
      onSubmit({
        ...form.getValues(),
        paymentMethodId: paymentMethod.id, // Send to backend
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
       <div>
        <FormLabel>Card Details</FormLabel>
        <div className="p-2 border rounded-md">
          <CardElement options={cardElementOptions}/>
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
                    <Input {...field} />
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
