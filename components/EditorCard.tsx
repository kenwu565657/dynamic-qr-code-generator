import type { RefObject } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  View,
} from 'react-native';

type EditorCardProps = {
  isJs: boolean;
  lineCount: number;
  characterCount: number;
  savedName: string;
  editorPlaceholder: string;
  input: string;
  inputRef: RefObject<TextInput | null>;
  selection: { start: number; end: number };
  onChangeSavedName: (text: string) => void;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onSelectionChange: (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => void;
  onClear: () => void;
  onReset: () => void;
  onInsertSnippet: (snippet: string) => void;
};

export function EditorCard({
  isJs,
  lineCount,
  characterCount,
  savedName,
  editorPlaceholder,
  input,
  inputRef,
  selection,
  onChangeSavedName,
  onChangeText,
  onFocus,
  onSelectionChange,
  onClear,
  onReset,
  onInsertSnippet,
}: EditorCardProps) {
  return (
    <View style={[styles.editorCard, isJs ? styles.editorCardScript : styles.editorCardText]}>
      <View style={styles.editorHeader}>
        <Text style={styles.editorTitle}>{isJs ? 'Script Editor' : 'Plain Text Editor'}</Text>
        <Text style={styles.editorMeta}>
          {isJs ? `${lineCount} lines` : `${characterCount} characters`}
        </Text>
      </View>
      <Text style={styles.editorHint}>
        {isJs
          ? 'Code mode turns off autocorrect and capitalization so JavaScript is easier to type.'
          : 'Text mode keeps the editor simple for plain content.'}
      </Text>

      <TextInput
        style={styles.nameInput}
        value={savedName}
        onChangeText={onChangeSavedName}
        placeholder="Name for saved QR code"
        autoCapitalize="words"
        autoCorrect
        returnKeyType="done"
      />

      <View style={styles.editorActionsRow}>
        <Pressable style={styles.editorActionButton} onPress={onClear}>
          <Text style={styles.editorActionText}>Clear</Text>
        </Pressable>
        <Pressable style={styles.editorActionButton} onPress={onReset}>
          <Text style={styles.editorActionText}>Reset</Text>
        </Pressable>
      </View>

      {isJs ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.snippetRow}
          keyboardShouldPersistTaps="always"
        >
          <Pressable style={styles.snippetChip} onPress={() => onInsertSnippet('()')}>
            <Text style={styles.snippetChipText}>()</Text>
          </Pressable>
          <Pressable style={styles.snippetChip} onPress={() => onInsertSnippet('{}')}>
            <Text style={styles.snippetChipText}>{'{}'}</Text>
          </Pressable>
          <Pressable style={styles.snippetChip} onPress={() => onInsertSnippet('=> ')}>
            <Text style={styles.snippetChipText}>=&gt;</Text>
          </Pressable>
          <Pressable style={styles.snippetChip} onPress={() => onInsertSnippet('return ')}>
            <Text style={styles.snippetChipText}>return</Text>
          </Pressable>
          <Pressable style={styles.snippetChip} onPress={() => onInsertSnippet('new Date()')}>
            <Text style={styles.snippetChipText}>new Date()</Text>
          </Pressable>
          <Pressable style={styles.snippetChip} onPress={() => onInsertSnippet('.toLocaleTimeString()')}>
            <Text style={styles.snippetChipText}>time()</Text>
          </Pressable>
        </ScrollView>
      ) : null}

      <TextInput
        ref={inputRef}
        style={[styles.input, isJs ? styles.scriptInput : styles.textInput]}
        autoFocus
        multiline
        value={input}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onSelectionChange={onSelectionChange}
        placeholder={editorPlaceholder}
        selection={selection}
        textAlignVertical="top"
        autoCapitalize={isJs ? 'none' : 'sentences'}
        autoCorrect={!isJs}
        spellCheck={!isJs}
        autoComplete="off"
        selectionColor={isJs ? '#8a5a24' : '#2f6fed'}
        scrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  editorCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  editorCardScript: {
    backgroundColor: '#f7f2ea',
    borderColor: '#dccdb8',
  },
  editorCardText: {
    backgroundColor: '#f7f9fc',
    borderColor: '#d4dce8',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  editorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#231d16',
  },
  editorMeta: {
    fontSize: 12,
    color: '#74685b',
  },
  editorHint: {
    fontSize: 12,
    color: '#74685b',
    marginBottom: 10,
    lineHeight: 18,
  },
  nameInput: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  editorActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  editorActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ccbba3',
  },
  editorActionText: {
    color: '#5a4530',
    fontSize: 13,
    fontWeight: '600',
  },
  snippetRow: {
    gap: 8,
    paddingBottom: 10,
  },
  snippetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#efe2cf',
    borderWidth: 1,
    borderColor: '#d4b895',
  },
  snippetChipText: {
    color: '#6f4617',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontFamily: 'Courier',
  },
  textInput: {
    minHeight: 110,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  scriptInput: {
    minHeight: 220,
    backgroundColor: '#fffaf2',
    color: '#241f18',
    fontSize: 15,
    lineHeight: 22,
  },
});