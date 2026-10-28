/* cursor.js: a small dot with a short trail, a ring over links and a label over cards.
   Only runs with a fine pointer. The native cursor is hidden after the first mouse move,
   and the trail is skipped when the system asks for reduced motion. */
(function () {
  if (!window.matchMedia || !matchMedia('(any-hover: hover) and (any-pointer: fine)').matches) { return; }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  var cur = document.createElement('div');
  cur.className = 'cursor';
  cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<div class="cursor-dot"></div><div class="cursor-label"></div>';
  document.body.appendChild(cur);
  var label = cur.querySelector('.cursor-label');

  var canvas = null, ctx = null, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var pts = [], LIFE = 260;
  if (!reduce) {
    canvas = document.createElement('canvas');
    canvas.className = 'cursor-trail';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    var size = function () {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener('resize', size);
  }

  var LINK = 'a, button, summary, [role="button"]';
  var LABELS = [['a.work-row', 'View']];

  function labelFor(target) {
    for (var i = 0; i < LABELS.length; i++) {
      if (target.closest(LABELS[i][0])) { return LABELS[i][1]; }
    }
    var el = target.closest('[data-cursor]');
    return el ? el.getAttribute('data-cursor') : '';
  }

  window.addEventListener('mousemove', function (e) {
    root.classList.add('has-cursor');
    cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    cur.classList.add('on');
    var t = e.target && e.target.closest ? e.target : null;
    var text = t ? labelFor(t) : '';
    var link = t ? t.closest(LINK) : null;
    cur.classList.toggle('label', !!text);
    cur.classList.toggle('link', !!link && !text);
    cur.classList.toggle('on-dark', !!(t && t.closest('.band-dark')));
    if (text) { label.textContent = text; }
    if (!reduce) { pts.push({ x: e.clientX, y: e.clientY, t: performance.now() }); }
  }, { passive: true });
  document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });

  if (!reduce) {
    var frame = function (now) {
      ctx.clearRect(0, 0, W, H);
      while (pts.length && now - pts[0].t > LIFE) { pts.shift(); }
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], age = 1 - (now - b.t) / LIFE;
        if (age <= 0) { continue; }
        ctx.strokeStyle = 'rgba(36,71,214,' + (age * 0.55).toFixed(3) + ')';
        ctx.lineWidth = 1 + age * 9;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
})();
