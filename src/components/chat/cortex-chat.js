// src/components/chat/cortex-chat.js
import { CortexElement } from '../../core/CortexElement.js';
import { CortexModal } from '../cortex-modal.js';

// Avatar SVG padrão de alta qualidade para o Atendente de Suporte (estilo profissional da imagem de referência)
const DEFAULT_AGENT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23e0e7ff"/>
      <stop offset="100%" stop-color="%23c7d2fe"/>
    </linearGradient>
    <linearGradient id="skinG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%23fed7aa"/>
      <stop offset="100%" stop-color="%23fbbd79"/>
    </linearGradient>
    <linearGradient id="hairG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%237c2d12"/>
      <stop offset="100%" stop-color="%23431407"/>
    </linearGradient>
    <linearGradient id="suitG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%233b82f6"/>
      <stop offset="100%" stop-color="%231d4ed8"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="60" fill="url(%23bgG)"/>
  <!-- Cabelo fundo -->
  <circle cx="60" cy="46" r="28" fill="url(%23hairG)"/>
  <!-- Corpo / Camisa -->
  <path d="M 18 114 C 20 85, 42 78, 60 78 C 78 78, 100 85, 102 114 Z" fill="url(%23suitG)"/>
  <polygon points="60,82 50,78 52,106 60,114 68,106 70,78" fill="%23ffffff"/>
  <polygon points="60,86 56,104 60,114 64,104" fill="%230284c7"/>
  <!-- Cabeça e pescoço -->
  <rect x="52" y="62" width="16" height="20" rx="4" fill="url(%23skinG)"/>
  <ellipse cx="60" cy="50" rx="20" ry="24" fill="url(%23skinG)"/>
  <!-- Orelhas -->
  <circle cx="39" cy="51" r="5" fill="url(%23skinG)"/>
  <circle cx="81" cy="51" r="5" fill="url(%23skinG)"/>
  <!-- Cabelo topo -->
  <path d="M 38 46 C 38 30, 52 24, 60 24 C 72 24, 82 31, 82 46 C 76 38, 68 38, 60 38 C 50 38, 44 41, 38 46 Z" fill="url(%23hairG)"/>
  <!-- Olhos e Sobrancelhas -->
  <ellipse cx="52" cy="48" rx="2.2" ry="2.6" fill="%231e293b"/>
  <ellipse cx="68" cy="48" rx="2.2" ry="2.6" fill="%231e293b"/>
  <path d="M 47 43 Q 52 41 57 43" stroke="%23431407" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M 63 43 Q 68 41 73 43" stroke="%23431407" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- Nariz e Boca Sorrindo -->
  <path d="M 60 48 L 59 55 L 63 55" stroke="%23ea580c" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M 52 61 Q 60 68 68 61" stroke="%23be123c" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`;

// Histórico de mensagens inicial fiel à imagem do usuário
function getInitialMessages() {
  return [
    {
      id: 'm1',
      date: 'Yesterday 10/27/2026',
      senderId: 'support-agent',
      senderName: 'Support Agent',
      time: '11:51 PM',
      type: 'text',
      text: 'Hello, John!\nHow can I assist you today?'
    },
    {
      id: 'm2',
      date: 'Yesterday 10/27/2026',
      senderId: 'john-doe',
      senderName: 'John Doe',
      time: '11:53 PM',
      type: 'text',
      text: "Hi, I'm having trouble accessing my account."
    },
    {
      id: 'm3',
      date: 'Yesterday 10/27/2026',
      senderId: 'john-doe',
      senderName: 'John Doe',
      time: '11:53 PM',
      type: 'text',
      text: 'It says my password is incorrect.'
    },
    {
      id: 'm4',
      date: 'Yesterday 10/27/2026',
      senderId: 'support-agent',
      senderName: 'Support Agent',
      time: '11:53 PM',
      type: 'text',
      text: 'I can help you with that. Can you please confirm your UserID for security purposes?'
    },
    {
      id: 'm5',
      date: 'Today 10/28/2026',
      senderId: 'john-doe',
      senderName: 'John Doe',
      time: '12:01 AM',
      type: 'text',
      text: 'john.doe1357'
    },
    {
      id: 'm6',
      date: 'Today 10/28/2026',
      senderId: 'support-agent',
      senderName: 'Support Agent',
      time: '12:01 AM',
      type: 'text',
      text: '✅ Instructions to restore access have been sent to the email address associated with your account.'
    }
  ];
}

/**
 * Componente Base de Chat: CortexChat
 * Suporta dois modos visuais nativos:
 *  - model="photo": Chat com Avatar Fotográfico circular para o Atendente / Contato.
 *  - model="initials": Chat com Badge Monograma de Iniciais (ex: JD) para participantes.
 */
export class CortexChat extends CortexElement {
  static get observedAttributes() {
    return ['model', 'title', 'theme-mode'];
  }

  constructor() {
    super();
    this._model = this.getAttribute('model') || 'photo'; // 'photo' | 'initials'
    this._chatTitle = this.getAttribute('title') || (this._model === 'photo' ? 'Support Chat (Photo Avatar)' : 'Support Chat (Initials Monogram)');
    
    this._currentUser = {
      id: 'john-doe',
      name: 'John Doe',
      initials: 'JD'
    };

    this._agentUser = {
      id: 'support-agent',
      name: 'Support Agent',
      initials: 'SA',
      avatarUrl: DEFAULT_AGENT_AVATAR
    };

    this._messages = getInitialMessages();
    this._isTyping = false;
    this._isRecording = false;
    this._recordSeconds = 0;
    this._recordTimer = null;
    this._inputText = '';
  }

  get model() {
    return this._model;
  }

  set model(val) {
    this._model = val === 'initials' ? 'initials' : 'photo';
    this.setAttribute('model', this._model);
    this.render();
  }

  onMount() {
    this.watchState('theme', () => this.render());
    this._scrollToBottom(false);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'model') {
      this._model = newVal === 'initials' ? 'initials' : 'photo';
      this.render();
    } else if (name === 'title') {
      this._chatTitle = newVal;
      this.render();
    }
  }

  _getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  _formatCurrentTime() {
    const d = new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 vira 12
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minStr} ${ampm}`;
  }

  _formatCurrentDate() {
    const d = new Date();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const y = d.getFullYear();
    return `Today ${m}/${day}/${y}`;
  }

  _sendMessage(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    const newMsg = {
      id: 'msg-' + Date.now(),
      date: this._formatCurrentDate(),
      senderId: this._currentUser.id,
      senderName: this._currentUser.name,
      time: this._formatCurrentTime(),
      type: 'text',
      text: trimmed
    };

    this._messages.push(newMsg);
    this._inputText = '';
    this.render();
    this._scrollToBottom(true);

    this.emit('cortex-chat-message-sent', { message: newMsg, model: this._model });

    // Simula resposta inteligente do suporte após 1.2s
    this._simulateAgentReply(trimmed);
  }

  _simulateAgentReply(userText) {
    this._isTyping = true;
    this.render();
    this._scrollToBottom(true);

    setTimeout(() => {
      this._isTyping = false;
      let replyText = 'Thank you for your message! Our system has recorded your update. Is there anything else I can help you with?';
      
      const lower = userText.toLowerCase();
      if (lower.includes('olá') || lower.includes('hello') || lower.includes('hi')) {
        replyText = `Hello, ${this._currentUser.name.split(' ')[0]}! How can I assist you further today?`;
      } else if (lower.includes('senha') || lower.includes('password') || lower.includes('acesso') || lower.includes('access')) {
        replyText = 'I have verified your request. A security reset link was generated and dispatched to your registered address.';
      } else if (lower.includes('obrigado') || lower.includes('thanks') || lower.includes('thank')) {
        replyText = "You're very welcome! If you have any further questions, we're always here 24/7.";
      } else if (lower.includes('teste') || lower.includes('test')) {
        replyText = '✅ Chat connection is active and running at 60 FPS under FrameworkCortexUI!';
      }

      const agentMsg = {
        id: 'msg-' + Date.now(),
        date: this._formatCurrentDate(),
        senderId: this._agentUser.id,
        senderName: this._agentUser.name,
        time: this._formatCurrentTime(),
        type: 'text',
        text: replyText
      };

      this._messages.push(agentMsg);
      this.render();
      this._scrollToBottom(true);
      this.emit('cortex-chat-message-received', { message: agentMsg, model: this._model });
    }, 1200);
  }

  _toggleRecording() {
    if (this._isRecording) {
      // Finaliza a gravação simulada de áudio
      clearInterval(this._recordTimer);
      this._isRecording = false;
      const duration = this._recordSeconds || 3;
      this._recordSeconds = 0;

      const audioMsg = {
        id: 'msg-' + Date.now(),
        date: this._formatCurrentDate(),
        senderId: this._currentUser.id,
        senderName: this._currentUser.name,
        time: this._formatCurrentTime(),
        type: 'audio',
        duration: `0:${duration < 10 ? '0' + duration : duration}`
      };

      this._messages.push(audioMsg);
      this.render();
      this._scrollToBottom(true);
      CortexModal.toast(`🎙️ Áudio enviado (${audioMsg.duration})`, 'info', 1800);
      this._simulateAgentReply('áudio gravado');
    } else {
      // Inicia a gravação simulada
      this._isRecording = true;
      this._recordSeconds = 0;
      this.render();
      this._recordTimer = setInterval(() => {
        this._recordSeconds++;
        const recDisplay = this.shadowRoot?.querySelector('.recording-timer');
        if (recDisplay) {
          recDisplay.textContent = `0:${this._recordSeconds < 10 ? '0' + this._recordSeconds : this._recordSeconds}`;
        }
      }, 1000);
    }
  }

  _scrollToBottom(smooth = true) {
    requestAnimationFrame(() => {
      const body = this.shadowRoot?.querySelector('.chat-body');
      if (body) {
        body.scrollTo({
          top: body.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    });
  }

  _clearChat() {
    CortexModal.confirm(
      'Deseja realmente limpar todas as mensagens deste chat?',
      () => {
        this._messages = [];
        this.render();
        CortexModal.toast('Histórico do chat limpo com sucesso.', 'info');
      },
      () => {},
      'Limpar Histórico de Mensagens'
    );
  }

  _resetOriginalMessages() {
    this._messages = getInitialMessages();
    this.render();
    this._scrollToBottom(false);
    CortexModal.toast('Histórico restaurado para os dados originais da imagem!', 'success');
  }

  _changeAgentPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          this._agentUser.avatarUrl = re.target.result;
          this.render();
          CortexModal.toast('Foto do Atendente atualizada com sucesso!', 'success');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  render() {
    const isPhotoModel = this._model === 'photo';

    // Agrupa mensagens por data
    const grouped = [];
    let currentDate = null;
    let currentGroup = null;

    this._messages.forEach((msg) => {
      if (msg.date !== currentDate) {
        currentDate = msg.date;
        currentGroup = { date: currentDate, messages: [] };
        grouped.push(currentGroup);
      }
      currentGroup.messages.push(msg);
    });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          background: var(--bg-app, #ffffff);
          color: var(--text-primary, #1e293b);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 13.5px;
          line-height: 1.45;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        /* Barra de Ferramentas / Header do Chat */
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: var(--bg-panel, #f8fafc);
          border-bottom: 1px solid var(--border-subtle, #e2e8f0);
          flex-shrink: 0;
          gap: 10px;
        }

        .chat-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary, #0f172a);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chat-badge-model {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 12px;
          background: ${isPhotoModel ? 'rgba(59, 130, 246, 0.12)' : 'rgba(168, 85, 247, 0.12)'};
          color: ${isPhotoModel ? 'var(--accent-blue, #2563eb)' : '#9333ea'};
          border: 1px solid ${isPhotoModel ? 'rgba(59, 130, 246, 0.25)' : 'rgba(168, 85, 247, 0.25)'};
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .mini-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--bg-hover, #f1f5f9);
          border: 1px solid var(--border-subtle, #cbd5e1);
          color: var(--text-secondary, #475569);
          padding: 4px 8px;
          border-radius: 5px;
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mini-btn:hover {
          background: var(--bg-panel, #e2e8f0);
          color: var(--text-primary, #0f172a);
          border-color: var(--border-color, #94a3b8);
        }

        /* Corpo do Chat com Scroll */
        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--bg-app, #ffffff);
          scroll-behavior: smooth;
        }

        /* Divisor de Data Centralizado */
        .date-separator {
          text-align: center;
          margin: 6px 0 10px;
          position: relative;
        }

        .date-badge {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 400;
          color: var(--text-muted, #64748b);
          padding: 2px 10px;
          background: transparent;
          letter-spacing: 0.01em;
        }

        /* Bloco de Mensagem Individual */
        .message-row {
          display: flex;
          gap: 10px;
          margin-bottom: 8px;
        }

        /* Modelo 1: Agente à esquerda, Usuário à direita */
        .model-photo .row-agent {
          flex-direction: row;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .model-photo .row-user {
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-end;
        }

        /* Modelo 2: John Doe com badge JD à esquerda, Agente com balão azul à direita */
        .model-initials .row-user {
          flex-direction: row;
          align-items: flex-start;
          justify-content: flex-start;
        }

        .model-initials .row-agent {
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-end;
        }

        /* Avatar com Foto (Modelo 1) */
        .avatar-container {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          position: relative;
          cursor: pointer;
          margin-top: 2px;
        }

        .avatar-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        /* Avatar com Iniciais (Modelo 2) */
        .initials-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-hover, #e2e8f0);
          color: var(--text-secondary, #475569);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          flex-shrink: 0;
          border: 1px solid var(--border-subtle, #cbd5e1);
          margin-top: 2px;
          user-select: none;
        }

        /* Conteúdo da Mensagem */
        .message-content {
          display: flex;
          flex-direction: column;
          max-width: 82%;
        }

        .row-user.message-content,
        .model-photo .row-user .message-content,
        .model-initials .row-agent .message-content {
          align-items: flex-end;
        }

        /* Metadados: Nome & Horário */
        .message-meta {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 4px;
        }

        .meta-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary, #475569);
        }

        .meta-time {
          font-size: 11px;
          color: var(--text-muted, #94a3b8);
          font-weight: 400;
        }

        /* Balão de Mensagem */
        .bubble {
          padding: 8px 14px;
          border-radius: 14px;
          font-size: 13.5px;
          line-height: 1.45;
          word-break: break-word;
          position: relative;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        /* Balão Cinza Suave (Recebido no Modelo 1 / JD no Modelo 2) */
        .bubble-gray {
          background: var(--bg-panel, #f1f5f9);
          color: var(--text-primary, #1e293b);
          border: 1px solid var(--border-subtle, #e2e8f0);
          border-top-left-radius: 3px;
        }

        /* Balão Azul Suave (Enviado pelo usuário no Modelo 1 / Resposta no Modelo 2) */
        .bubble-blue {
          background: rgba(59, 130, 246, 0.12);
          color: var(--text-primary, #0f172a);
          border: 1px solid rgba(59, 130, 246, 0.24);
          border-top-right-radius: 3px;
        }

        /* Balão de Áudio */
        .audio-bubble {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          min-width: 170px;
        }

        .audio-play-icon {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--accent-blue, #2563eb);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          cursor: pointer;
        }

        .audio-wave {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          height: 18px;
        }

        .audio-bar {
          width: 3px;
          background: var(--text-muted, #94a3b8);
          border-radius: 2px;
        }

        /* Indicador de Digitação (Typing Indicator) */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 14px;
          background: var(--bg-panel, #f1f5f9);
          border: 1px solid var(--border-subtle, #e2e8f0);
          border-radius: 14px;
          border-top-left-radius: 3px;
          width: fit-content;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          background: var(--text-muted, #94a3b8);
          border-radius: 50%;
          animation: dotPulse 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }

        /* Área do Footer / Caixa de Entrada */
        .chat-footer {
          padding: 12px 18px 16px;
          background: var(--bg-app, #ffffff);
          flex-shrink: 0;
        }

        .input-card {
          border: 1px solid var(--border-color, #cbd5e1);
          border-radius: 10px;
          background: var(--bg-input, #ffffff);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          padding: 8px 12px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .input-card:focus-within {
          border-color: var(--accent-blue, #3b82f6);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .chat-textarea {
          width: 100%;
          border: none;
          background: transparent;
          color: var(--text-primary, #0f172a);
          font-family: inherit;
          font-size: 13.5px;
          line-height: 1.4;
          resize: none;
          outline: none;
          min-height: 38px;
          max-height: 120px;
          padding: 0;
        }

        .chat-textarea::placeholder {
          color: var(--text-muted, #94a3b8);
        }

        .input-toolbar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 6px;
        }

        .record-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #ef4444;
          font-weight: 500;
          margin-right: auto;
        }

        .rec-dot {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          animation: recBlink 1s infinite alternate;
        }

        @keyframes recBlink {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary, #64748b);
          cursor: pointer;
          padding: 5px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .icon-btn:hover {
          color: var(--text-primary, #0f172a);
          background: var(--bg-hover, #f1f5f9);
        }

        .icon-btn.recording {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .send-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: transparent;
          color: var(--text-secondary, #64748b);
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .send-btn.has-text {
          background: var(--accent-blue, #2563eb);
          color: #ffffff;
        }

        .send-btn:hover {
          transform: scale(1.06);
        }
      </style>

      <div class="chat-header">
        <div class="chat-header-title">
          <span>${this._chatTitle}</span>
          <span class="chat-badge-model">${isPhotoModel ? '📷 Com Imagem' : '🔤 Com Iniciais (JD)'}</span>
        </div>
        <div class="header-actions">
          ${isPhotoModel ? `
            <button class="mini-btn" id="btn-change-photo" title="Trocar Foto do Atendente">&#128247; Foto</button>
          ` : ''}
          <button class="mini-btn" id="btn-switch-model" title="Alternar entre Modelo Foto e Iniciais">
            &#8644; ${isPhotoModel ? 'Ver Iniciais' : 'Ver Foto'}
          </button>
          <button class="mini-btn" id="btn-simulate-reply" title="Simular Resposta do Atendente">&#10024; Resposta</button>
          <button class="mini-btn" id="btn-reset-history" title="Restaurar Mensagens Originais">&#8635; Reset</button>
          <button class="mini-btn" id="btn-clear-chat" title="Limpar Conversa">&#128465; Limpar</button>
        </div>
      </div>

      <div class="chat-body ${isPhotoModel ? 'model-photo' : 'model-initials'}">
        ${grouped.map((group) => `
          <div class="date-separator">
            <span class="date-badge">${group.date}</span>
          </div>

          ${group.messages.map((m) => {
            const isUser = m.senderId === this._currentUser.id;

            if (isPhotoModel) {
              // Modelo 1: Agente com Foto à esquerda, Usuário à direita com balão azul
              if (!isUser) {
                return `
                  <div class="message-row row-agent">
                    <div class="avatar-container" title="Atendente de Suporte (Clique para trocar foto)">
                      <img class="avatar-img" src="${this._agentUser.avatarUrl}" alt="${m.senderName}" />
                    </div>
                    <div class="message-content">
                      <div class="message-meta">
                        <span class="meta-name">${m.senderName}</span>
                        <span class="meta-time">${m.time}</span>
                      </div>
                      <div class="bubble bubble-gray">${m.text.replace(/\\n/g, '<br/>')}</div>
                    </div>
                  </div>
                `;
              } else {
                return `
                  <div class="message-row row-user">
                    <div class="message-content">
                      <div class="message-meta" style="justify-content: flex-end;">
                        <span class="meta-time">${m.time}</span>
                      </div>
                      ${m.type === 'audio' ? `
                        <div class="bubble bubble-blue audio-bubble">
                          <div class="audio-play-icon">&#9654;</div>
                          <div class="audio-wave">
                            <span class="audio-bar" style="height: 6px;"></span>
                            <span class="audio-bar" style="height: 14px;"></span>
                            <span class="audio-bar" style="height: 10px;"></span>
                            <span class="audio-bar" style="height: 16px;"></span>
                            <span class="audio-bar" style="height: 8px;"></span>
                          </div>
                          <span style="font-size: 11px; font-weight: 500;">${m.duration}</span>
                        </div>
                      ` : `
                        <div class="bubble bubble-blue">${m.text.replace(/\\n/g, '<br/>')}</div>
                      `}
                    </div>
                  </div>
                `;
              }
            } else {
              // Modelo 2: John Doe com badge 'JD' à esquerda, Agente à direita com balão azul
              if (isUser) {
                return `
                  <div class="message-row row-user">
                    <div class="initials-avatar" title="${m.senderName}">${this._currentUser.initials}</div>
                    <div class="message-content">
                      <div class="message-meta">
                        <span class="meta-name">${m.senderName}</span>
                        <span class="meta-time">${m.time}</span>
                      </div>
                      ${m.type === 'audio' ? `
                        <div class="bubble bubble-gray audio-bubble">
                          <div class="audio-play-icon">&#9654;</div>
                          <div class="audio-wave">
                            <span class="audio-bar" style="height: 8px;"></span>
                            <span class="audio-bar" style="height: 16px;"></span>
                            <span class="audio-bar" style="height: 10px;"></span>
                            <span class="audio-bar" style="height: 14px;"></span>
                            <span class="audio-bar" style="height: 6px;"></span>
                          </div>
                          <span style="font-size: 11px; font-weight: 500;">${m.duration}</span>
                        </div>
                      ` : `
                        <div class="bubble bubble-gray">${m.text.replace(/\\n/g, '<br/>')}</div>
                      `}
                    </div>
                  </div>
                `;
              } else {
                return `
                  <div class="message-row row-agent">
                    <div class="message-content">
                      <div class="message-meta" style="justify-content: flex-end;">
                        <span class="meta-time">${m.time}</span>
                      </div>
                      <div class="bubble bubble-blue">${m.text.replace(/\\n/g, '<br/>')}</div>
                    </div>
                  </div>
                `;
              }
            }
          }).join('')}
        `).join('')}

        ${this._isTyping ? `
          <div class="message-row ${isPhotoModel ? 'row-agent' : 'row-agent'}">
            ${isPhotoModel ? `
              <div class="avatar-container">
                <img class="avatar-img" src="${this._agentUser.avatarUrl}" alt="Digitando..." />
              </div>
            ` : ''}
            <div class="message-content">
              <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="chat-footer">
        <div class="input-card">
          <textarea
            class="chat-textarea"
            placeholder="Type a message"
            rows="1"
          >${this._inputText}</textarea>
          <div class="input-toolbar">
            ${this._isRecording ? `
              <div class="record-indicator">
                <span class="rec-dot"></span>
                <span>Gravando áudio... <strong class="recording-timer">0:01</strong></span>
              </div>
            ` : ''}
            <button
              class="icon-btn ${this._isRecording ? 'recording' : ''}"
              id="btn-mic"
              title="${this._isRecording ? 'Clique para enviar mensagem de voz' : 'Gravar mensagem de voz'}"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </button>
            <button
              class="send-btn ${this._inputText.trim() ? 'has-text' : ''}"
              id="btn-send"
              title="Enviar mensagem (Enter)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const root = this.shadowRoot;
    if (!root) return;

    const textarea = root.querySelector('.chat-textarea');
    const sendBtn = root.querySelector('#btn-send');
    const micBtn = root.querySelector('#btn-mic');
    const switchModelBtn = root.querySelector('#btn-switch-model');
    const simulateBtn = root.querySelector('#btn-simulate-reply');
    const resetBtn = root.querySelector('#btn-reset-history');
    const clearBtn = root.querySelector('#btn-clear-chat');
    const changePhotoBtn = root.querySelector('#btn-change-photo');
    const avatarClick = root.querySelector('.avatar-container');

    textarea?.addEventListener('input', (e) => {
      this._inputText = e.target.value;
      if (sendBtn) {
        sendBtn.classList.toggle('has-text', Boolean(this._inputText.trim()));
      }
      // Ajusta altura dinamicamente
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });

    textarea?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._sendMessage(this._inputText);
      }
    });

    sendBtn?.addEventListener('click', () => {
      this._sendMessage(this._inputText);
    });

    micBtn?.addEventListener('click', () => {
      this._toggleRecording();
    });

    switchModelBtn?.addEventListener('click', () => {
      this.model = this._model === 'photo' ? 'initials' : 'photo';
      CortexModal.toast(`Modelo alternado para: ${this._model === 'photo' ? 'Com Imagem' : 'Com Iniciais'}`, 'info', 1800);
    });

    simulateBtn?.addEventListener('click', () => {
      this._simulateAgentReply('ajuda geral');
    });

    resetBtn?.addEventListener('click', () => {
      this._resetOriginalMessages();
    });

    clearBtn?.addEventListener('click', () => {
      this._clearChat();
    });

    changePhotoBtn?.addEventListener('click', () => {
      this._changeAgentPhoto();
    });

    avatarClick?.addEventListener('click', () => {
      this._changeAgentPhoto();
    });
  }
}

/**
 * Chat Especializado Modelo 1: Com Foto / Imagem do Atendente
 */
export class CortexChatPhoto extends CortexChat {
  constructor() {
    super();
    this.model = 'photo';
    this._chatTitle = 'CortexUI Chat — Modelo 1 (Foto / Avatar)';
  }
}

/**
 * Chat Especializado Modelo 2: Com Iniciais Monograma (JD)
 */
export class CortexChatInitials extends CortexChat {
  constructor() {
    super();
    this.model = 'initials';
    this._chatTitle = 'CortexUI Chat — Modelo 2 (Iniciais Monograma)';
  }
}

/**
 * Showcase Comparativo: Exibe os dois modelos lado a lado exatamente como na imagem do usuário
 */
export class CortexChatShowcase extends CortexElement {
  constructor() {
    super();
  }

  onMount() {
    this.watchState('theme', () => this.render());
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          background: var(--bg-app, #f1f5f9);
          overflow: hidden;
          font-family: inherit;
        }

        .showcase-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: var(--bg-panel, #ffffff);
          border-bottom: 1px solid var(--border-subtle, #e2e8f0);
          flex-shrink: 0;
        }

        .showcase-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .showcase-badge {
          background: rgba(14, 165, 233, 0.12);
          color: var(--accent-blue, #0284c7);
          border: 1px solid rgba(14, 165, 233, 0.3);
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          flex: 1;
          padding: 16px;
          overflow: hidden;
          box-sizing: border-box;
        }

        @media (max-width: 860px) {
          .showcase-grid {
            grid-template-columns: 1fr;
            overflow-y: auto;
          }
        }

        .chat-column {
          display: flex;
          flex-direction: column;
          background: var(--bg-app, #ffffff);
          border: 1px solid var(--border-color, #cbd5e1);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          height: 100%;
          min-height: 480px;
        }

        .column-header {
          background: var(--bg-panel, #f8fafc);
          padding: 6px 12px;
          border-bottom: 1px solid var(--border-subtle, #e2e8f0);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary, #475569);
        }
      </style>

      <div class="showcase-header">
        <div class="showcase-title">
          <span>💬 Modelos de Chat do FrameworkCortexUI</span>
          <span class="showcase-badge">Design Nativo & 12 Temas</span>
        </div>
        <div style="font-size: 12px; color: var(--text-muted, #64748b);">
          Modelo 1 (Foto do Atendente) vs. Modelo 2 (Iniciais Monograma JD)
        </div>
      </div>

      <div class="showcase-grid">
        <div class="chat-column">
          <div class="column-header">
            <span>Modelo 1: Com Imagem / Foto do Atendente</span>
            <span style="font-size: 11px; color: var(--text-muted);">Foto à esquerda & Balão azul à direita</span>
          </div>
          <cortex-chat model="photo" title="Suporte (Avatar com Foto)" style="flex: 1; display: flex; flex-direction: column;"></cortex-chat>
        </div>

        <div class="chat-column">
          <div class="column-header">
            <span>Modelo 2: Com Iniciais Monograma (JD)</span>
            <span style="font-size: 11px; color: var(--text-muted);">Badge com iniciais & Balões neutros</span>
          </div>
          <cortex-chat model="initials" title="Suporte (Monograma Iniciais JD)" style="flex: 1; display: flex; flex-direction: column;"></cortex-chat>
        </div>
      </div>
    `;
  }
}

// Registro oficial dos Web Components
customElements.define('cortex-chat', CortexChat);
customElements.define('cortex-chat-photo', CortexChatPhoto);
customElements.define('cortex-chat-initials', CortexChatInitials);
customElements.define('cortex-chat-showcase', CortexChatShowcase);
