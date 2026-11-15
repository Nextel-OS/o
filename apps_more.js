/* ============================================================
   NEXTEL OS 2.0 — РЕАЛЬНЫЕ ПРИЛОЖЕНИЯ (APPS_MORE.JS) v2.0
   Секундомер · Пиксель-арт · Таблица Менделеева (118 элементов)
   ============================================================ */

NX.APPS_MORE_VERSION = '2.0';
NX.APPS_MORE_IDS = NX.APPS_MORE_IDS || [];
console.log('[NX-APPS_MORE] Loading v' + NX.APPS_MORE_VERSION);

function regMore(cfg) {
    if (typeof NX.registerApp !== 'function') { console.error('[NX-APPS_MORE] registerApp missing'); return false; }
    if (!NX.apps) NX.apps = {};
    delete NX.apps[cfg.id];
    NX.registerApp(cfg);
    NX.APPS_MORE_IDS.push(cfg.id);
    return true;
}

// ---------- 1. ГЕНЕРАТОР ПАРОЛЕЙ ----------
regMore({
    id: 'password_gen', name: 'Генератор паролей', icon: NX.icons.passwords, color: '#30b06b',
    category: 'Утилиты', description: 'Генератор надёжных паролей.', w: 500, h: 520, single: true,
    render(body) {
        let len = 16, u = true, l = true, d = true, s = true;
        const gen = () => {
            let chars = '';
            if (u) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (l) chars += 'abcdefghijklmnopqrstuvwxyz';
            if (d) chars += '0123456789';
            if (s) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
            if (!chars) chars = 'abc123';
            let pwd = '';
            const arr = new Uint32Array(len); crypto.getRandomValues(arr);
            for (let i = 0; i < len; i++) pwd += chars[arr[i] % chars.length];
            const res = NX.$('#pout', body); if (res) res.textContent = pwd;
        };
        const draw = () => {
            body.innerHTML = `<div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;">
                <h2 style="font-size:20px;">Генератор паролей</h2>
                <div id="pout" style="padding:16px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;font-family:monospace;font-size:15px;word-break:break-all;min-height:60px;display:flex;align-items:center;"></div>
                <div style="display:flex;gap:8px;"><button class="btn primary" id="pg" style="flex:1;">Сгенерировать</button><button class="btn" id="pc">Копировать</button></div>
                <div class="card">
                    <div class="row"><span>Длина: <b>${len}</b></span><input type="range" min="6" max="64" value="${len}" id="pl" style="width:180px;"></div>
                    <div class="row"><span>Заглавные</span><div class="switch ${u?'on':''}" data-o="u"></div></div>
                    <div class="row"><span>Строчные</span><div class="switch ${l?'on':''}" data-o="l"></div></div>
                    <div class="row"><span>Цифры</span><div class="switch ${d?'on':''}" data-o="d"></div></div>
                    <div class="row"><span>Символы</span><div class="switch ${s?'on':''}" data-o="s"></div></div>
                </div></div>`;
            NX.$('#pg', body).onclick = gen;
            NX.$('#pc', body).onclick = () => { const t = NX.$('#pout', body).textContent; if (t) { navigator.clipboard.writeText(t); NX.notifications.push('Пароли', 'Скопировано', 'check'); } };
            NX.$('#pl', body).oninput = e => { len = +e.target.value; draw(); gen(); };
            NX.$$('[data-o]', body).forEach(sw => sw.onclick = () => { const o = sw.dataset.o; if (o==='u') u=!u; if (o==='l') l=!l; if (o==='d') d=!d; if (o==='s') s=!s; sw.classList.toggle('on'); });
            gen();
        };
        draw();
    }
});

// ---------- 2. ИНЖЕНЕРНЫЙ КАЛЬКУЛЯТОР ----------
regMore({
    id: 'calculator_sci', name: 'Инженерный калькулятор', icon: NX.icons.calc, color: '#8b5cf6',
    category: 'Утилиты', description: 'Научный калькулятор.', w: 420, h: 620, single: true,
    render(body) {
        body.innerHTML = `<div class="calc-app"><div class="calc-display"><div class="calc-prev"></div><div class="calc-cur">0</div></div><div class="calc-buttons" style="grid-template-columns:repeat(5,1fr);">
            <button class="calc-btn op" data-k="sin">sin</button><button class="calc-btn op" data-k="cos">cos</button><button class="calc-btn op" data-k="tan">tan</button><button class="calc-btn op" data-k="sqrt">√</button><button class="calc-btn op" data-k="C">C</button>
            <button class="calc-btn op" data-k="log">log</button><button class="calc-btn op" data-k="ln">ln</button><button class="calc-btn op" data-k="pow">x^y</button><button class="calc-btn op" data-k="fact">n!</button><button class="calc-btn op" data-k="/">÷</button>
            <button class="calc-btn" data-k="7">7</button><button class="calc-btn" data-k="8">8</button><button class="calc-btn" data-k="9">9</button><button class="calc-btn op" data-k="*">×</button><button class="calc-btn op" data-k="pi">π</button>
            <button class="calc-btn" data-k="4">4</button><button class="calc-btn" data-k="5">5</button><button class="calc-btn" data-k="6">6</button><button class="calc-btn op" data-k="-">−</button><button class="calc-btn op" data-k="e">e</button>
            <button class="calc-btn" data-k="1">1</button><button class="calc-btn" data-k="2">2</button><button class="calc-btn" data-k="3">3</button><button class="calc-btn op" data-k="+">+</button><button class="calc-btn" data-k="±">±</button>
            <button class="calc-btn" data-k="0" style="grid-column:span 2;">0</button><button class="calc-btn" data-k=",">,</button><button class="calc-btn op" data-k="%">%</button><button class="calc-btn eq" data-k="=">=</button>
        </div></div>`;
        let cur = '0', prev = null, op = null, fresh = false;
        const curEl = NX.$('.calc-cur', body), prevEl = NX.$('.calc-prev', body);
        const upd = () => { curEl.textContent = cur; prevEl.textContent = prev !== null ? `${prev} ${op || ''}` : ''; };
        const fact = n => n <= 1 ? 1 : n * fact(n - 1);
        body.addEventListener('click', e => {
            const b = e.target.closest('.calc-btn'); if (!b) return;
            const k = b.dataset.k; NX.audio.click();
            const v = parseFloat(cur) || 0;
            if (k === 'C') { cur='0'; prev=null; op=null; fresh=false; }
            else if (k === '±') cur = String(-v);
            else if (k === '%') cur = String(v/100);
            else if (k === 'sin') cur = String(Math.sin(v));
            else if (k === 'cos') cur = String(Math.cos(v));
            else if (k === 'tan') cur = String(Math.tan(v));
            else if (k === 'sqrt') cur = String(Math.sqrt(v));
            else if (k === 'log') cur = String(Math.log10(v));
            else if (k === 'ln') cur = String(Math.log(v));
            else if (k === 'fact') cur = String(fact(Math.floor(v)));
            else if (k === 'pi') { cur = String(Math.PI); fresh = true; }
            else if (k === 'e') { cur = String(Math.E); fresh = true; }
            else if ('0123456789'.includes(k)) { if (fresh) { cur = k; fresh=false; } else cur = cur==='0' ? k : cur+k; }
            else if (k === ',') { if (!cur.includes('.')) cur += '.'; }
            else if (['+','-','*','/','pow'].includes(k)) { prev = v; op = k; fresh = true; }
            else if (k === '=') { if (prev!==null && op) { let r; if (op==='+') r=prev+v; else if (op==='-') r=prev-v; else if (op==='*') r=prev*v; else if (op==='/') r=v===0?NaN:prev/v; else if (op==='pow') r=Math.pow(prev,v); cur=String(r); prev=null; op=null; } fresh=true; }
            upd();
        });
        upd();
    }
});

// ---------- 3. КАЛЬКУЛЯТОР ИМТ ----------
regMore({
    id: 'bmi_calc', name: 'Калькулятор ИМТ', icon: NX.icons.calc, color: '#ef4444',
    category: 'Утилиты', description: 'Индекс массы тела.', w: 450, h: 420, single: true,
    render(body) {
        body.innerHTML = `<div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;"><h2 style="font-size:20px;">ИМТ</h2><div><label style="font-size:12px;color:var(--text-muted);">Вес (кг)</label><input type="number" class="input" id="bw" value="70"></div><div><label style="font-size:12px;color:var(--text-muted);">Рост (см)</label><input type="number" class="input" id="bh" value="175"></div><button class="btn primary" id="bc">Рассчитать</button><div id="br" style="text-align:center;padding:20px;background:var(--surface-2);border-radius:8px;"></div></div>`;
        NX.$('#bc', body).onclick = () => { const w = parseFloat(NX.$('#bw', body).value), h = parseFloat(NX.$('#bh', body).value)/100; if (!w||!h) return; const bmi = (w/(h*h)).toFixed(1); let cat='Норма', col='#10b981'; if (bmi<18.5){cat='Недостаточный';col='#f59e0b';} else if (bmi>=25&&bmi<30){cat='Избыточный';col='#f59e0b';} else if (bmi>=30){cat='Ожирение';col='#ef4444';} NX.$('#br', body).innerHTML = `<div style="font-size:48px;font-weight:300;color:${col};">${bmi}</div><div style="font-size:14px;color:var(--text-muted);margin-top:8px;">${cat}</div>`; };
    }
});

// ---------- 4. КАЛЬКУЛЯТОР ЧАЕВЫХ ----------
regMore({
    id: 'tip_calc', name: 'Калькулятор чаевых', icon: NX.icons.calc, color: '#0a84ff',
    category: 'Утилиты', description: 'Расчёт чаевых.', w: 450, h: 470, single: true,
    render(body) {
        body.innerHTML = `<div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;"><h2 style="font-size:20px;">Чаевые</h2><div><label style="font-size:12px;color:var(--text-muted);">Сумма (₽)</label><input type="number" class="input" id="ts" value="1000"></div><div><label style="font-size:12px;color:var(--text-muted);">Чаевые (%)</label><input type="number" class="input" id="tp" value="15"></div><div><label style="font-size:12px;color:var(--text-muted);">Человек</label><input type="number" class="input" id="tn" value="1" min="1"></div><button class="btn primary" id="tc">Рассчитать</button><div id="tr" style="padding:20px;background:var(--surface-2);border-radius:8px;"></div></div>`;
        NX.$('#tc', body).onclick = () => { const s = parseFloat(NX.$('#ts', body).value)||0, p = parseFloat(NX.$('#tp', body).value)||0, n = Math.max(1,parseInt(NX.$('#tn', body).value)||1); const tip = s*p/100, tot = s+tip; NX.$('#tr', body).innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Чаевые:</span><b>${tip.toFixed(2)} ₽</b></div><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Итого:</span><b>${tot.toFixed(2)} ₽</b></div><div style="display:flex;justify-content:space-between;color:var(--accent);"><span>На человека:</span><b>${(tot/n).toFixed(2)} ₽</b></div>`; };
    }
});

// ---------- 5. КАЛЬКУЛЯТОР ВОЗРАСТА ----------
regMore({
    id: 'age_calc', name: 'Калькулятор возраста', icon: NX.icons.calendar, color: '#e8534a',
    category: 'Утилиты', description: 'Сколько вам лет.', w: 450, h: 380, single: true,
    render(body) {
        body.innerHTML = `<div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;"><h2 style="font-size:20px;">Возраст</h2><div><label style="font-size:12px;color:var(--text-muted);">Дата рождения</label><input type="date" class="input" id="ad"></div><button class="btn primary" id="ac">Рассчитать</button><div id="ar" style="padding:20px;background:var(--surface-2);border-radius:8px;text-align:center;"></div></div>`;
        NX.$('#ac', body).onclick = () => { const d = NX.$('#ad', body).value; if (!d) return; const b = new Date(d), n = new Date(); let y = n.getFullYear()-b.getFullYear(), m = n.getMonth()-b.getMonth(), dd = n.getDate()-b.getDate(); if (dd<0){m--;dd+=new Date(n.getFullYear(),n.getMonth(),0).getDate();} if (m<0){y--;m+=12;} NX.$('#ar', body).innerHTML = `<div style="font-size:48px;font-weight:300;color:var(--accent);">${y}</div><div style="font-size:14px;color:var(--text-muted);margin-top:8px;">лет, ${m} мес., ${dd} дн.</div>`; };
    }
});

// ---------- 6. СЕКУНДОМЕР (ИСПРАВЛЕН) ----------
regMore({
    id: 'stopwatch', name: 'Секундомер', icon: NX.icons.clock, color: '#ff9f0a',
    category: 'Утилиты', description: 'Точный секундомер.', w: 500, h: 480, single: true,
    render(body, ctx) {
        let elapsed = 0, running = false, iv = null, laps = [], startTime = 0;
        const fmt = ms => {
            const m = Math.floor(ms/60000), s = Math.floor(ms/1000)%60, cs = Math.floor(ms/10)%100;
            return `${NX.pad(m)}:${NX.pad(s)}.${NX.pad(cs)}`;
        };
        // Рисуем интерфейс ОДИН раз
        body.innerHTML = `
            <div style="padding:24px;display:flex;flex-direction:column;align-items:center;gap:20px;height:100%;">
                <div style="font-size:72px;font-weight:200;font-variant-numeric:tabular-nums;" id="sw-time">00:00.00</div>
                <div style="display:flex;gap:12px;">
                    <button class="btn primary" id="sw-toggle" style="min-width:120px;justify-content:center;">Старт</button>
                    <button class="btn ghost" id="sw-lap">Круг</button>
                    <button class="btn ghost" id="sw-reset">Сброс</button>
                </div>
                <div id="sw-laps" style="flex:1;overflow-y:auto;width:100%;max-width:400px;"></div>
            </div>`;
        const timeEl = NX.$('#sw-time', body);
        const toggleBtn = NX.$('#sw-toggle', body);
        const lapsEl = NX.$('#sw-laps', body);
        
        // Обновляем ТОЛЬКО текст таймера, без перерисовки
        const updateTime = () => { timeEl.textContent = fmt(elapsed); };
        
        // Обновление списка кругов
        const updateLaps = () => {
            lapsEl.innerHTML = laps.map((l, i) => `<div style="padding:6px 12px;display:flex;justify-content:space-between;background:var(--surface-2);border-radius:4px;margin-bottom:4px;"><span>Круг ${i+1}</span><b>${fmt(l)}</b></div>`).join('');
        };
        
        // Старт/пауза
        toggleBtn.onclick = () => {
            if (running) {
                clearInterval(iv);
                running = false;
                toggleBtn.textContent = 'Старт';
            } else {
                startTime = Date.now() - elapsed;
                iv = setInterval(() => { elapsed = Date.now() - startTime; updateTime(); }, 50);
                running = true;
                toggleBtn.textContent = 'Пауза';
            }
        };
        
        // Круг
        NX.$('#sw-lap', body).onclick = () => {
            if (elapsed > 0) { laps.push(elapsed); updateLaps(); }
        };
        
        // Сброс
        NX.$('#sw-reset', body).onclick = () => {
            clearInterval(iv);
            running = false;
            elapsed = 0;
            laps = [];
            toggleBtn.textContent = 'Старт';
            updateTime();
            updateLaps();
        };
        
        ctx.onClose(() => clearInterval(iv));
        updateTime();
    }
});

// ---------- 7. ТАЙМЕР ----------
regMore({
    id: 'timer', name: 'Таймер', icon: NX.icons.clock, color: '#5e5ce6',
    category: 'Утилиты', description: 'Обратный отсчёт.', w: 500, h: 450, single: true,
    render(body, ctx) {
        let total = 60, remaining = 60, running = false, iv = null;
        body.innerHTML = `
            <div style="padding:24px;display:flex;flex-direction:column;align-items:center;gap:20px;height:100%;">
                <div style="font-size:72px;font-weight:200;font-variant-numeric:tabular-nums;" id="tm-time">01:00</div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input type="number" class="input" id="tm-m" value="1" style="width:70px;">
                    <span>:</span>
                    <input type="number" class="input" id="tm-s" value="0" style="width:70px;">
                </div>
                <div style="display:flex;gap:12px;">
                    <button class="btn primary" id="tm-toggle" style="min-width:120px;justify-content:center;">Старт</button>
                    <button class="btn ghost" id="tm-reset">Сброс</button>
                </div>
            </div>`;
        const timeEl = NX.$('#tm-time', body);
        const toggleBtn = NX.$('#tm-toggle', body);
        const updateTime = () => {
            timeEl.textContent = `${NX.pad(Math.floor(remaining/60))}:${NX.pad(remaining%60)}`;
            timeEl.style.color = remaining <= 10 ? 'var(--danger)' : 'inherit';
        };
        toggleBtn.onclick = () => {
            if (running) { clearInterval(iv); running = false; toggleBtn.textContent = 'Старт'; return; }
            if (remaining <= 0) {
                total = (parseInt(NX.$('#tm-m', body).value) || 0) * 60 + (parseInt(NX.$('#tm-s', body).value) || 0);
                remaining = total;
            }
            if (remaining <= 0) return;
            running = true;
            toggleBtn.textContent = 'Пауза';
            iv = setInterval(() => {
                remaining--;
                updateTime();
                if (remaining <= 0) {
                    clearInterval(iv);
                    running = false;
                    toggleBtn.textContent = 'Старт';
                    NX.audio.notify();
                    NX.notifications.push('Таймер', 'Время вышло!', 'check');
                }
            }, 1000);
        };
        NX.$('#tm-reset', body).onclick = () => {
            clearInterval(iv);
            running = false;
            toggleBtn.textContent = 'Старт';
            total = (parseInt(NX.$('#tm-m', body).value) || 0) * 60 + (parseInt(NX.$('#tm-s', body).value) || 0);
            remaining = total;
            updateTime();
        };
        ctx.onClose(() => clearInterval(iv));
        updateTime();
    }
});

// ---------- 8. МИРОВЫЕ ЧАСЫ ----------
regMore({
    id: 'world_clock', name: 'Мировые часы', icon: NX.icons.clock, color: '#34aadc',
    category: 'Утилиты', description: 'Часы в разных городах.', w: 500, h: 520, single: true,
    render(body, ctx) {
        const cities = [
            { name: 'Москва', tz: 'Europe/Moscow' }, { name: 'Лондон', tz: 'Europe/London' },
            { name: 'Нью-Йорк', tz: 'America/New_York' }, { name: 'Токио', tz: 'Asia/Tokyo' },
            { name: 'Дубай', tz: 'Asia/Dubai' }, { name: 'Сидней', tz: 'Australia/Sydney' },
            { name: 'Лос-Анджелес', tz: 'America/Los_Angeles' }, { name: 'Париж', tz: 'Europe/Paris' }
        ];
        body.innerHTML = `<div style="padding:24px;height:100%;overflow-y:auto;"><h2 style="font-size:20px;margin-bottom:16px;">Мировые часы</h2><div style="display:grid;gap:8px;">${cities.map(c => `<div class="card" style="padding:16px;"><div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-weight:600;">${c.name}</div><div style="font-size:24px;font-weight:300;font-variant-numeric:tabular-nums;" data-tz="${c.tz}">--:--</div></div></div>`).join('')}</div></div>`;
        const upd = () => { NX.$$('[data-tz]', body).forEach(el => { try { el.textContent = new Date().toLocaleTimeString('ru-RU', { timeZone: el.dataset.tz, hour: '2-digit', minute: '2-digit' }); } catch(e) {} }); };
        const iv = setInterval(upd, 15000);
        ctx.onClose(() => clearInterval(iv));
        upd();
    }
});

// ---------- 9. ГРАДИЕНТЫ ----------
regMore({
    id: 'gradient', name: 'Градиенты', icon: NX.icons.point, color: '#e05fb0',
    category: 'Программы', description: 'Генератор CSS-градиентов.', w: 550, h: 570, single: true,
    render(body) {
        let c1 = '#0a84ff', c2 = '#e05fb0', angle = 135;
        const draw = () => {
            body.innerHTML = `<div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;"><h2 style="font-size:20px;">Градиенты</h2><div style="height:200px;border-radius:12px;background:linear-gradient(${angle}deg,${c1},${c2});"></div><div style="display:flex;gap:8px;"><div style="flex:1;"><label style="font-size:12px;color:var(--text-muted);">Цвет 1</label><input type="color" id="g1" value="${c1}" style="width:100%;height:40px;border:none;"></div><div style="flex:1;"><label style="font-size:12px;color:var(--text-muted);">Цвет 2</label><input type="color" id="g2" value="${c2}" style="width:100%;height:40px;border:none;"></div></div><div><label style="font-size:12px;color:var(--text-muted);">Угол: ${angle}°</label><input type="range" min="0" max="360" value="${angle}" id="ga" style="width:100%;"></div><div class="card"><div class="row"><span>CSS</span></div><div id="css" style="padding:12px;font-family:monospace;font-size:12px;word-break:break-all;"></div></div><button class="btn primary" id="cp">Копировать</button></div>`;
            const css = `background: linear-gradient(${angle}deg, ${c1}, ${c2});`;
            NX.$('#css', body).textContent = css;
            NX.$('#g1', body).oninput = e => { c1 = e.target.value; draw(); };
            NX.$('#g2', body).oninput = e => { c2 = e.target.value; draw(); };
            NX.$('#ga', body).oninput = e => { angle = +e.target.value; draw(); };
            NX.$('#cp', body).onclick = () => { navigator.clipboard.writeText(css); NX.notifications.push('Градиенты', 'Скопировано', 'check'); };
        };
        draw();
    }
});

// ---------- 10. ВЫБОР ЦВЕТА ----------
regMore({
    id: 'color_picker', name: 'Выбор цвета', icon: NX.icons.point, color: '#e05fb0',
    category: 'Утилиты', description: 'HEX, RGB, HSL.', w: 450, h: 520, single: true,
    render(body) {
        let color = '#0a84ff';
        const draw = () => {
            const hex = color.toLowerCase();
            const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
            body.innerHTML = `<div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;"><h2 style="font-size:20px;">Выбор цвета</h2><div style="height:150px;border-radius:12px;background:${color};border:1px solid var(--border);"></div><input type="color" id="ci" value="${color}" style="width:100%;height:60px;border:none;"><div class="card"><div class="row"><span>HEX</span><span style="font-family:monospace;">${hex}</span></div><div class="row"><span>RGB</span><span style="font-family:monospace;">rgb(${r}, ${g}, ${b})</span></div></div><button class="btn primary" id="cc">Копировать HEX</button></div>`;
            NX.$('#ci', body).oninput = e => { color = e.target.value; draw(); };
            NX.$('#cc', body).onclick = () => { navigator.clipboard.writeText(hex); NX.notifications.push('Цвет', hex + ' скопирован', 'check'); };
        };
        draw();
    }
});

// ---------- 11. ЗАДАЧИ PRO ----------
regMore({
    id: 'todo_pro', name: 'Задачи Pro', icon: NX.icons.todo, color: '#5e5ce6',
    category: 'Программы', description: 'Задачи с приоритетами.', w: 600, h: 620,
    render(body) {
        if (!Array.isArray(NX.state.tasks)) NX.state.tasks = [];
        const draw = () => {
            const tasks = NX.state.tasks.slice().sort((a, b) => { const p = { high: 0, normal: 1, low: 2 }; return (p[a.priority||'normal']-p[b.priority||'normal']) || (a.done-b.done); });
            body.innerHTML = `<div class="todo-app"><div class="todo-header"><input type="text" class="input" id="ti" placeholder="Задача..." style="flex:1;"><select class="input" id="tp" style="width:130px;"><option value="high">Высокий</option><option value="normal" selected>Обычный</option><option value="low">Низкий</option></select><button class="btn primary" id="ta">+</button></div><div class="todo-list">${tasks.length === 0 ? '<div class="np-empty">Нет задач</div>' : tasks.map(t => { const c = t.priority==='high'?'var(--danger)':(t.priority==='low'?'var(--text-muted)':'var(--accent)'); return `<div class="todo-item ${t.done?'done':''}" style="border-left:3px solid ${c};padding-left:12px;"><input type="checkbox" data-id="${t.id}" ${t.done?'checked':''}><span class="text">${NX.esc(t.text)}</span><button class="del-btn" data-del="${t.id}">${NX.icons.trash}</button></div>`; }).join('')}</div><div style="padding:12px 20px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);">Выполнено: ${tasks.filter(t=>t.done).length} / ${tasks.length}</div></div>`;
            NX.$('#ta', body).onclick = () => { const i = NX.$('#ti', body), v = i.value.trim(); if (!v) return; NX.state.tasks.push({ id: Date.now(), text: v, done: false, priority: NX.$('#tp', body).value }); NX.saveState(); i.value = ''; draw(); };
            NX.$('#ti', body).onkeydown = e => { if (e.key === 'Enter') NX.$('#ta', body).click(); };
            NX.$$('input[type=checkbox]', body).forEach(cb => cb.onchange = e => { const t = NX.state.tasks.find(x => x.id === parseInt(cb.dataset.id)); if (t) { t.done = e.target.checked; NX.saveState(); draw(); } });
            NX.$$('.del-btn', body).forEach(btn => btn.onclick = () => { NX.state.tasks = NX.state.tasks.filter(t => t.id !== parseInt(btn.dataset.del)); NX.saveState(); draw(); });
        };
        draw();
    }
});

// ---------- 12. ТРЕКЕР ПРИВЫЧЕК ----------
regMore({
    id: 'habit', name: 'Трекер привычек', icon: NX.icons.check, color: '#10b981',
    category: 'Программы', description: 'Отслеживание привычек.', w: 600, h: 600,
    render(body) {
        if (!Array.isArray(NX.state.habits)) NX.state.habits = [];
        const today = new Date().toISOString().slice(0, 10);
        const draw = () => {
            body.innerHTML = `<div style="display:flex;flex-direction:column;height:100%;"><div class="toolbar"><input type="text" class="input" id="hi" placeholder="Новая привычка..." style="flex:1;"><button class="btn primary" id="ha">+</button></div><div style="flex:1;overflow-y:auto;padding:16px;">${NX.state.habits.length === 0 ? '<div class="np-empty">Пока нет привычек</div>' : NX.state.habits.map((h, i) => { const done = (h.dates||[]).includes(today); return `<div class="card" style="margin-bottom:8px;"><div class="row"><div><div style="font-weight:600;">${NX.esc(h.name)}</div><div style="font-size:11px;color:var(--text-muted);">Серия: ${(h.dates||[]).length} дней</div></div><div style="display:flex;gap:8px;align-items:center;"><button class="btn ${done?'primary':''}" data-toggle="${i}" style="min-width:80px;justify-content:center;">${done?'✓':'Отметить'}</button><button class="btn ghost" data-del="${i}" style="color:var(--danger);">×</button></div></div></div>`; }).join('')}</div></div>`;
            NX.$('#ha', body).onclick = () => { const i = NX.$('#hi', body), v = i.value.trim(); if (!v) return; NX.state.habits.push({ id: Date.now(), name: v, dates: [] }); NX.saveState(); i.value = ''; draw(); };
            NX.$('#hi', body).onkeydown = e => { if (e.key === 'Enter') NX.$('#ha', body).click(); };
            NX.$$('[data-toggle]', body).forEach(btn => btn.onclick = () => { const h = NX.state.habits[parseInt(btn.dataset.toggle)]; if (!h.dates) h.dates = []; if (h.dates.includes(today)) h.dates = h.dates.filter(d => d !== today); else h.dates.push(today); NX.saveState(); draw(); });
            NX.$$('[data-del]', body).forEach(btn => btn.onclick = () => { NX.state.habits.splice(parseInt(btn.dataset.del), 1); NX.saveState(); draw(); });
        };
        draw();
    }
});

// ---------- 13. КАРТОЧКИ ----------
regMore({
    id: 'flashcards', name: 'Карточки', icon: NX.icons.book, color: '#e05fb0',
    category: 'Программы', description: 'Обучающие карточки.', w: 500, h: 550,
    render(body) {
        if (!Array.isArray(NX.state.flashcards)) NX.state.flashcards = [];
        let cur = 0, flipped = false;
        const draw = () => {
            const cards = NX.state.flashcards;
            const card = cards[cur];
            body.innerHTML = `<div style="display:flex;flex-direction:column;height:100%;padding:24px;gap:16px;"><div style="display:flex;justify-content:space-between;"><span style="font-size:13px;color:var(--text-muted);">${cards.length > 0 ? `${cur+1} / ${cards.length}` : 'Нет карточек'}</span><button class="btn ghost" id="fa">+ Добавить</button></div>${card ? `<div id="fc" style="flex:1;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;padding:40px;cursor:pointer;font-size:20px;text-align:center;min-height:200px;">${NX.esc(flipped?card.back:card.front)}</div><div style="display:flex;gap:8px;"><button class="btn" id="fp" ${cur===0?'disabled':''}>← Назад</button><button class="btn" id="ff" style="flex:1;justify-content:center;">Перевернуть</button><button class="btn" id="fn" ${cur>=cards.length-1?'disabled':''}>Далее →</button></div><button class="btn ghost" id="fd" style="color:var(--danger);">Удалить</button>` : '<div class="np-empty" style="flex:1;display:flex;align-items:center;justify-content:center;">Добавьте первую карточку</div>'}</div>`;
            NX.$('#fa', body).onclick = () => { const f = prompt('Вопрос:'); if (!f) return; const b = prompt('Ответ:'); if (!b) return; NX.state.flashcards.push({ front: f, back: b }); NX.saveState(); cur = NX.state.flashcards.length-1; flipped = false; draw(); };
            const fc = NX.$('#fc', body); if (fc) fc.onclick = () => { flipped = !flipped; draw(); };
            const fp = NX.$('#fp', body); if (fp) fp.onclick = () => { if (cur > 0) { cur--; flipped = false; draw(); } };
            const fn = NX.$('#fn', body); if (fn) fn.onclick = () => { if (cur < cards.length-1) { cur++; flipped = false; draw(); } };
            const ff = NX.$('#ff', body); if (ff) ff.onclick = () => { flipped = !flipped; draw(); };
            const fd = NX.$('#fd', body); if (fd) fd.onclick = () => { if (confirm('Удалить?')) { NX.state.flashcards.splice(cur, 1); if (cur >= NX.state.flashcards.length) cur = Math.max(0, NX.state.flashcards.length-1); NX.saveState(); flipped = false; draw(); } };
        };
        draw();
    }
});

// ---------- 14. ПИКСЕЛЬ-АРТ (ИСПРАВЛЕН — С ИКОНКОЙ) ----------
regMore({
    id: 'pixel_art', name: 'Пиксель-арт', icon: NX.icons.grid, color: '#ff9f0a',
    category: 'Программы', description: 'Редактор пиксель-арта 16×16.', w: 620, h: 700,
    render(body) {
        const S = 16;
        if (!Array.isArray(NX.state.pixelArt) || NX.state.pixelArt.length !== S*S) NX.state.pixelArt = Array(S*S).fill('#ffffff');
        let color = '#000000';
        const draw = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="width:32px;height:32px;color:var(--accent);">${NX.icons.grid}</div>
                        <span style="font-weight:600;margin-right:8px;">Пиксель-арт 16×16</span>
                        <input type="color" id="pc" value="${color}" style="width:40px;height:32px;border:none;">
                        <div class="sep"></div>
                        <button class="btn ghost" id="pclear">Очистить</button>
                        <button class="btn ghost" id="pfill" style="color:var(--warning);">Залить всё</button>
                        <button class="btn primary" id="psave">${NX.icons.save} Сохранить PNG</button>
                    </div>
                    <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--surface-2);">
                        <div id="pg" style="display:grid;grid-template-columns:repeat(${S},28px);gap:1px;background:var(--border);padding:2px;border-radius:4px;box-shadow:var(--shadow-lg);"></div>
                    </div>
                    <div style="padding:12px 20px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);text-align:center;">
                        ЛКМ — рисовать · ПКМ — стирать · Текущий цвет: <span id="pcolor" style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${color};vertical-align:middle;border:1px solid var(--border);"></span>
                    </div>
                </div>`;
            const g = NX.$('#pg', body);
            NX.state.pixelArt.forEach((c, i) => {
                const cell = document.createElement('div');
                cell.style.cssText = `width:28px;height:28px;background:${c};cursor:pointer;border-radius:2px;`;
                cell.onmousedown = (e) => {
                    e.preventDefault();
                    const newColor = e.button === 2 ? '#ffffff' : color;
                    NX.state.pixelArt[i] = newColor;
                    cell.style.background = newColor;
                };
                cell.onmouseenter = (e) => {
                    if (e.buttons === 1) { NX.state.pixelArt[i] = color; cell.style.background = color; }
                    else if (e.buttons === 2) { NX.state.pixelArt[i] = '#ffffff'; cell.style.background = '#ffffff'; }
                };
                cell.oncontextmenu = (e) => e.preventDefault();
                g.appendChild(cell);
            });
            NX.$('#pc', body).oninput = e => { color = e.target.value; NX.$('#pcolor', body).style.background = color; };
            NX.$('#pclear', body).onclick = () => { NX.state.pixelArt = Array(S*S).fill('#ffffff'); NX.saveState(); draw(); };
            NX.$('#pfill', body).onclick = () => { NX.state.pixelArt = Array(S*S).fill(color); NX.saveState(); draw(); };
            NX.$('#psave', body).onclick = () => {
                const c = document.createElement('canvas'); c.width = S; c.height = S;
                const ctx2 = c.getContext('2d');
                NX.state.pixelArt.forEach((col, i) => { ctx2.fillStyle = col; ctx2.fillRect(i % S, Math.floor(i / S), 1, 1); });
                const big = document.createElement('canvas'); big.width = S*16; big.height = S*16;
                const bc = big.getContext('2d'); bc.imageSmoothingEnabled = false;
                bc.drawImage(c, 0, 0, big.width, big.height);
                const name = prompt('Имя файла:', `pixel_art_${Date.now()}.png`) || `pixel_art_${Date.now()}.png`;
                NX.fs.addFile('Изображения', name, big.toDataURL('image/png'), 'img');
                NX.notifications.push('Пиксель-арт', 'Сохранено в Галерею', 'save');
            };
        };
        draw();
    }
});

// ---------- 15. WHITEBOARD ----------
regMore({
    id: 'whiteboard', name: 'Whiteboard', icon: NX.icons.point, color: '#0a84ff',
    category: 'Программы', description: 'Бесконечное полотно.', w: 900, h: 650,
    render(body, ctx) {
        body.innerHTML = `<div style="display:flex;flex-direction:column;height:100%;"><div class="toolbar"><input type="color" id="wc" value="#000000" style="width:40px;height:32px;border:none;"><input type="range" id="ws" min="1" max="40" value="4" style="width:100px;"><button class="btn ghost" id="wcl">Очистить</button><button class="btn primary" id="wsv">${NX.icons.save} Сохранить</button></div><div style="flex:1;position:relative;background:#fff;overflow:hidden;" id="ww"><canvas id="wcv"></canvas></div></div>`;
        const cv = NX.$('#wcv', body), wrap = NX.$('#ww', body), c = cv.getContext('2d');
        let drawing = false, color = '#000000', size = 4;
        const resize = () => { const r = wrap.getBoundingClientRect(); const d = window.devicePixelRatio || 1; const saved = cv.toDataURL(); cv.width = r.width*d; cv.height = r.height*d; cv.style.width = r.width+'px'; cv.style.height = r.height+'px'; c.setTransform(d,0,0,d,0,0); c.lineCap = 'round'; c.lineJoin = 'round'; const img = new Image(); img.onload = () => c.drawImage(img,0,0,r.width,r.height); img.src = saved; };
        setTimeout(resize, 100);
        window.addEventListener('resize', resize);
        NX.$('#wc', body).oninput = e => color = e.target.value;
        NX.$('#ws', body).oninput = e => size = +e.target.value;
        const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX-r.left, y: e.clientY-r.top }; };
        cv.addEventListener('pointerdown', e => { drawing = true; cv.setPointerCapture(e.pointerId); const p = pos(e); c.beginPath(); c.moveTo(p.x,p.y); c.strokeStyle = color; c.lineWidth = size; c.lineTo(p.x+.1,p.y+.1); c.stroke(); });
        cv.addEventListener('pointermove', e => { if (!drawing) return; const p = pos(e); c.strokeStyle = color; c.lineWidth = size; c.lineTo(p.x,p.y); c.stroke(); });
        cv.addEventListener('pointerup', () => drawing = false);
        NX.$('#wcl', body).onclick = () => { c.fillStyle = '#fff'; c.fillRect(0,0,cv.width,cv.height); };
        NX.$('#wsv', body).onclick = () => { const name = prompt('Имя:', `whiteboard_${Date.now()}.png`) || 'whiteboard.png'; NX.fs.addFile('Изображения', name, cv.toDataURL('image/png'), 'img'); NX.notifications.push('Whiteboard', 'Сохранено', 'save'); };
        ctx.onClose(() => window.removeEventListener('resize', resize));
    }
});

// ---------- 16. ДНЕВНИК ----------
regMore({
    id: 'diary', name: 'Дневник', icon: NX.icons.notes, color: '#e05fb0',
    category: 'Программы', description: 'Личный дневник.', w: 700, h: 550,
    render(body) {
        if (!Array.isArray(NX.state.diary)) NX.state.diary = [];
        let cur = null;
        const draw = () => {
            const entries = NX.state.diary;
            const entry = entries.find(x => x.id === cur);
            body.innerHTML = `<div class="notes-app"><div class="notes-sidebar"><div style="padding:12px;"><button class="btn primary" id="dn" style="width:100%;">+ Новая</button></div><div class="notes-list">${entries.length === 0 ? '<div class="np-empty" style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">Пусто</div>' : entries.slice().reverse().map(e => `<div class="note-item ${cur===e.id?'active':''}" data-id="${e.id}"><div class="n-title">${NX.esc(e.title||'Запись')}</div><div class="n-prev">${NX.esc(e.date||'')}</div></div>`).join('')}</div></div><div class="notes-editor">${entry ? `<input type="text" id="dt" value="${NX.esc(entry.title)}" placeholder="Заголовок"><textarea id="dc" placeholder="Ваши мысли...">${NX.esc(entry.content)}</textarea>` : '<div class="np-empty" style="margin-top:100px;">Выберите запись</div>'}</div></div>`;
            NX.$$('.note-item', body).forEach(el => el.onclick = () => { cur = parseInt(el.dataset.id); draw(); });
            NX.$('#dn', body).onclick = () => { const now = new Date(); const e = { id: Date.now(), title: now.toLocaleDateString('ru-RU'), content: '', date: now.toLocaleDateString('ru-RU') }; NX.state.diary.push(e); cur = e.id; NX.saveState(); draw(); };
            if (entry) { const t = NX.$('#dt', body), d = NX.$('#dc', body); if (t) t.oninput = () => { entry.title = t.value; NX.saveState(); }; if (d) d.oninput = () => { entry.content = d.value; NX.saveState(); }; }
        };
        draw();
    }
});

// ---------- 17. ЗАМЕТКИ PRO ----------
regMore({
    id: 'notes_pro', name: 'Заметки Pro', icon: NX.icons.notes, color: '#e8c65a',
    category: 'Программы', description: 'Заметки с папками.', w: 850, h: 600,
    render(body) {
        if (!NX.state.notesPro) NX.state.notesPro = { folders: [{ id: 'default', name: 'Все', notes: [] }], currentFolder: 'default', currentNote: null };
        const draw = () => {
            const d = NX.state.notesPro;
            const f = d.folders.find(x => x.id === d.currentFolder) || d.folders[0];
            const n = f.notes.find(x => x.id === d.currentNote);
            body.innerHTML = `<div style="display:flex;height:100%;"><div style="width:200px;background:var(--surface-2);border-right:1px solid var(--border);display:flex;flex-direction:column;"><div style="padding:12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;"><span style="font-weight:600;">Папки</span><button class="btn ghost" id="af" style="height:24px;width:24px;padding:0;justify-content:center;">+</button></div><div style="flex:1;overflow-y:auto;">${d.folders.map(fo => `<div class="files-nav-item ${fo.id===d.currentFolder?'active':''}" data-folder="${fo.id}">${NX.icons.folder} ${NX.esc(fo.name)}</div>`).join('')}</div></div><div style="width:260px;border-right:1px solid var(--border);display:flex;flex-direction:column;"><div style="padding:12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;"><span style="font-weight:600;">Заметки</span><button class="btn ghost" id="an" style="height:24px;width:24px;padding:0;justify-content:center;">+</button></div><div style="flex:1;overflow-y:auto;">${f.notes.map(no => `<div class="note-item ${no.id===d.currentNote?'active':''}" data-note="${no.id}"><div class="n-title">${NX.esc(no.title)}</div></div>`).join('') || '<div class="np-empty" style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">Нет заметок</div>'}</div></div><div style="flex:1;display:flex;flex-direction:column;">${n ? `<input type="text" id="nt" value="${NX.esc(n.title)}" style="font-size:24px;font-weight:700;padding:24px 24px 8px;border:none;outline:none;background:transparent;color:var(--text);"><textarea id="nc" style="flex:1;padding:16px 24px;border:none;outline:none;resize:none;font:inherit;font-size:14px;background:transparent;color:var(--text);">${NX.esc(n.content)}</textarea>` : '<div class="np-empty" style="flex:1;display:flex;align-items:center;justify-content:center;">Выберите заметку</div>'}</div></div>`;
            NX.$$('[data-folder]', body).forEach(el => el.onclick = () => { NX.state.notesPro.currentFolder = el.dataset.folder; NX.saveState(); draw(); });
            NX.$$('[data-note]', body).forEach(el => el.onclick = () => { NX.state.notesPro.currentNote = parseInt(el.dataset.note); draw(); });
            NX.$('#af', body).onclick = () => { const name = prompt('Имя папки:'); if (!name) return; NX.state.notesPro.folders.push({ id: NX.uid('f'), name, notes: [] }); NX.saveState(); draw(); };
            NX.$('#an', body).onclick = () => { const fo = NX.state.notesPro.folders.find(x => x.id === NX.state.notesPro.currentFolder); const note = { id: Date.now(), title: 'Новая заметка', content: '' }; fo.notes.push(note); NX.state.notesPro.currentNote = note.id; NX.saveState(); draw(); };
            if (n) { const t = NX.$('#nt', body), c = NX.$('#nc', body); if (t) t.oninput = () => { n.title = t.value; NX.saveState(); }; if (c) c.oninput = () => { n.content = c.value; NX.saveState(); }; }
        };
        draw();
    }
});

// ---------- 18. РЕЗЮМЕ ----------
regMore({
    id: 'resume', name: 'Резюме', icon: NX.icons.fileTxt, color: '#4a6fa5',
    category: 'Программы', description: 'Конструктор резюме.', w: 850, h: 650,
    render(body) {
        const d = NX.state.resumeData || { name:'', position:'', email:'', phone:'', about:'', experience:'', education:'', skills:'' };
        NX.state.resumeData = d;
        body.innerHTML = `<div style="display:flex;height:100%;"><div style="flex:1;padding:24px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;border-right:1px solid var(--border);"><h2 style="font-size:18px;">Данные</h2><input class="input" placeholder="Имя" data-f="name" value="${NX.esc(d.name)}"><input class="input" placeholder="Должность" data-f="position" value="${NX.esc(d.position)}"><input class="input" placeholder="Email" data-f="email" value="${NX.esc(d.email)}"><input class="input" placeholder="Телефон" data-f="phone" value="${NX.esc(d.phone)}"><textarea class="input" placeholder="О себе" data-f="about" style="min-height:80px;padding:8px;">${NX.esc(d.about)}</textarea><textarea class="input" placeholder="Опыт" data-f="experience" style="min-height:100px;padding:8px;">${NX.esc(d.experience)}</textarea><textarea class="input" placeholder="Образование" data-f="education" style="min-height:80px;padding:8px;">${NX.esc(d.education)}</textarea><input class="input" placeholder="Навыки" data-f="skills" value="${NX.esc(d.skills)}"><button class="btn primary" id="rp">Скачать PDF</button></div><div style="flex:1;padding:24px;overflow-y:auto;background:var(--surface-2);"><div id="rprev" style="background:#fff;color:#000;padding:40px;border-radius:4px;box-shadow:var(--shadow-lg);font-family:serif;"></div></div></div>`;
        const upd = () => { NX.$('#rprev', body).innerHTML = `<h1 style="font-size:32px;margin:0 0 8px;">${NX.esc(d.name)||'Ваше имя'}</h1><div style="font-size:18px;color:#666;margin-bottom:16px;">${NX.esc(d.position)||'Должность'}</div><div style="font-size:13px;color:#444;margin-bottom:16px;">${NX.esc(d.email)} ${d.phone?'· '+NX.esc(d.phone):''}</div>${d.about?`<h2 style="font-size:16px;margin:16px 0 8px;border-bottom:2px solid #000;padding-bottom:4px;">О себе</h2><p style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${NX.esc(d.about)}</p>`:''}${d.experience?`<h2 style="font-size:16px;margin:16px 0 8px;border-bottom:2px solid #000;padding-bottom:4px;">Опыт</h2><p style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${NX.esc(d.experience)}</p>`:''}${d.education?`<h2 style="font-size:16px;margin:16px 0 8px;border-bottom:2px solid #000;padding-bottom:4px;">Образование</h2><p style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${NX.esc(d.education)}</p>`:''}${d.skills?`<h2 style="font-size:16px;margin:16px 0 8px;border-bottom:2px solid #000;padding-bottom:4px;">Навыки</h2><p style="font-size:14px;">${NX.esc(d.skills)}</p>`:''}`; };
        NX.$$('[data-f]', body).forEach(el => el.oninput = () => { d[el.dataset.f] = el.value; NX.saveState(); upd(); });
        NX.$('#rp', body).onclick = () => { const w = window.open('', '', 'width=800,height=600'); w.document.write(`<html><head><title>Резюме</title><style>body{font-family:serif;padding:40px;}</style></head><body>${NX.$('#rprev', body).innerHTML}</body></html>`); w.document.close(); setTimeout(() => w.print(), 300); };
        upd();
    }
});

// ---------- 19. ТАБЛИЦА МЕНДЕЛЕЕВА (ПОЛНАЯ — 118 ЭЛЕМЕНТОВ) ----------
regMore({
    id: 'periodic', name: 'Таблица Менделеева', icon: NX.icons.sheet, color: '#10b981',
    category: 'Утилиты', description: 'Все 118 химических элементов.', w: 1000, h: 700, single: true,
    render(body) {
        const ELEMENTS = [
            ['H','Водород',1.008,'s'],['He','Гелий',4.0026,'p'],
            ['Li','Литий',6.94,'s'],['Be','Бериллий',9.0122,'s'],['B','Бор',10.81,'p'],['C','Углерод',12.011,'p'],['N','Азот',14.007,'p'],['O','Кислород',15.999,'p'],['F','Фтор',18.998,'p'],['Ne','Неон',20.180,'p'],
            ['Na','Натрий',22.990,'s'],['Mg','Магний',24.305,'s'],['Al','Алюминий',26.982,'p'],['Si','Кремний',28.085,'p'],['P','Фосфор',30.974,'p'],['S','Сера',32.06,'p'],['Cl','Хлор',35.45,'p'],['Ar','Аргон',39.948,'p'],
            ['K','Калий',39.098,'s'],['Ca','Кальций',40.078,'s'],['Sc','Скандий',44.956,'d'],['Ti','Титан',47.867,'d'],['V','Ванадий',50.942,'d'],['Cr','Хром',51.996,'d'],['Mn','Марганец',54.938,'d'],['Fe','Железо',55.845,'d'],['Co','Кобальт',58.933,'d'],['Ni','Никель',58.693,'d'],['Cu','Медь',63.546,'d'],['Zn','Цинк',65.38,'d'],['Ga','Галлий',69.723,'p'],['Ge','Германий',72.630,'p'],['As','Мышьяк',74.922,'p'],['Se','Селен',78.971,'p'],['Br','Бром',79.904,'p'],['Kr','Криптон',83.798,'p'],
            ['Rb','Рубидий',85.468,'s'],['Sr','Стронций',87.62,'s'],['Y','Иттрий',88.906,'d'],['Zr','Цирконий',91.224,'d'],['Nb','Ниобий',92.906,'d'],['Mo','Молибден',95.95,'d'],['Tc','Технеций',98,'d'],['Ru','Рутений',101.07,'d'],['Rh','Родий',102.91,'d'],['Pd','Палладий',106.42,'d'],['Ag','Серебро',107.87,'d'],['Cd','Кадмий',112.41,'d'],['In','Индий',114.82,'p'],['Sn','Олово',118.71,'p'],['Sb','Сурьма',121.76,'p'],['Te','Теллур',127.60,'p'],['I','Иод',126.90,'p'],['Xe','Ксенон',131.29,'p'],
            ['Cs','Цезий',132.91,'s'],['Ba','Барий',137.33,'s'],['La','Лантан',138.91,'f'],['Ce','Церий',140.12,'f'],['Pr','Празеодим',140.91,'f'],['Nd','Неодим',144.24,'f'],['Pm','Прометий',145,'f'],['Sm','Самарий',150.36,'f'],['Eu','Европий',151.96,'f'],['Gd','Гадолиний',157.25,'f'],['Tb','Тербий',158.93,'f'],['Dy','Диспрозий',162.50,'f'],['Ho','Гольмий',164.93,'f'],['Er','Эрбий',167.26,'f'],['Tm','Тулий',168.93,'f'],['Yb','Иттербий',173.05,'f'],['Lu','Лютеций',174.97,'f'],['Hf','Гафний',178.49,'d'],['Ta','Тантал',180.95,'d'],['W','Вольфрам',183.84,'d'],['Re','Рений',186.21,'d'],['Os','Осмий',190.23,'d'],['Ir','Иридий',192.22,'d'],['Pt','Платина',195.08,'d'],['Au','Золото',196.97,'d'],['Hg','Ртуть',200.59,'d'],['Tl','Таллий',204.38,'p'],['Pb','Свинец',207.2,'p'],['Bi','Висмут',208.98,'p'],['Po','Полоний',209,'p'],['At','Астат',210,'p'],['Rn','Радон',222,'p'],
            ['Fr','Франций',223,'s'],['Ra','Радий',226,'s'],['Ac','Актиний',227,'f'],['Th','Торий',232.04,'f'],['Pa','Протактиний',231.04,'f'],['U','Уран',238.03,'f'],['Np','Нептуний',237,'f'],['Pu','Плутоний',244,'f'],['Am','Америций',243,'f'],['Cm','Кюрий',247,'f'],['Bk','Берклий',247,'f'],['Cf','Калифорний',251,'f'],['Es','Эйнштейний',252,'f'],['Fm','Фермий',257,'f'],['Md','Менделевий',258,'f'],['No','Нобелий',259,'f'],['Lr','Лоуренсий',266,'f'],['Rf','Резерфордий',267,'d'],['Db','Дубний',268,'d'],['Sg','Сиборгий',269,'d'],['Bh','Борий',270,'d'],['Hs','Хассий',277,'d'],['Mt','Мейтнерий',278,'d'],['Ds','Дармштадтий',281,'d'],['Rg','Рентгений',282,'d'],['Cn','Коперниций',285,'d'],['Nh','Нихоний',286,'p'],['Fl','Флеровий',289,'p'],['Mc','Московий',290,'p'],['Lv','Ливерморий',293,'p'],['Ts','Теннессин',294,'p'],['Og','Оганесон',294,'p']
        ];
        const COLORS = { s: '#0a84ff', p: '#10b981', d: '#f59e0b', f: '#8b5cf6' };
        let selected = null;
        const draw = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="width:28px;height:28px;color:var(--success);">${NX.icons.sheet}</div>
                        <span style="font-weight:600;">Таблица Менделеева (${ELEMENTS.length} элементов)</span>
                        <div style="flex:1"></div>
                        <span style="font-size:11px;color:var(--text-muted);">s-блок: <span style="display:inline-block;width:10px;height:10px;background:${COLORS.s};border-radius:2px;"></span></span>
                        <span style="font-size:11px;color:var(--text-muted);">p-блок: <span style="display:inline-block;width:10px;height:10px;background:${COLORS.p};border-radius:2px;"></span></span>
                        <span style="font-size:11px;color:var(--text-muted);">d-блок: <span style="display:inline-block;width:10px;height:10px;background:${COLORS.d};border-radius:2px;"></span></span>
                        <span style="font-size:11px;color:var(--text-muted);">f-блок: <span style="display:inline-block;width:10px;height:10px;background:${COLORS.f};border-radius:2px;"></span></span>
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:16px;">
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:6px;">
                            ${ELEMENTS.map((e, i) => {
                                const [sym, name, mass, block] = e;
                                return `<div class="el" data-i="${i}" style="padding:8px 6px;border:1px solid var(--border);border-radius:6px;cursor:pointer;background:${COLORS[block]}22;border-color:${COLORS[block]}44;transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                    <div style="font-size:22px;font-weight:700;color:${COLORS[block]};text-align:center;line-height:1.1;">${sym}</div>
                                    <div style="font-size:10px;color:var(--text-muted);text-align:center;margin-top:4px;min-height:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${NX.esc(name)}</div>
                                    <div style="font-size:10px;color:var(--text-muted);text-align:center;">${mass}</div>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                    ${selected !== null ? `
                        <div style="padding:16px;border-top:1px solid var(--border);background:var(--surface-2);">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <div style="font-size:24px;font-weight:700;color:${COLORS[ELEMENTS[selected][3]]};">${ELEMENTS[selected][0]} — ${NX.esc(ELEMENTS[selected][1])}</div>
                                    <div style="font-size:13px;color:var(--text-muted);">Атомная масса: ${ELEMENTS[selected][2]} · Блок: ${ELEMENTS[selected][3]}-блок</div>
                                </div>
                                <button class="btn ghost" id="close-sel">×</button>
                            </div>
                        </div>` : ''}
                </div>`;
            NX.$$('.el', body).forEach(el => el.onclick = () => { selected = parseInt(el.dataset.i); draw(); });
            const closeSel = NX.$('#close-sel', body);
            if (closeSel) closeSel.onclick = () => { selected = null; draw(); };
        };
        draw();
    }
});

// ---------- 20. ФОРМУЛЫ ФИЗИКИ ----------
regMore({
    id: 'physics', name: 'Формулы физики', icon: NX.icons.book, color: '#3b82f6',
    category: 'Утилиты', description: 'Справочник формул.', w: 700, h: 600, single: true,
    render(body) {
        const F = [
            { n: 'Скорость', f: 'v = s / t', d: 'Скорость = путь / время' }, { n: 'Ускорение', f: 'a = (v - v₀) / t' },
            { n: '2-й закон Ньютона', f: 'F = m × a' }, { n: 'Кинетическая энергия', f: 'Eₖ = m × v² / 2' },
            { n: 'Потенциальная энергия', f: 'Eₚ = m × g × h' }, { n: 'Работа', f: 'A = F × s × cos(α)' },
            { n: 'Мощность', f: 'P = A / t' }, { n: 'Плотность', f: 'ρ = m / V' },
            { n: 'Давление', f: 'p = F / S' }, { n: 'Закон Ома', f: 'I = U / R' },
            { n: 'Электрическая мощность', f: 'P = U × I' }, { n: 'Закон Джоуля-Ленца', f: 'Q = I² × R × t' }
        ];
        body.innerHTML = `<div style="padding:24px;height:100%;overflow-y:auto;"><h2 style="font-size:20px;margin-bottom:16px;">Формулы физики</h2>${F.map(x => `<div class="card" style="padding:16px;margin-bottom:10px;"><div style="font-weight:600;margin-bottom:4px;">${x.n}</div><div style="font-size:18px;font-family:monospace;color:var(--accent);">${x.f}</div>${x.d?`<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${x.d}</div>`:''}</div>`).join('')}</div>`;
    }
});

// ---------- 21. РЕЗЕРВНЫЕ КОПИИ ----------
regMore({
    id: 'backup', name: 'Резервные копии', icon: NX.icons.save, color: '#0a84ff',
    category: 'Система', description: 'Экспорт/импорт.', w: 550, h: 500, single: true,
    render(body) {
        body.innerHTML = `<div style="padding:24px;display:flex;flex-direction:column;gap:16px;height:100%;"><h2 style="font-size:20px;">Резервные копии</h2><div style="font-size:13px;color:var(--text-muted);">Экспорт всех данных в JSON.</div><button class="btn primary" id="be" style="height:44px;">Экспортировать</button><button class="btn" id="bi" style="height:44px;">Импортировать</button><div class="card"><div class="row"><span>Приложений</span><span>${NX.state.installed.length}</span></div><div class="row"><span>Размер</span><span>${(JSON.stringify(NX.state).length/1024).toFixed(1)} КБ</span></div></div><button class="btn ghost" id="brst" style="color:var(--danger);margin-top:auto;">Полный сброс</button></div>`;
        NX.$('#be', body).onclick = () => { const b = new Blob([JSON.stringify({ state: NX.state, fs: NX.fs.root, version: NX.VERSION }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `nextel_backup_${new Date().toISOString().slice(0,10)}.json`; a.click(); NX.notifications.push('Резерв', 'Экспорт завершён', 'check'); };
        NX.$('#bi', body).onclick = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { try { const d = JSON.parse(ev.target.result); if (d.state) NX.state = d.state; if (d.fs) NX.fs.root = d.fs; NX.saveState(); NX.notifications.push('Резерв', 'Импорт завершён. Перезагрузка...', 'check'); setTimeout(() => location.reload(), 1200); } catch(err) { NX.notifications.push('Резерв', 'Ошибка файла', 'info'); } }; r.readAsText(f); }; i.click(); };
        NX.$('#brst', body).onclick = () => { if (confirm('Полный сброс?')) { localStorage.clear(); location.reload(); } };
    }
});

// ---------- 22. РЕЕСТР ----------
regMore({
    id: 'registry', name: 'Реестр', icon: NX.icons.device, color: '#111827',
    category: 'Система', description: 'Состояние системы.', w: 700, h: 550, single: true,
    render(body) {
        const draw = () => { body.innerHTML = `<div style="display:flex;flex-direction:column;height:100%;"><div class="toolbar"><span style="font-weight:600;">Реестр</span><div style="flex:1"></div><button class="btn ghost" id="rr">${NX.icons.refresh} Обновить</button></div><div style="flex:1;overflow-y:auto;padding:16px;"><div class="card">${Object.entries(NX.state).map(([k,v]) => `<div class="row"><span style="font-family:monospace;">${NX.esc(k)}</span><span style="font-family:monospace;font-size:11px;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${NX.esc(JSON.stringify(v).slice(0, 80))}</span></div>`).join('')}</div></div></div>`; NX.$('#rr', body).onclick = draw; };
        draw();
    }
});

// ============================================================
// ДОБАВЛЯЕМ ВСЕ ПРИЛОЖЕНИЯ В INSTALLED
// ============================================================
if (!Array.isArray(NX.state.installed)) NX.state.installed = [];
const toAdd = NX.APPS_MORE_IDS.filter(id => !NX.state.installed.includes(id) && !(NX.state.trash || []).some(t => t.id === id));
toAdd.forEach(id => NX.state.installed.push(id));
if (toAdd.length > 0) { NX.saveState(); console.log('[NX-APPS_MORE] Добавлено в installed:', toAdd.join(', ')); }

console.log('[NX-APPS_MORE] ✅ Зарегистрировано:', NX.APPS_MORE_IDS.length, 'приложений');
console.log('[NX-APPS_MORE] ID:', NX.APPS_MORE_IDS.join(', '));
