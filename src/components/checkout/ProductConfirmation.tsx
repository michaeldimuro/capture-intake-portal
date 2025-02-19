import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Repeat, Package2 } from 'lucide-react';
import Image from '@/components/ui/image';

interface ProductConfirmationProps {
  product: Product;
  onConfirm: () => void;
}

export function ProductConfirmation({ product, onConfirm }: ProductConfirmationProps) {
  const totalQuantity = (product.variant.quantity || 0) * (product.variant.monthSupply || 1);
  const monthlyPrice = Number(product.variant.price) / (product.variant.monthSupply || 1);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Confirm Your Prescription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative h-48 w-full md:w-48 overflow-hidden rounded-lg bg-muted/30">
            <Image
              src={product.image || `https://capture-health-media-prod.s3.us-east-1.amazonaws.com/Assets/swipe3.jpg`}
              alt={product.name}
              className="object-cover"
              fill
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-semibold">{product.name}</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 bg-primary/5 p-3 rounded-lg">
                <Pill className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Strength</p>
                  <p className="font-medium">{product.medicationDosage.strength} {product.medicationDosage.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 p-3 rounded-lg">
                <Package2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Form</p>
                  <p className="font-medium capitalize">{product.medicationDosage.form}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 p-3 rounded-lg">
                <Repeat className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Supply</p>
                  <p className="font-medium">{product.variant.monthSupply} Months</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-b py-4 space-y-3">
          <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
            <div>
              <p className="font-medium">Quantity per shipment</p>
              <p className="text-sm text-muted-foreground">
                {product.variant.quantity} {product.medicationDosage.form}s × {product.variant.monthSupply} months
              </p>
            </div>
            <p className="text-xl font-semibold">{totalQuantity} units</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="font-medium">Subscription Details</p>
              <p className="text-sm text-muted-foreground">Billed every {product.variant.monthSupply} months</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${Number(product.variant.price).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">(${monthlyPrice.toFixed(2)}/month)</p>
            </div>
          </div>
        </div>

        <Button onClick={onConfirm} className="w-full" size="lg">
          Confirm Prescription
        </Button>
      </CardContent>
    </Card>
  );
}