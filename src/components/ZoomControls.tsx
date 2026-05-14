// ─────────────────────────────────────────────────────────────────────────────
// components/ZoomControls.tsx
// Compact zoom control strip: − label + and a reset (=) button.
// Designed to sit at the bottom-right of the canvas container or inside the
// top property bar.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useRef } from 'react';

interface ZoomControlsProps {
  /** Formatted zoom label, e.g. "100%". */
  zoomLabel: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomLabel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  return (
    <div className="zoom-controls" aria-label="Zoom controls">
      <button
        className="zoom-btn"
        onClick={onZoomOut}
        title="Zoom out (scroll down)"
        aria-label="Zoom out"
      >
        −
      </button>

      <button
        className="zoom-label"
        onClick={onResetZoom}
        title="Reset zoom to 100%"
        aria-label={`Current zoom: ${zoomLabel}. Click to reset.`}
      >
        {zoomLabel}
      </button>

      <button
        className="zoom-btn"
        onClick={onZoomIn}
        title="Zoom in (scroll up)"
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  );
};

export default ZoomControls;
