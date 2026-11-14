/**
 * Рабочий стол — Центр уведомлений и тосты
 */
(function () {
  'use strict';
  const { $, icons, esc } = NX;

  function toastEl(n) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `
      <div class="t-ic" style="background:${n.color}22;color:${n.color}">${icons[n.icon] || icons.info}</div>
      <div class="t-body">
        <div class="t-title">${esc(n.title)}</div>
        ${n.msg ? `<div class="t-msg">${esc(n.msg)}</div>` : ''}
      </div>
      <button class="t-close">${icons.x}</button>`;
    el.addEventListener('click', e => {
      if (e.target.closest('.t-close')) {
        closeToast(el); return;
      }
      if (n.app && NX.apps[n.app]) { NX.openApp(n.app); closeToast(el); }
    });
    return el;
  }

  function closeToast(el) {
    el.classList.add('closing');
    setTimeout(() => el.remove(), 200);
  }

  NX.initNotifications = function () {
    NX.on('notifications:add', n => {
      const toasts = $('#toasts');
      if (!toasts) return;
      while (toasts.children.length >= 3) toasts.removeChild(toasts.firstChild);
      const el = toastEl(n);
      toasts.appendChild(el);
      setTimeout(() => { if (el.parentNode) closeToast(el); }, 4500);
    });
    NX.on('notifications:change', () => {
      if ($('#notif-panel').classList.contains('open')) NX.renderNotifPanel();
    });
  };

  NX.renderNotifPanel = function () {
    const panel = $('#notif-panel');
    const items = NX.notifications.items;
    panel.innerHTML = `
      <div class="np-head">
        <b>Уведомления</b>
        <button class="btn ghost" data-clear>Очистить всё</button>
      </div>
      <div class="np-body">
        ${items.length ? items.map(n => `
          <div class="np-item" data-id="${n.id}">
            <div class="t-ic" style="background:${n.color}22;color:${n.color}">${icons[n.icon] || icons.info}</div>
            <div class="t-body">
              <div class="t-title">${esc(n.title)}</div>
              ${n.msg ? `<div class="t-msg">${esc(n.msg)}</div>` : ''}
              <div class="t-time">${new Date(n.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>`).join('') : `<div class="np-empty">Уведомлений пока нет</div>`}
      </div>`;
    panel.querySelector('[data-clear]').onclick = () => NX.notifications.clear();
    panel.querySelectorAll('.np-item').forEach(el => el.onclick = () => {
      const n = items.find(x => x.id === el.dataset.id);
      if (n && n.app && NX.apps[n.app]) { NX.openApp(n.app); panel.classList.remove('open'); }
    });
  };

})();
