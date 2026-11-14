/* ============================================================
   NEXTEL OS 2.0 — ПРИЛОЖЕНИЯ ПРОДУКТИВНОСТИ
   ============================================================ */

// --- 1. КАЛЬКУЛЯТОР ---
NX.registerApp({
    id: 'calc',
    name: 'Калькулятор',
    icon: NX.icons.calc,
    color: '#5e5ce6',
    w: 360, h: 540, single: true,
    render(body) {
        body.innerHTML = `
            <div class="calc-app">
                <div class="calc-display">
                    <div class="calc-prev"></div>
                    <div class="calc-cur">0</div>
                </div>
                <div class="calc-buttons">
                    <button class="calc-btn op" data-k="C">C</button>
                    <button class="calc-btn op" data-k="±">±</button>
                    <button class="calc-btn op" data-k="%">%</button>
                    <button class="calc-btn op" data-k="/">÷</button>
                    
                    <button class="calc-btn" data-k="7">7</button>
                    <button class="calc-btn" data-k="8">8</button>
                    <button class="calc-btn" data-k="9">9</button>
                    <button class="calc-btn op" data-k="*">×</button>
                    
                    <button class="calc-btn" data-k="4">4</button>
                    <button class="calc-btn" data-k="5">5</button>
                    <button class="calc-btn" data-k="6">6</button>
                    <button class="calc-btn op" data-k="-">−</button>
                    
                    <button class="calc-btn" data-k="1">1</button>
                    <button class="calc-btn" data-k="2">2</button>
                    <button class="calc-btn" data-k="3">3</button>
                    <button class="calc-btn op" data-k="+">+</button>
                    
                    <button class="calc-btn" data-k="0" style="grid-column: span 2;">0</button>
                    <button class="calc-btn" data-k=",">,</button>
                    <button class="calc-btn eq" data-k="=">=</button>
                </div>
            </div>
        `;

        let cur = '0';
        let prev = null;
        let op = null;
        let fresh = false;
        
        const curEl = NX.$('.calc-cur', body);
        const prevEl = NX.$('.calc-prev', body);

        const updateDisplay = () => {
            curEl.textContent = cur.length > 12 ? parseFloat(cur).toExponential(6) : cur;
            prevEl.textContent = prev !== null ? `${prev} ${op === '*' ? '×' : op === '/' ? '÷' : op}` : '';
        };

        const calculate = (a, b, operator) => {
            switch (operator) {
                case '+': return a + b;
                case '-': return a - b;
                case '*': return a * b;
                case '/': return b === 0 ? NaN : a / b;
                default: return b;
            }
        };

        const handleInput = (k) => {
            NX.audio.click();

            if (k === 'C') {
                cur = '0'; prev = null; op = null; fresh = false;
            } else if (k === '±') {
                cur = String(-parseFloat(cur) || 0);
            } else if (k === '%') {
                cur = String(parseFloat(cur) / 100);
            } else if ('0123456789'.includes(k)) {
                if (fresh) { cur = k; fresh = false; }
                else { cur = cur === '0' ? k : cur + k; }
            } else if (k === ',' || k === '.') {
                if (!cur.includes('.')) cur += '.';
            } else if ('+-*/'.includes(k)) {
                if (prev !== null && op && !fresh) {
                    prev = calculate(prev, parseFloat(cur), op);
                    cur = String(prev);
                } else {
                    prev = parseFloat(cur);
                }
                op = k;
                fresh = true;
            } else if (k === '=') {
                if (prev !== null && op) {
                    cur = String(calculate(prev, parseFloat(cur), op));
                    prev = null;
                    op = null;
                }
                fresh = true;
            }
            updateDisplay();
        };

        body.addEventListener('click', (e) => {
            const btn = e.target.closest('.calc-btn');
            if (btn) handleInput(btn.dataset.k);
        });

        // Поддержка клавиатуры
        const keyHandler = (e) => {
            if (!NX.windows.focused || NX.windows.focused.el !== body.closest('.window')) return;
            
            const key = e.key;
            if (/[0-9]/.test(key)) handleInput(key);
            else if (key === '.' || key === ',') handleInput(',');
            else if (key === '+') handleInput('+');
            else if (key === '-') handleInput('-');
            else if (key === '*') handleInput('*');
            else if (key === '/') handleInput('/');
            else if (key === 'Enter' || key === '=') handleInput('=');
            else if (key === 'Backspace') {
                cur = cur.length > 1 ? cur.slice(0, -1) : '0';
                updateDisplay();
            }
            else if (key === 'Escape') handleInput('C');
        };

        document.addEventListener('keydown', keyHandler);
        updateDisplay();
    }
});

// --- 2. WART (Текстовый редактор) ---
NX.registerApp({
    id: 'wart',
    name: 'Wart',
    icon: NX.icons.wart,
    color: '#4a6fa5',
    w: 850, h: 650,
    render(body, ctx) {
        let history = [];
        let historyIndex = -1;
        let filename = 'Без имени.txt';

        body.innerHTML = `
            <div class="wart-app">
                <div class="wart-toolbar">
                    <button class="wart-btn" data-cmd="undo" title="Отменить">↶</button>
                    <button class="wart-btn" data-cmd="redo" title="Повторить">↷</button>
                    <div class="sep"></div>
                    <select class="input" id="wart-font" style="width:120px;height:28px;padding:0 8px;font-size:12px;">
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Courier New, monospace">Courier New</option>
                    </select>
                    <select class="input" id="wart-size" style="width:70px;height:28px;padding:0 8px;font-size:12px;">
                        <option value="2">12px</option>
                        <option value="3" selected>14px</option>
                        <option value="4">16px</option>
                        <option value="5">18px</option>
                        <option value="6">24px</option>
                    </select>
                    <div class="sep"></div>
                    <button class="wart-btn" data-cmd="bold"><b>Ж</b></button>
                    <button class="wart-btn" data-cmd="italic"><i>К</i></button>
                    <button class="wart-btn" data-cmd="underline"><u>Ч</u></button>
                    <button class="wart-btn" data-cmd="strikeThrough"><s>З</s></button>
                    <div class="sep"></div>
                    <button class="wart-btn" data-cmd="insertUnorderedList">• Список</button>
                    <button class="wart-btn" data-cmd="justifyLeft">≡</button>
                    <button class="wart-btn" data-cmd="justifyCenter">≡</button>
                    <button class="wart-btn" data-cmd="justifyRight">≡</button>
                    <div class="sep"></div>
                    <button class="wart-btn" id="wart-find" title="Поиск и замена">🔍</button>
                    <button class="wart-btn" id="wart-img" title="Вставить изображение">🖼️</button>
                    <div style="flex:1"></div>
                    <button class="btn ghost" id="wart-open">${NX.icons.folder} Открыть</button>
                    <button class="btn primary" id="wart-save">${NX.icons.save} Сохранить</button>
                    <button class="btn ghost" id="wart-pdf">PDF</button>
                </div>
                <div class="wart-page" contenteditable="true" spellcheck="false"></div>
                <div class="wart-status">
                    <span class="w-filename">${filename}</span>
                    <span class="w-count">0 слов</span>
                </div>
            </div>
            <!-- Модальное окно поиска -->
            <div id="wart-find-modal" style="position:absolute;top:60px;right:20px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow-lg);padding:16px;display:none;z-index:100;width:300px;">
                <div style="font-weight:600;margin-bottom:12px;">Поиск и замена</div>
                <input type="text" class="input" id="find-text" placeholder="Найти..." style="margin-bottom:8px;">
                <input type="text" class="input" id="replace-text" placeholder="Заменить на..." style="margin-bottom:8px;">
                <div style="display:flex;gap:8px;">
                    <button class="btn" id="find-next">Далее</button>
                    <button class="btn" id="find-replace">Заменить</button>
                    <button class="btn ghost" id="find-close">Закрыть</button>
                </div>
            </div>
        `;

        const editor = NX.$('.wart-page', body);
        const countEl = NX.$('.w-count', body);
        const nameEl = NX.$('.w-filename', body);

        const updateStats = () => {
            const text = editor.innerText;
            const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
            const chars = text.length;
            countEl.textContent = `${words} слов · ${chars} символов`;
        };

        const saveHistory = () => {
            if (historyIndex < history.length - 1) {
                history = history.slice(0, historyIndex + 1);
            }
            history.push(editor.innerHTML);
            historyIndex++;
            if (history.length > 50) { history.shift(); historyIndex--; }
        };

        editor.addEventListener('input', () => {
            updateStats();
            clearTimeout(editor._histTimer);
            editor._histTimer = setTimeout(saveHistory, 500);
        });

        NX.$$('.wart-btn[data-cmd]', body).forEach(btn => {
            btn.onclick = () => {
                const cmd = btn.dataset.cmd;
                if (cmd === 'undo') {
                    if (historyIndex > 0) {
                        historyIndex--;
                        editor.innerHTML = history[historyIndex];
                        updateStats();
                    }
                    return;
                }
                if (cmd === 'redo') {
                    if (historyIndex < history.length - 1) {
                        historyIndex++;
                        editor.innerHTML = history[historyIndex];
                        updateStats();
                    }
                    return;
                }
                document.execCommand(cmd, false, null);
                editor.focus();
                saveHistory();
            };
        });

        NX.$('#wart-font', body).onchange = (e) => {
            document.execCommand('fontName', false, e.target.value);
            editor.focus();
            saveHistory();
        };
        NX.$('#wart-size', body).onchange = (e) => {
            document.execCommand('fontSize', false, e.target.value);
            editor.focus();
            saveHistory();
        };

        // Поиск и замена
        const findModal = NX.$('#wart-find-modal', body);
        NX.$('#wart-find', body).onclick = () => {
            findModal.style.display = findModal.style.display === 'none' ? 'block' : 'none';
        };
        NX.$('#find-close', body).onclick = () => findModal.style.display = 'none';

        NX.$('#find-next', body).onclick = () => {
            const text = NX.$('#find-text', body).value;
            if (text) window.find(text);
        };

        NX.$('#find-replace', body).onclick = () => {
            const find = NX.$('#find-text', body).value;
            const replace = NX.$('#replace-text', body).value;
            if (!find) return;
            
            const html = editor.innerHTML;
            const newHtml = html.split(find).join(replace);
            if (html !== newHtml) {
                editor.innerHTML = newHtml;
                saveHistory();
                updateStats();
            }
        };

        // Вставка изображения
        NX.$('#wart-img', body).onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    document.execCommand('insertImage', false, ev.target.result);
                    saveHistory();
                };
                reader.readAsDataURL(file);
            };
            input.click();
        };

        // Сохранение в ФС
        NX.$('#wart-save', body).onclick = () => {
            const name = prompt('Имя файла:', filename);
            if (!name) return;
            filename = name;
            nameEl.textContent = filename;
            NX.fs.addFile('Документы', filename, editor.innerHTML, 'txt');
            NX.notifications.push('Wart', `Файл ${filename} сохранен`, 'save');
        };

        // Открытие из ФС
        NX.$('#wart-open', body).onclick = () => {
            const docs = NX.fs.root.children.find(c => c.name === 'Документы');
            const files = docs.children.filter(c => c.type === 'file' && c.kind === 'txt');
            if (files.length === 0) {
                NX.notifications.push('Wart', 'Нет текстовых файлов в Документах', 'info');
                return;
            }
            const names = files.map(f => f.name).join('\n');
            const name = prompt(`Доступные файлы:\n${names}\n\nВведите имя файла:`, files[0].name);
            const file = files.find(f => f.name === name);
            if (file) {
                editor.innerHTML = file.content;
                filename = file.name;
                nameEl.textContent = filename;
                updateStats();
                saveHistory();
            }
        };

        // Экспорт в PDF
        NX.$('#wart-pdf', body).onclick = () => {
            const printWindow = window.open('', '', 'width=800,height=600');
            printWindow.document.write(`<html><head><title>${filename}</title><style>body{font-family:Georgia,serif;padding:40px;line-height:1.6;}</style></head><body>${editor.innerHTML}</body></html>`);
            printWindow.document.close();
            setTimeout(() => printWindow.print(), 500);
        };

        if (ctx.args && ctx.args.content) {
            editor.innerHTML = ctx.args.content;
            if (ctx.args.name) {
                filename = ctx.args.name;
                nameEl.textContent = filename;
            }
        }
        updateStats();
        saveHistory();
        setTimeout(() => editor.focus(), 100);
    }
});

// --- 3. POINT (Рисование) ---
NX.registerApp({
    id: 'point',
    name: 'Point',
    icon: NX.icons.point,
    color: '#ff6b6b',
    w: 850, h: 650,
    render(body, ctx) {
        body.innerHTML = `
            <div class="point-app">
                <div class="point-toolbar">
                    <select class="input" id="pt-tool" style="width:120px;height:32px;">
                        <option value="pen">Кисть</option>
                        <option value="eraser">Ластик</option>
                        <option value="line">Линия</option>
                        <option value="rect">Прямоугольник</option>
                        <option value="circle">Круг</option>
                        <option value="fill">Заливка</option>
                    </select>
                    <input type="range" id="pt-size" min="1" max="50" value="4" style="width:100px;">
                    <div class="sep"></div>
                    <div id="pt-colors" style="display:flex;gap:6px;">
                        <div class="color-swatch active" data-c="#111827" style="background:#111827"></div>
                        <div class="color-swatch" data-c="#ef4444" style="background:#ef4444"></div>
                        <div class="color-swatch" data-c="#f59e0b" style="background:#f59e0b"></div>
                        <div class="color-swatch" data-c="#10b981" style="background:#10b981"></div>
                        <div class="color-swatch" data-c="#3b82f6" style="background:#3b82f6"></div>
                        <div class="color-swatch" data-c="#8b5cf6" style="background:#8b5cf6"></div>
                        <div class="color-swatch" data-c="#ec4899" style="background:#ec4899"></div>
                        <div class="color-swatch" data-c="#ffffff" style="background:#ffffff"></div>
                    </div>
                    <div class="sep"></div>
                    <button class="btn ghost" id="pt-undo">↶</button>
                    <button class="btn ghost" id="pt-redo">↷</button>
                    <button class="btn ghost" id="pt-clear">Очистить</button>
                    <button class="btn primary" id="pt-save">${NX.icons.save} Сохранить</button>
                </div>
                <div class="point-canvas-wrap">
                    <canvas id="pt-canvas"></canvas>
                </div>
            </div>
        `;

        const wrap = NX.$('.point-canvas-wrap', body);
        const canvas = NX.$('#pt-canvas', body);
        const ctxCanvas = canvas.getContext('2d', { willReadFrequently: true });

        let drawing = false;
        let color = '#111827';
        let size = 4;
        let tool = 'pen';
        let startX = 0, startY = 0;
        let snapshot = null;
        let undoStack = [];
        let redoStack = [];

        const resizeCanvas = () => {
            const rect = wrap.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            if (canvas.width > 0) tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            
            ctxCanvas.scale(dpr, dpr);
            ctxCanvas.lineCap = 'round';
            ctxCanvas.lineJoin = 'round';

            if (tempCanvas.width > 0) {
                ctxCanvas.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, rect.width, rect.height);
            } else {
                ctxCanvas.fillStyle = '#ffffff';
                ctxCanvas.fillRect(0, 0, rect.width, rect.height);
            }
        };

        const saveState = () => {
            undoStack.push(canvas.toDataURL());
            if (undoStack.length > 20) undoStack.shift();
            redoStack = [];
        };

        setTimeout(() => {
            resizeCanvas();
            saveState();
        }, 100);

        const onResize = () => {
            const imgData = canvas.toDataURL();
            resizeCanvas();
            const img = new Image();
            img.onload = () => { ctxCanvas.drawImage(img, 0, 0, wrap.clientWidth, wrap.clientHeight); };
            img.src = imgData;
        };
        window.addEventListener('resize', onResize);
        ctx.onClose(() => window.removeEventListener('resize', onResize));

        NX.$('#pt-tool', body).onchange = (e) => {
            tool = e.target.value;
            canvas.style.cursor = tool === 'fill' ? 'cell' : 'crosshair';
        };

        NX.$('#pt-size', body).oninput = (e) => { size = parseInt(e.target.value); };

        NX.$$('.color-swatch', body).forEach(sw => {
            sw.onclick = () => {
                color = sw.dataset.c;
                NX.$$('.color-swatch', body).forEach(s => s.classList.remove('active'));
                sw.classList.add('active');
            };
        });

        NX.$('#pt-undo', body).onclick = () => {
            if (undoStack.length > 1) {
                redoStack.push(undoStack.pop());
                const imgData = undoStack[undoStack.length - 1];
                const img = new Image();
                img.onload = () => {
                    ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);
                    ctxCanvas.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = imgData;
            }
        };

        NX.$('#pt-redo', body).onclick = () => {
            if (redoStack.length > 0) {
                const imgData = redoStack.pop();
                undoStack.push(imgData);
                const img = new Image();
                img.onload = () => {
                    ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);
                    ctxCanvas.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = imgData;
            }
        };

        NX.$('#pt-clear', body).onclick = () => {
            saveState();
            ctxCanvas.fillStyle = '#ffffff';
            ctxCanvas.fillRect(0, 0, canvas.width, canvas.height);
        };

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };

        canvas.addEventListener('pointerdown', (e) => {
            drawing = true;
            canvas.setPointerCapture(e.pointerId);
            const pos = getPos(e);
            startX = pos.x;
            startY = pos.y;
            
            saveState();

            if (tool === 'fill') {
                ctxCanvas.fillStyle = color;
                ctxCanvas.fillRect(0, 0, canvas.width, canvas.height);
                drawing = false;
                return;
            }

            if (tool === 'pen' || tool === 'eraser') {
                ctxCanvas.beginPath();
                ctxCanvas.moveTo(pos.x, pos.y);
                ctxCanvas.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
                ctxCanvas.lineWidth = tool === 'eraser' ? size * 3 : size;
                ctxCanvas.lineTo(pos.x + 0.01, pos.y + 0.01);
                ctxCanvas.stroke();
            } else {
                snapshot = ctxCanvas.getImageData(0, 0, canvas.width, canvas.height);
            }
        });

        canvas.addEventListener('pointermove', (e) => {
            if (!drawing) return;
            const pos = getPos(e);

            if (tool === 'pen' || tool === 'eraser') {
                ctxCanvas.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
                ctxCanvas.lineWidth = tool === 'eraser' ? size * 3 : size;
                ctxCanvas.lineTo(pos.x, pos.y);
                ctxCanvas.stroke();
            } else {
                ctxCanvas.putImageData(snapshot, 0, 0);
                ctxCanvas.beginPath();
                ctxCanvas.strokeStyle = color;
                ctxCanvas.lineWidth = size;

                if (tool === 'line') {
                    ctxCanvas.moveTo(startX, startY);
                    ctxCanvas.lineTo(pos.x, pos.y);
                } else if (tool === 'rect') {
                    ctxCanvas.rect(startX, startY, pos.x - startX, pos.y - startY);
                } else if (tool === 'circle') {
                    const rx = Math.abs(pos.x - startX) / 2;
                    const ry = Math.abs(pos.y - startY) / 2;
                    const cx = startX + (pos.x - startX) / 2;
                    const cy = startY + (pos.y - startY) / 2;
                    ctxCanvas.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                }
                ctxCanvas.stroke();
            }
        });

        const stopDrawing = () => { drawing = false; snapshot = null; };
        canvas.addEventListener('pointerup', stopDrawing);
        canvas.addEventListener('pointercancel', stopDrawing);

        NX.$('#pt-save', body).onclick = () => {
            const name = prompt('Имя файла:', ctx.args && ctx.args.name ? ctx.args.name : 'Рисунок.png');
            if (!name) return;
            NX.fs.addFile('Изображения', name, canvas.toDataURL('image/png'), 'img');
            NX.notifications.push('Point', `Рисунок ${name} сохранен`, 'save');
        };

        // Открытие существующего изображения (из ФМ)
        if (ctx.args && ctx.args.content) {
            setTimeout(() => {
                const img = new Image();
                img.onload = () => {
                    ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);
                    ctxCanvas.drawImage(img, 0, 0, wrap.clientWidth, wrap.clientHeight);
                    saveState();
                };
                img.src = ctx.args.content;
            }, 200);
        }
    }
});

// --- 4. POWER PAINT (Презентации) ---
NX.registerApp({
    id: 'powerpaint',
    name: 'Power Paint',
    icon: NX.icons.powerpaint,
    color: '#ff9f0a',
    w: 950, h: 650,
    render(body, ctx) {
        let slides = [{ title: 'Новая презентация', text: '', notes: '' }];
        let currentSlide = 0;
        let presenting = false;

        const themes = {
            light: { bg: '#ffffff', text: '#111827', accent: '#3b82f6' },
            dark: { bg: '#1e293b', text: '#f8fafc', accent: '#60a5fa' },
            gradient: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff', accent: '#fde047' }
        };
        let currentTheme = 'light';

        body.innerHTML = `
            <div class="pp-app">
                <div class="pp-sidebar">
                    <button class="btn primary" id="pp-add-slide">${NX.icons.x} Добавить слайд</button>
                    <div id="pp-slides-list" style="display:flex;flex-direction:column;gap:8px;margin-top:8px;"></div>
                </div>
                <div class="pp-main">
                    <div class="toolbar">
                        <button class="btn ghost" id="pp-present">${NX.icons.play} Показ</button>
                        <div class="sep"></div>
                        <select class="input" id="pp-theme-select" style="width:140px;height:28px;">
                            <option value="light">Светлая тема</option>
                            <option value="dark">Темная тема</option>
                            <option value="gradient">Градиент</option>
                        </select>
                        <button class="btn ghost" id="pp-notes">Заметки</button>
                        <div style="flex:1"></div>
                        <button class="btn primary" id="pp-save">${NX.icons.save} Сохранить</button>
                    </div>
                    <div class="pp-stage">
                        <div class="pp-slide" id="pp-slide-view" style="background:${themes[currentTheme].bg}; color:${themes[currentTheme].text};">
                            <input class="pp-title-input" id="pp-title" value="${NX.esc(slides[0].title)}" style="color:${themes[currentTheme].text};">
                            <textarea class="pp-text-input" id="pp-text" placeholder="Текст слайда..." style="color:${themes[currentTheme].text};">${slides[0].text}</textarea>
                        </div>
                    </div>
                    <div id="pp-notes-area" style="display:none; padding:10px 20px; background:var(--surface-2); border-top:1px solid var(--border);">
                        <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text-muted);">ЗАМЕТКИ ДОКЛАДЧИКА</div>
                        <textarea id="pp-notes-input" style="width:100%;height:60px;border:1px solid var(--border);border-radius:4px;padding:8px;resize:none;font-size:13px;" placeholder="Введите заметки..."></textarea>
                    </div>
                </div>
            </div>
        `;

        const listEl = NX.$('#pp-slides-list', body);
        const titleEl = NX.$('#pp-title', body);
        const textEl = NX.$('#pp-text', body);
        const notesArea = NX.$('#pp-notes-area', body);
        const notesInput = NX.$('#pp-notes-input', body);
        const slideView = NX.$('#pp-slide-view', body);

        const renderList = () => {
            listEl.innerHTML = slides.map((s, i) => `
                <div class="pp-slide-thumb ${i === currentSlide ? 'active' : ''}" data-i="${i}">
                    <span class="num">${i + 1}</span>
                    <div class="title">${NX.esc(s.title || 'Без названия')}</div>
                </div>
            `).join('');

            NX.$$('.pp-slide-thumb', listEl).forEach(el => {
                el.onclick = () => {
                    saveCurrentSlide();
                    currentSlide = parseInt(el.dataset.i);
                    loadSlide();
                };
            });
        };

        const loadSlide = () => {
            const s = slides[currentSlide];
            titleEl.value = s.title;
            textEl.value = s.text;
            notesInput.value = s.notes || '';
            applyTheme();
            renderList();
        };

        const saveCurrentSlide = () => {
            slides[currentSlide].title = titleEl.value;
            slides[currentSlide].text = textEl.value;
            slides[currentSlide].notes = notesInput.value;
        };

        const applyTheme = () => {
            const t = themes[currentTheme];
            slideView.style.background = t.bg;
            slideView.style.color = t.text;
            titleEl.style.color = t.text;
            textEl.style.color = t.text;
        };

        titleEl.oninput = () => { saveCurrentSlide(); renderList(); };
        textEl.oninput = () => { saveCurrentSlide(); };

        NX.$('#pp-add-slide', body).onclick = () => {
            saveCurrentSlide();
            slides.push({ title: 'Слайд ' + (slides.length + 1), text: '', notes: '' });
            currentSlide = slides.length - 1;
            loadSlide();
        };

        NX.$('#pp-notes', body).onclick = () => {
            notesArea.style.display = notesArea.style.display === 'none' ? 'block' : 'none';
        };

        NX.$('#pp-theme-select', body).onchange = (e) => {
            currentTheme = e.target.value;
            applyTheme();
        };

        NX.$('#pp-save', body).onclick = () => {
            saveCurrentSlide();
            const name = prompt('Имя презентации:', 'Презентация.ppt');
            if (!name) return;
            NX.fs.addFile('Документы', name, JSON.stringify(slides), 'ppt');
            NX.notifications.push('Power Paint', `Презентация ${name} сохранена`, 'save');
        };

        NX.$('#pp-present', body).onclick = () => {
            saveCurrentSlide();
            presenting = true;
            let pIdx = 0;

            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;';
            
            const renderSlide = () => {
                const s = slides[pIdx];
                const t = themes[currentTheme];
                overlay.innerHTML = `
                    <div style="width:80%;max-width:1000px;aspect-ratio:16/9;background:${t.bg};color:${t.text};padding:60px;border-radius:8px;display:flex;flex-direction:column;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                        <h1 style="font-size:48px;margin-bottom:24px;">${NX.esc(s.title)}</h1>
                        <div style="font-size:24px;line-height:1.6;flex:1;white-space:pre-wrap;">${NX.esc(s.text)}</div>
                    </div>
                    <div style="position:absolute;bottom:30px;display:flex;gap:20px;align-items:center;font-size:16px;color:rgba(255,255,255,0.7);">
                        <button class="btn ghost" id="p-prev" style="color:#fff;border:1px solid rgba(255,255,255,0.3);">Назад</button>
                        <span>${pIdx + 1} / ${slides.length}</span>
                        <button class="btn ghost" id="p-next" style="color:#fff;border:1px solid rgba(255,255,255,0.3);">Далее</button>
                        <button class="btn ghost" id="p-exit" style="color:#fff;border:1px solid rgba(255,255,255,0.3);">Выйти</button>
                    </div>
                `;

                overlay.querySelector('#p-prev').onclick = (e) => { e.stopPropagation(); if (pIdx > 0) { pIdx--; renderSlide(); } };
                overlay.querySelector('#p-next').onclick = (e) => { e.stopPropagation(); if (pIdx < slides.length - 1) { pIdx++; renderSlide(); } };
                overlay.querySelector('#p-exit').onclick = (e) => { e.stopPropagation(); overlay.remove(); presenting = false; };
            };

            renderSlide();
            document.body.appendChild(overlay);

            const keyHandler = (e) => {
                if (!presenting) return;
                if (e.key === 'ArrowRight' && pIdx < slides.length - 1) { pIdx++; renderSlide(); }
                if (e.key === 'ArrowLeft' && pIdx > 0) { pIdx--; renderSlide(); }
                if (e.key === 'Escape') { overlay.remove(); presenting = false; }
            };
            document.addEventListener('keydown', keyHandler);
            ctx.onClose(() => document.removeEventListener('keydown', keyHandler));
        };

        if (ctx.args && ctx.args.content) {
            try {
                slides = JSON.parse(ctx.args.content);
                currentSlide = 0;
            } catch(e) {}
        }
        loadSlide();
    }
});
