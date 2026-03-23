# PRD.md

## Project Title

Biomorphic Face-Controlled Web Interface

## Overview

This project is an experimental web-based interface that uses facial tracking and embodied interaction to control a biomorphic, living UI system. The interface behaves like an organic, evolving structure rather than a traditional website, responding in real-time to user facial movements and gestures.

The goal is to merge creative coding, human-computer interaction, and generative visuals into a seamless, immersive experience.

---

## Goals

* Create a highly original, visually striking biomorphic UI
* Enable hands-free interaction using face tracking
* Explore embodied interaction beyond mouse/keyboard
* Maintain smooth real-time performance (target: 60fps)
* Ensure accessibility fallback options

---

## Core Features

### 1. Face-Based Interaction (ml5.js)

* Nose → cursor position
* Eyebrow raise → scroll
* Mouth open / clap → click trigger
* Facial expressions → distort UI elements

### 2. Biomorphic UI System (Three.js)

* Organic, soft-body inspired geometry
* Animated shaders (noise, displacement, morphing)
* Depth-based layering and parallax
* Reactive elements that pulse, stretch, and merge

### 3. Interaction Feedback

* Visual deformation on interaction
* Color shifts and glow based on input intensity
* Smooth transitions (no abrupt state changes)

### 4. Navigation System

* Non-linear, exploratory navigation
* No rigid grid layout
* Spatial zones instead of pages

---

## Tech Stack

### Core

* Three.js (3D rendering)
* ml5.js (face tracking)
* WebGL (via Three.js)

### Supporting

* Vite (fast dev server + bundling)
* TypeScript (recommended for stability)
* GSAP (animation control)
* Zustand or simple state manager (optional)

---

## Architecture

### High-Level Flow

1. Webcam input → ml5 face tracking
2. Extract facial landmarks
3. Map landmarks → interaction signals
4. Feed signals into Three.js scene
5. Update UI state + animations

### Modules

* `FaceTracker.ts`
* `InteractionMapper.ts`
* `SceneManager.ts`
* `UIEntities.ts`
* `AnimationController.ts`

---

## Key Technical Considerations

### 1. ml5.js + Webcam

* Must run on HTTPS (camera access requirement)
* Handle permission denial gracefully
* Optimize for low-light / different faces

### 2. Three.js Performance

* Avoid excessive geometry (use instancing where possible)
* Use shaders instead of heavy mesh updates
* Limit draw calls
* Use requestAnimationFrame properly

### 3. Coordinate Mapping

* Normalize face tracking coordinates (0–1 range)
* Smooth input using lerp or easing
* Prevent jitter with threshold filtering

### 4. Event Stability

* Avoid rapid-fire click triggers
* Implement debounce for gestures
* Add cooldown timers for actions

---

## Known Pitfalls & How to Avoid Them

### ml5 Issues

* ❌ Face tracking lag

  * ✅ Use lower resolution video feed
  * ✅ Run detection at intervals (not every frame)

* ❌ Inconsistent landmark detection

  * ✅ Add smoothing + fallback states

### Three.js Issues

* ❌ Memory leaks

  * ✅ Dispose geometries, materials, textures

* ❌ Performance drops

  * ✅ Avoid re-creating objects every frame
  * ✅ Use object pooling

* ❌ Camera + interaction mismatch

  * ✅ Normalize coordinate systems carefully

### Integration Issues

* ❌ Blocking render loop

  * ✅ Keep ml5 async and separate from render loop

* ❌ UI jitter

  * ✅ Apply easing (lerp) to all input values

---

## UX Principles

* The interface should feel alive, not mechanical
* Interactions should be discoverable but not obvious
* Embrace slight unpredictability
* Avoid overwhelming the user with too much motion

---

## Accessibility

* Keyboard + mouse fallback
* Toggle to disable camera interaction
* Reduced motion mode

---

## Milestones

### Phase 1: Prototype

* Basic Three.js scene
* Webcam + face tracking working
* Nose → cursor mapping

### Phase 2: Interaction Layer

* Add gesture detection
* Implement click + scroll

### Phase 3: Visual System

* Biomorphic shaders
* Reactive UI elements

### Phase 4: Polish

* Performance optimization
* UX refinement
* Accessibility features

---

## Success Metrics

* Smooth interaction without lag
* Users can navigate without instruction
* Visual system feels unique and immersive

---

## Future Extensions

* Multi-user interaction
* AR/WebXR version
* Sound-reactive visuals
* AI-driven generative environments

---

## Notes for Claude Code

* Prefer modular architecture
* Avoid tightly coupled systems
* Write reusable utilities for mapping + smoothing
* Test performance early and often
* Keep render loop clean and minimal

---

## End of Document
