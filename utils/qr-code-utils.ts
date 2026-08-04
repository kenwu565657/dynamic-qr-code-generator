import { Base64 } from 'js-base64';

export type SharedPayload = {
  content: string;
  isJs: boolean;
};

export const DEFAULT_INPUT = 'return new Date().toLocaleTimeString();';
export const BLOCKED_JS_ERROR = 'Error: Network access is disabled in script mode';
export const UNSAFE_JS_ERROR = 'Error: Unsafe JS is blocked';
export const INVALID_JS_ERROR = 'Error: Invalid JS';
export const SCRIPT_FORMAT_ERROR = 'Error: Script must be a single return statement ending with ;';

const QR_CODE_ERROR_PREFIX = 'Error:';

export const isQRCodeErrorValue = (value: string) => value.startsWith(QR_CODE_ERROR_PREFIX);

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

export const hasSingleReturnStatement = (content: string) => {
  const trimmedContent = content.trim();

  if (!/^return\b/.test(trimmedContent) || !trimmedContent.endsWith(';')) {
    return false;
  }

  let quote: 'single' | 'double' | 'template' | null = null;
  let isEscaped = false;

  for (let index = 0; index < trimmedContent.length; index += 1) {
    const character = trimmedContent[index];

    if (quote) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (character === '\\') {
        isEscaped = true;
        continue;
      }

      if (
        (quote === 'single' && character === "'") ||
        (quote === 'double' && character === '"') ||
        (quote === 'template' && character === '`')
      ) {
        quote = null;
      }

      continue;
    }

    if (character === "'") {
      quote = 'single';
      continue;
    }

    if (character === '"') {
      quote = 'double';
      continue;
    }

    if (character === '`') {
      quote = 'template';
      continue;
    }

    if (character === ';') {
      return index === trimmedContent.length - 1;
    }
  }

  return false;
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

  if (!hasSingleReturnStatement(normalizedContent)) {
    return SCRIPT_FORMAT_ERROR;
  }

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
    return INVALID_JS_ERROR;
  }
};

export const canStoreQRCodeContent = (content: string, useJavaScript: boolean) => {
  if (!content.trim()) {
    return false;
  }

  if (!useJavaScript) {
    return true;
  }

  return !isQRCodeErrorValue(buildQRCodeValue(content, true));
};
