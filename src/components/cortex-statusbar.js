// src/components/cortex-statusbar.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';
import { t } from '../core/i18n.js';

export class CortexStatusbar extends CortexElement {
  onLanguageChange() {
    this.render();
  }

  onMount() {
    this.watchState(['currentPage', 'totalPages'], () => this._syncPagination());
    this.watchState('zoom', (zoom) => this._syncZoom(zoom));
    this.watchState('statusMessage', (msg) => {
      const el = this.shadowRoot.querySelector('.status-msg-text');
      if (el) el.textContent = msg;
    });
    this.watchState('engineStatus', (eng) => {
      const el = this.shadowRoot.querySelector('.engine-msg-text');
      if (el) el.textContent = eng;
    });
  }

  _syncPagination() {
    const label = this.shadowRoot.querySelector('.page-val');
    if (label) {
      label.textContent = `${AppState.get('currentPage')}`;
    }
  }

  _syncZoom(zoom) {
    const label = this.shadowRoot.querySelector('.zoom-val');
    if (label) {
      label.textContent = `${zoom}%`;
    }
  }

  render() {
    const page = AppState.get('currentPage');
    const zoom = AppState.get('zoom');
    const statusMsg = AppState.get('statusMessage');
    const engineMsg = AppState.get('engineStatus');

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: var(--statusbar-height);
          background: var(--statusbar-bg, var(--bg-panel));
          border-top: 1px solid var(--border-subtle);
          padding: 0 var(--space-2);
          font-size: 11px;
          color: var(--statusbar-text, var(--text-secondary));
        }

        .left-zone {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .control-cluster {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .muted-label {
          color: inherit;
          opacity: 0.85;
          margin-right: 2px;
        }

        .step-btn {
          width: 18px;
          height: 18px;
          border-radius: var(--radius-xs);
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          line-height: 1;
        }

        .step-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .value-pill {
          min-width: 24px;
          height: 18px;
          padding: 0 5px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-size: 11px;
        }

        .v-sep {
          width: 1px;
          height: 12px;
          background-color: var(--border-subtle);
          margin: 0 4px;
        }

        /* Centro: Status / Diagnóstico com Ponto Verde */
        .center-zone {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: inherit;
        }

        .dot-green {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--status-ok);
          box-shadow: 0 0 6px var(--status-ok);
        }

        /* Direita: Status de Motor/Performance com Ponto Ciano */
        .right-zone {
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          color: inherit;
        }

        .dot-cyan {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--status-cyan);
          box-shadow: 0 0 6px var(--status-cyan);
        }

        @media (max-width: 768px) {
          :host {
            grid-template-columns: 1fr;
          }
          .center-zone,
          .right-zone {
            display: none;
          }
          .left-zone {
            justify-content: space-between;
          }
        }
      </style>

      <!-- Esquerda: Page < 1 > | - 100% + (Idêntico à Imagem) -->
      <div class="left-zone">
        <div class="control-cluster">
          <span class="muted-label">${t('statusbar.page')}</span>
          <button class="step-btn" data-page-act="prev" title="${t('statusbar.prevPage')}">&lsaquo;</button>
          <span class="value-pill page-val">${page}</span>
          <button class="step-btn" data-page-act="next" title="${t('statusbar.nextPage')}">&rsaquo;</button>
        </div>

        <div class="v-sep"></div>

        <div class="control-cluster">
          <button class="step-btn" data-zoom-act="out" title="${t('statusbar.zoomOut')}">&minus;</button>
          <span class="value-pill zoom-val">${zoom}%</span>
          <button class="step-btn" data-zoom-act="in" title="${t('statusbar.zoomIn')}">&plus;</button>
        </div>
      </div>

      <!-- Centro: Diagnóstico -->
      <div class="center-zone">
        <span class="dot-green"></span>
        <span class="status-msg-text">${statusMsg && statusMsg.includes('No errors') ? t('statusbar.working') : statusMsg}</span>
      </div>

      <!-- Direita: Telemetria / Motor -->
      <div class="right-zone">
        <span class="dot-cyan"></span>
        <span class="engine-msg-text">${t('statusbar.engineActive')}</span>
      </div>
    `;

    this.shadowRoot.querySelector('[data-page-act="prev"]')?.addEventListener('click', () => {
      const cur = AppState.get('currentPage');
      if (cur > 1) AppState.setState({ currentPage: cur - 1 });
    });

    this.shadowRoot.querySelector('[data-page-act="next"]')?.addEventListener('click', () => {
      const cur = AppState.get('currentPage');
      const max = Math.max(cur + 1, AppState.get('totalPages'));
      AppState.setState({ currentPage: cur + 1, totalPages: max });
    });

    this.shadowRoot.querySelector('[data-zoom-act="out"]')?.addEventListener('click', () => {
      const nextZoom = Math.max(25, AppState.get('zoom') - 25);
      AppState.setState({ zoom: nextZoom });
      this.emit('cortex-zoom-change', { zoom: nextZoom });
    });

    this.shadowRoot.querySelector('[data-zoom-act="in"]')?.addEventListener('click', () => {
      const nextZoom = Math.min(400, AppState.get('zoom') + 25);
      AppState.setState({ zoom: nextZoom });
      this.emit('cortex-zoom-change', { zoom: nextZoom });
    });
  }
}

customElements.define('cortex-statusbar', CortexStatusbar);
