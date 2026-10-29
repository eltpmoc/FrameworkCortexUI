// src/components/cortex-toolbar.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';
import { t } from '../core/i18n.js';

const DEFAULT_TOOLS = [
  {
    id: 'select',
    label: 'Selection Tool (V)',
    svg: `<path d="M5 3l13 8.5-6.2 1.8-2.6 6.2L5 3z" fill="currentColor"/>`
  },
  {
    id: 'direct-select',
    label: 'Direct Selection Tool (A)',
    svg: `<path d="M5 3l13 8.5-6.2 1.8-2.6 6.2L5 3z"/>`
  },
  { type: 'divider' },
  {
    id: 'text',
    label: 'Type Tool (T)',
    svg: `<polyline points="5 7 5 4 19 4 19 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>`
  },
  {
    id: 'line',
    label: 'Line Tool (L)',
    svg: `<line x1="4" y1="20" x2="20" y2="4"/>`
  },
  {
    id: 'pen',
    label: 'Pen Tool (P)',
    svg: `<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.5 7.5"/>`
  },
  {
    id: 'rect',
    label: 'Rectangle Frame / Shape (M)',
    svg: `<rect x="4" y="5" width="16" height="14" rx="1"/>`
  },
  { type: 'divider' },
  {
    id: 'pan',
    label: 'Hand / Pan Tool (H)',
    svg: `<path d="M18 11V6a1.5 1.5 0 0 0-3 0v4"/><path d="M15 10V4.5a1.5 1.5 0 0 0-3 0V10"/><path d="M12 10.5V5.5a1.5 1.5 0 0 0-3 0V12"/><path d="M9 12V9a1.5 1.5 0 0 0-3 0v6a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-4a1.5 1.5 0 0 0-3 0"/>`
  },
  {
    id: 'zoom',
    label: 'Zoom Tool (Z)',
    svg: `<circle cx="11" cy="11" r="6"/><line x1="20" y1="20" x2="15.35" y2="15.35"/>`
  }
];

export class CortexToolbar extends CortexElement {
  constructor() {
    super();
    this._tools = DEFAULT_TOOLS;
  }

  /**
   * Permite customizar os ícones de ferramentas para qualquer tipo de aplicação Web.
   */
  set tools(customTools) {
    if (Array.isArray(customTools)) {
      this._tools = customTools;
      this.render();
    }
  }

  get tools() {
    return this._tools;
  }

  onLanguageChange() {
    this.render();
  }

  onMount() {
    this.watchState('activeTool', (activeTool) => {
      this._updateActiveButton(activeTool);
    });

    this.watchState(['fillColor', 'strokeColor'], () => {
      const fillSwatch = this.shadowRoot.querySelector('.swatch-fill');
      const strokeSwatch = this.shadowRoot.querySelector('.swatch-stroke');
      if (fillSwatch) fillSwatch.style.backgroundColor = AppState.get('fillColor');
      if (strokeSwatch) strokeSwatch.style.borderColor = AppState.get('strokeColor');
    });
  }

  _updateActiveButton(activeTool) {
    this.shadowRoot.querySelectorAll('.tool-btn').forEach((btn) => {
      const isActive = btn.dataset.tool === activeTool;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  render() {
    const currentTool = AppState.get('activeTool');
    const fill = AppState.get('fillColor');
    const stroke = AppState.get('strokeColor');

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 0;
          gap: 3px;
          background-color: var(--bg-panel);
          border-right: 1px solid var(--border-subtle);
          width: var(--toolbar-width);
          height: 100%;
          z-index: 100;
        }

        .tool-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-xs);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          position: relative;
          transition: background var(--transition-fast), color var(--transition-fast);
        }

        .tool-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        /* Destaque azul idêntico ao modelo Desktop */
        .tool-btn.active {
          background-color: var(--accent-blue);
          color: #ffffff;
        }

        .tool-btn svg {
          width: 15px;
          height: 15px;
          stroke: currentColor;
          stroke-width: 1.75;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
        }

        .divider {
          width: 20px;
          height: 1px;
          background-color: var(--border-subtle);
          margin: 3px 0;
        }

        /* Widget Seletor Fill / Stroke Estilo Adobe */
        .color-swatches {
          position: relative;
          width: 26px;
          height: 26px;
          margin: 6px 0 4px;
        }

        .swatch-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 16px;
          height: 16px;
          background-color: ${fill};
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 2px;
          z-index: 2;
          cursor: pointer;
        }

        .swatch-stroke {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 16px;
          height: 16px;
          background-color: var(--bg-panel);
          border: 3px solid ${stroke};
          border-radius: 2px;
          z-index: 1;
          cursor: pointer;
        }

        .color-input-hidden {
          position: absolute;
          opacity: 0;
          width: 1px;
          height: 1px;
          pointer-events: none;
        }

        /* Adaptação Mobile: Doca Flutuante Inferior (FAB Bar) */
        @media (max-width: 768px) {
          :host {
            position: fixed;
            bottom: calc(var(--statusbar-height) + 10px);
            left: 50%;
            transform: translateX(-50%);
            flex-direction: row;
            width: auto;
            height: auto;
            padding: 4px 10px;
            border: 1px solid var(--border-input);
            border-radius: var(--radius-pill);
            background-color: rgba(37, 37, 38, 0.92);
            backdrop-filter: blur(12px);
            box-shadow: var(--shadow-dropdown);
          }

          .divider {
            width: 1px;
            height: 20px;
            margin: 0 3px;
          }

          .color-swatches {
            margin: 0 4px;
          }
        }
      </style>

      ${this._tools
        .map((item) => {
          if (item.type === 'divider') {
            return `<div class="divider" role="separator"></div>`;
          }
          const label = t('tool.' + item.id, item.label);
          return `
            <button
              class="tool-btn ${item.id === currentTool ? 'active' : ''}"
              data-tool="${item.id}"
              title="${label}"
              aria-label="${label}"
              aria-pressed="${item.id === currentTool}"
            >
              <svg viewBox="0 0 24 24">${item.svg}</svg>
            </button>
          `;
        })
        .join('')}

      <div class="divider"></div>

      <!-- Swatches de Preenchimento (Fill) e Contorno (Stroke) -->
      <div class="color-swatches" title="${t('inspector.fill')} &amp; ${t('inspector.stroke')}">
        <div class="swatch-fill" title="${t('inspector.fill')}"></div>
        <div class="swatch-stroke" title="${t('inspector.stroke')}"></div>
        <input type="color" class="color-input-hidden" id="fill-picker" value="${fill}" />
        <input type="color" class="color-input-hidden" id="stroke-picker" value="${stroke}" />
      </div>
    `;

    this.shadowRoot.querySelectorAll('.tool-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const selectedTool = btn.dataset.tool;
        AppState.setState({ activeTool: selectedTool });
        this.emit('cortex-tool-change', { tool: selectedTool });
      });
    });

    const fillPicker = this.shadowRoot.getElementById('fill-picker');
    const strokePicker = this.shadowRoot.getElementById('stroke-picker');

    this.shadowRoot.querySelector('.swatch-fill').addEventListener('click', () => {
      fillPicker.click();
    });
    this.shadowRoot.querySelector('.swatch-stroke').addEventListener('click', () => {
      strokePicker.click();
    });

    fillPicker.addEventListener('input', (e) => {
      AppState.setState({ fillColor: e.target.value });
      this.emit('cortex-update-property', { key: 'fillColor', value: e.target.value });
    });

    strokePicker.addEventListener('input', (e) => {
      AppState.setState({ strokeColor: e.target.value });
      this.emit('cortex-update-property', { key: 'strokeColor', value: e.target.value });
    });
  }
}

customElements.define('cortex-toolbar', CortexToolbar);
