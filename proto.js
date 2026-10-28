/* Prototype player: loads the sandboxed prototype only after the visitor enters the access word and presses Play.
   The word is checked in the browser against a SHA-256 hash, so this deters casual visitors only. */
(function () {
  var root = document.querySelector('.proto');
  if (!root) return;
  var stage = root.querySelector('.proto-stage'), cover = root.querySelector('.proto-cover');
  var form = root.querySelector('.proto-form'), input = root.querySelector('input');
  var msg = root.querySelector('.proto-msg'), bar = root.querySelector('.proto-bar');
  var toggle = root.querySelector('.proto-toggle'), full = root.querySelector('.proto-full');
  var frame = null, veil = null, playing = false;

  function hash(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function setPlaying(on) {
    playing = on;
    if (veil) veil.hidden = on;
    toggle.textContent = on ? 'Pause' : 'Play';
    toggle.setAttribute('aria-pressed', String(on));
  }
  function start() {
    cover.hidden = true; bar.hidden = false;
    frame = document.createElement('iframe');
    frame.title = 'Interactive prototype';
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('referrerpolicy', 'no-referrer');
    frame.src = root.getAttribute('data-src');
    stage.appendChild(frame);
    veil = document.createElement('div');
    veil.className = 'proto-cover'; veil.hidden = true;
    veil.innerHTML = '<p class="proto-note">Paused. Press Play to continue.</p>';
    stage.appendChild(veil);
    setPlaying(true);
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!window.crypto || !crypto.subtle) { msg.textContent = 'This browser cannot check the access word.'; return; }
    hash(input.value.trim()).then(function (h) {
      if (h === root.getAttribute('data-hash')) { msg.textContent = ''; start(); }
      else { msg.textContent = 'That is not the access word.'; input.select(); }
    });
  });
  toggle.addEventListener('click', function () { setPlaying(!playing); });
  full.addEventListener('click', function () {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (stage.requestFullscreen) stage.requestFullscreen();
  });
  document.addEventListener('fullscreenchange', function () {
    full.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
  });
  if (!document.fullscreenEnabled) full.hidden = true;
})();
