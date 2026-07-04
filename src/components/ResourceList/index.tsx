import type { JSX, ReactNode } from 'react';
import { cn } from '../utils.js';

export { ResourceListEmptyItem } from './ResourceListEmptyItem.js';
export { ResourceListPrimary } from './ResourceListPrimary.js';
export { ResourceListRow } from './ResourceListRow.js';

interface Props {
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
}: Props): JSX.Element {
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
