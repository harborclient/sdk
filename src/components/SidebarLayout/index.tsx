import type { JSX, ReactNode } from 'react';
import { cn } from '../utils.js';

interface Props {
  /**
   * Sidebar navigation rendered in the left column.
   */
  sidebar: ReactNode;

  /**
   * Scrollable main content rendered in the right column.
   */
  children: ReactNode;

  /**
   * Additional Tailwind classes merged onto the outer flex column wrapper.
   */
  className?: string;
}

/**
 * Two-pane layout shell: a fixed sidebar column and a scrollable content area
 * with standard page padding.
 */
export function SidebarLayout({ sidebar, children, className }: Props): JSX.Element {
  return (
    <div className={cn('hc-sidebar-layout flex min-h-0 flex-1 flex-col', className)}>
      <div className="hc-sidebar-layout-body flex min-h-0 flex-1">
        {sidebar}
        <div className="hc-sidebar-layout-content flex-1 overflow-y-auto p-6 pt-0!">{children}</div>
      </div>
    </div>
  );
}
