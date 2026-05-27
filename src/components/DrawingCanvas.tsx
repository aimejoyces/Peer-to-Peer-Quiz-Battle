import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import {
    Alert,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { AddStrokeCommand } from '../commands';
import { Stroke, useDrawStore } from '../store/drawStore';
import { useThemeStore } from '../store/themeStore';
import { screenToCanvas } from '../utils/coords';
import { showToast } from './Toast';

const { width, height } = Dimensions.get('window');

/* =========================================
   TYPES
========================================= */

type Point = {
  x: number;
  y: number;
};

/* =========================================
   HELPERS
========================================= */

// Convert array of points to SVG path
const pointsToPath = (pts: Point[]) => {
  if (pts.length < 2) return '';

  return pts.reduce(
    (acc, p, i) =>
      i === 0
        ? `M ${p.x} ${p.y}`
        : `${acc} L ${p.x} ${p.y}`,
    ''
  );
};

// Distance between 2 touches
const pinchDistance = (p1: Point, p2: Point) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return Math.sqrt(dx * dx + dy * dy);
};

/* =========================================
   COMPONENT
========================================= */

import * as React from 'react';
import {
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width, height } = Dimensions.get('window');

/* =========================================
   TYPES
========================================= */

type Point = {
  x: number;
  y: number;
};

/* =========================================
   HELPERS
========================================= */

// Convert array of points to SVG path
const pointsToPath = (pts: Point[]) => {
  if (pts.length < 2) return '';

  return pts.reduce(
    (acc, p, i) =>
      i === 0
        ? `M ${p.x} ${p.y}`
        : `${acc} L ${p.x} ${p.y}`,
    ''
  );
};

// Distance between 2 touches
const pinchDistance = (p1: Point, p2: Point) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return Math.sqrt(dx * dx + dy * dy);
};

/* =========================================
   COMPONENT
========================================= */

export default function DrawingCanvas() {
  const store = useDrawStore();
  const { theme, colors, toggleTheme } = useThemeStore();
  const insets = useSafeAreaInsets();

  // Current drawing points
  const currentPoints = React.useRef<Point[]>([]);

  // Live SVG path while drawing
  const [livePoints, setLivePoints] = React.useState('');

  // Stroke id counter
  const strokeId = React.useRef(0);

  /* =========================================
     PINCH ZOOM REFS
  ========================================= */

  const initialDistance = React.useRef<number | null>(null);
  const initialScale = React.useRef(1);

  /* =========================================
     COLOR LOGIC
  ========================================= */

  const getActiveColor = () => {
    if (store.isEraser) return colors.canvas;
    if (store.color) return store.color;
    // Default: Black in light mode, White in dark mode
    return theme === 'light' ? '#000000' : '#ffffff';
  };

  /* =========================================
     PAN RESPONDER
  ========================================= */

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (e: any) => {
      const touches = e.nativeEvent.touches;

      if (touches.length === 2) {
        const d = pinchDistance(
          { x: touches[0].locationX, y: touches[0].locationY },
          { x: touches[1].locationX, y: touches[1].locationY }
        );
        initialDistance.current = d;
        initialScale.current = store.scale;
        return;
      }

      const { locationX, locationY } = e.nativeEvent;
      const pt = screenToCanvas(locationX, locationY, store.offset, store.scale);
      currentPoints.current = [pt];
      setLivePoints(pointsToPath([pt]));
    },

    onPanResponderMove: (e: any) => {
      const touches = e.nativeEvent.touches;

      if (touches.length === 2 && initialDistance.current) {
        const d = pinchDistance(
          { x: touches[0].locationX, y: touches[0].locationY },
          { x: touches[1].locationX, y: touches[1].locationY }
        );
        const newScale = Math.max(0.3, Math.min(5, initialScale.current * (d / initialDistance.current)));
        store.setScale(newScale);
        return;
      }

      const { locationX, locationY } = e.nativeEvent;
      const pt = screenToCanvas(locationX, locationY, store.offset, store.scale);
      currentPoints.current.push(pt);
      setLivePoints(pointsToPath(currentPoints.current));
    },

    onPanResponderRelease: () => {
      initialDistance.current = null;
      if (currentPoints.current.length < 2) {
        currentPoints.current = [];
        setLivePoints('');
        return;
      }

      const stroke: Stroke = {
        id: `s-${++strokeId.current}`,
        points: [...currentPoints.current],
        color: getActiveColor(),
        strokeWidth: store.strokeWidth,
        isEraser: store.isEraser,
      };

      store.executeCommand(new AddStrokeCommand(stroke, store.activeLayerId));
      currentPoints.current = [];
      setLivePoints('');
    },
  });

  const handleSave = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt('Save Drawing', 'Enter a name for your drawing:', async (name: string) => {
        if (name && name.trim()) {
          saveWithTitle(name.trim());
        }
      });
    } else {
      // Simple fallback for Android since Alert.prompt is iOS only
      const defaultName = `Drawing ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      Alert.alert(
        'Save Drawing',
        'Save this drawing to your gallery?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: () => saveWithTitle(defaultName) },
        ]
      );
    }
  };

  const saveWithTitle = async (title: string) => {
    try {
      await store.saveDrawing(title);
      showToast(`Saved "${title}"`, 'success');
    } catch (error) {
      showToast('Save failed', 'error');
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="brush" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Canvas</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <View style={[styles.canvasContainer, { backgroundColor: colors.canvas }]} {...panResponder.panHandlers}>
        <Svg width={width} height="100%">
          <G scale={store.scale} x={store.offset.x} y={store.offset.y}>
            {store.layers
              .filter((l) => l.visible)
              .map((layer) => (
                <G key={layer.id}>
                  {layer.strokes.map((s) => (
                    <Path
                      key={s.id}
                      d={pointsToPath(s.points)}
                      stroke={s.isEraser ? colors.canvas : s.color}
                      strokeWidth={s.strokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </G>
              ))}

            {livePoints ? (
              <Path
                d={livePoints}
                stroke={getActiveColor()}
                strokeWidth={store.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </G>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  canvasContainer: {
    flex: 1,
    overflow: 'hidden',
  },
});