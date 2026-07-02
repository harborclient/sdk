import type { JSX } from 'react';
import { Button } from '../Button/index.js';
import { FaIcon } from '../FaIcon/index.js';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

interface Props {
  /**
   * Called when the user activates the back control.
   */
  onClick: () => void;

  /**
   * Visible button text and default accessible name when `ariaLabel` is not provided.
   */
  label?: string;

  /**
   * Accessible name when it should differ from the visible `label`.
   */
  ariaLabel?: string;

  /**
   * Additional Tailwind classes merged onto the button element.
   */
  className?: string;
}

/**
 * Secondary back control for nested panel and overlay headers.
 *
 * Matches {@link PanelCloseButton} sizing with a left-angle icon and visible label.
 *
 * @param onClick - Back navigation handler.
 * @param label - Visible button text; defaults to "Back".
 * @param ariaLabel - Accessible name override when it should differ from `label`.
 * @param className - Extra classes appended after the layout preset.
 */
export function BackButton({ onClick, label = 'Back', ariaLabel, className }: Props): JSX.Element {
  const base = 'inline-flex shrink-0 items-center justify-center gap-1.5 py-1 text-[14px] h-6';
  const classes = className ? `hc-back-button ${base} ${className}` : `hc-back-button ${base}`;

  return (
    <Button
      type="button"
      variant="toolbar"
      className={classes}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <FaIcon icon={faAngleLeft} className="hc-back-button-icon h-4 w-4" aria-hidden />
      <span>{label}</span>
    </Button>
  );
}
