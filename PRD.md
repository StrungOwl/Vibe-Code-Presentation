# PRD: Palettable Programming - Presentation Website

## Overview
A Reveal.js presentation website for Sydney Parks' talk "Palettable Programming: A Painter's Journey into Code and AI." This is a personal narrative-driven presentation for the Vibe Code Austin event, telling the story of transitioning from traditional painting to AI-assisted creative coding.

## Design System: Op Art (Bridget Riley Inspired)

0### Visual Identity
- **Dark base**: Pure black (#0A0A0A) backgrounds with high-contrast elements
- **No rounded corners**: Sharp, geometric edges on all cards and UI elements (border-radius: 0)
- **No soft shadows**: Replaced neumorphic shadows with subtle borders (rgba white at 8% opacity) and directional glow effects
- **Color accents via border-left or top-stripe**: Cards use thin colored borders instead of background fills

### Color Palette (Bridget Riley Egyptian Period)
- Red: `#E03030` (brick red, high energy)
- Ochre: `#E8B830` (warm yellow)
- Blue: `#2060D0` (deep cobalt)
- Turquoise: `#20C8B0` (PRIMARY accent - used for highlights, links, hover states)
- Green: `#30A860` (natural green)
- Orange: `#F07030` (warm complement)

### Interactive Background
- Full-screen canvas with animated Op Art wave lines (40 undulating sine-wave lines)
- Mouse-reactive: waves distort toward/away from cursor position with smooth interpolation
- Concentric circles follow mouse position (inspired by Riley's "Fall" series)
- Colors shift per section theme (narrative=turquoise/blue, pink=red/orange, blue=blue/turquoise, green=green/turquoise)

### Typography
- Headings: DM Serif Display (serif, no text-transform)
- Body: Space Grotesk (sans-serif, weight 300-700)
- Narrative slides: 1.8em body text, climax slides: 2.2em
- Text glow effects on key headings using text-shadow with palette colors

### Animation Principles
- Slide-up entrance (translateY) instead of bouncy/scale
- Cubic-bezier(0.16, 1, 0.3, 1) for smooth, elegant easing
- Fragment reveals with 0.7s transitions and translateY(16px)
- Staggered grid entrances using fadeScale keyframes
- Scrolling stripe dividers using repeating-linear-gradient animation

---

## Narrative Structure: 4 Acts

### ACT 1 - Origin Story: "From Painter to Programmer" (data-theme="narrative")
The emotional core. Slides use large centered text with fragment reveals.

1. **Title**: "Palettable Programming" / "A Painter's Journey into Code and AI" / Sydney Parks
2. **Pivotal Moment**: Projecting video onto a painting to make it come alive
3. **Something Missing**: "It moved. It breathed. But it wasn't enough. It was missing emergence."
4. **Emergence Definition**: Large animated word + definition card with top stripe gradient
5. **The Click Moment** (CLIMAX): Looking down at paint-covered computer, realizing must learn to code
6. **Refik Anadol**: Discovery of artist who wrote Python scripts for AI art before LLMs
7. **Learning Path**: Thought Python, found Processing/p5.js, ventured into Java/JavaScript
8. **Where I Am Now**: Professor at UT AET department (VR, code, fabrication, immersive installations)
9. **Student Challenge**: Students skeptical of AI, job is changing hearts and minds
10. **Transition**: "Let me show you a little of what I teach today."

### ACT 2 - The Work (data-theme="pink")
Portfolio gallery followed by project deep-dives.

11. **Act 2 Header**: "The Work"
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
28. **Paradigm Shift**: "The move isn't to learn to program -- it's to learn to speak."

### ACT 3 - How to Vibe Code (data-theme="blue")
Step-by-step guide with card layouts.

29. **Act 3 Header**: "How to Vibe Code" / "A step-by-step guide"
30. **Step 1 - Choose Your Tool**: Cursor, Google Antigravity, VS Code + Claude Code (3-card grid)
31. **Step 2 - Choose Your LLM**: Codex vs Claude (2-card grid) + harness explainers for PAI and OpenClaw
32. **Step 3 - Create a PRD**: Product Requirements Document with GPT collaboration
33. **Step 4 - Generate a Design**: Visual mockups using Nanobanan, GPT image gen
34. **Step 5 - Research Libraries**: Use AI to identify needed frameworks before building
35. **Step 6 - Let Your Agent Build**: Hand off, guide with pseudo code
36. **Tips Grid**: 4 cards (The Seed Is Your Work, Get Smart with AI Planning, Use AI to Rewrite Prompts, Start with What You Know)

### ACT 4 - Process, Demo & Close
Relocated existing workflow content + live demo.

37. **Act 4 Header**: "My Process & Workflows"
38. **Workflow Overview**: 3 cards (AI-Assisted Programming, 3D Printed Sculpture, Video & Projection)
39-41. **AI-Assisted Programming**: Workflow chart, Kinetic Contemplations, Arduino (Nameless Dread NOT here - it's in Act 2)
42-51. **3D Printed Sculpture**: Full workflow (Crying Man, Burial with 3D viewer, Sitting Woman, Flower Fingers)
52-54. **Video & Projection**: Workflow chart, AI video grid, projection mapping
55-56. **Experiments**: Reel + mistakes video
57-60. **Demo**: Pipeline diagram, live demo, recap
61. **Q&A / Closing**: Contact + social links

---

## Technical Architecture

### Stack
- **Framework**: Reveal.js 5 (CDN)
- **3D Viewer**: Three.js 0.160.0 with OBJLoader and OrbitControls
- **Animations**: CSS keyframes + Reveal.js fragment system + Canvas API
- **Fonts**: Google Fonts (DM Serif Display, Space Grotesk)
- **No build step**: Static HTML/CSS/JS served directly

### File Structure
```
/
  index.html          - Main presentation (all slides)
  PRD.md              - This document
  css/
    theme.css         - Op Art design system (~900 lines)
  js/
    presentation.js   - Op Art canvas, Reveal.js config, Three.js viewer
  Who Am I/
    Myself/           - Portrait (bW2.png), Art Car photos
    My Work/
      Portfolio/      - 7 main portfolio images
      Nameless Dread/ - Code.mp4, Explore Algo.mp4
      Vibe Coded/     - EMPTY (awaiting media for Flow Performance, Gestural, sydneyparks.io)
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
    Experiments_Mistakes/ - 1.png, FinalEdit.mp4
```

### Key Interactions
1. **Op Art wave canvas**: 40 sine-wave lines with mouse-reactive distortion. Colors change per section theme. Concentric circles follow cursor.
2. **Three.js OBJ viewer**: Two interactive 3D model viewers (Burial: gma4.obj, Sitting Woman: sunflower1.obj) with auto-rotation, orbit controls, and gallery lighting.
3. **Fragment reveals**: Narrative slides use Reveal.js fragments for speaker-paced dramatic text reveals.
4. **Card hover effects**: Border-bottom scale animation, glow shadows, translateY lift.
5. **Ken Burns**: Background images slowly zoom over 25s.

### CSS Class Reference
| Class | Purpose |
|-------|---------|
| `.slide-title` | Title slide centered layout |
| `.section-header` | Act/section header with badge |
| `.slide-cinematic` | Narrative text, 1.8em, centered |
| `.slide-climax` | Emotional high point, 2.2em, `.gradient-text` for accented words |
| `.slide-definition` | Large keyword + definition card with top stripe |
| `.slide-image` | Full-bleed background image with `.image-caption` overlay |
| `.slide-video` | Centered video player |
| `.slide-guide` | How-to step with `.step-badge` and `.guide-cards` |
| `.slide-placeholder` | Dashed-border cards awaiting media |
| `.project-title` | Project name + medium subtitle |
| `.workflow-chart` | Horizontal workflow with `.wf-step` and `.wf-arrow` |
| `.workflow-cards` | 3-column overview cards |
| `.image-grid` | `.grid-3`, `.grid-4`, `.grid-5`, `.grid-6` variants |
| `.tips-grid` | 2-column tip cards with left-border hover |

### Section Themes (data-theme attribute)
Each top-level `<section>` has a `data-theme` attribute that controls:
- Canvas wave colors
- Badge/accent colors in CSS

| Theme | Used For | Canvas Colors |
|-------|----------|---------------|
| `narrative` | Act 1 | Turquoise, Blue, Ochre, Red |
| `pink` | Act 2 (The Work), Act 4 header | Red, Orange, Ochre, Turquoise |
| `blue` | Act 3 (How to Vibe Code) | Blue, Turquoise, Ochre, Green |
| `purple` | AI-Assisted Programming workflow | Turquoise, Blue, Green, Ochre |
| `green` | 3D Sculpture workflow, Demo | Green, Turquoise, Blue, Ochre |
| `coral` | Video & Projection workflow | Orange, Red, Ochre, Turquoise |
| `default` | Q&A/Closing | All five colors |

---

## Design Rules for Future Changes
1. **Never use border-radius** on cards, inputs, or containers. Sharp edges only.
2. **Never use soft/neumorphic shadows**. Use subtle borders or directional glow.
3. **Accent color is turquoise** (#20C8B0) for highlights, links, and interactive states.
4. **Cards use top-stripe gradients** (3px height) for color coding, not background fills.
5. **All animations use cubic-bezier(0.16, 1, 0.3, 1)** for smooth, snappy motion.
6. **Background is always dark** (#0A0A0A). Content surfaces are #161616 with 8% white borders.
7. **Media has no rounded corners**, only 1px borders.
8. **Hover effects**: translateY(-6px) + glow shadow + border brightening.
9. **Typography hierarchy**: Serif for headings (emotional), Sans-serif for body (clean).
10. **Op Art canvas is always visible** behind content at low opacity.
