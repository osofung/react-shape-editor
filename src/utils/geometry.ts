// ─────────────────────────────────────────────────────────────────────────────
// utils/geometry.ts
// Pure geometric helpers: points, angles, bounding boxes.
// No React or DOM dependencies — all functions are plain math.
// ─────────────────────────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Angle utilities ──────────────────────────────────────────────────────────

/** Convert degrees to radians. */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert radians to degrees. */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Normalise an angle (degrees) to the range [0, 360).
 */
export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Snap an angle to the nearest multiple of `step` degrees.
 * Used when the user holds Shift while rotating.
 */
export function snapAngle(deg: number, step = 45): number {
  return Math.round(deg / step) * step;
}

// ─── Point utilities ──────────────────────────────────────────────────────────

/** Euclidean distance between two points. */
export function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/**
 * Rotate a point around a given center by `angleDeg` degrees (clockwise).
 */
export function rotatePoint(point: Point, center: Point, angleDeg: number): Point {
  const rad = degToRad(angleDeg);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

// ─── Bounding box utilities ───────────────────────────────────────────────────

/** Return the center point of a bounding-box rect. */
export function rectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

/**
 * Compute the axis-aligned bounding box (AABB) of a rotated rectangle.
 * Useful for rough hit-testing before doing precise rotated checks.
 */
export function rotatedAABB(rect: Rect, angleDeg: number): Rect {
  const center = rectCenter(rect);
  const corners: Point[] = [
    { x: rect.x,              y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x,              y: rect.y + rect.height },
  ];
  const rotated = corners.map(c => rotatePoint(c, center, angleDeg));
  const xs = rotated.map(p => p.x);
  const ys = rotated.map(p => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
  };
}

/**
 * Clamp a value between `min` and `max`.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Return a rect normalised so that width and height are always positive,
 * adjusting x/y accordingly.  Needed when the user drags "backwards" during
 * shape creation.
 */
export function normalizeRect(rect: Rect): Rect {
  let { x, y, width, height } = rect;
  if (width < 0) { x += width; width = -width; }
  if (height < 0) { y += height; height = -height; }
  return { x, y, width, height };
}

/**
 * Enforce a minimum size on a rect without moving its top-left corner.
 */
export function enforceMinSize(rect: Rect, minW = 4, minH = 4): Rect {
  return {
    ...rect,
    width: Math.max(rect.width, minW),
    height: Math.max(rect.height, minH),
  };
}
