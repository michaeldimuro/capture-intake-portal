import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Repeat, Package2 } from 'lucide-react';
import Image from '@/components/ui/image';
import { pluralize } from '@/lib/utils';

interface ProductConfirmationProps {
  product: Product;
  onConfirm: () => void;
}

export function ProductConfirmation({ product, onConfirm }: ProductConfirmationProps) {
  const totalQuantity = (product.variant.quantity || 0) * (product.variant.monthSupply || 1);
  const monthlyPrice = Number(product.variant.price) / (product.variant.monthSupply || 1);
  const monthText = pluralize(product.variant.monthSupply, 'month', 'months');

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">Confirm Your Prescription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Product Header Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Product Info with Inline Image on Mobile */}
          <div className="flex-1 space-y-4 md:space-y-0">
            <div className="flex items-start gap-4">
              {/* Image Container - Smaller on Mobile */}
              <div className="relative h-16 w-16 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-md bg-muted/30">
                <Image
                  src={product.image || `https://capture-health-media-prod.s3.us-east-1.amazonaws.com/Assets/swipe3.jpg`}
                  alt={product.name}
                  className="object-cover"
                  fill
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="text-muted-foreground mt-2 line-clamp-2 md:line-clamp-none">
                  {product.description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-4">
              <span className="font-medium">
                {product.medicationDosage.strength} {product.medicationDosage.unit}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="capitalize">
                {product.medicationDosage.form}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
            <Pill className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Strength</p>
              <p className="font-medium">{product.medicationDosage.strength} {product.medicationDosage.unit}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
            <Package2 className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Form</p>
              <p className="font-medium capitalize">{product.medicationDosage.form}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
            <Repeat className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Supply</p>
              <p className="font-medium">{product.variant.monthSupply} {monthText}</p>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="border-t border-b py-6 space-y-4">
          <div className="flex items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
            <div>
              <p className="font-medium text-base">Quantity per shipment</p>
              <p className="text-sm text-muted-foreground mt-1">
                {product.variant.quantity} {product.medicationDosage.form}s × {product.variant.monthSupply} {monthText}
              </p>
            </div>
            <p className="text-xl font-semibold shrink-0">{totalQuantity} units</p>
          </div>

          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-base">Subscription Details</p>
              <p className="text-sm text-muted-foreground">
                Billed every {product.variant.monthSupply} {monthText}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl md:text-3xl font-bold">${Number(product.variant.price).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">(${monthlyPrice.toFixed(2)}/month)</p>
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