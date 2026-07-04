import type { JSX, ReactNode } from 'react';
import { Button } from '../Button/index.js';
import { FieldError } from '../FieldError/index.js';
import { cn } from '../utils.js';

interface LoadingMessageProps {
  /**
   * Loading text announced to assistive technologies.
   */
  children?: ReactNode;

  /**
   * Additional Tailwind classes merged onto the status paragraph.
   */
  className?: string;
}

/**
 * Muted loading label used while async list data is fetched.
 */
export function LoadingMessage({
  children = 'Loading…',
  className
}: LoadingMessageProps): JSX.Element {
  return (
    <p role="status" className={cn('hc-loading-message text-[14px] text-muted', className)}>
      {children}
    </p>
  );
}

interface ErrorRetryProps {
  /**
   * Error message shown beside the retry control.
   */
  error: ReactNode;

  /**
   * Called when the user activates the retry button.
   */
  onRetry: () => void;

  /**
   * Accessible label for the retry button.
   */
  retryLabel?: string;
}

/**
 * Inline error message paired with a secondary retry button.
 */
export function ErrorRetry({ error, onRetry, retryLabel = 'Retry' }: ErrorRetryProps): JSX.Element {
  return (
    <div className="hc-error-retry flex flex-wrap items-center gap-2">
      <FieldError spacing="field" className="hc-error-retry-message mt-0 mb-0">
        {error}
      </FieldError>
      <Button type="button" variant="secondary" className="hc-error-retry-button" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}

interface AsyncListStateProps {
  /**
   * When true, renders the loading placeholder instead of children.
   */
  loading: boolean;

  /**
   * When set, renders an error row with optional retry instead of children.
   */
  error?: ReactNode;

  /**
   * Called when the user activates retry on the error row.
   */
  onRetry?: () => void;

  /**
   * Message shown when the list is empty and not loading or errored.
   */
  emptyMessage?: ReactNode;

  /**
   * Whether the underlying collection is empty.
   */
  isEmpty?: boolean;

  /**
   * List content rendered when data is ready.
   */
  children: ReactNode;

  /**
   * Custom loading message; defaults to {@link LoadingMessage}.
   */
  loadingMessage?: ReactNode;
}

/**
 * Switches between loading, error-with-retry, empty, and ready list content for
 * async CRUD screens such as Team Hub and storage location lists.
 */
export function AsyncListState({
  loading,
  error,
  onRetry,
  emptyMessage,
  isEmpty = false,
  children,
  loadingMessage
}: AsyncListStateProps): JSX.Element {
  if (loading) {
    return <>{loadingMessage ?? <LoadingMessage />}</>;
  }

  if (error) {
    if (onRetry) {
      return <ErrorRetry error={error} onRetry={onRetry} />;
    }
    return <FieldError spacing="section">{error}</FieldError>;
  }

  if (isEmpty && emptyMessage != null) {
    return <p className="hc-async-list-state-empty text-[14px] text-muted">{emptyMessage}</p>;
  }

  return <>{children}</>;
}
