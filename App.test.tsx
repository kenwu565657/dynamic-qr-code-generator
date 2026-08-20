import React from 'react';
import { Alert, Keyboard, View } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import App from './App';
import { MAX_SAVED_QR_CODES } from './utils/app-helpers';
import { DEFAULT_INPUT } from './utils/qr-code-utils';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-linking', () => ({
  useURL: jest.fn(),
  parse: jest.fn(),
  createURL: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    SafeAreaView: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children),
  };
});

jest.mock('react-native-qrcode-svg', () => 'QRCode');

describe('App', () => {
  const scriptRuleAlertTitle = 'Script cannot be generated';
  const scriptRuleAlertMessage = 'Use one return statement ending with ; and remove any code after it.';
  const addListenerMock = jest.spyOn(Keyboard, 'addListener');
  const dismissMock = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined);
  const alertMock = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const keyboardListeners: Record<string, () => void> = {};

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    Object.keys(keyboardListeners).forEach((key) => delete keyboardListeners[key]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (Linking.useURL as jest.Mock).mockReturnValue(null);
    (Linking.parse as jest.Mock).mockImplementation(() => ({ queryParams: {} }));
    (Linking.createURL as jest.Mock).mockReturnValue('app://shared');
    addListenerMock.mockImplementation(((eventName: string, listener: () => void) => {
      keyboardListeners[eventName] = listener;
      return { remove: jest.fn() };
    }) as never);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders the default script editor state', async () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByText('Script Editor')).toBeTruthy();
    expect(screen.getByDisplayValue(DEFAULT_INPUT)).toBeTruthy();
    expect(screen.getByText('1 lines')).toBeTruthy();
  });

  it('switches to text mode and generates a plain text QR preview', async () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(screen.getByText('Mode: JS'));
    expect(screen.getByText('Plain Text Editor')).toBeTruthy();

    const input = screen.getByPlaceholderText('Enter plain text for the QR code...');
    fireEvent.changeText(input, 'Hello QR');
    fireEvent.press(screen.getByText('Generate'));

    expect(screen.getByText('8 characters')).toBeTruthy();
    expect(screen.getByText('Hello QR')).toBeTruthy();
  });

  it('supports clear and reset in the editor area', async () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(screen.getByText('Clear'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write JavaScript that returns the QR content...').props.value).toBe('');
    });

    fireEvent.press(screen.getByText('Reset'));

    expect(screen.getByDisplayValue(DEFAULT_INPUT)).toBeTruthy();
  });

  it('saves an item locally and shows it in the library with search', async () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(screen.getByText('Mode: JS'));
    fireEvent.changeText(screen.getByPlaceholderText('Name for saved QR code'), 'Greeting QR');
    const input = screen.getByPlaceholderText('Enter plain text for the QR code...');
    fireEvent.changeText(input, 'Saved value');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    fireEvent.press(screen.getByText('Library'));
    expect(screen.getByText('Greeting QR')).toBeTruthy();
    expect(screen.getByText('TEXT: Saved value')).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Search text or scripts'), 'missing');
    expect(screen.getByText('No saved QR codes found.')).toBeTruthy();
  });

  it('regenerates the QR preview when saving edited content', async () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(screen.getByText('Mode: JS'));
    fireEvent.changeText(screen.getByPlaceholderText('Name for saved QR code'), 'Saved value QR');
    fireEvent.changeText(screen.getByPlaceholderText('Enter plain text for the QR code...'), 'Saved value');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Saved value')).toBeTruthy();
    });
  });

  it('loads saved items from storage, opens one, and deletes one', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([
        {
          id: 'saved-1',
          name: 'Stored QR',
          content: 'Loaded text',
          isJs: false,
          updatedAt: '2026-06-21T10:00:00.000Z',
        },
      ])
    );

    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(screen.getByText('Library'));

    await waitFor(() => {
      expect(screen.getByText('Stored QR')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Stored QR'));

    await waitFor(() => {
      expect(screen.getByText('Plain Text Editor')).toBeTruthy();
      expect(screen.getByDisplayValue('Loaded text')).toBeTruthy();
      expect(alertMock).toHaveBeenCalledWith('Loaded', 'Saved QR code opened.');
    });

    fireEvent.press(screen.getByText('Library'));
    fireEvent.press(screen.getByText('Delete'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith('saved-qr-codes', '[]');
    });
  });

  it('shows an alert when saving empty content', () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(screen.getByText('Clear'));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.changeText(screen.getByPlaceholderText('Name for saved QR code'), 'Empty QR');
    fireEvent.press(screen.getByText('Save'));

    expect(alertMock).toHaveBeenCalledWith('Empty', 'Enter text or script before saving.');
  });

  it('shows an alert when saving without a name', () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(screen.getByText('Save'));

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith('Name required', 'Enter a name before saving this QR code.');
  });

  it('does not save invalid JavaScript content locally', async () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.changeText(screen.getByPlaceholderText('Name for saved QR code'), 'Broken script');
    fireEvent.changeText(screen.getByPlaceholderText('Write JavaScript that returns the QR content...'), 'return (');
    fireEvent.press(screen.getByText('Save'));

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith(scriptRuleAlertTitle, scriptRuleAlertMessage);
  });

  it('shows an alert instead of replacing the oldest saved item when the library is full', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(
        Array.from({ length: MAX_SAVED_QR_CODES }, (_, index) => ({
          id: `saved-${index}`,
          name: `Saved ${index}`,
          content: `Saved content ${index}`,
          isJs: false,
          updatedAt: '2026-06-21T10:00:00.000Z',
        }))
      )
    );

    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(screen.getByText('Mode: JS'));
    fireEvent.changeText(screen.getByPlaceholderText('Name for saved QR code'), 'Overflow QR');
    fireEvent.changeText(screen.getByPlaceholderText('Enter plain text for the QR code...'), 'Overflow content');

    await waitFor(() => {
      expect(screen.getByText('Library')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Save'));

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith(
      'Library full',
      `You can save up to ${MAX_SAVED_QR_CODES} QR codes. Delete one before saving another.`
    );
  });

  it('shows an alert and invalid marker instead of QR error text when generating invalid JS', () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.changeText(screen.getByPlaceholderText('Write JavaScript that returns the QR content...'), 'return (');
    fireEvent.press(screen.getByText('Generate'));

    expect(alertMock).toHaveBeenCalledWith(scriptRuleAlertTitle, scriptRuleAlertMessage);
    expect(screen.getByText('X')).toBeTruthy();
    expect(screen.queryByText(/^Error:/)).toBeNull();
  });

  it('does not share invalid JavaScript content', async () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.changeText(screen.getByPlaceholderText('Write JavaScript that returns the QR content...'), 'return (');
    fireEvent.press(screen.getByText('Share'));

    expect(Clipboard.setStringAsync).not.toHaveBeenCalled();
    expect(Linking.createURL).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith(scriptRuleAlertTitle, scriptRuleAlertMessage);
    expect(screen.getByText('X')).toBeTruthy();
  });

  it('does not save JavaScript content after the return statement', async () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.changeText(screen.getByPlaceholderText('Name for saved QR code'), 'Extra script');
    fireEvent.changeText(
      screen.getByPlaceholderText('Write JavaScript that returns the QR content...'),
      'return new Date().toLocaleTimeString();new Date()'
    );
    fireEvent.press(screen.getByText('Save'));

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith(scriptRuleAlertTitle, scriptRuleAlertMessage);
  });

  it('shows an error when a shared link cannot be parsed', async () => {
    (Linking.useURL as jest.Mock).mockReturnValue('app://shared?data=bad');
    (Linking.parse as jest.Mock).mockReturnValue({
      queryParams: {
        data: 'not-base64',
      },
    });

    render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error', 'Could not parse shared link.');
    });
  });

  it('shows an error when saved items cannot be loaded', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('storage failed'));

    render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Error', 'Could not load saved QR codes.');
    });
  });

  it('hides the preview while the keyboard is visible', () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
      keyboardListeners.keyboardDidShow?.();
    });

    expect(screen.getByText('QR preview hidden while typing')).toBeTruthy();

    act(() => {
      keyboardListeners.keyboardDidHide?.();
    });

    expect(screen.queryByText('QR preview hidden while typing')).toBeNull();
  });

  it('copies a share link to the clipboard', async () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(screen.getByText('Share'));

    await waitFor(() => {
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('app://shared');
      expect(Linking.createURL).toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith('Copied', 'Link copied to clipboard!');
    });
  });

  it('imports a shared payload from a deep link', async () => {
    (Linking.useURL as jest.Mock).mockReturnValue('app://shared?data=abc');
    (Linking.parse as jest.Mock).mockReturnValue({
      queryParams: {
        data: 'eyJjb250ZW50IjoiSGVsbG8gZnJvbSBsaW5rIiwiaXNKcyI6ZmFsc2V9',
      },
    });

    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(screen.getByText('Plain Text Editor')).toBeTruthy();
      expect(screen.getByDisplayValue('Hello from link')).toBeTruthy();
      expect(alertMock).toHaveBeenCalledWith('Imported', 'Loaded shared QR configuration!');
    });
  });

  it('dismisses the keyboard from the top action row', () => {
    const screen = render(<App />);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.press(screen.getByText('Hide KB'));
    expect(dismissMock).toHaveBeenCalled();
  });
});