/**
 * Игра — Змейка
 */
(function () {
  'use strict';
  const { $, icons } = NX;

  NX.registerApp({
    id: 'snake', name: 'Змейка', icon: icons.snake, color: '#30b06b',
    type: 'Игра', category: 'game', w: 440, h: 500,
    render(body, ctx) {
      body.innerHTML = `<div class="g-wrap">
        <div class="g-bar"><span>Счёт: <b class="sc">0</b></span>
          <span>Рекорд: <b class="hi">0</b></span>
          <button class="btn ghost" data-act="reset">${icons.refresh} Заново</button></div>
        <canvas class="game" width="360" height="360"></canvas>
        <div style="font-size:11px;color:var(--muted)">Стрелки или WASD</div>
      </div>`;
      const cv = $('canvas', body), c = cv.getContext('2d');
      const CELL = 18, N = 20;
      let snake, dir, food, score, hi = +(NX.prefs.get('hi_snake', 0)), timer, alive;
      $('.hi', body).textContent = hi;

      function reset() {
        snake = [{ x: 9, y: 10 }];
        dir = { x: 1, y: 0 };
        food = spawn();
        score = 0; alive = true;
        $('.sc', body).textContent = '0';
        clearInterval(timer);
        timer = setInterval(step, 110);
        draw();
      }
      function spawn() {
        let p;
        do { p = { x: (Math.random() * N) | 0, y: (Math.random() * N) | 0 }; }
        while (snake.some(s => s.x === p.x && s.y === p.y));
        return p;
      }
      function step() {
        if (!alive) return;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N ||
            snake.some(s => s.x === head.x && s.y === head.y)) {
          alive = false; clearInterval(timer);
          if (score > hi) { hi = score; NX.prefs.set('hi_snake', hi); $('.hi', body).textContent = hi; }
          draw(); return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score += 10; $('.sc', body).textContent = score; food = spawn();
        } else snake.pop();
        draw();
      }
      function draw() {
        const w = cv.width, cell = w / N;
        c.fillStyle = '#f6f7f9'; c.fillRect(0, 0, w, w);
        c.fillStyle = '#e8534a'; c.beginPath();
        c.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell * 0.32, 0, 7); c.fill();
        snake.forEach((s, i) => {
          c.fillStyle = i === 0 ? '#248a52' : '#30b06b';
          c.beginPath();
          c.roundRect(s.x * cell + 2, s.y * cell + 2, cell - 4, cell - 4, 4);
          c.fill();
        });
        if (!alive) {
          c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, 0, w, w);
          c.fillStyle = '#fff'; c.font = '600 16px system-ui'; c.textAlign = 'center';
          c.fillText('Игра окончена', w / 2, w / 2 - 4);
          c.font = '12px system-ui'; c.fillStyle = 'rgba(255,255,255,.7)';
          c.fillText('Нажмите «Заново»', w / 2, w / 2 + 18);
        }
      }
      const keys = e => {
        if (NX.windows.focused !== ctx.win) return;
        const k = e.key.toLowerCase();
        const m = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
        if (m[k]) {
          e.preventDefault();
          const [x, y] = m[k];
          if (x === -dir.x && y === -dir.y) return;
          dir = { x, y };
        }
      };
      document.addEventListener('keydown', keys);
      ctx.onClose(() => { document.removeEventListener('keydown', keys); clearInterval(timer); });
      $('[data-act="reset"]', body).onclick = reset;
      reset();
    }
  });
})();
