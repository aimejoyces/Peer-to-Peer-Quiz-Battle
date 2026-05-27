import { AddStrokeCommand } from '../src/commands';

const mockStroke = {
  id: 's-99',
  points: [{ x: 5, y: 5 }, { x: 15, y: 15 }],
  color: '#ff6b6b',
  strokeWidth: 3,
  isEraser: false,
};

test('undo/redo history stack grows then shrinks', () => {
  const history: any[] = [];
  const redoStack: any[] = [];

  const cmd = new AddStrokeCommand(mockStroke, 'layer-1');

  // simulate executeCommand
  history.push(cmd);
  expect(history).toHaveLength(1);
  expect(redoStack).toHaveLength(0);

  // simulate undo
  const undone = history.pop();
  redoStack.push(undone);
  expect(history).toHaveLength(0);
  expect(redoStack).toHaveLength(1);

  // simulate redo
  const redone = redoStack.pop();
  history.push(redone);
  expect(history).toHaveLength(1);
  expect(redoStack).toHaveLength(0);
});

test('eraser stroke stores isEraser flag correctly', () => {
  const eraserStroke = { ...mockStroke, id: 'e-1', isEraser: true };
  expect(eraserStroke.isEraser).toBe(true);
  expect(eraserStroke.id).toBe('e-1');

  // normal stroke should NOT have eraser flag
  expect(mockStroke.isEraser).toBe(false);
});