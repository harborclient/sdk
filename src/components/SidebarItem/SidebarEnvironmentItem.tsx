import type { JSX, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { SidebarColorDot } from './SidebarColorDot.js';
import { SidebarItem, type SidebarItemSortableConfig } from './SidebarItem.js';
import { SIDEBAR_ITEM_BUTTON_CLASS } from './sidebarItemClasses.js';

interface Props {
  /**
   * Environment display name.
   */
  name: string;

  /**
   * Summary text for environment variables (e.g. "3 variables").
   */
  variableSummary: string;

  /**
   * Optional color dot beside the environment name.
   */
  colorDot?: {
    color: string | null | undefined;
    visible?: boolean;
    label?: string;
  };

  /**
   * Whether this row should use selected/highlighted row styling.
   */
  selected?: boolean;

  /**
   * When true, sets aria-current="true" on the primary button.
   */
  ariaCurrent?: boolean;

  /**
   * When true, sets aria-selected="true" on the primary button.
   */
  ariaSelected?: boolean;

  /**
   * dnd-kit sortable configuration for environment reordering.
   */
  sortable?: SidebarItemSortableConfig;

  /**
   * Called when the user right-clicks the row container.
   */
  onContextMenu?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * Called when the primary label button is clicked.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;

  /**
   * Called when the primary label button is double-clicked.
   */
  onDoubleClick?: () => void;

  /**
   * Called when Enter is pressed on the primary label button.
   */
  onEnter?: () => void;

  /**
   * Accessible label for the primary button.
   */
  ariaLabel?: string;

  /**
   * Trailing actions slot, typically a row actions menu.
   */
  actions?: ReactNode;

  /**
   * Optional data attribute value for keyboard navigation focus targets.
   */
  dataSidebarEnvironmentId?: string | number;
}

/**
 * Renders an environment row in the Collections sidebar Environments section.
 */
export function SidebarEnvironmentItem({
  name,
  variableSummary,
  colorDot,
  selected = false,
  ariaCurrent = false,
  ariaSelected = false,
  sortable,
  onContextMenu,
  onClick,
  onDoubleClick,
  onEnter,
  ariaLabel,
  actions,
  dataSidebarEnvironmentId
}: Props): JSX.Element {
  /**
   * Opens environment settings when Enter is pressed on the name button.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    onEnter?.();
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
        className={SIDEBAR_ITEM_BUTTON_CLASS}
        {...(dataSidebarEnvironmentId != null
          ? { 'data-sidebar-environment-id': String(dataSidebarEnvironmentId) }
          : {})}
        aria-current={ariaCurrent ? 'true' : undefined}
        aria-selected={ariaSelected ? 'true' : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={handleKeyDown}
      >
        <span className="inline-flex min-w-0 flex-1 items-center gap-1.5">
          <span className="min-w-0 truncate">{name}</span>
          {colorDot != null ? (
            <SidebarColorDot
              color={colorDot.color}
              visible={colorDot.visible}
              label={colorDot.label}
            />
          ) : null}
        </span>
        <span className="shrink-0 text-muted">{variableSummary}</span>
      </button>
    </SidebarItem>
  );
}
