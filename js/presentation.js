import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================
// PARTICLE BACKGROUND MICROINTERACTIONS
// ============================================

const PARTICLE_COUNT = 28;
const particles = [];
let canvas, ctx;

// Section color palettes for particles
const sectionColors = {
  default:  ['#C4A8E0', '#E8A0BE', '#94B8E0', '#88CCE0'],
  purple:   ['#C4A8E0', '#B894D8', '#D8B8F0', '#A890C8'],
  pink:     ['#E8A0BE', '#E8C4A0', '#F0B0C0', '#D8A0B8'],
  blue:     ['#94B8E0', '#88CCE0', '#A0C8F0', '#80B0D0'],
  green:    ['#8EC8A8', '#A0D8B8', '#88CCE0', '#90C0A0'],
  coral:    ['#E8A8A0', '#E8C4A0', '#D8A0A0', '#E0B8A8'],
};

function initParticles() {
  canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Create particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle());
  }

  animateParticles();
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle() {
  const colors = sectionColors.default;
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 30 + 6,
    speedY: -(Math.random() * 0.3 + 0.1),
    speedX: (Math.random() - 0.5) * 0.2,
    wobbleSpeed: Math.random() * 0.008 + 0.003,
    wobbleOffset: Math.random() * Math.PI * 2,
    opacity: Math.random() * 0.18 + 0.06,
    color: colors[Math.floor(Math.random() * colors.length)],
    targetColor: null,
    blur: Math.random() * 8 + 2,
  };
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function animateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const time = Date.now() * 0.001;

  for (const p of particles) {
    // Movement
    p.x += p.speedX + Math.sin(time * p.wobbleSpeed + p.wobbleOffset) * 0.5;
    p.y += p.speedY;

    // Wrap around
    if (p.y < -p.size * 2) {
      p.y = canvas.height + p.size * 2;
      p.x = Math.random() * canvas.width;
    }
    if (p.x < -p.size * 2) p.x = canvas.width + p.size * 2;
    if (p.x > canvas.width + p.size * 2) p.x = -p.size * 2;

    // Draw with blur
    ctx.save();
    ctx.filter = `blur(${p.blur}px)`;

    const rgb = hexToRgb(p.color);
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.opacity})`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  requestAnimationFrame(animateParticles);
}

function updateParticleColors(sectionName) {
  const colors = sectionColors[sectionName] || sectionColors.default;
  for (const p of particles) {
    p.color = colors[Math.floor(Math.random() * colors.length)];
  }
}

// ============================================
// SECTION THEME DETECTION
// ============================================

function getSectionTheme(slide) {
  // Walk up to find the section with a data-theme
  let el = slide;
  while (el) {
    if (el.dataset && el.dataset.theme) return el.dataset.theme;
    el = el.parentElement;
    if (el && el.classList && el.classList.contains('slides')) break;
  }
  return 'default';
}

// ============================================
// REVEAL.JS INITIALIZATION
// ============================================

Reveal.initialize({
  hash: true,
  history: true,
  controls: true,
  controlsLayout: 'edges',
  progress: true,
  center: true,
  transition: 'slide',
  transitionSpeed: 'default',
  backgroundTransition: 'fade',
  width: 1920,
  height: 1080,
  margin: 0.04,
  minScale: 0.2,
  maxScale: 2.0,
  autoPlayMedia: true,
  preloadIframes: 'lazy',
  slideNumber: 'c/t',
  keyboard: true,
  overview: true,
  touch: true,
}).then(() => {
  console.log('Reveal.js initialized');
  initParticles();
  initModelViewers();

  // Update particles on section change
  Reveal.on('slidechanged', event => {
    const theme = getSectionTheme(event.currentSlide);
    updateParticleColors(theme);
  });

  // Set initial particle colors
  const currentSlide = Reveal.getCurrentSlide();
  if (currentSlide) {
    const theme = getSectionTheme(currentSlide);
    updateParticleColors(theme);
  }
});

// ============================================
// THREE.JS 3D MODEL VIEWER
// ============================================

let activeViewer = null;

function initModelViewers() {
  Reveal.on('slidechanged', event => {
    if (activeViewer) {
      disposeViewer(activeViewer);
      activeViewer = null;
    }

    const container = event.currentSlide.querySelector('.model-viewer-container');
    if (container) {
      const modelPath = container.dataset.model;
      if (modelPath) {
        activeViewer = createViewer(container, modelPath);
      }
    }
  });

  // Check initial slide
  const currentSlide = Reveal.getCurrentSlide();
  if (currentSlide) {
    const container = currentSlide.querySelector('.model-viewer-container');
    if (container && container.dataset.model) {
      activeViewer = createViewer(container, container.dataset.model);
    }
  }
}

function createViewer(container, modelPath) {
  const viewer = { container, scene: null, camera: null, renderer: null, controls: null, animationId: null };

  const loading = container.querySelector('.model-loading');
  if (loading) loading.style.display = 'block';

  const width = container.clientWidth;
  const height = container.clientHeight;

  viewer.scene = new THREE.Scene();
  viewer.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  viewer.camera.position.set(0, 0, 5);

  viewer.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  viewer.renderer.setSize(width, height);
  viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  viewer.renderer.setClearColor(0x000000, 0);
  viewer.renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(viewer.renderer.domElement);

  // Gallery-style lighting with pastel tints
  viewer.scene.add(new THREE.AmbientLight(0x606070, 0.6));
  const key = new THREE.DirectionalLight(0xf0e8ff, 1.0);
  key.position.set(5, 5, 5);
  viewer.scene.add(key);
  const fill = new THREE.DirectionalLight(0xB894D8, 0.4);
  fill.position.set(-3, 2, -3);
  viewer.scene.add(fill);
  const rim = new THREE.DirectionalLight(0xE8A0BE, 0.3);
  rim.position.set(0, -3, -5);
  viewer.scene.add(rim);

  viewer.controls = new OrbitControls(viewer.camera, viewer.renderer.domElement);
  viewer.controls.enableDamping = true;
  viewer.controls.dampingFactor = 0.05;
  viewer.controls.autoRotate = true;
  viewer.controls.autoRotateSpeed = 1.5;
  viewer.controls.enablePan = false;

  const loader = new OBJLoader();
  loader.load(
    modelPath,
    (object) => {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      object.position.sub(center);
      object.scale.setScalar(3 / maxDim);

      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xd8c8e8,
            roughness: 0.55,
            metalness: 0.1,
          });
        }
      });

      viewer.scene.add(object);
      if (loading) loading.style.display = 'none';
    },
    (progress) => {
      if (loading && progress.total > 0) {
        const pct = Math.round((progress.loaded / progress.total) * 100);
        const text = loading.querySelector('.loading-text');
        if (text) text.textContent = `Loading model... ${pct}%`;
      }
    },
    (error) => {
      console.error('Error loading model:', error);
      if (loading) {
        const text = loading.querySelector('.loading-text');
        if (text) text.textContent = 'Error loading model';
      }
    }
  );

  function animate() {
    viewer.animationId = requestAnimationFrame(animate);
    viewer.controls.update();
    viewer.renderer.render(viewer.scene, viewer.camera);
  }
  animate();

  viewer.resizeHandler = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    viewer.camera.aspect = w / h;
    viewer.camera.updateProjectionMatrix();
    viewer.renderer.setSize(w, h);
  };
  window.addEventListener('resize', viewer.resizeHandler);

  return viewer;
}

function disposeViewer(viewer) {
  if (viewer.animationId) cancelAnimationFrame(viewer.animationId);
  if (viewer.resizeHandler) window.removeEventListener('resize', viewer.resizeHandler);
  if (viewer.controls) viewer.controls.dispose();
  if (viewer.scene) {
    viewer.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
  if (viewer.renderer) {
    viewer.renderer.dispose();
    if (viewer.renderer.domElement?.parentNode) {
      viewer.renderer.domElement.parentNode.removeChild(viewer.renderer.domElement);
    }
  }
}
