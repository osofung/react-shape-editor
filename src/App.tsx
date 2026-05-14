// ─────────────────────────────────────────────────────────────────────────────
// App.tsx
// Root component.  Owns the overall editor layout and wires together:
//   • useCanvasInteractions  — shape state + pointer event handlers
//   • useViewport            — pan / zoom state + navigation handlers
//   • Toolbar                — left tool selection panel
//   • PropertyBar            — top property editing panel
//   • Canvas                 — central drawing surface
//   • ZoomControls           — zoom buttons + percentage label
//
// Layout (dark shell):
//
//   ┌──────────────────────────────────────────────────────────┐
//   │  PropertyBar (top, full width)                           │
//   ├────────┬─────────────────────────────────────────────────┤
//   │        │                                                 │
//   │Toolbar │  Canvas (fills remaining space)                 │
//   │(left)  │                              ZoomControls (BR)  │
//   │        │                                                 │
//   └────────┴─────────────────────────────────────────────────┘
//
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useCallback, useEffect } from 'react';
import Toolbar      from './components/Toolbar';
import PropertyBar  from './components/PropertyBar';
import Canvas       from './components/Canvas';
import ZoomControls from './components/ZoomControls';

import { useCanvasInteractions } from './hooks/useCanvasInteractions';
import { useViewport }           from './hooks/useViewport';

import type { Shape } from './types/shapes';

import './App.css';

// ─────────────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  // ── Shared state hooks ─────────────────────────────────────────────────────

  const {
    shapes,
    selectedId,
    activeTool,
    previewShape,
    isDragging,
    setActiveTool,
    updateShape,
    deleteShape,
    duplicateShape,
    bringForwardSelected,
    sendBackwardSelected,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useCanvasInteractions();

  const {
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
  } = useViewport();

  // ── Container ref for zoom button sizing ──────────────────────────────────

  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const getContainerSize = useCallback((): { w: number; h: number } => {
    const el = canvasWrapRef.current;
    return el ? { w: el.clientWidth, h: el.clientHeight } : { w: 800, h: 600 };
  }, []);

  // ── Zoom button handlers ───────────────────────────────────────────────────

  const handleZoomIn = useCallback(() => {
    const { w, h } = getContainerSize();
    zoomInStep(w, h);
  }, [zoomInStep, getContainerSize]);

  const handleZoomOut = useCallback(() => {
    const { w, h } = getContainerSize();
    zoomOutStep(w, h);
  }, [zoomOutStep, getContainerSize]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focus is inside an input / textarea.
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      switch (e.key) {
        case 'v': case 'V': setActiveTool('select');    break;
        case 'r': case 'R': setActiveTool('rectangle'); break;
        case 'e': case 'E': setActiveTool('ellipse');   break;
        case 't': case 'T': setActiveTool('text');      break;
        case 'Escape':       setActiveTool('select');   break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);

  // ── Derived: selected shape object ────────────────────────────────────────

  const selectedShape: Shape | null =
    selectedId ? shapes.find(s => s.id === selectedId) ?? null : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      {/* ── Top property bar ──────────────────────────────────────────── */}
      <PropertyBar
        selectedShape={selectedShape}
        onUpdate={updateShape}
        onBringForward={bringForwardSelected}
        onSendBackward={sendBackwardSelected}
        onDelete={() => selectedId && deleteShape(selectedId)}
        onDuplicate={() => selectedId && duplicateShape(selectedId)}
      />

      {/* ── Main editor area ──────────────────────────────────────────── */}
      <div className="editor-body">
        {/* Left toolbar */}
        <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />

        {/* Canvas wrapper — fills remaining space */}
        <div className="canvas-wrap" ref={canvasWrapRef}>
          <Canvas
            shapes={shapes}
            selectedId={selectedId}
            activeTool={activeTool}
            viewport={viewport}
            previewShape={previewShape}
            isPanning={isPanning}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onWheel={handleWheel}
            onPanStart={handlePanStart}
            onPanMove={handlePanMove}
            onPanEnd={handlePanEnd}
          />

          {/* Zoom controls — bottom-right of canvas wrap */}
          <div className="zoom-controls-anchor">
            <ZoomControls
              zoomLabel={zoomLabel}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={resetZoomLevel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
