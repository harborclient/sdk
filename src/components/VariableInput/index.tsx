import { useEffect, useId, useMemo, useRef, useState } from '@harborclient/sdk/react';
import type { ComponentPropsWithoutRef, JSX, KeyboardEvent, MouseEvent } from 'react';
import type { Variable } from '../../types.js';
import {
  getDynamicVariableDescription,
  getVariableTokenAtOffset,
  getVariableTooltipContent,
  resolveVariable,
  tokenizeVariables
} from '../../variables/index.js';
import { SuggestionList } from '../Autocomplete/SuggestionList.js';
import type { AutocompleteSource } from '../Autocomplete/types.js';
import { useAutocomplete } from '../Autocomplete/useAutocomplete.js';
import { Button } from '../Button/index.js';
import { VariableTooltipValue } from '../VariableTooltip/index.js';
import { Input } from '../forms/index.js';
import { cn } from '../utils.js';

interface TooltipState {
  key: string;
  value: string | undefined;
  dynamicDescription?: string;
  top: number;
  left: number;
}

/** Delay after the pointer stops moving before a hover tooltip is shown. */
const TOOLTIP_SHOW_DELAY_MS = 500;

/** Grace period before hiding so the pointer can reach the tooltip. */
const TOOLTIP_HIDE_DELAY_MS = 400;

export interface Props extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'className' | 'id' | 'aria-label' | 'aria-labelledby' | 'onKeyDown' | 'onChange'
> {
  /**
   * Current input value.
   */
  value: string;

  /**
   * Called when the value changes.
   */
  onChange: (value: string) => void;

  /**
   * Collection-scoped variables for highlighting and tooltips.
   */
  variables: Variable[];

  /**
   * Placeholder shown when value is empty.
   */
  placeholder?: string;

  /**
   * Optional keyboard handler (e.g. Enter to submit).
   */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;

  /**
   * Additional classes applied to the input element.
   */
  className?: string;

  /**
   * Classes applied to the outer wrapper (e.g. field border and tint for table cells).
   */
  wrapperClassName?: string;

  /**
   * Opens settings to edit the hovered variable.
   *
   * @param key - Variable name from the hovered {{key}} token.
   */
  onEditVariable?: (key: string) => void;

  /**
   * DOM id forwarded to the underlying input for label association.
   */
  id?: string;

  /**
   * Accessible name when no visible label is associated via `htmlFor`.
   */
  'aria-label'?: string;

  /**
   * Id of the element that labels this input when using `aria-labelledby`.
   */
  'aria-labelledby'?: string;

  /**
   * Optional async source for value autocomplete suggestions.
   */
  source?: AutocompleteSource;
}

/**
 * Text input that highlights {{variable}} tokens and shows resolved values on hover.
 *
 * Token highlight color (`text-[#32D2E2]`) and the tooltip `app-no-drag` class rely on
 * host styling in HarborClient `styles.css`.
 */
export function VariableInput({
  value,
  onChange,
  variables,
  placeholder,
  onKeyDown,
  className = '',
  wrapperClassName,
  onEditVariable,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  source,
  ...props
}: Props): JSX.Element {
  const safeValue = value ?? '';
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const spanRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const hideTimer = useRef<number | null>(null);
  const showTimer = useRef<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const tooltipId = useId();

  const {
    open: autocompleteOpen,
    items: autocompleteItems,
    activeIndex: autocompleteActiveIndex,
    listboxId,
    onFocus: openAutocomplete,
    onBlur: closeAutocomplete,
    onInputKeyDown,
    selectItem,
    setActiveIndex,
    closeSuggestions
  } = useAutocomplete({
    source,
    value: safeValue,
    onSelect: onChange,
    anchorRef: inputRef
  });

  /**
   * Splits the input value into plain text and {{variable}} token spans for highlighting.
   */
  const tokens = useMemo(() => tokenizeVariables(safeValue), [safeValue]);

  /**
   * Clears any pending tooltip hide timer.
   */
  const cancelHide = (): void => {
    if (hideTimer.current != null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  /**
   * Hides the tooltip after a short grace period so the pointer can reach it.
   */
  const scheduleHide = (): void => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => setTooltip(null), TOOLTIP_HIDE_DELAY_MS);
  };

  /**
   * Clears any pending tooltip show timer.
   */
  const cancelShow = (): void => {
    if (showTimer.current != null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  };

  /**
   * Shows a tooltip for a variable token at the given screen position.
   */
  const showTooltipForKey = (key: string, top: number, left: number): void => {
    setTooltip({
      key,
      value: resolveVariable(key, variables),
      dynamicDescription: getDynamicVariableDescription(key),
      top,
      left
    });
  };

  /**
   * Shows the tooltip once the pointer has stopped moving for {@link TOOLTIP_SHOW_DELAY_MS}.
   *
   * @param key - Variable name from the hovered {{key}} token.
   * @param top - Screen Y coordinate for tooltip placement.
   * @param left - Screen X coordinate for tooltip placement.
   */
  const scheduleShow = (key: string, top: number, left: number): void => {
    cancelShow();
    showTimer.current = window.setTimeout(() => {
      showTimer.current = null;
      showTooltipForKey(key, top, left);
    }, TOOLTIP_SHOW_DELAY_MS);
  };

  /**
   * Clears pending tooltip timers when the component unmounts.
   */
  useEffect(
    () => () => {
      cancelHide();
      cancelShow();
    },
    []
  );

  /**
   * Keeps the colored backdrop aligned with horizontal scroll in the input.
   */
  const syncScroll = (): void => {
    const input = inputRef.current;
    const backdrop = backdropRef.current;
    if (input && backdrop) {
      backdrop.scrollLeft = input.scrollLeft;
    }
  };

  /**
   * Updates the tooltip based on the current text caret position.
   */
  const updateTooltipFromCaret = (): void => {
    const input = inputRef.current;
    if (!input) return;

    const offset = input.selectionStart ?? 0;
    const match = getVariableTokenAtOffset(safeValue, offset);
    if (!match) {
      setTooltip(null);
      return;
    }

    let tokenIndex = -1;
    let position = 0;
    for (const [index, token] of tokens.entries()) {
      if (token.key && position === match.start) {
        tokenIndex = index;
        break;
      }
      position += token.text.length;
    }

    const span = tokenIndex >= 0 ? spanRefs.current.get(tokenIndex) : undefined;
    if (span) {
      const rect = span.getBoundingClientRect();
      showTooltipForKey(match.key, rect.top, rect.left + rect.width / 2);
      return;
    }

    const rect = input.getBoundingClientRect();
    showTooltipForKey(match.key, rect.top, rect.left + rect.width / 2);
  };

  /**
   * Shows a tooltip when the pointer rests over a variable token span.
   */
  const handleMouseMove = (e: MouseEvent<HTMLInputElement>): void => {
    cancelHide();

    for (const [index, token] of tokens.entries()) {
      if (!token.key) continue;

      const span = spanRefs.current.get(index);
      if (!span) continue;

      const rect = span.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        scheduleShow(token.key, rect.top, rect.left + rect.width / 2);
        return;
      }
    }

    cancelShow();
    scheduleHide();
  };

  /**
   * Cancels a pending show and hides the tooltip when the pointer leaves the input.
   */
  const handleMouseLeave = (): void => {
    cancelShow();
    scheduleHide();
  };

  /**
   * Handles keyboard events on the input, including tooltip dismissal.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (onInputKeyDown(event)) {
      return;
    }

    if (event.key === 'Escape' && tooltip) {
      event.preventDefault();
      setTooltip(null);
      return;
    }

    onKeyDown?.(event);
  };

  /**
   * Updates the tooltip after keyboard navigation moves the caret.
   */
  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      updateTooltipFromCaret();
    }
  };

  const tooltipContent = tooltip ? getVariableTooltipContent(tooltip.key, variables) : null;

  return (
    <div
      {...props}
      className={cn('hc-variable-input relative min-w-0', wrapperClassName ?? 'flex-1')}
    >
      <div
        ref={backdropRef}
        aria-hidden
        className="hc-variable-input-backdrop pointer-events-none absolute inset-0 overflow-hidden px-2.5 py-1.5 text-[16px] whitespace-nowrap text-inherit"
      >
        {safeValue ? (
          tokens.map((token, index) =>
            token.key ? (
              <span
                key={index}
                ref={(el) => {
                  if (el) spanRefs.current.set(index, el);
                  else spanRefs.current.delete(index);
                }}
                className="hc-variable-input-token hc-variable-input-token-variable text-[#32D2E2]"
              >
                {token.text}
              </span>
            ) : (
              <span key={index} className="hc-variable-input-token">
                {token.text}
              </span>
            )
          )
        ) : (
          <span className="hc-variable-input-placeholder text-muted">{placeholder}</span>
        )}
      </div>

      <Input
        ref={inputRef}
        id={id}
        variant="plain"
        role={source ? 'combobox' : undefined}
        aria-autocomplete={source ? 'list' : undefined}
        aria-expanded={source ? autocompleteOpen : undefined}
        aria-controls={source && autocompleteOpen ? listboxId : undefined}
        aria-activedescendant={
          source && autocompleteOpen && autocompleteActiveIndex >= 0
            ? `${listboxId}-option-${autocompleteActiveIndex}`
            : undefined
        }
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={tooltip ? tooltipId : undefined}
        className={cn(
          'hc-variable-input-field relative w-full min-w-0 border-none bg-transparent px-2.5 py-1.5 text-[16px] text-transparent caret-text focus-visible:shadow-none',
          className
        )}
        type="text"
        placeholder={placeholder}
        value={safeValue}
        onChange={(e) => {
          onChange(e.target.value);
          queueMicrotask(updateTooltipFromCaret);
        }}
        onFocus={() => {
          openAutocomplete();
          updateTooltipFromCaret();
        }}
        onBlur={closeAutocomplete}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onSelect={updateTooltipFromCaret}
        onClick={updateTooltipFromCaret}
        onScroll={syncScroll}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {source && (
        <SuggestionList
          open={autocompleteOpen}
          items={autocompleteItems}
          activeIndex={autocompleteActiveIndex}
          anchorRef={inputRef}
          listboxId={listboxId}
          onSelect={selectItem}
          onActiveIndexChange={setActiveIndex}
          onClose={closeSuggestions}
        />
      )}

      {tooltip && tooltipContent && (
        <div
          id={tooltipId}
          role="tooltip"
          className="hc-variable-input-tooltip pointer-events-auto fixed z-50 flex max-w-sm -translate-x-1/2 -translate-y-full flex-col gap-2 rounded-lg border border-separator bg-surface px-4 py-3 text-[16px] text-text shadow-md after:pointer-events-auto after:absolute after:right-0 after:-bottom-2 after:left-0 after:h-2 after:content-['']"
          style={{ top: tooltip.top - 4, left: tooltip.left }}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        >
          <VariableTooltipValue
            value={tooltipContent.text}
            variableKey={tooltip.key}
            muted={tooltipContent.muted}
          />
          {onEditVariable && (
            <Button
              variant="secondary"
              className="hc-variable-input-tooltip-edit self-start"
              aria-label={`Edit value for ${tooltip.key}`}
              onClick={() => {
                onEditVariable(tooltip.key);
                setTooltip(null);
              }}
            >
              Edit value
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
