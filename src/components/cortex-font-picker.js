// src/components/cortex-font-picker.js
import { CortexElement } from '../core/CortexElement.js';

const DESKTOP_FONTS = [
  { name: 'Inter', stack: 'Inter, Segoe UI, sans-serif', category: 'Sans-Serif' },
  { name: 'Segoe UI', stack: '"Segoe UI", sans-serif', category: 'Sans-Serif' },
  { name: 'Roboto / Arial', stack: 'Roboto, Arial, sans-serif', category: 'Sans-Serif' },
  { name: 'Trebuchet MS', stack: '"Trebuchet MS", sans-serif', category: 'Sans-Serif' },
  { name: 'Verdana', stack: 'Verdana, sans-serif', category: 'Sans-Serif' },
  { name: 'Impact', stack: 'Impact, sans-serif', category: 'Display' },
  { name: 'Georgia', stack: 'Georgia, serif', category: 'Serif' },
  { name: 'Times New Roman', stack: '"Times New Roman", serif', category: 'Serif' },
  { name: 'Palatino', stack: '"Palatino Linotype", Palatino, serif', category: 'Serif' },
  { name: 'JetBrains Mono', stack: '"JetBrains Mono", Consolas, monospace', category: 'Monospace' },
  { name: 'Consolas / Courier', stack: 'Consolas, "Courier New", monospace', category: 'Monospace' }
];

const FONT_WEIGHTS = [
  { label: 'Light (300)', value: '300' },
  { label: 'Regular (400)', value: '400' },
  { label: 'Medium (500)', value: '500' },
  { label: 'SemiBold (600)', value: '600' },
  { label: 'Bold (700)', value: '700' },
  { label: 'Black (900)', value: '900' }
];

export class CortexFontPicker extends CortexElement {
  constructor() {
    super();
    this._dropdownOpen = false;
    this._searchQuery = '';
    this._state = {
      fontFamily: 'Inter, Segoe UI, sans-serif',
      fontWeight: '600',
      fontStyle: 'normal',
      underline: false,
      fontSize: 20,
      lineHeight: 1.3,
      textAlign: 'left'
    };
    this._handleOutside = this._handleOutside.bind(this);
  }

  set typography(data) {
    if (data && typeof data === 'object') {
      this._state = {
        ...this._state,
        ...data
      };
      this.render();
    }
  }

  get typography() {
    return this._state;
  }

  onLanguageChange() {
    this.render();
  }

  onMount() {
    document.addEventListener('pointerdown', this._handleOutside);
  }

  onUnmount() {
    document.removeEventListener('pointerdown', this._handleOutside);
  }

  _handleOutside(e) {
    if (this._dropdownOpen && !e.composedPath().includes(this)) {
      this._dropdownOpen = false;
      this.shadowRoot.getElementById('font-dropdown')?.classList.remove('open');
    }
  }

  _emitProp(prop, value, commitHistory = true) {
    this._state[prop] = value;
    this.emit('cortex-font-change', {
      prop,
      value,
      commitHistory
    });
  }

  _getCurrentFontLabel() {
    const match = DESKTOP_FONTS.find((f) => f.stack === this._state.fontFamily);
    return match ? match.name : this._state.fontFamily.split(',')[0].replace(/['"]/g, '');
  }

  render() {
    const s = this._state;
    const isBold = Number(s.fontWeight) >= 700;
    const isItalic = s.fontStyle === 'italic';

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          position: relative;
        }

        .font-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 26px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          padding: 0 8px;
          font-size: 11px;
          color: var(--text-primary);
        }

        .font-trigger:hover {
          border-color: var(--accent-blue);
        }

        .font-dropdown {
          display: none;
          position: absolute;
          top: 28px;
          left: 0;
          right: 0;
          background-color: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-dropdown);
          z-index: 6000;
          max-height: 220px;
          flex-direction: column;
          overflow: hidden;
        }

        .font-dropdown.open {
          display: flex;
        }

        .font-search {
          height: 26px;
          background: var(--bg-input);
          border: none;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 0 8px;
          font-size: 11px;
          outline: none;
        }

        .font-list {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .font-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          text-align: left;
          font-size: 12px;
          color: var(--text-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .font-option:hover,
        .font-option.active {
          background-color: var(--accent-blue);
          color: #ffffff;
        }

        .font-cat {
          font-family: var(--font-sans);
          font-size: 9px;
          color: var(--text-muted);
        }

        .font-option:hover .font-cat,
        .font-option.active .font-cat {
          color: rgba(255, 255, 255, 0.8);
        }

        .row-2 {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 6px;
        }

        .select-sm,
        .num-wrap {
          height: 25px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          font-size: 11px;
          padding: 0 6px;
          outline: none;
        }

        .num-wrap {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .num-wrap span {
          color: var(--text-muted);
          font-size: 10px;
        }

        .num-wrap input {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 11px;
          outline: none;
        }

        .style-bar {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 3px;
        }

        .style-btn {
          height: 24px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          color: var(--text-secondary);
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .style-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .style-btn.active {
          background-color: var(--accent-blue-alpha);
          border-color: var(--accent-blue);
          color: var(--accent-text);
          font-weight: 700;
        }
      </style>

      <!-- Seletor de Família de Fonte com Preview Real -->
      <button type="button" class="font-trigger" id="font-trigger">
        <span style="font-family: ${s.fontFamily};">${this._getCurrentFontLabel()}</span>
        <span style="font-size: 9px; color: var(--text-muted);">&#9662;</span>
      </button>

      <div class="font-dropdown" id="font-dropdown">
        <input type="text" class="font-search" id="font-search" placeholder="Filtrar fontes..." />
        <div class="font-list" id="font-list">
          ${DESKTOP_FONTS.map(
            (f) => `
            <button
              type="button"
              class="font-option ${f.stack === s.fontFamily ? 'active' : ''}"
              data-stack='${f.stack}'
              data-name="${f.name.toLowerCase()}"
              style="font-family: ${f.stack};"
            >
              <span>${f.name}</span>
              <span class="font-cat">${f.category}</span>
            </button>
          `
          ).join('')}
        </div>
      </div>

      <!-- Peso da Fonte + Tamanho (px) -->
      <div class="row-2">
        <select class="select-sm" id="weight-select">
          ${FONT_WEIGHTS.map(
            (w) => `<option value="${w.value}" ${String(s.fontWeight) === w.value ? 'selected' : ''}>${w.label}</option>`
          ).join('')}
        </select>

        <label class="num-wrap" title="Tamanho da Fonte (px)">
          <span> T:</span>
          <input type="number" id="size-input" min="8" max="200" value="${s.fontSize}" />
          <span>px</span>
        </label>
      </div>

      <!-- Barra de Estilos (Bold, Italic, Underline) & Alinhamento (Left, Center, Right) -->
      <div class="style-bar">
        <button type="button" class="style-btn ${isBold ? 'active' : ''}" id="btn-bold" title="Negrito (Bold)"><b>B</b></button>
        <button type="button" class="style-btn ${isItalic ? 'active' : ''}" id="btn-italic" title="Itálico"><i>I</i></button>
        <button type="button" class="style-btn ${s.underline ? 'active' : ''}" id="btn-underline" title="Sublinhado"><u>U</u></button>
        <button type="button" class="style-btn ${s.textAlign === 'left' ? 'active' : ''}" data-align="left" title="Alinhar à Esquerda">&#8676;</button>
        <button type="button" class="style-btn ${s.textAlign === 'center' ? 'active' : ''}" data-align="center" title="Centralizar">&#8596;</button>
        <button type="button" class="style-btn ${s.textAlign === 'right' ? 'active' : ''}" data-align="right" title="Alinhar à Direita">&#8677;</button>
      </div>
    `;

    const trigger = this.shadowRoot.getElementById('font-trigger');
    const dropdown = this.shadowRoot.getElementById('font-dropdown');
    const searchInput = this.shadowRoot.getElementById('font-search');

    trigger.addEventListener('click', () => {
      this._dropdownOpen = !this._dropdownOpen;
      dropdown.classList.toggle('open', this._dropdownOpen);
      if (this._dropdownOpen) {
        searchInput.focus();
      }
    });

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      this.shadowRoot.querySelectorAll('.font-option').forEach((opt) => {
        const match = opt.dataset.name.includes(q);
        opt.style.display = match ? 'flex' : 'none';
      });
    });

    this.shadowRoot.querySelectorAll('.font-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const stack = opt.getAttribute('data-stack');
        this._dropdownOpen = false;
        this._emitProp('fontFamily', stack, true);
        this.render();
      });
    });

    this.shadowRoot.getElementById('weight-select').addEventListener('change', (e) => {
      this._emitProp('fontWeight', e.target.value, true);
      this.render();
    });

    const sizeInput = this.shadowRoot.getElementById('size-input');
    sizeInput.addEventListener('input', (e) => {
      this._emitProp('fontSize', Math.max(8, Number(e.target.value) || 18), false);
    });
    sizeInput.addEventListener('change', (e) => {
      this._emitProp('fontSize', Math.max(8, Number(e.target.value) || 18), true);
    });

    this.shadowRoot.getElementById('btn-bold').addEventListener('click', () => {
      const nextWeight = Number(this._state.fontWeight) >= 700 ? '400' : '700';
      this._emitProp('fontWeight', nextWeight, true);
      this.render();
    });

    this.shadowRoot.getElementById('btn-italic').addEventListener('click', () => {
      const nextStyle = this._state.fontStyle === 'italic' ? 'normal' : 'italic';
      this._emitProp('fontStyle', nextStyle, true);
      this.render();
    });

    this.shadowRoot.getElementById('btn-underline').addEventListener('click', () => {
      this._emitProp('underline', !this._state.underline, true);
      this.render();
    });

    this.shadowRoot.querySelectorAll('[data-align]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._emitProp('textAlign', btn.dataset.align, true);
        this.render();
      });
    });
  }
}

customElements.define('cortex-font-picker', CortexFontPicker);
