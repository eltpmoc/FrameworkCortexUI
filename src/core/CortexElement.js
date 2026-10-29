// src/core/CortexElement.js
import { AppState } from './Store.js';
import './i18n.js'; // Garante a inicialização do idioma (AppState.language) antes de qualquer componente

export class CortexElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._unsubscribers = [];
  }

  connectedCallback() {
    this._renderToShadow();
    this.onMount();

    // i18n: re-renderiza automaticamente o componente quando o idioma ativo muda (PT-BR / EN)
    this.watchState('language', (lang) => {
      this.onLanguageChange(lang);
    });
  }

  /**
   * Executa render() suportando os dois padrões do framework:
   * (a) render() atribui this.shadowRoot.innerHTML diretamente, ou
   * (b) render() retorna uma string HTML (seguida de onRender() para ligar eventos).
   */
  _renderToShadow() {
    const html = this.render();
    if (typeof html === 'string' && this.shadowRoot) {
      this.shadowRoot.innerHTML = html;
      if (typeof this.onRender === 'function') {
        this.onRender();
      }
    }
  }

  /**
   * Chamado quando o idioma muda. Padrão: re-renderiza o Shadow DOM.
   * Componentes que ligam eventos em onMount() (fora do render) ou que precisam
   * preservar estado de DOM (scroll, foco) devem sobrescrever este método.
   */
  // eslint-disable-next-line no-unused-vars
  onLanguageChange(_lang) {
    this._renderToShadow();
  }

  disconnectedCallback() {
    this._unsubscribers.forEach((unsub) => unsub());
    this._unsubscribers = [];
    this.onUnmount();
  }

  /**
   * Inscreve o Web Component em chaves do AppState com limpeza automática ao desmontar.
   */
  watchState(keys, callback) {
    const unsub = AppState.subscribe(keys, callback.bind(this));
    this._unsubscribers.push(unsub);
    return unsub;
  }

  /**
   * Despacha um CustomEvent que atravessa o Shadow DOM (composed: true).
   */
  emit(eventName, detail = {}) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Estilos base compartilhados por todos os Shadow DOMs do CortexUI,
   * incluindo o Design System de Scrollbars Desktop Escuras.
   */
  get baseStyles() {
    return `
      :host {
        box-sizing: border-box;
        font-family: var(--font-sans);
        color: var(--text-primary);
        user-select: none;
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      @supports not selector(::-webkit-scrollbar) {
        *, *::before, *::after {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb, #3f3f46) var(--scrollbar-track, #1b1b1d);
        }
      }
      /* Scrollbar Customizada Padrão CortexUI (Adaptável a todos os Temas Desktop) */
      ::-webkit-scrollbar {
        width: 7px;
        height: 7px;
      }
      ::-webkit-scrollbar-button {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      ::-webkit-scrollbar-track {
        background: var(--scrollbar-track, #1b1b1d);
        border: none;
      }
      ::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb, #3f3f46);
        border-radius: var(--radius-pill, 9999px);
        border: 1px solid var(--scrollbar-track, #1b1b1d);
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--scrollbar-thumb-hover, #52525b);
      }
      ::-webkit-scrollbar-thumb:active {
        background: var(--accent-blue, #1473e6);
      }
      ::-webkit-scrollbar-corner {
        background: var(--scrollbar-track, #1b1b1d);
      }
      button {
        font-family: inherit;
        color: inherit;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
      }
      button:focus-visible, input:focus-visible {
        outline: 1px solid var(--border-focus);
        outline-offset: 0px;
      }
    `;
  }

  // Métodos a serem sobrescritos pelas subclasses
  render() {}
  onMount() {}
  onUnmount() {}
}
