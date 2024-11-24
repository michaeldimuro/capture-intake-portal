import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PaymentDetails, ShippingDetails } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";

interface PaymentFormProps {
  onSubmit: (data: PaymentDetails) => void;
  shippingDetails: ShippingDetails;
}

export function PaymentForm({ onSubmit, shippingDetails }: PaymentFormProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const formSchema = z.object({
    cardNumber: z.string().min(19, 'Invalid card number'),
    expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Invalid expiry date (MM/YY)'),
    cvv: z.string().length(3, 'Invalid CVV'),
    nameOnCard: z.string().min(2, 'Name on card is required'),
    sameAsShipping: z.boolean(),
    billingAddress1: z.string().refine((val) => {
      if (!sameAsShipping) {
        return val.length >= 5;
      }
      return true;
    }, 'Address is required'),
    billingAddress2: z.string().optional(),
    billingCity: z.string().refine((val) => {
      if (!sameAsShipping) {
        return val.length >= 2;
      }
      return true;
    }, 'City is required'),
    billingState: z.string().refine((val) => {
      if (!sameAsShipping) {
        return val.length >= 2;
      }
      return true;
    }, 'State is required'),
    billingZipCode: z.string().refine((val) => {
      if (!sameAsShipping) {
        return val.length >= 5;
      }
      return true;
    }, 'Valid ZIP code required'),
    billingCountry: z.string().refine((val) => {
      if (!sameAsShipping) {
        return val.length >= 2;
      }
      return true;
    }, 'Country is required'),
  });
  
  const form = useForm<PaymentDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: '',
      sameAsShipping: true,
      billingAddress1: shippingDetails.address1,
      billingAddress2: shippingDetails.address2,
      billingCity: shippingDetails.city,
      billingState: shippingDetails.state,
      billingZipCode: shippingDetails.zipCode,
      billingCountry: shippingDetails.country,
    },
  });

  useEffect(() => {
    if (sameAsShipping) {
      form.setValue('billingAddress1', shippingDetails.address1);
      form.setValue('billingAddress2', shippingDetails.address2);
      form.setValue('billingCity', shippingDetails.city);
      form.setValue('billingState', shippingDetails.state);
      form.setValue('billingZipCode', shippingDetails.zipCode);
      form.setValue('billingCountry', shippingDetails.country);
    } else {
      form.setValue('billingAddress1', '');
      form.setValue('billingAddress2', '');
      form.setValue('billingCity', '');
      form.setValue('billingState', '');
      form.setValue('billingZipCode', '');
      form.setValue('billingCountry', '');
    }
  }, [sameAsShipping, shippingDetails, form]);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        e.target.value = formatted;
                        onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="MM/YY"
                        maxLength={5}
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value);
                          e.target.value = formatted;
                          onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" maxLength={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            <Button type="submit" className="w-full">Continue</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}