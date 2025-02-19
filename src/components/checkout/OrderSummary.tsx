import { Product, CustomerDetails, ShippingDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Package2, Calendar, CreditCard } from 'lucide-react';
import Image from '@/components/ui/image';

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

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Review Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prescription Details */}
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg mb-4">Prescription Details</h3>
            <div className="flex gap-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={product.image || `https://capture-health-media-prod.s3.us-east-1.amazonaws.com/Assets/swipe3.jpg`}
                  alt={product.name}
                  className="object-cover"
                  fill
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="font-medium">{product.medicationDosage.strength} {product.medicationDosage.unit}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="capitalize">{product.medicationDosage.form}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Package2 className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Quantity per shipment</p>
                <p className="text-sm text-muted-foreground">
                  {totalQuantity} {product.medicationDosage.form}s
                  <br />({product.variant.quantity} units × {product.variant.monthSupply} months)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Subscription Schedule</p>
                <p className="text-sm text-muted-foreground">
                  Billed every {product.variant.monthSupply} months
                  <br />${monthlyPrice.toFixed(2)}/month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-3">
          <h3 className="font-semibold">Patient Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p>{customer.firstName} {customer.lastName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date of Birth</p>
              <p>{formatDate(customer.dateOfBirth)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p>{customer.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p>{customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="space-y-3">
          <h3 className="font-semibold">Shipping Address</h3>
          <div className="text-sm">
            <p>{shipping.address1}</p>
            {shipping.address2 && <p>{shipping.address2}</p>}
            <p>{shipping.city}, {shipping.state} {shipping.zipCode}</p>
            <p>{shipping.country}</p>
          </div>
        </div>

        {/* Order Total */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Subscription Price ({product.variant.monthSupply} months)</span>
            <span>${Number(product.variant.price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Due Today</span>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span>${Number(product.variant.price).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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