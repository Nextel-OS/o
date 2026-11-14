/**
 * Приложение — Файловый менеджер
 */
(function () {
  'use strict';
  const { $, $$, icons, esc } = NX;

  NX.registerApp({
    id: 'files', name: 'Файловый менеджер', icon: NX.icons.files, color: '#f5a623',
    type: 'Программа', w: 760, h: 520, single: true,
    render(body) {
      let path = [];
      body.innerHTML = `
        <div class="toolbar">
          <button class="btn ghost" data-act="up">${icons.up || icons.back}</button>
          <button class="btn ghost" data-act="new">${icons.plus} Папка</button>
          <button class="btn ghost" data-act="del">${icons.trash}</button>
          <div style="flex:1"></div>
          <span style="font-size:11.5px;color:var(--muted)" class="fcount"></span>
        </div>
        <div class="fm">
          <div class="fm-side">
            <h4>Быстрый доступ</h4>
            ${NX.fs.root.children.map(f => `<div class="fm-nav" data-jump="${esc(f.name)}">${icons.folder}<span>${esc(f.name)}</span></div>`).join('')}
            <h4>Система</h4>
            <div class="fm-nav" data-jump="">${icons.device}<span>Этот компьютер</span></div>
          </div>
          <div class="fm-main">
            <div class="fm-path"></div>
            <div class="scroll"><div class="fm-grid"></div></div>
            <div class="fm-status"></div>
          </div>
        </div>`;
      const grid = $('.fm-grid', body);
      const pathEl = $('.fm-path', body);
      const statusEl = $('.fm-status', body);
      const countEl = $('.fcount', body);
      let sel = null;

      const node = () => path.length ? NX.fs.get(path) : NX.fs.root;

      function iconFor(n) {
        if (n.children) return `<span style="color:#f5a623">${icons.folder}</span>`;
        if (n.kind === 'img') return `<span style="color:#5e5ce6">${icons.fileImg}</span>`;
        if (n.kind === 'ppt') return `<span style="color:#ff9f0a">${icons.filePpt}</span>`;
        return `<span style="color:#4a6fa5">${icons.fileTxt}</span>`;
      }

      function render() {
        const n = node();
        pathEl.innerHTML = `<b data-p="">Этот компьютер</b>` +
          path.map((p, i) => ` <span>›</span> <b data-p="${i + 1}">${esc(p)}</b>`).join('');
        $$('b[data-p]', pathEl).forEach(b => b.onclick = () => { path = path.slice(0, +b.dataset.p); render(); });

        const items = (n.children || []).slice().sort((a, b) =>
          (!!b.children - !!a.children) || a.name.localeCompare(b.name, 'ru'));
        grid.innerHTML = items.length
          ? items.map(i => `<div class="fm-item" data-name="${esc(i.name)}">${iconFor(i)}<span>${esc(i.name)}</span></div>`).join('')
          : `<div class="empty" style="grid-column:1/-1">${icons.folder}<div>Папка пуста</div></div>`;
        countEl.textContent = `Элементов: ${items.length}`;
        statusEl.textContent = path.length ? `Путь: ${path.join(' / ')}` : 'Этот компьютер';

        $$('.fm-item', grid).forEach(el => {
          el.onclick = () => {
            $$('.fm-item', grid).forEach(x => x.classList.remove('sel'));
            el.classList.add('sel'); sel = el.dataset.name;
          };
          el.ondblclick = () => {
            const it = items.find(i => i.name === el.dataset.name);
            if (!it) return;
            if (it.children) { path.push(it.name); sel = null; render(); }
            else if (it.kind === 'txt') NX.openApp('wart', { content: it.content, newFile: it.name });
            else if (it.kind === 'ppt') NX.openApp('powerpaint', { content: it.content, newFile: it.name });
          };
        });
      }

      body.addEventListener('click', e => {
        const nav = e.target.closest('[data-jump]');
        if (nav) { const j = nav.dataset.jump; path = j ? [j] : []; render(); }
        const b = e.target.closest('[data-act]'); if (!b) return;
        if (b.dataset.act === 'up') { path.pop(); render(); }
        if (b.dataset.act === 'new') {
          const name = prompt('Имя папки:', 'Новая папка');
          if (name) { node().children.push({ name, children: [] }); render(); }
        }
        if (b.dataset.act === 'del' && sel) {
          const n = node();
          const idx = n.children.findIndex(c => c.name === sel);
          if (idx >= 0) { NX.state.trash.push(n.children[idx]); n.children.splice(idx, 1); sel = null; render(); NX.persistPrefs(); }
        }
      });
      render();
    }
  });
})();
