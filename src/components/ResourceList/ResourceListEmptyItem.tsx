import type { JSX, ReactNode } from 'react';

interface Props {
  /**
   * Empty-state message content.
   */
  children: ReactNode;
}

/**
 * Inline empty-state row rendered inside a {@link ResourceList}.
 */
export function ResourceListEmptyItem({ children }: Props): JSX.Element {
  return <li className="hc-resource-list-empty-item text-[14px] text-muted">{children}</li>;
}
