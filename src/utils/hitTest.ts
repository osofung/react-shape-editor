// ─────────────────────────────────────────────────────────────────────────────
// utils/hitTest.ts
// Determines whether a canvas-space point lands inside a given shape,
// accounting for rotation.  Also exposes handle hit-testing for the
// selection overlay.
// ─────────────────────────────────────────────────────────────────────────────

import type { Shape, BaseShape } from '../types/shapes';
import type { ResizeHandle } from '../types/shapes';
import { rotatePoint, rectCenter, degToRad } from './geometry';
import type { Point } from './geometry';

// ─── Shape body hit-test ──────────────────────────────────────────────────────

/**
 * Test whether `point` (in canvas/logical coordinates) is inside `shape`.
 *
 * Strategy:
 *  1. Un-rotate the point around the shape's center by `-rotation`.
 *  2. Test the un-rotated point against the axis-aligned bounding box.
 *  3. For ellipses, apply the ellipse equation instead of the AABB test.
 */
export function hitTestShape(shape: BaseShape, point: Point): boolean {
  const center = rectCenter(shape);

  // Un-rotate the point into the shape's local coordinate space.
  const local = rotatePoint(point, center, -shape.rotation);

  const left   = shape.x;
  const right  = shape.x + shape.width;
  const top    = shape.y;
  const bottom = shape.y + shape.height;

  if (shape.type === 'ellipse') {
    // Ellipse equation: (dx/rx)² + (dy/ry)² <= 1
    const rx = shape.width  / 2;
    const ry = shape.height / 2;
    const dx = local.x - center.x;
    const dy = local.y - center.y;
    return (dx / rx) ** 2 + (dy / ry) ** 2 <= 1;
  }

  // Rectangle and Text: axis-aligned bounding box test.
  return local.x >= left && local.x <= right && local.y >= top && local.y <= bottom;
}

/**
 * Find the topmost shape (highest zIndex) that contains `point`.
 * Returns `undefined` if no shape is hit.
 */
export function topShapeAtPoint(shapes: Shape[], point: Point): Shape | undefined {
  // Iterate from the end (highest zIndex) to the start.
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (hitTestShape(shapes[i], point)) return shapes[i];
  }
  return undefined;
}

// ─── Handle hit-test ─────────────────────────────────────────────────────────

/** Pixel radius around a handle center that counts as a hit. */
const HANDLE_RADIUS = 8;

/** Pixel length of the rotation stem above the shape. */
export const ROTATION_STEM_LENGTH = 32;

/** Pixel radius of the rotation handle circle. */
export const ROTATION_HANDLE_RADIUS = 8;

/**
 * Returns the 8 resize handle positions (in canvas coordinates) for a shape.
 * Positions are already rotated to match the shape's current rotation.
 */
export function getResizeHandlePositions(shape: BaseShape): Record<ResizeHandle, Point> {
  const { x, y, width, height, rotation } = shape;
  const center = rectCenter(shape);

  const raw: Record<ResizeHandle, Point> = {
    nw: { x,              y              },
    n:  { x: x + width/2, y              },
    ne: { x: x + width,   y              },
    w:  { x,              y: y + height/2 },
    e:  { x: x + width,   y: y + height/2 },
    sw: { x,              y: y + height   },
    s:  { x: x + width/2, y: y + height   },
    se: { x: x + width,   y: y + height   },
  };

  const rotated = {} as Record<ResizeHandle, Point>;
  for (const [key, pt] of Object.entries(raw) as [ResizeHandle, Point][]) {
    rotated[key] = rotatePoint(pt, center, rotation);
  }
  return rotated;
}

/**
 * Returns the position of the rotation handle (in canvas coordinates).
 * The handle sits `ROTATION_STEM_LENGTH` pixels above the top-center of the
 * shape, rotated with the shape.
 */
export function getRotationHandlePosition(shape: BaseShape): Point {
  const center = rectCenter(shape);
  const topCenter: Point = { x: shape.x + shape.width / 2, y: shape.y };
  const stemEnd: Point   = { x: topCenter.x, y: topCenter.y - ROTATION_STEM_LENGTH };
  return rotatePoint(stemEnd, center, shape.rotation);
}

/**
 * Test whether `point` is over a resize handle.
 * Returns the handle key, or `null` if no handle is hit.
 */
export function hitTestResizeHandle(shape: BaseShape, point: Point): ResizeHandle | null {
  const handles = getResizeHandlePositions(shape);
  for (const [key, pos] of Object.entries(handles) as [ResizeHandle, Point][]) {
    const dx = point.x - pos.x;
    const dy = point.y - pos.y;
    if (Math.sqrt(dx * dx + dy * dy) <= HANDLE_RADIUS) return key;
  }
  return null;
}

/**
 * Test whether `point` is over the rotation handle.
 */
export function hitTestRotationHandle(shape: BaseShape, point: Point): boolean {
  const pos = getRotationHandlePosition(shape);
  const dx = point.x - pos.x;
  const dy = point.y - pos.y;
  return Math.sqrt(dx * dx + dy * dy) <= ROTATION_HANDLE_RADIUS;
}
