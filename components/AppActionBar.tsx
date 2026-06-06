import { Button, Keyboard, StyleSheet, View } from 'react-native';

type AppActionBarProps = {
  isJs: boolean;
  onToggleMode: () => void;
  onGenerate: () => void;
  onSave: () => void;
  onShare: () => void;
  onOpenLibrary: () => void;
};

export function AppActionBar({
  isJs,
  onToggleMode,
  onGenerate,
  onSave,
  onShare,
  onOpenLibrary,
}: AppActionBarProps) {
  return (
    <View style={styles.row}>
      <View style={styles.buttonSlot}>
        <Button title={`Mode: ${isJs ? 'JS' : 'Text'}`} onPress={onToggleMode} />
      </View>
      <View style={styles.buttonSlot}>
        <Button title="Generate" onPress={onGenerate} />
      </View>
      <View style={styles.buttonSlot}>
        <Button title="Hide KB" onPress={() => Keyboard.dismiss()} />
      </View>
      <View style={styles.buttonSlot}>
        <Button title="Save" onPress={onSave} />
      </View>
      <View style={styles.buttonSlot}>
        <Button title="Share" onPress={onShare} />
      </View>
      <View style={styles.buttonSlot}>
        <Button title="Library" onPress={onOpenLibrary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  buttonSlot: {
    minWidth: '30%',
  },
});