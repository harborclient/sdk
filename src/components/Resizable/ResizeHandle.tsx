import type {
  ComponentPropsWithoutRef,
  JSX,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent
} from 'react';
import { cn } from '../utils.js';

interface Props extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'aria-label' | 'aria-valuenow' | 'aria-valuemin' | 'aria-valuemax'
> {
  /**
   * Handle orientation: horizontal resizes height, vertical resizes width.
   */
  orientation: 'horizontal' | 'vertical';

  /**
   * Current panel size in pixels for valued separator semantics.
   */
  value: number;

  /**
   * Minimum allowed panel size in pixels.
   */
  min: number;

  /**
   * Maximum allowed panel size in pixels.
   */
  max: number;

  /**
   * Called when the user starts dragging the handle.
   */
  onResizeStart: (event: ReactMouseEvent) => void;

  /**
   * Called when the user presses arrow keys on the focused handle.
   */
  onKeyboardResize: (event: ReactKeyboardEvent) => void;

  /**
   * Accessible label for the separator.
   */
  ariaLabel: string;
}

/**
 * Draggable separator handle for resizable panels.
 */
export function ResizeHandle({
  orientation,
  value,
  min,
  max,
  onResizeStart,
  onKeyboardResize,
  ariaLabel,
  className,
  ...props
}: Props): JSX.Element {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      {...props}
      role="separator"
      tabIndex={0}
      className={cn(
        'hc-resize-handle font-inherit app-no-drag m-0 flex shrink-0 items-center justify-center bg-control p-0 text-inherit hover:bg-selection/60',
        isHorizontal
          ? 'h-1.5 w-full cursor-row-resize border-b border-separator'
          : 'h-full w-1.5 cursor-col-resize border-r border-separator',
        className
      )}
      onMouseDown={onResizeStart}
      onKeyDown={onKeyboardResize}
      aria-orientation={orientation}
      aria-label={ariaLabel}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={Math.round(max)}
    >
      <div
        className={
          isHorizontal
            ? 'hc-resize-handle-grip h-0.5 w-8 rounded-full bg-muted/50'
            : 'hc-resize-handle-grip h-8 w-0.5 rounded-full bg-muted/50'
        }
        aria-hidden
      />
    </div>
  );
}
