// src/components/cortex-widgets.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';

/* ============================================================================
   1. <cortex-radiogroup> — Radio Buttons Clássicos e Cards de Opção
   ============================================================================ */
export class CortexRadioGroup extends CortexElement {
  constructor() {
    super();
    this._selected = this.getAttribute('value') || 'standard';
    this._options = [
      { id: 'standard', label: 'Renderização Vetorial 60 FPS', desc: 'Aceleração via Canvas 2D High-DPI com anti-aliasing.', badge: 'Padrão' },
      { id: 'performance', label: 'Modo Performance Extrema', desc: 'Otimizado para documentos com mais de 5.000 objetos.', badge: 'Turbo' },
      { id: 'print', label: 'Pré-visualização CMYK / Impressão', desc: 'Simulação de sangria, margens e sobreposição de tintas.', badge: '300 DPI' },
      { id: 'legacy', label: 'Modo Compatibilidade Legado', desc: 'Desabilitado neste perfil de hardware.', badge: 'Off', disabled: true }
    ];
  }

  set options(items) {
    if (Array.isArray(items)) {
      this._options = items;
      this.render();
    }
  }

  get value() {
    return this._selected;
  }

  set value(val) {
    this._selected = val;
    this.render();
  }

  render() {
    const variant = this.getAttribute('variant') || 'both';

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
        }
        .rg-wrapper {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .rg-section-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        /* Radio Buttons Inline / Clássicos */
        .rg-inline-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding: 10px 14px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          box-shadow: var(--btn-bevel-shadow);
        }
        .radio-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 12px;
          color: var(--text-primary);
          padding: 4px 6px;
          border-radius: var(--radius-xs);
          transition: background 0.12s ease;
        }
        .radio-item:hover:not(.disabled) {
          background: var(--bg-hover);
        }
        .radio-item.disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .radio-circle {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid var(--border-strong, var(--text-secondary));
          background: var(--bg-input);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          flex-shrink: 0;
        }
        .radio-item.checked .radio-circle {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 2px var(--accent-blue-alpha);
        }
        .radio-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-blue);
          transform: scale(0);
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .radio-item.checked .radio-dot {
          transform: scale(1);
        }

        /* Radio Cards Detalhados */
        .rg-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 10px;
        }
        .radio-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          box-shadow: var(--btn-bevel-shadow);
          cursor: pointer;
          transition: border-color 0.14s ease, background 0.14s ease;
        }
        .radio-card:hover:not(.disabled) {
          background: var(--bg-hover);
        }
        .radio-card.checked {
          border-color: var(--accent-blue);
          background: var(--accent-blue-alpha);
        }
        .radio-card.disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .card-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .card-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .card-badge {
          font-size: 9.5px;
          font-family: var(--font-mono);
          padding: 1px 6px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
        }
        .card-desc {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
        }
      </style>

      <div class="rg-wrapper" role="radiogroup">
        ${
          variant !== 'cards'
            ? `
          <div>
            <div class="rg-section-label">Estilo 1 — Radio Buttons Desktop Clássicos (Horizontal)</div>
            <div class="rg-inline-row">
              ${this._options
                .map(
                  (opt) => `
                <div
                  class="radio-item ${this._selected === opt.id ? 'checked' : ''} ${opt.disabled ? 'disabled' : ''}"
                  data-radio-id="${opt.id}"
                  role="radio"
                  aria-checked="${this._selected === opt.id}"
                  tabindex="${opt.disabled ? -1 : 0}"
                >
                  <span class="radio-circle"><span class="radio-dot"></span></span>
                  <span>${opt.label}</span>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        ${
          variant !== 'inline'
            ? `
          <div>
            <div class="rg-section-label">Estilo 2 — Radio Cards com Descrição &amp; Badge</div>
            <div class="rg-cards-grid">
              ${this._options
                .map(
                  (opt) => `
                <div
                  class="radio-card ${this._selected === opt.id ? 'checked' : ''} ${opt.disabled ? 'disabled' : ''}"
                  data-radio-id="${opt.id}"
                  role="radio"
                  aria-checked="${this._selected === opt.id}"
                  tabindex="${opt.disabled ? -1 : 0}"
                >
                  <span class="radio-circle" style="margin-top:2px;"><span class="radio-dot"></span></span>
                  <div class="card-body">
                    <div class="card-top">
                      <span class="card-title">${opt.label}</span>
                      <span class="card-badge">${opt.badge || ''}</span>
                    </div>
                    <span class="card-desc">${opt.desc || ''}</span>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-radio-id]').forEach((el) => {
      const selectFn = () => {
        const id = el.dataset.radioId;
        const opt = this._options.find((o) => o.id === id);
        if (!opt || opt.disabled) return;
        this._selected = id;
        this.render();
        this.emit('cortex-radio-change', { value: id, option: opt });
      };
      el.addEventListener('click', selectFn);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectFn();
        }
      });
    });
  }
}

/* ============================================================================
   2. <cortex-search-list> — Lista com Busca Interna & Filtro Instantâneo
   ============================================================================ */
export class CortexSearchList extends CortexElement {
  constructor() {
    super();
    this._query = '';
    this._selectedId = 'mod-canvas';
    this._categoryFilter = 'all';
    this._items = [
      { id: 'mod-canvas', title: 'CanvasEngine 2D High-DPI', category: 'Engine', meta: '60 FPS • Pan/Zoom', icon: '🎯' },
      { id: 'mod-store', title: 'AppState & Observer Store', category: 'Core', meta: 'Undo/Redo • Reativo', icon: '⚡' },
      { id: 'mod-color', title: 'Seletor Cromático 2D HSV', category: 'Inputs', meta: 'HEX • Swatches', icon: '🎨' },
      { id: 'mod-font', title: 'Seletor Tipográfico Desktop', category: 'Inputs', meta: 'Preview • Categorias', icon: '🔤' },
      { id: 'mod-login', title: 'Vitrine de 10 Telas de Login', category: 'Auth', meta: 'ERP • Sci-Fi • Glass', icon: '🔒' },
      { id: 'mod-themes', title: 'Motor de 12 Temas Desktop', category: 'Styles', meta: 'Win98 • macOS • Hacker', icon: '🌈' },
      { id: 'mod-modal', title: 'CortexModal & Toast Stack', category: 'Overlays', meta: 'Alert • Confirm • Form', icon: '💬' },
      { id: 'mod-mdi', title: 'Janelas Flutuantes MDI', category: 'Window', meta: 'DataGrid • TreeView', icon: '🪟' }
    ];
  }

  set items(list) {
    if (Array.isArray(list)) {
      this._items = list;
      this.render();
    }
  }

  render() {
    const q = this._query.trim().toLowerCase();
    const categories = ['all', ...new Set(this._items.map((i) => i.category))];

    const filtered = this._items.filter((item) => {
      const matchCat = this._categoryFilter === 'all' || item.category === this._categoryFilter;
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.meta.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    const selectedObj = this._items.find((i) => i.id === this._selectedId);

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
        }
        .slist-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--btn-bevel-shadow);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .slist-header {
          padding: 10px 12px;
          background: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          font-size: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .slist-input {
          width: 100%;
          height: 30px;
          padding: 0 28px 0 30px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          color: var(--text-primary);
          border: 1px solid var(--border-input);
          box-shadow: var(--input-bevel-shadow);
          font-size: 12px;
        }
        .slist-input:focus {
          border-color: var(--border-focus);
        }
        .clear-btn {
          position: absolute;
          right: 8px;
          font-size: 13px;
          color: var(--text-muted);
          padding: 2px 5px;
        }
        .clear-btn:hover {
          color: var(--text-primary);
        }
        .filter-pills {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          flex-wrap: wrap;
        }
        .pills-group {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .cat-pill {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          color: var(--text-secondary);
          border: 1px solid var(--border-input);
        }
        .cat-pill.active {
          background: var(--accent-blue);
          color: var(--accent-text);
          border-color: var(--border-focus);
          font-weight: 600;
        }
        .count-label {
          font-size: 10.5px;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
        .slist-body {
          max-height: 215px;
          overflow-y: auto;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .slist-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--radius-xs);
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.12s ease;
        }
        .slist-row:hover {
          background: var(--bg-hover);
        }
        .slist-row.selected {
          background: var(--accent-blue-alpha);
          border-color: var(--accent-blue);
        }
        .row-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .row-icon {
          width: 26px;
          height: 26px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }
        .row-texts {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .row-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .row-meta {
          font-size: 10.5px;
          color: var(--text-secondary);
        }
        .row-tag {
          font-size: 10px;
          font-family: var(--font-mono);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .empty-state {
          padding: 24px 12px;
          text-align: center;
          color: var(--text-muted);
          font-size: 12px;
        }
        .slist-footer {
          padding: 7px 12px;
          background: var(--bg-elevated);
          border-top: 1px solid var(--border-subtle);
          font-size: 11px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      </style>

      <div class="slist-card">
        <div class="slist-header">
          <div class="search-input-wrap">
            <span class="search-icon">&#128269;</span>
            <input
              type="text"
              id="slist-search"
              class="slist-input"
              placeholder="Buscar item por título, categoria ou propriedade..."
              value="${this._query}"
            />
            ${
              this._query
                ? `<button class="clear-btn" id="slist-clear" title="Limpar busca">&times;</button>`
                : ''
            }
          </div>
          <div class="filter-pills">
            <div class="pills-group">
              ${categories
                .map(
                  (c) => `
                <button class="cat-pill ${this._categoryFilter === c ? 'active' : ''}" data-cat="${c}">
                  ${c === 'all' ? 'Todos' : c}
                </button>
              `
                )
                .join('')}
            </div>
            <span class="count-label">${filtered.length} de ${this._items.length} itens</span>
          </div>
        </div>

        <div class="slist-body" role="listbox">
          ${
            filtered.length === 0
              ? `<div class="empty-state">Nenhum item encontrado para "<strong>${this._query}</strong>".</div>`
              : filtered
                  .map(
                    (item) => `
              <div
                class="slist-row ${this._selectedId === item.id ? 'selected' : ''}"
                data-item-id="${item.id}"
                role="option"
                aria-selected="${this._selectedId === item.id}"
              >
                <div class="row-left">
                  <span class="row-icon">${item.icon || '📄'}</span>
                  <div class="row-texts">
                    <span class="row-title">${item.title}</span>
                    <span class="row-meta">${item.meta}</span>
                  </div>
                </div>
                <span class="row-tag">${item.category}</span>
              </div>
            `
                  )
                  .join('')
          }
        </div>

        <div class="slist-footer">
          <span>Selecionado: <strong>${selectedObj ? selectedObj.title : 'Nenhum'}</strong></span>
          <span style="font-family:var(--font-mono); font-size:10px;">ID: ${this._selectedId}</span>
        </div>
      </div>
    `;

    const input = this.shadowRoot.querySelector('#slist-search');
    input?.addEventListener('input', (e) => {
      const pos = e.target.selectionStart;
      this._query = e.target.value;
      this.render();
      const next = this.shadowRoot.querySelector('#slist-search');
      if (next) {
        next.focus();
        next.setSelectionRange(pos, pos);
      }
    });

    this.shadowRoot.querySelector('#slist-clear')?.addEventListener('click', () => {
      this._query = '';
      this.render();
    });

    this.shadowRoot.querySelectorAll('[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._categoryFilter = btn.dataset.cat;
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-item-id]').forEach((row) => {
      row.addEventListener('click', () => {
        this._selectedId = row.dataset.itemId;
        const found = this._items.find((i) => i.id === this._selectedId);
        this.render();
        this.emit('cortex-list-select', { id: this._selectedId, item: found });
      });
    });
  }
}

/* ============================================================================
   3. <cortex-check-list> — Lista com Checkbox Interna, Busca & Seleção em Lote
   ============================================================================ */
export class CortexCheckList extends CortexElement {
  constructor() {
    super();
    this._query = '';
    this._items = [
      { id: 'perm-rbac', label: 'Controle de Acesso Baseado em Papéis (RBAC)', group: 'Segurança', checked: true },
      { id: 'perm-audit', label: 'Logs de Auditoria Imutáveis & Telemetria', group: 'Compliance', checked: true },
      { id: 'perm-2fa', label: 'Autenticação Multi-Fator Obrigatória (2FA/TOTP)', group: 'Segurança', checked: true },
      { id: 'perm-export', label: 'Exportação de Relatórios em JSON / CSV / PDF', group: 'Dados', checked: false },
      { id: 'perm-api', label: 'Chaves de Integração Webhook & REST GraphQL', group: 'DevOps', checked: false },
      { id: 'perm-backup', label: 'Snapshot Automático de Documentos na Nuvem', group: 'Storage', checked: true }
    ];
  }

  getCheckedIds() {
    return this._items.filter((i) => i.checked).map((i) => i.id);
  }

  render() {
    const q = this._query.trim().toLowerCase();
    const visibleItems = this._items.filter(
      (i) => !q || i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q)
    );
    const totalChecked = this._items.filter((i) => i.checked).length;
    const allChecked = totalChecked === this._items.length && this._items.length > 0;
    const isIndeterminate = totalChecked > 0 && totalChecked < this._items.length;

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
        }
        .clist-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--btn-bevel-shadow);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .clist-top {
          padding: 10px 12px;
          background: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .clist-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .master-check {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .chk-box {
          width: 16px;
          height: 16px;
          border-radius: var(--radius-xs);
          border: 1.5px solid var(--border-strong, var(--text-secondary));
          background: var(--bg-input);
          box-shadow: var(--input-bevel-shadow);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: transparent;
          flex-shrink: 0;
          transition: background 0.12s ease, border-color 0.12s ease;
        }
        .checked > .chk-box,
        .chk-box.checked {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: var(--accent-text);
        }
        .chk-box.indeterminate {
          background: var(--accent-blue-alpha);
          border-color: var(--accent-blue);
          color: var(--text-primary);
        }
        .quick-btns {
          display: flex;
          gap: 5px;
        }
        .mini-btn {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          color: var(--text-secondary);
          border: 1px solid var(--border-input);
          box-shadow: var(--btn-bevel-shadow);
        }
        .mini-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .clist-search {
          width: 100%;
          height: 28px;
          padding: 0 10px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          color: var(--text-primary);
          border: 1px solid var(--border-input);
          box-shadow: var(--input-bevel-shadow);
          font-size: 11.5px;
        }
        .clist-body {
          max-height: 210px;
          overflow-y: auto;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .clist-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 7px 10px;
          border-radius: var(--radius-xs);
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.12s ease;
        }
        .clist-row:hover {
          background: var(--bg-hover);
        }
        .clist-row.checked {
          background: var(--accent-blue-alpha);
          border-color: rgba(20, 115, 230, 0.3);
        }
        .row-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .row-label {
          font-size: 12px;
          color: var(--text-primary);
        }
        .clist-row.checked .row-label {
          font-weight: 600;
        }
        .group-badge {
          font-size: 10px;
          font-family: var(--font-mono);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .clist-footer {
          padding: 7px 12px;
          background: var(--bg-elevated);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .progress-mini {
          width: 90px;
          height: 6px;
          border-radius: 999px;
          background: var(--bg-input);
          overflow: hidden;
          border: 1px solid var(--border-subtle);
        }
        .progress-mini-fill {
          height: 100%;
          background: var(--accent-blue);
          transition: width 0.2s ease;
        }
      </style>

      <div class="clist-card">
        <div class="clist-top">
          <div class="clist-actions-bar">
            <div class="master-check" id="clist-master-toggle">
              <span class="chk-box ${allChecked ? 'checked' : isIndeterminate ? 'indeterminate' : ''}">
                ${allChecked ? '&#10003;' : isIndeterminate ? '&minus;' : ''}
              </span>
              <span>Selecionar Todos (${totalChecked}/${this._items.length})</span>
            </div>
            <div class="quick-btns">
              <button class="mini-btn" data-batch="invert">Inverter Seleção</button>
              <button class="mini-btn" data-batch="clear">Limpar</button>
            </div>
          </div>
          <input
            type="text"
            id="clist-search-input"
            class="clist-search"
            placeholder="&#128269; Filtrar checkboxes na lista..."
            value="${this._query}"
          />
        </div>

        <div class="clist-body">
          ${visibleItems
            .map(
              (item) => `
            <div class="clist-row ${item.checked ? 'checked' : ''}" data-chk-id="${item.id}">
              <div class="row-left">
                <span class="chk-box ${item.checked ? 'checked' : ''}">&#10003;</span>
                <span class="row-label">${item.label}</span>
              </div>
              <span class="group-badge">${item.group}</span>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="clist-footer">
          <span><strong>${totalChecked}</strong> permissão(ões) habilitada(s)</span>
          <div class="progress-mini">
            <div class="progress-mini-fill" style="width: ${Math.round((totalChecked / Math.max(1, this._items.length)) * 100)}%;"></div>
          </div>
        </div>
      </div>
    `;

    const searchEl = this.shadowRoot.querySelector('#clist-search-input');
    searchEl?.addEventListener('input', (e) => {
      const pos = e.target.selectionStart;
      this._query = e.target.value;
      this.render();
      const next = this.shadowRoot.querySelector('#clist-search-input');
      if (next) {
        next.focus();
        next.setSelectionRange(pos, pos);
      }
    });

    this.shadowRoot.querySelector('#clist-master-toggle')?.addEventListener('click', () => {
      const targetState = !allChecked;
      this._items.forEach((i) => {
        i.checked = targetState;
      });
      this.render();
      this.emit('cortex-checklist-change', { checkedIds: this.getCheckedIds() });
    });

    this.shadowRoot.querySelectorAll('[data-batch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.batch;
        this._items.forEach((i) => {
          i.checked = mode === 'invert' ? !i.checked : false;
        });
        this.render();
        this.emit('cortex-checklist-change', { checkedIds: this.getCheckedIds() });
      });
    });

    this.shadowRoot.querySelectorAll('[data-chk-id]').forEach((row) => {
      row.addEventListener('click', () => {
        const target = this._items.find((i) => i.id === row.dataset.chkId);
        if (target) {
          target.checked = !target.checked;
          this.render();
          this.emit('cortex-checklist-change', { checkedIds: this.getCheckedIds() });
        }
      });
    });
  }
}

/* ============================================================================
   4. <cortex-combobox> — Multi-Select com Chips/Tags & Autocomplete
   ============================================================================ */
export class CortexCombobox extends CortexElement {
  constructor() {
    super();
    this._open = false;
    this._query = '';
    this._selected = ['Web Components', 'Canvas 2D', '12 Temas'];
    this._allOptions = [
      'Web Components',
      'Shadow DOM',
      'Canvas 2D',
      'Store Reativo',
      '12 Temas',
      '10 Telas de Login',
      'Data Grid MDI',
      'TypeScript Ready',
      'Zero Dependências'
    ];
    this._onDocClick = this._onDocClick.bind(this);
  }

  onMount() {
    document.addEventListener('pointerdown', this._onDocClick);
  }

  onUnmount() {
    document.removeEventListener('pointerdown', this._onDocClick);
  }

  _onDocClick(e) {
    if (this._open && !e.composedPath().includes(this)) {
      this._open = false;
      this.render();
    }
  }

  render() {
    const q = this._query.trim().toLowerCase();
    const filtered = this._allOptions.filter((opt) => !q || opt.toLowerCase().includes(q));

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          position: relative;
        }
        .combo-box {
          min-height: 36px;
          padding: 4px 8px;
          background: var(--bg-input);
          border: 1px solid ${this._open ? 'var(--border-focus)' : 'var(--border-input)'};
          border-radius: var(--radius-sm);
          box-shadow: var(--input-bevel-shadow);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
          cursor: text;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          background: var(--accent-blue);
          color: var(--accent-text);
          font-size: 11px;
          font-weight: 600;
          box-shadow: var(--btn-bevel-shadow);
        }
        .chip-remove {
          font-size: 12px;
          color: inherit;
          opacity: 0.85;
        }
        .chip-remove:hover {
          opacity: 1;
        }
        .combo-input {
          flex: 1;
          min-width: 110px;
          height: 24px;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 12px;
          outline: none;
        }
        .combo-dropdown {
          display: ${this._open ? 'flex' : 'none'};
          flex-direction: column;
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          max-height: 190px;
          overflow-y: auto;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-dropdown);
          padding: 4px;
          z-index: 400;
        }
        .combo-opt {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: var(--radius-xs);
          font-size: 12px;
          color: var(--text-primary);
          cursor: pointer;
        }
        .combo-opt:hover {
          background: var(--bg-hover);
        }
        .combo-opt.is-selected {
          background: var(--accent-blue-alpha);
          font-weight: 600;
        }
      </style>

      <div class="combo-box" id="combo-trigger">
        ${this._selected
          .map(
            (tag) => `
          <span class="chip">
            ${tag}
            <button class="chip-remove" data-remove-tag="${tag}" title="Remover">&times;</button>
          </span>
        `
          )
          .join('')}
        <input
          type="text"
          id="combo-search"
          class="combo-input"
          placeholder="${this._selected.length === 0 ? 'Selecione ou pesquise tags...' : '+ Adicionar tag...'}"
          value="${this._query}"
        />
      </div>

      <div class="combo-dropdown">
        ${filtered
          .map((opt) => {
            const sel = this._selected.includes(opt);
            return `
              <div class="combo-opt ${sel ? 'is-selected' : ''}" data-toggle-opt="${opt}">
                <span>${opt}</span>
                <span>${sel ? '&#10003;' : ''}</span>
              </div>
            `;
          })
          .join('')}
      </div>
    `;

    const searchInput = this.shadowRoot.querySelector('#combo-search');
    searchInput?.addEventListener('focus', () => {
      if (!this._open) {
        this._open = true;
        this.render();
        this.shadowRoot.querySelector('#combo-search')?.focus();
      }
    });

    searchInput?.addEventListener('input', (e) => {
      const pos = e.target.selectionStart;
      this._query = e.target.value;
      this._open = true;
      this.render();
      const next = this.shadowRoot.querySelector('#combo-search');
      if (next) {
        next.focus();
        next.setSelectionRange(pos, pos);
      }
    });

    this.shadowRoot.querySelectorAll('[data-remove-tag]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = btn.dataset.removeTag;
        this._selected = this._selected.filter((t) => t !== tag);
        this.render();
        this.emit('cortex-combobox-change', { values: this._selected });
      });
    });

    this.shadowRoot.querySelectorAll('[data-toggle-opt]').forEach((el) => {
      el.addEventListener('click', () => {
        const opt = el.dataset.toggleOpt;
        if (this._selected.includes(opt)) {
          this._selected = this._selected.filter((t) => t !== opt);
        } else {
          this._selected.push(opt);
        }
        this._query = '';
        this.render();
        this.emit('cortex-combobox-change', { values: this._selected });
      });
    });
  }
}

/* ============================================================================
   5. <cortex-datepicker> — Calendário Desktop Interativo & Seletor de Data
   ============================================================================ */
export class CortexDatePicker extends CortexElement {
  constructor() {
    super();
    this._selectedDate = new Date(2026, 9, 28); // 28/10/2026
    this._viewYear = 2026;
    this._viewMonth = 9; // Outubro (0-indexed)
  }

  _formatDate(d) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  render() {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const firstDayOfWeek = new Date(this._viewYear, this._viewMonth, 1).getDay();
    const daysInMonth = new Date(this._viewYear, this._viewMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: inline-block;
        }
        .dp-card {
          width: 280px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--btn-bevel-shadow);
          overflow: hidden;
        }
        .dp-top-input {
          padding: 10px 12px;
          background: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .dp-readout {
          flex: 1;
          height: 28px;
          padding: 0 10px;
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          box-shadow: var(--input-bevel-shadow);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-primary);
        }
        .dp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .dp-month-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .dp-nav-btn {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .dp-nav-btn:hover {
          background: var(--accent-blue);
          color: var(--accent-text);
        }
        .dp-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 3px;
          padding: 10px;
          text-align: center;
        }
        .dp-dow {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted);
          padding-bottom: 4px;
        }
        .dp-day {
          height: 28px;
          border-radius: var(--radius-xs);
          font-size: 11.5px;
          color: var(--text-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .dp-day:hover:not(.empty) {
          background: var(--bg-hover);
        }
        .dp-day.selected {
          background: var(--accent-blue);
          color: var(--accent-text);
          font-weight: 700;
          box-shadow: var(--btn-bevel-shadow);
        }
        .dp-day.empty {
          pointer-events: none;
        }
        .dp-presets {
          display: flex;
          gap: 6px;
          padding: 8px 10px;
          background: var(--bg-elevated);
          border-top: 1px solid var(--border-subtle);
          justify-content: space-between;
        }
        .preset-btn {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
        }
        .preset-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
      </style>

      <div class="dp-card">
        <div class="dp-top-input">
          <div class="dp-readout">
            <span>&#128197; ${this._formatDate(this._selectedDate)}</span>
            <span style="font-size:10px; color:var(--text-muted);">PT-BR</span>
          </div>
        </div>

        <div class="dp-nav">
          <button class="dp-nav-btn" data-nav="-1" title="Mês Anterior">&lsaquo;</button>
          <span class="dp-month-title">${months[this._viewMonth]} ${this._viewYear}</span>
          <button class="dp-nav-btn" data-nav="1" title="Próximo Mês">&rsaquo;</button>
        </div>

        <div class="dp-grid">
          ${weekDays.map((w) => `<span class="dp-dow">${w}</span>`).join('')}
          ${cells
            .map((day) => {
              if (!day) return `<span class="dp-day empty"></span>`;
              const isSelected =
                this._selectedDate.getDate() === day &&
                this._selectedDate.getMonth() === this._viewMonth &&
                this._selectedDate.getFullYear() === this._viewYear;
              return `<button class="dp-day ${isSelected ? 'selected' : ''}" data-day="${day}">${day}</button>`;
            })
            .join('')}
        </div>

        <div class="dp-presets">
          <button class="preset-btn" data-preset="today">Hoje</button>
          <button class="preset-btn" data-preset="plus7">+7 Dias</button>
          <button class="preset-btn" data-preset="start">Dia 1º</button>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const delta = Number(btn.dataset.nav);
        this._viewMonth += delta;
        if (this._viewMonth < 0) {
          this._viewMonth = 11;
          this._viewYear -= 1;
        } else if (this._viewMonth > 11) {
          this._viewMonth = 0;
          this._viewYear += 1;
        }
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-day]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const day = Number(btn.dataset.day);
        this._selectedDate = new Date(this._viewYear, this._viewMonth, day);
        this.render();
        this.emit('cortex-date-change', { date: this._formatDate(this._selectedDate) });
      });
    });

    this.shadowRoot.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.preset;
        const base = new Date(2026, 9, 28);
        if (p === 'plus7') base.setDate(base.getDate() + 7);
        if (p === 'start') base.setDate(1);
        this._selectedDate = base;
        this._viewYear = base.getFullYear();
        this._viewMonth = base.getMonth();
        this.render();
        this.emit('cortex-date-change', { date: this._formatDate(this._selectedDate) });
      });
    });
  }
}

/* ============================================================================
   6. <cortex-switch> & <cortex-accordion> & <cortex-tabs> & <cortex-stepper>
   ============================================================================ */
export class CortexAccordion extends CortexElement {
  constructor() {
    super();
    this._openIds = ['acc-1'];
    this._sections = [
      {
        id: 'acc-1',
        title: '1. Aceleração Gráfica & DevicePixelRatio',
        badge: 'Ativo',
        content:
          'O motor CanvasEngine multiplica automaticamente a matriz de transformação pelo window.devicePixelRatio, garantindo nitidez absoluta em telas Retina/4K.'
      },
      {
        id: 'acc-2',
        title: '2. Isolamento de Estilos via Shadow DOM',
        badge: 'Web Standards',
        content:
          'Cada componente herda de CortexElement e encapsula seu CSS, consumindo os tokens semânticos de tema (--bg-panel, --accent-blue, --btn-bevel-shadow).'
      },
      {
        id: 'acc-3',
        title: '3. Serialização JSON & Histórico Undo/Redo',
        badge: 'Persistência',
        content:
          'Todos os nós gráficos (CortexRect, CortexText, CortexPath) possuem métodos toJSON() e suporte a snapshots instantâneos na pilha de Undo/Redo.'
      }
    ];
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
        }
        .acc-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .acc-item {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          box-shadow: var(--btn-bevel-shadow);
          overflow: hidden;
        }
        .acc-header {
          width: 100%;
          padding: 10px 14px;
          background: var(--bg-panel-header);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          text-align: left;
        }
        .acc-header:hover {
          background: var(--bg-hover);
        }
        .acc-body {
          padding: 12px 14px;
          font-size: 12px;
          line-height: 1.55;
          color: var(--text-secondary);
          border-top: 1px solid var(--border-subtle);
        }
        .acc-badge {
          font-size: 10px;
          font-family: var(--font-mono);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
        }
      </style>
      <div class="acc-list">
        ${this._sections
          .map((sec) => {
            const isOpen = this._openIds.includes(sec.id);
            return `
              <div class="acc-item">
                <button class="acc-header" data-acc-id="${sec.id}" aria-expanded="${isOpen}">
                  <span>${isOpen ? '&#9662;' : '&#9656;'} ${sec.title}</span>
                  <span class="acc-badge">${sec.badge}</span>
                </button>
                ${isOpen ? `<div class="acc-body">${sec.content}</div>` : ''}
              </div>
            `;
          })
          .join('')}
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-acc-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.accId;
        if (this._openIds.includes(id)) {
          this._openIds = this._openIds.filter((i) => i !== id);
        } else {
          this._openIds.push(id);
        }
        this.render();
      });
    });
  }
}

export class CortexStepper extends CortexElement {
  constructor() {
    super();
    this._currentStep = 2;
    this._steps = [
      { step: 1, title: '1. Configuração Base', desc: 'Definição de formato A4/Web, margens e orientação do projeto.' },
      { step: 2, title: '2. Tema & Identidade', desc: 'Escolha entre os 12 temas Desktop (Dark, macOS, Win98, Hacker, Futurista).' },
      { step: 3, title: '3. Camadas & Dados', desc: 'Vinculação de objetos vetoriais com o Desktop Data Grid e TreeView.' },
      { step: 4, title: '4. Publicação & JSON', desc: 'Exportação final verificada em JSON estruturado ou PNG High-DPI.' }
    ];
  }

  render() {
    const activeObj = this._steps.find((s) => s.step === this._currentStep) || this._steps[0];

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
        }
        .stepper-box {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          padding: 16px;
          box-shadow: var(--btn-bevel-shadow);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .steps-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 8px;
        }
        .step-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          cursor: pointer;
          text-align: left;
        }
        .step-pill.done {
          border-color: var(--status-ok);
        }
        .step-pill.active {
          background: var(--accent-blue-alpha);
          border-color: var(--accent-blue);
        }
        .step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          flex-shrink: 0;
        }
        .step-pill.done .step-num {
          background: var(--status-ok);
          color: #04130a;
          border-color: var(--status-ok);
        }
        .step-pill.active .step-num {
          background: var(--accent-blue);
          color: var(--accent-text);
          border-color: var(--accent-blue);
        }
        .step-title {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .step-stage {
          padding: 12px 14px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .step-nav-btns {
          display: flex;
          gap: 8px;
        }
        .s-btn {
          height: 28px;
          padding: 0 12px;
          border-radius: var(--radius-xs);
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          box-shadow: var(--btn-bevel-shadow);
          font-size: 11.5px;
          font-weight: 600;
        }
        .s-btn.primary {
          background: var(--accent-blue);
          color: var(--accent-text);
        }
      </style>

      <div class="stepper-box">
        <div class="steps-row">
          ${this._steps
            .map((s) => {
              const isDone = s.step < this._currentStep;
              const isActive = s.step === this._currentStep;
              return `
                <button class="step-pill ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}" data-goto-step="${s.step}">
                  <span class="step-num">${isDone ? '&#10003;' : s.step}</span>
                  <span class="step-title">${s.title}</span>
                </button>
              `;
            })
            .join('')}
        </div>

        <div class="step-stage">
          <div>
            <strong style="font-size:12.5px; color:var(--text-primary);">${activeObj.title}</strong>
            <div style="font-size:11.5px; color:var(--text-secondary); margin-top:2px;">${activeObj.desc}</div>
          </div>
          <div class="step-nav-btns">
            <button class="s-btn" data-step-delta="-1" ${this._currentStep <= 1 ? 'disabled style="opacity:0.4"' : ''}>&larr; Anterior</button>
            <button class="s-btn primary" data-step-delta="1">
              ${this._currentStep >= this._steps.length ? '&#10003; Reiniciar Wizard' : 'Próximo Passo &rarr;'}
            </button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-goto-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._currentStep = Number(btn.dataset.gotoStep);
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-step-delta]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = Number(btn.dataset.stepDelta);
        if (d > 0 && this._currentStep >= this._steps.length) {
          this._currentStep = 1;
        } else {
          this._currentStep = Math.max(1, Math.min(this._steps.length, this._currentStep + d));
        }
        this.render();
      });
    });
  }
}

/* ============================================================================
   7. <cortex-chart> — Gráficos Nativos em Canvas 2D High-DPI (Barras, Linha, Donut)
   ============================================================================ */
export class CortexChart extends CortexElement {
  constructor() {
    super();
    this._chartType = this.getAttribute('type') || 'bar';
    this._data = [
      { label: 'Jan', value: 64 },
      { label: 'Fev', value: 82 },
      { label: 'Mar', value: 75 },
      { label: 'Abr', value: 94 },
      { label: 'Mai', value: 88 },
      { label: 'Jun', value: 112 }
    ];
  }

  onMount() {
    this.watchState(['theme'], () => {
      this._drawChart();
    });
    requestAnimationFrame(() => this._drawChart());
  }

  _drawChart() {
    const canvas = this.shadowRoot?.querySelector('#chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 520;
    const h = canvas.clientHeight || 210;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue('--accent-blue').trim() || '#1473e6';
    const okColor = styles.getPropertyValue('--status-ok').trim() || '#22c55e';
    const textPrimary = styles.getPropertyValue('--text-primary').trim() || '#e4e4e7';
    const textMuted = styles.getPropertyValue('--text-muted').trim() || '#71717a';
    const borderSubtle = styles.getPropertyValue('--border-subtle').trim() || 'rgba(255,255,255,0.08)';

    ctx.clearRect(0, 0, w, h);

    const maxVal = Math.max(...this._data.map((d) => d.value), 100);
    const padL = 42;
    const padR = 20;
    const padT = 22;
    const padB = 30;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    if (this._chartType === 'donut') {
      const cx = w * 0.36;
      const cy = h * 0.5;
      const radius = Math.min(w, h) * 0.36;
      const palette = [accent, okColor, '#38bdf8', '#a855f7', '#f59e0b', '#ec4899'];
      const total = this._data.reduce((acc, d) => acc + d.value, 0);
      let angle = -Math.PI / 2;

      this._data.forEach((d, idx) => {
        const slice = (d.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle, angle + slice);
        ctx.closePath();
        ctx.fillStyle = palette[idx % palette.length];
        ctx.fill();

        // Legenda lateral
        const lx = w * 0.66;
        const ly = 28 + idx * 26;
        ctx.fillStyle = palette[idx % palette.length];
        ctx.fillRect(lx, ly, 12, 12);
        ctx.fillStyle = textPrimary;
        ctx.font = '600 11px sans-serif';
        ctx.fillText(`${d.label}: ${d.value} pts (${Math.round((d.value / total) * 100)}%)`, lx + 18, ly + 10);

        angle += slice;
      });

      // Furo central do Donut
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = styles.getPropertyValue('--bg-panel').trim() || '#18181b';
      ctx.fill();

      ctx.fillStyle = textPrimary;
      ctx.font = '700 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Total: ${total}`, cx, cy + 4);
      ctx.textAlign = 'left';
      return;
    }

    // Grade horizontal
    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH / 4) * i;
      const val = Math.round(maxVal - (maxVal / 4) * i);
      ctx.strokeStyle = borderSubtle;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();

      ctx.fillStyle = textMuted;
      ctx.font = '10px monospace';
      ctx.fillText(String(val), 8, y + 3);
    }

    if (this._chartType === 'bar') {
      const step = plotW / this._data.length;
      const barW = Math.min(44, step * 0.58);

      this._data.forEach((d, idx) => {
        const bh = (d.value / maxVal) * plotH;
        const x = padL + idx * step + (step - barW) / 2;
        const y = padT + plotH - bh;

        ctx.fillStyle = idx === this._data.length - 1 ? okColor : accent;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, bh, 3);
        ctx.fill();

        ctx.fillStyle = textPrimary;
        ctx.font = '600 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(d.value), x + barW / 2, y - 5);

        ctx.fillStyle = textMuted;
        ctx.font = '11px sans-serif';
        ctx.fillText(d.label, x + barW / 2, h - 10);
      });
      ctx.textAlign = 'left';
    } else {
      // Line + Area Chart
      const step = plotW / Math.max(1, this._data.length - 1);
      const pts = this._data.map((d, idx) => ({
        x: padL + idx * step,
        y: padT + plotH - (d.value / maxVal) * plotH,
        ...d
      }));

      ctx.beginPath();
      ctx.moveTo(pts[0].x, padT + plotH);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, padT + plotH);
      ctx.closePath();
      ctx.fillStyle = styles.getPropertyValue('--accent-blue-alpha').trim() || 'rgba(20,115,230,0.22)';
      ctx.fill();

      ctx.beginPath();
      pts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = okColor;
        ctx.fill();

        ctx.fillStyle = textPrimary;
        ctx.font = '600 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(p.value), p.x, p.y - 8);

        ctx.fillStyle = textMuted;
        ctx.font = '11px sans-serif';
        ctx.fillText(p.label, p.x, h - 10);
      });
      ctx.textAlign = 'left';
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
        }
        .chart-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--btn-bevel-shadow);
          overflow: hidden;
        }
        .chart-header {
          padding: 8px 12px;
          background: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .chart-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .chart-tabs {
          display: flex;
          gap: 4px;
        }
        .c-tab {
          font-size: 10.5px;
          padding: 3px 9px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
        }
        .c-tab.active {
          background: var(--accent-blue);
          color: var(--accent-text);
          border-color: var(--border-focus);
          font-weight: 600;
        }
        .canvas-wrap {
          padding: 10px;
          height: 220px;
        }
        canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
      </style>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">&#128202; Telemetria de Renderização &amp; Throughput (Canvas 2D High-DPI)</span>
          <div class="chart-tabs">
            <button class="c-tab ${this._chartType === 'bar' ? 'active' : ''}" data-ctype="bar">Barras</button>
            <button class="c-tab ${this._chartType === 'line' ? 'active' : ''}" data-ctype="line">Linha / Área</button>
            <button class="c-tab ${this._chartType === 'donut' ? 'active' : ''}" data-ctype="donut">Donut / Pizza</button>
          </div>
        </div>
        <div class="canvas-wrap">
          <canvas id="chart-canvas"></canvas>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-ctype]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._chartType = btn.dataset.ctype;
        this.render();
        requestAnimationFrame(() => this._drawChart());
      });
    });

    requestAnimationFrame(() => this._drawChart());
  }
}

/* ============================================================================
   8. <cortex-splitter> — Sizer / Divisor de Painéis Reutilizável (Horizontal/Vertical)
   ============================================================================ */
export class CortexSplitter extends CortexElement {
  constructor() {
    super();
    this._splitPos = 42; // porcentagem inicial
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
        }
        .split-container {
          display: grid;
          grid-template-columns: ${this._splitPos}% 8px 1fr;
          height: 130px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          overflow: hidden;
          box-shadow: var(--btn-bevel-shadow);
        }
        .pane {
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          overflow: hidden;
        }
        .pane-a {
          background: var(--bg-panel-header);
        }
        .pane-b {
          background: var(--bg-input);
        }
        .sizer-bar {
          background: var(--bg-panel);
          border-left: 1px solid var(--border-subtle);
          border-right: 1px solid var(--border-subtle);
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: none;
        }
        .sizer-bar::after {
          content: "";
          width: 2px;
          height: 30px;
          border-radius: 99px;
          background: var(--text-muted);
        }
        .sizer-bar:hover,
        .sizer-bar.dragging {
          background: var(--accent-blue-alpha);
          border-color: var(--accent-blue);
        }
        .sizer-bar:hover::after,
        .sizer-bar.dragging::after {
          background: var(--accent-blue);
          height: 46px;
        }
      </style>

      <div class="split-container" id="split-box">
        <div class="pane pane-a">
          <strong style="font-size:12px;">Painel Esquerdo (${Math.round(this._splitPos)}%)</strong>
          <span style="font-size:11px; color:var(--text-secondary);">Arraste a barra divisória central &rarr;</span>
        </div>
        <div class="sizer-bar" id="split-handle" title="Arraste para redimensionar (Duplo clique centraliza)"></div>
        <div class="pane pane-b">
          <strong style="font-size:12px;">Painel Direito (${Math.round(100 - this._splitPos)}%)</strong>
          <span style="font-size:11px; color:var(--text-secondary);">Duplo clique no Sizer restaura 50% / 50%.</span>
        </div>
      </div>
    `;

    const box = this.shadowRoot.querySelector('#split-box');
    const handle = this.shadowRoot.querySelector('#split-handle');
    if (box && handle) {
      let dragging = false;
      handle.addEventListener('pointerdown', (e) => {
        handle.setPointerCapture(e.pointerId);
        dragging = true;
        handle.classList.add('dragging');
      });
      handle.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const rect = box.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        this._splitPos = Math.max(20, Math.min(80, pct));
        box.style.gridTemplateColumns = `${this._splitPos}% 8px 1fr`;
        const labels = box.querySelectorAll('strong');
        if (labels[0]) labels[0].textContent = `Painel Esquerdo (${Math.round(this._splitPos)}%)`;
        if (labels[1]) labels[1].textContent = `Painel Direito (${Math.round(100 - this._splitPos)}%)`;
      });
      const stop = () => {
        dragging = false;
        handle.classList.remove('dragging');
      };
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
      handle.addEventListener('dblclick', () => {
        this._splitPos = 50;
        this.render();
      });
    }
  }
}

customElements.define('cortex-radiogroup', CortexRadioGroup);
customElements.define('cortex-search-list', CortexSearchList);
customElements.define('cortex-check-list', CortexCheckList);
customElements.define('cortex-combobox', CortexCombobox);
customElements.define('cortex-datepicker', CortexDatePicker);
customElements.define('cortex-accordion', CortexAccordion);
customElements.define('cortex-stepper', CortexStepper);
customElements.define('cortex-chart', CortexChart);
customElements.define('cortex-splitter', CortexSplitter);


/* ============================================================================
   9. <cortex-switch> — Interruptores Toggle Switch Desktop
   ============================================================================ */
export class CortexSwitch extends CortexElement {
  constructor() {
    super();
    this._items = [
      { id: 'sw-snap', label: 'Guias Inteligentes & Snap Magnético', desc: 'Alinha automaticamente bordas e centros em 60 FPS.', on: true },
      { id: 'sw-gpu', label: 'Aceleração de Hardware WebGL / Canvas', desc: 'Utiliza buffer dedicado de alta densidade (Retina/4K).', on: true },
      { id: 'sw-autosave', label: 'Auto-Save Instantâneo no LocalStorage', desc: 'Salva alterações de páginas e temas em tempo real.', on: false }
    ];
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host { display: block; }
        .sw-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .sw-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 10px 14px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          box-shadow: var(--btn-bevel-shadow);
          cursor: pointer;
        }
        .sw-row:hover {
          background: var(--bg-hover);
        }
        .sw-track {
          width: 40px;
          height: 22px;
          border-radius: 999px;
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          position: relative;
          transition: background 0.18s ease, border-color 0.18s ease;
          flex-shrink: 0;
        }
        .sw-row.on .sw-track {
          background: var(--accent-blue);
          border-color: var(--border-focus);
        }
        .sw-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--text-primary);
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .sw-row.on .sw-thumb {
          transform: translateX(18px);
          background: var(--accent-text);
        }
      </style>
      <div class="sw-list">
        ${this._items
          .map(
            (item) => `
          <div class="sw-row ${item.on ? 'on' : ''}" data-sw-id="${item.id}" role="switch" aria-checked="${item.on}">
            <div>
              <div style="font-size:12px; font-weight:700; color:var(--text-primary);">${item.label}</div>
              <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${item.desc}</div>
            </div>
            <div class="sw-track"><span class="sw-thumb"></span></div>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-sw-id]').forEach((row) => {
      row.addEventListener('click', () => {
        const target = this._items.find((i) => i.id === row.dataset.swId);
        if (target) {
          target.on = !target.on;
          this.render();
          this.emit('cortex-switch-change', { id: target.id, checked: target.on });
        }
      });
    });
  }
}

/* ============================================================================
   10. <cortex-tabs> — Abas Internas Reutilizáveis para Cards e Formulários
   ============================================================================ */
export class CortexTabs extends CortexElement {
  constructor() {
    super();
    this._activeTab = 'tab-overview';
  }

  render() {
    const tabs = [
      { id: 'tab-overview', label: 'Visão Geral', badge: 'Ativo', body: 'Painel principal com resumo de métricas, status de conexão em tempo real e diagnósticos da aplicação.' },
      { id: 'tab-security', label: 'Segurança & Tokens', badge: 'TLS 1.3', body: 'Gerenciamento de certificados mTLS, chaves de API, sessões ativas e políticas de bloqueio automático.' },
      { id: 'tab-logs', label: 'Auditoria (Logs)', badge: '128', body: 'Histórico cronológico de eventos disparados no EventBus e alterações de estado registradas na AppState.' }
    ];
    const current = tabs.find((t) => t.id === this._activeTab) || tabs[0];

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host { display: block; }
        .tabs-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--btn-bevel-shadow);
          overflow: hidden;
        }
        .tabs-header {
          display: flex;
          background: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          padding: 4px 6px 0;
          gap: 4px;
          flex-wrap: wrap;
        }
        .tab-btn {
          padding: 7px 12px;
          font-size: 12px;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .tab-btn:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }
        .tab-btn.active {
          color: var(--text-primary);
          font-weight: 700;
          border-bottom-color: var(--accent-blue);
          background: var(--bg-panel);
        }
        .tab-pill {
          font-size: 9.5px;
          font-family: var(--font-mono);
          padding: 1px 5px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
        }
        .tab-content {
          padding: 14px 16px;
          font-size: 12px;
          line-height: 1.6;
          color: var(--text-secondary);
        }
      </style>
      <div class="tabs-card">
        <div class="tabs-header" role="tablist">
          ${tabs
            .map(
              (t) => `
            <button class="tab-btn ${t.id === this._activeTab ? 'active' : ''}" data-tab="${t.id}" role="tab">
              <span>${t.label}</span>
              <span class="tab-pill">${t.badge}</span>
            </button>
          `
            )
            .join('')}
        </div>
        <div class="tab-content" role="tabpanel">
          <strong style="color:var(--text-primary); display:block; margin-bottom:4px;">${current.label}</strong>
          ${current.body}
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._activeTab = btn.dataset.tab;
        this.render();
      });
    });
  }
}

/* ============================================================================
   11. <cortex-progress> — Barras de Progresso & Skeleton Loaders
   ============================================================================ */
export class CortexProgress extends CortexElement {
  constructor() {
    super();
    this._val = 74;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host { display: block; }
        .prog-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 14px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--btn-bevel-shadow);
        }
        .bar-track {
          width: 100%;
          height: 12px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          background: var(--accent-blue);
          transition: width 0.25s ease;
        }
        .bar-fill.ok {
          background: var(--status-ok);
        }
        .skeleton-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sk-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(90deg, var(--bg-input) 25%, var(--bg-hover) 50%, var(--bg-input) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        .sk-lines {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sk-line {
          height: 10px;
          border-radius: 3px;
          background: linear-gradient(90deg, var(--bg-input) 25%, var(--bg-hover) 50%, var(--bg-input) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .p-btn {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
        }
      </style>
      <div class="prog-wrap">
        <div style="display:flex; justify-content:space-between; font-size:12px;">
          <strong>Compilação de Recursos &amp; Assets</strong>
          <span style="font-family:var(--font-mono);">${this._val}%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${this._val === 100 ? 'ok' : ''}" style="width:${this._val}%;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div class="skeleton-row" style="flex:1; min-width:200px;">
            <div class="sk-circle"></div>
            <div class="sk-lines">
              <div class="sk-line" style="width:70%;"></div>
              <div class="sk-line" style="width:45%;"></div>
            </div>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="p-btn" data-p="25">25%</button>
            <button class="p-btn" data-p="65">65%</button>
            <button class="p-btn" data-p="100">100%</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-p]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._val = Number(btn.dataset.p);
        this.render();
      });
    });
  }
}

/* ============================================================================
   12. <cortex-pagination> — Breadcrumb & Barra de Paginação Completa
   ============================================================================ */
export class CortexPagination extends CortexElement {
  constructor() {
    super();
    this._page = 2;
    this._totalPages = 8;
    this._pageSize = 25;
  }

  render() {
    const pages = Array.from({ length: this._totalPages }, (_, i) => i + 1);

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host { display: block; }
        .nav-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .breadcrumb-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          font-size: 11.5px;
          color: var(--text-secondary);
        }
        .bc-item {
          color: var(--text-secondary);
          cursor: pointer;
        }
        .bc-item:hover {
          color: var(--text-primary);
          text-decoration: underline;
        }
        .bc-active {
          color: var(--text-primary);
          font-weight: 700;
        }
        .pag-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding: 8px 12px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          box-shadow: var(--btn-bevel-shadow);
        }
        .pag-btns {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .pg-btn {
          min-width: 26px;
          height: 26px;
          padding: 0 7px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          font-size: 11.5px;
          color: var(--text-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .pg-btn.active {
          background: var(--accent-blue);
          color: var(--accent-text);
          border-color: var(--border-focus);
          font-weight: 700;
        }
      </style>
      <div class="nav-stack">
        <nav class="breadcrumb-bar" aria-label="Breadcrumb">
          <span class="bc-item">&#127968; CortexUI Workspace</span>
          <span>/</span>
          <span class="bc-item">Módulos Corporativos</span>
          <span>/</span>
          <span class="bc-active">Página ${this._page} de ${this._totalPages}</span>
        </nav>

        <div class="pag-bar">
          <span style="font-size:11.5px; color:var(--text-secondary);">
            Exibindo <strong>${(this._page - 1) * this._pageSize + 1}&ndash;${this._page * this._pageSize}</strong> de <strong>${this._totalPages * this._pageSize}</strong> registros
          </span>
          <div class="pag-btns">
            <button class="pg-btn" data-pg="${Math.max(1, this._page - 1)}">&lsaquo; Ant</button>
            ${pages
              .map(
                (p) => `
              <button class="pg-btn ${p === this._page ? 'active' : ''}" data-pg="${p}">${p}</button>
            `
              )
              .join('')}
            <button class="pg-btn" data-pg="${Math.min(this._totalPages, this._page + 1)}">Próx &rsaquo;</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-pg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._page = Number(btn.dataset.pg);
        this.render();
      });
    });
  }
}

/* ============================================================================
   13. <cortex-dropzone> — Upload de Arquivos Drag & Drop com Lista
   ============================================================================ */
export class CortexDropzone extends CortexElement {
  constructor() {
    super();
    this._files = [
      { name: 'arquitetura-cortex-v4.cortex.json', size: '48.2 KB', status: '100% Concluído' },
      { name: 'design-system-tokens.css', size: '24.6 KB', status: '100% Concluído' }
    ];
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host { display: block; }
        .dz-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dz-box {
          padding: 20px;
          border: 2px dashed var(--accent-blue);
          border-radius: var(--radius-md);
          background: var(--accent-blue-alpha);
          text-align: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .dz-box:hover {
          background: var(--bg-hover);
        }
        .file-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 12px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          font-size: 11.5px;
        }
      </style>
      <div class="dz-wrap">
        <div class="dz-box" id="dz-trigger">
          <div style="font-size:18px; margin-bottom:4px;">&#128194;</div>
          <strong style="font-size:12.5px; color:var(--text-primary);">Arraste arquivos para cá ou clique para anexar</strong>
          <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Suporta .json, .svg, .png, .pdf (Máx. 50 MB)</div>
          <input type="file" id="dz-input" multiple style="display:none;" />
        </div>
        <div class="file-list">
          ${this._files
            .map(
              (f, idx) => `
            <div class="file-item">
              <span>&#128196; <strong>${f.name}</strong> <span style="color:var(--text-muted);">(${f.size})</span></span>
              <span style="display:inline-flex; align-items:center; gap:8px;">
                <span style="color:var(--status-ok); font-size:10.5px; font-weight:600;">&#10003; ${f.status}</span>
                <button data-rm-file="${idx}" style="color:var(--text-muted); font-size:13px;" title="Remover">&times;</button>
              </span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    const trigger = this.shadowRoot.querySelector('#dz-trigger');
    const fileInput = this.shadowRoot.querySelector('#dz-input');
    trigger?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', () => {
      Array.from(fileInput.files || []).forEach((f) => {
        this._files.push({
          name: f.name,
          size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
          status: '100% Concluído'
        });
      });
      this.render();
    });

    this.shadowRoot.querySelectorAll('[data-rm-file]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._files.splice(Number(btn.dataset.rmFile), 1);
        this.render();
      });
    });
  }
}

customElements.define('cortex-switch', CortexSwitch);
customElements.define('cortex-tabs', CortexTabs);
customElements.define('cortex-progress', CortexProgress);
customElements.define('cortex-pagination', CortexPagination);
customElements.define('cortex-dropzone', CortexDropzone);
