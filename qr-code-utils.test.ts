import { Base64 } from 'js-base64';
import {
  BLOCKED_JS_ERROR,
  buildQRCodeValue,
  decodeSharedPayload,
  DEFAULT_INPUT,
  hasBlockedJavaScript,
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

  it('blocks network-related JavaScript access', () => {
    expect(hasBlockedJavaScript('return fetch("https://example.com")')).toBe(true);
    expect(buildQRCodeValue('return fetch("https://example.com")', true)).toBe(BLOCKED_JS_ERROR);
  });

  it('blocks unsafe escape hatches', () => {
    expect(buildQRCodeValue('return Function("return 1")()', true)).toBe(UNSAFE_JS_ERROR);
  });

  it('returns an invalid JS error for malformed code', () => {
    expect(buildQRCodeValue('return (', true)).toBe('Error: Invalid JS');
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