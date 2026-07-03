import type { Extension } from '@codemirror/state';
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
  type DecorationSet,
  type ViewUpdate
} from '@codemirror/view';
import {
  renderHighlightedPlaceholderDom,
  type RenderHighlightedPlaceholderOptions
} from './renderHighlightedPlaceholder.js';

/**
 * Options for building a muted syntax-highlighted placeholder layer.
 */
export type SyntaxHighlightedPlaceholderOptions = RenderHighlightedPlaceholderOptions;

/**
 * Flat, pre-highlighted placeholder markup inserted when the parent editor is empty.
 */
class SyntaxHighlightedPlaceholderWidget extends WidgetType {
  /**
   * @param text - Placeholder document shown when the parent editor is empty.
   * @param options - Highlighting and theme options shared with the parent editor.
   */
  constructor(
    private readonly text: string,
    private readonly options: SyntaxHighlightedPlaceholderOptions
  ) {
    super();
  }

  /**
   * Returns statically rendered placeholder DOM without nested editor chrome.
   */
  toDOM(): HTMLElement {
    return renderHighlightedPlaceholderDom(this.text, this.options);
  }

  /**
   * Prevents the placeholder layer from intercepting pointer events meant for the parent editor.
   */
  ignoreEvent(): boolean {
    return true;
  }
}

/**
 * Returns whether the syntax-highlighted placeholder should be visible.
 *
 * @param view - Parent CodeMirror editor view.
 */
function shouldShowSyntaxPlaceholder(view: EditorView): boolean {
  return view.state.doc.length === 0 && !view.hasFocus;
}

/**
 * Builds widget decorations for the muted placeholder layer.
 *
 * @param text - Placeholder source shown until focus or input.
 * @param options - Highlighting and theme options.
 */
function buildSyntaxPlaceholderDecorations(
  text: string,
  options: SyntaxHighlightedPlaceholderOptions
): DecorationSet {
  return Decoration.set([
    Decoration.widget({
      widget: new SyntaxHighlightedPlaceholderWidget(text, options),
      side: 1
    }).range(0)
  ]);
}

/**
 * Returns CodeMirror extensions that show muted syntax-highlighted placeholder content
 * when the editor document is empty and unfocused.
 *
 * @param text - Placeholder source shown until the user focuses or types.
 * @param options - Highlighting and theme options shared with the parent editor.
 */
export function createSyntaxHighlightedPlaceholder(
  text: string,
  options: SyntaxHighlightedPlaceholderOptions
): Extension[] {
  const plugin = ViewPlugin.fromClass(
    class {
      placeholder: DecorationSet;

      /**
       * Initializes placeholder decorations for an empty, unfocused document.
       *
       * @param view - Parent CodeMirror editor view.
       */
      constructor(view: EditorView) {
        this.placeholder = shouldShowSyntaxPlaceholder(view)
          ? buildSyntaxPlaceholderDecorations(text, options)
          : Decoration.none;
      }

      /**
       * Shows or hides the placeholder when the document, focus, or content changes.
       *
       * @param update - Parent view update.
       */
      update(update: ViewUpdate): void {
        if (!update.docChanged && !update.focusChanged) {
          return;
        }

        this.placeholder = shouldShowSyntaxPlaceholder(update.view)
          ? buildSyntaxPlaceholderDecorations(text, options)
          : Decoration.none;
      }

      get decorations(): DecorationSet {
        return this.placeholder;
      }
    },
    { decorations: (v) => v.decorations }
  );

  return [
    plugin,
    EditorView.contentAttributes.of({ 'aria-placeholder': text }),
    EditorView.theme({
      '.cm-content:has(.cm-syntax-placeholder) .cm-activeLine': {
        backgroundColor: 'transparent !important'
      }
    })
  ];
}
