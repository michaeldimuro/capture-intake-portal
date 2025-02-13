import { Product, CustomerDetails, ShippingDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
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
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Details */}
        <div className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={`https://capture-health-media-prod.s3.us-east-1.amazonaws.com/Assets/swipe3.jpg`}
              alt={product.name}
              className="object-cover"
              fill
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.description}</p>
            <p className="mt-1 text-lg font-bold">
              ${Number(product?.variant?.price).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-3">
          <h3 className="font-semibold">Customer Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p>{customer.firstName} {customer.lastName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p>{customer.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p>{customer.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date of Birth</p>
              <p>{new Date(customer.dateOfBirth).toLocaleDateString()}</p>
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
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span>${Number(product?.variant?.price).toFixed(2)}</span>
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