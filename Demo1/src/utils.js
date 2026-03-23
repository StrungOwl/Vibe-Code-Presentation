/**
 * Shared utilities for smoothing, mapping, and input filtering.
 */

/** Linear interpolation */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Map value from one range to another */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** Clamp value between min and max */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Smooth a value over time (exponential smoothing) */
export class Smoother {
  constructor(factor = 0.15) {
    this.factor = factor;
    this.x = 0;
    this.y = 0;
  }

  update(targetX, targetY) {
    this.x = lerp(this.x, targetX, this.factor);
    this.y = lerp(this.y, targetY, this.factor);
    return { x: this.x, y: this.y };
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }
}

/** Debounce a gesture trigger */
export class GestureDebounce {
  constructor(cooldownMs = 500) {
    this.cooldownMs = cooldownMs;
    this.lastTrigger = 0;
  }

  canTrigger() {
    const now = Date.now();
    if (now - this.lastTrigger > this.cooldownMs) {
      this.lastTrigger = now;
      return true;
    }
    return false;
  }
}

/** Simple threshold filter to avoid jitter */
export function thresholdFilter(current, previous, threshold = 0.005) {
  const dx = Math.abs(current.x - previous.x);
  const dy = Math.abs(current.y - previous.y);
  return dx > threshold || dy > threshold;
}
