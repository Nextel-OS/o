/* ============================================================
   NEXTEL OS 2.0 — СИСТЕМНЫЕ УТИЛИТЫ И ДАННЫЕ
   ============================================================ */

// --- 1. ТЕРМИНАЛ ---
NX.registerApp({
    id: 'terminal',
    name: 'Терминал',
    icon: NX.icons.terminal,
    color: '#4a5568',
    w: 750, h: 500,
    render(body, ctx) {
        let history = [];
        let historyIndex = -1;
        let currentPath = []; // Текущая директория

        body.innerHTML = `
            <div class="terminal-app" id="term-container">
                <div id="term-output">
                    <div class="term-line">Nextel Terminal 2.0.0 (Nextel OS 2.0)</div>
                    <div class="term-line">Введите <span class="term-prompt">help</span> для списка команд.</div>
                    <div class="term-line">&nbsp;</div>
                </div>
                <div class="term-input-line">
                    <span class="term-prompt" id="term-path">user@nextel:~$</span>
                    <input type="text" class="term-input" id="term-input" autocomplete="off" spellcheck="false">
                </div>
            </div>
        `;

        const output = NX.$('#term-output', body);
        const input = NX.$('#term-input', body);
        const pathLabel = NX.$('#term-path', body);

        const updatePrompt = () => {
            const p = currentPath.length === 0 ? '~' : '~/' + currentPath.join('/');
            pathLabel.textContent = `user@nextel:${p}$`;
        };

        const print = (text, className = '') => {
            const div = document.createElement('div');
            div.className = 'term-line ' + className;
            div.innerHTML = text;
            output.appendChild(div);
            output.scrollTop = output.scrollHeight;
        };

        const commands = {
            'help': () => {
                print('<span class="term-info">Доступные команды:</span>');
                print('  help          - Показать этот список');
                print('  clear         - Очистить экран');
                print('  ls            - Список файлов в текущей директории');
                print('  pwd           - Показать текущий путь');
                print('  cd [папка]    - Перейти в папку (или .. для возврата)');
                print('  cat [файл]    - Показать содержимое текстового файла');
                print('  mkdir [имя]   - Создать папку');
                print('  touch [имя]   - Создать пустой файл');
                print('  rm [имя]      - Удалить файл или папку');
                print('  echo [текст]  - Вывести текст');
                print('  whoami        - Текущий пользователь');
                print('  date          - Текущая дата и время');
                print('  time          - Текущее время');
                print('  neofetch      - Информация о системе');
                print('  sysinfo       - Подробная информация о системе');
                print('  uname         - Ядро системы');
                print('  open [app]    - Запустить приложение (например, open calc)');
                print('  apps          - Список доступных приложений');
                print('  theme [dark/light] - Сменить тему');
                print('  history       - История команд');
                print('  reboot        - Перезагрузка');
                print('  shutdown      - Выключение');
                print('  exit          - Закрыть терминал');
            },
            'clear': () => { output.innerHTML = ''; },
            'ls': () => {
                const node = NX.fs.getNode(currentPath);
                if (!node || !node.children) return print('Ошибка чтения директории', 'term-error');
                if (node.children.length === 0) return print('(пусто)');
                node.children.forEach(c => {
                    if (c.type === 'folder') print(`<span class="term-info">${c.name}/</span>`);
                    else print(`  ${c.name}`);
                });
            },
            'pwd': () => { print('/' + currentPath.join('/')); },
            'cd': (args) => {
                if (!args[0] || args[0] === '~') { currentPath = []; updatePrompt(); return; }
                if (args[0] === '..') { currentPath.pop(); updatePrompt(); return; }
                const target = args[0];
                const node = NX.fs.getNode(currentPath);
                if (node && node.children) {
                    const folder = node.children.find(c => c.name === target && c.type === 'folder');
                    if (folder) { currentPath.push(target); updatePrompt(); }
                    else print(`Папка "${target}" не найдена`, 'term-error');
                }
            },
            'cat': (args) => {
                if (!args[0]) return print('Укажите файл', 'term-error');
                const node = NX.fs.getNode(currentPath);
                if (node && node.children) {
                    const file = node.children.find(c => c.name === args[0] && c.type === 'file');
                    if (file) print(NX.esc(file.content || '(пустой файл)'));
                    else print(`Файл "${args[0]}" не найден`, 'term-error');
                }
            },
            'mkdir': (args) => {
                if (!args[0]) return print('Укажите имя папки', 'term-error');
                const node = NX.fs.getNode(currentPath);
                if (node && node.children) {
                    if (node.children.find(c => c.name === args[0])) return print('Папка уже существует', 'term-error');
                    node.children.push({ name: args[0], type: 'folder', children: [] });
                    print(`Папка "${args[0]}" создана`);
                }
            },
            'touch': (args) => {
                if (!args[0]) return print('Укажите имя файла', 'term-error');
                const node = NX.fs.getNode(currentPath);
                if (node && node.children) {
                    if (node.children.find(c => c.name === args[0])) return print('Файл уже существует', 'term-error');
                    node.children.push({ name: args[0], type: 'file', content: '', kind: 'txt', date: new Date().toISOString() });
                    print(`Файл "${args[0]}" создан`);
                }
            },
            'rm': (args) => {
                if (!args[0]) return print('Укажите имя файла/папки', 'term-error');
                const node = NX.fs.getNode(currentPath);
                if (node && node.children) {
                    const idx = node.children.findIndex(c => c.name === args[0]);
                    if (idx !== -1) {
                        const item = node.children.splice(idx, 1)[0];
                        item.originalPath = currentPath.join('/') || 'Документы'; // fallback
                        NX.state.trash.push(item);
                        NX.saveState();
                        print(`Удалено: ${args[0]}`);
                    } else print(`Не найдено: ${args[0]}`, 'term-error');
                }
            },
            'echo': (args) => { print(NX.esc(args.join(' '))); },
            'whoami': () => print('user'),
            'date': () => print(new Date().toLocaleString('ru-RU')),
            'time': () => print(new Date().toLocaleTimeString('ru-RU')),
            'neofetch': () => {
                const info = [
                    '<span class="term-success">       /\\       </span>  <span class="term-info">user@nextel</span>',
                    '<span class="term-success">      /  \\      </span>  -----------------',
                    '<span class="term-success">     / /\\ \\     </span>  <span class="term-info">OS:</span> Nextel OS 2.0.0',
                    '<span class="term-success">    / /  \\ \\    </span>  <span class="term-info">Kernel:</span> Nextel Kernel 2.0',
                    '<span class="term-success">   / /    \\ \\   </span>  <span class="term-info">Shell:</span> Nextel UI',
                    '<span class="term-success">  /_/      \\_\\  </span>  <span class="term-info">Apps:</span> ' + NX.state.installed.length,
                    '                   <span class="term-info">Windows:</span> ' + NX.windows.list.length,
                    '                   <span class="term-info">Uptime:</span> ' + Math.floor(performance.now() / 60000) + ' mins'
                ];
                info.forEach(line => print(line));
            },
            'sysinfo': () => {
                print('<span class="term-info">Системная информация:</span>');
                print('  ОС: Nextel OS 2.0.0 (Build 2026)');
                print('  Процессор: Nextel N1 8-Core 3.2GHz');
                print('  Память: 16 GB LPDDR5');
                print('  Графика: Nextel Graphics 620');
                print('  Разрешение: ' + window.innerWidth + 'x' + window.innerHeight);
                print('  Установлено приложений: ' + NX.state.installed.length);
            },
            'uname': () => print('Nextel OS 2.0.0 x86_64 Nextel Kernel 2.0'),
            'open': (args) => {
                if (!args[0]) return print('Укажите ID приложения (например, open calc)', 'term-error');
                if (NX.apps[args[0]]) {
                    NX.openApp(args[0]);
                    print(`Запуск ${NX.apps[args[0]].name}...`);
                } else print(`Приложение "${args[0]}" не найдено`, 'term-error');
            },
            'apps': () => {
                print('<span class="term-info">Доступные приложения:</span>');
                Object.values(NX.apps).forEach(app => {
                    print(`  ${app.id.padEnd(12)} - ${app.name}`);
                });
            },
            'theme': (args) => {
                if (args[0] === 'dark' || args[0] === 'light') {
                    NX.state.theme = args[0];
                    document.body.className = args[0] + '-theme';
                    NX.saveState();
                    print(`Тема изменена на ${args[0]}`);
                } else print('Использование: theme dark | light', 'term-error');
            },
            'history': () => { history.forEach((cmd, i) => print(`  ${i + 1}  ${NX.esc(cmd)}`)); },
            'reboot': () => NX.boot.reboot(),
            'shutdown': () => NX.boot.shutdown(),
            'exit': () => NX.closeWindow(ctx.win)
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const rawCmd = input.value.trim();
                if (!rawCmd) {
                    print(`<span class="term-prompt">user@nextel:${currentPath.length === 0 ? '~' : '~/' + currentPath.join('/')}$</span> `);
                    input.value = '';
                    return;
                }

                if (history[history.length - 1] !== rawCmd) history.push(rawCmd);
                historyIndex = history.length;

                print(`<span class="term-prompt">user@nextel:${currentPath.length === 0 ? '~' : '~/' + currentPath.join('/')}$</span> ${NX.esc(rawCmd)}`);

                const parts = rawCmd.split(' ');
                const cmd = parts[0].toLowerCase();
                const args = parts.slice(1);

                if (commands[cmd]) commands[cmd](args);
                else print(`Команда не найдена: ${NX.esc(cmd)}. Введите help для списка команд.`, 'term-error');

                input.value = '';
                output.scrollTop = output.scrollHeight;
            }
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) { historyIndex--; input.value = history[historyIndex]; }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < history.length - 1) { historyIndex++; input.value = history[historyIndex]; }
                else { historyIndex = history.length; input.value = ''; }
            }
        });

        body.onclick = () => input.focus();
        updatePrompt();
        setTimeout(() => input.focus(), 100);
    }
});

// --- 2. ФАЙЛОВЫЙ МЕНЕДЖЕР ---
NX.registerApp({
    id: 'files',
    name: 'Файловый менеджер',
    icon: NX.icons.folder,
    color: '#f5a623',
    w: 800, h: 550, single: true,
    render(body, ctx) {
        let currentPath = [];
        let selectedFile = null;

        const render = () => {
            const node = NX.fs.getNode(currentPath);
            if (!node) { currentPath = []; return render(); }

            const pathStr = currentPath.length === 0 ? 'Этот компьютер' : 'Этот компьютер / ' + currentPath.join(' / ');
            
            let itemsHtml = '';
            if (node.children && node.children.length > 0) {
                const sorted = [...node.children].sort((a, b) => {
                    if (a.type === 'folder' && b.type !== 'folder') return -1;
                    if (a.type !== 'folder' && b.type === 'folder') return 1;
                    return a.name.localeCompare(b.name);
                });

                itemsHtml = sorted.map(item => {
                    const isFolder = item.type === 'folder';
                    let icon = NX.icons.folder;
                    if (!isFolder) {
                        if (item.kind === 'img') icon = NX.icons.fileImg;
                        else if (item.kind === 'ppt') icon = NX.icons.filePpt;
                        else icon = NX.icons.fileTxt;
                    }
                    return `
                        <div class="file-item ${selectedFile === item.name ? 'selected' : ''}" data-name="${NX.esc(item.name)}" data-type="${item.type}">
                            <span style="color:var(--accent)">${icon}</span>
                            <span>${NX.esc(item.name)}</span>
                        </div>
                    `;
                }).join('');
            } else {
                itemsHtml = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Папка пуста</div>';
            }

            body.innerHTML = `
                <div class="files-app">
                    <div class="files-sidebar">
                        <div class="files-nav-item ${currentPath.length === 0 ? 'active' : ''}" data-path="root">
                            ${NX.icons.device} Этот компьютер
                        </div>
                        ${NX.fs.root.children.map(c => `
                            <div class="files-nav-item ${currentPath[0] === c.name && currentPath.length === 1 ? 'active' : ''}" data-path="${NX.esc(c.name)}">
                                ${NX.icons.folder} ${NX.esc(c.name)}
                            </div>
                        `).join('')}
                    </div>
                    <div class="files-main">
                        <div class="toolbar" style="padding: 8px 16px;">
                            <button class="btn ghost" id="fm-back" ${currentPath.length === 0 ? 'disabled' : ''}>${NX.icons.chevL}</button>
                            <button class="btn ghost" id="fm-new-folder">${NX.icons.folder} Новая папка</button>
                            <button class="btn ghost" id="fm-delete" ${!selectedFile ? 'disabled' : ''}>${NX.icons.trash} Удалить</button>
                        </div>
                        <div class="files-path-bar">${pathStr}</div>
                        <div class="files-grid">
                            ${itemsHtml}
                        </div>
                        <div style="padding: 8px 16px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted);">
                            Элементов: ${node.children ? node.children.length : 0}
                        </div>
                    </div>
                </div>
            `;

            NX.$$('.files-nav-item', body).forEach(el => {
                el.onclick = () => {
                    if (el.dataset.path === 'root') currentPath = [];
                    else currentPath = [el.dataset.path];
                    selectedFile = null;
                    render();
                };
            });

            NX.$('#fm-back', body).onclick = () => {
                currentPath.pop();
                selectedFile = null;
                render();
            };

            NX.$$('.file-item', body).forEach(el => {
                el.onclick = () => { selectedFile = el.dataset.name; render(); };
                el.ondblclick = () => {
                    const name = el.dataset.name;
                    const type = el.dataset.type;
                    
                    if (type === 'folder') {
                        currentPath.push(name);
                        selectedFile = null;
                        render();
                    } else {
                        const file = node.children.find(c => c.name === name);
                        if (file.kind === 'txt') NX.openApp('wart', { content: file.content, name: file.name });
                        else if (file.kind === 'img') NX.openApp('point', { content: file.content, name: file.name });
                        else if (file.kind === 'ppt') NX.openApp('powerpaint', { content: file.content, name: file.name });
                        else NX.notifications.push('Файлы', 'Неизвестный формат файла', 'info');
                    }
                };
            });

            NX.$('#fm-new-folder', body).onclick = () => {
                const name = prompt('Имя новой папки:', 'Новая папка');
                if (name) { node.children.push({ name, type: 'folder', children: [] }); render(); }
            };

            NX.$('#fm-delete', body).onclick = () => {
                if (!selectedFile) return;
                const idx = node.children.findIndex(c => c.name === selectedFile);
                if (idx !== -1) {
                    const item = node.children.splice(idx, 1)[0];
                    item.originalPath = currentPath.join('/') || 'Документы';
                    NX.state.trash.push(item);
                    NX.saveState();
                    NX.notifications.push('Корзина', `Объект перемещен в корзину`, 'trash');
                    selectedFile = null;
                    render();
                }
            };
        };

        render();
    }
});

// --- 3. КОРЗИНА (ИСПРАВЛЕНО) ---
NX.registerApp({
    id: 'trash',
    name: 'Корзина',
    icon: NX.icons.trash,
    color: '#8e8e93',
    w: 700, h: 500, single: true,
    render(body) {
        const render = () => {
            const items = NX.state.trash;
            let itemsHtml = '';
            
            if (items.length > 0) {
                itemsHtml = items.map((item, index) => {
                    let icon = NX.icons.fileTxt;
                    if (item.type === 'folder') icon = NX.icons.folder;
                    else if (item.type === 'app') icon = NX.icons.device; // Иконка для приложения
                    else if (item.kind === 'img') icon = NX.icons.fileImg;
                    else if (item.kind === 'ppt') icon = NX.icons.filePpt;

                    // Определяем, приложение это или файл
                    const isApp = item.type === 'app';

                    return `
                        <div class="file-item" data-index="${index}">
                            <span style="color:var(--text-muted)">${icon}</span>
                            <span>${NX.esc(item.name)}</span>
                            <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">
                                ${isApp ? 'Приложение' : (item.originalPath || 'Неизвестно')}
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                itemsHtml = `<div style="grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: var(--text-muted);">
                    <div style="opacity: 0.3; margin-bottom: 16px;">${NX.icons.trash}</div>
                    <div>Корзина пуста</div>
                </div>`;
            }

            body.innerHTML = `
                <div class="files-app">
                    <div class="files-main" style="width: 100%;">
                        <div class="toolbar" style="padding: 8px 16px;">
                            <button class="btn ghost" id="tr-restore" disabled>${NX.icons.refresh} Восстановить</button>
                            <button class="btn ghost" id="tr-empty" ${items.length === 0 ? 'disabled' : ''}>${NX.icons.x} Очистить</button>
                            <div style="flex:1"></div>
                            <span style="font-size:12px;color:var(--text-muted);">Объектов: ${items.length}</span>
                        </div>
                        <div class="files-grid">
                            ${itemsHtml}
                        </div>
                    </div>
                </div>
            `;

            let selectedItem = null;

            NX.$$('.file-item', body).forEach(el => {
                el.onclick = () => {
                    NX.$$('.file-item', body).forEach(x => x.classList.remove('selected'));
                    el.classList.add('selected');
                    selectedItem = parseInt(el.dataset.index);
                    NX.$('#tr-restore', body).disabled = false;
                };
            });

            NX.$('#tr-restore', body).onclick = () => {
                if (selectedItem === null) return;
                const item = NX.state.trash.splice(selectedItem, 1)[0];
                
                // Если это приложение — восстанавливаем его
                if (item.type === 'app') {
                    NX.installApp(item.id);
                    NX.notifications.push('Корзина', `Приложение "${item.name}" восстановлено`, 'check');
                } else {
                    // Если файл/папка — возвращаем в исходную папку
                    let targetNode = NX.fs.root;
                    if (item.originalPath) {
                        const pathParts = item.originalPath.split('/').filter(Boolean);
                        targetNode = NX.fs.getNode(pathParts) || NX.fs.root.children.find(c => c.name === 'Документы');
                    } else {
                        targetNode = NX.fs.root.children.find(c => c.name === 'Документы');
                    }

                    if (targetNode && targetNode.children) {
                        targetNode.children.push(item);
                    }
                    NX.notifications.push('Корзина', `Объект "${item.name}" восстановлен`, 'check');
                }
                
                NX.saveState();
                selectedItem = null;
                render();
            };

            NX.$('#tr-empty', body).onclick = () => {
                if (confirm('Вы уверены, что хотите безвозвратно удалить все объекты?')) {
                    NX.state.trash = [];
                    NX.saveState();
                    NX.notifications.push('Корзина', 'Корзина очищена', 'trash');
                    render();
                }
            };
        };

        render();
    }
});

// --- 4. 365 ANTIVIRUS ---
NX.registerApp({
    id: 'antivirus',
    name: '365 Antivirus',
    icon: NX.icons.antivirus,
    color: '#30b06b',
    w: 700, h: 550, single: true,
    render(body) {
        let isScanning = false;
        let progress = 0;
        let scanInterval = null;

        const render = () => {
            const isProtected = NX.state.antivirusStatus === 'protected';
            const scanResult = NX.state.antivirusResult || 'Устройство защищено';

            body.innerHTML = `
                <div class="av-app">
                    <div class="av-shield">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface-3)" stroke-width="4" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="${isScanning ? 'var(--warning)' : 'var(--success)'}" stroke-width="4" stroke-linecap="round"
                                stroke-dasharray="283" stroke-dashoffset="${283 - (283 * progress / 100)}" transform="rotate(-90 50 50)" />
                        </svg>
                        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
                            <div style="color:${isScanning ? 'var(--warning)' : 'var(--success)'}; width:48px; height:48px;">${NX.icons.antivirus}</div>
                        </div>
                    </div>
                    
                    <div class="av-status-text">${isScanning ? 'Идет проверка...' : (isProtected ? 'Устройство защищено' : 'Требуется проверка')}</div>
                    <div class="av-sub-text">${isScanning ? Math.round(progress) + '%' : scanResult}</div>
                    
                    <div class="av-actions">
                        <button class="btn primary" id="av-quick" ${isScanning ? 'disabled' : ''}>Быстрая проверка</button>
                        <button class="btn" id="av-full" ${isScanning ? 'disabled' : ''}>Полная проверка</button>
                        <button class="btn ghost" id="av-update" ${isScanning ? 'disabled' : ''}>${NX.icons.refresh} Обновить базы</button>
                    </div>

                    <div class="av-stats-grid">
                        <div class="av-stat-card">
                            <div class="val">${NX.state.avDbVersion || '2026.10.24'}</div>
                            <div class="lbl">Версия баз</div>
                        </div>
                        <div class="av-stat-card">
                            <div class="val">0</div>
                            <div class="lbl">Угроз найдено</div>
                        </div>
                        <div class="av-stat-card">
                            <div class="val">${NX.state.avFilesScanned || '1 248'}</div>
                            <div class="lbl">Файлов проверено</div>
                        </div>
                        <div class="av-stat-card">
                            <div class="val">${NX.state.avLastScan || 'Сегодня'}</div>
                            <div class="lbl">Последняя проверка</div>
                        </div>
                    </div>
                </div>
            `;

            if (!isScanning) {
                NX.$('#av-quick', body).onclick = () => startScan('quick');
                NX.$('#av-full', body).onclick = () => startScan('full');
                NX.$('#av-update', body).onclick = () => {
                    NX.notifications.push('365 Antivirus', 'Обновление баз...', 'refresh');
                    setTimeout(() => {
                        NX.notifications.push('365 Antivirus', 'Базы обновлены', 'check');
                    }, 1500);
                };
            }
        };

        const startScan = (type) => {
            isScanning = true;
            progress = 0;
            render();
            
            NX.notifications.push('365 Antivirus', `Запущена ${type === 'quick' ? 'быстрая' : 'полная'} проверка`, 'info');
            NX.audio.open();

            scanInterval = setInterval(() => {
                progress += Math.random() * 5 + 1;
                
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(scanInterval);
                    isScanning = false;
                    
                    NX.state.antivirusStatus = 'protected';
                    NX.state.antivirusResult = 'Угроз не обнаружено. Устройство в безопасности.';
                    NX.state.avFilesScanned = type === 'quick' ? '1 248' : '12 480';
                    NX.state.avLastScan = 'Только что';
                    NX.saveState();
                    
                    NX.notifications.push('365 Antivirus', 'Проверка завершена. Угроз не найдено.', 'check');
                    NX.audio.notify();
                    render(); // Перерисовываем после завершения
                    return;
                }
                
                const circle = body.querySelector('.av-shield circle:nth-child(2)');
                const statusText = body.querySelector('.av-sub-text');
                if (circle) circle.style.strokeDashoffset = 283 - (283 * progress / 100);
                if (statusText) statusText.textContent = Math.round(progress) + '%';
            }, 200);
        };

        render();
    }
});

// --- 5. ЗАДАЧИ ---
NX.registerApp({
    id: 'todo',
    name: 'Задачи',
    icon: NX.icons.todo,
    color: '#ff9f0a',
    w: 500, h: 600,
    render(body) {
        if (!NX.state.tasks) NX.state.tasks = [{ id: 1, text: 'Изучить Nextel OS', done: false }];

        const render = () => {
            const tasks = NX.state.tasks;
            let listHtml = '';

            if (tasks.length > 0) {
                listHtml = tasks.map(t => `
                    <div class="todo-item ${t.done ? 'done' : ''}">
                        <input type="checkbox" data-id="${t.id}" ${t.done ? 'checked' : ''}>
                        <span class="text">${NX.esc(t.text)}</span>
                        <div class="del-btn" data-del="${t.id}">${NX.icons.trash}</div>
                    </div>
                `).join('');
            } else {
                listHtml = '<div class="np-empty">Нет задач. Добавьте первую!</div>';
            }

            body.innerHTML = `
                <div class="todo-app">
                    <div class="todo-header">
                        <input type="text" class="input" id="todo-input" placeholder="Новая задача...">
                        <button class="btn primary" id="todo-add">Добавить</button>
                    </div>
                    <div class="todo-list">
                        ${listHtml}
                    </div>
                    <div style="padding:12px 20px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);">
                        Выполнено: ${tasks.filter(t => t.done).length} из ${tasks.length}
                    </div>
                </div>
            `;

            NX.$('#todo-add', body).onclick = () => {
                const input = NX.$('#todo-input', body);
                const text = input.value.trim();
                if (text) {
                    NX.state.tasks.push({ id: Date.now(), text, done: false });
                    NX.saveState();
                    input.value = '';
                    render();
                }
            };

            NX.$('#todo-input', body).onkeydown = (e) => {
                if (e.key === 'Enter') NX.$('#todo-add', body).click();
            };

            NX.$$('input[type="checkbox"]', body).forEach(cb => {
                cb.onchange = (e) => {
                    const id = parseInt(cb.dataset.id);
                    const task = NX.state.tasks.find(t => t.id === id);
                    if (task) { task.done = e.target.checked; NX.saveState(); render(); }
                };
            });

            NX.$$('.del-btn', body).forEach(btn => {
                btn.onclick = () => {
                    const id = parseInt(btn.dataset.del);
                    NX.state.tasks = NX.state.tasks.filter(t => t.id !== id);
                    NX.saveState();
                    render();
                };
            });
        };

        render();
    }
});

// --- 6. ЗАМЕТКИ ---
NX.registerApp({
    id: 'notes',
    name: 'Заметки',
    icon: NX.icons.notes,
    color: '#e8c65a',
    w: 750, h: 550,
    render(body) {
        if (!NX.state.notes) NX.state.notes = [{ id: 1, title: 'Добро пожаловать', content: 'Это ваша первая заметка в Nextel OS.', date: new Date().toISOString() }];
        let currentNoteId = NX.state.notes.length > 0 ? NX.state.notes[0].id : null;

        const render = () => {
            const notes = NX.state.notes;
            const activeNote = notes.find(n => n.id === currentNoteId);

            let listHtml = notes.map(n => `
                <div class="note-item ${n.id === currentNoteId ? 'active' : ''}" data-id="${n.id}">
                    <div class="n-title">${NX.esc(n.title || 'Без названия')}</div>
                    <div class="n-prev">${NX.esc(n.content.slice(0, 30) || 'Пустая заметка...')}</div>
                </div>
            `).join('');

            body.innerHTML = `
                <div class="notes-app">
                    <div class="notes-sidebar">
                        <div style="padding:12px;">
                            <button class="btn primary" id="note-new" style="width:100%;">${NX.icons.x} Новая заметка</button>
                        </div>
                        <div class="notes-list">
                            ${listHtml}
                        </div>
                    </div>
                    <div class="notes-editor">
                        ${activeNote ? `
                            <input type="text" id="note-title" value="${NX.esc(activeNote.title)}" placeholder="Заголовок">
                            <textarea id="note-content" placeholder="Текст заметки...">${NX.esc(activeNote.content)}</textarea>
                        ` : `
                            <div class="np-empty" style="margin-top:100px;">Выберите заметку или создайте новую</div>
                        `}
                    </div>
                </div>
            `;

            NX.$$('.note-item', body).forEach(el => {
                el.onclick = () => { currentNoteId = parseInt(el.dataset.id); render(); };
            });

            NX.$('#note-new', body).onclick = () => {
                const newNote = { id: Date.now(), title: 'Новая заметка', content: '', date: new Date().toISOString() };
                NX.state.notes.unshift(newNote);
                currentNoteId = newNote.id;
                NX.saveState();
                render();
                setTimeout(() => NX.$('#note-title', body).focus(), 100);
            };

            if (activeNote) {
                const titleInput = NX.$('#note-title', body);
                const contentInput = NX.$('#note-content', body);

                const saveNote = () => {
                    activeNote.title = titleInput.value;
                    activeNote.content = contentInput.value;
                    activeNote.date = new Date().toISOString();
                    NX.saveState();
                    
                    clearTimeout(window._noteSaveTimer);
                    window._noteSaveTimer = setTimeout(() => {
                        const listItem = body.querySelector(`.note-item[data-id="${activeNote.id}"]`);
                        if (listItem) {
                            listItem.querySelector('.n-title').textContent = activeNote.title || 'Без названия';
                            listItem.querySelector('.n-prev').textContent = activeNote.content.slice(0, 30) || 'Пустая заметка...';
                        }
                    }, 300);
                };

                titleInput.oninput = saveNote;
                contentInput.oninput = saveNote;
            }
        };

        render();
    }
});

// --- 7. НАСТРОЙКИ (SETTINGS) ---
NX.registerApp({
    id: 'settings',
    name: 'Настройки',
    icon: NX.icons.device,
    color: '#6e6e73',
    w: 850, h: 650, single: true,
    render(body) {
        let currentTab = 'system';

        const render = () => {
            let contentHtml = '';

            // --- Система ---
            if (currentTab === 'system') {
                contentHtml = `
                    <h2>Система</h2>
                    <div class="card">
                        <div class="row"><span>Устройство</span><span>Nextel Book 14</span></div>
                        <div class="row"><span>Версия ОС</span><span>Nextel OS 2.0.0</span></div>
                        <div class="row"><span>Ядро</span><span>Nextel Kernel 2.0</span></div>
                        <div class="row"><span>Процессор</span><span>Nextel N1 8-Core 3.2GHz</span></div>
                        <div class="row"><span>Оперативная память</span><span>16 GB LPDDR5</span></div>
                        <div class="row"><span>Накопитель</span><span>512 GB SSD</span></div>
                    </div>
                    <h3>Сброс</h3>
                    <div class="card">
                        <div class="row"><span>Сбросить настройки</span><button class="btn" id="btn-reset">Сбросить</button></div>
                    </div>
                `;
            } 
            // --- Персонализация ---
            else if (currentTab === 'personal') {
                const wallpapers = [
                    'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #e0f2fe 100%)',
                    'linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #e0e7ff 100%)',
                    'linear-gradient(135deg, #d1fae5 0%, #f3f4f6 50%, #dbeafe 100%)',
                    'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                ];

                contentHtml = `
                    <h2>Персонализация</h2>
                    <h3>Тема оформления</h3>
                    <div class="card">
                        <div class="row">
                            <span>Тёмная тема</span>
                            <div class="switch ${NX.state.theme === 'dark' ? 'on' : ''}" id="sw-dark"></div>
                        </div>
                    </div>
                    <h3>Фон рабочего стола</h3>
                    <div class="wallpaper-grid">
                        ${wallpapers.map((w, i) => `
                            <div class="wallpaper-item ${NX.state.wallpaper === i ? 'active' : ''}" data-wall="${i}" style="background: ${w};"></div>
                        `).join('')}
                    </div>
                `;
            }
            // --- Звук ---
            else if (currentTab === 'sound') {
                contentHtml = `
                    <h2>Звук</h2>
                    <div class="card">
                        <div class="row">
                            <span>Громкость системы</span>
                            <input type="range" min="0" max="100" value="${NX.state.volume}" id="set-volume" style="width:200px;">
                        </div>
                    </div>
                `;
            }
            // --- Дисплей ---
            else if (currentTab === 'display') {
                contentHtml = `
                    <h2>Дисплей</h2>
                    <div class="card">
                        <div class="row">
                            <span>Яркость</span>
                            <input type="range" min="20" max="100" value="${NX.state.brightness}" id="set-brightness" style="width:200px;">
                        </div>
                    </div>
                `;
            }
            // --- Приложения ---
            else if (currentTab === 'apps') {
                const apps = NX.state.installed.map(id => NX.apps[id]).filter(Boolean);
                contentHtml = `
                    <h2>Приложения</h2>
                    <div class="card">
                        ${apps.map(app => `
                            <div class="row">
                                <span style="display:flex;align-items:center;gap:10px;">
                                    <span style="color:${app.color}">${app.icon}</span>
                                    ${NX.esc(app.name)}
                                </span>
                                <button class="btn ghost" data-uninstall="${app.id}" style="color:var(--danger);padding:0 10px;">Удалить</button>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            body.innerHTML = `
                <div class="settings-app">
                    <div class="settings-sidebar">
                        <div class="settings-nav ${currentTab === 'system' ? 'active' : ''}" data-tab="system">
                            ${NX.icons.device} Система
                        </div>
                        <div class="settings-nav ${currentTab === 'personal' ? 'active' : ''}" data-tab="personal">
                            ${NX.icons.sun} Персонализация
                        </div>
                        <div class="settings-nav ${currentTab === 'sound' ? 'active' : ''}" data-tab="sound">
                            ${NX.icons.music} Звук
                        </div>
                        <div class="settings-nav ${currentTab === 'display' ? 'active' : ''}" data-tab="display">
                            ${NX.icons.monitor || NX.icons.device} Дисплей
                        </div>
                        <div class="settings-nav ${currentTab === 'apps' ? 'active' : ''}" data-tab="apps">
                            ${NX.icons.market} Приложения
                        </div>
                    </div>
                    <div class="settings-main">
                        ${contentHtml}
                    </div>
                </div>
            `;

            // Навигация по вкладкам
            NX.$$('.settings-nav', body).forEach(nav => {
                nav.onclick = () => { currentTab = nav.dataset.tab; render(); };
            });

            // Обработчики для конкретных вкладок
            if (currentTab === 'system') {
                NX.$('#btn-reset', body).onclick = () => {
                    if (confirm('Сбросить все настройки и файлы? Система перезагрузится.')) {
                        localStorage.removeItem('nx_state_v2');
                        location.reload();
                    }
                };
            }

            if (currentTab === 'personal') {
                NX.$('#sw-dark', body).onclick = function() {
                    NX.state.theme = NX.state.theme === 'dark' ? 'light' : 'dark';
                    document.body.className = NX.state.theme + '-theme';
                    this.classList.toggle('on', NX.state.theme === 'dark');
                    NX.saveState();
                };

                NX.$$('.wallpaper-item', body).forEach(w => {
                    w.onclick = () => {
                        NX.state.wallpaper = parseInt(w.dataset.wall);
                        NX.saveState();
                        // Применяем обои к рабочему столу
                        const wallpapers = [
                            'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #e0f2fe 100%)',
                            'linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #e0e7ff 100%)',
                            'linear-gradient(135deg, #d1fae5 0%, #f3f4f6 50%, #dbeafe 100%)',
                            'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        ];
                        NX.$('#desktop').style.background = wallpapers[NX.state.wallpaper] || wallpapers[0];
                        NX.$$('.wallpaper-item', body).forEach(x => x.classList.remove('active'));
                        w.classList.add('active');
                    };
                });
            }

            if (currentTab === 'sound') {
                const slider = NX.$('#set-volume', body);
                slider.oninput = (e) => {
                    NX.state.volume = e.target.value;
                    NX.saveState();
                };
            }

            if (currentTab === 'display') {
                const slider = NX.$('#set-brightness', body);
                slider.oninput = (e) => {
                    NX.state.brightness = e.target.value;
                    NX.$('#desktop').style.filter = `brightness(${e.target.value}%)`;
                    NX.saveState();
                };
            }

            if (currentTab === 'apps') {
                NX.$$('[data-uninstall]', body).forEach(btn => {
                    btn.onclick = () => {
                        const id = btn.dataset.uninstall;
                        NX.uninstallApp(id);
                        render(); // Обновить список
                    };
                });
            }
        };

        render();
    }
});
