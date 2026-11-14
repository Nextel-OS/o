/**
 * Игра — Сапёр
 */
(function () {
  'use strict';
  const { $ } = NX;

  NX.registerApp({
    id: 'mines', name: 'Сапёр', icon: NX.icons.mines, color: '#5e6ad2',
    type: 'Игра', category: 'game', w: 380, h: 460,
    render(body) {
      const N = 9, M = 10;
      body.innerHTML = `<div class="g-wrap">
        <div class="g-bar"><span>Мины: <b class="mn">${M}</b></span>
          <span>Время: <b class="tm">0</b></span>
          <button class="btn ghost" data-act="reset">${NX.icons.refresh} Заново</button></div>
        <div class="mines"></div>
      </div>`;
      const grid = $('.mines', body);
      let cells, opened, flags, dead, started, t, sec;
      function reset() {
        clearInterval(t); sec = 0; $('.tm', body).textContent = 0;
        dead = false; opened = 0; flags = 0; started = false;
        cells = Array.from({ length: N * N }, () => ({ mine: false, open: false, flag: false, n: 0 }));
        let placed = 0;
        while (placed < M) {
          const i = (Math.random() * N * N) | 0;
          if (!cells[i].mine) { cells[i].mine = true; placed++; }
        }
        cells.forEach((c, i) => {
          const r = (i / N) | 0, cc = i % N;
          let n = 0;
          for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr, c2 = cc + dc;
            if (rr >= 0 && rr < N && c2 >= 0 && c2 < N && cells[rr * N + c2].mine) n++;
          }
          c.n = n;
        });
        grid.style.gridTemplateColumns = `repeat(${N},28px)`;
        draw();
      }
      function draw() {
        grid.innerHTML = cells.map((c, i) => {
          if (!c.open) return `<button class="mcell${c.flag ? ' flag' : ''}" data-i="${i}">${c.flag ? '⚑' : ''}</button>`;
          if (c.mine) return `<button class="mcell open boom" data-i="${i}">✳</button>`;
          return `<button class="mcell open" data-i="${i}">${c.n || ''}</button>`;
        }).join('');
        $('.mn', body).textContent = M - flags;
      }
      function open(i) {
        const c = cells[i];
        if (c.open || c.flag || dead) return;
        c.open = true;
        if (c.mine) { dead = true; clearInterval(t); cells.forEach(x => x.mine && (x.open = true)); draw(); return; }
        opened++;
        if (c.n === 0) {
          const r = (i / N) | 0, cc = i % N;
          for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr, c2 = cc + dc;
            if (rr >= 0 && rr < N && c2 >= 0 && c2 < N) open(rr * N + c2);
          }
        }
        if (opened === N * N - M) { dead = true; clearInterval(t); }
        draw();
      }
      grid.addEventListener('click', e => {
        const b = e.target.closest('.mcell'); if (!b) return;
        if (!started) { started = true; t = setInterval(() => { sec++; $('.tm', body).textContent = sec; }, 1000); }
        open(+b.dataset.i);
      });
      grid.addEventListener('contextmenu', e => {
        e.preventDefault();
        const b = e.target.closest('.mcell'); if (!b) return;
        const c = cells[+b.dataset.i];
        if (c.open) return;
        c.flag = !c.flag; flags += c.flag ? 1 : -1; draw();
      });
      $('[data-act="reset"]', body).onclick = reset;
      reset();
    }
  });
})();
