// ================================================================
//  nose-cursor.js
//  ml5 faceApi (v0.x) — nose-tip cursor + wiggle-to-click
//
//  Uses the same technique as sketch-face.js:
//    • ml5.faceApi with withLandmarks: true
//    • callback-based detect() loop (not detectStart)
//    • 68-point landmarks via detection.landmarks.positions
//    • Nose tip = index 30  (coords: pt._x, pt._y in video px)
// ================================================================

// ---- DOM refs (resolved after DOMContentLoaded) ----
let videoEl    = null;
let cursorEl   = null;
let wiggleRing = null;
let wiggleFill = null;
let wiggleArc  = null;
let statusEl   = null;

let faceApi       = null;
let isModelReady  = false;
let isDetecting   = false;
let detections    = [];

let noseHistory   = [];
let lastClickTime = 0;
let hoveredEl     = null;

// ---- Tuning ----
const WIGGLE_WINDOW_MS       = 500;
const MIN_REVERSALS          = 4;
const MIN_REVERSAL_AMPLITUDE = 7;
const CLICK_COOLDOWN_MS      = 1300;
const CIRC = 2 * Math.PI * 16;

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
      // Set HTML width/height attributes — ml5 faceApi reads these (not CSS) to resize results
      videoEl.width  = videoEl.videoWidth  || 640;
      videoEl.height = videoEl.videoHeight || 480;
      loadFaceApi();
    };
    videoEl.load();
  } catch (err) {
    statusEl.textContent = 'Camera denied — grant access & refresh';
    console.error('Camera error:', err);
  }
}

// ================================================================
//  2. Load ml5 faceApi  (same technique as sketch-face.js)
// ================================================================
function loadFaceApi() {
  statusEl.textContent = 'Loading face model...';
  if (typeof setFaceTrackingStatus === 'function') setFaceTrackingStatus('Loading face model…');

  const options = {
    withLandmarks: true,
    withDescriptors: false,
    flipHorizontal: true
  };

  faceApi = ml5.faceApi(videoEl, options, function() {
    isModelReady = true;
    statusEl.textContent = 'Model ready — point face at camera';
    if (typeof setFaceTrackingStatus === 'function') setFaceTrackingStatus('Model ready — point face at camera');
    console.log('[NoseCursor] faceApi model ready');
    requestAnimationFrame(drawLoop);
  });
}

// ================================================================
//  3. Detect loop  (same pattern as sketch-face.js detectFace())
// ================================================================
function detectFace() {
  if (!isModelReady || isDetecting) return;
  isDetecting = true;

  faceApi.detect(function(err, results) {
    isDetecting = false;
    if (err) { console.error('[NoseCursor] detect error:', err); return; }
    detections = results;
  });
}

function drawLoop() {
  detectFace();
  processDetections();
  requestAnimationFrame(drawLoop);
}

// ================================================================
//  4. Process detections each frame
// ================================================================
function processDetections() {
  if (!detections || detections.length === 0) {
    if (typeof setFaceTrackingStatus === 'function') setFaceTrackingStatus('No face detected — move closer');
    statusEl.textContent = 'No face detected — move closer';
    return;
  }

  const detection = detections[0];
  if (!detection.landmarks || !detection.landmarks.positions) return;

  if (typeof setFaceTrackingStatus === 'function') setFaceTrackingStatus('Face detected ✓');

  const landmarks = detection.landmarks.positions;

  // Nose tip = index 30 in the 68-point model (same as sketch-face.js noseBridge end)
  const nosePt = landmarks[30];
  if (!nosePt) return;

  const vw = videoEl.videoWidth  || 640;
  const vh = videoEl.videoHeight || 480;

  // Mirror X — same as sketch-face.js: p.width - p.map(pt._x, 0, video.width, 0, p.width)
  const sx = (1 - nosePt._x / vw) * window.innerWidth;
  const sy = (nosePt._y / vh) * window.innerHeight;

  statusEl.textContent =
    `raw: (${nosePt._x.toFixed(1)}, ${nosePt._y.toFixed(1)})  →  screen: (${sx.toFixed(0)}, ${sy.toFixed(0)})`;

  // Move cursor dot
  cursorEl.style.left = sx + 'px';
  cursorEl.style.top  = sy + 'px';

  // Draw nose dot in face-tracking overlay
  if (typeof updateNoseOnTrackingCanvas === 'function') {
    updateNoseOnTrackingCanvas(nosePt._x, nosePt._y, vw, vh);
  }

  // Move wiggle ring
  wiggleRing.style.left = sx + 'px';
  wiggleRing.style.top  = sy + 'px';

  // Record nose X for wiggle detection
  const now = Date.now();
  noseHistory.push({ x: nosePt._x, t: now });
  noseHistory = noseHistory.filter(p => now - p.t < WIGGLE_WINDOW_MS);

  updateHover(sx, sy);
  const wig = detectWiggle();

  wiggleFill.style.width = (wig.progress * 100) + '%';
  const dashLen = wig.progress * CIRC;
  wiggleArc.setAttribute('stroke-dasharray', dashLen + ' ' + (CIRC - dashLen));
  wiggleArc.setAttribute('stroke', wig.progress > 0.75 ? '#ba1b24' : '#5e55a0');

  if (wig.detected && (now - lastClickTime) > CLICK_COOLDOWN_MS) {
    triggerClick(sx, sy);
  }
}

// ================================================================
//  5. Wiggle detection — counts X direction reversals
// ================================================================
function detectWiggle() {
  if (noseHistory.length < 5) return { detected: false, progress: 0 };

  let reversals = 0;
  let prevDir   = 0;
  let lastRevX  = noseHistory[0].x;

  for (let i = 1; i < noseHistory.length; i++) {
    const dx = noseHistory[i].x - noseHistory[i - 1].x;
    if (Math.abs(dx) < 2) continue;

    const dir = dx > 0 ? 1 : -1;
    if (prevDir !== 0 && dir !== prevDir) {
      if (Math.abs(noseHistory[i].x - lastRevX) >= MIN_REVERSAL_AMPLITUDE) {
        reversals++;
        lastRevX = noseHistory[i].x;
      }
    }
    prevDir = dir;
  }

  return {
    detected: reversals >= MIN_REVERSALS,
    progress: Math.min(reversals / MIN_REVERSALS, 1)
  };
}

// ================================================================
//  6. Hover — highlights folder card under nose
// ================================================================
function updateHover(sx, sy) {
  cursorEl.style.visibility = 'hidden';
  wiggleRing.style.visibility = 'hidden';
  const el = document.elementFromPoint(sx, sy);
  cursorEl.style.visibility = 'visible';
  wiggleRing.style.visibility = 'visible';

  const folder = el?.closest('[data-href]');

  if (hoveredEl && hoveredEl !== folder) {
    hoveredEl.classList.remove('nose-hover');
  }

  if (folder) {
    folder.classList.add('nose-hover');
    cursorEl.classList.add('hovering');
  } else {
    cursorEl.classList.remove('hovering');
  }

  hoveredEl = folder || null;
}

// ================================================================
//  7. Trigger click — navigate to data-href
// ================================================================
function triggerClick(sx, sy) {
  lastClickTime = Date.now();
  noseHistory   = [];

  cursorEl.classList.add('clicking');
  setTimeout(() => cursorEl.classList.remove('clicking'), 350);

  cursorEl.style.visibility = 'hidden';
  const el = document.elementFromPoint(sx, sy);
  cursorEl.style.visibility = 'visible';

  const target = el?.closest('[data-href]');
  if (target) {
    const href = target.getAttribute('data-href');
    if (href) setTimeout(() => { window.location.href = href; }, 280);
  }
}

// ================================================================
//  Bootstrap
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  videoEl    = document.getElementById('webcam');
  cursorEl   = document.getElementById('nose-cursor');
  wiggleRing = document.getElementById('wiggle-ring');
  wiggleFill = document.getElementById('wiggle-fill');
  wiggleArc  = document.getElementById('wiggle-arc');
  statusEl   = document.getElementById('nose-status');

  // Reparent cursor elements to <html> to escape body overflow:hidden
  document.documentElement.appendChild(cursorEl);
  document.documentElement.appendChild(wiggleRing);

  init();
});
