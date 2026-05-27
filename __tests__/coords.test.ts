import { screenToCanvas, canvasToScreen, pinchDistance } from '../src/utils/coords';

// Test 5: screenToCanvas with no offset/scale
test('screenToCanvas at scale 1 no offset returns same coords', () => {
  const result = screenToCanvas(100, 200, { x: 0, y: 0 }, 1);
  expect(result).toEqual({ x: 100, y: 200 });
});

// Test 6: screenToCanvas with scale
test('screenToCanvas at scale 2 halves coordinates', () => {
  const result = screenToCanvas(100, 200, { x: 0, y: 0 }, 2);
  expect(result).toEqual({ x: 50, y: 100 });
});

// Test 7: screenToCanvas with offset
test('screenToCanvas accounts for pan offset', () => {
  const result = screenToCanvas(150, 250, { x: 50, y: 50 }, 1);
  expect(result).toEqual({ x: 100, y: 200 });
});

// Test 8: canvasToScreen round-trips correctly
test('canvasToScreen is inverse of screenToCanvas', () => {
  const offset = { x: 30, y: 40 };
  const scale = 1.5;
  const screen = { x: 180, y: 220 };
  const canvas = screenToCanvas(screen.x, screen.y, offset, scale);
  const back = canvasToScreen(canvas.x, canvas.y, offset, scale);
  expect(back.x).toBeCloseTo(screen.x);
  expect(back.y).toBeCloseTo(screen.y);
});

// Test 9: pinchDistance calculates correctly
test('pinchDistance returns correct Euclidean distance', () => {
  const d = pinchDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
  expect(d).toBe(5);
});

// Test 10: eraser stroke flag
test('eraser stroke has isEraser = true', () => {
  const eraserStroke = { id: 'e-1', points: [], color: '#000',
    strokeWidth: 10, isEraser: true };
  expect(eraserStroke.isEraser).toBe(true);
});