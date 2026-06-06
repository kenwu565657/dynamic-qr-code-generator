import {
  buildSavedItemLabel,
  buildSavedItemPreview,
  filterSavedItems,
  getEditorMeta,
  insertSnippetAtSelection,
  MAX_SAVED_QR_CODES,
  mergeSavedItems,
  sanitizeSavedItems,
  type SavedQRCode,
} from './app-helpers';

describe('app-helpers', () => {
  const savedItems: SavedQRCode[] = [
    {
      id: '1',
      name: 'Clock script',
      content: 'return new Date().toLocaleTimeString();',
      isJs: true,
      updatedAt: '2026-06-06T00:00:00.000Z',
    },
    {
      id: '2',
      name: '',
      content: 'Hello QR',
      isJs: false,
      updatedAt: '2026-06-06T00:01:00.000Z',
    },
  ];

  it('sanitizes saved items from unknown storage data', () => {
    const mixed = [savedItems[0], { foo: 'bar' }, savedItems[1], null];

    expect(sanitizeSavedItems(mixed)).toEqual(savedItems);
  });

  it('returns an empty array when storage data is invalid', () => {
    expect(sanitizeSavedItems({ not: 'an array' })).toEqual([]);
  });

  it('builds a readable saved item label', () => {
    expect(buildSavedItemLabel({ name: 'My QR', content: '  Hello\n  world  ' })).toBe('My QR');
  });

  it('falls back to truncated content when no name is present', () => {
    expect(
      buildSavedItemLabel({ name: '', content: 'abcdefghijklmnopqrstuvwxyz1234567890XYZ' })
    ).toBe('abcdefghijklmnopqrstuvwxyz1234567890...');
  });

  it('builds a type-aware saved item preview', () => {
    expect(buildSavedItemPreview({ content: 'Hello QR', isJs: false })).toBe('TEXT: Hello QR');
  });

  it('deduplicates and prepends saved items when merging', () => {
    const merged = mergeSavedItems(savedItems, {
      id: '3',
      name: 'Greeting',
      content: 'Hello QR',
      isJs: false,
      updatedAt: '2026-06-06T00:02:00.000Z',
    });

    expect(merged).toEqual([
      {
        id: '3',
        name: 'Greeting',
        content: 'Hello QR',
        isJs: false,
        updatedAt: '2026-06-06T00:02:00.000Z',
      },
      savedItems[0],
    ]);
  });

  it('enforces the max saved item limit when merging', () => {
    const manyItems = Array.from({ length: MAX_SAVED_QR_CODES }, (_, index) => ({
      id: `${index}`,
      name: `name-${index}`,
      content: `item-${index}`,
      isJs: false,
      updatedAt: '2026-06-06T00:00:00.000Z',
    }));

    const merged = mergeSavedItems(manyItems, {
      id: 'latest',
      name: 'Latest',
      content: 'latest',
      isJs: false,
      updatedAt: '2026-06-06T00:03:00.000Z',
    });

    expect(merged).toHaveLength(MAX_SAVED_QR_CODES);
    expect(merged[0].id).toBe('latest');
  });

  it('filters saved items by content or mode', () => {
    expect(filterSavedItems(savedItems, 'hello')).toEqual([savedItems[1]]);
    expect(filterSavedItems(savedItems, 'js')).toEqual([savedItems[0]]);
    expect(filterSavedItems(savedItems, 'clock')).toEqual([savedItems[0]]);
    expect(filterSavedItems(savedItems, '')).toEqual(savedItems);
  });

  it('inserts snippets at the current selection', () => {
    expect(insertSnippetAtSelection('return 1;', { start: 7, end: 8 }, '2')).toEqual({
      value: 'return 2;',
      selection: { start: 8, end: 8 },
    });
  });

  it('returns editor metadata for text and script modes', () => {
    expect(getEditorMeta('hello', false)).toEqual({
      lineCount: 1,
      characterCount: 5,
      placeholder: 'Enter plain text for the QR code...',
    });

    expect(getEditorMeta('line1\nline2', true)).toEqual({
      lineCount: 2,
      characterCount: 11,
      placeholder: 'Write JavaScript that returns the QR content...',
    });
  });
});