/* art.js: builds the outlined-shape fields used as art and image placeholders.
   Usage: <div class="art" data-cols="6" data-rows="6" data-hit="3,2" data-seed="11" data-animate></div>
   data-hit is "column,row" (zero-based) of the one filled cell.
   data-animate plays the single load sequence (cells fade in, then the filled one fills). */
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

  function build(host) {
    var cols = parseInt(host.getAttribute('data-cols'), 10) || 6;
    var rows = parseInt(host.getAttribute('data-rows'), 10) || 6;
    var hit = (host.getAttribute('data-hit') || '3,2').split(',');
    var hc = parseInt(hit[0], 10);
    var hr = parseInt(hit[1], 10);
    var rand = rng(parseInt(host.getAttribute('data-seed'), 10) || 7);
    var animate = host.hasAttribute('data-animate');

    var pitch = 64, size = 40, margin = 4;
    var w = (cols - 1) * pitch + size + margin * 2;
    var h = (rows - 1) * pitch + size + margin * 2;
    var svg = node('svg', { viewBox: '0 0 ' + w + ' ' + h, 'aria-hidden': 'true', focusable: 'false' });
    // data-align="end" pins the art to the right edge when its box is wider than the art
    if (host.getAttribute('data-align') === 'end') { svg.setAttribute('preserveAspectRatio', 'xMaxYMid meet'); }

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cx = margin + size / 2 + c * pitch;
        var cy = margin + size / 2 + r * pitch;
        var isHit = (c === hc && r === hr);
        var kind = Math.floor(rand() * 4);
        var half = size / 2;
        var shape;

        if (isHit || kind === 0) {
          shape = node('circle', { cx: cx, cy: cy, r: half });
        } else if (kind === 1) {
          shape = node('rect', { x: cx - half, y: cy - half, width: size, height: size });
        } else if (kind === 2) {
          shape = node('rect', { x: cx - half, y: cy - half, width: size, height: size, rx: size * 0.3 });
        } else {
          var d = size * 0.6;
          shape = node('polygon', {
            points: [cx + ',' + (cy - d), (cx + d) + ',' + cy, cx + ',' + (cy + d), (cx - d) + ',' + cy].join(' ')
          });
        }

        shape.setAttribute('class', isHit ? 'cell hit' : 'cell');
        if (animate) { shape.style.setProperty('--d', ((c + r) * 45) + 'ms'); }
        svg.appendChild(shape);
      }
    }
    host.appendChild(svg);
  }

  var hosts = document.querySelectorAll('.art');
  for (var i = 0; i < hosts.length; i++) { build(hosts[i]); }
})();
