/**
 * Приложение — Терминал
 */
(function () {
  'use strict';
  const { $, esc } = NX;

  NX.registerApp({
    id: 'terminal', name: 'Терминал', icon: NX.icons.terminal, color: '#4a5568',
    type: 'Утилита', w: 640, h: 420,
    render(body) {
      body.innerHTML = `<div class="term"><div class="out"></div>
        <div class="term-input-wrap"><span class="prompt">user@nextel</span><span style="opacity:.6">:~$</span>
        <input class="term-input" spellcheck="false" autocomplete="off"></div></div>`;
      const out = $('.out', body), inp = $('.term-input', body);
      const print = (txt, cls = '') => {
        out.insertAdjacentHTML('beforeend', `<div class="line ${cls}">${txt}</div>`);
        out.scrollTop = out.scrollHeight;
      };

      print('Nextel Terminal 1.0.0 (Nextel OS 1.0.0)');
      print('Введите <b>help</b> для списка команд.');
      print('');

      const cmds = {
        help: () => {
          print('Команды:');
          ['help — список команд','ls — файловая система','cat <файл> — показать файл',
           'echo <текст>','date','uname','whoami','open <app>','apps',
           'neofetch','theme dark|light','clear'].forEach(l => print('  ' + l));
        },
        ls: () => NX.fs.root.children.forEach(f => print(`  ${f.name}/  (${f.children.length})`)),
        date: () => print(new Date().toLocaleString('ru-RU')),
        uname: () => print('Nextel OS 1.0.0 x86_64 · Kernel 1.0.0 · Shell 1.0.0'),
        whoami: () => print('user (администратор)'),
        apps: () => print(NX.installedApps().map(a => a.name).join(', ')),
        neofetch: () => {
          print(`
<span style="color:#5bd68a">       /\\
      /  \\        user@nextel
     / /\\ \\       ─────────────
    / /  \\ \\      OS: Nextel OS 1.0.0
   / /    \\ \\     Kernel: Nextel Kernel 1.0.0
  / /      \\ \\    Shell: Nextel Shell 1.0.0
 /_/        \\_\\   Uptime: ${Math.floor(performance.now()/1000)}s
                  Apps: ${NX.installedApps().length}
                  Windows: ${NX.windows.list.length}</span>`);
        },
        clear: () => out.innerHTML = ''
      };
      inp.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const line = inp.value.trim();
        inp.value = '';
        print(`<span class="prompt">user@nextel</span>:~$ ${esc(line)}`);
        if (!line) return;
        const [cmd, ...rest] = line.split(/\s+/);
        const arg = rest.join(' ');
        if (cmd === 'echo') return print(esc(arg));
        if (cmd === 'cat') {
          const f = NX.fs.folder('Документы').children.find(x => x.name === arg);
          return print(f ? esc(f.content.replace(/<[^>]+>/g, '')) : 'Файл не найден', f ? '' : 'err');
        }
        if (cmd === 'open') {
          const app = Object.values(NX.apps).find(a => a.id === arg || a.name.toLowerCase() === arg.toLowerCase());
          if (app) { print('Запуск ' + app.name + '…'); NX.openApp(app.id); }
          else print('Приложение не найдено', 'err');
          return;
        }
        if (cmd === 'theme') {
          if (arg === 'dark' || arg === 'light') {
            NX.state.dark = arg === 'dark';
            NX.applyTheme(); NX.persistPrefs();
            print('Тема: ' + arg);
          } else print('Использование: theme dark|light', 'err');
          return;
        }
        if (cmds[cmd]) return cmds[cmd]();
        print(`Команда не найдена: ${esc(cmd)}`, 'err');
      });
      setTimeout(() => inp.focus(), 100);
      body.addEventListener('click', () => inp.focus());
    }
  });
})();
