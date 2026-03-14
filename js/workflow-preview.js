/**
 * Workflow Click Media Previews
 *
 * Shows media content when clicking workflow steps in the
 * 3D Printed Sculpture workflow chart.
 */

(function initWorkflowPreviews() {
  const overlay = document.getElementById('wf-preview-overlay');
  const content = document.getElementById('wf-preview-content');
  if (!overlay || !content) return;

  const basePath = 'Workflows/3DPrintedSculpture';

  // Media configuration for each preview type
  const previews = {
    sketch: {
      label: 'Sketch',
      render: function () {
        return '<div class="wf-preview-label">Sketch</div>' +
          '<img class="preview-single-img" src="' + basePath + '/Crying Man/1 Sketch/sketch.jpeg" alt="Sketch">';
      }
    },
    ideation: {
      label: 'GPT Image Generation',
      render: function () {
        var html = '<div class="wf-preview-label">GPT Image Generation — Ideation</div>';
        html += '<div class="wf-preview-grid" id="ideation-grid">';
        var files = [
          'modelIdeation1.png', 'modelIdeation2.png', 'ModelIdeation3.png',
          'modelIdeation4.png', 'modelIdeation5.png', 'modelIdeation6.png',
          'modelIdeation7.png', 'modelIdeation8.png', 'modelIdeation9.png',
          'modelIdeation10.png'
        ];
        files.forEach(function (f) {
          html += '<img src="' + basePath + '/Crying Man/2 ChatGPT Ideation/' + f + '" alt="' + f + '" class="ideation-img">';
        });
        html += '</div>';
        return html;
      },
      afterRender: function () {
        content.querySelectorAll('.ideation-img').forEach(function (img) {
          img.addEventListener('click', function (e) {
            e.stopPropagation();
            if (img.classList.contains('ideation-fullscreen')) {
              img.classList.remove('ideation-fullscreen');
            } else {
              // Remove fullscreen from any other image first
              content.querySelectorAll('.ideation-fullscreen').forEach(function (other) {
                other.classList.remove('ideation-fullscreen');
              });
              img.classList.add('ideation-fullscreen');
            }
          });
        });
      }
    },
    '3dmodel': {
      label: 'AI 3D Model',
      render: function () {
        return '<div class="wf-preview-label">AI 3D Model</div>' +
          '<model-viewer ' +
          'src="' + basePath + '/Crying Man/3 3D model & Print/MushroomMan3.glb" ' +
          'alt="MushroomMan 3D Model" ' +
          'auto-rotate ' +
          'camera-controls ' +
          'touch-action="pan-y" ' +
          'shadow-intensity="1" ' +
          'environment-image="neutral" ' +
          'interaction-prompt="auto">' +
          '</model-viewer>';
      }
    },
    vrsculpt: {
      label: 'VR Sculpt & Blender',
      render: function () {
        return '<div class="wf-preview-label">VR Sculpt & Blender</div>' +
          '<video autoplay loop muted playsinline>' +
          '<source src="' + basePath + '/Deeplglow2/VRSculpting.mp4" type="video/mp4">' +
          '<source src="' + basePath + '/Deeplglow2/VRSculpting.MOV" type="video/quicktime">' +
          'Your browser does not support this video.' +
          '</video>';
      }
    },
    paintideation: {
      label: 'GPT Paint Ideation',
      render: function () {
        var html = '<div class="wf-preview-label">GPT Image Generation — Paint Ideation</div>';
        html += '<div class="wf-preview-grid wf-preview-grid-2x2" id="paint-ideation-grid">';
        var files = [
          'PaintIdeation1.png', 'paintIdeation2.png',
          'paintIdeation3.png', 'paintIdeation4.png'
        ];
        files.forEach(function (f) {
          html += '<img src="' + basePath + '/Crying Man/2 ChatGPT Ideation/' + f + '" alt="' + f + '" class="ideation-img">';
        });
        html += '</div>';
        return html;
      },
      afterRender: function () {
        content.querySelectorAll('.ideation-img').forEach(function (img) {
          img.addEventListener('click', function (e) {
            e.stopPropagation();
            if (img.classList.contains('ideation-fullscreen')) {
              img.classList.remove('ideation-fullscreen');
            } else {
              content.querySelectorAll('.ideation-fullscreen').forEach(function (other) {
                other.classList.remove('ideation-fullscreen');
              });
              img.classList.add('ideation-fullscreen');
            }
          });
        });
      }
    },
    '3dprint': {
      label: '3D Print',
      render: function () {
        return '<div class="wf-preview-label">3D Printing</div>' +
          '<video autoplay loop muted playsinline>' +
          '<source src="' + basePath + '/Sitting Woman/3Dprinting.mp4" type="video/mp4">' +
          'Your browser does not support this video.' +
          '</video>';
      }
    },
    paint: {
      label: 'Paint & Finish',
      render: function () {
        return '<div class="wf-preview-label">Paint & Finish</div>' +
          '<div class="wf-preview-combo">' +
          '<video autoplay loop muted playsinline>' +
          '<source src="' + basePath + '/Crying Man/4 Paint/FinalVideo.mp4" type="video/mp4">' +
          '<source src="' + basePath + '/Crying Man/4 Paint/FinalVideo.MOV" type="video/quicktime">' +
          '</video>' +
          '<img src="' + basePath + '/Crying Man/4 Paint/chatGPTEdit.png" alt="ChatGPT Edit">' +
          '</div>';
      }
    }
  };

  var currentPreview = null;

  function showPreview(key) {
    var config = previews[key];
    if (!config) return;

    // Toggle off if clicking the same step
    if (currentPreview === key && overlay.classList.contains('visible')) {
      closePreview();
      return;
    }

    content.innerHTML = config.render();
    overlay.classList.add('visible');
    currentPreview = key;

    // Auto-play any videos
    var videos = content.querySelectorAll('video');
    videos.forEach(function (v) { v.play().catch(function () {}); });

    // Run post-render hooks (e.g. click-to-expand on ideation grid)
    if (config.afterRender) config.afterRender();
  }

  function closePreview() {
    overlay.classList.remove('visible');
    var videos = content.querySelectorAll('video');
    videos.forEach(function (v) { v.pause(); });
    currentPreview = null;
    setTimeout(function () {
      if (!overlay.classList.contains('visible')) {
        content.innerHTML = '';
      }
    }, 100);
  }

  // Attach click listeners to all workflow steps with previews
  document.querySelectorAll('.has-wf-preview').forEach(function (step) {
    var key = step.dataset.preview;
    if (!key) return;

    step.addEventListener('click', function (e) {
      e.stopPropagation();
      showPreview(key);
    });
  });

  // Click overlay background or close button to close
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      closePreview();
    }
  });

  var closeBtn = document.getElementById('wf-preview-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePreview();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      closePreview();
    }
  });

  // Close on slide change
  if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', function () {
      closePreview();
      closeProjectModel();
    });
  }

  // --- Project showcase 3D model viewer ---
  var projectOverlay = document.getElementById('project-model-overlay');
  var projectContent = document.getElementById('project-model-content');
  var projectCloseBtn = document.getElementById('project-model-close');

  var projectModels = {
    thinkingwoman: {
      label: 'Thinking Woman',
      src: 'Workflows/3DPrintedSculpture/3DModels/thinkingWoman.glb'
    },
    agony: {
      label: 'Agony',
      src: 'Workflows/3DPrintedSculpture/3DModels/Agony.glb'
    }
  };

  function showProjectModel(key) {
    var model = projectModels[key];
    if (!model || !projectOverlay || !projectContent) return;

    projectContent.innerHTML =
      '<div class="wf-preview-label">' + model.label + '</div>' +
      '<model-viewer ' +
      'src="' + model.src + '" ' +
      'alt="' + model.label + ' 3D Model" ' +
      'auto-rotate ' +
      'camera-controls ' +
      'touch-action="pan-y" ' +
      'shadow-intensity="1" ' +
      'environment-image="neutral" ' +
      'interaction-prompt="auto" ' +
      'loading="eager">' +
      '</model-viewer>';
    projectOverlay.classList.add('visible');
  }

  function closeProjectModel() {
    if (!projectOverlay) return;
    projectOverlay.classList.remove('visible');
    setTimeout(function () {
      if (!projectOverlay.classList.contains('visible') && projectContent) {
        projectContent.innerHTML = '';
      }
    }, 100);
  }

  document.querySelectorAll('.project-3d-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      showProjectModel(btn.dataset.model);
    });
  });

  if (projectOverlay) {
    projectOverlay.addEventListener('click', function (e) {
      if (e.target === projectOverlay) closeProjectModel();
    });
  }

  if (projectCloseBtn) {
    projectCloseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeProjectModel();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && projectOverlay && projectOverlay.classList.contains('visible')) {
      closeProjectModel();
    }
  });
})();
