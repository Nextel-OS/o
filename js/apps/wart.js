/**
 * Приложение — Wart
 */
(function () {
  'use strict';
  const { $, $$, icons, esc } = NX;

  NX.registerApp({
    id: 'wart', name: 'Wart', icon: NX.icons.wart, color: '#4a6fa5',
    type: 'Программа', w: 720, h: 560,
    render(body, ctx) {
      body.innerHTML = `
        <div class="wart">
          <div class="wart-tb">
            <button class="tbtn" data-cmd="bold"><b>Ж</b></button>
            <button class="tbtn" data-cmd="italic"><i>К</i></button>
            <button class="tbtn" data-cmd="underline"><u>Ч</u></button>
            <button class="tbtn" data-cmd="strikeThrough"><s>З</s></button>
            <div class="sep"></div>
            <button class="tbtn" data-block="h1" style="font-weight:700;font-size:12px">H1</button>
            <button class="tbtn" data-block="h2" style="font-weight:700;font-size:12px">H2</button>
            <button class="tbtn" data-block="p" style="font-size:11px">Аб</button>
            <div class="sep"></div>
            <button class="tbtn" data-cmd="insertUnorderedList">${icons.list || icons.grid}</button>
            <button class="tbtn" data-cmd="justifyLeft">${icons.back}</button>
            <button class="tbtn" data-cmd="justifyCenter">${icons.grid}</button>
            <div style="flex:1"></div>
            <button class="btn ghost" data-act="save">${icons.save} Сохранить</button>
            <button class="btn ghost" data-act="dl">${icons.download} Скачать</button>
          </div>
          <div class="wart-page" contenteditable="true" spellcheck="false"></div>
          <div class="wart-status"><span class="fname">Без имени.txt</span><span class="cnt">0 символов</span></div>
        </div>`;
      const page = $('.wart-page', body);
      const cnt = $('.cnt', body);
      const fnameEl = $('.fname', body);
      let fname = ctx.args.newFile || 'Без имени.txt';
      fnameEl.textContent = fname;

      const updateCnt = () => {
        cnt.textContent = `${page.innerText.length} символов · ${page.innerText.trim().split(/\s+/).filter(Boolean).length} слов`;
      };
      page.addEventListener('input', updateCnt);
      updateCnt();
      if (ctx.args.content) page.innerHTML = ctx.args.content;
      page.focus();

      $('.wart-tb', body).addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.cmd) { document.execCommand(b.dataset.cmd, false, null); page.focus(); }
        if (b.dataset.block) { document.execCommand('formatBlock', false, '<' + b.dataset.block + '>'); page.focus(); }
        if (b.dataset.act === 'save') {
          const name = prompt('Сохранить как:', fname) || fname;
          NX.fs.remove('Документы', name);
          NX.fs.add('Документы', { name, type: 'file', kind: 'txt', content: page.innerHTML });
          fname = name; fnameEl.textContent = name;
          NX.notifications.add({ title: 'Сохранено', msg: name, icon: 'check', color: '#30b06b' });
        }
        if (b.dataset.act === 'dl') {
          const blob = new Blob([page.innerText], { type: 'text/plain;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = fname.replace(/\.[^.]+$/, '') + '.txt'; a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 3000);
        }
      });
    }
  });
})();
