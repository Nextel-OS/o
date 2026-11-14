/**
 * Рабочий стол — Меню «Пуск»
 */
(function () {
  'use strict';
  const { $, $$, icons, esc } = NX;

  NX.renderStartMenu = function (filter = '') {
    const sm = $('#startmenu');
    const all = NX.installedApps().sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    const list = filter
      ? all.filter(a => a.name.toLowerCase().includes(filter.toLowerCase()))
      : all;

    sm.innerHTML = `
      <input class="sm-search" placeholder="Поиск приложений…" value="${esc(filter)}">
      <div class="sm-head">${filter ? 'Результаты' : 'Все приложения'}</div>
      <div class="sm-grid">
        ${list.map(a => `<div class="sm-app" data-app="${a.id}">
          <span style="color:${a.color}">${a.icon}</span><span>${esc(a.name)}</span></div>`).join('') ||
          `<div class="empty" style="grid-column:1/-1;height:100px">${icons.search}<div>Ничего не найдено</div></div>`}
      </div>
      <div class="sm-foot">
        <button class="btn ghost" data-sm="lock">${icons.lock} Блокировка</button>
        <button class="btn ghost" data-sm="power">${icons.power} Выключение</button>
        <button class="btn ghost" data-sm="device">${icons.settings}</button>
      </div>`;

    const input = sm.querySelector('.sm-search');
    input.addEventListener('input', () => {
      const v = input.value;
      clearTimeout(input._t);
      input._t = setTimeout(() => {
        NX.renderStartMenu(v);
        const ni = $('#startmenu .sm-search');
        if (ni) { ni.focus(); ni.setSelectionRange(v.length, v.length); }
      }, 100);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const first = sm.querySelector('.sm-app');
        if (first) { sm.classList.remove('open'); NX.openApp(first.dataset.app); }
      }
    });

    $$('.sm-app', sm).forEach(el => el.onclick = () => {
      sm.classList.remove('open');
      NX.openApp(el.dataset.app);
    });
    $$('[data-sm]', sm).forEach(b => b.onclick = () => {
      sm.classList.remove('open');
      if (b.dataset.sm === 'lock') NX.lockScreen && NX.lockScreen();
      if (b.dataset.sm === 'power') NX.showPowerMenu && NX.showPowerMenu();
      if (b.dataset.sm === 'device') NX.openApp('device');
    });
  };

})();
