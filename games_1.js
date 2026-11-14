/* ============================================================
   NEXTEL OS 2.0 — ИГРЫ (ЧАСТЬ 1)
   ============================================================ */

// --- 1. ЗМЕЙКА ---
NX.registerApp({
    id: 'snake',
    name: 'Змейка',
    icon: NX.icons.snake,
    w: 500, h: 550,
    render(body, ctx) {
        body.innerHTML = `
            <div class="game-wrap" style="height:100%;">
                <div class="game-header">
                    <div>Счёт: <span id="snake-score" style="color:var(--accent);">0</span></div>
                    <div>Рекорд: <span id="snake-high" style="color:var(--accent);">0</span></div>
                    <button class="btn primary" id="snake-restart" style="height:28px;font-size:12px;">Заново</button>
                </div>
                <div style="flex:1;display:flex;align-items:center;justify-content:center;width:100%;">
                    <canvas id="snake-canvas" class="game-canvas" width="400" height="400"></canvas>
                </div>
                <div style="margin-top:16px;font-size:12px;color:var(--text-muted);">Управление: Стрелки или WASD</div>
            </div>
        `;

        const canvas = NX.$('#snake-canvas', body);
        const ctxCanvas = canvas.getContext('2d');
        const scoreEl = NX.$('#snake-score', body);
        const highEl = NX.$('#snake-high', body);

        const GRID = 20;
        const CELL = canvas.width / GRID;
        let snake, dir, food, score, high, gameLoop, isDead, isPaused;

        high = parseInt(localStorage.getItem('nx_snake_high') || '0');
        highEl.textContent = high;

        const init = () => {
            snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
            dir = { x: 1, y: 0 };
            score = 0;
            isDead = false;
            isPaused = false;
            scoreEl.textContent = '0';
            spawnFood();
            
            if (gameLoop) clearInterval(gameLoop);
            gameLoop = setInterval(update, 100);
            draw();
        };

        const spawnFood = () => {
            let valid = false;
            while (!valid) {
                food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
                valid = !snake.some(s => s.x === food.x && s.y === food.y);
            }
        };

        const update = () => {
            if (isDead || isPaused) return;

            const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

            // Стены
            if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) return gameOver();
            
            // Себя
            if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreEl.textContent = score;
                NX.audio.playTone(800, 0.1, 'sine', 0.1);
                if (score > high) {
                    high = score;
                    highEl.textContent = high;
                    localStorage.setItem('nx_snake_high', high);
                }
                spawnFood();
            } else {
                snake.pop();
            }

            draw();
        };

        const gameOver = () => {
            isDead = true;
            clearInterval(gameLoop);
            NX.audio.error();
            
            ctxCanvas.fillStyle = 'rgba(0,0,0,0.7)';
            ctxCanvas.fillRect(0, 0, canvas.width, canvas.height);
            ctxCanvas.fillStyle = '#fff';
            ctxCanvas.font = 'bold 30px sans-serif';
            ctxCanvas.textAlign = 'center';
            ctxCanvas.fillText('Игра окончена', canvas.width / 2, canvas.height / 2 - 10);
            ctxCanvas.font = '16px sans-serif';
            ctxCanvas.fillText('Нажмите "Заново"', canvas.width / 2, canvas.height / 2 + 20);
        };

        const draw = () => {
            ctxCanvas.fillStyle = '#f3f4f6';
            ctxCanvas.fillRect(0, 0, canvas.width, canvas.height);

            // Еда
            ctxCanvas.fillStyle = '#ef4444';
            ctxCanvas.beginPath();
            ctxCanvas.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
            ctxCanvas.fill();

            // Змейка
            snake.forEach((s, i) => {
                ctxCanvas.fillStyle = i === 0 ? '#10b981' : '#059669';
                ctxCanvas.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
            });
        };

        const keyHandler = (e) => {
            if (!NX.windows.focused || NX.windows.focused.el !== body.closest('.window')) return;
            const k = e.key.toLowerCase();
            if ((k === 'arrowup' || k === 'w') && dir.y === 0) { dir = { x: 0, y: -1 }; e.preventDefault(); }
            if ((k === 'arrowdown' || k === 's') && dir.y === 0) { dir = { x: 0, y: 1 }; e.preventDefault(); }
            if ((k === 'arrowleft' || k === 'a') && dir.x === 0) { dir = { x: -1, y: 0 }; e.preventDefault(); }
            if ((k === 'arrowright' || k === 'd') && dir.x === 0) { dir = { x: 1, y: 0 }; e.preventDefault(); }
            if (k === ' ') { isPaused = !isPaused; e.preventDefault(); }
        };

        document.addEventListener('keydown', keyHandler);
        NX.$('#snake-restart', body).onclick = init;
        
        ctx.onClose(() => {
            document.removeEventListener('keydown', keyHandler);
            clearInterval(gameLoop);
        });

        init();
    }
});

// --- 2. 2048 (С анимацией) ---
NX.registerApp({
    id: 'g2048',
    name: '2048',
    icon: NX.icons.g2048,
    w: 400, h: 520,
    render(body, ctx) {
        body.innerHTML = `
            <style>
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); }
                }
                .g2048-cell.new { animation: popIn 0.2s ease-out forwards; }
                .g2048-cell.merged { animation: popIn 0.2s ease-out forwards; }
            </style>
            <div class="game-wrap">
                <div class="game-header">
                    <div>Счёт: <span id="2048-score">0</span></div>
                    <div>Рекорд: <span id="2048-high">0</span></div>
                    <button class="btn primary" id="2048-reset" style="margin-left:auto;height:28px;font-size:12px;">Заново</button>
                </div>
                <div class="g2048-board" id="2048-board"></div>
                <div style="margin-top:16px;font-size:12px;color:var(--text-muted);">Стрелки или WASD</div>
            </div>
        `;

        const boardEl = NX.$('#2048-board', body);
        const scoreEl = NX.$('#2048-score', body);
        const highEl = NX.$('#2048-high', body);

        let board = [];
        let score = 0;
        let high = parseInt(localStorage.getItem('nx_2048_high') || '0');
        highEl.textContent = high;

        const init = () => {
            board = Array(16).fill(0);
            score = 0;
            scoreEl.textContent = '0';
            renderBoard();
            addRandom();
            addRandom();
        };

        const renderBoard = (mergedIndices = [], newIndices = []) => {
            boardEl.innerHTML = board.map((val, i) => {
                let cls = 'g2048-cell';
                if (mergedIndices.includes(i)) cls += ' merged';
                else if (newIndices.includes(i)) cls += ' new';
                
                return `
                    <div class="${cls}" data-v="${val}" data-i="${i}">
                        ${val || ''}
                    </div>
                `;
            }).join('');
        };

        const addRandom = () => {
            const empty = board.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
            if (empty.length === 0) return;
            const idx = empty[Math.floor(Math.random() * empty.length)];
            board[idx] = Math.random() < 0.9 ? 2 : 4;
            renderBoard([], [idx]);
        };

        const slide = (line) => {
            let arr = line.filter(v => v !== 0);
            let merged = [];
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i] === arr[i + 1]) {
                    arr[i] *= 2;
                    score += arr[i];
                    merged.push(i);
                    arr.splice(i + 1, 1);
                    arr.push(0);
                }
            }
            while (arr.length < 4) arr.push(0);
            return { arr, merged };
        };

        const move = (dir) => {
            const before = board.join(',');
            let mergedIndices = [];
            
            if (dir === 'left') {
                for (let r = 0; r < 4; r++) {
                    const line = [board[r*4], board[r*4+1], board[r*4+2], board[r*4+3]];
                    const { arr } = slide(line);
                    for (let c = 0; c < 4; c++) board[r*4+c] = arr[c];
                }
            } else if (dir === 'right') {
                for (let r = 0; r < 4; r++) {
                    const line = [board[r*4+3], board[r*4+2], board[r*4+1], board[r*4]];
                    const { arr } = slide(line);
                    for (let c = 0; c < 4; c++) board[r*4+c] = arr[3-c];
                }
            } else if (dir === 'up') {
                for (let c = 0; c < 4; c++) {
                    const line = [board[c], board[c+4], board[c+8], board[c+12]];
                    const { arr } = slide(line);
                    for (let r = 0; r < 4; r++) board[r*4+c] = arr[r];
                }
            } else if (dir === 'down') {
                for (let c = 0; c < 4; c++) {
                    const line = [board[c+12], board[c+8], board[c+4], board[c]];
                    const { arr } = slide(line);
                    for (let r = 0; r < 4; r++) board[r*4+c] = arr[3-r];
                }
            }

            if (board.join(',') !== before) {
                scoreEl.textContent = score;
                if (score > high) {
                    high = score;
                    highEl.textContent = high;
                    localStorage.setItem('nx_2048_high', high);
                }
                renderBoard();
                setTimeout(() => addRandom(), 100);
            }
        };

        const keyHandler = (e) => {
            if (!NX.windows.focused || NX.windows.focused.el !== body.closest('.window')) return;
            const k = e.key.toLowerCase();
            if (k === 'arrowleft' || k === 'a') { e.preventDefault(); move('left'); }
            if (k === 'arrowright' || k === 'd') { e.preventDefault(); move('right'); }
            if (k === 'arrowup' || k === 'w') { e.preventDefault(); move('up'); }
            if (k === 'arrowdown' || k === 's') { e.preventDefault(); move('down'); }
        };

        document.addEventListener('keydown', keyHandler);
        NX.$('#2048-reset', body).onclick = init;
        
        ctx.onClose(() => document.removeEventListener('keydown', keyHandler));
        
        init();
    }
});

// --- 3. САПЁР ---
NX.registerApp({
    id: 'mines',
    name: 'Сапёр',
    icon: NX.icons.mines,
    w: 450, h: 550,
    render(body) {
        body.innerHTML = `
            <div class="game-wrap">
                <div class="game-header" style="width:100%;justify-content:space-between;padding:0 20px;box-sizing:border-box;">
                    <div>Мины: <span id="mines-count" style="color:#ef4444;">10</span></div>
                    <button class="btn" id="mines-reset" style="height:28px;font-size:12px;">Заново</button>
                    <div>Время: <span id="mines-time">0</span></div>
                </div>
                <div class="mines-grid" id="mines-grid" style="margin-top:10px;"></div>
            </div>
        `;

        const gridEl = NX.$('#mines-grid', body);
        const minesCountEl = NX.$('#mines-count', body);
        const timeEl = NX.$('#mines-time', body);
        
        const SIZE = 10;
        const MINES = 10;
        let cells = [];
        let gameOver = false;
        let flags = 0;
        let time = 0;
        let timer = null;
        let started = false;

        const init = () => {
            clearInterval(timer);
            started = false;
            time = 0;
            timeEl.textContent = '0';
            gameOver = false;
            flags = 0;
            minesCountEl.textContent = MINES;
            
            cells = Array.from({ length: SIZE * SIZE }, () => ({
                mine: false, revealed: false, flagged: false, count: 0
            }));

            let placed = 0;
            while (placed < MINES) {
                const idx = Math.floor(Math.random() * SIZE * SIZE);
                if (!cells[idx].mine) {
                    cells[idx].mine = true;
                    placed++;
                }
            }

            for (let i = 0; i < SIZE * SIZE; i++) {
                if (cells[i].mine) continue;
                let count = 0;
                getNeighbors(i).forEach(n => { if (cells[n].mine) count++; });
                cells[i].count = count;
            }

            gridEl.style.gridTemplateColumns = `repeat(${SIZE}, 32px)`;
            render();
        };

        const getNeighbors = (idx) => {
            const x = idx % SIZE;
            const y = Math.floor(idx / SIZE);
            const res = [];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
                        res.push(ny * SIZE + nx);
                    }
                }
            }
            return res;
        };

        const startTimer = () => {
            if (started) return;
            started = true;
            timer = setInterval(() => {
                time++;
                timeEl.textContent = time;
            }, 1000);
        };

        const reveal = (idx) => {
            if (gameOver || cells[idx].revealed || cells[idx].flagged) return;
            
            startTimer();
            cells[idx].revealed = true;

            if (cells[idx].mine) {
                return lose();
            }

            if (cells[idx].count === 0) {
                getNeighbors(idx).forEach(n => reveal(n));
            }
            
            checkWin();
            render();
        };

        const toggleFlag = (idx) => {
            if (gameOver || cells[idx].revealed) return;
            if (!cells[idx].flagged && flags >= MINES) return;
            
            cells[idx].flagged = !cells[idx].flagged;
            flags += cells[idx].flagged ? 1 : -1;
            minesCountEl.textContent = MINES - flags;
            render();
        };

        const lose = () => {
            gameOver = true;
            clearInterval(timer);
            cells.forEach(c => { if (c.mine) c.revealed = true; });
            render();
            NX.audio.error();
        };

        const checkWin = () => {
            const allRevealed = cells.every(c => c.revealed || c.mine);
            if (allRevealed && !gameOver) {
                gameOver = true;
                clearInterval(timer);
                NX.notifications.push('Сапёр', `Победа! Время: ${time} сек.`, 'check');
                NX.audio.notify();
            }
        };

        const render = () => {
            gridEl.innerHTML = cells.map((c, i) => {
                let content = '';
                let className = 'mine-cell';
                let style = '';

                if (c.revealed) {
                    className += ' open';
                    if (c.mine) {
                        content = '💥';
                        className += ' boom';
                    } else if (c.count > 0) {
                        content = c.count;
                        const colors = ['', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4', '#111827', '#6b7280'];
                        style = `color: ${colors[c.count]};`;
                    }
                } else if (c.flagged) {
                    content = '🚩';
                    className += ' flag';
                }

                return `<button class="${className}" data-i="${i}" style="${style}">${content}</button>`;
            }).join('');

            NX.$$('.mine-cell', gridEl).forEach(btn => {
                const idx = parseInt(btn.dataset.i);
                btn.onclick = () => reveal(idx);
                btn.oncontextmenu = (e) => {
                    e.preventDefault();
                    toggleFlag(idx);
                };
            });
        };

        NX.$('#mines-reset', body).onclick = init;
        init();
    }
});

// --- 4. КРЕСТИКИ-НОЛИКИ ---
NX.registerApp({
    id: 'ttt',
    name: 'Крестики-нолики',
    icon: NX.icons.ttt,
    w: 400, h: 500,
    render(body) {
        body.innerHTML = `
            <div class="game-wrap">
                <div class="game-header">
                    <div id="ttt-status">Ваш ход (X)</div>
                    <button class="btn" id="ttt-reset" style="margin-left:auto;height:28px;font-size:12px;">Заново</button>
                </div>
                <div class="ttt-board" id="ttt-board"></div>
            </div>
        `;

        const boardEl = NX.$('#ttt-board', body);
        const statusEl = NX.$('#ttt-status', body);
        
        let board = [];
        let isGameOver = false;

        const init = () => {
            board = Array(9).fill('');
            isGameOver = false;
            statusEl.textContent = 'Ваш ход (X)';
            statusEl.style.color = 'var(--text)';
            render();
        };

        const render = () => {
            boardEl.innerHTML = board.map((v, i) => `
                <button class="ttt-cell" data-i="${i}">${v}</button>
            `).join('');

            NX.$$('.ttt-cell', boardEl).forEach(btn => {
                btn.onclick = () => playerMove(parseInt(btn.dataset.i));
            });
        };

        const checkWinner = () => {
            const wins = [
                [0,1,2], [3,4,5], [6,7,8],
                [0,3,6], [1,4,7], [2,5,8],
                [0,4,8], [2,4,6]
            ];
            
            for (let w of wins) {
                if (board[w[0]] && board[w[0]] === board[w[1]] && board[w[1]] === board[w[2]]) {
                    return { winner: board[w[0]], line: w };
                }
            }
            if (board.every(v => v !== '')) return { winner: 'draw' };
            return null;
        };

        const playerMove = (idx) => {
            if (isGameOver || board[idx]) return;
            
            board[idx] = 'X';
            NX.audio.playTone(800, 0.05, 'sine', 0.1);
            render();

            const result = checkWinner();
            if (result) return endGame(result);

            statusEl.textContent = 'Ход компьютера...';
            setTimeout(aiMove, 400);
        };

        const aiMove = () => {
            if (isGameOver) return;
            
            const empty = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
            let move = null;
            
            // 1. Победа
            for (let i of empty) {
                board[i] = 'O';
                if (checkWinner() && checkWinner().winner === 'O') { move = i; board[i] = ''; break; }
                board[i] = '';
            }
            
            // 2. Блокировка
            if (move === null) {
                for (let i of empty) {
                    board[i] = 'X';
                    if (checkWinner() && checkWinner().winner === 'X') { move = i; board[i] = ''; break; }
                    board[i] = '';
                }
            }

            // 3. Центр / Углы / Рандом
            if (move === null) {
                if (board[4] === '') move = 4;
                else {
                    const corners = [0, 2, 6, 8].filter(i => board[i] === '');
                    if (corners.length > 0) move = corners[Math.floor(Math.random() * corners.length)];
                    else move = empty[Math.floor(Math.random() * empty.length)];
                }
            }

            if (move !== null) {
                board[move] = 'O';
                NX.audio.playTone(600, 0.05, 'sine', 0.1);
                render();
                const result = checkWinner();
                if (result) endGame(result);
                else statusEl.textContent = 'Ваш ход (X)';
            }
        };

        const endGame = (result) => {
            isGameOver = true;
            if (result.winner === 'X') {
                statusEl.textContent = 'Вы победили!';
                statusEl.style.color = '#10b981';
                NX.audio.notify();
            } else if (result.winner === 'O') {
                statusEl.textContent = 'Компьютер победил';
                statusEl.style.color = '#ef4444';
                NX.audio.error();
            } else {
                statusEl.textContent = 'Ничья';
                statusEl.style.color = 'var(--text-muted)';
            }
            
            if (result.line) {
                result.line.forEach(i => {
                    const cell = boardEl.querySelector(`[data-i="${i}"]`);
                    if (cell) cell.classList.add('win');
                });
            }
        };

        NX.$('#ttt-reset', body).onclick = init;
        init();
    }
});

// --- 5. ПЯТНАШКИ ---
NX.registerApp({
    id: 'puzzle15',
    name: 'Пятнашки',
    icon: NX.icons.grid || NX.icons.g2048,
    w: 400, h: 480,
    render(body) {
        body.innerHTML = `
            <div class="game-wrap">
                <div class="game-header">
                    <div>Ходы: <span id="puz-moves">0</span></div>
                    <button class="btn" id="puz-reset" style="margin-left:auto;height:28px;font-size:12px;">Заново</button>
                </div>
                <div id="puz-board" style="display:grid;grid-template-columns:repeat(3, 100px);gap:4px;background:var(--border);padding:4px;border-radius:8px;margin-top:10px;"></div>
            </div>
        `;

        const boardEl = NX.$('#puz-board', body);
        const movesEl = NX.$('#puz-moves', body);
        
        let tiles = [];
        let moves = 0;
        let isWon = false;

        const init = () => {
            // Решаемое состояние: [1..8, 0]
            tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0]; 
            
            // Перемешиваем (100 случайных ходов, чтобы всегда было решаемо)
            for (let i = 0; i < 100; i++) {
                const emptyIdx = tiles.indexOf(0);
                const neighbors = getNeighbors(emptyIdx);
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                tiles[emptyIdx] = tiles[randomNeighbor];
                tiles[randomNeighbor] = 0;
            }

            moves = 0;
            movesEl.textContent = '0';
            isWon = false;
            render();
        };

        const getNeighbors = (idx) => {
            const x = idx % 3;
            const y = Math.floor(idx / 3);
            const res = [];
            if (x > 0) res.push(idx - 1);
            if (x < 2) res.push(idx + 1);
            if (y > 0) res.push(idx - 3);
            if (y < 2) res.push(idx + 3);
            return res;
        };

        const render = () => {
            boardEl.innerHTML = tiles.map((v, i) => `
                <div class="puz-tile ${v === 0 ? 'puz-empty' : ''}" data-i="${i}">
                    ${v === 0 ? '' : v}
                </div>
            `).join('');

            NX.$$('.puz-tile', boardEl).forEach(el => {
                el.onclick = () => move(parseInt(el.dataset.i));
            });
        };

        const move = (idx) => {
            if (isWon) return;
            
            const emptyIdx = tiles.indexOf(0);
            if (getNeighbors(idx).includes(emptyIdx)) {
                tiles[emptyIdx] = tiles[idx];
                tiles[idx] = 0;
                moves++;
                movesEl.textContent = moves;
                NX.audio.click();
                render();
                checkWin();
            }
        };

        const checkWin = () => {
            const winState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
            const won = tiles.every((v, i) => v === winState[i]);
            
            if (won) {
                isWon = true;
                setTimeout(() => {
                    NX.notifications.push('Пятнашки', `Победа! Ходов: ${moves}`, 'check');
                    NX.audio.notify();
                    NX.$$('.puz-tile', boardEl).forEach(el => el.style.background = '#10b981');
                }, 300);
            }
        };

        NX.$('#puz-reset', body).onclick = init;
        init();
    }
});
