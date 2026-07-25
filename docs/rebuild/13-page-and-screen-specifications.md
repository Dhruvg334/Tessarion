# Page and Screen Specifications

## Landing Page
- **Content Hierarchy:** Navbar → Hero → "Illusion of Competence" Problem Statement → The Teach-Back Loop Solution → Architecture & Evidence Traceability → Open-Source Call-to-Action → Footer.
- **Interactions:** Scroll-triggered reveals (via `framer-motion`, respecting reduced-motion). Static architecture diagram hover states.
- **Visual Composition:** High contrast monochrome. Prominent use of `Rule Line` and `Strong Rule` to separate vertical sections.
- **States:** Fully static.
- **Responsive:** Sections stack vertically below 768px.
- **Accessibility:** Semantic HTML5 sections. ARIA labels on all external links.

## Demo Page
- **Content Hierarchy:** Stepper (Upload → Extract → Teach-back → Diagnosis → Trace).
- **Interactions:** Clicking "Next Step" loads deterministic JSON fixtures to simulate backend processing.
- **Visual Composition:** 2-column layout. Left side: The simulated UI. Right side: The underlying JSON/trace payload being generated.
- **Trace/Evidence Affordances:** A toggle switch above the UI to "Show AI Trace" which overlays the simulated OpenTelemetry span data.

## Workspace Shell
- **Content Hierarchy:** Left Navigation Rail (Study, Sources, Graph, Reviews, Activity, Settings). Center Work Area. Right Contextual Rail (Evidence/Trace).
- **Interactions:** Clicking a nav item preserves the workspace ID in the URL and swaps the Center Work Area via Next.js routing.
- **Visual Composition:** 100vh height. Rails are separated by a 1px `Strong Rule` border.
- **Responsive:** Left rail collapses into a hamburger menu on mobile. Right rail becomes a bottom sheet overlay.

## Teach-Back Screen
- **Content Hierarchy:** Concept Selector Dropdown → Instructions → `TeachBackComposer` Text Area → Submit Button.
- **Interactions:** Auto-resizing textarea. Submit triggers loading state (spinner on button) and calls the LangGraph Diagnosis workflow.
- **States:** 
  - *Loading:* Button disabled, "Diagnosing..." text.
  - *Error:* Red monochrome alert box below composer.
- **Trace/Evidence Affordances:** Upon diagnosis, the `DiagnosisPanel` appears, containing clickable citations that open the Right Contextual Rail to show the exact source chunk.

## Socratic Tutor Screen
- **Content Hierarchy:** Active Misconception Header → Chat History (`TutorThread`) → Input Area.
- **Interactions:** Pressing Enter submits text. Streaming response renders progressively.
- **Visual Composition:** Chat bubbles are styled as simple indented paragraphs rather than colorful SMS-style bubbles. 
- **Trace/Evidence Affordances:** A small "inspect decision" icon next to the tutor's reply opens the Right Rail, showing why the LLM chose a specific pedagogical move (e.g., "Hint vs Probe").

## Knowledge Graph Viewer
- **Interactions:** Pan and zoom canvas. Clicking a node opens `ConceptInspector` in the Right Rail.
- **Accessibility:** A fallback standard HTML list view of concepts and prerequisites must be available for screen readers.
- **Trace/Evidence Affordances:** The inspector shows the extraction confidence score and links to the source chunks that generated the node.
