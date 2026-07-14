import type { JSX, MouseEvent, ReactNode } from 'react';
import { SidebarItem } from './SidebarItem.js';
import { SidebarMethodBadge } from './SidebarMethodBadge.js';
import { SidebarStatusDot } from './SidebarStatusDot.js';
import { SIDEBAR_ITEM_BUTTON_CLASS } from './sidebarItemClasses.js';

interface Props {
  /**
   * Optional HTTP method shown in the leading badge.
   */
  method?: string;

  /**
   * Primary label text for the saved run row.
   */
  label: string;

  /**
   * Optional connection badge text (e.g. storage location name).
   */
  connectionBadge?: string;

  /**
   * Tailwind background color class for the pass/fail status dot.
   */
  statusDotClassName: string;

  /**
   * Screen-reader text describing the run summary status.
   */
  statusSummary: string;

  /**
   * Whether this row is part of a multi-selection.
   */
  selected?: boolean;

  /**
   * Tooltip title for the primary label area.
   */
  title?: string;

  /**
   * Called when the user right-clicks the row container.
   */
  onContextMenu?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * Called when the primary row area is activated.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * Trailing actions slot, typically a row actions menu.
   */
  actions?: ReactNode;

  /**
   * Optional data attribute value for keyboard navigation focus targets.
   */
  dataSidebarRunResultId?: string | number;

  /**
   * HTML element for the row container. Use `li` inside {@link SidebarListbox}.
   */
  as?: 'div' | 'li';
}

/**
 * Renders a saved run result row in the Collections sidebar Runs section.
 *
 * The accessible name is derived from visible row content (method, label, connection badge,
 * status summary).
 */
export function SidebarRunItem({
  method,
  label,
  connectionBadge,
  statusDotClassName,
  statusSummary,
  selected = false,
  title,
  onContextMenu,
  onClick,
  actions,
  dataSidebarRunResultId,
  as = 'li'
}: Props): JSX.Element {
  const useListboxOption = as === 'li';

  return (
    <SidebarItem
      selected={selected}
      onContextMenu={onContextMenu}
      actions={actions}
      as={as}
      listboxOption={
        useListboxOption
          ? {
              onClick
            }
          : undefined
      }
    >
      <span
        className={`${SIDEBAR_ITEM_BUTTON_CLASS} py-0.5`}
        title={title}
        {...(dataSidebarRunResultId != null
          ? { 'data-sidebar-run-result-id': String(dataSidebarRunResultId) }
          : {})}
      >
        {method != null && method !== '' ? <SidebarMethodBadge method={method} uppercase /> : null}
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="min-w-0 truncate text-text">{label}</span>
          {connectionBadge != null ? (
            <span
              className="shrink-0 rounded bg-info/15 px-1.5 py-0.5 text-[14px] font-medium text-info"
              title={`Stored in ${connectionBadge}`}
            >
              {connectionBadge}
            </span>
          ) : null}
        </span>
        <SidebarStatusDot className={statusDotClassName} srOnlyLabel={statusSummary} />
      </span>
    </SidebarItem>
  );
}
