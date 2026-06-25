/**
 * Creates a new unique id string.
 *
 * Uses `crypto.randomUUID` when available (renderer); falls back for the SES main runtime.
 *
 * @param prefix - Optional prefix when falling back from randomUUID.
 */
export function randomId(prefix = 'id'): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Returns the UTF-8 byte length of a string without relying on TextEncoder.
 *
 * Safe in the SES plugin main runtime where only `hc`, `console`, `Date`, and `Math`
 * globals are available.
 *
 * @param value - String to measure.
 */
export function byteLength(value: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value).length;
  }
  let bytes = 0;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x7f) {
      bytes += 1;
    } else if (code <= 0x7ff) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      index += 1;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

/**
 * Truncates a string to a maximum UTF-8 byte length without TextEncoder.
 *
 * @param value - String to truncate.
 * @param maxBytes - Maximum UTF-8 bytes to retain.
 */
export function truncateToBytes(value: string, maxBytes: number): string {
  if (typeof TextEncoder !== 'undefined') {
    const encoded = new TextEncoder().encode(value);
    if (encoded.length <= maxBytes) {
      return value;
    }
    return new TextDecoder().decode(encoded.slice(0, maxBytes));
  }
  let bytes = 0;
  let index = 0;
  for (; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    let charBytes: number;
    if (code <= 0x7f) {
      charBytes = 1;
    } else if (code <= 0x7ff) {
      charBytes = 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      charBytes = 4;
    } else {
      charBytes = 3;
    }
    if (bytes + charBytes > maxBytes) {
      break;
    }
    bytes += charBytes;
    if (charBytes === 4) {
      index += 1;
    }
  }
  return value.slice(0, index);
}

/**
 * Truncates a body string to the configured byte limit with an optional suffix.
 *
 * @param body - Raw body text.
 * @param maxBytes - Maximum UTF-8 bytes to retain.
 * @param suffix - Optional suffix appended when truncated.
 */
export function truncateBody(
  body: string,
  maxBytes: number,
  suffix = `\n\n[truncated — body exceeded ${maxBytes} bytes]`
): { body: string; truncated: boolean } {
  if (byteLength(body) <= maxBytes) {
    return { body, truncated: false };
  }
  return {
    body: `${truncateToBytes(body, maxBytes)}${suffix}`,
    truncated: true
  };
}
