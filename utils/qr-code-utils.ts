import { Base64 } from 'js-base64';

export type SharedPayload = {
  content: string;
  isJs: boolean;
};

export const DEFAULT_INPUT = 'return new Date().toLocaleTimeString();';
export const BLOCKED_JS_ERROR = 'Error: Network access is disabled in script mode';
export const UNSAFE_JS_ERROR = 'Error: Unsafe JS is blocked';

const normalizeJavaScriptInput = (content: string) => {
  return content
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
};

const BLOCKED_JS_PATTERNS = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bEventSource\b/,
  /\bnavigator\s*\./,
  /\bsendBeacon\s*\(/,
  /\bimport\s*\(/,
  /\brequire\s*\(/,
  /\bFunction\b/,
  /\beval\s*\(/,
  /\bglobalThis\b/,
  /\bwindow\b/,
  /\bself\b/,
  /\bglobal\b/,
];

export const hasBlockedJavaScript = (content: string) => {
  return BLOCKED_JS_PATTERNS.some((pattern) => pattern.test(content));
};

export const decodeSharedPayload = (encodedPayload: string): SharedPayload => {
  const decodedData = Base64.decode(encodedPayload);
  const parsedPayload = JSON.parse(decodedData);

  if (
    typeof parsedPayload !== 'object' ||
    parsedPayload === null ||
    typeof parsedPayload.content !== 'string'
  ) {
    throw new Error('Invalid shared payload');
  }

  return {
    content: parsedPayload.content,
    isJs: Boolean(parsedPayload.isJs),
  };
};

export const buildQRCodeValue = (content: string, useJavaScript: boolean) => {
  if (!useJavaScript) {
    return content;
  }

  const normalizedContent = normalizeJavaScriptInput(content);

  if (hasBlockedJavaScript(normalizedContent)) {
    return normalizedContent.match(/fetch|XMLHttpRequest|WebSocket|EventSource|navigator|sendBeacon|import|require/i)
      ? BLOCKED_JS_ERROR
      : UNSAFE_JS_ERROR;
  }

  try {
    const executeUserCode = new Function(`
      'use strict';
      const fetch = undefined;
      const XMLHttpRequest = undefined;
      const WebSocket = undefined;
      const EventSource = undefined;
      const navigator = undefined;
      const sendBeacon = undefined;
      const importScripts = undefined;
      const require = undefined;
      const globalThis = undefined;
      const window = undefined;
      const self = undefined;
      const global = undefined;
      ${normalizedContent}
    `);

    return String(executeUserCode());
  } catch {
    return 'Error: Invalid JS';
  }
};
