# Quick start

Install `@harborclient/plugin-api` first — see [Install](/install).

## Renderer entry

```tsx
import { installReact } from '@harborclient/plugin-api';
import type { PluginContext } from '@harborclient/plugin-api';

export function activate(hc: PluginContext): void {
  installReact(hc.react);

  hc.subscriptions.push(
    hc.http.onAfterSend(async (request, response) => {
      // react to completed requests without a main entry
    })
  );
}
```

Do not bundle `react` / `react-dom` in your plugin bundle. For JSX setup, esbuild flags, and hook imports, see [React and JSX](/renderer-overview#react-and-jsx).

## Main entry

Main entries run in the SES utilityProcess for HTTP hooks and custom IPC — not for React UI. Import `MainPluginContext` from `@harborclient/plugin-api/main`:

```typescript
import type { MainPluginContext } from '@harborclient/plugin-api/main';

export function activate(hc: MainPluginContext): void {
  hc.subscriptions.push(
    hc.http.onBeforeSend((request) => {
      request.headers['X-Trace'] = '1';
    })
  );
}
```

See [Main API](/main-api) for HTTP hooks and IPC, and [Building](/building) to package your plugin as `.hcp`.

## Utility imports

Shared helpers ship as subpath exports (requires `@harborclient/plugin-api` **0.3.1+**):

```typescript
import { resolveRequest } from '@harborclient/plugin-api/http';
import { methodColorClass, formatRelativeTime } from '@harborclient/plugin-api/ui';
import { mergeById, createCappedList } from '@harborclient/plugin-api/storage';
import { copyToClipboard } from '@harborclient/plugin-api/clipboard';
import { randomId, truncateBody } from '@harborclient/plugin-api/runtime-utils';
import { createExternalStore } from '@harborclient/plugin-api/store';
```
