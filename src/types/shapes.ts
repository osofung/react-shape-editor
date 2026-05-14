// ─────────────────────────────────────────────────────────────────────────────
// types/shapes.ts
// Core data model for every object that lives on the canvas.
// ─────────────────────────────────────────────────────────────────────────────

/** The set of tools the user can activate from the Toolbar. */
export type ToolType = 'select' | 'rectangle' | 'ellipse' | 'text';

/** Every shape type supported in the first release. */
export type ShapeType = 'rectangle' | 'ellipse' | 'text';

// ─── Shared base ─────────────────────────────────────────────────────────────

/**
 * Properties shared by every shape on the canvas.
 * `x` and `y` represent the top-left corner of the shape's bounding box
 * *before* rotation is applied. Rotation is always around the shape's center.
 */
export interface BaseShape {
  id: string;
  type: ShapeType;

  /** Top-left X of the bounding box in canvas (logical) coordinates. */
  x: number;
  /** Top-left Y of the bounding box in canvas (logical) coordinates. */
  y: number;

  width: number;
  height: number;

  /** Rotation in degrees, clockwise, around the shape's center. */
  rotation: number;

  fillColor: string;
  borderWidth: number;
  borderColor: string;

  /**
   * Render order: higher values appear on top.
   * We keep this in sync with the shapes array order so either approach works.
   */
  zIndex: number;
}

// ─── Concrete shape types ─────────────────────────────────────────────────────

export interface RectangleShape extends BaseShape {
  type: 'rectangle';
}

export interface EllipseShape extends BaseShape {
  type: 'ellipse';
}

export interface TextShape extends BaseShape {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
}

/** Discriminated union of every concrete shape. */
export type Shape = RectangleShape | EllipseShape | TextShape;

// ─── Viewport ────────────────────────────────────────────────────────────────

/**
 * Describes the current pan/zoom state of the canvas viewport.
 * `offsetX` / `offsetY` are the pixel offsets of the canvas origin relative
 * to the container's top-left corner.
 */
export interface Viewport {
  scale: number;
  offsetX: number;
  offsetY: number;
}

// ─── Interaction state ────────────────────────────────────────────────────────

/** Which resize handle is being dragged (compass directions + corners). */
export type ResizeHandle =
  | 'nw' | 'n' | 'ne'
  | 'w'  |       'e'
  | 'sw' | 's' | 'se';

/** Describes the active drag operation in progress. */
export type DragOperation =
  | { kind: 'move';   shapeId: string; startX: number; startY: number; originX: number; originY: number }
  | { kind: 'resize'; shapeId: string; handle: ResizeHandle; startX: number; startY: number; originShape: BaseShape }
  | { kind: 'rotate'; shapeId: string; startAngle: number; originRotation: number; cx: number; cy: number }
  | { kind: 'create'; shapeType: ShapeType; startX: number; startY: number }
  | { kind: 'pan';    startX: number; startY: number; originOffsetX: number; originOffsetY: number };

// ─── Factory defaults ─────────────────────────────────────────────────────────

/** Default visual properties applied to every newly created shape. */
export const DEFAULT_SHAPE_PROPS = {
  fillColor: '#4A90D9',
  borderWidth: 1,
  borderColor: '#1A5FA8',
  rotation: 0,
} as const;

export const DEFAULT_TEXT_PROPS = {
  text: 'Text',
  fontSize: 16,
  fontFamily: 'Inter, sans-serif',
  textColor: '#1A1A1A',
  fillColor: 'transparent',
  borderWidth: 0,
  borderColor: 'transparent',
} as const;

export const DEFAULT_VIEWPORT: Viewport = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

// ─── Canvas dimensions ────────────────────────────────────────────────────────

/** Logical size of the white editing canvas in pixels. */
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;
