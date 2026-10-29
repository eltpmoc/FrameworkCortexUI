// src/components/cortex-context-menu.js
import { CortexElement } from '../core/CortexElement.js';

export class CortexContextMenu extends CortexElement {
  constructor() {
    super();
    this._isOpen = false;
    this._items = [];
    this._x = 0;
    this._y = 0;
    this._handleOutside = this._handleOutside.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  onLanguageChange() {
    this.render();
  }

  onMount() {
    document.addEventListener('pointerdown', this._handleOutside);
    window.addEventListener('keydown', this._handleKeyDown);
    window.addEventListener('blur', () => this.close());
  }

  onUnmount() {
    document.removeEventListener('pointerdown', this._handleOutside);
    window.removeEventListener('keydown', this._handleKeyDown);
  }

  _handleKeyDown(e) {
    if (e.key === 'Escape' && this._isOpen) {
      this.close();
    }
  }

  _handleOutside(e) {
    if (!this._isOpen) return;
    if (!e.composedPath().includes(this)) {
      this.close();
    }
  }

  /**
   * Abre o Menu de Contexto Desktop nas coordenadas (clientX, clientY).
   */
  open(clientX, clientY, items = []) {
    this._items = items;
    this._isOpen = true;
    this.render();

    const menuEl = this.shadowRoot.getElementById('ctx-menu');
    if (!menuEl) return;

    const menuW = 215;
    const menuH = items.length * 26 + 16;

    this._x = Math.min(clientX, window.innerWidth - menuW - 8);
    this._y = Math.min(clientY, window.innerHeight - menuH - 8);

    menuEl.style.left = `${Math.max(4, this._x)}px`;
    menuEl.style.top = `${Math.max(4, this._y)}px`;
    menuEl.classList.add('open');
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    const menuEl = this.shadowRoot.getElementById('ctx-menu');
    if (menuEl) {
      menuEl.classList.remove('open');
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        .ctx-menu {
          display: none;
          flex-direction: column;
          position: fixed;
          min-width: 210px;
          max-height: 75vh;
          overflow-y: auto;
          background-color: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-dropdown);
          padding: 4px 0;
          z-index: 8500;
        }

        .ctx-menu.open {
          display: flex;
        }

        .ctx-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 6px 12px;
          font-size: var(--text-xs);
          color: var(--text-primary);
          text-align: left;
        }

        .ctx-item:hover {
          background-color: var(--accent-blue);
          color: #ffffff;
        }

        .ctx-item.danger {
          color: #f87171;
        }

        .ctx-item.danger:hover {
          background-color: var(--status-error);
          color: #ffffff;
        }

        .shortcut {
          font-size: 10px;
          color: var(--text-muted);
          margin-left: 18px;
        }

        .ctx-item:hover .shortcut {
          color: rgba(255, 255, 255, 0.85);
        }

        .divider {
          height: 1px;
          background-color: var(--border-subtle);
          margin: 4px 0;
        }
      </style>

      <div class="ctx-menu ${this._isOpen ? 'open' : ''}" id="ctx-menu" role="menu">
        ${this._items
          .map((item, idx) =>
            item.type === 'divider'
              ? `<div class="divider" role="separator"></div>`
              : `
              <button
                type="button"
                class="ctx-item ${item.danger ? 'danger' : ''}"
                data-idx="${idx}"
                role="menuitem"
              >
                <span>${item.label}</span>
                <span class="shortcut">${item.shortcut || ''}</span>
              </button>
            `
          )
          .join('')}
      </div>
    `;

    this.shadowRoot.querySelectorAll('.ctx-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = this._items[Number(btn.dataset.idx)];
        this.close();
        if (item?.onClick) item.onClick();
        if (item?.action) {
          this.emit('cortex-context-action', { action: item.action, payload: item.payload });
        }
      });
    });
  }
}

customElements.define('cortex-context-menu', CortexContextMenu);
