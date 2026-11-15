/* ============================================================
   NEXTEL OS 2.0 — ДОПОЛНИТЕЛЬНЫЕ ПРИЛОЖЕНИЯ (APPS_EXTRA.JS) v2.0
   ============================================================ */

// ---------- 1. ГАЛЕРЕЯ ----------
NX.registerApp({
    id: 'gallery', name: 'Галерея', icon: NX.icons.gallery, color: '#e05fb0',
    category: 'Программы', description: 'Просмотр изображений.', w: 900, h: 650, single: true,
    render(body) {
        let selectedImg = null;
        const render = () => {
            const images = NX.fs.getImages();
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar"><div style="font-size:14px;font-weight:600;">Галерея</div><div style="flex:1"></div><span style="font-size:12px;color:var(--text-muted);">${images.length} изображений</span></div>
                    <div style="flex:1;display:flex;min-height:0;">
                        <div style="flex:1;padding:16px;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;align-content:start;">
                            ${images.length === 0 ? `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);"><div style="font-size:48px;margin-bottom:16px;opacity:0.3;">${NX.icons.gallery}</div><div>Изображений пока нет</div></div>` :
                                images.map((img, i) => `
                                    <div class="gal-thumb" data-i="${i}" style="cursor:pointer;border-radius:8px;overflow:hidden;border:2px solid ${selectedImg === i ? 'var(--accent)' : 'transparent'};aspect-ratio:1;background:#f0f0f0;position:relative;">
                                        <img src="${img.content}" style="width:100%;height:100%;object-fit:cover;">
                                        <div class="delete-badge" data-del="${NX.esc(img.name)}" title="Удалить">×</div>
                                    </div>
                                `).join('')}
                        </div>
                        ${selectedImg !== null && images[selectedImg] ? `
                            <div style="width:50%;border-left:1px solid var(--border);display:flex;flex-direction:column;">
                                <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#000;padding:20px;">
                                    <img src="${images[selectedImg].content}" style="max-width:100%;max-height:100%;object-fit:contain;">
                                </div>
                                <div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px;align-items:center;">
                                    <div style="flex:1;font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;">${NX.esc(images[selectedImg].name)}</div>
                                    <button class="btn ghost" id="gal-edit">Редактировать</button>
                                    <button class="btn ghost" id="gal-dl">Скачать</button>
                                </div>
                            </div>` : ''}
                    </div>
                </div>`;
            NX.$$('.gal-thumb', body).forEach(el => el.onclick = e => {
                if (e.target.closest('.delete-badge')) return;
                selectedImg = parseInt(el.dataset.i); render();
            });
            NX.$$('.delete-badge', body).forEach(b => b.onclick = e => {
                e.stopPropagation();
                if (confirm(`Удалить "${b.dataset.del}"?`)) { NX.fs.deleteImage(b.dataset.del); selectedImg = null; render(); }
            });
            const editBtn = NX.$('#gal-edit', body);
            if (editBtn) editBtn.onclick = () => { const im = NX.fs.getImages()[selectedImg]; if (im) NX.openApp('point', { content: im.content, name: im.name }); };
            const dlBtn = NX.$('#gal-dl', body);
            if (dlBtn) dlBtn.onclick = () => { const im = NX.fs.getImages()[selectedImg]; if (im) { const a = document.createElement('a'); a.href = im.content; a.download = im.name; a.click(); } };
        };
        render();
    }
});

// ---------- 2. ВИДЕОПЛЕЕР ----------
NX.registerApp({
    id: 'video', name: 'Видеоплеер', icon: NX.icons.video, color: '#4a6fa5',
    category: 'Программы', description: 'Воспроизведение видео.', w: 800, h: 550, single: true,
    render(body) {
        let currentVideo = null;
        const render = () => {
            const videos = NX.fs.getNode(['Загрузки']).children.filter(c => c.type === 'file' && c.kind === 'video');
            if (currentVideo === null && videos.length > 0) currentVideo = 0;
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar"><div style="font-weight:600;">Видеоплеер</div><div style="flex:1"></div><button class="btn ghost" id="vl">+ Загрузить</button></div>
                    <div style="flex:1;display:flex;min-height:0;">
                        <div style="width:220px;border-right:1px solid var(--border);background:var(--surface-2);overflow-y:auto;padding:8px;">
                            ${videos.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">Нет видео</div>' :
                                videos.map((v, i) => `<div class="vi" data-i="${i}" style="padding:10px;cursor:pointer;border-radius:6px;margin-bottom:4px;font-size:12px;display:flex;gap:8px;${currentVideo === i ? 'background:var(--accent-soft);' : ''}"><span style="color:var(--accent);">${NX.icons.video}</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${NX.esc(v.name)}</span><button class="dv" data-n="${NX.esc(v.name)}" style="color:var(--danger);background:transparent;border:none;cursor:pointer;">×</button></div>`).join('')}
                        </div>
                        <div style="flex:1;background:#000;display:flex;align-items:center;justify-content:center;">
                            ${videos.length > 0 && videos[currentVideo] ? `<video src="${videos[currentVideo].content}" controls autoplay style="max-width:100%;max-height:100%;"></video>` : '<div style="color:#888;">Выберите видео</div>'}
                        </div>
                    </div>
                </div>`;
            NX.$('#vl', body).onclick = () => {
                const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'video/*';
                inp.onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { NX.fs.addFile('Загрузки', f.name, ev.target.result, 'video'); currentVideo = null; render(); }; r.readAsDataURL(f); };
                inp.click();
            };
            NX.$$('.vi', body).forEach(el => el.onclick = e => { if (e.target.closest('.dv')) return; currentVideo = parseInt(el.dataset.i); render(); });
            NX.$$('.dv', body).forEach(b => b.onclick = e => { e.stopPropagation(); if (confirm(`Удалить?`)) { NX.fs.deleteFile('Загрузки', b.dataset.n); currentVideo = null; render(); } });
        };
        render();
    }
});

// ---------- 3. ДИКТОФОН ----------
NX.registerApp({
    id: 'recorder', name: 'Диктофон', icon: NX.icons.recorder, color: '#e8534a',
    category: 'Программы', description: 'Запись с микрофона.', w: 600, h: 600, single: true,
    render(body, ctx) {
        let isRec = false, mr = null, chunks = [], timer = null, sec = 0;
        const render = () => {
            const recs = NX.fs.getAudio();
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;padding:20px;gap:16px;">
                    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
                        <div style="font-size:48px;font-weight:300;" id="rt">${NX.pad(Math.floor(sec/60))}:${NX.pad(sec%60)}</div>
                        <div style="width:70px;height:70px;border-radius:50%;background:${isRec ? '#333' : 'var(--danger)'};display:flex;align-items:center;justify-content:center;cursor:pointer;" id="rb">
                            ${isRec ? '<div style="width:22px;height:22px;background:#fff;"></div>' : '<div style="width:26px;height:26px;border-radius:50%;background:#fff;"></div>'}
                        </div>
                        <div style="font-size:13px;color:var(--text-muted);">${isRec ? 'Идёт запись...' : 'Нажмите для записи'}</div>
                    </div>
                    <div style="flex:1;overflow-y:auto;">
                        <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">ЗАПИСИ (${recs.length})</div>
                        ${recs.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-muted);">Нет записей</div>' :
                            recs.map(r => `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;margin-bottom:6px;"><span style="color:var(--accent);">${NX.icons.recorder}</span><span style="flex:1;font-size:12px;">${NX.esc(r.name)}</span><button class="pr" data-n="${NX.esc(r.name)}" style="color:var(--accent);background:transparent;border:none;cursor:pointer;">▶</button><button class="dr" data-n="${NX.esc(r.name)}" style="color:var(--danger);background:transparent;border:none;cursor:pointer;">${NX.icons.trash}</button></div>`).join('')}
                    </div>
                </div>`;
            NX.$('#rb', body).onclick = () => {
                if (isRec) { if (mr) { mr.stop(); mr.stream.getTracks().forEach(t => t.stop()); } isRec = false; clearInterval(timer); render(); }
                else {
                    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                        mr = new MediaRecorder(stream); chunks = [];
                        mr.ondataavailable = e => chunks.push(e.data);
                        mr.onstop = () => {
                            const blob = new Blob(chunks, { type: 'audio/webm' });
                            const r = new FileReader();
                            r.onload = ev => { NX.fs.addFile('Документы', `Запись_${Date.now()}.webm`, ev.target.result, 'audio'); render(); };
                            r.readAsDataURL(blob);
                        };
                        mr.start(); isRec = true; sec = 0;
                        timer = setInterval(() => { sec++; const t = NX.$('#rt', body); if (t) t.textContent = `${NX.pad(Math.floor(sec/60))}:${NX.pad(sec%60)}`; }, 1000);
                        render();
                    }).catch(() => NX.notifications.push('Диктофон', 'Нет доступа к микрофону', 'info'));
                }
            };
            NX.$$('.pr', body).forEach(b => b.onclick = () => { const rec = recs.find(r => r.name === b.dataset.n); if (rec) new Audio(rec.content).play(); });
            NX.$$('.dr', body).forEach(b => b.onclick = () => { if (confirm('Удалить?')) { NX.fs.deleteAudio(b.dataset.n); render(); } });
        };
        ctx.onClose(() => { if (timer) clearInterval(timer); if (mr && isRec) { mr.stop(); mr.stream.getTracks().forEach(t => t.stop()); } });
        render();
    }
});

// ---------- 4. КАМЕРА ----------
NX.registerApp({
    id: 'camera', name: 'Камера', icon: NX.icons.camera, color: '#2b8a5f',
    category: 'Программы', description: 'Снимки с камеры.', w: 700, h: 600, single: true,
    render(body) {
        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div class="toolbar"><div style="font-weight:600;">Камера</div><div style="flex:1"></div><select class="input" id="ct" style="width:130px;height:28px;font-size:12px;"><option value="0">Без таймера</option><option value="3">3 сек</option><option value="5">5 сек</option><option value="10">10 сек</option></select></div>
                <div style="flex:1;background:#000;display:flex;align-items:center;justify-content:center;position:relative;">
                    <video id="cv" autoplay playsinline style="max-width:100%;max-height:100%;"></video>
                    <div id="cc" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:120px;color:#fff;font-weight:300;display:none;"></div>
                </div>
                <div style="padding:16px;display:flex;justify-content:center;"><button class="btn primary" id="cs" style="width:64px;height:64px;border-radius:50%;font-size:24px;">📷</button></div>
            </div>`;
        const video = NX.$('#cv', body), countdown = NX.$('#cc', body), captureBtn = NX.$('#cs', body), timerSel = NX.$('#ct', body);
        navigator.mediaDevices.getUserMedia({ video: true }).then(s => video.srcObject = s).catch(() => {
            video.parentElement.innerHTML = '<div style="color:#888;padding:40px;text-align:center;">Нет доступа к камере</div>';
            captureBtn.disabled = true;
        });
        const takePhoto = () => {
            if (!video.videoWidth) return;
            const c = document.createElement('canvas'); c.width = video.videoWidth; c.height = video.videoHeight;
            c.getContext('2d').drawImage(video, 0, 0);
            const name = `Снимок_${Date.now()}.png`;
            NX.fs.addFile('Изображения', name, c.toDataURL('image/png'), 'img');
            NX.notifications.push('Камера', 'Снимок сохранён', 'check');
            NX.audio.playTone(800, 0.1, 'sine', 0.1);
        };
        captureBtn.onclick = () => {
            const d = parseInt(timerSel.value);
            if (d > 0) {
                let r = d; countdown.style.display = 'block'; countdown.textContent = r;
                const iv = setInterval(() => { r--; if (r <= 0) { clearInterval(iv); countdown.style.display = 'none'; takePhoto(); } else countdown.textContent = r; }, 1000);
            } else takePhoto();
        };
    }
});

// ---------- 5. ТАБЛИЦА ----------
NX.registerApp({
    id: 'sheet', name: 'Таблица', icon: NX.icons.sheet, color: '#10b981',
    category: 'Программы', description: 'Таблица с экспортом в CSV.', w: 900, h: 600,
    render(body) {
        const COLS = 10, ROWS = 25; let data = {};
        const colName = i => String.fromCharCode(65 + i);
        const key = (r, c) => `${colName(c)}${r+1}`;
        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div class="toolbar"><div style="font-weight:600;">Таблица</div><div style="flex:1"></div><button class="btn ghost" id="se">Экспорт CSV</button><button class="btn primary" id="ss">${NX.icons.save} Сохранить</button></div>
                <div style="flex:1;overflow:auto;background:var(--surface);">
                    <table style="border-collapse:collapse;width:100%;font-size:13px;">
                        <thead><tr><th style="width:50px;background:var(--surface-2);border:1px solid var(--border);padding:6px;"></th>${Array.from({length:COLS}).map((_,c) => `<th style="background:var(--surface-2);border:1px solid var(--border);padding:6px;min-width:90px;">${colName(c)}</th>`).join('')}</tr></thead>
                        <tbody>${Array.from({length:ROWS}).map((_,r) => `<tr><td style="background:var(--surface-2);border:1px solid var(--border);padding:6px;text-align:center;font-weight:600;color:var(--text-muted);">${r+1}</td>${Array.from({length:COLS}).map((_,c) => `<td style="border:1px solid var(--border);padding:0;"><input type="text" data-r="${r}" data-c="${c}" value="${NX.esc(data[key(r,c)] || '')}" style="width:100%;height:100%;border:none;padding:6px;background:transparent;color:var(--text);outline:none;font-size:13px;"></td>`).join('')}</tr>`).join('')}</tbody>
                    </table>
                </div>
            </div>`;
        NX.$$('input[data-r]', body).forEach(inp => inp.oninput = () => { data[key(parseInt(inp.dataset.r), parseInt(inp.dataset.c))] = inp.value; });
        NX.$('#se', body).onclick = () => {
            let csv = '';
            for (let r = 0; r < ROWS; r++) { const row = []; for (let c = 0; c < COLS; c++) row.push(`"${(data[key(r,c)] || '').replace(/"/g, '""')}"`); csv += row.join(',') + '\n'; }
            const b = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'Таблица.csv'; a.click();
        };
        NX.$('#ss', body).onclick = () => { const n = prompt('Имя:', 'Таблица.csv'); if (!n) return; let csv = ''; for (let r = 0; r < ROWS; r++) { const row = []; for (let c = 0; c < COLS; c++) row.push(data[key(r,c)] || ''); csv += row.join(',') + '\n'; } NX.fs.addFile('Документы', n, csv, 'sheet'); NX.notifications.push('Таблица', 'Сохранено', 'save'); };
    }
});

// ---------- 6. PDF ----------
NX.registerApp({
    id: 'pdf', name: 'PDF', icon: NX.icons.pdf, color: '#e8534a',
    category: 'Программы', description: 'Просмотр PDF.', w: 800, h: 650, single: true,
    render(body) {
        const render = () => {
            const docs = NX.fs.getNode(['Документы']).children.filter(c => c.type === 'file' && c.kind === 'pdf');
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar"><div style="font-weight:600;">PDF</div><div style="flex:1"></div><button class="btn ghost" id="pl">${NX.icons.folder} Открыть</button></div>
                    <div style="flex:1;display:flex;flex-direction:column;background:var(--surface-2);">
                        ${docs.length === 0 ? `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-muted);"><div style="font-size:48px;margin-bottom:16px;opacity:0.3;">${NX.icons.pdf}</div><div>PDF-файлов нет</div></div>` :
                            `<div style="padding:8px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;">${docs.map((d,i) => `<div style="display:flex;align-items:center;gap:4px;"><button class="btn ghost pd" data-i="${i}" style="height:28px;font-size:11px;">${NX.esc(d.name)}</button><button class="btn ghost pdel" data-n="${NX.esc(d.name)}" style="height:28px;width:28px;padding:0;justify-content:center;color:var(--danger);">×</button></div>`).join('')}</div>
                            <div style="flex:1;padding:16px;"><iframe id="pf" style="width:100%;height:100%;border:1px solid var(--border);border-radius:8px;background:#fff;"></iframe></div>`}
                    </div>
                </div>`;
            NX.$('#pl', body).onclick = () => {
                const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/pdf';
                i.onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { NX.fs.addFile('Документы', f.name, ev.target.result, 'pdf'); render(); }; r.readAsDataURL(f); };
                i.click();
            };
            NX.$$('.pd', body).forEach(b => b.onclick = () => { const f = NX.$('#pf', body); if (f) f.src = docs[parseInt(b.dataset.i)].content; });
            NX.$$('.pdel', body).forEach(b => b.onclick = () => { if (confirm('Удалить?')) { NX.fs.deleteFile('Документы', b.dataset.n); render(); } });
            if (docs.length > 0) setTimeout(() => { const f = NX.$('#pf', body); if (f) f.src = docs[0].content; }, 100);
        };
        render();
    }
});

// ---------- 7. KANBAN ----------
NX.registerApp({
    id: 'kanban', name: 'Kanban', icon: NX.icons.kanban, color: '#5e5ce6',
    category: 'Программы', description: 'Kanban-доска.', w: 950, h: 600,
    render(body) {
        const COLS = [{ id: 'backlog', name: 'Бэклог' }, { id: 'progress', name: 'В работе' }, { id: 'review', name: 'На проверке' }, { id: 'done', name: 'Готово' }];
        const getTasks = () => (NX.state.tasks || []).map(t => ({ ...t, column: t.column || 'backlog' }));
        const save = (tasks) => { NX.state.tasks = tasks; NX.saveState(); };
        const render = () => {
            const tasks = getTasks(); let dragged = null;
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar"><div style="font-weight:600;">Kanban</div><div style="flex:1"></div><button class="btn primary" id="ka">+ Задача</button></div>
                    <div style="flex:1;display:flex;gap:12px;padding:16px;overflow-x:auto;background:var(--surface-2);">
                        ${COLS.map(col => `<div style="flex:1;min-width:220px;background:var(--surface);border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;"><div style="padding:12px;border-bottom:1px solid var(--border);font-weight:600;display:flex;justify-content:space-between;"><span>${col.name}</span><span style="color:var(--text-muted);font-weight:400;">${tasks.filter(t => t.column === col.id).length}</span></div><div class="kd" data-col="${col.id}" style="flex:1;padding:10px;display:flex;flex-direction:column;gap:8px;min-height:80px;overflow-y:auto;">${tasks.filter(t => t.column === col.id).map(t => `<div class="kc" draggable="true" data-id="${t.id}" style="padding:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;cursor:grab;font-size:13px;"><div style="display:flex;justify-content:space-between;"><span style="${t.done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${NX.esc(t.text)}</span><button class="kx" data-id="${t.id}" style="color:var(--text-muted);background:transparent;border:none;cursor:pointer;">×</button></div></div>`).join('')}</div></div>`).join('')}
                    </div>
                </div>`;
            NX.$('#ka', body).onclick = () => { const t = prompt('Задача:'); if (!t) return; const tasks = getTasks(); tasks.push({ id: Date.now(), text: t, done: false, column: 'backlog' }); save(tasks); render(); };
            NX.$$('.kx', body).forEach(b => b.onclick = e => { e.stopPropagation(); save(getTasks().filter(t => t.id !== parseInt(b.dataset.id))); render(); });
            NX.$$('.kc', body).forEach(c => {
                c.addEventListener('dragstart', () => { dragged = parseInt(c.dataset.id); c.style.opacity = '0.4'; });
                c.addEventListener('dragend', () => { c.style.opacity = '1'; });
            });
            NX.$$('.kd', body).forEach(d => {
                d.addEventListener('dragover', e => { e.preventDefault(); d.style.background = 'var(--accent-soft)'; });
                d.addEventListener('dragleave', () => d.style.background = 'transparent');
                d.addEventListener('drop', e => { e.preventDefault(); d.style.background = 'transparent'; if (dragged === null) return; const tasks = getTasks(); const t = tasks.find(x => x.id === dragged); if (t) { t.column = d.dataset.col; t.done = t.column === 'done'; save(tasks); render(); } dragged = null; });
            });
        };
        render();
    }
});

// ---------- 8. POMODORO ----------
NX.registerApp({
    id: 'pomodoro', name: 'Pomodoro', icon: NX.icons.pomodoro, color: '#f0a24b',
    category: 'Программы', description: 'Таймер Pomodoro.', w: 500, h: 550, single: true,
    render(body, ctx) {
        const W = 25*60, S = 5*60, L = 15*60;
        let mode = 'work', time = W, timer = null, run = false, count = parseInt(localStorage.getItem('nx_pomodoro') || '0');
        const render = () => {
            const m = Math.floor(time/60), s = time%60;
            const c = mode === 'work' ? 'var(--danger)' : 'var(--success)';
            const nm = mode === 'work' ? 'Работа' : (mode === 'short' ? 'Перерыв' : 'Долгий');
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;align-items:center;justify-content:center;padding:24px;gap:20px;">
                    <div style="display:flex;gap:8px;">
                        <button class="btn ${mode === 'work' ? 'primary' : 'ghost'}" data-m="work">25 мин</button>
                        <button class="btn ${mode === 'short' ? 'primary' : 'ghost'}" data-m="short">5 мин</button>
                        <button class="btn ${mode === 'long' ? 'primary' : 'ghost'}" data-m="long">15 мин</button>
                    </div>
                    <div style="width:260px;height:260px;border-radius:50%;border:8px solid ${c};display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--surface);"><div style="font-size:64px;font-weight:200;font-variant-numeric:tabular-nums;">${NX.pad(m)}:${NX.pad(s)}</div><div style="font-size:14px;color:var(--text-muted);margin-top:8px;">${nm}</div></div>
                    <div style="display:flex;gap:12px;"><button class="btn primary" id="pt" style="min-width:120px;justify-content:center;">${run ? 'Пауза' : 'Старт'}</button><button class="btn ghost" id="pr">Сброс</button></div>
                    <div style="font-size:13px;color:var(--text-muted);">Сессий: <b>${count}</b></div>
                </div>`;
            NX.$$('[data-m]', body).forEach(b => b.onclick = () => { if (run) return; mode = b.dataset.m; time = mode === 'work' ? W : (mode === 'short' ? S : L); render(); });
            NX.$('#pt', body).onclick = () => {
                if (run) { clearInterval(timer); run = false; render(); }
                else {
                    run = true;
                    timer = setInterval(() => {
                        if (time > 0) { time--; render(); }
                        else { clearInterval(timer); run = false; NX.audio.notify(); NX.notifications.push('Pomodoro', mode === 'work' ? 'Работа завершена!' : 'Перерыв закончен!', 'check'); if (mode === 'work') { count++; localStorage.setItem('nx_pomodoro', count); mode = 'short'; time = S; } else { mode = 'work'; time = W; } render(); }
                    }, 1000);
                    render();
                }
            };
            NX.$('#pr', body).onclick = () => { clearInterval(timer); run = false; time = mode === 'work' ? W : (mode === 'short' ? S : L); render(); };
        };
        ctx.onClose(() => clearInterval(timer));
        render();
    }
});

// ---------- 9. МЕССЕНДЖЕР (С БОРИСОМ) ----------
NX.registerApp({
    id: 'messenger', name: 'Мессенджер', icon: NX.icons.messenger, color: '#0a84ff',
    category: 'Программы', description: 'Чат с Борисом и друзьями (ИИ).', w: 850, h: 600, single: true,
    render(body) {
        const CONTACTS = [
            { id: 'boris', name: 'Борис', avatar: 'Б', isAI: true },
            { id: 'alice', name: 'Алиса', avatar: 'А', isAI: true },
            { id: 'team', name: 'Nextel Team', avatar: 'N', isAI: false }
        ];
        if (!NX.state.messages) NX.state.messages = {};
        let active = NX.state.messengerActive || 'boris';

        const render = () => {
            const msgs = NX.state.messages[active] || [];
            const contact = CONTACTS.find(c => c.id === active);
            body.innerHTML = `
                <div style="display:flex;height:100%;">
                    <div style="width:260px;background:var(--surface-2);border-right:1px solid var(--border);display:flex;flex-direction:column;">
                        <div style="padding:16px;border-bottom:1px solid var(--border);font-weight:600;">Чаты</div>
                        <div style="flex:1;overflow-y:auto;">
                            ${CONTACTS.map(c => `<div class="ci" data-id="${c.id}" style="padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;${active === c.id ? 'background:var(--accent-soft);' : ''}"><div style="width:40px;height:40px;border-radius:50%;background:${c.isAI ? 'var(--accent)' : '#888'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;">${c.avatar}</div><div><div style="font-weight:600;font-size:14px;">${c.name}${c.isAI ? ' 🤖' : ''}</div><div style="font-size:11px;color:var(--text-muted);">${(NX.state.messages[c.id] || []).length} сообщений</div></div></div>`).join('')}
                        </div>
                    </div>
                    <div style="flex:1;display:flex;flex-direction:column;">
                        <div style="padding:16px;border-bottom:1px solid var(--border);font-weight:600;display:flex;align-items:center;gap:8px;">${contact.name}${contact.isAI ? '<span style="font-size:11px;background:var(--accent-soft);color:var(--accent);padding:2px 8px;border-radius:10px;">ИИ</span>' : ''}</div>
                        <div id="cm" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;">
                            ${msgs.length === 0 ? '<div style="text-align:center;color:var(--text-muted);font-size:12px;margin-top:40px;">Начните диалог</div>' : msgs.map(m => `<div style="display:flex;${m.self ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}"><div style="max-width:70%;padding:10px 14px;border-radius:14px;background:${m.self ? 'var(--accent)' : 'var(--surface-2)'};color:${m.self ? '#fff' : 'var(--text)'};font-size:13px;line-height:1.4;">${NX.esc(m.text)}</div></div>`).join('')}
                        </div>
                        <div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px;">
                            <input type="text" id="ci" class="input" placeholder="Сообщение..." style="flex:1;">
                            <button class="btn primary" id="cs">Отправить</button>
                        </div>
                    </div>
                </div>`;
            NX.$$('.ci', body).forEach(el => el.onclick = () => { active = el.dataset.id; NX.state.messengerActive = active; NX.saveState(); render(); });
            const inp = NX.$('#ci', body);
            const send = () => {
                const text = inp.value.trim();
                if (!text) return;
                if (!NX.state.messages[active]) NX.state.messages[active] = [];
                NX.state.messages[active].push({ text, self: true, time: new Date().toISOString() });
                NX.saveState(); inp.value = ''; render();
                
                // Ответ от ИИ
                if (contact.isAI) {
                    const delay = 800 + Math.random() * 1500;
                    setTimeout(() => {
                        let reply;
                        if (contact.id === 'boris' && NX.AI && NX.AI.boris) {
                            reply = NX.AI.boris.generateResponse(text);
                        } else {
                            const fallbacks = ['Интересно!', 'Расскажи ещё', 'Понятно', 'Ха, здорово', 'А я и не знал'];
                            reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                        }
                        NX.state.messages[active].push({ text: reply, self: false, time: new Date().toISOString() });
                        NX.saveState();
                        render();
                    }, delay);
                }
            };
            NX.$('#cs', body).onclick = send;
            inp.onkeydown = e => { if (e.key === 'Enter') send(); };
            inp.focus();
            const cm = NX.$('#cm', body);
            if (cm) cm.scrollTop = cm.scrollHeight;
        };
        render();
    }
});

// ---------- 10. КОНТАКТЫ ----------
NX.registerApp({
    id: 'contacts', name: 'Контакты', icon: NX.icons.contacts, color: '#34aadc',
    category: 'Программы', description: 'Список контактов.', w: 700, h: 550, single: true,
    render(body) {
        if (!NX.state.contacts) NX.state.contacts = [];
        let search = '', selected = null;
        const render = () => {
            const filtered = NX.state.contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar"><input type="text" class="input" id="cs" placeholder="Поиск..." style="width:200px;" value="${NX.esc(search)}"><div style="flex:1"></div><button class="btn primary" id="ca">+ Добавить</button></div>
                    <div style="flex:1;display:flex;">
                        <div style="width:280px;border-right:1px solid var(--border);overflow-y:auto;">
                            ${filtered.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-muted);">Нет контактов</div>' : filtered.map(c => `<div class="ci" data-id="${c.id}" style="padding:12px 16px;display:flex;gap:12px;cursor:pointer;border-bottom:1px solid var(--border);${selected === c.id ? 'background:var(--accent-soft);' : ''}"><div style="width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;">${(c.name[0]||'?').toUpperCase()}</div><div><div style="font-weight:600;font-size:13px;">${NX.esc(c.name)}</div><div style="font-size:11px;color:var(--text-muted);">${NX.esc(c.phone || '')}</div></div></div>`).join('')}
                        </div>
                        <div style="flex:1;padding:24px;overflow-y:auto;">
                            ${selected ? (() => { const c = NX.state.contacts.find(x => x.id === selected); if (!c) return ''; return `<h2 style="font-size:22px;margin-bottom:20px;">${NX.esc(c.name)}</h2><div class="card"><div class="row"><span>Телефон</span><span>${NX.esc(c.phone || '—')}</span></div><div class="row"><span>Email</span><span>${NX.esc(c.email || '—')}</span></div></div><button class="btn ghost" id="cd" style="color:var(--danger);margin-top:20px;">Удалить контакт</button>`; })() : '<div style="text-align:center;color:var(--text-muted);margin-top:60px;">Выберите контакт</div>'}
                        </div>
                    </div>
                </div>`;
            NX.$('#cs', body).oninput = e => { search = e.target.value; render(); };
            NX.$('#ca', body).onclick = () => { const n = prompt('Имя:'); if (!n) return; const p = prompt('Телефон:') || ''; const e = prompt('Email:') || ''; NX.state.contacts.push({ id: Date.now(), name: n, phone: p, email: e }); NX.saveState(); render(); };
            NX.$$('.ci', body).forEach(el => el.onclick = () => { selected = parseInt(el.dataset.id); render(); });
            const del = NX.$('#cd', body);
            if (del) del.onclick = () => { if (confirm('Удалить?')) { NX.state.contacts = NX.state.contacts.filter(c => c.id !== selected); selected = null; NX.saveState(); render(); } };
        };
        render();
    }
});

// ---------- 11. ПАРОЛИ ----------
NX.registerApp({
    id: 'passwords', name: 'Пароли', icon: NX.icons.passwords, color: '#30b06b',
    category: 'Программы', description: 'Менеджер паролей AES-256.', w: 700, h: 550, single: true,
    render(body) {
        let entries = [], key = null;
        const deriveKey = async (pwd, salt) => {
            const enc = new TextEncoder();
            const km = await crypto.subtle.importKey('raw', enc.encode(pwd), 'PBKDF2', false, ['deriveKey']);
            return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
        };
        const encryptData = async (d, k) => {
            const enc = new TextEncoder(); const iv = crypto.getRandomValues(new Uint8Array(12));
            const e = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, enc.encode(JSON.stringify(d)));
            return { iv: Array.from(iv), data: Array.from(new Uint8Array(e)) };
        };
        const decryptData = async (d, k) => {
            const dec = new TextDecoder();
            const e = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(d.iv) }, k, new Uint8Array(d.data));
            return JSON.parse(dec.decode(e));
        };
        const init = () => {
            const s = localStorage.getItem('nx_passwords_encrypted');
            if (s) renderUnlock(); else renderCreate();
        };
        const renderUnlock = () => {
            body.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;"><div style="font-size:48px;">🔒</div><div style="font-size:18px;font-weight:600;">Менеджер паролей</div><input type="password" id="mp" class="input" placeholder="Мастер-пароль" style="width:280px;"><button class="btn primary" id="ub" style="width:280px;justify-content:center;">Разблокировать</button></div>`;
            NX.$('#ub', body).onclick = async () => {
                try {
                    const salt = localStorage.getItem('nx_passwords_salt');
                    const k = await deriveKey(NX.$('#mp', body).value, salt);
                    entries = await decryptData(JSON.parse(localStorage.getItem('nx_passwords_encrypted')), k);
                    key = k; renderList();
                } catch (e) { NX.notifications.push('Пароли', 'Неверный пароль', 'info'); }
            };
        };
        const renderCreate = () => {
            body.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;"><div style="font-size:48px;">🔐</div><div style="font-size:18px;font-weight:600;">Создайте мастер-пароль</div><input type="password" id="p1" class="input" placeholder="Пароль" style="width:280px;"><input type="password" id="p2" class="input" placeholder="Повторите" style="width:280px;"><button class="btn primary" id="cb" style="width:280px;justify-content:center;">Создать</button></div>`;
            NX.$('#cb', body).onclick = async () => {
                const p1 = NX.$('#p1', body).value, p2 = NX.$('#p2', body).value;
                if (p1.length < 4) return NX.notifications.push('Пароли', 'Мин. 4 символа', 'info');
                if (p1 !== p2) return NX.notifications.push('Пароли', 'Не совпадают', 'info');
                const salt = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
                localStorage.setItem('nx_passwords_salt', salt);
                key = await deriveKey(p1, salt); entries = []; await save(); renderList();
            };
        };
        const save = async () => {
            if (!key) return;
            const enc = await encryptData(entries, key);
            localStorage.setItem('nx_passwords_encrypted', JSON.stringify(enc));
        };
        const renderList = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar"><div style="font-weight:600;">Пароли (${entries.length})</div><div style="flex:1"></div><button class="btn primary" id="pa">+ Добавить</button><button class="btn ghost" id="plock">🔒</button></div>
                    <div style="flex:1;overflow-y:auto;padding:16px;">
                        ${entries.length === 0 ? '<div style="text-align:center;color:var(--text-muted);padding:40px;">Записей нет</div>' : entries.map((e, i) => `<div class="card" style="margin-bottom:8px;"><div class="row"><div><div style="font-weight:600;">${NX.esc(e.site)}</div><div style="font-size:12px;color:var(--text-muted);">${NX.esc(e.login)}</div></div><div style="display:flex;gap:8px;"><button class="btn ghost pc" data-i="${i}" style="height:26px;font-size:11px;">Копировать</button><button class="btn ghost pd" data-i="${i}" style="height:26px;font-size:11px;color:var(--danger);">×</button></div></div></div>`).join('')}
                    </div>
                </div>`;
            NX.$('#pa', body).onclick = async () => { const s = prompt('Сайт:'); if (!s) return; const l = prompt('Логин:') || ''; const p = prompt('Пароль:') || ''; entries.push({ site: s, login: l, password: p }); await save(); renderList(); };
            NX.$('#plock', body).onclick = () => { key = null; entries = []; init(); };
            NX.$$('.pc', body).forEach(b => b.onclick = () => { const e = entries[parseInt(b.dataset.i)]; if (e) { navigator.clipboard.writeText(e.password); NX.notifications.push('Пароли', 'Скопировано', 'check'); } });
            NX.$$('.pd', body).forEach(b => b.onclick = async () => { entries.splice(parseInt(b.dataset.i), 1); await save(); renderList(); });
        };
        init();
    }
});

// ---------- 12. БУФЕР ОБМЕНА ----------
NX.registerApp({
    id: 'clipboard', name: 'Буфер обмена', icon: NX.icons.clipboard, color: '#8e8e93',
    category: 'Утилиты', description: 'История буфера.', w: 500, h: 550, single: true,
    render(body) {
        const render = () => {
            const items = NX.clipboard.items || [];
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar"><div style="font-weight:600;">Буфер обмена</div><div style="flex:1"></div><button class="btn ghost" id="cc">Очистить</button></div>
                    <div style="flex:1;overflow-y:auto;padding:16px;">
                        ${items.length === 0 ? '<div style="text-align:center;color:var(--text-muted);padding:40px;">История пуста</div>' : items.map((t, i) => `<div class="card" style="margin-bottom:8px;cursor:pointer;" data-i="${i}"><div style="padding:12px;font-size:12px;word-break:break-word;">${NX.esc(t.slice(0, 200))}${t.length > 200 ? '...' : ''}</div></div>`).join('')}
                    </div>
                </div>`;
            NX.$('#cc', body).onclick = () => { NX.clipboard.items = []; NX.saveState(); render(); };
            NX.$$('.card[data-i]', body).forEach(el => el.onclick = () => { NX.clipboard.paste(items[parseInt(el.dataset.i)]); NX.notifications.push('Буфер', 'Скопировано', 'clipboard'); });
        };
        render();
    }
});

// ---------- 13. ДИСПЕТЧЕР ЗАДАЧ ----------
NX.registerApp({
    id: 'taskmgr', name: 'Диспетчер задач', icon: NX.icons.monitor, color: '#6e6e73',
    category: 'Система', description: 'Процессы и ресурсы.', w: 800, h: 550, single: true,
    render(body, ctx) {
        let cpuHist = Array(30).fill(10), ramHist = Array(30).fill(40), iv;
        const render = () => {
            const wins = NX.windows.list;
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar"><div style="font-weight:600;">Диспетчер задач</div><div style="flex:1"></div><span style="font-size:12px;color:var(--text-muted);">Процессов: ${wins.length + 3}</span></div>
                    <div style="display:flex;gap:16px;padding:16px;border-bottom:1px solid var(--border);">
                        <div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">CPU: ${cpuHist[cpuHist.length-1]}%</div><canvas id="ch" width="300" height="60" style="width:100%;height:60px;"></canvas></div>
                        <div style="flex:1;"><div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">RAM: ${ramHist[ramHist.length-1]}%</div><canvas id="rh" width="300" height="60" style="width:100%;height:60px;"></canvas></div>
                    </div>
                    <div style="flex:1;overflow-y:auto;">
                        <table style="width:100%;border-collapse:collapse;font-size:13px;">
                            <thead><tr style="background:var(--surface-2);"><th style="text-align:left;padding:10px 16px;border-bottom:1px solid var(--border);">Процесс</th><th style="text-align:left;padding:10px 16px;border-bottom:1px solid var(--border);">Тип</th><th style="text-align:right;padding:10px 16px;border-bottom:1px solid var(--border);">CPU%</th><th style="text-align:right;padding:10px 16px;border-bottom:1px solid var(--border);">RAM</th><th style="text-align:center;padding:10px 16px;border-bottom:1px solid var(--border);"></th></tr></thead>
                            <tbody>
                                <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 16px;">Nextel Kernel</td><td style="padding:10px 16px;color:var(--text-muted);">Система</td><td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*5)+1}%</td><td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*100)+200} МБ</td><td style="padding:10px 16px;text-align:center;color:var(--text-muted);">—</td></tr>
                                <tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 16px;">Nextel Shell</td><td style="padding:10px 16px;color:var(--text-muted);">Система</td><td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*8)+2}%</td><td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*150)+100} МБ</td><td style="padding:10px 16px;text-align:center;color:var(--text-muted);">—</td></tr>
                                ${wins.map(w => { const a = NX.apps[w.appId]; return `<tr style="border-bottom:1px solid var(--border);"><td style="padding:10px 16px;">${a ? NX.esc(a.name) : w.appId}</td><td style="padding:10px 16px;color:var(--text-muted);">Приложение</td><td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*15)+1}%</td><td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*200)+50} МБ</td><td style="padding:10px 16px;text-align:center;"><button class="btn ghost kb" data-id="${w.id}" style="height:24px;font-size:11px;color:var(--danger);">Завершить</button></td></tr>`; }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
            NX.$$('.kb', body).forEach(b => b.onclick = () => { const w = NX.windows.list.find(x => x.id === b.dataset.id); if (w) { NX.closeWindow(w); render(); } });
            const drawChart = (id, data, color) => { const cv = NX.$('#'+id, body); if (!cv) return; const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height); c.strokeStyle = color; c.lineWidth = 2; c.beginPath(); data.forEach((v, i) => { const x = (i / (data.length - 1)) * cv.width; const y = cv.height - (v / 100) * cv.height; if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); }); c.stroke(); };
            drawChart('ch', cpuHist, '#ef4444'); drawChart('rh', ramHist, '#3b82f6');
        };
        render();
        iv = setInterval(() => { const c = NX.windows.list.length; cpuHist.push(Math.min(95, Math.max(5, 10 + c * 5 + Math.random() * 15))); ramHist.push(Math.min(95, Math.max(20, 30 + c * 3 + Math.random() * 10))); cpuHist.shift(); ramHist.shift(); if (NX.windows.focused && NX.windows.focused.appId === 'taskmgr') render(); }, 1000);
        ctx.onClose(() => clearInterval(iv));
    }
});

// ---------- 14. КОНВЕРТЕР ----------
NX.registerApp({
    id: 'converter', name: 'Конвертер', icon: NX.icons.converter, color: '#2b8a5f',
    category: 'Утилиты', description: 'Конвертер единиц.', w: 500, h: 550, single: true,
    render(body) {
        const U = {
            'Длина': { 'Метр': 1, 'Километр': 1000, 'Сантиметр': 0.01, 'Миллиметр': 0.001, 'Майл': 1609.34, 'Фут': 0.3048, 'Дюйм': 0.0254 },
            'Масса': { 'Килограмм': 1, 'Грамм': 0.001, 'Тонна': 1000, 'Фунт': 0.453592, 'Унция': 0.0283495 },
            'Данные': { 'Байт': 1, 'Килобайт': 1024, 'Мегабайт': 1048576, 'Гигабайт': 1073741824, 'Терабайт': 1099511627776 },
            'Время': { 'Секунда': 1, 'Минута': 60, 'Час': 3600, 'Сутки': 86400, 'Год': 31536000 }
        };
        let cat = 'Длина';
        const render = () => {
            const units = Object.keys(U[cat]);
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;padding:24px;gap:16px;">
                    <h2 style="font-size:20px;">Конвертер</h2>
                    <select class="input" id="cc">${Object.keys(U).map(c => `<option value="${c}" ${c === cat ? 'selected' : ''}>${c}</option>`).join('')}</select>
                    <div style="display:flex;gap:8px;"><input type="number" id="cv" class="input" value="1" style="flex:1;"><select class="input" id="cf" style="width:140px;">${units.map(u => `<option>${u}</option>`).join('')}</select></div>
                    <div style="text-align:center;font-size:20px;color:var(--text-muted);">↓</div>
                    <div style="display:flex;gap:8px;"><input type="text" id="cr" class="input" readonly style="flex:1;background:var(--surface-2);"><select class="input" id="ct" style="width:140px;">${units.map((u,i) => `<option ${i === Math.min(1, units.length-1) ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
                    <div id="ch2" style="font-size:12px;color:var(--text-muted);text-align:center;"></div>
                </div>`;
            const calc = () => { const v = parseFloat(NX.$('#cv', body).value) || 0; const f = NX.$('#cf', body).value; const t = NX.$('#ct', body).value; const out = v * U[cat][f] / U[cat][t]; NX.$('#cr', body).value = Number(out.toPrecision(10)); NX.$('#ch2', body).textContent = `${v} ${f} = ${out.toPrecision(6)} ${t}`; };
            NX.$('#cc', body).onchange = e => { cat = e.target.value; render(); };
            ['#cv', '#cf', '#ct'].forEach(sel => { const el = NX.$(sel, body); if (el) { el.oninput = calc; el.onchange = calc; } });
            calc();
        };
        render();
    }
});

// ---------- 15. SPEED TEST ----------
NX.registerApp({
    id: 'speedtest', name: 'Speed Test', icon: NX.icons.speedtest, color: '#ff9f0a',
    category: 'Утилиты', description: 'Тест скорости.', w: 550, h: 600, single: true,
    render(body) {
        let testing = false;
        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;padding:24px;gap:16px;align-items:center;">
                <h2 style="font-size:20px;">Speed Test</h2>
                <div style="width:220px;height:220px;border-radius:50%;border:8px solid var(--surface-3);display:flex;flex-direction:column;align-items:center;justify-content:center;">
                    <div id="ss" style="font-size:48px;font-weight:200;">0</div>
                    <div style="font-size:12px;color:var(--text-muted);">Мбит/с</div>
                </div>
                <div style="display:flex;gap:24px;font-size:13px;">
                    <div>Ping: <b id="sp">—</b> мс</div>
                    <div>Down: <b id="sd">—</b> Мбит/с</div>
                    <div>Up: <b id="su">—</b> Мбит/с</div>
                </div>
                <button class="btn primary" id="st" style="min-width:200px;justify-content:center;">Начать</button>
                <div id="stt" style="font-size:12px;color:var(--text-muted);"></div>
            </div>`;
        NX.$('#st', body).onclick = async () => {
            if (testing) return; testing = true;
            const st = NX.$('#stt', body), se = NX.$('#ss', body), pe = NX.$('#sp', body), de = NX.$('#sd', body), ue = NX.$('#su', body);
            NX.$('#st', body).disabled = true;
            st.textContent = 'Ping...';
            await new Promise(r => setTimeout(r, 800));
            const ping = Math.floor(Math.random() * 30) + 5; pe.textContent = ping;
            st.textContent = 'Download...';
            let dl = 0; const tdl = Math.floor(Math.random() * 200) + 50;
            for (let i = 0; i < 30; i++) { dl = Math.floor(tdl * (i+1) / 30); se.textContent = dl; de.textContent = dl; await new Promise(r => setTimeout(r, 80)); }
            st.textContent = 'Upload...';
            let ul = 0; const tul = Math.floor(Math.random() * 100) + 20;
            for (let i = 0; i < 30; i++) { ul = Math.floor(tul * (i+1) / 30); se.textContent = ul; ue.textContent = ul; await new Promise(r => setTimeout(r, 80)); }
            st.textContent = 'Готово!';
            testing = false;
            NX.$('#st', body).disabled = false;
            NX.$('#st', body).textContent = 'Повторить';
        };
    }
});

// ---------- 16. ЗАПИСЬ ЭКРАНА ----------
NX.registerApp({
    id: 'screen_recorder', name: 'Запись экрана', icon: NX.icons.video, color: '#111827',
    category: 'Программы', description: 'Запись экрана через getDisplayMedia.', w: 700, h: 550, single: true,
    render(body, ctx) {
        let mr = null, chunks = [], isRec = false, timer = null, sec = 0;
        const render = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar"><div style="font-weight:600;">Запись экрана</div><div style="flex:1"></div><span id="srt" style="font-size:14px;font-variant-numeric:tabular-nums;">${NX.pad(Math.floor(sec/60))}:${NX.pad(sec%60)}</span></div>
                    <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#000;padding:20px;">
                        <div style="text-align:center;color:#fff;">
                            <div style="font-size:64px;margin-bottom:20px;">${isRec ? '🔴' : '📹'}</div>
                            <div style="font-size:18px;margin-bottom:8px;">${isRec ? 'Идёт запись...' : 'Готов к записи'}</div>
                            <div style="font-size:12px;opacity:0.7;margin-bottom:20px;">${isRec ? 'Запись можно остановить в любой момент' : 'Нажмите «Начать» и выберите что записывать'}</div>
                        </div>
                    </div>
                    <div style="padding:16px;display:flex;justify-content:center;gap:12px;">
                        <button class="btn ${isRec ? 'ghost' : 'primary'}" id="srec" style="min-width:160px;justify-content:center;">${isRec ? 'Остановить' : 'Начать запись'}</button>
                    </div>
                </div>`;
            NX.$('#srec', body).onclick = async () => {
                if (isRec) { if (mr) mr.stop(); return; }
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: 'screen' }, audio: true });
                    mr = new MediaRecorder(stream, { mimeType: 'video/webm' });
                    chunks = [];
                    mr.ondataavailable = e => chunks.push(e.data);
                    mr.onstop = () => {
                        const blob = new Blob(chunks, { type: 'video/webm' });
                        const r = new FileReader();
                        r.onload = ev => {
                            const name = `Запись_экрана_${Date.now()}.webm`;
                            NX.fs.addFile('Загрузки', name, ev.target.result, 'video');
                            NX.notifications.push('Запись экрана', 'Сохранено в Загрузки', 'save');
                        };
                        r.readAsDataURL(blob);
                        stream.getTracks().forEach(t => t.stop());
                        isRec = false;
                        clearInterval(timer);
                        render();
                    };
                    mr.start();
                    isRec = true;
                    sec = 0;
                    timer = setInterval(() => { sec++; const el = NX.$('#srt', body); if (el) el.textContent = `${NX.pad(Math.floor(sec/60))}:${NX.pad(sec%60)}`; }, 1000);
                    render();
                } catch (e) {
                    NX.notifications.push('Запись экрана', 'Нет разрешения: ' + e.message, 'info');
                }
            };
        };
        ctx.onClose(() => { clearInterval(timer); if (mr && isRec) mr.stop(); });
        render();
    }
});

// ---------- 17. СКРИНШОТ ----------
NX.registerApp({
    id: 'screenshot', name: 'Скриншот', icon: NX.icons.camera, color: '#0a84ff',
    category: 'Программы', description: 'Снимок экрана.', w: 800, h: 600, single: true,
    render(body) {
        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div class="toolbar"><div style="font-weight:600;">Скриншот</div><div style="flex:1"></div><button class="btn primary" id="smk">Сделать снимок</button></div>
                <div style="flex:1;display:flex;align-items:center;justify-content:center;background:var(--surface-2);padding:20px;">
                    <div id="spre" style="text-align:center;color:var(--text-muted);">
                        <div style="font-size:64px;margin-bottom:20px;opacity:0.5;">📸</div>
                        <div>Нажмите «Сделать снимок»<br>и выберите окно экрана</div>
                    </div>
                </div>
            </div>`;
        NX.$('#smk', body).onclick = async () => {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: 'screen' } });
                const track = stream.getVideoTracks()[0];
                const settings = track.getSettings();
                const video = document.createElement('video');
                video.srcObject = stream;
                await new Promise(r => video.onloadedmetadata = r);
                await video.play();
                await new Promise(r => setTimeout(r, 200));
                const canvas = document.createElement('canvas');
                canvas.width = settings.width || video.videoWidth;
                canvas.height = settings.height || video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                stream.getTracks().forEach(t => t.stop());
                const dataUrl = canvas.toDataURL('image/png');
                const name = `Скриншот_${Date.now()}.png`;
                NX.fs.addFile('Изображения', name, dataUrl, 'img');
                const pre = NX.$('#spre', body);
                pre.innerHTML = `<img src="${dataUrl}" style="max-width:100%;max-height:100%;border-radius:8px;box-shadow:var(--shadow-lg);">`;
                NX.notifications.push('Скриншот', 'Сохранено в Изображения', 'check');
            } catch (e) {
                NX.notifications.push('Скриншот', 'Отменено или нет разрешения', 'info');
            }
        };
    }
});

// ---------- 18. VPN ----------
NX.registerApp({
    id: 'vpn', name: 'VPN', icon: NX.icons.wifi, color: '#10b981',
    category: 'Система', description: 'Виртуальная частная сеть.', w: 550, h: 550, single: true,
    render(body) {
        if (!NX.state.vpn) NX.state.vpn = { connected: false, country: 'Россия' };
        const COUNTRIES = ['Россия', 'США', 'Германия', 'Нидерланды', 'Япония', 'Сингапур', 'Франция', 'Великобритания'];
        const render = () => {
            const v = NX.state.vpn;
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;padding:24px;gap:20px;">
                    <h2 style="font-size:20px;">VPN</h2>
                    <div style="text-align:center;padding:30px;background:var(--surface-2);border-radius:12px;">
                        <div style="width:120px;height:120px;margin:0 auto 20px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${v.connected ? 'var(--success)' : 'var(--surface-3)'};color:${v.connected ? '#fff' : 'var(--text-muted)'};font-size:48px;">
                            ${v.connected ? '🔒' : '🔓'}
                        </div>
                        <div style="font-size:18px;font-weight:600;margin-bottom:8px;">${v.connected ? 'Защищено' : 'Не защищено'}</div>
                        <div style="font-size:13px;color:var(--text-muted);">${v.connected ? 'IP-адрес скрыт' : 'IP-адрес виден'}</div>
                    </div>
                    <div class="card">
                        <div class="row"><span>Страна</span><select class="input" id="vc" style="width:200px;">${COUNTRIES.map(c => `<option ${c === v.country ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
                        <div class="row"><span>Протокол</span><span>WireGuard</span></div>
                        <div class="row"><span>IP-адрес</span><span>${v.connected ? `10.8.0.${Math.floor(Math.random() * 200) + 2}` : '192.168.1.42'}</span></div>
                    </div>
                    <button class="btn ${v.connected ? 'ghost' : 'primary'}" id="vt" style="min-width:200px;justify-content:center;padding:12px;">
                        ${v.connected ? 'Отключить VPN' : 'Подключить VPN'}
                    </button>
                </div>`;
            NX.$('#vc', body).onchange = e => { NX.state.vpn.country = e.target.value; NX.saveState(); render(); };
            NX.$('#vt', body).onclick = () => {
                const v = NX.state.vpn;
                v.connected = !v.connected;
                NX.saveState();
                if (v.connected) NX.notifications.push('VPN', `Подключено к ${v.country}`, 'check');
                else NX.notifications.push('VPN', 'Отключено', 'info');
                render();
            };
        };
        render();
    }
});

// ---------- 19. БРАНДМАУЭР ----------
NX.registerApp({
    id: 'firewall', name: 'Брандмауэр', icon: NX.icons.antivirus, color: '#ef4444',
    category: 'Система', description: 'Сетевые правила.', w: 800, h: 600, single: true,
    render(body) {
        if (!NX.state.firewall) NX.state.firewall = {
            enabled: true,
            rules: [
                { id: 1, name: 'Nextel Kernel', port: 443, protocol: 'TCP', action: 'allow', enabled: true },
                { id: 2, name: 'Браузер', port: 80, protocol: 'TCP', action: 'allow', enabled: true },
                { id: 3, name: 'Nextel Update', port: 8080, protocol: 'TCP', action: 'block', enabled: false }
            ]
        };
        const render = () => {
            const f = NX.state.firewall;
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="font-weight:600;">Брандмауэр</div>
                        <div style="flex:1"></div>
                        <div class="switch ${f.enabled ? 'on' : ''}" id="fe"></div>
                    </div>
                    <div style="padding:16px;border-bottom:1px solid var(--border);">
                        <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">Статус: <b style="color:${f.enabled ? 'var(--success)' : 'var(--danger)'};">${f.enabled ? 'Активен' : 'Отключён'}</b></div>
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:16px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <h3 style="font-size:14px;font-weight:600;">Правила (${f.rules.length})</h3>
                            <button class="btn primary" id="fa" style="height:28px;font-size:12px;">+ Правило</button>
                        </div>
                        <div class="card">
                            ${f.rules.map(r => `<div class="row">
                                <div>
                                    <div style="font-weight:600;">${NX.esc(r.name)}</div>
                                    <div style="font-size:11px;color:var(--text-muted);">Порт ${r.port} · ${r.protocol}</div>
                                </div>
                                <div style="display:flex;gap:8px;align-items:center;">
                                    <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${r.action === 'allow' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'};color:${r.action === 'allow' ? 'var(--success)' : 'var(--danger)'};">${r.action === 'allow' ? 'Разрешено' : 'Заблокировано'}</span>
                                    <div class="switch ${r.enabled ? 'on' : ''}" data-rule="${r.id}"></div>
                                    <button class="btn ghost fd" data-id="${r.id}" style="height:24px;width:24px;padding:0;color:var(--danger);">×</button>
                                </div>
                            </div>`).join('')}
                        </div>
                    </div>
                </div>`;
            NX.$('#fe', body).onclick = function() { f.enabled = !f.enabled; NX.saveState(); render(); };
            NX.$('#fa', body).onclick = () => {
                const name = prompt('Имя приложения:'); if (!name) return;
                const port = parseInt(prompt('Порт (например 80):') || '80');
                const proto = prompt('Протокол (TCP/UDP):', 'TCP') || 'TCP';
                const action = confirm('Разрешить? (OK=Разрешить, Отмена=Блокировать)') ? 'allow' : 'block';
                f.rules.push({ id: Date.now(), name, port, protocol: proto.toUpperCase(), action, enabled: true });
                NX.saveState(); render();
            };
            NX.$$('[data-rule]', body).forEach(sw => sw.onclick = function() {
                const id = parseInt(this.dataset.rule);
                const r = f.rules.find(x => x.id === id);
                if (r) { r.enabled = !r.enabled; NX.saveState(); render(); }
            });
            NX.$$('.fd', body).forEach(b => b.onclick = () => { f.rules = f.rules.filter(r => r.id !== parseInt(b.dataset.id)); NX.saveState(); render(); });
        };
        render();
    }
});

// ---------- 20. МАТЕМАТИКА (5 языков) ----------
NX.registerApp({
    id: 'math', name: 'Математика', icon: NX.icons.calc, color: '#8b5cf6',
    category: 'Утилиты', description: 'Справочник формул на 5 языках.', w: 750, h: 600, single: true,
    render(body) {
        const LANGS = { ru: 'Русский', en: 'English', de: 'Deutsch', fr: 'Français', es: 'Español' };
        let lang = NX.state.mathLang || 'ru';
        const FORMULAS = {
            ru: [
                { name: 'Теорема Пифагора', formula: 'a² + b² = c²', desc: 'Квадрат гипотенузы равен сумме квадратов катетов' },
                { name: 'Площадь круга', formula: 'S = πr²', desc: 'Площадь = π × радиус²' },
                { name: 'Квадратное уравнение', formula: 'x = (-b ± √(b²-4ac)) / 2a', desc: 'Формула корней' },
                { name: 'Площадь треугольника', formula: 'S = ½ × a × h', desc: 'Половина произведения основания на высоту' }
            ],
            en: [
                { name: 'Pythagorean theorem', formula: 'a² + b² = c²', desc: 'Square of hypotenuse equals sum of squares of legs' },
                { name: 'Area of circle', formula: 'S = πr²', desc: 'Area = π × radius²' },
                { name: 'Quadratic equation', formula: 'x = (-b ± √(b²-4ac)) / 2a', desc: 'Roots formula' },
                { name: 'Area of triangle', formula: 'S = ½ × a × h', desc: 'Half of base times height' }
            ],
            de: [
                { name: 'Satz des Pythagoras', formula: 'a² + b² = c²', desc: 'Quadrat der Hypotenuse ist gleich der Summe der Quadrate der Katheten' },
                { name: 'Kreisfläche', formula: 'S = πr²', desc: 'Fläche = π × Radius²' },
                { name: 'Quadratische Gleichung', formula: 'x = (-b ± √(b²-4ac)) / 2a', desc: 'Wurzelformel' },
                { name: 'Dreiecksfläche', formula: 'S = ½ × a × h', desc: 'Halb Produkt aus Basis und Höhe' }
            ],
            fr: [
                { name: 'Théorème de Pythagore', formula: 'a² + b² = c²', desc: 'Le carré de l\'hypoténuse est égal à la somme des carrés des cathètes' },
                { name: 'Aire du cercle', formula: 'S = πr²', desc: 'Aire = π × rayon²' },
                { name: 'Équation quadratique', formula: 'x = (-b ± √(b²-4ac)) / 2a', desc: 'Formule des racines' },
                { name: 'Aire du triangle', formula: 'S = ½ × a × h', desc: 'Moitié du produit base × hauteur' }
            ],
            es: [
                { name: 'Teorema de Pitágoras', formula: 'a² + b² = c²', desc: 'El cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos' },
                { name: 'Área del círculo', formula: 'S = πr²', desc: 'Área = π × radio²' },
                { name: 'Ecuación cuadrática', formula: 'x = (-b ± √(b²-4ac)) / 2a', desc: 'Fórmula de raíces' },
                { name: 'Área del triángulo', formula: 'S = ½ × a × h', desc: 'Mitad del producto base × altura' }
            ]
        };
        const render = () => {
            const formulas = FORMULAS[lang];
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="font-weight:600;">Математика</div>
                        <div style="flex:1"></div>
                        <select class="input" id="ml" style="width:150px;height:28px;font-size:12px;">${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${k === lang ? 'selected' : ''}>${v}</option>`).join('')}</select>
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:16px;">
                        ${formulas.map(f => `<div class="card" style="padding:16px;margin-bottom:12px;">
                            <div style="font-weight:600;font-size:15px;margin-bottom:6px;">${NX.esc(f.name)}</div>
                            <div style="font-size:20px;font-family:monospace;color:var(--accent);margin-bottom:6px;">${NX.esc(f.formula)}</div>
                            <div style="font-size:12px;color:var(--text-muted);">${NX.esc(f.desc)}</div>
                        </div>`).join('')}
                    </div>
                </div>`;
            NX.$('#ml', body).onchange = e => { lang = e.target.value; NX.state.mathLang = lang; NX.saveState(); render(); };
        };
        render();
    }
});

// ---------- 21. ПЕРЕВОДЧИК (5 языков через MyMemory) ----------
NX.registerApp({
    id: 'translator', name: 'Переводчик', icon: NX.icons.globe, color: '#0a84ff',
    category: 'Программы', description: 'Перевод на 5+ языков (MyMemory API).', w: 700, h: 600, single: true,
    render(body) {
        const LANGS = { ru: 'Русский', en: 'Английский', de: 'Немецкий', fr: 'Французский', es: 'Испанский' };
        let fromLang = 'ru', toLang = 'en';
        
        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div class="toolbar">
                    <div style="font-weight:600;">Переводчик</div>
                    <div style="flex:1"></div>
                    <select class="input" id="tf" style="width:140px;height:28px;font-size:12px;">${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${k === fromLang ? 'selected' : ''}>${v}</option>`).join('')}</select>
                    <button class="btn ghost" id="ts" style="padding:0 8px;" title="Поменять">⇄</button>
                    <select class="input" id="tt" style="width:140px;height:28px;font-size:12px;">${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${k === toLang ? 'selected' : ''}>${v}</option>`).join('')}</select>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;padding:16px;gap:12px;">
                    <textarea id="tin" class="input" placeholder="Введите текст для перевода..." style="flex:1;resize:none;padding:12px;font-size:14px;line-height:1.6;min-height:120px;"></textarea>
                    <button class="btn primary" id="tgo" style="height:40px;">Перевести</button>
                    <textarea id="tout" class="input" readonly placeholder="Перевод появится здесь..." style="flex:1;resize:none;padding:12px;font-size:14px;line-height:1.6;background:var(--surface-2);min-height:120px;"></textarea>
                    <div id="tstatus" style="font-size:12px;color:var(--text-muted);text-align:center;min-height:16px;"></div>
                </div>
            </div>`;
        
        NX.$('#ts', body).onclick = () => {
            [fromLang, toLang] = [toLang, fromLang];
            NX.$('#tf', body).value = fromLang;
            NX.$('#tt', body).value = toLang;
        };
        NX.$('#tf', body).onchange = e => fromLang = e.target.value;
        NX.$('#tt', body).onchange = e => toLang = e.target.value;
        
        NX.$('#tgo', body).onclick = async () => {
            const text = NX.$('#tin', body).value.trim();
            if (!text) return;
            const status = NX.$('#tstatus', body);
            const out = NX.$('#tout', body);
            status.textContent = 'Переводим...';
            out.value = '';
            try {
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.responseData && data.responseData.translatedText) {
                    out.value = data.responseData.translatedText;
                    status.textContent = 'Готово';
                } else {
                    status.textContent = 'Не удалось перевести';
                }
            } catch (e) {
                status.textContent = 'Ошибка: ' + e.message;
            }
        };
    }
});

// ---------- 22. ДРАЙВЕРЫ ----------
NX.registerApp({
    id: 'drivers', name: 'Драйверы', icon: NX.icons.device, color: '#6b7280',
    category: 'Система', description: 'Диспетчер драйверов.', w: 800, h: 600, single: true,
    render(body) {
        const DRIVERS = [
            { id: 1, name: 'Nextel Graphics', version: '2.1.0', date: '2026-01-15', status: 'ok', type: 'video' },
            { id: 2, name: 'Nextel Audio', version: '1.8.3', date: '2026-01-10', status: 'ok', type: 'audio' },
            { id: 3, name: 'Nextel WiFi', version: '3.2.1', date: '2025-12-20', status: 'update', type: 'network' },
            { id: 4, name: 'Nextel Bluetooth', version: '2.4.0', date: '2025-11-05', status: 'ok', type: 'bluetooth' },
            { id: 5, name: 'Nextel Camera', version: '1.5.2', date: '2026-01-08', status: 'ok', type: 'camera' },
            { id: 6, name: 'Nextel Touchpad', version: '1.2.8', date: '2025-10-15', status: 'ok', type: 'input' },
            { id: 7, name: 'Nextel USB 3.0', version: '2.0.1', date: '2025-09-20', status: 'update', type: 'usb' },
            { id: 8, name: 'Nextel SSD Controller', version: '1.0.5', date: '2026-01-01', status: 'ok', type: 'storage' }
        ];
        const render = () => {
            const updates = DRIVERS.filter(d => d.status === 'update').length;
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar"><div style="font-weight:600;">Диспетчер драйверов</div><div style="flex:1"></div>${updates > 0 ? `<span style="font-size:12px;color:var(--warning);">${updates} обновлений</span>` : '<span style="font-size:12px;color:var(--success);">Всё актуально</span>'}</div>
                    <div style="flex:1;overflow-y:auto;padding:16px;">
                        <div class="card">
                            ${DRIVERS.map(d => `<div class="row">
                                <div style="display:flex;gap:12px;align-items:center;flex:1;">
                                    <div style="width:36px;height:36px;border-radius:8px;background:${d.status === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'};color:${d.status === 'ok' ? 'var(--success)' : 'var(--warning)'};display:flex;align-items:center;justify-content:center;">${d.status === 'ok' ? '✓' : '!'}</div>
                                    <div>
                                        <div style="font-weight:600;">${NX.esc(d.name)}</div>
                                        <div style="font-size:11px;color:var(--text-muted);">Версия ${d.version} · ${d.date}</div>
                                    </div>
                                </div>
                                ${d.status === 'update' ? `<button class="btn primary upd" data-id="${d.id}" style="height:28px;font-size:12px;">Обновить</button>` : '<span style="font-size:11px;color:var(--text-muted);">Актуально</span>'}
                            </div>`).join('')}
                        </div>
                    </div>
                </div>`;
            NX.$$('.upd', body).forEach(b => b.onclick = () => {
                const d = DRIVERS.find(x => x.id === parseInt(b.dataset.id));
                if (!d) return;
                b.disabled = true;
                b.textContent = 'Обновление...';
                setTimeout(() => {
                    d.status = 'ok';
                    d.version = (parseFloat(d.version) + 0.1).toFixed(1);
                    d.date = new Date().toISOString().slice(0, 10);
                    NX.notifications.push('Драйверы', `${d.name} обновлён`, 'check');
                    render();
                }, 1500);
            });
        };
        render();
    }
});

console.log('[NX-EXTRA] ✅ Зарегистрировано 22 приложения (галерея, видео, диктофон, камера, таблица, PDF, Kanban, Pomodoro, Борис-мессенджер, контакты, пароли, буфер, диспетчер, конвертер, speedtest, запись экрана, скриншот, VPN, брандмауэр, математика, переводчик, драйверы)');
