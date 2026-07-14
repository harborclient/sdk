/**
 * Tailwind classes for sidebar source rows and HTTP method badges.
 */

/**
 * Tailwind classes for a sidebar source row (collection, folder, request, etc.).
 *
 * @param selected - Whether this row is the active selection.
 * @param compact - When true, uses tighter vertical padding for top-level list rows.
 * @returns Combined Tailwind class string for the row container.
 */
export function sourceRow(selected: boolean, compact = false): string {
  const py = compact ? 'py-0' : 'py-0.5';
  return selected
    ? `group flex items-center gap-1 rounded-md bg-selection px-1.5 ${py} app-no-drag`
    : `group flex items-center gap-1 rounded-md px-1.5 ${py} hover:bg-selection/60 app-no-drag`;
}

/**
 * HTTP method color classes keyed by lowercase method name.
 */
export const METHOD_CLASSES: Record<string, string> = {
  get: 'text-method-get',
  post: 'text-method-post',
  put: 'text-method-put',
  patch: 'text-method-patch',
  delete: 'text-method-delete',
  head: 'text-method-head',
  options: 'text-method-options'
};

/**
 * Status dot color class for an HTTP response code.
 *
 * @param status - HTTP status code, or 0 for network errors.
 * @returns Tailwind background color class for the status dot.
 */
export function statusDotClass(status: number): string {
  if (status === 0) return 'bg-danger';
  if (status >= 200 && status < 300) return 'bg-success';
  if (status >= 300 && status < 400) return 'bg-warning';
  if (status >= 400) return 'bg-danger';
  return 'bg-info';
}

/**
 * Standard primary button classes for sidebar item label areas.
 */
export const SIDEBAR_ITEM_BUTTON_CLASS =
  'flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 border-none bg-transparent py-0 text-left text-inherit app-no-drag';
