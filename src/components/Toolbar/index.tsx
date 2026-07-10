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
   * Icon actions rendered left-aligned in the toolbar.
   */
  actions: ToolbarAction[];

  /**
   * Icon actions rendered right-aligned in the toolbar (e.g. toggles).
   */
  toggles?: ToolbarAction[];

  /**
   * Accessible name for the toolbar landmark.
   */
  ariaLabel?: string;
}

/**
 * Tailwind classes for toolbar icon action buttons.
 *
 * @param pressed - Whether the action is in a pressed/toggled-on state.
 * @returns Class string for the action button.
 */
function toolbarActionButtonClasses(pressed: boolean): string {
  return cn(
    'hc-toolbar-action app-no-drag inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-none text-text',
    pressed
      ? 'bg-selection'
      : 'bg-transparent hover:bg-selection focus-visible:bg-selection focus-visible:text-text',
    'disabled:cursor-not-allowed disabled:opacity-50'
  );
}

/**
 * Renders a single toolbar icon action with optional popover content.
 *
 * @param action - Declarative action to render as an icon button.
 * @returns Toolbar action button wrapped with optional popover anchor.
 */
function renderAction(action: ToolbarAction): JSX.Element {
  const title = action.title ?? action.label;

  return (
    <div key={action.id} className="hc-toolbar-action-wrap relative">
      <button
        type="button"
        ref={action.buttonRef}
        className={toolbarActionButtonClasses(action.ariaPressed === true)}
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
          className={cn(
            'hc-toolbar-action-icon h-5! w-5!',
            action.ariaPressed === true ? 'opacity-100' : 'opacity-50'
          )}
        />
      </button>
      {action.popover}
    </div>
  );
}

/**
 * Top-of-sidebar toolbar with left-aligned actions and optional right-aligned toggles.
 */
export function Toolbar({
  actions,
  toggles,
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
      <div className="hc-toolbar-actions flex items-center gap-1 leading-none">
        {actions.map(renderAction)}
      </div>
      {toggles && toggles.length > 0 ? (
        <div className="hc-toolbar-toggles ml-auto flex items-center gap-1">
          {toggles.map(renderAction)}
        </div>
      ) : null}
    </div>
  );
}
