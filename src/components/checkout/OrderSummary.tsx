import { Product, CustomerDetails, ShippingDetails } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Package2,
  Calendar,
  CreditCard,
  Info,
  MapPin,
  Building,
  User,
  Mail,
  Phone,
  CalendarDays,
  Home,
} from "lucide-react";
import Image from "@/components/ui/image";
import { pluralize } from "@/lib/utils";

interface OrderSummaryProps {
  product: Product;
  customer: CustomerDetails;
  shipping: ShippingDetails;
  payment: any;
  onSubmit: () => void;
  isSubmitting: boolean;
  isOrderComplete?: boolean;
}

export function OrderSummary({
  product,
  customer,
  shipping,
  payment,
  onSubmit,
  isSubmitting,
  isOrderComplete = false,
}: OrderSummaryProps) {
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
  };

  const totalQuantity = (product.quantity || 0) * (product.monthSupply || 1);
  const monthlyPrice = Number(product.price) / (product.monthSupply || 1);
  const monthText = pluralize(product.monthSupply, "month", "months");

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">
          Review Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Prescription Details */}
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <div className="pb-6 border-b">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Updated image section to match ProductConfirmation */}
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-md bg-muted/30">
                  <Image
                    src={
                      product.offeringImageUrl ||
                      `https://capture-health-media-prod.s3.us-east-1.amazonaws.com/Assets/swipe3.jpg`
                    }
                    alt={product.offeringName}
                    className="object-cover"
                    fill
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-medium">{product.offeringName}</h4>
                  <p className="text-muted-foreground mt-2 line-clamp-2 md:line-clamp-none">
                    {product.offeringDescription}
                  </p>
                  {/* <div className="flex flex-wrap items-center gap-2 text-sm border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-4">
                    <span className="font-medium">
                      {product.dosageVariety.dosage}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="capitalize">
                      {product.dosageVariety.form}
                    </span>
                  </div> */}
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
                  {/* {product.monthSupply} {monthText} ×{" "}<br />
                  {totalQuantity} doses ×{" "}<br />
                  {product.compound.name} */}

                  {totalQuantity} doses
                  <br />({product.quantity} doses ×{" "}
                  {product.monthSupply} {monthText})
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div>
                <p className="font-medium text-base">Subscription Schedule</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Billed every {product.monthSupply} {monthText}
                  <br />${monthlyPrice.toFixed(2)}/month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Patient Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="mt-1">
                  {customer.firstName} {customer.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="mt-1">{formatDate(customer.dateOfBirth)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="mt-1 break-words">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="mt-1">{customer.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Billing Information */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Shipping Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">Shipping Address</h3>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg space-y-1 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" />
              <div>
                <p>{shipping.address1}</p>
                {shipping.address2 && <p>{shipping.address2}</p>}
                <p>
                  {shipping.city}, {shipping.state} {shipping.zipCode}
                </p>
                <p>{shipping.country}</p>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">Billing Details</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-medium">
                    Card ending in {payment?.cardLastFour || "****"}
                  </p>
                </div>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg space-y-1 flex items-center gap-3">
                <Home className="h-5 w-5 text-primary shrink-0 mt-1" />
                <div>
                  {payment?.sameAsShipping ? (
                    <p className="text-muted-foreground">
                      Billing address is same as shipping
                    </p>
                  ) : (
                    <>
                      <p>{payment?.billingAddress1 || shipping?.address1}</p>
                      {payment?.billingAddress2 ||
                        (shipping?.address2 && (
                          <p>
                            {payment?.billingAddress2 || shipping?.address2}
                          </p>
                        ))}
                      <p>
                        {payment?.billingCity || shipping?.city},{" "}
                        {payment?.billingState || shipping?.state}{" "}
                        {payment?.billingZipCode || shipping?.zipCode}
                      </p>
                      <p>{payment?.billingCountry || shipping?.country}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex justify-between items-center text-base">
            <span className="text-muted-foreground">
              Subscription Price ({product.monthSupply} {monthText})
            </span>
            <span>${Number(product.price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-base">
            <span className="text-muted-foreground">
              Standard Shipping (3-5 days)
            </span>
            <div>
              <p className="line-through">$10.00</p>
              <p className="text-green-600 text-right">Free</p>
            </div>
            
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-lg font-semibold">
            <span>Total Due Today</span>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span className="text-xl md:text-2xl">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-3 text-sm">
              <p>
                By placing this order, you agree to our Terms of Service and
                Privacy Policy. You acknowledge that:
              </p>
              <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                <li>
                  Your subscription will automatically renew every{" "}
                  {product.monthSupply} {monthText} at $
                  {Number(product.price).toFixed(2)}.
                </li>
                <li>
                  You will be billed ${Number(product.price).toFixed(2)}{" "}
                  today and every {product.monthSupply} {monthText} up
                  to 12 months unless cancelled.
                </li>
                <li>
                  You can cancel your subscription at any time through your
                  account or by contacting{" "}
                  <a href="mailto:customerservice@hard.health">customer support</a>
                  .
                </li>
                <li>
                Your order will be shipped to arrive within 3-5 business days after physician approval. You will receive an email once your prescription is approved and the order is being processed.
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
          disabled={isSubmitting || isOrderComplete}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Order...
            </>
          ) : isOrderComplete ? (
            "Order Placed Successfully"
          ) : (
            "Pay Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}