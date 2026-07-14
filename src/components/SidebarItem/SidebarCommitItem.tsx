import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { JSX, MouseEvent } from 'react';
import { FaIcon } from '../FaIcon/index.js';

interface Props {
  /**
   * Commit message shown as the primary line.
   */
  message: string;

  /**
   * Author name shown in the metadata line.
   */
  author: string;

  /**
   * Formatted timestamp string shown in the metadata line.
   */
  timestampLabel: string;

  /**
   * Branch icon shown before the commit text.
   */
  icon: IconDefinition;

  /**
   * Called when the commit row button is clicked.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;

  /**
   * HTML element for the row container. Use `li` inside {@link SidebarList}.
   */
  as?: 'div' | 'li';
}

/**
 * Renders a recent commit row in the Git sidebar Commits section.
 * Uses a distinct two-line layout rather than the standard sourceRow shell.
 *
 * Wrap lists in {@link SidebarList} and pass `as="li"` for valid list semantics.
 */
export function SidebarCommitItem({
  message,
  author,
  timestampLabel,
  icon,
  onClick,
  as: Container = 'li'
}: Props): JSX.Element {
  return (
    <Container>
      <button
        type="button"
        className="hc-sidebar-commit-item group app-no-drag flex w-full cursor-pointer rounded-md p-2 text-left hover:bg-selection/60"
        onClick={onClick}
      >
        <FaIcon icon={icon} className="mr-2 h-4 w-4 shrink-0 text-muted" aria-hidden />
        <div className="-mt-1.5 flex flex-col gap-0.5">
          <span className="block min-w-0 truncate font-medium text-text">{message}</span>
          <span className="block min-w-0 truncate text-[14px] text-muted">
            {author} · {timestampLabel}
          </span>
        </div>
      </button>
    </Container>
  );
}
