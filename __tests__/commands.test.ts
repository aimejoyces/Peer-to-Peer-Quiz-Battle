import { AddStrokeCommand, ClearLayerCommand } from '../src/commands';
import { Stroke, DrawState } from '../src/store/drawStore';

const mockStroke: Stroke = {
  id: 's-1', points: [{x:0,y:0},{x:10,y:10}],
  color: '#fff', strokeWidth: 4, isEraser: false
};

const makeState = (): any => ({
  layers: [{ id: 'l-1', name: 'L1', visible: true, strokes: [] }]
});

// Test 1: AddStrokeCommand.execute adds stroke
test('AddStrokeCommand execute adds stroke to layer', () => {
  let state = makeState();
  const set = (fn: any) => { 
    const result = typeof fn === 'function' ? fn(state) : fn;
    state = { ...state, ...result };
  };
  const get = () => state as any;
  const cmd = new AddStrokeCommand(mockStroke, 'l-1');
  cmd.execute(get, set);
  expect(state.layers[0].strokes).toHaveLength(1);
  expect(state.layers[0].strokes[0].id).toBe('s-1');
});

// Test 2: AddStrokeCommand.undo removes stroke
test('AddStrokeCommand undo removes stroke from layer', () => {
  let state = { layers: [{ id: 'l-1', name: 'L1', visible: true,
    strokes: [mockStroke] }] };
  const set = (fn: any) => {
    const result = typeof fn === 'function' ? fn(state) : fn;
    state = { ...state, ...result };
  };
  const get = () => state as any;
  const cmd = new AddStrokeCommand(mockStroke, 'l-1');
  cmd.undo(get, set);
  expect(state.layers[0].strokes).toHaveLength(0);
});

// Test 3: ClearLayerCommand clears all strokes
test('ClearLayerCommand clears layer strokes', () => {
  let state = { layers: [{ id: 'l-1', name: 'L1', visible: true,
    strokes: [mockStroke] }] };
  const set = (fn: any) => {
    const result = typeof fn === 'function' ? fn(state) : fn;
    state = { ...state, ...result };
  };
  const get = () => state as any;
  const cmd = new ClearLayerCommand('l-1');
  cmd.execute(get, set);
  expect(state.layers[0].strokes).toHaveLength(0);
});

// Test 4: ClearLayerCommand undo restores strokes
test('ClearLayerCommand undo restores previous strokes', () => {
  let state = { layers: [{ id: 'l-1', name: 'L1', visible: true,
    strokes: [mockStroke] }] };
  const set = (fn: any) => {
    const result = typeof fn === 'function' ? fn(state) : fn;
    state = { ...state, ...result };
  };
  const get = () => state as any;
  const cmd = new ClearLayerCommand('l-1');
  cmd.execute(get, set);
  cmd.undo(get, set);
  expect(state.layers[0].strokes).toHaveLength(1);
});
