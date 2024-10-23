import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface ImageProps extends HTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fill?: boolean;
}

export default function Image({
  src,
  alt,
  className,
  fill,
  ...props
}: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        fill && 'absolute inset-0 h-full w-full',
        className
      )}
      {...props}
    />
  );
}