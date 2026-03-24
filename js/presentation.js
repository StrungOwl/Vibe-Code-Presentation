// ============================================
// REVEAL.JS INITIALIZATION
// ============================================

// Wait for speaker notes to be injected before initializing
await (window.speakerNotesReady || Promise.resolve());

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
  autoPlayMedia: null,
  preloadIframes: 'lazy',
  slideNumber: 'c/t',
  keyboard: {
    // Space bar (32): only advance fragments, never change slides
    32: () => {
      // If there are remaining fragments on the current slide, advance one
      const fragments = Reveal.availableFragments();
      if (fragments.next) {
        Reveal.nextFragment();
      }
      // Otherwise do nothing — arrow keys handle slide transitions
    }
  },
  overview: true,
  touch: true,
  plugins: [ RevealNotes ],
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
    // Skip videos inside preview overlays — managed by workflow-preview.js
    if (video.closest('.wf-preview-overlay')) return;
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
    // Skip videos inside preview overlays — managed by workflow-preview.js
    if (video.closest('.wf-preview-overlay')) return;
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

// ============================================
// POPOUT TOOLTIPS - Fixed position to escape Reveal overflow
// ============================================

(function initPopoutTooltips() {
  // Move all tooltips to document.body so they aren't clipped
  document.querySelectorAll('.has-popout').forEach(card => {
    const tooltip = card.querySelector('.popout-tooltip');
    if (!tooltip) return;

    // Move tooltip to body
    document.body.appendChild(tooltip);

    let hideTimeout;

    function showTooltip() {
      clearTimeout(hideTimeout);
      // Hide any other visible tooltips
      document.querySelectorAll('.popout-tooltip.visible').forEach(t => {
        if (t !== tooltip) t.classList.remove('visible');
      });

      // Get card position accounting for Reveal.js scale transforms
      const rect = card.getBoundingClientRect();

      tooltip.classList.add('visible');

      // Position below the card
      const tooltipRect = tooltip.getBoundingClientRect();
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      let top = rect.bottom + 10;

      // Keep within viewport
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      // If it goes below viewport, show above instead
      if (top + tooltipRect.height > window.innerHeight - 10) {
        top = rect.top - tooltipRect.height - 10;
        // Flip arrow
        tooltip.classList.add('popout-above');
      } else {
        tooltip.classList.remove('popout-above');
      }
      // Clamp top so it never goes above viewport
      if (top < 10) top = 10;

      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    }

    function hideTooltip() {
      hideTimeout = setTimeout(() => {
        tooltip.classList.remove('visible');
      }, 200);
    }

    card.addEventListener('mouseenter', showTooltip);
    card.addEventListener('mouseleave', hideTooltip);
    card.addEventListener('focus', showTooltip);
    card.addEventListener('blur', hideTooltip);

    // Keep tooltip visible when hovering over it
    tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
    tooltip.addEventListener('mouseleave', hideTooltip);
  });

  // Hide tooltips on slide change
  Reveal.on('slidechanged', () => {
    document.querySelectorAll('.popout-tooltip.visible').forEach(t => {
      t.classList.remove('visible');
    });
  });
})();

// ============================================
// GLOBAL CLICK-TO-ENLARGE IMAGES
// ============================================

(function initImageEnlarge() {
  // Create overlay
  var overlay = document.createElement('div');
  overlay.id = 'img-enlarge-overlay';
  overlay.className = 'img-enlarge-overlay';
  overlay.innerHTML = '<img id="img-enlarge-target" class="img-enlarge-target">';
  document.body.appendChild(overlay);

  var enlargedImg = document.getElementById('img-enlarge-target');

  function openEnlarge(src, alt) {
    enlargedImg.src = src;
    enlargedImg.alt = alt || '';
    overlay.classList.add('visible');
  }
  // Expose globally so other scripts (workflow-preview.js) can call it directly
  window.openImageEnlarge = openEnlarge;

  function closeEnlarge() {
    overlay.classList.remove('visible');
    setTimeout(function () {
      if (!overlay.classList.contains('visible')) {
        enlargedImg.src = '';
      }
    }, 200);
  }

  // Click any image inside slides or preview overlays to enlarge
  document.addEventListener('click', function (e) {
    var img = e.target.closest('img');
    if (!img) return;

    // Skip images inside controls/UI or the enlarge overlay itself
    if (img.closest('.reveal .controls') || img.closest('#project-model-overlay') || img.closest('#img-enlarge-overlay')) return;
    // Must be inside slides or a workflow preview overlay
    if (!img.closest('.reveal .slides') && !img.closest('.wf-preview-overlay')) return;

    e.stopPropagation();
    openEnlarge(img.src || img.dataset.src, img.alt);
  });

  // Close on overlay click
  overlay.addEventListener('click', closeEnlarge);

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      closeEnlarge();
    }
  });

  // Close on slide change
  Reveal.on('slidechanged', closeEnlarge);
})();

// ============================================
// LAYER TOGGLE MENU
// ============================================

(function initLayerToggle() {
  const toggle = document.getElementById('layer-toggle');
  const btn = document.getElementById('layer-toggle-btn');
  const menu = document.getElementById('layer-toggle-menu');
  if (!toggle || !btn || !menu) return;

  // Layer start indices (horizontal slide index)
  const layers = [
    { start: 0, end: 1 },
    { start: 2, end: 2 },
    { start: 3, end: 6 },
    { start: 7, end: 7 },
    { start: 8, end: 9 },
  ];

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle.classList.toggle('open');
  });

  // Jump to layer on click
  menu.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      const slideIdx = parseInt(li.dataset.slide, 10);
      Reveal.slide(slideIdx, 0);
      toggle.classList.remove('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', () => {
    toggle.classList.remove('open');
  });
  toggle.addEventListener('click', (e) => e.stopPropagation());

  // Highlight active layer
  function updateActiveLayer() {
    const h = Reveal.getIndices().h;
    const items = menu.querySelectorAll('li');
    items.forEach((li, i) => {
      li.classList.toggle('active', h >= layers[i].start && h <= layers[i].end);
    });
  }

  Reveal.on('slidechanged', updateActiveLayer);
  Reveal.on('ready', updateActiveLayer);
})();
