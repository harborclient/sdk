import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { JSX, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { FaIcon } from '../FaIcon/index.js';
import { SidebarColorDot } from './SidebarColorDot.js';
import { SidebarItem, type SidebarItemSortableConfig } from './SidebarItem.js';
import { stopSortableDragPointerDown } from './stopSortableDragPointerDown.js';

interface Props {
  /**
   * Folder display name.
   */
  name: string;

  /**
   * Whether the folder tree node is expanded.
   */
  expanded: boolean;

  /**
   * Optional color dot beside the folder name.
   */
  colorDot?: {
    color: string | null | undefined;
    visible?: boolean;
    label?: string;
  };

  /**
   * When true, shows a "Drop here" affordance beside the folder name.
   */
  dropHighlighted?: boolean;

  /**
   * Whether this row should use selected/highlighted row styling.
   */
  selected?: boolean;

  /**
   * dnd-kit sortable configuration for folder reordering.
   */
  sortable: SidebarItemSortableConfig;

  /**
   * Called when the user right-clicks the row container.
   */
  onContextMenu?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * Toggles folder expand/collapse state.
   */
  onToggleExpand: () => void;

  /**
   * Called when the folder name button is clicked.
   */
  onNameClick: () => void;

  /**
   * Called when the folder name button is double-clicked.
   */
  onNameDoubleClick?: () => void;

  /**
   * Called when Enter is pressed on the folder name button.
   */
  onNameEnter?: () => void;

  /**
   * Trailing actions slot, typically a row actions menu.
   */
  actions?: ReactNode;

  /**
   * Icons for expand/collapse chevrons.
   */
  expandIcon: IconDefinition;
  collapseIcon: IconDefinition;
}

/**
 * Renders a collection folder row with expand/collapse control, optional color dot,
 * and optional drag-drop highlight affordance.
 */
export function SidebarFolderItem({
  name,
  expanded,
  colorDot,
  dropHighlighted = false,
  selected = false,
  sortable,
  onContextMenu,
  onToggleExpand,
  onNameClick,
  onNameDoubleClick,
  onNameEnter,
  actions,
  expandIcon,
  collapseIcon
}: Props): JSX.Element {
  /**
   * Opens folder settings when Enter is pressed on the name button.
   */
  const handleNameKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    onNameEnter?.();
  };

  return (
    <SidebarItem
      selected={selected}
      sortable={sortable}
      onContextMenu={onContextMenu}
      actions={actions}
    >
      <button
        type="button"
        className="app-no-drag inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-muted hover:text-text"
        onClick={onToggleExpand}
        onPointerDown={stopSortableDragPointerDown}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse folder' : 'Expand folder'}
      >
        <FaIcon icon={expanded ? collapseIcon : expandIcon} className="h-2 w-2" />
      </button>
      <button
        type="button"
        className="app-no-drag ml-0.5 min-w-0 flex-1 cursor-pointer truncate border-none bg-transparent py-0 text-left leading-none font-medium text-inherit"
        aria-current={selected ? 'true' : undefined}
        onClick={onNameClick}
        onDoubleClick={onNameDoubleClick}
        onKeyDown={handleNameKeyDown}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5">
          {name}
          {colorDot != null ? (
            <SidebarColorDot
              color={colorDot.color}
              visible={colorDot.visible}
              label={colorDot.label}
            />
          ) : null}
        </span>
        {dropHighlighted ? <span className="ml-1.5 font-normal text-info">Drop here</span> : null}
      </button>
    </SidebarItem>
  );
}
