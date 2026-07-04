import type { JSX } from 'react';
import { cn } from '../utils.js';

interface Props {
  /**
   */
  src: string;

  /**
   */
  alt: string;

  /**
   */
  className?: string;
}

/**
 * Renders a card image.
 */
export function Image({ src, alt, className }: Props): JSX.Element {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('hc-card-image h-full w-full max-w-full object-cover', className)}
    />
  );
}
