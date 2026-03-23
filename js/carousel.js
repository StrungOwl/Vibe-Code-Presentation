/* Student Showcase Carousel */
(function () {
  function initCarousel(trackId, dotsId) {
    var track = document.getElementById(trackId);
    var dotsContainer = document.getElementById(dotsId);
    if (!track || !dotsContainer) return;

    var slides = track.querySelectorAll('.carousel-slide');
    var total = slides.length;
    var current = 0;

    // Build dots
    for (var i = 0; i < total; i++) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.dataset.index = i;
      dot.addEventListener('click', function () {
        goTo(parseInt(this.dataset.index));
      });
      dotsContainer.appendChild(dot);
    }

    function goTo(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      current = index;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';

      var dots = dotsContainer.querySelectorAll('.carousel-dot');
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle('active', d === current);
      }
    }

    // Prev / Next buttons
    var container = track.closest('.carousel-container');
    var prev = container.querySelector('.carousel-prev');
    var next = container.querySelector('.carousel-next');

    if (prev) prev.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      goTo(current - 1);
    });

    if (next) next.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      goTo(current + 1);
    });

    // Keyboard navigation when slide is active
    document.addEventListener('keydown', function (e) {
      var section = track.closest('section');
      if (!section || !section.classList.contains('present')) return;

      // Only intercept left/right if carousel is focused area
      if (e.key === 'ArrowLeft' && current > 0) {
        e.stopPropagation();
        goTo(current - 1);
      } else if (e.key === 'ArrowRight' && current < total - 1) {
        e.stopPropagation();
        goTo(current + 1);
      }
    }, true);

    // Lazy-load images when the slide becomes visible
    if (typeof Reveal !== 'undefined') {
      Reveal.on('slidechanged', function () {
        var section = track.closest('section');
        if (section && section.classList.contains('present')) {
          var imgs = track.querySelectorAll('img[data-src]');
          imgs.forEach(function (img) {
            if (!img.src || img.src === '') {
              img.src = img.getAttribute('data-src');
            }
          });
        }
      });
    }
  }

  // Init after Reveal is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () { initCarousel('carlyCarousel', 'carlyDots'); }, 500);
    });
  } else {
    setTimeout(function () { initCarousel('carlyCarousel', 'carlyDots'); }, 500);
  }
})();
