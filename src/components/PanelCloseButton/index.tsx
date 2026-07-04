import { faXmark } from '@fortawesome/free-solid-svg-icons';
import type { JSX } from 'react';
import { Button } from '../Button/index.js';
import { FaIcon } from '../FaIcon/index.js';
import { cn } from '../utils.js';

interface Props {
  /**
   * Called when the user closes the panel or overlay.
   */
  onClose: () => void;

  /**
   * Default accessible name when `ariaLabel` is not provided.
   */
  label?: string;

  /**
   * Accessible name when it should differ from `label`.
   */
  ariaLabel?: string;

  /**
   * Additional Tailwind classes merged onto the button element.
   */
  className?: string;
}

/**
 * Secondary icon close control for settings headers and full-page panels.
 */
export function PanelCloseButton({
  onClose,
  label = 'Close',
  ariaLabel,
  className
}: Props): JSX.Element {
  return (
    <Button
      type="button"
      variant="secondary"
      className={cn(
        'hc-panel-close-button inline-flex shrink-0 items-center justify-center py-2',
        className
      )}
      aria-label={ariaLabel ?? label}
      onClick={onClose}
    >
      <FaIcon icon={faXmark} className="hc-panel-close-button-icon h-4 w-4" />
    </Button>
  );
}
