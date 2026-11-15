/* ============================================================
   NEXTEL OS 2.0 — ИИ-АССИСТЕНТЫ (ASSISTANT.JS) v1.0
   Boris: локальный чат-бот с триграммами
   Alevtina: голосовой ассистент с TTS/STT/Wikipedia
   ============================================================ */

NX.AI_VERSION = '1.0';
console.log('[NX-AI] Loading v' + NX.AI_VERSION);

NX.AI = NX.AI || {};

// ============================================================
// BORIS — локальный чат-бот с триграммами
// ============================================================
NX.AI.boris = {
    // 5 приветствий (выбор ~20% вероятности на каждое)
    greetings: [
        'Привет-привет! Как сам?',
        'Здорово! Рад тебя видеть',
        'Хэй! Что нового?',
        'Привет. Чё делаешь?',
        'О, привет! Давно не виделись'
    ],

    // Ответы на оскорбления
    insultReplies: [
        'Эй, полегче! Я же к тебе по-доброму',
        'Ну зачем так грубо?',
        'Ха, шутник. Продолжай',
        'Ладно-ладно, я не обижаюсь',
        'Слышал и похуже'
    ],

    // Ответы на любезности
    complimentReplies: [
        'Спасибо, приятно!',
        'Ой, да ладно тебе 🙂',
        'Ты тоже ничего!',
        'Рад, что тебе нравится',
        'Спасибо, стараюсь'
    ],

    // 5 шуток
    jokes: [
        'Программист ставит на ночь два стакана: один с водой — если захочет пить, второй пустой — если не захочет.',
        '— Как называется страх перед программированием? — Кодермания.',
        'Муж жене: «Дорогая, ты не видела мои очки?» — «Ты их надел утром». — «А, точно, а то я уже плохо вижу».',
        '— Почему программисты путают Хэллоуин и Рождество? — Потому что Oct 31 == Dec 25.',
        '— Какой язык у программистов самый любимый? — Python, потому что на нём можно «обнимать» змей.'
    ],

    // 20 запасных фраз
    fallbacks: [
        'Хм, интересно. Расскажи подробнее',
        'Понял тебя. А что дальше?',
        'Любопытно... Продолжай',
        'Да, я слушаю',
        'Ничего себе. А почему?',
        'Не уверен, что понял. Уточни?',
        'Ладно, допустим. И что?',
        'Согласен с тобой',
        'А вот это уже интересно',
        'Слушай, а ты сам как думаешь?',
        'Мм, а я бы поспорил',
        'Ха, ну ты даёшь',
        'Серьёзно? Вот это поворот',
        'Не ожидал такого услышать',
        'Круто. А что было дальше?',
        'Давай сменим тему?',
        'Ты сегодня в ударе',
        'Занятно...',
        'Ага, понял',
        'Ну, бывает'
    ],

    // Шаблоны для вопросов о сущности
    questionTemplates: [
        (s) => `Кто же не знает ${s}?`,
        (s) => `${s} — известная личность, да`,
        (s) => `О, ${s}! Это классика`,
        (s) => `${s} — это ты к чему?`,
        (s) => `Ну, ${s} — это серьёзная тема`
    ],

    // Триграммы для детекции
    greetingTrigrams: ['при', 'здр', 'зда', 'хай', 'хел', 'доб', 'прив'],
    insultTrigrams: ['дур', 'туп', 'идю', 'коз', 'осе', 'прид'],
    complimentTrigrams: ['мол', 'умн', 'крут', 'отл', 'хор', 'кла', 'суп'],
    questionMarkers: ['кто так', 'что так', 'кто тако', 'что тако', 'расскажи про', 'расскажи о'],

    countTrigrams(text, trigrams) {
        const t = text.toLowerCase();
        let count = 0;
        trigrams.forEach(tg => { if (t.includes(tg)) count++; });
        return count;
    },

    extractSubject(text) {
        const t = text.toLowerCase();
        for (const marker of this.questionMarkers) {
            if (t.includes(marker)) {
                const idx = t.indexOf(marker) + marker.length;
                const subject = text.slice(idx).trim().replace(/[?.,!]/g, '');
                if (subject.length > 1) return subject;
            }
        }
        return null;
    },

    generateResponse(text) {
        const t = text.toLowerCase().trim();
        if (!t) return this.fallbacks[0];

        // Приветствие
        if (this.countTrigrams(t, this.greetingTrigrams) > 0) {
            if (Math.random() < 0.8) {
                return this.greetings[Math.floor(Math.random() * this.greetings.length)];
            }
            return this.fallbacks[Math.floor(Math.random() * 5)];
        }

        // Оскорбление
        if (this.countTrigrams(t, this.insultTrigrams) > 0) {
            return this.insultReplies[Math.floor(Math.random() * this.insultReplies.length)];
        }

        // Любезность
        if (this.countTrigrams(t, this.complimentTrigrams) > 0) {
            return this.complimentReplies[Math.floor(Math.random() * this.complimentReplies.length)];
        }

        // Шутка
        if (t.includes('шут') || t.includes('анекд') || t.includes('смешн') || t.includes('пошути')) {
            return this.jokes[Math.floor(Math.random() * this.jokes.length)];
        }

        // Вопрос о сущности
        const subject = this.extractSubject(t);
        if (subject) {
            const template = this.questionTemplates[Math.floor(Math.random() * this.questionTemplates.length)];
            return template(subject);
        }

        // Общий вопрос
        if (t.includes('?') || /^(что|как|где|когда|почему|зачем|кто|какой)/.test(t)) {
            return this.fallbacks[Math.floor(Math.random() * this.fallbacks.length)];
        }

        // Fallback
        return this.fallbacks[Math.floor(Math.random() * this.fallbacks.length)];
    }
};

// ============================================================
// ALEVTINA — голосовой ассистент
// ============================================================
NX.AI.alevtina = {
    wakeWord: 'алевтина',
    isListening: false,
    isAwake: false,
    recognition: null,
    synth: null,
    voice: null,
    panelOpen: false,
    messages: [],
    commands: {},

    init() {
        this.synth = window.speechSynthesis;
        this.loadVoice();
        this.initRecognition();
        this.initCommands();
        this.attachGlobalListener();
    },

    initRecognition() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            console.warn('[Alevtina] Speech Recognition не поддерживается');
            return;
        }
        this.recognition = new SR();
        this.recognition.lang = 'ru-RU';
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.onresult = (e) => {
            const last = e.results[e.results.length - 1];
            if (last.isFinal) this.handleSpeech(last[0].transcript);
        };
        this.recognition.onerror = (e) => {
            if (e.error !== 'no-speech' && e.error !== 'aborted') {
                console.warn('[Alevtina] Recognition error:', e.error);
            }
        };
        this.recognition.onend = () => {
            if (this.isListening) {
                try { this.recognition.start(); } catch(e) {}
            }
        };
    },

    initCommands() {
        this.commands = {
            openApp: /открой\s+(.+)/i,
            math: /сколько\s+будет\s+(.+)/i,
            time: /(сколько\s+врем|какой\s+час|который\s+час)/i,
            date: /(какой\s+сегодня\s+день|какое\s+число|какая\s+дата|какой\s+сегодня)/i,
            closeAll: /(закрой\s+все|закрой\s+окна)/i,
            battery: /(батаре|заряд)/i
        };
    },

    loadVoice() {
        const load = () => {
            const voices = this.synth.getVoices();
            const ruVoices = voices.filter(v => v.lang.startsWith('ru'));
            this.voice = ruVoices.find(v => /female|женск|ирина|milena|alena/i.test(v.name))
                     || ruVoices[0]
                     || voices.find(v => v.lang === 'en-US' && /female/i.test(v.name))
                     || voices[0];
            console.log('[Alevtina] Voice:', this.voice ? this.voice.name : 'none');
        };
        if (this.synth.getVoices().length > 0) load();
        else this.synth.onvoiceschanged = load;
    },

    speak(text) {
        if (!this.synth) return;
        this.synth.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'ru-RU';
        if (this.voice) utt.voice = this.voice;
        utt.rate = 1.05;
        utt.pitch = 1.2;
        utt.volume = (NX.state.volume || 80) / 100;
        this.synth.speak(utt);
    },

    startListening() {
        if (!this.recognition) {
            NX.notifications.push('Алевтина', 'Распознавание речи недоступно', 'info');
            return;
        }
        if (this.isListening) return;
        this.isListening = true;
        try { this.recognition.start(); } catch(e) {}
        this.setMicState(true);
    },

    stopListening() {
        this.isListening = false;
        if (this.recognition) { try { this.recognition.stop(); } catch(e) {} }
        this.setMicState(false);
    },

    setMicState(active) {
        const mic = NX.$('#alevtina-mic');
        if (mic) {
            if (active) mic.classList.add('listening');
            else mic.classList.remove('listening');
        }
        // Обновляем заголовок панели
        const status = NX.$('.av-status');
        if (status) {
            status.textContent = this.isAwake ? 'Слушаю команду...' : (this.isListening ? 'Слушаю...' : 'Готова');
        }
    },

    handleSpeech(text) {
        const t = text.toLowerCase().trim();
        console.log('[Alevtina] Услышала:', t);

        if (!this.isAwake) {
            if (t.includes(this.wakeWord)) {
                this.wake();
                const afterWake = t.split(this.wakeWord)[1];
                if (afterWake && afterWake.trim()) {
                    setTimeout(() => this.processCommand(afterWake.trim()), 600);
                }
            }
            return;
        }

        this.processCommand(t);
        this.isAwake = false;
    },

    wake() {
        this.isAwake = true;
        this.setMicState(true);
        NX.audio.playTone(880, 0.15, 'sine', 0.1);
        setTimeout(() => { this.isAwake = false; this.setMicState(this.isListening); }, 5000);
    },

    async processCommand(text) {
        const t = text.toLowerCase().trim();
        if (!t) return;

        // Открыть приложение
        let m = t.match(this.commands.openApp);
        if (m) {
            const appName = m[1].trim();
            const app = Object.values(NX.apps).find(a => 
                a.name.toLowerCase().includes(appName) || a.id === appName
            );
            if (app) {
                NX.openApp(app.id);
                this.reply(`Открываю ${app.name}`);
                return;
            }
            this.reply(`Не нашла приложение "${appName}"`);
            return;
        }

        // Математика
        m = t.match(this.commands.math);
        if (m) {
            try {
                let expr = m[1];
                const replacements = { 'плюс': '+', 'минус': '-', 'умножить на': '*', 'умножить': '*', 'разделить на': '/', 'разделить': '/', 'делить на': '/', 'делить': '/' };
                Object.entries(replacements).forEach(([k, v]) => expr = expr.split(k).join(v));
                expr = expr.replace(/[^0-9+\-*/().\s]/g, '');
                const result = Function('"use strict";return (' + expr + ')')();
                if (typeof result === 'number' && isFinite(result)) {
                    this.reply(`Будет ${result}`);
                    return;
                }
            } catch(e) {}
            this.reply('Не могу посчитать это выражение');
            return;
        }

        // Время
        if (this.commands.time.test(t)) {
            const d = new Date();
            this.reply(`Сейчас ${d.getHours()} часов ${NX.pad(d.getMinutes())} минут`);
            return;
        }

        // Дата
        if (this.commands.date.test(t)) {
            const d = new Date();
            const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
            const days = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
            this.reply(`Сегодня ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`);
            return;
        }

        // Закрыть окна
        if (this.commands.closeAll.test(t)) {
            const count = NX.windows.list.length;
            NX.windows.list.slice().forEach(w => NX.closeWindow(w));
            this.reply(`Закрыла ${count} окон`);
            return;
        }

        // Батарея
        if (this.commands.battery.test(t)) {
            if (NX.battery && NX.battery.supported) {
                this.reply(`Заряд батареи ${NX.battery.level}%${NX.battery.charging ? ', идёт зарядка' : ''}`);
            } else {
                this.reply('Не могу получить информацию о батарее');
            }
            return;
        }

        // Личные вопросы
        if (/как\s+тебя\s+зовут|кто\s+ты|твоё\s+имя/.test(t)) {
            this.reply('Меня зовут Алевтина. Я голосовой ассистент Nextel OS');
            return;
        }
        if (/ты\s+(красив|умн|хорош|классн)/.test(t)) {
            this.reply('Спасибо! Ты тоже очень мил');
            return;
        }
        if (/сколько\s+тебе\s+лет/.test(t)) {
            this.reply('Мне ровно столько, сколько нужно');
            return;
        }
        if (/кто\s+(тебя\s+создал|тебя\s+сделал)/.test(t)) {
            this.reply('Меня создала команда Nextel Corporation');
            return;
        }
        if (/ты\s+робот|ты\s+человек/.test(t)) {
            this.reply('Я — искусственный интеллект, но стараюсь быть полезной');
            return;
        }

        // Иначе — Википедия
        this.reply('Сейчас поищу...', true);
        const wiki = await this.askWikipedia(text);
        if (wiki) this.reply(wiki);
        else this.reply('Не нашла ответ. Попробуй переформулировать');
    },

    async askWikipedia(query) {
        try {
            const res = await fetch(`https://ru.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
            if (!res.ok) return null;
            const data = await res.json();
            if (data.type === 'disambiguation') return null;
            return data.extract ? data.extract.slice(0, 600) : null;
        } catch(e) { return null; }
    },

    reply(text, silent = false) {
        this.messages.push({ self: false, text, time: new Date() });
        this.renderChat();
        if (!silent) this.speak(text);
    },

    userSay(text) {
        this.messages.push({ self: true, text, time: new Date() });
        this.renderChat();
        this.processCommand(text);
    },

    renderChat() {
        const chat = NX.$('#alevtina-chat-messages');
        if (!chat) return;
        chat.innerHTML = this.messages.map(m => `
            <div class="av-msg ${m.self ? 'user' : 'assistant'}">${NX.esc(m.text)}</div>
        `).join('');
        chat.scrollTop = chat.scrollHeight;
    },

    openPanel() {
        this.panelOpen = true;
        const panel = NX.$('#alevtina-panel');
        if (!panel) return;
        panel.classList.add('open');
        panel.style.width = NX.state.alevtinaWidth || '20%';
        this.renderPanel();
        if (this.recognition && !this.isListening) this.startListening();
    },

    closePanel() {
        this.panelOpen = false;
        const panel = NX.$('#alevtina-panel');
        if (panel) panel.classList.remove('open');
        this.stopListening();
    },

    renderPanel() {
        const panel = NX.$('#alevtina-panel');
        if (!panel) return;
        panel.innerHTML = `
            <div class="av-resize" id="alevtina-resize"></div>
            <div class="av-header">
                <div class="av-avatar">А</div>
                <div>
                    <div class="av-name">Алевтина</div>
                    <div class="av-status">${this.isListening ? 'Слушаю...' : 'Готова'}</div>
                </div>
                <button class="av-close" id="alevtina-close" title="Закрыть">${NX.icons.x}</button>
            </div>
            <div class="av-chat" id="alevtina-chat-messages"></div>
            <div class="av-input-row">
                <button class="av-mic-btn ${this.isListening ? 'listening' : ''}" id="alevtina-mic" title="Голос">${NX.icons.mic}</button>
                <input type="text" id="alevtina-input" placeholder="Скажите «Алевтина...»">
                <button class="av-send-btn" id="alevtina-send">→</button>
            </div>
        `;
        NX.$('#alevtina-close', panel).onclick = () => this.closePanel();
        NX.$('#alevtina-send', panel).onclick = () => {
            const inp = NX.$('#alevtina-input', panel);
            if (inp.value.trim()) { this.userSay(inp.value.trim()); inp.value = ''; }
        };
        NX.$('#alevtina-input', panel).onkeydown = (e) => {
            if (e.key === 'Enter') NX.$('#alevtina-send', panel).click();
        };
        NX.$('#alevtina-mic', panel).onclick = () => {
            if (this.isListening) this.stopListening();
            else this.startListening();
        };
        // Изменение размера панели
        const resizer = NX.$('#alevtina-resize', panel);
        if (resizer) {
            resizer.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startW = panel.offsetWidth;
                const onMove = (ev) => {
                    const dx = startX - ev.clientX;
                    const newW = Math.max(280, Math.min(window.innerWidth * 0.6, startW + dx));
                    panel.style.width = newW + 'px';
                    NX.state.alevtinaWidth = newW + 'px';
                };
                const onUp = () => {
                    document.removeEventListener('pointermove', onMove);
                    document.removeEventListener('pointerup', onUp);
                    NX.saveState();
                };
                document.addEventListener('pointermove', onMove);
                document.addEventListener('pointerup', onUp);
            });
        }
        this.renderChat();
    },

    attachGlobalListener() {
        // Кнопка в трее для быстрого вызова
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                if (this.panelOpen) this.closePanel();
                else this.openPanel();
            }
        });
    }
};

// ============================================================
// РЕГИСТРАЦИЯ ПРИЛОЖЕНИЯ АЛЕВТИНА
// ============================================================
function registerAlevtina() {
    if (!NX.registerApp) {
        setTimeout(registerAlevtina, 100);
        return;
    }
    
    NX.registerApp({
        id: 'alevtina',
        name: 'Алевтина',
        icon: NX.icons.assistant,
        color: '#8b5cf6',
        category: 'Ассистенты',
        description: 'Голосовой ассистент с TTS и Wikipedia.',
        w: 400, h: 600, single: true,
        render(body) {
            // Открываем панель вместо окна
            setTimeout(() => {
                NX.AI.alevtina.openPanel();
                // Закрываем окно, если оно открылось
                const win = NX.windows.list.find(w => w.appId === 'alevtina');
                if (win) NX.closeWindow(win);
            }, 50);
            body.innerHTML = '<div style="padding:20px;text-align:center;">Алевтина открывается справа...</div>';
        }
    });
    
    // Добавляем в installed, если ещё нет
    if (!NX.state.installed.includes('alevtina')) {
        NX.state.installed.push('alevtina');
        NX.saveState();
        console.log('[NX-AI] Alevtina добавлена в установленные');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        NX.AI.alevtina.init();
        registerAlevtina();
    });
} else {
    NX.AI.alevtina.init();
    registerAlevtina();
}

console.log('[NX-AI] ✅ Boris & Alevtina готовы');
