import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { AriaAttributes, ComponentPropsWithoutRef, JSX, ReactNode, RefObject } from 'react';
import { FaIcon } from '../FaIcon/index.js';
import { cn } from '../utils.js';

/**
 * Declarative action rendered as an icon button in a sidebar toolbar.
 */
export interface ToolbarAction {
  /**
   * Stable React key for this action.
   */
  id: string;

  /**
   * Font Awesome icon shown inside the action button.
   */
  icon: IconDefinition;

  /**
   * Accessible name for the control.
   */
  label: string;

  /**
   * Native tooltip text; defaults to `label`.
   */
  title?: string;

  /**
   * Called when the user activates the action button.
   */
  onClick: () => void;

  /**
   * When true, the action button is inactive.
   */
  disabled?: boolean;

  /**
   * Exposes toggle state for popup actions such as history menus.
   */
  ariaExpanded?: boolean;

  /**
   * Exposes pressed state for toggle actions such as visibility switches.
   */
  ariaPressed?: boolean;

  /**
   * Indicates the action opens a popup, for example `"menu"`.
   */
  ariaHaspopup?: AriaAttributes['aria-haspopup'];

  /**
   * Optional popover content anchored below this action button.
   */
  popover?: ReactNode;

  /**
   * Ref attached to the action button for portaled popover positioning.
   */
  buttonRef?: RefObject<HTMLButtonElement | null>;
}

interface Props extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'aria-label'> {
  /**
   * Icon actions rendered in the toolbar.
   */
  actions: ToolbarAction[];

  /**
   * Accessible name for the toolbar landmark.
   */
  ariaLabel?: string;
}

/**
 * Tailwind classes for inactive toolbar icon action buttons.
 */
const TOOLBAR_ACTION_BUTTON_INACTIVE =
  'hc-toolbar-action inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-muted hover:bg-selection hover:text-text focus-visible:bg-selection focus-visible:text-text disabled:cursor-not-allowed disabled:opacity-50 app-no-drag';

/**
 * Tailwind classes for pressed toolbar toggles, matching footer layout icon buttons.
 */
const TOOLBAR_ACTION_BUTTON_ACTIVE =
  'hc-toolbar-action inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-control text-text shadow-sm focus-visible:bg-surface focus-visible:text-text disabled:cursor-not-allowed disabled:opacity-50 app-no-drag';

/**
 * Resolves toolbar button classes for a declarative action.
 */
function toolbarActionButton(action: ToolbarAction): string {
  return action.ariaPressed === true
    ? TOOLBAR_ACTION_BUTTON_ACTIVE
    : TOOLBAR_ACTION_BUTTON_INACTIVE;
}

/**
 * Top-of-sidebar toolbar with left-aligned icon actions.
 */
export function Toolbar({
  actions,
  ariaLabel = 'Toolbar',
  className,
  ...props
}: Props): JSX.Element {
  return (
    <div
      {...props}
      role="toolbar"
      aria-label={ariaLabel}
      className={cn(
        'hc-toolbar app-no-drag flex shrink-0 items-center border-b border-separator bg-sidebar-toolbar px-2 py-2',
        className
      )}
    >
      <div className="hc-toolbar-actions flex items-center gap-1">
        {actions.map((action) => {
          const title = action.title ?? action.label;

          return (
            <div key={action.id} className="hc-toolbar-action-wrap relative">
              <button
                type="button"
                ref={action.buttonRef}
                className={toolbarActionButton(action)}
                title={title}
                aria-label={action.label}
                aria-expanded={action.ariaExpanded}
                aria-pressed={action.ariaPressed}
                aria-haspopup={action.ariaHaspopup}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                <FaIcon
                  icon={action.icon}
                  className={
                    action.ariaPressed === true
                      ? 'hc-toolbar-action-icon h-5! w-5!'
                      : 'hc-toolbar-action-icon h-5! w-5!'
                  }
                />
              </button>
              {action.popover}
            </div>
          );
        })}
      </div>
    </div>
  );
}
