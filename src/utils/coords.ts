export interface Point { x: number; y: number; }

/**
 * Convert screen touch coordinates to canvas coordinates
 * given the current pan offset and zoom scale.
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  offset: Point,
  scale: number
): Point {
  return {
    x: (screenX - offset.x) / scale,
    y: (screenY - offset.y) / scale,
  };
}

/**
 * Convert canvas coordinates back to screen coordinates.
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  offset: Point,
  scale: number
): Point {
  return {
    x: canvasX * scale + offset.x,
    y: canvasY * scale + offset.y,
  };
}

/**
 * Calculate distance between two touch points (for pinch).
 */
export function pinchDistance(p1: Point, p2: Point): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
  );
}

/**
 * Calculate midpoint between two touch points.
 */
export function pinchMidpoint(p1: Point, p2: Point): Point {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}