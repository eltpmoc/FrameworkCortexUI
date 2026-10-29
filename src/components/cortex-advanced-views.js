// src/components/cortex-advanced-views.js
import { CortexElement } from '../core/CortexElement.js';
import { CortexModal } from './cortex-modal.js';

/**
 * Retorna o caminho da foto IA da pessoa (img/docs/pessoa1.jpg ... pessoa12.jpg)
 */
function getPersonPhoto(index) {
  const idx = Math.max(1, Math.min(12, index || 1));
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.protocol === 'file:') {
      const p = (window.location.pathname || '').replace(/\\/g, '/');
      if (p.includes('/docs/')) {
        return `../img/docs/pessoa${idx}.jpg`;
      }
      return `./img/docs/pessoa${idx}.jpg`;
    }
    return `/img/docs/pessoa${idx}.jpg`;
  }
  return `./img/docs/pessoa${idx}.jpg`;
}

/**
 * Fallback de avatar vetorial SVG caso a imagem falhe
 */
function getAvatarFallbackSVG(name = 'User', bg = '#0284c7') {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="100%" height="100%">
    <rect width="40" height="40" rx="20" fill="${bg}"/>
    <text x="20" y="25" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700" font-family="sans-serif">${initials || 'U'}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ============================================================================
   1. <cortex-treelist> — Tree List Hierárquico com Checkboxes e Toolbar Completa (Fiel à Imagem 1)
   ============================================================================ */

const INITIAL_TREELIST_DATA = [
  {
    id: 't-1',
    parentId: null,
    subject: 'Plans 2015',
    assigned: 'John Heart',
    avatarIndex: 1,
    status: 'Completed',
    startDate: '1/1/2015',
    dueDate: '4/1/2015',
    expanded: true,
    checked: true,
    children: [
      {
        id: 't-1-1',
        parentId: 't-1',
        subject: 'Prepare 2015 Financial',
        assigned: 'Sandra Johnson',
        avatarIndex: 9,
        status: 'Completed',
        startDate: '1/15/2015',
        dueDate: '1/31/2015',
        expanded: false,
        checked: false,
        children: []
      },
      {
        id: 't-1-2',
        parentId: 't-1',
        subject: 'Prepare 2015 Marketing Plan',
        assigned: 'Robert Reagan',
        avatarIndex: 8,
        status: 'Completed',
        startDate: '1/1/2015',
        dueDate: '1/31/2015',
        expanded: false,
        checked: true,
        children: []
      },
      {
        id: 't-1-3',
        parentId: 't-1',
        subject: 'Deliver R&D Plans for 2015',
        assigned: 'Arthur Miller',
        avatarIndex: 4,
        status: 'Completed',
        startDate: '3/1/2015',
        dueDate: '3/10/2015',
        expanded: false,
        checked: true,
        children: []
      }
    ]
  },
  {
    id: 't-2',
    parentId: null,
    subject: 'Health Insurance',
    assigned: 'Samantha Bright',
    avatarIndex: 5,
    status: 'In Progress',
    startDate: '2/12/2015',
    dueDate: '5/30/2015',
    expanded: true,
    checked: false,
    children: [
      {
        id: 't-2-1',
        parentId: 't-2',
        subject: 'Review Health Insurance Options Under the Affordable Care Act',
        assigned: 'Samantha Bright',
        avatarIndex: 5,
        status: 'In Progress',
        startDate: '2/12/2015',
        dueDate: '4/25/2015',
        expanded: false,
        checked: false,
        children: []
      },
      {
        id: 't-2-2',
        parentId: 't-2',
        subject: 'Choose between PPO and HMO Health Plan',
        assigned: 'John Heart',
        avatarIndex: 1,
        status: 'In Progress',
        startDate: '2/15/2015',
        dueDate: '4/15/2015',
        expanded: false,
        checked: false,
        children: []
      }
    ]
  }
];

export class CortexTreeList extends CortexElement {
  constructor() {
    super();
    this._treeData = JSON.parse(JSON.stringify(INITIAL_TREELIST_DATA));
    this._searchQuery = '';
    this._showFilterRow = false;
    this._filters = {
      subject: '',
      assigned: '',
      status: '',
      startDate: '',
      dueDate: ''
    };
    this._showSummary = false;
    this._showColumnChooser = false;
    this._visibleColumns = {
      subject: true,
      assigned: true,
      status: true,
      startDate: true,
      dueDate: true
    };
    this._sortField = '';
    this._sortAsc = true;
    this._selectedId = 't-1';
  }

  onLanguageChange() {
    this.render();
  }


  _flattenTree(nodes, level = 0, result = []) {
    for (const node of nodes) {
      result.push({ ...node, level });
      if (node.expanded && node.children && node.children.length > 0) {
        this._flattenTree(node.children, level + 1, result);
      }
    }
    return result;
  }

  _getAllNodes(nodes, result = []) {
    for (const n of nodes) {
      result.push(n);
      if (n.children && n.children.length > 0) {
        this._getAllNodes(n.children, result);
      }
    }
    return result;
  }

  _findNode(nodes, id) {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children && n.children.length > 0) {
        const found = this._findNode(n.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  _deleteNodeFromTree(nodes, id) {
    const idx = nodes.findIndex((n) => n.id === id);
    if (idx !== -1) {
      nodes.splice(idx, 1);
      return true;
    }
    for (const n of nodes) {
      if (n.children && n.children.length > 0) {
        if (this._deleteNodeFromTree(n.children, id)) return true;
      }
    }
    return false;
  }

  _getMasterCheckState() {
    const all = this._getAllNodes(this._treeData);
    if (all.length === 0) return 'none';
    const checkedCount = all.filter((n) => n.checked).length;
    if (checkedCount === all.length) return 'all';
    if (checkedCount > 0) return 'some';
    return 'none';
  }

  render() {
    const flatRows = this._flattenTree(this._treeData);
    const q = this._searchQuery.trim().toLowerCase();

    const filteredRows = flatRows.filter((r) => {
      if (q) {
        const full = `${r.subject} ${r.assigned} ${r.status} ${r.startDate} ${r.dueDate}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      if (this._showFilterRow) {
        if (this._filters.subject && !r.subject.toLowerCase().includes(this._filters.subject.toLowerCase())) return false;
        if (this._filters.assigned && !r.assigned.toLowerCase().includes(this._filters.assigned.toLowerCase())) return false;
        if (this._filters.status && !r.status.toLowerCase().includes(this._filters.status.toLowerCase())) return false;
        if (this._filters.startDate && !r.startDate.toLowerCase().includes(this._filters.startDate.toLowerCase())) return false;
        if (this._filters.dueDate && !r.dueDate.toLowerCase().includes(this._filters.dueDate.toLowerCase())) return false;
      }
      return true;
    });

    const masterState = this._getMasterCheckState();
    const allNodes = this._getAllNodes(this._treeData);
    const completedTasks = allNodes.filter((n) => n.status === 'Completed').length;
    const inProgressTasks = allNodes.filter((n) => n.status === 'In Progress').length;
    const uniqueAssignees = new Set(allNodes.map((n) => n.assigned)).size;

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
          color: var(--text-primary);
        }

        .ctl-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md, 8px);
          overflow: visible;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        /* Toolbar Superior */
        .ctl-toolbar {
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: var(--bg-panel);
          border-bottom: 1px solid var(--border-subtle);
          flex-wrap: wrap;
        }
        .ctl-toolbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ctl-btn-text {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 7px 14px;
          border-radius: var(--radius-sm, 4px);
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ctl-btn-text:hover {
          background: var(--bg-hover);
          border-color: var(--border-subtle);
        }
        .ctl-btn-danger:hover {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.12);
        }

        .ctl-toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }
        .ctl-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm, 4px);
          border: 1px solid var(--border-subtle);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          transition: all 0.15s ease;
        }
        .ctl-icon-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--border-focus, #ea580c);
        }
        .ctl-icon-btn.active {
          background: rgba(234, 88, 12, 0.18);
          border-color: #ea580c;
          color: #ea580c;
        }

        /* Busca */
        .ctl-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .ctl-search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .ctl-search-input {
          padding: 7px 12px 7px 32px;
          font-size: 13px;
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm, 4px);
          background: var(--bg-input);
          color: var(--text-primary);
          outline: none;
          width: 170px;
          transition: all 0.15s ease;
        }
        .ctl-search-input:focus {
          border-color: #ea580c;
          box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.25);
          width: 210px;
        }

        /* Summary Bar */
        .ctl-summary-bar {
          background: var(--bg-panel-header, rgba(0, 0, 0, 0.15));
          border-bottom: 1px solid var(--border-subtle);
          padding: 12px 18px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }
        .ctl-kpi-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm, 6px);
          padding: 8px 12px;
        }
        .ctl-kpi-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .ctl-kpi-val {
          font-size: 18px;
          font-weight: 700;
          color: #ea580c;
          margin-top: 2px;
        }

        /* Popover Seletor de Colunas */
        .ctl-popover {
          position: absolute;
          top: 42px;
          right: 48px;
          z-index: 50;
          background: var(--bg-elevated);
          border: 1px solid var(--border-strong, var(--border-subtle));
          border-radius: var(--radius-md, 6px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35);
          padding: 12px;
          width: 200px;
        }
        .ctl-col-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 4px;
          font-size: 13px;
          color: var(--text-primary);
          cursor: pointer;
        }

        /* Tabela Tree */
        .ctl-table-wrap {
          overflow-x: auto;
          overflow-y: auto;
          max-height: 540px;
          width: 100%;
        }
        table.ctl-table {
          width: 100%;
          min-width: 650px;
          border-collapse: collapse;
          font-size: 13.5px;
          text-align: left;
        }
        table.ctl-table th {
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-panel);
          border-bottom: 1px solid var(--border-subtle);
          white-space: nowrap;
          user-select: none;
        }
        table.ctl-table th.sortable {
          cursor: pointer;
        }
        table.ctl-table th.sortable:hover {
          color: var(--text-primary);
        }

        /* Checkbox Customizado Laranja (Fiel à imagem em todos os temas) */
        .ctl-checkbox {
          width: 17px;
          height: 17px;
          border-radius: 3px;
          border: 1.5px solid var(--border-input, #64748b);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: var(--bg-input, #ffffff);
          color: #ffffff;
          transition: all 0.12s ease;
          user-select: none;
          font-size: 11px;
          font-weight: 800;
        }
        .ctl-checkbox.checked,
        .ctl-checkbox.indeterminate {
          background: #f97316 !important;
          border-color: #ea580c !important;
          color: #ffffff !important;
        }

        /* Linhas da Tree */
        table.ctl-table tr.ctl-row {
          cursor: pointer;
          transition: background-color 0.12s ease;
          border-bottom: 1px solid var(--border-subtle);
        }
        table.ctl-table tr.ctl-row:hover {
          background-color: var(--bg-hover, rgba(249, 115, 22, 0.05));
        }

        /* Fundo destacado nos itens selecionados/marcados de forma reativa aos temas */
        table.ctl-table tr.ctl-row.checked-row {
          background-color: rgba(249, 115, 22, 0.14) !important;
          border-left: 3px solid #f97316;
        }
        table.ctl-table tr.ctl-row.selected-active {
          outline: 1px solid #ea580c;
        }
        table.ctl-table td {
          padding: 12px 16px;
          color: var(--text-primary);
          vertical-align: middle;
        }

        /* Célula Subject com Indentação e Chevron */
        .ctl-subject-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ctl-chevron-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 12px;
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: transform 0.15s ease, color 0.15s ease;
        }
        .ctl-chevron-btn:hover {
          color: #ea580c;
        }

        /* Coluna Assigned com Foto Redonda */
        .ctl-assignee-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ctl-avatar-img {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-subtle);
        }

        /* Linha de Filtros Inline */
        .ctl-filter-row th {
          padding: 6px 12px 10px 12px !important;
          background: var(--bg-panel-header, rgba(0, 0, 0, 0.05)) !important;
        }
        .ctl-col-filter-input {
          width: 100%;
          padding: 5px 8px;
          font-size: 12px;
          border: 1px solid var(--border-input);
          border-radius: 4px;
          background: var(--bg-input);
          color: var(--text-primary);
          outline: none;
        }
        .ctl-col-filter-input:focus {
          border-color: #ea580c;
        }
      </style>

      <div class="ctl-card">
        <!-- Toolbar Superior -->
        <div class="ctl-toolbar">
          <div class="ctl-toolbar-left">
            <button id="ctl-btn-new" class="ctl-btn-text" title="Adicionar Nova Tarefa ou Subtarefa">
              NEW
            </button>
            <button id="ctl-btn-delete" class="ctl-btn-text ctl-btn-danger" title="Excluir Tarefas Selecionadas">
              DELETE
            </button>
          </div>

          <div class="ctl-toolbar-right">
            <button id="ctl-btn-summary" class="ctl-icon-btn ${this._showSummary ? 'active' : ''}" title="Alternar Resumo de Métricas">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </button>
            <button id="ctl-btn-filter" class="ctl-icon-btn ${this._showFilterRow ? 'active' : ''}" title="Alternar Filtros por Coluna">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            </button>
            <button id="ctl-btn-columns" class="ctl-icon-btn ${this._showColumnChooser ? 'active' : ''}" title="Seletor de Colunas">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </button>
            <button id="ctl-btn-export" class="ctl-icon-btn" title="Exportar Tarefas para CSV">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>

            <!-- Campo de Busca -->
            <div class="ctl-search-box">
              <span class="ctl-search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                id="ctl-search-input"
                class="ctl-search-input"
                type="text"
                placeholder="Search..."
                value="${this._searchQuery}"
              />
            </div>

            <!-- Popover Colunas -->
            ${
              this._showColumnChooser
                ? `
                  <div class="ctl-popover">
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px;">Exibir Colunas</div>
                    <label class="ctl-col-item"><input type="checkbox" data-ctl-col="subject" ${this._visibleColumns.subject ? 'checked' : ''}/> Task Subject</label>
                    <label class="ctl-col-item"><input type="checkbox" data-ctl-col="assigned" ${this._visibleColumns.assigned ? 'checked' : ''}/> Assigned</label>
                    <label class="ctl-col-item"><input type="checkbox" data-ctl-col="status" ${this._visibleColumns.status ? 'checked' : ''}/> Status</label>
                    <label class="ctl-col-item"><input type="checkbox" data-ctl-col="startDate" ${this._visibleColumns.startDate ? 'checked' : ''}/> Start Date</label>
                    <label class="ctl-col-item"><input type="checkbox" data-ctl-col="dueDate" ${this._visibleColumns.dueDate ? 'checked' : ''}/> Due Date</label>
                  </div>
                `
                : ''
            }
          </div>
        </div>

        <!-- Summary Bar -->
        ${
          this._showSummary
            ? `
              <div class="ctl-summary-bar">
                <div class="ctl-kpi-card">
                  <div class="ctl-kpi-label">Total de Tarefas</div>
                  <div class="ctl-kpi-val">${allNodes.length}</div>
                </div>
                <div class="ctl-kpi-card">
                  <div class="ctl-kpi-label">Concluídas</div>
                  <div class="ctl-kpi-val">${completedTasks}</div>
                </div>
                <div class="ctl-kpi-card">
                  <div class="ctl-kpi-label">Em Progresso</div>
                  <div class="ctl-kpi-val">${inProgressTasks}</div>
                </div>
                <div class="ctl-kpi-card">
                  <div class="ctl-kpi-label">Responsáveis Únicos</div>
                  <div class="ctl-kpi-val">${uniqueAssignees}</div>
                </div>
              </div>
            `
            : ''
        }

        <!-- Tabela Tree List com Scroll Horizontal e Vertical -->
        <div class="ctl-table-wrap">
          <table class="ctl-table">
            <thead>
              <tr>
                <th style="width: 44px; text-align: center;">
                  <span
                    id="ctl-master-check"
                    class="ctl-checkbox ${masterState === 'all' ? 'checked' : masterState === 'some' ? 'indeterminate' : ''}"
                    title="Marcar / Desmarcar Todos"
                  >
                    ${masterState === 'all' ? '✓' : masterState === 'some' ? '−' : ''}
                  </span>
                </th>
                ${this._visibleColumns.subject ? `<th class="sortable" data-sort="subject">Task Subject ≡</th>` : ''}
                ${this._visibleColumns.assigned ? `<th class="sortable" data-sort="assigned">Assigned ≡</th>` : ''}
                ${this._visibleColumns.status ? `<th class="sortable" data-sort="status">Status ≡</th>` : ''}
                ${this._visibleColumns.startDate ? `<th class="sortable" data-sort="startDate">Start Date ≡</th>` : ''}
                ${this._visibleColumns.dueDate ? `<th class="sortable" data-sort="dueDate">Due Date ≡</th>` : ''}
              </tr>

              <!-- Linha de Filtros Inline -->
              ${
                this._showFilterRow
                  ? `
                    <tr class="ctl-filter-row">
                      <th></th>
                      ${this._visibleColumns.subject ? `<th><input type="text" class="ctl-col-filter-input" data-col="subject" placeholder="Filtrar..." value="${this._filters.subject}"/></th>` : ''}
                      ${this._visibleColumns.assigned ? `<th><input type="text" class="ctl-col-filter-input" data-col="assigned" placeholder="Filtrar..." value="${this._filters.assigned}"/></th>` : ''}
                      ${this._visibleColumns.status ? `<th><input type="text" class="ctl-col-filter-input" data-col="status" placeholder="Filtrar..." value="${this._filters.status}"/></th>` : ''}
                      ${this._visibleColumns.startDate ? `<th><input type="text" class="ctl-col-filter-input" data-col="startDate" placeholder="Filtrar..." value="${this._filters.startDate}"/></th>` : ''}
                      ${this._visibleColumns.dueDate ? `<th><input type="text" class="ctl-col-filter-input" data-col="dueDate" placeholder="Filtrar..." value="${this._filters.dueDate}"/></th>` : ''}
                    </tr>
                  `
                  : ''
              }
            </thead>
            <tbody>
              ${
                filteredRows.length === 0
                  ? `<tr><td colspan="6" style="padding: 30px; text-align: center; color: var(--text-muted);">Nenhuma tarefa encontrada.</td></tr>`
                  : filteredRows
                      .map((row) => {
                        const hasChildren = row.children && row.children.length > 0;
                        const isChecked = row.checked;
                        const photoUrl = getPersonPhoto(row.avatarIndex);
                        const fallbackSvg = getAvatarFallbackSVG(row.assigned);

                        return `
                          <tr
                            class="ctl-row ${isChecked ? 'checked-row' : ''} ${this._selectedId === row.id ? 'selected-active' : ''}"
                            data-task-id="${row.id}"
                          >
                            <td style="text-align: center;">
                              <span
                                class="ctl-checkbox ${isChecked ? 'checked' : ''}"
                                data-check-id="${row.id}"
                              >
                                ${isChecked ? '✓' : ''}
                              </span>
                            </td>

                            ${
                              this._visibleColumns.subject
                                ? `
                                  <td>
                                    <div class="ctl-subject-cell" style="padding-left: ${row.level * 24}px;">
                                      ${
                                        hasChildren
                                          ? `<button class="ctl-chevron-btn" data-chevron-id="${row.id}" title="${row.expanded ? 'Recolher' : 'Expandir'}">${row.expanded ? '∨' : '>'}</button>`
                                          : `<span style="width: 18px; display: inline-block;"></span>`
                                      }
                                      <span style="font-weight: ${row.level === 0 ? '600' : '400'}; color: var(--text-primary);">${row.subject}</span>
                                    </div>
                                  </td>
                                `
                                : ''
                            }

                            ${
                              this._visibleColumns.assigned
                                ? `
                                  <td>
                                    <div class="ctl-assignee-cell">
                                      <img src="${photoUrl}" alt="${row.assigned}" class="ctl-avatar-img" onerror="this.src='${fallbackSvg}'"/>
                                      <span style="color: var(--text-primary);">${row.assigned}</span>
                                    </div>
                                  </td>
                                `
                                : ''
                            }

                            ${this._visibleColumns.status ? `<td style="color: var(--text-secondary);">${row.status}</td>` : ''}
                            ${this._visibleColumns.startDate ? `<td style="color: var(--text-muted);">${row.startDate}</td>` : ''}
                            ${this._visibleColumns.dueDate ? `<td style="color: var(--text-muted);">${row.dueDate}</td>` : ''}
                          </tr>
                        `;
                      })
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    const root = this.shadowRoot;

    // Master Checkbox
    root.querySelector('#ctl-master-check')?.addEventListener('click', () => {
      const cur = this._getMasterCheckState();
      const next = cur !== 'all';
      const all = this._getAllNodes(this._treeData);
      all.forEach((n) => (n.checked = next));
      this.render();
    });

    // Checkbox individual
    root.querySelectorAll('.ctl-checkbox[data-check-id]').forEach((chk) => {
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = chk.getAttribute('data-check-id');
        const node = this._findNode(this._treeData, id);
        if (node) {
          node.checked = !node.checked;
          if (node.children) {
            node.children.forEach((c) => (c.checked = node.checked));
          }
          this.render();
        }
      });
    });

    // Chevron expand/collapse
    root.querySelectorAll('.ctl-chevron-btn[data-chevron-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-chevron-id');
        const node = this._findNode(this._treeData, id);
        if (node) {
          node.expanded = !node.expanded;
          this.render();
        }
      });
    });

    // Clique na linha
    root.querySelectorAll('tr.ctl-row').forEach((tr) => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('.ctl-checkbox') || e.target.closest('.ctl-chevron-btn')) return;
        this._selectedId = tr.getAttribute('data-task-id');
        this.render();
      });

      // Duplo clique abre edição modal
      tr.addEventListener('dblclick', async () => {
        const id = tr.getAttribute('data-task-id');
        const node = this._findNode(this._treeData, id);
        if (!node) return;

        const res = await CortexModal.form({
          title: `Editar Tarefa: ${node.subject}`,
          message: 'Atualize os dados da tarefa:',
          fields: [
            { name: 'subject', label: 'Task Subject', value: node.subject },
            { name: 'assigned', label: 'Assigned', value: node.assigned },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              value: node.status,
              options: ['Completed', 'In Progress', 'Need Assistance', 'Deferred']
            },
            { name: 'startDate', label: 'Start Date', type: 'datepicker', value: node.startDate },
            { name: 'dueDate', label: 'Due Date', type: 'datepicker', value: node.dueDate }
          ]
        });

        if (res && !res.__action) {
          node.subject = res.subject || node.subject;
          node.assigned = res.assigned || node.assigned;
          node.status = res.status || node.status;
          node.startDate = res.startDate || node.startDate;
          node.dueDate = res.dueDate || node.dueDate;
          this.render();
          CortexModal.toast('Tarefa atualizada com sucesso!', 'success');
        }
      });
    });

    // Botão NEW
    root.querySelector('#ctl-btn-new')?.addEventListener('click', async () => {
      const parents = this._getAllNodes(this._treeData).map((n) => ({
        label: n.subject,
        value: n.id
      }));
      parents.unshift({ label: '[Raiz - Nível Principal]', value: '' });

      const res = await CortexModal.form({
        title: 'Nova Tarefa Tree List',
        message: 'Preencha os detalhes da nova tarefa:',
        width: '440px',
        fields: [
          { name: 'subject', label: 'Task Subject', value: '', placeholder: 'Ex: Design Review 2026' },
          { name: 'assigned', label: 'Assigned To', value: 'John Heart' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            value: 'In Progress',
            options: ['In Progress', 'Completed', 'Need Assistance', 'Deferred']
          },
          { name: 'startDate', label: 'Start Date', type: 'datepicker', value: '2/1/2026' },
          { name: 'dueDate', label: 'Due Date', type: 'datepicker', value: '5/1/2026' },
          {
            name: 'parentId',
            label: 'Tarefa Pai (Hierarquia)',
            type: 'select',
            value: this._selectedId || '',
            options: parents
          }
        ]
      });

      if (res && !res.__action) {
        const newTask = {
          id: `t-${Date.now()}`,
          parentId: res.parentId || null,
          subject: res.subject || 'Nova Tarefa',
          assigned: res.assigned || 'Equipe',
          avatarIndex: Math.floor(Math.random() * 10) + 1,
          status: res.status || 'In Progress',
          startDate: res.startDate || '1/1/2026',
          dueDate: res.dueDate || '12/31/2026',
          expanded: true,
          checked: false,
          children: []
        };

        if (res.parentId) {
          const parent = this._findNode(this._treeData, res.parentId);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(newTask);
            parent.expanded = true;
          } else {
            this._treeData.push(newTask);
          }
        } else {
          this._treeData.push(newTask);
        }

        this._selectedId = newTask.id;
        this.render();
        CortexModal.toast(`Tarefa "${newTask.subject}" criada com sucesso!`, 'success');
      }
    });

    // Botão DELETE
    root.querySelector('#ctl-btn-delete')?.addEventListener('click', async () => {
      const all = this._getAllNodes(this._treeData);
      const checked = all.filter((n) => n.checked);

      if (checked.length === 0 && !this._selectedId) {
        CortexModal.toast('Selecione ou marque ao menos uma tarefa para excluir.', 'warning');
        return;
      }

      const targets = checked.length > 0 ? checked : [this._findNode(this._treeData, this._selectedId)].filter(Boolean);
      const names = targets.map((t) => t.subject).join(', ');

      const confirmed = await CortexModal.confirm({
        title: 'Excluir Tarefas da Tree',
        message: `Deseja realmente remover as seguintes tarefas (e suas subtarefas)?\n\n${names}`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        danger: true
      });

      if (confirmed) {
        targets.forEach((t) => {
          this._deleteNodeFromTree(this._treeData, t.id);
        });
        this._selectedId = null;
        this.render();
        CortexModal.toast('Tarefa(s) removida(s) com sucesso.', 'info');
      }
    });

    // Botão Summary
    root.querySelector('#ctl-btn-summary')?.addEventListener('click', () => {
      this._showSummary = !this._showSummary;
      this.render();
    });

    // Botão Filter
    root.querySelector('#ctl-btn-filter')?.addEventListener('click', () => {
      this._showFilterRow = !this._showFilterRow;
      this.render();
    });

    // Botão Column Chooser
    root.querySelector('#ctl-btn-columns')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._showColumnChooser = !this._showColumnChooser;
      this.render();
    });

    root.querySelectorAll('.ctl-popover input[data-ctl-col]').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const col = e.target.getAttribute('data-ctl-col');
        if (col) {
          this._visibleColumns[col] = e.target.checked;
          this.render();
        }
      });
    });

    // Botão Export CSV
    root.querySelector('#ctl-btn-export')?.addEventListener('click', () => {
      const flat = this._flattenTree(this._treeData);
      let csv = '\uFEFF';
      csv += '"Level","Task Subject","Assigned","Status","Start Date","Due Date"\n';
      flat.forEach((r) => {
        const indent = '  '.repeat(r.level);
        csv += `"${r.level}","${indent}${r.subject.replace(/"/g, '""')}","${r.assigned}","${r.status}","${r.startDate}","${r.dueDate}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'treelist_tasks.csv';
      a.click();
      URL.revokeObjectURL(url);
      CortexModal.toast('Arquivo treelist_tasks.csv exportado com sucesso!', 'success');
    });

    // Busca
    const searchInp = root.querySelector('#ctl-search-input');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        this._searchQuery = e.target.value;
        this.render();
        const fresh = this.shadowRoot.querySelector('#ctl-search-input');
        if (fresh) {
          fresh.focus();
          fresh.setSelectionRange(fresh.value.length, fresh.value.length);
        }
      });
    }

    // Filtros de Coluna
    root.querySelectorAll('.ctl-col-filter-input').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        const col = e.target.getAttribute('data-col');
        if (col) {
          this._filters[col] = e.target.value;
          this.render();
          const fresh = this.shadowRoot.querySelector(`.ctl-col-filter-input[data-col="${col}"]`);
          if (fresh) {
            fresh.focus();
            fresh.setSelectionRange(fresh.value.length, fresh.value.length);
          }
        }
      });
    });
  }
}

/* ============================================================================
   2. <cortex-diagram> — Organograma / Diagram Designer Interativo (Fiel à Imagem 2)
   ============================================================================ */

export class CortexDiagram extends CortexElement {
  constructor() {
    super();
    this._zoom = 1;
    this._isFullscreen = false;
    this._zoomMenuOpen = false;
    this._activeTool = 'select'; // 'select' (Padrão: Mover / Seleção) | 'pan' | 'line-straight' | 'line-arrow-right' | 'line-arrow-left' | 'line-arrow-both'
    this._selectedNodeIds = new Set(['node-selected-box']);
    this._selectedConnectorIds = new Set();
    this._showToolbarLabels = true; // Rótulos abaixo do ícone (True) ou Somente Ícones (False)
    
    // Posição livre da Barra de Ferramentas Superior
    this._topToolbarPos = { x: 14, y: 14 };

    // Paleta de Cores CortexUI
    this._colorPaletteOpen = false;
    this._colorTarget = 'stroke'; // 'fill' | 'stroke' | 'color'
    this._currentColor = '#0284c7';

    // Paleta de Fontes Completa CortexUI
    this._fontPaletteOpen = false;
    this._currentFontFamily = 'Inter, Segoe UI, sans-serif';
    this._currentFontSize = 12;
    this._currentFontWeight = '600';
    this._currentFontStyle = 'normal';
    this._currentTextDecoration = 'none';
    this._currentTextAlign = 'center';

    // Menu de Linhas
    this._linesMenuOpen = false;

    // Menu de Contexto
    this._contextMenuOpen = false;
    this._contextMenuPos = { x: 0, y: 0 };

    this._history = [];
    this._future = [];
    this._toolboxCollapsed = false;
    this._toolboxSearch = '';
    this._toolboxDocked = null;
    this._toolboxPos = { x: 14, y: 70 };

    // Janela Desktop Flutuante de Edição de Texto (Fiel ao estilo da Toolbox General)
    this._textEditorOpen = false;
    this._textEditorNodeId = null;
    this._textEditorValue = '';
    this._textEditorPos = { x: 320, y: 170 };

    // 24 Cores clássicas do Design System CortexUI
    this._swatches = [
      '#10b981', '#1473e6', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
      '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#06b6d4',
      '#ffffff', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a', '#18181b'
    ];

    // Fontes desktop clássicas do CortexUI
    this._fontFamilies = [
      { name: 'Inter / Padrão', value: 'Inter, Segoe UI, sans-serif' },
      { name: 'Segoe UI', value: '"Segoe UI", sans-serif' },
      { name: 'Roboto / Arial', value: 'Roboto, Arial, sans-serif' },
      { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
      { name: 'Verdana', value: 'Verdana, sans-serif' },
      { name: 'Georgia', value: 'Georgia, serif' },
      { name: 'Times New Roman', value: '"Times New Roman", serif' },
      { name: 'JetBrains Mono', value: '"JetBrains Mono", Consolas, monospace' },
      { name: 'Consolas', value: 'Consolas, monospace' }
    ];

    // Nós iniciais do Organograma fiéis ao modelo
    this._nodes = [
      { id: 'ceo', type: 'rect', label: 'CEO', x: 420, y: 50, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 13, fontWeight: '700', fontFamily: 'inherit', textAlign: 'center' },
      // Esquerda: COO e ramificações
      { id: 'coo', type: 'rect', label: 'COO', x: 230, y: 170, w: 90, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 13, fontWeight: '700', fontFamily: 'inherit', textAlign: 'center' },
      { id: 'ship-mgr', type: 'rect', label: 'Shipping\nManager', x: 230, y: 280, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', textAlign: 'center' },
      { id: 'ship-asst-1', type: 'rect', label: 'Shipping\nAssistant', x: 50, y: 410, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', textAlign: 'center' },
      { id: 'ship-asst-2', type: 'rect', label: 'Shipping\nAssistant', x: 170, y: 410, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', textAlign: 'center' },
      { id: 'ship-asst-3', type: 'rect', label: 'Shipping\nAssistant', x: 290, y: 410, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', textAlign: 'center' },
      { id: 'ship-asst-4', type: 'rect', label: 'Shipping\nAssistant', x: 410, y: 410, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', textAlign: 'center' },
      // Centro: Caixa pontilhada selecionada com 8 pontos de redimensionamento
      { id: 'node-selected-box', type: 'rect', label: '', x: 420, y: 220, w: 100, h: 60, rotation: 0, selectedStyle: true, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '500', fontFamily: 'inherit', textAlign: 'center' },
      { id: 'net-admin-1', type: 'rect', label: 'Network\nAdmin', x: 530, y: 410, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', textAlign: 'center' },
      { id: 'net-admin-2', type: 'rect', label: 'Network\nAdmin', x: 650, y: 410, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', textAlign: 'center' },
      // Direita: CTO e ramificações
      { id: 'cto', type: 'rect', label: 'CTO', x: 900, y: 170, w: 90, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 13, fontWeight: '700', fontFamily: 'inherit', textAlign: 'center' },
      { id: 'it-mgr', type: 'rect', label: 'IT Manager', x: 780, y: 280, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', textAlign: 'center' },
      { id: 'prog-1', type: 'rect', label: 'Programmer', x: 780, y: 410, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', textAlign: 'center' },
      { id: 'prog-2', type: 'rect', label: 'Programmer', x: 900, y: 410, w: 100, h: 56, rotation: 0, fill: '', stroke: '', color: '', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', textAlign: 'center' }
    ];

    // Conectores ortogonais dinâmicos e totalmente interativos
    this._connectors = [
      { id: 'conn-ceo-coo', from: 'ceo', to: 'coo', busY: 138, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-ceo-cto', from: 'ceo', to: 'cto', busY: 138, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-coo-ship-mgr', from: 'coo', to: 'ship-mgr', busY: null, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-ship-mgr-asst-1', from: 'ship-mgr', to: 'ship-asst-1', busY: 370, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-ship-mgr-asst-2', from: 'ship-mgr', to: 'ship-asst-2', busY: 370, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-ship-mgr-asst-3', from: 'ship-mgr', to: 'ship-asst-3', busY: 370, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-ship-mgr-asst-4', from: 'ship-mgr', to: 'ship-asst-4', busY: 370, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-ceo-net-admin-1', from: 'ceo', to: 'net-admin-1', busY: 138, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-ceo-net-admin-2', from: 'ceo', to: 'net-admin-2', busY: 138, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-cto-it-mgr', from: 'cto', to: 'it-mgr', busY: 250, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-it-mgr-prog-1', from: 'it-mgr', to: 'prog-1', busY: null, dropX: null, color: '', strokeWidth: 1.8 },
      { id: 'conn-it-mgr-prog-2', from: 'it-mgr', to: 'prog-2', busY: 370, dropX: null, color: '', strokeWidth: 1.8 }
    ];
  }

  onLanguageChange() {
    this.render();
  }

  /**
   * Abre a janela flutuante desktop para edição do texto do objeto
   */
  _openTextEditor(nodeId) {
    const node = this._nodes.find((n) => n.id === nodeId);
    if (!node || node.type === 'group' || (node.type && node.type.startsWith('line-'))) return;

    this._textEditorOpen = true;
    this._textEditorNodeId = nodeId;
    this._textEditorValue = node.label || '';

    // Posiciona próximo ao objeto ou centrado na tela visível
    const canvasEl = this.shadowRoot?.querySelector('#cd-canvas');
    if (canvasEl) {
      const scrollLeft = canvasEl.scrollLeft;
      const scrollTop = canvasEl.scrollTop;
      const clientW = canvasEl.clientWidth;
      const clientH = canvasEl.clientHeight;

      let targetX = (node.x * this._zoom) - scrollLeft + (node.w * this._zoom) + 15;
      let targetY = (node.y * this._zoom) - scrollTop;

      if (targetX + 330 > clientW) {
        targetX = Math.max(20, (node.x * this._zoom) - scrollLeft - 335);
      }
      if (targetX < 20 || targetX + 330 > clientW) {
        targetX = Math.max(20, (clientW - 320) / 2);
      }
      if (targetY + 200 > clientH) {
        targetY = Math.max(40, clientH - 220);
      }
      if (targetY < 40) targetY = 60;

      this._textEditorPos = {
        x: Math.round(targetX),
        y: Math.round(targetY)
      };
    } else {
      this._textEditorPos = { x: 320, y: 170 };
    }

    this._contextMenuOpen = false;
    this.render();

    // Auto-foco e seleção no textarea
    setTimeout(() => {
      const ta = this.shadowRoot?.querySelector('#cd-te-textarea');
      if (ta) {
        ta.focus?.();
        ta.select?.();
      }
    }, 40);
  }

  /**
   * Salva as alterações feitas no texto do objeto
   */
  _saveTextEditor() {
    if (!this._textEditorOpen || !this._textEditorNodeId) return;
    const node = this._nodes.find((n) => n.id === this._textEditorNodeId);
    const ta = this.shadowRoot?.querySelector('#cd-te-textarea');
    const val = ta ? ta.value : this._textEditorValue;

    if (node && val !== undefined) {
      this._recordHistory();
      node.label = val;
    }

    this._textEditorOpen = false;
    this._textEditorNodeId = null;
    this._textEditorValue = '';
    this.render();
    CortexModal.toast('Texto do objeto atualizado com sucesso!', 'success');
  }

  /**
   * Fecha a janela flutuante de edição sem salvar
   */
  _closeTextEditor() {
    this._textEditorOpen = false;
    this._textEditorNodeId = null;
    this._textEditorValue = '';
    this.render();
  }


  /**
   * Calcula o caminho ortogonal dinâmico do conector com base nos nós conectados e ajustes manuais
   */
  _computeConnectorPath(c) {
    const fromNode = this._nodes.find((n) => n.id === c.from);
    const toNode = this._nodes.find((n) => n.id === c.to);

    if (fromNode && toNode) {
      const fromX = fromNode.x + fromNode.w / 2;
      const fromY = fromNode.y + fromNode.h;
      const toX = (c.dropX !== null && c.dropX !== undefined) ? c.dropX : (toNode.x + toNode.w / 2);
      const toY = toNode.y;

      // Linha estritamente vertical
      if (c.busY === null || Math.abs(fromX - toX) <= 6) {
        const lineX = fromX;
        return {
          path: `M ${lineX} ${fromY} L ${lineX} ${toY}`,
          type: 'vertical',
          fromPt: { x: lineX, y: fromY },
          toPt: { x: lineX, y: toY },
          busY: null,
          dropX: lineX
        };
      }

      // Linha ortogonal com barramento (bus)
      const busY = (c.busY !== null && c.busY !== undefined)
        ? c.busY
        : Math.round(fromY + (toY - fromY) / 2);

      return {
        path: `M ${fromX} ${fromY} L ${fromX} ${busY} L ${toX} ${busY} L ${toX} ${toY}`,
        type: 'orthogonal',
        fromPt: { x: fromX, y: fromY },
        toPt: { x: toX, y: toY },
        busY,
        dropX: toX
      };
    }

    return {
      path: c.path || '',
      type: 'custom',
      fromPt: { x: 0, y: 0 },
      toPt: { x: 0, y: 0 },
      busY: c.busY || null,
      dropX: c.dropX || null
    };
  }

  /**
   * Atualização em tempo real dos conectores SVG sem re-renderizar o componente inteiro
   */
  _updateConnectorSVGs() {
    const root = this.shadowRoot;
    if (!root) return;
    const svgLayer = root.querySelector('#cd-svg-layer');
    if (!svgLayer) return;

    this._connectors.forEach((c) => {
      const computed = this._computeConnectorPath(c);
      const wirePath = svgLayer.querySelector(`.cd-wire[data-conn-id="${c.id}"]`);
      const hitPath = svgLayer.querySelector(`.cd-wire-hit[data-conn-id="${c.id}"]`);
      if (wirePath) wirePath.setAttribute('d', computed.path);
      if (hitPath) hitPath.setAttribute('d', computed.path);

      const busHandle = svgLayer.querySelector(`.cd-bus-handle[data-conn-id="${c.id}"]`);
      if (busHandle && computed.busY !== null) {
        const midX = (computed.fromPt.x + computed.toPt.x) / 2;
        busHandle.setAttribute('transform', `translate(${midX}, ${computed.busY})`);
      }

      const dropHandle = svgLayer.querySelector(`.cd-drop-handle[data-conn-id="${c.id}"]`);
      if (dropHandle && computed.dropX !== null) {
        const midY = computed.busY ? (computed.busY + computed.toPt.y) / 2 : (computed.fromPt.y + computed.toPt.y) / 2;
        dropHandle.setAttribute('transform', `translate(${computed.dropX}, ${midY})`);
      }
    });
  }

  /**
   * Retorna as coordenadas de uma porta cardinal de conexão em um nó
   */
  onMount() {
    this._onFullscreenChange = () => {
      const isFs = document.fullscreenElement === this;
      this._isFullscreen = isFs;
      this.toggleAttribute('data-fullscreen', isFs);
      const wrapper = this.shadowRoot?.querySelector('#cd-wrapper');
      if (wrapper) {
        wrapper.classList.toggle('is-fullscreen', isFs);
      }
      const btnFs = this.shadowRoot?.querySelector('#cd-btn-fullscreen');
      if (btnFs) {
        btnFs.title = isFs ? 'Sair da Tela Cheia' : 'Tela Cheia';
        btnFs.textContent = isFs ? '🗗' : '⛶';
      }
    };
    document.addEventListener('fullscreenchange', this._onFullscreenChange);
  }

  onUnmount() {
    if (this._onFullscreenChange) {
      document.removeEventListener('fullscreenchange', this._onFullscreenChange);
      this._onFullscreenChange = null;
    }
  }

  _getNodePortCoords(node, portName) {
    const cx = node.x + node.w / 2;
    const cy = node.y + node.h / 2;

    if (portName === 'top') return { x: cx, y: node.y };
    if (portName === 'bottom') return { x: cx, y: node.y + node.h };
    if (portName === 'left') return { x: node.x, y: cy };
    if (portName === 'right') return { x: node.x + node.w, y: cy };
    return { x: cx, y: cy };
  }

  /**
   * Retorna os pontos de início (p1) e fim (p2) de uma linha, considerando suas ancoragens magnéticas
   */
  _getLineEndpoints(lineNode) {
    let p1 = lineNode.p1;
    let p2 = lineNode.p2;

    if (!p1 || !p2) {
      const rotRad = (lineNode.rotation || 0) * (Math.PI / 180);
      const halfW = lineNode.w / 2;
      const midX = lineNode.x + halfW;
      const midY = lineNode.y + 10;
      p1 = {
        x: midX - halfW * Math.cos(rotRad),
        y: midY - halfW * Math.sin(rotRad)
      };
      p2 = {
        x: midX + halfW * Math.cos(rotRad),
        y: midY + halfW * Math.sin(rotRad)
      };
    }

    if (lineNode.startAnchor) {
      const nodeA = this._nodes.find((n) => n.id === lineNode.startAnchor.nodeId);
      if (nodeA) p1 = this._getNodePortCoords(nodeA, lineNode.startAnchor.port);
    }

    if (lineNode.endAnchor) {
      const nodeB = this._nodes.find((n) => n.id === lineNode.endAnchor.nodeId);
      if (nodeB) p2 = this._getNodePortCoords(nodeB, lineNode.endAnchor.port);
    }

    return { p1, p2 };
  }

  /**
   * Localiza a porta de conexão magnética mais próxima das coordenadas informadas
   */
  _findSnapPort(x, y, ignoreNodeId = null) {
    let closest = null;
    let minDist = 26; // Raio de atração magnética em pixels

    for (const node of this._nodes) {
      if (node.id === ignoreNodeId || (node.type && node.type.startsWith('line-'))) continue;

      const ports = [
        { name: 'top', x: node.x + node.w / 2, y: node.y },
        { name: 'bottom', x: node.x + node.w / 2, y: node.y + node.h },
        { name: 'left', x: node.x, y: node.y + node.h / 2 },
        { name: 'right', x: node.x + node.w, y: node.y + node.h / 2 }
      ];

      for (const p of ports) {
        const d = Math.hypot(x - p.x, y - p.y);
        if (d < minDist) {
          minDist = d;
          closest = {
            nodeId: node.id,
            port: p.name,
            x: p.x,
            y: p.y
          };
        }
      }
    }

    return closest;
  }

  /**
   * Mostra o anel visual de atração magnética nas coordenadas especificadas
   */
  _showMagneticIndicator(x, y) {
    const el = this.shadowRoot?.querySelector('#cd-magnetic-port');
    if (el) {
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.display = 'block';
    }
  }

  /**
   * Oculta o anel magnético visual
   */
  _hideMagneticIndicator() {
    const el = this.shadowRoot?.querySelector('#cd-magnetic-port');
    if (el) el.style.display = 'none';
  }

  /**
   * Atualização contínua das retas e setas ancoradas magneticamente a nós móveis
   */
  _updateAnchoredLines() {
    const root = this.shadowRoot;
    if (!root) return;

    this._nodes.forEach((node) => {
      if (node.type && node.type.startsWith('line-') && (node.startAnchor || node.endAnchor)) {
        const { p1, p2 } = this._getLineEndpoints(node);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.max(20, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        node.w = Math.round(dist);
        node.x = Math.round(midX - node.w / 2);
        node.y = Math.round(midY - 10);
        node.rotation = Math.round(angle * 10) / 10;
        node.p1 = p1;
        node.p2 = p2;

        const nodeEl = root.querySelector(`.cd-node[data-node-id="${node.id}"]`);
        if (nodeEl) {
          nodeEl.style.left = `${node.x}px`;
          nodeEl.style.top = `${node.y}px`;
          nodeEl.style.width = `${node.w}px`;
          nodeEl.style.transform = `rotate(${node.rotation}deg)`;

          const svgEl = nodeEl.querySelector('.cd-node-svg');
          if (svgEl) {
            svgEl.setAttribute('viewBox', `0 0 ${node.w} ${node.h}`);
            svgEl.innerHTML = this._renderShapeSVG(node);
          }
        }
      }
    });
  }

  _recordHistory() {
    this._history.push(JSON.stringify({
      nodes: this._nodes,
      connectors: this._connectors
    }));
    if (this._history.length > 50) this._history.shift();
    this._future = [];
  }

  /**
   * Agrupa dois ou mais nós selecionados em um único grupo unificado
   */
  _groupSelected() {
    const toGroup = this._nodes.filter((n) => this._selectedNodeIds.has(n.id));
    if (toGroup.length < 2) {
      CortexModal.toast('Selecione dois ou mais objetos no palco para agrupar.', 'info');
      return;
    }

    this._recordHistory();

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    toGroup.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.w);
      maxY = Math.max(maxY, n.y + n.h);
    });

    const groupW = Math.max(30, maxX - minX);
    const groupH = Math.max(30, maxY - minY);

    const children = toGroup.map((n) => ({
      ...n,
      relX: n.x - minX,
      relY: n.y - minY,
      relW: n.w,
      relH: n.h
    }));

    const groupId = `group-${Date.now()}`;
    const groupNode = {
      id: groupId,
      type: 'group',
      label: '',
      x: minX,
      y: minY,
      w: groupW,
      h: groupH,
      rotation: 0,
      children
    };

    const remaining = this._nodes.filter((n) => !this._selectedNodeIds.has(n.id));
    this._nodes = [...remaining, groupNode];
    this._selectedNodeIds = new Set([groupId]);
    this.render();
    CortexModal.toast(`${children.length} objetos agrupados com sucesso!`, 'success');
  }

  /**
   * Desagrupa grupos selecionados de volta a objetos individuais
   */
  _ungroupSelected() {
    let hasGroups = false;
    const result = [];
    const newSelected = new Set();

    this._recordHistory();

    this._nodes.forEach((n) => {
      if (this._selectedNodeIds.has(n.id) && n.type === 'group' && n.children) {
        hasGroups = true;
        n.children.forEach((child) => {
          const restored = {
            ...child,
            x: n.x + (child.relX || 0),
            y: n.y + (child.relY || 0),
            w: child.relW || child.w,
            h: child.relH || child.h,
            rotation: ((child.rotation || 0) + (n.rotation || 0)) % 360
          };
          delete restored.relX;
          delete restored.relY;
          delete restored.relW;
          delete restored.relH;
          result.push(restored);
          newSelected.add(restored.id);
        });
      } else {
        result.push(n);
      }
    });

    if (!hasGroups) {
      CortexModal.toast('Nenhum grupo selecionado para desagrupar.', 'info');
      return;
    }

    this._nodes = result;
    this._selectedNodeIds = newSelected;
    this.render();
    CortexModal.toast('Grupo desagrupado com sucesso!', 'info');
  }

  /**
   * Adiciona um objeto de linha ao palco
   */
  _addLineObject(lineType) {
    this._recordHistory();
    const id = `line-${Date.now()}`;
    const w = 150;
    const h = 20;
    const x = 460 + Math.random() * 40;
    const y = 300 + Math.random() * 40;
    const stroke = this._colorTarget === 'stroke' && this._currentColor ? this._currentColor : 'var(--text-secondary, #94a3b8)';

    this._nodes.push({
      id,
      type: lineType,
      label: '',
      x,
      y,
      w,
      h,
      rotation: 0,
      stroke,
      strokeWidth: 2
    });

    this._selectedNodeIds = new Set([id]);
    this._activeTool = 'select';
    this.render();
    CortexModal.toast('Linha adicionada ao palco!', 'success');
  }

  /**
   * Rotaciona nós selecionados por um determinado incremento
   */
  _rotateSelected(degDelta) {
    if (this._selectedNodeIds.size === 0) return;
    this._recordHistory();
    let count = 0;
    this._nodes.forEach((n) => {
      if (this._selectedNodeIds.has(n.id)) {
        count++;
        let cur = n.rotation || 0;
        let finalRot = Math.round((cur + degDelta) % 360);
        if (finalRot < 0) finalRot += 360;
        n.rotation = finalRot;
      }
    });
    this.render();
    CortexModal.toast(`${count} objeto(s) rotacionado(s) em ${degDelta}°.`, 'info');
  }

  _resetRotation() {
    if (this._selectedNodeIds.size === 0) return;
    this._recordHistory();
    this._nodes.forEach((n) => {
      if (this._selectedNodeIds.has(n.id)) n.rotation = 0;
    });
    this.render();
    CortexModal.toast('Rotação redefinida para 0°.', 'info');
  }

  /**
   * Reordenação Z-Order dos nós selecionados
   */
  _bringToFront() {
    if (this._selectedNodeIds.size === 0) return;
    this._recordHistory();
    const unselected = this._nodes.filter((n) => !this._selectedNodeIds.has(n.id));
    const sel = this._nodes.filter((n) => this._selectedNodeIds.has(n.id));
    this._nodes = [...unselected, ...sel];
    this.render();
    CortexModal.toast('Objeto(s) trazido(s) para a frente.', 'info');
  }

  _sendToBack() {
    if (this._selectedNodeIds.size === 0) return;
    this._recordHistory();
    const unselected = this._nodes.filter((n) => !this._selectedNodeIds.has(n.id));
    const sel = this._nodes.filter((n) => this._selectedNodeIds.has(n.id));
    this._nodes = [...sel, ...unselected];
    this.render();
    CortexModal.toast('Objeto(s) enviado(s) para trás.', 'info');
  }

  _bringForward() {
    if (this._selectedNodeIds.size === 0) return;
    this._recordHistory();
    const res = [...this._nodes];
    for (let i = res.length - 2; i >= 0; i--) {
      if (this._selectedNodeIds.has(res[i].id) && !this._selectedNodeIds.has(res[i + 1].id)) {
        const temp = res[i];
        res[i] = res[i + 1];
        res[i + 1] = temp;
      }
    }
    this._nodes = res;
    this.render();
    CortexModal.toast('Objeto(s) avançado(s) uma camada.', 'info');
  }

  _sendBackward() {
    if (this._selectedNodeIds.size === 0) return;
    this._recordHistory();
    const res = [...this._nodes];
    for (let i = 1; i < res.length; i++) {
      if (this._selectedNodeIds.has(res[i].id) && !this._selectedNodeIds.has(res[i - 1].id)) {
        const temp = res[i];
        res[i] = res[i - 1];
        res[i - 1] = temp;
      }
    }
    this._nodes = res;
    this.render();
    CortexModal.toast('Objeto(s) recuado(s) uma camada.', 'info');
  }

  _duplicateSelected() {
    if (this._selectedNodeIds.size === 0) return;
    this._recordHistory();
    const newSelected = new Set();
    const clones = [];
    this._nodes.forEach((n) => {
      if (this._selectedNodeIds.has(n.id)) {
        const cloneId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        clones.push({
          ...JSON.parse(JSON.stringify(n)),
          id: cloneId,
          x: n.x + 24,
          y: n.y + 24,
          selectedStyle: false
        });
        newSelected.add(cloneId);
      }
    });
    this._nodes.push(...clones);
    this._selectedNodeIds = newSelected;
    this.render();
    CortexModal.toast(`${clones.length} objeto(s) duplicado(s).`, 'success');
  }

  /**
   * Renderiza a forma geométrica SVG real para cada elemento adicionado
   */
  _renderShapeSVG(node) {
    const w = node.w || 100;
    const h = node.h || 56;
    if (node.selectedStyle) {
      return `<rect width="${w}" height="${h}" fill="none" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="4 4"/>`;
    }

    const f = node.fill || 'var(--bg-panel, #1e293b)';
    const s = node.stroke || 'var(--border-input, #64748b)';
    const sw = node.strokeWidth || 1.8;

    // Renderização Vetorial com Marcadores SVG Profissionais (Perfeição Geométrica sem Deformação)
    if (node.type.startsWith('line-')) {
      const yMid = h / 2;
      const markerIdEnd = `marker-end-${node.id}`;
      const markerIdStart = `marker-start-${node.id}`;

      let markerDefs = '<defs>';
      if (node.type === 'line-arrow-right' || node.type === 'line-arrow-both') {
        markerDefs += `
          <marker id="${markerIdEnd}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${s}"/>
          </marker>
        `;
      }
      if (node.type === 'line-arrow-left' || node.type === 'line-arrow-both') {
        markerDefs += `
          <marker id="${markerIdStart}" viewBox="0 0 10 10" refX="3" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="${s}"/>
          </marker>
        `;
      }
      markerDefs += '</defs>';

      const x1 = (node.type === 'line-arrow-left' || node.type === 'line-arrow-both') ? 8 : 2;
      const x2 = (node.type === 'line-arrow-right' || node.type === 'line-arrow-both') ? w - 8 : w - 2;

      const markerStartAttr = (node.type === 'line-arrow-left' || node.type === 'line-arrow-both') ? `marker-start="url(#${markerIdStart})"` : '';
      const markerEndAttr = (node.type === 'line-arrow-right' || node.type === 'line-arrow-both') ? `marker-end="url(#${markerIdEnd})"` : '';

      return `
        ${markerDefs}
        <line x1="${x1}" y1="${yMid}" x2="${x2}" y2="${yMid}" stroke="${s}" stroke-width="${sw}" stroke-linecap="round" ${markerStartAttr} ${markerEndAttr}/>
      `;
    }

    switch (node.type) {
      case 'circle':
      case 'ellipse':
        return `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${(w - 4) / 2}" ry="${(h - 4) / 2}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;

      case 'diamond':
        return `<polygon points="${w / 2},2 ${w - 2},${h / 2} ${w / 2},${h - 2} 2,${h / 2}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;

      case 'triangle':
        return `<polygon points="${w / 2},2 ${w - 2},${h - 2} 2,${h - 2}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;

      case 'cross': {
        const x1 = w * 0.35, x2 = w * 0.65, y1 = h * 0.35, y2 = h * 0.65;
        return `<polygon points="${x1},2 ${x2},2 ${x2},${y1} ${w - 2},${y1} ${w - 2},${y2} ${x2},${y2} ${x2},${h - 2} ${x1},${h - 2} ${x1},${y2} 2,${y2} 2,${y1} ${x1},${y1}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }

      case 'cylinder':
        return `
          <path d="M 2,12 A ${(w - 4) / 2} 8 0 0 0 ${w - 2},12 L ${w - 2},${h - 10} A ${(w - 4) / 2} 8 0 0 1 2,${h - 10} Z" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
          <ellipse cx="${w / 2}" cy="10" rx="${(w - 4) / 2}" ry="8" fill="${f}" stroke="${s}" stroke-width="${sw}"/>
        `;

      case 'cloud':
        return `<path d="M 18,${h - 10} A 14 14 0 0 1 25,18 A 20 20 0 0 1 68,14 A 18 18 0 0 1 ${w - 12},24 A 14 14 0 0 1 ${w - 16},${h - 8} L 18,${h - 8} Z" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;

      case 'star': {
        const cx = w / 2, cy = h / 2, outerR = Math.min(w, h) / 2 - 2, innerR = outerR * 0.45;
        let pts = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
        }
        return `<polygon points="${pts.join(' ')}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }

      case 'pentagon': {
        const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 2;
        let pts = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
        }
        return `<polygon points="${pts.join(' ')}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }

      case 'hexagon': {
        const x1 = w * 0.22, x2 = w * 0.78;
        return `<polygon points="${x1},2 ${x2},2 ${w - 2},${h / 2} ${x2},${h - 2} ${x1},${h - 2} 2,${h / 2}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }

      case 'octagon': {
        const x1 = w * 0.28, x2 = w * 0.72, y1 = h * 0.28, y2 = h * 0.72;
        return `<polygon points="${x1},2 ${x2},2 ${w - 2},${y1} ${w - 2},${y2} ${x2},${h - 2} ${x1},${h - 2} 2,${y2} 2,${y1}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      }

      case 'heart':
        return `<path d="M ${w / 2},${h * 0.82} C 2,${h * 0.5} 2,8 ${w / 4},8 C ${w * 0.4},8 ${w / 2},${h * 0.3} ${w / 2},${h * 0.3} C ${w / 2},${h * 0.3} ${w * 0.6},8 ${w * 0.75},8 C ${w - 2},8 ${w - 2},${h * 0.5} ${w / 2},${h * 0.82} Z" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;

      case 'arrow-right':
        return `<polygon points="2,${h * 0.3} ${w * 0.62},${h * 0.3} ${w * 0.62},4 ${w - 2},${h / 2} ${w * 0.62},${h - 4} ${w * 0.62},${h * 0.7} 2,${h * 0.7}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;

      case 'arrow-up':
        return `<polygon points="${w / 2},2 ${w - 4},${h * 0.42} ${w * 0.68},${h * 0.42} ${w * 0.68},${h - 2} ${w * 0.32},${h - 2} ${w * 0.32},${h * 0.42} 4,${h * 0.42}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;

      case 'arrow-down':
        return `<polygon points="${w * 0.32},2 ${w * 0.68},2 ${w * 0.68},${h * 0.58} ${w - 4},${h * 0.58} ${w / 2},${h - 2} 4,${h * 0.58} ${w * 0.32},${h * 0.58}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;

      case 'arrow-lr':
        return `<polygon points="2,${h / 2} ${w * 0.22},4 ${w * 0.22},${h * 0.32} ${w * 0.78},${h * 0.32} ${w * 0.78},4 ${w - 2},${h / 2} ${w * 0.78},${h - 4} ${w * 0.78},${h * 0.68} ${w * 0.22},${h * 0.68} ${w * 0.22},${h - 4}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;

      case 'arrow-ud':
        return `<polygon points="${w / 2},2 ${w - 4},${h * 0.22} ${w * 0.68},${h * 0.22} ${w * 0.68},${h * 0.78} ${w - 4},${h * 0.78} ${w / 2},${h - 2} 4,${h * 0.78} ${w * 0.32},${h * 0.78} ${w * 0.32},${h * 0.22} 4,${h * 0.22}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;

      case 'text':
        return `<rect width="${w}" height="${h}" fill="none" stroke="transparent" stroke-width="1"/>`;

      case 'rect':
      default:
        return `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="3" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;
    }
  }

  render() {
    const isDockedLeft = this._toolboxDocked === 'left';
    const isDockedRight = this._toolboxDocked === 'right';

    let toolboxStyle = '';
    if (isDockedLeft) {
      toolboxStyle = 'left: 0; top: 0; bottom: 0; height: 100%; width: 168px; border-radius: 0; border-top: none; border-bottom: none; border-left: none;';
    } else if (isDockedRight) {
      toolboxStyle = 'right: 0; left: auto; top: 0; bottom: 0; height: 100%; width: 168px; border-radius: 0; border-top: none; border-bottom: none; border-right: none;';
    } else {
      toolboxStyle = `left: ${this._toolboxPos.x}px; top: ${this._toolboxPos.y}px; width: 154px; border-radius: 6px;`;
    }

    if (this._toolboxCollapsed && !this._toolboxDocked) {
      toolboxStyle += ' height: 32px; overflow: hidden;';
    }

    if (this._topToolbarPos.x === 14 && isDockedLeft) {
      this._topToolbarPos.x = 184;
    }

    const selectedCount = this._selectedNodeIds.size;
    const canGroup = selectedCount >= 2;
    const hasSelectedGroup = Array.from(this._selectedNodeIds).some((id) => {
      const n = this._nodes.find((node) => node.id === id);
      return n && n.type === 'group';
    });
    const isLineToolActive = this._activeTool.startsWith('line-');

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          position: relative;
          user-select: none;
        }

        :host(:fullscreen),
        :host([data-fullscreen="true"]) {
          width: 100vw !important;
          height: 100vh !important;
          background: var(--bg-canvas, #0f172a) !important;
          z-index: 999999;
        }

        
        :host([embedded]), :host([windowed]) {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        :host([embedded]) .cd-wrapper, :host([windowed]) .cd-wrapper {
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          height: 100% !important;
          max-height: 100% !important;
          width: 100% !important;
          background: transparent !important;
          flex: 1 !important;
        }
        :host([embedded]) .cd-canvas-area, :host([windowed]) .cd-canvas-area {
          flex: 1 !important;
          height: 100% !important;
        }
        .cd-wrapper {
          position: relative;
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          height: 620px;
          display: flex;
          flex-direction: column;
        }

        :host(:fullscreen) .cd-wrapper,
        :host([data-fullscreen="true"]) .cd-wrapper,
        .cd-wrapper.is-fullscreen {
          height: 100vh !important;
          max-height: 100vh !important;
          width: 100vw !important;
          border-radius: 0 !important;
          border: none !important;
        }

        /* Barra de Ferramentas Superior Flutuante e Móvel - Design Compacto com Rótulos Abaixo */
        .cd-top-toolbar {
          position: absolute;
          left: ${this._topToolbarPos.x}px;
          top: ${this._topToolbarPos.y}px;
          z-index: 50;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: var(--bg-elevated, #1e293b);
          border: 1px solid var(--border-strong, var(--border-subtle, #334155));
          border-radius: 8px;
          padding: 4px 6px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          user-select: none;
          overflow: visible !important;
        }
        .cd-top-toolbar-drag {
          cursor: grab;
          color: var(--text-muted, #64748b);
          padding: 4px 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          transition: color 0.15s ease;
        }
        .cd-top-toolbar-drag:hover {
          color: var(--text-primary, #f8fafc);
        }
        .cd-top-toolbar-drag:active {
          cursor: grabbing;
        }
        .cd-tool-btn {
          min-width: ${this._showToolbarLabels ? '36px' : '28px'};
          height: ${this._showToolbarLabels ? '38px' : '28px'};
          padding: ${this._showToolbarLabels ? '3px 4px' : '0 6px'};
          border: 1px solid transparent;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-secondary, #94a3b8);
          display: inline-flex;
          flex-direction: ${this._showToolbarLabels ? 'column' : 'row'};
          align-items: center;
          justify-content: center;
          gap: ${this._showToolbarLabels ? '2px' : '4px'};
          transition: all 0.15s ease;
          position: relative;
        }
        .cd-tool-btn:hover:not(:disabled) {
          background: var(--bg-hover, rgba(255, 255, 255, 0.08));
          color: var(--text-primary, #ffffff);
          border-color: var(--border-subtle, rgba(255, 255, 255, 0.1));
        }
        .cd-tool-btn.active {
          background: #0284c7 !important;
          color: #ffffff !important;
          border-color: #0ea5e9 !important;
          box-shadow: 0 1px 4px rgba(2, 132, 199, 0.4);
        }
        .cd-tool-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .cd-btn-icon {
          font-size: 13px;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .cd-btn-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: -0.2px;
          line-height: 1;
          white-space: nowrap;
          opacity: 0.88;
        }
        .cd-tool-btn.active .cd-btn-label {
          opacity: 1;
        }
        .cd-tool-sep {
          width: 1px;
          height: ${this._showToolbarLabels ? '28px' : '20px'};
          background: var(--border-subtle, rgba(255, 255, 255, 0.15));
          margin: 0 2px;
          flex-shrink: 0;
        }
        .cd-tool-badge {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary, #94a3b8);
          background: var(--bg-base, rgba(0, 0, 0, 0.25));
          padding: 2px 7px;
          border-radius: 999px;
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 2px;
          white-space: nowrap;
        }

        /* Pontos de Conexão Magnética nos Objetos (Snap Imã) */
        .cd-node-port {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #0ea5e9;
          border: 1.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 5px rgba(14, 165, 233, 0.8);
          opacity: 0.6;
          pointer-events: none;
          transition: all 0.15s ease;
          z-index: 15;
        }
        .cd-node:hover .cd-node-port {
          opacity: 1;
          transform: scale(1.15);
        }
        .cd-port-top { top: -4px; left: calc(50% - 4px); }
        .cd-port-bottom { bottom: -4px; left: calc(50% - 4px); }
        .cd-port-left { left: -4px; top: calc(50% - 4px); }
        .cd-port-right { right: -4px; top: calc(50% - 4px); }

        /* Indicador Magnético Visual Pulsante (Imã Ativo) */
        .cd-magnetic-port {
          position: absolute;
          pointer-events: none;
          z-index: 95;
          transform: translate(-50%, -50%);
          display: none;
        }
        .cd-magnetic-dot {
          width: 12px;
          height: 12px;
          background: #10b981;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.9);
        }
        .cd-magnetic-ring {
          position: absolute;
          inset: -6px;
          border: 2px solid #10b981;
          border-radius: 50%;
          animation: cd-magnetic-pulse 1.1s infinite ease-out;
        }
        @keyframes cd-magnetic-pulse {
          0% { transform: scale(0.7); opacity: 1; }
          100% { transform: scale(1.9); opacity: 0; }
        }

        /* Popovers Suspensos com Flutuação Livre no Palco */
        .cd-popover-panel {
          display: none;
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: var(--bg-elevated, #1e293b);
          border: 1px solid var(--border-strong, var(--border-subtle, #475569));
          border-radius: 8px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.3);
          padding: 8px;
          z-index: 100 !important;
          flex-direction: column;
          gap: 6px;
        }
        .cd-popover-panel.open {
          display: flex !important;
        }

        /* Popover de Cores */
        .cd-color-popover {
          width: 220px;
        }
        .cd-color-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 6px;
        }
        .cd-color-tab {
          flex: 1;
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 2px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          color: var(--text-secondary);
          cursor: pointer;
          text-align: center;
        }
        .cd-color-tab.active {
          background: var(--bg-hover);
          color: #38bdf8;
          border-color: var(--border-subtle);
        }
        .cd-color-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 5px;
        }
        .cd-swatch {
          width: 20px;
          height: 20px;
          border-radius: 3px;
          border: 1px solid rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: transform 0.12s, box-shadow 0.12s;
        }
        .cd-swatch:hover {
          transform: scale(1.2);
          box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
          z-index: 2;
        }
        .cd-color-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
          border-top: 1px solid var(--border-subtle);
          font-size: 11px;
        }
        .cd-color-custom {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .cd-color-custom input[type="color"] {
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          background: transparent;
          padding: 0;
        }

        /* Popover de Fontes */
        .cd-font-popover {
          width: 250px;
          gap: 10px;
        }
        .cd-font-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cd-font-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .cd-font-select {
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
          padding: 4px 6px;
          font-size: 12px;
          border-radius: 4px;
          outline: none;
        }
        .cd-font-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cd-font-btn-group {
          display: flex;
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          overflow: hidden;
        }
        .cd-font-style-btn {
          background: transparent;
          border: none;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.12s;
        }
        .cd-font-style-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .cd-font-style-btn.active {
          background: var(--accent-blue, #0284c7);
          color: #ffffff;
        }

        /* Popover de Ferramentas de Linha */
        .cd-lines-popover {
          width: 220px;
          padding: 6px;
          gap: 4px;
        }
        .cd-line-option-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 5px;
          cursor: pointer;
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 500;
          text-align: left;
          transition: all 0.12s;
          width: 100%;
          box-sizing: border-box;
        }
        .cd-line-option-btn:hover {
          background: var(--bg-hover);
          border-color: var(--border-subtle);
        }
        .cd-line-option-btn.active {
          background: var(--accent-blue, #0284c7);
          color: #ffffff;
        }
        .cd-line-preview {
          font-size: 16px;
          font-weight: 800;
          min-width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Menu de Contexto Desktop do CortexUI */
        .cd-context-menu {
          display: none;
          position: absolute;
          z-index: 100;
          background: var(--bg-elevated);
          border: 1px solid var(--border-strong, var(--border-subtle));
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
          padding: 4px;
          min-width: 200px;
          flex-direction: column;
          gap: 2px;
        }
        .cd-context-menu.open {
          display: flex;
        }
        .cd-ctx-item {
          background: transparent;
          border: none;
          padding: 6px 10px;
          font-size: 12px;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 4px;
          width: 100%;
          text-align: left;
          transition: all 0.12s ease;
        }
        .cd-ctx-item:hover {
          background: var(--accent-blue, #0284c7);
          color: #ffffff;
        }
        .cd-ctx-sep {
          height: 1px;
          background: var(--border-subtle);
          margin: 3px 0;
        }


        /* Janela Flutuante de Edição de Texto Desktop (Fiel à Toolbox General) */
        .cd-floating-dialog {
          display: none;
          position: absolute;
          z-index: 120;
          background: var(--bg-elevated, #1e293b);
          border: 1px solid var(--border-strong, var(--border-subtle, #475569));
          border-radius: 8px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.35);
          width: 320px;
          user-select: none;
          overflow: hidden;
          animation: cd-pop 0.15s ease-out;
        }
        .cd-floating-dialog.open {
          display: flex;
          flex-direction: column;
        }
        @keyframes cd-pop {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .cd-fd-header {
          padding: 8px 12px;
          background: var(--bg-panel-header, rgba(0,0,0,0.28));
          border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.1));
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text-primary, #f8fafc);
          cursor: grab;
        }
        .cd-fd-header:active {
          cursor: grabbing;
        }
        .cd-fd-title {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cd-fd-drag-icon {
          color: var(--text-muted, #94a3b8);
          opacity: 0.8;
        }
        .cd-fd-actions {
          display: flex;
          align-items: center;
        }
        .cd-fd-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
          width: 20px;
          height: 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
        }
        .cd-fd-btn:hover {
          background: #ef4444;
          color: #ffffff;
        }
        .cd-fd-body {
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cd-fd-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted, #94a3b8);
        }
        .cd-fd-textarea {
          width: 100%;
          min-height: 72px;
          resize: vertical;
          padding: 8px 10px;
          font-size: 12.5px;
          font-family: inherit;
          line-height: 1.4;
          background: var(--bg-input, #0f172a);
          color: var(--text-primary, #ffffff);
          border: 1px solid var(--border-input, #334155);
          border-radius: 6px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .cd-fd-textarea:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.35);
        }
        .cd-fd-hint {
          font-size: 9.5px;
          color: var(--text-muted, #64748b);
          line-height: 1.3;
        }
        .cd-fd-footer {
          padding: 8px 12px;
          background: var(--bg-panel-header, rgba(0,0,0,0.18));
          border-top: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }
        .cd-fd-btn-cancel {
          background: transparent;
          border: 1px solid var(--border-subtle, #475569);
          border-radius: 5px;
          padding: 5px 11px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
          transition: all 0.12s;
        }
        .cd-fd-btn-cancel:hover {
          background: var(--bg-hover, rgba(255,255,255,0.08));
          color: var(--text-primary, #ffffff);
        }
        .cd-fd-btn-save {
          background: #0284c7;
          border: 1px solid #0ea5e9;
          border-radius: 5px;
          padding: 5px 13px;
          font-size: 11.5px;
          font-weight: 700;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.12s;
          box-shadow: 0 1px 4px rgba(2, 132, 199, 0.4);
        }
        .cd-fd-btn-save:hover {
          background: #0369a1;
        }

        /* Caixa de Ferramentas / Gaveta Lateral ("General") */
        .cd-toolbox {
          position: absolute;
          z-index: 30;
          background: var(--bg-elevated);
          border: 1px solid var(--border-strong, var(--border-subtle));
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s ease;
        }
        .cd-toolbox.docked {
          box-shadow: 0 0 16px rgba(0, 0, 0, 0.25);
        }
        .cd-tb-header {
          padding: 7px 10px;
          background: var(--bg-panel-header, rgba(0,0,0,0.25));
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
          cursor: grab;
          user-select: none;
        }
        .cd-tb-header:active {
          cursor: grabbing;
        }
        .cd-tb-drag {
          cursor: grab;
          color: var(--text-muted);
          font-size: 12px;
        }
        .cd-tb-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .cd-tb-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 12px;
          color: var(--text-secondary);
          padding: 2px 4px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s ease;
        }
        .cd-tb-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .cd-tb-btn.active {
          color: #0284c7;
          background: rgba(2, 132, 199, 0.15);
        }
        .cd-tb-search {
          padding: 6px 8px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .cd-tb-search input {
          width: 100%;
          border: 1px solid var(--border-input);
          border-radius: 3px;
          padding: 4px 6px;
          font-size: 11px;
          outline: none;
          background: var(--bg-input);
          color: var(--text-primary);
          box-sizing: border-box;
        }
        .cd-shape-grid {
          padding: 8px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          flex: 1;
          overflow-y: auto;
        }
        .cd-shape-item {
          height: 32px;
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          background: var(--bg-panel);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: var(--text-primary);
          transition: all 0.12s ease;
        }
        .cd-shape-item:hover {
          background: var(--bg-hover);
          border-color: #0284c7;
          color: #0284c7;
          transform: scale(1.05);
        }
        .cd-shape-item.line-item {
          font-size: 16px;
          font-weight: 700;
        }

        /* Área de Canvas com Grade Milimetrada */
        .cd-canvas-area {
          flex: 1;
          position: relative;
          overflow: auto;
          background-color: var(--bg-app);
          background-image: 
            linear-gradient(to right, var(--border-subtle) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px);
          background-size: 20px 20px;
          cursor: ${this._activeTool === 'pan' ? 'grab' : isLineToolActive ? 'crosshair' : 'default'};
        }
        .cd-canvas-area.panning {
          cursor: grabbing !important;
        }

        /* Retângulo Translúcido de Seleção em Área (Marquee) */
        .cd-selection-marquee {
          position: absolute;
          border: 1.5px dashed #0284c7;
          background: rgba(2, 132, 199, 0.18);
          box-shadow: 0 0 6px rgba(2, 132, 199, 0.3);
          pointer-events: none;
          z-index: 45;
          display: none;
        }

        /* Linha Temporária de Desenho */
        .cd-draw-preview-line {
          position: absolute;
          pointer-events: none;
          z-index: 48;
          display: none;
          transform-origin: center center;
        }

        /* Linha Guia Central Tracejada */
        .cd-center-guide {
          position: absolute;
          top: 0;
          left: 540px;
          bottom: 0;
          width: 1px;
          border-left: 1px dashed var(--border-input, #64748b);
          pointer-events: none;
        }

        /* SVG de Conexões */
        .cd-svg-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 1400px;
          height: 800px;
          pointer-events: none;
        }
        .cd-wire {
          fill: none;
          stroke: var(--text-secondary, #94a3b8);
          stroke-width: 1.8;
          stroke-linecap: square;
          stroke-linejoin: miter;
        }

        /* Nós, Formas, Linhas e Grupos do Diagrama */
        .cd-node {
          position: absolute;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: ${this._activeTool === 'pan' ? 'grab' : isLineToolActive ? 'crosshair' : 'move'};
          user-select: none;
          transition: filter 0.1s;
          transform-origin: center center;
        }
        .cd-node:hover {
          filter: drop-shadow(0 0 4px rgba(2, 132, 199, 0.45));
        }
        .cd-node.is-group {
          border: 1.5px dashed transparent;
        }
        .cd-node.is-group.selected {
          border-color: #0284c7;
          background: rgba(2, 132, 199, 0.04);
        }
        .cd-node-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: visible;
        }
        .cd-node-label {
          position: relative;
          z-index: 2;
          pointer-events: none;
          padding: 4px;
          line-height: 1.25;
          width: 100%;
          box-sizing: border-box;
          word-break: break-word;
        }

        /* Elemento Filho dentro do Grupo */
        .cd-group-child {
          position: absolute;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
          transform-origin: center center;
        }

        /* Seleção e 8 Alças de Redimensionamento */
        .cd-node.selected {
          filter: drop-shadow(0 0 6px rgba(2, 132, 199, 0.65));
        }
        .cd-node.selected-box .cd-node-svg rect {
          stroke: #0284c7 !important;
          stroke-dasharray: 4 4 !important;
        }
        .cd-resize-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #0284c7;
          border: 1px solid #ffffff;
          border-radius: 1px;
          pointer-events: auto;
          z-index: 10;
        }
        .cd-resize-handle:hover {
          background: #38bdf8;
          transform: scale(1.2);
        }
        .cd-rh-nw { top: -4px; left: -4px; cursor: nwse-resize; }
        .cd-rh-n  { top: -4px; left: calc(50% - 4px); cursor: ns-resize; }
        .cd-rh-ne { top: -4px; right: -4px; cursor: nesw-resize; }
        .cd-rh-w  { top: calc(50% - 4px); left: -4px; cursor: ew-resize; }
        .cd-rh-e  { top: calc(50% - 4px); right: -4px; cursor: ew-resize; }
        .cd-rh-sw { bottom: -4px; left: -4px; cursor: nesw-resize; }
        .cd-rh-s  { bottom: -4px; left: calc(50% - 4px); cursor: ns-resize; }
        .cd-rh-se { bottom: -4px; right: -4px; cursor: nwse-resize; }

        /* Zonas de Rotação nos 4 Cantos */
        .cd-rotate-corner {
          position: absolute;
          width: 16px;
          height: 16px;
          z-index: 12;
          pointer-events: auto;
          cursor: crosshair;
        }
        .cd-rotate-corner-nw { top: -16px; left: -16px; }
        .cd-rotate-corner-ne { top: -16px; right: -16px; }
        .cd-rotate-corner-sw { bottom: -16px; left: -16px; }
        .cd-rotate-corner-se { bottom: -16px; right: -16px; }

        /* Alça Superior Dedicada de Rotação com Haste */
        .cd-rotate-stem {
          position: absolute;
          top: -18px;
          left: calc(50% - 0.5px);
          width: 1px;
          height: 14px;
          background: #0284c7;
          pointer-events: none;
          z-index: 9;
        }
        .cd-rotate-handle {
          position: absolute;
          top: -26px;
          left: calc(50% - 6px);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #0284c7;
          border: 1.5px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
          cursor: grab;
          z-index: 15;
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: #ffffff;
          transition: transform 0.12s, background 0.12s;
        }
        .cd-rotate-handle:hover {
          background: #38bdf8;
          transform: scale(1.25);
        }
        .cd-rotate-handle:active {
          cursor: grabbing;
        }

        /* Barra Inferior de Controles */
        .cd-bottom-bar {
          position: absolute;
          bottom: 14px;
          left: ${isDockedLeft ? '184px' : '14px'};
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          padding: 4px 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: left 0.2s ease;
        }

        /* Dropdown Customizado de Zoom CortexUI */
        .cd-zoom-dropdown-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .cd-zoom-trigger {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 6px;
          border-radius: 4px;
          transition: all 0.15s ease;
        }
        .cd-zoom-trigger:hover {
          background: var(--bg-hover);
          border-color: var(--border-subtle);
        }
        .cd-zoom-arrow {
          font-size: 10px;
          color: var(--text-muted);
          transition: transform 0.15s ease;
        }
        .cd-zoom-arrow.open {
          transform: rotate(180deg);
        }
        .cd-zoom-menu {
          display: none;
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0;
          min-width: 105px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-strong, var(--border-subtle));
          border-radius: 6px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
          padding: 4px;
          z-index: 60;
          flex-direction: column;
          gap: 2px;
        }
        .cd-zoom-menu.open {
          display: flex;
        }
        .cd-zoom-item {
          background: transparent;
          border: none;
          padding: 6px 10px;
          font-size: 12px;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 4px;
          width: 100%;
          text-align: left;
          transition: all 0.12s ease;
        }
        .cd-zoom-item:hover {
          background: var(--accent-blue, #0284c7);
          color: #ffffff;
        }
        .cd-zoom-item.active {
          font-weight: 700;
          color: #38bdf8;
        }
        .cd-zoom-item:hover.active {
          color: #ffffff;
        }
        .cd-zoom-check {
          font-size: 11px;
          font-weight: 800;
        }

        .cd-bottom-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 13px;
          padding: 2px 4px;
          border-radius: 3px;
        }
        .cd-bottom-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
      </style>

      <div class="cd-wrapper ${this._isFullscreen ? 'is-fullscreen' : ''}" id="cd-wrapper">
        <!-- Barra de Ferramentas Superior Flutuante e Arrastável - Rótulos Abaixo do Ícone / Compacta -->
        <div class="cd-top-toolbar" id="cd-top-toolbar">
          <span class="cd-top-toolbar-drag" id="cd-tb-drag-handle" title="Clique e arraste para mover a barra de ferramentas">
            <svg width="8" height="16" viewBox="0 0 8 16" fill="currentColor">
              <circle cx="2" cy="2" r="1.3"/>
              <circle cx="6" cy="2" r="1.3"/>
              <circle cx="2" cy="8" r="1.3"/>
              <circle cx="6" cy="8" r="1.3"/>
              <circle cx="2" cy="14" r="1.3"/>
              <circle cx="6" cy="14" r="1.3"/>
            </svg>
          </span>

          <!-- Desfazer e Refazer -->
          <button id="cd-btn-undo" class="cd-tool-btn" title="Desfazer (Ctrl+Z)">
            <span class="cd-btn-icon">↶</span>
            ${this._showToolbarLabels ? '<span class="cd-btn-label">Desfazer</span>' : ''}
          </button>

          <button id="cd-btn-redo" class="cd-tool-btn" title="Refazer (Ctrl+Y)">
            <span class="cd-btn-icon">↷</span>
            ${this._showToolbarLabels ? '<span class="cd-btn-label">Refazer</span>' : ''}
          </button>
          
          <div class="cd-tool-sep"></div>

          <!-- Ferramenta Mover / Seleção (Padrão Ativada) -->
          <button
            id="cd-tool-select"
            class="cd-tool-btn ${this._activeTool === 'select' ? 'active' : ''}"
            title="Ferramenta de Seleção / Mover (V) - Padrão"
          >
            <span class="cd-btn-icon">↖</span>
            ${this._showToolbarLabels ? '<span class="cd-btn-label">Mover</span>' : ''}
          </button>

          <!-- Ferramenta Mão (Pan do Canvas) -->
          <button
            id="cd-tool-pan"
            class="cd-tool-btn ${this._activeTool === 'pan' ? 'active' : ''}"
            title="Ferramenta Mão / Arrastar Palco (H)"
          >
            <span class="cd-btn-icon">✋</span>
            ${this._showToolbarLabels ? '<span class="cd-btn-label">Mão</span>' : ''}
          </button>

          <!-- Ferramentas de Linhas e Conectores -->
          <div style="position: relative;">
            <button
              id="cd-btn-lines-tool"
              class="cd-tool-btn ${isLineToolActive || this._linesMenuOpen ? 'active' : ''}"
              title="Ferramentas de Linhas e Conectores (Clique para escolher)"
            >
              <span class="cd-btn-icon" style="font-weight: 800;">
                ${
                  this._activeTool === 'line-straight'
                    ? '―'
                    : this._activeTool === 'line-arrow-left'
                    ? '⟵'
                    : this._activeTool === 'line-arrow-both'
                    ? '⟷'
                    : '⟶'
                }
                <span style="font-size: 8px; opacity: 0.8; margin-left: 1px;">▾</span>
              </span>
              ${this._showToolbarLabels ? '<span class="cd-btn-label">Linha</span>' : ''}
            </button>

            <!-- Popover de Opções de Linha -->
            <div class="cd-popover-panel cd-lines-popover ${this._linesMenuOpen ? 'open' : ''}" id="cd-lines-popover">
              <button class="cd-line-option-btn ${this._activeTool === 'line-straight' ? 'active' : ''}" data-line="line-straight">
                <span class="cd-line-preview">―</span>
                <span>Linha Reta Simples</span>
              </button>
              <button class="cd-line-option-btn ${this._activeTool === 'line-arrow-right' ? 'active' : ''}" data-line="line-arrow-right">
                <span class="cd-line-preview">⟶</span>
                <span>Linha com Seta à Direita</span>
              </button>
              <button class="cd-line-option-btn ${this._activeTool === 'line-arrow-left' ? 'active' : ''}" data-line="line-arrow-left">
                <span class="cd-line-preview">⟵</span>
                <span>Linha com Seta à Esquerda</span>
              </button>
              <button class="cd-line-option-btn ${this._activeTool === 'line-arrow-both' ? 'active' : ''}" data-line="line-arrow-both">
                <span class="cd-line-preview">⟷</span>
                <span>Linha com Setas nas Duas Pontas</span>
              </button>
            </div>
          </div>

          <div class="cd-tool-sep"></div>

          <!-- Botões de Agrupar e Desagrupar -->
          <button
            id="cd-btn-group"
            class="cd-tool-btn"
            title="Agrupar Objetos Selecionados (Ctrl+G)"
            ${!canGroup ? 'disabled' : ''}
          >
            <span class="cd-btn-icon">📦</span>
            ${this._showToolbarLabels ? '<span class="cd-btn-label">Agrupar</span>' : ''}
          </button>

          <button
            id="cd-btn-ungroup"
            class="cd-tool-btn"
            title="Desagrupar Grupo Selecionado (Ctrl+Shift+G)"
            ${!hasSelectedGroup ? 'disabled' : ''}
          >
            <span class="cd-btn-icon">🔓</span>
            ${this._showToolbarLabels ? '<span class="cd-btn-label">Desagrupar</span>' : ''}
          </button>

          <div class="cd-tool-sep"></div>

          <!-- Botão Paleta de Cores CortexUI -->
          <div style="position: relative;">
            <button id="cd-btn-palette" class="cd-tool-btn ${this._colorPaletteOpen ? 'active' : ''}" title="Paleta de Cores CortexUI">
              <span class="cd-btn-icon" style="position: relative;">
                🎨
                <span style="position: absolute; right: -2px; bottom: -1px; width: 7px; height: 7px; border-radius: 2px; background: ${this._currentColor}; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 0 2px rgba(0,0,0,0.5);"></span>
              </span>
              ${this._showToolbarLabels ? '<span class="cd-btn-label">Cor</span>' : ''}
            </button>

            <div class="cd-popover-panel cd-color-popover ${this._colorPaletteOpen ? 'open' : ''}" id="cd-color-popover">
              <div class="cd-color-tabs">
                <button class="cd-color-tab ${this._colorTarget === 'stroke' ? 'active' : ''}" data-target="stroke">Borda/Linha</button>
                <button class="cd-color-tab ${this._colorTarget === 'fill' ? 'active' : ''}" data-target="fill">Preenchimento</button>
                <button class="cd-color-tab ${this._colorTarget === 'color' ? 'active' : ''}" data-target="color">Texto</button>
              </div>
              <div class="cd-color-grid">
                ${this._swatches
                  .map(
                    (hex) => `
                      <div class="cd-swatch" style="background: ${hex};" data-color="${hex}" title="${hex}"></div>
                    `
                  )
                  .join('')}
              </div>
              <div class="cd-color-actions">
                <button class="cd-tool-btn" id="cd-color-reset" style="font-size: 11px; padding: 2px 6px;">Padrão</button>
                <div class="cd-color-custom">
                  <span>Custom:</span>
                  <input type="color" id="cd-color-picker-input" value="${this._currentColor}"/>
                </div>
              </div>
            </div>
          </div>

          <!-- Botão Paleta de Fontes Completa CortexUI -->
          <div style="position: relative;">
            <button id="cd-btn-font" class="cd-tool-btn ${this._fontPaletteOpen ? 'active' : ''}" title="Tipografia e Fontes CortexUI">
              <span class="cd-btn-icon">🔤</span>
              ${this._showToolbarLabels ? '<span class="cd-btn-label">Fonte</span>' : ''}
            </button>

            <div class="cd-popover-panel cd-font-popover ${this._fontPaletteOpen ? 'open' : ''}" id="cd-font-popover">
              <div class="cd-font-field">
                <span class="cd-font-label">Família da Fonte:</span>
                <select id="cd-font-family-select" class="cd-font-select">
                  ${this._fontFamilies
                    .map(
                      (f) => `
                        <option value="${f.value}" ${this._currentFontFamily === f.value ? 'selected' : ''}>${f.name}</option>
                      `
                    )
                    .join('')}
                </select>
              </div>

              <div class="cd-font-row">
                <div class="cd-font-field" style="flex: 1;">
                  <span class="cd-font-label">Tamanho (px):</span>
                  <input type="number" id="cd-font-size-input" class="cd-font-input" min="8" max="72" value="${this._currentFontSize}"/>
                </div>
                <div class="cd-font-field" style="flex: 1;">
                  <span class="cd-font-label">Peso:</span>
                  <select id="cd-font-weight-select" class="cd-font-select">
                    <option value="400" ${this._currentFontWeight === '400' ? 'selected' : ''}>Normal</option>
                    <option value="600" ${this._currentFontWeight === '600' ? 'selected' : ''}>Semibold</option>
                    <option value="700" ${this._currentFontWeight === '700' ? 'selected' : ''}>Bold</option>
                    <option value="800" ${this._currentFontWeight === '800' ? 'selected' : ''}>Extra Bold</option>
                  </select>
                </div>
              </div>

              <div class="cd-font-actions-row">
                <div class="cd-font-styles-group">
                  <button class="cd-font-style-btn ${this._currentFontStyle === 'italic' ? 'active' : ''}" id="cd-font-italic-btn" title="Itálico"><i>I</i></button>
                  <button class="cd-font-style-btn ${this._currentTextDecoration === 'underline' ? 'active' : ''}" id="cd-font-underline-btn" title="Sublinhado"><u>U</u></button>
                </div>

                <div class="cd-font-styles-group">
                  <button class="cd-font-style-btn ${this._currentTextAlign === 'left' ? 'active' : ''}" id="cd-font-align-left-btn" title="Alinhar à Esquerda">⇤</button>
                  <button class="cd-font-style-btn ${this._currentTextAlign === 'center' ? 'active' : ''}" id="cd-font-align-center-btn" title="Centralizar">≡</button>
                  <button class="cd-font-style-btn ${this._currentTextAlign === 'right' ? 'active' : ''}" id="cd-font-align-right-btn" title="Alinhar à Direita">⇥</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Botão Rápido de Rotação 90 Graus -->
          <button id="cd-btn-quick-rotate" class="cd-tool-btn" title="Girar 90° no Sentido Horário (R)">
            <span class="cd-btn-icon">⟳</span>
            ${this._showToolbarLabels ? '<span class="cd-btn-label">90°</span>' : ''}
          </button>

          <div class="cd-tool-sep"></div>

          <!-- Excluir Selecionados -->
          <button id="cd-btn-delete" class="cd-tool-btn" title="Excluir Elementos Selecionados (Del)" ${selectedCount === 0 ? 'disabled style="opacity: 0.35; cursor: not-allowed;"' : ''}>
            <span class="cd-btn-icon">🗑️</span>
            ${this._showToolbarLabels ? '<span class="cd-btn-label">Excluir</span>' : ''}
          </button>

          <!-- Selecionar Todos -->
          <button id="cd-btn-select-all" class="cd-tool-btn" title="Selecionar Todos os Objetos (Ctrl+A)">
            <span class="cd-btn-icon">⛶</span>
            ${this._showToolbarLabels ? '<span class="cd-btn-label">Todos</span>' : ''}
          </button>

          <div class="cd-tool-sep"></div>

          <!-- Alternar Modo de Exibição (Rótulos Abaixo vs Somente Ícones) -->
          <button
            id="cd-btn-toggle-labels"
            class="cd-tool-btn ${!this._showToolbarLabels ? 'active' : ''}"
            title="${this._showToolbarLabels ? 'Alternar para: Somente Ícones (Modo Ultra Compacto)' : 'Alternar para: Rótulos Abaixo do Ícone'}"
          >
            <span class="cd-btn-icon">${this._showToolbarLabels ? '🏷️' : '⚡'}</span>
            ${this._showToolbarLabels ? '<span class="cd-btn-label">Modo</span>' : ''}
          </button>

          <span class="cd-tool-badge" title="Elementos Selecionados">
            ${selectedCount > 0 ? `${selectedCount}` : '0'}
          </span>
        </div>


        <!-- Janela Flutuante Desktop de Edição de Texto (Fiel à Toolbox General) -->
        <div
          class="cd-floating-dialog cd-text-editor-window ${this._textEditorOpen ? 'open' : ''}"
          id="cd-text-editor-window"
          style="left: ${this._textEditorPos.x}px; top: ${this._textEditorPos.y}px;"
        >
          <div class="cd-fd-header" id="cd-te-header">
            <span class="cd-fd-title">
              <svg class="cd-fd-drag-icon" width="8" height="14" viewBox="0 0 8 16" fill="currentColor">
                <circle cx="2" cy="2" r="1.3"/>
                <circle cx="6" cy="2" r="1.3"/>
                <circle cx="2" cy="8" r="1.3"/>
                <circle cx="6" cy="8" r="1.3"/>
                <circle cx="2" cy="14" r="1.3"/>
                <circle cx="6" cy="14" r="1.3"/>
              </svg>
              <span>Editar Texto do Objeto</span>
            </span>
            <div class="cd-fd-actions">
              <button class="cd-fd-btn" id="cd-te-btn-close" title="Fechar (Esc)">✕</button>
            </div>
          </div>
          <div class="cd-fd-body">
            <label class="cd-fd-label" for="cd-te-textarea">Texto / Rótulo:</label>
            <textarea
              id="cd-te-textarea"
              class="cd-fd-textarea"
              rows="3"
              placeholder="Digite o texto do objeto..."
            >${this._textEditorValue}</textarea>
            <div class="cd-fd-hint">Enter para salvar • Shift+Enter para nova linha • Esc para cancelar</div>
          </div>
          <div class="cd-fd-footer">
            <button class="cd-fd-btn-cancel" id="cd-te-btn-cancel">Cancelar</button>
            <button class="cd-fd-btn-save" id="cd-te-btn-save">Salvar Texto</button>
          </div>
        </div>

        <!-- Menu de Contexto Desktop (Botão Direito) -->
        <div class="cd-context-menu ${this._contextMenuOpen ? 'open' : ''}" id="cd-context-menu" style="left: ${this._contextMenuPos.x}px; top: ${this._contextMenuPos.y}px;">
          ${
            canGroup
              ? `
                <button class="cd-ctx-item" id="cd-ctx-group">
                  <span>📦 Agrupar Objetos</span>
                  <span style="font-size: 10px; color: var(--text-muted);">Ctrl+G</span>
                </button>
              `
              : ''
          }
          ${
            hasSelectedGroup
              ? `
                <button class="cd-ctx-item" id="cd-ctx-ungroup">
                  <span>🔓 Desagrupar</span>
                  <span style="font-size: 10px; color: var(--text-muted);">Ctrl+Shift+G</span>
                </button>
              `
              : ''
          }
          ${canGroup || hasSelectedGroup ? '<div class="cd-ctx-sep"></div>' : ''}

          <button class="cd-ctx-item" id="cd-ctx-bring-front">
            <span>⬆️ Trazer para Frente</span>
          </button>
          <button class="cd-ctx-item" id="cd-ctx-bring-forward">
            <span>⇡ Avançar uma Camada</span>
          </button>
          <button class="cd-ctx-item" id="cd-ctx-send-backward">
            <span>⇣ Recuar uma Camada</span>
          </button>
          <button class="cd-ctx-item" id="cd-ctx-send-back">
            <span>⬇️ Enviar para Trás</span>
          </button>
          
          <div class="cd-ctx-sep"></div>

          <button class="cd-ctx-item" id="cd-ctx-rotate-cw">
            <span>↷ Rotacionar 90° Horário</span>
          </button>
          <button class="cd-ctx-item" id="cd-ctx-rotate-ccw">
            <span>↶ Rotacionar 90° Anti-horário</span>
          </button>
          <button class="cd-ctx-item" id="cd-ctx-rotate-reset">
            <span>↺ Redefinir Rotação (0°)</span>
          </button>

          <div class="cd-ctx-sep"></div>

          <button class="cd-ctx-item" id="cd-ctx-duplicate">
            <span>📋 Duplicar</span>
            <span style="font-size: 10px; color: var(--text-muted);">Ctrl+D</span>
          </button>
          <button class="cd-ctx-item" id="cd-ctx-edit-text">
            <span>✏️ Editar Texto</span>
          </button>
          
          <div class="cd-ctx-sep"></div>

          <button class="cd-ctx-item" id="cd-ctx-delete" style="color: #ef4444;">
            <span>🗑️ Excluir</span>
            <span style="font-size: 10px; color: var(--text-muted);">Del</span>
          </button>
        </div>

        <!-- Caixa de Ferramentas / Gaveta Lateral Flutuante ("General") -->
        <div class="cd-toolbox ${this._toolboxDocked ? 'docked' : ''}" id="cd-toolbox" style="${toolboxStyle}">
          <div class="cd-tb-header" id="cd-tb-header" title="Clique e arraste para mover a janela">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="cd-tb-drag">:::</span>
              <span>General</span>
            </div>
            <div class="cd-tb-actions">
              <button
                id="cd-tb-dock"
                class="cd-tb-btn ${this._toolboxDocked ? 'active' : ''}"
                title="${this._toolboxDocked ? 'Desafixar janela (Modo flutuante)' : 'Fixar na lateral mais próxima (Modo Gaveta)'}"
              >
                ${this._toolboxDocked ? '◫' : '◧'}
              </button>
              <button id="cd-tb-toggle" class="cd-tb-btn" title="${this._toolboxCollapsed ? 'Expandir' : 'Minimizar'}">
                ${this._toolboxCollapsed ? 'v' : '^'}
              </button>
              <button id="cd-tb-close" class="cd-tb-btn" title="Fechar">×</button>
            </div>
          </div>
          ${
            !this._toolboxCollapsed
              ? `
                <div class="cd-tb-search">
                  <input type="text" placeholder="Search" id="cd-tb-search-inp" value="${this._toolboxSearch}"/>
                </div>
                <div class="cd-shape-grid">
                  <button class="cd-shape-item" data-shape="text" title="Texto">Text</button>
                  <button class="cd-shape-item" data-shape="rect" title="Retângulo">▭</button>
                  <button class="cd-shape-item" data-shape="circle" title="Círculo / Elipse">○</button>
                  <button class="cd-shape-item" data-shape="diamond" title="Losango">◇</button>
                  <button class="cd-shape-item" data-shape="triangle" title="Triângulo">△</button>
                  <button class="cd-shape-item" data-shape="cross" title="Cruz">+</button>

                  <!-- Ferramentas de Linhas e Conectores adicionadas na Toolbox -->
                  <button class="cd-shape-item line-item" data-shape="line-straight" title="Linha Reta">―</button>
                  <button class="cd-shape-item line-item" data-shape="line-arrow-right" title="Linha com Seta à Direita">⟶</button>
                  <button class="cd-shape-item line-item" data-shape="line-arrow-left" title="Linha com Seta à Esquerda">⟵</button>
                  <button class="cd-shape-item line-item" data-shape="line-arrow-both" title="Linha com Setas nas Duas Pontas">⟷</button>

                  <button class="cd-shape-item" data-shape="cylinder" title="Cilindro / DB">⌸</button>
                  <button class="cd-shape-item" data-shape="cloud" title="Nuvem">☁</button>
                  <button class="cd-shape-item" data-shape="star" title="Estrela">★</button>
                  <button class="cd-shape-item" data-shape="pentagon" title="Pentágono">⬠</button>
                  <button class="cd-shape-item" data-shape="hexagon" title="Hexágono">⬡</button>
                  <button class="cd-shape-item" data-shape="octagon" title="Octógono">⯃</button>
                  <button class="cd-shape-item" data-shape="heart" title="Coração">♡</button>
                  <button class="cd-shape-item" data-shape="arrow-right" title="Seta Bloco Direita">→</button>
                  <button class="cd-shape-item" data-shape="arrow-up" title="Seta Bloco Cima">↑</button>
                  <button class="cd-shape-item" data-shape="arrow-down" title="Seta Bloco Baixo">↓</button>
                  <button class="cd-shape-item" data-shape="arrow-lr" title="Seta Bloco Esquerda/Direita">↔</button>
                  <button class="cd-shape-item" data-shape="arrow-ud" title="Seta Bloco Cima/Baixo">↕</button>
                </div>
              `
              : ''
          }
        </div>

        <!-- Canvas Principal -->
        <div class="cd-canvas-area" id="cd-canvas">
          <div id="cd-canvas-content" style="transform: scale(${this._zoom}); transform-origin: 0 0; position: relative; width: 1400px; height: 800px;">
            <div class="cd-center-guide"></div>

            <!-- Retângulo translúcido de seleção em área (Marquee) -->
            <div id="cd-marquee" class="cd-selection-marquee"></div>

            <!-- Linha de desenho interativo temporária -->
            <div id="cd-draw-preview" class="cd-draw-preview-line"></div>

            <!-- Indicador Magnético Visual de Conexão (Imã) -->
            <div id="cd-magnetic-port" class="cd-magnetic-port">
              <div class="cd-magnetic-dot"></div>
              <div class="cd-magnetic-ring"></div>
            </div>

            <!-- Conexões SVG com Setas e Barramentos Móveis -->
            <svg class="cd-svg-layer" id="cd-svg-layer" width="1400" height="800">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--text-secondary, #94a3b8)"/>
                </marker>
              </defs>
              ${this._connectors
                .map((c) => {
                  const comp = this._computeConnectorPath(c);
                  const strokeColor = c.color || 'var(--text-secondary, #94a3b8)';
                  const sw = c.strokeWidth || 1.8;
                  const isSel = this._selectedConnectorIds.has(c.id);

                  let handles = '';
                  if (comp.busY !== null) {
                    const midX = (comp.fromPt.x + comp.toPt.x) / 2;
                    handles += `
                      <g class="cd-bus-handle" data-conn-id="${c.id}" transform="translate(${midX}, ${comp.busY})" style="cursor: ns-resize;">
                        <circle cx="0" cy="0" r="4.5" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
                      </g>
                    `;
                  }
                  if (comp.dropX !== null && comp.type === 'orthogonal') {
                    const midY = comp.busY ? (comp.busY + comp.toPt.y) / 2 : (comp.fromPt.y + comp.toPt.y) / 2;
                    handles += `
                      <g class="cd-drop-handle" data-conn-id="${c.id}" transform="translate(${comp.dropX}, ${midY})" style="cursor: ew-resize;">
                        <circle cx="0" cy="0" r="4.5" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
                      </g>
                    `;
                  }

                  return `
                    <path
                      d="${comp.path}"
                      data-conn-id="${c.id}"
                      class="cd-wire ${isSel ? 'selected' : ''}"
                      stroke="${strokeColor}"
                      stroke-width="${sw}"
                      fill="none"
                      marker-end="url(#arrow)"
                    />
                    <path
                      d="${comp.path}"
                      data-conn-id="${c.id}"
                      class="cd-wire-hit"
                      stroke="transparent"
                      stroke-width="12"
                      fill="none"
                      style="pointer-events: stroke; cursor: pointer;"
                    />
                    ${handles}
                  `;
                })
                .join('')}
            </svg>

            <!-- Nós, Formas, Linhas e Grupos do Diagrama -->
            ${this._nodes
              .map((node) => {
                const isSelected = this._selectedNodeIds.has(node.id) || node.selectedStyle;
                const textColor = node.color || 'var(--text-primary)';
                const fFamily = node.fontFamily || 'inherit';
                const fSize = node.fontSize ? `${node.fontSize}px` : '12px';
                const fWeight = node.fontWeight || '600';
                const fStyle = node.fontStyle || 'normal';
                const tDecor = node.textDecoration || 'none';
                const tAlign = node.textAlign || 'center';
                const rot = node.rotation || 0;
                const isGroup = node.type === 'group';

                return `
                  <div
                    class="cd-node ${isGroup ? 'is-group' : ''} ${isSelected ? 'selected' : ''} ${node.selectedStyle ? 'selected-box' : ''}"
                    data-node-id="${node.id}"
                    style="left: ${node.x}px; top: ${node.y}px; width: ${node.w}px; height: ${node.h}px; transform: rotate(${rot}deg); color: ${textColor};"
                  >
                    ${
                      isGroup && node.children
                        ? node.children
                            .map((child) => {
                              const cColor = child.color || textColor;
                              const cFamily = child.fontFamily || fFamily;
                              const cSize = child.fontSize ? `${child.fontSize}px` : fSize;
                              const cWeight = child.fontWeight || fWeight;
                              const cStyle = child.fontStyle || fStyle;
                              const cDecor = child.textDecoration || tDecor;
                              const cAlign = child.textAlign || tAlign;
                              const cRot = child.rotation || 0;

                              return `
                                <div
                                  class="cd-group-child"
                                  style="left: ${child.relX}px; top: ${child.relY}px; width: ${child.relW}px; height: ${child.relH}px; transform: rotate(${cRot}deg); color: ${cColor};"
                                >
                                  <svg class="cd-node-svg" viewBox="0 0 ${child.w} ${child.h}">
                                    ${this._renderShapeSVG(child)}
                                  </svg>
                                  ${
                                    child.label
                                      ? `
                                        <div class="cd-node-label" style="font-family: ${cFamily}; font-size: ${cSize}; font-weight: ${cWeight}; font-style: ${cStyle}; text-decoration: ${cDecor}; text-align: ${cAlign};">
                                          ${child.label}
                                        </div>
                                      `
                                      : ''
                                  }
                                </div>
                              `;
                            })
                            .join('')
                        : `
                          <svg class="cd-node-svg" viewBox="0 0 ${node.w} ${node.h}">
                            ${this._renderShapeSVG(node)}
                          </svg>
                          ${
                            node.label
                              ? `
                                <div class="cd-node-label" style="font-family: ${fFamily}; font-size: ${fSize}; font-weight: ${fWeight}; font-style: ${fStyle}; text-decoration: ${tDecor}; text-align: ${tAlign};">
                                  ${node.label}
                                </div>
                              `
                              : ''
                          }
                          ${
                            !isGroup && !node.type.startsWith('line-')
                              ? `
                                <!-- 4 Portas de Conexão Magnética nos Lados (Snap Imã) -->
                                <div class="cd-node-port cd-port-top" title="Porta Superior (Imã)"></div>
                                <div class="cd-node-port cd-port-bottom" title="Porta Inferior (Imã)"></div>
                                <div class="cd-node-port cd-port-left" title="Porta Esquerda (Imã)"></div>
                                <div class="cd-node-port cd-port-right" title="Porta Direita (Imã)"></div>
                              `
                              : ''
                          }
                        `
                    }
                    ${
                      isSelected
                        ? `
                          <!-- Alça Superior Dedicada de Rotação com Haste -->
                          <div class="cd-rotate-stem"></div>
                          <div class="cd-rotate-handle" data-rotate="top" title="Clique e arraste para rotacionar o ${isGroup ? 'grupo' : 'objeto'}">⟳</div>

                          <!-- Zonas de Rotação pelos 4 Cantos -->
                          <div class="cd-rotate-corner cd-rotate-corner-nw" data-rotate="nw" title="Clique e arraste pelo canto para rotacionar"></div>
                          <div class="cd-rotate-corner cd-rotate-corner-ne" data-rotate="ne" title="Clique e arraste pelo canto para rotacionar"></div>
                          <div class="cd-rotate-corner cd-rotate-corner-sw" data-rotate="sw" title="Clique e arraste pelo canto para rotacionar"></div>
                          <div class="cd-rotate-corner cd-rotate-corner-se" data-rotate="se" title="Clique e arraste pelo canto para rotacionar"></div>

                          ${
                            node.type && node.type.startsWith('line-')
                              ? `
                                <!-- Alças Limpas nas Extremidades para Linhas e Setas -->
                                <div class="cd-resize-handle cd-rh-w" data-handle="w" style="top: calc(50% - 5px); left: -5px; width: 10px; height: 10px; border-radius: 50%;" title="Ajustar Início da Linha"></div>
                                <div class="cd-resize-handle cd-rh-e" data-handle="e" style="top: calc(50% - 5px); right: -5px; width: 10px; height: 10px; border-radius: 50%;" title="Ajustar Fim da Linha"></div>
                              `
                              : `
                                <!-- 8 Alças de Redimensionamento para Formas -->
                                <div class="cd-resize-handle cd-rh-nw" data-handle="nw" title="Redimensionar"></div>
                                <div class="cd-resize-handle cd-rh-n" data-handle="n" title="Redimensionar"></div>
                                <div class="cd-resize-handle cd-rh-ne" data-handle="ne" title="Redimensionar"></div>
                                <div class="cd-resize-handle cd-rh-w" data-handle="w" title="Redimensionar"></div>
                                <div class="cd-resize-handle cd-rh-e" data-handle="e" title="Redimensionar"></div>
                                <div class="cd-resize-handle cd-rh-sw" data-handle="sw" title="Redimensionar"></div>
                                <div class="cd-resize-handle cd-rh-s" data-handle="s" title="Redimensionar"></div>
                                <div class="cd-resize-handle cd-rh-se" data-handle="se" title="Redimensionar"></div>
                              `
                          }
                        `
                        : ''
                    }
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>

        <!-- Barra Inferior de Controles -->
        <div class="cd-bottom-bar">
          <!-- Dropdown Personalizado CortexUI de Zoom -->
          <div class="cd-zoom-dropdown-wrap">
            <button id="cd-zoom-btn" class="cd-zoom-trigger" title="Nível de Zoom">
              <span>${Math.round(this._zoom * 100)}%</span>
              <span class="cd-zoom-arrow ${this._zoomMenuOpen ? 'open' : ''}">▾</span>
            </button>
            <div class="cd-zoom-menu ${this._zoomMenuOpen ? 'open' : ''}">
              ${[
                { label: '50%', val: 0.5 },
                { label: '75%', val: 0.75 },
                { label: '100%', val: 1 },
                { label: '125%', val: 1.25 },
                { label: '150%', val: 1.5 },
                { label: '200%', val: 2 }
              ]
                .map(
                  (opt) => `
                    <button class="cd-zoom-item ${this._zoom === opt.val ? 'active' : ''}" data-zoom="${opt.val}">
                      <span>${opt.label}</span>
                      ${this._zoom === opt.val ? '<span class="cd-zoom-check">✓</span>' : ''}
                    </button>
                  `
                )
                .join('')}
            </div>
          </div>

          <button id="cd-btn-fullscreen" class="cd-bottom-btn" title="${this._isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}">${this._isFullscreen ? '🗗' : '⛶'}</button>
          <button id="cd-btn-export" class="cd-bottom-btn" title="Exportar Diagrama">⇥</button>
          <button id="cd-btn-settings" class="cd-bottom-btn" title="Configurações de Grade">⚙</button>
        </div>
      </div>
      <slot></slot>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    const root = this.shadowRoot;
    const canvasEl = root.querySelector('#cd-canvas');
    const marqueeEl = root.querySelector('#cd-marquee');
    const drawPreviewEl = root.querySelector('#cd-draw-preview');
    const wrapperEl = root.querySelector('#cd-wrapper');

    // ==========================================
    // JANELA FLUTUANTE DE EDIÇÃO DE TEXTO
    // ==========================================
    const teWindow = root.querySelector('#cd-text-editor-window');
    const teHeader = root.querySelector('#cd-te-header');
    const teTextarea = root.querySelector('#cd-te-textarea');
    const teBtnSave = root.querySelector('#cd-te-btn-save');
    const teBtnCancel = root.querySelector('#cd-te-btn-cancel');
    const teBtnClose = root.querySelector('#cd-te-btn-close');

    if (teHeader && teWindow && wrapperEl) {
      let isDraggingTE = false;
      let startMouse = { x: 0, y: 0 };
      let startPos = { x: 0, y: 0 };

      teHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('.cd-fd-btn')) return;
        isDraggingTE = true;
        startMouse = { x: e.clientX, y: e.clientY };
        startPos = { ...this._textEditorPos };
        e.preventDefault();
        e.stopPropagation();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingTE) return;
        const dx = e.clientX - startMouse.x;
        const dy = e.clientY - startMouse.y;
        const wrapRect = wrapperEl.getBoundingClientRect();
        const maxX = Math.max(0, wrapRect.width - 325);
        const maxY = Math.max(0, wrapRect.height - 200);

        this._textEditorPos.x = Math.max(10, Math.min(maxX, startPos.x + dx));
        this._textEditorPos.y = Math.max(10, Math.min(maxY, startPos.y + dy));

        teWindow.style.left = `${this._textEditorPos.x}px`;
        teWindow.style.top = `${this._textEditorPos.y}px`;
      });

      window.addEventListener('mouseup', () => {
        isDraggingTE = false;
      });
    }

    teBtnSave?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._saveTextEditor();
    });

    teBtnCancel?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._closeTextEditor();
    });

    teBtnClose?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._closeTextEditor();
    });

    teTextarea?.addEventListener('keydown', (e) => {
      e.stopPropagation(); // Evita atalhos do palco como Del/Ctrl+G
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._saveTextEditor();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this._closeTextEditor();
      }
    });

    // ==========================================
    // 1. ARRASTE DA BARRA DE FERRAMENTAS SUPERIOR
    // ==========================================
    const topToolbarEl = root.querySelector('#cd-top-toolbar');
    const topToolbarDrag = root.querySelector('#cd-tb-drag-handle');

    if (topToolbarEl && topToolbarDrag && wrapperEl) {
      let isDraggingToolbar = false;
      let startMouse = { x: 0, y: 0 };
      let startPos = { x: 0, y: 0 };

      const onToolbarMouseDown = (e) => {
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;
        isDraggingToolbar = true;
        startMouse = { x: e.clientX, y: e.clientY };
        startPos = { ...this._topToolbarPos };
      };

      topToolbarDrag.addEventListener('mousedown', onToolbarMouseDown);
      topToolbarEl.addEventListener('mousedown', (e) => {
        if (e.target === topToolbarEl || e.target.classList.contains('cd-tool-sep')) {
          onToolbarMouseDown(e);
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingToolbar) return;
        const dx = e.clientX - startMouse.x;
        const dy = e.clientY - startMouse.y;
        const wrapRect = wrapperEl.getBoundingClientRect();

        const maxX = Math.max(10, wrapRect.width - topToolbarEl.offsetWidth - 10);
        const maxY = Math.max(10, wrapRect.height - 40);

        this._topToolbarPos.x = Math.max(0, Math.min(maxX, startPos.x + dx));
        this._topToolbarPos.y = Math.max(0, Math.min(maxY, startPos.y + dy));

        topToolbarEl.style.left = `${this._topToolbarPos.x}px`;
        topToolbarEl.style.top = `${this._topToolbarPos.y}px`;
      });

      window.addEventListener('mouseup', () => {
        if (isDraggingToolbar) isDraggingToolbar = false;
      });
    }

    // ==========================================
    // 2. ALTERNAR FERRAMENTAS: MOVER (V) / MÃO (H) / LINHAS
    // ==========================================
    root.querySelector('#cd-tool-select')?.addEventListener('click', () => {
      this._activeTool = 'select';
      this._linesMenuOpen = false;
      this.render();
    });

    root.querySelector('#cd-tool-pan')?.addEventListener('click', () => {
      this._activeTool = 'pan';
      this._linesMenuOpen = false;
      this.render();
    });

    // Ferramenta Linhas e Conectores
    const linesBtn = root.querySelector('#cd-btn-lines-tool');
    const linesPopover = root.querySelector('#cd-lines-popover');

    if (linesBtn && linesPopover) {
      linesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._colorPaletteOpen = false;
        this._fontPaletteOpen = false;
        this._linesMenuOpen = !this._linesMenuOpen;
        this.render();
      });

      linesPopover.querySelectorAll('.cd-line-option-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const lineType = btn.getAttribute('data-line');
          this._activeTool = lineType;
          this._linesMenuOpen = false;
          this._addLineObject(lineType);
        });
      });
    }

    // Agrupar e Desagrupar pela Barra Superior
    root.querySelector('#cd-btn-group')?.addEventListener('click', () => {
      this._groupSelected();
    });

    root.querySelector('#cd-btn-ungroup')?.addEventListener('click', () => {
      this._ungroupSelected();
    });

    // Alternar Modo de Exibição da Barra (Rótulos Abaixo vs Somente Ícones)
    root.querySelector('#cd-btn-toggle-labels')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._showToolbarLabels = !this._showToolbarLabels;
      this.render();
      CortexModal.toast(
        this._showToolbarLabels
          ? 'Barra de ferramentas: Rótulos abaixo dos ícones ativados.'
          : 'Barra de ferramentas: Modo somente ícones ativado.',
        'info'
      );
    });

    // Botão Rápido de Rotação 90°
    root.querySelector('#cd-btn-quick-rotate')?.addEventListener('click', () => {
      if (this._selectedNodeIds.size === 0) {
        CortexModal.toast('Selecione um ou mais objetos para rotacionar.', 'info');
        return;
      }
      this._rotateSelected(90);
    });

    // ==========================================
    // 3. PALETA DE CORES CORTEXUI
    // ==========================================
    const paletteBtn = root.querySelector('#cd-btn-palette');
    const colorPopover = root.querySelector('#cd-color-popover');

    if (paletteBtn && colorPopover) {
      paletteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._fontPaletteOpen = false;
        this._linesMenuOpen = false;
        this._colorPaletteOpen = !this._colorPaletteOpen;
        this.render();
      });

      colorPopover.querySelectorAll('.cd-color-tab').forEach((tab) => {
        tab.addEventListener('click', (e) => {
          e.stopPropagation();
          this._colorTarget = tab.getAttribute('data-target');
          colorPopover.querySelectorAll('.cd-color-tab').forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');
        });
      });

      const applyColor = (hex) => {
        this._currentColor = hex;
        if (this._selectedNodeIds.size === 0 && this._selectedConnectorIds.size === 0) {
          CortexModal.toast('Selecione um ou mais objetos ou linhas no palco para colorir.', 'info');
          return;
        }

        if (this._selectedConnectorIds.size > 0) {
          this._recordHistory();
          let cCount = 0;
          this._connectors.forEach((c) => {
            if (this._selectedConnectorIds.has(c.id)) {
              c.color = hex;
              cCount++;
            }
          });
          this.render();
          CortexModal.toast(`Cor aplicada em ${cCount} linha(s) de conexão!`, 'success');
          return;
        }

        this._recordHistory();
        let count = 0;
        this._nodes.forEach((node) => {
          if (this._selectedNodeIds.has(node.id)) {
            count++;
            if (node.type === 'group' && node.children) {
              node.children.forEach((c) => {
                if (this._colorTarget === 'fill') c.fill = hex;
                else if (this._colorTarget === 'stroke') c.stroke = hex;
                else if (this._colorTarget === 'color') c.color = hex;
              });
            } else {
              if (this._colorTarget === 'fill') node.fill = hex;
              else if (this._colorTarget === 'stroke') node.stroke = hex;
              else if (this._colorTarget === 'color') node.color = hex;
            }
          }
        });

        this.render();
        CortexModal.toast(`Cor aplicada em ${count} objeto(s) selecionado(s)!`, 'success');
      };

      colorPopover.querySelectorAll('.cd-swatch').forEach((swatch) => {
        swatch.addEventListener('click', (e) => {
          e.stopPropagation();
          const hex = swatch.getAttribute('data-color');
          applyColor(hex);
        });
      });

      root.querySelector('#cd-color-picker-input')?.addEventListener('input', (e) => {
        applyColor(e.target.value);
      });

      root.querySelector('#cd-color-reset')?.addEventListener('click', (e) => {
        e.stopPropagation();
        applyColor('');
      });
    }

    // ==========================================
    // 4. PALETA DE FONTES COMPLETA CORTEXUI
    // ==========================================
    const fontBtn = root.querySelector('#cd-btn-font');
    const fontPopover = root.querySelector('#cd-font-popover');

    if (fontBtn && fontPopover) {
      fontBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._colorPaletteOpen = false;
        this._linesMenuOpen = false;
        this._fontPaletteOpen = !this._fontPaletteOpen;
        this.render();
      });

      const applyFontProperty = (prop, val) => {
        if (this._selectedNodeIds.size === 0) {
          CortexModal.toast('Selecione um ou mais objetos no palco para formatar a fonte.', 'info');
          return;
        }
        this._recordHistory();
        let count = 0;
        this._nodes.forEach((node) => {
          if (this._selectedNodeIds.has(node.id)) {
            count++;
            if (node.type === 'group' && node.children) {
              node.children.forEach((c) => (c[prop] = val));
            } else {
              node[prop] = val;
            }
          }
        });
        this.render();
        CortexModal.toast(`Fonte atualizada em ${count} objeto(s)!`, 'success');
      };

      root.querySelector('#cd-font-family-select')?.addEventListener('change', (e) => {
        this._currentFontFamily = e.target.value;
        applyFontProperty('fontFamily', e.target.value);
      });

      root.querySelector('#cd-font-size-select')?.addEventListener('change', (e) => {
        const sz = parseInt(e.target.value, 10);
        this._currentFontSize = sz;
        applyFontProperty('fontSize', sz);
      });

      root.querySelector('#cd-font-bold-btn')?.addEventListener('click', () => {
        this._currentFontWeight = (this._currentFontWeight === 'bold' || this._currentFontWeight === '700') ? 'normal' : 'bold';
        applyFontProperty('fontWeight', this._currentFontWeight);
      });

      root.querySelector('#cd-font-italic-btn')?.addEventListener('click', () => {
        this._currentFontStyle = (this._currentFontStyle === 'italic') ? 'normal' : 'italic';
        applyFontProperty('fontStyle', this._currentFontStyle);
      });

      root.querySelector('#cd-font-underline-btn')?.addEventListener('click', () => {
        this._currentTextDecoration = (this._currentTextDecoration === 'underline') ? 'none' : 'underline';
        applyFontProperty('textDecoration', this._currentTextDecoration);
      });

      fontPopover.querySelectorAll('[data-align]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const align = btn.getAttribute('data-align');
          this._currentTextAlign = align;
          applyFontProperty('textAlign', align);
        });
      });
    }

    // Fecha popovers ao clicar fora
    window.addEventListener('click', (e) => {
      const path = e.composedPath();
      if (this._colorPaletteOpen && colorPopover && !path.includes(colorPopover) && !path.includes(paletteBtn)) {
        this._colorPaletteOpen = false;
        colorPopover.classList.remove('open');
      }
      if (this._fontPaletteOpen && fontPopover && !path.includes(fontPopover) && !path.includes(fontBtn)) {
        this._fontPaletteOpen = false;
        fontPopover.classList.remove('open');
      }
      if (this._linesMenuOpen && linesPopover && !path.includes(linesPopover) && !path.includes(linesBtn)) {
        this._linesMenuOpen = false;
        linesPopover.classList.remove('open');
      }
      if (this._contextMenuOpen) {
        const ctxMenuEl = root.querySelector('#cd-context-menu');
        if (ctxMenuEl && !path.includes(ctxMenuEl)) {
          this._contextMenuOpen = false;
          ctxMenuEl.classList.remove('open');
        }
      }
    });

    // ==========================================
    // 5. MENU DE CONTEXTO (AGRUPAR, DESAGRUPAR, Z-ORDER, ROTAÇÃO)
    // ==========================================
    const ctxMenu = root.querySelector('#cd-context-menu');

    root.querySelector('#cd-ctx-group')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      this._groupSelected();
    });

    root.querySelector('#cd-ctx-ungroup')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      this._ungroupSelected();
    });

    root.querySelector('#cd-ctx-bring-front')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      this._bringToFront();
    });

    root.querySelector('#cd-ctx-bring-forward')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      this._bringForward();
    });

    root.querySelector('#cd-ctx-send-backward')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      this._sendBackward();
    });

    root.querySelector('#cd-ctx-send-back')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      this._sendToBack();
    });

    root.querySelector('#cd-ctx-rotate-cw')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      this._rotateSelected(90);
    });

    root.querySelector('#cd-ctx-rotate-ccw')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      this._rotateSelected(-90);
    });

    root.querySelector('#cd-ctx-rotate-reset')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      this._resetRotation();
    });

    root.querySelector('#cd-ctx-duplicate')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      this._duplicateSelected();
    });

    root.querySelector('#cd-ctx-edit-text')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._contextMenuOpen = false;
      const firstId = Array.from(this._selectedNodeIds)[0];
      if (firstId) {
        this._openTextEditor(firstId);
      }
    });

    root.querySelector('#cd-ctx-delete')?.addEventListener('click', () => {
      this._contextMenuOpen = false;
      deleteSelected();
    });

    // ==========================================
    // 6. EXCLUSÃO E SELEÇÃO GERAL
    // ==========================================
    const deleteSelected = () => {
      if (this._selectedNodeIds.size === 0 && this._selectedConnectorIds.size === 0) return;
      this._recordHistory();
      if (this._selectedConnectorIds.size > 0) {
        const count = this._selectedConnectorIds.size;
        this._connectors = this._connectors.filter((c) => !this._selectedConnectorIds.has(c.id));
        this._selectedConnectorIds.clear();
        this.render();
        CortexModal.toast(`${count} linha(s) de conexão excluída(s).`, 'info');
        return;
      }
      const count = this._selectedNodeIds.size;
      this._nodes = this._nodes.filter((n) => !this._selectedNodeIds.has(n.id));
      this._selectedNodeIds.clear();
      this.render();
      CortexModal.toast(`${count} elemento(s) excluído(s).`, 'info');
    };

    root.querySelector('#cd-btn-delete')?.addEventListener('click', () => {
      deleteSelected();
    });

    root.querySelector('#cd-btn-select-all')?.addEventListener('click', () => {
      this._selectedNodeIds = new Set(this._nodes.map((n) => n.id));
      this.render();
      CortexModal.toast(`Todos os ${this._nodes.length} elementos foram selecionados.`, 'info');
    });

    // Atalhos de Teclado
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.shiftKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        this._ungroupSelected();
      } else if (isCtrlOrCmd && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        this._groupSelected();
      } else if (isCtrlOrCmd && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        this._ungroupSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this._selectedNodeIds.size > 0) {
          e.preventDefault();
          deleteSelected();
        }
      } else if (this._selectedConnectorIds.size > 0 && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 5;
        this._recordHistory();
        this._connectors.forEach((conn) => {
          if (this._selectedConnectorIds.has(conn.id)) {
            if (e.key === 'ArrowUp') {
              conn.busY = Math.max(80, (conn.busY || 138) - step);
            } else if (e.key === 'ArrowDown') {
              conn.busY = Math.min(650, (conn.busY || 138) + step);
            } else if (e.key === 'ArrowLeft') {
              conn.dropX = (conn.dropX || 500) - step;
            } else if (e.key === 'ArrowRight') {
              conn.dropX = (conn.dropX || 500) + step;
            }
          }
        });
        this.render();
        } else if (e.key === 'v' || e.key === 'V') {
        this._activeTool = 'select';
        this.render();
      } else if (e.key === 'h' || e.key === 'H') {
        this._activeTool = 'pan';
        this.render();
      } else if (e.key === 'r' || e.key === 'R') {
        if (this._selectedNodeIds.size > 0) {
          this._rotateSelected(90);
        }
      } else if (isCtrlOrCmd && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        this._duplicateSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Dropdown Customizado de Zoom
    const zoomBtn = root.querySelector('#cd-zoom-btn');
    if (zoomBtn) {
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._zoomMenuOpen = !this._zoomMenuOpen;
        this.render();
      });
    }

    root.querySelectorAll('.cd-zoom-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = parseFloat(item.getAttribute('data-zoom'));
        if (val) {
          this._zoom = val;
          this._zoomMenuOpen = false;
          this.render();
          CortexModal.toast(`Zoom ajustado para ${Math.round(val * 100)}%`, 'info');
        }
      });
    });

    // Undo / Redo com suporte a nós e conectores móveis
    root.querySelector('#cd-btn-undo')?.addEventListener('click', () => {
      if (this._history.length > 0) {
        this._future.push(JSON.stringify({ nodes: this._nodes, connectors: this._connectors }));
        const state = JSON.parse(this._history.pop());
        if (Array.isArray(state)) {
          this._nodes = state;
        } else {
          this._nodes = state.nodes || [];
          this._connectors = state.connectors || [];
        }
        this.render();
        CortexModal.toast('Ação desfeita (Undo).', 'info');
      } else {
        CortexModal.toast('Nada para desfazer.', 'info');
      }
    });

    root.querySelector('#cd-btn-redo')?.addEventListener('click', () => {
      if (this._future.length > 0) {
        this._history.push(JSON.stringify({ nodes: this._nodes, connectors: this._connectors }));
        const state = JSON.parse(this._future.pop());
        if (Array.isArray(state)) {
          this._nodes = state;
        } else {
          this._nodes = state.nodes || [];
          this._connectors = state.connectors || [];
        }
        this.render();
        CortexModal.toast('Ação refeita (Redo).', 'info');
      } else {
        CortexModal.toast('Nada para refazer.', 'info');
      }
    });

    // Adição de Formas a partir da Toolbox
    root.querySelectorAll('.cd-shape-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const shape = btn.getAttribute('data-shape');

        if (shape.startsWith('line-')) {
          this._addLineObject(shape);
          return;
        }

        this._recordHistory();
        const id = `node-${Date.now()}`;
        let w = 100, h = 56;
        if (shape === 'circle') { w = 64; h = 64; }
        else if (shape === 'diamond') { w = 84; h = 64; }
        else if (shape === 'star') { w = 70; h = 70; }
        else if (shape === 'triangle') { w = 80; h = 64; }
        else if (shape === 'text') { w = 110; h = 40; }

        this._nodes.push({
          id,
          type: shape,
          label: shape === 'text' ? 'Texto' : shape.toUpperCase(),
          x: 480 + Math.random() * 40,
          y: 280 + Math.random() * 40,
          w,
          h,
          rotation: 0,
          fill: this._colorTarget === 'fill' ? this._currentColor : '',
          stroke: this._colorTarget === 'stroke' ? this._currentColor : '',
          color: this._colorTarget === 'color' ? this._currentColor : '',
          fontFamily: this._currentFontFamily,
          fontSize: this._currentFontSize,
          fontWeight: this._currentFontWeight,
          fontStyle: this._currentFontStyle,
          textDecoration: this._currentTextDecoration,
          textAlign: this._currentTextAlign
        });

        this._selectedNodeIds = new Set([id]);
        this.render();
        CortexModal.toast(`Forma "${shape}" adicionada ao diagrama!`, 'success');
      });
    });

    // Toggle Minimizar/Expandir da Toolbox
    root.querySelector('#cd-tb-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toolboxCollapsed = !this._toolboxCollapsed;
      this.render();
    });

    root.querySelector('#cd-tb-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const tb = root.querySelector('#cd-toolbox');
      if (tb) tb.style.display = 'none';
      CortexModal.toast('Caixa de ferramentas oculta. Use as opções para reabrir.', 'info');
    });

    root.querySelector('#cd-tb-dock')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapperWidth = wrapperEl ? wrapperEl.clientWidth : 800;

      if (this._toolboxDocked) {
        this._toolboxDocked = null;
        this._toolboxPos = { x: 20, y: 70 };
        this.render();
        CortexModal.toast('Janelinha desafixada (Modo Flutuante Livre).', 'info');
      } else {
        const isCloserToRight = this._toolboxPos.x > (wrapperWidth / 2);
        this._toolboxDocked = isCloserToRight ? 'right' : 'left';
        this.render();
        CortexModal.toast(`Janelinha fixada na lateral ${this._toolboxDocked === 'left' ? 'esquerda' : 'direita'} (Modo Gaveta).`, 'success');
      }
    });

    // Arraste da Janelinha de Ferramentas (Toolbox Draggable)
    const tbHeader = root.querySelector('#cd-tb-header');
    const toolboxEl = root.querySelector('#cd-toolbox');

    if (tbHeader && toolboxEl && wrapperEl) {
      let isDraggingTB = false;
      let startMouse = { x: 0, y: 0 };
      let startPos = { x: 0, y: 0 };

      tbHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        isDraggingTB = true;
        startMouse = { x: e.clientX, y: e.clientY };

        if (this._toolboxDocked) {
          this._toolboxDocked = null;
          const rect = toolboxEl.getBoundingClientRect();
          const wrapRect = wrapperEl.getBoundingClientRect();
          this._toolboxPos = {
            x: Math.max(10, rect.left - wrapRect.left),
            y: Math.max(10, rect.top - wrapRect.top)
          };
          this.render();
          return;
        }

        startPos = { ...this._toolboxPos };
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingTB) return;
        const dx = e.clientX - startMouse.x;
        const dy = e.clientY - startMouse.y;
        const wrapRect = wrapperEl.getBoundingClientRect();

        const maxX = Math.max(10, wrapRect.width - 165);
        const maxY = Math.max(10, wrapRect.height - 40);

        this._toolboxPos.x = Math.max(0, Math.min(maxX, startPos.x + dx));
        this._toolboxPos.y = Math.max(0, Math.min(maxY, startPos.y + dy));

        toolboxEl.style.left = `${this._toolboxPos.x}px`;
        toolboxEl.style.top = `${this._toolboxPos.y}px`;
      });

      window.addEventListener('mouseup', () => {
        if (isDraggingTB) isDraggingTB = false;
      });
    }

    // ==========================================
    // 7. ROTAÇÃO DE OBJETOS COM O MOUSE (CANTOS E ALÇA SUPERIOR)
    // ==========================================
    let isRotating = false;
    let rotateNode = null;
    let rotateCenter = { x: 0, y: 0 };
    let rotateStartAngle = 0;
    let rotateStartNodeRot = 0;

    const startRotate = (e, targetEl) => {
      e.stopPropagation();
      e.preventDefault();
      const nodeEl = targetEl.closest('.cd-node');
      if (!nodeEl) return;
      const id = nodeEl.getAttribute('data-node-id');
      const node = this._nodes.find((n) => n.id === id);
      if (!node) return;

      const canvasRect = canvasEl.getBoundingClientRect();
      const mouseCanvasX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
      const mouseCanvasY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;

      isRotating = true;
      rotateNode = node;
      rotateCenter = { x: node.x + node.w / 2, y: node.y + node.h / 2 };
      rotateStartAngle = Math.atan2(mouseCanvasY - rotateCenter.y, mouseCanvasX - rotateCenter.x) * (180 / Math.PI);
      rotateStartNodeRot = node.rotation || 0;
    };

    root.querySelectorAll('.cd-rotate-handle').forEach((handle) => {
      handle.addEventListener('mousedown', (e) => startRotate(e, handle));
    });

    root.querySelectorAll('.cd-rotate-corner').forEach((corner) => {
      corner.addEventListener('mousedown', (e) => startRotate(e, corner));
    });

    // ==========================================
    // 8. REDIMENSIONAMENTO DE OBJETOS E GRUPOS (RESIZE HANDLES)
    // ==========================================
    let isResizing = false;
    let resizeHandle = '';
    let resizeNode = null;
    let resizeStartMouse = { x: 0, y: 0 };
    let resizeStartRect = { x: 0, y: 0, w: 0, h: 0 };

    root.querySelectorAll('.cd-resize-handle').forEach((handleEl) => {
      handleEl.addEventListener('mousedown', (e) => {
        if (isRotating) return;
        e.stopPropagation();
        e.preventDefault();
        const handle = handleEl.getAttribute('data-handle');
        const nodeEl = handleEl.closest('.cd-node');
        if (!nodeEl) return;
        const id = nodeEl.getAttribute('data-node-id');
        const node = this._nodes.find((n) => n.id === id);
        if (!node) return;

        isResizing = true;
        resizeHandle = handle;
        resizeNode = node;
        resizeStartMouse = { x: e.clientX, y: e.clientY };
        resizeStartRect = { x: node.x, y: node.y, w: node.w, h: node.h };
      });
    });

    // ==========================================
    // 8.5. INTERAÇÃO E MOVIMENTAÇÃO DE LINHAS E CONECTORES (MANUAL & ALÇAS)
    // ==========================================
    let isDraggingBus = false;
    let busDragStartMouseY = 0;
    let busInitialMap = new Map();

    let isDraggingDrop = false;
    let dropDragStartMouseX = 0;
    let dropInitialX = 0;
    let dropDragConn = null;

    // A) Mousedown nas alças explícitas
    root.querySelectorAll('.cd-bus-handle').forEach((handle) => {
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const connId = handle.getAttribute('data-conn-id');
        const parentId = handle.getAttribute('data-parent');
        const conn = this._connectors.find((c) => c.id === connId);
        if (!conn) return;

        isDraggingBus = true;
        busDragStartMouseY = e.clientY;
        busInitialMap = new Map();

        // Agrupa todos os conectores que compartilham o mesmo pai e barramento
        this._connectors.forEach((c) => {
          if (c.from === parentId && c.busY !== null) {
            busInitialMap.set(c.id, c.busY);
          }
        });
      });
    });

    root.querySelectorAll('.cd-drop-handle').forEach((handle) => {
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const connId = handle.getAttribute('data-conn-id');
        const conn = this._connectors.find((c) => c.id === connId);
        if (!conn) return;

        const computed = this._computeConnectorPath(conn);
        isDraggingDrop = true;
        dropDragStartMouseX = e.clientX;
        dropInitialX = conn.dropX !== null ? conn.dropX : computed.dropX;
        dropDragConn = conn;
      });
    });

    // B) Mousedown na linha de conexão (Hit-Area ampla de 18px)
    root.querySelectorAll('.cd-wire-hit').forEach((hitEl) => {
      hitEl.addEventListener('mousedown', (e) => {
        if (this._activeTool === 'pan' || this._activeTool.startsWith('line-')) return;
        e.stopPropagation();
        e.preventDefault();

        const connId = hitEl.getAttribute('data-conn-id');
        const conn = this._connectors.find((c) => c.id === connId);
        if (!conn) return;

        // Seleciona a linha
        if (e.shiftKey || e.ctrlKey) {
          if (this._selectedConnectorIds.has(connId)) {
            this._selectedConnectorIds.delete(connId);
          } else {
            this._selectedConnectorIds.add(connId);
          }
        } else {
          this._selectedConnectorIds = new Set([connId]);
          this._selectedNodeIds.clear();
        }

        const canvasRect = canvasEl.getBoundingClientRect();
        const mouseCanvasX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
        const mouseCanvasY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;
        const computed = this._computeConnectorPath(conn);

        // Detecta se o clique foi na barra horizontal (Seta 1 do usuário) ou na descida vertical (Seta 2)
        if (computed.busY !== null && Math.abs(mouseCanvasY - computed.busY) <= 12) {
          // Clique na linha horizontal -> inicia arraste do barramento
          isDraggingBus = true;
          busDragStartMouseY = e.clientY;
          busInitialMap = new Map();
          this._connectors.forEach((c) => {
            if (c.from === conn.from && c.busY !== null) {
              busInitialMap.set(c.id, c.busY);
            }
          });
        } else if (computed.dropX !== null && Math.abs(mouseCanvasX - computed.dropX) <= 12) {
          // Clique na linha vertical -> inicia arraste da descida
          isDraggingDrop = true;
          dropDragStartMouseX = e.clientX;
          dropInitialX = conn.dropX !== null ? conn.dropX : computed.dropX;
          dropDragConn = conn;
        }

        this.render();
      });

      // Cursor inteligente e informativo ao passar o mouse sobre os segmentos da linha
      hitEl.addEventListener('mousemove', (e) => {
        const connId = hitEl.getAttribute('data-conn-id');
        const conn = this._connectors.find((c) => c.id === connId);
        if (!conn) return;

        const canvasRect = canvasEl.getBoundingClientRect();
        const mouseCanvasX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
        const mouseCanvasY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;
        const computed = this._computeConnectorPath(conn);

        if (computed.busY !== null && Math.abs(mouseCanvasY - computed.busY) <= 10) {
          hitEl.style.cursor = 'ns-resize';
          hitEl.setAttribute('title', '↕ Arraste para mover esta Linha Horizontal para cima ou para baixo');
        } else if (computed.dropX !== null && Math.abs(mouseCanvasX - computed.dropX) <= 10) {
          hitEl.style.cursor = 'ew-resize';
          hitEl.setAttribute('title', '↔ Arraste para mover esta Linha Vertical para a esquerda ou direita');
        } else {
          hitEl.style.cursor = 'pointer';
          hitEl.setAttribute('title', 'Clique para selecionar esta linha de conexão');
        }
      });
    });

    // ==========================================
    // 9. INTERAÇÃO NO CANVAS: SELEÇÃO, PAN, DESENHO DE LINHAS & ARRASTE
    // ==========================================
    let isPanning = false;
    let panStart = { x: 0, y: 0, scrollLeft: 0, scrollTop: 0 };

    let isMarquee = false;
    let marqueeStart = { x: 0, y: 0 };

    let isDrawingLine = false;
    let lineDrawStart = { x: 0, y: 0 };
    let currentDrawStartSnap = null;
    let currentDrawEndSnap = null;
    let currentDragSnap = null;

    let isDraggingNodes = false;
    let dragStartMouse = { x: 0, y: 0 };
    let nodesInitPos = new Map();

    // Mousedown em Nós (Seleção e Arraste)
    root.querySelectorAll('.cd-node').forEach((el) => {
      el.addEventListener('mousedown', (e) => {
        if (isResizing || isRotating) return;
        if (this._activeTool === 'pan' || this._activeTool.startsWith('line-')) return;

        e.stopPropagation();
        const id = el.getAttribute('data-node-id');

        if (e.shiftKey || e.ctrlKey) {
          if (this._selectedNodeIds.has(id)) {
            this._selectedNodeIds.delete(id);
          } else {
            this._selectedNodeIds.add(id);
          }
          this.render();
          return;
        }

        if (!this._selectedNodeIds.has(id)) {
          this._selectedNodeIds = new Set([id]);
          this.render();
        }

        isDraggingNodes = true;
        dragStartMouse = { x: e.clientX, y: e.clientY };
        nodesInitPos = new Map();
        this._nodes.forEach((n) => {
          if (this._selectedNodeIds.has(n.id)) {
            nodesInitPos.set(n.id, { x: n.x, y: n.y });
          }
        });
      });

      // Menu de Contexto ao Clicar com o Botão Direito no Nó
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = el.getAttribute('data-node-id');
        if (!this._selectedNodeIds.has(id)) {
          this._selectedNodeIds = new Set([id]);
          this.render();
        }

        const wrapRect = wrapperEl.getBoundingClientRect();
        const posX = Math.max(10, Math.min(wrapRect.width - 220, e.clientX - wrapRect.left));
        const posY = Math.max(10, Math.min(wrapRect.height - 280, e.clientY - wrapRect.top));

        this._contextMenuPos = { x: posX, y: posY };
        this._contextMenuOpen = true;
        this.render();
      });

      // Duplo clique abre a janela flutuante de edição de texto
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const id = el.getAttribute('data-node-id');
        if (id) {
          this._openTextEditor(id);
        }
      });
    });

    // Mousedown no Canvas
    if (canvasEl) {
      canvasEl.addEventListener('contextmenu', (e) => {
        if (this._selectedNodeIds.size > 0 && !e.target.closest('.cd-node')) {
          e.preventDefault();
          const wrapRect = wrapperEl.getBoundingClientRect();
          const posX = Math.max(10, Math.min(wrapRect.width - 220, e.clientX - wrapRect.left));
          const posY = Math.max(10, Math.min(wrapRect.height - 280, e.clientY - wrapRect.top));
          this._contextMenuPos = { x: posX, y: posY };
          this._contextMenuOpen = true;
          this.render();
        }
      });

      canvasEl.addEventListener('mousedown', (e) => {
        if (e.target.closest('.cd-top-toolbar') || e.target.closest('.cd-toolbox') || e.target.closest('.cd-bottom-bar') || e.target.closest('.cd-context-menu')) return;
        if (this._contextMenuOpen) {
          this._contextMenuOpen = false;
          ctxMenu?.classList.remove('open');
        }

        if (this._activeTool === 'pan') {
          // Pan do Canvas
          isPanning = true;
          canvasEl.classList.add('panning');
          panStart = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: canvasEl.scrollLeft,
            scrollTop: canvasEl.scrollTop
          };
        } else if (this._activeTool.startsWith('line-')) {
          // Desenho de Linha com Detecção de Ponto de Conexão Magnética (Imã)
          const canvasRect = canvasEl.getBoundingClientRect();
          const startX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
          const startY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;

          isDrawingLine = true;
          const snapStart = this._findSnapPort(startX, startY);
          currentDrawStartSnap = snapStart;

          if (snapStart) {
            lineDrawStart = { x: snapStart.x, y: snapStart.y };
            this._showMagneticIndicator(snapStart.x, snapStart.y);
          } else {
            lineDrawStart = { x: startX, y: startY };
          }

          if (drawPreviewEl) {
            drawPreviewEl.style.left = `${startX}px`;
            drawPreviewEl.style.top = `${startY}px`;
            drawPreviewEl.style.width = '0px';
            drawPreviewEl.style.display = 'block';
          }
        } else if (this._activeTool === 'select' && !isResizing && !isRotating) {
          // Marquee Selection
          const canvasRect = canvasEl.getBoundingClientRect();
          const startX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
          const startY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;

          if (!e.shiftKey && !e.ctrlKey) {
            this._selectedNodeIds.clear();
          }

          isMarquee = true;
          marqueeStart = { x: startX, y: startY };

          if (marqueeEl) {
            marqueeEl.style.left = `${startX}px`;
            marqueeEl.style.top = `${startY}px`;
            marqueeEl.style.width = '0px';
            marqueeEl.style.height = '0px';
            marqueeEl.style.display = 'block';
          }
        }
      });

      window.addEventListener('mousemove', (e) => {
        // 0.1 Arraste da Linha Horizontal (Barramento / Seta 1)
        if (isDraggingBus) {
          const dy = (e.clientY - busDragStartMouseY) / this._zoom;
          busInitialMap.forEach((initBusY, connId) => {
            const conn = this._connectors.find((c) => c.id === connId);
            if (conn) {
              conn.busY = Math.max(80, Math.min(650, Math.round((initBusY + dy) / 5) * 5));
            }
          });
          this._updateConnectorSVGs();
          return;
        }

        // 0.2 Arraste da Linha Vertical (Descida / Seta 2)
        if (isDraggingDrop && dropDragConn) {
          const dx = (e.clientX - dropDragStartMouseX) / this._zoom;
          dropDragConn.dropX = Math.max(30, Math.min(1300, Math.round((dropInitialX + dx) / 5) * 5));
          this._updateConnectorSVGs();
          return;
        }

                // 1. Rotação com o Mouse
        if (isRotating && rotateNode) {
          const canvasRect = canvasEl.getBoundingClientRect();
          const currCanvasX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
          const currCanvasY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;

          const curAngle = Math.atan2(currCanvasY - rotateCenter.y, currCanvasX - rotateCenter.x) * (180 / Math.PI);
          const delta = curAngle - rotateStartAngle;
          let newRot = Math.round((rotateStartNodeRot + delta) % 360);
          if (newRot < 0) newRot += 360;

          if (e.shiftKey) {
            newRot = Math.round(newRot / 15) * 15;
          }

          rotateNode.rotation = newRot;
          const nodeEl = root.querySelector(`.cd-node[data-node-id="${rotateNode.id}"]`);
          if (nodeEl) {
            nodeEl.style.transform = `rotate(${newRot}deg)`;
          }
          return;
        }

        // 2. Redimensionamento de Objeto ou Grupo
        if (isResizing && resizeNode) {
          const isLineNode = resizeNode.type && resizeNode.type.startsWith('line-');
          if (isLineNode) {
            const canvasRect = canvasEl.getBoundingClientRect();
            const currCanvasX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
            const currCanvasY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;

            let { p1, p2 } = this._getLineEndpoints(resizeNode);

            if (resizeHandle === 'e' || resizeHandle === 'se' || resizeHandle === 'ne') {
              const snap = this._findSnapPort(currCanvasX, currCanvasY, resizeNode.id);
              if (snap) {
                p2 = { x: snap.x, y: snap.y };
                this._showMagneticIndicator(snap.x, snap.y);
                currentDragSnap = snap;
              } else {
                p2 = { x: currCanvasX, y: currCanvasY };
                this._hideMagneticIndicator();
                currentDragSnap = null;
              }
            } else if (resizeHandle === 'w' || resizeHandle === 'sw' || resizeHandle === 'nw') {
              const snap = this._findSnapPort(currCanvasX, currCanvasY, resizeNode.id);
              if (snap) {
                p1 = { x: snap.x, y: snap.y };
                this._showMagneticIndicator(snap.x, snap.y);
                currentDragSnap = snap;
              } else {
                p1 = { x: currCanvasX, y: currCanvasY };
                this._hideMagneticIndicator();
                currentDragSnap = null;
              }
            }

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.max(20, Math.hypot(dx, dy));
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);

            if (!currentDragSnap) {
              const absAngle = Math.abs(angle);
              if (absAngle < 15 || Math.abs(absAngle - 180) < 15 || Math.abs(dy) <= 18) {
                angle = Math.abs(angle) > 90 ? 180 : 0;
              } else if (Math.abs(absAngle - 90) < 15 || Math.abs(dx) <= 18) {
                angle = angle > 0 ? 90 : -90;
              }
            }

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            resizeNode.w = Math.round(dist);
            resizeNode.x = Math.round(midX - resizeNode.w / 2);
            resizeNode.y = Math.round(midY - 10);
            resizeNode.rotation = Math.round(angle * 10) / 10;
            resizeNode.p1 = p1;
            resizeNode.p2 = p2;

            const nodeEl = root.querySelector(`.cd-node[data-node-id="${resizeNode.id}"]`);
            if (nodeEl) {
              nodeEl.style.width = `${resizeNode.w}px`;
              nodeEl.style.left = `${resizeNode.x}px`;
              nodeEl.style.top = `${resizeNode.y}px`;
              nodeEl.style.transform = `rotate(${resizeNode.rotation}deg)`;

              const svgEl = nodeEl.querySelector('.cd-node-svg');
              if (svgEl) {
                svgEl.setAttribute('viewBox', `0 0 ${resizeNode.w} ${resizeNode.h}`);
                svgEl.innerHTML = this._renderShapeSVG(resizeNode);
              }
            }
            return;
          }
          const dx = (e.clientX - resizeStartMouse.x) / this._zoom;
          const dy = (e.clientY - resizeStartMouse.y) / this._zoom;

          let newX = resizeStartRect.x;
          let newY = resizeStartRect.y;
          let newW = resizeStartRect.w;
          let newH = resizeStartRect.h;

          if (resizeHandle.includes('e')) {
            newW = Math.max(20, resizeStartRect.w + dx);
          }
          if (resizeHandle.includes('s')) {
            newH = Math.max(16, resizeStartRect.h + dy);
          }
          if (resizeHandle.includes('w')) {
            newW = Math.max(20, resizeStartRect.w - dx);
            newX = resizeStartRect.x + (resizeStartRect.w - newW);
          }
          if (resizeHandle.includes('n')) {
            newH = Math.max(16, resizeStartRect.h - dy);
            newY = resizeStartRect.y + (resizeStartRect.h - newH);
          }

          const scaleX = newW / (resizeNode.w || 1);
          const scaleY = newH / (resizeNode.h || 1);

          resizeNode.x = Math.round(newX);
          resizeNode.y = Math.round(newY);
          resizeNode.w = Math.round(newW);
          resizeNode.h = Math.round(newH);

          // Se for grupo, escala todos os filhos proporcionalmente
          if (resizeNode.type === 'group' && resizeNode.children) {
            resizeNode.children.forEach((child) => {
              child.relX = (child.relX || 0) * scaleX;
              child.relY = (child.relY || 0) * scaleY;
              child.relW = (child.relW || child.w) * scaleX;
              child.relH = (child.relH || child.h) * scaleY;
              child.w = Math.round(child.relW);
              child.h = Math.round(child.relH);
            });
          }

          const nodeEl = root.querySelector(`.cd-node[data-node-id="${resizeNode.id}"]`);
          if (nodeEl) {
            nodeEl.style.left = `${resizeNode.x}px`;
            nodeEl.style.top = `${resizeNode.y}px`;
            nodeEl.style.width = `${resizeNode.w}px`;
            nodeEl.style.height = `${resizeNode.h}px`;

            if (resizeNode.type !== 'group') {
              const svgEl = nodeEl.querySelector('.cd-node-svg');
              if (svgEl) {
                svgEl.setAttribute('viewBox', `0 0 ${resizeNode.w} ${resizeNode.h}`);
                svgEl.innerHTML = this._renderShapeSVG(resizeNode);
              }
            } else {
              // Atualiza visualização dos filhos do grupo
              const childEls = nodeEl.querySelectorAll('.cd-group-child');
              resizeNode.children.forEach((child, idx) => {
                const cEl = childEls[idx];
                if (cEl) {
                  cEl.style.left = `${child.relX}px`;
                  cEl.style.top = `${child.relY}px`;
                  cEl.style.width = `${child.relW}px`;
                  cEl.style.height = `${child.relH}px`;
                  const cSvg = cEl.querySelector('.cd-node-svg');
                  if (cSvg) {
                    cSvg.setAttribute('viewBox', `0 0 ${child.w} ${child.h}`);
                    cSvg.innerHTML = this._renderShapeSVG(child);
                  }
                }
              });
            }
          }
          return;
        }

        // 3. Pan com a Mão
        if (isPanning) {
          const dx = e.clientX - panStart.x;
          const dy = e.clientY - panStart.y;
          canvasEl.scrollLeft = panStart.scrollLeft - dx;
          canvasEl.scrollTop = panStart.scrollTop - dy;
          return;
        }

        // 4. Desenho de Linha com Atração Magnética (Imã) em Tempo Real
        if (isDrawingLine && drawPreviewEl) {
          const canvasRect = canvasEl.getBoundingClientRect();
          let currX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
          let currY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;

          // Procura atração magnética nas portas dos objetos
          const snap = this._findSnapPort(currX, currY);
          if (snap) {
            currX = snap.x;
            currY = snap.y;
            this._showMagneticIndicator(snap.x, snap.y);
            currentDrawEndSnap = snap;
          } else {
            this._hideMagneticIndicator();
            currentDrawEndSnap = null;
          }

          const dx = currX - lineDrawStart.x;
          const dy = currY - lineDrawStart.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let angle = Math.atan2(dy, dx) * (180 / Math.PI);
          // Snap Inteligente: trava em 0° (ou 180°) se estiver quase horizontal, ou 90° se quase vertical
          const absAngle = Math.abs(angle);
          if (absAngle < 15 || Math.abs(absAngle - 180) < 15 || Math.abs(dy) <= 18) {
            angle = Math.abs(angle) > 90 ? 180 : 0;
          } else if (Math.abs(absAngle - 90) < 15 || Math.abs(dx) <= 18) {
            angle = angle > 0 ? 90 : -90;
          } else if (e.shiftKey) {
            angle = Math.round(angle / 45) * 45;
          }

          const midX = (lineDrawStart.x + currX) / 2;
          const midY = (lineDrawStart.y + currY) / 2;

          drawPreviewEl.style.left = `${midX - dist / 2}px`;
          drawPreviewEl.style.top = `${midY - 10}px`;
          drawPreviewEl.style.width = `${dist}px`;
          drawPreviewEl.style.height = '20px';
          drawPreviewEl.style.transform = `rotate(${angle}deg)`;
          drawPreviewEl.style.transformOrigin = 'center center';
          drawPreviewEl.style.display = 'block';

          const color = this._colorTarget === 'stroke' && this._currentColor ? this._currentColor : '#0284c7';
          const yMid = 10;
          let svgInner = '';
          if (this._activeTool === 'line-straight') {
            svgInner = `<line x1="1" y1="${yMid}" x2="${dist - 1}" y2="${yMid}" stroke="${color}" stroke-width="2.5" stroke-dasharray="4 4"/>`;
          } else if (this._activeTool === 'line-arrow-right') {
            svgInner = `
              <line x1="1" y1="${yMid}" x2="${dist - 10}" stroke="${color}" stroke-width="2.5" stroke-dasharray="4 4"/>
              <polygon points="${dist - 10},5 ${dist},10 ${dist - 10},15" fill="${color}"/>
            `;
          } else if (this._activeTool === 'line-arrow-left') {
            svgInner = `
              <line x1="10" y1="${yMid}" x2="${dist - 1}" stroke="${color}" stroke-width="2.5" stroke-dasharray="4 4"/>
              <polygon points="10,5 0,10 10,15" fill="${color}"/>
            `;
          } else if (this._activeTool === 'line-arrow-both') {
            svgInner = `
              <line x1="10" y1="${yMid}" x2="${dist - 10}" stroke="${color}" stroke-width="2.5" stroke-dasharray="4 4"/>
              <polygon points="10,5 0,10 10,15" fill="${color}"/>
              <polygon points="${dist - 10},5 ${dist},10 ${dist - 10},15" fill="${color}"/>
            `;
          }
          drawPreviewEl.innerHTML = `<svg width="100%" height="100%" style="overflow: visible;">${svgInner}</svg>`;
          return;
        }

        // 5. Marquee Selection
        if (isMarquee && marqueeEl) {
          const canvasRect = canvasEl.getBoundingClientRect();
          const currX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
          const currY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;

          const minX = Math.min(marqueeStart.x, currX);
          const maxX = Math.max(marqueeStart.x, currX);
          const minY = Math.min(marqueeStart.y, currY);
          const maxY = Math.max(marqueeStart.y, currY);

          marqueeEl.style.left = `${minX}px`;
          marqueeEl.style.top = `${minY}px`;
          marqueeEl.style.width = `${maxX - minX}px`;
          marqueeEl.style.height = `${maxY - minY}px`;
          return;
        }

        // 6. Arraste de múltiplos nós / grupos
        if (isDraggingNodes) {
          const dx = (e.clientX - dragStartMouse.x) / this._zoom;
          const dy = (e.clientY - dragStartMouse.y) / this._zoom;

          nodesInitPos.forEach((initPos, id) => {
            const node = this._nodes.find((n) => n.id === id);
            if (node) {
              node.x = Math.max(0, Math.round((initPos.x + dx) / 10) * 10);
              node.y = Math.max(0, Math.round((initPos.y + dy) / 10) * 10);
              const nodeEl = root.querySelector(`.cd-node[data-node-id="${id}"]`);
              if (nodeEl) {
                nodeEl.style.left = `${node.x}px`;
                nodeEl.style.top = `${node.y}px`;
              }
            }
          });

          // Atualização dinâmica contínua dos conectores e retas ancoradas ao mover nós!
          this._updateConnectorSVGs();
          this._updateAnchoredLines();
        }
      });

      window.addEventListener('mouseup', (e) => {
        // Finaliza Arraste de Linhas / Conectores
        if (isDraggingBus) {
          isDraggingBus = false;
          busInitialMap.clear();
          this._recordHistory();
          this.render();
          CortexModal.toast('Linha horizontal reposicionada com sucesso!', 'success');
          return;
        }

        if (isDraggingDrop) {
          isDraggingDrop = false;
          dropDragConn = null;
          this._recordHistory();
          this.render();
          CortexModal.toast('Linha vertical reposicionada com sucesso!', 'success');
          return;
        }

                // Finaliza Rotação
        if (isRotating) {
          isRotating = false;
          if (rotateNode) {
            this._recordHistory();
            CortexModal.toast(`${rotateNode.type === 'group' ? 'Grupo' : 'Objeto'} rotacionado para ${rotateNode.rotation || 0}°`, 'info');
            rotateNode = null;
          }
          this.render();
          return;
        }

        // Finaliza Resize com Fixação Magnética
        if (isResizing) {
          if (resizeNode && resizeNode.type && resizeNode.type.startsWith('line-')) {
            if (resizeHandle === 'e' || resizeHandle === 'se' || resizeHandle === 'ne') {
              resizeNode.endAnchor = currentDragSnap ? { nodeId: currentDragSnap.nodeId, port: currentDragSnap.port } : null;
            } else if (resizeHandle === 'w' || resizeHandle === 'sw' || resizeHandle === 'nw') {
              resizeNode.startAnchor = currentDragSnap ? { nodeId: currentDragSnap.nodeId, port: currentDragSnap.port } : null;
            }
            this._hideMagneticIndicator();
            if (currentDragSnap) {
              CortexModal.toast('Extremidade da linha fixada magneticamente ao objeto! 🧲', 'success');
            }
            currentDragSnap = null;
          }
          isResizing = false;
          resizeNode = null;
          this._recordHistory();
          this.render();
          return;
        }

        // Finaliza Pan
        if (isPanning) {
          isPanning = false;
          canvasEl.classList.remove('panning');
        }

        // Finaliza Desenho de Linha com Cálculo Vetorial Preciso de Ângulo e Extensões
        if (isDrawingLine) {
          isDrawingLine = false;
          if (drawPreviewEl) {
            drawPreviewEl.style.display = 'none';
            drawPreviewEl.innerHTML = '';
          }

          const canvasRect = canvasEl.getBoundingClientRect();
          const currX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
          const currY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;

          const dx = currX - lineDrawStart.x;
          const dy = currY - lineDrawStart.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          this._recordHistory();
          const id = `line-${Date.now()}`;
          const stroke = this._colorTarget === 'stroke' && this._currentColor ? this._currentColor : '#0284c7';

          if (dist > 8) {
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const absAngle = Math.abs(angle);
            if (absAngle < 15 || Math.abs(absAngle - 180) < 15 || Math.abs(dy) <= 18) {
              angle = Math.abs(angle) > 90 ? 180 : 0;
            } else if (Math.abs(absAngle - 90) < 15 || Math.abs(dx) <= 18) {
              angle = angle > 0 ? 90 : -90;
            } else if (e.shiftKey) {
              angle = Math.round(angle / 45) * 45;
            }
            const midX = (lineDrawStart.x + currX) / 2;
            const midY = (lineDrawStart.y + currY) / 2;
            const w = Math.max(20, Math.round(dist));
            const h = 20;

            this._nodes.push({
              id,
              type: this._activeTool,
              label: '',
              x: Math.round(midX - w / 2),
              y: Math.round(midY - h / 2),
              w,
              h,
              rotation: Math.round(angle * 10) / 10,
              stroke,
              strokeWidth: 2
            });
          } else {
            // Clique simples cria uma linha padrão horizontal
            this._nodes.push({
              id,
              type: this._activeTool,
              label: '',
              x: Math.round(lineDrawStart.x - 75),
              y: Math.round(lineDrawStart.y - 10),
              w: 150,
              h: 20,
              rotation: 0,
              stroke,
              strokeWidth: 2
            });
          }

          this._selectedNodeIds = new Set([id]);
          this._activeTool = 'select'; // Retorna para ferramenta de seleção após desenhar
          this.render();
          CortexModal.toast(wasAnchored ? 'Linha conectada e fixada magneticamente aos objetos! 🧲' : 'Linha traçada com sucesso!', 'success');
          return;
        }

        // Finaliza Marquee
        if (isMarquee) {
          isMarquee = false;
          if (marqueeEl) {
            const canvasRect = canvasEl.getBoundingClientRect();
            const currX = (e.clientX - canvasRect.left + canvasEl.scrollLeft) / this._zoom;
            const currY = (e.clientY - canvasRect.top + canvasEl.scrollTop) / this._zoom;

            const minX = Math.min(marqueeStart.x, currX);
            const maxX = Math.max(marqueeStart.x, currX);
            const minY = Math.min(marqueeStart.y, currY);
            const maxY = Math.max(marqueeStart.y, currY);

            marqueeEl.style.display = 'none';

            if (maxX - minX > 5 || maxY - minY > 5) {
              this._nodes.forEach((node) => {
                const nodeRight = node.x + node.w;
                const nodeBottom = node.y + node.h;
                const intersects = !(node.x > maxX || nodeRight < minX || node.y > maxY || nodeBottom < minY);
                if (intersects) {
                  this._selectedNodeIds.add(node.id);
                }
              });
              this.render();
            } else if (!e.shiftKey && !e.ctrlKey) {
              this.render();
            }
          }
        }

        // Finaliza Arraste de Nós
        if (isDraggingNodes) {
          isDraggingNodes = false;
          this._recordHistory();
        }
      });
    }

    // Tela Cheia no Host (não é cancelado em re-renders)
    root.querySelector('#cd-btn-fullscreen')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        this.requestFullscreen?.().then(() => {
          this._isFullscreen = true;
          this.toggleAttribute('data-fullscreen', true);
          root.querySelector('#cd-wrapper')?.classList.add('is-fullscreen');
          const btn = root.querySelector('#cd-btn-fullscreen');
          if (btn) {
            btn.title = 'Sair da Tela Cheia';
            btn.textContent = '🗗';
          }
        }).catch((err) => {
          console.warn('Erro ao solicitar tela cheia:', err);
        });
      } else {
        document.exitFullscreen?.().then(() => {
          this._isFullscreen = false;
          this.toggleAttribute('data-fullscreen', false);
          root.querySelector('#cd-wrapper')?.classList.remove('is-fullscreen');
          const btn = root.querySelector('#cd-btn-fullscreen');
          if (btn) {
            btn.title = 'Tela Cheia';
            btn.textContent = '⛶';
          }
        }).catch(() => {});
      }
    });

    // Exportar Diagrama
    root.querySelector('#cd-btn-export')?.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this._nodes, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'cortex-diagram.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      CortexModal.toast('Estrutura do Diagrama exportada com sucesso (JSON).', 'success');
    });

    // Configurações
    root.querySelector('#cd-btn-settings')?.addEventListener('click', () => {
      CortexModal.alert({
        title: 'Configurações de Grade & Palco',
        message: 'Grade milimetrada com snap-to-grid automático e conexões ortogonais ativas.'
      });
    });
  }
}

/* ============================================================================
   3. <cortex-admin-dashboard> — Painel Admin Corporativo 3 Colunas (Fiel à Imagem 5)
   SEM a barra lateral (rail), com scroll vertical e horizontal e temas 100% integrados
   ============================================================================ */

const ADMIN_EMAILS_DATASET = [
  { id: 'm-1', subject: 'Year End Financials', email: 'jheart@dx-email.com', date: '6/29/2021', status: 'New', badgeClass: 'new' },
  { id: 'm-2', subject: 'Your NDA', email: 'gretas@dx-email.com', date: '6/29/2021', status: 'New', badgeClass: 'new' },
  { id: 'm-3', subject: 'Conference Room in Germany', email: 'edwardh@dx-email.com', date: '6/28/2021', status: 'Progress', badgeClass: 'progress' },
  { id: 'm-4', subject: 'Overdue Tasks', email: 'violetb@dx-email.com', date: '6/27/2021', status: 'Done', badgeClass: 'done' },
  { id: 'm-5', subject: 'Online Meeting', email: 'edwardh@dx-email.com', date: '6/27/2021', status: 'Done', badgeClass: 'done' },
  { id: 'm-6', subject: 'Firmware Upgrade', email: 'leahs@dx-email.com', date: '6/25/2021', status: 'Done', badgeClass: 'done' },
  { id: 'm-7', subject: 'ExpandButton Open Support Tickets', email: 'barbarab@dx-email.com', date: '6/23/2021', status: 'Done', badgeClass: 'done' },
  { id: 'm-8', subject: 'A Few Quotes to Help with Motivation', email: 'leahs@dx-email.com', date: '6/23/2021', status: 'Done', badgeClass: 'done' },
  { id: 'm-9', subject: 'Network Issues Remain Unresolved', email: 'taylorr@dx-email.com', date: '6/12/2021', status: 'Done', badgeClass: 'done' },
  { id: 'm-10', subject: 'Product Training and Continuing Education', email: 'nataliem@dx-email.com', date: '6/11/2021', status: 'Done', badgeClass: 'done' }
];

const ADMIN_TASKS_DATASET = [
  {
    id: 'tk-1',
    title: 'Prepare 2022 Financial',
    body: 'IMPORTANT: The document must be fully formatted in Excel.',
    dueDate: '9/31/2021',
    priority: 'High',
    priorityColor: '#ef4444'
  },
  {
    id: 'tk-2',
    title: 'Update Personnel Files',
    body: 'In an audit I conducted of personnel files this, I found documentation to be lacking.',
    dueDate: '8/15/2021',
    priority: 'Medium',
    priorityColor: '#f59e0b'
  },
  {
    id: 'tk-3',
    title: 'Review Health Insurance Options Under the Affordable Care Act',
    body: 'The changes in health insurance laws require that we review our existing coverage and update it to meet regulations.',
    dueDate: '8/15/2021',
    priority: 'High',
    priorityColor: '#ef4444'
  },
  {
    id: 'tk-4',
    title: 'Google AdWords Strategy',
    body: 'Make final decision on whether we are going to increase our Google AdWords spend based on our 2013 marketing plan.',
    dueDate: '8/1/2021',
    priority: 'Medium',
    priorityColor: '#f59e0b'
  },
  {
    id: 'tk-5',
    title: 'Google AdWords Strategy',
    body: 'Make final decision on whether we are going to increase our Google AdWords spend based on our 2013 marketing plan.',
    dueDate: '8/1/2021',
    priority: 'Medium',
    priorityColor: '#f59e0b'
  }
];

export class CortexAdminDashboard extends CortexElement {
  constructor() {
    super();
    this._activeMailTab = 'mail';
    this._emails = [...ADMIN_EMAILS_DATASET];
    this._tasks = [...ADMIN_TASKS_DATASET];
    this._sortAsc = false;
  }

  onLanguageChange() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
          color: var(--text-primary);
        }

        /* Estrutura 3 Colunas Direta (Sem Rail Lateral, Fiel à Imagem 5) */
        .cad-shell {
          display: grid;
          grid-template-columns: 1.4fr 1.3fr 1.3fr;
          gap: 20px;
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md, 8px);
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        @media (max-width: 1000px) {
          .cad-shell {
            grid-template-columns: 1fr;
          }
        }

        /* Coluna 1: Mail / Contacts com Scroll Vertical e Horizontal */
        .cad-col-mail {
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 600px;
        }
        .cad-mail-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-subtle);
          padding: 0 16px;
          background: var(--bg-panel);
        }
        .cad-mail-tab {
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .cad-mail-tab.active {
          color: #0284c7;
          border-bottom-color: #0284c7;
        }

        /* Container de Scroll Vertical e Horizontal para a Tabela */
        .cad-table-scroll {
          flex: 1;
          overflow-x: auto;
          overflow-y: auto;
          max-height: 540px;
          width: 100%;
        }

        table.cad-mail-table {
          width: 100%;
          min-width: 360px; /* Garante que todas as colunas caibam sem corte do status */
          border-collapse: collapse;
          font-size: 13px;
        }
        table.cad-mail-table th {
          position: sticky;
          top: 0;
          z-index: 5;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-align: left;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-panel-header, var(--bg-elevated));
          white-space: nowrap;
        }
        table.cad-mail-table td {
          padding: 11px 14px;
          border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
        }
        table.cad-mail-table tr:hover {
          background: var(--bg-hover);
          cursor: pointer;
        }
        .cad-mail-title {
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }
        .cad-mail-email {
          font-size: 11.5px;
          color: #0284c7;
          white-space: nowrap;
        }

        /* Badges de Status (New, Progress, Done) com Cores Vivas */
        .cad-badge {
          display: inline-block;
          padding: 3px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          white-space: nowrap;
        }
        .cad-badge.new {
          background: rgba(34, 197, 94, 0.18);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }
        .cad-badge.progress {
          background: rgba(2, 132, 199, 0.18);
          color: #38bdf8;
          border: 1px solid rgba(2, 132, 199, 0.4);
        }
        .cad-badge.done {
          background: var(--bg-elevated);
          color: var(--text-muted);
          border: 1px solid var(--border-subtle);
        }

        /* Coluna 2: Tasks Cards com Scroll Vertical */
        .cad-col-tasks {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 600px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .cad-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
          position: sticky;
          top: 0;
          background: var(--bg-panel);
          padding-bottom: 6px;
          z-index: 2;
        }
        .cad-section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .cad-task-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 14px 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .cad-task-card:hover {
          transform: translateY(-1px);
          border-color: #0284c7;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
        .cad-task-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .cad-task-body {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 8px;
        }
        .cad-task-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
          border-top: 1px dashed var(--border-subtle);
          padding-top: 6px;
        }

        /* Coluna 3: Sales by Channel & Analytics */
        .cad-col-analytics {
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 600px;
          overflow-y: auto;
        }
        .cad-donut-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .cad-donut-svg {
          width: 170px;
          height: 170px;
        }
        .cad-donut-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-primary);
          max-width: 80px;
          line-height: 1.2;
        }
        .cad-donut-legend {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px 12px;
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 8px;
          width: 100%;
        }
        .cad-legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .cad-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }

        /* Sparklines & Tendências */
        .cad-trend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-top: 1px solid var(--border-subtle);
        }
        .cad-trend-info {
          display: flex;
          flex-direction: column;
        }
        .cad-trend-title {
          font-size: 11.5px;
          color: var(--text-muted);
        }
        .cad-trend-val {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .cad-sparkline {
          width: 120px;
          height: 28px;
        }

        /* Contadores Inferiores */
        .cad-counters {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          padding: 10px;
          margin-top: auto;
        }
        .cad-cnt-item {
          text-align: center;
        }
        .cad-cnt-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        .cad-cnt-val {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }
      </style>

      <div class="cad-shell">
        <!-- Coluna 1: Tabela Mail / Contacts com Rolagem Vertical e Horizontal Completa -->
        <div class="cad-col-mail">
          <div class="cad-mail-tabs">
            <button class="cad-mail-tab ${this._activeMailTab === 'mail' ? 'active' : ''}" id="cad-tab-mail">Mail</button>
            <button class="cad-mail-tab ${this._activeMailTab === 'contacts' ? 'active' : ''}" id="cad-tab-contacts">Contacts</button>
          </div>
          <div class="cad-table-scroll">
            <table class="cad-mail-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th id="cad-sort-date" style="cursor: pointer;">Date ↓</th>
                  <th style="width: 90px; text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${this._emails
                  .map(
                    (m) => `
                      <tr data-mail-id="${m.id}">
                        <td>
                          <div class="cad-mail-title">${m.subject}</div>
                          <div class="cad-mail-email">${m.email}</div>
                        </td>
                        <td style="color: var(--text-muted); white-space: nowrap;">${m.date}</td>
                        <td style="text-align: center;"><span class="cad-badge ${m.badgeClass}">${m.status}</span></td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Coluna 2: Cards de Tarefas -->
        <div class="cad-col-tasks">
          <div class="cad-section-header">
            <div class="cad-section-title">Tasks</div>
            <button id="cad-btn-add-task" style="font-size:12px; font-weight:600; color:#0284c7; background:transparent; border:1px solid #0284c7; padding:4px 10px; border-radius:4px; cursor:pointer;">+ Nova Tarefa</button>
          </div>

          ${this._tasks
            .map(
              (tk) => `
                <div class="cad-task-card" data-task-card-id="${tk.id}">
                  <div class="cad-task-title">${tk.title}</div>
                  <div class="cad-task-body">${tk.body}</div>
                  <div class="cad-task-footer">
                    <span>Due Date: ${tk.dueDate}</span>
                    <span>Priority: <strong style="color: ${tk.priorityColor};">• ${tk.priority}</strong></span>
                  </div>
                </div>
              `
            )
            .join('')}
        </div>

        <!-- Coluna 3: Gráficos Sales by Channel & Analytics -->
        <div class="cad-col-analytics">
          <div class="cad-section-title">Sales by Channel</div>

          <!-- Gráfico Donut SVG Multi-setor Adaptado a Todos os Temas -->
          <div class="cad-donut-wrap">
            <svg class="cad-donut-svg" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.91549430918954" fill="var(--bg-panel, #1e222b)"/>
              <!-- Banking 20% -->
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ef4444" stroke-width="6" stroke-dasharray="20 80" stroke-dashoffset="25"/>
              <!-- Energy 18% -->
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f97316" stroke-width="6" stroke-dasharray="18 82" stroke-dashoffset="5"/>
              <!-- Health 17% -->
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#eab308" stroke-width="6" stroke-dasharray="17 83" stroke-dashoffset="87"/>
              <!-- Manufacturing 15% -->
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#84cc16" stroke-width="6" stroke-dasharray="15 85" stroke-dashoffset="70"/>
              <!-- Insurance 15% -->
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#06b6d4" stroke-width="6" stroke-dasharray="15 85" stroke-dashoffset="55"/>
              <!-- Telecom 15% -->
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#3b82f6" stroke-width="6" stroke-dasharray="15 85" stroke-dashoffset="40"/>
            </svg>
            <div class="cad-donut-center">REVENUES BY SECTOR</div>
          </div>

          <!-- Legenda Donut -->
          <div class="cad-donut-legend">
            <div class="cad-legend-item"><span class="cad-legend-dot" style="background:#ef4444;"></span> Banking</div>
            <div class="cad-legend-item"><span class="cad-legend-dot" style="background:#f97316;"></span> Energy</div>
            <div class="cad-legend-item"><span class="cad-legend-dot" style="background:#eab308;"></span> Health</div>
            <div class="cad-legend-item"><span class="cad-legend-dot" style="background:#06b6d4;"></span> Insurance</div>
            <div class="cad-legend-item"><span class="cad-legend-dot" style="background:#84cc16;"></span> Manufacturing</div>
            <div class="cad-legend-item"><span class="cad-legend-dot" style="background:#3b82f6;"></span> Telecom</div>
          </div>

          <!-- Sparkline 1: Daily Orders -->
          <div class="cad-trend-row">
            <div class="cad-trend-info">
              <span class="cad-trend-title">Daily Orders</span>
              <span class="cad-trend-val">70% <small style="color: #ef4444; font-size: 11px;">-1.2%</small></span>
            </div>
            <svg class="cad-sparkline" viewBox="0 0 120 28">
              <path d="M 0 18 Q 20 6, 40 20 T 80 10 T 120 18" fill="none" stroke="#84cc16" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>

          <!-- Sparkline 2: Daily Earnings -->
          <div class="cad-trend-row">
            <div class="cad-trend-info">
              <span class="cad-trend-title">Daily Earnings</span>
              <span class="cad-trend-val">59% <small style="color: #22c55e; font-size: 11px;">+2.3%</small></span>
            </div>
            <svg class="cad-sparkline" viewBox="0 0 120 28">
              <path d="M 0 20 Q 25 24, 50 14 T 90 6 T 120 16" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>

          <!-- Contadores Rodapé -->
          <div class="cad-counters">
            <div class="cad-cnt-item">
              <div class="cad-cnt-label">Order</div>
              <div class="cad-cnt-val">1 852</div>
            </div>
            <div class="cad-cnt-item">
              <div class="cad-cnt-label">Pending</div>
              <div class="cad-cnt-val">427</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    const root = this.shadowRoot;

    // Abas Mail / Contacts
    root.querySelector('#cad-tab-mail')?.addEventListener('click', () => {
      this._activeMailTab = 'mail';
      this.render();
    });
    root.querySelector('#cad-tab-contacts')?.addEventListener('click', () => {
      this._activeMailTab = 'contacts';
      this.render();
    });

    // Clique em linha de email abre mensagem
    root.querySelectorAll('tr[data-mail-id]').forEach((tr) => {
      tr.addEventListener('click', () => {
        const id = tr.getAttribute('data-mail-id');
        const mail = this._emails.find((m) => m.id === id);
        if (mail) {
          CortexModal.alert({
            title: mail.subject,
            message: `De: ${mail.email}\nData: ${mail.date}\nStatus: ${mail.status}\n\nMensagem corporativa sincronizada via Cortex Mail.`
          });
        }
      });
    });

    // Botão Adicionar Tarefa
    root.querySelector('#cad-btn-add-task')?.addEventListener('click', async () => {
      const res = await CortexModal.form({
        title: 'Nova Tarefa Executiva',
        message: 'Preencha o título e as instruções da tarefa:',
        fields: [
          { name: 'title', label: 'Título', value: '', placeholder: 'Ex: Prepare Q3 Forecast' },
          { name: 'body', label: 'Descrição', value: 'Revisão técnica de conformidade.' },
          { name: 'dueDate', label: 'Due Date', type: 'datepicker', value: '10/30/2026' },
          { name: 'priority', label: 'Prioridade', type: 'select', value: 'High', options: ['High', 'Medium', 'Low'] }
        ]
      });

      if (res && !res.__action) {
        this._tasks.unshift({
          id: `tk-${Date.now()}`,
          title: res.title || 'Nova Tarefa',
          body: res.body || '',
          dueDate: res.dueDate || '12/31/2026',
          priority: res.priority || 'Medium',
          priorityColor: res.priority === 'High' ? '#ef4444' : '#f59e0b'
        });
        this.render();
        CortexModal.toast('Tarefa cadastrada com sucesso!', 'success');
      }
    });

    // Clique no Card de Tarefa
    root.querySelectorAll('.cad-task-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-task-card-id');
        const tk = this._tasks.find((t) => t.id === id);
        if (tk) {
          CortexModal.alert({
            title: tk.title,
            message: `${tk.body}\n\nPrazo: ${tk.dueDate} | Prioridade: ${tk.priority}`
          });
        }
      });
    });
  }
}

/* ============================================================================
   4. <cortex-saas-dashboard> — SaaS Applications Revenue & Top Products (Fiel à Imagem 4)
   ============================================================================ */

const SAAS_PRODUCTS_DATASET = [
  { id: 'p-1', icon: '⭐', name: 'Eco Max', price: 2500, sold: 55, channels: 'Direct, Consultants', discount: '7%', desc: 'Low pollution industrial air cleaner' },
  { id: 'p-2', icon: '🏔️', name: 'Eco Supreme', price: 2000, sold: 82, channels: 'Consultants, Retail, Direct', discount: '5%', desc: 'High-output air cleaner powered by solar' },
  { id: 'p-3', icon: '🌙', name: 'Eco Supreme', price: 1750, sold: 139, channels: 'Resellers, Consultants, Retail', discount: '3%', desc: 'Consumer air filtration and vent system' },
  { id: 'p-4', icon: '⚙️', name: 'EnviroCare Max', price: 2800, sold: 36, channels: 'Direct, VARs', discount: '10%', desc: 'Industrial environmental control system' },
  { id: 'p-5', icon: '🌀', name: 'SolarOne', price: 1500, sold: 289, channels: 'Resellers, Retail, VARs', discount: '0%', desc: 'Environmentally friendly power generation' }
];

export class CortexSaaSDashboard extends CortexElement {
  constructor() {
    super();
    this._timeframe = 'Year'; // 'Week' | 'Month' | 'Year'
    this._currentPage = 1;
    this._products = [...SAAS_PRODUCTS_DATASET];
    this._sortAsc = true;
  }

  onLanguageChange() {
    this.render();
  }

  render() {
    // Dados para o Combo Chart (Jan a Dec)
    const monthlyData = [
      { month: 'Jan', val: 440, line: 15 },
      { month: 'Feb', val: 510, line: 22 },
      { month: 'Mar', val: 410, line: 18 },
      { month: 'Apr', val: 680, line: 12 },
      { month: 'May', val: 230, line: 22 },
      { month: 'Jun', val: 415, line: 14 },
      { month: 'Jul', val: 200, line: 11 },
      { month: 'Aug', val: 360, line: 15 },
      { month: 'Sep', val: 750, line: 13 },
      { month: 'Oct', val: 320, line: 9 },
      { month: 'Nov', val: 280, line: 11 },
      { month: 'Dec', val: 460, line: 13 }
    ];

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
          color: var(--text-primary);
        }

        .csd-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Linha Superior: Revenue Chart (Esquerda) + KPI Performance (Direita) */
        .csd-top-row {
          display: grid;
          grid-template-columns: 1.6fr 1.2fr;
          gap: 20px;
        }
        @media (max-width: 900px) {
          .csd-top-row {
            grid-template-columns: 1fr;
          }
        }

        .csd-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md, 8px);
          padding: 20px 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        /* Cabeçalho do Card com Título e Switcher Week/Month/Year */
        .csd-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .csd-card-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .csd-time-switcher {
          display: inline-flex;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          padding: 2px;
        }
        .csd-time-btn {
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 5px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.12s ease;
        }
        .csd-time-btn.active {
          background: var(--bg-panel);
          color: var(--text-primary);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* Gráfico Combo (Barras Verdes + Linha Azul) */
        .csd-combo-chart {
          width: 100%;
          height: 190px;
          position: relative;
        }

        /* Painel Direito de Indicadores (KPIs) */
        .csd-kpi-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: space-between;
        }
        .csd-spark-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .csd-spark-label {
          font-size: 12px;
          color: var(--text-muted);
        }
        .csd-spark-val {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .csd-progress-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding-top: 6px;
        }
        .csd-prog-meta {
          min-width: 90px;
        }
        .csd-prog-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        .csd-prog-num {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .csd-prog-track {
          flex: 1;
          height: 8px;
          background: var(--bg-input);
          border-radius: 4px;
          overflow: hidden;
        }
        .csd-prog-bar {
          height: 100%;
          border-radius: 4px;
        }

        /* Seção Inferior: Top Selling Products */
        .csd-table-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md, 8px);
          padding: 20px 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .csd-table-wrap {
          overflow-x: auto;
          overflow-y: auto;
          width: 100%;
        }
        table.csd-table {
          width: 100%;
          min-width: 600px;
          border-collapse: collapse;
          font-size: 13.5px;
          margin-top: 10px;
        }
        table.csd-table th {
          padding: 10px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-subtle);
          text-align: left;
        }
        table.csd-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-primary);
        }
        table.csd-table tr:hover {
          background: var(--bg-hover);
        }
        .csd-product-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        /* Paginação */
        .csd-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .csd-pager-btns {
          display: flex;
          gap: 6px;
        }
        .csd-page-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--border-subtle);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.12s ease;
        }
        .csd-page-btn:hover {
          color: var(--text-primary);
          border-color: #0284c7;
        }
        .csd-page-btn.active {
          background: #0284c7;
          border-color: #0284c7;
          color: #ffffff;
        }
      </style>

      <div class="csd-wrapper">
        <!-- Top Row -->
        <div class="csd-top-row">
          <!-- Card Esquerdo: Revenue Chart -->
          <div class="csd-card">
            <div class="csd-card-header">
              <div class="csd-card-title">Revenue</div>
              <div class="csd-time-switcher">
                <button class="csd-time-btn ${this._timeframe === 'Week' ? 'active' : ''}" data-tf="Week">Week</button>
                <button class="csd-time-btn ${this._timeframe === 'Month' ? 'active' : ''}" data-tf="Month">Month</button>
                <button class="csd-time-btn ${this._timeframe === 'Year' ? 'active' : ''}" data-tf="Year">Year</button>
              </div>
            </div>

            <!-- Gráfico SVG Combo Adaptado aos Temas -->
            <div class="csd-combo-chart">
              <svg viewBox="0 0 540 190" width="100%" height="100%">
                <!-- Eixo Y Esquerdo (0, 200, 400, 600, 800) -->
                <text x="20" y="20" font-size="9" fill="var(--text-muted)">800</text>
                <text x="20" y="60" font-size="9" fill="var(--text-muted)">600</text>
                <text x="20" y="100" font-size="9" fill="var(--text-muted)">400</text>
                <text x="20" y="140" font-size="9" fill="var(--text-muted)">200</text>
                <text x="32" y="175" font-size="9" fill="var(--text-muted)">0</text>

                <!-- Linhas Horizontais de Grade -->
                <line x1="45" y1="18" x2="495" y2="18" stroke="var(--border-subtle)" stroke-width="1"/>
                <line x1="45" y1="58" x2="495" y2="58" stroke="var(--border-subtle)" stroke-width="1"/>
                <line x1="45" y1="98" x2="495" y2="98" stroke="var(--border-subtle)" stroke-width="1"/>
                <line x1="45" y1="138" x2="495" y2="138" stroke="var(--border-subtle)" stroke-width="1"/>
                <line x1="45" y1="172" x2="495" y2="172" stroke="var(--border-subtle)" stroke-width="1"/>

                <!-- Eixo Y Direito (0, 10, 20, 30, 40) -->
                <text x="505" y="20" font-size="9" fill="var(--text-muted)">40</text>
                <text x="505" y="60" font-size="9" fill="var(--text-muted)">30</text>
                <text x="505" y="100" font-size="9" fill="var(--text-muted)">20</text>
                <text x="505" y="140" font-size="9" fill="var(--text-muted)">10</text>
                <text x="505" y="175" font-size="9" fill="var(--text-muted)">0</text>

                <!-- Barras Verdes (Jan a Dec) -->
                ${monthlyData
                  .map((d, i) => {
                    const x = 55 + i * 36;
                    const h = (d.val / 800) * 150;
                    const y = 172 - h;
                    return `
                      <rect x="${x}" y="${y}" width="18" height="${h}" rx="2" fill="#a3e635" opacity="0.9">
                        <title>${d.month}: $${d.val}k</title>
                      </rect>
                      <text x="${x + 9}" y="185" font-size="9" text-anchor="middle" fill="var(--text-muted)">${d.month}</text>
                    `;
                  })
                  .join('')}

                <!-- Linha Azul Overlay -->
                <polyline
                  points="${monthlyData.map((d, i) => `${64 + i * 36},${172 - (d.line / 40) * 150}`).join(' ')}"
                  fill="none"
                  stroke="#0284c7"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </div>

          <!-- Card Direito: KPI Performance -->
          <div class="csd-card csd-kpi-col">
            <div class="csd-spark-row">
              <div>
                <div class="csd-spark-label">Daily Orders</div>
                <div class="csd-spark-val">70% <small style="color: #ef4444; font-size: 12px;">-1.2%</small></div>
              </div>
              <svg width="120" height="32" viewBox="0 0 120 32">
                <path d="M 0 20 Q 20 6, 40 22 T 80 12 T 120 20" fill="none" stroke="#84cc16" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>

            <div class="csd-spark-row">
              <div>
                <div class="csd-spark-label">Daily Earnings</div>
                <div class="csd-spark-val">59% <small style="color: #22c55e; font-size: 12px;">+2.3%</small></div>
              </div>
              <svg width="120" height="32" viewBox="0 0 120 32">
                <path d="M 0 22 Q 25 26, 50 16 T 90 8 T 120 18" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>

            <!-- Barras Horizontais com Contadores -->
            <div class="csd-progress-row">
              <div class="csd-prog-meta">
                <div class="csd-prog-label">Order</div>
                <div class="csd-prog-num">1 852</div>
              </div>
              <div class="csd-prog-track">
                <div class="csd-prog-bar" style="width: 70%; background: #84cc16;"></div>
              </div>
            </div>

            <div class="csd-progress-row">
              <div class="csd-prog-meta">
                <div class="csd-prog-label">Pending</div>
                <div class="csd-prog-num">427</div>
              </div>
              <div class="csd-prog-track">
                <div class="csd-prog-bar" style="width: 35%; background: #0284c7;"></div>
              </div>
            </div>

            <div class="csd-progress-row">
              <div class="csd-prog-meta">
                <div class="csd-prog-label">Delivered</div>
                <div class="csd-prog-num">952</div>
              </div>
              <div class="csd-prog-track">
                <div class="csd-prog-bar" style="width: 80%; background: #f59e0b;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seção Inferior: Top Selling Products -->
        <div class="csd-table-card">
          <div class="csd-card-header">
            <div class="csd-card-title">Top Selling Products</div>
            <div style="display:flex; gap:8px;">
              <button id="csd-btn-add-prod" style="font-size:12px; font-weight:600; color:#0284c7; background:transparent; border:1px solid #0284c7; padding:4px 10px; border-radius:4px; cursor:pointer;">+ Produto</button>
              <button id="csd-btn-export-prod" style="font-size:12px; font-weight:600; color:var(--text-secondary); background:transparent; border:1px solid var(--border-subtle); padding:4px 10px; border-radius:4px; cursor:pointer;">Exportar CSV</button>
            </div>
          </div>

          <div class="csd-table-wrap">
            <table class="csd-table">
              <thead>
                <tr>
                  <th style="cursor: pointer;" id="csd-sort-prod">Product Name ↓</th>
                  <th>Price</th>
                  <th>Sold</th>
                  <th>Channels</th>
                  <th>Discount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${this._products
                  .map(
                    (p) => `
                      <tr data-prod-id="${p.id}">
                        <td>
                          <div class="csd-product-cell">
                            <span>${p.icon}</span>
                            <span>${p.name}</span>
                          </div>
                        </td>
                        <td>${p.price}</td>
                        <td>${p.sold}</td>
                        <td>${p.channels}</td>
                        <td>${p.discount}</td>
                        <td style="color: var(--text-muted);">${p.desc}</td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <!-- Paginação -->
          <div class="csd-footer">
            <div>Page ${this._currentPage} of 4 (20 items)</div>
            <div class="csd-pager-btns">
              <button class="csd-page-btn ${this._currentPage === 1 ? 'active' : ''}" data-page="1">1</button>
              <button class="csd-page-btn ${this._currentPage === 2 ? 'active' : ''}" data-page="2">2</button>
              <button class="csd-page-btn ${this._currentPage === 3 ? 'active' : ''}" data-page="3">3</button>
              <button class="csd-page-btn ${this._currentPage === 4 ? 'active' : ''}" data-page="4">4</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    const root = this.shadowRoot;

    // Time Switcher (Week, Month, Year)
    root.querySelectorAll('.csd-time-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._timeframe = btn.getAttribute('data-tf');
        this.render();
        CortexModal.toast(`Visualização de faturamento alterada para: ${this._timeframe}`, 'info');
      });
    });

    // Paginação
    root.querySelectorAll('.csd-page-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._currentPage = parseInt(btn.getAttribute('data-page'), 10) || 1;
        this.render();
      });
    });

    // Botão Adicionar Produto
    root.querySelector('#csd-btn-add-prod')?.addEventListener('click', async () => {
      const res = await CortexModal.form({
        title: 'Cadastrar Novo Produto',
        message: 'Preencha os dados do produto comercial:',
        fields: [
          { name: 'name', label: 'Nome do Produto', value: '', placeholder: 'Ex: AeroFilter Pro' },
          { name: 'price', label: 'Preço ($)', type: 'number', value: '1800' },
          { name: 'sold', label: 'Unidades Vendidas', type: 'number', value: '45' },
          { name: 'channels', label: 'Canais de Venda', value: 'Direct, Retail' },
          { name: 'discount', label: 'Desconto %', value: '5%' },
          { name: 'desc', label: 'Descrição', value: 'Sistema de filtragem avançada.' }
        ]
      });

      if (res && !res.__action) {
        this._products.unshift({
          id: `p-${Date.now()}`,
          icon: '✨',
          name: res.name || 'Novo Produto',
          price: parseFloat(res.price) || 1000,
          sold: parseInt(res.sold, 10) || 0,
          channels: res.channels || 'Direct',
          discount: res.discount || '0%',
          desc: res.desc || ''
        });
        this.render();
        CortexModal.toast('Produto cadastrado com sucesso!', 'success');
      }
    });

    // Exportar CSV
    root.querySelector('#csd-btn-export-prod')?.addEventListener('click', () => {
      let csv = '\uFEFF"Product Name","Price","Sold","Channels","Discount","Description"\n';
      this._products.forEach((p) => {
        csv += `"${p.name}","${p.price}","${p.sold}","${p.channels}","${p.discount}","${p.desc.replace(/"/g, '""')}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'top_selling_products.csv';
      a.click();
      URL.revokeObjectURL(url);
      CortexModal.toast('Produtos exportados com sucesso!', 'success');
    });
  }
}

// Registro dos Custom Elements
customElements.define('cortex-treelist', CortexTreeList);
customElements.define('cortex-diagram', CortexDiagram);
customElements.define('cortex-admin-dashboard', CortexAdminDashboard);
customElements.define('cortex-saas-dashboard', CortexSaaSDashboard);
