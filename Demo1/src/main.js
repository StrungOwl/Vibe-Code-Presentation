/**
 * Main entry point — wires together all modules.
 */
import { FaceTracker } from './FaceTracker.js';
import { InteractionMapper } from './InteractionMapper.js';
import { SceneManager } from './SceneManager.js';
import { UIEntities } from './UIEntities.js';
import { AnimationController } from './AnimationController.js';

// DOM elements
const canvas = document.getElementById('scene');
const video = document.getElementById('webcam');
const status = document.getElementById('status');
const startBtn = document.getElementById('start-btn');
const fallbackBtn = document.getElementById('fallback-btn');
const cursorDot = document.getElementById('cursor-dot');

// Initialize core systems
const sceneManager = new SceneManager(canvas);
const uiEntities = new UIEntities(sceneManager);
const interactionMapper = new InteractionMapper();
const animController = new AnimationController();

let faceTracker = null;
let cursorWorldPos = null;

// --- Wire up interaction callbacks ---

interactionMapper.onCursorMove = (cursor) => {
  // Update cursor dot position
  cursorDot.style.left = (cursor.x * window.innerWidth) + 'px';
  cursorDot.style.top = (cursor.y * window.innerHeight) + 'px';

  // Convert to pixel position for blob proximity
  cursorWorldPos = sceneManager.normalizedToWorld(cursor.x, cursor.y);
};

interactionMapper.onScroll = (amount) => {
  animController.applyScroll(amount);
};

interactionMapper.onClick = () => {
  animController.triggerClick();
  cursorDot.classList.add('active');
  setTimeout(() => cursorDot.classList.remove('active'), 200);

  // Check if a blob is hovered
  const hovered = uiEntities.getHoveredBlob();
  if (hovered) {
    status.textContent = `Activated: ${hovered.label}`;
    setTimeout(() => {
      status.textContent = faceTracker ? 'Face tracking active' : 'Mouse mode';
    }, 1500);
  }
};

interactionMapper.onExpression = (value) => {
  // Expression value is passed through update loop
};

// --- Render loop integration ---

sceneManager.onUpdate((elapsed, delta) => {
  // Update face tracking → interaction mapper
  if (faceTracker && faceTracker.ready) {
    interactionMapper.updateFromFace(faceTracker);
  }

  // Update animation controller
  animController.update(elapsed);

  // Update UI entities (drawn onto p5 canvas)
  uiEntities.update(
    elapsed,
    delta,
    cursorWorldPos,
    interactionMapper.isClicking,
    interactionMapper.expressionValue
  );
});

// --- Camera start ---

startBtn.addEventListener('click', async () => {
  startBtn.textContent = 'Starting...';
  startBtn.disabled = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: 'user' }
    });
    video.srcObject = stream;
    video.style.display = 'block';

    video.addEventListener('loadeddata', async () => {
      status.textContent = 'Loading face model...';

      faceTracker = new FaceTracker(video);
      faceTracker.onReady = () => {
        status.textContent = 'Face tracking active';
        startBtn.classList.add('hidden');
        fallbackBtn.classList.add('hidden');
        cursorDot.style.display = 'block';
      };

      await faceTracker.init();
    });
  } catch (err) {
    console.error('Camera error:', err);
    status.textContent = 'Camera denied — use mouse mode';
    startBtn.textContent = 'Enable Camera';
    startBtn.disabled = false;
  }
});

// --- Mouse fallback ---

fallbackBtn.addEventListener('click', () => {
  interactionMapper.mouseMode = true;
  document.body.classList.add('mouse-mode');
  startBtn.classList.add('hidden');
  fallbackBtn.classList.add('hidden');
  cursorDot.style.display = 'block';
  status.textContent = 'Mouse mode';

  window.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;
    interactionMapper.updateFromMouse(nx, ny);
  });

  window.addEventListener('click', () => {
    interactionMapper.handleMouseClick();
  });
});

// --- Keyboard accessibility ---

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    interactionMapper.handleMouseClick();
  }
});

// Status
status.textContent = 'Ready — enable camera or use mouse mode';
