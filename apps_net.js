/* ============================================================
   NEXTEL OS 2.0 — СЕТЕВЫЕ ПРИЛОЖЕНИЯ (APPS_NET.JS) v2.0
   Браузер (вкладки) · Погода (API) · Почта · NMarket (с сохранением позиции)
   ============================================================ */

// ---------- 1. БРАУЗЕР ----------
NX.registerApp({
    id: 'browser', name: 'Браузер', icon: NX.icons.browser, color: '#2b8a5f',
    category: 'Программы', description: 'Браузер с вкладками.', w: 950, h: 650,
    render(body, ctx) {
        let tabs = [
            { id: 1, title: 'Википедия', url: 'https://ru.m.wikipedia.org/wiki/Заглавная_страница', history: ['https://ru.m.wikipedia.org/wiki/Заглавная_страница'], hIndex: 0 },
            { id: 2, title: 'OpenStreetMap', url: 'https://www.openstreetmap.org/export/embed.html?bbox=37.5,55.7,37.7,55.8&layer=mapnik', history: ['https://www.openstreetmap.org/export/embed.html?bbox=37.5,55.7,37.7,55.8&layer=mapnik'], hIndex: 0 },
            { id: 3, title: 'DuckDuckGo', url: 'https://html.duckduckgo.com/html/?q=Nextel+OS', history: ['https://html.duckduckgo.com/html/?q=Nextel+OS'], hIndex: 0 },
            { id: 4, title: 'Example', url: 'https://example.com', history: ['https://example.com'], hIndex: 0 },
            { id: 5, title: 'W3Schools', url: 'https://www.w3schools.com', history: ['https://www.w3schools.com'], hIndex: 0 }
        ];
        let activeTabId = 1;
        let tabSeq = 6;

        const render = () => {
            const activeTab = tabs.find(t => t.id === activeTabId);
            if (!activeTab) return;
            
            let tabsHtml = tabs.map(t => `
                <div class="browser-tab ${t.id === activeTabId ? 'active' : ''}" data-id="${t.id}">
                    <span>${NX.esc(t.title)}</span>
                    <div class="close-tab" data-close="${t.id}">${NX.icons.close}</div>
                </div>
            `).join('');

            body.innerHTML = `
                <div class="browser-app">
                    <div class="browser-tabs">
                        ${tabsHtml}
                        <div class="browser-tab" id="add-tab" style="min-width:40px;max-width:40px;justify-content:center;cursor:pointer;border-bottom:none;padding:8px;">+</div>
                    </div>
                    <div class="browser-toolbar">
                        <button class="btn ghost" id="br-back" style="padding:0 8px;" ${activeTab.hIndex <= 0 ? 'disabled' : ''}>${NX.icons.chevL}</button>
                        <button class="btn ghost" id="br-fwd" style="padding:0 8px;" ${activeTab.hIndex >= activeTab.history.length - 1 ? 'disabled' : ''}>${NX.icons.chevR}</button>
                        <button class="btn ghost" id="br-reload" style="padding:0 8px;">${NX.icons.refresh}</button>
                        <input type="text" class="browser-url" id="br-url" value="${NX.esc(activeTab.url)}" spellcheck="false">
                        <button class="btn ghost" id="br-go" style="padding:0 8px;">${NX.icons.chevR}</button>
                    </div>
                    <iframe class="browser-frame" id="br-frame" src="${activeTab.url}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
                </div>
            `;

            NX.$$('.browser-tab', body).forEach(tab => {
                if (tab.id === 'add-tab') {
                    tab.onclick = () => {
                        const newId = tabSeq++;
                        tabs.push({ id: newId, title: 'Новая вкладка', url: 'https://example.com', history: ['https://example.com'], hIndex: 0 });
                        activeTabId = newId;
                        render();
                    };
                    return;
                }
                tab.onclick = (e) => {
                    if (e.target.closest('.close-tab')) return;
                    activeTabId = parseInt(tab.dataset.id);
                    render();
                };
                const closeBtn = tab.querySelector('.close-tab');
                if (closeBtn) {
                    closeBtn.onclick = (e) => {
                        e.stopPropagation();
                        const id = parseInt(closeBtn.dataset.close);
                        if (tabs.length === 1) return;
                        tabs = tabs.filter(t => t.id !== id);
                        if (activeTabId === id) activeTabId = tabs[0].id;
                        render();
                    };
                }
            });

            const urlInput = NX.$('#br-url', body);
            urlInput.onkeydown = (e) => { if (e.key === 'Enter') navigate(urlInput.value); };
            NX.$('#br-go', body).onclick = () => navigate(urlInput.value);
            NX.$('#br-reload', body).onclick = () => {
                const frame = NX.$('#br-frame', body);
                if (frame) frame.src = frame.src;
            };
            NX.$('#br-back', body).onclick = () => {
                if (activeTab.hIndex > 0) {
                    activeTab.hIndex--;
                    activeTab.url = activeTab.history[activeTab.hIndex];
                    render();
                }
            };
            NX.$('#br-fwd', body).onclick = () => {
                if (activeTab.hIndex < activeTab.history.length - 1) {
                    activeTab.hIndex++;
                    activeTab.url = activeTab.history[activeTab.hIndex];
                    render();
                }
            };
        };

        const navigate = (url) => {
            if (!url) return;
            const activeTab = tabs.find(t => t.id === activeTabId);
            if (!activeTab) return;
            let finalUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('nextel://')) {
                if (url.includes('.') && !url.includes(' ')) finalUrl = 'https://' + url;
                else finalUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(url);
            }
            activeTab.url = finalUrl;
            activeTab.title = finalUrl.replace(/^https?:\/\//, '').split('/')[0];
            activeTab.history = activeTab.history.slice(0, activeTab.hIndex + 1);
            activeTab.history.push(finalUrl);
            activeTab.hIndex = activeTab.history.length - 1;
            render();
        };
        render();
    }
});

// ---------- 2. ПОГОДА ----------
NX.registerApp({
    id: 'weather', name: 'Погода', icon: NX.icons.weather, color: '#34aadc',
    category: 'Утилиты', description: 'Прогноз погоды через open-meteo.com.', w: 600, h: 650, single: true,
    render(body) {
        const cities = {
            'Москва': [55.75, 37.62], 'Санкт-Петербург': [59.94, 30.31],
            'Казань': [55.79, 49.12], 'Новосибирск': [55.03, 82.92],
            'Екатеринбург': [56.84, 60.61], 'Сочи': [43.60, 39.73],
            'Владивосток': [43.12, 131.89], 'Калининград': [54.71, 20.51]
        };
        let currentCity = NX.state.weatherCity || 'Москва';

        body.innerHTML = `<div class="weather-app" id="weather-container"><div style="display:flex;justify-content:center;align-items:center;height:100%;font-size:18px;opacity:0.8;">Загрузка данных...</div></div>`;

        const icon = (code) => {
            if (code === 0 || code === 1) return NX.icons.sun;
            return NX.icons.weather;
        };
        const text = (code) => {
            if (code === 0) return 'Ясно';
            if (code === 1) return 'Малооблачно';
            if (code === 2) return 'Переменная облачность';
            if (code === 3) return 'Облачно';
            if (code < 50) return 'Туман';
            if (code < 70) return 'Дождь';
            if (code < 80) return 'Снег';
            return 'Гроза';
        };

        const load = async () => {
            const [lat, lon] = cities[currentCity];
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error('Network');
                render(await res.json());
            } catch (e) {
                const c = NX.$('#weather-container', body);
                if (c) c.innerHTML = `
                    <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;padding:40px;text-align:center;">
                        <div style="font-size:48px;margin-bottom:20px;">⚠️</div>
                        <div style="font-size:18px;margin-bottom:8px;">Не удалось загрузить погоду</div>
                        <div style="font-size:13px;opacity:0.7;margin-bottom:20px;">Проверьте подключение</div>
                        <button class="btn" id="wr" style="background:rgba(255,255,255,0.2);color:#fff;">Повторить</button>
                    </div>`;
                const r = NX.$('#wr', c); if (r) r.onclick = load;
            }
        };

        const render = (data) => {
            const cur = data.current;
            const container = NX.$('#weather-container', body);
            if (!container) return;
            
            const hoursHtml = Array.from({ length: 8 }, (_, i) => {
                const t = data.hourly.time[i].slice(11, 16);
                const temp = Math.round(data.hourly.temperature_2m[i]);
                const code = data.hourly.weather_code[i];
                return `<div class="weather-hour"><div>${t}</div>${icon(code)}<div class="h-temp">${temp > 0 ? '+' : ''}${temp}°</div></div>`;
            }).join('');

            const dayNames = ['Сегодня', 'Завтра', 'Ср', 'Чт', 'Пт'];
            const daysHtml = Array.from({ length: 5 }, (_, i) => {
                const max = Math.round(data.daily.temperature_2m_max[i]);
                const min = Math.round(data.daily.temperature_2m_min[i]);
                const code = data.daily.weather_code[i];
                return `<div class="weather-day">
                    <div class="d-name">${dayNames[i]}</div>${icon(code)}
                    <div style="width:40px;text-align:right;">${min > 0 ? '+' : ''}${min}°</div>
                    <div class="d-bar"><i style="left:20%;width:60%;"></i></div>
                    <div class="d-temp" style="width:40px;text-align:left;">${max > 0 ? '+' : ''}${max}°</div>
                </div>`;
            }).join('');

            container.innerHTML = `
                <div class="weather-header">
                    <div>
                        <div class="weather-city">${currentCity}</div>
                        <div class="weather-temp">${Math.round(cur.temperature_2m)}°</div>
                        <div class="weather-cond">${text(cur.weather_code)} · ощущается как ${Math.round(cur.apparent_temperature)}°</div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;">
                        <select id="weather-city-select" style="background:rgba(255,255,255,0.2);border:none;color:#fff;padding:6px 10px;border-radius:8px;outline:none;font-size:13px;">
                            ${Object.keys(cities).map(c => `<option value="${c}" ${c === currentCity ? 'selected' : ''} style="color:#000;">${c}</option>`).join('')}
                        </select>
                        <div class="weather-icon-large" style="margin-top:12px;">${icon(cur.weather_code)}</div>
                    </div>
                </div>
                <div class="weather-hourly">${hoursHtml}</div>
                <div class="weather-daily">${daysHtml}</div>
                <div style="padding:20px 30px;display:flex;justify-content:space-between;font-size:12px;opacity:0.8;background:rgba(0,0,0,0.1);">
                    <div>Влажность: ${cur.relative_humidity_2m}%</div>
                    <div>Ветер: ${cur.wind_speed_10m} км/ч</div>
                </div>`;

            const sel = NX.$('#weather-city-select', container);
            if (sel) sel.onchange = (e) => {
                currentCity = e.target.value;
                NX.state.weatherCity = currentCity;
                NX.saveState();
                load();
            };
        };
        load();
    }
});

// ---------- 3. ПОЧТА ----------
NX.registerApp({
    id: 'mail', name: 'Почта', icon: NX.icons.wart, color: '#0a84ff',
    category: 'Программы', description: 'Почтовый клиент.', w: 850, h: 600, single: true,
    render(body) {
        const inbox = [
            { id: 1, from: 'Nextel Team', subject: 'Добро пожаловать в Nextel OS 2.0', preview: 'Спасибо, что выбрали нашу систему...', body: 'Здравствуйте!\n\nСпасибо, что выбрали Nextel OS 2.0.\n\nС уважением, команда Nextel', date: '10:24', read: false },
            { id: 2, from: 'NMarket', subject: 'Новые приложения', preview: 'В магазине появились новые игры...', body: 'В NMarket появились новые игры и приложения.\n\nЗагляните в магазин.', date: '09:11', read: false },
            { id: 3, from: '365 Antivirus', subject: 'Отчет о безопасности', preview: 'За последние 7 дней проверено...', body: 'За последние 7 дней:\n- Проверено файлов: 12480\n- Найдено угроз: 0\n\nУстройство защищено.', date: 'Вчера', read: true },
            { id: 4, from: 'Nextel Support', subject: 'Обновление системы', preview: 'Доступна новая версия...', body: 'Доступна новая версия Nextel OS 2.0.\n\nУстановить можно через Настройки.', date: 'Вчера', read: true },
            { id: 5, from: 'Календарь', subject: 'Напоминание о встрече', preview: 'Сегодня в 15:00...', body: 'Напоминаем, что сегодня в 15:00 у вас встреча.', date: 'Пн', read: true }
        ];
        let currentFolder = 'inbox';

        const render = () => {
            const listHtml = currentFolder === 'inbox' 
                ? inbox.map(m => `
                    <div class="mail-item" data-id="${m.id}" style="padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;${!m.read ? 'background:var(--surface-2);' : ''}">
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                            <span style="font-weight:${!m.read ? '700' : '500'};font-size:13px;">${NX.esc(m.from)}</span>
                            <span style="font-size:11px;color:var(--text-muted);">${m.date}</span>
                        </div>
                        <div style="font-size:13px;font-weight:${!m.read ? '600' : '400'};margin-bottom:2px;">${NX.esc(m.subject)}</div>
                        <div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${NX.esc(m.preview)}</div>
                    </div>
                `).join('')
                : `<div class="np-empty" style="padding:40px;text-align:center;color:var(--text-muted);">В этой папке пока пусто</div>`;

            body.innerHTML = `
                <div style="display:flex;height:100%;">
                    <div style="width:200px;background:var(--surface-2);border-right:1px solid var(--border);padding:12px;flex:none;">
                        <button class="btn primary" id="mail-compose" style="width:100%;margin-bottom:16px;">Написать</button>
                        <div class="files-nav-item ${currentFolder === 'inbox' ? 'active' : ''}" data-folder="inbox">${NX.icons.folder} Входящие</div>
                        <div class="files-nav-item ${currentFolder === 'sent' ? 'active' : ''}" data-folder="sent">${NX.icons.fileTxt} Отправленные</div>
                        <div class="files-nav-item ${currentFolder === 'trash' ? 'active' : ''}" data-folder="trash">${NX.icons.trash} Корзина</div>
                    </div>
                    <div style="flex:1;display:flex;flex-direction:column;min-width:0;">
                        <div id="mail-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;">${listHtml}</div>
                        <div id="mail-reader" style="flex:1;display:none;flex-direction:column;padding:24px;overflow-y:auto;"></div>
                    </div>
                </div>`;

            NX.$$('.files-nav-item', body).forEach(el => el.onclick = () => { currentFolder = el.dataset.folder; render(); });
            NX.$('#mail-compose', body).onclick = () => NX.notifications.push('Почта', 'Редактор в разработке', 'info');

            NX.$$('.mail-item', body).forEach(el => {
                el.onclick = () => {
                    const id = parseInt(el.dataset.id);
                    const email = inbox.find(m => m.id === id);
                    if (!email) return;
                    email.read = true;
                    const list = NX.$('#mail-list', body);
                    const reader = NX.$('#mail-reader', body);
                    list.style.display = 'none';
                    reader.style.display = 'flex';
                    reader.innerHTML = `
                        <button class="btn ghost" id="mail-back" style="align-self:flex-start;margin-bottom:20px;">${NX.icons.chevL} Назад</button>
                        <h2 style="font-size:22px;font-weight:700;margin-bottom:12px;">${NX.esc(email.subject)}</h2>
                        <div style="font-size:13px;color:var(--text-muted);margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border);">От: <b>${NX.esc(email.from)}</b> · ${email.date}</div>
                        <div style="font-size:14px;line-height:1.7;white-space:pre-wrap;">${NX.esc(email.body)}</div>`;
                    NX.$('#mail-back', reader).onclick = () => { reader.style.display = 'none'; list.style.display = 'flex'; render(); };
                };
            });
        };
        render();
    }
});

// ---------- 4. NMARKET (С СОХРАНЕНИЕМ ПОЗИЦИИ) ----------
NX.registerApp({
    id: 'market', name: 'NMarket', icon: NX.icons.market, color: '#0a84ff',
    category: 'Система', description: 'Магазин приложений.', w: 950, h: 700, single: true,
    render(body) {
        // Сохраняем состояние между сессиями
        let currentCat = NX.state.marketCat || 'Все';
        let searchQuery = NX.state.marketSearch || '';
        let scrollPosition = NX.state.marketScroll || 0;

        const getDescription = (id) => {
            const descs = {
                calc: 'Простой и удобный калькулятор.', weather: 'Прогноз погоды с API.',
                wart: 'Текстовый редактор.', browser: 'Браузер с вкладками.',
                files: 'Файловый менеджер.', terminal: 'Командная строка.',
                settings: 'Настройки системы.', antivirus: 'Защита от вирусов.',
                trash: 'Корзина.', market: 'Магазин приложений.',
                notes: 'Заметки.', todo: 'Задачи.', point: 'Рисование.',
                powerpaint: 'Презентации.', music: 'Музыка.', clock: 'Часы.',
                calendar: 'Календарь.', snake: 'Классическая аркада.',
                g2048: 'Головоломка 2048.', mines: 'Сапёр.', ttt: 'Крестики-нолики.',
                memory: 'Тренировка памяти.', pong: 'Пинг-понг.', reaction: 'Скорость реакции.',
                guess: 'Угадай число.', tetris: 'Тетрис.', breakout: 'Арканоид.',
                puzzle15: 'Пятнашки.', sudoku: 'Судоку.', chess: 'Шахматы.',
                checkers: 'Шашки.', bubble: 'Bubble Shooter.', gallery: 'Галерея.',
                video: 'Видеоплеер.', recorder: 'Диктофон.', camera: 'Камера.',
                sheet: 'Таблица.', pdf: 'PDF-просмотрщик.', kanban: 'Kanban-доска.',
                pomodoro: 'Таймер Pomodoro.', messenger: 'Мессенджер.', contacts: 'Контакты.',
                passwords: 'Менеджер паролей.', converter: 'Конвертер единиц.',
                speedtest: 'Тест скорости.', clipboard: 'Буфер обмена.', taskmgr: 'Диспетчер задач.'
            };
            return descs[id] || 'Приложение Nextel OS.';
        };

        const getCatalog = () => {
            // Возвращаем ВСЕ зарегистрированные приложения, кроме системных
            return Object.values(NX.apps).filter(a => a.id !== 'settings' || true);
        };

        const saveScroll = () => {
            const grid = NX.$('#market-scroll', body);
            if (grid) {
                scrollPosition = grid.scrollTop;
                NX.state.marketScroll = scrollPosition;
            }
        };

        const restoreScroll = () => {
            const grid = NX.$('#market-scroll', body);
            if (grid) grid.scrollTop = scrollPosition;
        };

        const render = (preserveScroll = true) => {
            if (preserveScroll) saveScroll();
            
            const catalog = getCatalog();
            const filtered = catalog.filter(app => {
                const cat = app.category || 'Программы';
                const matchCat = currentCat === 'Все' || cat === currentCat;
                const matchSearch = !searchQuery 
                    || app.name.toLowerCase().includes(searchQuery.toLowerCase())
                    || getDescription(app.id).toLowerCase().includes(searchQuery.toLowerCase());
                return matchCat && matchSearch;
            });

            const gridHtml = filtered.length === 0
                ? '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Ничего не найдено</div>'
                : filtered.map(app => {
                    const isInstalled = NX.state.installed.includes(app.id);
                    return `
                        <div class="market-card" data-app-id="${app.id}">
                            <div class="app-icon" style="background:${app.color}22;color:${app.color};">${app.icon}</div>
                            <div>
                                <div class="app-name">${NX.esc(app.name)}</div>
                                <div class="app-meta">${app.category || 'Программы'} · ★ ${app.rating || '4.5'} · ${app.size || '3 МБ'}</div>
                            </div>
                            <div class="app-desc">${NX.esc(getDescription(app.id))}</div>
                            <div class="app-actions" data-actions-for="${app.id}">
                                ${isInstalled
                                    ? `<button class="btn" data-open="${app.id}">Открыть</button>
                                       <button class="btn ghost" data-remove="${app.id}" style="flex:0 0 auto;padding:0 12px;">${NX.icons.trash}</button>`
                                    : `<button class="btn primary" data-install="${app.id}">Установить</button>`}
                            </div>
                        </div>`;
                }).join('');

            body.innerHTML = `
                <div class="market-app">
                    <div class="market-header">
                        <div class="market-title">NMarket</div>
                        <div class="market-sub">Магазин приложений Nextel OS · ${catalog.length} приложений</div>
                    </div>
                    <div class="market-tabs">
                        ${['Все', 'Игры', 'Программы', 'Утилиты', 'Система', 'Ассистенты'].map(cat => `
                            <div class="market-tab ${currentCat === cat ? 'active' : ''}" data-cat="${cat}">${cat}</div>
                        `).join('')}
                        <input type="text" class="input" id="market-search" placeholder="Поиск..." style="margin-left:auto;width:200px;height:32px;" value="${NX.esc(searchQuery)}">
                    </div>
                    <div class="scroll" id="market-scroll">
                        <div class="market-grid">${gridHtml}</div>
                    </div>
                </div>`;

            // Восстанавливаем позицию
            restoreScroll();

            // Обработчики
            NX.$$('.market-tab', body).forEach(tab => {
                tab.onclick = () => {
                    currentCat = tab.dataset.cat;
                    NX.state.marketCat = currentCat;
                    scrollPosition = 0;
                    NX.state.marketScroll = 0;
                    NX.saveState();
                    render(false);
                };
            });

            const searchEl = NX.$('#market-search', body);
            if (searchEl) {
                searchEl.oninput = (e) => {
                    searchQuery = e.target.value;
                    NX.state.marketSearch = searchQuery;
                    scrollPosition = 0;
                    NX.saveState();
                    render(false);
                };
            }

            // Установка
            NX.$$('[data-install]', body).forEach(btn => {
                btn.onclick = () => {
                    const id = btn.dataset.install;
                    const app = NX.apps[id];
                    if (!app) return;
                    
                    // Сохраняем скролл перед установкой
                    saveScroll();
                    
                    NX.installApp(id);
                    
                    // Обновляем ТОЛЬКО карточку, без полного render
                    const actions = body.querySelector(`[data-actions-for="${id}"]`);
                    if (actions) {
                        actions.innerHTML = `
                            <button class="btn" data-open="${id}">Открыть</button>
                            <button class="btn ghost" data-remove="${id}" style="flex:0 0 auto;padding:0 12px;">${NX.icons.trash}</button>
                        `;
                        // Заново привязываем обработчики на этой карточке
                        actions.querySelector('[data-open]').onclick = () => NX.openApp(id);
                        actions.querySelector('[data-remove]').onclick = () => {
                            if (confirm(`Удалить «${app.name}»?`)) {
                                saveScroll();
                                NX.uninstallApp(id);
                                actions.innerHTML = `<button class="btn primary" data-install="${id}">Установить</button>`;
                                actions.querySelector('[data-install]').onclick = btn.onclick;
                                restoreScroll();
                            }
                        };
                    }
                    
                    // Восстанавливаем скролл
                    restoreScroll();
                };
            });

            // Открытие
            NX.$$('[data-open]', body).forEach(btn => {
                btn.onclick = () => NX.openApp(btn.dataset.open);
            });

            // Удаление
            NX.$$('[data-remove]', body).forEach(btn => {
                btn.onclick = () => {
                    const id = btn.dataset.remove;
                    const app = NX.apps[id];
                    if (!app) return;
                    if (confirm(`Удалить «${app.name}»?`)) {
                        saveScroll();
                        NX.uninstallApp(id);
                        const actions = body.querySelector(`[data-actions-for="${id}"]`);
                        if (actions) {
                            actions.innerHTML = `<button class="btn primary" data-install="${id}">Установить</button>`;
                            actions.querySelector('[data-install]').onclick = () => {
                                saveScroll();
                                NX.installApp(id);
                                actions.innerHTML = `
                                    <button class="btn" data-open="${id}">Открыть</button>
                                    <button class="btn ghost" data-remove="${id}" style="flex:0 0 auto;padding:0 12px;">${NX.icons.trash}</button>
                                `;
                                actions.querySelector('[data-open]').onclick = () => NX.openApp(id);
                                restoreScroll();
                            };
                        }
                        restoreScroll();
                    }
                };
            });
        };

        render(false);
    }
});

console.log('[NX-NET] ✅ Browser, Weather, Mail, NMarket — зарегистрированы');
