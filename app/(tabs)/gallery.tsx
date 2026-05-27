import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SavedDrawing, useDrawStore } from '../../src/store/drawStore';
import { useThemeStore } from '../../src/store/themeStore';

export default function GalleryScreen() {
  const { loadDrawings } = useDrawStore();
  const { colors } = useThemeStore();
  const [drawings, setDrawings] = React.useState<SavedDrawing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadAndRefresh();
  }, []);

  const loadAndRefresh = async () => {
    setLoading(true);
    const data = await loadDrawings();
    setDrawings(data.sort((a, b) => b.createdAt - a.createdAt));
    setLoading(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Drawing',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Not implemented yet');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={drawings}
        keyExtractor={(d: SavedDrawing) => d.id}
        onEndReachedThreshold={0.5}
        refreshing={loading}
        onRefresh={loadAndRefresh}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: SavedDrawing }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="image" size={20} color={colors.primary} />
                <Text
                  style={[styles.cardTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
                <Ionicons name="trash" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
              {new Date(item.createdAt).toLocaleDateString()} •{' '}
              {item.layers.length} layer{item.layers.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No saved drawings yet
            </Text>
            <Text
              style={[styles.emptySubText, { color: colors.textSecondary }]}
            >
              Your saved drawings will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 1,
  },
  card: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  cardMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    marginTop: 4,
  },
});
