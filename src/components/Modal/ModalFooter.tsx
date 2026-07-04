import type { JSX, ReactNode } from 'react';
import { cn } from '../utils.js';

interface Props {
  /**
   * Action buttons rendered in a right-aligned row.
   */
  children: ReactNode;

  /**
   * When true, adds top margin before the action row (common in modal bodies).
   */
  spaced?: boolean;

  /**
   * Additional Tailwind classes merged onto the footer row.
   */
  className?: string;
}

/**
 * Right-aligned action button row for modal bodies and overlay footers.
 */
export function ModalFooter({ children, spaced = false, className }: Props): JSX.Element {
  return (
    <div className={cn('hc-modal-footer flex justify-end gap-2', spaced && 'mt-4', className)}>
      {children}
    </div>
  );
}
