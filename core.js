/* ============================================================
   NEXTEL OS 2.0 — ЯДРО (CORE)
   ============================================================ */

window.NX = window.NX || {};

// --- УТИЛИТЫ ---
NX.$ = (sel, root = document) => root.querySelector(sel);
NX.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
NX.esc = (str) => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
NX.pad = (n) => String(n).padStart(2, '0');
NX.uid = (prefix = 'id') => prefix + '_' + Math.random().toString(36).substr(2, 9);
NX.sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --- СИСТЕМА ИКОНОК (SVG) ---
NX.icons = {
    logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5" stroke-dasharray="40 13"/><circle cx="12" cy="12" r="2.8" fill="currentColor"/></svg>`,
    min: `<svg viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.5"><path d="M2 5h6"/></svg>`,
    max: `<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.2" y="2.2" width="5.6" height="5.6" rx="1"/></svg>`,
    close: `<svg viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.5"><path d="M2.4 2.4l5.2 5.2M7.6 2.4L2.4 7.6"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>`,
    wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8 15.5a5 5 0 0 1 8 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>`,
    bt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7l10 10-5 5V2l5 5L7 17"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/></svg>`,
    power: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg>`,
    reboot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4v6h-6M3 20v-6h6"/><path d="M5 19a9 9 0 0 0 14-3M19 5A9 9 0 0 0 5 8"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>`,
    fileTxt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg>`,
    fileImg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l4.5-4.5L13 17l3-3 4 4"/></svg>`,
    filePpt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="12" rx="1.6"/><path d="M12 16v4M8 20h8"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 12.5l5 5 10-11"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5l12 7.5-12 7.5z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="4.5" width="4" height="15" rx="1"/><rect x="13.5" y="4.5" width="4" height="15" rx="1"/></svg>`,
    chevL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5l-7 7 7 7"/></svg>`,
    chevR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>`,
    up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5"/></svg>`,
    save: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-6h8v6"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 4v11M7.5 11l4.5 4.5L16.5 11M4 20h16"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".9" fill="currentColor"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.9 12.4a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9L17.5 7M10 11v6M14 11v6"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 11a8 8 0 1 0-.7 4.4"/><path d="M20 5v6h-6"/></svg>`,
    
    // App Icons
    calc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7.5h7M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01M12 18h3.5"/></svg>`,
    weather: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8.5" r="3"/><path d="M9 2.6v1.4M9 13v1.4M2.6 8.5H4M14 8.5h1.4M4.5 4l1 1M13.5 13l1 1M13.5 4l-1 1M4.5 13l1-1"/><path d="M9.5 19h8.2a2.9 2.9 0 1 0-.9-5.6A3.9 3.9 0 0 0 9.2 15"/></svg>`,
    wart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4.5" y="3" width="15" height="18" rx="2"/><path d="M8 8h8M8 11.5h8M8 15h5"/></svg>`,
    browser: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"/></svg>`,
    point: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14.5 4.5l5 5L10 19l-6 1 1-6 9.5-9.5Z"/><path d="M12.5 6.5l5 5"/></svg>`,
    powerpaint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="12" rx="1.6"/><path d="M12 16v4M8.5 20h7"/></svg>`,
    antivirus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l7.5 3v6c0 4.7-3.1 7.9-7.5 9.4C7.6 19.9 4.5 16.7 4.5 12V6L12 3Z"/><path d="M9.2 12l2 2 3.6-3.8"/></svg>`,
    device: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="var(--surface)"/><circle cx="15" cy="12" r="2" fill="var(--surface)"/><circle cx="8" cy="17" r="2" fill="var(--surface)"/></svg>`,
    terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 10l2.2 2.2L7 14.4M12.6 14.6H17"/></svg>`,
    music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6.8" cy="17.4" r="2.6"/><circle cx="17.2" cy="14.8" r="2.6"/><path d="M9.4 17.4V7.2l10.4-2v9.6"/></svg>`,
    notes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4.5h14v9l-5.5 5.5H5z"/><path d="M19 13.5h-5.5V19"/></svg>`,
    todo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7.2l1.8 1.8L9 5.6M4 17.2l1.8 1.8L9 15.6M12.5 8h8M12.5 18h8"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
    snake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 16.5h4.2a2.2 2.2 0 0 0 0-4.4H9.6a2.2 2.2 0 0 1 0-4.4H14"/><circle cx="16.4" cy="16.4" r="1" fill="currentColor"/></svg>`,
    g2048: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8.2 8.6h1.6v6M13.4 8.6h2.1a1.9 1.9 0 0 1 0 3.8h-2.1v2.2h2.4"/></svg>`,
    mines: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor"/></svg>`,
    ttt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9.5 3.5v17M14.5 3.5v17M3.5 9.5h17M3.5 14.5h17"/><path d="M5 5l3.5 3.5M8.5 5L5 8.5" stroke-width="1.8"/><circle cx="17.5" cy="17.5" r="2"/></svg>`,
    pong: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="2.6" height="10" rx="1.2"/><rect x="18.4" y="5" width="2.6" height="10" rx="1.2"/><circle cx="12" cy="13" r="1.7"/></svg>`,
    reaction: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13.5 3 6 13.2h5.2L9.8 21l7.7-10.4h-5.2L13.5 3Z"/></svg>`,
    guess: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6"/><circle cx="12" cy="16.6" r=".8" fill="currentColor"/></svg>`,
    tetris: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="10" y="4" width="6" height="6" rx="1"/><rect x="10" y="10" width="6" height="6" rx="1"/><rect x="16" y="10" width="6" height="6" rx="1"/></svg>`,
    market: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5.5 8h13l-1.2 12.1a1 1 0 0 1-1 .9H7.7a1 1 0 0 1-1-.9L5.5 8Z"/><path d="M9 8V6.2A3 3 0 0 1 12 3a3 3 0 0 1 3 3.2V8"/></svg>`,
    clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h6"/></svg>`,
    monitor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`
};

// --- СОСТОЯНИЕ И НАСТРОЙКИ ---
const DEFAULT_STATE = {
    theme: 'light',
    wallpaper: 0,
    installed: ['calc', 'weather', 'wart', 'files', 'terminal', 'browser', 'settings', 'antivirus', 'trash', 'market', 'notes', 'todo', 'point', 'powerpaint', 'music', 'clock', 'calendar', 'snake', 'g2048'],
    trash: [],
    volume: 80,
    brightness: 100,
    wifi: true,
    bt: false,
    pinnedTaskbar: ['browser', 'files', 'terminal'],
    widgets: [
        { id: 'w_clock', type: 'clock', top: 20, right: 20 },
        { id: 'w_weather', type: 'weather', top: 150, right: 20 }
    ],
    session: [],
    tasks: [
        { id: 1, text: 'Изучить Nextel OS', done: false }
    ],
    notes: [
        { id: 1, title: 'Добро пожаловать', content: 'Это заметка в Nextel OS.', date: new Date().toISOString() }
    ]
};

NX.state = {};

NX.saveState = () => {
    try {
        localStorage.setItem('nx_state_v2', JSON.stringify(NX.state));
    } catch (e) {
        console.warn('Не удалось сохранить состояние:', e);
    }
};

NX.loadState = () => {
    try {
        const saved = JSON.parse(localStorage.getItem('nx_state_v2'));
        if (saved) {
            NX.state = { ...DEFAULT_STATE, ...saved };
        } else {
            NX.state = { ...DEFAULT_STATE };
        }
    } catch (e) {
        NX.state = { ...DEFAULT_STATE };
    }
};

// --- ВИРТУАЛЬНАЯ ФС ---
NX.fs = {
    root: {
        name: 'Этот компьютер',
        type: 'folder',
        children: [
            { name: 'Рабочий стол', type: 'folder', children: [] },
            { name: 'Документы', type: 'folder', children: [] },
            { name: 'Изображения', type: 'folder', children: [] },
            { name: 'Загрузки', type: 'folder', children: [] }
        ]
    },
    
    getNode(pathArr) {
        let current = this.root;
        for (let part of pathArr) {
            if (!current.children) return null;
            current = current.children.find(c => c.name === part);
            if (!current) return null;
        }
        return current;
    },
    
    addFile(folderName, fileName, content, kind = 'txt') {
        const folder = this.root.children.find(c => c.name === folderName);
        if (folder) {
            folder.children = folder.children.filter(c => c.name !== fileName);
            folder.children.push({ 
                name: fileName, 
                type: 'file', 
                kind: kind, 
                content: content, 
                date: new Date().toISOString() 
            });
            NX.bus.emit('fs-change');
        }
    },
    
    deleteFile(folderName, fileName) {
        const folder = this.root.children.find(c => c.name === folderName);
        if (folder) {
            const idx = folder.children.findIndex(c => c.name === fileName);
            if (idx !== -1) {
                const file = folder.children.splice(idx, 1)[0];
                file.originalPath = folderName;
                NX.state.trash.push(file);
                NX.saveState();
                NX.bus.emit('fs-change');
                return true;
            }
        }
        return false;
    }
};

// --- ЗВУКОВОЙ ДВИЖОК (С ИСПРАВЛЕНИЕМ ОШИБКИ AUDIO CONTEXT) ---
NX.audio = {
    ctx: null,
    unlocked: false,
    
    init() {
        if (!this.ctx) {
            try { 
                this.ctx = new (window.AudioContext || window.webkitAudioContext)(); 
            } catch(e) {
                console.warn('AudioContext не поддерживается');
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // Разблокировка по первому клику
    unlock() {
        if (this.unlocked) return;
        this.init();
        this.unlocked = true;
        console.log('AudioContext разблокирован пользователем');
    },
    
    playTone(freq, dur, type = 'sine', vol = 0.05) {
        if (!this.unlocked) return; // Не играем, пока не было клика
        this.init();
        if (!this.ctx) return;
        
        const sysVol = NX.state.volume / 100;
        if (sysVol === 0) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(vol * sysVol, this.ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + dur);
        } catch (e) {
            // Игнорируем ошибки звука
        }
    },
    
    click() { this.playTone(800, 0.05, 'sine', 0.1); },
    open() { this.playTone(600, 0.08, 'triangle', 0.1); setTimeout(() => this.playTone(900, 0.1, 'sine', 0.05), 50); },
    close() { this.playTone(500, 0.1, 'sine', 0.1); },
    error() { this.playTone(200, 0.2, 'sawtooth', 0.1); },
    notify() { 
        this.playTone(880, 0.1, 'sine', 0.1); 
        setTimeout(() => this.playTone(1100, 0.15, 'sine', 0.08), 100); 
    },
    boot() {
        this.init();
        const notes = [440, 554, 659, 880];
        notes.forEach((n, i) => {
            setTimeout(() => this.playTone(n, 0.4, 'sine', 0.1), i * 150);
        });
    }
};

// Слушатели для разблокировки звука при первом взаимодействии
document.addEventListener('click', () => NX.audio.unlock(), { once: true });
document.addEventListener('keydown', () => NX.audio.unlock(), { once: true });

// --- УВЕДОМЛЕНИЯ ---
NX.notifications = {
    items: [],
    
    push(title, message, icon = 'info') {
        const notif = {
            id: NX.uid('notif'),
            title,
            message,
            icon,
            time: new Date()
        };
        
        this.items.unshift(notif);
        if (this.items.length > 30) this.items.pop();
        
        this.renderToast(notif);
        NX.audio.notify();
        
        if (NX.$('#notification-center').classList.contains('open')) {
            this.renderCenter();
        }
    },
    
    renderToast(notif) {
        const container = NX.$('#toast-container');
        if (!container) return;
        
        const el = document.createElement('div');
        el.className = 'toast';
        el.innerHTML = `
            <div class="t-icon">${NX.icons[notif.icon] || NX.icons.info}</div>
            <div class="t-content">
                <div class="t-title">${NX.esc(notif.title)}</div>
                <div class="t-msg">${NX.esc(notif.message)}</div>
            </div>
            <div class="t-close">${NX.icons.close}</div>
        `;
        
        el.querySelector('.t-close').onclick = () => {
            el.classList.add('closing');
            setTimeout(() => el.remove(), 200);
        };
        
        container.appendChild(el);
        
        setTimeout(() => {
            if (el.parentNode) {
                el.classList.add('closing');
                setTimeout(() => el.remove(), 200);
            }
        }, 4000);
    },
    
    renderCenter() {
        const center = NX.$('#notification-center');
        if (!center) return;

        let html = `
            <div class="np-header">
                <span>Уведомления</span>
                <button class="btn ghost" id="clear-notifs" style="height:24px;padding:0 8px;font-size:11px;">Очистить</button>
            </div>
            <div class="np-body">
        `;
        
        if (this.items.length === 0) {
            html += `<div class="np-empty">Нет новых уведомлений</div>`;
        } else {
            this.items.forEach(n => {
                html += `
                    <div class="np-item">
                        <div class="t-ic">${NX.icons[n.icon] || NX.icons.info}</div>
                        <div class="t-body">
                            <div class="t-title">${NX.esc(n.title)}</div>
                            <div class="t-msg">${NX.esc(n.message)}</div>
                            <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">
                                ${NX.pad(n.time.getHours())}:${NX.pad(n.time.getMinutes())}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
        center.innerHTML = html;
        
        const clearBtn = center.querySelector('#clear-notifs');
        if (clearBtn) {
            clearBtn.onclick = () => {
                this.items = [];
                this.renderCenter();
            };
        }
    }
};

// --- БУФЕР ОБМЕНА ---
NX.clipboard = {
    items: [],
    
    init() {
        document.addEventListener('copy', this.handleCopy.bind(this));
        document.addEventListener('cut', this.handleCopy.bind(this));
    },
    
    handleCopy(e) {
        const text = window.getSelection().toString();
        if (text) {
            this.add(text);
        }
    },
    
    add(text) {
        if (!text.trim()) return;
        this.items = this.items.filter(t => t !== text);
        this.items.unshift(text);
        if (this.items.length > 20) this.items.pop();
        
        NX.notifications.push('Буфер обмена', 'Текст скопирован', 'clipboard');
    },
    
    paste(text) {
        navigator.clipboard.writeText(text).catch(err => console.error('Ошибка копирования', err));
        NX.audio.click();
    },
    
    renderPanel() {
        const panel = NX.$('#clipboard-panel');
        if (!panel) return;

        let html = `
            <div class="cb-header">
                <span>Буфер обмена</span>
                <div class="t-close" style="width:24px;height:24px;cursor:pointer;">${NX.icons.close}</div>
            </div>
            <div class="cb-list">
        `;
        
        if (this.items.length === 0) {
            html += `<div class="np-empty">История пуста</div>`;
        } else {
            this.items.forEach(t => {
                html += `
                    <div class="cb-item">
                        ${NX.esc(t)}
                        <div class="cb-time">Нажмите, чтобы скопировать</div>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
        panel.innerHTML = html;
        
        panel.querySelector('.t-close').onclick = () => panel.classList.remove('open');
        
        panel.querySelectorAll('.cb-item').forEach((el, i) => {
            el.onclick = () => {
                this.paste(this.items[i]);
                panel.classList.remove('open');
            };
        });
    }
};

// --- ШИНА СОБЫТИЙ ---
NX.bus = {
    events: {},
    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    },
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data));
        }
    }
};

// Инициализация ядра
NX.loadState();
NX.clipboard.init();
