/**
 * Приложение — Устройство (настройки)
 */
(function () {
  'use strict';
  const { $, $$, icons, esc } = NX;

  const SECTIONS = [
    { id: 'system', name: 'Система', icon: 'info' },
    { id: 'personal', name: 'Персонализация', icon: 'paint' },
    { id: 'display', name: 'Дисплей', icon: 'display' },
    { id: 'sound', name: 'Звук', icon: 'volume' },
    { id: 'network', name: 'Сеть и интернет', icon: 'wifi' },
    { id: 'storage', name: 'Хранилище', icon: 'storage' },
    { id: 'apps', name: 'Приложения', icon: 'apps' },
    { id: 'time', name: 'Дата и время', icon: 'clock' },
    { id: 'update', name: 'Обновление', icon: 'refresh' },
  ];

  NX.registerApp({
    id: 'device', name: 'Устройство', icon: NX.icons.device, color: '#6e6e73',
    type: 'Система', w: 820, h: 600, single: true,
    render(body, ctx) {
      let section = ctx.args.section || 'system';
      body.innerHTML = `
        <div class="st">
          <div class="st-head">
            <div class="dev">${icons.device}</div>
            <div>
              <div class="t1">Nextel Book 14</div>
              <div class="t2">Nextel OS 1.0.0 · сборка 2026.11.14 · ядро 1.0.0</div>
            </div>
          </div>
          <div class="st-body">
            <div class="st-side">
              ${SECTIONS.map(s => `<div class="st-nav${s.id === section ? ' on' : ''}" data-s="${s.id}">${icons[s.icon] || icons.info}<span>${s.name}</span></div>`).join('')}
            </div>
            <div class="st-pane"></div>
          </div>
        </div>`;

      const pane = $('.st-pane', body);

      function row(k, v) { return `<div class="row"><span>${k}</span><span>${v}</span></div>`; }

      function draw() {
        $$('.st-nav', body).forEach(n => n.classList.toggle('on', n.dataset.s === section));
        const P = pane; P.scrollTop = 0;

        if (section === 'system') {
          P.innerHTML = `
            <h3>Система</h3>
            <div class="card">
              ${row('Операционная система', 'Nextel OS 1.0.0')}
              ${row('Сборка', '2026.11.14 · stable')}
              ${row('Ядро', 'Nextel Kernel 1.0.0 (x86_64)')}
              ${row('Оболочка', 'Nextel Shell 1.0.0')}
              ${row('Оконный менеджер', 'Nextel Compositor 1.0.0')}
              ${row('Процессор', 'Nextel N1 · 8 ядер · 3.2 ГГц')}
              ${row('Оперативная память', '16 ГБ LPDDR5')}
              ${row('Накопитель', '512 ГБ SSD NVMe')}
              ${row('Графика', 'Nextel Graphics 620 · 2 ГБ')}
              ${row('Серийный номер', 'NX14B-2026-00841')}
            </div>
            <h4>Компоненты</h4>
            <div class="card">
              ${row('Kernel', '1.0.0')}
              ${row('Shell', '1.0.0')}
              ${row('Compositor', '1.0.0')}
              ${row('FS Driver', '1.2.0')}
              ${row('Security Core', '365 AV 4.0')}
              ${row('Package Manager', '1.0.2')}
            </div>`;
        }

        if (section === 'personal') {
          const walls = NX.state.dark ? NX.walls.dark : NX.walls.light;
          P.innerHTML = `
            <h3>Персонализация</h3>
            <h4>Фон рабочего стола</h4>
            <div class="tiles">
              ${walls.map((w, i) => `<div class="wall-tile${NX.state.wallpaper === i ? ' on' : ''}" data-wall="${i}" style="background:${w}"></div>`).join('')}
            </div>
            <h4>Акцентный цвет</h4>
            <div class="swatches">
              ${NX.ACCENTS.map(c => `<div class="sw${NX.state.accent === c ? ' on' : ''}" data-accent="${c}" style="background:${c}"></div>`).join('')}
            </div>
            <h4>Тема</h4>
            <div class="card">
              <div class="row"><span>Тёмная тема</span>
                <div class="switch${NX.state.dark ? ' on' : ''}" data-toggle="dark"></div></div>
              <div class="row"><span>Размер значков</span>
                <select class="input" data-iconsize>
                  <option value="small"${NX.state.iconSize === 'small' ? ' selected' : ''}>Мелкие</option>
                  <option value="normal"${NX.state.iconSize === 'normal' ? ' selected' : ''}>Обычные</option>
                  <option value="large"${NX.state.iconSize === 'large' ? ' selected' : ''}>Крупные</option>
                </select></div>
            </div>`;
        }

        if (section === 'display') {
          P.innerHTML = `
            <h3>Дисплей</h3>
            <div class="card">
              ${row('Разрешение', innerWidth + ' × ' + innerHeight)}
              ${row('Частота обновления', '120 Гц')}
              ${row('Масштаб', '125%')}
              ${row('Яркость', `<input type="range" class="rng" min="10" max="100" value="${NX.state.brightness}" data-slider="brightness">`)}
              ${row('Ночной режим', `<div class="switch${NX.state.nightlight ? ' on' : ''}" data-toggle="nightlight"></div>`)}
            </div>`;
        }

        if (section === 'sound') {
          P.innerHTML = `
            <h3>Звук</h3>
            <div class="card">
              ${row('Устройство вывода', 'Динамики Nextel Book 14')}
              ${row('Громкость', `<input type="range" class="rng" min="0" max="100" value="${NX.state.volume}" data-slider="volume">`)}
              ${row('Звуки системы', `<div class="switch${NX.sound.enabled ? ' on' : ''}" data-toggle="sound"></div>`)}
            </div>`;
        }

        if (section === 'network') {
          P.innerHTML = `
            <h3>Сеть и интернет</h3>
            <div class="card">
              ${row('Wi-Fi', `<div class="switch${NX.state.wifi ? ' on' : ''}" data-toggle="wifi"></div>`)}
              ${row('Сеть', 'Nextel_Home_5G')}
              ${row('IP-адрес', '192.168.1.42')}
              ${row('Bluetooth', `<div class="switch${NX.state.bluetooth ? ' on' : ''}" data-toggle="bluetooth"></div>`)}
            </div>`;
        }

        if (section === 'storage') {
          const used = 128 + NX.fs.count() * 2;
          P.innerHTML = `
            <h3>Хранилище</h3>
            <div class="card">
              ${row('Накопитель', 'Nextel SSD 512 ГБ')}
              ${row('Занято', used + ' ГБ из 512 ГБ')}
              ${row('Свободно', (512 - used) + ' ГБ')}
              ${row('Объектов в ФС', NX.fs.count())}
              ${row('Объектов в корзине', NX.state.trash.length)}
            </div>`;
        }

        if (section === 'apps') {
          const list = NX.installedApps();
          P.innerHTML = `
            <h3>Приложения</h3>
            <div class="card">
              ${list.map(a => `<div class="row"><span style="display:flex;align-items:center;gap:8px;color:var(--text)">
                <span style="color:${a.color};display:inline-flex;width:16px">${a.icon}</span>${esc(a.name)}</span>
                <span style="color:var(--muted);font-weight:400">установлено</span></div>`).join('')}
            </div>`;
        }

        if (section === 'time') {
          const d = new Date();
          P.innerHTML = `
            <h3>Дата и время</h3>
            <div class="card">
              ${row('Часовой пояс', 'UTC+03:00 · Москва')}
              ${row('Текущее время', NX.pad(d.getHours()) + ':' + NX.pad(d.getMinutes()) + ':' + NX.pad(d.getSeconds()))}
              ${row('Текущая дата', `${d.getDate()} ${NX.MONTHS[d.getMonth()]} ${d.getFullYear()}`)}
              ${row('24-часовой формат', '<div class="switch on" data-toggle="noop"></div>')}
            </div>`;
        }

        if (section === 'update') {
          P.innerHTML = `
            <h3>Обновление системы</h3>
            <div class="card">
              ${row('Установленная версия', 'Nextel OS 1.0.0')}
              ${row('Сборка', '2026.11.14')}
              ${row('Канал обновлений', 'Стабильный')}
            </div>
            <div style="margin-top:16px;display:flex;gap:8px;align-items:center">
              <button class="btn primary" data-upd>Проверить обновления</button>
              <span class="updres" style="font-size:12px;color:var(--muted)"></span>
            </div>`;
        }
      }

      body.addEventListener('click', e => {
        const nav = e.target.closest('[data-s]');
        if (nav) { section = nav.dataset.s; draw(); return; }

        const w = e.target.closest('[data-wall]');
        if (w) { NX.state.wallpaper = +w.dataset.wall; NX.applyTheme(); NX.persistPrefs(); draw(); return; }

        const a = e.target.closest('[data-accent]');
        if (a) { NX.state.accent = a.dataset.accent; NX.applyTheme(); NX.persistPrefs(); draw(); return; }

        const t = e.target.closest('[data-toggle]');
        if (t) {
          const k = t.dataset.toggle;
          if (k === 'dark') { NX.state.dark = !NX.state.dark; NX.applyTheme(); NX.persistPrefs(); }
          else if (k === 'nightlight') { NX.state.nightlight = !NX.state.nightlight; }
          else if (k === 'wifi') { NX.state.wifi = !NX.state.wifi; }
          else if (k === 'bluetooth') { NX.state.bluetooth = !NX.state.bluetooth; }
          else if (k === 'sound') { NX.sound.enabled = !NX.sound.enabled; NX.prefs.set('sound_enabled', NX.sound.enabled); }
          else return;
          draw();
        }

        if (e.target.closest('[data-upd]')) {
          const res = $('.updres', pane);
          res.textContent = 'Проверка…';
          setTimeout(() => res.textContent = 'Установлена последняя версия', 1300);
        }
      });

      body.addEventListener('change', e => {
        if (e.target.matches('[data-iconsize]')) { NX.state.iconSize = e.target.value; NX.renderDesktop(); NX.persistPrefs(); }
      });
      body.addEventListener('input', e => {
        if (e.target.matches('[data-slider]')) {
          const k = e.target.dataset.slider;
          NX.state[k] = +e.target.value;
          if (k === 'brightness') {
            $('#desktop').style.filter = `brightness(${0.5 + (+e.target.value / 100) * 0.7})`;
          }
        }
      });
      draw();
    }
  });
})();
