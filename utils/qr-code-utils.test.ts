import { Base64 } from 'js-base64';
import {
  BLOCKED_JS_ERROR,
  buildQRCodeValue,
  canStoreQRCodeContent,
  decodeSharedPayload,
  DEFAULT_INPUT,
  hasSingleReturnStatement,
  hasBlockedJavaScript,
  INVALID_JS_ERROR,
  SCRIPT_FORMAT_ERROR,
  UNSAFE_JS_ERROR,
} from './qr-code-utils';

describe('qr-code-utils', () => {
  it('returns plain text unchanged in text mode', () => {
    expect(buildQRCodeValue('hello world', false)).toBe('hello world');
  });

  it('executes the default JavaScript sample in script mode', () => {
    expect(buildQRCodeValue(DEFAULT_INPUT, true)).toEqual(expect.any(String));
    expect(buildQRCodeValue(DEFAULT_INPUT, true)).not.toMatch(/^Error:/);
  });

  it('supports boxed string results from script mode', () => {
    expect(buildQRCodeValue('return new String("xxx");', true)).toBe('xxx');
  });

  it('normalizes smart quotes from mobile keyboards in script mode', () => {
    expect(buildQRCodeValue('return new String(“xxx”);', true)).toBe('xxx');
  });

  it('requires script mode to be a single return statement ending with semicolon', () => {
    expect(hasSingleReturnStatement('return new Date().toLocaleTimeString();')).toBe(true);
    expect(hasSingleReturnStatement('return "a;b";')).toBe(true);
    expect(hasSingleReturnStatement('return new Date().toLocaleTimeString();new Date()')).toBe(false);
    expect(hasSingleReturnStatement('return new Date().toLocaleTimeString();new Date();')).toBe(false);
    expect(hasSingleReturnStatement('new Date();')).toBe(false);
    expect(hasSingleReturnStatement('return new Date()')).toBe(false);
  });

  it('rejects extra script text after a completed return statement', () => {
    expect(buildQRCodeValue('return new Date().toLocaleTimeString();new Date()', true)).toBe(
      SCRIPT_FORMAT_ERROR
    );
  });

  it('blocks network-related JavaScript access', () => {
    expect(hasBlockedJavaScript('return fetch("https://example.com")')).toBe(true);
    expect(buildQRCodeValue('return fetch("https://example.com");', true)).toBe(BLOCKED_JS_ERROR);
  });

  it('blocks unsafe escape hatches', () => {
    expect(buildQRCodeValue('return Function("return 1")();', true)).toBe(UNSAFE_JS_ERROR);
  });

  it('returns an invalid JS error for malformed code', () => {
    expect(buildQRCodeValue('return (;', true)).toBe(INVALID_JS_ERROR);
  });

  it('allows only valid non-empty QR content to be stored', () => {
    expect(canStoreQRCodeContent('Hello QR', false)).toBe(true);
    expect(canStoreQRCodeContent('return "Hello QR";', true)).toBe(true);
    expect(canStoreQRCodeContent('return "Hello QR";new Date();', true)).toBe(false);
    expect(canStoreQRCodeContent('return (;', true)).toBe(false);
    expect(canStoreQRCodeContent('return fetch("https://example.com");', true)).toBe(false);
    expect(canStoreQRCodeContent('   ', false)).toBe(false);
  });

  it('decodes a shared payload', () => {
    const encodedPayload = Base64.encode(
      JSON.stringify({
        content: 'hello from share',
        isJs: false,
      })
    );

    expect(decodeSharedPayload(encodedPayload)).toEqual({
      content: 'hello from share',
      isJs: false,
    });
  });

  it('rejects invalid shared payloads', () => {
    const encodedPayload = Base64.encode(JSON.stringify({ isJs: true }));

    expect(() => decodeSharedPayload(encodedPayload)).toThrow('Invalid shared payload');
  });
});
