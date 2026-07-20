/* ============================================================
   BACA — Floating AI Chat Widget
   Inject this into any page to add a floating chat button
   ============================================================ */

(function () {
    // Don't inject on ask.html (it has its own full chat)!!
    if (window.location.pathname.includes('ask.html')) return;

    // Create styles
    const style = document.createElement('style');
    style.textContent = `
        .baca-chat-fab {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #06b6d4, #6366f1);
            border: none;
            cursor: pointer;
            z-index: 9000;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 1.4rem;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
            transition: transform 0.2s, box-shadow 0.2s;
            animation: chatFabPulse 3s ease-in-out infinite;
        }
        .baca-chat-fab:hover {
            transform: scale(1.08);
            box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5);
        }
        .baca-chat-fab i { pointer-events: none; }

        @keyframes chatFabPulse {
            0%, 100% { box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35); }
            50% { box-shadow: 0 8px 32px rgba(16, 185, 129, 0.55); }
        }

        .baca-chat-panel {
            position: fixed;
            bottom: 90px;
            right: 24px;
            width: 380px;
            max-width: calc(100vw - 48px);
            height: 500px;
            max-height: calc(100vh - 140px);
            background: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            z-index: 9001;
            display: none;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            animation: chatPanelSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        body.light-mode .baca-chat-panel {
            background: #fff;
            border-color: rgba(0, 0, 0, 0.08);
        }

        @keyframes chatPanelSlide {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .baca-chat-panel.open { display: flex; }

        .baca-chat-header {
            padding: 0.8rem 1rem;
            background: linear-gradient(135deg, #10b981, #06b6d4);
            color: #fff;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .baca-chat-header .chat-header-icon {
            width: 32px; height: 32px; border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex; align-items: center; justify-content: center;
        }
        .baca-chat-header .chat-title { font-weight: 700; font-size: 0.95rem; flex: 1; }
        .baca-chat-header .chat-close {
            width: 30px; height: 30px; border: none; border-radius: 8px;
            background: rgba(255, 255, 255, 0.2); color: #fff; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
        .baca-chat-header .chat-fullpage {
            width: 30px; height: 30px; border: none; border-radius: 8px;
            background: rgba(255, 255, 255, 0.2); color: #fff; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            text-decoration: none; margin-right: 0.3rem;
        }

        .baca-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.7rem;
        }

        .baca-chat-welcome {
            text-align: center; padding: 1.5rem 1rem;
        }
        .baca-chat-welcome .wa-icon {
            width: 50px; height: 50px; margin: 0 auto 0.8rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #06b6d4);
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 1.3rem;
        }
        .baca-chat-welcome h3 { font-size: 1rem; margin-bottom: 0.3rem; color: inherit; }
        body.light-mode .baca-chat-welcome h3 { color: #0f172a; }
        .baca-chat-welcome p { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.8rem; }
        .baca-chat-suggestions {
            display: flex; flex-wrap: wrap; gap: 0.3rem; justify-content: center;
        }
        .baca-chat-suggestions .chip {
            padding: 0.35rem 0.7rem; border-radius: 50px; font-size: 0.72rem;
            background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);
            color: #10b981; cursor: pointer; transition: all 0.15s;
        }
        .baca-chat-suggestions .chip:hover {
            background: rgba(16, 185, 129, 0.2); border-color: #10b981;
        }

        .baca-chat-msg {
            display: flex; gap: 0.5rem; animation: bacaFadeIn 0.2s ease;
        }
        .baca-chat-msg.user { flex-direction: row-reverse; }
        .baca-chat-msg-avatar {
            width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; font-size: 0.8rem;
        }
        .baca-chat-msg.ai .baca-chat-msg-avatar {
            background: linear-gradient(135deg, #10b981, #06b6d4); color: #fff;
        }
        .baca-chat-msg.user .baca-chat-msg-avatar {
            background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.08);
        }
        body.light-mode .baca-chat-msg.user .baca-chat-msg-avatar {
            background: #f1f5f9; color: #475569;
        }
        .baca-chat-msg-bubble {
            max-width: 75%; padding: 0.6rem 0.9rem; border-radius: 14px;
            font-size: 0.83rem; line-height: 1.5; word-wrap: break-word;
        }
        .baca-chat-msg.ai .baca-chat-msg-bubble {
            background: #1e293b; border: 1px solid rgba(255,255,255,0.06);
            border-top-left-radius: 4px; color: #fff;
        }
        body.light-mode .baca-chat-msg.ai .baca-chat-msg-bubble {
            background: #f8fafc; color: #0f172a; border-color: rgba(0,0,0,0.06);
        }
        .baca-chat-msg.user .baca-chat-msg-bubble {
            background: #10b981; color: #fff; border-top-right-radius: 4px;
        }
        .baca-chat-msg-bubble a { color: #10b981; text-decoration: underline; }
        .baca-chat-msg-bubble code {
            background: rgba(0,0,0,0.2); padding: 0.1rem 0.3rem;
            border-radius: 3px; font-size: 0.78rem;
        }
        .baca-chat-msg-bubble strong { font-weight: 700; }

        @keyframes bacaFadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .baca-chat-typing { display: flex; gap: 3px; padding: 0.3rem 0; }
        .baca-chat-typing span {
            width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;
            animation: bacaBounce 1s infinite;
        }
        .baca-chat-typing span:nth-child(2) { animation-delay: 0.15s; }
        .baca-chat-typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bacaBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
            30% { transform: translateY(-4px); opacity: 1; }
        }

        .baca-chat-input-area {
            padding: 0.6rem; border-top: 1px solid rgba(255,255,255,0.06);
            display: flex; gap: 0.4rem;
        }
        body.light-mode .baca-chat-input-area { border-top-color: rgba(0,0,0,0.06); }
        .baca-chat-input {
            flex: 1; padding: 0.6rem 0.8rem; border-radius: 12px;
            background: #1e293b; border: 1px solid rgba(255,255,255,0.08);
            color: #fff; font-family: inherit; font-size: 0.83rem; outline: none;
        }
        body.light-mode .baca-chat-input {
            background: #f1f5f9; color: #0f172a; border-color: rgba(0,0,0,0.08);
        }
        .baca-chat-input:focus { border-color: #10b981; }
        .baca-chat-send {
            width: 38px; height: 38px; border: none; border-radius: 12px;
            background: linear-gradient(135deg, #10b981, #06b6d4); color: #fff;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            font-size: 0.9rem; transition: transform 0.15s;
        }
        .baca-chat-send:hover { transform: scale(1.05); }
        .baca-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 600px) {
            .baca-chat-panel {
                width: calc(100vw - 32px);
                right: 16px;
                height: calc(100vh - 120px);
            }
            .baca-chat-fab { bottom: 16px; right: 16px; }
        }
    `;
    document.head.appendChild(style);

    // Create FAB button
    const fab = document.createElement('button');
    fab.className = 'baca-chat-fab';
    fab.innerHTML = '<i class="fa-solid fa-comments"></i>';
    fab.title = 'Ask Baca AI';
    fab.onclick = function () {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            setTimeout(() => input.focus(), 200);
        }
    };
    document.body.appendChild(fab);

    // Create chat panel
    const panel = document.createElement('div');
    panel.className = 'baca-chat-panel';
    panel.innerHTML = `
        <div class="baca-chat-header">
            <div class="chat-header-icon"><i class="fa-solid fa-robot"></i></div>
            <span class="chat-title">Baca AI</span>
            <a href="ask.html" class="chat-fullpage" title="Open full page"><i class="fa-solid fa-up-right-from-square" style="font-size:0.7rem"></i></a>
            <button class="chat-close" onclick="document.querySelector('.baca-chat-panel').classList.remove('open')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="baca-chat-messages" id="bacaChatMessages">
            <div class="baca-chat-welcome">
                <div class="wa-icon"><i class="fa-solid fa-message"></i></div>
                <h3>Assalamu alaikum! 👋</h3>
                <p>I'm Baca AI. Ask me about any surah, verse, or Baca feature.</p>
                <div class="baca-chat-suggestions">
                    <span class="chip" onclick="bacaChatSend('Which surah is Ayat al-Kursi in?')">Ayat al-Kursi?</span>
                    <span class="chip" onclick="bacaChatSend('Who made Baca?')">Who made Baca?</span>
                    <span class="chip" onclick="bacaChatSend('Surah for anxiety?')">Surah for anxiety?</span>
                </div>
            </div>
        </div>
        <div class="baca-chat-input-area">
            <input type="text" class="baca-chat-input" id="bacaChatInput" placeholder="Ask anything..." autocomplete="off">
            <button class="baca-chat-send" id="bacaChatSend" onclick="bacaChatSend(document.getElementById('bacaChatInput').value)">
                <i class="fa-solid fa-paper-plane"></i>
            </button>
        </div>
    `;
    document.body.appendChild(panel);

    const input = panel.querySelector('#bacaChatInput');
    const sendBtn = panel.querySelector('#bacaChatSend');
    const messagesEl = panel.querySelector('#bacaChatMessages');
    let chatHistory = [];
    let isWaiting = false;

    // Enter key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            bacaChatSend(input.value);
        }
    });

    window.bacaChatSend = async function (message) {
        message = (message || '').trim();
        if (!message || isWaiting) return;

        isWaiting = true;
        sendBtn.disabled = true;

        // Hide welcome
        const welcome = messagesEl.querySelector('.baca-chat-welcome');
        if (welcome) welcome.remove();

        // Add user message
        addMsg('user', message);
        input.value = '';

        // Typing indicator
        const typing = document.createElement('div');
        typing.className = 'baca-chat-msg ai';
        typing.innerHTML = '<div class="baca-chat-msg-avatar"><i class="fa-solid fa-robot"></i></div><div class="baca-chat-msg-bubble"><div class="baca-chat-typing"><span></span><span></span><span></span></div></div>';
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: chatHistory })
            });
            const data = await res.json();
            typing.remove();

            if (data.reply) {
                const formatted = data.reply
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`(.+?)`/g, '<code>$1</code>')
                    .replace(/\n/g, '<br>');
                addMsg('ai', formatted, true);
                chatHistory.push({ role: 'user', content: message });
                chatHistory.push({ role: 'assistant', content: data.reply });
            } else {
                addMsg('ai', 'Sorry, I could not process that. Please try again.');
            }
        } catch (err) {
            typing.remove();
            addMsg('ai', 'I cannot connect to the AI server. If you are viewing this as a static file, please run <code>node server.js</code> and open <code>http://localhost:3000</code>. <br><br>Or <a href="ask.html">open the full chat page</a>.', true);
        } finally {
            isWaiting = false;
            sendBtn.disabled = false;
            input.focus();
        }
    };

    function addMsg(role, content, isHtml) {
        const el = document.createElement('div');
        el.className = `baca-chat-msg ${role}`;
        const icon = role === 'ai' ? 'fa-robot' : 'fa-user';
        const safe = isHtml ? content : String(content).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        el.innerHTML = `<div class="baca-chat-msg-avatar"><i class="fa-solid ${icon}"></i></div><div class="baca-chat-msg-bubble">${safe}</div>`;
        messagesEl.appendChild(el);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
})();
