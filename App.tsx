import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Base64 } from 'js-base64';
import {
  buildQRCodeValue,
  decodeSharedPayload,
  DEFAULT_INPUT,
} from './qr-code-utils';
import {
  filterSavedItems,
  getEditorMeta,
  insertSnippetAtSelection,
  MAX_SAVED_QR_CODES,
  mergeSavedItems,
  sanitizeSavedItems,
  type SavedQRCode,
} from './app-helpers';
import { AppActionBar } from './components/AppActionBar';
import { EditorCard } from './components/EditorCard';
import { QRPreview } from './components/QRPreview';
import { SavedQRCodesModal } from './components/SavedQRCodesModal';

const STORAGE_KEY = 'saved-qr-codes';

export default function App() {
  const [input, setInput] = useState<string>(DEFAULT_INPUT);
  const [isJs, setIsJs] = useState<boolean>(true);
  const [qrValue, setQrValue] = useState<string>(buildQRCodeValue(DEFAULT_INPUT, true));
  const [savedName, setSavedName] = useState<string>('');
  const [savedItems, setSavedItems] = useState<SavedQRCode[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [selection, setSelection] = useState({ start: DEFAULT_INPUT.length, end: DEFAULT_INPUT.length });
  const scrollViewRef = useRef<ScrollView | null>(null);
  const inputRef = useRef<TextInput | null>(null);

  const persistSavedItems = async (items: SavedQRCode[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      Alert.alert('Error', 'Could not store QR code locally.');
    }
  };

  const loadSavedItems = async () => {
    try {
      const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

      if (!rawValue) {
        return;
      }

      setSavedItems(sanitizeSavedItems(JSON.parse(rawValue), MAX_SAVED_QR_CODES));
    } catch {
      Alert.alert('Error', 'Could not load saved QR codes.');
    }
  };

  const { lineCount, characterCount, placeholder: editorPlaceholder } = getEditorMeta(input, isJs);

  const refreshQRCode = () => {
    setQrValue(buildQRCodeValue(input, isJs));
  };

  const clearEditor = () => {
    setSavedName('');
    setInput('');
    setQrValue('');
    setSelection({ start: 0, end: 0 });

    setTimeout(() => {
      focusEditor();
      scrollToEditor();
    }, 0);
  };

  const resetEditor = () => {
    setSavedName('');
    setInput(DEFAULT_INPUT);
    setIsJs(true);
    setQrValue(buildQRCodeValue(DEFAULT_INPUT, true));
    setSelection({ start: DEFAULT_INPUT.length, end: DEFAULT_INPUT.length });

    setTimeout(() => {
      focusEditor();
      scrollToEditor();
    }, 0);
  };

  const insertSnippet = (snippet: string) => {
    const nextState = insertSnippetAtSelection(input, selection, snippet);

    setInput(nextState.value);
    setSelection(nextState.selection);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const focusEditor = () => {
    inputRef.current?.focus();
  };

  const scrollToEditor = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    loadSavedItems();
    const timer = setTimeout(() => {
      focusEditor();
      scrollToEditor();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
      scrollToEditor();
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // 2. Handle incoming deep links effortlessly
  const url = Linking.useURL();
  
  useEffect(() => {
    if (url) {
      try {
        const { queryParams } = Linking.parse(url);
        if (queryParams?.data && typeof queryParams.data === 'string') {
          const { content, isJs: incomingIsJs } = decodeSharedPayload(queryParams.data);
          
          setInput(content);
          setIsJs(Boolean(incomingIsJs));
          setSavedName('');
          setQrValue(buildQRCodeValue(content, Boolean(incomingIsJs)));
          focusEditor();
          scrollToEditor();
          Alert.alert("Imported", "Loaded shared QR configuration!");
        }
      } catch (e) {
        Alert.alert("Error", "Could not parse shared link.");
      }
    }
  }, [url]);

  const copyShareLink = async () => {
    const payload = JSON.stringify({ content: input, isJs });
    const encodedPayload = Base64.encode(payload);
    
    const shareUrl = Linking.createURL('/', { 
      queryParams: { data: encodedPayload } 
    });
    
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert("Copied", "Link copied to clipboard!");
  };

  const saveCurrentQRCode = async () => {
    const content = input.trim();

    if (!content) {
      Alert.alert('Empty', 'Enter text or script before saving.');
      return;
    }

    const nextItem: SavedQRCode = {
      id: `${Date.now()}`,
      name: savedName.trim(),
      content,
      isJs,
      updatedAt: new Date().toISOString(),
    };

    const nextItems = mergeSavedItems(savedItems, nextItem, MAX_SAVED_QR_CODES);

    setSavedItems(nextItems);
    await persistSavedItems(nextItems);
    Alert.alert('Saved', `Stored locally. ${nextItems.length}/${MAX_SAVED_QR_CODES} used.`);
  };

  const openSavedQRCode = (item: SavedQRCode) => {
    setSavedName(item.name);
    setInput(item.content);
    setIsJs(item.isJs);
    setQrValue(buildQRCodeValue(item.content, item.isJs));
    setIsLibraryOpen(false);
    focusEditor();
    scrollToEditor();
    Alert.alert('Loaded', 'Saved QR code opened.');
  };

  const removeSavedQRCode = async (id: string) => {
    const nextItems = savedItems.filter((item) => item.id !== id);
    setSavedItems(nextItems);
    await persistSavedItems(nextItems);
  };

  const filteredItems = filterSavedItems(savedItems, searchQuery);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'right', 'bottom', 'left']}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={12}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Dynamic QR Generator</Text>
            <AppActionBar
              isJs={isJs}
              onToggleMode={() => setIsJs(!isJs)}
              onGenerate={refreshQRCode}
              onSave={saveCurrentQRCode}
              onShare={copyShareLink}
              onOpenLibrary={() => setIsLibraryOpen(true)}
            />

            <QRPreview qrValue={qrValue} isKeyboardVisible={isKeyboardVisible} />

            <EditorCard
              isJs={isJs}
              lineCount={lineCount}
              characterCount={characterCount}
              savedName={savedName}
              editorPlaceholder={editorPlaceholder}
              input={input}
              inputRef={inputRef}
              selection={selection}
              onChangeSavedName={setSavedName}
              onChangeText={setInput}
              onFocus={scrollToEditor}
              onSelectionChange={(
                event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
              ) => setSelection(event.nativeEvent.selection)}
              onClear={clearEditor}
              onReset={resetEditor}
              onInsertSnippet={insertSnippet}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <SavedQRCodesModal
          visible={isLibraryOpen}
          savedItemsCount={savedItems.length}
          filteredItems={filteredItems}
          searchQuery={searchQuery}
          onClose={() => setIsLibraryOpen(false)}
          onSearchChange={setSearchQuery}
          onOpenItem={openSavedQRCode}
          onDeleteItem={(id) => void removeSavedQRCode(id)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginTop: 40, 
    marginBottom: 20 
  },
});
