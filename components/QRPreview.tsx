import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type QRPreviewProps = {
  qrValue: string;
  isKeyboardVisible: boolean;
  isInvalid?: boolean;
};

export function QRPreview({ qrValue, isKeyboardVisible, isInvalid = false }: QRPreviewProps) {
  if (isKeyboardVisible) {
    return (
      <View style={styles.collapsedNotice}>
        <Text style={styles.collapsedText}>QR preview hidden while typing</Text>
      </View>
    );
  }

  if (isInvalid) {
    return (
      <View style={styles.container}>
        <View style={styles.invalidMark}>
          <Text style={styles.invalidMarkText}>X</Text>
        </View>
        <Text style={styles.invalidText}>Script cannot be generated</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {qrValue && <QRCode value={qrValue} size={200} />}
      <Text style={styles.previewText}>{qrValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  collapsedNotice: {
    width: '100%',
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
    borderWidth: 1,
    borderColor: '#d7d7d7',
  },
  collapsedText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
  previewText: {
    marginTop: 15,
    color: '#555',
    fontFamily: 'Courier',
  },
  invalidMark: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invalidMarkText: {
    color: '#c7352f',
    fontSize: 144,
    fontWeight: '800',
    lineHeight: 160,
  },
  invalidText: {
    marginTop: 10,
    color: '#8d211c',
    fontSize: 15,
    fontWeight: '700',
  },
});