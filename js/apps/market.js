/**
 * Приложение — NMarket
 */
(function () {
  'use strict';
  const { $, $$, esc } = NX;

  NX.registerApp({
    id: 'market', name: 'NMarket', icon: NX.icons.market, color: '#0a84ff',
    type: 'Система', w: 820, h: 600, single: true,
    render(body) {
      let cat = 'Все', q = '';
      body.innerHTML = `
        <div class="mk">
          <div class="mk-head">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px">
              <div><h2>NMarket</h2><p>Магазин приложений Nextel OS · ${NX.marketCatalog.length} приложений</p></div>
              <input class="input mk-search" placeholder="Поиск" style="width:200px">
            </div>
          </div>
          <div class="mk-chips">
            ${['Все','Игры','Программы','Утилиты'].map(c => `<button class="chip${c === cat ? ' on' : ''}" data-cat="${c}">${c}</button>`).join('')}
          </div>
          <div class="scroll"><div class="mk-grid"></div></div>
        </div>`;
      const grid = $('.mk-grid', body);

      function render() {
        const list = NX.marketCatalog.filter(a =>
          (cat === 'Все' || a.cat === cat) &&
          (!q || a.name.toLowerCase().includes(q.toLowerCase())));
        grid.innerHTML = list.map(a => {
          const app = NX.apps[a.id];
          const inst = NX.isInstalled(a.id);
          const color = app ? app.color : '#888';
          const icon = app ? app.icon : NX.icons.info;
          const desc = NX.descriptions && NX.descriptions[a.id] || '';
          return `<div class="mk-card" data-id="${a.id}">
            <div class="row">
              <div class="ic" style="background:${color}1f;color:${color}">${icon}</div>
              <div style="min-width:0">
                <div class="nm">${esc(a.name)}</div>
                <div class="meta">${a.cat} · ★ ${a.rating.toFixed(1)} · ${a.size}</div>
              </div>
            </div>
            <div class="desc">${esc(desc || 'Приложение для Nextel OS')}</div>
            <div class="pbar" style="display:none"><i></i></div>
            <div class="act">
              <button class="btn ${inst ? '' : 'primary'}" data-b="${a.id}">${inst ? 'Открыть' : 'Установить'}</button>
              ${inst && !['calculator','weather','market','files','device','wart','terminal','trash'].includes(a.id) ? '<button class="btn ghost" data-del="' + a.id + '">Удалить</button>' : ''}
            </div>
          </div>`;
        }).join('') || `<div class="empty" style="grid-column:1/-1">${NX.icons.search}<div>Ничего не найдено</div></div>`;
      }

      grid.addEventListener('click', e => {
        const openBtn = e.target.closest('[data-b]');
        if (openBtn) {
          const id = openBtn.dataset.b;
          if (NX.isInstalled(id)) { NX.openApp(id); return; }
          // install с прогрессом
          const card = openBtn.closest('.mk-card');
          const bar = $('.pbar', card), fill = $('.pbar i', card);
          bar.style.display = 'block'; openBtn.disabled = true; openBtn.textContent = 'Установка…';
          let p = 0;
          const t = setInterval(() => {
            p += 8 + Math.random() * 14;
            fill.style.width = Math.min(100, p) + '%';
            if (p >= 100) {
              clearInterval(t);
              NX.installApp(id);
              render();
            }
          }, 130);
        }
        const delBtn = e.target.closest('[data-del]');
        if (delBtn) {
          if (confirm('Удалить ' + delBtn.dataset.del + '?')) { NX.uninstallApp(delBtn.dataset.del); render(); }
        }
      });
      body.addEventListener('click', e => {
        const c = e.target.closest('[data-cat]');
        if (c) { cat = c.dataset.cat; $$('.chip', body).forEach(x => x.classList.toggle('on', x === c)); render(); }
      });
      $('.mk-search', body).addEventListener('input', e => { q = e.target.value; render(); });
      render();
    }
  });
})();
