/**
 * FaceTracker — wraps ml5.js faceMesh for landmark detection.
 */
import ml5 from 'ml5';

export class FaceTracker {
  constructor(videoElement) {
    this.video = videoElement;
    this.faceMesh = null;
    this.landmarks = null;
    this.ready = false;
    this.onReady = null;
    this.onResults = null;
  }

  async init() {
    return new Promise((resolve) => {
      this.faceMesh = ml5.faceMesh(this.video, { maxFaces: 1, flipped: true }, () => {
        this.ready = true;
        this.faceMesh.detectStart(this.video, (results) => {
          if (results && results.length > 0) {
            this.landmarks = results[0];
            if (this.onResults) this.onResults(this.landmarks);
          }
        });
        if (this.onReady) this.onReady();
        resolve();
      });
    });
  }

  /** Get normalized nose tip position (0-1) */
  getNose() {
    if (!this.landmarks || !this.landmarks.keypoints) return null;
    const nose = this.landmarks.keypoints[1]; // nose tip
    if (!nose) return null;
    return {
      x: nose.x / this.video.videoWidth,
      y: nose.y / this.video.videoHeight
    };
  }

  /** Detect eyebrow raise (distance between brow and eye) */
  getEyebrowRaise() {
    if (!this.landmarks || !this.landmarks.keypoints) return 0;
    const kp = this.landmarks.keypoints;
    // Left brow top (70) vs left eye top (159)
    const browY = kp[70]?.y ?? 0;
    const eyeY = kp[159]?.y ?? 0;
    const dist = Math.abs(eyeY - browY);
    const normalized = dist / this.video.videoHeight;
    return normalized;
  }

  /** Detect mouth open (distance between upper and lower lip) */
  getMouthOpen() {
    if (!this.landmarks || !this.landmarks.keypoints) return 0;
    const kp = this.landmarks.keypoints;
    // Upper lip (13) and lower lip (14)
    const upper = kp[13]?.y ?? 0;
    const lower = kp[14]?.y ?? 0;
    const dist = Math.abs(lower - upper);
    return dist / this.video.videoHeight;
  }

  /** Get face width for emotion/expression intensity */
  getExpressionIntensity() {
    if (!this.landmarks || !this.landmarks.keypoints) return 0;
    const kp = this.landmarks.keypoints;
    // Cheek to cheek width
    const left = kp[234]?.x ?? 0;
    const right = kp[454]?.x ?? 0;
    return Math.abs(right - left) / this.video.videoWidth;
  }

  dispose() {
    if (this.faceMesh) {
      this.faceMesh.detectStop();
    }
  }
}
