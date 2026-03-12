// ============================================
// SECTION THEME DETECTION
// ============================================

function getSectionTheme(slide) {
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
  autoPlayMedia: false,
  preloadIframes: 'lazy',
  slideNumber: 'c/t',
  keyboard: true,
  overview: true,
  touch: true,
}).then(() => {
  console.log('Reveal.js initialized');
  initVideoManager();

  // Lazy-load Three.js only when a 3D model slide is reached
  let threeLoaded = false;
  Reveal.on('slidechanged', event => {
    const container = event.currentSlide.querySelector('.model-viewer-container');
    if (container && !threeLoaded) {
      threeLoaded = true;
      loadThreeViewer();
    }
  });
});

// ============================================
// VIDEO MANAGER - Only play videos on current slide
// ============================================

function initVideoManager() {
  // Ensure all videos are paused and unloaded at start
  document.querySelectorAll('video').forEach(video => {
    video.preload = 'none';
    video.pause();
  });

  // Handle current slide on load
  const currentSlide = Reveal.getCurrentSlide();
  if (currentSlide) activateSlideVideos(currentSlide);

  Reveal.on('slidechanged', event => {
    if (event.previousSlide) deactivateSlideVideos(event.previousSlide);
    activateSlideVideos(event.currentSlide);
  });
}

function activateSlideVideos(slide) {
  if (!slide) return;
  slide.querySelectorAll('video').forEach(video => {
    const source = video.querySelector('source[data-src]');
    if (source && !source.src) {
      source.src = source.dataset.src;
      video.load();
    }
    video.preload = 'auto';
    video.play().catch(() => {});
  });
}

function deactivateSlideVideos(slide) {
  if (!slide) return;
  slide.querySelectorAll('video').forEach(video => {
    video.pause();
    video.currentTime = 0;
    video.preload = 'none';
    const source = video.querySelector('source');
    if (source && source.dataset.src) {
      source.removeAttribute('src');
      video.load();
    }
  });
}

// ============================================
// THREE.JS 3D MODEL VIEWER (lazy loaded)
// ============================================

let activeViewer = null;

async function loadThreeViewer() {
  const THREE = await import('three');
  const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');
  const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

  function initModelViewers() {
    Reveal.on('slidechanged', event => {
      if (activeViewer) {
        disposeViewer(activeViewer);
        activeViewer = null;
      }
      const container = event.currentSlide.querySelector('.model-viewer-container');
      if (container && container.dataset.model) {
        activeViewer = createViewer(container, container.dataset.model);
      }
    });

    // Check current slide immediately
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

    // B&W lighting
    viewer.scene.add(new THREE.AmbientLight(0x404040, 0.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(5, 5, 5);
    viewer.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-3, 2, -3);
    viewer.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.25);
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
              color: 0xd0d0d0,
              roughness: 0.45,
              metalness: 0.15,
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

  initModelViewers();
}
