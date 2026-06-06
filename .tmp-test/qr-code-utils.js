"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQRCodeValue = exports.decodeSharedPayload = exports.hasBlockedJavaScript = exports.UNSAFE_JS_ERROR = exports.BLOCKED_JS_ERROR = exports.DEFAULT_INPUT = void 0;
const js_base64_1 = require("js-base64");
exports.DEFAULT_INPUT = 'return new Date().toLocaleTimeString();';
exports.BLOCKED_JS_ERROR = 'Error: Network access is disabled in script mode';
exports.UNSAFE_JS_ERROR = 'Error: Unsafe JS is blocked';
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
const hasBlockedJavaScript = (content) => {
    return BLOCKED_JS_PATTERNS.some((pattern) => pattern.test(content));
};
exports.hasBlockedJavaScript = hasBlockedJavaScript;
const decodeSharedPayload = (encodedPayload) => {
    const decodedData = js_base64_1.Base64.decode(encodedPayload);
    const parsedPayload = JSON.parse(decodedData);
    if (typeof parsedPayload !== 'object' ||
        parsedPayload === null ||
        typeof parsedPayload.content !== 'string') {
        throw new Error('Invalid shared payload');
    }
    return {
        content: parsedPayload.content,
        isJs: Boolean(parsedPayload.isJs),
    };
};
exports.decodeSharedPayload = decodeSharedPayload;
const buildQRCodeValue = (content, useJavaScript) => {
    if (!useJavaScript) {
        return content;
    }
    if ((0, exports.hasBlockedJavaScript)(content)) {
        return content.match(/fetch|XMLHttpRequest|WebSocket|EventSource|navigator|sendBeacon|import|require/i)
            ? exports.BLOCKED_JS_ERROR
            : exports.UNSAFE_JS_ERROR;
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
      ${content}
    `);
        return String(executeUserCode());
    }
    catch {
        return 'Error: Invalid JS';
    }
};
exports.buildQRCodeValue = buildQRCodeValue;
