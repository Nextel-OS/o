/* ============================================================
   NEXTEL OS 2.0 — СИСТЕМНЫЕ ФУНКЦИИ (SYSTEM)
   ============================================================ */

// --- 1. ЗАГРУЗКА И ПИТАНИЕ ---
NX.boot = {
    start() {
        const bootScreen = NX.$('#boot-screen');
        const progress = NX.$('#boot-progress');
        const stage = NX.$('#boot-stage');
        
        if (!bootScreen || !progress || !stage) return;

        const steps = [
            { text: 'Проверка оборудования...', delay: 400, prog: 20 },
            { text: 'Загрузка ядра Nextel...', delay: 600, prog: 45 },
            { text: 'Инициализация драйверов...', delay: 500, prog: 70 },
            { text: 'Запуск оболочки...', delay: 400, prog: 90 },
            { text: 'Готово', delay: 300, prog: 100 }
        ];

        let currentStep = 0;
        
        const nextStep = () => {
            if (currentStep >= steps.length) {
                setTimeout(() => this.showLogin(), 500);
                return;
            }
            
            const step = steps[currentStep];
            stage.textContent = step.text;
            progress.style.width = step.prog + '%';
            
            currentStep++;
            setTimeout(nextStep, step.delay);
        };

        setTimeout(() => {
            // Звук загрузки (если уже разблокирован)
            if (NX.audio.unlocked) NX.audio.boot();
            nextStep();
        }, 500);
    },

    showLogin() {
        const bootScreen = NX.$('#boot-screen');
        const lockScreen = NX.$('#lock-screen');
        
        if (!bootScreen || !lockScreen) return;

        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.style.display = 'none';
            lockScreen.classList.add('active');
            this.updateLockTime();
            setInterval(() => this.updateLockTime(), 1000);
            
            const pinInput = NX.$('#lock-pin');
            if (pinInput) pinInput.focus();
        }, 600);
    },

    updateLockTime() {
        const d = new Date();
        const timeEl = NX.$('#lock-time');
        const dateEl = NX.$('#lock-date');
        
        if (timeEl) timeEl.textContent = NX.pad(d.getHours()) + ':' + NX.pad(d.getMinutes());
        if (dateEl) dateEl.textContent = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    },

    unlock() {
        const lockScreen = NX.$('#lock-screen');
        const pinInput = NX.$('#lock-pin');
        
        if (!lockScreen || !pinInput) return;
        
        const pin = pinInput.value;
        
        if (pin === '1234' || pin === '') {
            // Разблокируем звук при первом действии
            NX.audio.unlock();
            NX.audio.open();

            lockScreen.classList.add('unlocking');
            
            setTimeout(() => {
                lockScreen.classList.remove('active', 'unlocking');
                pinInput.value = '';
                
                // Инициализация рабочего стола
                NX.initUI();
                NX.notifications.push('Nextel OS', 'Добро пожаловать!', 'check');
                
            }, 400);
        } else {
            NX.audio.error();
            pinInput.value = '';
            pinInput.placeholder = 'Неверный PIN';
            setTimeout(() => pinInput.placeholder = 'PIN-код', 1500);
        }
    },

    reboot() {
        const rebootScreen = NX.$('#reboot-screen');
        if (rebootScreen) {
            rebootScreen.classList.add('active');
            NX.saveState();
            setTimeout(() => location.reload(), 2000);
        }
    },

    shutdown() {
        const powerScreen = NX.$('#power-off-screen');
        if (powerScreen) {
            powerScreen.classList.add('active');
            NX.saveState();
            setTimeout(() => {
                document.body.innerHTML = '<div style="background:#000;width:100vw;height:100vh;"></div>';
            }, 2000);
        }
    },

    lock() {
        const lockScreen = NX.$('#lock-screen');
        if (!lockScreen) return;
        
        lockScreen.classList.add('active');
        this.updateLockTime();
        
        const pinInput = NX.$('#lock-pin');
        if (pinInput) pinInput.focus();
    }
};

// --- 2. МЕНЮ ПУСК ---
NX.startMenu = {
    render(query = '') {
        const menu = NX.$('#start-menu');
        if (!menu) return;
        
        const apps = NX.state.installed
            .map(id => NX.apps[id])
            .filter(app => app && app.name.toLowerCase().includes(query.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));

        let html = `
            <input type="text" class="sm-search" placeholder="Поиск приложений..." value="${NX.esc(query)}">
            <div class="sm-header">Все приложения</div>
            <div class="sm-grid">
        `;

        if (apps.length === 0) {
            html += `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">Ничего не найдено</div>`;
        } else {
            apps.forEach(app => {
                html += `
                    <div class="sm-app" data-id="${app.id}">
                        <span style="color:var(--accent)">${app.icon}</span>
                        <span>${NX.esc(app.name)}</span>
                    </div>
                `;
            });
        }

        html += `
            </div>
            <div class="sm-footer">
                <button class="btn ghost" id="sm-lock">${NX.icons.lock} Блокировка</button>
                <button class="btn ghost" id="sm-power">${NX.icons.power} Выключение</button>
            </div>
        `;

        menu.innerHTML = html;

        const searchInput = menu.querySelector('.sm-search');
        searchInput.addEventListener('input', (e) => this.render(e.target.value));
        searchInput.focus();

        menu.querySelectorAll('.sm-app').forEach(el => {
            el.onclick = () => {
                menu.classList.remove('open');
                NX.openApp(el.dataset.id);
            };
        });

        menu.querySelector('#sm-lock').onclick = () => {
            menu.classList.remove('open');
            NX.boot.lock();
        };

        menu.querySelector('#sm-power').onclick = () => {
            menu.classList.remove('open');
            this.showPowerMenu();
        };
    },

    showPowerMenu() {
        NX.showContextMenu(window.innerWidth / 2 - 100, window.innerHeight / 2, [
            { label: 'Заблокировать', icon: NX.icons.lock, action: () => NX.boot.lock() },
            { label: 'Перезагрузка', icon: NX.icons.reboot, action: () => NX.boot.reboot() },
            { label: 'Выключение', icon: NX.icons.power, action: () => NX.boot.shutdown() }
        ]);
    },

    toggle() {
        const menu = NX.$('#start-menu');
        if (!menu) return;
        
        if (menu.classList.contains('open')) {
            menu.classList.remove('open');
        } else {
            this.render();
            menu.classList.add('open');
        }
    }
};

// --- 3. ГЛОБАЛЬНЫЙ ПОИСК (SPOTLIGHT) ---
NX.spotlight = {
    open() {
        const overlay = NX.$('#spotlight-overlay');
        const input = NX.$('#spotlight-input');
        const results = NX.$('#spotlight-results');
        
        if (!overlay || !input || !results) return;
        
        overlay.classList.add('open');
        input.value = '';
        results.innerHTML = '';
        input.focus();

        input.oninput = () => this.search(input.value);
        
        overlay.onclick = (e) => {
            if (e.target === overlay) this.close();
        };
    },

    close() {
        const overlay = NX.$('#spotlight-overlay');
        if (overlay) overlay.classList.remove('open');
    },

    search(query) {
        const results = NX.$('#spotlight-results');
        if (!results) return;
        
        if (!query.trim()) {
            results.innerHTML = '';
            return;
        }

        const q = query.toLowerCase();
        let html = '';

        // Поиск приложений (по всем установленным + по тем, что в корзине)
        const allApps = Object.values(NX.apps);
        const matchedApps = allApps.filter(app => 
            app.name.toLowerCase().includes(q) || (app.id && app.id.toLowerCase().includes(q))
        );

        matchedApps.forEach(app => {
            const isInstalled = NX.state.installed.includes(app.id);
            html += `
                <div class="sp-result" data-action="app" data-id="${app.id}">
                    <span style="color:var(--accent)">${app.icon}</span>
                    <div class="sp-title">${NX.esc(app.name)}</div>
                    <div class="sp-cat">${isInstalled ? 'Приложение' : 'Установить'}</div>
                </div>
            `;
        });

        // Поиск действий (системные команды)
        if ('выключение перезагрузка блокировка сон'.includes(q)) {
            html += `
                <div class="sp-result" data-action="power">
                    <span style="color:var(--accent)">${NX.icons.power}</span>
                    <div class="sp-title">Управление питанием</div>
                    <div class="sp-cat">Система</div>
                </div>
            `;
        }

        if ('настройки параметры система'.includes(q)) {
            html += `
                <div class="sp-result" data-action="settings">
                    <span style="color:var(--accent)">${NX.icons.device}</span>
                    <div class="sp-title">Настройки системы</div>
                    <div class="sp-cat">Система</div>
                </div>
            `;
        }

        if ('буфер обмена clipboard'.includes(q)) {
            html += `
                <div class="sp-result" data-action="clipboard">
                    <span style="color:var(--accent)">${NX.icons.clipboard}</span>
                    <div class="sp-title">Буфер обмена</div>
                    <div class="sp-cat">Утилита</div>
                </div>
            `;
        }

        if ('алевтина ассистент помощник ии'.includes(q)) {
            html += `
                <div class="sp-result" data-action="app" data-id="assistant">
                    <span style="color:var(--accent)">${NX.icons.assistant}</span>
                    <div class="sp-title">Алевтина</div>
                    <div class="sp-cat">Ассистент</div>
                </div>
            `;
        }

        results.innerHTML = html || `<div style="padding: 20px; text-align: center; color: var(--text-muted);">Ничего не найдено</div>`;

        results.querySelectorAll('.sp-result').forEach(el => {
            el.onclick = () => {
                const action = el.dataset.action;
                if (action === 'app') {
                    this.close();
                    const appId = el.dataset.id;
                    if (NX.state.installed.includes(appId)) {
                        NX.openApp(appId);
                    } else {
                        NX.installApp(appId);
                        NX.openApp(appId);
                    }
                } else if (action === 'power') {
                    this.close();
                    NX.startMenu.showPowerMenu();
                } else if (action === 'settings') {
                    this.close();
                    NX.openApp('settings');
                } else if (action === 'clipboard') {
                    this.close();
                    NX.clipboard.renderPanel();
                    NX.$('#clipboard-panel').classList.add('open');
                }
            };
        });
    }
};

// --- 4. БЫСТРЫЕ НАСТРОЙКИ ---
NX.quickSettings = {
    render() {
        const panel = NX.$('#quick-settings-panel');
        if (!panel) return;
        
        const isDark = NX.state.theme === 'dark';
        const wifiOn = NX.state.wifi;
        const btOn = NX.state.bt;

        panel.innerHTML = `
            <div class="qs-grid">
                <div class="qs-tile ${wifiOn ? 'on' : ''}" id="qs-wifi">
                    ${NX.icons.wifi}
                    <span>Wi-Fi</span>
                </div>
                <div class="qs-tile ${btOn ? 'on' : ''}" id="qs-bt">
                    ${NX.icons.bt}
                    <span>Bluetooth</span>
                </div>
                <div class="qs-tile ${isDark ? 'on' : ''}" id="qs-theme">
                    ${isDark ? NX.icons.moon : NX.icons.sun}
                    <span>Тема</span>
                </div>
                <div class="qs-tile" id="qs-settings">
                    ${NX.icons.device}
                    <span>Настройки</span>
                </div>
            </div>
            <div class="qs-slider-wrap">
                <div class="qs-slider">
                    ${NX.icons.sun}
                    <input type="range" id="qs-brightness" min="20" max="100" value="${NX.state.brightness}">
                </div>
                <div class="qs-slider">
                    ${NX.icons.music}
                    <input type="range" id="qs-volume" min="0" max="100" value="${NX.state.volume}">
                </div>
            </div>
        `;

        panel.querySelector('#qs-wifi').onclick = (e) => {
            NX.state.wifi = !NX.state.wifi;
            NX.saveState();
            e.currentTarget.classList.toggle('on', NX.state.wifi);
        };

        panel.querySelector('#qs-bt').onclick = (e) => {
            NX.state.bt = !NX.state.bt;
            NX.saveState();
            e.currentTarget.classList.toggle('on', NX.state.bt);
        };

        panel.querySelector('#qs-theme').onclick = () => {
            NX.state.theme = NX.state.theme === 'dark' ? 'light' : 'dark';
            document.body.className = NX.state.theme + '-theme';
            NX.saveState();
            this.render();
        };

        panel.querySelector('#qs-settings').onclick = () => {
            panel.classList.remove('open');
            NX.openApp('settings');
        };

        panel.querySelector('#qs-brightness').oninput = (e) => {
            NX.state.brightness = e.target.value;
            NX.$('#desktop').style.filter = `brightness(${e.target.value}%)`;
            NX.saveState();
        };

        panel.querySelector('#qs-volume').oninput = (e) => {
            NX.state.volume = e.target.value;
            NX.saveState();
        };
    },

    toggle() {
        const panel = NX.$('#quick-settings-panel');
        if (!panel) return;
        
        if (panel.classList.contains('open')) {
            panel.classList.remove('open');
        } else {
            this.render();
            panel.classList.add('open');
        }
    }
};

// --- 5. КАЛЕНДАРЬ ---
NX.calendar = {
    currentDate: new Date(),

    render() {
        const popup = NX.$('#calendar-popup');
        if (!popup) return;
        
        const date = this.currentDate;
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const firstDay = new Date(year, month, 1);
        let startDay = firstDay.getDay() - 1; // Пн = 0
        if (startDay < 0) startDay = 6;
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevDays = new Date(year, month, 0).getDate();
        const today = new Date();

        let html = `
            <div class="cal-header">
                <span>${months[month]} ${year}</span>
            </div>
            <div class="cal-grid">
                <div class="cal-dow">Пн</div>
                <div class="cal-dow">Вт</div>
                <div class="cal-dow">Ср</div>
                <div class="cal-dow">Чт</div>
                <div class="cal-dow">Пт</div>
                <div class="cal-dow">Сб</div>
                <div class="cal-dow">Вс</div>
        `;

        const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
        
        for (let i = 0; i < totalCells; i++) {
            let dayNum, isOther = false;
            
            if (i < startDay) {
                dayNum = prevDays - startDay + i + 1;
                isOther = true;
            } else if (i >= startDay + daysInMonth) {
                dayNum = i - startDay - daysInMonth + 1;
                isOther = true;
            } else {
                dayNum = i - startDay + 1;
            }
            
            const isToday = !isOther && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            
            html += `<div class="cal-day ${isOther ? 'other' : ''} ${isToday ? 'today' : ''}">${dayNum}</div>`;
        }

        html += `</div>`;
        popup.innerHTML = html;
    },

    toggle() {
        const popup = NX.$('#calendar-popup');
        if (!popup) return;
        
        if (popup.classList.contains('open')) {
            popup.classList.remove('open');
        } else {
            this.currentDate = new Date();
            this.render();
            popup.classList.add('open');
        }
    }
};

// --- 6. TASK VIEW ---
NX.taskView = {
    open() {
        const overlay = NX.$('#task-view-overlay');
        if (!overlay) return;
        
        let html = '';
        NX.windows.list.forEach(rec => {
            const app = NX.apps[rec.appId];
            if (!app) return;
            
            html += `
                <div class="tv-card" data-id="${rec.id}">
                    <div class="tv-header">
                        <span style="color:var(--accent)">${app.icon}</span>
                        <span>${NX.esc(app.name)}</span>
                    </div>
                    <div class="tv-preview">
                        ${app.icon}
                    </div>
                </div>
            `;
        });

        if (html === '') {
            html = '<div style="color: #fff; text-align: center; grid-column: 1/-1; font-size: 20px;">Нет открытых окон</div>';
        }

        overlay.innerHTML = `<div class="tv-grid">${html}</div>`;
        overlay.classList.add('open');

        overlay.querySelectorAll('.tv-card').forEach(el => {
            el.onclick = () => {
                const win = NX.windows.list.find(w => w.id === el.dataset.id);
                if (win) {
                    if (win.minimized) NX.restoreWindow(win);
                    NX.focusWindow(win);
                }
                overlay.classList.remove('open');
            };
        });

        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        };
    }
};

// --- 7. ЧАСЫ И СИСТЕМНЫЙ ТРЕЙ ---
NX.updateClock = () => {
    const d = new Date();
    const timeEl = NX.$('#clock-time');
    const dateEl = NX.$('#clock-date');
    
    if (timeEl) timeEl.textContent = NX.pad(d.getHours()) + ':' + NX.pad(d.getMinutes());
    if (dateEl) dateEl.textContent = NX.pad(d.getDate()) + '.' + NX.pad(d.getMonth() + 1) + '.' + d.getFullYear();
};

// --- 8. ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ ---
NX.initSystem = () => {
    // Часы
    setInterval(NX.updateClock, 1000);
    NX.updateClock();

    // Установка иконок
    const iconsToSet = {
        '#start-btn': NX.icons.logo,
        '#search-btn': NX.icons.search,
        '#tray-notifications': NX.icons.bell,
        '#tray-quick-settings': NX.icons.wifi,
        '#lock-reboot-btn': NX.icons.reboot,
        '#lock-shutdown-btn': NX.icons.power
    };
    
    Object.entries(iconsToSet).forEach(([sel, icon]) => {
        const el = NX.$(sel);
        if (el) el.innerHTML = icon;
    });

    // Обработчики кнопок
    NX.$('#start-btn').onclick = (e) => { e.stopPropagation(); NX.startMenu.toggle(); };
    NX.$('#search-btn').onclick = (e) => { e.stopPropagation(); NX.spotlight.open(); };
    
    NX.$('#tray-notifications').onclick = (e) => {
        e.stopPropagation();
        const center = NX.$('#notification-center');
        if (center.classList.contains('open')) {
            center.classList.remove('open');
        } else {
            NX.notifications.renderCenter();
            center.classList.add('open');
        }
    };

    NX.$('#tray-quick-settings').onclick = (e) => {
        e.stopPropagation();
        NX.quickSettings.toggle();
    };

    NX.$('#tray-clock').onclick = (e) => {
        e.stopPropagation();
        NX.calendar.toggle();
    };

    const showDesktopBtn = NX.$('#tray-show-desktop');
    if (showDesktopBtn) {
        showDesktopBtn.onclick = () => {
            NX.windows.list.forEach(w => NX.minimizeWindow(w));
        };
    }

    // Экран блокировки
    NX.$('#lock-btn').onclick = () => NX.boot.unlock();
    NX.$('#lock-pin').onkeydown = (e) => {
        if (e.key === 'Enter') NX.boot.unlock();
    };

    NX.$('#lock-reboot-btn').onclick = () => NX.boot.reboot();
    NX.$('#lock-shutdown-btn').onclick = () => NX.boot.shutdown();

    // ===== ГЛОБАЛЬНЫЕ ГОРЯЧИЕ КЛАВИШИ =====
    document.addEventListener('keydown', (e) => {
        // Win key (Мета) — меню Пуск
        if (e.key === 'Meta') {
            e.preventDefault();
            NX.startMenu.toggle();
        }

        // Win + L — блокировка
        if (e.metaKey && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            NX.boot.lock();
        }

        // Win + V — буфер обмена
        if (e.metaKey && e.key.toLowerCase() === 'v') {
            e.preventDefault();
            NX.clipboard.renderPanel();
            NX.$('#clipboard-panel').classList.add('open');
        }

        // Win + D — свернуть все окна
        if (e.metaKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            NX.windows.list.forEach(w => NX.minimizeWindow(w));
        }

        // Ctrl + Space — Spotlight
        if (e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            NX.spotlight.open();
        }

        // Ctrl + Shift + Esc — Диспетчер задач
        if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
            e.preventDefault();
            NX.openApp('taskmgr');
        }

        // Ctrl + Shift + A — Алевтина
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            NX.openApp('assistant');
        }

        // Alt + Tab — Task View
        if (e.altKey && e.key === 'Tab') {
            e.preventDefault();
            NX.taskView.open();
        }

        // Ctrl + W — Закрыть активное окно
        if (e.ctrlKey && e.key.toLowerCase() === 'w' && NX.windows.focused) {
            e.preventDefault();
            NX.closeWindow(NX.windows.focused);
        }

        // Escape — закрытие оверлеев
        if (e.key === 'Escape') {
            NX.spotlight.close();
            NX.$('#task-view-overlay').classList.remove('open');
            NX.$('#context-menu').classList.remove('open');
            NX.$('#clipboard-panel').classList.remove('open');
        }
    });

    // Восстановление темы
    document.body.className = (NX.state.theme || 'light') + '-theme';
    
    // Старт загрузки
    NX.boot.start();
};

// Запуск системы после загрузки DOM
document.addEventListener('DOMContentLoaded', NX.initSystem);
