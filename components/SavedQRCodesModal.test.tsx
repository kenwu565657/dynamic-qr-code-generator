import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { MAX_SAVED_QR_CODES, type SavedQRCode } from '../app-helpers';
import { SavedQRCodesModal } from './SavedQRCodesModal';

jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react');
  const MockModal = ({ children, visible }: { children: React.ReactNode; visible: boolean }) => {
    if (!visible) {
      return null;
    }

    return React.createElement(React.Fragment, null, children);
  };

  return {
    __esModule: true,
    default: MockModal,
  };
});

function createProps(overrides: Partial<React.ComponentProps<typeof SavedQRCodesModal>> = {}) {
  const item: SavedQRCode = {
    id: 'item-1',
    name: 'Morning QR',
    content: 'Hello QR',
    isJs: false,
    updatedAt: '2026-06-15T10:00:00.000Z',
  };

  return {
    visible: true,
    savedItemsCount: 1,
    filteredItems: [item],
    searchQuery: '',
    onClose: jest.fn(),
    onSearchChange: jest.fn(),
    onOpenItem: jest.fn(),
    onDeleteItem: jest.fn(),
    ...overrides,
  };
}

describe('SavedQRCodesModal', () => {
  it('renders saved items and wires item actions', () => {
    const props = createProps();
    const screen = render(<SavedQRCodesModal {...props} />);

    expect(screen.getByText('Saved QR Codes')).toBeTruthy();
    expect(screen.getByText(`1/${MAX_SAVED_QR_CODES}`)).toBeTruthy();
    expect(screen.getByText('Plain Text')).toBeTruthy();
    expect(screen.getByText('Morning QR')).toBeTruthy();
    expect(screen.getByText('TEXT: Hello QR')).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Search text or scripts'), 'hello');
    expect(props.onSearchChange).toHaveBeenCalledWith('hello');

    fireEvent.press(screen.getByText('Morning QR'));
    expect(props.onOpenItem).toHaveBeenCalledWith(props.filteredItems[0]);

    fireEvent.press(screen.getByText('Delete'));
    expect(props.onDeleteItem).toHaveBeenCalledWith('item-1');
  });

  it('renders script items with the script label', () => {
    const props = createProps({
      filteredItems: [
        {
          id: 'script-1',
          name: '',
          content: 'return 1;',
          isJs: true,
          updatedAt: '2026-06-15T11:00:00.000Z',
        },
      ],
    });
    const screen = render(<SavedQRCodesModal {...props} />);

    expect(screen.getByText('Script')).toBeTruthy();
    expect(screen.getByText('JS: return 1;')).toBeTruthy();
  });

  it('renders the empty state for unmatched search results', () => {
    const props = createProps({ filteredItems: [], searchQuery: 'missing' });
    const screen = render(<SavedQRCodesModal {...props} />);

    expect(screen.getByDisplayValue('missing')).toBeTruthy();
    expect(screen.getByText('No saved QR codes found.')).toBeTruthy();
  });

  it('does not render content when hidden', () => {
    const screen = render(<SavedQRCodesModal {...createProps({ visible: false })} />);

    expect(screen.queryByText('Saved QR Codes')).toBeNull();
  });
});