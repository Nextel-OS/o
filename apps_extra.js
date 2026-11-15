/* ============================================================
   NEXTEL OS 2.0 — ДОПОЛНИТЕЛЬНЫЕ ПРИЛОЖЕНИЯ (ЧАСТЬ 1)
   Галерея, Видеоплеер, Диктофон, Камера, Таблица
   ============================================================ */

// --- 1. ГАЛЕРЕЯ ---
NX.registerApp({
    id: 'gallery',
    name: 'Галерея',
    icon: NX.icons.gallery,
    color: '#e05fb0',
    w: 850, h: 650, single: true,
    render(body) {
        let selectedImg = null;

        const render = () => {
            const images = NX.fs.getImages();
            
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="font-size:14px;font-weight:600;">Галерея</div>
                        <div style="flex:1"></div>
                        <span style="font-size:12px;color:var(--text-muted);">${images.length} изображений</span>
                    </div>
                    <div style="flex:1;display:flex;min-height:0;">
                        <div style="flex:1;padding:16px;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;align-content:start;" id="gal-grid">
                            ${images.length === 0 ? `
                                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">
                                    <div style="font-size:48px;margin-bottom:16px;opacity:0.3;">${NX.icons.gallery}</div>
                                    <div>Изображений пока нет</div>
                                    <div style="font-size:12px;margin-top:8px;">Создайте рисунок в Point или сохраните картинку</div>
                                </div>
                            ` : images.map((img, i) => `
                                <div class="gal-thumb" data-i="${i}" style="cursor:pointer;border-radius:8px;overflow:hidden;border:2px solid ${selectedImg === i ? 'var(--accent)' : 'transparent'};aspect-ratio:1;background:#f0f0f0;">
                                    <img src="${img.content}" style="width:100%;height:100%;object-fit:cover;">
                                </div>
                            `).join('')}
                        </div>
                        ${selectedImg !== null ? `
                            <div style="width:50%;border-left:1px solid var(--border);display:flex;flex-direction:column;">
                                <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#000;padding:20px;">
                                    <img src="${images[selectedImg].content}" style="max-width:100%;max-height:100%;object-fit:contain;">
                                </div>
                                <div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px;">
                                    <div style="flex:1;font-size:13px;font-weight:500;">${NX.esc(images[selectedImg].name)}</div>
                                    <button class="btn ghost" id="gal-open-point">Редактировать</button>
                                    <button class="btn ghost" id="gal-download">Скачать</button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            NX.$$('.gal-thumb', body).forEach(el => {
                el.onclick = () => {
                    selectedImg = parseInt(el.dataset.i);
                    render();
                };
            });

            const openPointBtn = NX.$('#gal-open-point', body);
            if (openPointBtn) {
                openPointBtn.onclick = () => {
                    NX.openApp('point', { content: images[selectedImg].content, name: images[selectedImg].name });
                };
            }

            const downloadBtn = NX.$('#gal-download', body);
            if (downloadBtn) {
                downloadBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = images[selectedImg].content;
                    a.download = images[selectedImg].name;
                    a.click();
                };
            }
        };

        render();
    }
});

// --- 2. ВИДЕОПЛЕЕР ---
NX.registerApp({
    id: 'video',
    name: 'Видеоплеер',
    icon: NX.icons.video,
    color: '#4a6fa5',
    w: 750, h: 550, single: true,
    render(body) {
        const videos = NX.fs.getNode(['Загрузки']).children.filter(c => c.type === 'file' && c.kind === 'video');
        
        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div class="toolbar">
                    <div style="font-weight:600;">Видеоплеер</div>
                </div>
                <div style="flex:1;display:flex;min-height:0;">
                    <div style="width:200px;border-right:1px solid var(--border);background:var(--surface-2);overflow-y:auto;padding:8px;">
                        ${videos.length === 0 ? `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">Нет видео<br><br>Загрузите .mp4/.webm</div>` : 
                            videos.map((v, i) => `<div class="video-item" data-i="${i}" style="padding:10px;cursor:pointer;border-radius:6px;margin-bottom:4px;font-size:12px;" onmouseover="this.style.background='var(--surface-3)'" onmouseout="this.style.background='transparent'">${NX.esc(v.name)}</div>`).join('')
                        }
                        <div style="padding:10px;margin-top:20px;">
                            <button class="btn ghost" style="width:100%;" id="video-load">+ Загрузить видео</button>
                        </div>
                    </div>
                    <div style="flex:1;display:flex;flex-direction:column;">
                        <div style="flex:1;background:#000;display:flex;align-items:center;justify-content:center;position:relative;" id="video-area">
                            ${videos.length > 0 
                                ? `<video id="video-player" src="${videos[0].content || videos[0].url}" controls style="max-width:100%;max-height:100%;"></video>`
                                : `<div style="color:#888;font-size:14px;">Выберите видео или загрузите новое</div>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;

        const loadBtn = NX.$('#video-load', body);
        if (loadBtn) {
            loadBtn.onclick = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        NX.fs.addFile('Загрузки', file.name, ev.target.result, 'video');
                        render(); // перерисовываем
                    };
                    reader.readAsDataURL(file);
                };
                input.click();
            };
        }

        NX.$$('.video-item', body).forEach(el => {
            el.onclick = () => {
                const idx = parseInt(el.dataset.i);
                const video = videos[idx];
                const area = NX.$('#video-area', body);
                area.innerHTML = `<video src="${video.content || video.url}" controls autoplay style="max-width:100%;max-height:100%;"></video>`;
                NX.$$('.video-item', body).forEach(x => x.style.background = 'transparent');
                el.style.background = 'var(--accent-soft)';
            };
        });
    }
});

// --- 3. ДИКТОФОН ---
NX.registerApp({
    id: 'recorder',
    name: 'Диктофон',
    icon: NX.icons.recorder,
    color: '#e8534a',
    w: 550, h: 450, single: true,
    render(body) {
        let isRecording = false;
        let mediaRecorder = null;
        let audioChunks = [];
        let timer = null;
        let seconds = 0;

        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;padding:24px;align-items:center;justify-content:center;gap:20px;">
                <div style="font-size:48px;font-weight:300;font-variant-numeric:tabular-nums;" id="rec-timer">00:00</div>
                <div style="width:60px;height:60px;border-radius:50%;background:var(--danger);display:flex;align-items:center;justify-content:center;cursor:pointer;" id="rec-btn">
                    <div style="width:20px;height:20px;border-radius:50%;background:#fff;"></div>
                </div>
                <div style="font-size:13px;color:var(--text-muted);" id="rec-status">Нажмите для записи</div>
                <div style="width:100%;max-width:400px;" id="rec-list"></div>
            </div>
        `;

        const timerEl = NX.$('#rec-timer', body);
        const btn = NX.$('#rec-btn', body);
        const status = NX.$('#rec-status', body);
        const list = NX.$('#rec-list', body);

        const startRecording = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                
                mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const blob = new Blob(audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const name = `Запись_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'_')}.webm`;
                        NX.fs.addFile('Документы', name, ev.target.result, 'audio');
                        renderList();
                        NX.notifications.push('Диктофон', `Запись "${name}" сохранена`, 'save');
                    };
                    reader.readAsDataURL(blob);
                };

                mediaRecorder.start();
                isRecording = true;
                seconds = 0;
                status.textContent = 'Идёт запись...';
                btn.style.background = '#333';
                timer = setInterval(() => {
                    seconds++;
                    timerEl.textContent = `${NX.pad(Math.floor(seconds/60))}:${NX.pad(seconds%60)}`;
                }, 1000);
            } catch (e) {
                status.textContent = 'Нет доступа к микрофону';
                NX.notifications.push('Диктофон', 'Нет доступа к микрофону', 'info');
            }
        };

        const stopRecording = () => {
            if (mediaRecorder && isRecording) {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(t => t.stop());
                isRecording = false;
                clearInterval(timer);
                status.textContent = 'Запись остановлена';
                btn.style.background = 'var(--danger)';
            }
        };

        btn.onclick = () => {
            if (isRecording) stopRecording();
            else startRecording();
        };

        const renderList = () => {
            const recordings = NX.fs.getNode(['Документы']).children.filter(c => c.type === 'file' && c.kind === 'audio');
            if (recordings.length === 0) {
                list.innerHTML = '';
                return;
            }
            list.innerHTML = `
                <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">Записи:</div>
                ${recordings.map(r => `
                    <div style="background:var(--surface-2);border:1px solid var(--border);padding:10px;border-radius:6px;margin-bottom:6px;font-size:12px;display:flex;justify-content:space-between;align-items:center;">
                        <span>${NX.esc(r.name)}</span>
                        <button class="btn ghost" data-play="${NX.esc(r.name)}" style="height:24px;font-size:11px;">▶</button>
                    </div>
                `).join('')}
            `;
            NX.$$('[data-play]', list).forEach(b => {
                b.onclick = () => {
                    const rec = recordings.find(r => r.name === b.dataset.play);
                    if (rec) {
                        const audio = new Audio(rec.content);
                        audio.play();
                    }
                };
            });
        };
        renderList();
    }
});

// --- 4. КАМЕРА ---
NX.registerApp({
    id: 'camera',
    name: 'Камера',
    icon: NX.icons.camera,
    color: '#2b8a5f',
    w: 700, h: 600, single: true,
    render(body) {
        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;">
                <div class="toolbar">
                    <div style="font-weight:600;">Камера</div>
                    <div style="flex:1"></div>
                    <select class="input" id="cam-timer" style="width:120px;height:28px;font-size:12px;">
                        <option value="0">Без таймера</option>
                        <option value="3">3 секунды</option>
                        <option value="5">5 секунд</option>
                        <option value="10">10 секунд</option>
                    </select>
                </div>
                <div style="flex:1;background:#000;display:flex;align-items:center;justify-content:center;position:relative;">
                    <video id="cam-video" autoplay playsinline style="max-width:100%;max-height:100%;"></video>
                    <div id="cam-countdown" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:120px;color:#fff;font-weight:300;text-shadow:0 0 20px #000;display:none;"></div>
                </div>
                <div style="padding:16px;display:flex;justify-content:center;gap:12px;">
                    <button class="btn primary" id="cam-capture" style="width:60px;height:60px;border-radius:50%;font-size:24px;padding:0;">📷</button>
                </div>
            </div>
        `;

        const video = NX.$('#cam-video', body);
        const countdown = NX.$('#cam-countdown', body);
        const captureBtn = NX.$('#cam-capture', body);
        const timerSelect = NX.$('#cam-timer', body);

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                video.srcObject = stream;
            } catch (e) {
                NX.$('#cam-video', body).outerHTML = '<div style="color:#888;font-size:14px;">Нет доступа к камере</div>';
                captureBtn.disabled = true;
            }
        };

        const capture = () => {
            const delay = parseInt(timerSelect.value);
            if (delay > 0) {
                let remaining = delay;
                countdown.style.display = 'block';
                countdown.textContent = remaining;
                const iv = setInterval(() => {
                    remaining--;
                    if (remaining <= 0) {
                        clearInterval(iv);
                        countdown.style.display = 'none';
                        takePhoto();
                    } else {
                        countdown.textContent = remaining;
                    }
                }, 1000);
            } else {
                takePhoto();
            }
        };

        const takePhoto = () => {
            if (!video.videoWidth) return;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const data = canvas.toDataURL('image/png');
            const name = `Снимок_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'_')}.png`;
            NX.fs.addFile('Изображения', name, data, 'img');
            NX.notifications.push('Камера', `Снимок сохранён`, 'check');
            NX.audio.playTone(800, 0.1, 'sine', 0.1);
        };

        captureBtn.onclick = capture;
        startCamera();
    }
});

// --- 5. ТАБЛИЦА ---
NX.registerApp({
    id: 'sheet',
    name: 'Таблица',
    icon: NX.icons.sheet,
    color: '#10b981',
    w: 900, h: 600,
    render(body) {
        const COLS = 10;
        const ROWS = 30;
        let data = {};

        const colName = (i) => String.fromCharCode(65 + i);
        const cellKey = (r, c) => `${colName(c)}${r+1}`;

        const render = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="font-weight:600;">Таблица</div>
                        <div style="flex:1"></div>
                        <button class="btn ghost" id="sheet-export">Экспорт CSV</button>
                        <button class="btn primary" id="sheet-save">${NX.icons.save} Сохранить</button>
                    </div>
                    <div style="flex:1;overflow:auto;background:var(--surface);">
                        <table style="border-collapse:collapse;width:100%;font-size:13px;" id="sheet-table">
                            <thead>
                                <tr>
                                    <th style="width:50px;background:var(--surface-2);border:1px solid var(--border);padding:6px;font-weight:600;"></th>
                                    ${Array.from({length:COLS}).map((_,c) => `<th style="background:var(--surface-2);border:1px solid var(--border);padding:6px;font-weight:600;min-width:90px;">${colName(c)}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${Array.from({length:ROWS}).map((_,r) => `
                                    <tr>
                                        <td style="background:var(--surface-2);border:1px solid var(--border);padding:6px;text-align:center;font-weight:600;color:var(--text-muted);">${r+1}</td>
                                        ${Array.from({length:COLS}).map((_,c) => `
                                            <td style="border:1px solid var(--border);padding:0;position:relative;">
                                                <input type="text" data-r="${r}" data-c="${c}" value="${NX.esc(data[cellKey(r,c)] || '')}" style="width:100%;height:100%;border:none;padding:6px;background:transparent;color:var(--text);outline:none;font-size:13px;" onfocus="this.parentElement.style.background='var(--accent-soft)'" onblur="this.parentElement.style.background='transparent'">
                                            </td>
                                        `).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            NX.$$('input[data-r]', body).forEach(inp => {
                inp.oninput = () => {
                    data[cellKey(parseInt(inp.dataset.r), parseInt(inp.dataset.c))] = inp.value;
                };
            });

            NX.$('#sheet-export', body).onclick = () => {
                let csv = '';
                for (let r = 0; r < ROWS; r++) {
                    const row = [];
                    for (let c = 0; c < COLS; c++) row.push(data[cellKey(r,c)] || '');
                    csv += row.join(',') + '\n';
                }
                const blob = new Blob([csv], { type: 'text/csv' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'Таблица.csv';
                a.click();
            };

            NX.$('#sheet-save', body).onclick = () => {
                const name = prompt('Имя файла:', 'Таблица.json');
                if (!name) return;
                NX.fs.addFile('Документы', name, JSON.stringify(data), 'sheet');
                NX.notifications.push('Таблица', 'Сохранено', 'save');
            };
        };

        render();
    }
   /* ============================================================
   NEXTEL OS 2.0 — ДОПОЛНИТЕЛЬНЫЕ ПРИЛОЖЕНИЯ (ЧАСТЬ 2)
   PDF, Kanban, Pomodoro, Мессенджер, Контакты,
   Пароли, Буфер, Диспетчер задач, Конвертер, Speed Test
   ============================================================ */

// --- 6. PDF-ПРОСМОТРЩИК ---
NX.registerApp({
    id: 'pdf',
    name: 'PDF',
    icon: NX.icons.pdf,
    color: '#e8534a',
    w: 800, h: 650, single: true,
    render(body) {
        const render = () => {
            const docs = NX.fs.getNode(['Документы']).children.filter(c => c.type === 'file' && c.kind === 'pdf');
            
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="font-weight:600;">PDF Просмотрщик</div>
                        <div style="flex:1"></div>
                        <button class="btn ghost" id="pdf-load">${NX.icons.folder} Открыть</button>
                    </div>
                    <div style="flex:1;display:flex;flex-direction:column;background:var(--surface-2);">
                        ${docs.length === 0 
                            ? `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-muted);">
                                <div style="font-size:48px;margin-bottom:16px;opacity:0.3;">${NX.icons.pdf}</div>
                                <div>PDF-файлов нет</div>
                                <div style="font-size:12px;margin-top:8px;">Нажмите «Открыть», чтобы загрузить</div>
                            </div>`
                            : `<div style="padding:12px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;">
                                ${docs.map((d,i) => `<button class="btn ghost pdf-doc" data-i="${i}">${NX.esc(d.name)}</button>`).join('')}
                            </div>
                            <div style="flex:1;padding:16px;">
                                <iframe id="pdf-frame" style="width:100%;height:100%;border:1px solid var(--border);border-radius:8px;background:#fff;"></iframe>
                            </div>`
                        }
                    </div>
                </div>
            `;

            NX.$('#pdf-load', body).onclick = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/pdf';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        NX.fs.addFile('Документы', file.name, ev.target.result, 'pdf');
                        render();
                    };
                    reader.readAsDataURL(file);
                };
                input.click();
            };

            NX.$$('.pdf-doc', body).forEach(btn => {
                btn.onclick = () => {
                    const doc = docs[parseInt(btn.dataset.i)];
                    const frame = NX.$('#pdf-frame', body);
                    if (frame && doc) {
                        frame.src = doc.content;
                    }
                };
            });

            if (docs.length > 0) {
                setTimeout(() => {
                    const frame = NX.$('#pdf-frame', body);
                    if (frame) frame.src = docs[0].content;
                }, 100);
            }
        };

        render();
    }
});

// --- 7. KANBAN-ДОСКА ---
NX.registerApp({
    id: 'kanban',
    name: 'Kanban',
    icon: NX.icons.kanban,
    color: '#5e5ce6',
    w: 950, h: 600,
    render(body) {
        const COLUMNS = [
            { id: 'backlog', name: 'Бэклог' },
            { id: 'progress', name: 'В работе' },
            { id: 'review', name: 'На проверке' },
            { id: 'done', name: 'Готово' }
        ];

        // Синхронизация с задачами. Если у задачи нет колонки — считаем 'backlog'
        const getTasks = () => (NX.state.tasks || []).map(t => ({
            ...t,
            column: t.column || 'backlog'
        }));

        const saveTasks = (tasks) => {
            NX.state.tasks = tasks.map(({column, ...t}) => ({...t, column}));
            NX.saveState();
        };

        const render = () => {
            const tasks = getTasks();
            let draggedId = null;

            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="font-weight:600;">Kanban-доска</div>
                        <div style="flex:1"></div>
                        <button class="btn primary" id="kanban-add">+ Новая задача</button>
                    </div>
                    <div style="flex:1;display:flex;gap:12px;padding:16px;overflow-x:auto;background:var(--surface-2);">
                        ${COLUMNS.map(col => `
                            <div class="kanban-col" data-col="${col.id}" style="flex:1;min-width:220px;background:var(--surface);border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;">
                                <div style="padding:12px;border-bottom:1px solid var(--border);font-weight:600;display:flex;justify-content:space-between;">
                                    <span>${col.name}</span>
                                    <span style="color:var(--text-muted);font-weight:400;">${tasks.filter(t => t.column === col.id).length}</span>
                                </div>
                                <div class="kanban-drop" data-col="${col.id}" style="flex:1;padding:10px;display:flex;flex-direction:column;gap:8px;min-height:80px;overflow-y:auto;">
                                    ${tasks.filter(t => t.column === col.id).map(t => `
                                        <div class="kanban-card" draggable="true" data-id="${t.id}" style="padding:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;cursor:grab;font-size:13px;">
                                            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                                                <span style="${t.done ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${NX.esc(t.text)}</span>
                                                <button class="kanban-del" data-id="${t.id}" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;">×</button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            NX.$('#kanban-add', body).onclick = () => {
                const text = prompt('Новая задача:');
                if (!text) return;
                const tasks = getTasks();
                tasks.push({ id: Date.now(), text, done: false, column: 'backlog' });
                saveTasks(tasks);
                render();
            };

            NX.$$('.kanban-del', body).forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    let tasks = getTasks();
                    tasks = tasks.filter(t => t.id !== parseInt(btn.dataset.id));
                    saveTasks(tasks);
                    render();
                };
            });

            NX.$$('.kanban-card', body).forEach(card => {
                card.addEventListener('dragstart', (e) => {
                    draggedId = parseInt(card.dataset.id);
                    card.style.opacity = '0.4';
                });
                card.addEventListener('dragend', () => {
                    card.style.opacity = '1';
                });
            });

            NX.$$('.kanban-drop', body).forEach(drop => {
                drop.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    drop.style.background = 'var(--accent-soft)';
                });
                drop.addEventListener('dragleave', () => {
                    drop.style.background = 'transparent';
                });
                drop.addEventListener('drop', (e) => {
                    e.preventDefault();
                    drop.style.background = 'transparent';
                    if (draggedId === null) return;
                    const tasks = getTasks();
                    const task = tasks.find(t => t.id === draggedId);
                    if (task) {
                        task.column = drop.dataset.col;
                        if (task.column === 'done') task.done = true;
                        else task.done = false;
                        saveTasks(tasks);
                        render();
                    }
                    draggedId = null;
                });
            });
        };

        render();
    }
});

// --- 8. POMODORO ---
NX.registerApp({
    id: 'pomodoro',
    name: 'Pomodoro',
    icon: NX.icons.pomodoro,
    color: '#f0a24b',
    w: 500, h: 550, single: true,
    render(body) {
        const WORK = 25 * 60;
        const SHORT = 5 * 60;
        const LONG = 15 * 60;

        let mode = 'work';
        let timeLeft = WORK;
        let timer = null;
        let running = false;
        let sessionCount = parseInt(localStorage.getItem('nx_pomodoro_count') || '0');

        const render = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const color = mode === 'work' ? 'var(--danger)' : 'var(--success)';
            const modeName = mode === 'work' ? 'Работа' : (mode === 'short' ? 'Перерыв' : 'Долгий перерыв');

            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;align-items:center;justify-content:center;padding:24px;gap:20px;">
                    <div style="display:flex;gap:8px;">
                        <button class="btn ${mode === 'work' ? 'primary' : 'ghost'}" data-mode="work">Работа 25</button>
                        <button class="btn ${mode === 'short' ? 'primary' : 'ghost'}" data-mode="short">Перерыв 5</button>
                        <button class="btn ${mode === 'long' ? 'primary' : 'ghost'}" data-mode="long">Долгий 15</button>
                    </div>
                    <div style="width:260px;height:260px;border-radius:50%;border:8px solid ${color};display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--surface);">
                        <div style="font-size:64px;font-weight:200;letter-spacing:-2px;font-variant-numeric:tabular-nums;">${NX.pad(minutes)}:${NX.pad(seconds)}</div>
                        <div style="font-size:14px;color:var(--text-muted);margin-top:8px;">${modeName}</div>
                    </div>
                    <div style="display:flex;gap:12px;">
                        <button class="btn primary" id="pomo-toggle" style="min-width:120px;justify-content:center;">${running ? 'Пауза' : 'Старт'}</button>
                        <button class="btn ghost" id="pomo-reset">Сброс</button>
                    </div>
                    <div style="font-size:13px;color:var(--text-muted);margin-top:12px;">Завершено сессий: <b>${sessionCount}</b></div>
                </div>
            `;

            NX.$$('[data-mode]', body).forEach(btn => {
                btn.onclick = () => {
                    if (running) return;
                    mode = btn.dataset.mode;
                    timeLeft = mode === 'work' ? WORK : (mode === 'short' ? SHORT : LONG);
                    render();
                };
            });

            NX.$('#pomo-toggle', body).onclick = () => {
                if (running) {
                    clearInterval(timer);
                    running = false;
                } else {
                    running = true;
                    timer = setInterval(() => {
                        if (timeLeft > 0) {
                            timeLeft--;
                            render();
                        } else {
                            clearInterval(timer);
                            running = false;
                            NX.audio.notify();
                            NX.notifications.push('Pomodoro', mode === 'work' ? 'Работа завершена! Время отдохнуть.' : 'Перерыв закончен!', 'check');
                            if (mode === 'work') {
                                sessionCount++;
                                localStorage.setItem('nx_pomodoro_count', sessionCount);
                                mode = 'short';
                                timeLeft = SHORT;
                            } else {
                                mode = 'work';
                                timeLeft = WORK;
                            }
                            render();
                        }
                    }, 1000);
                }
                render();
            };

            NX.$('#pomo-reset', body).onclick = () => {
                clearInterval(timer);
                running = false;
                timeLeft = mode === 'work' ? WORK : (mode === 'short' ? SHORT : LONG);
                render();
            };
        };

        render();
    }
});

// --- 9. МЕССЕНДЖЕР ---
NX.registerApp({
    id: 'messenger',
    name: 'Мессенджер',
    icon: NX.icons.messenger,
    color: '#0a84ff',
    w: 800, h: 600, single: true,
    render(body) {
        const CONTACTS = [
            { id: 'alice', name: 'Алиса', avatar: 'А' },
            { id: 'bob', name: 'Боб', avatar: 'Б' },
            { id: 'nextel', name: 'Nextel Team', avatar: 'N' }
        ];

        if (!NX.state.messages) NX.state.messages = {};
        let activeChat = 'nextel';

        const render = () => {
            const messages = NX.state.messages[activeChat] || [];

            body.innerHTML = `
                <div style="display:flex;height:100%;">
                    <div style="width:240px;background:var(--surface-2);border-right:1px solid var(--border);display:flex;flex-direction:column;">
                        <div style="padding:16px;border-bottom:1px solid var(--border);font-weight:600;">Чаты</div>
                        <div style="flex:1;overflow-y:auto;">
                            ${CONTACTS.map(c => `
                                <div class="chat-item" data-id="${c.id}" style="padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;${activeChat === c.id ? 'background:var(--accent-soft);' : ''}">
                                    <div style="width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;">${c.avatar}</div>
                                    <div>
                                        <div style="font-weight:600;font-size:13px;">${c.name}</div>
                                        <div style="font-size:11px;color:var(--text-muted);">${(NX.state.messages[c.id] || []).length} сообщений</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div style="flex:1;display:flex;flex-direction:column;">
                        <div style="padding:16px;border-bottom:1px solid var(--border);font-weight:600;">${CONTACTS.find(c => c.id === activeChat).name}</div>
                        <div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;">
                            ${messages.length === 0 ? '<div style="text-align:center;color:var(--text-muted);font-size:12px;margin-top:40px;">Нет сообщений</div>' : messages.map(m => `
                                <div style="display:flex;${m.self ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}">
                                    <div style="max-width:70%;padding:8px 12px;border-radius:12px;background:${m.self ? 'var(--accent)' : 'var(--surface-2)'};color:${m.self ? '#fff' : 'var(--text)'};font-size:13px;line-height:1.4;">
                                        ${NX.esc(m.text)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px;">
                            <input type="text" id="chat-input" class="input" placeholder="Сообщение..." style="flex:1;">
                            <button class="btn primary" id="chat-send">Отправить</button>
                        </div>
                    </div>
                </div>
            `;

            NX.$$('.chat-item', body).forEach(el => {
                el.onclick = () => {
                    activeChat = el.dataset.id;
                    render();
                };
            });

            const input = NX.$('#chat-input', body);
            const send = () => {
                const text = input.value.trim();
                if (!text) return;
                if (!NX.state.messages[activeChat]) NX.state.messages[activeChat] = [];
                NX.state.messages[activeChat].push({ text, self: true, time: new Date().toISOString() });
                NX.saveState();
                input.value = '';
                render();

                // Имитация ответа
                setTimeout(() => {
                    NX.state.messages[activeChat].push({ text: 'Принято: "' + text + '"', self: false, time: new Date().toISOString() });
                    NX.saveState();
                    render();
                }, 800);
            };

            NX.$('#chat-send', body).onclick = send;
            input.onkeydown = (e) => { if (e.key === 'Enter') send(); };
            input.focus();

            const msgs = NX.$('#chat-messages', body);
            if (msgs) msgs.scrollTop = msgs.scrollHeight;
        };

        render();
    }
});

// --- 10. КОНТАКТЫ ---
NX.registerApp({
    id: 'contacts',
    name: 'Контакты',
    icon: NX.icons.contacts,
    color: '#34aadc',
    w: 700, h: 550, single: true,
    render(body) {
        if (!NX.state.contacts) NX.state.contacts = [
            { id: 1, name: 'Алиса', phone: '+7 999 123-45-67', email: 'alice@nextel.os' },
            { id: 2, name: 'Боб', phone: '+7 999 765-43-21', email: 'bob@nextel.os' }
        ];
        let search = '';
        let selectedId = null;

        const render = () => {
            const filtered = NX.state.contacts.filter(c => 
                c.name.toLowerCase().includes(search.toLowerCase()) || 
                (c.phone && c.phone.includes(search))
            );

            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <input type="text" class="input" id="contacts-search" placeholder="Поиск..." style="width:200px;" value="${NX.esc(search)}">
                        <div style="flex:1"></div>
                        <button class="btn primary" id="contacts-add">+ Добавить</button>
                    </div>
                    <div style="flex:1;display:flex;">
                        <div style="width:280px;border-right:1px solid var(--border);overflow-y:auto;">
                            ${filtered.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">Нет контактов</div>' : filtered.map(c => `
                                <div class="contact-item" data-id="${c.id}" style="padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border);${selectedId === c.id ? 'background:var(--accent-soft);' : ''}">
                                    <div style="width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;">${c.name[0] || '?'}</div>
                                    <div>
                                        <div style="font-weight:600;font-size:13px;">${NX.esc(c.name)}</div>
                                        <div style="font-size:11px;color:var(--text-muted);">${NX.esc(c.phone || '')}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="flex:1;padding:24px;overflow-y:auto;" id="contact-detail">
                            ${selectedId ? (() => {
                                const c = NX.state.contacts.find(x => x.id === selectedId);
                                if (!c) return '';
                                return `
                                    <h2 style="font-size:22px;margin-bottom:20px;">${NX.esc(c.name)}</h2>
                                    <div class="card">
                                        <div class="row"><span>Телефон</span><span>${NX.esc(c.phone || '—')}</span></div>
                                        <div class="row"><span>Email</span><span>${NX.esc(c.email || '—')}</span></div>
                                    </div>
                                    <button class="btn ghost" id="contact-delete" style="color:var(--danger);margin-top:20px;">Удалить контакт</button>
                                `;
                            })() : '<div style="text-align:center;color:var(--text-muted);margin-top:60px;">Выберите контакт</div>'}
                        </div>
                    </div>
                </div>
            `;

            NX.$('#contacts-search', body).oninput = (e) => { search = e.target.value; render(); };

            NX.$('#contacts-add', body).onclick = () => {
                const name = prompt('Имя:');
                if (!name) return;
                const phone = prompt('Телефон:') || '';
                const email = prompt('Email:') || '';
                NX.state.contacts.push({ id: Date.now(), name, phone, email });
                NX.saveState();
                render();
            };

            NX.$$('.contact-item', body).forEach(el => {
                el.onclick = () => {
                    selectedId = parseInt(el.dataset.id);
                    render();
                };
            });

            const delBtn = NX.$('#contact-delete', body);
            if (delBtn) {
                delBtn.onclick = () => {
                    if (confirm('Удалить контакт?')) {
                        NX.state.contacts = NX.state.contacts.filter(c => c.id !== selectedId);
                        selectedId = null;
                        NX.saveState();
                        render();
                    }
                };
            }
        };

        render();
    }
});

// --- 11. ПАРОЛИ (с шифрованием) ---
NX.registerApp({
    id: 'passwords',
    name: 'Пароли',
    icon: NX.icons.passwords,
    color: '#30b06b',
    w: 700, h: 550, single: true,
    render(body) {
        let unlocked = false;
        let masterPassword = null;
        let entries = [];
        let key = null;

        const init = async () => {
            const saved = localStorage.getItem('nx_passwords_encrypted');
            const savedSalt = localStorage.getItem('nx_passwords_salt');
            
            if (saved && savedSalt) {
                // Требуется ввод мастер-пароля
                renderUnlock();
            } else {
                renderCreate();
            }
        };

        const deriveKey = async (password, salt) => {
            const enc = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
            return crypto.subtle.deriveKey(
                { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        };

        const encryptData = async (data, key) => {
            const enc = new TextEncoder();
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(data)));
            return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
        };

        const decryptData = async (encData, key) => {
            const dec = new TextDecoder();
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(encData.iv) }, 
                key, 
                new Uint8Array(encData.data)
            );
            return JSON.parse(dec.decode(decrypted));
        };

        const renderUnlock = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;padding:24px;">
                    <div style="font-size:48px;">🔒</div>
                    <div style="font-size:18px;font-weight:600;">Менеджер паролей</div>
                    <input type="password" id="master-pin" class="input" placeholder="Мастер-пароль" style="width:280px;">
                    <button class="btn primary" id="unlock-btn" style="width:280px;justify-content:center;">Разблокировать</button>
                </div>
            `;

            NX.$('#unlock-btn', body).onclick = async () => {
                const pass = NX.$('#master-pin', body).value;
                if (!pass) return;
                try {
                    const salt = localStorage.getItem('nx_passwords_salt');
                    const k = await deriveKey(pass, salt);
                    const enc = JSON.parse(localStorage.getItem('nx_passwords_encrypted'));
                    entries = await decryptData(enc, k);
                    key = k;
                    unlocked = true;
                    masterPassword = pass;
                    renderList();
                } catch (e) {
                    NX.notifications.push('Пароли', 'Неверный мастер-пароль', 'info');
                }
            };

            NX.$('#master-pin', body).onkeydown = (e) => { if (e.key === 'Enter') NX.$('#unlock-btn', body).click(); };
        };

        const renderCreate = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;padding:24px;">
                    <div style="font-size:48px;">🔐</div>
                    <div style="font-size:18px;font-weight:600;">Создайте мастер-пароль</div>
                    <div style="font-size:12px;color:var(--text-muted);text-align:center;max-width:400px;">Он будет использоваться для шифрования ваших паролей. Не забудьте его — восстановить невозможно!</div>
                    <input type="password" id="new-pin" class="input" placeholder="Мастер-пароль" style="width:280px;">
                    <input type="password" id="new-pin2" class="input" placeholder="Повторите" style="width:280px;">
                    <button class="btn primary" id="create-btn" style="width:280px;justify-content:center;">Создать</button>
                </div>
            `;

            NX.$('#create-btn', body).onclick = async () => {
                const p1 = NX.$('#new-pin', body).value;
                const p2 = NX.$('#new-pin2', body).value;
                if (p1.length < 4) return NX.notifications.push('Пароли', 'Минимум 4 символа', 'info');
                if (p1 !== p2) return NX.notifications.push('Пароли', 'Пароли не совпадают', 'info');
                
                const salt = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
                localStorage.setItem('nx_passwords_salt', salt);
                
                key = await deriveKey(p1, salt);
                masterPassword = p1;
                entries = [];
                
                await saveEntries();
                unlocked = true;
                renderList();
            };
        };

        const saveEntries = async () => {
            if (!key) return;
            const enc = await encryptData(entries, key);
            localStorage.setItem('nx_passwords_encrypted', JSON.stringify(enc));
        };

        const renderList = () => {
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="font-weight:600;">Пароли</div>
                        <div style="flex:1"></div>
                        <button class="btn primary" id="pass-add">+ Добавить</button>
                        <button class="btn ghost" id="pass-lock">🔒 Заблокировать</button>
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:16px;">
                        ${entries.length === 0 ? '<div style="text-align:center;color:var(--text-muted);padding:40px;">Записей нет</div>' : entries.map((e, i) => `
                            <div class="card" style="margin-bottom:8px;">
                                <div class="row">
                                    <div>
                                        <div style="font-weight:600;">${NX.esc(e.site)}</div>
                                        <div style="font-size:12px;color:var(--text-muted);">${NX.esc(e.login)}</div>
                                    </div>
                                    <div style="display:flex;gap:8px;align-items:center;">
                                        <button class="btn ghost pass-copy" data-i="${i}" style="height:26px;font-size:11px;">Копировать</button>
                                        <button class="btn ghost pass-del" data-i="${i}" style="height:26px;font-size:11px;color:var(--danger);">×</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            NX.$('#pass-add', body).onclick = async () => {
                const site = prompt('Сайт / Приложение:');
                if (!site) return;
                const login = prompt('Логин:') || '';
                const pass = prompt('Пароль:') || '';
                entries.push({ site, login, password: pass });
                await saveEntries();
                renderList();
            };

            NX.$('#pass-lock', body).onclick = () => {
                unlocked = false;
                key = null;
                entries = [];
                init();
            };

            NX.$$('.pass-copy', body).forEach(btn => {
                btn.onclick = () => {
                    const e = entries[parseInt(btn.dataset.i)];
                    if (e) {
                        navigator.clipboard.writeText(e.password);
                        NX.notifications.push('Пароли', 'Пароль скопирован', 'check');
                    }
                };
            });

            NX.$$('.pass-del', body).forEach(btn => {
                btn.onclick = async () => {
                    entries.splice(parseInt(btn.dataset.i), 1);
                    await saveEntries();
                    renderList();
                };
            });
        };

        init();
    }
});

// --- 12. БУФЕР ОБМЕНА ---
NX.registerApp({
    id: 'clipboard',
    name: 'Буфер обмена',
    icon: NX.icons.clipboard,
    color: '#8e8e93',
    w: 500, h: 550, single: true,
    render(body) {
        const render = () => {
            const items = NX.clipboard.items || [];
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="font-weight:600;">Буфер обмена</div>
                        <div style="flex:1"></div>
                        <button class="btn ghost" id="clip-clear">Очистить</button>
                    </div>
                    <div style="flex:1;overflow-y:auto;padding:16px;">
                        ${items.length === 0 ? '<div style="text-align:center;color:var(--text-muted);padding:40px;">История пуста</div>' : items.map((t, i) => `
                            <div class="card" style="margin-bottom:8px;cursor:pointer;" data-i="${i}">
                                <div style="padding:12px;font-size:12px;word-break:break-word;">${NX.esc(t.slice(0, 200))}${t.length > 200 ? '...' : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            NX.$('#clip-clear', body).onclick = () => {
                NX.clipboard.items = [];
                NX.saveState();
                render();
            };

            NX.$$('.card[data-i]', body).forEach(el => {
                el.onclick = () => {
                    const text = items[parseInt(el.dataset.i)];
                    NX.clipboard.paste(text);
                    NX.notifications.push('Буфер обмена', 'Текст скопирован', 'clipboard');
                };
            });
        };

        render();
    }
});

// --- 13. ДИСПЕТЧЕР ЗАДАЧ ---
NX.registerApp({
    id: 'taskmgr',
    name: 'Диспетчер задач',
    icon: NX.icons.monitor,
    color: '#6e6e73',
    w: 800, h: 550, single: true,
    render(body) {
        let cpuHistory = Array(30).fill(10);
        let ramHistory = Array(30).fill(40);
        let interval;

        const render = () => {
            const wins = NX.windows.list;
            
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;">
                    <div class="toolbar">
                        <div style="font-weight:600;">Диспетчер задач</div>
                        <div style="flex:1"></div>
                        <span style="font-size:12px;color:var(--text-muted);">Процессов: ${wins.length + 3}</span>
                    </div>
                    <div style="display:flex;gap:16px;padding:16px;border-bottom:1px solid var(--border);">
                        <div style="flex:1;">
                            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">CPU: ${cpuHistory[cpuHistory.length-1]}%</div>
                            <canvas id="cpu-chart" width="300" height="60" style="width:100%;height:60px;"></canvas>
                        </div>
                        <div style="flex:1;">
                            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">RAM: ${ramHistory[ramHistory.length-1]}%</div>
                            <canvas id="ram-chart" width="300" height="60" style="width:100%;height:60px;"></canvas>
                        </div>
                    </div>
                    <div style="flex:1;overflow-y:auto;">
                        <table style="width:100%;border-collapse:collapse;font-size:13px;">
                            <thead>
                                <tr style="background:var(--surface-2);">
                                    <th style="text-align:left;padding:10px 16px;border-bottom:1px solid var(--border);">Процесс</th>
                                    <th style="text-align:left;padding:10px 16px;border-bottom:1px solid var(--border);">Тип</th>
                                    <th style="text-align:right;padding:10px 16px;border-bottom:1px solid var(--border);">CPU %</th>
                                    <th style="text-align:right;padding:10px 16px;border-bottom:1px solid var(--border);">RAM МБ</th>
                                    <th style="text-align:center;padding:10px 16px;border-bottom:1px solid var(--border);">Действие</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom:1px solid var(--border);">
                                    <td style="padding:10px 16px;">Nextel Kernel</td>
                                    <td style="padding:10px 16px;color:var(--text-muted);">Система</td>
                                    <td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*5)+1}%</td>
                                    <td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*100)+200}</td>
                                    <td style="padding:10px 16px;text-align:center;color:var(--text-muted);">—</td>
                                </tr>
                                <tr style="border-bottom:1px solid var(--border);">
                                    <td style="padding:10px 16px;">Nextel Shell</td>
                                    <td style="padding:10px 16px;color:var(--text-muted);">Система</td>
                                    <td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*8)+2}%</td>
                                    <td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*150)+100}</td>
                                    <td style="padding:10px 16px;text-align:center;color:var(--text-muted);">—</td>
                                </tr>
                                ${wins.map(w => {
                                    const app = NX.apps[w.appId];
                                    return `
                                        <tr style="border-bottom:1px solid var(--border);">
                                            <td style="padding:10px 16px;">${app ? NX.esc(app.name) : w.appId}</td>
                                            <td style="padding:10px 16px;color:var(--text-muted);">Приложение</td>
                                            <td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*15)+1}%</td>
                                            <td style="padding:10px 16px;text-align:right;">${Math.floor(Math.random()*200)+50}</td>
                                            <td style="padding:10px 16px;text-align:center;">
                                                <button class="btn ghost kill-btn" data-id="${w.id}" style="height:24px;font-size:11px;color:var(--danger);">Завершить</button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            NX.$$('.kill-btn', body).forEach(btn => {
                btn.onclick = () => {
                    const win = NX.windows.list.find(w => w.id === btn.dataset.id);
                    if (win) {
                        NX.closeWindow(win);
                        NX.notifications.push('Диспетчер', `Процесс завершён`, 'info');
                        render();
                    }
                };
            });

            // Рисуем графики
            const drawChart = (canvasId, data, color) => {
                const canvas = NX.$('#' + canvasId, body);
                if (!canvas) return;
                const c = canvas.getContext('2d');
                c.clearRect(0, 0, canvas.width, canvas.height);
                c.strokeStyle = color;
                c.lineWidth = 2;
                c.beginPath();
                data.forEach((v, i) => {
                    const x = (i / (data.length - 1)) * canvas.width;
                    const y = canvas.height - (v / 100) * canvas.height;
                    if (i === 0) c.moveTo(x, y);
                    else c.lineTo(x, y);
                });
                c.stroke();
            };
            drawChart('cpu-chart', cpuHistory, '#ef4444');
            drawChart('ram-chart', ramHistory, '#3b82f6');
        };

        render();

        interval = setInterval(() => {
            const winsCount = NX.windows.list.length;
            cpuHistory.push(Math.min(95, Math.max(5, 10 + winsCount * 5 + Math.random() * 15)));
            ramHistory.push(Math.min(95, Math.max(20, 30 + winsCount * 3 + Math.random() * 10)));
            cpuHistory.shift();
            ramHistory.shift();
            if (NX.windows.focused && NX.windows.focused.appId === 'taskmgr') {
                render();
            }
        }, 1000);

        // Очищаем интервал при закрытии
        const app = NX.windows.list.find(w => w.appId === 'taskmgr');
        if (app) {
            app.cleanups.push(() => clearInterval(interval));
        }
    }
});

// --- 14. КОНВЕРТЕР ---
NX.registerApp({
    id: 'converter',
    name: 'Конвертер',
    icon: NX.icons.converter,
    color: '#2b8a5f',
    w: 500, h: 550, single: true,
    render(body) {
        const UNITS = {
            'Длина': { 'Метр': 1, 'Километр': 1000, 'Сантиметр': 0.01, 'Миллиметр': 0.001, 'Майл': 1609.34, 'Фут': 0.3048, 'Дюйм': 0.0254 },
            'Масса': { 'Килограмм': 1, 'Грамм': 0.001, 'Тонна': 1000, 'Фунт': 0.453592, 'Унция': 0.0283495 },
            'Данные': { 'Байт': 1, 'Килобайт': 1024, 'Мегабайт': 1048576, 'Гигабайт': 1073741824, 'Терабайт': 1099511627776 },
            'Время': { 'Секунда': 1, 'Минута': 60, 'Час': 3600, 'Сутки': 86400, 'Год': 31536000 }
        };
        
        let cat = 'Длина';

        const render = () => {
            const units = Object.keys(UNITS[cat]);
            
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;height:100%;padding:24px;gap:16px;">
                    <h2 style="font-size:20px;">Конвертер</h2>
                    <select class="input" id="conv-cat">
                        ${Object.keys(UNITS).map(c => `<option value="${c}" ${c === cat ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <input type="number" id="conv-val" class="input" value="1" style="flex:1;">
                        <select class="input" id="conv-from" style="width:140px;">
                            ${units.map(u => `<option value="${u}">${u}</option>`).join('')}
                        </select>
                    </div>
                    <div style="text-align:center;font-size:20px;color:var(--text-muted);">↓</div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <input type="text" id="conv-res" class="input" readonly style="flex:1;background:var(--surface-2);">
                        <select class="input" id="conv-to" style="width:140px;">
                            ${units.map((u,i) => `<option value="${u}" ${i === Math.min(1, units.length-1) ? 'selected' : ''}>${u}</option>`).join('')}
                        </select>
                    </div>
                    <div id="conv-hint" style="font-size:12px;color:var(--text-muted);text-align:center;margin-top:8px;"></div>
                </div>
            `;

            const valEl = NX.$('#conv-val', body);
            const fromEl = NX.$('#conv-from', body);
            const toEl = NX.$('#conv-to', body);
            const resEl = NX.$('#conv-res', body);
            const hintEl = NX.$('#conv-hint', body);

            const calc = () => {
                const v = parseFloat(valEl.value) || 0;
                const f = fromEl.value, t = toEl.value;
                const out = v * UNITS[cat][f] / UNITS[cat][t];
                resEl.value = Number(out.toPrecision(10));
                hintEl.textContent = `${v} ${f} = ${out.toPrecision(6)} ${t}`;
            };

            NX.$('#conv-cat', body).onchange = (e) => { cat = e.target.value; render(); };
            [valEl, fromEl, toEl].forEach(el => { el.oninput = calc; el.onchange = calc; });
            calc();
        };

        render();
    }
});

// --- 15. SPEED TEST ---
NX.registerApp({
    id: 'speedtest',
    name: 'Speed Test',
    icon: NX.icons.speedtest,
    color: '#ff9f0a',
    w: 550, h: 600, single: true,
    render(body) {
        let testing = false;

        body.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;padding:24px;gap:16px;align-items:center;">
                <h2 style="font-size:20px;">Speed Test</h2>
                <div style="width:220px;height:220px;border-radius:50%;border:8px solid var(--surface-3);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;">
                    <div id="st-speed" style="font-size:48px;font-weight:200;">0</div>
                    <div style="font-size:12px;color:var(--text-muted);">Мбит/с</div>
                </div>
                <div style="display:flex;gap:24px;font-size:13px;">
                    <div>Ping: <b id="st-ping">—</b> мс</div>
                    <div>Download: <b id="st-down">—</b> Мбит/с</div>
                    <div>Upload: <b id="st-up">—</b> Мбит/с</div>
                </div>
                <button class="btn primary" id="st-start" style="min-width:200px;justify-content:center;">Начать тест</button>
                <div id="st-status" style="font-size:12px;color:var(--text-muted);"></div>
            </div>
        `;

        NX.$('#st-start', body).onclick = async () => {
            if (testing) return;
            testing = true;
            const status = NX.$('#st-status', body);
            const speedEl = NX.$('#st-speed', body);
            const pingEl = NX.$('#st-ping', body);
            const downEl = NX.$('#st-down', body);
            const upEl = NX.$('#st-up', body);
            NX.$('#st-start', body).disabled = true;

            // Пинг
            status.textContent = 'Замер пинга...';
            pingEl.textContent = '...';
            await new Promise(r => setTimeout(r, 800));
            const ping = Math.floor(Math.random() * 30) + 5;
            pingEl.textContent = ping;
            NX.audio.click();

            // Download
            status.textContent = 'Замер скорости загрузки...';
            let dl = 0;
            const targetDl = Math.floor(Math.random() * 200) + 50;
            for (let i = 0; i < 30; i++) {
                dl = Math.floor(targetDl * (i + 1) / 30);
                speedEl.textContent = dl;
                downEl.textContent = dl;
                await new Promise(r => setTimeout(r, 80));
            }
            dl = targetDl;
            speedEl.textContent = dl;
            downEl.textContent = dl;

            // Upload
            status.textContent = 'Замер скорости отдачи...';
            let ul = 0;
            const targetUl = Math.floor(Math.random() * 100) + 20;
            for (let i = 0; i < 30; i++) {
                ul = Math.floor(targetUl * (i + 1) / 30);
                speedEl.textContent = ul;
                upEl.textContent = ul;
                await new Promise(r => setTimeout(r, 80));
            }
            ul = targetUl;
            speedEl.textContent = ul;
            upEl.textContent = ul;

            status.textContent = 'Тест завершён!';
            NX.audio.notify();
            NX.notifications.push('Speed Test', `Пинг: ${ping}мс, Скачивание: ${dl} Мбит/с, Отдача: ${ul} Мбит/с`, 'check');

            testing = false;
            NX.$('#st-start', body).disabled = false;
            NX.$('#st-start', body).textContent = 'Повторить тест';
        };
    }
});
