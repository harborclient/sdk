import { useContext } from '@harborclient/sdk/react';
import type { JSX, ReactNode, ThHTMLAttributes } from 'react';
import { cn } from '../utils.js';
import { TableVariantContext, tableHeadClass, tableHeadClassLoose } from './TableContext.js';

interface Props extends ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Header cell content.
   */
  children?: ReactNode;

  /**
   * Additional Tailwind classes merged after the header cell preset.
   */
  className?: string;
}

/**
 * Header cell with table styling for the active variant.
 */
export function TableHead({ children, className, scope = 'col', ...rest }: Props): JSX.Element {
  const variant = useContext(TableVariantContext);
  const classes = cn(
    'hc-table-head',
    variant === 'loose' ? tableHeadClassLoose : tableHeadClass,
    className
  );

  return (
    <th scope={scope} className={classes} {...rest}>
      {children}
    </th>
  );
}
