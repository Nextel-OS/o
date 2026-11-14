/**
 * Рабочий стол — Оверлеи (Quick Settings, Spotlight, Task View, Power, Lock, Widgets)
 */
(function () {
  'use strict';
  const { $, $$, icons, esc, pad, MONTHS, DAYS_SHORT } = NX;

  /* ============ Quick Settings ============ */
  NX.renderQuickSettings = function () {
    const p = $('#quick-panel');
    p.innerHTML = `
      <div class="qs-grid">
        <div class="qs-tile${NX.state.wifi ? ' on' : ''}" data-t="wifi">${icons.wifi}<span>Wi-Fi</span></div>
        <div class="qs-tile${NX.state.bluetooth ? ' on' : ''}" data-t="bluetooth">${icons.bluetooth}<span>Bluetooth</span></div>
        <div class="qs-tile${NX.state.dark ? ' on' : ''}" data-t="dark">${icons.moon}<span>Тёмная тема</span></div>
        <div class="qs-tile${NX.state.nightlight ? ' on' : ''}" data-t="nightlight">${icons.sun}<span>Ночной режим</span></div>
        <div class="qs-tile" data-t="lock">${icons.lock}<span>Блокировка</span></div>
        <div class="qs-tile" data-t="power">${icons.power}<span>Выключение</span></div>
      </div>
      <div class="qs-slider">${icons.volume}<input type="range" min="0" max="100" value="${NX.state.volume}" data-s="volume"></div>
      <div class="qs-slider">${icons.sun}<input type="range" min="10" max="100" value="${NX.state.brightness}" data-s="brightness"></div>`;
    $$('[data-t]', p).forEach(el => el.onclick = () => {
      const t = el.dataset.t;
      if (t === 'dark') { NX.state.dark = !NX.state.dark; NX.applyTheme(); NX.persistPrefs(); }
      else if (t === 'wifi') NX.state.wifi = !NX.state.wifi;
      else if (t === 'bluetooth') NX.state.bluetooth = !NX.state.bluetooth;
      else if (t === 'nightlight') NX.state.nightlight = !NX.state.nightlight;
      else if (t === 'lock') { $('#quick-panel').classList.remove('open'); NX.lockScreen && NX.lockScreen(); return; }
      else if (t === 'power') { $('#quick-panel').classList.remove('open'); NX.showPowerMenu && NX.showPowerMenu(); return; }
      el.classList.toggle('on');
    });
    $$('input[type=range]', p).forEach(inp => inp.oninput = () => {
      NX.state[inp.dataset.s] = +inp.value;
      if (inp.dataset.s === 'brightness') {
        $('#desktop').style.filter = `brightness(${0.5 + (+inp.value / 100) * 0.7})`;
      }
    });
  };

  /* ============ Spotlight ============ */
  NX.openSpotlight = function () {
    const sp = $('#spotlight');
    sp.classList.add('open');
    sp.innerHTML = `
      <div class="sp-box">
        <input class="sp-input" placeholder="Поиск приложений, файлов, действий…">
        <div class="sp-results"></div>
      </div>`;
    const input = sp.querySelector('.sp-input');
    const res = sp.querySelector('.sp-results');
    input.focus();
    let idx = 0;

    const search = q => {
      const apps = NX.installedApps().filter(a => a.name.toLowerCase().includes(q));
      const acts = [];
      if ('выключить'.includes(q)) acts.push({ label: 'Завершение работы', icon: 'power', fn: () => NX.showPowerMenu() });
      if ('блокировка'.includes(q)) acts.push({ label: 'Блокировка', icon: 'lock', fn: () => NX.lockScreen() });
      if ('тема'.includes(q)) acts.push({ label: NX.state.dark ? 'Светлая тема' : 'Тёмная тема', icon: 'moon', fn: () => { NX.state.dark = !NX.state.dark; NX.applyTheme(); } });
      if ('настройки'.includes(q)) acts.push({ label: 'Настройки', icon: 'settings', fn: () => NX.openApp('device') });

      const items = [...apps.map(a => ({ label: a.name, icon: a.icon, color: a.color, cat: a.type, fn: () => NX.openApp(a.id) })), ...acts];
      idx = 0;
      res.innerHTML = items.length ? items.map((it, i) => `
        <div class="sp-item${i === 0 ? ' on' : ''}" data-i="${i}">
          <span style="color:${it.color || 'var(--accent)'}">${icons[it.icon] || it.icon}</span>
          <span>${esc(it.label)}</span>
          ${it.cat ? `<span class="cat">${esc(it.cat)}</span>` : ''}
        </div>`).join('') : `<div class="empty" style="height:100px">${icons.search}<div>Ничего не найдено</div></div>`;
      res.querySelectorAll('.sp-item').forEach(el => el.onclick = () => {
        const i = +el.dataset.i;
        sp.classList.remove('open');
        if (items[i]) items[i].fn();
      });
      res._items = items;
      res._idx = idx;
    };

    input.addEventListener('input', () => search(input.value.toLowerCase()));
    input.addEventListener('keydown', e => {
      const items = res._items || [];
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        idx = Math.min(idx + 1, items.length - 1);
        res.querySelectorAll('.sp-item').forEach((el, i) => el.classList.toggle('on', i === idx));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        idx = Math.max(0, idx - 1);
        res.querySelectorAll('.sp-item').forEach((el, i) => el.classList.toggle('on', i === idx));
      }
      if (e.key === 'Enter' && items[idx]) {
        sp.classList.remove('open');
        items[idx].fn();
      }
    });

    search('');
    sp.onclick = e => { if (e.target === sp) sp.classList.remove('open'); };
  };

  /* ============ Task View ============ */
  NX.openTaskView = function () {
    const tv = $('#taskview');
    tv.classList.add('open');
    const byApp = {};
    NX.windows.list.forEach(w => {
      const a = NX.apps[w.appId];
      if (!byApp[w.appId]) byApp[w.appId] = { app: a, wins: [] };
      byApp[w.appId].wins.push(w);
    });
    tv.innerHTML = `
      <div class="tv-spaces">
        ${NX.state.spaces.map(s => `<div class="tv-space${s.id === NX.state.currentSpace ? ' on' : ''}">${s.name}</div>`).join('')}
        <div class="tv-space" style="font-size:20px">${icons.plus}</div>
      </div>
      <div class="tv-grid">
        ${Object.values(byApp).map(g => `
          <div class="tv-card" data-app="${g.app.id}">
            <div class="tv-head"><span style="color:${g.app.color}">${g.app.icon}</span>${esc(g.app.name)}${g.wins.length > 1 ? ' · ' + g.wins.length : ''}</div>
            <div class="tv-prev">${g.app.icon}</div>
          </div>`).join('') || `<div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,.6);padding:40px">Нет открытых окон</div>`}
      </div>`;
    $$('.tv-card', tv).forEach(card => card.onclick = () => {
      tv.classList.remove('open');
      const wins = NX.windows.list.filter(w => w.appId === card.dataset.app);
      if (wins[0]) { if (wins[0].minimized) NX.restoreWin(wins[0]); NX.focusWin(wins[0]); }
    });
    tv.onclick = e => { if (e.target === tv) tv.classList.remove('open'); };
  };

  /* ============ Power Menu ============ */
  NX.showPowerMenu = function () {
    NX.showMenu(innerWidth / 2 - 90, innerHeight - 200, [
      { label: 'Блокировка', icon: icons.lock, fn: () => NX.lockScreen() },
      { label: 'Сон', icon: icons.moon, fn: () => { NX.lockScreen(); } },
      { sep: true },
      { label: 'Перезагрузка', icon: icons.refresh, fn: () => reboot() },
      { label: 'Завершение работы', icon: icons.power, fn: () => shutdown() },
    ]);
  };

  function shutdown() {
    NX.session.save();
    const ps = $('#power-screen');
    ps.classList.add('open');
    ps.innerHTML = `${icons.logo}<b>Завершение работы…</b>`;
    setTimeout(() => location.reload(), 2400);
  }
  function reboot() {
    NX.session.save();
    const ps = $('#power-screen');
    ps.classList.add('open');
    ps.innerHTML = `${icons.refresh}<b>Перезагрузка…</b>`;
    setTimeout(() => location.reload(), 1800);
  }

  /* ============ Lock Screen ============ */
  NX.lockScreen = function () {
    const ls = $('#lockscreen');
    ls.classList.add('open');
    const now = new Date();
    const pin = NX.prefs.get('pin', null);
    ls.innerHTML = `
      <div style="text-align:center">
        <div class="ls-time">${pad(now.getHours())}:${pad(now.getMinutes())}</div>
        <div class="ls-date">${now.getDate()} ${MONTHS[now.getMonth()]}, ${['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'][now.getDay()]}</div>
        <div class="ls-avatar">${icons.user}</div>
        <div class="ls-name">Пользователь Nextel</div>
        ${pin ? `<div class="ls-form"><input type="password" maxlength="4" inputmode="numeric" placeholder="PIN"><div class="ls-hint">Введите PIN</div></div>` : ''}
      </div>
      <div class="ls-power">
        <button class="btn ghost" data-ls="power">${icons.power} Выключение</button>
      </div>`;

    const input = ls.querySelector('input');
    if (input) {
      input.focus();
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          if (input.value === pin) ls.classList.remove('open');
          else { input.value = ''; input.style.borderColor = 'var(--danger)'; }
        }
      });
    } else {
      ls.onclick = () => ls.classList.remove('open');
    }
    ls.querySelector('[data-ls="power"]').onclick = e => {
      e.stopPropagation();
      ls.classList.remove('open');
      NX.showPowerMenu();
    };
  };

  /* ============ Widgets ============ */
  NX.initWidgets = function () {
    const w = $('#widgets');
    if (!w) return;
    w.innerHTML = `
      <div class="widget" data-widget="clock">
        <div class="w-clock" id="wg-clock">--:--</div>
        <div class="w-date" id="wg-date">—</div>
      </div>
      <div class="widget" data-widget="weather">
        <div class="w-city" id="wg-city">Москва</div>
        <div class="w-temp" id="wg-temp">—</div>
        <div class="w-cond" id="wg-cond">—</div>
      </div>`;
    const tick = () => {
      const d = new Date();
      const c = $('#wg-clock'); if (c) c.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
      const dd = $('#wg-date');
      if (dd) dd.textContent = `${d.getDate()} ${MONTHS[d.getMonth()]}, ${['вс','пн','вт','ср','чт','пт','сб'][d.getDay()]}`;
    };
    tick(); setInterval(tick, 5000);

    fetch('https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.62&current=temperature_2m,weather_code')
      .then(r => r.json())
      .then(d => {
        const t = Math.round(d.current.temperature_2m);
        $('#wg-temp').textContent = (t > 0 ? '+' : '') + t + '°';
        $('#wg-cond').textContent = weatherText(d.current.weather_code);
      })
      .catch(() => { $('#wg-temp').textContent = '—'; });
  };

  function weatherText(code) {
    if (code === 0) return 'Ясно';
    if (code < 3) return 'Малооблачно';
    if (code < 50) return 'Облачно';
    if (code < 70) return 'Дождь';
    if (code < 80) return 'Снег';
    return 'Осадки';
  }

  /* ============ Инициализация оверлеев ============ */
  NX.initOverlays = function () {
    NX.initWidgets();

    document.addEventListener('keydown', e => {
      // Win (Meta) — открыть Пуск
      if (e.key === 'Meta') { e.preventDefault(); $('#startbtn').click(); }
      // Ctrl+Space — Spotlight
      if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); NX.openSpotlight(); }
      // Alt+Tab — Task View
      if (e.altKey && e.key === 'Tab') { e.preventDefault(); NX.openTaskView(); }
      // Ctrl+D — рабочий стол
      if (e.ctrlKey && e.key.toLowerCase() === 'd') { e.preventDefault(); NX.windows.list.forEach(w => NX.minimizeWin(w)); }
      // Ctrl+L — лок
      if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); NX.lockScreen(); }
    });

    // Первый запуск — PIN не задаём, показываем welcome
    if (!NX.prefs.get('seen_welcome', false)) {
      NX.prefs.set('seen_welcome', true);
      setTimeout(() => {
        NX.notifications.add({ title: 'Добро пожаловать в Nextel OS', msg: 'Нажмите Ctrl+Space для поиска или Win для меню «Пуск»', icon: 'info' });
      }, 800);
    }
  };

})();
