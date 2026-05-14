# React Shape Editor Report

## Problem Statement

This project addresses a technical exercise requiring the implementation of a React-based web interface for editing simple on-screen graphic objects. The required interaction model centers on direct manipulation of objects through movement, resizing, recoloring, and rotation within a normal desktop browser environment. The intended outcome is a lightweight micro design tool that demonstrates editor-like behavior without expanding into the complexity of full-scale creative software.

The central challenge is not only functional delivery but also disciplined scope selection. The submission is expected to show clean React structure, predictable state handling, sensible interface design, and evidence that the submitted code is understood and deliberately reviewed rather than assembled without judgment. For that reason, the project is positioned as a focused canvas editor with a constrained set of supported objects and interactions.

## Methodology

The project was planned and implemented through a staged workflow that prioritized architecture clarity before feature expansion. The planning phase established a Product Requirements Document to define the app's visual layout, supported object model, core interactions, viewport behavior, and explicit non-goals. This reduced the risk of drifting into unnecessary features such as image editing, advanced grouping, or broader design-suite functionality.

The implementation strategy follows a modular React structure. The application shell is divided into a left toolbar, a top property bar, and a central canvas workspace. Shape definitions are separated into shared data types, while geometry-related behavior such as coordinate conversion, hit testing, resizing logic, rotation updates, and viewport calculations is isolated into utility functions or hooks. This separation makes the editor easier to reason about and better suited for iterative testing.

A tool-assisted workflow was used throughout the exercise. Perplexity was used during the planning stage for brainstorming, clarifying scope, and drafting the Product Requirements Document. Manus AI was then used during implementation for scaffolding, coding support, debugging assistance, and accelerating development of interaction-heavy features. Final scope decisions, review of generated output, integration work, and manual verification of behavior remained part of the project process to ensure that the final submission stayed coherent and understandable.

## Evaluation Dataset

A formal dataset is not applicable for this project because the submission is an interactive frontend system rather than a predictive or data-driven model. Instead, evaluation was based on a set of manual interaction scenarios representing the expected user flows of the editor.

The practical evaluation scenarios included the following:

- Creating new objects on the canvas through drag gestures.
- Selecting single objects, including overlapping objects where visual order affects selection priority.
- Moving selected objects across the canvas.
- Resizing objects through visible transform handles.
- Rotating objects around their center point.
- Editing object properties through the property bar.
- Changing object layering order.
- Panning and zooming the viewport while preserving stable object behavior.
- Observing UI feedback for active selection, transformation, and navigation states.

## Evaluation Methods

Evaluation was conducted through manual functional testing in a desktop browser environment. Each implemented interaction was tested against the expected editor behavior defined in the planning stage. The objective was to confirm that the app behaved consistently, that the interface remained understandable to a reviewer, and that the supported feature set was complete enough to demonstrate a coherent micro design tool.

The main testing categories were as follows:

| Category | Evaluation Focus |
|----------|------------------|
| Object creation | Whether drag-to-create produces correct position and dimensions for supported object types |
| Selection behavior | Whether clicking selects the intended object, especially under overlap conditions |
| Transformation | Whether move, resize, and rotate interactions update object state correctly |
| Property editing | Whether changes made through the property bar stay synchronized with canvas state |
| Viewport navigation | Whether pan and zoom affect the view without corrupting object data |
| Visual feedback | Whether selection frames, controls, and UI states remain clear during interaction |
| Browser behavior | Whether the app remains usable in a normal desktop browser and any limits can be documented |

Because this is a frontend interaction exercise, qualitative stability and clarity are more important than benchmark-style numerical metrics. Testing therefore focused on predictable behavior, visible correctness, and whether the implemented scope felt complete relative to the stated requirements.

## Experimental Results

The implemented project delivers a browser-based micro design tool with a constrained but meaningful set of editor behaviors. The resulting interface supports direct interaction with simple objects on a central canvas while maintaining a clear visual separation between tools, object properties, and the editing surface. This makes the application feel more substantial than a static webpage while remaining intentionally below the complexity of full professional design tools.

The most important positive result is that a smaller, controlled scope improves both implementation quality and explainability. By focusing on a compact object model and core editor interactions, the project is able to demonstrate React component organization, state synchronization, geometry-driven UI behavior, and practical user feedback without being diluted by partially finished extra features. This trade-off is especially important for a short exercise where judgment and completeness carry more value than breadth.

The project also highlights several implementation risks typical of interactive editors. Text measurement can vary slightly depending on browser rendering behavior, wheel sensitivity may differ across devices, and transformation edge cases become more complex once rotation, overlapping objects, and viewport scaling interact at the same time. These limitations do not prevent the tool from functioning as intended, but they are important to document as part of an honest submission.

Overall, the result is a focused React application that demonstrates editor-like interaction, deliberate scope control, and a development workflow that combines AI assistance with active review and verification. The final system is suitable as an exercise submission because it prioritizes understandable architecture, practical interaction quality, and transparent documentation over feature inflation.