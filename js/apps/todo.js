/**
 * Приложение — Задачи
 */
(function () {
  'use strict';
  const { $, icons, esc } = NX;

  NX.registerApp({
    id: 'todo', name: 'Задачи', icon: NX.icons.todo, color: '#ff9f0a',
    type: 'Программа', w: 420, h: 460,
    render(body) {
      body.innerHTML = `<div class="todo">
        <div class="todo-add">
          <input class="input" placeholder="Новая задача…" style="flex:1">
          <button class="btn primary" data-act="add">${icons.plus}</button>
        </div>
        <div class="todo-list"></div>
        <div style="border-top:1px solid var(--border);padding:6px 12px;font-size:11px;color:var(--muted)" class="cnt"></div>
      </div>`;
      let items = NX.prefs.get('todo_items', []);
      const list = $('.todo-list', body), inp = $('.input', body);
      const save = () => NX.prefs.set('todo_items', items);

      function draw() {
        list.innerHTML = items.length ? items.map((it, i) => `
          <div class="todo-item${it.done ? ' done' : ''}">
            <input type="checkbox" data-i="${i}"${it.done ? ' checked' : ''}>
            <span>${esc(it.text)}</span>
            <button class="del" data-del="${i}">${icons.x}</button>
          </div>`).join('')
          : `<div class="empty" style="height:120px">${icons.todo}<div>Задач пока нет</div></div>`;
        $('.cnt', body).textContent = `Всего: ${items.length} · выполнено: ${items.filter(i => i.done).length}`;
      }
      function add() {
        const v = inp.value.trim();
        if (!v) return;
        items.push({ text: v, done: false });
        inp.value = ''; save(); draw();
      }
      $('[data-act="add"]', body).onclick = add;
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
      list.addEventListener('click', e => {
        const cb = e.target.closest('input[type=checkbox]');
        if (cb) { items[+cb.dataset.i].done = cb.checked; save(); draw(); return; }
        const d = e.target.closest('[data-del]');
        if (d) { items.splice(+d.dataset.del, 1); save(); draw(); }
      });
      draw();
    }
  });
})();
