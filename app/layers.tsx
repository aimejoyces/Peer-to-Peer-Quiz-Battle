import { Layer, useDrawStore } from '@/src/store/drawStore';
import { useThemeStore } from '@/src/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LayersModal() {
  const router = useRouter();
  const { layers, activeLayerId, setActiveLayer, addLayer } = useDrawStore();
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.layersScroll} showsVerticalScrollIndicator={false}>
        {layers.map((layer: Layer) => (
          <TouchableOpacity
            key={layer.id}
            onPress={() => {
              setActiveLayer(layer.id);
              router.back();
            }}
            style={[
              styles.layerItem,
              {
                backgroundColor:
                  layer.id === activeLayerId ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.layerContent}>
              <Ionicons
                name="layers-outline"
                size={18}
                color={layer.id === activeLayerId ? '#fff' : colors.text}
              />
              <Text
                style={[
                  styles.layerName,
                  {
                    color: layer.id === activeLayerId ? '#fff' : colors.text,
                  },
                ]}
              >
                {layer.name}
              </Text>
            </View>
            {layer.id === activeLayerId && (
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={addLayer}
        style={[styles.addBtn, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Add New Layer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  layersScroll: {
    flex: 1,
    marginBottom: 12,
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  layerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  layerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});