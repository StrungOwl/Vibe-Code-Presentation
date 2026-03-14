//after having a short chat with chatGPT I had it render the following text. 
//bring second laptop that the project is rendering on while I give the presentation? 

Use google AI studio at first?? 

Product Requirements Document (PRD)
Project Title

Body Browser

Project Description

Body Browser is an experimental website interface where traditional mouse and keyboard inputs are replaced with facial expressions and hand gestures.

The interface visually resembles a retro early-internet website (late 90s / early 2000s aesthetic) but the interaction system is contemporary and embodied.

Users navigate the website using:

• nose movement → cursor
• hand clap → click
• eyebrow movement → scroll

The goal is to create a performative, playful interface that demonstrates how websites could respond to the human body rather than traditional input devices.

This project is designed as a live demo for a talk on AI-assisted creative coding workflows.

Goals

Demonstrate a working gesture-based website interface

Show how AI can rapidly prototype interactive systems

Blend retro web aesthetics with modern interaction design

Build a system that can be expanded with additional gestures

Core Interactions
Cursor Control

Input: Nose position

The tip of the user's nose controls the position of a cursor on screen.

Requirements

• Cursor position should map smoothly to screen coordinates
• Cursor should be visible as a custom icon (retro pixel cursor)
• Cursor movement must feel responsive with minimal lag

Implementation Suggestion

Use MediaPipe FaceMesh and track landmark:

nose_tip = landmark[1]

Map normalized coordinates to viewport.

Click Interaction

Input: Hand clap

A clap gesture triggers a mouse click event.

Requirements

• Detect when two hands come close together rapidly
• Trigger click when distance between hands drops below threshold
• Prevent repeated clicks using debounce (~500ms)

Implementation Suggestion

Use MediaPipe Hands.

Detect:

distance(left_palm, right_palm) < threshold

When distance rapidly decreases → fire click.

Scroll Interaction

Input: Eyebrow movement

Raising eyebrows scrolls the page down.
Lowering eyebrows scrolls the page up.

Requirements

Detect relative eyebrow height compared to neutral position.

Raise eyebrows:

scrollDown()

Lower eyebrows:

scrollUp()

Scroll should be smooth and continuous.

Implementation Suggestion

Track eyebrow landmarks:

left_eyebrow
right_eyebrow

Measure distance between:

eyebrow → eye

If distance increases above baseline → scroll down.

If distance decreases below baseline → scroll up.

Visual Design

The site should resemble an early internet aesthetic.

Inspiration

• GeoCities
• early HTML websites
• Netscape era UI
• Windows 95/98 UI elements

Visual Elements

• pixel fonts
• tiled backgrounds
• animated GIFs
• beveled buttons
• bright color palettes
• blinking text

Modern Overlay

Combine retro UI with:

• smooth animations
• WebGL particles
• hover glow effects
• subtle physics interactions

Interface Layout

The site should function like a typical website homepage.

Sections

Hero Section
About Section
Projects Section
Gallery Section
Contact Section

Users navigate by scrolling via eyebrow movement.

Links should respond to nose cursor hover + clap click.

Cursor Behavior

The cursor should behave like a traditional mouse pointer.

Requirements

Hover state triggers:

• link highlights
• button animations
• tooltips

Cursor icon style:

pixel arrow
or custom retro pointer

Feedback System

Because the user is not touching a device, the system must provide clear visual feedback.

Examples:

• cursor glow when hovering clickable element
• clap click produces burst animation
• scrolling triggers visual page shift effect

Technology Stack
Language

JavaScript

Libraries

MediaPipe FaceMesh
MediaPipe Hands

Optional:

Three.js or p5.js for visual effects.

Browser APIs

getUserMedia (webcam input)

Performance Requirements

• Must run in modern browsers (Chrome preferred)
• Target 30fps+ tracking
• Latency under ~150ms
• Should work on a laptop webcam

Calibration System

Because faces differ, the system should calibrate baseline positions.

Calibration Step

When page loads:

User presses a "Calibrate" button.

System records:

• neutral eyebrow position
• neutral nose center

This baseline is used for gesture detection.

Safety / UX Constraints

To prevent accidental triggers:

Click debounce: 500ms
Scroll smoothing required
Cursor movement should include slight damping

File Structure

Claude Code should scaffold:

/body-browser
   index.html
   style.css
   main.js
   tracking.js
   gestures.js
   ui.js
   assets/
MVP Scope

For the first prototype implement:

Webcam initialization

Nose cursor tracking

Clap click detection

Eyebrow scroll detection

Simple website layout with links

Hover states

Clickable buttons

Future Features

Possible extensions:

• wink = open modal
• smile = reveal hidden content
• hand wave = change theme
• pinch gesture = zoom page
• generative art responding to gestures

Success Criteria

The demo is successful if:

• the cursor follows nose movement smoothly
• clapping triggers button clicks
• eyebrow motion scrolls the page
• audience can visually understand the interaction

Deliverable

Claude Code should generate a working local web prototype that runs by opening:

index.html

in a browser.

No build step required.

If you'd like, I can also give you something extremely useful for the talk:

The exact Claude prompt that will generate this entire system in one shot

A simplified clap detection trick (real claps are surprisingly hard to detect)

A way to make the cursor feel buttery smooth instead of jittery (important for demos).