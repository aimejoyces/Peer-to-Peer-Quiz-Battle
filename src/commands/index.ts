import { Command, Stroke, Layer, DrawState } from '../store/drawStore';

// ---- AddStrokeCommand ----
export class AddStrokeCommand implements Command {
  constructor(private stroke: Stroke, private layerId: string) {}

  execute(get: () => DrawState, set: (partial: Partial<DrawState> | ((state: DrawState) => Partial<DrawState>)) => void) {
    set((s: DrawState) => ({
      layers: s.layers.map(l =>
        l.id === this.layerId
          ? { ...l, strokes: [...l.strokes, this.stroke] }
          : l
      )
    }));
  }

  undo(get: () => DrawState, set: (partial: Partial<DrawState> | ((state: DrawState) => Partial<DrawState>)) => void) {
    set((s: DrawState) => ({
      layers: s.layers.map(l =>
        l.id === this.layerId
          ? { ...l, strokes: l.strokes.filter(st => st.id !== this.stroke.id) }
          : l
      )
    }));
  }
}

// ---- ClearLayerCommand ----
export class ClearLayerCommand implements Command {
  private prevStrokes: Stroke[] = [];

  constructor(private layerId: string) {}

  execute(get: () => DrawState, set: (partial: Partial<DrawState> | ((state: DrawState) => Partial<DrawState>)) => void) {
    const layer = get().layers.find((l: Layer) => l.id === this.layerId);
    this.prevStrokes = layer?.strokes ?? [];
    set((s: DrawState) => ({
      layers: s.layers.map(l =>
        l.id === this.layerId ? { ...l, strokes: [] } : l
      )
    }));
  }

  undo(get: () => DrawState, set: (partial: Partial<DrawState> | ((state: DrawState) => Partial<DrawState>)) => void) {
    set((s: DrawState) => ({
      layers: s.layers.map(l =>
        l.id === this.layerId ? { ...l, strokes: this.prevStrokes } : l
      )
    }));
  }
}
