/**
 * Ambient globals for HarborClient request/post-request script snippets.
 *
 * Keep in sync with the runtime hc sandbox in harborclient
 * `src/main/scripting/scriptApi.ts` and editor completions in
 * `src/renderer/src/scripting/hcCompletions.ts`.
 */

/**
 * Header helpers on hc.request.headers and hc.collection.headers.
 */
interface HcHeaderApi {
  /**
   * Returns the first enabled header value for key (case-insensitive), or undefined.
   */
  get(key: string): string | undefined;

  /**
   * Sets an existing header or appends a new enabled row.
   */
  upsert(key: string, value: string): void;

  /**
   * Returns enabled headers as a flat key/value map.
   */
  toObject(): Record<string, string>;
}

/**
 * Variable helpers on hc.variables, hc.collection.variables, hc.environment.variables, and hc.globals.
 */
interface HcVariablesApi {
  /**
   * Returns a variable value, preferring values set in the current script run.
   */
  get(key: string): string | undefined;

  /**
   * Sets a variable for the remainder of the script run.
   */
  set(key: string, value: unknown): void;

  /**
   * Replaces {{variable}} tokens and dynamic $ tokens in a template string.
   */
  replaceIn(template: unknown): string;
}

/**
 * Chai-lite matcher returned by hc.expect(actual).
 */
interface HcExpectMatcher {
  to: {
    equal(expected: unknown): void;
    eql(expected: unknown): void;
    include(substr: string): void;
  };
  be: {
    ok(): void;
  };
}

/**
 * Element surface exposed by hc.response.document() for HTML bodies.
 */
interface HcResponseElement {
  textContent: string;
  getAttribute(name: string): string | null;
  innerHTML: string;
}

/**
 * Document surface backed by Cheerio for querying HTML response bodies.
 */
interface HcResponseDocument {
  querySelector(selector: string): HcResponseElement | null;
  querySelectorAll(selector: string): HcResponseElement[];
}

/**
 * Response snapshot available in post-request scripts as hc.response.
 */
interface HcResponseApi {
  readonly code: number;
  readonly status: string;
  readonly headers: Record<string, string>;
  readonly responseTime: number;
  text(): string;
  json(): unknown;
  document(): HcResponseDocument;
}

/**
 * HarborClient script sandbox API exposed as the global hc object.
 */
interface HcScriptApi {
  request: {
    method: string;
    url: string;
    body: string;
    headers: HcHeaderApi;
  };
  variables: HcVariablesApi;
  collection: {
    readonly id: number | null;
    readonly name: string;
    variables: HcVariablesApi;
    headers: HcHeaderApi;
  };
  environment: {
    readonly name: string;
    variables: HcVariablesApi;
  };
  globals: HcVariablesApi;
  test(name: string, fn: () => void): void;
  expect(actual: unknown): HcExpectMatcher;
  response: HcResponseApi;
}

/**
 * HarborClient script sandbox API for pre/post request scripts and snippet files.
 */
declare const hc: HcScriptApi;

/**
 * Capturing console available inside request/post-request script sandboxes.
 */
declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
};
