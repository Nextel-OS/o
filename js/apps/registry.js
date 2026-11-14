/**
 * Приложения — реестр и каталог
 */
(function () {
  'use strict';

  // Каталог для NMarket (все доступные приложения + игры)
  // name = отображаемое, cat = 'Игры' / 'Программы' / 'Утилиты', desc = описание
  NX.marketCatalog = [
    // ---------- Игры ----------
    { id: 'snake',   name: 'Змейка',           cat: 'Игры',     size: '1.2 МБ', rating: 4.6 },
    { id: 'g2048',   name: '2048',              cat: 'Игры',     size: '0.9 МБ', rating: 4.8 },
    { id: 'mines',   name: 'Сапёр',             cat: 'Игры',     size: '0.7 МБ', rating: 4.4 },
    { id: 'ttt',     name: 'Крестики-нолики',   cat: 'Игры',     size: '0.4 МБ', rating: 4.1 },
    { id: 'tetris',  name: 'Тетрис',            cat: 'Игры',     size: '1.1 МБ', rating: 4.7 },
    { id: 'memory',  name: 'Найди пару',        cat: 'Игры',     size: '0.5 МБ', rating: 4.3 },
    { id: 'pong',    name: 'Пинг-понг',         cat: 'Игры',     size: '0.6 МБ', rating: 4.5 },
    { id: 'reaction',name: 'Реакция',           cat: 'Игры',     size: '0.3 МБ', rating: 4.2 },
    { id: 'breakout',name: 'Breakout',          cat: 'Игры',     size: '0.8 МБ', rating: 4.5 },
    { id: 'guess',   name: 'Угадай число',      cat: 'Игры',     size: '0.3 МБ', rating: 4.0 },
    // ---------- Программы ----------
    { id: 'wart',    name: 'Wart',              cat: 'Программы',size: '2.1 МБ', rating: 4.8 },
    { id: 'point',   name: 'Point',             cat: 'Программы',size: '1.8 МБ', rating: 4.6 },
    { id: 'powerpaint', name: 'Power Paint',    cat: 'Программы',size: '2.6 МБ', rating: 4.5 },
    { id: 'browser', name: 'Браузер',           cat: 'Программы',size: '3.2 МБ', rating: 4.4 },
    { id: 'mail',    name: 'Почта',             cat: 'Программы',size: '2.4 МБ', rating: 4.5 },
    { id: 'notes',   name: 'Заметки',           cat: 'Программы',size: '0.8 МБ', rating: 4.7 },
    { id: 'todo',    name: 'Задачи',            cat: 'Программы',size: '0.9 МБ', rating: 4.5 },
    { id: 'music',   name: 'Музыка',            cat: 'Программы',size: '2.4 МБ', rating: 4.3 },
    { id: 'calendar',name: 'Календарь',         cat: 'Программы',size: '1.2 МБ', rating: 4.4 },
    { id: 'contacts',name: 'Контакты',          cat: 'Программы',size: '1.0 МБ', rating: 4.2 },
    // ---------- Утилиты ----------
    { id: 'calculator', name: 'Калькулятор',    cat: 'Утилиты',  size: '0.6 МБ', rating: 4.6 },
    { id: 'weather', name: 'Погода',            cat: 'Утилиты',  size: '1.5 МБ', rating: 4.7 },
    { id: 'files',   name: 'Файловый менеджер', cat: 'Утилиты',  size: '1.4 МБ', rating: 4.5 },
    { id: 'device',  name: 'Устройство',        cat: 'Утилиты',  size: '2.2 МБ', rating: 4.6 },
    { id: 'terminal',name: 'Терминал',          cat: 'Утилиты',  size: '0.7 МБ', rating: 4.6 },
    { id: 'antivirus', name: '365 Antivirus',   cat: 'Утилиты',  size: '3.8 МБ', rating: 4.4 },
    { id: 'converter', name: 'Конвертер',       cat: 'Утилиты',  size: '0.4 МБ', rating: 4.1 },
    { id: 'clock',   name: 'Часы',              cat: 'Утилиты',  size: '0.5 МБ', rating: 4.5 },
    { id: 'gallery', name: 'Галерея',           cat: 'Утилиты',  size: '2.0 МБ', rating: 4.4 },
    { id: 'passwords', name: 'Пароли',          cat: 'Утилиты',  size: '1.3 МБ', rating: 4.3 },
    { id: 'trash',   name: 'Корзина',           cat: 'Утилиты',  size: '0.2 МБ', rating: 4.0 },
  ];

  // Обновление "установлено ли" для карточек
  NX.isInstalled = id => NX.state.installed.has(id);

  // Установка
  NX.installApp = function (id) {
    if (NX.state.installed.has(id)) return false;
    NX.state.installed.add(id);
    NX.renderDesktop();
    NX.persistPrefs();
    NX.notifications.add({
      title: 'Установлено',
      msg: (NX.apps[id] ? NX.apps[id].name : id) + ' добавлено на рабочий стол',
      icon: 'check', color: '#30b06b', app: id
    });
    return true;
  };

  NX.uninstallApp = function (id) {
    if (['calculator','weather','market','files','device','wart','terminal','trash'].includes(id)) {
      NX.notifications.add({ title: 'Нельзя удалить', msg: id + ' — системное приложение', icon: 'info', color: 'var(--danger)' });
      return false;
    }
    NX.state.installed.delete(id);
    NX.renderDesktop();
    NX.persistPrefs();
    return true;
  };
})();
