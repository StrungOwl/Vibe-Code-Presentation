// ================================================================
//  nose-cursor.js  —  ml5 faceApi nose-tip cursor + mouth-open click
//
//  ml5 v0.x  •  68-point landmarks  •  nose tip = index 30
//  Mouth click uses inner lip landmarks 62 (top) and 66 (bottom)
//
//  Architecture:
//    detectLoop  (~10–15 fps)  →  sets targetX / targetY
//    renderLoop  (~60 fps)     →  lerps curX/curY toward target, moves cursor
// ================================================================

// ---- Tuning ----
const MOUTH_OPEN_THRESHOLD = 18;   // px in video space — raise if accidental clicks
const MOUTH_CLOSE_RATIO    = 0.5;  // must close to this fraction before re-arming
const CLICK_COOLDOWN_MS    = 800;
const CIRC   = 2 * Math.PI * 16;  // arc circumference for wiggle-ring (r = 16)
const SMOOTH = 0.2;                // lerp factor: 0 = frozen, 1 = instant

// ---- DOM refs ----
let videoEl, cursorEl, wiggleRing, wiggleArc, statusEl;

// ---- State ----
let faceApi;
let lastClickTime = 0;
let hoveredEl     = null;
let mouthWasOpen  = false;
let missCount     = 0;
const MAX_MISS    = 8;  // show warning only after this many consecutive missed frames

// Target position (set by detection, ~10–15 fps)
let targetX = null, targetY = null;

// Current rendered position (smoothed by renderLoop at 60 fps)
let curX = null, curY = null;

// ================================================================
//  1. Camera
// ================================================================
async function init() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      audio: false
    });
    videoEl.srcObject = stream;
    videoEl.onloadeddata = () => {
      videoEl.play();
      // ml5 faceApi reads HTML width/height attributes, not CSS dimensions
      videoEl.width  = videoEl.videoWidth  || 640;
      videoEl.height = videoEl.videoHeight || 480;
      loadFaceApi();
    };
    videoEl.load();
  } catch (err) {
    statusEl.textContent = 'Camera denied — grant access & refresh';
    console.error('[NoseCursor] Camera:', err);
  }
}

// ================================================================
//  2. Load ml5 faceApi model
// ================================================================
function loadFaceApi() {
  statusEl.textContent = 'Loading face model...';
  if (typeof setFaceTrackingStatus === 'function') setFaceTrackingStatus('Loading…');

  faceApi = ml5.faceApi(videoEl,
    { withLandmarks: true, withDescriptors: false, flipHorizontal: true, minConfidence: 0.3 },
    () => {
      statusEl.textContent = 'Point your face at the camera';
      if (typeof setFaceTrackingStatus === 'function') setFaceTrackingStatus('Model ready');
      detectLoop();
      requestAnimationFrame(renderLoop);
    }
  );
}

// ================================================================
//  3. Detection loop — callback chain, ~10–15 fps
//     Only updates targetX/targetY and mouth state.
// ================================================================
function detectLoop() {
  faceApi.detect((err, results) => {
    if (!err) processDetections(results);
    detectLoop();
  });
}

function processDetections(results) {
  const landmarks = results?.[0]?.landmarks?.positions;
  const nosePt    = landmarks?.[30];

  if (!nosePt) {
    missCount++;
    if (missCount >= MAX_MISS) {
      statusEl.textContent = 'No face detected — move closer';
      if (typeof setFaceTrackingStatus === 'function') setFaceTrackingStatus('No face detected');
    }
    return;
  }

  missCount = 0;

  const vw = videoEl.videoWidth  || 640;
  const vh = videoEl.videoHeight || 480;

  // Update detection target (renderLoop will smooth toward this)
  targetX = (1 - nosePt._x / vw) * window.innerWidth;
  targetY = (nosePt._y / vh) * window.innerHeight;

  // Mouth open — inner lip top (62) vs bottom (66)
  const lipTop    = landmarks[62];
  const lipBottom = landmarks[66];
  const mouthDist = lipTop && lipBottom ? lipBottom._y - lipTop._y : 0;
  const isOpen    = mouthDist > MOUTH_OPEN_THRESHOLD;

  const dashLen = Math.min(mouthDist / (MOUTH_OPEN_THRESHOLD * 1.5), 1) * CIRC;
  wiggleArc.setAttribute('stroke-dasharray', `${dashLen} ${CIRC - dashLen}`);
  wiggleArc.setAttribute('stroke', isOpen ? '#ba1b24' : '#5e55a0');

  const now = Date.now();
  if (isOpen && !mouthWasOpen && now - lastClickTime > CLICK_COOLDOWN_MS) {
    triggerClick(curX ?? targetX, curY ?? targetY);
  }
  if (mouthDist < MOUTH_OPEN_THRESHOLD * MOUTH_CLOSE_RATIO) mouthWasOpen = false;
  else if (isOpen) mouthWasOpen = true;

  statusEl.textContent = 'Tracking ✓';
  if (typeof setFaceTrackingStatus === 'function') setFaceTrackingStatus('Tracking ✓');

  if (typeof showFaceTracking !== 'undefined' && showFaceTracking &&
      typeof updateNoseOnTrackingCanvas === 'function') {
    updateNoseOnTrackingCanvas(nosePt._x, nosePt._y, vw, vh);
  }
}

// ================================================================
//  4. Render loop — 60 fps, lerps cursor toward detection target
// ================================================================
function renderLoop() {
  if (targetX !== null) {
    // Snap to target on first frame
    if (curX === null) { curX = targetX; curY = targetY; }

    // Lerp toward target
    curX += (targetX - curX) * SMOOTH;
    curY += (targetY - curY) * SMOOTH;

    // Move cursor — CSS vars on compositor thread, no layout reflow
    cursorEl.style.setProperty('--cx', (curX - 12) + 'px');
    cursorEl.style.setProperty('--cy', (curY - 12) + 'px');
    wiggleRing.style.setProperty('--rx', (curX - 18) + 'px');
    wiggleRing.style.setProperty('--ry', (curY - 18) + 'px');

    updateHover(curX, curY);
  }

  requestAnimationFrame(renderLoop);
}

// ================================================================
//  5. Hit-test — finds element under cursor without DOM mutation
// ================================================================
function getElementAt(x, y) {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    if (el !== cursorEl && el !== wiggleRing) return el;
  }
  return document.body;
}

// ================================================================
//  6. Hover highlight
// ================================================================
function updateHover(x, y) {
  const folder = getElementAt(x, y)?.closest('[data-href]');

  if (hoveredEl && hoveredEl !== folder) hoveredEl.classList.remove('nose-hover');

  if (folder) {
    folder.classList.add('nose-hover');
    cursorEl.classList.add('hovering');
  } else {
    cursorEl.classList.remove('hovering');
  }

  hoveredEl = folder || null;
}

// ================================================================
//  7. Click — navigate to data-href
// ================================================================
function triggerClick(x, y) {
  lastClickTime = Date.now();

  cursorEl.classList.add('clicking');
  setTimeout(() => cursorEl.classList.remove('clicking'), 350);

  const href = getElementAt(x, y)?.closest('[data-href]')?.getAttribute('data-href');
  if (href) setTimeout(() => { window.location.href = href; }, 280);
}

// ================================================================
//  Bootstrap
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  videoEl    = document.getElementById('webcam');
  cursorEl   = document.getElementById('nose-cursor');
  wiggleRing = document.getElementById('wiggle-ring');
  wiggleArc  = document.getElementById('wiggle-arc');
  statusEl   = document.getElementById('nose-status');

  // Reparent cursor elements to <html> to escape body overflow:hidden
  document.documentElement.appendChild(cursorEl);
  document.documentElement.appendChild(wiggleRing);

  init();
});
