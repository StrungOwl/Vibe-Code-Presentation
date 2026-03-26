// ================================================================
//  face-tracking.js
//  Facial-tracking overlay for Demo 4
//
//  Press  F  to toggle between the main FloralNet UI and a
//  full-screen tracking view that shows just the webcam feed
//  with a red circle drawn at the nose-tip keypoint.
//
//  ml5.js v1  –  FaceMesh, nose keypoint = MediaPipe index 4
// ================================================================

// ---- Public toggle boolean ----
let showFaceTracking = false;

// ---- Internal refs ----
let _trackingOverlay   = null;
let _trackingCanvas    = null;
let _trackingVideoSrc  = null; // holds the MediaStream for the clone


// ================================================================
//  Build the tracking overlay (called once on DOMContentLoaded)
// ================================================================
function initFaceTrackingOverlay() {
  _trackingOverlay = document.createElement('div');
  _trackingOverlay.id = 'face-tracking-overlay';
  Object.assign(_trackingOverlay.style, {
    position:        'fixed',
    inset:           '0',
    background:      '#0d0d0d',
    display:         'none',           // hidden until toggled on
    flexDirection:   'column',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          '999999',
    fontFamily:      "'Inter', sans-serif",
  });

  // ---- Title label ----
  const label = document.createElement('div');
  label.textContent = 'FACIAL TRACKING MODE  —  press F to return';
  Object.assign(label.style, {
    position:      'absolute',
    top:           '1rem',
    left:          '50%',
    transform:     'translateX(-50%)',
    color:         '#ba1b24',
    fontSize:      '0.65rem',
    fontWeight:    '700',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    whiteSpace:    'nowrap',
    pointerEvents: 'none',
  });
  _trackingOverlay.appendChild(label);

  // ---- Video + canvas wrapper ----
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position:     'relative',
    width:        '640px',
    height:       '480px',
    border:       '2px solid #333',
    boxShadow:    '0 0 40px rgba(186,27,36,0.25)',
  });

  // Clone video element — shows the same camera stream
  const vid = document.createElement('video');
  vid.id = 'tracking-video-clone';
  vid.autoplay  = true;
  vid.playsInline = true;
  vid.muted     = true;
  Object.assign(vid.style, {
    width:       '640px',
    height:      '480px',
    display:     'block',
    objectFit:   'cover',
    transform:   'scaleX(-1)',         // mirror so it feels natural
  });
  wrap.appendChild(vid);

  // Canvas drawn on top of video — nose dot lives here
  _trackingCanvas = document.createElement('canvas');
  _trackingCanvas.id     = 'tracking-canvas';
  _trackingCanvas.width  = 640;
  _trackingCanvas.height = 480;
  Object.assign(_trackingCanvas.style, {
    position:      'absolute',
    inset:         '0',
    width:         '640px',
    height:        '480px',
    pointerEvents: 'none',
  });
  wrap.appendChild(_trackingCanvas);

  _trackingOverlay.appendChild(wrap);

  // ---- Model / detection status ----
  const status = document.createElement('div');
  status.id = 'tracking-status';
  Object.assign(status.style, {
    marginTop:     '0.75rem',
    color:         '#f59e0b',
    fontSize:      '0.65rem',
    fontWeight:    '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    pointerEvents: 'none',
  });
  status.textContent = 'Waiting for model…';
  _trackingOverlay.appendChild(status);

  // ---- Coordinates readout ----
  const coords = document.createElement('div');
  coords.id = 'tracking-coords';
  Object.assign(coords.style, {
    marginTop:     '0.4rem',
    color:         'rgba(255,255,255,0.35)',
    fontSize:      '0.55rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    pointerEvents: 'none',
  });
  coords.textContent = '—';
  _trackingOverlay.appendChild(coords);

  document.body.appendChild(_trackingOverlay);

  // Mirror the main webcam stream to the clone video.
  // We poll briefly because the camera starts asynchronously after DOMContentLoaded.
  const mainVid = document.getElementById('webcam');
  function tryMirrorStream() {
    if (mainVid && mainVid.srcObject) {
      vid.srcObject = mainVid.srcObject;
      vid.play().catch(() => {});
    } else {
      setTimeout(tryMirrorStream, 300);
    }
  }
  tryMirrorStream();
}


// ================================================================
//  Update the status line inside the tracking overlay
//  Called from index.html at model-load milestones and per-frame.
// ================================================================
function setFaceTrackingStatus(msg) {
  const el = document.getElementById('tracking-status');
  if (el) el.textContent = msg;
}


// ================================================================
//  Draw the nose dot on the tracking canvas
//
//  Call this from onFaces() on every frame, passing raw keypoint
//  coordinates (already in video-pixel space) and video dimensions.
// ================================================================
function updateNoseOnTrackingCanvas(noseX, noseY, videoWidth, videoHeight) {
  if (!_trackingCanvas) return;

  const ctx = _trackingCanvas.getContext('2d');
  const cw  = _trackingCanvas.width;
  const ch  = _trackingCanvas.height;

  // Map nose coords → canvas pixels
  // With flipped:true in ml5 the x coordinate is already mirrored,
  // matching the scaleX(-1) CSS on the video.
  const cx = (noseX / videoWidth)  * cw;
  const cy = (noseY / videoHeight) * ch;

  ctx.clearRect(0, 0, cw, ch);

  // Outer glow ring
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(186,27,36,0.18)';
  ctx.fill();

  // Mid ring
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(186,27,36,0.35)';
  ctx.fill();

  // Solid red dot
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#ba1b24';
  ctx.fill();

  // White border
  ctx.strokeStyle = 'white';
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  // Cross-hair lines for precision
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 26, cy);
  ctx.lineTo(cx + 26, cy);
  ctx.moveTo(cx, cy - 26);
  ctx.lineTo(cx, cy + 26);
  ctx.stroke();

  // Update coords readout
  const coordsEl = document.getElementById('tracking-coords');
  if (coordsEl) {
    coordsEl.textContent =
      `nose tip  raw: (${noseX.toFixed(1)}, ${noseY.toFixed(1)})  ` +
      `canvas: (${cx.toFixed(0)}, ${cy.toFixed(0)})`;
  }
}


// ================================================================
//  Toggle between main UI and face-tracking-only mode
// ================================================================
function toggleFaceTracking() {
  showFaceTracking = !showFaceTracking;

  // Elements belonging to the main interface
  const mainEl      = document.querySelector('body > main');
  const taskbarEl   = document.querySelector('nav.fixed');
  const webcamWrap  = document.getElementById('webcam-wrap');
  const noseCursor  = document.getElementById('nose-cursor');
  const wiggleRing  = document.getElementById('wiggle-ring');
  const wiggleTrack = document.getElementById('wiggle-track');
  const noseStatus  = document.getElementById('nose-status');

  if (showFaceTracking) {
    // --- hide main UI ---
    [mainEl, taskbarEl, webcamWrap, noseCursor, wiggleRing, wiggleTrack, noseStatus]
      .forEach(el => { if (el) el.style.display = 'none'; });

    // --- show tracking overlay ---
    if (_trackingOverlay) _trackingOverlay.style.display = 'flex';

    // Ensure clone video is playing
    const clone = document.getElementById('tracking-video-clone');
    const main  = document.getElementById('webcam');
    if (clone && main && main.srcObject) {
      clone.srcObject = main.srcObject;
      clone.play().catch(() => {});
    }
  } else {
    // --- restore main UI ---
    if (mainEl)      mainEl.style.display      = '';
    if (taskbarEl)   taskbarEl.style.display   = '';
    if (webcamWrap)  webcamWrap.style.display  = '';
    if (noseCursor)  noseCursor.style.display  = '';
    if (wiggleRing)  wiggleRing.style.display  = '';
    if (wiggleTrack) wiggleTrack.style.display = '';
    if (noseStatus)  noseStatus.style.display  = '';

    // --- hide tracking overlay and clear canvas ---
    if (_trackingOverlay) _trackingOverlay.style.display = 'none';
    if (_trackingCanvas) {
      _trackingCanvas.getContext('2d').clearRect(
        0, 0, _trackingCanvas.width, _trackingCanvas.height
      );
    }
  }
}


// ================================================================
//  Bootstrap — init overlay and bind F key
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  initFaceTrackingOverlay();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      toggleFaceTracking();
    }
  });
});
