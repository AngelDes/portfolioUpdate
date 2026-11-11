/* Hero orbit: builds the dot disc inside #orbit-dots. The satellites are CSS-animated in site.css. */
(function () {
  var g = document.getElementById('orbit-dots');
  if (!g) return;
  var NS = 'http://www.w3.org/2000/svg', P = 17, R = 140, hit = false;
  for (var y = -R; y <= R; y += P) for (var x = -R; x <= R; x += P) {
    var d = Math.sqrt(x * x + y * y);
    if (d > R - 6) continue;
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 200 + x); c.setAttribute('cy', 200 + y);
    c.setAttribute('r', (1.8 + 3.4 * (1 - d / R)).toFixed(2));
    c.setAttribute('class', 'dot');
    if (!hit && x >= 34 && y >= -34) { hit = true; c.setAttribute('r', 8); c.setAttribute('class', 'dot hit'); }
    g.appendChild(c);
  }
})();
