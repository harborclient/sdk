import type { JSX, MouseEvent, ReactNode } from 'react';
import { cn } from '../utils.js';
import { SortableSidebarItem } from './SortableSidebarItem.js';
import { sourceRow } from './sidebarItemClasses.js';
import { stopSortableDragPointerDown } from './stopSortableDragPointerDown.js';

/**
 * Sortable drag configuration for a sidebar row.
 */
export interface SidebarItemSortableConfig {
  /**
   * Stable dnd-kit sortable id for this row.
   */
  id: string;

  /**
   * Accessible name for the drag handle.
   */
  dragHandleLabel: string;

  /**
   * When true, renders a static row without drag-and-drop behavior.
   */
  disabled?: boolean;
}

interface Props {
  /**
   * Whether this row should use selected/highlighted row styling.
   */
  selected?: boolean;

  /**
   * When true, uses tighter vertical padding for top-level list rows.
   */
  compact?: boolean;

  /**
   * Optional dnd-kit sortable configuration.
   */
  sortable?: SidebarItemSortableConfig;

  /**
   * Called when the user right-clicks the row container.
   */
  onContextMenu?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * Trailing actions slot, typically a {@link RowActionsMenu}.
   */
  actions?: ReactNode;

  /**
   * When true, wraps the actions slot with {@link stopSortableDragPointerDown}.
   */
  actionsStopDrag?: boolean;

  /**
   * HTML element for the row container when not sortable.
   */
  as?: 'div' | 'li';

  /**
   * Additional class names merged onto the row container.
   */
  className?: string;

  /**
   * Row contents (label button, icons, metadata, etc.).
   */
  children: ReactNode;
}

/**
 * Base shell for sidebar list rows. Applies shared row chrome, optional sortable
 * drag behavior, and a trailing actions slot suitable for future Sidebar layout reuse.
 */
export function SidebarItem({
  selected = false,
  compact = true,
  sortable,
  onContextMenu,
  actions,
  actionsStopDrag = true,
  as: Container = 'div',
  className,
  children
}: Props): JSX.Element {
  const rowClassName = cn('hc-sidebar-item', sourceRow(selected, compact), className);

  const rowContent = (
    <>
      {children}
      {actions != null ? (
        <div
          className="shrink-0"
          {...(actionsStopDrag ? { onPointerDown: stopSortableDragPointerDown } : {})}
        >
          {actions}
        </div>
      ) : null}
    </>
  );

  if (sortable != null) {
    return (
      <SortableSidebarItem
        id={sortable.id}
        className={rowClassName}
        dragHandleLabel={sortable.dragHandleLabel}
        disabled={sortable.disabled}
        onRowContextMenu={onContextMenu}
      >
        {rowContent}
      </SortableSidebarItem>
    );
  }

  return (
    <Container className={rowClassName} onContextMenu={onContextMenu}>
      {rowContent}
    </Container>
  );
}
