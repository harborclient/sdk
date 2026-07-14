import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { JSX, MouseEvent, ReactNode } from 'react';
import { Button } from '../Button/index.js';
import { FaIcon } from '../FaIcon/index.js';
import { SidebarItem } from './SidebarItem.js';
import { SidebarMethodBadge } from './SidebarMethodBadge.js';
import { statusDotClass } from './sidebarItemClasses.js';

interface Props {
  /**
   * HTTP method shown in the leading badge.
   */
  method: string;

  /**
   * Primary label text for the history entry.
   */
  name: string;

  /**
   * When true, shows a run icon instead of HTTP status metadata.
   */
  isRun?: boolean;

  /**
   * HTTP status code for request history entries.
   */
  status?: number;

  /**
   * HTTP status text for request history entries.
   */
  statusText?: string;

  /**
   * Icon shown for run history entries.
   */
  runIcon?: IconDefinition;

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
}

/**
 * Renders a request or run history entry row in the Collections sidebar History section.
 */
export function SidebarHistoryItem({
  method,
  name,
  isRun = false,
  status,
  statusText,
  runIcon,
  selected = false,
  title,
  ariaLabel,
  onContextMenu,
  onClick,
  actions
}: Props): JSX.Element {
  return (
    <SidebarItem selected={selected} onContextMenu={onContextMenu} actions={actions}>
      <Button
        variant="toolbar"
        className="flex min-w-0 flex-1 items-center gap-2 py-0.5 text-left text-text hover:bg-transparent"
        title={title}
        aria-label={ariaLabel}
        aria-selected={selected ? 'true' : undefined}
        onClick={onClick}
      >
        <SidebarMethodBadge method={method} uppercase />
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="min-w-0 truncate text-text">{name}</span>
          {isRun && runIcon != null ? (
            <FaIcon icon={runIcon} className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
          ) : null}
        </span>
        {!isRun && status != null && statusText != null ? (
          <span className="flex shrink-0 items-center gap-1.5 text-muted tabular-nums">
            <span
              className={`inline-block h-2 w-2 shrink-0 rounded-full ${statusDotClass(status)}`}
              aria-hidden="true"
            />
            {status} {statusText}
          </span>
        ) : null}
      </Button>
    </SidebarItem>
  );
}
