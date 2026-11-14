/* ============================================================
   NEXTEL OS 2.0 — ИГРЫ (ЧАСТЬ 2)
   ============================================================ */

// --- 1. ТЕТРИС ---
NX.registerApp({
    id: 'tetris',
    name: 'Тетрис',
    icon: NX.icons.tetris,
    color: '#5e5ce6',
    type: 'game',
    w: 450, h: 600,
    render(body, ctx) {
        body.innerHTML = `
            <div class="game-wrap">
                <div class="game-header">
                    <div>Счёт: <span id="tet-score">0</span></div>
                    <div>Линии: <span id="tet-lines">0</span></div>
                    <button class="btn primary" id="tet-reset" style="margin-left:auto;height:28px;font-size:12px;">Заново</button>
                </div>
                <div style="flex:1;display:flex;align-items:center;justify-content:center;width:100%;margin-top:10px;">
                    <canvas id="tet-canvas" class="game-canvas" width="240" height="480" style="background:#1e293b;"></canvas>
                </div>
                <div style="margin-top:16px;font-size:12px;color:var(--text-muted);text-align:center;">
                    ← → двигать | ↑ поворот | ↓ ускорить | Пробел - сброс
                </div>
            </div>
        `;

        const canvas = NX.$('#tet-canvas', body);
        const ctxCanvas = canvas.getContext('2d');
        const scoreEl = NX.$('#tet-score', body);
        const linesEl = NX.$('#tet-lines', body);

        const COLS = 10;
        const ROWS = 20;
        const BLOCK = 24; // 240x480

        // Фигуры
        const SHAPES = {
            I: [[1,1,1,1]],
            O: [[1,1],[1,1]],
            T: [[0,1,0],[1,1,1]],
            S: [[0,1,1],[1,1,0]],
            Z: [[1,1,0],[0,1,1]],
            J: [[1,0,0],[1,1,1]],
            L: [[0,0,1],[1,1,1]]
        };
        const COLORS = {
            I: '#06b6d4', O: '#eab308', T: '#a855f7', 
            S: '#22c55e', Z: '#ef4444', J: '#3b82f6', L: '#f97316'
        };

        let board, currentPiece, currentX, currentY, score, lines, gameOver, dropInterval, loopId;

        const init = () => {
            board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
            score = 0;
            lines = 0;
            gameOver = false;
            scoreEl.textContent = '0';
            linesEl.textContent = '0';
            
            spawnPiece();
            
            if (loopId) clearInterval(loopId);
            loopId = setInterval(drop, 500);
            draw();
        };

        const spawnPiece = () => {
            const keys = Object.keys(SHAPES);
            const type = keys[Math.floor(Math.random() * keys.length)];
            const shape = SHAPES[type];
            
            currentPiece = {
                type,
                shape: shape.map(row => [...row]),
                color: COLORS[type]
            };
            currentX = Math.floor((COLS - currentPiece.shape[0].length) / 2);
            currentY = 0;

            if (collide(currentX, currentY, currentPiece.shape)) {
                gameOver = true;
                clearInterval(loopId);
                NX.audio.error();
            }
        };

        const collide = (x, y, shape) => {
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        const boardX = x + c;
                        const boardY = y + r;
                        if (boardX < 0 || boardX >= COLS || boardY >= ROWS || boardY < 0) return true;
                        if (boardY >= 0 && board[boardY][boardX]) return true;
                    }
                }
            }
            return false;
        };

        const merge = () => {
            currentPiece.shape.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (val) {
                        const boardY = currentY + r;
                        const boardX = currentX + c;
                        if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                            board[boardY][boardX] = currentPiece.color;
                        }
                    }
                });
            });
            clearLines();
            spawnPiece();
        };

        const clearLines = () => {
            let cleared = 0;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (board[r].every(cell => cell !== 0)) {
                    board.splice(r, 1);
                    board.unshift(Array(COLS).fill(0));
                    cleared++;
                    r++; // Проверяем ту же строку
                }
            }
            
            if (cleared > 0) {
                const points = [0, 100, 300, 500, 800]; // Очки за 1,2,3,4 линии
                score += points[cleared] || 800;
                lines += cleared;
                scoreEl.textContent = score;
                linesEl.textContent = lines;
                NX.audio.playTone(800 + cleared * 100, 0.1, 'sine', 0.1);
            }
        };

        const drop = () => {
            if (gameOver) return;
            
            if (!collide(currentX, currentY + 1, currentPiece.shape)) {
                currentY++;
                draw();
            } else {
                merge();
                draw();
            }
        };

        const rotate = () => {
            const shape = currentPiece.shape;
            const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
            
            if (!collide(currentX, currentY, rotated)) {
                currentPiece.shape = rotated;
                NX.audio.playTone(600, 0.05, 'sine', 0.05);
                draw();
            }
        };

        const draw = () => {
            ctxCanvas.fillStyle = '#1e293b';
            ctxCanvas.fillRect(0, 0, canvas.width, canvas.height);

            // Сетка
            ctxCanvas.strokeStyle = '#334155';
            ctxCanvas.lineWidth = 0.5;
            for (let i = 0; i <= COLS; i++) {
                ctxCanvas.beginPath(); ctxCanvas.moveTo(i * BLOCK, 0); ctxCanvas.lineTo(i * BLOCK, ROWS * BLOCK); ctxCanvas.stroke();
            }
            for (let i = 0; i <= ROWS; i++) {
                ctxCanvas.beginPath(); ctxCanvas.moveTo(0, i * BLOCK); ctxCanvas.lineTo(COLS * BLOCK, i * BLOCK); ctxCanvas.stroke();
            }

            // Заполненные клетки
            board.forEach((row, r) => {
                row.forEach((color, c) => {
                    if (color) {
                        ctxCanvas.fillStyle = color;
                        ctxCanvas.fillRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
                        ctxCanvas.fillStyle = 'rgba(255,255,255,0.2)';
                        ctxCanvas.fillRect(c * BLOCK, r * BLOCK, BLOCK, 2);
                    }
                });
            });

            // Текущая фигура
            if (currentPiece && !gameOver) {
                currentPiece.shape.forEach((row, r) => {
                    row.forEach((val, c) => {
                        if (val) {
                            ctxCanvas.fillStyle = currentPiece.color;
                            ctxCanvas.fillRect((currentX + c) * BLOCK, (currentY + r) * BLOCK, BLOCK, BLOCK);
                            ctxCanvas.fillStyle = 'rgba(255,255,255,0.2)';
                            ctxCanvas.fillRect((currentX + c) * BLOCK, (currentY + r) * BLOCK, BLOCK, 2);
                        }
                    });
                });
            }

            // Game Over
            if (gameOver) {
                ctxCanvas.fillStyle = 'rgba(0,0,0,0.8)';
                ctxCanvas.fillRect(0, 0, canvas.width, canvas.height);
                ctxCanvas.fillStyle = '#fff';
                ctxCanvas.font = 'bold 30px sans-serif';
                ctxCanvas.textAlign = 'center';
                ctxCanvas.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
                ctxCanvas.font = '16px sans-serif';
                ctxCanvas.fillText('Нажмите Заново', canvas.width / 2, canvas.height / 2 + 30);
            }
        };

        const keyHandler = (e) => {
            if (!NX.windows.focused || NX.windows.focused.el !== body.closest('.window') || gameOver) return;
            
            const k = e.key;
            if (k === 'ArrowLeft' && !collide(currentX - 1, currentY, currentPiece.shape)) {
                currentX--; draw(); e.preventDefault();
            } else if (k === 'ArrowRight' && !collide(currentX + 1, currentY, currentPiece.shape)) {
                currentX++; draw(); e.preventDefault();
            } else if (k === 'ArrowDown') {
                drop(); e.preventDefault();
            } else if (k === 'ArrowUp') {
                rotate(); e.preventDefault();
            } else if (k === ' ') {
                while (!collide(currentX, currentY + 1, currentPiece.shape)) {
                    currentY++;
                }
                merge(); draw(); e.preventDefault();
            }
        };

        document.addEventListener('keydown', keyHandler);
        NX.$('#tet-reset', body).onclick = init;
        
        ctx.onClose(() => {
            document.removeEventListener('keydown', keyHandler);
            clearInterval(loopId);
        });

        init();
    }
});

// --- 2. ПИНГ-ПОНГ ---
NX.registerApp({
    id: 'pong',
    name: 'Пинг-понг',
    icon: NX.icons.pong,
    color: '#2b8a5f',
    type: 'game',
    w: 600, h: 450,
    render(body, ctx) {
        body.innerHTML = `
            <div class="game-wrap">
                <div class="game-header" style="width:100%;justify-content:space-between;padding:0 20px;">
                    <div>Вы: <span id="pong-p1" style="color:var(--accent);">0</span></div>
                    <button class="btn" id="pong-reset" style="height:28px;font-size:12px;">Заново</button>
                    <div>ИИ: <span id="pong-p2" style="color:#ef4444;">0</span></div>
                </div>
                <div style="flex:1;display:flex;align-items:center;justify-content:center;width:100%;margin-top:10px;">
                    <canvas id="pong-canvas" class="game-canvas" width="600" height="350" style="background:#000;"></canvas>
                </div>
                <div style="margin-top:16px;font-size:12px;color:var(--text-muted);">Управление: Мышь</div>
            </div>
        `;

        const canvas = NX.$('#pong-canvas', body);
        const c = canvas.getContext('2d');
        
        let p1Score = 0, p2Score = 0;
        let ball, p1, p2, loopId;

        const init = () => {
            p1Score = 0; p2Score = 0;
            NX.$('#pong-p1', body).textContent = '0';
            NX.$('#pong-p2', body).textContent = '0';
            
            p1 = { y: canvas.height / 2 - 30, w: 10, h: 60 };
            p2 = { y: canvas.height / 2 - 30, w: 10, h: 60 };
            ball = { x: canvas.width / 2, y: canvas.height / 2, r: 6, vx: 4, vy: 3 };

            if (loopId) cancelAnimationFrame(loopId);
            update();
        };

        const update = () => {
            ball.x += ball.vx;
            ball.y += ball.vy;

            if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) {
                ball.vy *= -1;
                NX.audio.playTone(400, 0.05, 'sine', 0.1);
            }

            if (ball.x - ball.r < 20 && ball.y > p1.y && ball.y < p1.y + p1.h) {
                ball.vx = Math.abs(ball.vx) * 1.05;
                ball.vy += (Math.random() - 0.5) * 2;
                NX.audio.playTone(600, 0.05, 'sine', 0.1);
            }

            if (ball.x + ball.r > canvas.width - 20 && ball.y > p2.y && ball.y < p2.y + p2.h) {
                ball.vx = -Math.abs(ball.vx) * 1.05;
                ball.vy += (Math.random() - 0.5) * 2;
                NX.audio.playTone(600, 0.05, 'sine', 0.1);
            }

            if (ball.x < 0) {
                p2Score++;
                NX.$('#pong-p2', body).textContent = p2Score;
                NX.audio.error();
                resetBall();
            } else if (ball.x > canvas.width) {
                p1Score++;
                NX.$('#pong-p1', body).textContent = p1Score;
                NX.audio.notify();
                resetBall();
            }

            const p2Center = p2.y + p2.h / 2;
            if (p2Center < ball.y - 10) p2.y += 4;
            else if (p2Center > ball.y + 10) p2.y -= 4;
            p2.y = Math.max(0, Math.min(canvas.height - p2.h, p2.y));

            draw();
            loopId = requestAnimationFrame(update);
        };

        const resetBall = () => {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.vx = (Math.random() > 0.5 ? 1 : -1) * 4;
            ball.vy = (Math.random() > 0.5 ? 1 : -1) * 3;
        };

        const draw = () => {
            c.fillStyle = '#000';
            c.fillRect(0, 0, canvas.width, canvas.height);

            c.strokeStyle = 'rgba(255,255,255,0.2)';
            c.setLineDash([10, 10]);
            c.beginPath();
            c.moveTo(canvas.width / 2, 0);
            c.lineTo(canvas.width / 2, canvas.height);
            c.stroke();
            c.setLineDash([]);

            c.fillStyle = '#3b82f6';
            c.fillRect(10, p1.y, p1.w, p1.h);
            
            c.fillStyle = '#ef4444';
            c.fillRect(canvas.width - 20, p2.y, p2.w, p2.h);

            c.fillStyle = '#fff';
            c.beginPath();
            c.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            c.fill();
        };

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            p1.y = mouseY - p1.h / 2;
            p1.y = Math.max(0, Math.min(canvas.height - p1.h, p1.y));
        });

        NX.$('#pong-reset', body).onclick = init;
        ctx.onClose(() => cancelAnimationFrame(loopId));

        init();
    }
});

// --- 3. АРКАНОИД (BREAKOUT) ---
NX.registerApp({
    id: 'breakout',
    name: 'Арканоид',
    icon: NX.icons.g2048,
    color: '#ff9f0a',
    type: 'game',
    w: 600, h: 500,
    render(body, ctx) {
        body.innerHTML = `
            <div class="game-wrap">
                <div class="game-header" style="width:100%;justify-content:space-between;padding:0 20px;">
                    <div>Счёт: <span id="brk-score">0</span></div>
                    <button class="btn" id="brk-reset" style="height:28px;font-size:12px;">Заново</button>
                    <div>Жизни: <span id="brk-lives" style="color:#ef4444;">3</span></div>
                </div>
                <div style="flex:1;display:flex;align-items:center;justify-content:center;width:100%;margin-top:10px;">
                    <canvas id="brk-canvas" class="game-canvas" width="600" height="400" style="background:#0f172a;"></canvas>
                </div>
                <div style="margin-top:16px;font-size:12px;color:var(--text-muted);">Управление: Мышь</div>
            </div>
        `;

        const canvas = NX.$('#brk-canvas', body);
        const c = canvas.getContext('2d');
        
        let score = 0;
        let lives = 3;
        let loopId;
        
        let paddle, ball, bricks;
        const BRICK_ROWS = 5;
        const BRICK_COLS = 10;
        const BRICK_W = 55;
        const BRICK_H = 20;
        const BRICK_PAD = 5;
        const BRICK_OFFSET_TOP = 40;
        const BRICK_OFFSET_LEFT = 20;

        const init = () => {
            score = 0; lives = 3;
            NX.$('#brk-score', body).textContent = score;
            NX.$('#brk-lives', body).textContent = lives;
            
            paddle = { w: 100, h: 12, x: canvas.width / 2 - 50, y: canvas.height - 30 };
            ball = { x: canvas.width / 2, y: canvas.height - 50, r: 6, vx: 4, vy: -4 };
            
            bricks = [];
            for (let r = 0; r < BRICK_ROWS; r++) {
                for (let col = 0; col < BRICK_COLS; col++) {
                    bricks.push({
                        x: col * (BRICK_W + BRICK_PAD) + BRICK_OFFSET_LEFT,
                        y: r * (BRICK_H + BRICK_PAD) + BRICK_OFFSET_TOP,
                        w: BRICK_W,
                        h: BRICK_H,
                        active: true,
                        color: `hsl(${r * 40}, 80%, 60%)`
                    });
                }
            }

            if (loopId) cancelAnimationFrame(loopId);
            update();
        };

        const update = () => {
            ball.x += ball.vx;
            ball.y += ball.vy;

            if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) {
                ball.vx *= -1;
                NX.audio.playTone(300, 0.05, 'sine', 0.1);
            }
            if (ball.y - ball.r < 0) {
                ball.vy *= -1;
                NX.audio.playTone(300, 0.05, 'sine', 0.1);
            }

            if (ball.y + ball.r > paddle.y && ball.y - ball.r < paddle.y + paddle.h &&
                ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
                ball.vy = -Math.abs(ball.vy);
                const hitPos = (ball.x - paddle.x) / paddle.w;
                ball.vx = (hitPos - 0.5) * 8;
                NX.audio.playTone(500, 0.05, 'sine', 0.1);
            }

            if (ball.y + ball.r > canvas.height) {
                lives--;
                NX.$('#brk-lives', body).textContent = lives;
                NX.audio.error();
                
                if (lives <= 0) {
                    NX.notifications.push('Арканоид', 'Игра окончена!', 'info');
                    return init();
                }
                
                ball.x = canvas.width / 2;
                ball.y = canvas.height - 50;
                ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
                ball.vy = -4;
            }

            bricks.forEach(b => {
                if (!b.active) return;
                if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
                    ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
                    b.active = false;
                    ball.vy *= -1;
                    score += 10;
                    NX.$('#brk-score', body).textContent = score;
                    NX.audio.playTone(600 + Math.random() * 200, 0.05, 'sine', 0.1);
                }
            });

            if (bricks.every(b => !b.active)) {
                NX.notifications.push('Арканоид', 'Вы победили!', 'check');
                return init();
            }

            draw();
            loopId = requestAnimationFrame(update);
        };

        const draw = () => {
            c.fillStyle = '#0f172a';
            c.fillRect(0, 0, canvas.width, canvas.height);

            c.fillStyle = '#3b82f6';
            c.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

            c.fillStyle = '#fff';
            c.beginPath();
            c.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            c.fill();

            bricks.forEach(b => {
                if (b.active) {
                    c.fillStyle = b.color;
                    c.fillRect(b.x, b.y, b.w, b.h);
                    c.fillStyle = 'rgba(255,255,255,0.2)';
                    c.fillRect(b.x, b.y, b.w, 3);
                }
            });
        };

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            paddle.x = mouseX - paddle.w / 2;
            paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));
        });

        NX.$('#brk-reset', body).onclick = init;
        ctx.onClose(() => cancelAnimationFrame(loopId));

        init();
    }
});

// --- 4. РЕАКЦИЯ ---
NX.registerApp({
    id: 'reaction',
    name: 'Реакция',
    icon: NX.icons.reaction,
    color: '#f0a24b',
    type: 'game',
    w: 500, h: 400,
    render(body) {
        body.innerHTML = `
            <div class="game-wrap">
                <div class="game-header" style="margin-bottom:20px;">
                    <div>Лучший результат: <span id="react-best">-</span> мс</div>
                </div>
                <div class="react-box" id="react-box" style="background:#3b82f6;">
                    Нажмите, чтобы начать
                </div>
                <div style="margin-top:20px;font-size:14px;color:var(--text-muted);text-align:center;">
                    Когда блок станет <span style="color:#10b981;font-weight:bold;">зеленым</span>, кликните как можно быстрее!
                </div>
            </div>
        `;

        const box = NX.$('#react-box', body);
        const bestEl = NX.$('#react-best', body);
        
        let state = 'idle'; // idle, waiting, ready, result
        let startTime, timeoutId;
        let best = parseInt(localStorage.getItem('nx_react_best') || '0');
        
        if (best > 0) bestEl.textContent = best;

        box.onclick = () => {
            if (state === 'idle' || state === 'result') {
                state = 'waiting';
                box.style.background = '#ef4444';
                box.textContent = 'Ждите...';
                box.style.cursor = 'default';
                
                timeoutId = setTimeout(() => {
                    state = 'ready';
                    box.style.background = '#10b981';
                    box.textContent = 'ЖМИТЕ!';
                    box.style.cursor = 'pointer';
                    NX.audio.playTone(800, 0.1, 'sine', 0.1);
                    startTime = performance.now();
                }, 1500 + Math.random() * 3000);
            } 
            else if (state === 'waiting') {
                clearTimeout(timeoutId);
                state = 'idle';
                box.style.background = '#ef4444';
                box.textContent = 'Слишком рано! Попробуйте снова.';
                NX.audio.error();
            } 
            else if (state === 'ready') {
                const time = Math.round(performance.now() - startTime);
                state = 'result';
                box.style.background = '#3b82f6';
                box.textContent = `${time} мс`;
                NX.audio.notify();
                
                if (best === 0 || time < best) {
                    best = time;
                    localStorage.setItem('nx_react_best', best);
                    bestEl.textContent = best;
                    NX.notifications.push('Реакция', 'Новый рекорд!', 'check');
                }
            }
        };
    }
});

// --- 5. УГАДАЙ ЧИСЛО ---
NX.registerApp({
    id: 'guess',
    name: 'Угадай число',
    icon: NX.icons.guess,
    color: '#5e5ce6',
    type: 'game',
    w: 450, h: 450,
    render(body) {
        body.innerHTML = `
            <div class="game-wrap" style="justify-content:flex-start;padding-top:40px;">
                <div style="font-size:16px;margin-bottom:20px;text-align:center;">
                    Компьютер загадал число от <b>1</b> до <b>100</b>.<br>
                    Попробуйте угадать!
                </div>
                <div style="display:flex;gap:10px;margin-bottom:20px;">
                    <input type="number" id="guess-input" class="input" placeholder="Ваше число" style="width:150px;font-size:18px;text-align:center;">
                    <button class="btn primary" id="guess-btn">Проверить</button>
                </div>
                <div id="guess-msg" style="font-size:18px;font-weight:600;min-height:30px;text-align:center;"></div>
                <div style="margin-top:20px;font-size:14px;color:var(--text-muted);">
                    Попыток: <span id="guess-attempts">0</span>
                </div>
                <button class="btn ghost" id="guess-reset" style="margin-top:auto;margin-bottom:20px;">Новая игра</button>
            </div>
        `;

        const input = NX.$('#guess-input', body);
        const btn = NX.$('#guess-btn', body);
        const msg = NX.$('#guess-msg', body);
        const attemptsEl = NX.$('#guess-attempts', body);
        
        let secret, attempts;

        const init = () => {
            secret = Math.floor(Math.random() * 100) + 1;
            attempts = 0;
            attemptsEl.textContent = '0';
            msg.textContent = '';
            input.value = '';
            input.disabled = false;
            btn.disabled = false;
            input.focus();
        };

        const check = () => {
            const val = parseInt(input.value);
            if (isNaN(val) || val < 1 || val > 100) {
                msg.textContent = 'Введите число от 1 до 100';
                msg.style.color = '#ef4444';
                return;
            }

            attempts++;
            attemptsEl.textContent = attempts;
            NX.audio.click();

            if (val === secret) {
                msg.textContent = `Верно! Вы угадали за ${attempts} попыток.`;
                msg.style.color = '#10b981';
                NX.audio.notify();
                input.disabled = true;
                btn.disabled = true;
            } else if (val < secret) {
                msg.textContent = 'Загаданное число БОЛЬШЕ';
                msg.style.color = '#3b82f6';
            } else {
                msg.textContent = 'Загаданное число МЕНЬШЕ';
                msg.style.color = '#f97316';
            }
            
            input.value = '';
            input.focus();
        };

        btn.onclick = check;
        input.onkeydown = (e) => { if (e.key === 'Enter') check(); };
        NX.$('#guess-reset', body).onclick = init;

        init();
    }
});
