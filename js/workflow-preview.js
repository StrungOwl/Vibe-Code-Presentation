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

// =============================================================
// AI PROGRAMMING WORKFLOW — click-to-preview handlers
// =============================================================
(function initAIProgrammingPreviews() {
  var overlay = document.getElementById('wf-ai-preview-overlay');
  var content = document.getElementById('wf-ai-preview-content');
  if (!overlay || !content) return;

  var base = 'Workflows/AI%20Assisted%20Programming';

  var previews = {
    pseudocode: {
      render: function () {
        return '<div class="wf-preview-label">Pseudo Code &amp; Sketches</div>' +
          '<img src="' + base + '/sketchUI.jpg" alt="Sketch UI" class="preview-single-img">';
      }
    },
    imagegen: {
      render: function () {
        return '<div class="wf-preview-label">Sketch &amp; Image Gen &mdash; Mockup Your Design</div>' +
          '<img src="' + base + '/figmaMockup.png" alt="Figma Mockup" class="preview-single-img" style="max-height:60vh;">' +
          '<div class="wf-preview-tools" style="align-items:center;margin:16px auto 0;">' +
          '<a href="https://youtu.be/Cq-7lFMNESk?si=o72JkbtFCuxhlo4B" target="_blank" rel="noopener" class="wf-tool-link" style="text-align:center;">' +
          '<span class="tool-link-name">Figma MCP &amp; VS Code Extension</span>' +
          '<span class="tool-link-sub">Connect your Figma designs directly to your AI agent &rarr;</span>' +
          '</a>' +
          '<a href="https://stitch.withgoogle.com/" target="_blank" rel="noopener" class="wf-tool-link" style="text-align:center;">' +
          '<span class="tool-link-name">Stitch by Google</span>' +
          '<span class="tool-link-sub">AI-native design canvas &mdash; turn sketches, prompts, and voice into high-fidelity UI with exportable code &rarr;</span>' +
          '</a>' +
          '</div>';
      }
    },
    claudecode: {
      render: function () {
        return '<div class="wf-preview-label">VS Code &mdash; Claude Code Extension</div>' +
          '<div class="wf-preview-tools" style="align-items:center;margin:16px auto 0;">' +
          '<div class="wf-tool-link" style="text-align:center;cursor:default;">' +
          '<span class="tool-link-name">Create a PRD</span>' +
          '<span class="tool-link-sub">Define your project requirements before building &mdash; your agent will reference it throughout</span>' +
          '</div>' +
          '<div class="wf-tool-link" style="text-align:center;cursor:default;">' +
          '<span class="tool-link-name">Use Any Claude Skills You Need</span>' +
          '<span class="tool-link-sub">Use skill-creator to verify Claude is actually running the skill</span>' +
          '</div>' +
          '<a href="https://github.com/nextlevelbuilder/ui-ux-pro-max-skill" target="_blank" rel="noopener" class="wf-tool-link" style="text-align:center;">' +
          '<span class="tool-link-name">UI/UX Pro Max</span>' +
          '<span class="tool-link-sub">Design intelligence skill &mdash; 50+ UI styles, 97 color palettes, 57 font pairings, and 99 UX guidelines for Claude Code &rarr;</span>' +
          '</a>' +
          '<a href="https://playwright.dev/docs/cli" target="_blank" rel="noopener" class="wf-tool-link" style="text-align:center;">' +
          '<span class="tool-link-name">Playwright CLI</span>' +
          '<span class="tool-link-sub">Allow your agent to test UI in the browser &mdash; see your app run in a real browser &rarr;</span>' +
          '</a>' +
          '</div>';
      }
    }
  };

  var currentPreview = null;

  function showPreview(key) {
    var config = previews[key];
    if (!config) return;
    if (currentPreview === key && overlay.classList.contains('visible')) {
      closePreview();
      return;
    }
    content.innerHTML = config.render();
    overlay.classList.add('visible');
    currentPreview = key;
  }

  function closePreview() {
    overlay.classList.remove('visible');
    currentPreview = null;
    setTimeout(function () {
      if (!overlay.classList.contains('visible')) content.innerHTML = '';
    }, 100);
  }

  document.querySelectorAll('.has-wf-ai-preview').forEach(function (step) {
    var key = step.dataset.aiPreview;
    if (!key) return;
    step.addEventListener('click', function (e) {
      e.stopPropagation();
      showPreview(key);
    });
  });

  // Close when clicking the dark backdrop (anything outside the content panel)
  overlay.addEventListener('click', function (e) {
    if (!e.target.closest('.wf-preview-content') && !e.target.closest('.wf-preview-close')) {
      closePreview();
    }
  });

  var closeBtn = document.getElementById('wf-ai-preview-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePreview();
    });
  }

  // Image click-to-enlarge: use direct delegation on content so Reveal.js can't intercept
  content.addEventListener('click', function (e) {
    var img = e.target.closest('img');
    if (!img) return;
    e.stopPropagation();
    if (window.openImageEnlarge) {
      window.openImageEnlarge(img.src || img.dataset.src, img.alt);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closePreview();
  });

  if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', function () { closePreview(); });
  }
})();

// =============================================================
// AI VIDEO WORKFLOW — click-to-preview handlers
// =============================================================
(function initVideoWorkflowPreviews() {
  var overlay = document.getElementById('wf-video-preview-overlay');
  var content = document.getElementById('wf-video-preview-content');
  if (!overlay || !content) return;

  var base = 'Workflows/AI%20Video';

  var previews = {
    'vid-seed': {
      render: function () {
        return '<div class="wf-preview-label">My Original Work &mdash; Seed</div>' +
          '<img class="preview-single-img" src="' + base + '/Website%20Drawing/seed.png" alt="Website Drawing Seed">';
      }
    },
    'vid-storyboard': {
      render: function () {
        var html = '<div class="wf-preview-label">Storyboard</div>';
        html += '<div class="wf-preview-grid" id="vid-storyboard-grid">';
        for (var i = 1; i <= 7; i++) {
          html += '<img src="' + base + '/Website%20Drawing/Storyboard/' + i + '.png" alt="Storyboard ' + i + '" class="ideation-img">';
        }
        html += '</div>';
        return html;
      }
    },
    'vid-generate': {
      render: function () {
        return '<div class="wf-preview-label">Generate Video &mdash; Higgsfield AI</div>' +
          '<div class="wf-preview-combo">' +
          '<video autoplay loop muted playsinline>' +
          '<source src="' + base + '/Website%20Drawing/oneClip.mp4" type="video/mp4">' +
          '</video>' +
          '<img src="' + base + '/higgsfield_ai.png" alt="Higgsfield AI">' +
          '</div>';
      }
    },
    'vid-comfyui': {
      render: function () {
        return '<div class="wf-preview-label">Image-to-Video Skill</div>' +
          '<p style="text-align:center;color:var(--text-secondary);font-size:0.85em;margin:0 0 16px;">Playwright CLI is embedded into the skill</p>' +
          '<div style="display:flex;flex-direction:column;gap:16px;align-items:center;">' +
          '<video autoplay loop muted playsinline style="width:100%;max-width:800px;border-radius:8px;">' +
          '<source src="' + base + '/ComfyUI/comfyUIVideo.mp4" type="video/mp4">' +
          '</video>' +
          '<img src="' + base + '/ComfyUI/ClaudeandComfy.png" alt="Claude and ComfyUI" style="width:100%;max-width:800px;height:auto;object-fit:contain;border-radius:8px;">' +
          '<img src="' + base + '/ComfyUI/comfyFolders.png" alt="ComfyUI Folders" style="width:100%;max-width:800px;height:auto;object-fit:contain;border-radius:8px;">' +
          '</div>';
      }
    },
    'vid-edit': {
      render: function () {
        return '<div class="wf-preview-label">Edit Video &mdash; Premiere Pro</div>' +
          '<video autoplay loop muted playsinline>' +
          '<source src="' + base + '/Website%20Drawing/stitchedTogether.mp4" type="video/mp4">' +
          '</video>';
      }
    },
    'vid-integrate': {
      render: function () {
        return '<div class="wf-preview-label">Integrate</div>' +
          '<video autoplay loop muted playsinline>' +
          '<source src="' + base + '/Website%20Drawing/integrate.mp4" type="video/mp4">' +
          '</video>';
      }
    }
  };

  var currentPreview = null;

  function showPreview(key) {
    var config = previews[key];
    if (!config) return;
    if (currentPreview === key && overlay.classList.contains('visible')) {
      closePreview();
      return;
    }
    content.innerHTML = config.render();
    overlay.classList.add('visible');
    currentPreview = key;
    content.querySelectorAll('video').forEach(function (v) { v.play().catch(function () {}); });
    if (config.afterRender) config.afterRender();
  }

  function closePreview() {
    overlay.classList.remove('visible');
    content.querySelectorAll('video').forEach(function (v) { v.pause(); });
    currentPreview = null;
    setTimeout(function () {
      if (!overlay.classList.contains('visible')) content.innerHTML = '';
    }, 100);
  }

  document.querySelectorAll('.has-wf-video-preview').forEach(function (el) {
    var key = el.dataset.videoPreview;
    if (!key) return;
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      showPreview(key);
    });
  });

  // Image click-to-enlarge inside video preview overlay
  content.addEventListener('click', function (e) {
    var img = e.target.closest('img');
    if (!img) return;
    e.stopPropagation();
    if (window.openImageEnlarge) {
      window.openImageEnlarge(img.src || img.dataset.src, img.alt);
    }
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePreview();
  });

  var closeBtn = document.getElementById('wf-video-preview-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePreview();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closePreview();
  });

  if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', function () { closePreview(); });
  }
})();

// =============================================================
// PROJECTION MAPPING WORKFLOW — click-to-preview handlers
// =============================================================
(function initPMWorkflowPreviews() {
  var overlay = document.getElementById('wf-pm-preview-overlay');
  var content = document.getElementById('wf-pm-preview-content');
  if (!overlay || !content) return;

  var base = 'Workflows/AI%20Video/StreamDiffusion';

  var previews = {
    streamdiffusion: {
      render: function () {
        return '<div class="wf-preview-label">StreamDiffusion</div>' +
          '<video autoplay loop muted playsinline>' +
          '<source src="' + base + '/edited.mp4" type="video/mp4">' +
          '</video>' +
          '<p style="text-align:center;color:var(--text-secondary);font-size:0.85em;margin:16px auto 0;max-width:700px;line-height:1.5;">' +
          'A real-time diffusion pipeline that runs Stable Diffusion up to 50&times; faster, enabling live image and video style transfer at interactive framerates. Integrated with TouchDesigner via StreamDiffusionTD, it transforms camera feeds and visuals in real time &mdash; ideal for projection mapping and live visual performances.' +
          '</p>';
      }
    },
    projection: {
      render: function () {
        return '<div class="wf-preview-label">Projection Mapping</div>' +
          '<div class="wf-preview-combo">' +
          '<img src="' + base + '/sample.png" alt="Projection Mapping Sample">' +
          '<img src="' + base + '/wood.png" alt="Wood Reference">' +
          '</div>';
      }
    }
  };

  var currentPreview = null;

  function showPreview(key) {
    var config = previews[key];
    if (!config) return;
    if (currentPreview === key && overlay.classList.contains('visible')) {
      closePreview();
      return;
    }
    content.innerHTML = config.render();
    overlay.classList.add('visible');
    currentPreview = key;
    content.querySelectorAll('video').forEach(function (v) { v.play().catch(function () {}); });
  }

  function closePreview() {
    overlay.classList.remove('visible');
    content.querySelectorAll('video').forEach(function (v) { v.pause(); });
    currentPreview = null;
    setTimeout(function () {
      if (!overlay.classList.contains('visible')) content.innerHTML = '';
    }, 100);
  }

  document.querySelectorAll('.has-wf-pm-preview').forEach(function (el) {
    var key = el.dataset.pmPreview;
    if (!key) return;
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      showPreview(key);
    });
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePreview();
  });

  var pmCloseBtn = document.getElementById('wf-pm-preview-close');
  if (pmCloseBtn) {
    pmCloseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closePreview();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closePreview();
  });

  if (typeof Reveal !== 'undefined') {
    Reveal.on('slidechanged', function () { closePreview(); });
  }
})();
