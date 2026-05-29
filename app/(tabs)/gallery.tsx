import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { SavedDrawing, useDrawStore } from '../../src/store/drawStore';
import { useThemeStore } from '../../src/store/themeStore';

/* =========================================
   COMPONENTS
========================================= */

const DrawingThumbnail = ({ drawing, colors }: { drawing: SavedDrawing, colors: any }) => {
  // Simple thumbnail: just draw a few strokes from the first layer
  const firstLayer = drawing.layers[0];
  const strokes = firstLayer?.strokes.slice(0, 10) || [];

  return (
    <View style={[styles.thumbnail, { backgroundColor: colors.canvas, borderColor: colors.border }]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 600">
        {strokes.map((s) => (
          <Path
            key={s.id}
            d={s.points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')}
            stroke={s.isEraser ? colors.canvas : s.color}
            strokeWidth={s.strokeWidth * 2}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </Svg>
    </View>
  );
};

export default function GalleryScreen() {
  const store = useDrawStore();
  const { colors } = useThemeStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [drawings, setDrawings] = React.useState<SavedDrawing[]>([]);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadAndRefresh();
    }, [])
  );

  const loadAndRefresh = async () => {
    setLoading(true);
    const data = await store.loadDrawings();
    setDrawings(data.sort((a, b) => b.updatedAt - a.updatedAt));
    setLoading(false);
  };

  const handleEdit = async (id: string) => {
    await store.loadDrawing(id);
    router.push('/(tabs)');
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
          onPress: async () => {
            try {
              await store.deleteDrawing(id);
              loadAndRefresh();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete drawing');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(insets.top, 12) }]}>
        <Ionicons name="images" size={24} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Gallery</Text>
      </View>

      <FlatList
        data={drawings}
        keyExtractor={(d: SavedDrawing) => d.id}
        numColumns={2}
        onEndReachedThreshold={0.5}
        refreshing={loading}
        onRefresh={loadAndRefresh}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        renderItem={({ item }: { item: SavedDrawing }) => (
          <TouchableOpacity
            onPress={() => handleEdit(item.id)}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <DrawingThumbnail drawing={item} colors={colors} />
            
            <View style={styles.cardInfo}>
              <Text
                style={[styles.cardTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => handleDelete(item.id, item.name)}
            >
              <Ionicons name="trash" size={16} color={colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="image-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No saved drawings yet
            </Text>
            <TouchableOpacity 
                onPress={() => router.push('/(tabs)')}
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
            >
                <Text style={styles.startBtnText}>Start Drawing</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    height: 160,
    width: '100%',
    borderBottomWidth: 1,
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 10,
    fontWeight: '500',
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  startBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
