// ─────────────────────────────────────────────────────────────────────────────
// components/SelectionOverlay.tsx
// Renders the selection frame, eight resize handles, and the rotation handle
// for the currently selected shape.  Rendered as SVG elements inside the
// canvas SVG.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import type { BaseShape } from '../types/shapes';
import type { ResizeHandle } from '../types/shapes';
import {
  getResizeHandlePositions,
  getRotationHandlePosition,
  ROTATION_STEM_LENGTH,
} from '../utils/hitTest';
import { rectCenter, rotatePoint } from '../utils/geometry';

// ─── Visual constants ─────────────────────────────────────────────────────────
const SELECTION_STROKE        = '#2563EB'; // bright blue
const HANDLE_FILL             = '#FFFFFF';
const HANDLE_STROKE           = '#2563EB';
const HANDLE_SIZE             = 8;         // half-size of the square handle
const ROTATION_HANDLE_RADIUS  = 8;
const ROTATION_HANDLE_FILL    = '#2563EB';

interface SelectionOverlayProps {
  shape: BaseShape;
}

const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ shape }) => {
  const { x, y, width, height, rotation } = shape;
  const center = rectCenter(shape);

  // ── Selection outline ──────────────────────────────────────────────────────
  // We draw the outline as a rotated rect.
  const outlineTransform = rotation !== 0
    ? `rotate(${rotation}, ${center.x}, ${center.y})`
    : undefined;

  // ── Resize handles ─────────────────────────────────────────────────────────
  const handlePositions = getResizeHandlePositions(shape);

  // ── Rotation stem & handle ─────────────────────────────────────────────────
  // Stem runs from the top-center of the bounding box upward.
  const topCenter = rotatePoint(
    { x: x + width / 2, y },
    center,
    rotation,
  );
  const rotHandlePos = getRotationHandlePosition(shape);

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Selection outline */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke={SELECTION_STROKE}
        strokeWidth={1.5}
        strokeDasharray="none"
        transform={outlineTransform}
      />

      {/* Rotation stem */}
      <line
        x1={topCenter.x}
        y1={topCenter.y}
        x2={rotHandlePos.x}
        y2={rotHandlePos.y}
        stroke={SELECTION_STROKE}
        strokeWidth={1.5}
      />

      {/* Rotation handle circle */}
      <circle
        cx={rotHandlePos.x}
        cy={rotHandlePos.y}
        r={ROTATION_HANDLE_RADIUS}
        fill={ROTATION_HANDLE_FILL}
        stroke={HANDLE_STROKE}
        strokeWidth={1.5}
      />

      {/* Resize handles */}
      {(Object.entries(handlePositions) as [ResizeHandle, { x: number; y: number }][]).map(
        ([key, pos]) => (
          <rect
            key={key}
            x={pos.x - HANDLE_SIZE / 2}
            y={pos.y - HANDLE_SIZE / 2}
            width={HANDLE_SIZE}
            height={HANDLE_SIZE}
            fill={HANDLE_FILL}
            stroke={HANDLE_STROKE}
            strokeWidth={1.5}
          />
        )
      )}
    </g>
  );
};

export default SelectionOverlay;
