/**
 * Приложение — Погода (open-meteo.com)
 */
(function () {
  'use strict';
  const { $, svg, esc, pad } = NX;

  const CITIES = {
    'Москва':           [55.75, 37.62],
    'Санкт-Петербург':  [59.94, 30.31],
    'Казань':           [55.79, 49.12],
    'Новосибирск':      [55.03, 82.92],
    'Екатеринбург':     [56.84, 60.61],
    'Сочи':             [43.60, 39.73],
    'Владивосток':      [43.12, 131.89],
    'Калининград':      [54.71, 20.51],
  };

  const WCODE = {
    0: ['Ясно', 'sun'], 1: ['Малооблачно', 'sun'], 2: ['Переменная облачность', 'sun'],
    3: ['Облачно', 'cloud'], 45: ['Туман', 'cloud'], 48: ['Изморозь', 'cloud'],
    51: ['Морось', 'rain'], 53: ['Морось', 'rain'], 55: ['Морось', 'rain'],
    61: ['Дождь', 'rain'], 63: ['Дождь', 'rain'], 65: ['Сильный дождь', 'rain'],
    71: ['Снег', 'snow'], 73: ['Снег', 'snow'], 75: ['Снегопад', 'snow'],
    80: ['Ливень', 'rain'], 81: ['Ливень', 'rain'], 82: ['Ливень', 'rain'],
    95: ['Гроза', 'storm'], 96: ['Гроза', 'storm'], 99: ['Гроза', 'storm'],
  };

  function iconFor(kind) {
    if (kind === 'sun') return svg(`<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19"/>`);
    if (kind === 'rain') return svg(`<path d="M6.5 16h11a3.5 3.5 0 1 0-1-6.9A4.6 4.6 0 0 0 7.6 11 3.2 3.2 0 0 0 6.5 16Z"/><path d="M9 18l-1 2M13 18l-1 2M17 18l-1 2"/>`);
    if (kind === 'snow') return svg(`<path d="M6.5 16h11a3.5 3.5 0 1 0-1-6.9A4.6 4.6 0 0 0 7.6 11 3.2 3.2 0 0 0 6.5 16Z"/><path d="M10 18v2M14 18v2M8.5 19l1.5 1M15.5 19l-1.5 1"/>`);
    if (kind === 'storm') return svg(`<path d="M6.5 15h11a3.5 3.5 0 1 0-1-6.9A4.6 4.6 0 0 0 7.6 10 3.2 3.2 0 0 0 6.5 15Z"/><path d="M12 16l-2 4h4l-2 3"/>`);
    return svg(`<path d="M6.5 18h11a3.5 3.5 0 1 0-1-6.9A4.6 4.6 0 0 0 7.6 13 3.2 3.2 0 0 0 6.5 18Z"/>`);
  }

  NX.registerApp({
    id: 'weather', name: 'Погода', icon: NX.icons.weather, color: '#34aadc',
    type: 'Программа', w: 560, h: 600, single: true,
    render(body) {
      let city = NX.prefs.get('weather_city', 'Москва');
      body.innerHTML = `
        <div class="wt">
          <div class="wt-loading">Загрузка данных…</div>
        </div>`;

      async function load() {
        const [lat, lon] = CITIES[city];
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
        try {
          const res = await fetch(url);
          const d = await res.json();
          render(d);
        } catch (err) {
          body.querySelector('.wt').innerHTML = `<div class="wt-loading">Не удалось загрузить погоду.<br><small>${esc(err.message)}</small></div>`;
        }
      }

      function render(d) {
        const cur = d.current;
        const [condText, kind] = WCODE[cur.weather_code] || ['—', 'cloud'];
        const hours = d.hourly.time.slice(0, 8).map((t, i) => ({
          t: t.slice(11, 16),
          temp: Math.round(d.hourly.temperature_2m[i]),
          code: d.hourly.weather_code[i]
        }));
        const days = d.daily.time.map((t, i) => {
          const date = new Date(t);
          return {
            label: i === 0 ? 'Сегодня' : NX.DAYS_SHORT[(date.getDay() + 6) % 7],
            code: d.daily.weather_code[i],
            lo: Math.round(d.daily.temperature_2m_min[i]),
            hi: Math.round(d.daily.temperature_2m_max[i])
          };
        });

        body.querySelector('.wt').innerHTML = `
          <div class="wt-top">
            <div>
              <div class="wt-city">${esc(city)}</div>
              <div class="wt-temp">${Math.round(cur.temperature_2m)}°</div>
              <div class="wt-cond">${condText} · ощущается как ${Math.round(cur.apparent_temperature)}°</div>
            </div>
            <div style="text-align:right">
              <select class="citysel">${Object.keys(CITIES).map(c => `<option${c === city ? ' selected' : ''}>${c}</option>`).join('')}</select>
              <div class="wt-ico" style="margin:10px 0 0 auto">${iconFor(kind)}</div>
            </div>
          </div>
          <div class="wt-hours">
            ${hours.map(h => {
              const [, k] = WCODE[h.code] || ['', 'cloud'];
              return `<div class="wt-h">${h.t}<b>${h.temp > 0 ? '+' : ''}${h.temp}°</b>${iconFor(k)}</div>`;
            }).join('')}
          </div>
          <div class="wt-days">
            ${days.map(day => {
              const [, k] = WCODE[day.code] || ['', 'cloud'];
              const pct = Math.max(8, Math.min(92, ((day.hi + 20) / 60) * 100));
              return `<div class="wt-d"><span class="dn">${day.label}</span>${iconFor(k)}
                <span class="tv" style="width:34px;text-align:left">${day.lo > 0 ? '+' : ''}${day.lo}°</span>
                <span class="bar"><i style="left:${8 + Math.random() * 20}%;width:${pct * 0.6}%"></i></span>
                <span class="tv">${day.hi > 0 ? '+' : ''}${day.hi}°</span></div>`;
            }).join('')}
          </div>`;
        body.querySelector('.citysel').onchange = e => {
          city = e.target.value;
          NX.prefs.set('weather_city', city);
          load();
        };
      }
      load();
    }
  });
})();
