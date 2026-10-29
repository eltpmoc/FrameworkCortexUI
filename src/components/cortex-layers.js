// src/components/cortex-layers.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';
import { CortexModal } from './cortex-modal.js';
import { t } from '../core/i18n.js';

const TYPE_BADGES = {
  rect: '&#9645;',
  line: '&#9585;',
  text: 'T',
  path: '&#9998;'
};

export class CortexLayers extends CortexElement {
  constructor() {
    super();
    this._draggedNodeId = null;
  }

  onLanguageChange() {
    this.render();
  }

  onMount() {
    this.watchState(['sceneNodes', 'selectedNodeId', 'currentPage'], () => {
      this.render();
    });
  }

  _getCurrentPageNodes() {
    const allNodes = AppState.get('sceneNodes') || [];
    const currentPage = AppState.get('currentPage') || 1;
    // Exibe na lista do topo (maior zIndex) para a base (menor zIndex)
    return allNodes
      .filter((n) => (n.page || 1) === currentPage)
      .slice()
      .sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));
  }

  render() {
    const nodes = this._getCurrentPageNodes();
    const selectedId = AppState.get('selectedNodeId');

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .layers-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .layers-count {
          color: var(--text-muted);
          font-size: 11px;
        }

        .order-actions {
          display: inline-flex;
          gap: 4px;
        }

        .act-btn {
          height: 22px;
          padding: 0 6px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          color: var(--text-secondary);
          font-size: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .act-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .layer-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .layer-item {
          display: grid;
          grid-template-columns: 16px 20px 1fr auto;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          font-size: 11px;
          cursor: grab;
          transition: background var(--transition-fast), border-color var(--transition-fast);
        }

        .layer-item:hover {
          background-color: var(--bg-hover);
        }

        .layer-item.selected {
          background-color: var(--accent-blue-alpha);
          border-color: var(--accent-blue);
          color: var(--text-primary);
          font-weight: 600;
        }

        .layer-item.drag-over {
          border-top: 2px solid var(--accent-blue);
        }

        .layer-item.is-hidden {
          opacity: 0.5;
        }

        .drag-grip {
          color: var(--text-muted);
          font-size: 11px;
          text-align: center;
          cursor: grab;
        }

        .type-swatch {
          width: 18px;
          height: 18px;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .layer-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
        }

        .layer-controls {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .icon-btn {
          width: 20px;
          height: 20px;
          border-radius: 2px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 11px;
        }

        .icon-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .icon-btn.active-lock {
          color: var(--status-warn);
        }

        .empty-state {
          padding: 18px 8px;
          text-align: center;
          color: var(--text-muted);
          font-size: 11px;
          border: 1px dashed var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        @media (max-width: 768px) {
          .layer-item {
            padding: 10px;
            font-size: 12px;
          }
          .icon-btn {
            width: 28px;
            height: 28px;
          }
        }
      </style>

      <div class="layers-toolbar">
        <span class="layers-count">${t('layers.count', { count: nodes.length, page: AppState.get('currentPage') })}</span>
        <div class="order-actions">
          <button class="act-btn" id="btn-front" title="${t('layers.frontTitle')}">&uarr; ${t('layers.front')}</button>
          <button class="act-btn" id="btn-back" title="${t('layers.backTitle')}">&darr; ${t('layers.back')}</button>
        </div>
      </div>

      ${
        nodes.length === 0
          ? `<div class="empty-state">${t('layers.empty')}</div>`
          : `<ul class="layer-list">
              ${nodes
                .map((node) => {
                  const swatchBg =
                    node.fill && node.fill !== 'transparent' && node.fill !== 'none'
                      ? node.fill
                      : node.stroke || '#1473e6';
                  return `
                    <li
                      class="layer-item ${node.id === selectedId ? 'selected' : ''} ${!node.visible ? 'is-hidden' : ''}"
                      draggable="true"
                      data-node-id="${node.id}"
                    >
                      <span class="drag-grip" title="${t('layers.dragHint')}">&#8942;&#8942;</span>
                      <span class="type-swatch" style="background-color: ${swatchBg};">
                        ${TYPE_BADGES[node.type] || '&#9632;'}
                      </span>
                      <span class="layer-name" title="${t('layers.renameHint')}">${node.name}</span>
                      <div class="layer-controls">
                        <button
                          class="icon-btn"
                          data-act="toggle-visible"
                          data-id="${node.id}"
                          title="${node.visible ? t('layers.hide') : t('layers.show')}"
                        >
                          ${node.visible ? '&#128065;' : '&#128683;'}
                        </button>
                        <button
                          class="icon-btn ${node.locked ? 'active-lock' : ''}"
                          data-act="toggle-lock"
                          data-id="${node.id}"
                          title="${node.locked ? t('layers.unlock') : t('layers.lock')}"
                        >
                          ${node.locked ? '&#128274;' : '&#128275;'}
                        </button>
                        <button
                          class="icon-btn"
                          data-act="delete-layer"
                          data-id="${node.id}"
                          title="${t('layers.delete')}"
                        >
                          &times;
                        </button>
                      </div>
                    </li>
                  `;
                })
                .join('')}
            </ul>`
      }
    `;

    // Botões Topo / Base
    this.shadowRoot.getElementById('btn-front')?.addEventListener('click', () => {
      this.emit('cortex-layer-action', { action: 'bring-front', id: selectedId });
    });

    this.shadowRoot.getElementById('btn-back')?.addEventListener('click', () => {
      this.emit('cortex-layer-action', { action: 'send-back', id: selectedId });
    });

    // Clique, Duplo Clique e Drag & Drop nas camadas
    this.shadowRoot.querySelectorAll('.layer-item').forEach((item) => {
      const nodeId = item.dataset.nodeId;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.icon-btn')) return;
        this.emit('cortex-layer-action', { action: 'select', id: nodeId });
      });

      item.addEventListener('dblclick', async (e) => {
        if (e.target.closest('.icon-btn')) return;
        const targetNode = nodes.find((n) => n.id === nodeId);
        if (!targetNode) return;
        const newName = await CortexModal.prompt({
          title: t('layers.renameTitle'),
          message: t('layers.renamePrompt'),
          defaultValue: targetNode.name
        });
        if (newName && newName.trim()) {
          this.emit('cortex-update-property', {
            id: nodeId,
            prop: 'name',
            value: newName.trim(),
            commitHistory: true
          });
        }
      });

      // Drag & Drop nativo para reordenar Z-Index
      item.addEventListener('dragstart', (e) => {
        this._draggedNodeId = nodeId;
        e.dataTransfer.effectAllowed = 'move';
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        item.classList.add('drag-over');
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');
        if (this._draggedNodeId && this._draggedNodeId !== nodeId) {
          this.emit('cortex-layer-action', {
            action: 'reorder',
            sourceId: this._draggedNodeId,
            targetId: nodeId
          });
        }
        this._draggedNodeId = null;
      });
    });

    // Botões Visibilidade, Lock e Delete
    this.shadowRoot.querySelectorAll('[data-act]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = btn.dataset.act;
        const id = btn.dataset.id;
        const node = nodes.find((n) => n.id === id);
        if (!node) return;

        if (act === 'toggle-visible') {
          this.emit('cortex-update-property', {
            id,
            prop: 'visible',
            value: !node.visible,
            commitHistory: true
          });
        } else if (act === 'toggle-lock') {
          this.emit('cortex-update-property', {
            id,
            prop: 'locked',
            value: !node.locked,
            commitHistory: true
          });
        } else if (act === 'delete-layer') {
          this.emit('cortex-layer-action', { action: 'delete', id });
        }
      });
    });
  }
}

customElements.define('cortex-layers', CortexLayers);
