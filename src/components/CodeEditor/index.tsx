import { autocompletion, closeCompletion, type CompletionSource } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { Prec } from '@codemirror/state';
import type { EditorState } from '@codemirror/state';
import {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  hoverTooltip,
  keymap,
  type DecorationSet,
  type ViewUpdate
} from '@codemirror/view';
import CodeMirrorImport from '@uiw/react-codemirror';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  createElement
} from '@harborclient/sdk/react';
import type { JSX } from 'react';
import type { CodeEditorSetup, CodeEditorTheme, Variable } from '../../types.js';
import { getVariableTooltipContent, VARIABLE_NAME_CHARS } from '../../variables/index.js';
import { normalizeCodeEditorFontSize } from '../../ui/codeEditorSettings.js';
import { useCodeEditorConfig } from './config.js';
import { createBuiltInSyntaxHighlighting, createEditorTheme } from './editorChrome.js';
import { createSlashCommandHighlighter } from './slashCommandHighlighter.js';
import { createSyntaxHighlightedPlaceholder } from './syntaxHighlightedPlaceholder.js';
import { getCodeEditorThemeExtension } from './themes.js';

export { CODE_EDITOR_THEME_OPTIONS } from './themes.js';

export type CodeEditorLanguage = 'json' | 'text' | 'javascript' | 'shell';

/**
 * One slash command offered at the start of a line in the editor.
 */
export interface CodeEditorSlashCommand {
  /**
   * Command name without the leading slash (for example `ask`).
   */
  name: string;

  /**
   * Short description shown in autocomplete.
   */
  description?: string;
}

/**
 * Screen coordinates for anchoring host UI near a slash command.
 */
export interface CodeEditorSlashCoords {
  /**
   * Top edge in viewport pixels.
   */
  top: number;

  /**
   * Left edge in viewport pixels.
   */
  left: number;

  /**
   * Bottom edge in viewport pixels.
   */
  bottom: number;

  /**
   * Right edge in viewport pixels.
   */
  right: number;
}

/**
 * Parsed slash command at the caret line, passed to {@link Props.onSlashCommand}.
 */
export interface CodeEditorSlashTrigger {
  /**
   * Matched command name without the leading slash.
   */
  command: string;

  /**
   * Optional arguments typed after the command on the same line.
   */
  args: string;

  /**
   * 1-based line number where the command appears.
   */
  line: number;

  /**
   * Document offset of the leading slash character.
   */
  from: number;

  /**
   * Document offset after the matched command span (exclusive).
   */
  to: number;

  /**
   * Viewport coordinates near the command for positioning host UI.
   */
  coords: CodeEditorSlashCoords;
}

/**
 * Document offsets for a CodeMirror selection range.
 */
export interface CodeEditorSelectionRange {
  /**
   * Anchor offset in the document.
   */
  anchor: number;

  /**
   * Head (active caret) offset in the document.
   */
  head: number;
}

/**
 * Scroll and selection snapshot reported by {@link Props.onViewStateChange}.
 */
export interface CodeEditorViewState {
  /**
   * Vertical scroll offset of the CodeMirror scroller in pixels.
   */
  scrollTop: number;

  /**
   * Current selection range in document offsets.
   */
  selection: CodeEditorSelectionRange;
}

export interface Props {
  /**
   * Editor content.
   */
  value: string;

  /**
   * Called when the user edits the content; omitted for read-only views.
   *
   * @param value - Updated editor content.
   */
  onChange?: (value: string) => void;

  /**
   * Syntax mode for highlighting.
   */
  language?: CodeEditorLanguage;

  /**
   * When true, the editor cannot be edited.
   */
  readOnly?: boolean;

  /**
   * When false, blocks user input while keeping normal editor chrome (gutters, border).
   * Defaults to the inverse of {@link readOnly}. Use for temporary locks during async work.
   */
  editable?: boolean;

  /**
   * Placeholder shown when the editor is empty.
   */
  placeholder?: string;

  /**
   * When true, renders the placeholder as muted syntax-highlighted ghost content (JavaScript only).
   */
  placeholderHighlight?: boolean;

  /**
   * Minimum editor height in CSS units.
   */
  minHeight?: string;

  /**
   * Explicit editor height in CSS units. When set, restores a user-resized height.
   */
  height?: string;

  /**
   * Called when the wrapper height changes (for example after native resize-y drag).
   *
   * @param heightPx - Observed wrapper height rounded to the nearest pixel.
   */
  onHeightChange?: (heightPx: number) => void;

  /**
   * Restores vertical scroll when the editor is created.
   */
  initialScrollTop?: number;

  /**
   * Restores caret/selection when the editor is created.
   */
  initialSelection?: CodeEditorSelectionRange;

  /**
   * Called when scroll or selection changes, debounced, and once on unmount.
   */
  onViewStateChange?: (state: CodeEditorViewState) => void;

  /**
   * Additional wrapper classes.
   */
  className?: string;

  /**
   * Collection-scoped variables for {{token}} highlighting and tooltips.
   */
  variables?: Variable[];

  /**
   * Opens collection settings to edit a hovered variable.
   */
  onEditVariable?: () => void;

  /**
   * When set on a JavaScript editor, enables custom autocomplete (e.g. hc API completions).
   */
  completionSource?: CompletionSource;

  /**
   * Slash commands recognized at the start of a line (for example `/ask`).
   */
  slashCommands?: CodeEditorSlashCommand[];

  /**
   * Called when the user presses Enter on a complete slash command line.
   */
  onSlashCommand?: (trigger: CodeEditorSlashTrigger) => void;

  /**
   * When set, overrides the persisted CodeMirror theme (used by the settings preview).
   */
  themeOverride?: CodeEditorTheme;

  /**
   * When set, overrides persisted basicSetup options (used by the settings preview).
   */
  setupOverride?: CodeEditorSetup;

  /**
   * When set, overrides the persisted editor font size (used by the settings preview).
   */
  fontSize?: string;

  /**
   * DOM id applied to the editable region for label association.
   */
  id?: string;

  /**
   * Accessible name when no visible label is associated via `htmlFor`.
   */
  'aria-label'?: string;

  /**
   * Id of the element that labels this editor when using `aria-labelledby`.
   */
  'aria-labelledby'?: string;

  /**
   * When true, marks the editor as failing validation for assistive technologies.
   */
  'aria-invalid'?: boolean | 'true' | 'false';

  /**
   * Ids of elements describing the editor, merged with variable tooltip ids when active.
   */
  'aria-describedby'?: string;
}

/**
 * Clamps selection offsets to the current document length.
 *
 * @param docLength - Current document length in characters.
 * @param selection - Selection offsets to clamp.
 * @returns Offsets safe to dispatch into CodeMirror.
 */
function clampSelection(
  docLength: number,
  selection: CodeEditorSelectionRange
): CodeEditorSelectionRange {
  const maxOffset = Math.max(0, docLength);
  return {
    anchor: Math.min(Math.max(0, selection.anchor), maxOffset),
    head: Math.min(Math.max(0, selection.head), maxOffset)
  };
}

/** Debounce interval for {@link Props.onViewStateChange} notifications. */
const VIEW_STATE_DEBOUNCE_MS = 300;

const variableMatcher = new MatchDecorator({
  regexp: new RegExp(`\\{\\{\\s*([${VARIABLE_NAME_CHARS}]+)\\s*\\}\\}`, 'g'),
  decoration: Decoration.mark({ class: 'cm-variable-token' })
});

const variableHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    /**
     * Builds the initial {{variable}} decoration set for the editor view.
     *
     * @param view - CodeMirror editor view instance.
     */
    constructor(view: EditorView) {
      this.decorations = variableMatcher.createDeco(view);
    }

    /**
     * Recomputes decorations when document content or viewport changes.
     *
     * @param update - View update describing what changed.
     */
    update(update: ViewUpdate): void {
      this.decorations = variableMatcher.updateDeco(update, this.decorations);
    }
  },
  { decorations: (v) => v.decorations }
);

/** Matches a slash command at the start of a line with optional arguments. */
const SLASH_COMMAND_LINE_PATTERN = /^(\s*)\/(\w+)(?:[ \t]+(.*))?$/;

/**
 * Returns a parsed slash command on a line when the name is registered.
 *
 * @param lineText - Full line text without the trailing newline.
 * @param lineFrom - Document offset of the line start.
 * @param lineNumber - 1-based line number.
 * @param commands - Registered slash commands.
 */
function parseSlashCommandLine(
  lineText: string,
  lineFrom: number,
  lineNumber: number,
  commands: CodeEditorSlashCommand[]
): Omit<CodeEditorSlashTrigger, 'coords'> | null {
  const match = lineText.match(SLASH_COMMAND_LINE_PATTERN);
  if (!match) {
    return null;
  }

  const command = match[2];
  if (command == null || !commands.some((entry) => entry.name === command)) {
    return null;
  }

  const leading = match[1] ?? '';
  const slashIndex = leading.length;
  const from = lineFrom + slashIndex;
  const to = lineFrom + lineText.length;

  return {
    command,
    args: (match[3] ?? '').trim(),
    line: lineNumber,
    from,
    to
  };
}

/**
 * Builds a CodeMirror completion source for registered slash commands at line start.
 *
 * @param commands - Slash commands to offer after `/`.
 */
function createSlashCommandCompletionSource(commands: CodeEditorSlashCommand[]): CompletionSource {
  /**
   * Returns slash command completions when the caret follows `/` at line start.
   *
   * @param context - CodeMirror completion context at the cursor.
   */
  return (context) => {
    const word = context.matchBefore(/^\s*\/\w*/);
    if (!word || word.text.length === 0) {
      return null;
    }

    const partial = word.text.replace(/^\s*\//, '');
    const options = commands
      .filter((entry) => entry.name.startsWith(partial))
      .map((entry) => ({
        label: `/${entry.name}`,
        type: 'keyword' as const,
        detail: entry.description,
        apply: `/${entry.name} `
      }));

    if (options.length === 0) {
      return null;
    }

    return { from: word.from, options };
  };
}

/**
 * Returns an Enter keymap that triggers registered slash commands before default newline handling.
 *
 * @param commands - Slash commands to recognize.
 * @param onSlashCommand - Host callback invoked with parsed trigger details.
 */
function slashCommandEnterHandler(
  commands: CodeEditorSlashCommand[],
  onSlashCommand: (trigger: CodeEditorSlashTrigger) => void
): ReturnType<typeof Prec.highest> {
  return Prec.highest(
    keymap.of([
      {
        key: 'Enter',
        /**
         * Opens host slash-command UI when Enter is pressed on a complete command line.
         *
         * @param view - CodeMirror editor view instance.
         */
        run: (view): boolean => {
          const pos = view.state.selection.main.head;
          const line = view.state.doc.lineAt(pos);
          const parsed = parseSlashCommandLine(line.text, line.from, line.number, commands);
          if (!parsed) {
            return false;
          }

          const coords = view.coordsAtPos(parsed.from);
          if (!coords) {
            return false;
          }

          // Dismiss the autocomplete popup so its Enter binding does not also fire.
          closeCompletion(view);

          onSlashCommand({
            ...parsed,
            coords: {
              top: coords.top,
              left: coords.left,
              bottom: coords.bottom,
              right: coords.right
            }
          });
          return true;
        }
      }
    ])
  );
}

interface SelectionTooltipState {
  key: string;
  top: number;
  left: number;
}

/**
 * Finds the {{variable}} token at a document position, if any.
 *
 * @param doc - CodeMirror document.
 * @param pos - Character position in the document.
 * @returns Variable key and token range, or null when not inside a token.
 */
function findVariableAtPos(
  doc: { lineAt: (pos: number) => { from: number; text: string } },
  pos: number
): { key: string; start: number; end: number } | null {
  const line = doc.lineAt(pos);
  const pattern = new RegExp(`\\{\\{\\s*([${VARIABLE_NAME_CHARS}]+)\\s*\\}\\}`, 'g');

  for (const match of line.text.matchAll(pattern)) {
    const start = line.from + (match.index ?? 0);
    const end = start + match[0].length;
    if (pos < start || pos > end) continue;
    return { key: match[1], start, end };
  }

  return null;
}

/**
 * Builds DOM content for a variable tooltip.
 *
 * @param key - Variable name from the token.
 * @param variables - Collection-scoped variables for resolution.
 * @param onEditVariable - Optional callback to open collection settings.
 */
function buildVariableTooltipDom(
  key: string,
  variables: Variable[],
  onEditVariable?: () => void
): HTMLDivElement {
  const content = getVariableTooltipContent(key, variables);
  const dom = document.createElement('div');
  dom.className = 'cm-variable-tooltip';

  const valueEl = document.createElement('div');
  valueEl.textContent = content.text;
  if (content.muted) {
    valueEl.className = 'cm-variable-tooltip-muted';
  }
  dom.appendChild(valueEl);

  if (onEditVariable) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Edit value';
    btn.className = 'cm-variable-tooltip-edit';
    btn.setAttribute('aria-label', `Edit value for ${key}`);
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onEditVariable();
    });
    dom.appendChild(btn);
  }

  return dom;
}

/**
 * Joins non-empty element ids into a space-separated `aria-describedby` value.
 *
 * @param ids - Candidate element ids.
 * @returns Merged id string, or undefined when no ids are provided.
 */
function mergeDescribedBy(...ids: (string | undefined)[]): string | undefined {
  const merged = ids.filter((id): id is string => id != null && id !== '');
  return merged.length > 0 ? merged.join(' ') : undefined;
}

/**
 * Sets or clears `aria-describedby` on the CodeMirror content element.
 *
 * @param content - Editable `.cm-content` element.
 * @param getValidationDescribedBy - Returns validation/helper ids from props.
 * @param tooltipId - Optional variable tooltip id to include while visible.
 */
function setContentDescribedBy(
  content: Element | null | undefined,
  getValidationDescribedBy: () => string | undefined,
  tooltipId?: string
): void {
  if (!content) return;
  const describedBy = mergeDescribedBy(getValidationDescribedBy(), tooltipId);
  if (describedBy) {
    content.setAttribute('aria-describedby', describedBy);
  } else {
    content.removeAttribute('aria-describedby');
  }
}

/**
 * Shows a keyboard-driven tooltip when the caret moves inside a {{variable}} token.
 *
 * @param tooltipId - Stable id referenced by `aria-describedby`.
 * @param onTooltipChange - Callback invoked when tooltip visibility or position changes.
 * @param getValidationDescribedBy - Returns validation/helper ids from editor props.
 */
function variableSelectionTooltip(
  tooltipId: string,
  onTooltipChange: (state: SelectionTooltipState | null) => void,
  getValidationDescribedBy: () => string | undefined
): ReturnType<typeof EditorView.updateListener.of> {
  return EditorView.updateListener.of((update) => {
    if (!update.selectionSet && !update.docChanged) return;

    const content = update.view.dom.querySelector('.cm-content');
    const pos = update.state.selection.main.head;
    const match = findVariableAtPos(update.state.doc, pos);

    if (!match) {
      onTooltipChange(null);
      setContentDescribedBy(content, getValidationDescribedBy);
      return;
    }

    const coords = update.view.coordsAtPos(match.start);
    if (!coords) {
      onTooltipChange(null);
      setContentDescribedBy(content, getValidationDescribedBy);
      return;
    }

    onTooltipChange({
      key: match.key,
      top: coords.top,
      left: coords.left + (coords.right - coords.left) / 2
    });
    setContentDescribedBy(content, getValidationDescribedBy, tooltipId);
  });
}

/**
 * Dismisses the keyboard tooltip when Escape is pressed.
 *
 * @param isOpen - Returns whether the keyboard tooltip is currently visible.
 * @param onDismiss - Called to hide the keyboard tooltip.
 * @param getValidationDescribedBy - Returns validation/helper ids from editor props.
 */
function variableTooltipEscapeHandler(
  isOpen: () => boolean,
  onDismiss: (view: EditorView) => void,
  getValidationDescribedBy: () => string | undefined
): ReturnType<typeof EditorView.domEventHandlers> {
  return EditorView.domEventHandlers({
    keydown(event, view) {
      if (event.key === 'Escape' && isOpen()) {
        event.preventDefault();
        onDismiss(view);
        setContentDescribedBy(view.dom.querySelector('.cm-content'), getValidationDescribedBy);
        return true;
      }
      return false;
    }
  });
}

/**
 * Builds a hover tooltip extension for {{variable}} tokens.
 *
 * @param getVariables - Returns the current collection-scoped variables.
 * @param getOnEditVariable - Returns the optional edit callback.
 */
function variableTooltip(
  getVariables: () => Variable[],
  getOnEditVariable: () => (() => void) | undefined
): ReturnType<typeof hoverTooltip> {
  return hoverTooltip((view, pos) => {
    const match = findVariableAtPos(view.state.doc, pos);
    if (!match) return null;

    return {
      pos: match.start,
      end: match.end,
      above: true,
      create() {
        return {
          dom: buildVariableTooltipDom(match.key, getVariables(), getOnEditVariable())
        };
      }
    };
  });
}

/** Size of the native resize-y grip hit target in the bottom-right corner. */
const RESIZE_GRIP_PX = 16;

/**
 * CodeMirror wrapper for editable request bodies and read-only response views.
 *
 * Styling relies on host CSS variables (`--mac-*`, `--font-mono`) and the `.app-no-drag`
 * class defined in HarborClient `styles.css`.
 */
export function CodeEditor({
  value,
  onChange,
  language = 'text',
  readOnly = false,
  editable,
  placeholder,
  placeholderHighlight = false,
  minHeight = '144px',
  height,
  onHeightChange,
  initialScrollTop,
  initialSelection,
  onViewStateChange,
  className = '',
  variables,
  onEditVariable,
  completionSource,
  slashCommands,
  onSlashCommand,
  themeOverride,
  setupOverride,
  fontSize,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy
}: Props): JSX.Element {
  const config = useCodeEditorConfig();
  const resolvedTheme = themeOverride ?? config.theme;
  const resolvedSetup = setupOverride ?? (readOnly ? null : config.setup);
  const resolvedFontSize = normalizeCodeEditorFontSize(fontSize ?? config.fontSize);
  const resolvedEditable = editable ?? !readOnly;
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [selectionTooltip, setSelectionTooltip] = useState<SelectionTooltipState | null>(null);
  const selectionTooltipRef = useRef(selectionTooltip);
  selectionTooltipRef.current = selectionTooltip;
  const setSelectionTooltipRef = useRef(setSelectionTooltip);
  setSelectionTooltipRef.current = setSelectionTooltip;
  const ariaDescribedByRef = useRef(ariaDescribedBy);
  ariaDescribedByRef.current = ariaDescribedBy;
  const onSlashCommandRef = useRef(onSlashCommand);
  onSlashCommandRef.current = onSlashCommand;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const completionSourceRef = useRef(completionSource);
  completionSourceRef.current = completionSource;
  const variablesRef = useRef(variables);
  variablesRef.current = variables;
  const onEditVariableRef = useRef(onEditVariable);
  onEditVariableRef.current = onEditVariable;
  const hasVariables = variables != null;
  const hasCompletionSource = completionSource != null;
  const tooltipId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onHeightChangeRef = useRef(onHeightChange);
  onHeightChangeRef.current = onHeightChange;
  const isUserResizingRef = useRef(false);
  const editorViewRef = useRef<EditorView | null>(null);
  const onViewStateChangeRef = useRef(onViewStateChange);
  onViewStateChangeRef.current = onViewStateChange;
  const initialScrollTopRef = useRef(initialScrollTop);
  initialScrollTopRef.current = initialScrollTop;
  const initialSelectionRef = useRef(initialSelection);
  initialSelectionRef.current = initialSelection;
  const viewStateDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollListenerCleanupRef = useRef<(() => void) | null>(null);
  const scheduleViewStateFlushRef = useRef<() => void>(() => undefined);
  const getValidationDescribedBy = (): string | undefined => ariaDescribedByRef.current;

  /**
   * Reads the current scroll and selection snapshot from an editor view.
   *
   * @param view - Live CodeMirror view.
   * @returns Rounded scroll offset and selection offsets.
   */
  const readViewState = useCallback((view: EditorView): CodeEditorViewState => {
    const selection = view.state.selection.main;
    return {
      scrollTop: Math.max(0, Math.round(view.scrollDOM.scrollTop)),
      selection: { anchor: selection.anchor, head: selection.head }
    };
  }, []);

  /**
   * Notifies the host of the latest scroll/selection snapshot.
   */
  const flushViewState = useCallback((): void => {
    const view = editorViewRef.current;
    if (!view || !onViewStateChangeRef.current) {
      return;
    }
    onViewStateChangeRef.current(readViewState(view));
  }, [readViewState]);

  /**
   * Debounces view-state persistence while the user scrolls or changes selection.
   */
  useEffect(() => {
    scheduleViewStateFlushRef.current = (): void => {
      if (viewStateDebounceRef.current) {
        clearTimeout(viewStateDebounceRef.current);
      }
      viewStateDebounceRef.current = setTimeout(() => {
        flushViewState();
      }, VIEW_STATE_DEBOUNCE_MS);
    };
  }, [flushViewState]);

  /**
   * Restores persisted scroll/selection and wires scroll tracking when the view is created.
   */
  const stableOnCreateEditor = useCallback((view: EditorView, _state: EditorState): void => {
    editorViewRef.current = view;

    const restoredSelection = initialSelectionRef.current;
    if (restoredSelection) {
      const clamped = clampSelection(view.state.doc.length, restoredSelection);
      view.dispatch({
        selection: { anchor: clamped.anchor, head: clamped.head }
      });
    }

    const restoredScrollTop = initialScrollTopRef.current;
    if (restoredScrollTop != null && Number.isFinite(restoredScrollTop) && restoredScrollTop >= 0) {
      view.scrollDOM.scrollTop = restoredScrollTop;
    }

    /**
     * Schedules persistence when the user scrolls the editor content.
     */
    const handleScroll = (): void => {
      scheduleViewStateFlushRef.current();
    };

    view.scrollDOM.addEventListener('scroll', handleScroll, { passive: true });
    scrollListenerCleanupRef.current = (): void => {
      view.scrollDOM.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /**
   * Flushes scroll/selection on unmount so collapsed script rows retain view state.
   */
  useEffect(() => {
    return () => {
      if (viewStateDebounceRef.current) {
        clearTimeout(viewStateDebounceRef.current);
      }
      scrollListenerCleanupRef.current?.();
      scrollListenerCleanupRef.current = null;
      flushViewState();
      editorViewRef.current = null;
    };
  }, [flushViewState]);

  /**
   * Persists wrapper height only after the user finishes a native resize-y drag on the grip.
   * Ignores mount and layout settling so height props do not reconfigure CodeMirror in a loop.
   */
  useEffect(() => {
    if (!onHeightChange) {
      return;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    /**
     * Marks resize drags that begin on the native bottom-right grip.
     *
     * @param event - Pointer down on the editor wrapper.
     */
    const handlePointerDown = (event: PointerEvent): void => {
      const rect = wrapper.getBoundingClientRect();
      const onGrip =
        event.clientX >= rect.right - RESIZE_GRIP_PX &&
        event.clientY >= rect.bottom - RESIZE_GRIP_PX;
      if (onGrip) {
        isUserResizingRef.current = true;
      }
    };

    /**
     * Reports the final wrapper height after a completed user resize drag.
     */
    const handlePointerUp = (): void => {
      if (!isUserResizingRef.current) {
        return;
      }
      isUserResizingRef.current = false;
      const nextHeight = Math.round(wrapper.getBoundingClientRect().height);
      onHeightChangeRef.current?.(nextHeight);
    };

    wrapper.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      wrapper.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [onHeightChange]);

  /**
   * Whether to render a muted syntax-highlighted ghost layer instead of plain placeholder text.
   */
  const useHighlightedPlaceholder = Boolean(
    placeholderHighlight && placeholder && language === 'javascript'
  );

  /**
   * Stable onChange wrapper so @uiw/react-codemirror does not reconfigure on every parent render.
   */
  const stableOnChange = useCallback((nextValue: string): void => {
    onChangeRef.current?.(nextValue);
  }, []);

  /**
   * Stable completion delegator reading the latest host source from a ref.
   */
  const stableCompletionSource = useMemo<CompletionSource>(
    () => (context) => completionSourceRef.current?.(context) ?? null,
    []
  );

  /**
   * Stable variable accessors for tooltip extensions.
   */
  const getVariables = useCallback((): Variable[] => variablesRef.current ?? [], []);
  const getOnEditVariable = useCallback(
    (): (() => void) | undefined => onEditVariableRef.current,
    []
  );

  /**
   * Memoized editor chrome theme keyed by font size only.
   */
  const editorThemeExt = useMemo(() => createEditorTheme(resolvedFontSize), [resolvedFontSize]);

  /**
   * Tracks system dark mode so syntax highlighting matches the active theme.
   */
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (): void => setIsDark(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  /**
   * Stable selection listener that debounces view-state persistence.
   */
  const viewStateSelectionListener = useMemo(
    () =>
      EditorView.updateListener.of((update) => {
        if (!onViewStateChangeRef.current || !update.selectionSet) {
          return;
        }
        scheduleViewStateFlushRef.current();
      }),
    []
  );

  /**
   * Assembles CodeMirror extensions for language mode, theme, and optional variable tooling.
   */
  const extensions = useMemo(() => {
    const next = [EditorView.lineWrapping, editorThemeExt];
    if (onViewStateChange != null) {
      next.push(viewStateSelectionListener);
    }
    const themeExtension = getCodeEditorThemeExtension(resolvedTheme);
    if (themeExtension) {
      next.push(themeExtension);
    } else {
      next.push(createBuiltInSyntaxHighlighting(isDark));
    }
    if (language === 'json') {
      next.push(json());
    }
    if (language === 'javascript') {
      next.push(javascript());
      // Register the slash Enter handler before autocompletion so that, at equal
      // Prec.highest precedence, this handler wins the tie and fires before the
      // completion keymap's Enter->accept binding.
      if (slashCommands && slashCommands.length > 0) {
        next.push(
          slashCommandEnterHandler(slashCommands, (trigger) => {
            onSlashCommandRef.current?.(trigger);
          })
        );
      }
      const completionOverrides: CompletionSource[] = [];
      if (slashCommands && slashCommands.length > 0) {
        completionOverrides.push(createSlashCommandCompletionSource(slashCommands));
      }
      if (hasCompletionSource) {
        completionOverrides.push(stableCompletionSource);
      }
      if (completionOverrides.length > 0) {
        next.push(
          autocompletion({
            activateOnTyping: true,
            override: completionOverrides
          })
        );
      }
      if (slashCommands && slashCommands.length > 0) {
        next.push(createSlashCommandHighlighter(slashCommands));
      }
    }
    if (language === 'shell') {
      next.push(StreamLanguage.define(shell));
    }
    if (hasVariables) {
      next.push(
        variableHighlighter,
        variableTooltip(getVariables, getOnEditVariable),
        variableSelectionTooltip(
          tooltipId,
          (state) => {
            setSelectionTooltipRef.current(state);
          },
          getValidationDescribedBy
        ),
        variableTooltipEscapeHandler(
          () => selectionTooltipRef.current != null,
          () => {
            setSelectionTooltipRef.current(null);
          },
          getValidationDescribedBy
        )
      );
    }
    const contentAttrs: Record<string, string> = {};
    if (id) contentAttrs.id = id;
    if (ariaLabel) contentAttrs['aria-label'] = ariaLabel;
    if (ariaLabelledBy) contentAttrs['aria-labelledby'] = ariaLabelledBy;
    if (ariaInvalid != null) contentAttrs['aria-invalid'] = String(ariaInvalid);
    if (ariaDescribedBy) contentAttrs['aria-describedby'] = ariaDescribedBy;
    if (Object.keys(contentAttrs).length > 0) {
      next.push(EditorView.contentAttributes.of(contentAttrs));
    }
    if (useHighlightedPlaceholder && placeholder) {
      next.push(
        ...createSyntaxHighlightedPlaceholder(placeholder, {
          fontSize: resolvedFontSize,
          isDark,
          theme: resolvedTheme,
          slashCommands
        })
      );
    }
    return next;
  }, [
    editorThemeExt,
    resolvedTheme,
    isDark,
    language,
    hasVariables,
    hasCompletionSource,
    stableCompletionSource,
    getVariables,
    getOnEditVariable,
    slashCommands,
    useHighlightedPlaceholder,
    placeholder,
    resolvedFontSize,
    id,
    ariaLabel,
    ariaLabelledBy,
    ariaInvalid,
    ariaDescribedBy,
    tooltipId,
    onViewStateChange,
    viewStateSelectionListener
  ]);

  /**
   * Resolves CodeMirror basicSetup from persisted settings or read-only defaults.
   */
  const basicSetup = useMemo(() => {
    if (!resolvedSetup) {
      return {
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        highlightSelectionMatches: false,
        autocompletion: false,
        closeBrackets: false,
        indentOnInput: false
      };
    }

    if (readOnly) {
      return {
        lineNumbers: resolvedSetup.lineNumbers,
        foldGutter: resolvedSetup.foldGutter,
        highlightActiveLine: resolvedSetup.highlightActiveLine,
        highlightActiveLineGutter: resolvedSetup.highlightActiveLineGutter,
        highlightSelectionMatches: false,
        autocompletion: false,
        closeBrackets: false,
        indentOnInput: false
      };
    }

    // Disable the built-in autocompletion and completion keymap: this component
    // installs its own autocompletion() for JavaScript editors, ordered after the
    // slash-command Enter handler. Leaving basicSetup's autocompletion enabled would
    // inject a competing Prec.highest Enter->acceptCompletion binding ahead of ours,
    // swallowing the first Enter on a /ask line.
    return {
      lineNumbers: resolvedSetup.lineNumbers,
      foldGutter: resolvedSetup.foldGutter,
      highlightActiveLine: resolvedSetup.highlightActiveLine,
      highlightActiveLineGutter: resolvedSetup.highlightActiveLineGutter,
      highlightSelectionMatches: false,
      autocompletion: false,
      completionKeymap: false
    };
  }, [resolvedSetup, readOnly]);

  const wrapperClassName = readOnly
    ? `hc-code-editor overflow-hidden rounded-lg bg-control shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.06)] app-no-drag ${className}`
    : `hc-code-editor min-h-36 resize-y overflow-hidden rounded-lg border border-separator bg-control shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.06)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--mac-accent)_35%,transparent),inset_0_0.5px_1px_rgba(0,0,0,0.06)] app-no-drag ${className}`;

  const selectionTooltipContent = selectionTooltip
    ? getVariableTooltipContent(selectionTooltip.key, variables ?? [])
    : null;

  const wrapperStyle = height ? { height } : undefined;
  const shouldTrackViewState =
    onViewStateChange != null || initialScrollTop != null || initialSelection != null;

  return (
    <div ref={wrapperRef} className={wrapperClassName} style={wrapperStyle}>
      {createElement(CodeMirrorImport, {
        value,
        onChange: readOnly ? undefined : stableOnChange,
        extensions,
        theme: 'none',
        editable: resolvedEditable,
        readOnly,
        placeholder: useHighlightedPlaceholder ? undefined : placeholder,
        minHeight,
        ...(height ? { height: '100%' } : {}),
        basicSetup,
        ...(shouldTrackViewState ? { onCreateEditor: stableOnCreateEditor } : {})
      })}
      {selectionTooltip && selectionTooltipContent && variables ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="hc-code-editor-tooltip pointer-events-auto fixed z-50 flex max-w-sm -translate-x-1/2 -translate-y-full flex-col gap-1.5 rounded-lg border border-separator bg-surface px-3 py-2 text-[14px] text-text shadow-md app-no-drag"
          style={{ top: selectionTooltip.top - 4, left: selectionTooltip.left }}
        >
          <span
            className={
              selectionTooltipContent.muted
                ? 'hc-code-editor-tooltip-text text-muted'
                : 'hc-code-editor-tooltip-text'
            }
          >
            {selectionTooltipContent.text}
          </span>
          {onEditVariable ? (
            <button
              type="button"
              className="hc-code-editor-tooltip-edit self-start text-[14px] text-accent hover:underline"
              aria-label={`Edit value for ${selectionTooltip.key}`}
              onMouseDown={(event) => {
                event.preventDefault();
                onEditVariable();
                setSelectionTooltip(null);
              }}
            >
              Edit value
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
