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

// --- СИСТЕМА ИКОНОК ---
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
    battery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="7" width="18" height="10" rx="2"/><rect class="bat-fill" x="4.5" y="9" width="10" height="6" rx="1" fill="currentColor" stroke="none"/><path d="M22 10.5v3"/></svg>`,
    batteryCharging: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="7" width="18" height="10" rx="2"/><rect class="bat-fill" x="4.5" y="9" width="10" height="6" rx="1" fill="currentColor" stroke="none"/><path d="M22 10.5v3"/><path d="M12 8l-2 4h3l-1 4" fill="none"/></svg>`,
    
    // Базовые приложения
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
    market: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5.5 8h13l-1.2 12.1a1 1 0 0 1-1 .9H7.7a1 1 0 0 1-1-.9L5.5 8Z"/><path d="M9 8V6.2A3 3 0 0 1 12 3a3 3 0 0 1 3 3.2V8"/></svg>`,
    clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h6"/></svg>`,
    monitor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    
    // Доп. приложения
    gallery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l4.5-4.5L13 17l3-3 4 4"/></svg>`,
    video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none"/></svg>`,
    recorder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg>`,
    camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h4l2-3h6l2 3h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/></svg>`,
    sheet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`,
    pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-3z"/></svg>`,
    kanban: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="5" height="13" rx="1"/></svg>`,
    pomodoro: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 3h6"/></svg>`,
    messenger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5A8 8 0 1 1 21 12z"/></svg>`,
    contacts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>`,
    passwords: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.5" fill="currentColor"/></svg>`,
    converter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8.5h13l-3.2-3.2M20 15.5H7l3.2 3.2"/></svg>`,
    speedtest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 18a8 8 0 0 1 16 0"/><path d="M12 18l4-5"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/></svg>`,
    
    // Игры
    snake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 16.5h4.2a2.2 2.2 0 0 0 0-4.4H9.6a2.2 2.2 0 0 1 0-4.4H14"/><circle cx="16.4" cy="16.4" r="1" fill="currentColor"/></svg>`,
    g2048: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8.2 8.6h1.6v6M13.4 8.6h2.1a1.9 1.9 0 0 1 0 3.8h-2.1v2.2h2.4"/></svg>`,
    mines: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor"/></svg>`,
    ttt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9.5 3.5v17M14.5 3.5v17M3.5 9.5h17M3.5 14.5h17"/><path d="M5 5l3.5 3.5M8.5 5L5 8.5" stroke-width="1.8"/><circle cx="17.5" cy="17.5" r="2"/></svg>`,
    memory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="7.5" height="12" rx="2"/><rect x="13.5" y="6" width="7.5" height="12" rx="2"/><path d="M5.8 12h1.9M16.3 12h1.9"/></svg>`,
    pong: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="2.6" height="10" rx="1.2"/><rect x="18.4" y="5" width="2.6" height="10" rx="1.2"/><circle cx="12" cy="13" r="1.7"/></svg>`,
    reaction: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13.5 3 6 13.2h5.2L9.8 21l7.7-10.4h-5.2L13.5 3Z"/></svg>`,
    guess: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6"/><circle cx="12" cy="16.6" r=".8" fill="currentColor"/></svg>`,
    tetris: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="10" y="4" width="6" height="6" rx="1"/><rect x="10" y="10" width="6" height="6" rx="1"/><rect x="16" y="10" width="6" height="6" rx="1"/></svg>`,
    breakout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="5" height="2.5" rx=".6"/><rect x="9.5" y="4" width="5" height="2.5" rx=".6"/><rect x="16" y="4" width="5" height="2.5" rx=".6"/><rect x="9" y="18" width="6" height="2" rx=".6"/><circle cx="12" cy="12" r="1.6"/></svg>`,
    puzzle15: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>`,
    sudoku: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/><text x="12" y="14" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor" stroke="none">9</text></svg>`,
    chess: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 20h8M9 17h6v-2a4 4 0 1 0-6 0v2zM10 11V6a2 2 0 1 1 4 0v5"/></svg>`,
    checkers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`,
    bubble: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="4"/><circle cx="16" cy="10" r="3"/><circle cx="10" cy="16" r="2.5"/><circle cx="17" cy="17" r="2"/></svg>`,
    
    // Алевтина
    assistant: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="18" height="12" rx="4"/><circle cx="9" cy="13" r="1.2" fill="currentColor"/><circle cx="15" cy="13" r="1.2" fill="currentColor"/><path d="M9 17a3 3 0 0 0 6 0"/><path d="M12 3v4M9 3h6"/></svg>`,
    mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3"/></svg>`,
    
    // Для placeholder-приложений
    puzzle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3a2 2 0 1 1 4 0h3v3a2 2 0 1 0 0 4v3h-3a2 2 0 1 1-4 0H4v-3a2 2 0 1 0 0-4V8z"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h7a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4V4zM20 4h-7a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h7V4z"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-8-5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11z"/></svg>`,
    fire: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2s4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3s-1 4 1 4 1-4 1-4-2-3 1-6z"/></svg>`,
    leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 4s-8 0-12 4-4 12-4 12 8 0 12-4 4-12 4-12zM6 18L18 6"/></svg>`,
    drop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2s6 8 6 13a6 6 0 1 1-12 0c0-5 6-13 6-13z"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6.5 18h11a3.5 3.5 0 1 0-1-6.9A4.6 4.6 0 0 0 7.6 13 3.2 3.2 0 0 0 6.5 18Z"/></svg>`,
    flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 21V4h10l-2 3 2 3H5"/></svg>`,
    gift: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="8" width="18" height="4"/><rect x="5" y="12" width="14" height="9"/><path d="M12 8v13M12 8C12 8 8 8 8 5s4-3 4 3zM12 8c0 0 4 0 4-3s-4-3-4 3z"/></svg>`
};

// --- СОСТОЯНИЕ ---
const DEFAULT_STATE = {
    theme: 'light',
    wallpaper: 0,
    liveWallpaper: 'none', // 'none', 'snow', 'rain', 'stars', 'aurora', 'bubbles'
    installed: [
        // Продуктивность
        'calc', 'weather', 'wart', 'files', 'terminal', 'browser', 'settings',
        'antivirus', 'trash', 'market', 'notes', 'todo', 'point', 'powerpaint',
        'music', 'clock', 'calendar',
        // Игры
        'snake', 'g2048', 'mines', 'ttt', 'memory', 'pong', 'reaction', 'guess',
        'tetris', 'breakout', 'puzzle15', 'sudoku', 'chess', 'checkers', 'bubble',
        // Дополнительные
        'gallery', 'video', 'recorder', 'camera', 'sheet', 'pdf', 'kanban',
        'pomodoro', 'messenger', 'contacts', 'passwords', 'converter',
        'speedtest', 'clipboard', 'taskmgr',
        // Ассистент
        'assistant'
    ],
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
        { id: 1, title: 'Добро пожаловать', content: 'Это заметка в Nextel OS.', date: new Date().toISOString(), encrypted: false }
    ],
    contacts: [
        { id: 1, name: 'Алиса', phone: '+7 999 123-45-67', email: 'alice@nextel.os' },
        { id: 2, name: 'Боб', phone: '+7 999 765-43-21', email: 'bob@nextel.os' }
    ],
    messages: {},
    clipboardHistory: [],
    antivirusStatus: 'unknown',
    antivirusResult: '',
    avDbVersion: '2026.10.24',
    avFilesScanned: '0',
    avLastScan: 'Никогда'
};

NX.state = {};

NX.saveState = () => {
    try {
        localStorage.setItem('nx_state_v3', JSON.stringify(NX.state));
    } catch (e) {
        console.warn('Не удалось сохранить:', e);
    }
};

NX.loadState = () => {
    try {
        const saved = JSON.parse(localStorage.getItem('nx_state_v3') || localStorage.getItem('nx_state_v2'));
        if (saved) {
            NX.state = { ...DEFAULT_STATE, ...saved };
            // Убедимся, что базовые приложения на месте (кроме тех, что в корзине)
            DEFAULT_STATE.installed.forEach(id => {
                if (!NX.state.installed.includes(id) && !NX.state.trash.some(t => t.id === id)) {
                    NX.state.installed.push(id);
                }
            });
        } else {
            NX.state = { ...DEFAULT_STATE };
        }
    } catch (e) {
        NX.state = { ...DEFAULT_STATE };
    }
};

// --- УДАЛЕНИЕ / УСТАНОВКА ПРИЛОЖЕНИЙ ---
NX.uninstallApp = function(appId) {
    const app = NX.apps[appId];
    if (!app) return false;
    NX.state.installed = NX.state.installed.filter(id => id !== appId);
    NX.state.trash.push({
        id: appId,
        name: app.name,
        type: 'app',
        icon: app.icon,
        originalPath: 'installed',
        removedAt: new Date().toISOString()
    });
    NX.saveState();
    if (NX.renderDesktop) NX.renderDesktop();
    NX.notifications.push('Корзина', `Приложение «${app.name}» перемещено в корзину`, 'trash');
    return true;
};

NX.installApp = function(appId) {
    const app = NX.apps[appId];
    if (!app) return false;
    if (NX.state.installed.includes(appId)) return false;
    NX.state.installed.push(appId);
    NX.state.trash = NX.state.trash.filter(t => t.id !== appId);
    NX.saveState();
    if (NX.renderDesktop) NX.renderDesktop();
    NX.notifications.push('Установлено', `Приложение «${app.name}» установлено`, 'check');
    return true;
};

// --- API БАТАРЕИ ---
NX.battery = {
    level: 100,
    charging: false,
    supported: false,
    async init() {
        if (navigator.getBattery) {
            try {
                this.supported = true;
                const b = await navigator.getBattery();
                this.level = Math.round(b.level * 100);
                this.charging = b.charging;
                b.addEventListener('levelchange', () => {
                    this.level = Math.round(b.level * 100);
                    NX.bus.emit('battery-change');
                });
                b.addEventListener('chargingchange', () => {
                    this.charging = b.charging;
                    NX.bus.emit('battery-change');
                });
                NX.bus.emit('battery-change');
            } catch (e) {
                this.supported = false;
            }
        }
    }
};

// --- ЖИВЫЕ ОБОИ ---
NX.liveWallpaper = {
    canvas: null,
    ctx: null,
    particles: [],
    type: 'none',
    mouse: { x: 0.5, y: 0.5 },
    raf: null,
    active: false,

    init() {
        this.canvas = NX.$('#live-wallpaper-canvas');
        if (!this.canvas) {
            // Создаём canvas, если его нет
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'live-wallpaper-canvas';
            NX.$('#desktop').prepend(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX / window.innerWidth;
            this.mouse.y = e.clientY / window.innerHeight;
        });
        this.set(NX.state.liveWallpaper || 'none');
    },

    resize() {
        if (!this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    set(type) {
        this.type = type || 'none';
        NX.state.liveWallpaper = this.type;
        NX.saveState();

        if (this.raf) cancelAnimationFrame(this.raf);
        this.active = false;
        this.particles = [];

        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        if (this.type === 'none') return;

        this.active = true;
        this.initParticles();
        this.animate();
    },

    initParticles() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const count = this.type === 'stars' ? 150 : 80;

        for (let i = 0; i < count; i++) {
            const p = {
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                phase: Math.random() * Math.PI * 2
            };
            if (this.type === 'snow') {
                p.vx = (Math.random() - 0.5) * 0.5;
                p.vy = p.speed * 0.7;
            } else if (this.type === 'rain') {
                p.vx = -0.5;
                p.vy = p.speed * 4;
                p.size = Math.random() * 1.5 + 0.5;
                p.length = Math.random() * 15 + 5;
            } else if (this.type === 'stars') {
                p.vx = 0;
                p.vy = 0;
                p.twinkle = Math.random() * 0.02 + 0.005;
            } else if (this.type === 'aurora') {
                p.x = Math.random() * w;
                p.y = Math.random() * h * 0.6;
                p.vx = (Math.random() - 0.5) * 0.3;
                p.vy = (Math.random() - 0.5) * 0.2;
                p.size = Math.random() * 150 + 100;
            } else if (this.type === 'bubbles') {
                p.vx = (Math.random() - 0.5) * 0.5;
                p.vy = -Math.random() * 1.5 - 0.5;
                p.size = Math.random() * 20 + 5;
            }
            this.particles.push(p);
        }
    },

    animate() {
        if (!this.active) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.ctx.clearRect(0, 0, w, h);

        const px = (this.mouse.x - 0.5) * 20;
        const py = (this.mouse.y - 0.5) * 20;

        if (this.type === 'snow') {
            this.particles.forEach(p => {
                p.x += p.vx + px * 0.02;
                p.y += p.vy + Math.sin(p.phase) * 0.2;
                p.phase += 0.01;
                if (p.y > h) { p.y = -10; p.x = Math.random() * w; }
                if (p.x > w) p.x = 0;
                if (p.x < 0) p.x = w;
                this.ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
        } else if (this.type === 'rain') {
            this.ctx.strokeStyle = 'rgba(150,180,255,0.5)';
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y > h) { p.y = -20; p.x = Math.random() * w; }
                this.ctx.lineWidth = p.size;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.vx * 3, p.y + p.length);
                this.ctx.stroke();
            });
        } else if (this.type === 'stars') {
            this.particles.forEach(p => {
                p.opacity += p.twinkle;
                if (p.opacity > 0.9 || p.opacity < 0.2) p.twinkle *= -1;
                const dx = px * 0.05, dy = py * 0.05;
                this.ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(p.x + dx, p.y + dy, p.size * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
            });
        } else if (this.type === 'aurora') {
            this.particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -p.size) p.x = w + p.size;
                if (p.x > w + p.size) p.x = -p.size;
                if (p.y < 0) p.y = h * 0.6;
                if (p.y > h * 0.6) p.y = 0;
                
                const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                const hue = (i * 30) % 360;
                grad.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.15)`);
                grad.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`);
                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
        } else if (this.type === 'bubbles') {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -30) { p.y = h + 30; p.x = Math.random() * w; }
                if (p.x > w) p.x = 0;
                if (p.x < 0) p.x = w;
                this.ctx.strokeStyle = `rgba(150,200,255,${p.opacity})`;
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.fillStyle = `rgba(150,200,255,0.1)`;
                this.ctx.fill();
            });
        }

        this.raf = requestAnimationFrame(() => this.animate());
    }
};

// --- КРИПТОГРАФИЯ (ШИФРОВАНИЕ ЗАМЕТОК) ---
NX.crypto = {
    // Генерирует соль
    generateSalt() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Получает ключ из пароля
    async deriveKey(password, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    },

    // Шифрует текст
    async encrypt(text, password) {
        const salt = this.generateSalt();
        const key = await this.deriveKey(password, salt);
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
        
        const combined = {
            salt,
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encrypted))
        };
        return btoa(JSON.stringify(combined));
    },

    // Расшифровывает текст
    async decrypt(ciphertext, password) {
        try {
            const combined = JSON.parse(atob(ciphertext));
            const key = await this.deriveKey(password, combined.salt);
            const dec = new TextDecoder();
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(combined.iv) },
                key,
                new Uint8Array(combined.data)
            );
            return dec.decode(decrypted);
        } catch (e) {
            throw new Error('Неверный пароль или повреждённые данные');
        }
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
            return true;
        }
        return false;
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
    },

    // Удаление картинки
    deleteImage(fileName) {
        return this.deleteFile('Изображения', fileName);
    },

    // Удаление записи
    deleteAudio(fileName) {
        return this.deleteFile('Документы', fileName);
    },

    getImages() {
        const folder = this.root.children.find(c => c.name === 'Изображения');
        return folder ? folder.children.filter(c => c.kind === 'img') : [];
    },

    getAudio() {
        const folder = this.root.children.find(c => c.name === 'Документы');
        return folder ? folder.children.filter(c => c.kind === 'audio') : [];
    }
};

// --- ЗВУКОВОЙ ДВИЖОК ---
NX.audio = {
    ctx: null,
    unlocked: false,
    init() {
        if (!this.ctx) {
            try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    unlock() {
        if (this.unlocked) return;
        this.init();
        this.unlocked = true;
    },
    playTone(freq, dur, type = 'sine', vol = 0.05) {
        if (!this.unlocked) return;
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
        } catch (e) {}
    },
    click() { this.playTone(800, 0.05, 'sine', 0.1); },
    open() { this.playTone(600, 0.08, 'triangle', 0.1); setTimeout(() => this.playTone(900, 0.1, 'sine', 0.05), 50); },
    close() { this.playTone(500, 0.1, 'sine', 0.1); },
    error() { this.playTone(200, 0.2, 'sawtooth', 0.1); },
    notify() { this.playTone(880, 0.1, 'sine', 0.1); setTimeout(() => this.playTone(1100, 0.15, 'sine', 0.08), 100); },
    boot() {
        this.init();
        [440, 554, 659, 880].forEach((n, i) => {
            setTimeout(() => this.playTone(n, 0.4, 'sine', 0.1), i * 150);
        });
    }
};

document.addEventListener('click', () => NX.audio.unlock(), { once: true });
document.addEventListener('keydown', () => NX.audio.unlock(), { once: true });

// --- УВЕДОМЛЕНИЯ ---
NX.notifications = {
    items: [],
    push(title, message, icon = 'info') {
        const notif = { id: NX.uid('notif'), title, message, icon, time: new Date() };
        this.items.unshift(notif);
        if (this.items.length > 30) this.items.pop();
        this.renderToast(notif);
        NX.audio.notify();
        if (NX.$('#notification-center') && NX.$('#notification-center').classList.contains('open')) {
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
            <div class="t-close">${NX.icons.x}</div>
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
        if (clearBtn) clearBtn.onclick = () => { this.items = []; this.renderCenter(); };
    }
};

// --- БУФЕР ОБМЕНА ---
NX.clipboard = {
    items: [],
    init() {
        document.addEventListener('copy', this.handleCopy.bind(this));
        document.addEventListener('cut', this.handleCopy.bind(this));
        if (NX.state.clipboardHistory) this.items = NX.state.clipboardHistory;
    },
    handleCopy(e) {
        const text = window.getSelection().toString();
        if (text) this.add(text);
    },
    add(text) {
        if (!text.trim()) return;
        this.items = this.items.filter(t => t !== text);
        this.items.unshift(text);
        if (this.items.length > 20) this.items.pop();
        NX.state.clipboardHistory = this.items;
        NX.saveState();
        NX.notifications.push('Буфер обмена', 'Текст скопирован', 'clipboard');
    },
    paste(text) {
        navigator.clipboard.writeText(text).catch(() => {});
        NX.audio.click();
    },
    renderPanel() {
        const panel = NX.$('#clipboard-panel');
        if (!panel) return;
        let html = `
            <div class="cb-header">
                <span>Буфер обмена</span>
                <div class="t-close" style="width:24px;height:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;">${NX.icons.x}</div>
            </div>
            <div class="cb-list">
        `;
        if (this.items.length === 0) {
            html += `<div class="np-empty">История пуста</div>`;
        } else {
            this.items.forEach(t => {
                html += `
                    <div class="cb-item">
                        ${NX.esc(t.slice(0, 100))}${t.length > 100 ? '...' : ''}
                        <div class="cb-time">Нажмите, чтобы скопировать</div>
                    </div>
                `;
            });
        }
        html += `</div>`;
        panel.innerHTML = html;
        panel.querySelector('.t-close').onclick = () => panel.classList.remove('open');
        panel.querySelectorAll('.cb-item').forEach((el, i) => {
            el.onclick = () => { this.paste(this.items[i]); panel.classList.remove('open'); };
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
        if (this.events[event]) this.events[event].forEach(cb => cb(data));
    }
};

// --- PLACEHOLDER-ПРИЛОЖЕНИЯ ДЛЯ NMARKET ---
NX.registerPlaceholderApp = function(cfg) {
    if (NX.apps[cfg.id]) return; // уже зарегистрировано
    NX.registerApp({
        id: cfg.id,
        name: cfg.name,
        icon: cfg.icon || NX.icons.puzzle,
        color: cfg.color || '#6b7280',
        w: 500, h: 400, single: false,
        category: cfg.category || 'Программы',
        description: cfg.description || 'Приложение в разработке',
        rating: cfg.rating || (4 + Math.random()).toFixed(1),
        size: cfg.size || (Math.random() * 15 + 2).toFixed(1) + ' МБ',
        render(body) {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;align-items:center;justify-content:center;gap:20px;padding:40px;text-align:center;">
                    <div style="width:80px;height:80px;color:${cfg.color || '#6b7280'};opacity:0.7;">${cfg.icon || NX.icons.puzzle}</div>
                    <h2 style="font-size:22px;font-weight:700;margin:0;">${NX.esc(cfg.name)}</h2>
                    <p style="color:var(--text-muted);max-width:400px;line-height:1.6;">${NX.esc(cfg.description || 'Это приложение находится в разработке. Скоро здесь появится полноценный функционал.')}</p>
                    <span style="background:var(--accent-soft);color:var(--accent);padding:4px 12px;border-radius:12px;font-size:11px;font-weight:600;">В РАЗРАБОТКЕ</span>
                </div>
            `;
        }
    });
};

// --- РЕГИСТРАЦИЯ 60+ ПРИЛОЖЕНИЙ ---
(function registerExtraApps() {
    const extraApps = [
        // Программы и утилиты (20)
        { id: 'notepad', name: 'Блокнот', icon: NX.icons.wart, color: '#4a6fa5', category: 'Программы', description: 'Простой блокнот для быстрых записей.' },
        { id: 'calculator_sci', name: 'Инженерный калькулятор', icon: NX.icons.calc, color: '#8b5cf6', category: 'Утилиты', description: 'Научный калькулятор с тригонометрией.' },
        { id: 'password_gen', name: 'Генератор паролей', icon: NX.icons.passwords, color: '#30b06b', category: 'Утилиты', description: 'Создание надёжных паролей.' },
        { id: 'qr_gen', name: 'QR-генератор', icon: NX.icons.qr || NX.icons.grid, color: '#111827', category: 'Утилиты', description: 'Создание QR-кодов из ссылок.' },
        { id: 'color_picker', name: 'Выбор цвета', icon: NX.icons.paint || NX.icons.point, color: '#e05fb0', category: 'Утилиты', description: 'Палитра цветов, HEX, RGB, HSL.' },
        { id: 'unit_converter', name: 'Конвертер единиц', icon: NX.icons.converter, color: '#2b8a5f', category: 'Утилиты', description: 'Конвертация всех единиц измерения.' },
        { id: 'currency', name: 'Валюты', icon: NX.icons.converter, color: '#10b981', category: 'Утилиты', description: 'Курсы валют в реальном времени.' },
        { id: 'bmi_calc', name: 'ИМТ Калькулятор', icon: NX.icons.heart || NX.icons.calc, color: '#ef4444', category: 'Утилиты', description: 'Индекс массы тела.' },
        { id: 'date_calc', name: 'Калькулятор дат', icon: NX.icons.calendar, color: '#f59e0b', category: 'Утилиты', description: 'Разница между датами.' },
        { id: 'age_calc', name: 'Калькулятор возраста', icon: NX.icons.calendar, color: '#e8534a', category: 'Утилиты', description: 'Сколько вам лет.' },
        { id: 'tip_calc', name: 'Калькулятор чаевых', icon: NX.icons.calc, color: '#0a84ff', category: 'Утилиты', description: 'Расчёт чаевых в ресторане.' },
        { id: 'timer', name: 'Таймер', icon: NX.icons.clock, color: '#5e5ce6', category: 'Утилиты', description: 'Таймер обратного отсчёта.' },
        { id: 'stopwatch', name: 'Секундомер', icon: NX.icons.clock, color: '#ff9f0a', category: 'Утилиты', description: 'Точный секундомер.' },
        { id: 'world_clock', name: 'Мировые часы', icon: NX.icons.clock, color: '#34aadc', category: 'Утилиты', description: 'Часы в разных городах мира.' },
        { id: 'compass', name: 'Компас', icon: NX.icons.compass || NX.icons.globe, color: '#2b8a5f', category: 'Утилиты', description: 'Компас и уровень.' },
        { id: 'ruler', name: 'Линейка', icon: NX.icons.ruler || NX.icons.up, color: '#6b7280', category: 'Утилиты', description: 'Виртуальная линейка.' },
        { id: 'protractor', name: 'Транспортир', icon: NX.icons.protractor || NX.icons.up, color: '#8b5cf6', category: 'Утилиты', description: 'Измерение углов.' },
        { id: 'level', name: 'Уровень', icon: NX.icons.level || NX.icons.up, color: '#10b981', category: 'Утилиты', description: 'Проверка ровности поверхности.' },
        { id: 'magnifier', name: 'Лупа', icon: NX.icons.search, color: '#111827', category: 'Утилиты', description: 'Увеличение экрана.' },
        { id: 'dictaphone', name: 'Диктофон Pro', icon: NX.icons.recorder, color: '#e8534a', category: 'Программы', description: 'Диктофон с эффектами.' },
        
        // Офис и продуктивность (12)
        { id: 'kanban_pro', name: 'Kanban Pro', icon: NX.icons.kanban, color: '#5e5ce6', category: 'Программы', description: 'Расширенная Kanban-доска.' },
        { id: 'gantt', name: 'Гант', icon: NX.icons.kanban, color: '#f59e0b', category: 'Программы', description: 'Диаграмма Ганта для проектов.' },
        { id: 'mindmap', name: 'Mind Map', icon: NX.icons.grid, color: '#e05fb0', category: 'Программы', description: 'Интеллект-карты.' },
        { id: 'whiteboard', name: 'Whiteboard', icon: NX.icons.point, color: '#0a84ff', category: 'Программы', description: 'Бесконечное полотно для рисования.' },
        { id: 'flowchart', name: 'Диаграммы', icon: NX.icons.kanban, color: '#10b981', category: 'Программы', description: 'Блок-схемы и диаграммы.' },
        { id: 'resume', name: 'Резюме', icon: NX.icons.fileTxt, color: '#4a6fa5', category: 'Программы', description: 'Конструктор резюме.' },
        { id: 'invoice', name: 'Накладные', icon: NX.icons.fileTxt, color: '#ff9f0a', category: 'Программы', description: 'Создание счетов и накладных.' },
        { id: 'meeting', name: 'Встречи', icon: NX.icons.calendar, color: '#e8534a', category: 'Программы', description: 'Планировщик встреч.' },
        { id: 'notes_pro', name: 'Заметки Pro', icon: NX.icons.notes, color: '#e8c65a', category: 'Программы', description: 'Заметки с тегами и папками.' },
        { id: 'todo_pro', name: 'Задачи Pro', icon: NX.icons.todo, color: '#5e5ce6', category: 'Программы', description: 'Задачи с подзадачами.' },
        { id: 'habit', name: 'Трекер привычек', icon: NX.icons.check, color: '#10b981', category: 'Программы', description: 'Отслеживание полезных привычек.' },
        { id: 'diary', name: 'Дневник', icon: NX.icons.notes, color: '#e05fb0', category: 'Программы', description: 'Личный дневник с шифрованием.' },
        
        // Медиа и творчество (12)
        { id: 'gif_maker', name: 'GIF-мейкер', icon: NX.icons.video, color: '#e05fb0', category: 'Программы', description: 'Создание GIF из изображений.' },
        { id: 'collage', name: 'Коллаж', icon: NX.icons.gallery, color: '#ff9f0a', category: 'Программы', description: 'Коллажи из фотографий.' },
        { id: 'filters', name: 'Фильтры', icon: NX.icons.gallery, color: '#5e5ce6', category: 'Программы', description: 'Фильтры для фото.' },
        { id: 'crop', name: 'Обрезка', icon: NX.icons.point, color: '#10b981', category: 'Программы', description: 'Обрезка изображений.' },
        { id: 'resize', name: 'Изменение размера', icon: NX.icons.point, color: '#f59e0b', category: 'Программы', description: 'Изменение размера картинок.' },
        { id: 'audio_editor', name: 'Аудиоредактор', icon: NX.icons.music, color: '#e8534a', category: 'Программы', description: 'Редактирование аудио.' },
        { id: 'video_editor', name: 'Видеоредактор', icon: NX.icons.video, color: '#e05fb0', category: 'Программы', description: 'Обрезка и склейка видео.' },
        { id: 'screen_recorder', name: 'Запись экрана', icon: NX.icons.video, color: '#111827', category: 'Программы', description: 'Запись экрана в видео.' },
        { id: 'screenshot', name: 'Скриншот', icon: NX.icons.camera, color: '#0a84ff', category: 'Программы', description: 'Снимок экрана с аннотациями.' },
        { id: 'draw_pad', name: 'Draw Pad', icon: NX.icons.point, color: '#8b5cf6', category: 'Программы', description: 'Простой блокнот для рисования.' },
        { id: 'pixel_art', name: 'Пиксель-арт', icon: NX.icons.grid, color: '#ff9f0a', category: 'Программы', description: 'Редактор пиксель-арта.' },
        { id: 'gradient', name: 'Градиенты', icon: NX.icons.paint || NX.icons.point, color: '#e05fb0', category: 'Программы', description: 'Создание CSS-градиентов.' },
        
        // Наука и образование (8)
        { id: 'periodic', name: 'Таблица Менделеева', icon: NX.icons.sheet, color: '#10b981', category: 'Утилиты', description: 'Периодическая таблица элементов.' },
        { id: 'physics', name: 'Формулы физики', icon: NX.icons.book || NX.icons.info, color: '#3b82f6', category: 'Утилиты', description: 'Справочник формул по физике.' },
        { id: 'math', name: 'Математика', icon: NX.icons.calc, color: '#8b5cf6', category: 'Утилиты', description: 'Формулы и теоремы.' },
        { id: 'chemistry', name: 'Химия', icon: NX.icons.info, color: '#10b981', category: 'Утилиты', description: 'Химические реакции и формулы.' },
        { id: 'dictionary', name: 'Словарь', icon: NX.icons.book || NX.icons.info, color: '#4a6fa5', category: 'Программы', description: 'Толковый словарь.' },
        { id: 'translator', name: 'Переводчик', icon: NX.icons.globe, color: '#0a84ff', category: 'Программы', description: 'Перевод текста.' },
        { id: 'pomodoro_pro', name: 'Pomodoro Pro', icon: NX.icons.pomodoro, color: '#f59e0b', category: 'Программы', description: 'Pomodoro со статистикой.' },
        { id: 'flashcards', name: 'Карточки', icon: NX.icons.book || NX.icons.info, color: '#e05fb0', category: 'Программы', description: 'Обучающие карточки.' },
        
        // Утилиты системы (8)
        { id: 'disk_cleaner', name: 'Очистка диска', icon: NX.icons.trash, color: '#e8534a', category: 'Система', description: 'Удаление временных файлов.' },
        { id: 'registry', name: 'Реестр', icon: NX.icons.device, color: '#111827', category: 'Система', description: 'Редактор реестра системы.' },
        { id: 'drivers', name: 'Драйверы', icon: NX.icons.device, color: '#6b7280', category: 'Система', description: 'Диспетчер драйверов.' },
        { id: 'devices', name: 'Устройства', icon: NX.icons.monitor, color: '#34aadc', category: 'Система', description: 'Подключённые устройства.' },
        { id: 'firewall', name: 'Брандмауэр', icon: NX.icons.antivirus, color: '#ef4444', category: 'Система', description: 'Управление сетевыми правилами.' },
        { id: 'vpn', name: 'VPN', icon: NX.icons.wifi, color: '#10b981', category: 'Система', description: 'Виртуальная частная сеть.' },
        { id: 'backup', name: 'Резервные копии', icon: NX.icons.save, color: '#0a84ff', category: 'Система', description: 'Создание и восстановление бэкапов.' },
        { id: 'registry_editor', name: 'Редактор политик', icon: NX.icons.lock, color: '#6b7280', category: 'Система', description: 'Групповые политики.' }
    ];

    // Регистрируем каждое
    extraApps.forEach(app => NX.registerPlaceholderApp(app));
})();

// --- ИНИЦИАЛИЗАЦИЯ ЯДРА ---
NX.loadState();
NX.clipboard.init();
NX.battery.init();
NX.liveWallpaper.init();
