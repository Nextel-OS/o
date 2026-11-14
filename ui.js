/* ============================================================
   NEXTEL OS 2.0 — ПОЛЬЗОВАТЕЛЬСКИЙ ИНТЕРФЕЙС (UI)
   ============================================================ */

NX.apps = {};
NX.windows = {
    list: [],
    focused: null,
    zTop: 100,
    seq: 0
};

// --- РЕГИСТРАЦИЯ ПРИЛОЖЕНИЙ ---
NX.registerApp = function(config) {
    NX.apps[config.id] = Object.assign({
        w: 600, h: 450, single: false, type: 'app'
    }, config);
};

// --- ОКОННЫЙ МЕНЕДЖЕР ---
NX.openApp = function(appId, args = {}) {
    const app = NX.apps[appId];
    if (!app) {
        NX.notifications.push('Ошибка', `Приложение ${appId} не найдено`, 'info');
        return;
    }

    // Синглтон (например, калькулятор)
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
    win.style.width = Math.min(app.w, window.innerWidth - 40) + 'px';
    win.style.height = Math.min(app.h, window.innerHeight - 100) + 'px';
    
    // Каскад
    const offset = (NX.windows.list.length % 8) * 24;
    win.style.left = Math.max(20, (window.innerWidth - app.w) / 2 - 100 + offset) + 'px';
    win.style.top = Math.max(20, (window.innerHeight - app.h) / 2 - 50 + offset) + 'px';
    win.style.zIndex = ++NX.windows.zTop;

    win.innerHTML = `
        <div class="titlebar">
            <div class="tb-left">
                <span style="color:var(--accent)">${app.icon}</span>
                <span class="tb-title">${NX.esc(app.name)}</span>
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

    const rec = {
        id: NX.uid('win'),
        appId: appId,
        el: win,
        minimized: false,
        maximized: false,
        cleanups: []
    };
    NX.windows.list.push(rec);
    win._rec = rec;

    const content = NX.$('.window-content', win);
    const ctx = {
        win: rec, body: content, args: args,
        onClose: (fn) => rec.cleanups.push(fn)
    };

    // Кнопки окна
    NX.$('.btn-min', win).onclick = (e) => { e.stopPropagation(); NX.minimizeWindow(rec); };
    NX.$('.btn-max', win).onclick = (e) => { e.stopPropagation(); NX.maximizeWindow(rec); };
    NX.$('.btn-close', win).onclick = (e) => { e.stopPropagation(); NX.closeWindow(rec); };

    // Фокус
    win.addEventListener('mousedown', () => NX.focusWindow(rec), true);

    // Перетаскивание и ресайз
    NX.makeDraggable(win, NX.$('.titlebar', win), rec);
    NX.makeResizable(win, NX.$('.resizer', win), rec);

    // Рендер приложения
    try {
        app.render(content, ctx);
    } catch (e) {
        content.innerHTML = `<div style="padding:20px;color:red;">Ошибка приложения: ${e.message}</div>`;
        console.error(e);
    }

    NX.focusWindow(rec);
    NX.refreshTaskbar();
    NX.audio.open();
    
    return rec;
};

NX.focusWindow = function(rec) {
    if (!rec) return;
    NX.windows.focused = rec;
    rec.el.style.zIndex = ++NX.windows.zTop;
    NX.refreshTaskbar();
};

NX.minimizeWindow = function(rec) {
    rec.minimized = true;
    rec.el.style.display = 'none';
    if (NX.windows.focused === rec) NX.windows.focused = null;
    NX.refreshTaskbar();
};

NX.restoreWindow = function(rec) {
    rec.minimized = false;
    rec.el.style.display = 'flex';
    NX.refreshTaskbar();
};

NX.maximizeWindow = function(rec) {
    const win = rec.el;
    if (rec.maximized) {
        Object.assign(win.style, rec.prevStyle);
        win.classList.remove('maximized');
        rec.maximized = false;
    } else {
        rec.prevStyle = {
            left: win.style.left, top: win.style.top,
            width: win.style.width, height: win.style.height
        };
        win.style.left = '0px';
        win.style.top = '0px';
        win.style.width = '100%';
        win.style.height = '100%';
        win.classList.add('maximized');
        rec.maximized = true;
    }
    // Важно для игр и канвасов
    window.dispatchEvent(new Event('resize'));
};

NX.closeWindow = function(rec) {
    // Очистка таймеров игр
    rec.cleanups.forEach(fn => { try { fn(); } catch(e) { console.error(e); } });
    
    rec.el.classList.add('closing');
    setTimeout(() => {
        rec.el.remove();
        NX.windows.list = NX.windows.list.filter(w => w !== rec);
        if (NX.windows.focused === rec) NX.windows.focused = null;
        NX.refreshTaskbar();
        NX.audio.close();
    }, 150);
};

NX.makeDraggable = function(win, handle, rec) {
    handle.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.tb-btn') || rec.maximized) return;
        const rect = win.getBoundingClientRect();
        const dx = e.clientX - rect.left;
        const dy = e.clientY - rect.top;
        
        handle.setPointerCapture(e.pointerId);
        
        const onMove = (ev) => {
            win.style.left = Math.max(0, Math.min(window.innerWidth - rect.width, ev.clientX - dx)) + 'px';
            win.style.top = Math.max(0, Math.min(window.innerHeight - 48, ev.clientY - dy)) + 'px';
        };
        
        const onUp = () => {
            handle.removeEventListener('pointermove', onMove);
            handle.removeEventListener('pointerup', onUp);
        };
        
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
    });
};

NX.makeResizable = function(win, grip, rec) {
    grip.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const rect = win.getBoundingClientRect();
        const sx = e.clientX;
        const sy = e.clientY;
        
        grip.setPointerCapture(e.pointerId);
        
        const onMove = (ev) => {
            win.style.width = Math.max(300, rect.width + ev.clientX - sx) + 'px';
            win.style.height = Math.max(200, rect.height + ev.clientY - sy) + 'px';
            window.dispatchEvent(new Event('resize'));
        };
        
        const onUp = () => {
            grip.removeEventListener('pointermove', onMove);
            grip.removeEventListener('pointerup', onUp);
        };
        
        grip.addEventListener('pointermove', onMove);
        grip.addEventListener('pointerup', onUp);
    });
};

// --- ПАНЕЛЬ ЗАДАЧ ---
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
            if (rec.minimized) {
                NX.restoreWindow(rec);
                NX.focusWindow(rec);
            } else if (NX.windows.focused === rec) {
                NX.minimizeWindow(rec);
            } else {
                NX.focusWindow(rec);
            }
        };
        
        container.appendChild(btn);
    });
};

// --- РАБОЧИЙ СТОЛ ---
NX.renderDesktop = function() {
    const container = NX.$('#icons-container');
    if (!container) return;
    container.innerHTML = '';
    
    // Делаем копию, чтобы не мутировать оригинал при сортировке
    const apps = [...NX.state.installed].map(id => NX.apps[id]).filter(Boolean);
    // Сортируем в том порядке, в котором они лежат в state.installed
    apps.sort((a, b) => NX.state.installed.indexOf(a.id) - NX.state.installed.indexOf(b.id));
    
    apps.forEach(app => {
        const el = document.createElement('div');
        el.className = 'desktop-icon';
        el.dataset.id = app.id;
        el.draggable = true;
        el.innerHTML = `
            <span style="color:var(--accent)">${app.icon}</span>
            <span class="label">${NX.esc(app.name)}</span>
        `;
        
        // Выделение
        el.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            if (!e.ctrlKey) {
                NX.$$('.desktop-icon').forEach(x => x.classList.remove('selected'));
            }
            el.classList.add('selected');
        });
        
        // Открытие
        el.addEventListener('dblclick', () => {
            NX.openApp(app.id);
        });
        
        // ===== DRAG-AND-DROP: перетаскивание иконок =====
        el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', app.id);
            e.dataTransfer.effectAllowed = 'move';
            el.style.opacity = '0.4';
            el.classList.add('dragging');
        });
        
        el.addEventListener('dragend', () => {
            el.style.opacity = '1';
            el.classList.remove('dragging');
        });
        
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            el.classList.add('drag-over');
        });
        
        el.addEventListener('dragleave', () => {
            el.classList.remove('drag-over');
        });
        
        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('drag-over');
            const draggedId = e.dataTransfer.getData('text/plain');
            if (!draggedId || draggedId === app.id) return;
            
            // Меняем порядок в массиве installed
            const installed = NX.state.installed;
            const fromIdx = installed.indexOf(draggedId);
            const toIdx = installed.indexOf(app.id);
            if (fromIdx !== -1 && toIdx !== -1) {
                installed.splice(fromIdx, 1);
                installed.splice(toIdx, 0, draggedId);
                NX.saveState();
                NX.renderDesktop();
            }
        });
        
        // ===== КОНТЕКСТНОЕ МЕНЮ (правильное удаление) =====
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!el.classList.contains('selected')) {
                NX.$$('.desktop-icon').forEach(x => x.classList.remove('selected'));
                el.classList.add('selected');
            }
            NX.showContextMenu(e.clientX, e.clientY, [
                { label: 'Открыть', icon: NX.icons.play, action: () => NX.openApp(app.id) },
                { sep: true },
                { label: 'Удалить приложение', icon: NX.icons.trash, action: () => NX.uninstallApp(app.id) }
            ]);
        });
        
        container.appendChild(el);
    });
};

// --- ВЫДЕЛЕНИЕ РАМКОЙ (MARQUEE) ---
NX.initMarquee = function() {
    const desktop = NX.$('#desktop');
    const marquee = NX.$('#selection-marquee');
    if (!desktop || !marquee) return;
    let isSelecting = false;
    let startX, startY;

    desktop.addEventListener('mousedown', (e) => {
        if (e.target.closest('.desktop-icon') || e.target.closest('.widget') || e.target.closest('.window')) return;
        if (e.button !== 0) return;

        NX.$$('.desktop-icon').forEach(x => x.classList.remove('selected'));

        isSelecting = true;
        const rect = desktop.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;

        marquee.style.display = 'block';
        marquee.style.left = startX + 'px';
        marquee.style.top = startY + 'px';
        marquee.style.width = '0px';
        marquee.style.height = '0px';

        const onMove = (ev) => {
            if (!isSelecting) return;
            const cx = ev.clientX - rect.left;
            const cy = ev.clientY - rect.top;
            
            const x = Math.min(startX, cx);
            const y = Math.min(startY, cy);
            const w = Math.abs(cx - startX);
            const h = Math.abs(cy - startY);
            
            Object.assign(marquee.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });

            NX.$$('.desktop-icon').forEach(icon => {
                const ir = icon.getBoundingClientRect();
                const ix = ir.left - rect.left;
                const iy = ir.top - rect.top;
                
                const intersect = ix < x + w && ix + ir.width > x && iy < y + h && iy + ir.height > y;
                icon.classList.toggle('selected', intersect);
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

// --- КОНТЕКСТНОЕ МЕНЮ ---
NX.showContextMenu = function(x, y, items) {
    const menu = NX.$('#context-menu');
    if (!menu) return;
    menu.innerHTML = '';
    
    items.forEach(item => {
        if (item.sep) {
            menu.innerHTML += `<div class="ctx-sep"></div>`;
            return;
        }
        const el = document.createElement('div');
        el.className = 'ctx-item';
        el.innerHTML = `
            ${item.icon ? `<span>${item.icon}</span>` : '<span style="width:16px"></span>'}
            <span>${NX.esc(item.label)}</span>
        `;
        el.onclick = () => {
            menu.classList.remove('open');
            if (item.action) item.action();
        };
        menu.appendChild(el);
    });

    menu.classList.add('open');
    menu.style.left = '0px';
    menu.style.top = '0px';
    
    const rect = menu.getBoundingClientRect();
    menu.style.left = Math.min(x, window.innerWidth - rect.width - 10) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - rect.height - 10) + 'px';
};

// Закрытие меню при клике вне его
document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('#context-menu')) {
        const cm = NX.$('#context-menu');
        if (cm) cm.classList.remove('open');
    }
});

// --- ВИДЖЕТЫ (С ПЕРЕТАСКИВАНИЕМ) ---
NX.renderWidgets = function() {
    const container = NX.$('#widgets-container');
    if (!container) return;
    container.innerHTML = '';

    NX.state.widgets.forEach((w, index) => {
        const el = document.createElement('div');
        el.className = 'widget';
        el.style.top = w.top + 'px';
        el.style.right = w.right + 'px';
        el.dataset.idx = index;

        if (w.type === 'clock') {
            el.innerHTML = `
                <div class="widget-header">Часы</div>
                <div style="font-size:36px;font-weight:300;letter-spacing:-1px;" class="w-time"></div>
                <div style="font-size:12px;color:var(--text-muted);" class="w-date"></div>
            `;
        } else if (w.type === 'weather') {
            el.innerHTML = `
                <div class="widget-header">Погода</div>
                <div style="font-size:36px;font-weight:300;letter-spacing:-1px;" class="w-temp">--°</div>
                <div style="font-size:12px;color:var(--text-muted);">Москва</div>
            `;
            fetch('https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.62&current=temperature_2m')
                .then(r => r.json())
                .then(d => {
                    if(el.querySelector('.w-temp')) {
                        el.querySelector('.w-temp').textContent = (d.current.temperature_2m > 0 ? '+' : '') + Math.round(d.current.temperature_2m) + '°';
                    }
                }).catch(() => {
                    if(el.querySelector('.w-temp')) el.querySelector('.w-temp').textContent = '—';
                });
        }

        if (w.type === 'clock') {
            const updateTime = () => {
                const d = new Date();
                const tEl = el.querySelector('.w-time');
                const dEl = el.querySelector('.w-date');
                if(tEl) tEl.textContent = NX.pad(d.getHours()) + ':' + NX.pad(d.getMinutes());
                if(dEl) dEl.textContent = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
            };
            updateTime();
            setInterval(updateTime, 10000);
        }

        // Перетаскивание виджета
        let startX, startY, startTop, startRight;
        el.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button') || e.target.closest('a')) return;

            el.setPointerCapture(e.pointerId);
            startX = e.clientX;
            startY = e.clientY;
            startTop = w.top;
            startRight = w.right;

            const onMove = (ev) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                
                w.top = startTop + dy;
                w.right = startRight - dx;

                el.style.top = w.top + 'px';
                el.style.right = w.right + 'px';
            };

            const onUp = () => {
                el.removeEventListener('pointermove', onMove);
                el.removeEventListener('pointerup', onUp);
                NX.saveState();
            };

            el.addEventListener('pointermove', onMove);
            el.addEventListener('pointerup', onUp);
        });

        container.appendChild(el);
    });
};

// --- ИНИЦИАЛИЗАЦИЯ ---
NX.initUI = function() {
    NX.renderDesktop();
    NX.renderWidgets();
    NX.initMarquee();
    NX.refreshTaskbar();

    // Контекстное меню на рабочем столе
    NX.$('#desktop').addEventListener('contextmenu', (e) => {
        if (e.target.closest('.desktop-icon') || e.target.closest('.widget')) return;
        e.preventDefault();
        
        NX.showContextMenu(e.clientX, e.clientY, [
            { label: 'Обновить', icon: NX.icons.refresh, action: () => {
                NX.renderDesktop();
                NX.renderWidgets();
            }},
            { sep: true },
            { label: 'Персонализация', icon: NX.icons.sun, action: () => {
                NX.openApp('settings', { tab: 'personal' });
            }}
        ]);
    });
};
