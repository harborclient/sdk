import { createContext, createElement, useContext } from '@harborclient/sdk/react';
import type { HTMLAttributes, JSX, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '../utils.js';

/**
 * Layout preset for {@link Table} and its subcomponents.
 */
export type TableVariant = 'bordered' | 'loose';

/**
 * Default header cell classes for bordered editor tables.
 */
export const tableHeadClass =
  'border-r border-b border-separator p-3 text-left text-[14px] font-medium uppercase tracking-wide text-muted last:border-r-0';

/**
 * Default body cell classes for bordered editor tables.
 */
export const tableCellClass = 'border-r border-b border-separator p-3 last:border-r-0';

/**
 * Header cell classes for loose tables with separate cell spacing.
 */
export const tableHeadClassLoose =
  'pb-1 text-left text-[14px] font-medium uppercase tracking-wide text-muted';

/**
 * Body cell classes for loose tables with separate cell spacing.
 */
export const tableCellClassLoose = '';

const TableVariantContext = createContext<TableVariant>('bordered');

interface TableProps {
  /**
   * Table header and body sections.
   */
  children: ReactNode;

  /**
   * Layout preset for the table shell and cell styling.
   */
  variant?: TableVariant;

  /**
   * Additional Tailwind classes merged onto the outer wrapper or table element.
   */
  className?: string;
}

/**
 * Table shell for editable row layouts.
 */
export function Table({ children, variant = 'bordered', className }: TableProps): JSX.Element {
  if (variant === 'loose') {
    const tableClasses = cn(
      'hc-table w-full border-separate border-spacing-x-1.5 border-spacing-y-1.5',
      className
    );

    return createElement(
      TableVariantContext.Provider,
      { value: variant },
      createElement('table', { className: tableClasses }, children)
    );
  }

  const wrapperClasses = cn(
    'hc-table overflow-hidden rounded-lg border border-separator',
    className
  );

  return createElement(
    TableVariantContext.Provider,
    { value: variant },
    createElement(
      'div',
      { className: wrapperClasses },
      createElement('table', { className: 'hc-table-element w-full border-collapse' }, children)
    )
  );
}

interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {
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
export function TableHeader({ children, className, ...rest }: TableSectionProps): JSX.Element {
  const classes = cn('hc-table-header', className);

  return (
    <thead className={classes} {...rest}>
      {children}
    </thead>
  );
}

/**
 * Table body section wrapper.
 */
export function TableBody({ children, className, ...rest }: TableSectionProps): JSX.Element {
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

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
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
export function TableHead({
  children,
  className,
  scope = 'col',
  ...rest
}: TableHeadProps): JSX.Element {
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

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
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
export function TableCell({ children, className, ...rest }: TableCellProps): JSX.Element {
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
