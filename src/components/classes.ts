/**
 * Shared macOS-style Tailwind class strings for SDK UI components.
 */

export const segmentGroup =
  'inline-flex p-3 border-b border-separator w-full shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.06)] app-no-drag';

const segmentFocusVisible =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/**
 * Tailwind classes for a segmented control button.
 *
 * @param active - Whether this segment is selected.
 */
export function segment(active: boolean): string {
  return active
    ? `cursor-pointer rounded-md border-none bg-selection px-3 py-1 text-[15px] text-text app-no-drag ${segmentFocusVisible}`
    : `cursor-pointer rounded-md border-none bg-transparent px-3 py-1 text-[15px] text-muted hover:text-text app-no-drag ${segmentFocusVisible}`;
}
