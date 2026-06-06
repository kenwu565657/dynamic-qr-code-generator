import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  buildSavedItemLabel,
  buildSavedItemPreview,
  MAX_SAVED_QR_CODES,
  type SavedQRCode,
} from '../app-helpers';

type SavedQRCodesModalProps = {
  visible: boolean;
  savedItemsCount: number;
  filteredItems: SavedQRCode[];
  searchQuery: string;
  onClose: () => void;
  onSearchChange: (text: string) => void;
  onOpenItem: (item: SavedQRCode) => void;
  onDeleteItem: (id: string) => void;
};

export function SavedQRCodesModal({
  visible,
  savedItemsCount,
  filteredItems,
  searchQuery,
  onClose,
  onSearchChange,
  onOpenItem,
  onDeleteItem,
}: SavedQRCodesModalProps) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.sidebarOverlay}>
        <Pressable style={styles.sidebarBackdrop} onPress={onClose} />
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Saved QR Codes</Text>
            <Text style={styles.sidebarMeta}>{savedItemsCount}/{MAX_SAVED_QR_CODES}</Text>
          </View>

          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search text or scripts"
          />

          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.savedList}
            ListEmptyComponent={<Text style={styles.emptyState}>No saved QR codes found.</Text>}
            renderItem={({ item }) => (
              <View style={styles.savedCard}>
                <Pressable style={styles.savedCardBody} onPress={() => onOpenItem(item)}>
                  <Text style={styles.savedType}>{item.isJs ? 'Script' : 'Plain Text'}</Text>
                  <Text style={styles.savedLabel}>{buildSavedItemLabel(item)}</Text>
                  <Text style={styles.savedPreview}>{buildSavedItemPreview(item)}</Text>
                  <Text style={styles.savedDate}>{new Date(item.updatedAt).toLocaleString()}</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={() => onDeleteItem(item.id)}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  sidebarBackdrop: {
    flex: 1,
  },
  sidebar: {
    width: '82%',
    maxWidth: 360,
    backgroundColor: '#f8f4ec',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#d8ccb8',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2f2a24',
  },
  sidebarMeta: {
    color: '#7a6f61',
    fontSize: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#c7baa7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fffdf9',
    marginBottom: 14,
  },
  savedList: {
    gap: 12,
    paddingBottom: 24,
  },
  savedCard: {
    backgroundColor: '#fffdf9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfd3c3',
    padding: 12,
    gap: 10,
  },
  savedCardBody: {
    gap: 6,
  },
  savedType: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#8a5a24',
  },
  savedLabel: {
    fontSize: 15,
    color: '#241f18',
    fontFamily: 'Courier',
  },
  savedDate: {
    fontSize: 12,
    color: '#74685b',
  },
  savedPreview: {
    fontSize: 13,
    color: '#5f5448',
    fontFamily: 'Courier',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#2f2a24',
  },
  deleteButtonText: {
    color: '#fffdf9',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    color: '#74685b',
    textAlign: 'center',
    marginTop: 24,
  },
});