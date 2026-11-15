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
            { text: 'Проверка оборудования...', delay: 400, prog: 15 },
            { text: 'Инициализация батареи...', delay: 300, prog: 25 },
            { text: 'Загрузка ядра Nextel...', delay: 500, prog: 40 },
            { text: 'Запуск живых обоев...', delay: 400, prog: 55 },
            { text: 'Инициализация драйверов...', delay: 500, prog: 70 },
            { text: 'Запуск оболочки...', delay: 400, prog: 90 },
            { text: 'Готово', delay: 300, prog: 100 }
        ];

        let currentStep = 0;
        
        const nextStep = () => {
            if (currentStep >= steps.length) {
                setTimeout(() => this.showLogin(), 400);
                return;
            }
            
            const step = steps[currentStep];
            stage.textContent = step.text;
            progress.style.width = step.prog + '%';
            
            currentStep++;
            setTimeout(nextStep, step.delay);
        };

        setTimeout(() => {
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
            
            // ОБНОВЛЕНО: настраиваем новый лок-скрин с большой стрелкой
            this.setupLockScreen();
            
            this.updateLockTime();
            setInterval(() => this.updateLockTime(), 1000);
            
            // Фокус на кнопку входа
            const enterBtn = NX.$('.lock-enter-btn');
            if (enterBtn) enterBtn.focus();
        }, 600);
    },

    // НОВЫЙ: настройка лок-скрина
    setupLockScreen() {
        const lockUser = NX.$('.lock-user');
        if (!lockUser) return;
        
        // Убираем всё лишнее и оставляем только стрелку
        lockUser.innerHTML = `
            <div class="lock-hint">Нажмите для входа в систему</div>
            <button class="lock-enter-btn" id="lock-enter-btn" title="Войти">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
            </button>
        `;
        
        const btn = NX.$('#lock-enter-btn');
        if (btn) {
            btn.onclick = () => this.unlock();
            // Enter тоже работает
            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.unlock();
                    document.removeEventListener('keydown', keyHandler);
                }
            };
            document.addEventListener('keydown', keyHandler);
        }
    },

    updateLockTime() {
        const d = new Date();
        const timeEl = NX.$('#lock-time');
        const dateEl = NX.$('#lock-date');
        
        if (timeEl) timeEl.textContent = NX.pad(d.getHours()) + ':' + NX.pad(d.getMinutes());
        if (dateEl) dateEl.textContent = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    },

    // ОБНОВЛЕНО: красивый вход с анимацией
    unlock() {
        const lockScreen = NX.$('#lock-screen');
        if (!lockScreen) return;
        
        NX.audio.unlock();
        NX.audio.open();

        // Анимация: scale + fade + blur
        lockScreen.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        lockScreen.style.opacity = '0';
        lockScreen.style.transform = 'scale(1.15)';
        lockScreen.style.filter = 'blur(20px)';
        
        setTimeout(() => {
            lockScreen.classList.remove('active');
            lockScreen.style.opacity = '';
            lockScreen.style.transform = '';
            lockScreen.style.filter = '';
            lockScreen.style.transition = '';
            
            // Инициализация рабочего стола
            NX.initUI();
            
            // Восстанавливаем сессию
            setTimeout(() => {
                if (NX.state.session && NX.state.session.length > 0) {
                    NX.restoreSession();
                }
            }, 300);
            
            NX.notifications.push('Nextel OS', 'Добро пожаловать!', 'check');
            
            // Проверка батареи
            if (NX.battery.supported && NX.battery.level < 20 && !NX.battery.charging) {
                setTimeout(() => {
                    NX.notifications.push('Батарея', `Низкий заряд: ${NX.battery.level}%. Подключите зарядное устройство.`, 'battery');
                }, 2000);
            }
            
        }, 700);
    },

    reboot() {
        const rebootScreen = NX.$('#reboot-screen');
        if (!rebootScreen) return;
        
        NX.saveSession();
        rebootScreen.classList.add('active');
        
        // Красивая анимация
        rebootScreen.style.opacity = '0';
        rebootScreen.style.transition = 'opacity 0.4s ease';
        setTimeout(() => { rebootScreen.style.opacity = '1'; }, 50);
        
        setTimeout(() => location.reload(), 2200);
    },

    shutdown() {
        const powerScreen = NX.$('#power-off-screen');
        if (!powerScreen) return;
        
        NX.saveSession();
        powerScreen.classList.add('active');
        
        powerScreen.style.opacity = '0';
        powerScreen.style.transition = 'opacity 0.4s ease';
        setTimeout(() => { powerScreen.style.opacity = '1'; }, 50);
        
        setTimeout(() => {
            document.body.innerHTML = '<div style="background:#000;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;color:#333;font-size:14px;">Система выключена</div>';
        }, 2500);
    },

    lock() {
        const lockScreen = NX.$('#lock-screen');
        if (!lockScreen) return;
        
        lockScreen.classList.add('active');
        this.setupLockScreen();
        this.updateLockTime();
    }
};

// --- 2. МЕНЮ ПУСК (ОБНОВЛЕНО: увеличенные кнопки питания) ---
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
            <div class="sm-header">Все приложения (${apps.length})</div>
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

        // ОБНОВЛЕНО: увеличенные кнопки
        html += `
            </div>
            <div class="sm-footer">
                <button class="power-big-btn" id="sm-lock">${NX.icons.lock} Блокировка</button>
                <button class="power-big-btn danger" id="sm-power">${NX.icons.power} Выключение</button>
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
        NX.showContextMenu(window.innerWidth / 2 - 120, window.innerHeight / 2 - 80, [
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
            // Показать подсказки
            results.innerHTML = `
                <div class="sp-result" data-action="assistant">
                    <span style="color:var(--accent)">${NX.icons.assistant}</span>
                    <div class="sp-title">Спросить Алевтину</div>
                    <div class="sp-cat">Ассистент</div>
                </div>
                <div class="sp-result" data-action="settings">
                    <span style="color:var(--accent)">${NX.icons.device}</span>
                    <div class="sp-title">Настройки системы</div>
                    <div class="sp-cat">Система</div>
                </div>
                <div class="sp-result" data-action="clipboard">
                    <span style="color:var(--accent)">${NX.icons.clipboard}</span>
                    <div class="sp-title">Буфер обмена</div>
                    <div class="sp-cat">Утилита</div>
                </div>
            `;
            this.bindResults(results, []);
            return;
        }

        const q = query.toLowerCase();
        let html = '';
        const actions = [];

        // Алевтина
        if ('алевтина ассистент помощник ии alevtina'.includes(q) || q.includes('алевтин')) {
            html += `
                <div class="sp-result" data-action="assistant">
                    <span style="color:var(--accent)">${NX.icons.assistant}</span>
                    <div class="sp-title">Алевтина — голосовой ассистент</div>
                    <div class="sp-cat">Ассистент</div>
                </div>
            `;
            actions.push({ action: 'assistant' });
        }

        // Приложения
        const allApps = Object.values(NX.apps);
        const matchedApps = allApps.filter(app => 
            app.name.toLowerCase().includes(q) || (app.id && app.id.toLowerCase().includes(q))
        ).slice(0, 8);

        matchedApps.forEach(app => {
            const isInstalled = NX.state.installed.includes(app.id);
            html += `
                <div class="sp-result" data-action="app" data-id="${app.id}">
                    <span style="color:${app.color || 'var(--accent)'}">${app.icon}</span>
                    <div class="sp-title">${NX.esc(app.name)}</div>
                    <div class="sp-cat">${isInstalled ? 'Приложение' : 'Установить'}</div>
                </div>
            `;
            actions.push({ action: 'app', id: app.id });
        });

        // Системные команды
        if ('выключение перезагрузка блокировка сон power'.includes(q)) {
            html += `
                <div class="sp-result" data-action="power">
                    <span style="color:var(--accent)">${NX.icons.power}</span>
                    <div class="sp-title">Управление питанием</div>
                    <div class="sp-cat">Система</div>
                </div>
            `;
        }

        if ('настройки параметры система settings'.includes(q)) {
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

        if ('батарея заряд аккумулятор battery'.includes(q)) {
            const bat = NX.battery;
            html += `
                <div class="sp-result" data-action="battery">
                    <span style="color:${bat.level < 20 ? 'var(--danger)' : 'var(--success)'}">${NX.icons.battery}</span>
                    <div class="sp-title">Батарея: ${bat.supported ? bat.level + '%' : 'Недоступно'}</div>
                    <div class="sp-cat">${bat.charging ? 'Заряжается' : 'Система'}</div>
                </div>
            `;
        }

        results.innerHTML = html || `<div style="padding: 20px; text-align: center; color: var(--text-muted);">Ничего не найдено</div>`;
        this.bindResults(results, matchedApps);
    },

    bindResults(results, apps) {
        results.querySelectorAll('.sp-result').forEach((el, i) => {
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
                } else if (action === 'assistant') {
                    this.close();
                    NX.openApp('assistant');
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
                } else if (action === 'battery') {
                    this.close();
                    NX.notifications.push('Батарея', 
                        NX.battery.supported 
                            ? `Заряд: ${NX.battery.level}%${NX.battery.charging ? ' (заряжается)' : ''}` 
                            : 'Информация о батарее недоступна', 
                        'battery');
                }
            };
        });
    }
};

// --- 4. БЫСТРЫЕ НАСТРОЙКИ (С БАТАРЕЕЙ) ---
NX.quickSettings = {
    render() {
        const panel = NX.$('#quick-settings-panel');
        if (!panel) return;
        
        const isDark = NX.state.theme === 'dark';
        const wifiOn = NX.state.wifi;
        const btOn = NX.state.bt;
        const liveWall = NX.state.liveWallpaper || 'none';
        const bat = NX.battery;

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
                <div class="qs-tile ${liveWall !== 'none' ? 'on' : ''}" id="qs-wallpaper">
                    ${NX.icons.star || NX.icons.sun}
                    <span>Живые обои</span>
                </div>
                <div class="qs-tile" id="qs-battery" style="grid-column: 1 / -1; cursor: default;">
                    ${NX.icons.battery}
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span>Батарея</span>
                        <span style="font-weight:700;color:${bat.level < 20 ? 'var(--danger)' : 'inherit'};">${bat.supported ? bat.level + '%' : '—'}</span>
                    </div>
                    ${bat.charging ? '<div style="font-size:10px;opacity:0.7;">⚡ Заряжается</div>' : ''}
                </div>
                <div class="qs-tile" id="qs-settings" style="grid-column: 1 / -1;">
                    ${NX.icons.device}
                    <span>Все настройки</span>
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

        panel.querySelector('#qs-wallpaper').onclick = () => {
            // Циклически переключаем живые обои
            const types = ['none', 'snow', 'rain', 'stars', 'aurora', 'bubbles'];
            const idx = types.indexOf(NX.state.liveWallpaper || 'none');
            const next = types[(idx + 1) % types.length];
            NX.liveWallpaper.set(next);
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
        let startDay = firstDay.getDay() - 1;
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
            html = '<div style="color: #fff; text-align: center; grid-column: 1/-1; font-size: 20px; padding: 40px;">Нет открытых окон</div>';
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

// --- 7. ЧАСЫ ---
NX.updateClock = () => {
    const d = new Date();
    const timeEl = NX.$('#clock-time');
    const dateEl = NX.$('#clock-date');
    
    if (timeEl) timeEl.textContent = NX.pad(d.getHours()) + ':' + NX.pad(d.getMinutes());
    if (dateEl) dateEl.textContent = NX.pad(d.getDate()) + '.' + NX.pad(d.getMonth() + 1) + '.' + d.getFullYear();
};

// --- 8. ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ ---
NX.initSystem = () => {
    setInterval(NX.updateClock, 1000);
    NX.updateClock();

    const iconsToSet = {
        '#start-btn': NX.icons.logo,
        '#search-btn': NX.icons.search,
        '#tray-notifications': NX.icons.bell,
        '#tray-quick-settings': NX.icons.wifi
    };
    
    Object.entries(iconsToSet).forEach(([sel, icon]) => {
        const el = NX.$(sel);
        if (el) el.innerHTML = icon;
    });

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

    // ===== ГОРЯЧИЕ КЛАВИШИ =====
    document.addEventListener('keydown', (e) => {
        // Win — меню Пуск
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

        // Win + D — рабочий стол
        if (e.metaKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            NX.windows.list.forEach(w => NX.minimizeWindow(w));
        }

        // Win + A — Алевтина
        if (e.metaKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            NX.openApp('assistant');
        }

        // Win + W — сменить живые обои
        if (e.metaKey && e.key.toLowerCase() === 'w') {
            e.preventDefault();
            const types = ['none', 'snow', 'rain', 'stars', 'aurora', 'bubbles'];
            const idx = types.indexOf(NX.state.liveWallpaper || 'none');
            const next = types[(idx + 1) % types.length];
            NX.liveWallpaper.set(next);
            NX.notifications.push('Обои', `Тип: ${next === 'none' ? 'статические' : next}`, 'star');
        }

        // Win + B — информация о батарее
        if (e.metaKey && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            if (NX.battery.supported) {
                NX.notifications.push('Батарея', `${NX.battery.level}%${NX.battery.charging ? ' (заряжается)' : ''}`, 'battery');
            } else {
                NX.notifications.push('Батарея', 'Информация недоступна', 'battery');
            }
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

        // Alt + Tab — Task View
        if (e.altKey && e.key === 'Tab') {
            e.preventDefault();
            NX.taskView.open();
        }

        // Ctrl + W — закрыть окно
        if (e.ctrlKey && e.key.toLowerCase() === 'w' && NX.windows.focused) {
            e.preventDefault();
            NX.closeWindow(NX.windows.focused);
        }

        // Escape — закрыть оверлеи
        if (e.key === 'Escape') {
            NX.spotlight.close();
            NX.$('#task-view-overlay').classList.remove('open');
            NX.$('#context-menu').classList.remove('open');
            NX.$('#clipboard-panel').classList.remove('open');
            NX.$('#start-menu').classList.remove('open');
        }
    });

    // Восстановление темы
    document.body.className = (NX.state.theme || 'light') + '-theme';
    
    // Инициализация живых обоев
    NX.liveWallpaper.init();
    
    // Старт загрузки
    NX.boot.start();
};

document.addEventListener('DOMContentLoaded', NX.initSystem);
