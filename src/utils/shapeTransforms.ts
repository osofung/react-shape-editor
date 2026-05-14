// ─────────────────────────────────────────────────────────────────────────────
// utils/shapeTransforms.ts
// Pure functions that produce updated shape objects for move, resize, and
// rotate operations.  None of these mutate state directly — they return new
// shape objects that the caller can place into React state.
// ─────────────────────────────────────────────────────────────────────────────

import type { BaseShape, Shape } from '../types/shapes';
import type { ResizeHandle } from '../types/shapes';
import { rectCenter, rotatePoint, normalizeAngle, snapAngle, enforceMinSize } from './geometry';
import type { Point } from './geometry';

// ─── Move ─────────────────────────────────────────────────────────────────────

/**
 * Return a shape translated by `(dx, dy)` canvas pixels.
 */
export function moveShape<T extends BaseShape>(shape: T, dx: number, dy: number): T {
  return { ...shape, x: shape.x + dx, y: shape.y + dy };
}

// ─── Resize ───────────────────────────────────────────────────────────────────

/**
 * Compute the new bounding box after dragging a resize handle.
 *
 * The resize is performed in the shape's local (un-rotated) coordinate space:
 *  1. Un-rotate the pointer position into local space.
 *  2. Adjust the relevant edge(s) based on which handle is active.
 *  3. Re-derive x, y, width, height from the adjusted edges.
 *
 * When `preserveAspectRatio` is true (Shift held), the shorter axis is scaled
 * proportionally to the longer axis change.
 */
export function resizeShape<T extends BaseShape>(
  shape: T,
  handle: ResizeHandle,
  pointerCanvas: Point,
  preserveAspectRatio = false,
): T {
  const center = rectCenter(shape);

  // Un-rotate the pointer into the shape's local coordinate space.
  const local = rotatePoint(pointerCanvas, center, -shape.rotation);

  // Current edges in local space.
  let left   = shape.x;
  let right  = shape.x + shape.width;
  let top    = shape.y;
  let bottom = shape.y + shape.height;

  // Adjust the relevant edges.
  if (handle.includes('w')) left   = local.x;
  if (handle.includes('e')) right  = local.x;
  if (handle.includes('n')) top    = local.y;
  if (handle.includes('s')) bottom = local.y;

  let newWidth  = right - left;
  let newHeight = bottom - top;

  // Enforce minimum size (prevent inversion / zero-size).
  const minSize = 4;
  if (newWidth  < minSize) { if (handle.includes('w')) left  = right  - minSize; else right  = left  + minSize; newWidth  = minSize; }
  if (newHeight < minSize) { if (handle.includes('n')) top   = bottom - minSize; else bottom = top   + minSize; newHeight = minSize; }

  // Aspect-ratio preservation for corner handles.
  if (preserveAspectRatio && (handle === 'nw' || handle === 'ne' || handle === 'sw' || handle === 'se')) {
    const origAspect = shape.width / shape.height;
    if (Math.abs(newWidth / newHeight) > origAspect) {
      // Width is the dominant axis — scale height to match.
      const scaledH = newWidth / origAspect;
      if (handle.includes('n')) top    = bottom - scaledH; else bottom = top    + scaledH;
      newHeight = scaledH;
    } else {
      // Height is the dominant axis — scale width to match.
      const scaledW = newHeight * origAspect;
      if (handle.includes('w')) left   = right  - scaledW; else right  = left   + scaledW;
      newWidth = scaledW;
    }
  }

  return { ...shape, x: left, y: top, width: newWidth, height: newHeight };
}

// ─── Rotate ───────────────────────────────────────────────────────────────────

/**
 * Compute the new rotation angle after the user drags the rotation handle.
 *
 * @param shape          The shape being rotated.
 * @param pointerCanvas  Current pointer position in canvas coordinates.
 * @param snapToGrid     When true (Shift held), snaps to 45° increments.
 */
export function rotateShape<T extends BaseShape>(
  shape: T,
  pointerCanvas: Point,
  snapToGrid = false,
): T {
  const center = rectCenter(shape);
  const dx = pointerCanvas.x - center.x;
  const dy = pointerCanvas.y - center.y;

  // atan2 gives the angle from the positive-X axis; we want from the top (−Y).
  let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  angleDeg = normalizeAngle(angleDeg);
  if (snapToGrid) angleDeg = snapAngle(angleDeg, 45);

  return { ...shape, rotation: angleDeg };
}

// ─── Layer ordering ───────────────────────────────────────────────────────────

/**
 * Move a shape one step forward (higher zIndex) in the shapes array.
 * Returns a new array with the two adjacent shapes swapped.
 */
export function bringForward(shapes: Shape[], id: string): Shape[] {
  const idx = shapes.findIndex(s => s.id === id);
  if (idx < 0 || idx === shapes.length - 1) return shapes;
  const next = [...shapes];
  [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
  return reindexZIndex(next);
}

/**
 * Move a shape one step backward (lower zIndex) in the shapes array.
 */
export function sendBackward(shapes: Shape[], id: string): Shape[] {
  const idx = shapes.findIndex(s => s.id === id);
  if (idx <= 0) return shapes;
  const next = [...shapes];
  [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
  return reindexZIndex(next);
}

/** Reassign zIndex values to match array order (0 = bottom, n-1 = top). */
function reindexZIndex(shapes: Shape[]): Shape[] {
  return shapes.map((s, i) => ({ ...s, zIndex: i }));
}

// ─── Shape creation ───────────────────────────────────────────────────────────

/**
 * Generate a unique ID for a new shape.
 * Uses `crypto.randomUUID` when available, falls back to a timestamp string.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `shape-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
