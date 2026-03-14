/**
 * Speaker Notes Loader
 *
 * Loads notes from speaker-notes.json and injects them into slides at runtime.
 * Edit speaker-notes.json to add/change/remove notes without touching index.html.
 *
 * Notes are keyed by slide number (counting all slides sequentially).
 * You can use HTML in the notes (e.g. <strong>, <br>, <em>).
 */
window.speakerNotesReady = fetch('speaker-notes.json')
  .then(function (res) { return res.json(); })
  .then(function (notes) {
    var allSlides = [];
    var sections = document.querySelectorAll('.reveal .slides > section');

    sections.forEach(function (outer) {
      var inner = outer.querySelectorAll(':scope > section');
      if (inner.length > 0) {
        inner.forEach(function (s) { allSlides.push(s); });
      } else {
        allSlides.push(outer);
      }
    });

    Object.keys(notes).forEach(function (key) {
      var idx = parseInt(key, 10) - 1;
      if (idx >= 0 && idx < allSlides.length) {
        var slide = allSlides[idx];
        var existing = slide.querySelector('aside.notes');
        if (existing) existing.remove();

        var aside = document.createElement('aside');
        aside.className = 'notes';
        aside.innerHTML = notes[key];
        slide.appendChild(aside);
      }
    });
  })
  .catch(function (err) {
    console.warn('Speaker notes failed to load:', err);
  });
