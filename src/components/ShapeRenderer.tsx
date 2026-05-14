// ─────────────────────────────────────────────────────────────────────────────
// components/ShapeRenderer.tsx
// Renders a single shape as an SVG element.  Handles rectangle, ellipse, and
// text types.  The component is intentionally stateless — all data flows in
// via props.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import type { Shape, RectangleShape, EllipseShape, TextShape } from '../types/shapes';
import { rectCenter } from '../utils/geometry';

interface ShapeRendererProps {
  shape: Shape;
  /** When true, renders at reduced opacity (used for the creation preview). */
  isPreview?: boolean;
}

const ShapeRenderer: React.FC<ShapeRendererProps> = ({ shape, isPreview = false }) => {
  const { x, y, width, height, rotation, fillColor, borderWidth, borderColor } = shape;
  const center = rectCenter(shape);
  const transform = rotation !== 0
    ? `rotate(${rotation}, ${center.x}, ${center.y})`
    : undefined;
  const opacity = isPreview ? 0.6 : 1;

  switch (shape.type) {
    case 'rectangle':
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fillColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
          transform={transform}
          opacity={opacity}
          style={{ pointerEvents: 'none' }}
        />
      );

    case 'ellipse':
      return (
        <ellipse
          cx={center.x}
          cy={center.y}
          rx={width / 2}
          ry={height / 2}
          fill={fillColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
          transform={transform}
          opacity={opacity}
          style={{ pointerEvents: 'none' }}
        />
      );

    case 'text': {
      const ts = shape as TextShape;
      return (
        <g transform={transform} opacity={opacity} style={{ pointerEvents: 'none' }}>
          {/* Optional background fill for the text bounding box */}
          {ts.fillColor !== 'transparent' && (
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={ts.fillColor}
              stroke={ts.borderColor}
              strokeWidth={ts.borderWidth}
            />
          )}
          <foreignObject x={x} y={y} width={width} height={height}>
            {/* @ts-ignore — xmlns is valid on foreignObject children */}
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontSize: ts.fontSize,
                fontFamily: ts.fontFamily,
                color: ts.textColor,
                userSelect: 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: '4px',
                boxSizing: 'border-box',
              }}
            >
              {ts.text}
            </div>
          </foreignObject>
        </g>
      );
    }

    default:
      return null;
  }
};

export default ShapeRenderer;
