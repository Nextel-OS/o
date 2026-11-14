/**
 * Рабочий стол — Оконный менеджер
 */
(function () {
  'use strict';
  const { $, icons, esc, sound } = NX;

  NX.windows = { list: [], focused: null, zTop: 100, seq: 0 };

  function titlebar(cfg) {
    return `
      <div class="titlebar">
        <div class="tb-left">
          <span style="color:${cfg.color}">${cfg.icon}</span>
          <span class="tb-title">${esc(cfg.name)}</span>
        </div>
        <div class="tb-btns">
          <button class="tb-btn" data-act="min" title="Свернуть">${icons.min}</button>
          <button class="tb-btn" data-act="max" title="Развернуть">${icons.max}</button>
          <button class="tb-btn close" data-act="close" title="Закрыть">${icons.close}</button>
        </div>
      </div>
      <div class="win-body"></div>
      <div class="resizer"></div>`;
  }

  NX.openApp = function (id, args, opts = {}) {
    const app = NX.apps[id];
    if (!app) return null;

    if (app.single) {
      const found = NX.windows.list.find(w => w.appId === id);
      if (found) {
        if (found.minimized) NX.restoreWin(found);
        NX.focusWin(found);
        return found;
      }
    }

    const win = document.createElement('div');
    win.className = 'window';
    const W = Math.min(app.w || 620, innerWidth - 60);
    const H = Math.min(app.h || 460, innerHeight - 110);
    win.style.width = W + 'px';
    win.style.height = H + 'px';
    const off = (NX.windows.list.length % 6) * 26;
    win.style.left = Math.max(16, Math.round((innerWidth - W) / 2) - 110 + off) + 'px';
    win.style.top = Math.max(12, Math.round((innerHeight - 52 - H) / 2) - 30 + off) + 'px';
    win.style.zIndex = ++NX.windows.zTop;
    win.innerHTML = titlebar(app);
    document.body.appendChild(win);

    const rec = {
      id: 'w' + (++NX.windows.seq),
      appId: id, el: win, minimized: false, maximized: false,
      prev: null, cleanups: []
    };
    NX.windows.list.push(rec);

    const body = $('.win-body', win);
    const ctx = {
      win: rec, body, args: args || {},
      onClose(fn) { rec.cleanups.push(fn); },
      notify: (title, msg, opts) => NX.notifications.add(Object.assign({ title, msg, app: id }, opts))
    };

    win.addEventListener('mousedown', () => NX.focusWin(rec), true);

    $('.tb-btns', win).addEventListener('click', e => {
      const b = e.target.closest('.tb-btn'); if (!b) return;
      e.stopPropagation();
      if (b.dataset.act === 'min') NX.minimizeWin(rec);
      if (b.dataset.act === 'max') NX.toggleMax(rec);
      if (b.dataset.act === 'close') NX.closeWin(rec);
    });

    makeDraggable(win, $('.titlebar', win), rec);
    makeResizable(win, $('.resizer', win), rec);

    try { app.render(body, ctx); } catch (err) {
      body.innerHTML = `<div class="empty">${icons.info}<div>Не удалось запустить приложение<br><small>${esc(err.message)}</small></div></div>`;
      console.error(err);
      NX.notifications.add({ title: 'Ошибка', msg: err.message, icon: 'info', color: 'var(--danger)' });
    }

    NX.focusWin(rec);
    NX.refreshTaskbar && NX.refreshTaskbar();
    if (!opts.silent) sound.open();
    return rec;
  };

  NX.focusWin = function (rec) {
    if (!rec) return;
    if (NX.windows.focused === rec) return;
    NX.windows.focused = rec;
    rec.el.style.zIndex = ++NX.windows.zTop;
    NX.windows.list.forEach(w => w.el.classList.toggle('focused', w === rec));
    NX.refreshTaskbar && NX.refreshTaskbar();
  };

  NX.minimizeWin = function (rec) {
    rec.minimized = true;
    rec.el.style.display = 'none';
    if (NX.windows.focused === rec) NX.windows.focused = null;
    NX.refreshTaskbar && NX.refreshTaskbar();
    NX.session.save();
  };

  NX.restoreWin = function (rec) {
    rec.minimized = false;
    rec.el.style.display = 'flex';
    NX.refreshTaskbar && NX.refreshTaskbar();
  };

  NX.toggleMax = function (rec) {
    const el = rec.el;
    if (rec.maximized) {
      Object.assign(el.style, rec.prev);
      el.classList.remove('maximized');
      rec.maximized = false;
    } else {
      rec.prev = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
      Object.assign(el.style, { left: '0px', top: '0px', width: '100%', height: 'calc(100% - 52px)' });
      el.classList.add('maximized');
      rec.maximized = true;
    }
    window.dispatchEvent(new Event('nextel:resize'));
  };

  NX.closeWin = function (rec) {
    rec.cleanups.forEach(f => { try { f(); } catch (e) {} });
    rec.el.remove();
    NX.windows.list = NX.windows.list.filter(w => w !== rec);
    if (NX.windows.focused === rec) NX.windows.focused = null;
    NX.refreshTaskbar && NX.refreshTaskbar();
    sound.close();
    NX.session.save();
  };

  function makeDraggable(win, handle, rec) {
    handle.addEventListener('pointerdown', e => {
      if (e.target.closest('.tb-btn') || e.button !== 0) return;
      if (rec.maximized) return;
      const r = win.getBoundingClientRect();
      const dx = e.clientX - r.left, dy = e.clientY - r.top;
      handle.setPointerCapture(e.pointerId);
      const move = ev => {
        win.style.left = Math.max(-r.width + 90, Math.min(innerWidth - 90, ev.clientX - dx)) + 'px';
        win.style.top = Math.max(0, Math.min(innerHeight - 100, ev.clientY - dy)) + 'px';
      };
      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        NX.session.save();
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
  }

  function makeResizable(win, grip, rec) {
    grip.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const r = win.getBoundingClientRect();
      const sx = e.clientX, sy = e.clientY;
      grip.setPointerCapture(e.pointerId);
      const move = ev => {
        win.style.width = Math.max(320, r.width + ev.clientX - sx) + 'px';
        win.style.height = Math.max(200, r.height + ev.clientY - sy) + 'px';
        window.dispatchEvent(new Event('nextel:resize'));
      };
      const up = () => {
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', up);
        NX.session.save();
      };
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', up);
    });
  }

  /* Горячие клавиши окон */
  document.addEventListener('keydown', e => {
    const rec = NX.windows.focused;
    if (!rec) return;
    if (e.ctrlKey && e.key.toLowerCase() === 'w') { e.preventDefault(); NX.closeWin(rec); }
    if (e.ctrlKey && e.key.toLowerCase() === 'm') { e.preventDefault(); NX.minimizeWin(rec); }
    if (e.altKey && e.key === 'F4') { e.preventDefault(); NX.closeWin(rec); }
  });

})();
