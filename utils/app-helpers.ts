export type SavedQRCode = {
  id: string;
  name: string;
  content: string;
  isJs: boolean;
  updatedAt: string;
};

export type EditorSelection = {
  start: number;
  end: number;
};

export const MAX_SAVED_QR_CODES = 50;

export const sanitizeSavedItems = (value: unknown, maxItems = MAX_SAVED_QR_CODES): SavedQRCode[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is SavedQRCode =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        (typeof item.name === 'string' || typeof item.name === 'undefined') &&
        typeof item.content === 'string' &&
        typeof item.isJs === 'boolean' &&
        typeof item.updatedAt === 'string'
    )
    .map((item) => ({
      ...item,
      name: typeof item.name === 'string' ? item.name : '',
    }))
    .slice(0, maxItems);
};

export const buildSavedItemLabel = (item: Pick<SavedQRCode, 'name' | 'content'>) => {
  const trimmedName = item.name.trim();

  if (trimmedName) {
    return trimmedName;
  }

  const normalized = item.content.replace(/\s+/g, ' ').trim();
  const preview = normalized.length > 36 ? `${normalized.slice(0, 36)}...` : normalized;

  return preview || 'Untitled';
};

export const buildSavedItemPreview = (item: Pick<SavedQRCode, 'content' | 'isJs'>) => {
  const normalized = item.content.replace(/\s+/g, ' ').trim();
  const preview = normalized.length > 36 ? `${normalized.slice(0, 36)}...` : normalized;

  return `${item.isJs ? 'JS' : 'TEXT'}: ${preview || 'Untitled'}`;
};

export const mergeSavedItems = (
  existingItems: SavedQRCode[],
  nextItem: SavedQRCode,
  maxItems = MAX_SAVED_QR_CODES
) => {
  const dedupedItems = existingItems.filter(
    (item) => !(item.content === nextItem.content && item.isJs === nextItem.isJs)
  );

  return [nextItem, ...dedupedItems].slice(0, maxItems);
};

export const filterSavedItems = (items: SavedQRCode[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    return (
      item.content.toLowerCase().includes(normalizedQuery) ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      (item.isJs ? 'js' : 'text').includes(normalizedQuery)
    );
  });
};

export const insertSnippetAtSelection = (
  input: string,
  selection: EditorSelection,
  snippet: string
) => {
  const nextValue = `${input.slice(0, selection.start)}${snippet}${input.slice(selection.end)}`;
  const cursor = selection.start + snippet.length;

  return {
    value: nextValue,
    selection: { start: cursor, end: cursor },
  };
};

export const getEditorMeta = (input: string, isJs: boolean) => {
  return {
    lineCount: input.split('\n').length,
    characterCount: input.length,
    placeholder: isJs
      ? 'Write JavaScript that returns the QR content...'
      : 'Enter plain text for the QR code...',
  };
};
