// src/components/cortex-command-palette.js
import { CortexElement } from '../core/CortexElement.js';
import { getLanguage } from '../core/i18n.js';

const DEFAULT_COMMANDS = [
  { id: 'new-doc', category: 'File', label: 'New Document...', shortcut: 'Ctrl+N' },
  { id: 'save-json', category: 'File', label: 'Export Scene to JSON', shortcut: 'Ctrl+S' },
  { id: 'open-json', category: 'File', label: 'Import Scene from JSON...', shortcut: 'Ctrl+O' },
  { id: 'export-image', category: 'File', label: 'Export Stage as PNG Image', shortcut: 'Ctrl+E' },
  { id: 'import-image', category: 'Insert', label: 'Import JPG, PNG or WebP Image to Stage...', shortcut: 'Ctrl+D' },
  { id: 'add-rect', category: 'Insert', label: 'Insert Default Rectangle on Active Page', shortcut: 'M' },
  { id: 'tool-text', category: 'Insert', label: 'Activate Text Frame Tool', shortcut: 'T' },
  { id: 'tool-pen', category: 'Insert', label: 'Activate Vector Pen / Path Tool', shortcut: 'P' },
  { id: 'insert-table', category: 'Window', label: 'Open Desktop Data Grid / Table Window', shortcut: 'Ctrl+Alt+T' },
  { id: 'open-tree', category: 'Window', label: 'Open DOM / Scene TreeView Explorer', shortcut: 'F8' },
  { id: 'open-docs', category: 'Docs', label: 'Open CortexUI Documentation & Component Manual', shortcut: 'F1' },
  { id: 'open-login', category: 'Auth UI', label: 'Open Login Screens Showcase (All 10 Models)', shortcut: 'F9' },
  { id: 'theme-dark', category: 'Theme', label: 'Switch Theme: Cortex Dark Pro (Padrão)', shortcut: '' },
  { id: 'theme-hacker', category: 'Theme', label: 'Switch Theme: Hacker Terminal (Matrix Phosphor #00ff66)', shortcut: '' },
  { id: 'theme-futuristic', category: 'Theme', label: 'Switch Theme: Ultra-Futurista (Quantum Holo-HUD 2099)', shortcut: '' },
  { id: 'theme-macos', category: 'Theme', label: 'Switch Theme: macOS Light (Cupertino Claro)', shortcut: '' },
  { id: 'theme-macos-ventura', category: 'Theme', label: 'Switch Theme: macOS Ventura (Poppy & Ocean)', shortcut: '' },
  { id: 'theme-medium-green', category: 'Theme', label: 'Switch Theme: Médio (Verde Suave & Cinza Escuro)', shortcut: '' },
  { id: 'theme-medium-blue', category: 'Theme', label: 'Switch Theme: Médio (Azul Suave & Cinza Escuro)', shortcut: '' },
  { id: 'theme-win12', category: 'Theme', label: 'Switch Theme: Windows 12 (Fluent Lavender)', shortcut: '' },
  { id: 'theme-winxp', category: 'Theme', label: 'Switch Theme: Windows XP (Luna Blue & Beige)', shortcut: '' },
  { id: 'theme-win2000', category: 'Theme', label: 'Switch Theme: Windows 2000 (Win2000 Classic)', shortcut: '' },
  { id: 'theme-win98', category: 'Theme', label: 'Switch Theme: Windows 98 SE (Teal & Silver)', shortcut: '' },
  { id: 'theme-msdos', category: 'Theme', label: 'Switch Theme: MS-DOS Editor (EDIT.COM VGA)', shortcut: '' },
  { id: 'margins-guides', category: 'Layout', label: 'Configure Page Margins & Columns...', shortcut: '' },
  { id: 'toggle-rulers', category: 'View', label: 'Toggle Rulers Visibility', shortcut: 'Ctrl+R' },
  { id: 'toggle-guides', category: 'View', label: 'Toggle Margin Guides Visibility', shortcut: 'Ctrl+;' },
  { id: 'toggle-grid', category: 'View', label: 'Toggle Document Grid', shortcut: "Ctrl+'" },
  { id: 'zoom-in', category: 'View', label: 'Zoom In (+25%)', shortcut: 'Ctrl++' },
  { id: 'zoom-out', category: 'View', label: 'Zoom Out (-25%)', shortcut: 'Ctrl+-' },
  { id: 'zoom-reset', category: 'View', label: 'Reset Zoom to 100%', shortcut: 'Ctrl+1' },
  { id: 'undo', category: 'Edit', label: 'Undo Last Action', shortcut: 'Ctrl+Z' },
  { id: 'redo', category: 'Edit', label: 'Redo Last Action', shortcut: 'Ctrl+Y' },
  { id: 'about', category: 'Help', label: 'About CortexUI Framework', shortcut: 'F1' }
];

export class CortexCommandPalette extends CortexElement {
  constructor() {
    super();
    this._isOpen = false;
    this._query = '';
    this._selectedIndex = 0;
    this._commands = DEFAULT_COMMANDS;
    this._onGlobalKeyDown = this._onGlobalKeyDown.bind(this);
  }

  onLanguageChange() {
    this.render();
  }

  onMount() {
    window.addEventListener('keydown', this._onGlobalKeyDown);
  }

  onUnmount() {
    window.removeEventListener('keydown', this._onGlobalKeyDown);
  }

  _onGlobalKeyDown(e) {
    // Atalho global Ctrl+K ou Ctrl+P abre/fecha a Paleta de Comandos Desktop
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'p')) {
      e.preventDefault();
      this.toggle();
      return;
    }

    if (!this._isOpen) return;

    const filtered = this._getFilteredCommands();
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._selectedIndex = (this._selectedIndex + 1) % Math.max(1, filtered.length);
      this._updateListHighlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._selectedIndex =
        (this._selectedIndex - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length);
      this._updateListHighlight();
    } else if (e.key === 'Enter' && filtered[this._selectedIndex]) {
      e.preventDefault();
      this._executeCommand(filtered[this._selectedIndex].id);
    }
  }

  open(initialQuery = '') {
    this._isOpen = true;
    this._query = initialQuery;
    this._selectedIndex = 0;
    this.render();
    requestAnimationFrame(() => {
      const input = this.shadowRoot.getElementById('cmd-input');
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    const backdrop = this.shadowRoot.getElementById('backdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
    }
  }

  toggle() {
    if (this._isOpen) this.close();
    else this.open();
  }

  _getFilteredCommands() {
    const q = this._query.toLowerCase().trim();
    if (!q) return this._commands;
    return this._commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }

  _executeCommand(cmdId) {
    this.close();
    this.emit('cortex-menu-action', { action: cmdId });
  }

  _updateListHighlight() {
    this.shadowRoot.querySelectorAll('.cmd-item').forEach((el, idx) => {
      el.classList.toggle('active', idx === this._selectedIndex);
      if (idx === this._selectedIndex) {
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  render() {
    const filtered = this._getFilteredCommands();

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        .backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.52);
          backdrop-filter: blur(2px);
          justify-content: center;
          align-items: flex-start;
          padding-top: 10vh;
          z-index: 8800;
        }

        .backdrop.open {
          display: flex;
        }

        .palette-box {
          width: min(92vw, 480px);
          background-color: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .search-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          height: 38px;
          border-bottom: 1px solid var(--border-subtle);
          background-color: var(--bg-input);
        }

        .search-header input {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: var(--text-sm);
          outline: none;
        }

        .kbd-hint {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          background: var(--bg-panel);
          padding: 3px 6px;
          border-radius: 3px;
          border: 1px solid var(--border-subtle);
          cursor: pointer;
        }

        .kbd-hint:hover {
          background: var(--status-error);
          color: #ffffff;
          border-color: var(--status-error);
        }

        .cmd-list {
          max-height: 280px;
          overflow-y: auto;
          padding: 4px;
          display: flex;
          flex-direction: column;
        }

        .cmd-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 10px;
          border-radius: var(--radius-xs);
          text-align: left;
          font-size: var(--text-xs);
          color: var(--text-primary);
          flex-shrink: 0;
        }

        .cmd-item.active,
        .cmd-item:hover {
          background-color: var(--accent-blue);
          color: #ffffff;
        }

        .cat-badge {
          font-size: 10px;
          color: var(--text-muted);
          margin-right: 8px;
          text-transform: uppercase;
        }

        .cmd-item.active .cat-badge,
        .cmd-item:hover .cat-badge,
        .cmd-item.active .shortcut,
        .cmd-item:hover .shortcut {
          color: rgba(255, 255, 255, 0.85);
        }

        .shortcut {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
        }
      </style>

      <div class="backdrop ${this._isOpen ? 'open' : ''}" id="backdrop">
        <div class="palette-box" id="palette-box">
          <div class="search-header">
            <input
              type="text"
              id="cmd-input"
              placeholder="${getLanguage() === 'pt-BR' ? 'Digite um comando ou busque ações (Ctrl+K)...' : 'Type a command or search actions (Ctrl+K)...'}"
              value="${this._query}"
            />
            <button type="button" class="kbd-hint" id="btn-close-esc" title="Fechar (ESC)">ESC &times;</button>
          </div>
          <div class="cmd-list" id="cmd-list">
            ${filtered
              .map(
                (cmd, idx) => `
              <button
                type="button"
                class="cmd-item ${idx === this._selectedIndex ? 'active' : ''}"
                data-cmd-id="${cmd.id}"
              >
                <div>
                  <span class="cat-badge">[${cmd.category}]</span>
                  <span>${cmd.label}</span>
                </div>
                <span class="shortcut">${cmd.shortcut}</span>
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    const backdrop = this.shadowRoot.getElementById('backdrop');
    const paletteBox = this.shadowRoot.getElementById('palette-box');
    const input = this.shadowRoot.getElementById('cmd-input');
    const btnCloseEsc = this.shadowRoot.getElementById('btn-close-esc');

    backdrop.addEventListener('pointerdown', (e) => {
      if (!paletteBox.contains(e.target)) {
        this.close();
      }
    });

    btnCloseEsc.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    input.addEventListener('input', (e) => {
      this._query = e.target.value;
      this._selectedIndex = 0;
      this._rerenderListOnly();
    });

    this._bindItemClicks();
  }

  _rerenderListOnly() {
    const listEl = this.shadowRoot.getElementById('cmd-list');
    if (!listEl) return;
    const filtered = this._getFilteredCommands();
    listEl.innerHTML = filtered
      .map(
        (cmd, idx) => `
        <button
          type="button"
          class="cmd-item ${idx === this._selectedIndex ? 'active' : ''}"
          data-cmd-id="${cmd.id}"
        >
          <div>
            <span class="cat-badge">[${cmd.category}]</span>
            <span>${cmd.label}</span>
          </div>
          <span class="shortcut">${cmd.shortcut}</span>
        </button>
      `
      )
      .join('');
    this._bindItemClicks();
  }

  _bindItemClicks() {
    this.shadowRoot.querySelectorAll('.cmd-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._executeCommand(btn.dataset.cmdId);
      });
    });
  }
}

customElements.define('cortex-command-palette', CortexCommandPalette);
