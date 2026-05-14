# React Shape Editor

React Shape Editor is a lightweight browser-based micro design tool built with React and TypeScript. The application allows users to create and manipulate simple graphic objects on a canvas through editor-like interactions such as selection, movement, resizing, rotation, and styling [file:25].

## Project Overview

This project was developed as part of a technical exercise requiring a React web interface for editing on-screen graphic elements. The objective was to deliver a focused and polished micro design tool with clean component structure, predictable state handling, and realistic scope rather than an overextended feature set [file:25].

## Prerequisites

Before running the project, ensure the following are installed:

- Node.js 18 or above
- A package manager: `pnpm`, `npm`, or `yarn`

## Installation and Local Development

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd react-shape-editor
   ```

2. Install dependencies:

   Using pnpm:
   ```bash
   pnpm install
   ```

   Or using npm:
   ```bash
   npm install
   ```

   Or using yarn:
   ```bash
   yarn install
   ```

3. Start the development server:

   Using pnpm:
   ```bash
   pnpm dev
   ```

   Or using npm:
   ```bash
   npm run dev
   ```

   Or using yarn:
   ```bash
   yarn dev
   ```

4. Open the local development URL shown in the terminal. For a standard Vite setup, this is typically:

   ```text
   http://localhost:5173
   ```

## Production Build

To create a production build:

Using pnpm:
```bash
pnpm build
```

Using npm:
```bash
npm run build
```

Using yarn:
```bash
yarn build
```

To preview the production build locally:

Using pnpm:
```bash
pnpm preview
```

Using npm:
```bash
npm run preview
```

Using yarn:
```bash
yarn preview
```

## Supported Object Types and Modifications

| Object Type | Supported Modifications |
|-------------|-------------------------|
| Rectangle | Move, resize, rotate, fill color, border color, border width, layer ordering |
| Ellipse | Move, resize, rotate, fill color, border color, border width, layer ordering |
| Text | Move, resize, rotate, text content, text color, background fill, layer ordering |

## Core Interactions

- Selection: Click an object to select it. When objects overlap, selection prioritizes the topmost object.
- Creation: Choose a shape tool and drag on the canvas to create an object.
- Transformation: Drag resize handles to resize an object and use the rotation handle to rotate it.
- Navigation: Pan using the middle mouse button and zoom using the mouse wheel or zoom controls.
- Layer control: Move selected objects forward or backward in the visual stacking order.

## Problem Statement

The goal of the project was to build a small but functional React-based editing interface for simple graphic objects. The submission was intended to demonstrate editor-like behavior, clear UI structure, and sound implementation judgment while remaining within the scope of a short exercise [file:25].

## Methodology

The application is structured around a modular frontend architecture:

- React components are separated by responsibility, such as layout, canvas rendering, toolbar actions, and property editing.
- Shape data is managed through a centralized object model to support consistent editing behavior.
- Utility functions handle geometry-related operations such as coordinate conversion, object transformation, and selection logic.
- The user interface follows a dark editor-style layout with a central canvas and fixed control regions.

## Evaluation Methods

The project was evaluated primarily through manual functional testing in a desktop browser environment. The following behaviors were checked during implementation:

- Shape creation through drag interaction
- Selection priority when objects overlap
- Movement, resizing, and rotation behavior
- Property editing synchronization with selected objects
- Panning and zooming behavior on the canvas
- General visual consistency and interaction feedback

## Experimental Results

The resulting implementation provides a stable micro design tool that supports direct manipulation of basic canvas objects. The final scope prioritizes reliable core interactions and maintainable structure over broader but incomplete feature coverage, in line with the intended exercise requirements [file:25].

## Known Issues

- Text measurement may vary slightly depending on browser rendering behavior.
- Touch support is not a target for this version and has not been fully implemented.
- Undo and redo are not included in this submission.
- Browser behavior may vary slightly for wheel sensitivity and pointer interaction outside Chromium-based environments.

## AI Usage Disclosure

This project was developed with assistance from AI coding tools for ideation, scaffolding, debugging support, and reviewing implementation approaches [file:25]. Core application structure, scope decisions, integration logic, and manual verification of interaction behavior were reviewed and refined directly during development to ensure the final submission remained understandable and defensible [file:25].