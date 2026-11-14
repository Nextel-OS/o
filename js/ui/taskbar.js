/**
 * Рабочий стол — Панель задач и часы
 */
(function () {
  'use strict';
  const { $, icons, esc, pad, MONTHS, MONTHS_N, DAYS_SHORT } = NX;

  NX.refreshTaskbar = function () {
    const tasks = $('#tasks');
    if (!tasks) return;
    tasks.innerHTML = '';
    NX.windows.list.forEach(rec => {
      const app = NX.apps[rec.appId];
      const b = document.createElement('button');
      b.className = 'taskitem' + (NX.windows.focused === rec && !rec.minimized ? ' active' : '');
      b.innerHTML = `<span style="color:${app.color}">${app.icon}</span><span class="tt">${esc(app.name)}</span>`;
      b.onclick = () => {
        if (rec.minimized) { NX.restoreWin(rec); NX.focusWin(rec); }
        else if (NX.windows.focused === rec) NX.minimizeWin(rec);
        else NX.focusWin(rec);
      };
      tasks.appendChild(b);
    });
  };

  function tickClock() {
    const d = new Date();
    $('#clk-t').textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
    $('#clk-d').textContent = pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  function renderCalendar() {
    const pop = $('#calendar-pop');
    if (!pop.classList.contains('open')) return;
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const first = new Date(y, m, 1);
    let start = first.getDay() - 1; if (start < 0) start = 6;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();

    let html = `<div class="cal-head"><span>${MONTHS_N[m]} ${y}</span></div>
      <div class="cal-grid">${DAYS_SHORT.map(d => `<div class="cal-dow">${d}</div>`).join('')}`;
    const total = Math.ceil((start + daysInMonth) / 7) * 7;
    for (let i = 0; i < total; i++) {
      let num, mut = false;
      if (i < start) { num = prevDays - start + i + 1; mut = true; }
      else if (i >= start + daysInMonth) { num = i - start - daysInMonth + 1; mut = true; }
      else num = i - start + 1;
      const isToday = !mut && num === now.getDate();
      html += `<div class="cal-d${mut ? ' mut' : ''}${isToday ? ' today' : ''}">${num}</div>`;
    }
    html += `</div>`;
    pop.innerHTML = html;
  }

  NX.initTaskbar = function () {
    $('#startbtn').innerHTML = icons.logo;
    $('#searchbtn').innerHTML = icons.search;
    $('#startbtn').onclick = e => {
      e.stopPropagation();
      const sm = $('#startmenu');
      if (sm.classList.contains('open')) { sm.classList.remove('open'); return; }
      NX.renderStartMenu && NX.renderStartMenu();
      sm.classList.add('open');
      const s = sm.querySelector('.sm-search');
      if (s) setTimeout(() => s.focus(), 60);
    };
    $('#searchbtn').onclick = e => { e.stopPropagation(); NX.openSpotlight && NX.openSpotlight(); };

    $$('.tray-btn').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        const k = b.dataset.tray;
        document.querySelectorAll('#quick-panel, #notif-panel, #calendar-pop').forEach(p => p.classList.remove('open'));
        if (k === 'quick') { NX.renderQuickSettings && NX.renderQuickSettings(); $('#quick-panel').classList.add('open'); }
        if (k === 'notif') { NX.renderNotifPanel && NX.renderNotifPanel(); $('#notif-panel').classList.add('open'); }
      });
    });
    $$('.tray-btn').forEach(b => {
      if (b.dataset.tray === 'quick') b.innerHTML = icons.wifi;
      if (b.dataset.tray === 'notif') b.innerHTML = icons.bell;
    });

    $('#clock').addEventListener('click', e => {
      e.stopPropagation();
      const pop = $('#calendar-pop');
      const isOpen = pop.classList.contains('open');
      document.querySelectorAll('#quick-panel, #notif-panel').forEach(p => p.classList.remove('open'));
      if (isOpen) { pop.classList.remove('open'); return; }
      renderCalendar(); pop.classList.add('open');
    });

    tickClock();
    setInterval(tickClock, 1000);

    setInterval(() => {
      if (NX.state.dark === false && new Date().getHours() >= 19) {
        // авто-тема (можно отключить в настройках)
      }
    }, 60000);
  };

})();
