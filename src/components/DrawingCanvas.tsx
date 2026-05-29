import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { theme, colors } = useThemeStore();
  const insets = useSafeAreaInsets();

  // Current drawing points
  const currentPoints = React.useRef<Point[]>([]);

  // Live SVG path while drawing
  const [livePoints, setLivePoints] = React.useState('');

  // Stroke id counter
  const strokeId = React.useRef(Date.now());

  // Save Modal State
  const [saveModalVisible, setSaveModalVisible] = React.useState(false);
  const [drawingName, setDrawingName] = React.useState('');

  /* =========================================
     PINCH ZOOM REFS
  ========================================= */

  const initialDistance = React.useRef<number | null>(null);
  const initialScale = React.useRef(1);

  /* =========================================
     LIFECYCLE
  ========================================= */

  // Refresh drawing name when store changes (e.g. loading from gallery)
  React.useEffect(() => {
    if (store.currentDrawingId) {
      const fetchName = async () => {
        const drawings = await store.loadDrawings();
        const current = drawings.find(d => d.id === store.currentDrawingId);
        if (current) setDrawingName(current.name);
      };
      fetchName();
    } else {
      setDrawingName('');
    }
  }, [store.currentDrawingId]);

  /* =========================================
     COLOR LOGIC
  ========================================= */

  const getActiveColor = () => {
    if (store.isEraser) return colors.canvas;
    if (store.color) return store.color;
    if (theme === 'light') return '#000000';
    return '#ffffff';
  };

  const getLiveEraserColor = () => {
    return theme === 'light' ? '#cccccc' : '#444444';
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

  const handleSavePress = () => {
    if (store.layers.every(l => l.strokes.length === 0)) {
      showToast('Cannot save an empty drawing', 'error');
      return;
    }
    setSaveModalVisible(true);
  };

  const confirmSave = async () => {
    if (!drawingName.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }

    try {
      const isNew = !store.currentDrawingId;
      await store.saveDrawing(drawingName.trim());
      setSaveModalVisible(false);
      showToast(isNew ? 'Drawing saved!' : 'Drawing updated!', 'success');
      
      if (isNew) {
        // Clear canvas for new drawing
        store.resetCanvas();
        setDrawingName('');
      }
    } catch (error) {
      showToast('Failed to save', 'error');
    }
  };

  const handleNewDrawing = () => {
    if (!store.layers.every(l => l.strokes.length === 0)) {
      Alert.alert(
        'New Drawing',
        'Discard current drawing and start fresh?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'New Drawing', 
            style: 'destructive',
            onPress: () => {
              store.resetCanvas();
              setDrawingName('');
              showToast('Canvas cleared', 'info');
            }
          },
        ]
      );
    } else {
      store.resetCanvas();
      setDrawingName('');
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleNewDrawing} style={[styles.iconBtn, { backgroundColor: colors.surfaceLight }]}>
            <Ionicons name="document-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {store.currentDrawingId ? 'Editing' : 'Canvas'}
            </Text>
            {store.currentDrawingId && (
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {drawingName}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleSavePress}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>{store.currentDrawingId ? 'UPDATE' : 'SAVE'}</Text>
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
                stroke={store.isEraser ? getLiveEraserColor() : getActiveColor()}
                strokeWidth={store.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={store.isEraser ? 0.6 : 1}
              />
            ) : null}
          </G>
        </Svg>
      </View>

      {/* Save Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={saveModalVisible}
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {store.currentDrawingId ? 'Update Drawing' : 'Save Drawing'}
            </Text>
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Enter a name for your masterpiece
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={drawingName}
              onChangeText={setDrawingName}
              placeholder="My Drawing"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setSaveModalVisible(false)}
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSave}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    paddingHorizontal: 14,
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
    fontSize: 11,
  },
  canvasContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
