import React from 'react';
import { render } from '@testing-library/react-native';
import { QRPreview } from './QRPreview';

jest.mock('react-native-qrcode-svg', () => 'QRCode');

describe('QRPreview', () => {
  it('renders a collapsed message while typing', () => {
    const screen = render(<QRPreview qrValue="hello" isKeyboardVisible />);

    expect(screen.getByText('QR preview hidden while typing')).toBeTruthy();
    expect(screen.queryByText('hello')).toBeNull();
  });

  it('renders the QR value when the keyboard is hidden', () => {
    const screen = render(<QRPreview qrValue="hello" isKeyboardVisible={false} />);

    expect(screen.getByText('hello')).toBeTruthy();
  });

  it('renders an empty preview without crashing', () => {
    const screen = render(<QRPreview qrValue="" isKeyboardVisible={false} />);

    expect(screen.toJSON()).toBeTruthy();
  });

  it('renders an invalid marker instead of QR content', () => {
    const screen = render(<QRPreview qrValue="" isKeyboardVisible={false} isInvalid />);

    expect(screen.getByText('X')).toBeTruthy();
    expect(screen.getByText('Script cannot be generated')).toBeTruthy();
  });
});