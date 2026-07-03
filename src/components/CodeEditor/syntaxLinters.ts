import { jsonParseLinter } from '@codemirror/lang-json';
import { syntaxTree } from '@codemirror/language';
import { linter, type Diagnostic } from '@codemirror/lint';
import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

/**
 * Collects Lezer parse-tree error nodes as CodeMirror diagnostics.
 *
 * @param view - CodeMirror editor view instance.
 */
function collectJavascriptSyntaxErrors(view: EditorView): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  syntaxTree(view.state)
    .cursor()
    .iterate((node) => {
      if (node.type.isError) {
        diagnostics.push({
          from: node.from,
          to: node.to,
          severity: 'error',
          message: 'Syntax error'
        });
      }
    });
  return diagnostics;
}

/**
 * Returns a lint extension that underlines JavaScript syntax errors.
 */
export function createJavascriptSyntaxLinter(): Extension {
  return linter(collectJavascriptSyntaxErrors);
}

/**
 * Returns a lint extension that underlines JSON parse errors.
 */
export function createJsonSyntaxLinter(): Extension {
  return linter(jsonParseLinter());
}
