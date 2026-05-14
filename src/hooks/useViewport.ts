// ─────────────────────────────────────────────────────────────────────────────
// hooks/useViewport.ts
// Manages the canvas viewport (pan + zoom) state and exposes handlers for
// wheel zoom, middle-mouse pan, and the zoom control buttons.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react';
import type { Viewport } from '../types/shapes';
import { DEFAULT_VIEWPORT } from '../types/shapes';
import {
  zoomAroundPoint,
  zoomIn,
  zoomOut,
  resetZoom,
  panViewport,
  wheelDeltaToZoom,
  formatZoomPercent,
} from '../utils/viewport';
import type { Point } from '../utils/geometry';

export interface UseViewportReturn {
  /** Current viewport state. */
  viewport: Viewport;

  /** Formatted zoom percentage string, e.g. "100%". */
  zoomLabel: string;

  /**
   * Call this from a `onWheel` handler on the canvas container.
   * Zooms relative to the pointer position.
   */
  handleWheel: (e: React.WheelEvent<HTMLElement>) => void;

  /**
   * Call on `onMouseDown` to start a middle-mouse pan.
   * Returns `true` if the event was consumed (button === 1).
   */
  handlePanStart: (e: React.MouseEvent<HTMLElement>) => boolean;

  /**
   * Call on `onMouseMove` to continue an active pan.
   */
  handlePanMove: (e: React.MouseEvent<HTMLElement>) => void;

  /**
   * Call on `onMouseUp` / `onMouseLeave` to end an active pan.
   */
  handlePanEnd: () => void;

  /** Whether a pan is currently in progress. */
  isPanning: boolean;

  /** Zoom in by one step, centred on the container. */
  zoomInStep: (containerWidth: number, containerHeight: number) => void;

  /** Zoom out by one step, centred on the container. */
  zoomOutStep: (containerWidth: number, containerHeight: number) => void;

  /** Reset zoom to 100 % (pan is preserved). */
  resetZoomLevel: () => void;

  /** Directly set the viewport (e.g. for initialisation). */
  setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
}

export function useViewport(): UseViewportReturn {
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);

  // Pan state stored in a ref to avoid stale closures in mousemove.
  const panRef = useRef<{ lastX: number; lastY: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  // ── Wheel zoom ──────────────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent<HTMLElement>) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const focalScreen: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const delta = wheelDeltaToZoom(e.deltaY);
    setViewport(prev => zoomAroundPoint(prev, delta, focalScreen));
  }, []);

  // ── Middle-mouse pan ────────────────────────────────────────────────────────

  const handlePanStart = useCallback((e: React.MouseEvent<HTMLElement>): boolean => {
    if (e.button !== 1) return false; // only middle mouse
    e.preventDefault();
    panRef.current = { lastX: e.clientX, lastY: e.clientY };
    setIsPanning(true);
    return true;
  }, []);

  const handlePanMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!panRef.current) return;
    const dx = e.clientX - panRef.current.lastX;
    const dy = e.clientY - panRef.current.lastY;
    panRef.current = { lastX: e.clientX, lastY: e.clientY };
    setViewport(prev => panViewport(prev, dx, dy));
  }, []);

  const handlePanEnd = useCallback(() => {
    if (!panRef.current) return;
    panRef.current = null;
    setIsPanning(false);
  }, []);

  // ── Zoom controls ───────────────────────────────────────────────────────────

  const zoomInStep = useCallback((w: number, h: number) => {
    setViewport(prev => zoomIn(prev, w, h));
  }, []);

  const zoomOutStep = useCallback((w: number, h: number) => {
    setViewport(prev => zoomOut(prev, w, h));
  }, []);

  const resetZoomLevel = useCallback(() => {
    setViewport(prev => resetZoom(prev));
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const zoomLabel = formatZoomPercent(viewport.scale);

  return {
    viewport,
    zoomLabel,
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    isPanning,
    zoomInStep,
    zoomOutStep,
    resetZoomLevel,
    setViewport,
  };
}
