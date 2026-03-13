# PRD: Palettable Programming - Presentation Website

## Overview
A Reveal.js presentation website for Sydney Parks' talk "Palettable Programming: A Painter's Journey into Code and AI." This is a personal narrative-driven presentation for the Vibe Code Austin event, telling the story of transitioning from traditional painting to AI-assisted creative coding.

---

## Deployment

- **Platform**: GitHub Pages
- **Base URL**: repository root (no subdirectory — asset paths must be relative, not absolute)
- **No build step**: Static HTML/CSS/JS served directly from repo root
- **Asset paths**: All `src`, `href`, and `url()` references must use relative paths (e.g., `./css/theme.css`, `./Who Am I/My Work/...`) so they resolve correctly on GitHub Pages
- **404 handling**: No server-side routing — all navigation is client-side via Reveal.js

---

## Responsive Behavior

- **Design target**: 1920×1080 (widescreen presentation)
- **Must be responsive**: Scales gracefully on any screen — laptop (1280×800), external monitor, projector
- **Reveal.js scaling**: Use `width: 1920, height: 1080` with `margin: 0.04` and `minScale: 0.2, maxScale: 2.0` — Reveal.js will letterbox/scale automatically
- **Images**: Always maintain original aspect ratio. Use `object-fit: contain` for portraits and `object-fit: cover` for full-bleed backgrounds. Never stretch.
- **Videos**: Maintain aspect ratio at all times. Max width 100% of slide. Use `aspect-ratio: 16/9` on video containers.
- **3D viewers**: Maintain square or 16:9 aspect ratio — never distort on resize.
- **Text**: Use `em`/`rem` units and `clamp()` where appropriate so type scales with slide zoom.
- **Grid layouts**: On very small screens (< 900px wide) collapse `.grid-3`, `.grid-4`, `.grid-6` to single column using `@media` or Reveal.js scale fallback.

---

## Missing Media — Placeholder Behavior

When any image, video, GIF, or 3D model file is missing or not yet added to the repo, the agent must **render a styled placeholder** rather than a broken element or empty space.

### Placeholder spec:
- **Background**: `#111111` (near-black)
- **Border**: 1px solid `rgba(255,255,255,0.2)`
- **Content**: Centered white SVG icon (image/video/3D as appropriate) + filename in `Lato` at 0.75em, `rgba(255,255,255,0.4)`
- **Aspect ratio**: Match the expected media ratio (16:9 for video, square for portrait, etc.)
- **No broken `<img>` or `<video>` tags**: Use an `onerror` handler on `<img>` tags to swap in the placeholder div, or pre-check with JS before rendering
- **Label**: Show the expected filename so it's obvious what goes there (e.g., `dread1.gif`, `gma4.obj`)

### Sections currently confirmed missing:
- `Who Am I/My Work/Vibe Coded/` — all media for Flow Performance, Gestural, sydneyparks.io (use `.slide-placeholder` dashed-border cards)
- Any portfolio image not yet added — use placeholder with filename label

---

## Undefined Terms — Definitions for Slide 56

Slide 56 ("Step 3 - Choose Your LLM") references two tools that need explanation cards:

### OpenClaw (OpenCtx / open-source MCP harness)
- A community/open-source harness for connecting LLM agents to external tools via MCP
- Position it as: the open-source alternative to paid MCP connectors — useful for self-hosted or custom integrations
- Card should note: free, extensible, requires more setup

### PAI (Personal AI / local AI harness)
- A local-first AI agent harness — runs models on your own machine
- Position it as: privacy-first option, no API costs, works offline
- Card should note: local inference, no data leaves your machine, hardware requirements apply

*(Update these definitions if Sydney provides more specific context before the talk.)*

---

## Design System: Op Art (Bridget Riley B&W)

### Visual Identity
- **Pure black & white**: No color — maximum contrast, optical illusion energy
- **Dark base**: Pure black (#000000) backgrounds with white (#FFFFFF) elements
- **No rounded corners**: Sharp, geometric edges on all cards and UI elements
- **No soft shadows**: Subtle white borders (rgba white at 15–35% opacity) and directional glow effects
- **Card hover inversion**: Cards flip to white background with black text on hover
- **Top-stripe decorations**: Cards use solid white or patterned white top stripes (6px height)

### Color Palette
- **None** — the entire design system is black and white only
- Accent classes (`.highlight`, `.accent-pink`, `.accent-blue`, `.accent-green`) all render as white with different decorative treatments (inverted background, wavy underline, solid border-bottom, italic)

### Interactive Backgrounds (p5.js)
- Full-screen p5.js canvas behind all content, drawn in instance mode at 1920×1080
- **Each section theme gets a unique Bridget Riley-inspired op-art pattern:**
  - `narrative` → Wavy Lines (inspired by Riley's "Current" — 80 undulating parallel lines)
  - `pink` → Warped Checkerboard (inspired by "Movement in Squares" — columns compress toward center)
  - `blue` → Lens Stripes (horizontal stripes phase-invert inside an elliptical vesica piscis)
  - `purple` → Radial Vortex (polar-coordinate checkerboard with spiral twist)
  - `green` → Curved Concentric Stripes (nested arcs inspired by "Fragment")
  - `coral` → Dense Wavy Lines (tighter, more agitated variant — 110 lines)
  - `default` → Concentric Rings (clean expanding circles)
  - Title slide → Special concentric circles pattern
- Patterns are static (drawn once per theme change via `noLoop()`), not animated
- Opacity varies per theme (0.09–0.14) for subtlety
- Pattern redraws on Reveal.js `slidechanged` event when theme changes
- Canvas resizes on `window.resize` to always fill viewport

### Typography
- Headings: Erica One (cursive display, uppercase, no text-transform override)
- Body: Lato (sans-serif, weight 300–700)
- Cinematic slides: 2.0em body text, climax slides: 2.4em
- Strong text: white with 3px underline decoration
- Highlight class: inverted (white bg, black text, padded)
- All font sizes use `em` units so they scale with Reveal.js zoom

### Animation Principles
- Slide-up entrance (translateY 30px) with cubic-bezier(0.16, 1, 0.3, 1)
- Fragment reveals with 0.8s transitions and translateY(20px)
- Staggered grid entrances using fadeScale keyframes (scale 0.92 → 1)
- Workflow steps alternate black-on-white / white-on-black (checkerboard feel)

---

## Narrative Structure: 4 Layers

### Layer 1 - Origin Story: "From Painter to Programmer" (data-theme="narrative")
The emotional core. Slides use large centered text with fragment reveals.

1. **Title**: "Palettable Programming" / "A Painter's Journey into Code and AI" / Sydney Parks
2. **Pivotal Moment**: Working on a painting, projecting video onto it to make it come alive
3. **Something Missing**: "It moved. It breathed. But it wasn't enough. It was missing emergence."
4. **Emergence Definition**: Large animated word + definition card with white border and horizontal rule accents
5. **The Click Moment** (CLIMAX): Looking down at paint-covered computer, realizing must learn it
6. **Refik Anadol**: Discovery of artist who wrote Python scripts for AI art before LLMs existed
7. **Learning Path**: Thought Python, found Processing/p5.js, ventured into Java/JavaScript
8. **Where I Am Now**: Professor at UT AET department (VR, code, fabrication, immersive installations)
9. **Student Challenge**: Students skeptical of AI, job is changing hearts and minds
10. **Transition**: "Let me show you a little of what I teach today."

### Layer 2 - The Work (data-theme="pink")
Portfolio gallery followed by project deep-dives.

11. **Layer 2 Header**: "The Work" — "Sculpture, code, and the space between physical and digital."
12-18. **Portfolio Gallery**: 7 full-bleed images with captions (Grotesque Dome, Installation, Processing The Body, Burial, Deepglow Species 1, Crying Man, The Transaction) - images in `Who Am I/My Work/Portfolio/`
19. **Nameless Dread Title**: "My first real collaboration with AI"
20. **ND Context**: AI as knowledge source, still programmed everything myself
21. **ND GIFs**: dread1.gif, dread2.gif, dread3.gif from `Workflows/AI Assisted Programming/JavaScript & Generative Art/Nameless Dread/`
22. **ND Code Video**: `Who Am I/My Work/Nameless Dread/Code.mp4`
23. **ND Algo Video**: `Who Am I/My Work/Nameless Dread/Explore Algo.mp4`
24. **Vibe Coded Title**: "Projects built solely by prompting"
25. **Vibe Coded Projects** (PLACEHOLDER): Flow Performance, Gestural, sydneyparks.io - dashed border cards awaiting media in `Who Am I/My Work/Vibe Coded/`
26. **Opus 4.5 Moment**: End of Summer 2025, stopped writing code
27. **The Realization** (CLIMAX): 4 fragments about learning to code vs Opus 4.5 arriving
28. **Paradigm Shift**: "The move isn't to learn to program -- it's to learn to speak." + explanatory fragment about being descriptive and breaking projects into components

### Layer 3 - My Process & Workflows (data-theme="pink")
Overview of three AI-assisted workflows, followed by deep-dives into each.

29. **Layer 3 Header**: "My Process & Workflows" — "Three AI-assisted workflows I've built for myself — each one starts with my original work as the seed."
30. **Workflow Overview**: 3 cards (AI-Assisted Programming, 3D Printed Sculpture, Video & Projection)

#### Workflow 1: AI-Assisted Programming (data-theme="purple")
31. **Workflow Chart**: Pseudo Code/Sketches → GPT Image Gen (+ Figma MCP tip) → Claude Code
32. **Kinetic Contemplations**: 3-image grid (Seeding 22, Seedling 6, Seedling 28)
33. **Kinetic Contemplations Video**: published.mp4
34. **Arduino & Interactive Art**: Final.mp4
35. **In the Clouds — How It Works**: HowTo_IntheClouds.mp4

#### Workflow 2: 3D Printed Sculpture (data-theme="green")
36. **Workflow Chart**: Sketch → GPT Image Gen → AI 3D Model (ComfyUI/Meshy) → VR Sculpt (ShapeLab+Blender) → 3D Print (Creality K1 Max) → Paint & Finish
37-39. **Crying Man**: Project title, ChatGPT ideation grid (6 images), final sculpture photos (2)
40-44. **Burial**: Project title, ChatGPT ideation grid (6 images), interactive 3D model viewer (gma4.obj), final photos (2), final video (Burial_Final.mp4)
45-47. **Sitting Woman**: Project title, GPT image gen grid (6 images), interactive 3D model viewer (sunflower1.obj), progress video (Final_1.mp4)
48-49. **Flower Fingers**: Project title, AI image gen grid (5 images)

#### Workflow 3: Video & Projection Mapping (data-theme="coral")
50. **Workflow Chart**: Source Material → AI Video Gen (Grok Imagine/ComfyUI) → StreamDiffusion
51. **AI-Generated Video**: 3-video grid from Burial ai video folder (3.mp4, 5.mp4, 7.mp4)
52. **Projection Mapping**: Burial_Projection_2.mp4

### Layer 4 - How to Vibe Code (data-theme="blue")
Step-by-step guide with card layouts.

53. **Layer 4 Header**: "How to Vibe Code" / "A step-by-step guide to building with AI agents."
54. **Step 1 - Learn the Fundamentals**: Programming basics — loops, conditionals, variable types, functions, data structures
55. **Step 2 - Choose Your Tool**: Cursor, Google Antigravity, VS Code + Claude Code (3-card grid)
56. **Step 3 - Choose Your LLM**: Codex vs Claude (2-card grid) + harness explainer cards for PAI (local-first, privacy-focused) and OpenClaw (open-source MCP harness)
57. **Step 4 - Create a PRD**: Product Requirements Document with GPT collaboration + integrations section (MCP servers, APIs, external services)
58. **Step 5 - Generate a Design**: Visual mockups using Nanobanan, GPT image gen
59. **Step 6 - Research Libraries**: Use AI to identify needed frameworks before building
60. **Step 7 - Let Your Agent Build**: Hand off, guide with pseudo code
61. **Tips Grid**: 4 cards (The Seed Is Your Work, Get Smart with AI Planning, Use AI to Rewrite Prompts, Start with What You Know)

### Demo & Close

62. **Demo Header**: "Demo" — "Watch the entire workflow come together — from sculpture to interactive screen, in real time."
63. **Demo Pipeline**: Original Sculpture → AI 3D Model → Three.js (vibe code it) → TouchDesigner (StreamDiffusion) → Interactive Output
64. **Live Demo**: Switch to live environment
65. **Demo Recap**: Physical sculpture → AI 3D model → vibe-coded in Three.js → real-time animation with StreamDiffusion
66. **Q&A / Closing**: Contact + social links (sydneyparks.io, Instagram, LinkedIn) — "Thank you, Vibe Code Austin!"

---

## Technical Architecture

### Stack
- **Framework**: Reveal.js 5 (CDN)
- **Backgrounds**: p5.js 1.9.4 (CDN) — instance mode, one canvas in `#riley-bg`
- **3D Viewer**: Three.js 0.160.0 with OBJLoader and OrbitControls (lazy-loaded via import map)
- **Animations**: CSS keyframes + Reveal.js fragment system
- **Fonts**: Google Fonts (Erica One, Lato)
- **No build step**: Static HTML/CSS/JS served directly

### Reveal.js Configuration
```js
Reveal.initialize({
  width: 1920,
  height: 1080,
  margin: 0.04,
  minScale: 0.2,
  maxScale: 2.0,
  center: true,
  hash: true,         // enables deep-linking — required for GitHub Pages sharing
  history: true,
  transition: 'fade',
  transitionSpeed: 'default',
  backgroundTransition: 'fade',
});
```

### GitHub Pages Requirements
- All asset paths must be **relative** (e.g., `./css/theme.css`, not `/css/theme.css`)
- No server-side redirects — use `hash: true` in Reveal.js for slide deep-linking
- Repo must have GitHub Pages enabled on the `main` branch root (or `/docs` if preferred)
- Add a `.nojekyll` file at repo root to prevent GitHub Pages from ignoring `_` prefixed folders
- Filenames and folder names with spaces (e.g., `Who Am I/`) must be URL-encoded in HTML (`Who%20Am%20I/`) or renamed to use hyphens/underscores

### File Structure
```
/
  index.html          - Main presentation (all slides)
  PRD.md              - This document
  .nojekyll           - Prevents Jekyll processing on GitHub Pages
  css/
    theme.css         - Op Art B&W design system (~1600 lines)
  js/
    presentation.js   - Reveal.js config, video manager, Three.js viewer (lazy)
    backgrounds.js    - p5.js Bridget Riley-inspired background patterns
  Who Am I/
    Myself/           - Portrait (bW2.png), Art Car photos
    My Work/
      Portfolio/      - 7 main portfolio images
      Nameless Dread/ - Code.mp4, Explore Algo.mp4
      Vibe Coded/     - PLACEHOLDER (awaiting: Flow Performance, Gestural, sydneyparks.io media)
  Workflows/
    AI Assisted Programming/
      JavaScript & Generative Art/
        Kinetic Contemplations/   - 3 PNGs + published.mp4
        Nameless Dread/           - 3 GIFs + screenshots
      Arduino & Interactive Art/  - Final.mp4, HowTo_IntheClouds.mp4
    3DPrintedSculpture/
      Crying Man/     - ChatGPT ideation images, final photos, video
      Burial/         - Ideation, gma4.obj (3D model), finals, ai video/
      Sitting Woman/  - GPT images, sunflower1.obj, progress video
      Flower Fingers/ - AI image gen PNGs
```

### Key Interactions
1. **p5.js op-art backgrounds**: 7 unique patterns (one per theme) drawn on a shared canvas. Patterns redraw when section theme changes. Static rendering (`noLoop()`), no mouse reactivity. Canvas resizes on `window.resize`.
2. **Three.js OBJ viewer**: Two interactive 3D model viewers (Burial: gma4.obj, Sitting Woman: sunflower1.obj) with auto-rotation, orbit controls, and B&W gallery lighting. Lazy-loaded on first encounter.
3. **Fragment reveals**: Narrative slides use Reveal.js fragments for speaker-paced dramatic text reveals.
4. **Card hover inversion**: Cards flip to white-on-black with translateY(-4px) lift.
5. **Video manager**: Videos lazy-load sources on slide entry, auto-play, and fully unload on slide exit.
6. **Workflow step alternation**: Workflow chart steps alternate black-on-white and white-on-black for op-art checkerboard feel.
7. **Missing media placeholders**: JS checks each `<img>` and `<video>` src on slide entry. If file is missing (404 or `onerror`), replaces element with a styled placeholder div showing the expected filename.

### CSS Class Reference
| Class | Purpose |
|-------|---------|
| `.slide-title` | Title slide centered layout with concentric circle `::before` |
| `.section-header` | Act/section header with horizontal stripe `::before` and badge |
| `.slide-cinematic` | Narrative text, 2.0em, centered, diagonal stripe corner accent |
| `.slide-climax` | Emotional high point, 2.4em, corner bracket borders, `.gradient-text` for inverted words |
| `.slide-definition` | Large keyword + definition card with vesica piscis circle decorations |
| `.slide-narrative` | Centered text with vertical center-line accent |
| `.slide-image` | Full-bleed background image with `.image-caption` overlay |
| `.slide-video` | Centered video player with 3px white border |
| `.slide-guide` | How-to step with `.step-badge` and `.guide-cards` |
| `.slide-placeholder` | Dashed-border cards with diagonal stripe hover fill |
| `.slide-demo` | Demo slide with checkerboard `::before` pattern |
| `.slide-closing` | Q&A slide with concentric ring decorations |
| `.project-title` | Project name + medium subtitle with double horizontal rule decorations |
| `.workflow-chart` | Workflow with alternating B&W `.wf-step` and `.wf-arrow` |
| `.workflow-cards` | 3-column overview cards with white top stripe and hover inversion |
| `.image-grid` | `.grid-3`, `.grid-4`, `.grid-5`, `.grid-6` variants with white gap borders |
| `.tips-grid` | 2-column tip cards with unique stripe pattern decorations per card |
| `.media-placeholder` | Auto-generated placeholder for missing images/videos/3D models |

### Section Themes (data-theme attribute)
Each top-level `<section>` has a `data-theme` attribute that controls:
- p5.js background pattern selection
- Background opacity level
- Badge/accent colors in CSS (all white in B&W system)

| Theme | Used For | p5.js Pattern | Opacity |
|-------|----------|---------------|---------|
| `narrative` | Layer 1 | Wavy Lines ("Current") | 0.14 |
| `pink` | Layer 2 (The Work), Layer 3 header | Warped Checkerboard ("Movement in Squares") | 0.10 |
| `blue` | Layer 4 (How to Vibe Code) | Lens Stripes (vesica piscis) | 0.13 |
| `purple` | AI-Assisted Programming workflow | Radial Vortex | 0.09 |
| `green` | 3D Sculpture workflow, Demo | Curved Concentric Stripes ("Fragment") | 0.12 |
| `coral` | Video & Projection workflow | Dense Wavy Lines | 0.10 |
| `default` | Q&A/Closing | Concentric Rings | 0.12 |

---

## Design Rules for Future Changes
1. **No color** — everything is black and white. No colored accents, borders, or fills.
2. **Never use border-radius** on cards, inputs, or containers. Sharp edges only.
3. **Never use soft/neumorphic shadows**. Use subtle white borders or directional glow.
4. **Cards invert on hover** — background becomes white, text becomes black, with translateY(-4px).
5. **All animations use cubic-bezier(0.16, 1, 0.3, 1)** for smooth, snappy motion.
6. **Background is always pure black** (#000000). Content surfaces are #0C0C0C with 15-35% white borders.
7. **Media has no rounded corners**, only white borders (1-3px).
8. **Typography hierarchy**: Erica One (display/cursive) for headings, Lato (sans-serif) for body.
9. **p5.js canvas is always visible** behind content at low opacity (0.09–0.14).
10. **Op-art decorative patterns** (stripes, circles, checkerboards) used as `::before`/`::after` pseudo-elements on slide types.
11. **Workflow steps alternate** black-on-white and white-on-black for visual rhythm.
12. **All asset paths are relative** — never use absolute paths starting with `/`.
13. **Missing media shows a placeholder** — never a broken image icon or empty space.
14. **Images and videos always maintain aspect ratio** — use `object-fit: contain/cover` and `aspect-ratio` CSS, never stretch.
15. **Font sizes use em/rem** so they scale correctly with Reveal.js zoom across screen sizes.