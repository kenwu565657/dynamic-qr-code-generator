import React from 'react';
import { TextInput } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { EditorCard } from './EditorCard';

function createProps(overrides: Partial<React.ComponentProps<typeof EditorCard>> = {}) {
  return {
    isJs: true,
    lineCount: 3,
    characterCount: 18,
    savedName: 'Clock QR',
    editorPlaceholder: 'Write JavaScript that returns the QR content...',
    input: 'return new Date()',
    inputRef: { current: null } as React.RefObject<TextInput | null>,
    selection: { start: 2, end: 2 },
    onChangeSavedName: jest.fn(),
    onChangeText: jest.fn(),
    onFocus: jest.fn(),
    onSelectionChange: jest.fn(),
    onClear: jest.fn(),
    onReset: jest.fn(),
    onInsertSnippet: jest.fn(),
    ...overrides,
  };
}

describe('EditorCard', () => {
  it('renders script mode content and wires editor actions', () => {
    const props = createProps();
    const screen = render(<EditorCard {...props} />);

    expect(screen.getByText('Script Editor')).toBeTruthy();
    expect(screen.getByText('3 lines')).toBeTruthy();
    expect(
      screen.getByText('Code mode turns off autocorrect and capitalization so JavaScript is easier to type.')
    ).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Name for saved QR code'), 'Updated QR');
    expect(props.onChangeSavedName).toHaveBeenCalledWith('Updated QR');

    fireEvent.press(screen.getByText('Clear'));
    fireEvent.press(screen.getByText('Reset'));
    expect(props.onClear).toHaveBeenCalledTimes(1);
    expect(props.onReset).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('return'));
    fireEvent.press(screen.getByText('time()'));
    expect(props.onInsertSnippet).toHaveBeenNthCalledWith(1, 'return ');
    expect(props.onInsertSnippet).toHaveBeenNthCalledWith(2, '.toLocaleTimeString()');

    const input = screen.getByDisplayValue('return new Date()');
    fireEvent.changeText(input, 'return 42');
    fireEvent(input, 'focus');
    fireEvent(input, 'selectionChange', { nativeEvent: { selection: { start: 4, end: 6 } } });

    expect(props.onChangeText).toHaveBeenCalledWith('return 42');
    expect(props.onFocus).toHaveBeenCalledTimes(1);
    expect(props.onSelectionChange).toHaveBeenCalledTimes(1);
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.autoCorrect).toBe(false);
    expect(input.props.spellCheck).toBe(false);
    expect(input.props.selectionColor).toBe('#8a5a24');
  });

  it('renders text mode without snippet chips', () => {
    const props = createProps({
      isJs: false,
      characterCount: 8,
      editorPlaceholder: 'Enter plain text for the QR code...',
      input: 'Hello QR',
    });

    const screen = render(<EditorCard {...props} />);

    expect(screen.getByText('Plain Text Editor')).toBeTruthy();
    expect(screen.getByText('8 characters')).toBeTruthy();
    expect(screen.getByText('Text mode keeps the editor simple for plain content.')).toBeTruthy();
    expect(screen.queryByText('return')).toBeNull();

    const input = screen.getByDisplayValue('Hello QR');
    expect(input.props.autoCapitalize).toBe('sentences');
    expect(input.props.autoCorrect).toBe(true);
    expect(input.props.spellCheck).toBe(true);
    expect(input.props.selectionColor).toBe('#2f6fed');
  });
});