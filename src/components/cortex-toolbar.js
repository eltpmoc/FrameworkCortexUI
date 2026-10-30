// src/components/cortex-toolbar.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';
import { t } from '../core/i18n.js';

export const DEFAULT_DESIGN_TOOLS = [
  // 1. Ferramentas de Seleção
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

  // 2. Formas Geométricas para Design
  {
    id: 'rect',
    label: 'Rectangle Tool (M)',
    svg: `<rect x="4" y="5" width="16" height="14" rx="1"/>`
  },
  {
    id: 'rounded-rect',
    label: 'Rounded Rectangle (U)',
    svg: `<rect x="4" y="5" width="16" height="14" rx="4"/>`
  },
  {
    id: 'ellipse',
    label: 'Ellipse / Circle Tool (O)',
    svg: `<circle cx="12" cy="12" r="8"/>`
  },
  {
    id: 'polygon',
    label: 'Polygon / Triangle Tool (G)',
    svg: `<polygon points="12 4 20 19 4 19"/>`
  },
  {
    id: 'star',
    label: 'Star Tool (S)',
    svg: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`
  },
  {
    id: 'diamond',
    label: 'Diamond / Flowchart Tool (D)',
    svg: `<polygon points="12 3 21 12 12 21 3 12"/>`
  },
  { type: 'divider' },

  // 3. Linhas, Setas e Traços Vetoriais
  {
    id: 'line',
    label: 'Line Tool (L)',
    svg: `<line x1="4" y1="20" x2="20" y2="4"/>`
  },
  {
    id: 'arrow',
    label: 'Arrow Tool (W)',
    svg: `<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>`
  },
  {
    id: 'pen',
    label: 'Pen Tool / Bézier (P)',
    svg: `<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.5 7.5"/>`
  },
  {
    id: 'pencil',
    label: 'Pencil / Freehand Brush (N)',
    svg: `<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>`
  },
  { type: 'divider' },

  // 4. Tipografia e Balões
  {
    id: 'text',
    label: 'Type Tool (T)',
    svg: `<polyline points="5 7 5 4 19 4 19 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>`
  },
  {
    id: 'callout',
    label: 'Callout / Speech Bubble (C)',
    svg: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`
  },
  { type: 'divider' },

  // 5. Transformação e Edição
  {
    id: 'rotate',
    label: 'Rotate Tool (R)',
    svg: `<path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>`
  },
  {
    id: 'eyedropper',
    label: 'Eyedropper / Color Picker (I)',
    svg: `<path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2l5 5"/><circle cx="19" cy="19" r="1.5"/>`
  },
  {
    id: 'eraser',
    label: 'Eraser Tool (E)',
    svg: `<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>`
  },
  { type: 'divider' },

  // 6. Navegação e Visualização
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
    this._tools = DEFAULT_DESIGN_TOOLS;
  }

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
    const fill = AppState.get('fillColor') || '#10b981';
    const stroke = AppState.get('strokeColor') || '#18181b';

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 0;
          gap: 2.5px;
          background-color: var(--bg-panel);
          border-right: 1px solid var(--border-subtle);
          width: var(--toolbar-width, 36px);
          height: 100%;
          z-index: 100;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
        }

        :host::-webkit-scrollbar {
          display: none;
        }

        .tool-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-xs, 4px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          position: relative;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast), color var(--transition-fast), transform 0.1s ease;
          flex-shrink: 0;
        }

        .tool-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
          transform: scale(1.05);
        }

        .tool-btn.active {
          background-color: var(--accent-blue) !important;
          color: #ffffff !important;
          box-shadow: 0 1px 4px rgba(2, 132, 199, 0.4);
        }

        .tool-btn svg {
          width: 15px;
          height: 15px;
          stroke: currentColor;
          stroke-width: 1.75;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          pointer-events: none;
        }

        .divider {
          width: 20px;
          height: 1px;
          background-color: var(--border-subtle);
          margin: 3px 0;
          flex-shrink: 0;
        }

        /* Widget Seletor Fill / Stroke Estilo Adobe */
        .color-swatches {
          position: relative;
          width: 26px;
          height: 26px;
          margin: 5px 0 6px;
          flex-shrink: 0;
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
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
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
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
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
            bottom: calc(var(--statusbar-height, 28px) + 8px);
            left: 50%;
            transform: translateX(-50%);
            flex-direction: row;
            width: auto;
            max-width: 95vw;
            height: auto;
            padding: 4px 8px;
            border: 1px solid var(--border-input);
            border-radius: var(--radius-pill, 9999px);
            background-color: rgba(37, 37, 38, 0.94);
            backdrop-filter: blur(12px);
            box-shadow: var(--shadow-dropdown);
            overflow-x: auto;
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
        <div class="swatch-fill" title="${t('inspector.fill')}: ${fill}"></div>
        <div class="swatch-stroke" title="${t('inspector.stroke')}: ${stroke}"></div>
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

    this.shadowRoot.querySelector('.swatch-fill')?.addEventListener('click', () => {
      fillPicker?.click();
    });
    this.shadowRoot.querySelector('.swatch-stroke')?.addEventListener('click', () => {
      strokePicker?.click();
    });

    fillPicker?.addEventListener('input', (e) => {
      AppState.setState({ fillColor: e.target.value });
      this.emit('cortex-update-property', { key: 'fillColor', value: e.target.value });
    });

    strokePicker?.addEventListener('input', (e) => {
      AppState.setState({ strokeColor: e.target.value });
      this.emit('cortex-update-property', { key: 'strokeColor', value: e.target.value });
    });
  }
}

customElements.define('cortex-toolbar', CortexToolbar);
