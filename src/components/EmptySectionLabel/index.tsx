import type { ComponentPropsWithoutRef, JSX } from 'react';
import { cn } from '../utils.js';

export interface Props extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /**
   * Empty-section message without angle brackets; the component wraps the
   * label in `&lt;…&gt;` automatically.
   */
  label: string;
}

/**
 * Muted placeholder for sidebar sections and lists that have no items to show.
 * Spacing such as top margin is left to callers via `className`.
 */
export function EmptySectionLabel({ label, className, ...props }: Props): JSX.Element {
  return (
    <span
      {...props}
      className={cn(
        'hc-empty-section-label my-2 py-1 mx-auto w-[90%] text-center text-[14px] text-muted uppercase border border-separator rounded-full',
        className
      )}
    >
      {label}
    </span>
  );
}
