import type { JSX, ReactNode } from 'react';
import { cn } from '../utils.js';

interface ResourceListProps {
  /**
   * List row elements, typically {@link ResourceListRow} items.
   */
  children: ReactNode;

  /**
   * Additional Tailwind classes merged onto the list element.
   */
  className?: string;

  /**
   * Accessible name when no visible heading labels the list.
   */
  'aria-label'?: string;

  /**
   * Id of the element that labels this list when using a visible heading.
   */
  'aria-labelledby'?: string;
}

/**
 * Vertical list shell used for bordered resource rows in settings and Team Hub.
 */
export function ResourceList({
  children,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy
}: ResourceListProps): JSX.Element {
  return (
    <ul
      className={cn('hc-resource-list m-0 flex list-none flex-col gap-[10px] p-0', className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </ul>
  );
}

interface ResourceListRowProps {
  /**
   * Primary title or name for the resource.
   */
  primary: ReactNode;

  /**
   * Optional secondary line such as a URL or identifier.
   */
  secondary?: ReactNode;

  /**
   * Optional metadata rendered below primary/secondary content, e.g. badges.
   */
  meta?: ReactNode;

  /**
   * Trailing action buttons or menus.
   */
  actions?: ReactNode;

  /**
   * When true, allows primary content and actions to wrap on narrow widths.
   */
  wrap?: boolean;

  /**
   * Additional Tailwind classes merged onto the row element.
   */
  className?: string;
}

/**
 * Bordered list row with primary text, optional secondary line, metadata, and actions.
 */
export function ResourceListRow({
  primary,
  secondary,
  meta,
  actions,
  wrap = false,
  className
}: ResourceListRowProps): JSX.Element {
  return (
    <li
      className={cn(
        'hc-resource-list-row flex items-center justify-between gap-3 rounded-[10px] border border-separator/80 px-4 py-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[background-color,box-shadow] duration-[120ms] ease-out hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.28)]',
        wrap && 'flex-wrap',
        className
      )}
    >
      <div className="hc-resource-list-row-content min-w-0">
        <div className="hc-resource-list-row-primary min-w-0">{primary}</div>
        {secondary != null ? (
          <div className="hc-resource-list-row-secondary truncate text-[14px] text-muted">
            {secondary}
          </div>
        ) : null}
        {meta}
      </div>
      {actions ? (
        <div className="hc-resource-list-row-actions flex shrink-0 flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      ) : null}
    </li>
  );
}

/**
 * Primary title styling for {@link ResourceListRow}.
 */
export function ResourceListPrimary({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="hc-resource-list-primary truncate text-[14px] font-medium text-text">
      {children}
    </div>
  );
}

/**
 * Inline empty-state row rendered inside a {@link ResourceList}.
 */
export function ResourceListEmptyItem({ children }: { children: ReactNode }): JSX.Element {
  return <li className="hc-resource-list-empty-item text-[14px] text-muted">{children}</li>;
}
