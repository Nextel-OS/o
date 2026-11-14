/**
 * Рабочий стол — Desktop
 */
(function () {
  'use strict';
  const { $, $$, icons, esc } = NX;

  let selectedIcons = new Set();

  NX.renderDesktop = function () {
    const iconsEl = $('#icons');
    if (!iconsEl) return;
    iconsEl.className = NX.state.iconSize === 'normal' ? '' : 'size-' + NX.state.iconSize;
    iconsEl.innerHTML = '';
    selectedIcons.clear();

    let list = NX.installedApps();
    if (NX.state.sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    if (NX.state.sortBy === 'type') list.sort((a, b) => (a.type || '').localeCompare(b.type || '') || a.name.localeCompare(b.name, 'ru'));

    list.forEach(app => {
      const d = document.createElement('div');
      d.className = 'dicon';
      d.dataset.app = app.id;
      d.innerHTML = `<span style="color:${app.color}">${app.icon}</span><span class="lb">${esc(app.name)}</span>`;
      d.addEventListener('mousedown', e => {
        e.stopPropagation();
        if (!e.ctrlKey) {
          selectedIcons.forEach(el => el.classList.remove('sel'));
          selectedIcons.clear();
        }
        d.classList.add('sel');
        selectedIcons.add(d);
      });
      d.addEventListener('dblclick', () => NX.openApp(app.id));
      d.addEventListener('contextmenu', e => {
        e.preventDefault(); e.stopPropagation();
        if (!d.classList.contains('sel')) {
          selectedIcons.forEach(el => el.classList.remove('sel'));
          selectedIcons.clear(); d.classList.add('sel'); selectedIcons.add(d);
        }
        NX.showMenu(e.clientX, e.clientY, [
          { label: 'Открыть', icon: icons.play, fn: () => NX.openApp(app.id) },
          { sep: true },
          { label: 'Удалить с рабочего стола', icon: icons.trash, fn: () => { NX.state.installed.delete(app.id); NX.renderDesktop(); NX.persistPrefs(); } },
        ]);
      });
      iconsEl.appendChild(d);
    });
  };

  /* Выделение рамкой */
  function initMarquee() {
    const desktopEl = $('#desktop'), marquee = $('#marquee');
    desktopEl.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      if (e.target.closest('.dicon') || e.target.closest('.widget') || e.target.closest('.window')) return;
      selectedIcons.forEach(el => el.classList.remove('sel'));
      selectedIcons.clear();
      const rect = desktopEl.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      let active = false;
      const move = ev => {
        const cx = ev.clientX - rect.left, cy = ev.clientY - rect.top;
        if (!active && (Math.abs(cx - sx) > 4 || Math.abs(cy - sy) > 4)) { active = true; marquee.style.display = 'block'; }
        if (!active) return;
        const x = Math.min(sx, cx), y = Math.min(sy, cy);
        const w = Math.abs(cx - sx), h = Math.abs(cy - sy);
        Object.assign(marquee.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
        $$('.dicon', $('#icons')).forEach(el => {
          const r = el.getBoundingClientRect();
          const ex = r.left - rect.left, ey = r.top - rect.top;
          const hit = ex < x + w && ex + r.width > x && ey < y + h && ey + r.height > y;
          el.classList.toggle('sel', hit);
          if (hit) selectedIcons.add(el); else selectedIcons.delete(el);
        });
      };
      const up = () => {
        marquee.style.display = 'none';
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }

  /* Контекстное меню рабочего стола */
  function initContext() {
    $('#desktop').addEventListener('contextmenu', e => {
      if (e.target.closest('.dicon') || e.target.closest('.widget')) return;
      e.preventDefault();
      NX.showMenu(e.clientX, e.clientY, [
        { label: 'Создать', icon: icons.plus, sub: [
          { label: 'Папку', icon: icons.folder, fn: () => {
            const name = prompt('Имя папки:', 'Новая папка');
            if (name) { NX.fs.add('Рабочий стол', { name, type: 'folder', children: [] }); }
          }},
          { label: 'Текстовый документ', icon: icons.fileTxt, fn: () => NX.openApp('wart') },
        ]},
        { sep: true },
        { label: 'Вид', icon: icons.grid, sub: [
          { label: 'Крупные значки', fn: () => { NX.state.iconSize = 'large'; NX.renderDesktop(); NX.persistPrefs(); } },
          { label: 'Обычные значки', fn: () => { NX.state.iconSize = 'normal'; NX.renderDesktop(); NX.persistPrefs(); } },
          { label: 'Мелкие значки', fn: () => { NX.state.iconSize = 'small'; NX.renderDesktop(); NX.persistPrefs(); } },
        ]},
        { label: 'Сортировка', icon: icons.sort, sub: [
          { label: 'По имени', fn: () => { NX.state.sortBy = 'name'; NX.renderDesktop(); } },
          { label: 'По типу', fn: () => { NX.state.sortBy = 'type'; NX.renderDesktop(); } },
        ]},
        { sep: true },
        { label: 'Обновить', icon: icons.refresh, fn: () => NX.refreshDesktop() },
        { label: 'Персонализация', icon: icons.settings, fn: () => NX.openApp('device', { section: 'personal' }) },
      ]);
    });
  }

  NX.refreshDesktop = function () {
    const d = $('#desktop');
    d.classList.remove('refresh');
    void d.offsetWidth;
    d.classList.add('refresh');
    NX.renderDesktop();
  };

  NX.startShell = function () {
    NX.renderDesktop();
    initMarquee();
    initContext();
    NX.initTaskbar && NX.initTaskbar();
    NX.initNotifications && NX.initNotifications();
    NX.initOverlays && NX.initOverlays();
    NX.session.restore && setTimeout(() => NX.session.restore(), 400);
    setInterval(() => NX.session.save(), 5000);
    NX.persistPrefs();
  };

})();
