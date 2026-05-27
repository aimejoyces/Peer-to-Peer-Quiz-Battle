import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDrawStore } from '../store/drawStore';
import { useThemeStore } from '../store/themeStore';

const COLORS = [
  '#ffffff',
  '#000000',
  '#ff6b6b',
  '#ffd93d',
  '#6bcb77',
  '#4d96ff',
  '#c77dff',
  '#ff8fab',
];

export default function Toolbar() {
  const store = useDrawStore();
  const { colors } = useThemeStore();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Color Picker Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Colors</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.colorScroll}
        >
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => {
                store.setColor(c);
                store.setEraser(false);
              }}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                store.color === c && !store.isEraser && [
                  styles.activeDot,
                  { borderColor: colors.primary, borderWidth: 3 },
                ],
              ]}
            />
          ))}
        </ScrollView>
      </View>

      {/* Stroke Width Section */}
      <View style={styles.section}>
        <View style={styles.widthHeader}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Stroke</Text>
          <Text style={[styles.widthValue, { color: colors.primary }]}>{store.strokeWidth.toFixed(0)}px</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={2}
          maximumValue={20}
          value={store.strokeWidth}
          onValueChange={store.setStrokeWidth}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </View>

      {/* Tools Section */}
      <View style={styles.toolsRow}>
        <TouchableOpacity
          onPress={store.undo}
          style={[styles.toolBtn, { backgroundColor: colors.surfaceLight }]}
        >
          <Ionicons name="arrow-undo" size={18} color={colors.text} />
          <Text style={[styles.toolBtnText, { color: colors.text }]}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={store.redo}
          style={[styles.toolBtn, { backgroundColor: colors.surfaceLight }]}
        >
          <Ionicons name="arrow-redo" size={18} color={colors.text} />
          <Text style={[styles.toolBtnText, { color: colors.text }]}>Redo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => store.setEraser(!store.isEraser)}
          style={[
            styles.toolBtn,
            {
              backgroundColor: store.isEraser ? colors.primary : colors.surfaceLight,
            },
          ]}
        >
          <Ionicons
            name="eraser"
            size={18}
            color={store.isEraser ? '#fff' : colors.text}
          />
          <Text
            style={[
              styles.toolBtnText,
              { color: store.isEraser ? '#fff' : colors.text },
            ]}
          >
            Eraser
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/layers')}
          style={[styles.toolBtn, { backgroundColor: colors.surfaceLight }]}
        >
          <Ionicons name="layers" size={18} color={colors.text} />
          <Text style={[styles.toolBtnText, { color: colors.text }]}>Layers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  colorScroll: {
    marginBottom: 4,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeDot: {
    transform: [{ scale: 1.1 }],
  },
  widthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  widthValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  slider: {
    height: 28,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  toolBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});