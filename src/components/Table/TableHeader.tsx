import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../utils.js';

interface Props extends HTMLAttributes<HTMLTableSectionElement> {
  /**
   * Header or body row content.
   */
  children: ReactNode;

  /**
   * Additional Tailwind classes merged onto the section element.
   */
  className?: string;
}

/**
 * Table header section wrapper.
 */
export function TableHeader({ children, className, ...rest }: Props): JSX.Element {
  const classes = cn('hc-table-header', className);

  return (
    <thead className={classes} {...rest}>
      {children}
    </thead>
  );
}
