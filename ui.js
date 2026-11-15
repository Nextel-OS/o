/* ============================================================
   NEXTEL OS 2.0 — ПОЛЬЗОВАТЕЛЬСКИЙ ИНТЕРФЕЙС (UI) v3.3
   ============================================================ */

NX.apps = NX.apps || {};
NX.windows = { list: [], focused: null, zTop: 100, seq: 0 };

NX.registerApp = function(config) {
    NX.apps[config.id] = Object.assign({
        w: 600, h: 450, single: false, type: 'app',
        category: 'Программы', description: '', rating: 4.5, size: '5 МБ'
    }, config);
};

NX.openApp = function(appId, args = {}) {
    const app = NX.apps[appId];
    if (!app) { NX.notifications.push('Ошибка', `Приложение ${appId} не найдено`, 'info'); return; }
    if (appId === 'assistant' && NX.alevtina && NX.alevtina.openPanel) { NX.alevtina.openPanel(); return; }

    if (app.single) {
        const existing = NX.windows.list.find(w => w.appId === appId);
        if (existing) {
            if (existing.minimized) NX.restoreWindow(existing);
            NX.focusWindow(existing);
            return existing;
        }
    }

    const win = document.createElement('div');
    win.className = 'window';
    win.dataset.appId = appId;
    win.style.width = Math.min(app.w || 600, window.innerWidth - 40) + 'px';
    win.style.height = Math.min(app.h || 450, window.innerHeight - 100) + 'px';
    const offset = (NX.windows.list.length % 8) * 24;
    win.style.left = Math.max(20, (window.innerWidth - (app.w || 600)) / 2 - 100 + offset) + 'px';
    win.style.top = Math.max(20, (window.innerHeight - (app.h || 450)) / 2 - 50 + offset) + 'px';
    win.style.zIndex = ++NX.windows.zTop;

    win.innerHTML = `
        <div class="titlebar">
            <div class="tb-left">
                <span style="color:var(--accent)">${app.icon || ''}</span>
                <span class="tb-title">${NX.esc(app.name || appId)}</span>
            </div>
            <div class="tb-controls">
                <button class="tb-btn btn-min" title="Свернуть">${NX.icons.min}</button>
                <button class="tb-btn btn-max" title="Развернуть">${NX.icons.max}</button>
                <button class="tb-btn close btn-close" title="Закрыть">${NX.icons.close}</button>
            </div>
        </div>
        <div class="window-content"></div>
        <div class="resizer"></div>
    `;

    NX.$('#windows-layer').appendChild(win);
    const rec = { id: NX.uid('win'), appId, el: win, minimized: false, maximized: false, snapped: null, cleanups: [] };
    NX.windows.list.push(rec);
    win._rec = rec;

    const content = NX.$('.window-content', win);
    const ctx = { win: rec, body: content, args, onClose: (fn) => rec.cleanups.push(fn) };

    NX.$('.btn-min', win).onclick = (e) => { e.stopPropagation(); NX.minimizeWindow(rec); };
    NX.$('.btn-max', win).onclick = (e) => { e.stopPropagation(); NX.maximizeWindow(rec); };
    NX.$('.btn-close', win).onclick = (e) => { e.stopPropagation(); NX.closeWindow(rec); };
    win.addEventListener('mousedown', () => NX.focusWindow(rec), true);

    NX.makeDraggable(win, NX.$('.titlebar', win), rec);
    NX.makeResizable(win, NX.$('.resizer', win), rec);

    try { app.render(content, ctx); } catch (e) {
        content.innerHTML = `<div style="padding:20px;color:red;">Ошибка приложения: ${e.message}</div>`;
        console.error(e);
    }

    NX.focusWindow(rec);
    NX.refreshTaskbar();
    NX.audio.open();
    NX.saveSession();
    return rec;
};

NX.focusWindow = (rec) => { if (!rec) return; NX.windows.focused = rec; rec.el.style.zIndex = ++NX.windows.zTop; NX.refreshTaskbar(); };
NX.minimizeWindow = (rec) => { rec.minimized = true; rec.el.style.display = 'none'; if (NX.windows.focused === rec) NX.windows.focused = null; NX.refreshTaskbar(); NX.saveSession(); };
NX.restoreWindow = (rec) => { rec.minimized = false; rec.el.style.display = 'flex'; NX.refreshTaskbar(); NX.saveSession(); };

NX.maximizeWindow = function(rec) {
    const win = rec.el;
    if (rec.maximized) {
        Object.assign(win.style, rec.prevStyle);
        win.classList.remove('maximized');
        rec.maximized = false;
    } else {
        rec.prevStyle = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height };
        Object.assign(win.style, { left: '0px', top: '0px', width: '100%', height: '100%' });
        win.classList.add('maximized');
        rec.maximized = true;
    }
    window.dispatchEvent(new Event('resize'));
    NX.saveSession();
};

NX.closeWindow = function(rec) {
    rec.cleanups.forEach(fn => { try { fn(); } catch(e) {} });
    rec.el.classList.add('closing');
    setTimeout(() => {
        rec.el.remove();
        NX.windows.list = NX.windows.list.filter(w => w !== rec);
        if (NX.windows.focused === rec) NX.windows.focused = null;
        NX.refreshTaskbar();
        NX.audio.close();
        NX.saveSession();
    }, 150);
};

NX.makeDraggable = function(win, handle, rec) {
    handle.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.tb-btn') || rec.maximized) return;
        const rect = win.getBoundingClientRect();
        const dx = e.clientX - rect.left, dy = e.clientY - rect.top;
        let snapZone = null;
        handle.setPointerCapture(e.pointerId);
        const onMove = (ev) => {
            const margin = 20;
            let newSnap = null;
            if (ev.clientY < margin) newSnap = 'top';
            else if (ev.clientX < margin) newSnap = 'left';
            else if (ev.clientX > window.innerWidth - margin) newSnap = 'right';
            snapZone = newSnap;
            win.style.left = Math.max(0, Math.min(window.innerWidth - rect.width, ev.clientX - dx)) + 'px';
            win.style.top = Math.max(0, Math.min(window.innerHeight - 48, ev.clientY - dy)) + 'px';
        };
        const onUp = () => {
            handle.removeEventListener('pointermove', onMove);
            handle.removeEventListener('pointerup', onUp);
            if (snapZone === 'left') { Object.assign(win.style, { left: '0px', top: '0px', width: '50%', height: '100%' }); rec.snapped = 'left'; }
            else if (snapZone === 'right') { Object.assign(win.style, { left: '50%', top: '0px', width: '50%', height: '100%' }); rec.snapped = 'right'; }
            else if (snapZone === 'top') NX.maximizeWindow(rec);
            window.dispatchEvent(new Event('resize'));
            NX.saveSession();
        };
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
    });
};

NX.makeResizable = function(win, grip, rec) {
    grip.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const rect = win.getBoundingClientRect();
        const sx = e.clientX, sy = e.clientY;
        grip.setPointerCapture(e.pointerId);
        const onMove = (ev) => {
            win.style.width = Math.max(300, rect.width + ev.clientX - sx) + 'px';
            win.style.height = Math.max(200, rect.height + ev.clientY - sy) + 'px';
            window.dispatchEvent(new Event('resize'));
        };
        const onUp = () => {
            grip.removeEventListener('pointermove', onMove);
            grip.removeEventListener('pointerup', onUp);
            NX.saveSession();
        };
        grip.addEventListener('pointermove', onMove);
        grip.addEventListener('pointerup', onUp);
    });
};

NX.refreshTaskbar = function() {
    const container = NX.$('#tasks-container');
    if (!container) return;
    container.innerHTML = '';
    NX.windows.list.forEach(rec => {
        const app = NX.apps[rec.appId];
        if (!app) return;
        const btn = document.createElement('button');
        btn.className = 'task-btn' + (NX.windows.focused === rec && !rec.minimized ? ' active' : '');
        btn.innerHTML = `<span style="color:var(--accent)">${app.icon}</span> <span>${NX.esc(app.name)}</span>`;
        btn.onclick = () => {
            if (rec.minimized) { NX.restoreWindow(rec); NX.focusWindow(rec); }
            else if (NX.windows.focused === rec) NX.minimizeWindow(rec);
            else NX.focusWindow(rec);
        };
        container.appendChild(btn);
    });
    NX.updateBatteryIndicator();
};

NX.updateBatteryIndicator = function() {
    const tray = NX.$('#tray-battery');
    if (!tray || !NX.battery) return;
    if (!NX.battery.supported) { tray.style.display = 'none'; return; }
    tray.style.display = 'flex';
    const level = NX.battery.level;
    const charging = NX.battery.charging;
    const icon = charging ? NX.icons.batteryCharging : NX.icons.battery;
    const color = level < 20 ? 'var(--danger)' : (level < 50 ? 'var(--warning)' : 'var(--success)');
    tray.innerHTML = `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;color:${color};" title="${level}%${charging ? ' (заряжается)' : ''}">
        <span style="width:22px;height:22px;display:inline-block;">${icon}</span>
        <span style="font-size:11px;font-weight:600;">${level}%</span>
    </div>`;
};

if (NX.bus) NX.bus.on('battery-change', () => NX.updateBatteryIndicator && NX.updateBatteryIndicator());

NX.renderDesktop = function() {
    if (!Array.isArray(NX.state.installed)) NX.state.installed = [];
    const container = NX.$('#icons-container');
    if (!container) return;
    container.innerHTML = '';
    const apps = NX.state.installed.map(id => NX.apps[id]).filter(Boolean);
    apps.sort((a, b) => NX.state.installed.indexOf(a.id) - NX.state.installed.indexOf(b.id));
    apps.forEach(app => {
        const el = document.createElement('div');
        el.className = 'desktop-icon';
        el.dataset.id = app.id;
        el.draggable = true;
        el.innerHTML = `<span style="color:var(--accent)">${app.icon}</span><span class="label">${NX.esc(app.name)}</span>`;
        el.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            if (!e.ctrlKey) NX.$$('.desktop-icon').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
        });
        el.addEventListener('dblclick', () => NX.openApp(app.id));
        el.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', app.id); el.style.opacity = '0.4'; });
        el.addEventListener('dragend', () => { el.style.opacity = '1'; });
        el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
        el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('drag-over');
            const draggedId = e.dataTransfer.getData('text/plain');
            if (!draggedId || draggedId === app.id) return;
            const fromIdx = NX.state.installed.indexOf(draggedId);
            const toIdx = NX.state.installed.indexOf(app.id);
            if (fromIdx !== -1 && toIdx !== -1) {
                NX.state.installed.splice(fromIdx, 1);
                NX.state.installed.splice(toIdx, 0, draggedId);
                NX.saveState();
                NX.renderDesktop();
            }
        });
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (!el.classList.contains('selected')) {
                NX.$$('.desktop-icon').forEach(x => x.classList.remove('selected'));
                el.classList.add('selected');
            }
            NX.showContextMenu(e.clientX, e.clientY, [
                { label: 'Открыть', icon: NX.icons.play, action: () => NX.openApp(app.id) },
                { sep: true },
                { label: 'Удалить', icon: NX.icons.trash, action: () => NX.uninstallApp(app.id) }
            ]);
        });
        container.appendChild(el);
    });
};

NX.initMarquee = function() {
    const desktop = NX.$('#desktop'), marquee = NX.$('#selection-marquee');
    if (!desktop || !marquee) return;
    let isSelecting = false, startX, startY;
    desktop.addEventListener('mousedown', (e) => {
        if (e.target.closest('.desktop-icon') || e.target.closest('.widget') || e.target.closest('.window')) return;
        if (e.button !== 0) return;
        NX.$$('.desktop-icon').forEach(x => x.classList.remove('selected'));
        isSelecting = true;
        const rect = desktop.getBoundingClientRect();
        startX = e.clientX - rect.left; startY = e.clientY - rect.top;
        marquee.style.display = 'block';
        marquee.style.left = startX + 'px'; marquee.style.top = startY + 'px';
        marquee.style.width = '0px'; marquee.style.height = '0px';
        const onMove = (ev) => {
            if (!isSelecting) return;
            const cx = ev.clientX - rect.left, cy = ev.clientY - rect.top;
            const x = Math.min(startX, cx), y = Math.min(startY, cy);
            const w = Math.abs(cx - startX), h = Math.abs(cy - startY);
            Object.assign(marquee.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
            NX.$$('.desktop-icon').forEach(icon => {
                const ir = icon.getBoundingClientRect();
                const ix = ir.left - rect.left, iy = ir.top - rect.top;
                icon.classList.toggle('selected', ix < x + w && ix + ir.width > x && iy < y + h && iy + ir.height > y);
            });
        };
        const onUp = () => {
            isSelecting = false;
            marquee.style.display = 'none';
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
};

NX.showContextMenu = function(x, y, items) {
    const menu = NX.$('#context-menu');
    if (!menu) return;
    menu.innerHTML = '';
    items.forEach(item => {
        if (item.sep) { menu.innerHTML += `<div class="ctx-sep"></div>`; return; }
        const el = document.createElement('div');
        el.className = 'ctx-item';
        el.innerHTML = `${item.icon ? `<span>${item.icon}</span>` : '<span style="width:16px"></span>'}<span>${NX.esc(item.label)}</span>`;
        el.onclick = () => { menu.classList.remove('open'); if (item.action) item.action(); };
        menu.appendChild(el);
    });
    menu.classList.add('open');
    menu.style.left = '0px'; menu.style.top = '0px';
    const rect = menu.getBoundingClientRect();
    menu.style.left = Math.min(x, window.innerWidth - rect.width - 10) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - rect.height - 10) + 'px';
};

document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('#context-menu')) {
        const cm = NX.$('#context-menu');
        if (cm) cm.classList.remove('open');
    }
});

// ============================================================
// ИСПРАВЛЕНО: ВИДЖЕТЫ С DRAG-AND-DROP ЧЕРЕЗ DOCUMENT LISTENERS
// ============================================================
NX.renderWidgets = function() {
    const container = NX.$('#widgets-container');
    if (!container) return;
    
    // Очищаем старые документ-слушатели
    if (NX._widgetCleanup) {
        try { NX._widgetCleanup(); } catch(e) {}
        NX._widgetCleanup = null;
    }
    
    container.innerHTML = '';
    if (!Array.isArray(NX.state.widgets)) NX.state.widgets = [];

    // Глобальное состояние перетаскивания
    let dragging = null;

    const onMove = (e) => {
        if (!dragging) return;
        const { el, w, startX, startY, startTop, startRight } = dragging;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        // Ограничения, чтобы не улетел за экран
        w.top = Math.max(0, Math.min(window.innerHeight - 150, startTop + dy));
        w.right = Math.max(0, Math.min(window.innerWidth - 100, startRight - dx));
        
        el.style.top = w.top + 'px';
        el.style.right = w.right + 'px';
    };

    const onUp = () => {
        if (!dragging) return;
        dragging.el.style.cursor = 'grab';
        dragging = null;
        NX.saveState();
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    NX._widgetCleanup = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
    };

    NX.state.widgets.forEach((w, index) => {
        const el = document.createElement('div');
        el.className = 'widget';
        el.style.position = 'fixed'; // FIX: не зависим от контейнера
        el.style.top = w.top + 'px';
        el.style.right = w.right + 'px';
        el.style.zIndex = '100';
        el.style.cursor = 'grab';
        el.style.userSelect = 'none';
        el.style.touchAction = 'none'; // важно для pointer events на тач-устройствах

        if (w.type === 'clock') {
            el.innerHTML = `
                <div class="widget-header">Часы</div>
                <div style="font-size:36px;font-weight:300;letter-spacing:-1px;" class="w-time"></div>
                <div style="font-size:12px;color:var(--text-muted);" class="w-date"></div>
            `;
            const updateTime = () => {
                const d = new Date();
                const tEl = el.querySelector('.w-time'), dEl = el.querySelector('.w-date');
                if (tEl) tEl.textContent = NX.pad(d.getHours()) + ':' + NX.pad(d.getMinutes());
                if (dEl) dEl.textContent = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
            };
            updateTime();
            const iv = setInterval(updateTime, 30000);
            el._cleanup = () => clearInterval(iv);
        } else if (w.type === 'weather') {
            el.innerHTML = `
                <div class="widget-header">Погода</div>
                <div style="font-size:36px;font-weight:300;letter-spacing:-1px;" class="w-temp">--°</div>
                <div style="font-size:12px;color:var(--text-muted);">Москва</div>
            `;
            fetch('https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.62&current=temperature_2m')
                .then(r => r.json())
                .then(d => {
                    const tEl = el.querySelector('.w-temp');
                    if (tEl) tEl.textContent = (d.current.temperature_2m > 0 ? '+' : '') + Math.round(d.current.temperature_2m) + '°';
                }).catch(() => {});
        } else if (w.type === 'battery' && NX.battery && NX.battery.supported) {
            el.innerHTML = `
                <div class="widget-header">Батарея</div>
                <div style="font-size:36px;font-weight:300;letter-spacing:-1px;">${NX.battery.level}%</div>
                <div style="font-size:12px;color:var(--text-muted);">${NX.battery.charging ? '⚡ Заряжается' : 'От батареи'}</div>
            `;
        }

        // FIX: перетаскивание через document listeners
        el.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button, a, input, select, textarea')) return;
            dragging = {
                el, w,
                startX: e.clientX,
                startY: e.clientY,
                startTop: w.top,
                startRight: w.right
            };
            el.style.cursor = 'grabbing';
            el.style.opacity = '0.9';
            e.preventDefault();
        });

        // Возвращаем opacity после отпускания
        el.addEventListener('pointerup', () => { if (!dragging) el.style.opacity = '1'; });
        // Глобальный сброс opacity
        const resetOpacity = () => { if (!dragging) el.style.opacity = '1'; };
        document.addEventListener('pointerup', resetOpacity);

        container.appendChild(el);
    });
};

NX.saveSession = function() {
    const session = NX.windows.list.map(w => ({
        appId: w.appId,
        left: w.el.style.left, top: w.el.style.top,
        width: w.el.style.width, height: w.el.style.height,
        maximized: w.maximized, minimized: w.minimized
    }));
    NX.state.session = session;
    NX.saveState();
};

NX.restoreSession = function() {
    const session = NX.state.session || [];
    session.forEach((s, i) => {
        if (!NX.apps[s.appId]) return;
        setTimeout(() => {
            try {
                const rec = NX.openApp(s.appId);
                if (rec) {
                    if (s.left) rec.el.style.left = s.left;
                    if (s.top) rec.el.style.top = s.top;
                    if (s.width) rec.el.style.width = s.width;
                    if (s.height) rec.el.style.height = s.height;
                    if (s.maximized) NX.maximizeWindow(rec);
                    if (s.minimized) NX.minimizeWindow(rec);
                }
            } catch (e) {}
        }, i * 100);
    });
};

NX.initUI = function() {
    NX.renderDesktop();
    NX.renderWidgets();
    NX.initMarquee();
    NX.refreshTaskbar();
    NX.updateBatteryIndicator && NX.updateBatteryIndicator();
    NX.restoreSession();

    NX.$('#desktop').addEventListener('contextmenu', (e) => {
        if (e.target.closest('.desktop-icon') || e.target.closest('.widget') || e.target.closest('.window')) return;
        e.preventDefault();
        NX.showContextMenu(e.clientX, e.clientY, [
            { label: 'Обновить', icon: NX.icons.refresh, action: () => { NX.renderDesktop(); NX.renderWidgets(); }},
            { sep: true },
            { label: 'Настройки', icon: NX.icons.device, action: () => NX.openApp('settings') }
        ]);
    });

    window.addEventListener('beforeunload', () => NX.saveSession());
};
