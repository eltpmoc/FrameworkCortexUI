// src/components/cortex-floating-window.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';

export class CortexFloatingWindow extends CortexElement {
  constructor() {
    super();
    this._windows = []; // Array de janelas MDI abertas { id, title, type, x, y, minimized, zIndex }
    this._topZ = 1500;
    this._activeWinId = null;
    this._gridQuery = '';
    this._checkedRowIds = new Set();
  }

  onLanguageChange() {
    this.render();
  }

  onMount() {
    this.watchState(['sceneNodes', 'currentPage', 'selectedNodeId'], () => {
      if (this._windows.length > 0) {
        this.render();
      }
    });
  }

  /**
   * Traz uma janela flutuante imediatamente para a frente (Z-Index superior)
   * sem recriar o DOM durante um clique ou arraste.
   */
  bringToFront(id) {
    const target = this._windows.find((w) => w.id === id);
    if (!target) return;

    this._topZ += 1;
    target.zIndex = this._topZ;
    this._activeWinId = id;

    if (!this.shadowRoot) return;
    this.shadowRoot.querySelectorAll('.floating-win').forEach((el) => {
      const isTarget = el.dataset.winId === id;
      if (isTarget) {
        el.style.zIndex = String(target.zIndex);
      }
      el.classList.toggle('active-window', isTarget);
      el.classList.toggle('inactive-window', !isTarget);
    });
  }

  /**
   * Abre ou foca uma Janela Flutuante Desktop (Data Grid / TreeView / Custom).
   */
  openWindow({ id, title, type = 'datatable' }) {
    const existing = this._windows.find((w) => w.id === id);
    if (existing) {
      existing.minimized = false;
      this._topZ += 1;
      existing.zIndex = this._topZ;
      this._activeWinId = existing.id;
      this.render();
      return;
    }

    const offset = this._windows.length * 26;
    const winId = id || `win-${Date.now()}`;
    this._topZ += 1;
    this._activeWinId = winId;

    this._windows.push({
      id: winId,
      title: title || 'Desktop Window',
      type,
      x: 110 + offset,
      y: 80 + offset,
      minimized: false,
      zIndex: this._topZ
    });
    this.render();
  }

  closeWindow(id) {
    this._windows = this._windows.filter((w) => w.id !== id);
    if (this._activeWinId === id) {
      const topRemaining = [...this._windows].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))[0];
      this._activeWinId = topRemaining ? topRemaining.id : null;
    }
    this.render();
  }

  _renderWindowContent(win) {
    const nodes = AppState.get('sceneNodes') || [];

    if (win.type === 'office-api') {
      return `<cortex-office-api style="width: 100%; height: 100%; display: block; overflow: auto;"></cortex-office-api>`;
    }

    if (win.type === 'spreadsheet') {
      return `<cortex-spreadsheet style="width: 100%; height: 100%; display: flex; flex-direction: column;"></cortex-spreadsheet>`;
    }

    if (win.type === 'rich-edit') {
      return `<cortex-rich-edit style="width: 100%; height: 100%; display: flex; flex-direction: column;"></cortex-rich-edit>`;
    }

    if (win.type === 'file-manager') {
      return `<cortex-file-manager style="width: 100%; height: 100%; display: flex; flex-direction: column;"></cortex-file-manager>`;
    }

    if (win.type === 'file-uploader') {
      return `<cortex-file-uploader style="width: 100%; height: 100%; display: block; overflow: auto;"></cortex-file-uploader>`;
    }

    if (win.type === 'chat-photo') {
      return `<cortex-chat-photo style="width: 100%; height: 100%; display: flex; flex-direction: column;"></cortex-chat-photo>`;
    }

    if (win.type === 'chat-initials') {
      return `<cortex-chat-initials style="width: 100%; height: 100%; display: flex; flex-direction: column;"></cortex-chat-initials>`;
    }

    if (win.type === 'chat-showcase') {
      return `<cortex-chat-showcase style="width: 100%; height: 100%; display: flex; flex-direction: column;"></cortex-chat-showcase>`;
    }

    if (win.type === 'datatable') {
      const q = this._gridQuery.trim().toLowerCase();
      const filteredNodes = nodes.filter(
        (n) =>
          !q ||
          String(n.name || '').toLowerCase().includes(q) ||
          String(n.type || '').toLowerCase().includes(q) ||
          String(n.fill || '').toLowerCase().includes(q)
      );
      return `
        <div class="win-toolbar" style="gap: 8px; flex-wrap: wrap;">
          <span>Data Grid (${filteredNodes.length}/${nodes.length})</span>
          <input
            type="text"
            id="datagrid-search-input"
            placeholder="&#128269; Filtrar na tabela..."
            value="${this._gridQuery}"
            style="height: 22px; padding: 0 8px; border-radius: var(--radius-xs); background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-input); font-size: 10.5px; flex: 1; min-width: 120px;"
          />
          <button class="mini-act" data-win-act="add-row">+ Novo Registro</button>
        </div>
        <div class="table-scroll">
          <table class="cortex-table">
            <thead>
              <tr>
                <th style="width: 26px; text-align:center;">&#10003;</th>
                <th>ID</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Página</th>
                <th>X (px)</th>
                <th>Y (px)</th>
                <th>W × H</th>
                <th>Cor Fill</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredNodes.length === 0
                  ? `<tr><td colspan="9" style="text-align:center; color: var(--text-muted); padding: 14px;">Nenhum registro encontrado.</td></tr>`
                  : filteredNodes
                      .map(
                        (n) => `
                  <tr data-row-id="${n.id}" class="${n.id === AppState.get('selectedNodeId') ? 'active-row' : ''}">
                    <td style="text-align:center;">
                      <input type="checkbox" data-row-chk="${n.id}" ${this._checkedRowIds.has(n.id) ? 'checked' : ''} />
                    </td>
                    <td class="mono">${n.id.slice(-6)}</td>
                    <td><strong>${n.name}</strong></td>
                    <td><span class="tag">${n.type.toUpperCase()}</span></td>
                    <td>Pág. ${n.page || 1}</td>
                    <td class="mono">${Math.round(n.x)}</td>
                    <td class="mono">${Math.round(n.y)}</td>
                    <td class="mono">${Math.round(n.width)} × ${Math.round(n.height)}</td>
                    <td>
                      <span class="swatch-dot" style="background:${n.fill};"></span>
                      <span class="mono">${n.fill}</span>
                    </td>
                  </tr>`
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      `;
    }

    // TreeView Explorer (Hierarquia de Documentos -> Páginas -> Camadas)
    const totalPages = AppState.get('totalPages') || 1;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return `
      <div class="tree-container">
        <div class="tree-root">&#128193; ${AppState.get('appName')} Project</div>
        ${pages
          .map((p) => {
            const pageNodes = nodes.filter((n) => Number(n.page || 1) === p);
            return `
              <div class="tree-branch">
                <div class="tree-page" data-goto-page="${p}">
                  &#128196; Página ${p} <span class="muted">(${pageNodes.length} itens)</span>
                </div>
                <div class="tree-children">
                  ${pageNodes
                    .map(
                      (n) => `
                      <div class="tree-leaf ${n.id === AppState.get('selectedNodeId') ? 'selected' : ''}" data-select-node="${n.id}" data-node-page="${p}">
                        <span>&#9500;&#9472; ${n.name}</span>
                        <span class="tag">${n.type}</span>
                      </div>`
                    )
                    .join('')}
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        .floating-win {
          position: fixed;
          width: min(92vw, 540px);
          background-color: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-dropdown);
          z-index: 1500;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: border-color 0.12s ease, box-shadow 0.12s ease;
        }

        .floating-win.active-window {
          border-color: var(--border-focus, var(--accent-blue));
          box-shadow: var(--shadow-modal, var(--shadow-dropdown));
        }

        .floating-win.inactive-window .win-header {
          opacity: 0.82;
        }

        .floating-win.tree-win {
          width: min(88vw, 310px);
        }

        .floating-win.doc-large-win {
          width: min(95vw, 1040px);
        }

        .floating-win.doc-large-win .win-body {
          max-height: 82vh;
          height: 660px;
        }

        .floating-win.doc-medium-win {
          width: min(92vw, 860px);
        }

        .floating-win.doc-medium-win .win-body {
          max-height: 76vh;
          height: 560px;
        }

        .floating-win.chat-win {
          width: min(92vw, 480px);
        }

        .floating-win.chat-win .win-body {
          max-height: 82vh;
          height: 600px;
        }

        .floating-win.chat-showcase-win {
          width: min(96vw, 1060px);
        }

        .floating-win.chat-showcase-win .win-body {
          max-height: 84vh;
          height: 640px;
        }

        .win-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 28px;
          padding: 0 10px;
          background: var(--win-header-bg, var(--bg-panel-header));
          color: var(--win-header-text, var(--text-primary));
          border-bottom: 1px solid var(--border-subtle);
          cursor: move;
          font-size: var(--text-xs);
          font-weight: 600;
        }

        .win-controls {
          display: inline-flex;
          gap: 4px;
        }

        .win-btn {
          width: 18px;
          height: 18px;
          border-radius: 2px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: inherit;
          opacity: 0.85;
          font-size: 12px;
        }

        .win-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .win-btn.close:hover {
          background-color: var(--status-error);
          color: #ffffff;
        }

        .win-body {
          display: flex;
          flex-direction: column;
          max-height: 320px;
          overflow: hidden;
          font-size: 11px;
        }

        .win-body.minimized {
          display: none;
        }

        .win-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          background-color: var(--bg-elevated);
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-secondary);
        }

        .mini-act {
          height: 22px;
          padding: 0 8px;
          background-color: var(--accent-blue);
          color: #ffffff;
          border-radius: var(--radius-xs);
          font-size: 10px;
          font-weight: 600;
        }

        .table-scroll {
          overflow: auto;
          max-height: 260px;
        }

        .cortex-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .cortex-table th {
          position: sticky;
          top: 0;
          background-color: var(--bg-panel-header);
          color: var(--text-secondary);
          font-weight: 600;
          padding: 6px 8px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .cortex-table td {
          padding: 5px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
          cursor: pointer;
        }

        .cortex-table tr:hover td {
          background-color: var(--bg-hover);
        }

        .cortex-table tr.active-row td {
          background-color: var(--accent-blue-alpha);
        }

        .mono {
          font-family: var(--font-mono);
          font-size: 10px;
        }

        .tag {
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          padding: 1px 4px;
          border-radius: 2px;
          font-size: 9px;
          color: var(--text-secondary);
        }

        .swatch-dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 2px;
          margin-right: 4px;
          vertical-align: middle;
        }

        /* TreeView */
        .tree-container {
          padding: 10px;
          overflow-y: auto;
          max-height: 290px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tree-root {
          font-weight: 700;
          color: var(--text-primary);
        }

        .tree-branch {
          padding-left: 10px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .tree-page {
          cursor: pointer;
          padding: 3px 6px;
          border-radius: var(--radius-xs);
          font-weight: 600;
        }

        .tree-page:hover {
          background: var(--bg-hover);
        }

        .tree-children {
          padding-left: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tree-leaf {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px 6px;
          border-radius: var(--radius-xs);
          cursor: pointer;
          color: var(--text-secondary);
        }

        .tree-leaf:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .tree-leaf.selected {
          background: var(--accent-blue-alpha);
          color: var(--accent-text);
          font-weight: 600;
        }
      </style>

      ${this._windows
        .map(
          (win) => {
            const isDocLarge = ['office-api', 'spreadsheet', 'rich-edit', 'file-manager'].includes(win.type);
            const isDocMedium = win.type === 'file-uploader';
            const isChat = ['chat-photo', 'chat-initials'].includes(win.type);
            const isChatShowcase = win.type === 'chat-showcase';
            const extraClass = isDocLarge ? 'doc-large-win' : (isDocMedium ? 'doc-medium-win' : (isChatShowcase ? 'chat-showcase-win' : (isChat ? 'chat-win' : (win.type === 'tree' ? 'tree-win' : ''))));
            return `
        <div
          class="floating-win ${extraClass} ${this._activeWinId === win.id ? 'active-window' : 'inactive-window'}"
          data-win-id="${win.id}"
          style="left: ${win.x}px; top: ${win.y}px; z-index: ${win.zIndex || 1500};"
        >
          <div class="win-header" data-drag-win="${win.id}">
            <span>${win.title}</span>
            <div class="win-controls">
              <button class="win-btn" data-min-win="${win.id}" title="Minimizar / Expandir">&minus;</button>
              <button class="win-btn close" data-close-win="${win.id}" title="Fechar">&times;</button>
            </div>
          </div>
          <div class="win-body ${win.minimized ? 'minimized' : ''}">
            ${this._renderWindowContent(win)}
          </div>
        </div>
      `;
          }
        )
        .join('')}
    `;

    // Ao clicar em qualquer parte de uma janela flutuante, trazê-la imediatamente para frente (Z-Index superior)
    this.shadowRoot.querySelectorAll('.floating-win').forEach((winEl) => {
      winEl.addEventListener('pointerdown', () => {
        this.bringToFront(winEl.dataset.winId);
      });
    });

    // Dragging das Janelas Flutuantes
    this.shadowRoot.querySelectorAll('[data-drag-win]').forEach((header) => {
      const winId = header.dataset.dragWin;
      const winObj = this._windows.find((w) => w.id === winId);
      const winEl = header.closest('.floating-win');
      let dragging = false;
      let startX = 0;
      let startY = 0;

      header.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.win-btn')) return;
        header.setPointerCapture(e.pointerId);
        dragging = true;
        startX = e.clientX - winObj.x;
        startY = e.clientY - winObj.y;
      });

      header.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        winObj.x = Math.max(0, Math.min(window.innerWidth - 120, e.clientX - startX));
        winObj.y = Math.max(30, Math.min(window.innerHeight - 60, e.clientY - startY));
        winEl.style.left = `${winObj.x}px`;
        winEl.style.top = `${winObj.y}px`;
      });

      header.addEventListener('pointerup', () => {
        dragging = false;
      });
    });

    this.shadowRoot.querySelectorAll('[data-min-win]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const winObj = this._windows.find((w) => w.id === btn.dataset.minWin);
        if (winObj) {
          winObj.minimized = !winObj.minimized;
          this.render();
        }
      });
    });

    this.shadowRoot.querySelectorAll('[data-close-win]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.closeWindow(btn.dataset.closeWin);
      });
    });

    this.shadowRoot.querySelectorAll('[data-win-act="add-row"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.emit('cortex-quick-action', { action: 'add-rect' });
      });
    });

    const dgSearch = this.shadowRoot.querySelector('#datagrid-search-input');
    dgSearch?.addEventListener('input', (e) => {
      const pos = e.target.selectionStart;
      this._gridQuery = e.target.value;
      this.render();
      const next = this.shadowRoot.querySelector('#datagrid-search-input');
      if (next) {
        next.focus();
        next.setSelectionRange(pos, pos);
      }
    });

    this.shadowRoot.querySelectorAll('[data-row-chk]').forEach((chk) => {
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = chk.dataset.rowChk;
        if (chk.checked) {
          this._checkedRowIds.add(id);
        } else {
          this._checkedRowIds.delete(id);
        }
      });
    });

    this.shadowRoot.querySelectorAll('[data-row-id]').forEach((row) => {
      row.addEventListener('click', () => {
        const id = row.dataset.rowId;
        const target = (AppState.get('sceneNodes') || []).find((n) => n.id === id);
        if (target && target.page) {
          AppState.setState({ currentPage: Number(target.page) });
        }
        this.emit('cortex-layer-action', { action: 'select', id });
      });
    });

    this.shadowRoot.querySelectorAll('[data-goto-page]').forEach((el) => {
      el.addEventListener('click', () => {
        AppState.setState({ currentPage: Number(el.dataset.gotoPage) });
      });
    });

    this.shadowRoot.querySelectorAll('[data-select-node]').forEach((el) => {
      el.addEventListener('click', () => {
        AppState.setState({ currentPage: Number(el.dataset.nodePage) || 1 });
        this.emit('cortex-layer-action', { action: 'select', id: el.dataset.selectNode });
      });
    });
  }
}

customElements.define('cortex-floating-window', CortexFloatingWindow);
