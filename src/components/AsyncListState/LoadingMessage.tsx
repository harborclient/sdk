import type { JSX, ReactNode } from 'react';
import { cn } from '../utils.js';

interface Props {
  /**
   * Loading text announced to assistive technologies.
   */
  children?: ReactNode;

  /**
   * Additional Tailwind classes merged onto the status paragraph.
   */
  className?: string;
}

/**
 * Muted loading label used while async list data is fetched.
 */
export function LoadingMessage({ children = 'Loading…', className }: Props): JSX.Element {
  return (
    <p role="status" className={cn('hc-loading-message text-[14px] text-muted', className)}>
      {children}
    </p>
  );
}
