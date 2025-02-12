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


declare const Accept: any;

interface PaymentFormProps {
  onSubmit: (data: PaymentDetails) => void;
  shippingDetails: ShippingDetails;
  authNetLoginId: string;
  authNetClientKey: string;
}

export function PaymentForm({
  onSubmit,
  shippingDetails,
  authNetLoginId,
  authNetClientKey,
}: PaymentFormProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    // script.src = 'https://js.authorize.net/v1/Accept.js'; // Production
    script.src = "https://jstest.authorize.net/v1/Accept.js" // Sandbox
    script.async = true;
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
      form.setValue(
        "billingAddress1",
        shippingDetails?.address1
      );
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
            authNetLoginId={authNetLoginId}
            authNetClientKey={authNetClientKey}
          />
        </Form>
      </CardContent>
    </Card>
  );
}

function PaymentFormInner({
  form,
  sameAsShipping,
  setSameAsShipping,
  onSubmit,
  authNetLoginId,
  authNetClientKey,
}: any) {
  const handleSubmit = async (formData: any) => {
    if (typeof Accept === 'undefined') {
      console.error('Authorize.Net Accept.js is not loaded');
      return;
    }

    const secureData = {
      authData: {
        clientKey: authNetClientKey,
        apiLoginID: authNetLoginId
      },
      cardData: {
        cardNumber: (document.getElementById('cardNumber') as HTMLInputElement)?.value,
        month: (document.getElementById('expiryMonth') as HTMLInputElement)?.value,
        year: (document.getElementById('expiryYear') as HTMLInputElement)?.value,
        cardCode: (document.getElementById('cvv') as HTMLInputElement)?.value
      }
    };

    Accept.dispatchData(secureData, responseHandler);

    function responseHandler(response: any) {
      if (response.messages.resultCode === 'Error') {
        console.error('Error creating payment token:', response.messages.message);
        toast.error(response.messages.message[0].text);
        // Add error handling here - maybe show a toast or error message to user
      } else {
        const opaqueData = response.opaqueData;
        onSubmit({
          ...formData,
          paymentMethodId: opaqueData.dataValue,
          paymentDescriptor: opaqueData.dataDescriptor
        });
      }
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
