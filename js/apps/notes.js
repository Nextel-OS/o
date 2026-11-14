/**
 * Приложение — Заметки
 */
(function () {
  'use strict';
  const { $, icons } = NX;

  NX.registerApp({
    id: 'notes', name: 'Заметки', icon: NX.icons.notes, color: '#e8c65a',
    type: 'Программа', w: 480, h: 420,
    render(body) {
      body.innerHTML = `<div class="notes-app">
        <div class="toolbar">
          <span style="font-size:12px;color:var(--muted)">Заметка · автосохранение</span>
          <div style="flex:1"></div>
          <button class="btn ghost" data-act="clear">${icons.x} Очистить</button>
        </div>
        <textarea spellcheck="false" placeholder="Введите текст заметки…"></textarea>
      </div>`;
      const ta = $('textarea', body);
      ta.value = NX.prefs.get('note', '');
      ta.addEventListener('input', () => NX.prefs.set('note', ta.value));
      $('[data-act="clear"]', body).onclick = () => { ta.value = ''; NX.prefs.set('note', ''); };
      setTimeout(() => ta.focus(), 60);
    }
  });
})();
