/**
 * InteractionMapper — translates face tracking data into interaction signals.
 */
import { Smoother, GestureDebounce, clamp, mapRange } from './utils.js';

export class InteractionMapper {
  constructor() {
    this.cursorSmoother = new Smoother(0.12);
    this.scrollSmoother = new Smoother(0.08);
    this.clickDebounce = new GestureDebounce(600);

    // Thresholds
    this.browThreshold = 0.045;
    this.mouthThreshold = 0.03;
    this.browBaseline = 0.035;

    // State
    this.cursor = { x: 0.5, y: 0.5 };
    this.scroll = 0;
    this.isClicking = false;
    this.expressionValue = 0;
    this.mouseMode = false;

    // Callbacks
    this.onCursorMove = null;
    this.onScroll = null;
    this.onClick = null;
    this.onExpression = null;
  }

  /** Process face tracker data each frame */
  updateFromFace(tracker) {
    if (this.mouseMode) return;

    // Nose → cursor
    const nose = tracker.getNose();
    if (nose) {
      // Invert X because webcam is mirrored
      const raw = this.cursorSmoother.update(1 - nose.x, nose.y);
      this.cursor.x = clamp(raw.x, 0, 1);
      this.cursor.y = clamp(raw.y, 0, 1);
      if (this.onCursorMove) this.onCursorMove(this.cursor);
    }

    // Eyebrow raise → scroll
    const browRaise = tracker.getEyebrowRaise();
    if (browRaise > this.browThreshold) {
      const scrollAmt = mapRange(browRaise, this.browThreshold, 0.08, 0, 1);
      this.scroll = clamp(scrollAmt, 0, 1);
      if (this.onScroll) this.onScroll(this.scroll);
    } else {
      this.scroll = 0;
    }

    // Mouth open → click
    const mouthOpen = tracker.getMouthOpen();
    if (mouthOpen > this.mouthThreshold) {
      if (this.clickDebounce.canTrigger()) {
        this.isClicking = true;
        if (this.onClick) this.onClick();
        setTimeout(() => { this.isClicking = false; }, 200);
      }
    }

    // Expression intensity → distortion
    const expression = tracker.getExpressionIntensity();
    this.expressionValue = mapRange(expression, 0.15, 0.4, 0, 1);
    this.expressionValue = clamp(this.expressionValue, 0, 1);
    if (this.onExpression) this.onExpression(this.expressionValue);
  }

  /** Process mouse input as fallback */
  updateFromMouse(normalizedX, normalizedY) {
    if (!this.mouseMode) return;
    this.cursor.x = normalizedX;
    this.cursor.y = normalizedY;
    if (this.onCursorMove) this.onCursorMove(this.cursor);
  }

  handleMouseClick() {
    if (!this.mouseMode) return;
    if (this.clickDebounce.canTrigger()) {
      this.isClicking = true;
      if (this.onClick) this.onClick();
      setTimeout(() => { this.isClicking = false; }, 200);
    }
  }
}
