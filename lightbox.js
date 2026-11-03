(function () {
  var css = '' +
    '.lb-zoom{cursor:zoom-in}' +
    '.lb-zoom:focus-visible{outline:2px solid #E0521C;outline-offset:3px}' +
    '.lb{position:fixed;inset:0;z-index:1000;display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));background:rgba(14,16,20,.94)}' +
    '.lb.open{display:flex}' +
    '.lb img{max-width:min(100%,1400px);max-height:calc(100vh - 140px);width:auto;height:auto;object-fit:contain;display:block;background:#1A1D23;box-shadow:0 20px 60px rgba(0,0,0,.5)}' +
    '.lb-cap{margin:0;max-width:900px;text-align:center;font-family:"IBM Plex Mono",monospace;font-size:13px;color:#C9CCD1}' +
    '.lb-count{font-family:"IBM Plex Mono",monospace;font-size:12px;color:#9AA0A8}' +
    '.lb button{position:absolute;display:flex;align-items:center;justify-content:center;width:52px;height:52px;border:1px solid #3A3D44;background:#15171C;color:#F3F1EC;cursor:pointer;font:700 22px/1 Archivo,system-ui,sans-serif}' +
    '.lb button:hover{background:#E0521C;border-color:#E0521C;color:#0E1014}' +
    '.lb button:focus-visible{outline:2px solid #E0521C;outline-offset:2px}' +
    '.lb-close{top:max(16px,env(safe-area-inset-top));right:max(16px,env(safe-area-inset-right))}' +
    '.lb-prev{left:max(16px,env(safe-area-inset-left));top:50%;transform:translateY(-50%)}' +
    '.lb-next{right:max(16px,env(safe-area-inset-right));top:50%;transform:translateY(-50%)}' +
    '@media (max-width:640px){.lb-prev,.lb-next{top:auto;bottom:max(16px,env(safe-area-inset-bottom));transform:none}.lb img{max-height:calc(100vh - 200px)}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var imgs = Array.prototype.filter.call(document.querySelectorAll('main img, body > div img'), function (im) {
    return !im.closest('a, header, .lb') && im.getAttribute('alt') !== '';
  });
  if (!imgs.length) return;

  var box = document.createElement('div');
  box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML = '<button type="button" class="lb-close" aria-label="Close">✕</button>' +
    '<button type="button" class="lb-prev" aria-label="Previous image">←</button>' +
    '<img alt=""><p class="lb-cap"></p><span class="lb-count"></span>' +
    '<button type="button" class="lb-next" aria-label="Next image">→</button>';
  document.body.appendChild(box);
  var big = box.querySelector('img'), cap = box.querySelector('.lb-cap'), count = box.querySelector('.lb-count');
  var cur = 0, lastFocus = null;

  function captionFor(im) {
    var fig = im.closest('figure'), fc = fig && fig.querySelector('figcaption');
    return fc ? fc.textContent.trim() : (im.getAttribute('alt') || '');
  }
  function show(i) {
    cur = (i + imgs.length) % imgs.length;
    var im = imgs[cur];
    big.src = im.currentSrc || im.src; big.alt = im.alt || '';
    cap.textContent = captionFor(im);
    count.textContent = (cur + 1) + ' / ' + imgs.length;
  }
  function open(i) {
    lastFocus = document.activeElement; show(i);
    box.classList.add('open'); document.documentElement.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.classList.remove('open'); document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  imgs.forEach(function (im, i) {
    im.classList.add('lb-zoom'); im.tabIndex = 0; im.setAttribute('role', 'button');
    im.setAttribute('aria-label', 'View larger: ' + (im.alt || 'image'));
    im.addEventListener('click', function () { open(i); });
    im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(cur - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(cur + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(cur + 1);
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'Tab') {
      var b = box.querySelectorAll('button'), f = b[0], l = b[b.length - 1];
      if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); }
      else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); }
    }
  });
  var sx = null;
  box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });
})();
