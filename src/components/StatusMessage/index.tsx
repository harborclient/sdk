import type { JSX, ReactNode } from 'react';
import { cn } from '../utils.js';

interface Props {
  /**
   * Status or helper text content.
   */
  children: ReactNode;

  /**
   * When true, exposes the message as a live region for assistive technologies.
   */
  live?: boolean;

  /**
   * Optional element id for `aria-describedby` linkage.
   */
  id?: string;

  /**
   * Additional Tailwind classes merged onto the status paragraph.
   */
  className?: string;
}

/**
 * Muted helper or progress text with optional polite live-region semantics.
 */
export function StatusMessage({ children, live = true, id, className }: Props): JSX.Element {
  return (
    <p
      id={id}
      className={cn('hc-status-message text-[14px] text-muted', className)}
      role={live ? 'status' : undefined}
      aria-live={live ? 'polite' : undefined}
    >
      {children}
    </p>
  );
}
