/* ============================================================
   NEXTEL OS 2.0 — РЕАЛЬНЫЕ ПРИЛОЖЕНИЯ (APP_MORE)
   Заменяют placeholders из core.js
   ============================================================ */

// --- 1. ГЕНЕРАТОР ПАРОЛЕЙ ---
NX.registerApp({
    id: 'password_gen', name: 'Генератор паролей', icon: NX.icons.passwords, color: '#30b06b',
    category: 'Утилиты', description: 'Генератор надёжных паролей.', w: 500, h: 480, single: true,
    render(body) {
        let length = 16, useUpper = true, useLower = true, useDigits = true, useSymbols = true;
        const render = () => {
            body.innerHTML = `
                <div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;">
                    <div style="font-size:20px;font-weight:600;">Генератор паролей</div>
                    <div id="pwd-result" style="padding:16px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;font-family:monospace;font-size:16px;word-break:break-all;min-height:60px;"></div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn primary" id="pwd-gen" style="flex:1;">Сгенерировать</button>
                        <button class="btn" id="pwd-copy">Копировать</button>
                    </div>
                    <div class="card">
                        <div class="row"><span>Длина</span><input type="range" min="6" max="64" value="${length}" id="pwd-len" style="width:200px;"><span>${length}</span></div>
                        <div class="row"><span>Заглавные (A-Z)</span><div class="switch ${useUpper?'on':''}" data-opt="useUpper"></div></div>
                        <div class="row"><span>Строчные (a-z)</span><div class="switch ${useLower?'on':''}" data-opt="useLower"></div></div>
                        <div class="row"><span>Цифры (0-9)</span><div class="switch ${useDigits?'on':''}" data-opt="useDigits"></div></div>
                        <div class="row"><span>Символы (!@#$)</span><div class="switch ${useSymbols?'on':''}" data-opt="useSymbols"></div></div>
                    </div>
                </div>
            `;
            const generate = () => {
                let chars = '';
                if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
                if (useDigits) chars += '0123456789';
                if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
                if (!chars) chars = 'abc123';
                let pwd = '';
                const arr = new Uint32Array(length);
                crypto.getRandomValues(arr);
                for (let i = 0; i < length; i++) pwd += chars[arr[i] % chars.length];
                const res = NX.$('#pwd-result', body);
                if (res) res.textContent = pwd;
            };
            NX.$('#pwd-gen', body).onclick = generate;
            NX.$('#pwd-copy', body).onclick = () => {
                const res = NX.$('#pwd-result', body);
                if (res && res.textContent) {
                    navigator.clipboard.writeText(res.textContent);
                    NX.notifications.push('Пароли', 'Скопировано в буфер', 'check');
                }
            };
            NX.$('#pwd-len', body).oninput = (e) => { length = +e.target.value; e.target.nextElementSibling.textContent = length; };
            NX.$$('[data-opt]', body).forEach(sw => {
                sw.onclick = () => {
                    const opt = sw.dataset.opt;
                    if (opt === 'useUpper') useUpper = !useUpper;
                    if (opt === 'useLower') useLower = !useLower;
                    if (opt === 'useDigits') useDigits = !useDigits;
                    if (opt === 'useSymbols') useSymbols = !useSymbols;
                    sw.classList.toggle('on');
                };
            });
            generate();
        };
        render();
    }
});

// --- 2. ИНЖЕНЕРНЫЙ КАЛЬКУЛЯТОР ---
NX.registerApp({
    id: 'calculator_sci', name: 'Инженерный калькулятор', icon: NX.icons.calc, color: '#8b5cf6',
    category: 'Утилиты', description: 'Научный калькулятор с тригонометрией.', w: 400, h: 600, single: true,
    render(body) {
        body.innerHTML = `
            <div class="calc-app">
                <div class="calc-display"><div class="calc-prev"></div><div class="calc-cur">0</div></div>
                <div class="calc-buttons" style="grid-template-columns:repeat(5,1fr);">
                    <button class="calc-btn op" data-k="sin">sin</button>
                    <button class="calc-btn op" data-k="cos">cos</button>
                    <button class="calc-btn op" data-k="tan">tan</button>
                    <button class="calc-btn op" data-k="sqrt">√</button>
                    <button class="calc-btn op" data-k="C">C</button>
                    <button class="calc-btn op" data-k="log">log</button>
                    <button class="calc-btn op" data-k="ln">ln</button>
                    <button class="calc-btn op" data-k="^">x^y</button>
                    <button class="calc-btn op" data-k="!">n!</button>
                    <button class="calc-btn op" data-k="÷">÷</button>
                    <button class="calc-btn" data-k="7">7</button>
                    <button class="calc-btn" data-k="8">8</button>
                    <button class="calc-btn" data-k="9">9</button>
                    <button class="calc-btn op" data-k="×">×</button>
                    <button class="calc-btn op" data-k="π">π</button>
                    <button class="calc-btn" data-k="4">4</button>
                    <button class="calc-btn" data-k="5">5</button>
                    <button class="calc-btn" data-k="6">6</button>
                    <button class="calc-btn op" data-k="-">−</button>
                    <button class="calc-btn op" data-k="e">e</button>
                    <button class="calc-btn" data-k="1">1</button>
                    <button class="calc-btn" data-k="2">2</button>
                    <button class="calc-btn" data-k="3">3</button>
                    <button class="calc-btn op" data-k="+">+</button>
                    <button class="calc-btn" data-k="±">±</button>
                    <button class="calc-btn" data-k="0" style="grid-column:span 2;">0</button>
                    <button class="calc-btn" data-k=",">,</button>
                    <button class="calc-btn op" data-k="%">%</button>
                    <button class="calc-btn eq" data-k="=">=</button>
                </div>
            </div>
        `;
        let cur = '0', prev = null, op = null, fresh = false;
        const curEl = NX.$('.calc-cur', body), prevEl = NX.$('.calc-prev', body);
        const update = () => {
            curEl.textContent = cur.length > 14 ? parseFloat(cur).toExponential(6) : cur;
            prevEl.textContent = prev !== null ? `${prev} ${op}` : '';
        };
        const factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);
        const calc = (a, b, o) => {
            if (o === '+') return a + b;
            if (o === '-') return a - b;
            if (o === '×') return a * b;
            if (o === '÷') return b === 0 ? NaN : a / b;
            if (o === '^') return Math.pow(a, b);
            return b;
        };
        body.addEventListener('click', (e) => {
            const b = e.target.closest('.calc-btn'); if (!b) return;
            const k = b.dataset.k; NX.audio.click();
            if (k === 'C') { cur = '0'; prev = null; op = null; fresh = false; }
            else if (k === '±') cur = String(-parseFloat(cur) || 0);
            else if (k === '%') cur = String(parseFloat(cur) / 100);
            else if (k === 'sin') cur = String(Math.sin(parseFloat(cur)));
            else if (k === 'cos') cur = String(Math.cos(parseFloat(cur)));
            else if (k === 'tan') cur = String(Math.tan(parseFloat(cur)));
            else if (k === 'sqrt') cur = String(Math.sqrt(parseFloat(cur)));
            else if (k === 'log') cur = String(Math.log10(parseFloat(cur)));
            else if (k === 'ln') cur = String(Math.log(parseFloat(cur)));
            else if (k === '!') cur = String(factorial(Math.floor(parseFloat(cur))));
            else if (k === 'π') { cur = String(Math.PI); fresh = true; }
            else if (k === 'e') { cur = String(Math.E); fresh = true; }
            else if ('0123456789'.includes(k)) { if (fresh) { cur = k; fresh = false; } else cur = cur === '0' ? k : cur + k; }
            else if (k === ',') { if (!cur.includes('.')) cur += '.'; }
            else if (['+','-','×','÷','^'].includes(k)) { prev = parseFloat(cur); op = k; fresh = true; }
            else if (k === '=') { if (prev !== null && op) { cur = String(calc(prev, parseFloat(cur), op)); prev = null; op = null; } fresh = true; }
            update();
        });
        update();
    }
});

// --- 3. КАЛЬКУЛЯТОР ИМТ ---
NX.registerApp({
    id: 'bmi_calc', name: 'Калькулятор ИМТ', icon: NX.icons.calc, color: '#ef4444',
    category: 'Утилиты', description: 'Индекс массы тела.', w: 450, h: 400, single: true,
    render(body) {
        body.innerHTML = `
            <div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;">
                <h2 style="font-size:20px;">Калькулятор ИМТ</h2>
                <div><label style="font-size:12px;color:var(--text-muted);">Вес (кг)</label><input type="number" class="input" id="bmi-weight" value="70"></div>
                <div><label style="font-size:12px;color:var(--text-muted);">Рост (см)</label><input type="number" class="input" id="bmi-height" value="175"></div>
                <button class="btn primary" id="bmi-calc">Рассчитать</button>
                <div id="bmi-result" style="text-align:center;padding:20px;background:var(--surface-2);border-radius:8px;"></div>
            </div>
        `;
        NX.$('#bmi-calc', body).onclick = () => {
            const w = parseFloat(NX.$('#bmi-weight', body).value);
            const h = parseFloat(NX.$('#bmi-height', body).value) / 100;
            if (!w || !h) return;
            const bmi = (w / (h * h)).toFixed(1);
            let cat = 'Норма', color = '#10b981';
            if (bmi < 18.5) { cat = 'Недостаточный вес'; color = '#f59e0b'; }
            else if (bmi < 25) { cat = 'Норма'; color = '#10b981'; }
            else if (bmi < 30) { cat = 'Избыточный вес'; color = '#f59e0b'; }
            else { cat = 'Ожирение'; color = '#ef4444'; }
            NX.$('#bmi-result', body).innerHTML = `
                <div style="font-size:48px;font-weight:300;color:${color};">${bmi}</div>
                <div style="font-size:14px;color:var(--text-muted);margin-top:8px;">${cat}</div>
            `;
        };
    }
});

// --- 4. КАЛЬКУЛЯТОР ЧАЕВЫХ ---
NX.registerApp({
    id: 'tip_calc', name: 'Калькулятор чаевых', icon: NX.icons.calc, color: '#0a84ff',
    category: 'Утилиты', description: 'Расчёт чаевых.', w: 450, h: 450, single: true,
    render(body) {
        body.innerHTML = `
            <div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;">
                <h2 style="font-size:20px;">Калькулятор чаевых</h2>
                <div><label style="font-size:12px;color:var(--text-muted);">Сумма счёта (₽)</label><input type="number" class="input" id="tip-sum" value="1000"></div>
                <div><label style="font-size:12px;color:var(--text-muted);">Чаевые (%)</label><input type="number" class="input" id="tip-pct" value="15"></div>
                <div><label style="font-size:12px;color:var(--text-muted);">На сколько человек</label><input type="number" class="input" id="tip-people" value="1" min="1"></div>
                <button class="btn primary" id="tip-calc">Рассчитать</button>
                <div id="tip-result" style="padding:20px;background:var(--surface-2);border-radius:8px;"></div>
            </div>
        `;
        NX.$('#tip-calc', body).onclick = () => {
            const sum = parseFloat(NX.$('#tip-sum', body).value) || 0;
            const pct = parseFloat(NX.$('#tip-pct', body).value) || 0;
            const people = Math.max(1, parseInt(NX.$('#tip-people', body).value) || 1);
            const tip = sum * pct / 100;
            const total = sum + tip;
            NX.$('#tip-result', body).innerHTML = `
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Чаевые:</span><b>${tip.toFixed(2)} ₽</b></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Итого:</span><b>${total.toFixed(2)} ₽</b></div>
                <div style="display:flex;justify-content:space-between;color:var(--accent);"><span>На человека:</span><b>${(total / people).toFixed(2)} ₽</b></div>
            `;
        };
    }
});

// --- 5. КАЛЬКУЛЯТОР ВОЗРАСТА ---
NX.registerApp({
    id: 'age_calc', name: 'Калькулятор возраста', icon: NX.icons.calendar, color: '#e8534a',
    category: 'Утилиты', description: 'Сколько вам лет.', w: 450, h: 400, single: true,
    render(body) {
        body.innerHTML = `
            <div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;">
                <h2 style="font-size:20px;">Калькулятор возраста</h2>
                <div><label style="font-size:12px;color:var(--text-muted);">Дата рождения</label><input type="date" class="input" id="age-date"></div>
                <button class="btn primary" id="age-calc">Рассчитать</button>
                <div id="age-result" style="padding:20px;background:var(--surface-2);border-radius:8px;text-align:center;"></div>
            </div>
        `;
        NX.$('#age-calc', body).onclick = () => {
            const date = NX.$('#age-date', body).value;
            if (!date) return;
            const birth = new Date(date);
            const now = new Date();
            let years = now.getFullYear() - birth.getFullYear();
            let months = now.getMonth() - birth.getMonth();
            let days = now.getDate() - birth.getDate();
            if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
            if (months < 0) { years--; months += 12; }
            NX.$('#age-result', body).innerHTML = `
                <div style="font-size:48px;font-weight:300;color:var(--accent);">${years}</div>
                <div style="font-size:14px;color:var(--text-muted);margin-top:8px;">лет, ${months} месяцев, ${days} дней</div>
            `;
        };
    }
});

// --- 6. СЕКУНДОМЕР ---
NX.registerApp({
    id: 'stopwatch', name: 'Секундомер', icon: NX.icons.clock, color: '#ff9f0a',
    category: 'Утилиты', description: 'Точный секундомер.', w: 500, h: 450, single: true,
    render(body, ctx) {
        let elapsed = 0, running = false, interval = null, laps = [];
        const render = () => {
            body.innerHTML = `
                <div style="padding:24px;display:flex;flex-direction:column;align-items:center;gap:20px;height:100%;">
                    <div style="font-size:72px;font-weight:200;font-variant-numeric:tabular-nums;letter-spacing:-2px;">${fmt(elapsed)}</div>
                    <div style="display:flex;gap:12px;">
                        <button class="btn primary" id="sw-toggle" style="min-width:120px;justify-content:center;">${running ? 'Пауза' : 'Старт'}</button>
                        <button class="btn ghost" id="sw-lap">Круг</button>
                        <button class="btn ghost" id="sw-reset">Сброс</button>
                    </div>
                    <div style="flex:1;overflow-y:auto;width:100%;max-width:400px;" id="sw-laps"></div>
                </div>
            `;
            NX.$('#sw-toggle', body).onclick = () => {
                if (running) { clearInterval(interval); running = false; }
                else { const start = Date.now() - elapsed; interval = setInterval(() => { elapsed = Date.now() - start; render(); }, 50); running = true; }
                render();
            };
            NX.$('#sw-lap', body).onclick = () => {
                if (elapsed > 0) { laps.push(elapsed); render(); }
            };
            NX.$('#sw-reset', body).onclick = () => {
                clearInterval(interval); running = false; elapsed = 0; laps = []; render();
            };
            const lapsEl = NX.$('#sw-laps', body);
            if (lapsEl) lapsEl.innerHTML = laps.map((l, i) => `<div style="padding:6px 12px;display:flex;justify-content:space-between;background:var(--surface-2);border-radius:4px;margin-bottom:4px;font-size:13px;"><span>Круг ${i+1}</span><b>${fmt(l)}</b></div>`).join('');
        };
        const fmt = (ms) => {
            const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, cs = Math.floor(ms / 10) % 100;
            return `${NX.pad(m)}:${NX.pad(s)}.${NX.pad(cs)}`;
        };
        ctx.onClose(() => clearInterval(interval));
        render();
    }
});

// --- 7. ТАЙМЕР ---
NX.registerApp({
    id: 'timer', name: 'Таймер', icon: NX.icons.clock, color: '#5e5ce6',
    category: 'Утилиты', description: 'Таймер обратного отсчёта.', w: 500, h: 450, single: true,
    render(body, ctx) {
        let total = 60, remaining = 60, running = false, interval = null;
        const render = () => {
            body.innerHTML = `
                <div style="padding:24px;display:flex;flex-direction:column;align-items:center;gap:20px;height:100%;">
                    <div style="font-size:72px;font-weight:200;font-variant-numeric:tabular-nums;letter-spacing:-2px;color:${remaining <= 10 ? 'var(--danger)' : 'inherit'};">${NX.pad(Math.floor(remaining/60))}:${NX.pad(remaining%60)}</div>
                    <div style="display:flex;gap:8px;">
                        <input type="number" class="input" id="tm-min" value="${Math.floor(total/60)}" style="width:70px;" min="0">
                        <span>:</span>
                        <input type="number" class="input" id="tm-sec" value="${total%60}" style="width:70px;" min="0" max="59">
                    </div>
                    <div style="display:flex;gap:12px;">
                        <button class="btn primary" id="tm-toggle" style="min-width:120px;justify-content:center;">${running ? 'Пауза' : 'Старт'}</button>
                        <button class="btn ghost" id="tm-reset">Сброс</button>
                    </div>
                </div>
            `;
            NX.$('#tm-toggle', body).onclick = () => {
                if (running) { clearInterval(interval); running = false; }
                else {
                    if (remaining <= 0) {
                        total = (parseInt(NX.$('#tm-min', body).value) || 0) * 60 + (parseInt(NX.$('#tm-sec', body).value) || 0);
                        remaining = total;
                    }
                    if (remaining > 0) {
                        running = true;
                        interval = setInterval(() => {
                            remaining--;
                            if (remaining <= 0) {
                                clearInterval(interval); running = false;
                                NX.audio.notify();
                                NX.notifications.push('Таймер', 'Время вышло!', 'check');
                            }
                            render();
                        }, 1000);
                    }
                }
                render();
            };
            NX.$('#tm-reset', body).onclick = () => {
                clearInterval(interval); running = false;
                total = (parseInt(NX.$('#tm-min', body).value) || 0) * 60 + (parseInt(NX.$('#tm-sec', body).value) || 0);
                remaining = total; render();
            };
        };
        ctx.onClose(() => clearInterval(interval));
        render();
    }
});

// --- 8. МИРОВЫЕ ЧАСЫ ---
NX.registerApp({
    id: 'world_clock', name: 'Мировые часы', icon: NX.icons.clock, color: '#34aadc',
    category: 'Утилиты', description: 'Часы в разных городах.', w: 500, h: 500, single: true,
    render(body, ctx) {
        const cities = [
            { name: 'Москва', tz: 'Europe/Moscow' },
            { name: 'Лондон', tz: 'Europe/London' },
            { name: 'Нью-Йорк', tz: 'America/New_York' },
            { name: 'Токио', tz: 'Asia/Tokyo' },
            { name: 'Дубай', tz: 'Asia/Dubai' },
            { name: 'Сидней', tz: 'Australia/Sydney' },
            { name: 'Лос-Анджелес', tz: 'America/Los_Angeles' },
            { name: 'Париж', tz: 'Europe/Paris' }
        ];
        const render = () => {
            body.innerHTML = `
                <div style="padding:24px;height:100%;overflow-y:auto;">
                    <h2 style="font-size:20px;margin-bottom:16px;">Мировые часы</h2>
                    <div style="display:grid;gap:8px;">
                        ${cities.map(c => `
                            <div class="card" style="padding:16px;">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div style="font-weight:600;">${c.name}</div>
                                    <div style="font-size:24px;font-weight:300;font-variant-numeric:tabular-nums;" data-tz="${c.tz}">--:--</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            updateClocks();
        };
        const updateClocks = () => {
            NX.$$('[data-tz]', body).forEach(el => {
                try {
                    el.textContent = new Date().toLocaleTimeString('ru-RU', { timeZone: el.dataset.tz, hour: '2-digit', minute: '2-digit' });
                } catch(e) {}
            });
        };
        const iv = setInterval(updateClocks, 10000);
        ctx.onClose(() => clearInterval(iv));
        render();
    }
});

// --- 9. ГЕНЕРАТОР ГРАДИЕНТОВ ---
NX.registerApp({
    id: 'gradient', name: 'Градиенты', icon: NX.icons.point, color: '#e05fb0',
    category: 'Программы', description: 'Создание CSS-градиентов.', w: 550, h: 550, single: true,
    render(body) {
        let c1 = '#0a84ff', c2 = '#e05fb0', angle = 135;
        const render = () => {
            body.innerHTML = `
                <div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;">
                    <h2 style="font-size:20px;">Генератор градиентов</h2>
                    <div id="grad-preview" style="height:200px;border-radius:12px;background:linear-gradient(${angle}deg, ${c1}, ${c2});"></div>
                    <div style="display:flex;gap:8px;">
                        <div style="flex:1;"><label style="font-size:12px;color:var(--text-muted);">Цвет 1</label><input type="color" id="grad-c1" value="${c1}" style="width:100%;height:40px;border:none;cursor:pointer;"></div>
                        <div style="flex:1;"><label style="font-size:12px;color:var(--text-muted);">Цвет 2</label><input type="color" id="grad-c2" value="${c2}" style="width:100%;height:40px;border:none;cursor:pointer;"></div>
                    </div>
                    <div><label style="font-size:12px;color:var(--text-muted);">Угол: ${angle}°</label><input type="range" min="0" max="360" value="${angle}" id="grad-angle" style="width:100%;"></div>
                    <div class="card"><div class="row"><span>CSS</span></div>
                        <div style="padding:12px;font-family:monospace;font-size:12px;background:var(--surface);color:var(--text);word-break:break-all;" id="grad-css"></div>
                    </div>
                    <button class="btn primary" id="grad-copy">Копировать CSS</button>
                </div>
            `;
            const css = `background: linear-gradient(${angle}deg, ${c1}, ${c2});`;
            NX.$('#grad-css', body).textContent = css;
            NX.$('#grad-preview', body).style.background = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
            NX.$('#grad-c1', body).oninput = (e) => { c1 = e.target.value; render(); };
            NX.$('#grad-c2', body).oninput = (e) => { c2 = e.target.value; render(); };
            NX.$('#grad-angle', body).oninput = (e) => { angle = +e.target.value; render(); };
            NX.$('#grad-copy', body).onclick = () => {
                navigator.clipboard.writeText(css);
                NX.notifications.push('Градиенты', 'CSS скопирован', 'check');
            };
        };
        render();
    }
});

// --- 10. ВЫБОР ЦВЕТА ---
NX.registerApp({
    id: 'color_picker', name: 'Выбор цвета', icon: NX.icons.point, color: '#e05fb0',
    category: 'Утилиты', description: 'Палитра цветов.', w: 450, h: 500, single: true,
    render(body) {
        let color = '#0a84ff';
        const render = () => {
            const hex = color.toLowerCase();
            const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
            const hsl = rgbToHsl(r, g, b);
            body.innerHTML = `
                <div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;">
                    <h2 style="font-size:20px;">Выбор цвета</h2>
                    <div style="height:150px;border-radius:12px;background:${color};border:1px solid var(--border);"></div>
                    <input type="color" id="cp-input" value="${color}" style="width:100%;height:60px;border:none;cursor:pointer;">
                    <div class="card">
                        <div class="row"><span>HEX</span><span style="font-family:monospace;">${hex}</span></div>
                        <div class="row"><span>RGB</span><span style="font-family:monospace;">rgb(${r}, ${g}, ${b})</span></div>
                        <div class="row"><span>HSL</span><span style="font-family:monospace;">hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</span></div>
                    </div>
                    <button class="btn primary" id="cp-copy">Копировать HEX</button>
                </div>
            `;
            NX.$('#cp-input', body).oninput = (e) => { color = e.target.value; render(); };
            NX.$('#cp-copy', body).onclick = () => {
                navigator.clipboard.writeText(hex);
                NX.notifications.push('Цвет', hex + ' скопирован', 'check');
            };
        };
        const rgbToHsl = (r, g, b) => {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0;
            const l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                else if (max === g) h = ((b - r) / d + 2) / 6;
                else h = ((r - g) / d + 4) / 6;
            }
            return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
        };
        render();
    }
});

// --- 11. ЗАДАЧИ PRO (с приоритетами) ---
NX.registerApp({
    id: 'todo_pro', name: 'Задачи Pro', icon: NX.icons.todo, color: '#5e5ce6',
    category: 'Программы', description: 'Задачи с приоритетами.', w: 600, h: 600,
    render(body) {
        if (!NX.state.tasks) NX.state.tasks = [];
        const render = () => {
            const tasks = NX.state.tasks.map(t => ({ ...t, priority: t.priority || 'normal' }));
            tasks.sort((a, b) => {
                const p = { high: 0, normal: 1, low: 2 };
                return (p[a.priority] - p[b.priority]) || (a.done - b.done);
            });
            body.innerHTML = `
                <div class="todo-app">
                    <div class="todo-header">
                        <input type="text" class="input" id="tp-input" placeholder="Новая задача...">
                        <select class="input" id="tp-priority" style="width:120px;">
                            <option value="high">Высокий</option>
                            <option value="normal" selected>Обычный</option>
                            <option value="low">Низкий</option>
                        </select>
                        <button class="btn primary" id="tp-add">Добавить</button>
                    </div>
                    <div class="todo-list">
                        ${tasks.length === 0 ? '<div class="np-empty">Нет задач</div>' : tasks.map(t => {
                            const color = t.priority === 'high' ? 'var(--danger)' : (t.priority === 'low' ? 'var(--text-muted)' : 'var(--accent)');
                            return `
                                <div class="todo-item ${t.done ? 'done' : ''}" style="border-left:3px solid ${color};padding-left:12px;">
                                    <input type="checkbox" data-id="${t.id}" ${t.done ? 'checked' : ''}>
                                    <span class="text">${NX.esc(t.text)}</span>
                                    <button class="del-btn" data-del="${t.id}">${NX.icons.trash}</button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div style="padding:12px 20px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);">
                        Выполнено: ${tasks.filter(t=>t.done).length} / ${tasks.length}
                    </div>
                </div>
            `;
            NX.$('#tp-add', body).onclick = () => {
                const input = NX.$('#tp-input', body);
                const text = input.value.trim();
                if (!text) return;
                NX.state.tasks.push({ id: Date.now(), text, done: false, priority: NX.$('#tp-priority', body).value });
                NX.saveState(); input.value = ''; render();
            };
            NX.$('#tp-input', body).onkeydown = (e) => { if (e.key === 'Enter') NX.$('#tp-add', body).click(); };
            NX.$$('input[type="checkbox"]', body).forEach(cb => {
                cb.onchange = (e) => {
                    const id = parseInt(cb.dataset.id);
                    const task = NX.state.tasks.find(t => t.id === id);
                    if (task) { task.done = e.target.checked; NX.saveState(); render(); }
                };
            });
            NX.$$('.del-btn', body).forEach(btn => {
                btn.onclick = () => {
                    NX.state.tasks = NX.state.tasks.filter(t => t.id !== parseInt(btn.dataset.del));
                    NX.saveState(); render();
                };
            });
        };
        render();
    }
});

// --- 12. ТРЕКЕР ПРИВЫЧЕК ---
NX.registerApp({
    id: 'habit', name: 'Трекер привычек', icon: NX.icons.check, color: '#10b981',
    category: 'Программы', description: 'Отслеживание привычек.', w: 600, h: 600,
    render(body) {
        if (!NX.state.habits) NX.state.habits = [];
        const today = new Date().toISOString().slice(0, 10);
        const render = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <input type="text" class="input" id="hb-input" placeholder="Новая привычка..." style="flex:1;">
                        <button class="btn primary" id="hb-add">Добавить</button>
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:16px;">
                        ${NX.state.habits.length === 0 ? '<div class="np-empty">Пока нет привычек</div>' : NX.state.habits.map((h, i) => {
                            const done = (h.dates || []).includes(today);
                            const streak = h.dates ? h.dates.length : 0;
                            return `
                                <div class="card" style="margin-bottom:8px;">
                                    <div class="row">
                                        <div>
                                            <div style="font-weight:600;">${NX.esc(h.name)}</div>
                                            <div style="font-size:11px;color:var(--text-muted);">Серия: ${streak} дней</div>
                                        </div>
                                        <div style="display:flex;gap:8px;align-items:center;">
                                            <button class="btn ${done?'primary':''}" data-toggle="${i}" style="min-width:80px;justify-content:center;">${done?'✓ Готово':'Отметить'}</button>
                                            <button class="btn ghost" data-del="${i}" style="color:var(--danger);">×</button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            NX.$('#hb-add', body).onclick = () => {
                const input = NX.$('#hb-input', body);
                const name = input.value.trim();
                if (!name) return;
                NX.state.habits.push({ id: Date.now(), name, dates: [] });
                NX.saveState(); input.value = ''; render();
            };
            NX.$('#hb-input', body).onkeydown = (e) => { if (e.key === 'Enter') NX.$('#hb-add', body).click(); };
            NX.$$('[data-toggle]', body).forEach(btn => {
                btn.onclick = () => {
                    const h = NX.state.habits[parseInt(btn.dataset.toggle)];
                    if (!h.dates) h.dates = [];
                    if (h.dates.includes(today)) h.dates = h.dates.filter(d => d !== today);
                    else h.dates.push(today);
                    NX.saveState(); render();
                };
            });
            NX.$$('[data-del]', body).forEach(btn => {
                btn.onclick = () => { NX.state.habits.splice(parseInt(btn.dataset.del), 1); NX.saveState(); render(); };
            });
        };
        render();
    }
});

// --- 13. КАРТОЧКИ ---
NX.registerApp({
    id: 'flashcards', name: 'Карточки', icon: NX.icons.book, color: '#e05fb0',
    category: 'Программы', description: 'Обучающие карточки.', w: 500, h: 550,
    render(body) {
        if (!NX.state.flashcards) NX.state.flashcards = [];
        let currentCard = 0, flipped = false;
        const render = () => {
            const cards = NX.state.flashcards;
            const card = cards[currentCard];
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;padding:24px;gap:16px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:13px;color:var(--text-muted);">${cards.length > 0 ? `${currentCard + 1} / ${cards.length}` : 'Нет карточек'}</span>
                        <button class="btn ghost" id="fc-add">+ Добавить</button>
                    </div>
                    ${card ? `
                        <div id="fc-card" style="flex:1;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;padding:40px;cursor:pointer;font-size:20px;text-align:center;min-height:250px;">
                            ${NX.esc(flipped ? card.back : card.front)}
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button class="btn" id="fc-prev" ${currentCard === 0 ? 'disabled' : ''}>← Назад</button>
                            <button class="btn" id="fc-flip" style="flex:1;justify-content:center;">Перевернуть</button>
                            <button class="btn" id="fc-next" ${currentCard >= cards.length - 1 ? 'disabled' : ''}>Далее →</button>
                        </div>
                        <button class="btn ghost" id="fc-del" style="color:var(--danger);">Удалить карточку</button>
                    ` : '<div class="np-empty" style="flex:1;display:flex;align-items:center;justify-content:center;">Добавьте первую карточку</div>'}
                </div>
            `;
            NX.$('#fc-add', body).onclick = () => {
                const front = prompt('Лицевая сторона (вопрос):');
                if (!front) return;
                const back = prompt('Обратная сторона (ответ):');
                if (!back) return;
                NX.state.flashcards.push({ front, back });
                NX.saveState(); currentCard = NX.state.flashcards.length - 1; flipped = false; render();
            };
            const cardEl = NX.$('#fc-card', body);
            if (cardEl) cardEl.onclick = () => { flipped = !flipped; render(); };
            const prevBtn = NX.$('#fc-prev', body);
            if (prevBtn) prevBtn.onclick = () => { if (currentCard > 0) { currentCard--; flipped = false; render(); } };
            const nextBtn = NX.$('#fc-next', body);
            if (nextBtn) nextBtn.onclick = () => { if (currentCard < cards.length - 1) { currentCard++; flipped = false; render(); } };
            const flipBtn = NX.$('#fc-flip', body);
            if (flipBtn) flipBtn.onclick = () => { flipped = !flipped; render(); };
            const delBtn = NX.$('#fc-del', body);
            if (delBtn) delBtn.onclick = () => {
                if (confirm('Удалить карточку?')) {
                    NX.state.flashcards.splice(currentCard, 1);
                    if (currentCard >= NX.state.flashcards.length) currentCard = Math.max(0, NX.state.flashcards.length - 1);
                    NX.saveState(); flipped = false; render();
                }
            };
        };
        render();
    }
});

// --- 14. ПИКСЕЛЬ-АРТ ---
NX.registerApp({
    id: 'pixel_art', name: 'Пиксель-арт', icon: NX.icons.grid, color: '#ff9f0a',
    category: 'Программы', description: 'Редактор пиксель-арта 16×16.', w: 600, h: 650,
    render(body) {
        const SIZE = 16;
        if (!NX.state.pixelArt) NX.state.pixelArt = Array(SIZE * SIZE).fill('#ffffff');
        let currentColor = '#000000';
        const render = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <input type="color" id="pa-color" value="${currentColor}" style="width:40px;height:32px;border:none;cursor:pointer;">
                        <div class="sep"></div>
                        <button class="btn ghost" id="pa-clear">Очистить</button>
                        <button class="btn primary" id="pa-save">${NX.icons.save} Сохранить PNG</button>
                    </div>
                    <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--surface-2);">
                        <div id="pa-grid" style="display:grid;grid-template-columns:repeat(${SIZE}, 24px);gap:1px;background:var(--border);padding:1px;border-radius:4px;"></div>
                    </div>
                </div>
            `;
            const grid = NX.$('#pa-grid', body);
            NX.state.pixelArt.forEach((color, i) => {
                const cell = document.createElement('div');
                cell.style.cssText = `width:24px;height:24px;background:${color};cursor:pointer;`;
                cell.onmousedown = () => { NX.state.pixelArt[i] = currentColor; cell.style.background = currentColor; };
                cell.onmouseenter = (e) => { if (e.buttons === 1) { NX.state.pixelArt[i] = currentColor; cell.style.background = currentColor; } };
                grid.appendChild(cell);
            });
            NX.$('#pa-color', body).oninput = (e) => { currentColor = e.target.value; };
            NX.$('#pa-clear', body).onclick = () => {
                NX.state.pixelArt = Array(SIZE * SIZE).fill('#ffffff');
                NX.saveState(); render();
            };
            NX.$('#pa-save', body).onclick = () => {
                const canvas = document.createElement('canvas');
                canvas.width = SIZE; canvas.height = SIZE;
                const c = canvas.getContext('2d');
                NX.state.pixelArt.forEach((color, i) => {
                    c.fillStyle = color;
                    c.fillRect(i % SIZE, Math.floor(i / SIZE), 1, 1);
                });
                // Масштабируем для видимости
                const big = document.createElement('canvas');
                big.width = SIZE * 16; big.height = SIZE * 16;
                const bc = big.getContext('2d');
                bc.imageSmoothingEnabled = false;
                bc.drawImage(canvas, 0, 0, big.width, big.height);
                const name = prompt('Имя файла:', 'pixel_art.png') || 'pixel_art.png';
                NX.fs.addFile('Изображения', name, big.toDataURL('image/png'), 'img');
                NX.saveState();
                NX.notifications.push('Пиксель-арт', 'Сохранено в Галерею', 'save');
            };
        };
        render();
    }
});

// --- 15. БЕЛАЯ ДОСКА (WHITEBOARD) ---
NX.registerApp({
    id: 'whiteboard', name: 'Whiteboard', icon: NX.icons.point, color: '#0a84ff',
    category: 'Программы', description: 'Бесконечное полотно для рисования.', w: 900, h: 650,
    render(body, ctx) {
        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div class="toolbar">
                    <input type="color" id="wb-color" value="#000000" style="width:40px;height:32px;border:none;cursor:pointer;">
                    <input type="range" id="wb-size" min="1" max="40" value="4" style="width:100px;">
                    <div class="sep"></div>
                    <button class="btn ghost" id="wb-clear">Очистить</button>
                    <button class="btn primary" id="wb-save">${NX.icons.save} Сохранить</button>
                </div>
                <div style="flex:1;position:relative;background:#fff;overflow:hidden;" id="wb-wrap">
                    <canvas id="wb-canvas"></canvas>
                </div>
            </div>
        `;
        const canvas = NX.$('#wb-canvas', body);
        const wrap = NX.$('#wb-wrap', body);
        const c = canvas.getContext('2d');
        let drawing = false, color = '#000000', size = 4;
        const resize = () => {
            const rect = wrap.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const saved = canvas.toDataURL();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            c.setTransform(dpr, 0, 0, dpr, 0, 0);
            c.lineCap = 'round'; c.lineJoin = 'round';
            const img = new Image();
            img.onload = () => c.drawImage(img, 0, 0, rect.width, rect.height);
            img.src = saved;
        };
        setTimeout(resize, 100);
        window.addEventListener('resize', resize);
        NX.$('#wb-color', body).oninput = (e) => color = e.target.value;
        NX.$('#wb-size', body).oninput = (e) => size = +e.target.value;
        const pos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        canvas.addEventListener('pointerdown', (e) => {
            drawing = true;
            canvas.setPointerCapture(e.pointerId);
            const p = pos(e);
            c.beginPath(); c.moveTo(p.x, p.y);
            c.strokeStyle = color; c.lineWidth = size;
            c.lineTo(p.x + .1, p.y + .1); c.stroke();
        });
        canvas.addEventListener('pointermove', (e) => {
            if (!drawing) return;
            const p = pos(e);
            c.strokeStyle = color; c.lineWidth = size;
            c.lineTo(p.x, p.y); c.stroke();
        });
        canvas.addEventListener('pointerup', () => drawing = false);
        NX.$('#wb-clear', body).onclick = () => {
            c.fillStyle = '#fff';
            c.fillRect(0, 0, canvas.width, canvas.height);
        };
        NX.$('#wb-save', body).onclick = () => {
            const name = prompt('Имя файла:', 'whiteboard.png') || 'whiteboard.png';
            NX.fs.addFile('Изображения', name, canvas.toDataURL('image/png'), 'img');
            NX.saveState();
            NX.notifications.push('Whiteboard', 'Сохранено', 'save');
        };
        ctx.onClose(() => window.removeEventListener('resize', resize));
    }
});

// --- 16. ДНЕВНИК (зашифрованный) ---
NX.registerApp({
    id: 'diary', name: 'Дневник', icon: NX.icons.notes, color: '#e05fb0',
    category: 'Программы', description: 'Личный дневник.', w: 700, h: 550,
    render(body) {
        if (!NX.state.diary) NX.state.diary = [];
        let currentEntry = null;
        const render = () => {
            const entries = NX.state.diary;
            body.innerHTML = `
                <div class="notes-app">
                    <div class="notes-sidebar">
                        <div style="padding:12px;"><button class="btn primary" id="dr-new" style="width:100%;">+ Новая запись</button></div>
                        <div class="notes-list">
                            ${entries.length === 0 ? '<div class="np-empty">Пусто</div>' : entries.slice().reverse().map(e => `
                                <div class="note-item ${currentEntry === e.id ? 'active' : ''}" data-id="${e.id}">
                                    <div class="n-title">${NX.esc(e.title || 'Без названия')}</div>
                                    <div class="n-prev">${e.date || ''}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="notes-editor">
                        ${currentEntry ? (() => {
                            const e = entries.find(x => x.id === currentEntry);
                            if (!e) return '';
                            return `
                                <input type="text" id="dr-title" value="${NX.esc(e.title)}" placeholder="Заголовок">
                                <textarea id="dr-content" placeholder="Ваши мысли...">${NX.esc(e.content)}</textarea>
                            `;
                        })() : '<div class="np-empty" style="margin-top:100px;">Выберите запись</div>'}
                    </div>
                </div>
            `;
            NX.$$('.note-item', body).forEach(el => {
                el.onclick = () => { currentEntry = parseInt(el.dataset.id); render(); };
            });
            NX.$('#dr-new', body).onclick = () => {
                const now = new Date();
                const newEntry = {
                    id: Date.now(),
                    title: now.toLocaleDateString('ru-RU'),
                    content: '',
                    date: now.toLocaleDateString('ru-RU')
                };
                NX.state.diary.push(newEntry);
                currentEntry = newEntry.id;
                NX.saveState(); render();
            };
            if (currentEntry) {
                const titleEl = NX.$('#dr-title', body);
                const contentEl = NX.$('#dr-content', body);
                const entry = NX.state.diary.find(x => x.id === currentEntry);
                if (titleEl && entry) titleEl.oninput = () => { entry.title = titleEl.value; NX.saveState(); };
                if (contentEl && entry) contentEl.oninput = () => { entry.content = contentEl.value; NX.saveState(); };
            }
        };
        render();
    }
});

// --- 17. ЗАМЕТКИ PRO (с папками) ---
NX.registerApp({
    id: 'notes_pro', name: 'Заметки Pro', icon: NX.icons.notes, color: '#e8c65a',
    category: 'Программы', description: 'Заметки с папками.', w: 800, h: 600,
    render(body) {
        if (!NX.state.notesPro) NX.state.notesPro = { folders: [{ id: 'default', name: 'Все', notes: [] }], currentFolder: 'default', currentNote: null };
        const render = () => {
            const data = NX.state.notesPro;
            const folder = data.folders.find(f => f.id === data.currentFolder) || data.folders[0];
            const note = folder.notes.find(n => n.id === data.currentNote);
            body.innerHTML = `
                <div style="display:flex;height:100%;">
                    <div style="width:200px;background:var(--surface-2);border-right:1px solid var(--border);display:flex;flex-direction:column;">
                        <div style="padding:12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
                            <span style="font-weight:600;">Папки</span>
                            <button class="btn ghost" id="np-add-folder" style="height:24px;width:24px;padding:0;justify-content:center;">+</button>
                        </div>
                        <div style="flex:1;overflow-y:auto;">
                            ${data.folders.map(f => `<div class="files-nav-item ${f.id === data.currentFolder ? 'active' : ''}" data-folder="${f.id}">${NX.icons.folder} ${NX.esc(f.name)}</div>`).join('')}
                        </div>
                    </div>
                    <div style="width:260px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;">
                        <div style="padding:12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
                            <span style="font-weight:600;">Заметки</span>
                            <button class="btn ghost" id="np-add-note" style="height:24px;width:24px;padding:0;justify-content:center;">+</button>
                        </div>
                        <div style="flex:1;overflow-y:auto;">
                            ${folder.notes.map(n => `<div class="note-item ${n.id === data.currentNote ? 'active' : ''}" data-note="${n.id}"><div class="n-title">${NX.esc(n.title)}</div></div>`).join('') || '<div class="np-empty" style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">Нет заметок</div>'}
                        </div>
                    </div>
                    <div style="flex:1;display:flex;flex-direction:column;">
                        ${note ? `
                            <input type="text" id="np-title" value="${NX.esc(note.title)}" style="font-size:24px;font-weight:700;padding:24px 24px 8px;border:none;outline:none;background:transparent;color:var(--text);">
                            <textarea id="np-content" style="flex:1;padding:16px 24px;border:none;outline:none;resize:none;font:inherit;font-size:14px;background:transparent;color:var(--text);">${NX.esc(note.content)}</textarea>
                        ` : '<div class="np-empty" style="flex:1;display:flex;align-items:center;justify-content:center;">Выберите заметку</div>'}
                    </div>
                </div>
            `;
            NX.$$('[data-folder]', body).forEach(el => {
                el.onclick = () => { NX.state.notesPro.currentFolder = el.dataset.folder; NX.saveState(); render(); };
            });
            NX.$$('[data-note]', body).forEach(el => {
                el.onclick = () => { NX.state.notesPro.currentNote = parseInt(el.dataset.note); render(); };
            });
            NX.$('#np-add-folder', body).onclick = () => {
                const name = prompt('Имя папки:');
                if (!name) return;
                NX.state.notesPro.folders.push({ id: NX.uid('f'), name, notes: [] });
                NX.saveState(); render();
            };
            NX.$('#np-add-note', body).onclick = () => {
                const folder = NX.state.notesPro.folders.find(f => f.id === NX.state.notesPro.currentFolder);
                const note = { id: Date.now(), title: 'Новая заметка', content: '' };
                folder.notes.push(note);
                NX.state.notesPro.currentNote = note.id;
                NX.saveState(); render();
            };
            const titleEl = NX.$('#np-title', body);
            const contentEl = NX.$('#np-content', body);
            if (titleEl && note) titleEl.oninput = () => { note.title = titleEl.value; NX.saveState(); };
            if (contentEl && note) contentEl.oninput = () => { note.content = contentEl.value; NX.saveState(); };
        };
        render();
    }
});

// --- 18. РЕЗЮМЕ ---
NX.registerApp({
    id: 'resume', name: 'Резюме', icon: NX.icons.fileTxt, color: '#4a6fa5',
    category: 'Программы', description: 'Конструктор резюме.', w: 800, h: 650,
    render(body) {
        const data = NX.state.resumeData || {
            name: '', position: '', email: '', phone: '', about: '', experience: '', education: '', skills: ''
        };
        NX.state.resumeData = data;
        body.innerHTML = `
            <div style="display:flex;height:100%;">
                <div style="flex:1;padding:24px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;border-right:1px solid var(--border);">
                    <h2 style="font-size:18px;">Данные</h2>
                    <input class="input" placeholder="Имя" data-f="name" value="${NX.esc(data.name)}">
                    <input class="input" placeholder="Должность" data-f="position" value="${NX.esc(data.position)}">
                    <input class="input" placeholder="Email" data-f="email" value="${NX.esc(data.email)}">
                    <input class="input" placeholder="Телефон" data-f="phone" value="${NX.esc(data.phone)}">
                    <textarea class="input" placeholder="О себе" data-f="about" style="min-height:80px;padding:8px;">${NX.esc(data.about)}</textarea>
                    <textarea class="input" placeholder="Опыт работы" data-f="experience" style="min-height:100px;padding:8px;">${NX.esc(data.experience)}</textarea>
                    <textarea class="input" placeholder="Образование" data-f="education" style="min-height:80px;padding:8px;">${NX.esc(data.education)}</textarea>
                    <input class="input" placeholder="Навыки (через запятую)" data-f="skills" value="${NX.esc(data.skills)}">
                    <button class="btn primary" id="rs-print">Скачать PDF</button>
                </div>
                <div style="flex:1;padding:24px;overflow-y:auto;background:var(--surface-2);">
                    <div id="rs-preview" style="background:#fff;color:#000;padding:40px;border-radius:4px;box-shadow:var(--shadow-lg);font-family:serif;"></div>
                </div>
            </div>
        `;
        const update = () => {
            const preview = NX.$('#rs-preview', body);
            preview.innerHTML = `
                <h1 style="font-size:32px;margin:0 0 8px;">${NX.esc(data.name) || 'Ваше имя'}</h1>
                <div style="font-size:18px;color:#666;margin-bottom:16px;">${NX.esc(data.position) || 'Должность'}</div>
                <div style="font-size:13px;color:#444;margin-bottom:16px;">${NX.esc(data.email)} ${data.phone ? '· ' + NX.esc(data.phone) : ''}</div>
                ${data.about ? `<h2 style="font-size:16px;margin:16px 0 8px;border-bottom:2px solid #000;padding-bottom:4px;">О себе</h2><p style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${NX.esc(data.about)}</p>` : ''}
                ${data.experience ? `<h2 style="font-size:16px;margin:16px 0 8px;border-bottom:2px solid #000;padding-bottom:4px;">Опыт работы</h2><p style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${NX.esc(data.experience)}</p>` : ''}
                ${data.education ? `<h2 style="font-size:16px;margin:16px 0 8px;border-bottom:2px solid #000;padding-bottom:4px;">Образование</h2><p style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${NX.esc(data.education)}</p>` : ''}
                ${data.skills ? `<h2 style="font-size:16px;margin:16px 0 8px;border-bottom:2px solid #000;padding-bottom:4px;">Навыки</h2><p style="font-size:14px;line-height:1.6;">${NX.esc(data.skills)}</p>` : ''}
            `;
        };
        NX.$$('[data-f]', body).forEach(el => {
            el.oninput = () => { data[el.dataset.f] = el.value; NX.saveState(); update(); };
        });
        NX.$('#rs-print', body).onclick = () => {
            const win = window.open('', '', 'width=800,height=600');
            win.document.write(`<html><head><title>Резюме</title><style>body{font-family:serif;padding:40px;}</style></head><body>${NX.$('#rs-preview', body).innerHTML}</body></html>`);
            win.document.close();
            setTimeout(() => win.print(), 300);
        };
        update();
    }
});

// --- 19. ТАБЛИЦА МЕНДЕЛЕЕВА ---
NX.registerApp({
    id: 'periodic', name: 'Таблица Менделеева', icon: NX.icons.sheet, color: '#10b981',
    category: 'Утилиты', description: 'Периодическая таблица элементов.', w: 900, h: 600, single: true,
    render(body) {
        const elements = [
            {z:1,s:'H',n:'Водород',m:1.008,c:1},{z:2,s:'He',n:'Гелий',m:4.003,c:18},
            {z:3,s:'Li',n:'Литий',m:6.94,c:1},{z:4,s:'Be',n:'Бериллий',m:9.012,c:2},
            {z:5,s:'B',n:'Бор',m:10.81,c:13},{z:6,s:'C',n:'Углерод',m:12.011,c:14},
            {z:7,s:'N',n:'Азот',m:14.007,c:15},{z:8,s:'O',n:'Кислород',m:15.999,c:16},
            {z:9,s:'F',n:'Фтор',m:18.998,c:17},{z:10,s:'Ne',n:'Неон',m:20.18,c:18},
            {z:11,s:'Na',n:'Натрий',m:22.99,c:1},{z:12,s:'Mg',n:'Магний',m:24.305,c:2},
            {z:13,s:'Al',n:'Алюминий',m:26.982,c:13},{z:14,s:'Si',n:'Кремний',m:28.085,c:14},
            {z:15,s:'P',n:'Фосфор',m:30.974,c:15},{z:16,s:'S',n:'Сера',m:32.06,c:16},
            {z:17,s:'Cl',n:'Хлор',m:35.45,c:17},{z:18,s:'Ar',n:'Аргон',m:39.948,c:18},
            {z:19,s:'K',n:'Калий',m:39.098,c:1},{z:20,s:'Ca',n:'Кальций',m:40.078,c:2},
            {z:26,s:'Fe',n:'Железо',m:55.845,c:8},{z:29,s:'Cu',n:'Медь',m:63.546,c:11},
            {z:30,s:'Zn',n:'Цинк',m:65.38,c:12},{z:47,s:'Ag',n:'Серебро',m:107.868,c:11},
            {z:79,s:'Au',n:'Золото',m:196.967,c:11},{z:80,s:'Hg',n:'Ртуть',m:200.592,c:12}
        ];
        body.innerHTML = `
            <div style="padding:24px;height:100%;overflow-y:auto;">
                <h2 style="font-size:20px;margin-bottom:16px;">Таблица Менделеева (основные элементы)</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;">
                    ${elements.map(e => `
                        <div class="card" style="padding:10px;text-align:center;cursor:pointer;" onclick="alert('${e.n} — атомная масса ${e.m}')">
                            <div style="font-size:24px;font-weight:700;color:var(--accent);">${e.s}</div>
                            <div style="font-size:11px;">${e.z}</div>
                            <div style="font-size:11px;color:var(--text-muted);">${e.n}</div>
                            <div style="font-size:10px;">${e.m}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
});

// --- 20. ФОРМУЛЫ ФИЗИКИ ---
NX.registerApp({
    id: 'physics', name: 'Формулы физики', icon: NX.icons.book, color: '#3b82f6',
    category: 'Утилиты', description: 'Справочник формул по физике.', w: 700, h: 600, single: true,
    render(body) {
        const formulas = [
            { name: 'Скорость', f: 'v = s / t', desc: 'Скорость = путь / время' },
            { name: 'Ускорение', f: 'a = (v - v₀) / t', desc: 'Изменение скорости за время' },
            { name: 'Сила (2-й закон Ньютона)', f: 'F = m × a', desc: 'Сила = масса × ускорение' },
            { name: 'Второй закон Ньютона', f: 'F = m × a', desc: '' },
            { name: 'Третий закон Ньютона', f: 'F₁₂ = -F₂₁', desc: 'Действие = противодействие' },
            { name: 'Кинетическая энергия', f: 'Eₖ = m × v² / 2', desc: '' },
            { name: 'Потенциальная энергия', f: 'Eₚ = m × g × h', desc: '' },
            { name: 'Работа', f: 'A = F × s × cos(α)', desc: '' },
            { name: 'Мощность', f: 'P = A / t', desc: '' },
            { name: 'Плотность', f: 'ρ = m / V', desc: '' },
            { name: 'Давление', f: 'p = F / S', desc: '' },
            { name: 'Закон Ома', f: 'I = U / R', desc: 'Сила тока = Напряжение / Сопротивление' },
            { name: 'Электрическая мощность', f: 'P = U × I', desc: '' },
            { name: 'Закон Джоуля-Ленца', f: 'Q = I² × R × t', desc: '' }
        ];
        body.innerHTML = `
            <div style="padding:24px;height:100%;overflow-y:auto;">
                <h2 style="font-size:20px;margin-bottom:16px;">Формулы физики</h2>
                <div style="display:flex;flex-direction:column;gap:12px;">
                    ${formulas.map(f => `
                        <div class="card" style="padding:16px;">
                            <div style="font-weight:600;margin-bottom:4px;">${f.name}</div>
                            <div style="font-size:18px;font-family:monospace;color:var(--accent);margin-bottom:4px;">${f.f}</div>
                            ${f.desc ? `<div style="font-size:12px;color:var(--text-muted);">${f.desc}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
});

// --- 21. РЕЗЕРВНЫЕ КОПИИ ---
NX.registerApp({
    id: 'backup', name: 'Резервные копии', icon: NX.icons.save, color: '#0a84ff',
    category: 'Система', description: 'Экспорт/импорт всех данных.', w: 550, h: 500, single: true,
    render(body) {
        body.innerHTML = `
            <div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;">
                <h2 style="font-size:20px;">Резервные копии</h2>
                <div style="font-size:13px;color:var(--text-muted);">Экспортируйте все данные (настройки, файлы, приложения) в один файл. Импортируйте обратно при необходимости.</div>
                <button class="btn primary" id="bk-export" style="height:44px;">${NX.icons.download} Экспортировать всё</button>
                <button class="btn" id="bk-import" style="height:44px;">${NX.icons.up} Импортировать из файла</button>
                <div class="card">
                    <div class="row"><span>Настроек</span><span>${Object.keys(NX.state).length}</span></div>
                    <div class="row"><span>Приложений установлено</span><span>${Array.isArray(NX.state.installed) ? NX.state.installed.length : 0}</span></div>
                    <div class="row"><span>Файлов</span><span>${NX.fs.root.children.reduce((a,c) => a + c.children.length, 0)}</span></div>
                    <div class="row"><span>Размер</span><span>${(JSON.stringify(NX.state).length / 1024).toFixed(1)} КБ</span></div>
                </div>
                <button class="btn ghost" id="bk-reset" style="color:var(--danger);margin-top:auto;">Полный сброс</button>
            </div>
        `;
        NX.$('#bk-export', body).onclick = () => {
            const data = {
                state: NX.state,
                fs: NX.fs.root,
                timestamp: new Date().toISOString(),
                version: NX.VERSION || '3.3'
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `nextel_backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            NX.notifications.push('Резервные копии', 'Экспорт завершён', 'check');
        };
        NX.$('#bk-import', body).onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        if (data.state) NX.state = data.state;
                        if (data.fs) NX.fs.root = data.fs;
                        NX.saveState();
                        NX.notifications.push('Резервные копии', 'Импорт завершён. Перезагрузка...', 'check');
                        setTimeout(() => location.reload(), 1500);
                    } catch (err) {
                        NX.notifications.push('Резервные копии', 'Ошибка чтения файла', 'info');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        };
        NX.$('#bk-reset', body).onclick = () => {
            if (confirm('Полностью сбросить ВСЁ? Это удалит все данные.')) {
                localStorage.clear();
                location.reload();
            }
        };
    }
});

// --- 22. РЕЕСТР ---
NX.registerApp({
    id: 'registry', name: 'Реестр', icon: NX.icons.device, color: '#111827',
    category: 'Система', description: 'Просмотр состояния системы.', w: 700, h: 550, single: true,
    render(body) {
        const render = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <span style="font-weight:600;">Реестр Nextel</span>
                        <div style="flex:1"></div>
                        <button class="btn ghost" id="rg-refresh">${NX.icons.refresh} Обновить</button>
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:16px;">
                        <div class="card">
                            ${Object.entries(NX.state).map(([k, v]) => `
                                <div class="row">
                                    <span style="font-family:monospace;">${NX.esc(k)}</span>
                                    <span style="font-family:monospace;font-size:11px;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${NX.esc(JSON.stringify(v).slice(0, 80))}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            NX.$('#rg-refresh', body).onclick = render;
        };
        render();
    }
});

console.log('[NX-APP_MORE] ' + 22 + ' real apps registered');
