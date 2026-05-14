# React Shape Editor

React Shape Editor is a lightweight browser-based micro design tool built with React and TypeScript. It allows users to create and manipulate simple graphic objects on a canvas through interactions such as selection, movement, resizing, rotation, and styling.

This project was developed as part of a technical exercise for a React-based UI editing tool. During the planning stage, Perplexity was used for brainstorming, requirement clarification, and drafting the Product Requirements Document (PRD). Manus AI was then used to support implementation and development. Final scope decisions, review of generated output, integration, and manual verification of behavior were carried out throughout the project.

## Project Documents

- [Product Requirements Document (PRD)](./docs/react-shape-editor-prd.pdf)
- [Technical Report](./REPORT.md)

## Project Overview

The objective of this project is to deliver a focused micro design tool that demonstrates editor-like behavior in a browser environment. The implementation emphasizes clean React structure, predictable state handling, practical interaction design, and realistic scope control rather than attempting to replicate the full feature set of professional design software.

## Prerequisites

Before running the project, ensure the following are installed:

- Node.js 18 or above
- A package manager such as pnpm, npm, or yarn

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

   Using npm:
   ```bash
   npm install
   ```

   Using yarn:
   ```bash
   yarn install
   ```

3. Start the development server:

   Using pnpm:
   ```bash
   pnpm dev
   ```

   Using npm:
   ```bash
   npm run dev
   ```

   Using yarn:
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

## Known Issues

- Text measurement may vary slightly depending on browser rendering behavior.
- Touch support is not a target for this version and has not been fully implemented.
- Undo and redo are not included in this submission.
- Browser behavior may vary slightly for wheel sensitivity and pointer interaction outside Chromium-based environments.

## AI Usage Disclosure

This project was developed with the assistance of AI tools as part of the exercise workflow.

- Perplexity was used during the planning stage for brainstorming, requirement clarification, and drafting the PRD.
- Manus AI was used during implementation to assist with scaffolding, debugging, and development support.
- Final architecture decisions, code review, integration, and manual verification of core interactions were completed during development to ensure the submitted implementation remained understandable, consistent, and aligned with the intended scope.