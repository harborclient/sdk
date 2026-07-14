import type { JSX, ReactNode } from 'react';
import { cn } from '../utils.js';

interface TreeProps {
  /**
   * Tree rows. Each child should be a {@link SidebarFolderItem} with `as="li"`.
   */
  children: ReactNode;

  /**
   * Accessible name for the tree when the section title is not sufficient.
   */
  'aria-label'?: string;

  /**
   * Additional classes merged onto the tree element.
   */
  className?: string;
}

/**
 * Accessible tree container for nested sidebar folder hierarchies.
 *
 * Wrap folder rows rendered with {@link SidebarFolderItem} `as="li"` and
 * `treeItem` so each row exposes `role="treeitem"` with expand/collapse state.
 *
 * @example
 * ```tsx
 * <SidebarTree aria-label="Collections">
 *   <SidebarFolderItem as="li" name="Auth" expanded childrenId="auth-children" />
 *   <SidebarTreeGroup id="auth-children">
 *     <SidebarRequestItem as="li" name="Login" method="POST" />
 *   </SidebarTreeGroup>
 * </SidebarTree>
 * ```
 */
export function SidebarTree({
  children,
  'aria-label': ariaLabel,
  className
}: TreeProps): JSX.Element {
  return (
    <ul role="tree" aria-label={ariaLabel} className={cn('m-0 list-none p-0', className)}>
      {children}
    </ul>
  );
}

interface TreeGroupProps {
  /**
   * Child tree rows or nested groups.
   */
  children: ReactNode;

  /**
   * Stable id referenced by the parent treeitem's `aria-controls`.
   */
  id: string;

  /**
   * Additional classes merged onto the group element.
   */
  className?: string;
}

/**
 * Child region for an expanded folder treeitem.
 *
 * Renders `role="group"` and must use the same `id` passed to the parent
 * folder's `childrenId` / `aria-controls`.
 */
export function SidebarTreeGroup({ children, id, className }: TreeGroupProps): JSX.Element {
  return (
    <ul role="group" id={id} className={cn('m-0 list-none p-0', className)}>
      {children}
    </ul>
  );
}
