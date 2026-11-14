/**
 * Приложение — Почта
 */
(function () {
  'use strict';
  const { $, icons, esc } = NX;

  const INBOX = [
    { from: 'Nextel Team', subj: 'Добро пожаловать в Nextel OS', prev: 'Спасибо, что выбрали нашу систему…', body: 'Здравствуйте!\n\nСпасибо, что выбрали Nextel OS 1.0.0.\n\nМы постарались сделать систему максимально минималистичной и удобной. Надеемся, вам понравится.\n\nС уважением, команда Nextel.', unread: true, time: '10:24' },
    { from: 'NMarket', subj: 'Новые приложения в каталоге', prev: 'Мы добавили 15 новых приложений…', body: 'В NMarket появились новые приложения и игры.\n\nЗагляните в магазин, чтобы увидеть полный список.\n\n— NMarket', unread: true, time: '09:11' },
    { from: '365 Antivirus', subj: 'Еженедельный отчёт', prev: 'За последние 7 дней проверено 184 файла…', body: 'За последние 7 дней:\n— Проверено файлов: 184\n— Найдено угроз: 0\n— Обновлений базы: 2\n\nУстройство защищено.', unread: false, time: 'Вчера' },
    { from: 'Nextel Support', subj: 'Обновление системы', prev: 'Доступна новая версия 1.0.0…', body: 'Доступна новая версия Nextel OS 1.0.0.\n\nУстановить можно через Устройство → Обновление.', unread: false, time: 'Вчера' },
  ];

  NX.registerApp({
    id: 'mail', name: 'Почта', icon: NX.icons.mail, color: '#0a84ff',
    type: 'Программа', w: 720, h: 540,
    render(body) {
      let current = null;
      body.innerHTML = `
        <div class="mail">
          <div class="mail-side">
            <div class="fm-nav on">${icons.mail}<span>Входящие</span></div>
            <div class="fm-nav">${icons.save || icons.fileTxt}<span>Черновики</span></div>
            <div class="fm-nav">${icons.download}<span>Отправленные</span></div>
            <div class="fm-nav">${icons.trash}<span>Корзина</span></div>
          </div>
          <div class="mail-list"></div>
          <div class="mail-read" style="display:none"></div>
        </div>`;
      const list = $('.mail-list', body);
      const read = $('.mail-read', body);
      const side = $('.mail-side', body);

      function renderList() {
        list.innerHTML = INBOX.map((m, i) => `
          <div class="mail-item${m.unread ? ' unread' : ''}" data-i="${i}">
            <div class="from">${esc(m.from)}</div>
            <div class="subj">${esc(m.subj)}</div>
            <div class="prev">${esc(m.prev)}</div>
          </div>`).join('');
      }
      function showRead(i) {
        const m = INBOX[i];
        m.unread = false;
        current = i;
        list.style.display = 'none';
        read.style.display = 'block';
        read.innerHTML = `
          <button class="btn ghost" data-back style="margin-bottom:14px">${icons.back} Назад</button>
          <h2>${esc(m.subj)}</h2>
          <div class="meta">${esc(m.from)} · ${esc(m.time)}</div>
          <div class="body">${esc(m.body)}</div>`;
        read.querySelector('[data-back]').onclick = () => {
          read.style.display = 'none';
          list.style.display = 'flex';
          renderList();
        };
      }
      list.addEventListener('click', e => {
        const it = e.target.closest('.mail-item'); if (!it) return;
        showRead(+it.dataset.i);
      });
      renderList();
    }
  });
})();
