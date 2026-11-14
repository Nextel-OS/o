/**
 * Ядро — Boot Loader
 * Пошаговая загрузка модулей с индикатором прогресса.
 */
(function () {
  'use strict';

  const MODULES = [
    // Ядро
    ['js/core.js',                    'Ядро: состояние и сервисы',   6],
    // UI
    ['js/ui/windows.js',              'Оконный менеджер',            8],
    ['js/ui/contextmenu.js',          'Контекстное меню',            4],
    ['js/ui/desktop.js',              'Рабочий стол',                7],
    ['js/ui/taskbar.js',              'Панель задач',                6],
    ['js/ui/startmenu.js',            'Меню «Пуск»',                 5],
    ['js/ui/notifications-ui.js',     'Центр уведомлений',           5],
    ['js/ui/overlays.js',             'Оверлеи: поиск, настройки, лок-скрин', 8],
    // Ядро приложений
    ['js/apps/registry.js',           'Реестр приложений',           4],
    ['js/apps/calculator.js',         'Калькулятор',                 3],
    ['js/apps/weather.js',            'Погода',                      3],
    ['js/apps/market.js',             'NMarket',                     3],
    ['js/apps/files.js',              'Файловый менеджер',           3],
    ['js/apps/device.js',             'Устройство',                  4],
    ['js/apps/wart.js',               'Wart',                        3],
    ['js/apps/terminal.js',           'Терминал',                    3],
    ['js/apps/mail.js',               'Почта',                       3],
    ['js/apps/notes.js',              'Заметки',                     2],
    ['js/apps/todo.js',               'Задачи',                      2],
    ['js/apps/trash.js',              'Корзина',                     2],
    // Игры
    ['js/games/registry.js',          'Реестр игр',                  3],
    ['js/games/snake.js',             'Змейка',                      2],
    ['js/games/g2048.js',             '2048',                        2],
    ['js/games/mines.js',             'Сапёр',                       2],
    ['js/games/tetris.js',            'Тетрис',                      3],
  ];

  let loaded = 0;
  const totalWeight = MODULES.reduce((s, m) => s + m[2], 0);
  const bar = document.getElementById('boot-bar');
  const stage = document.getElementById('boot-stage');

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => { console.warn('[NX Boot] не удалось:', src); resolve(); };
      document.body.appendChild(s);
    });
  }

  async function boot() {
    for (const [path, label, weight] of MODULES) {
      stage.textContent = label + '…';
      await loadScript(path);
      loaded += weight;
      const pct = Math.min(100, Math.round((loaded / totalWeight) * 100));
      if (bar) bar.style.width = pct + '%';
      await new Promise(r => setTimeout(r, 40));
    }
    stage.textContent = 'Готово';
    if (bar) bar.style.width = '100%';
    await new Promise(r => setTimeout(r, 320));

    // Применяем тему и стартуем оболочку
    if (window.NX && NX.applyTheme) NX.applyTheme();
    if (window.NX && NX.startShell) NX.startShell();

    const boot = document.getElementById('boot');
    if (boot) {
      boot.style.opacity = '0';
      boot.style.pointerEvents = 'none';
      setTimeout(() => boot.remove(), 700);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
