import { useContext } from '@harborclient/sdk/react';
import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../utils.js';
import { TableVariantContext } from './TableContext.js';

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
 * Table body section wrapper.
 */
export function TableBody({ children, className, ...rest }: Props): JSX.Element {
  const variant = useContext(TableVariantContext);
  const classes = cn(
    variant === 'bordered' ? 'hc-table-body [&_tr:last-child_td]:border-b-0' : 'hc-table-body',
    className
  );

  return (
    <tbody className={classes} {...rest}>
      {children}
    </tbody>
  );
}
