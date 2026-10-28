/* art.js: builds the perforated-grille art used as art and image placeholders.
   Usage: <div class="art" data-cols="6" data-rows="5" data-hit="3,2" data-seed="11"></div>
   data-cols / data-rows set the frame's proportions (and, scaled up, the dot count).
   data-hit is "column,row" of the one marigold dot; it is also the focus the dot sizes spread from.
   data-seed picks the variation: frame shape (circle, rounded square, stadium) and how dot size
   behaves (radial, linear, twin focus, ripples). The same seed always draws the same art.
   data-animate plays the single load sequence: dots appear outward from the focus, then the mark fills.
   data-align="end" pins the art to the right edge when its box is wider than the art. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  function node(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]); }
    return n;
  }

  function rng(seed) {
    var s = seed || 1;
    return function () {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // data-kind="blocks": modular blocks tiled over a grid, studs drawn as dots that shrink away from the marigold block
  function buildBlocks(host, cols, rows, hc, hr, rand, animate) {
    var U = 40, gc = Math.max(6, Math.round(cols * 1.6)), gr = Math.max(5, Math.round(rows * 1.6));
    var grid = [], r, c, blocks = [];
    for (r = 0; r < gr; r++) { grid.push([]); for (c = 0; c < gc; c++) { grid[r].push(false); } }
    var sizes = [[4, 2], [2, 2], [2, 2], [3, 2], [2, 1], [4, 1], [2, 2]];
    function fits(x, y, w, h) {
      if (x + w > gc || y + h > gr) { return false; }
      for (var j = y; j < y + h; j++) { for (var i = x; i < x + w; i++) { if (grid[j][i]) { return false; } } }
      return true;
    }
    for (r = 0; r < gr; r++) {
      for (c = 0; c < gc; c++) {
        if (grid[r][c]) { continue; }
        var opts = sizes.filter(function (sz) { return fits(c, r, sz[0], sz[1]); });
        if (!opts.length) { opts = [[1, 2], [2, 1], [1, 1]].filter(function (sz) { return fits(c, r, sz[0], sz[1]); }); }
        var sz = opts[Math.floor(rand() * opts.length)];
        for (var j = r; j < r + sz[1]; j++) { for (var i = c; i < c + sz[0]; i++) { grid[j][i] = true; } }
        blocks.push({ x: c, y: r, w: sz[0], h: sz[1] });
      }
    }
    // the marigold block is the one nearest the focus given by data-hit
    var fx = (hc + 0.5) / cols * gc, fy = (hr + 0.5) / rows * gr, hitBlock = null, best = Infinity;
    blocks.forEach(function (b) {
      var d = Math.hypot(b.x + b.w / 2 - fx, b.y + b.h / 2 - fy);
      if (b.w * b.h >= 2 && d < best) { best = d; hitBlock = b; }
    });
    var cx0 = hitBlock.x + hitBlock.w / 2, cy0 = hitBlock.y + hitBlock.h / 2, maxD = 0;
    [[0, 0], [gc, 0], [0, gr], [gc, gr]].forEach(function (p) { maxD = Math.max(maxD, Math.hypot(p[0] - cx0, p[1] - cy0)); });

    var w = gc * U, h = gr * U, m = 2, gap = 3;
    var svg = node('svg', { viewBox: (-m) + ' ' + (-m) + ' ' + (w + m * 2) + ' ' + (h + m * 2), 'aria-hidden': 'true', focusable: 'false' });
    if (host.getAttribute('data-align') === 'end') { svg.setAttribute('preserveAspectRatio', 'xMaxYMid meet'); }
    blocks.forEach(function (b) {
      var isHit = b === hitBlock, lift = isHit ? U * 0.22 : 0;
      var g = node('g', { transform: 'translate(' + (lift * 0.6).toFixed(1) + ' ' + (-lift).toFixed(1) + ')' });
      g.appendChild(node('rect', { x: b.x * U + gap / 2, y: b.y * U + gap / 2, width: b.w * U - gap, height: b.h * U - gap, rx: 6, 'class': isHit ? 'bezel hit' : 'bezel' }));
      for (var j = 0; j < b.h; j++) {
        for (var i = 0; i < b.w; i++) {
          var sx = (b.x + i + 0.5) * U, sy = (b.y + j + 0.5) * U;
          var d = Math.hypot(b.x + i + 0.5 - cx0, b.y + j + 0.5 - cy0);
          var t = Math.min(1, d / maxD);
          var rad = isHit ? U * 0.3 : U * (0.08 + (1 - Math.pow(t, 0.85)) * 0.22);
          var dot = node('circle', { cx: sx.toFixed(1), cy: sy.toFixed(1), r: rad.toFixed(2), 'class': 'cell' });
          if (animate) { dot.style.setProperty('--d', Math.round(t * 700) + 'ms'); }
          g.appendChild(dot);
        }
      }
      svg.appendChild(g);
    });
    host.appendChild(svg);
  }

  function build(host) {
    var cols = parseInt(host.getAttribute('data-cols'), 10) || 6;
    var rows = parseInt(host.getAttribute('data-rows'), 10) || 5;
    var hit = (host.getAttribute('data-hit') || '3,2').split(',');
    var hc = parseInt(hit[0], 10) || 0;
    var hr = parseInt(hit[1], 10) || 0;
    var rand = rng(parseInt(host.getAttribute('data-seed'), 10) || 7);
    var animate = host.hasAttribute('data-animate');

    if (host.getAttribute('data-kind') === 'blocks') { buildBlocks(host, cols, rows, hc, hr, rand, animate); return; }

    var pitch = 20;
    var gc = Math.max(8, Math.round(cols * 2.6));
    var gr = Math.max(8, Math.round(rows * 2.6));

    // Frame shape: square-ish frames can be a circle or a rounded square, wide ones a stadium or rounded rectangle
    var aspect = cols / rows;
    var shape;
    if (aspect > 0.8 && aspect < 1.25) { shape = rand() < 0.5 ? 'circle' : 'rounded'; }
    else { shape = rand() < 0.6 ? 'stadium' : 'rounded'; }
    if (shape === 'circle') { gc = gr = Math.round((gc + gr) / 2); }

    var w = gc * pitch, h = gr * pitch;
    var rx = shape === 'circle' ? w / 2 : shape === 'stadium' ? h / 2 : Math.min(w, h) * 0.14;
    var field = Math.floor(rand() * 4);          // 0 radial, 1 linear, 2 twin focus, 3 ripples
    var angle = rand() * Math.PI;

    // The focus is where the marigold dot sits, taken from data-hit across the frame
    var fx = (hc + 0.5) / cols * w;
    var fy = (hr + 0.5) / rows * h;
    var fx2 = w - fx, fy2 = h - fy;
    var corners = [[0, 0], [w, 0], [0, h], [w, h]];
    var maxD = 0;
    corners.forEach(function (c) { maxD = Math.max(maxD, Math.hypot(c[0] - fx, c[1] - fy)); });
    var ext = Math.abs(Math.cos(angle)) * w + Math.abs(Math.sin(angle)) * h;

    var rmin = 1.6, rmax = pitch * 0.42, rhit = pitch * 0.52;

    function f(x, y) {
      var t;
      if (field === 0) {
        t = clamp(Math.hypot(x - fx, y - fy) / maxD, 0, 1);
        return 1 - Math.pow(t, 0.85);
      }
      if (field === 1) {
        var p = ((x - w / 2) * Math.cos(angle) + (y - h / 2) * Math.sin(angle)) / ext + 0.5;
        return clamp(p, 0, 1);
      }
      if (field === 2) {
        var d = Math.min(Math.hypot(x - fx, y - fy), Math.hypot(x - fx2, y - fy2));
        t = clamp(d / (maxD * 0.7), 0, 1);
        return 1 - Math.pow(t, 0.9);
      }
      t = clamp(Math.hypot(x - fx, y - fy) / maxD, 0, 1);
      return clamp((0.5 + 0.5 * Math.cos(t * Math.PI * 2.5)) * (1 - t * 0.35), 0, 1);
    }

    function inside(x, y, r) {
      var dx = Math.max(Math.abs(x - w / 2) - (w / 2 - rx), 0);
      var dy = Math.max(Math.abs(y - h / 2) - (h / 2 - rx), 0);
      return Math.hypot(dx, dy) + r <= rx - 3;
    }

    var m = 2;
    var svg = node('svg', { viewBox: (-m) + ' ' + (-m) + ' ' + (w + m * 2) + ' ' + (h + m * 2), 'aria-hidden': 'true', focusable: 'false' });
    if (host.getAttribute('data-align') === 'end') { svg.setAttribute('preserveAspectRatio', 'xMaxYMid meet'); }

    svg.appendChild(node('rect', { x: 0, y: 0, width: w, height: h, rx: rx, 'class': 'bezel' }));

    var cells = [], best = null;
    for (var r = 0; r < gr; r++) {
      for (var c = 0; c < gc; c++) {
        var x = (c + 0.5) * pitch, y = (r + 0.5) * pitch;
        if (!inside(x, y, rhit)) { continue; }
        var cell = { x: x, y: y, d: Math.hypot(x - fx, y - fy) };
        cells.push(cell);
        if (!best || cell.d < best.d) { best = cell; }
      }
    }

    cells.forEach(function (cell) {
      var isHit = cell === best;
      var rad = isHit ? rhit : rmin + f(cell.x, cell.y) * (rmax - rmin);
      var dot = node('circle', { cx: cell.x.toFixed(1), cy: cell.y.toFixed(1), r: rad.toFixed(2), 'class': isHit ? 'cell hit' : 'cell' });
      if (animate) { dot.style.setProperty('--d', Math.round(cell.d / maxD * 700) + 'ms'); }
      svg.appendChild(dot);
    });

    host.appendChild(svg);
  }

  var hosts = document.querySelectorAll('.art');
  for (var i = 0; i < hosts.length; i++) { build(hosts[i]); }
})();
