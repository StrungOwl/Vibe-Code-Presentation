/**
 * SceneManager — handles p5.js 2D canvas setup and render loop.
 */
import p5 from 'p5';

export class SceneManager {
  constructor(canvas) {
    this.updateCallbacks = [];
    this.elapsed = 0;
    this.lastTime = performance.now();

    // Create p5 instance in instance mode
    this.p = new p5((sketch) => {
      sketch.setup = () => {
        const cnv = sketch.createCanvas(window.innerWidth, window.innerHeight);
        cnv.parent('app');
        cnv.style('position', 'absolute');
        cnv.style('top', '0');
        cnv.style('left', '0');
        cnv.style('z-index', '1');
        sketch.colorMode(sketch.HSB, 360, 100, 100, 100);
        sketch.noStroke();
      };

      sketch.draw = () => {
        const now = performance.now();
        const delta = (now - this.lastTime) / 1000;
        this.lastTime = now;
        this.elapsed += delta;

        // Dark background with slight trail effect
        sketch.background(240, 30, 5, 90);

        // Draw background particles
        this._drawParticles(sketch);

        // Run update callbacks
        for (const cb of this.updateCallbacks) {
          cb(this.elapsed, delta);
        }
      };

      sketch.windowResized = () => {
        sketch.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    });

    // Background particles
    this.particles = [];
    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.0003 + 0.0001,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Remove the original canvas element (we use p5's canvas instead)
    if (canvas) canvas.style.display = 'none';
  }

  _drawParticles(sketch) {
    for (const p of this.particles) {
      p.x += Math.sin(this.elapsed * 0.5 + p.phase) * p.speed;
      p.y += Math.cos(this.elapsed * 0.3 + p.phase * 1.3) * p.speed;

      // Wrap around
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1;
      if (p.y > 1) p.y = 0;

      const px = p.x * sketch.width;
      const py = p.y * sketch.height;
      const alpha = 20 + Math.sin(this.elapsed + p.phase) * 10;

      sketch.fill(260, 40, 80, alpha);
      sketch.ellipse(px, py, p.size, p.size);
    }
  }

  onUpdate(callback) {
    this.updateCallbacks.push(callback);
  }

  /** Convert normalized coords to pixel position */
  normalizedToWorld(nx, ny) {
    return {
      x: nx * window.innerWidth,
      y: ny * window.innerHeight
    };
  }

  /** Get the p5 sketch instance */
  getSketch() {
    return this.p;
  }

  dispose() {
    this.p.remove();
  }
}
