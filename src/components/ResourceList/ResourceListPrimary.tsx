import type { JSX, ReactNode } from 'react';

interface Props {
  /**
   * Primary title content.
   */
  children: ReactNode;
}

/**
 * Primary title styling for {@link ResourceListRow}.
 */
export function ResourceListPrimary({ children }: Props): JSX.Element {
  return (
    <div className="hc-resource-list-primary truncate text-[14px] font-medium text-text">
      {children}
    </div>
  );
}
