/**
 * UIEntities — biomorphic UI blobs drawn with p5.js 2D canvas.
 * Uses noise-based organic shapes that react to interaction.
 */
import { lerp, mapRange, clamp } from './utils.js';

/** Single biomorphic blob entity */
class BlobEntity {
  constructor(config) {
    this.config = config;
    this.hover = 0;
    this.targetHover = 0;
    this.clickAnim = 0;
    this.label = config.label || '';
    this.sublabel = config.sublabel || '';

    // Position in normalized coords (0-1)
    this.baseX = config.nx;
    this.baseY = config.ny;
    this.size = config.size || 60;
    this.phase = config.phase || 0;
    this.resolution = config.resolution || 80; // vertices in the blob outline
    this.color1 = config.color1;
    this.color2 = config.color2;
  }

  update(elapsed, cursorPos, isClicking, expressionValue) {
    // Check proximity to cursor (in pixels)
    if (cursorPos) {
      const cx = this.getCurrentX(elapsed, window.innerWidth);
      const cy = this.getCurrentY(elapsed, window.innerHeight);
      const dist = Math.hypot(cursorPos.x - cx, cursorPos.y - cy);
      const hoverRadius = this.size * 2.5;
      this.targetHover = dist < hoverRadius ? mapRange(dist, 0, hoverRadius, 1, 0) : 0;
      this.targetHover = clamp(this.targetHover, 0, 1);
    }

    this.hover = lerp(this.hover, this.targetHover, 0.08);

    // Click animation decay
    if (isClicking && this.hover > 0.3) {
      this.clickAnim = 1;
    }
    this.clickAnim = lerp(this.clickAnim, 0, 0.05);

    this.expressionValue = expressionValue || 0;
  }

  getCurrentX(elapsed, width) {
    const floatX = Math.sin(elapsed * 0.5 + this.phase) * 20;
    return this.baseX * width + floatX;
  }

  getCurrentY(elapsed, height) {
    const floatY = Math.cos(elapsed * 0.3 + this.phase * 1.5) * 15;
    return this.baseY * height + floatY;
  }

  draw(sketch, elapsed) {
    const w = sketch.width;
    const h = sketch.height;
    const cx = this.getCurrentX(elapsed, w);
    const cy = this.getCurrentY(elapsed, h);

    const baseSize = this.size * (1 + this.hover * 0.2 + this.clickAnim * 0.15);
    const noiseScale = 1.5;
    const expressionBoost = 1 + this.expressionValue * 0.8;

    sketch.push();
    sketch.translate(cx, cy);

    // Draw multiple layered blobs for depth
    for (let layer = 2; layer >= 0; layer--) {
      const layerSize = baseSize * (1 + layer * 0.15);
      const alpha = layer === 0 ? 60 + this.hover * 20 : 15 - layer * 3;
      const hueShift = this.hover * 15 + this.clickAnim * 30;

      // Interpolate between the two colors based on time
      const colorMix = (Math.sin(elapsed * 0.5 + this.phase) * 0.5 + 0.5);
      const hue = lerp(this.color1.h, this.color2.h, colorMix) + hueShift;
      const sat = lerp(this.color1.s, this.color2.s, colorMix);
      const bri = lerp(this.color1.b, this.color2.b, colorMix) + this.hover * 10 + this.clickAnim * 15;

      sketch.fill(hue % 360, sat, Math.min(bri, 100), alpha);

      // Draw organic blob shape using noise
      sketch.beginShape();
      for (let i = 0; i < this.resolution; i++) {
        const angle = (i / this.resolution) * sketch.TWO_PI;
        const noiseVal = sketch.noise(
          Math.cos(angle) * noiseScale + elapsed * 0.3 + this.phase + layer * 10,
          Math.sin(angle) * noiseScale + elapsed * 0.2 + this.phase,
          elapsed * 0.15 + layer * 5
        );

        const displacement = noiseVal * 0.6 * expressionBoost + 0.5;
        const r = layerSize * displacement;

        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        sketch.curveVertex(x, y);
      }
      // Close the shape smoothly (need extra vertices for curveVertex)
      for (let i = 0; i < 3; i++) {
        const angle = (i / this.resolution) * sketch.TWO_PI;
        const noiseVal = sketch.noise(
          Math.cos(angle) * noiseScale + elapsed * 0.3 + this.phase + layer * 10,
          Math.sin(angle) * noiseScale + elapsed * 0.2 + this.phase,
          elapsed * 0.15 + layer * 5
        );
        const displacement = noiseVal * 0.6 * expressionBoost + 0.5;
        const r = layerSize * displacement;
        sketch.curveVertex(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      sketch.endShape(sketch.CLOSE);
    }

    // Glow effect on hover
    if (this.hover > 0.1) {
      const glowSize = baseSize * 1.8;
      const glowAlpha = this.hover * 12;
      const hue = lerp(this.color1.h, this.color2.h, 0.5);
      sketch.fill(hue, 60, 90, glowAlpha);
      sketch.ellipse(0, 0, glowSize * 2, glowSize * 2);
    }

    sketch.pop();
  }

  isHovered() {
    return this.hover > 0.3;
  }
}

/** Manages all UI blob entities */
export class UIEntities {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.blobs = [];
    this.labelElements = [];
    this._createBlobs();
    this._createLabels();
  }

  _createBlobs() {
    const configs = [
      {
        nx: 0.2, ny: 0.3, size: 55, phase: 0, resolution: 70,
        color1: { h: 0, s: 60, b: 90 }, color2: { h: 25, s: 55, b: 90 },
        label: 'Clap to Click', sublabel: 'Mouth Activate'
      },
      {
        nx: 0.22, ny: 0.72, size: 50, phase: 1.5, resolution: 65,
        color1: { h: 195, s: 70, b: 95 }, color2: { h: 190, s: 80, b: 85 },
        label: 'Brow Scroll', sublabel: 'Raise to Scroll'
      },
      {
        nx: 0.5, ny: 0.5, size: 70, phase: 3, resolution: 80,
        color1: { h: 258, s: 70, b: 95 }, color2: { h: 310, s: 65, b: 80 },
        label: 'Nose Cursor', sublabel: 'Follow the Pointer'
      },
      {
        nx: 0.78, ny: 0.28, size: 55, phase: 4.5, resolution: 70,
        color1: { h: 270, s: 55, b: 90 }, color2: { h: 265, s: 55, b: 80 },
        label: 'Emotion Shaper', sublabel: 'Morph with Expression'
      },
      {
        nx: 0.77, ny: 0.7, size: 60, phase: 6, resolution: 75,
        color1: { h: 145, s: 70, b: 85 }, color2: { h: 150, s: 75, b: 75 },
        label: 'Enter', sublabel: ''
      }
    ];

    for (const config of configs) {
      this.blobs.push(new BlobEntity(config));
    }
  }

  _createLabels() {
    const container = document.getElementById('app');
    for (const blob of this.blobs) {
      const el = document.createElement('div');
      el.className = 'blob-label';
      el.innerHTML = `
        <span class="blob-label-text">${blob.label}</span>
        ${blob.sublabel ? `<span class="blob-label-sub">${blob.sublabel}</span>` : ''}
      `;
      container.appendChild(el);
      this.labelElements.push(el);
    }

    const style = document.createElement('style');
    style.textContent = `
      .blob-label {
        position: absolute;
        pointer-events: none;
        z-index: 15;
        text-align: center;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s;
      }
      .blob-label-text {
        display: block;
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;
        font-weight: 600;
        text-shadow: 0 0 10px rgba(120, 80, 255, 0.5), 0 2px 4px rgba(0,0,0,0.5);
        letter-spacing: 0.5px;
      }
      .blob-label-sub {
        display: block;
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        margin-top: 2px;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
      }
    `;
    document.head.appendChild(style);
  }

  update(elapsed, delta, cursorPos, isClicking, expressionValue) {
    const sketch = this.sceneManager.getSketch();

    for (let i = 0; i < this.blobs.length; i++) {
      const blob = this.blobs[i];
      blob.update(elapsed, cursorPos, isClicking, expressionValue);
      blob.draw(sketch, elapsed);

      // Update label positions
      if (this.labelElements[i]) {
        const lx = blob.getCurrentX(elapsed, window.innerWidth);
        const ly = blob.getCurrentY(elapsed, window.innerHeight);
        this.labelElements[i].style.left = lx + 'px';
        this.labelElements[i].style.top = ly + 'px';
        this.labelElements[i].style.opacity = blob.hover > 0.2 ? '1' : '0.7';
        const labelScale = 1 + blob.hover * 0.15;
        this.labelElements[i].style.transform = `translate(-50%, -50%) scale(${labelScale})`;
      }
    }
  }

  getHoveredBlob() {
    return this.blobs.find(b => b.isHovered());
  }

  dispose() {
    for (const el of this.labelElements) {
      el.remove();
    }
  }
}
