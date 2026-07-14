import type { JSX, MouseEvent, ReactNode } from 'react';
import { Button } from '../Button/index.js';
import { SidebarItem } from './SidebarItem.js';
import { SidebarMethodBadge } from './SidebarMethodBadge.js';
import { SidebarStatusDot } from './SidebarStatusDot.js';

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
   * Tooltip title for the primary button.
   */
  title?: string;

  /**
   * Accessible label for the primary button.
   */
  ariaLabel: string;

  /**
   * Called when the user right-clicks the row container.
   */
  onContextMenu?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * Called when the primary row button is clicked.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;

  /**
   * Trailing actions slot, typically a row actions menu.
   */
  actions?: ReactNode;

  /**
   * Optional data attribute value for keyboard navigation focus targets.
   */
  dataSidebarRunResultId?: string | number;
}

/**
 * Renders a saved run result row in the Collections sidebar Runs section.
 */
export function SidebarRunItem({
  method,
  label,
  connectionBadge,
  statusDotClassName,
  statusSummary,
  selected = false,
  title,
  ariaLabel,
  onContextMenu,
  onClick,
  actions,
  dataSidebarRunResultId
}: Props): JSX.Element {
  return (
    <SidebarItem selected={selected} onContextMenu={onContextMenu} actions={actions}>
      <Button
        variant="toolbar"
        className="flex min-w-0 flex-1 items-center gap-2 py-0.5 text-left text-text hover:bg-transparent"
        {...(dataSidebarRunResultId != null
          ? { 'data-sidebar-run-result-id': String(dataSidebarRunResultId) }
          : {})}
        title={title}
        aria-label={ariaLabel}
        aria-selected={selected ? 'true' : undefined}
        onClick={onClick}
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
      </Button>
    </SidebarItem>
  );
}
