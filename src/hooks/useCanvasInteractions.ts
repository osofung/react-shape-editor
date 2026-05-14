// ─────────────────────────────────────────────────────────────────────────────
// hooks/useCanvasInteractions.ts
// Central state machine for all canvas pointer interactions:
//   • Shape creation (drag to draw)
//   • Shape selection (click)
//   • Shape moving (drag body)
//   • Shape resizing (drag handle)
//   • Shape rotating (drag rotation handle)
//
// Viewport pan/zoom is handled separately in useViewport.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react';
import type {
  Shape,
  ToolType,
  ShapeType,
  DragOperation,
  Viewport,
} from '../types/shapes';
import {
  DEFAULT_SHAPE_PROPS,
  DEFAULT_TEXT_PROPS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../types/shapes';
import { screenToCanvas } from '../utils/viewport';
import { topShapeAtPoint, hitTestResizeHandle, hitTestRotationHandle } from '../utils/hitTest';
import { moveShape, resizeShape, rotateShape, bringForward, sendBackward, generateId } from '../utils/shapeTransforms';
import { normalizeRect, enforceMinSize, rectCenter } from '../utils/geometry';
import type { Point } from '../utils/geometry';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Preview shape shown while the user is dragging to create a new shape. */
export type PreviewShape = Omit<Shape, 'id' | 'zIndex'> | null;

export interface UseCanvasInteractionsReturn {
  shapes: Shape[];
  selectedId: string | null;
  activeTool: ToolType;
  previewShape: PreviewShape;
  isDragging: boolean;

  setActiveTool: (tool: ToolType) => void;
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  setSelectedId: (id: string | null) => void;

  /** Update a single property on the currently selected shape. */
  updateShape: (id: string, patch: Partial<Shape>) => void;

  /** Delete a shape by id. */
  deleteShape: (id: string) => void;

  /** Duplicate a shape by id. */
  duplicateShape: (id: string) => void;

  /** Layer ordering. */
  bringForwardSelected: () => void;
  sendBackwardSelected: () => void;

  // ── Pointer event handlers (attach to the canvas container) ──────────────
  onPointerDown: (e: React.PointerEvent<HTMLElement>, containerRect: DOMRect, viewport: Viewport) => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>, containerRect: DOMRect, viewport: Viewport) => void;
  onPointerUp:   (e: React.PointerEvent<HTMLElement>, containerRect: DOMRect, viewport: Viewport) => void;
}

// ─── Minimum drag distance before a click becomes a drag ─────────────────────
const DRAG_THRESHOLD = 3; // pixels (screen space)

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCanvasInteractions(): UseCanvasInteractionsReturn {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [previewShape, setPreviewShape] = useState<PreviewShape>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Mutable ref for the current drag operation (avoids stale closures).
  const dragRef = useRef<DragOperation | null>(null);
  // Track whether the pointer has moved beyond the drag threshold.
  const hasDraggedRef = useRef(false);
  // Snapshot of shapes at drag start (for resize/rotate).
  const shapesSnapshotRef = useRef<Shape[]>([]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const screenToCanvasPoint = (e: React.PointerEvent<HTMLElement>, rect: DOMRect, vp: Viewport): Point =>
    screenToCanvas({ x: e.clientX - rect.left, y: e.clientY - rect.top }, vp);

  // ── Shape mutations ──────────────────────────────────────────────────────────

  const updateShape = useCallback((id: string, patch: Partial<Shape>) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...patch } as Shape : s));
  }, []);

  const deleteShape = useCallback((id: string) => {
    setShapes(prev => prev.filter(s => s.id !== id));
    setSelectedId(prev => prev === id ? null : prev);
  }, []);

  const duplicateShape = useCallback((id: string) => {
    setShapes(prev => {
      const src = prev.find(s => s.id === id);
      if (!src) return prev;
      const copy: Shape = { ...src, id: generateId(), x: src.x + 16, y: src.y + 16, zIndex: prev.length } as Shape;
      return [...prev, copy];
    });
  }, []);

  const bringForwardSelected = useCallback(() => {
    if (!selectedId) return;
    setShapes(prev => bringForward(prev, selectedId));
  }, [selectedId]);

  const sendBackwardSelected = useCallback(() => {
    if (!selectedId) return;
    setShapes(prev => sendBackward(prev, selectedId));
  }, [selectedId]);

  // ── Pointer down ─────────────────────────────────────────────────────────────

  const onPointerDown = useCallback((
    e: React.PointerEvent<HTMLElement>,
    containerRect: DOMRect,
    viewport: Viewport,
  ) => {
    // Middle mouse is handled by useViewport — ignore here.
    if (e.button === 1) return;
    if (e.button !== 0) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    hasDraggedRef.current = false;

    const canvasPoint = screenToCanvasPoint(e, containerRect, viewport);

    if (activeTool === 'select') {
      // Check if we're over a handle of the selected shape first.
      if (selectedId) {
        const selected = shapes.find(s => s.id === selectedId);
        if (selected) {
          // Rotation handle?
          if (hitTestRotationHandle(selected, canvasPoint)) {
            const center = rectCenter(selected);
            const dx = canvasPoint.x - center.x;
            const dy = canvasPoint.y - center.y;
            const startAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            dragRef.current = {
              kind: 'rotate',
              shapeId: selectedId,
              startAngle,
              originRotation: selected.rotation,
              cx: center.x,
              cy: center.y,
            };
            shapesSnapshotRef.current = shapes;
            setIsDragging(true);
            return;
          }
          // Resize handle?
          const handle = hitTestResizeHandle(selected, canvasPoint);
          if (handle) {
            dragRef.current = {
              kind: 'resize',
              shapeId: selectedId,
              handle,
              startX: canvasPoint.x,
              startY: canvasPoint.y,
              originShape: { ...selected },
            };
            shapesSnapshotRef.current = shapes;
            setIsDragging(true);
            return;
          }
        }
      }

      // Hit-test shapes for selection / move.
      const hit = topShapeAtPoint(shapes, canvasPoint);
      if (hit) {
        setSelectedId(hit.id);
        dragRef.current = {
          kind: 'move',
          shapeId: hit.id,
          startX: canvasPoint.x,
          startY: canvasPoint.y,
          originX: hit.x,
          originY: hit.y,
        };
        shapesSnapshotRef.current = shapes;
        setIsDragging(true);
      } else {
        // Clicked empty canvas — deselect.
        setSelectedId(null);
        dragRef.current = null;
      }
    } else {
      // Creation tool — start a drag-to-create operation.
      dragRef.current = {
        kind: 'create',
        shapeType: activeTool as ShapeType,
        startX: canvasPoint.x,
        startY: canvasPoint.y,
      };
      setIsDragging(true);
    }
  }, [activeTool, selectedId, shapes]);

  // ── Pointer move ─────────────────────────────────────────────────────────────

  const onPointerMove = useCallback((
    e: React.PointerEvent<HTMLElement>,
    containerRect: DOMRect,
    viewport: Viewport,
  ) => {
    if (!dragRef.current) return;

    const canvasPoint = screenToCanvasPoint(e, containerRect, viewport);
    const op = dragRef.current;

    // Mark as a real drag once threshold is exceeded.
    if (!hasDraggedRef.current) {
      const startScreen = op.kind === 'create'
        ? screenToCanvas({ x: op.startX, y: op.startY }, viewport)
        : { x: op.startX, y: op.startY };
      const dx = e.clientX - containerRect.left - (startScreen.x * viewport.scale + viewport.offsetX);
      const dy = e.clientY - containerRect.top  - (startScreen.y * viewport.scale + viewport.offsetY);
      if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
      hasDraggedRef.current = true;
    }

    if (op.kind === 'create') {
      const rect = normalizeRect({
        x: op.startX,
        y: op.startY,
        width: canvasPoint.x - op.startX,
        height: canvasPoint.y - op.startY,
      });
      const sized = enforceMinSize(rect, 1, 1);
      const base = op.shapeType === 'text'
        ? { ...DEFAULT_TEXT_PROPS, ...sized, type: 'text' as const, rotation: 0 }
        : { ...DEFAULT_SHAPE_PROPS, ...sized, type: op.shapeType as 'rectangle' | 'ellipse' };
      setPreviewShape(base as PreviewShape);
    }

    if (op.kind === 'move') {
      const dx = canvasPoint.x - op.startX;
      const dy = canvasPoint.y - op.startY;
      setShapes(prev =>
        prev.map(s => s.id === op.shapeId ? moveShape(s, dx, dy) : s)
      );
      // Update origin so next move delta is relative to current position.
      dragRef.current = { ...op, startX: canvasPoint.x, startY: canvasPoint.y };
    }

    if (op.kind === 'resize') {
      setShapes(prev =>
        prev.map(s => {
          if (s.id !== op.shapeId) return s;
          return resizeShape(s, op.handle, canvasPoint, e.shiftKey);
        })
      );
    }

    if (op.kind === 'rotate') {
      setShapes(prev =>
        prev.map(s => {
          if (s.id !== op.shapeId) return s;
          return rotateShape(s, canvasPoint, e.shiftKey);
        })
      );
    }
  }, []);

  // ── Pointer up ───────────────────────────────────────────────────────────────

  const onPointerUp = useCallback((
    e: React.PointerEvent<HTMLElement>,
    containerRect: DOMRect,
    viewport: Viewport,
  ) => {
    const op = dragRef.current;
    if (!op) return;

    const canvasPoint = screenToCanvasPoint(e, containerRect, viewport);

    if (op.kind === 'create' && hasDraggedRef.current) {
      // Commit the preview shape to the shapes array.
      const rect = normalizeRect({
        x: op.startX,
        y: op.startY,
        width: canvasPoint.x - op.startX,
        height: canvasPoint.y - op.startY,
      });
      const sized = enforceMinSize(rect);

      setShapes(prev => {
        const newShape: Shape = op.shapeType === 'text'
          ? {
              ...DEFAULT_TEXT_PROPS,
              ...sized,
              id: generateId(),
              type: 'text',
              rotation: 0,
              zIndex: prev.length,
            }
          : {
              ...DEFAULT_SHAPE_PROPS,
              ...sized,
              id: generateId(),
              type: op.shapeType as 'rectangle' | 'ellipse',
              zIndex: prev.length,
            };
        const next = [...prev, newShape];
        setSelectedId(newShape.id);
        return next;
      });

      // Switch back to select tool after creation.
      setActiveTool('select');
    }

    setPreviewShape(null);
    dragRef.current = null;
    hasDraggedRef.current = false;
    setIsDragging(false);
  }, []);

  return {
    shapes,
    selectedId,
    activeTool,
    previewShape,
    isDragging,
    setActiveTool,
    setShapes,
    setSelectedId,
    updateShape,
    deleteShape,
    duplicateShape,
    bringForwardSelected,
    sendBackwardSelected,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
