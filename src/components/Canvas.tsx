// ─────────────────────────────────────────────────────────────────────────────
// components/Canvas.tsx
// The central drawing and interaction surface.  Renders:
//   • A panned/zoomed SVG viewport
//   • The white canvas rectangle
//   • All shapes via ShapeRenderer
//   • The creation preview shape
//   • The selection overlay for the selected shape
//
// Pointer events are forwarded to useCanvasInteractions; wheel and middle-mouse
// events are forwarded to useViewport.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useCallback } from 'react';
import type { Shape, Viewport, ToolType } from '../types/shapes';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../types/shapes';
import ShapeRenderer from './ShapeRenderer';
import SelectionOverlay from './SelectionOverlay';
import type { PreviewShape } from '../hooks/useCanvasInteractions';

// ─── Cursor map ───────────────────────────────────────────────────────────────

function toolCursor(tool: ToolType, isPanning: boolean): string {
  if (isPanning) return 'grabbing';
  switch (tool) {
    case 'select':    return 'default';
    case 'rectangle':
    case 'ellipse':
    case 'text':      return 'crosshair';
    default:          return 'default';
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CanvasProps {
  shapes: Shape[];
  selectedId: string | null;
  activeTool: ToolType;
  viewport: Viewport;
  previewShape: PreviewShape;
  isPanning: boolean;

  // Pointer handlers from useCanvasInteractions
  onPointerDown: (e: React.PointerEvent<HTMLElement>, rect: DOMRect, vp: Viewport) => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>, rect: DOMRect, vp: Viewport) => void;
  onPointerUp:   (e: React.PointerEvent<HTMLElement>, rect: DOMRect, vp: Viewport) => void;

  // Viewport handlers from useViewport
  onWheel:      (e: React.WheelEvent<HTMLElement>) => void;
  onPanStart:   (e: React.MouseEvent<HTMLElement>) => boolean;
  onPanMove:    (e: React.MouseEvent<HTMLElement>) => void;
  onPanEnd:     () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Canvas: React.FC<CanvasProps> = ({
  shapes,
  selectedId,
  activeTool,
  viewport,
  previewShape,
  isPanning,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  onPanStart,
  onPanMove,
  onPanEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const getRect = useCallback((): DOMRect => {
    return containerRef.current!.getBoundingClientRect();
  }, []);

  // ── Pointer handlers ───────────────────────────────────────────────────────

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Let useViewport handle middle-mouse pan first.
    if (e.button === 1) {
      onPanStart(e as unknown as React.MouseEvent<HTMLElement>);
      return;
    }
    onPointerDown(e as unknown as React.PointerEvent<HTMLElement>, getRect(), viewport);
  }, [onPointerDown, onPanStart, getRect, viewport]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      onPanMove(e as unknown as React.MouseEvent<HTMLElement>);
      return;
    }
    onPointerMove(e as unknown as React.PointerEvent<HTMLElement>, getRect(), viewport);
  }, [onPointerMove, onPanMove, isPanning, getRect, viewport]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      onPanEnd();
      return;
    }
    onPointerUp(e as unknown as React.PointerEvent<HTMLElement>, getRect(), viewport);
  }, [onPointerUp, onPanEnd, isPanning, getRect, viewport]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    onWheel(e as unknown as React.WheelEvent<HTMLElement>);
  }, [onWheel]);

  // ── SVG transform ──────────────────────────────────────────────────────────

  const { scale, offsetX, offsetY } = viewport;
  const svgTransform = `translate(${offsetX}, ${offsetY}) scale(${scale})`;

  // ── Selected shape lookup ──────────────────────────────────────────────────

  const selectedShape = selectedId ? shapes.find(s => s.id === selectedId) ?? null : null;

  return (
    <div
      ref={containerRef}
      className="canvas-container"
      style={{ cursor: toolCursor(activeTool, isPanning) }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      // Prevent context menu on middle-click
      onContextMenu={e => e.preventDefault()}
    >
      <svg
        className="canvas-svg"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        <g transform={svgTransform}>
          {/* ── White canvas surface ─────────────────────────────────── */}
          <rect
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="#FFFFFF"
            rx={8}
            ry={8}
            className="canvas-surface"
          />

          {/* ── Shapes ──────────────────────────────────────────────── */}
          {shapes.map(shape => (
            <ShapeRenderer key={shape.id} shape={shape} />
          ))}

          {/* ── Creation preview ────────────────────────────────────── */}
          {previewShape && (
            <ShapeRenderer
              shape={{ ...previewShape, id: '__preview__', zIndex: 9999 } as Shape}
              isPreview
            />
          )}

          {/* ── Selection overlay ────────────────────────────────────── */}
          {selectedShape && (
            <SelectionOverlay shape={selectedShape} />
          )}
        </g>
      </svg>
    </div>
  );
};

export default Canvas;
