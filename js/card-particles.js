// Card particle effect — subtle white dust drifting off card edges on hover
// Replaces glow/shadow affordance with something more painterly

(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'card-particles';
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '9990',
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];
  let activeRect = null;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particle: tiny white speck that drifts outward from a card edge
  function spawn(rect) {
    const edge = Math.random();
    let x, y, vx, vy;
    if (edge < 0.25) {
      // top edge
      x = rect.left + Math.random() * rect.width;
      y = rect.top;
      vx = (Math.random() - 0.5) * 0.8;
      vy = -(0.3 + Math.random() * 0.6);
    } else if (edge < 0.5) {
      // bottom edge
      x = rect.left + Math.random() * rect.width;
      y = rect.bottom;
      vx = (Math.random() - 0.5) * 0.8;
      vy = 0.3 + Math.random() * 0.6;
    } else if (edge < 0.75) {
      // left edge
      x = rect.left;
      y = rect.top + Math.random() * rect.height;
      vx = -(0.3 + Math.random() * 0.6);
      vy = (Math.random() - 0.5) * 0.8;
    } else {
      // right edge
      x = rect.right;
      y = rect.top + Math.random() * rect.height;
      vx = 0.3 + Math.random() * 0.6;
      vy = (Math.random() - 0.5) * 0.8;
    }
    particles.push({
      x, y, vx, vy,
      life: 1,
      decay: 0.004 + Math.random() * 0.008,
      size: 1 + Math.random() * 2,
    });
  }

  // Track which card the mouse is over
  const SELECTORS = '.workflow-card, .guide-card, .tip-card, .harness-card, .wf-step, .pipeline-step, .placeholder-card';

  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest(SELECTORS);
    if (card) {
      activeRect = card.getBoundingClientRect();
    }
  });
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest(SELECTORS);
    if (card) activeRect = null;
  });

  let frame = 0;
  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);

    // Spawn particles from active card edge — dense burst
    if (activeRect) {
      for (let s = 0; s < 5; s++) spawn(activeRect);
    }

    // Update & draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life * 0.6;
      ctx.fillStyle = '#fff';
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
  loop();

  // Pause when Reveal changes slide — clear stale rects
  if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', () => {
      activeRect = null;
      particles.length = 0;
    });
  }
})();
