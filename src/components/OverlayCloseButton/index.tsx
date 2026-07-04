import { faXmark } from '@fortawesome/free-solid-svg-icons';
import type { JSX } from 'react';
import { Button } from '../Button/index.js';
import { FaIcon } from '../FaIcon/index.js';
import { cn } from '../utils.js';

interface Props {
  /**
   * Accessible name for the close control.
   */
  label?: string;

  /**
   * Called when the user activates the close button.
   */
  onClose: () => void;

  /**
   * Additional Tailwind classes merged onto the button element.
   */
  className?: string;
}

/**
 * Always-visible overlay close icon used on full-page settings and plugin views.
 */
export function OverlayCloseButton({ label = 'Close', onClose, className }: Props): JSX.Element {
  return (
    <Button
      type="button"
      variant="icon"
      className={cn('hc-overlay-close-button text-[28px]', className)}
      aria-label={label}
      onClick={onClose}
    >
      <FaIcon icon={faXmark} className="hc-overlay-close-button-icon h-4 w-4" />
    </Button>
  );
}
