// ─────────────────────────────────────────────────────────────────────────────
// components/Toolbar.tsx
// Vertical left-side toolbar for switching between the select tool and the
// shape creation tools.  Each button shows an SVG icon and a tooltip.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import type { ToolType } from '../types/shapes';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

interface ToolDef {
  id: ToolType;
  label: string;
  title: string;
  icon: React.ReactNode;
}

const TOOLS: ToolDef[] = [
  {
    id: 'select',
    label: 'Select',
    title: 'Select tool (V)',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path d="M4 2l12 8-6 1-3 6z" />
      </svg>
    ),
  },
  {
    id: 'rectangle',
    label: 'Rect',
    title: 'Rectangle tool (R)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <rect x="3" y="5" width="14" height="10" rx="1" />
      </svg>
    ),
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    title: 'Ellipse tool (E)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <ellipse cx="10" cy="10" rx="7" ry="5" />
      </svg>
    ),
  },
  {
    id: 'text',
    label: 'Text',
    title: 'Text tool (T)',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <text x="3" y="15" fontSize="14" fontFamily="serif" fontWeight="bold">T</text>
      </svg>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onSelectTool }) => {
  return (
    <aside className="toolbar" role="toolbar" aria-label="Drawing tools">
      {TOOLS.map(tool => (
        <button
          key={tool.id}
          className={`toolbar-btn${activeTool === tool.id ? ' toolbar-btn--active' : ''}`}
          onClick={() => onSelectTool(tool.id)}
          title={tool.title}
          aria-label={tool.label}
          aria-pressed={activeTool === tool.id}
        >
          {tool.icon}
          <span className="toolbar-btn__label">{tool.label}</span>
        </button>
      ))}
    </aside>
  );
};

export default Toolbar;
