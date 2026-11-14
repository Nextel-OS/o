/**
 * Рабочий стол — Контекстное меню
 */
(function () {
  'use strict';
  const { $, esc, icons } = NX;

  NX.showMenu = function (x, y, items) {
    const m = $('#ctxmenu');
    m.innerHTML = '';
    items.forEach(it => {
      if (it.sep) { m.insertAdjacentHTML('beforeend', '<div class="ctx-sep"></div>'); return; }
      const d = document.createElement('div');
      d.className = 'ctx-item' + (it.sub ? ' has-sub' : '') + (it.disabled ? ' dis' : '');
      d.innerHTML = `${it.icon ? `<span style="opacity:.8">${it.icon}</span>` : '<span style="width:14px"></span>'}
        <span>${esc(it.label)}</span>${it.sub ? `<span class="chev">${icons.chevR}</span>` : ''}`;
      if (it.sub) {
        const sub = document.createElement('div');
        sub.className = 'ctx-sub';
        it.sub.forEach(s => {
          const sd = document.createElement('div');
          sd.className = 'ctx-item';
          sd.innerHTML = `${s.icon ? `<span style="opacity:.8">${s.icon}</span>` : '<span style="width:14px"></span>'}<span>${esc(s.label)}</span>`;
          sd.onclick = ev => { ev.stopPropagation(); NX.hideMenu(); s.fn && s.fn(); };
          sub.appendChild(sd);
        });
        d.appendChild(sub);
      } else {
        d.onclick = () => { NX.hideMenu(); it.fn && it.fn(); };
      }
      m.appendChild(d);
    });
    m.classList.add('open');
    m.style.left = '0px'; m.style.top = '0px';
    const r = m.getBoundingClientRect();
    m.style.left = Math.min(x, innerWidth - r.width - 8) + 'px';
    m.style.top = Math.min(y, innerHeight - r.height - 8) + 'px';
  };

  NX.hideMenu = () => $('#ctxmenu').classList.remove('open');

  document.addEventListener('mousedown', e => {
    if (!e.target.closest('#ctxmenu')) NX.hideMenu();
    if (!e.target.closest('#startmenu') && !e.target.closest('#startbtn')) $('#startmenu').classList.remove('open');
    if (!e.target.closest('#calendar-pop') && !e.target.closest('#clock')) $('#calendar-pop').classList.remove('open');
    if (!e.target.closest('#quick-panel') && !e.target.closest('[data-tray="quick"]')) $('#quick-panel').classList.remove('open');
    if (!e.target.closest('#notif-panel') && !e.target.closest('[data-tray="notif"]')) $('#notif-panel').classList.remove('open');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') NX.hideMenu(); });

})();
