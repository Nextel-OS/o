/**
 * Приложение — Калькулятор
 */
(function () {
  'use strict';
  const { $, icons } = NX;

  NX.registerApp({
    id: 'calculator', name: 'Калькулятор', icon: icons.calc, color: '#5e5ce6',
    type: 'Утилита', w: 320, h: 460, single: true,
    render(body) {
      body.innerHTML = `
        <div class="calc">
          <div class="calc-out"><div class="calc-prev"></div><div class="calc-cur">0</div></div>
          <div class="calc-keys">
            <button data-k="C">C</button><button data-k="±">±</button><button data-k="%" >%</button><button data-k="/" class="op">÷</button>
            <button data-k="7">7</button><button data-k="8">8</button><button data-k="9">9</button><button data-k="*" class="op">×</button>
            <button data-k="4">4</button><button data-k="5">5</button><button data-k="6">6</button><button data-k="-" class="op">−</button>
            <button data-k="1">1</button><button data-k="2">2</button><button data-k="3">3</button><button data-k="+" class="op">+</button>
            <button data-k="0" style="grid-column:span 2">0</button><button data-k=",">,</button><button data-k="=" class="eq">=</button>
          </div>
        </div>`;
      let cur = '0', prev = null, op = null, fresh = false;
      const curEl = $('.calc-cur', body), prevEl = $('.calc-prev', body);
      const show = () => {
        curEl.textContent = cur.length > 12 ? Number(cur).toPrecision(9) : cur;
        prevEl.textContent = prev !== null ? `${prev} ${op === '*' ? '×' : op === '/' ? '÷' : op}` : '';
      };
      const calc = (a, b, o) => o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : o === '/' ? (b === 0 ? NaN : a / b) : b;
      body.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        const k = b.dataset.k;
        if (k === 'C') { cur = '0'; prev = null; op = null; fresh = false; }
        else if (k === '±') cur = String(-parseFloat(cur) || 0);
        else if (k === '%') cur = String(parseFloat(cur) / 100);
        else if ('0123456789'.includes(k)) { if (fresh) { cur = k; fresh = false; } else cur = cur === '0' ? k : cur + k; }
        else if (k === ',') { if (!cur.includes('.')) cur += '.'; }
        else if ('+-*/'.includes(k)) {
          if (prev !== null && op && !fresh) { prev = calc(prev, parseFloat(cur), op); cur = String(prev); }
          else prev = parseFloat(cur);
          op = k; fresh = true;
        }
        else if (k === '=') { if (prev !== null && op) { cur = String(calc(prev, parseFloat(cur), op)); prev = null; op = null; } fresh = true; }
        show();
      });
      show();
    }
  });
})();
