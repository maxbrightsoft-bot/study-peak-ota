import { parsePusherPayload, readExtraDuration } from '../parsePusherPayload';

describe('readExtraDuration', () => {
  it('reads Duration from a JSON string', () => {
    expect(readExtraDuration('{"Duration":"00:06:00"}')).toBe('00:06:00');
  });

  it('reads Duration from an object', () => {
    expect(readExtraDuration({ Duration: '00:06:00' })).toBe('00:06:00');
  });

  it('accepts camelCase duration', () => {
    expect(readExtraDuration({ duration: '00:10:00' })).toBe('00:10:00');
  });

  it('returns undefined for invalid JSON', () => {
    expect(readExtraDuration('not json')).toBeUndefined();
  });

  it('returns undefined when Duration is missing', () => {
    expect(readExtraDuration('{"Other":1}')).toBeUndefined();
    expect(readExtraDuration({ Duration: '' })).toBeUndefined();
    expect(readExtraDuration(undefined)).toBeUndefined();
  });
});

describe('parsePusherPayload', () => {
  it('parses strings, passes objects, rejects others', () => {
    expect(parsePusherPayload<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
    expect(parsePusherPayload({ a: 1 })).toEqual({ a: 1 });
    expect(parsePusherPayload(5)).toBeUndefined();
    expect(parsePusherPayload(null)).toBeUndefined();
  });
});
