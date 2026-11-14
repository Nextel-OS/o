/**
 * Игра — 2048
 */
(function () {
  'use strict';
  const { $, icons } = NX;

  NX.registerApp({
    id: 'g2048', name: '2048', icon: icons.g2048, color: '#e8ac1f',
    type: 'Игра', category: 'game', w: 380, h: 470,
    render(body, ctx) {
      body.innerHTML = `<div class="g-wrap">
        <div class="g-bar"><span>Счёт: <b class="sc">0</b></span>
          <span>Рекорд: <b class="hi">0</b></span>
          <button class="btn ghost" data-act="reset">${icons.refresh} Заново</button></div>
        <div class="g2048"></div>
        <div style="font-size:11px;color:var(--muted)">Стрелки или WASD</div>
      </div>`;
      const grid = $('.g2048', body);
      let board, score, hi = +(NX.prefs.get('hi_2048', 0));
      $('.hi', body).textContent = hi;
      const cells = [];
      for (let i = 0; i < 16; i++) {
        const d = document.createElement('div');
        d.className = 'cell2048';
        grid.appendChild(d); cells.push(d);
      }
      function reset() { board = Array(16).fill(0); score = 0; add(); add(); draw(); }
      function add() {
        const empty = board.map((v, i) => v ? -1 : i).filter(i => i >= 0);
        if (!empty.length) return;
        board[empty[(Math.random() * empty.length) | 0]] = Math.random() < 0.9 ? 2 : 4;
      }
      function draw() {
        board.forEach((v, i) => { cells[i].textContent = v || ''; cells[i].dataset.v = v || ''; });
        $('.sc', body).textContent = score;
        if (score > hi) { hi = score; NX.prefs.set('hi_2048', hi); $('.hi', body).textContent = hi; }
      }
      function slide(line) {
        let arr = line.filter(v => v);
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) { arr[i] *= 2; score += arr[i]; arr.splice(i + 1, 1); }
        }
        while (arr.length < 4) arr.push(0);
        return arr;
      }
      function move(dir) {
        const before = board.join(',');
        const idx = (r, c) => r * 4 + c;
        if (dir === 'left') for (let r = 0; r < 4; r++) {
          const line = [0, 1, 2, 3].map(c => board[idx(r, c)]);
          slide(line).forEach((v, c) => board[idx(r, c)] = v);
        }
        if (dir === 'right') for (let r = 0; r < 4; r++) {
          const line = [3, 2, 1, 0].map(c => board[idx(r, c)]);
          slide(line).forEach((v, i) => board[idx(r, 3 - i)] = v);
        }
        if (dir === 'up') for (let c = 0; c < 4; c++) {
          const line = [0, 1, 2, 3].map(r => board[idx(r, c)]);
          slide(line).forEach((v, r) => board[idx(r, c)] = v);
        }
        if (dir === 'down') for (let c = 0; c < 4; c++) {
          const line = [3, 2, 1, 0].map(r => board[idx(r, c)]);
          slide(line).forEach((v, i) => board[idx(3 - i, c)] = v);
        }
        if (board.join(',') !== before) { add(); draw(); }
      }
      const keys = e => {
        if (NX.windows.focused !== ctx.win) return;
        const m = { arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right', arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down' };
        const d = m[e.key.toLowerCase()];
        if (d) { e.preventDefault(); move(d); }
      };
      document.addEventListener('keydown', keys);
      ctx.onClose(() => document.removeEventListener('keydown', keys));
      $('[data-act="reset"]', body).onclick = reset;
      reset();
    }
  });
})();
