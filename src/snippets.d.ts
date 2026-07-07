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
 * Variable bag helpers shared by hc.collection.variables, hc.environment.variables, and hc.globals.
 */
interface HcVariableBagApi {
  /**
   * Returns a variable value, preferring values set in the current script run.
   */
  get(key: string): string | undefined;

  /**
   * Sets a variable for the remainder of the script run.
   */
  set(key: string, value: unknown): void;

  /**
   * Removes a single key from this scope for the remainder of the script run.
   */
  clear(key: string): void;
}

/**
 * Request-scoped variable helpers on hc.request.variables.
 */
interface HcRequestVariablesApi extends HcVariableBagApi {
  /**
   * Replaces {{variable}} tokens and dynamic $ tokens in a template string.
   */
  replaceIn(template: unknown): string;
}

/**
 * Auth type selector for hc.request.auth and hc.collection.auth.
 */
type HcAuthType = 'none' | 'basic' | 'bearer' | 'oauth2';

/**
 * OAuth client credential transport for hc.*.auth when type is oauth2.
 */
type HcOAuth2ClientAuth = 'header' | 'body';

/**
 * Flat auth field names accepted by hc.*.auth.update().
 */
type HcAuthField =
  | 'type'
  | 'token'
  | 'username'
  | 'password'
  | 'tokenUrl'
  | 'clientId'
  | 'clientSecret'
  | 'scope'
  | 'audience'
  | 'clientAuth';

/**
 * Partial flat auth object accepted by hc.request.auth.set() and hc.collection.auth.set().
 *
 * Merges onto the current auth configuration; switching type preserves stored
 * credentials for other types.
 */
interface HcAuthInput {
  type?: HcAuthType;
  token?: string;
  username?: string;
  password?: string;
  tokenUrl?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
  audience?: string;
  clientAuth?: HcOAuth2ClientAuth;
}

/**
 * Flat auth shape returned by hc.request.auth.get() and hc.collection.auth.get().
 *
 * Includes only fields relevant to the active auth type.
 */
type HcAuthSnapshot =
  | { type: 'none' }
  | { type: 'basic'; username: string; password: string }
  | { type: 'bearer'; token: string }
  | {
      type: 'oauth2';
      tokenUrl: string;
      clientId: string;
      clientSecret: string;
      scope: string;
      audience: string;
      clientAuth: HcOAuth2ClientAuth;
    };

/**
 * Auth helpers on hc.request.auth and hc.collection.auth.
 *
 * Request auth changes apply to the current send only. Collection auth changes
 * persist to the collection when the send completes.
 */
interface HcAuthApi {
  /**
   * Returns the active auth fields as a flat object for the current auth type.
   */
  get(): HcAuthSnapshot;

  /**
   * Merges auth configuration from a partial flat auth object.
   */
  set(input: HcAuthInput): void;

  /**
   * Updates a single flat auth field, such as type or token.
   */
  update(field: HcAuthField, value: unknown): void;
}

/**
 * Cookie bag for the request host resolved at send start.
 * URL changes mid-script do not retarget this bag.
 */
interface HcCookieApi {
  /**
   * Returns a cookie value by name, preferring values set in the current script run.
   */
  get(name: string): string | undefined;

  /**
   * Sets a cookie for the request host for the remainder of the script run.
   */
  set(name: string, value: unknown): void;

  /**
   * Removes a single cookie by name for the remainder of the script run.
   */
  clear(name: string): void;
}

/**
 * Collection runner flow control available in pre/post scripts during a run.
 */
interface HcExecutionApi {
  /**
   * Jumps to the named request in the active collection run, or stops the run when null.
   */
  setNextRequest(name: string | null): void;

  /**
   * Skips the HTTP send and post-request scripts for the current request.
   */
  skipRequest(): void;
}

/**
 * Postman-compatible script execution metadata (pm.info equivalent).
 */
interface HcInfoApi {
  /** `"prerequest"` for pre-request scripts, `"test"` for post-request scripts. */
  readonly eventName: 'prerequest' | 'test';
  /** Display name of the saved request. */
  readonly requestName: string;
  /** Saved request database id as a string, or empty when unsaved. */
  readonly requestId: string;
  /** Collection run iteration index; 0 for manual sends and non-data-driven runs. */
  readonly iteration: number;
}

/**
 * Outbound request payload accepted by hc.sendRequest.
 */
interface HcSendRequestInput {
  method?: string;
  url: string;
  headers?: Array<{ key: string; value: string; enabled?: boolean }> | Record<string, string>;
  params?: Array<{ key: string; value: string; enabled?: boolean }>;
  body?: string;
  bodyType?: 'none' | 'json' | 'text' | 'multipart' | 'urlencoded';
  body_type?: 'none' | 'json' | 'text' | 'multipart' | 'urlencoded';
}

/**
 * Response snapshot returned by hc.sendRequest.
 */
interface HcSendRequestResponse {
  readonly code: number;
  readonly status: string;
  readonly headers: Record<string, string>;
  readonly responseTime: number;
  text(): string;
  json(): unknown;
}

/**
 * Chai-lite matcher returned by hc.expect(actual).
 */
interface HcExpectMatcher {
  to: {
    equal(expected: unknown): void;
    eql(expected: unknown): void;
    include(substr: string): void;
    be: {
      ok(): void;
    };
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
    auth: HcAuthApi;
    variables: HcRequestVariablesApi;
  };
  collection: {
    readonly id: number | null;
    readonly name: string;
    variables: HcVariableBagApi;
    headers: HcHeaderApi;
    auth: HcAuthApi;
  };
  environment: {
    readonly name: string;
    variables: HcVariableBagApi;
  };
  globals: HcVariableBagApi;
  cookies: HcCookieApi;
  execution: HcExecutionApi;
  /** Read-only metadata about the current script run (Postman pm.info equivalent). */
  info: HcInfoApi;
  /**
   * Sends an outbound HTTP request from the script sandbox.
   * Requires Settings → General → Allow script network requests.
   *
   * @throws When the setting is disabled or sendRequest is unavailable in this context.
   */
  sendRequest(req: HcSendRequestInput): Promise<HcSendRequestResponse>;
  test(name: string, fn: () => void): void;
  expect(actual: unknown): HcExpectMatcher;
  /**
   * Available in post-request scripts after the primary request completes.
   */
  response?: HcResponseApi;
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
