/**
 * Игра — Тетрис
 */
(function () {
  'use strict';
  const { $, icons } = NX;

  const SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]]
  };
  const COLORS = { I: '#5bd6e8', O: '#e8c65a', T: '#b45bd6', S: '#5bd68a', Z: '#e8534a', J: '#5e5ce6', L: '#f0a24b' };

  NX.registerApp({
    id: 'tetris', name: 'Тетрис', icon: icons.tetris, color: '#5e5ce6',
    type: 'Игра', category: 'game', w: 420, h: 540,
    render(body, ctx) {
      body.innerHTML = `<div class="g-wrap">
        <div class="g-bar"><span>Счёт: <b class="sc">0</b></span>
          <span>Линии: <b class="ln">0</b></span>
          <button class="btn ghost" data-act="reset">${icons.refresh} Заново</button></div>
        <canvas class="game" width="220" height="440"></canvas>
        <div style="font-size:11px;color:var(--muted)">← → двигать · ↑ поворот · ↓ ускорить · Space — сброс</div>
      </div>`;
      const cv = $('canvas', body), c = cv.getContext('2d');
      const COLS = 10, ROWS = 20, CELL = 22;
      let grid, cur, cx, cy, score, lines, over, timer, dropTimer;

      function emptyGrid() { return Array.from({ length: ROWS }, () => Array(COLS).fill(null)); }
      function reset() {
        grid = emptyGrid();
        score = 0; lines = 0; over = false;
        $('.sc', body).textContent = 0; $('.ln', body).textContent = 0;
        spawn();
        clearInterval(timer);
        timer = setInterval(tick, 500);
        draw();
      }
      function pick() {
        const keys = Object.keys(SHAPES);
        const k = keys[(Math.random() * keys.length) | 0];
        return { k, s: SHAPES[k].map(r => r.slice()), color: COLORS[k] };
      }
      function spawn() {
        cur = pick();
        cx = Math.floor((COLS - cur.s[0].length) / 2);
        cy = 0;
        if (collide(cx, cy)) { over = true; clearInterval(timer); }
      }
      function collide(ox, oy, shape) {
        const s = shape || cur.s;
        for (let y = 0; y < s.length; y++) for (let x = 0; x < s[y].length; x++) {
          if (!s[y][x]) continue;
          const gx = ox + x, gy = oy + y;
          if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
          if (gy >= 0 && grid[gy][gx]) return true;
        }
        return false;
      }
      function rotate(shape) {
        const H = shape.length, W = shape[0].length;
        const r = Array.from({ length: W }, () => Array(H).fill(0));
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) r[x][H - 1 - y] = shape[y][x];
        return r;
      }
      function tick() {
        if (over) return;
        if (collide(cx, cy + 1)) { merge(); return; }
        cy++;
        draw();
      }
      function merge() {
        for (let y = 0; y < cur.s.length; y++) for (let x = 0; x < cur.s[y].length; x++) {
          if (cur.s[y][x]) {
            const gy = cy + y;
            if (gy < 0) { over = true; clearInterval(timer); return; }
            grid[gy][cx + x] = cur.color;
          }
        }
        clearLines();
        spawn();
        draw();
      }
      function clearLines() {
        let n = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
          if (grid[y].every(c => c)) {
            grid.splice(y, 1);
            grid.unshift(Array(COLS).fill(null));
            n++; y++;
          }
        }
        if (n) {
          lines += n; score += n * 100;
          $('.sc', body).textContent = score;
          $('.ln', body).textContent = lines;
        }
      }
      function draw() {
        c.fillStyle = '#f6f7f9'; c.fillRect(0, 0, cv.width, cv.height);
        c.strokeStyle = 'rgba(0,0,0,.06)';
        for (let i = 0; i <= COLS; i++) { c.beginPath(); c.moveTo(i * CELL, 0); c.lineTo(i * CELL, ROWS * CELL); c.stroke(); }
        for (let i = 0; i <= ROWS; i++) { c.beginPath(); c.moveTo(0, i * CELL); c.lineTo(COLS * CELL, i * CELL); c.stroke(); }
        grid.forEach((row, y) => row.forEach((cell, x) => {
          if (cell) { c.fillStyle = cell; c.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2); }
        }));
        if (cur) cur.s.forEach((row, y) => row.forEach((v, x) => {
          if (v) { c.fillStyle = cur.color; c.fillRect((cx + x) * CELL + 1, (cy + y) * CELL + 1, CELL - 2, CELL - 2); }
        }));
        if (over) {
          c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, 0, cv.width, cv.height);
          c.fillStyle = '#fff'; c.font = '600 18px system-ui'; c.textAlign = 'center';
          c.fillText('Game Over', cv.width / 2, cv.height / 2);
        }
      }
      const keys = e => {
        if (NX.windows.focused !== ctx.win || over) return;
        const k = e.key;
        if (k === 'ArrowLeft' && !collide(cx - 1, cy)) { cx--; draw(); e.preventDefault(); }
        if (k === 'ArrowRight' && !collide(cx + 1, cy)) { cx++; draw(); e.preventDefault(); }
        if (k === 'ArrowDown') { if (!collide(cx, cy + 1)) cy++; draw(); e.preventDefault(); }
        if (k === 'ArrowUp') {
          e.preventDefault();
          const r = rotate(cur.s);
          if (!collide(cx, cy, r)) cur.s = r;
          draw();
        }
        if (k === ' ') { e.preventDefault(); while (!collide(cx, cy + 1)) cy++; merge(); draw(); }
      };
      document.addEventListener('keydown', keys);
      ctx.onClose(() => { document.removeEventListener('keydown', keys); clearInterval(timer); });
      $('[data-act="reset"]', body).onclick = reset;
      reset();
    }
  });
})();
