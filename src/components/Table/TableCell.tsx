import { useContext } from '@harborclient/sdk/react';
import type { JSX, ReactNode, TdHTMLAttributes } from 'react';
import { cn } from '../utils.js';
import { TableVariantContext, tableCellClass, tableCellClassLoose } from './TableContext.js';

interface Props extends TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Body cell content.
   */
  children?: ReactNode;

  /**
   * Additional Tailwind classes merged after the body cell preset.
   */
  className?: string;
}

/**
 * Body cell with table styling for the active variant.
 */
export function TableCell({ children, className, ...rest }: Props): JSX.Element {
  const variant = useContext(TableVariantContext);
  const classes = cn(
    'hc-table-cell',
    variant === 'loose' ? tableCellClassLoose : tableCellClass,
    className
  );

  return (
    <td className={classes} {...rest}>
      {children}
    </td>
  );
}
