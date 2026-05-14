// ─────────────────────────────────────────────────────────────────────────────
// utils/viewport.ts
// Helpers for converting between screen (DOM) coordinates and canvas (logical)
// coordinates, and for computing new viewport states after pan / zoom.
// ─────────────────────────────────────────────────────────────────────────────

import type { Viewport } from '../types/shapes';
import type { Point } from './geometry';
import { clamp } from './geometry';

// ─── Coordinate conversion ────────────────────────────────────────────────────

/**
 * Convert a screen-space point (relative to the container element's top-left)
 * into canvas logical coordinates.
 *
 * canvas = (screen - offset) / scale
 */
export function screenToCanvas(screen: Point, viewport: Viewport): Point {
  return {
    x: (screen.x - viewport.offsetX) / viewport.scale,
    y: (screen.y - viewport.offsetY) / viewport.scale,
  };
}

/**
 * Convert a canvas logical point into screen-space coordinates.
 *
 * screen = canvas * scale + offset
 */
export function canvasToScreen(canvas: Point, viewport: Viewport): Point {
  return {
    x: canvas.x * viewport.scale + viewport.offsetX,
    y: canvas.y * viewport.scale + viewport.offsetY,
  };
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 8;
export const ZOOM_STEP = 0.1;

/**
 * Compute a new viewport after zooming by `delta` (positive = in, negative = out)
 * around `focalPoint` (in screen coordinates).
 *
 * The focal point remains stationary on screen — i.e. the canvas point under
 * the pointer does not move.
 */
export function zoomAroundPoint(
  viewport: Viewport,
  delta: number,
  focalScreen: Point,
): Viewport {
  const newScale = clamp(viewport.scale + delta, MIN_SCALE, MAX_SCALE);
  if (newScale === viewport.scale) return viewport;

  // The canvas point under the focal screen position must stay fixed.
  // focalCanvas = (focalScreen - offset) / scale  →  constant
  // newOffset = focalScreen - focalCanvas * newScale
  const focalCanvasX = (focalScreen.x - viewport.offsetX) / viewport.scale;
  const focalCanvasY = (focalScreen.y - viewport.offsetY) / viewport.scale;

  return {
    scale: newScale,
    offsetX: focalScreen.x - focalCanvasX * newScale,
    offsetY: focalScreen.y - focalCanvasY * newScale,
  };
}

/**
 * Compute the zoom delta from a wheel event's `deltaY`.
 * Normalises trackpad vs. mouse-wheel sensitivity.
 */
export function wheelDeltaToZoom(deltaY: number): number {
  // Trackpad events tend to produce small deltaY values; mouse wheels produce
  // larger jumps (typically ±100 or ±120).
  const sensitivity = Math.abs(deltaY) > 50 ? 0.1 : 0.02;
  return deltaY < 0 ? sensitivity : -sensitivity;
}

/**
 * Zoom in by one step around the center of the container.
 */
export function zoomIn(viewport: Viewport, containerWidth: number, containerHeight: number): Viewport {
  const center: Point = { x: containerWidth / 2, y: containerHeight / 2 };
  return zoomAroundPoint(viewport, ZOOM_STEP, center);
}

/**
 * Zoom out by one step around the center of the container.
 */
export function zoomOut(viewport: Viewport, containerWidth: number, containerHeight: number): Viewport {
  const center: Point = { x: containerWidth / 2, y: containerHeight / 2 };
  return zoomAroundPoint(viewport, -ZOOM_STEP, center);
}

/**
 * Reset zoom to 100 % while keeping the current pan offset.
 */
export function resetZoom(viewport: Viewport): Viewport {
  return { ...viewport, scale: 1 };
}

// ─── Pan ──────────────────────────────────────────────────────────────────────

/**
 * Compute a new viewport after panning by `(dx, dy)` screen pixels.
 */
export function panViewport(viewport: Viewport, dx: number, dy: number): Viewport {
  return {
    ...viewport,
    offsetX: viewport.offsetX + dx,
    offsetY: viewport.offsetY + dy,
  };
}

/**
 * Compute the offsets required to center the logical canvas (CANVAS_WIDTH x CANVAS_HEIGHT)
 * within a container of size (containerW x containerH) at a given scale.
 */
export function centerCanvas(
  containerW: number,
  containerH: number,
  canvasW: number,
  canvasH: number,
  scale: number,
): { offsetX: number; offsetY: number } {
  return {
    offsetX: (containerW - canvasW * scale) / 2,
    offsetY: (containerH - canvasH * scale) / 2,
  };
}

// ─── Display helpers ──────────────────────────────────────────────────────────

/**
 * Format the current scale as a percentage string, e.g. "100%" or "42%".
 */
export function formatZoomPercent(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}
