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
});
