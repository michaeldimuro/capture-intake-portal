import { Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Repeat, Package2 } from "lucide-react";
import Image from "@/components/ui/image";
import { pluralize } from "@/lib/utils";

interface ProductConfirmationProps {
  product: Product;
  onConfirm: () => void;
}

export function ProductConfirmation({
  product,
  onConfirm,
}: ProductConfirmationProps) {
  const totalQuantity = (product.quantity || 0) * (product.monthSupply || 1);
  const monthlyPrice = Number(product.price) / (product.monthSupply || 1);
  const monthText = pluralize(product.monthSupply, "month", "months");

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">
          Confirm Your Prescription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Product Header Section */}
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <div className="pb-6 border-b">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Product Info with Inline Image */}
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
                  <div className="flex flex-wrap items-center gap-2 text-sm border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-4">
                    <span className="font-medium">
                      {product.dosageVariety.dosage}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="capitalize">
                      {product.dosageVariety.form}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
            <Pill className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Strength</p>
              <p className="font-medium">
                {product.dosageVariety.dosage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
            <Package2 className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Form</p>
              <p className="font-medium capitalize">
                {product.dosageVariety.form}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
            <Repeat className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Supply</p>
              <p className="font-medium">
                {product.monthSupply} {monthText}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="border-t border-b py-6 space-y-4">
          <div className="flex items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
            <div>
              <p className="font-medium text-base">Quantity per shipment</p>
              <p className="text-sm text-muted-foreground mt-1">
                {product.quantity} {product.dosageVariety.form}s ×{" "}
                {product.monthSupply} {monthText}
              </p>
            </div>
            <p className="text-xl font-semibold shrink-0">
              {totalQuantity} units
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-base">Subscription Details</p>
              <p className="text-sm text-muted-foreground">
                Billed every {product.monthSupply} {monthText}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl md:text-3xl font-bold">
                ${Number(product.price).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                (${monthlyPrice.toFixed(2)}/month)
              </p>
            </div>
          </div>
        </div>

        <Button onClick={onConfirm} className="w-full h-12 text-base" size="lg">
          Confirm Prescription
        </Button>
      </CardContent>
    </Card>
  );
}
