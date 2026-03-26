// ================================================================
//  face-tracking.js  —  Facial-tracking overlay for Demo 4
//
//  Press F to toggle between the main FloralNet UI and a
//  full-screen view showing the webcam feed with a red dot
//  drawn at the nose-tip keypoint.
//
//  ml5 faceApi v0.x  —  68-point landmarks, nose tip = index 30
// ================================================================

// ---- Public toggle (read by nose-cursor.js to gate canvas updates) ----
let showFaceTracking = false;

// ---- Internal refs ----
let _trackingOverlay = null;
let _trackingCanvas  = null;


// ================================================================
//  Build the tracking overlay (called once on DOMContentLoaded)
// ================================================================
function initFaceTrackingOverlay() {
  _trackingOverlay = document.createElement('div');
  _trackingOverlay.id = 'face-tracking-overlay';
  Object.assign(_trackingOverlay.style, {
    position:       'fixed',
    inset:          '0',
    background:     '#0d0d0d',
    display:        'none',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:         '999999',
    fontFamily:     "'Inter', sans-serif",
  });

  // Title label
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

  // Video + canvas wrapper
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position:  'relative',
    width:     '640px',
    height:    '480px',
    border:    '2px solid #333',
    boxShadow: '0 0 40px rgba(186,27,36,0.25)',
  });

  // Clone of the main webcam stream
  const vid = document.createElement('video');
  vid.id = 'tracking-video-clone';
  vid.autoplay = true;
  vid.playsInline = true;
  vid.muted = true;
  Object.assign(vid.style, {
    width:      '640px',
    height:     '480px',
    display:    'block',
    objectFit:  'cover',
    transform:  'scaleX(-1)',
  });
  wrap.appendChild(vid);

  // Canvas for nose dot overlay
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

  // Status text
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

  // Coordinates readout
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

  // Mirror the main webcam stream — poll until it's available
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
//  Update status text — called from nose-cursor.js
// ================================================================
function setFaceTrackingStatus(msg) {
  const el = document.getElementById('tracking-status');
  if (el) el.textContent = msg;
}


// ================================================================
//  Draw nose dot on the tracking canvas
//  noseX/noseY are raw video-pixel coordinates from ml5
// ================================================================
function updateNoseOnTrackingCanvas(noseX, noseY, videoWidth, videoHeight) {
  if (!_trackingCanvas) return;

  const ctx = _trackingCanvas.getContext('2d');
  const cw  = _trackingCanvas.width;
  const ch  = _trackingCanvas.height;
  const cx  = (noseX / videoWidth)  * cw;
  const cy  = (noseY / videoHeight) * ch;

  ctx.clearRect(0, 0, cw, ch);

  // Glow rings
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(186,27,36,0.18)'; ctx.fill();

  ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(186,27,36,0.35)'; ctx.fill();

  // Solid dot
  ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#ba1b24'; ctx.fill();
  ctx.strokeStyle = 'white'; ctx.lineWidth = 2.5; ctx.stroke();

  // Crosshairs
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 26, cy); ctx.lineTo(cx + 26, cy);
  ctx.moveTo(cx, cy - 26); ctx.lineTo(cx, cy + 26);
  ctx.stroke();

  const coordsEl = document.getElementById('tracking-coords');
  if (coordsEl) {
    coordsEl.textContent =
      `nose  raw: (${noseX.toFixed(1)}, ${noseY.toFixed(1)})  canvas: (${cx.toFixed(0)}, ${cy.toFixed(0)})`;
  }
}


// ================================================================
//  Toggle between main UI and face-tracking overlay
// ================================================================
function toggleFaceTracking() {
  showFaceTracking = !showFaceTracking;

  const mainEl     = document.querySelector('body > main');
  const taskbarEl  = document.querySelector('nav.fixed');
  const webcamWrap = document.getElementById('webcam-wrap');
  const noseCursor = document.getElementById('nose-cursor');
  const wiggleRing = document.getElementById('wiggle-ring');
  const noseStatus = document.getElementById('nose-status');

  if (showFaceTracking) {
    [mainEl, taskbarEl, webcamWrap, noseCursor, wiggleRing, noseStatus]
      .forEach(el => { if (el) el.style.display = 'none'; });

    if (_trackingOverlay) _trackingOverlay.style.display = 'flex';

    const clone = document.getElementById('tracking-video-clone');
    const main  = document.getElementById('webcam');
    if (clone && main?.srcObject) {
      clone.srcObject = main.srcObject;
      clone.play().catch(() => {});
    }
  } else {
    if (mainEl)     mainEl.style.display     = '';
    if (taskbarEl)  taskbarEl.style.display  = '';
    if (webcamWrap) webcamWrap.style.display = '';
    if (noseCursor) noseCursor.style.display = '';
    if (wiggleRing) wiggleRing.style.display = '';
    if (noseStatus) noseStatus.style.display = '';

    if (_trackingOverlay) _trackingOverlay.style.display = 'none';
    if (_trackingCanvas)  _trackingCanvas.getContext('2d')
      .clearRect(0, 0, _trackingCanvas.width, _trackingCanvas.height);
  }
}


// ================================================================
//  Bootstrap — init overlay and bind F key
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  initFaceTrackingOverlay();
  document.addEventListener('keydown', e => {
    if (e.key === 'f' || e.key === 'F') toggleFaceTracking();
  });
});
