import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { JSX, ReactNode } from 'react';
import { FaIcon } from '../FaIcon/index.js';

interface Props {
  /**
   * Page heading rendered as an `h2`.
   */
  title: string;

  /**
   * Optional muted summary shown below the title.
   */
  description?: string;

  /**
   * Optional decorative icon shown before the title.
   */
  icon?: IconDefinition;

  /**
   * Action controls aligned to the right side of the header row.
   */
  children?: ReactNode;

  /**
   * Extra classes merged onto the outer header wrapper.
   */
  className?: string;
}

/**
 * Full-bleed page header with a bordered bottom edge, title block on the left,
 * and optional action controls on the right.
 */
export function PageHeader({ title, description, icon, children, className }: Props): JSX.Element {
  const wrapperClassName = className
    ? `hc-page-header -mx-6 mb-4 flex flex-wrap items-center gap-2 border-b border-separator px-6 py-4 ${className}`
    : 'hc-page-header -mx-6 mb-4 flex flex-wrap items-center gap-2 border-b border-separator px-6 py-4';

  return (
    <div className={wrapperClassName}>
      <div className="hc-page-header-content min-w-0 flex-1">
        <h2 className="hc-page-header-title m-0 flex items-center gap-2 text-[28px] font-bold leading-[1.15] tracking-[-0.01em] text-text">
          {icon ? (
            <FaIcon
              icon={icon}
              className="hc-page-header-title-icon h-5 w-5 shrink-0 text-muted"
              aria-hidden
            />
          ) : null}
          {title}
        </h2>
        {description ? (
          <p className="hc-page-header-description m-0 mt-1 text-[16px] text-muted leading-none">
            {description}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="hc-page-header-actions flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
