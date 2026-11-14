/**
 * Приложение — Корзина
 */
(function () {
  'use strict';
  const { $, $$, icons, esc } = NX;

  NX.registerApp({
    id: 'trash', name: 'Корзина', icon: NX.icons.trash, color: '#8e8e93',
    type: 'Система', w: 620, h: 440, single: true,
    render(body) {
      body.innerHTML = `
        <div class="toolbar">
          <button class="btn ghost" data-act="restore">${icons.back} Восстановить</button>
          <button class="btn ghost" data-act="empty">${icons.trash} Очистить</button>
          <div style="flex:1"></div>
          <span style="font-size:11.5px;color:var(--muted)" class="cnt"></span>
        </div>
        <div class="scroll"><div class="fm-grid"></div></div>`;
      const grid = $('.fm-grid', body);
      let sel = null;

      function render() {
        $('.cnt', body).textContent = `Объектов: ${NX.state.trash.length}`;
        grid.innerHTML = NX.state.trash.length
          ? NX.state.trash.map((t, i) => `<div class="fm-item" data-i="${i}">
              <span style="color:#8e8e93">${t.children ? icons.folder : icons.fileTxt}</span>
              <span>${esc(t.name)}</span></div>`).join('')
          : `<div class="empty" style="grid-column:1/-1">${icons.trash}<div>Корзина пуста</div></div>`;
        $$('.fm-item', grid).forEach(el => el.onclick = () => {
          $$('.fm-item', grid).forEach(x => x.classList.remove('sel'));
          el.classList.add('sel'); sel = +el.dataset.i;
        });
      }
      body.addEventListener('click', e => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        if (b.dataset.act === 'empty') {
          if (NX.state.trash.length && confirm('Удалить все объекты безвозвратно?')) { NX.state.trash = []; render(); NX.persistPrefs(); }
        }
        if (b.dataset.act === 'restore' && sel !== null) {
          const it = NX.state.trash.splice(sel, 1)[0];
          if (it) NX.fs.add(it.srcPath || 'Документы', it);
          sel = null; render(); NX.persistPrefs();
        }
      });
      render();
    }
  });
})();
