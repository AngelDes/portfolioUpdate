/* art.js: builds the perforated-grille art used as art and image placeholders.
   Usage: <div class="art" data-cols="6" data-rows="5" data-hit="3,2" data-seed="11"></div>
   data-cols / data-rows set the frame's proportions (and, scaled up, the dot count).
   data-hit is "column,row" of the one marigold dot; it is also the focus the dot sizes spread from.
   data-seed picks the variation: frame shape (circle, rounded square, stadium) and how dot size
   behaves (radial, linear, twin focus, ripples). The same seed always draws the same art.
   data-animate plays the single load sequence: dots appear outward from the focus, then the mark fills.
   data-kind="blocks" | "book" | "heat" | "find" | "flow" | "bars" | "tiles" swaps the grille for a project-specific piece (cols/rows/hit are ignored for book and heat).
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

  function makeSvg(host, w, h) {
    var svg = node('svg', { viewBox: '0 0 ' + w + ' ' + h, 'aria-hidden': 'true', focusable: 'false' });
    if (host.getAttribute('data-align') === 'end') { svg.setAttribute('preserveAspectRatio', 'xMaxYMid meet'); }
    return svg;
  }

  function addDot(svg, x, y, r, isHit, animate, delay) {
    var dot = node('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(2), 'class': isHit ? 'cell hit' : 'cell' });
    if (animate) { dot.style.setProperty('--d', Math.round(delay) + 'ms'); }
    svg.appendChild(dot);
  }

  // data-kind="book": an open book. Prose on the left page, an indented outline on the right, one node is the hit.
  function buildBook(host, rand, animate) {
    var P = 26, cols = 8, rows = 10, ox = 52, oy = 30, gap = 8, pad = 14;
    var W = cols * P + 28, H = rows * P + 36, xr = ox + W + gap;
    var svg = makeSvg(host, 520, 330);
    [ox - pad, xr - pad].forEach(function (x) {
      svg.appendChild(node('rect', { x: x, y: oy - 18, width: W, height: H, rx: 12, 'class': 'bezel' }));
    });
    var r = 0, c, n, i, last, len;
    while (r < rows) {
      n = 3 + Math.floor(rand() * 3);
      for (i = 0; i < n && r < rows; i++, r++) {
        last = i === n - 1;
        len = last ? 2 + Math.floor(rand() * (cols - 4)) : cols - Math.floor(rand() * 2);
        for (c = 0; c < len; c++) { addDot(svg, ox + c * P + P / 2 - 2, oy + r * P + P / 2, 3.1, false, animate, (r * 40 + c * 25)); }
      }
      if (r < rows) { r++; }
    }
    var hitRow = 2 + Math.floor(rand() * (rows - 4));
    var level = 0;
    for (r = 0; r < rows; r++) {
      var step = rand();
      level = clamp(level + (step < 0.35 ? 1 : step < 0.7 ? -1 : 0), 0, 2);
      if (r === 0) { level = 0; }
      var runLen = 3 + Math.floor(rand() * 4);
      var x = xr + level * P * 1.1 + P / 2 - 2, y = oy + r * P + P / 2;
      var isHit = r === hitRow;
      addDot(svg, x, y, isHit ? 7 : (level === 0 ? 5 : 4), isHit, animate, 700 + r * 40);
      for (c = 1; c < runLen; c++) { addDot(svg, x + c * P * 0.82, y, 1.9, false, animate, 800 + r * 40 + c * 25); }
    }
    host.appendChild(svg);
  }

  // data-kind="heat": a rectangular heatmap. Dot size is intensity from three hotspots, the hottest cell is the hit.
  function buildHeat(host, rand, animate) {
    var cols = 15, rows = 10, P = 31, ox = 40, oy = 36;
    var base = [[4.2, 3.2, 3.0, 1], [10.4, 5.6, 3.6, 0.9], [7, 7.6, 2.2, 0.55]];
    var spots = base.map(function (b) {
      return [clamp(b[0] + (rand() - 0.5) * 2.4, 2, cols - 3), clamp(b[1] + (rand() - 0.5) * 2, 1.5, rows - 2), b[2], b[3]];
    });
    var svg = makeSvg(host, 520, 360), cells = [], best = null, r, c;
    svg.appendChild(node('rect', { x: ox - 24, y: oy - 24, width: (cols - 1) * P + 44, height: (rows - 1) * P + 48, rx: 14, 'class': 'bezel' }));
    for (r = 0; r < rows; r++) {
      for (c = 0; c < cols; c++) {
        var v = 0;
        spots.forEach(function (s) { v += s[3] * Math.exp(-(Math.pow(c - s[0], 2) + Math.pow(r - s[1], 2)) / (2 * s[2] * s[2] * 0.22)); });
        v = Math.min(1, v);
        var cell = { c: c, r: r, v: v };
        cells.push(cell);
        if (!best || v > best.v) { best = cell; }
      }
    }
    cells.forEach(function (k) {
      var isHit = k === best, rad = Math.min(10, 1.6 + 8.4 * Math.pow(k.v, 0.85));
      addDot(svg, ox + k.c * P - 2, oy + k.r * P, isHit ? 11 : rad, isHit, animate, Math.hypot(k.c - best.c, k.r - best.r) * 55);
    });
    host.appendChild(svg);
  }

  function segDist(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, t = clamp(((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(px - x1 - t * dx, py - y1 - t * dy);
  }

  // data-kind="find": a magnifier over scattered dots. Dots grow under the lens; the one it lands on is the hit.
  function buildFind(host, rand, animate) {
    var svg = makeSvg(host, 520, 360), pts = [], i, tries;
    svg.appendChild(node('rect', { x: 18, y: 18, width: 484, height: 326, rx: 14, 'class': 'bezel' }));
    for (tries = 0; tries < 4000 && pts.length < 80; tries++) {
      var q = [30 + rand() * 460, 28 + rand() * 300], ok = true;
      for (i = 0; i < pts.length; i++) { if (Math.hypot(pts[i][0] - q[0], pts[i][1] - q[1]) < 38) { ok = false; break; } }
      if (ok) { pts.push(q); }
    }
    var cx = 230 + rand() * 50, cy = 140 + rand() * 30, R = 105;
    var hx = cx + R * 0.71, hy = cy + R * 0.71, ex = hx + 80, ey = hy + 80, best = null, bd = 1e9;
    pts = pts.filter(function (p) { return Math.abs(Math.hypot(p[0] - cx, p[1] - cy) - R) >= 8 && segDist(p[0], p[1], hx, hy, ex, ey) >= 14; });
    pts.forEach(function (p) { var d = Math.hypot(p[0] - cx, p[1] - cy); if (d < bd) { bd = d; best = p; } });
    pts.forEach(function (p) {
      var d = Math.hypot(p[0] - cx, p[1] - cy);
      addDot(svg, p[0], p[1], p === best ? 10 : (d < R ? 3.2 + 4.2 * (1 - d / R) : 1.7), p === best, animate, d * 4);
    });
    svg.appendChild(node('line', { x1: hx, y1: hy, x2: ex, y2: ey, 'class': 'lens-handle' }));
    svg.appendChild(node('circle', { cx: cx, cy: cy, r: R, 'class': 'lens-ring' }));
    host.appendChild(svg);
  }

  // data-kind="flow": start, one decision, two paths that rejoin. The chosen path has bigger dots and ends on the hit.
  function buildFlow(host, rand, animate) {
    var svg = makeSvg(host, 520, 360), top = rand() < 0.5;
    var up = top ? 80 : 280, down = top ? 280 : 80;
    function edge(pts, chosen, t0) {
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(L / 12);
        for (var k = 1; k < n; k++) { addDot(svg, a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n, chosen ? 3.2 : 1.7, false, animate, t0 + (i * 150) + k * 25); }
      }
    }
    edge([[190, 180], [190, down], [340, down], [450, down], [450, 180]], false, 400);
    edge([[70, 180], [190, 180]], true, 0); edge([[190, 180], [190, up], [340, up]], true, 150); edge([[340, up], [450, up], [450, 180]], true, 450);
    function ring(x, y, kind) {
      if (kind === 'decide') { svg.appendChild(node('rect', { x: x - 17, y: y - 17, width: 34, height: 34, transform: 'rotate(45 ' + x + ' ' + y + ')', 'class': 'ring' })); }
      else { svg.appendChild(node('circle', { cx: x, cy: y, r: 17, 'class': 'ring' })); }
      addDot(svg, x, y, 5, false, animate, 300);
    }
    ring(70, 180); ring(190, 180, 'decide'); ring(340, up); ring(340, down);
    addDot(svg, 450, 180, 17, true, animate, 800);
    host.appendChild(svg);
  }

  // data-kind="bars": columns of stacked dots, rising with a little noise. The tallest column ends on the hit.
  function buildBars(host, rand, animate) {
    var svg = makeSvg(host, 520, 360), h = [], v = 2, i, c, k;
    for (i = 0; i < 8; i++) { v = clamp(v + (rand() < 0.75 ? 1 : -1), 2, 10); h.push(v); }
    var top = h.indexOf(Math.max.apply(null, h));
    svg.appendChild(node('line', { x1: 36, y1: 330, x2: 484, y2: 330, 'class': 'axis' }));
    for (c = 0; c < h.length; c++) {
      for (k = 0; k < h[c]; k++) {
        var last = k === h[c] - 1 && c === top;
        addDot(svg, 70 + c * 54, 306 - k * 27, last ? 11 : 8, last, animate, c * 70 + k * 40);
      }
    }
    host.appendChild(svg);
  }

  // data-kind="tiles": a heat grid of tiles, each holding a dot sized by value. The hottest tile is the hit.
  function buildTiles(host, rand, animate) {
    var svg = makeSvg(host, 520, 360), cols = 9, rows = 6, c, r;
    var p1 = rand() * 3, p2 = rand() * 3, p3 = rand() * 3, best = null, cells = [];
    for (r = 0; r < rows; r++) {
      for (c = 0; c < cols; c++) {
        var v = (Math.sin(c * 0.9 + p1) + Math.cos(r * 1.1 - p2) + Math.sin((c + r) * 0.55 + p3)) / 3 * 0.5 + 0.5;
        var cell = { c: c, r: r, v: v }; cells.push(cell);
        if (!best || v > best.v) { best = cell; }
      }
    }
    cells.forEach(function (k) {
      var x = 26 + k.c * 52, y = 26 + k.r * 52, isHit = k === best;
      svg.appendChild(node('rect', { x: x, y: y, width: 44, height: 44, rx: 8, 'class': isHit ? 'bezel hit' : 'bezel' }));
      addDot(svg, x + 22, y + 22, isHit ? 15 : 2 + 15 * k.v * k.v, false, animate, Math.hypot(k.c - best.c, k.r - best.r) * 90);
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

    var kind = host.getAttribute('data-kind');
    if (kind === 'find') { buildFind(host, rand, animate); return; }
    if (kind === 'flow') { buildFlow(host, rand, animate); return; }
    if (kind === 'bars') { buildBars(host, rand, animate); return; }
    if (kind === 'tiles') { buildTiles(host, rand, animate); return; }
    if (kind === 'book') { buildBook(host, rand, animate); return; }
    if (kind === 'heat') { buildHeat(host, rand, animate); return; }
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
