import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ComponentPropsWithoutRef, JSX } from 'react';
import { FaIcon } from '../FaIcon/index.js';
import { cn } from '../utils.js';

interface Props extends Omit<ComponentPropsWithoutRef<'button'>, 'aria-label' | 'aria-pressed'> {
  /**
   * Font Awesome icon shown inside the footer toggle button.
   */
  icon: IconDefinition;

  /**
   * Whether the associated panel or sidebar is currently open.
   */
  active: boolean;

  /**
   * Noun phrase for accessibility labels, e.g. `"sidebar"` becomes
   * `"Hide sidebar"` / `"Show sidebar"`.
   */
  label: string;

  /**
   * Optional tooltip text. Defaults to the computed show/hide label.
   */
  title?: string;
}

/**
 * Square icon toggle styles for footer sidebar buttons.
 */
function footerIconButton(active: boolean): string {
  return active
    ? 'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-surface text-text shadow-sm app-no-drag'
    : 'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-muted hover:bg-selection hover:text-text app-no-drag';
}

/**
 * Icon-only toggle button for the window footer bar, used to show or hide
 * sidebars and similar panels.
 */
export function FooterIcon({
  icon,
  active,
  onClick,
  label,
  title,
  className,
  ...props
}: Props): JSX.Element {
  const accessibleLabel = active ? `Hide ${label}` : `Show ${label}`;
  return (
    <button
      {...props}
      type="button"
      className={cn('hc-footer-icon', footerIconButton(active), className)}
      onClick={onClick}
      aria-pressed={active}
      aria-label={accessibleLabel}
      title={title ?? accessibleLabel}
    >
      <FaIcon icon={icon} className="hc-footer-icon-icon h-4 w-4" />
    </button>
  );
}
