import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

/* =========================
   TYPES
========================= */

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  strokeWidth: number;
  isEraser: boolean;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  strokes: Stroke[];
}

export interface SavedDrawing {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  thumbnail: string;
  layers: Layer[];
}

export interface Command {
  execute: (
    get: () => DrawState,
    set: (
      partial:
        | Partial<DrawState>
        | ((state: DrawState) => Partial<DrawState>)
    ) => void
  ) => void;

  undo: (
    get: () => DrawState,
    set: (
      partial:
        | Partial<DrawState>
        | ((state: DrawState) => Partial<DrawState>)
    ) => void
  ) => void;
}

/* =========================
   STORE
========================= */

export interface DrawState {
  layers: Layer[];
  activeLayerId: string;
  currentDrawingId: string | null;

  color: string | null;
  strokeWidth: number;
  isEraser: boolean;

  history: Command[];
  redoStack: Command[];

  scale: number;
  offset: { x: number; y: number };

  // Actions
  executeCommand: (cmd: Command) => void;
  undo: () => void;
  redo: () => void;

  setColor: (c: string | null) => void;
  setStrokeWidth: (w: number) => void;
  setEraser: (on: boolean) => void;

  setActiveLayer: (id: string) => void;
  addLayer: () => void;

  setScale: (s: number) => void;
  setOffset: (o: { x: number; y: number }) => void;

  saveDrawing: (name: string) => Promise<void>;
  loadDrawing: (id: string) => Promise<void>;
  deleteDrawing: (id: string) => Promise<void>;
  resetCanvas: () => void;
  loadDrawings: () => Promise<SavedDrawing[]>;
}

/* =========================
   STORE IMPLEMENTATION
========================= */

const INITIAL_LAYERS = [
  {
    id: 'layer-1',
    name: 'Layer 1',
    visible: true,
    strokes: [],
  },
];

export const useDrawStore = create<DrawState>((set, get) => ({
  /* ---------- Initial State ---------- */

  layers: INITIAL_LAYERS,
  activeLayerId: 'layer-1',
  currentDrawingId: null,

  color: null,
  strokeWidth: 4,
  isEraser: false,

  history: [],
  redoStack: [],

  scale: 1,
  offset: { x: 0, y: 0 },

  /* ---------- Command System ---------- */

  executeCommand: (cmd) => {
    cmd.execute(get, set);

    set((state) => ({
      history: [...state.history, cmd],
      redoStack: [],
    }));
  },

  undo: () => {
    const { history } = get();

    if (!history.length) return;

    const cmd = history[history.length - 1];

    cmd.undo(get, set);

    set((state) => ({
      history: state.history.slice(0, -1),
      redoStack: [...state.redoStack, cmd],
    }));
  },

  redo: () => {
    const { redoStack } = get();

    if (!redoStack.length) return;

    const cmd = redoStack[redoStack.length - 1];

    cmd.execute(get, set);

    set((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      history: [...state.history, cmd],
    }));
  },

  /* ---------- Tool Settings ---------- */

  setColor: (color) => set({ color }),

  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),

  setEraser: (isEraser) => set({ isEraser }),

  /* ---------- Layers ---------- */

  setActiveLayer: (id) => set({ activeLayerId: id }),

  addLayer: () =>
    set((state) => ({
      layers: [
        ...state.layers,
        {
          id: `layer-${Date.now()}`,
          name: `Layer ${state.layers.length + 1}`,
          visible: true,
          strokes: [],
        },
      ],
    })),

  /* ---------- Canvas Transform ---------- */

  setScale: (scale) => set({ scale }),

  setOffset: (offset) => set({ offset }),

  /* ---------- Persistence ---------- */

  resetCanvas: () => set({
    layers: INITIAL_LAYERS,
    activeLayerId: 'layer-1',
    currentDrawingId: null,
    history: [],
    redoStack: [],
  }),

  saveDrawing: async (name: string) => {
    try {
      const key = 'drawcanvas:drawings';
      const existing = await AsyncStorage.getItem(key);
      let drawings: SavedDrawing[] = existing ? JSON.parse(existing) : [];

      const { currentDrawingId, layers } = get();
      const now = Date.now();

      if (currentDrawingId) {
        // Update existing
        drawings = drawings.map(d => 
          d.id === currentDrawingId 
            ? { ...d, name, updatedAt: now, layers } 
            : d
        );
      } else {
        // Create new
        const newDrawing: SavedDrawing = {
          id: now.toString(),
          name,
          createdAt: now,
          updatedAt: now,
          thumbnail: '', // Add thumbnail later
          layers,
        };
        drawings.push(newDrawing);
        set({ currentDrawingId: newDrawing.id });
      }

      await AsyncStorage.setItem(key, JSON.stringify(drawings));
    } catch (error) {
      console.error('Failed to save drawing:', error);
      throw error;
    }
  },

  loadDrawing: async (id: string) => {
    try {
      const drawings = await get().loadDrawings();
      const drawing = drawings.find(d => d.id === id);
      if (drawing) {
        set({
          layers: drawing.layers,
          activeLayerId: drawing.layers[0]?.id || 'layer-1',
          currentDrawingId: drawing.id,
          history: [],
          redoStack: [],
        });
      }
    } catch (error) {
      console.error('Failed to load drawing:', error);
    }
  },

  deleteDrawing: async (id: string) => {
    try {
      const key = 'drawcanvas:drawings';
      const drawings = await get().loadDrawings();
      const filtered = drawings.filter(d => d.id !== id);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
      
      if (get().currentDrawingId === id) {
        get().resetCanvas();
      }
    } catch (error) {
      console.error('Failed to delete drawing:', error);
      throw error;
    }
  },

  loadDrawings: async () => {
    try {
      const key = 'drawcanvas:drawings';
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load drawings:', error);
      return [];
    }
  },
}));