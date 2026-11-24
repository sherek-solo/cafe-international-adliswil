(function () {
  'use strict';
  var L = window.CI_I18N || {today:'Heute','2nd':'2. Donnerstag','4th':'4. Donnerstag',none:'Zurzeit sind keine weiteren Anlässe eingetragen.',subject:'Rückmeldung über die Website',from:'von'};

  // Mobile Navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
  }

  function today() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function parse(iso) {
    var p = iso.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  var WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  function fmt(d) {
    return WT[d.getDay()] + ', ' + String(d.getDate()).padStart(2, '0') + '.' +
      String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // «Nächste Anlässe» auf der Startseite: vergangene weg, heutiger Anlass zuerst
  var list = document.getElementById('events-list');
  if (list && window.CI_TERMINE) {
    var t = today();
    var next = window.CI_TERMINE
      .map(function (e) { return { d: parse(e[0]), ausnahme: e[1] }; })
      .filter(function (e) { return e.d >= t; })
      .sort(function (a, b) { return a.d - b.d; })
      .slice(0, 4);
    if (!next.length) {
      list.innerHTML = '<p>' + esc(L.none) + '</p>';
    } else {
      list.innerHTML = next.map(function (e) {
        var heute = e.d.getTime() === t.getTime();
        return '<article class="event-item' + (heute ? ' today' : '') + (e.ausnahme ? ' ausnahme' : '') + '">' +
          (heute ? '<div class="today-badge">' + esc(L.today) + '</div>' : '') +
          '<div class="event-date" dir="ltr">' + String(e.d.getDate()).padStart(2,'0') + '.' + String(e.d.getMonth()+1).padStart(2,'0') + '.' + e.d.getFullYear() + '</div>' +
          (e.ausnahme ? '<p class="event-note">' + esc(L['2nd']) + '</p>' : '<p class="event-note regular">' + esc(L['4th']) + '</p>') +
          '</article>';
      }).join('');
    }
  }

  // Terminübersicht: vergangene Termine ausblenden, heutigen hervorheben
  var t2 = today();
  document.querySelectorAll('.dates li[data-date]').forEach(function (li) {
    var d = parse(li.getAttribute('data-date'));
    if (d < t2) li.remove();
    else if (d.getTime() === t2.getTime()) { li.classList.add('today'); li.textContent += ' ' + L.today; }
  });
  document.querySelectorAll('.year-group').forEach(function (g) {
    if (!g.querySelector('li')) g.remove();
  });
  document.querySelectorAll('.schedule').forEach(function (sc) {
    if (!sc.querySelector('.dates li')) {
      var m = sc.querySelector('.no-more');
      if (m) m.hidden = false;
    }
  });

  // Rückmeldeformular: öffnet das E-Mail-Programm (kein Server nötig)
  var form = document.getElementById('feedback-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var n = form.elements.name.value.trim();
      var m = form.elements.message.value.trim();
      var subject = L.subject + (n ? ' ' + L.from + ' ' + n : '');
      window.location.href = 'mailto:info@cafeinternational-adliswil.ch' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(m + (n ? '\n\n' + n : ''));
    });
  }
})();
