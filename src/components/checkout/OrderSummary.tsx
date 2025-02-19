import { Product, CustomerDetails, ShippingDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Package2, Calendar, CreditCard, Info } from 'lucide-react';
import Image from '@/components/ui/image';
import { pluralize } from '@/lib/utils';

interface OrderSummaryProps {
  product: Product;
  customer: CustomerDetails;
  shipping: ShippingDetails;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function OrderSummary({ 
  product, 
  customer, 
  shipping, 
  onSubmit,
  isSubmitting 
}: OrderSummaryProps) {
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  const totalQuantity = (product.variant.quantity || 0) * (product.variant.monthSupply || 1);
  const monthlyPrice = Number(product.variant.price) / (product.variant.monthSupply || 1);
  const monthText = pluralize(product.variant.monthSupply, 'month', 'months');

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl">
          <CheckCircle className="h-6 w-6 md:h-7 md:w-7 text-primary" />
          Review Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Prescription Details */}
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg md:text-xl mb-6">Prescription Details</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative h-48 md:h-32 w-full md:w-32 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={product.image || `https://capture-health-media-prod.s3.us-east-1.amazonaws.com/Assets/swipe3.jpg`}
                  alt={product.name}
                  className="object-cover"
                  fill
                />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-medium">{product.name}</h4>
                <p className="text-muted-foreground mt-2">{product.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{product.medicationDosage.strength} {product.medicationDosage.unit}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="capitalize">{product.medicationDosage.form}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4">
              <Package2 className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div>
                <p className="font-medium text-base">Quantity per shipment</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalQuantity} {product.medicationDosage.form}s
                  <br />({product.variant.quantity} units × {product.variant.monthSupply} {monthText})
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div>
                <p className="font-medium text-base">Subscription Schedule</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Billed every {product.variant.monthSupply} {monthText}
                  <br />${monthlyPrice.toFixed(2)}/month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Patient Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="mt-1">{customer.firstName} {customer.lastName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date of Birth</p>
              <p className="mt-1">{formatDate(customer.dateOfBirth)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="mt-1 break-words">{customer.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="mt-1">{customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Shipping Address</h3>
          <div className="text-base space-y-1">
            <p>{shipping.address1}</p>
            {shipping.address2 && <p>{shipping.address2}</p>}
            <p>{shipping.city}, {shipping.state} {shipping.zipCode}</p>
            <p>{shipping.country}</p>
          </div>
        </div>

        {/* Order Total */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex justify-between items-center text-base">
            <span className="text-muted-foreground">Subscription Price ({product.variant.monthSupply} {monthText})</span>
            <span>${Number(product.variant.price).toFixed(2)}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-lg font-semibold">
            <span>Total Due Today</span>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span className="text-xl md:text-2xl">${Number(product.variant.price).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-3 text-sm">
              <p>
                By placing this order, you agree to our Terms of Service and Privacy Policy. You acknowledge that:
              </p>
              <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                <li>
                  Your subscription will automatically renew every {product.variant.monthSupply} {monthText} at ${Number(product.variant.price).toFixed(2)}.
                </li>
                <li>
                  You will be billed ${Number(product.variant.price).toFixed(2)} today and every {product.variant.monthSupply} {monthText} up to 12 months unless cancelled.
                </li>
                <li>
                  You can cancel your subscription at any time through your account or by contacting <a href="mailto:support@capturehealth.io">customer support</a>.
                </li>
                <li>
                  Shipping times may vary. You'll receive a confirmation email with tracking information once your order ships.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full h-12 text-base"
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Order...
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}