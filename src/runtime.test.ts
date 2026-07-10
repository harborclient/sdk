import { describe, expect, it, jest } from '@jest/globals';
import { defineTheme, registerImportHandler, registerTheme } from './runtime/index.js';
import type { PluginContext, ThemeContribution } from './types';

/**
 * Builds a minimal plugin context mock for registerTheme tests.
 */
function createMockPluginContext(): PluginContext & {
  registerMock: jest.MockedFunction<PluginContext['themes']['register']>;
} {
  const disposable = { dispose: jest.fn() };
  const registerMock = jest.fn(() => disposable);
  const subscriptions: PluginContext['subscriptions'] = [];

  return {
    subscriptions,
    themes: { register: registerMock },
    registerMock
  } as unknown as PluginContext & {
    registerMock: jest.MockedFunction<PluginContext['themes']['register']>;
  };
}

describe('registerImportHandler', () => {
  it('registers the handler, pushes the disposable onto subscriptions, and returns it', () => {
    const hc = createMockPluginContext();
    const handler = {
      canImport: () => true,
      import: async () => {}
    };
    const registerHandlerMock = jest.fn(() => ({
      dispose: jest.fn()
    })) as jest.MockedFunction<PluginContext['imports']['registerHandler']>;
    hc.imports = { registerHandler: registerHandlerMock };

    const disposable = registerImportHandler(hc, ['.json', '.yaml'], handler);

    expect(registerHandlerMock).toHaveBeenCalledWith(['.json', '.yaml'], handler);
    expect(hc.subscriptions).toHaveLength(1);
    expect(hc.subscriptions[0]).toBe(disposable);
  });
});

describe('registerTheme', () => {
  it('registers the theme, pushes the disposable onto subscriptions, and returns it', () => {
    const hc = createMockPluginContext();
    const theme: ThemeContribution = {
      id: 'solarized',
      title: 'Solarized Dark',
      type: 'dark',
      colors: { surface: '#002b36' }
    };

    const disposable = registerTheme(hc, theme);

    expect(hc.registerMock).toHaveBeenCalledWith(theme);
    expect(hc.subscriptions).toHaveLength(1);
    expect(hc.subscriptions[0]).toBe(disposable);
  });
});

describe('defineTheme', () => {
  it('returns the theme argument unchanged', () => {
    const theme: ThemeContribution = {
      id: 'nord',
      title: 'Nord',
      type: 'dark',
      stylesheet: 'dist/theme.css'
    };

    expect(defineTheme(theme)).toBe(theme);
  });
});
