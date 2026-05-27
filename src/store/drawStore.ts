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
  loadDrawings: () => Promise<SavedDrawing[]>;
}

/* =========================
   STORE IMPLEMENTATION
========================= */

export const useDrawStore = create<DrawState>((set, get) => ({
  /* ---------- Initial State ---------- */

  layers: [
    {
      id: 'layer-1',
      name: 'Layer 1',
      visible: true,
      strokes: [],
    },
  ],

  activeLayerId: 'layer-1',

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

  saveDrawing: async (name: string) => {
    try {
      const key = 'drawcanvas:drawings';

      const existing = await AsyncStorage.getItem(key);

      const drawings: SavedDrawing[] = existing
        ? JSON.parse(existing)
        : [];

      const newDrawing: SavedDrawing = {
        id: Date.now().toString(),
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        thumbnail: '', // Add thumbnail later
        layers: get().layers,
      };

      await AsyncStorage.setItem(
        key,
        JSON.stringify([...drawings, newDrawing])
      );
    } catch (error) {
      console.error('Failed to save drawing:', error);
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