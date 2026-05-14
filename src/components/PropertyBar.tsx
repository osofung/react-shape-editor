// ─────────────────────────────────────────────────────────────────────────────
// components/PropertyBar.tsx
// Horizontal top bar that shows editable fields for the selected shape's
// properties: position, size, rotation, fill, border, and (for text) content.
// Also exposes layer ordering controls.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import type { Shape, TextShape } from '../types/shapes';

interface PropertyBarProps {
  selectedShape: Shape | null;
  onUpdate: (id: string, patch: Partial<Shape>) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

// ─── Small reusable field components ─────────────────────────────────────────

interface NumFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  title?: string;
}

const NumField: React.FC<NumFieldProps> = ({ label, value, onChange, step = 1, min, title }) => (
  <label className="prop-field" title={title}>
    <span className="prop-field__label">{label}</span>
    <input
      className="prop-field__input prop-field__input--number"
      type="number"
      value={Math.round(value * 10) / 10}
      step={step}
      min={min}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
    />
  </label>
);

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  title?: string;
}

const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange, title }) => (
  <label className="prop-field" title={title}>
    <span className="prop-field__label">{label}</span>
    <input
      className="prop-field__input prop-field__input--color"
      type="color"
      value={value === 'transparent' ? '#ffffff' : value}
      onChange={e => onChange(e.target.value)}
    />
  </label>
);

// ─── Main component ───────────────────────────────────────────────────────────

const PropertyBar: React.FC<PropertyBarProps> = ({
  selectedShape,
  onUpdate,
  onBringForward,
  onSendBackward,
  onDelete,
  onDuplicate,
}) => {
  const update = useCallback(
    (patch: Partial<Shape>) => {
      if (selectedShape) onUpdate(selectedShape.id, patch);
    },
    [selectedShape, onUpdate],
  );

  if (!selectedShape) {
    return (
      <header className="property-bar property-bar--empty" aria-label="Properties">
        <span className="property-bar__hint">Select an object to edit its properties</span>
      </header>
    );
  }

  const s = selectedShape;
  const isText = s.type === 'text';
  const ts = isText ? (s as TextShape) : null;

  return (
    <header className="property-bar" aria-label="Shape properties">
      {/* ── Position ─────────────────────────────────────────────────── */}
      <div className="prop-group">
        <NumField label="X" value={s.x}      onChange={v => update({ x: v } as Partial<Shape>)}      title="X position" />
        <NumField label="Y" value={s.y}      onChange={v => update({ y: v } as Partial<Shape>)}      title="Y position" />
        <NumField label="W" value={s.width}  onChange={v => update({ width:  Math.max(1, v) } as Partial<Shape>)} min={1} title="Width" />
        <NumField label="H" value={s.height} onChange={v => update({ height: Math.max(1, v) } as Partial<Shape>)} min={1} title="Height" />
        <NumField label="°" value={s.rotation} onChange={v => update({ rotation: v } as Partial<Shape>)} step={1} title="Rotation (degrees)" />
      </div>

      <div className="prop-divider" />

      {/* ── Fill & border ────────────────────────────────────────────── */}
      <div className="prop-group">
        <ColorField label="Fill"   value={s.fillColor}   onChange={v => update({ fillColor:   v } as Partial<Shape>)} title="Fill color" />
        <ColorField label="Border" value={s.borderColor} onChange={v => update({ borderColor: v } as Partial<Shape>)} title="Border color" />
        <NumField   label="BW"     value={s.borderWidth} onChange={v => update({ borderWidth: Math.max(0, v) } as Partial<Shape>)} min={0} step={0.5} title="Border width" />
      </div>

      {/* ── Text-only fields ─────────────────────────────────────────── */}
      {isText && ts && (
        <>
          <div className="prop-divider" />
          <div className="prop-group">
            <label className="prop-field prop-field--wide" title="Text content">
              <span className="prop-field__label">Text</span>
              <input
                className="prop-field__input"
                type="text"
                value={ts.text}
                onChange={e => update({ text: e.target.value } as Partial<Shape>)}
              />
            </label>
            <NumField label="Size" value={ts.fontSize} onChange={v => update({ fontSize: Math.max(6, v) } as Partial<Shape>)} min={6} title="Font size" />
            <ColorField label="Color" value={ts.textColor} onChange={v => update({ textColor: v } as Partial<Shape>)} title="Text color" />
          </div>
        </>
      )}

      <div className="prop-divider" />

      {/* ── Layer & actions ──────────────────────────────────────────── */}
      <div className="prop-group prop-group--actions">
        <button className="prop-btn" onClick={onBringForward} title="Bring forward">↑ Fwd</button>
        <button className="prop-btn" onClick={onSendBackward} title="Send backward">↓ Back</button>
        <button className="prop-btn" onClick={onDuplicate}    title="Duplicate shape">⧉ Dup</button>
        <button className="prop-btn prop-btn--danger" onClick={onDelete} title="Delete shape">✕ Del</button>
      </div>
    </header>
  );
};

export default PropertyBar;
