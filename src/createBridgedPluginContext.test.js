import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const bridgeInvoke = jest.fn(async () => undefined);
const bridgeOn = jest.fn(() => () => {});

jest.unstable_mockModule('./runtime/hcBridge.js', () => ({
  bridgeInvoke,
  bridgeOn
}));

jest.unstable_mockModule('./runtime/reactHost.js', () => ({
  setHostReact: jest.fn()
}));

jest.unstable_mockModule('./runtime/contributionRegistry.js', () => ({
  getContributionComponent: jest.fn(),
  getContributionHeaderActions: jest.fn(),
  registerContributionComponent: jest.fn(),
  registerContributionHeaderActions: jest.fn()
}));

jest.unstable_mockModule('./runtime/pluginDatabaseApi.js', () => ({
  createPluginDatabaseApi: jest.fn(() => ({}))
}));

const { createBridgedPluginContext, installImportInvokeListener, resetImportHandlersForTests } =
  await import('./runtime/createBridgedPluginContext.js');

/**
 * Builds a minimal manifest for bridged context tests.
 *
 * @returns {Record<string, unknown>} Plugin manifest.
 */
function createManifest(permissions = ['ui']) {
  return {
    id: 'com.example.test',
    permissions
  };
}

beforeEach(() => {
  bridgeInvoke.mockClear();
  bridgeOn.mockClear();
  resetImportHandlersForTests();
});

describe('createBridgedPluginContext imports', () => {
  it('exposes imports.registerHandler in agent mode and forwards registration to the broker', () => {
    const hc = createBridgedPluginContext({
      pluginId: 'com.example.test',
      mode: 'agent',
      react: {},
      manifest: createManifest()
    });

    expect(hc.imports).toBeDefined();

    const handler = {
      canImport: () => true,
      import: async () => {}
    };
    const disposable = hc.imports.registerHandler(['.yaml', 'json'], handler);

    expect(bridgeInvoke).toHaveBeenCalledWith('imports.registerHandler', {
      registrationId: '1',
      extensions: ['.yaml', '.json']
    });

    disposable.dispose();
    expect(bridgeInvoke).toHaveBeenCalledWith('imports.unregisterHandler', {
      registrationId: '1'
    });
  });

  it('returns a no-op disposable for imports.registerHandler in view mode', () => {
    const hc = createBridgedPluginContext({
      pluginId: 'com.example.test',
      mode: 'view',
      contributionId: 'panel',
      react: {},
      manifest: createManifest()
    });

    const disposable = hc.imports.registerHandler('.json', {
      canImport: () => true,
      import: async () => {}
    });

    expect(bridgeInvoke).not.toHaveBeenCalled();
    expect(() => disposable.dispose()).not.toThrow();
  });
});

describe('installImportInvokeListener', () => {
  it('runs canImport and import handlers and reports results to the broker', async () => {
    const hc = createBridgedPluginContext({
      pluginId: 'com.example.test',
      mode: 'agent',
      react: {},
      manifest: createManifest()
    });

    const canImport = jest.fn(() => true);
    const importFn = jest.fn(async () => {});
    hc.imports.registerHandler('.yaml', { canImport, import: importFn });

    /** @type {(payload: unknown) => void | Promise<void>} */
    let invokeListener;
    bridgeOn.mockImplementation((channel, listener) => {
      if (channel === 'imports.invoke') {
        invokeListener = listener;
      }
      return () => {};
    });

    installImportInvokeListener();

    const file = {
      name: 'petstore.yaml',
      path: '/tmp/petstore.yaml',
      extension: '.yaml',
      contents: 'openapi: 3.0.3'
    };

    await invokeListener?.({
      requestId: 7,
      registrationId: '1',
      phase: 'canImport',
      file
    });

    expect(canImport).toHaveBeenCalledWith(file);
    expect(bridgeInvoke).toHaveBeenCalledWith('imports.invokeComplete', {
      requestId: 7,
      ok: true,
      result: true
    });

    await invokeListener?.({
      requestId: 8,
      registrationId: '1',
      phase: 'import',
      file
    });

    expect(importFn).toHaveBeenCalledWith(file);
    expect(bridgeInvoke).toHaveBeenCalledWith('imports.invokeComplete', {
      requestId: 8,
      ok: true,
      result: undefined
    });
  });
});

describe('createBridgedPluginContext mcp', () => {
  it('forwards MCP server registration to the broker in agent mode', () => {
    const hc = createBridgedPluginContext({
      pluginId: 'com.example.test',
      mode: 'agent',
      react: {},
      manifest: createManifest(['mcp'])
    });

    const disposable = hc.mcp.registerServer({
      name: 'WordPress',
      serverURL: 'https://public-api.wordpress.com/wpcom/v2/mcp/v1/',
      enabled: true,
      headers: [{ key: 'Authorization', value: 'token' }]
    });

    expect(bridgeInvoke).toHaveBeenCalledWith('mcp.registerServer', {
      registrationId: '1',
      name: 'WordPress',
      serverURL: 'https://public-api.wordpress.com/wpcom/v2/mcp/v1',
      enabled: true,
      headers: [{ key: 'Authorization', value: 'token' }],
      icon: undefined
    });

    disposable.dispose();
    expect(bridgeInvoke).toHaveBeenCalledWith('mcp.unregisterServer', {
      registrationId: '1'
    });
  });

  it('returns a no-op disposable for MCP registration in view mode', () => {
    const hc = createBridgedPluginContext({
      pluginId: 'com.example.test',
      mode: 'view',
      contributionId: 'panel',
      react: {},
      manifest: createManifest(['mcp'])
    });

    const disposable = hc.mcp.registerServer({
      name: 'WordPress',
      serverURL: 'https://example.com/mcp'
    });

    expect(bridgeInvoke).not.toHaveBeenCalled();
    expect(() => disposable.dispose()).not.toThrow();
  });

  it('throws when the plugin lacks the mcp permission', () => {
    const hc = createBridgedPluginContext({
      pluginId: 'com.example.test',
      mode: 'agent',
      react: {},
      manifest: createManifest(['ui'])
    });

    expect(() =>
      hc.mcp.registerServer({
        name: 'WordPress',
        serverURL: 'https://example.com/mcp'
      })
    ).toThrow('lacks permission: mcp');
  });
});
