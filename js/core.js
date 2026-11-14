/**
 * Ядро — State / Storage / FS / Events / Sound / Notifications / Prefs / Session
 * Центральные сервисы Nextel OS. Модули регистрируются в window.NX.
 */
window.NX = window.NX || {};

(function () {
  'use strict';

  /* ============ Ядро: иконки ============ */
  const svg = (inner, extra = '') =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
      stroke-linecap="round" stroke-linejoin="round" ${extra}>${inner}</svg>`;

  NX.icons = {
    logo: svg(`<circle cx="12" cy="12" r="8.5" stroke-dasharray="40 13" transform="rotate(-45 12 12)"/><circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none"/>`),
    min: `<svg viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.4"><path d="M2 5h6"/></svg>`,
    max: `<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.2" y="2.2" width="5.6" height="5.6" rx="1"/></svg>`,
    close: `<svg viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.4"><path d="M2.4 2.4l5.2 5.2M7.6 2.4L2.4 7.6"/></svg>`,
    chevR: svg(`<path d="M9 6l6 6-6 6"/>`),
    chevL: svg(`<path d="M15 6l-6 6 6 6"/>`),
    plus: svg(`<path d="M12 5v14M5 12h14"/>`),
    folder: svg(`<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>`),
    fileTxt: svg(`<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>`),
    fileImg: svg(`<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l4.5-4.5L13 17l3-3 4 4"/>`),
    filePpt: svg(`<rect x="3" y="4" width="18" height="12" rx="1.6"/><path d="M12 16v4M8 20h8"/>`),
    market: svg(`<path d="M5.5 8h13l-1.2 12.1a1 1 0 0 1-1 .9H7.7a1 1 0 0 1-1-.9L5.5 8Z"/><path d="M9 8V6.2A3 3 0 0 1 12 3a3 3 0 0 1 3 3.2V8"/>`),
    trash: svg(`<path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.9 12.4a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9L17.5 7"/><path d="M10 11v6M14 11v6"/>`),
    files: svg(`<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2h9A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-10Z"/>`),
    weather: svg(`<circle cx="9" cy="8.5" r="3"/><path d="M9 2.6v1.4M9 13v1.4M2.6 8.5H4M14 8.5h1.4M4.5 4l1 1M13.5 13l1 1M13.5 4l-1 1M4.5 13l1-1"/><path d="M9.5 19h8.2a2.9 2.9 0 1 0-.9-5.6A3.9 3.9 0 0 0 9.2 15"/>`),
    wart: svg(`<rect x="4.5" y="3" width="15" height="18" rx="2"/><path d="M8 8h8M8 11.5h8M8 15h5"/>`),
    browser: svg(`<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"/>`),
    point: svg(`<path d="M14.5 4.5l5 5L10 19l-6 1 1-6 9.5-9.5Z"/><path d="M12.5 6.5l5 5"/>`),
    powerpaint: svg(`<rect x="3" y="4" width="18" height="12" rx="1.6"/><path d="M12 16v4M8.5 20h7"/>`),
    antivirus: svg(`<path d="M12 3l7.5 3v6c0 4.7-3.1 7.9-7.5 9.4C7.6 19.9 4.5 16.7 4.5 12V6L12 3Z"/><path d="M9.2 12l2 2 3.6-3.8"/>`),
    calc: svg(`<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7.5h7"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01M12 18h3.5"/>`),
    device: svg(`<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="var(--surface)"/><circle cx="15" cy="12" r="2" fill="var(--surface)"/><circle cx="8" cy="17" r="2" fill="var(--surface)"/>`),
    terminal: svg(`<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 10l2.2 2.2L7 14.4M12.6 14.6H17"/>`),
    mail: svg(`<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>`),
    notes: svg(`<path d="M5 4.5h14v9l-5.5 5.5H5z"/><path d="M19 13.5h-5.5V19"/>`),
    todo: svg(`<path d="M4 7.2l1.8 1.8L9 5.6M4 17.2l1.8 1.8L9 15.6M12.5 8h8M12.5 18h8"/>`),
    contacts: svg(`<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>`),
    gallery: svg(`<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l4.5-4.5L13 17l3-3 4 4"/>`),
    passwords: svg(`<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none"/>`),
    music: svg(`<circle cx="6.8" cy="17.4" r="2.6"/><circle cx="17.2" cy="14.8" r="2.6"/><path d="M9.4 17.4V7.2l10.4-2v9.6"/>`),
    converter: svg(`<path d="M4 8.5h13l-3.2-3.2M20 15.5H7l3.2 3.2"/>`),
    clock: svg(`<circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2"/>`),
    calendar: svg(`<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>`),
    search: svg(`<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>`),
    bell: svg(`<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>`),
    wifi: svg(`<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8 15.5a5 5 0 0 1 8 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/>`),
    volume: svg(`<path d="M4 9v6h3l4 3V6L7 9H4Z"/><path d="M14.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M17 7a7 7 0 0 1 0 10"/>`),
    sun: svg(`<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>`),
    moon: svg(`<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>`),
    bluetooth: svg(`<path d="M8 5l8 7-8 7V5zM8 19l8-7-8-7"/>`),
    power: svg(`<path d="M12 3v9"/><path d="M6.5 6.5a8 8 0 1 0 11 0"/>`),
    lock: svg(`<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>`),
    user: svg(`<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>`),
    settings: svg(`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>`),
    apps: svg(`<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><circle cx="17" cy="17" r="3.5"/>`),
    refresh: svg(`<path d="M20 11a8 8 0 1 0-.7 4.4"/><path d="M20 5v6h-6"/>`),
    save: svg(`<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-6h8v6"/>`),
    download: svg(`<path d="M12 4v11M7.5 11l4.5 4.5L16.5 11M4 20h16"/>`),
    play: svg(`<path d="M7 4.5l12 7.5-12 7.5z" fill="currentColor" stroke="none"/>`),
    back: svg(`<path d="M15 5l-7 7 7 7"/>`),
    fwd: svg(`<path d="M9 5l7 7-7 7"/>`),
    check: svg(`<path d="M4.5 12.5l5 5 10-11"/>`),
    x: svg(`<path d="M6 6l12 12M18 6L6 18"/>`),
    info: svg(`<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none"/>`),
    home: svg(`<path d="M4 11l8-6.5 8 6.5"/><path d="M6.5 9.6V20h11V9.6"/>`),
    grid: svg(`<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>`),
    sort: svg(`<path d="M4 7h10M4 12h7M4 17h4M17 6v12M17 18l3-3M17 18l-3-3"/>`),
    snake: svg(`<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 16.5h4.2a2.2 2.2 0 0 0 0-4.4H9.6a2.2 2.2 0 0 1 0-4.4H14"/><circle cx="16.4" cy="16.4" r="1" fill="currentColor"/>`),
    g2048: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8.2 8.6h1.6v6M13.4 8.6h2.1a1.9 1.9 0 0 1 0 3.8h-2.1v2.2h2.4"/></svg>`,
    mines: svg(`<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor"/>`),
    ttt: svg(`<path d="M9.5 3.5v17M14.5 3.5v17M3.5 9.5h17M3.5 14.5h17"/><path d="M5 5l3.5 3.5M8.5 5L5 8.5" stroke-width="1.8"/><circle cx="17.5" cy="17.5" r="2"/>`),
    tetris: svg(`<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="9" y="3" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/><rect x="15" y="9" width="6" height="6" rx="1"/>`),
    memory: svg(`<rect x="3" y="6" width="7.5" height="12" rx="2"/><rect x="13.5" y="6" width="7.5" height="12" rx="2"/><path d="M5.8 12h1.9M16.3 12h1.9"/>`),
    pong: svg(`<rect x="3" y="7" width="2.6" height="10" rx="1.2"/><rect x="18.4" y="5" width="2.6" height="10" rx="1.2"/><circle cx="12" cy="13" r="1.7"/>`),
    reaction: svg(`<path d="M13.5 3 6 13.2h5.2L9.8 21l7.7-10.4h-5.2L13.5 3Z"/>`),
    breakout: svg(`<rect x="3" y="4" width="5" height="2.5" rx=".6"/><rect x="9.5" y="4" width="5" height="2.5" rx=".6"/><rect x="16" y="4" width="5" height="2.5" rx=".6"/><rect x="9" y="18" width="6" height="2" rx=".6"/><circle cx="12" cy="12" r="1.6"/>`),
  };

  /* ============ Ядро: события ============ */
  NX.bus = new EventTarget();
  NX.emit = (name, detail) => NX.bus.dispatchEvent(new CustomEvent(name, { detail }));
  NX.on = (name, fn) => NX.bus.addEventListener(name, e => fn(e.detail));

  /* ============ Ядро: утилиты ============ */
  NX.$ = (s, r = document) => r.querySelector(s);
  NX.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  NX.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  NX.pad = n => String(n).padStart(2, '0');
  NX.uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9);

  /* ============ Ядро: state ============ */
  NX.state = {
    installed: new Set(),
    wallpaper: 0,
    iconSize: 'normal',
    sortBy: 'name',
    accent: '#0a84ff',
    dark: false,
    trash: [],
    spaces: [{ id: 1, name: 'Рабочий стол 1', wins: [] }],
    currentSpace: 1,
    sessionWindows: [],
    volume: 60,
    brightness: 82,
    wifi: true,
    bluetooth: false,
    nightlight: false,
    airplane: false,
  };

  /* ============ Ядро: localStorage ============ */
  NX.prefs = {
    get(k, d = null) { try { const v = localStorage.getItem('nx_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('nx_' + k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { localStorage.removeItem('nx_' + k); } catch (e) { } }
  };

  /* ============ Ядро: виртуальная ФС ============ */
  NX.fs = {
    root: { name: 'Этот компьютер', children: [
      { name: 'Документы', children: [] },
      { name: 'Изображения', children: [] },
      { name: 'Загрузки', children: [] },
      { name: 'Рабочий стол', children: [] },
    ]},
    get(path) {
      let node = this.root;
      for (const p of path) {
        const n = node.children && node.children.find(c => c.name === p);
        if (!n) return null;
        node = n;
      }
      return node;
    },
    folder(name) { return this.root.children.find(c => c.name === name); },
    add(folderName, file) {
      const f = this.folder(folderName) || this.folder('Документы');
      file.date = new Date();
      file.srcPath = folderName || 'Документы';
      f.children.push(file);
      return file;
    },
    remove(folderName, name) {
      const f = this.folder(folderName);
      if (!f) return null;
      const i = f.children.findIndex(c => c.name === name);
      if (i < 0) return null;
      return f.children.splice(i, 1)[0];
    },
    count() {
      let n = 0;
      const walk = node => (node.children || []).forEach(c => { n++; if (c.children) walk(c); });
      walk(this.root);
      return n;
    }
  };

  /* ============ Ядро: звук (Web Audio) ============ */
  NX.sound = {
    ctx: null,
    enabled: NX.prefs.get('sound_enabled', true),
    ensure() {
      if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone(freq = 440, dur = 0.08, type = 'sine', vol = 0.04) {
      if (!this.enabled) return;
      const c = this.ensure(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.value = freq; o.type = type;
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g).connect(c.destination);
      o.start(); o.stop(c.currentTime + dur + 0.02);
    },
    click() { this.tone(880, 0.03, 'sine', 0.02); },
    open() { this.tone(660, 0.06, 'sine', 0.03); this.tone(990, 0.05, 'sine', 0.02); },
    close() { this.tone(520, 0.07, 'sine', 0.03); },
    notify() { this.tone(880, 0.08, 'sine', 0.03); setTimeout(() => this.tone(1320, 0.1, 'sine', 0.02), 90); },
    error() { this.tone(220, 0.12, 'sawtooth', 0.03); },
    boot() {
      if (!this.enabled) return;
      [392, 523.25, 659.25, 783.99].forEach((f, i) =>
        setTimeout(() => this.tone(f, 0.5, 'sine', 0.03), i * 90));
    }
  };

  /* ============ Ядро: уведомления ============ */
  NX.notifications = {
    items: [],
    add(opts) {
      const n = {
        id: NX.uid('n'),
        title: opts.title || 'Nextel',
        msg: opts.msg || '',
        icon: opts.icon || 'info',
        color: opts.color || 'var(--accent)',
        ts: Date.now(),
        app: opts.app || null,
        actions: opts.actions || [],
        read: false
      };
      this.items.unshift(n);
      if (this.items.length > 100) this.items.pop();
      NX.emit('notifications:add', n);
      NX.emit('notifications:change', this.items);
      NX.sound.notify();
      return n;
    },
    remove(id) {
      this.items = this.items.filter(i => i.id !== id);
      NX.emit('notifications:change', this.items);
    },
    clear() { this.items = []; NX.emit('notifications:change', []); },
    unread() { return this.items.filter(i => !i.read).length; }
  };

  /* ============ Ядро: реестр приложений ============ */
  NX.apps = {};
  NX.registerApp = function (cfg) {
    if (!cfg.id) return;
    NX.apps[cfg.id] = Object.assign({
      w: 620, h: 460, single: false, type: 'Приложение', category: 'app',
      order: Object.keys(NX.apps).length
    }, cfg);
    NX.emit('apps:change', NX.apps);
  };
  NX.installedApps = function () {
    return Array.from(NX.state.installed).map(id => NX.apps[id]).filter(Boolean);
  };

  /* ============ Ядро: сессия ============ */
  NX.session = {
    save() {
      const wins = (NX.windows && NX.windows.list || []).map(w => ({
        appId: w.appId,
        left: w.el.style.left, top: w.el.style.top,
        width: w.el.style.width, height: w.el.style.height,
        minimized: w.minimized, maximized: w.maximized
      }));
      NX.prefs.set('session', wins);
    },
    restore() {
      const wins = NX.prefs.get('session', []);
      if (!Array.isArray(wins)) return;
      wins.forEach(w => {
        if (!NX.apps[w.appId]) return;
        const rec = NX.openApp(w.appId, {}, { silent: true });
        if (!rec) return;
        rec.el.style.left = w.left || '100px';
        rec.el.style.top = w.top || '100px';
        rec.el.style.width = w.width || '620px';
        rec.el.style.height = w.height || '460px';
        if (w.maximized) NX.toggleMax && NX.toggleMax(rec);
        if (w.minimized) NX.minimizeWin && NX.minimizeWin(rec);
      });
    }
  };

  /* ============ Ядро: часы ============ */
  NX.MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  NX.MONTHS_N = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  NX.DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

  /* ============ Ядро: темы и обои ============ */
  NX.walls = {
    light: [
      'linear-gradient(135deg,#e9effc 0%,#f3f0fb 46%,#e9f7f3 100%)',
      'linear-gradient(135deg,#fdf2f2 0%,#f7f1fb 50%,#eef3fd 100%)',
      'linear-gradient(135deg,#e8f4ee 0%,#f0f7f4 40%,#eaf1fb 100%)',
      'linear-gradient(135deg,#f6f1e7 0%,#fbf7f0 50%,#eef2f7 100%)',
      'linear-gradient(140deg,#dfe7f5 0%,#cfd9ee 40%,#e6e2f3 100%)',
      'radial-gradient(circle at 22% 18%,#dfeaff 0%,#eef2f9 45%,#f7f4fb 100%)',
    ],
    dark: [
      'linear-gradient(135deg,#1b1d24 0%,#212231 46%,#15211f 100%)',
      'linear-gradient(135deg,#221b1e 0%,#241d28 50%,#1a1e29 100%)',
      'linear-gradient(135deg,#14211d 0%,#182320 40%,#161d29 100%)',
      'linear-gradient(135deg,#221f18 0%,#24211b 50%,#1a1e26 100%)',
      'linear-gradient(140deg,#161b26 0%,#1b2130 40%,#1e1b2a 100%)',
      'radial-gradient(circle at 22% 18%,#1d2740 0%,#181b24 45%,#1c1a24 100%)',
    ]
  };
  NX.ACCENTS = ['#0a84ff', '#5e5ce6', '#30b06b', '#ff9f0a', '#e8534a', '#e05fb0', '#2b8a5f', '#8e8e93'];

  NX.applyTheme = function () {
    document.body.classList.toggle('dark', NX.state.dark);
    const wallSet = NX.state.dark ? NX.walls.dark : NX.walls.light;
    const desk = NX.$('#desktop');
    if (desk) desk.style.background = wallSet[NX.state.wallpaper] || wallSet[0];
    document.documentElement.style.setProperty('--accent', NX.state.accent);
    document.documentElement.style.setProperty('--accent-soft', NX.state.accent + '24');
  };

  /* ============ Ядро: загрузка настроек ============ */
  (function loadPrefs() {
    const p = NX.prefs.get('prefs', {});
    if (p.wallpaper != null) NX.state.wallpaper = p.wallpaper;
    if (p.dark != null) NX.state.dark = p.dark;
    if (p.accent) NX.state.accent = p.accent;
    if (p.iconSize) NX.state.iconSize = p.iconSize;
    if (p.volume != null) NX.state.volume = p.volume;
    if (p.brightness != null) NX.state.brightness = p.brightness;
    (p.installed || []).forEach(id => NX.state.installed.add(id));
    NX.state.installed.add('calculator');
    NX.state.installed.add('weather');
    NX.state.installed.add('market');
    NX.state.installed.add('files');
    NX.state.installed.add('device');
    NX.state.installed.add('wart');
    NX.state.installed.add('terminal');
    NX.state.installed.add('trash');
  })();

  NX.persistPrefs = function () {
    NX.prefs.set('prefs', {
      wallpaper: NX.state.wallpaper,
      dark: NX.state.dark,
      accent: NX.state.accent,
      iconSize: NX.state.iconSize,
      volume: NX.state.volume,
      brightness: NX.state.brightness,
      installed: Array.from(NX.state.installed)
    });
  };

})();
