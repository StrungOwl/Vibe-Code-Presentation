/**
 * AnimationController — manages global animation state and transitions.
 */
import { lerp } from './utils.js';

export class AnimationController {
  constructor() {
    this.globalIntensity = 0;
    this.targetIntensity = 0;
    this.scrollOffset = 0;
    this.targetScrollOffset = 0;
    this.cameraShake = { x: 0, y: 0 };
  }

  /** Trigger a click ripple effect */
  triggerClick() {
    this.targetIntensity = 1;
  }

  /** Apply scroll from brow raise */
  applyScroll(amount) {
    this.targetScrollOffset += amount * 0.02;
  }

  /** Update each frame */
  update(elapsed) {
    // Decay intensity
    this.globalIntensity = lerp(this.globalIntensity, this.targetIntensity, 0.05);
    this.targetIntensity = lerp(this.targetIntensity, 0, 0.03);

    // Smooth scroll
    this.scrollOffset = lerp(this.scrollOffset, this.targetScrollOffset, 0.05);
  }
}
