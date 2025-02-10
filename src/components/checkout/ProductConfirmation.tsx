import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';

interface ProductConfirmationProps {
  product: Product;
  onConfirm: () => void;
}

export function ProductConfirmation({ product, onConfirm }: ProductConfirmationProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Confirm Your Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-lg">
            <Image
              // src={product.image}
              src={`https://capture-health-media-prod.s3.us-east-1.amazonaws.com/Assets/swipe3.jpg`}
              alt={product.name}
              className="object-cover"
              fill
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.description}</p>
            <p className="mt-2 text-lg font-bold">
              ${Number(product?.variant?.price).toFixed(2)}
            </p>
          </div>
        </div>
        <Button onClick={onConfirm} className="w-full">
          Confirm Selection
        </Button>
      </CardContent>
    </Card>
  );
}