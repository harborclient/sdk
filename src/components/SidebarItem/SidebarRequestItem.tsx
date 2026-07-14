import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faFileLines } from '@fortawesome/free-solid-svg-icons';
import type { JSX, MouseEvent, ReactNode } from 'react';
import { FaIcon } from '../FaIcon/index.js';
import { SidebarColorDot } from './SidebarColorDot.js';
import { SidebarItem, type SidebarItemSortableConfig } from './SidebarItem.js';
import { SidebarMethodBadge } from './SidebarMethodBadge.js';
import { SidebarStatusMarker } from './SidebarStatusMarker.js';
import { SIDEBAR_ITEM_BUTTON_CLASS } from './sidebarItemClasses.js';

interface Props {
  /**
   * HTTP method shown in the leading badge.
   */
  method: string;

  /**
   * Primary label text for the row.
   */
  name: string;

  /**
   * Optional Tailwind classes applied to the name text (e.g. git status colors).
   */
  nameClassName?: string;

  /**
   * Optional color dot configuration for collection sidebar rows.
   */
  colorDot?: {
    color: string | null | undefined;
    visible?: boolean;
    label?: string;
  };

  /**
   * Optional git change status marker shown after the name in git sidebar rows.
   */
  statusMarker?: {
    marker: string;
    className?: string;
    label: string;
  };

  /**
   * Whether this row should use selected/highlighted row styling.
   */
  selected?: boolean;

  /**
   * Optional dnd-kit sortable configuration.
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
   * Accessible label for the primary button.
   */
  ariaLabel?: string;

  /**
   * When true, sets aria-current="true" on the primary button.
   */
  ariaCurrent?: boolean;

  /**
   * When true, sets aria-selected="true" on the primary button.
   */
  ariaSelected?: boolean;

  /**
   * Trailing actions slot, typically a row actions menu.
   */
  actions?: ReactNode;

  /**
   * HTML element for the row container when not sortable.
   */
  as?: 'div' | 'li';
}

/**
 * Renders a saved-request sidebar row with method badge, optional color dot or git
 * status marker, and shared row chrome. Used in both Collections and Git sidebars.
 */
export function SidebarRequestItem({
  method,
  name,
  nameClassName,
  colorDot,
  statusMarker,
  selected = false,
  sortable,
  onContextMenu,
  onClick,
  ariaLabel,
  ariaCurrent = false,
  ariaSelected = false,
  actions,
  as = 'div'
}: Props): JSX.Element {
  return (
    <SidebarItem
      selected={selected}
      sortable={sortable}
      onContextMenu={onContextMenu}
      actions={actions}
      as={as}
    >
      <button
        type="button"
        className={SIDEBAR_ITEM_BUTTON_CLASS}
        aria-current={ariaCurrent ? 'true' : undefined}
        aria-selected={ariaSelected ? 'true' : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        <SidebarMethodBadge method={method} />
        {colorDot != null ? (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span className={`min-w-0 truncate ${nameClassName ?? ''}`}>{name}</span>
            <SidebarColorDot
              color={colorDot.color}
              visible={colorDot.visible}
              label={colorDot.label}
            />
          </span>
        ) : (
          <span className={`min-w-0 truncate ${nameClassName ?? ''}`}>{name}</span>
        )}
        {statusMarker != null ? (
          <SidebarStatusMarker
            marker={statusMarker.marker}
            className={statusMarker.className}
            label={statusMarker.label}
          />
        ) : null}
      </button>
    </SidebarItem>
  );
}

interface DocumentProps {
  /**
   * Icon shown before the document name. Defaults to a file-lines icon when omitted.
   */
  icon?: IconDefinition;

  /**
   * Primary label text for the row.
   */
  name: string;

  /**
   * Optional Tailwind classes applied to the name text (e.g. git status colors).
   */
  nameClassName?: string;

  /**
   * Optional color dot configuration for collection sidebar rows.
   */
  colorDot?: {
    color: string | null | undefined;
    visible?: boolean;
    label?: string;
  };

  /**
   * Optional git change status marker shown after the name in git sidebar rows.
   */
  statusMarker?: {
    marker: string;
    className?: string;
    label: string;
  };

  /**
   * Whether this row should use selected/highlighted row styling.
   */
  selected?: boolean;

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
  onDoubleClick?: (event: MouseEvent<HTMLButtonElement>) => void;

  /**
   * Accessible label for the primary button.
   */
  ariaLabel?: string;

  /**
   * When true, sets aria-current="true" on the primary button.
   */
  ariaCurrent?: boolean;

  /**
   * Trailing actions slot, typically a row actions menu.
   */
  actions?: ReactNode;

  /**
   * HTML element for the row container.
   */
  as?: 'div' | 'li';
}

/**
 * Renders a markdown document sidebar row with file icon, optional color dot or git
 * status marker, and shared row chrome. Used in both Collections and Git sidebars.
 */
export function SidebarDocumentItem({
  icon = faFileLines,
  name,
  nameClassName,
  colorDot,
  statusMarker,
  selected = false,
  onContextMenu,
  onClick,
  onDoubleClick,
  ariaLabel,
  ariaCurrent = false,
  actions,
  as = 'div'
}: DocumentProps): JSX.Element {
  return (
    <SidebarItem selected={selected} onContextMenu={onContextMenu} actions={actions} as={as}>
      <button
        type="button"
        className={SIDEBAR_ITEM_BUTTON_CLASS}
        aria-current={ariaCurrent ? 'true' : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <FaIcon icon={icon} className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
        {colorDot != null ? (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span className={`min-w-0 truncate ${nameClassName ?? ''}`}>{name}</span>
            <SidebarColorDot
              color={colorDot.color}
              visible={colorDot.visible}
              label={colorDot.label}
            />
          </span>
        ) : (
          <span className={`min-w-0 truncate ${nameClassName ?? ''}`}>{name}</span>
        )}
        {statusMarker != null ? (
          <SidebarStatusMarker
            marker={statusMarker.marker}
            className={statusMarker.className}
            label={statusMarker.label}
          />
        ) : null}
      </button>
    </SidebarItem>
  );
}
