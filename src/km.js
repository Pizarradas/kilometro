(function () {
  'use strict';

  /* ---------- Ida según hora de salida ---------- */
  var IDA = {
    salidas: ['6:30', '7:00', '7:30', '8:00', '8:30', '9:30'],
    a4: [65, 75, 70, 65, 60, 55],
    m40: [65, 75, 75, 70, 60, 50],
    r4: [60, 75, 70, 65, 60, 50]
  };
  function fmtMin(m) { return m >= 60 ? Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') : m + ' min'; }
  function plus(hhmm, min) {
    var p = hhmm.split(':'), t = +p[0] * 60 + +p[1] + min;
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  }
  var bars = document.getElementById('bars-ida');
  function renderIda(route) {
    var v = IDA[route], max = Math.max.apply(null, v), min = Math.min.apply(null, v);
    var html = '';
    IDA.salidas.forEach(function (s, i) {
      var cls = v[i] === max ? ' is-peak km-swatch-alert' : v[i] === min ? ' is-best km-swatch-car' : ' km-swatch-car';
      html += '<li class="km-bar' + cls + '" style="--km-v: ' + v[i] + '">' +
        '<span class="km-bar__label"><span class="syx-sr-only">Salida a las </span>' + s + '</span>' +
        '<span class="km-bar__track"><span class="km-bar__fill"></span></span>' +
        '<span class="km-bar__value"><b>' + fmtMin(v[i]) + '</b> <span>→ ' + plus(s, v[i]) + '</span></span></li>';
    });
    if (!bars.children.length) { bars.innerHTML = html; return; }
    // Mantener los nodos para que la barra se anime a su nuevo valor
    var tmp = document.createElement('ul'); tmp.innerHTML = html;
    Array.prototype.forEach.call(tmp.children, function (li, i) {
      var cur = bars.children[i];
      cur.className = li.className;
      cur.style.cssText = li.style.cssText;
      cur.querySelector('.km-bar__value').innerHTML = li.querySelector('.km-bar__value').innerHTML;
    });
  }
  if (bars) {
    renderIda('a4');
    document.querySelectorAll('input[name="ruta-ida"]').forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) renderIda(r.value); });
    });
  }

  /* ---------- ¿Cuál es la tuya? ---------- */
  function val(name) { var el = document.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : null; }
  var q2 = document.getElementById('q2'), q3 = document.getElementById('q3'), q4 = document.getElementById('q4');
  function decide() {
    var r;
    if (val('q1') === 'si') {
      q2.hidden = false; q3.hidden = true; q4.hidden = true;
      r = val('q2') === 'si' ? 'r1' : 'r2';
    } else {
      q2.hidden = true; q3.hidden = false;
      if (val('q3') === 'si') { q4.hidden = true; r = 'r3'; }
      else { q4.hidden = false; r = val('q4') === 'si' ? 'r4' : 'r6'; }
    }
    var ans = document.getElementById('km-answer-text');
    document.querySelectorAll('.km-outcome').forEach(function (li) {
      var on = li.getAttribute('data-r') === r;
      if (on && ans) ans.textContent = li.querySelector('.km-outcome__name').textContent + ' · ' + li.querySelector('.km-outcome__time').textContent;
      li.classList.toggle('is-active', on);
      if (on) li.setAttribute('aria-current', 'true'); else li.removeAttribute('aria-current');
    });
  }
  document.querySelectorAll('#decidir input').forEach(function (i) { i.addEventListener('change', decide); });
  decide();

  /* ---------- Lista de comprobaciones (recordada en este navegador) ---------- */
  var KEY = 'km-pasos-v1', saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
  var boxes = document.querySelectorAll('#steps input[type="checkbox"]');
  var prog = document.getElementById('steps-progress');
  function count() {
    var n = 0; boxes.forEach(function (b) { if (b.checked) n++; });
    prog.textContent = n + ' de ' + boxes.length + ' hechos';
  }
  boxes.forEach(function (b) {
    if (saved[b.id]) b.checked = true;
    b.addEventListener('change', function () {
      saved[b.id] = b.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* sin almacenamiento: solo esta visita */ }
      count();
    });
  });
  count();

  /* ---------- Las maquetas del trayecto se animan solo mientras se ven ---------- */
  var io = 'IntersectionObserver' in window;
  document.querySelectorAll('svg.km-iso[aria-labelledby^="km-mapa"]').forEach(function (svg) {
    if (!io) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { svg.classList.toggle('is-playing', e.isIntersecting); });
    }).observe(svg);
  });

  /* ---------- Barra del día: marca el capítulo que estás leyendo ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.km-daybar__link'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var current = null;
  function setCurrent(id) {
    if (id === current) return;
    current = id;
    links.forEach(function (a) { if (a === byId[id]) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    var a = byId[id];
    if (a) {
      var list = a.closest('.km-daybar__list');
      var left = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2;
      list.scrollTo({ left: Math.max(0, left), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }
  if (io) {
    var visible = {};
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var ids = Object.keys(byId), pick = null;
      for (var i = 0; i < ids.length; i++) if (visible[ids[i]]) { pick = ids[i]; break; }
      setCurrent(pick);
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) obs.observe(el); });
  }
})();
