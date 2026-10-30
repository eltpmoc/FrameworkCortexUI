// src/components/cortex-inspector.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';
import { t } from '../core/i18n.js';
import './cortex-layers.js';
import './cortex-color-picker.js';
import './cortex-font-picker.js';

const PAGE_PRESETS = {
  'A4 (210 × 297 mm)': { w: 210, h: 297 },
  'Letter (215.9 × 279.4 mm)': { w: 215.9, h: 279.4 },
  'Web 1080p (508 × 285.7 mm)': { w: 508, h: 285.7 }
};

export class CortexInspector extends CortexElement {
  constructor() {
    super();
    this._lastRenderedNodeId = undefined;
    this._mobileDrawerOpen = false;
  }

  onLanguageChange() {
    this.render();
  }

  onMount() {
    // Mudanças estruturais que exigem re-render completo das abas/painéis
    this.watchState(
      [
        'activeInspectorTab',
        'inspectorCollapsed',
        'pagePreset',
        'pageWidthMm',
        'pageHeightMm',
        'orientation',
        'facingPages',
        'showRulers',
        'showGuides',
        'showGrid',
        'currentPage',
        'totalPages'
      ],
      () => {
        this.render();
      }
    );

    // Two-Way Data Binding: Se trocou o ID selecionado, re-renderiza;
    // se é o mesmo objeto sendo arrastado/editado em 60 FPS, atualiza apenas os valores dos inputs!
    this.watchState('selectedNode', (node) => {
      const nextId = node ? node.id : null;
      if (nextId !== this._lastRenderedNodeId) {
        this._lastRenderedNodeId = nextId;
        this.render();
      } else if (node) {
        this._patchLiveInputs(node);
      }
    });
  }

  /**
   * Atualiza cirurgicamente os campos vinculados sem recriar o DOM nem perder o foco (60 FPS).
   */
  _patchLiveInputs(node) {
    const activeEl = this.shadowRoot.activeElement;
    this.shadowRoot.querySelectorAll('[data-bind-prop]').forEach((input) => {
      if (input === activeEl) return; // Não sobrescreve o campo que o usuário está digitando
      const prop = input.dataset.bindProp;
      if (node[prop] !== undefined) {
        if (input.type === 'checkbox') {
          input.checked = Boolean(node[prop]);
        } else if (input.type === 'number' || input.type === 'range') {
          const num = Number(node[prop]);
          input.value = isNaN(num) ? 0 : num;
        } else {
          input.value = node[prop];
        }
      }
    });

    const rotLabel = this.shadowRoot.getElementById('lbl-rotation-val');
    if (rotLabel && node.rotation !== undefined) {
      const rotNum = Number(node.rotation) || 0;
      rotLabel.textContent = `${Math.round(rotNum)}°`;
    }

    const opacityLabel = this.shadowRoot.getElementById('lbl-opacity-val');
    if (opacityLabel && node.opacity !== undefined) {
      opacityLabel.textContent = `${Math.round(node.opacity * 100)}%`;
    }

    const strokeWLabel = this.shadowRoot.getElementById('lbl-strokew-val');
    if (strokeWLabel && node.strokeWidth !== undefined) {
      strokeWLabel.textContent = `${node.strokeWidth}px`;
    }
  }

  _renderObjectPropertiesSection(node) {
    if (!node) {
      return `<div class="selection-banner">${t('inspector.noSelection')}</div>`;
    }

    const safeFill =
      node.fill && node.fill.startsWith('#') && node.fill.length === 7 ? node.fill : '#10b981';
    const safeStroke =
      node.stroke && node.stroke.startsWith('#') && node.stroke.length === 7
        ? node.stroke
        : '#18181b';

    return `
      <div class="section-group highlight-box">
        <div class="row-between">
          <span class="section-title" style="color: var(--accent-text);">
            ${t('inspector.selected')}: ${node.type.toUpperCase()}
          </span>
          <span class="badge-z">Z: ${node.zIndex ?? 1}</span>
        </div>

        <!-- Nome da Camada -->
        <label class="input-prefixed">
          <span class="prefix">${t('inspector.name')}:</span>
          <input type="text" data-bind-prop="name" value="${node.name || ''}" />
        </label>

        <!-- Transformação Espacial (X, Y, W, H) -->
        <div class="grid-2">
          <label class="input-prefixed">
            <span class="prefix">X:</span>
            <input type="number" data-bind-prop="x" value="${Math.round(node.x)}" />
          </label>
          <label class="input-prefixed">
            <span class="prefix">Y:</span>
            <input type="number" data-bind-prop="y" value="${Math.round(node.y)}" />
          </label>
          <label class="input-prefixed">
            <span class="prefix">W:</span>
            <input type="number" data-bind-prop="width" value="${Math.round(node.width)}" min="1" />
          </label>
          <label class="input-prefixed">
            <span class="prefix">H:</span>
            <input type="number" data-bind-prop="height" value="${Math.round(node.height)}" min="1" />
          </label>
        </div>

        <!-- Rotação Interativa do Elemento -->
        <div class="slider-group">
          <div class="row-between">
            <span class="prefix">Rotação / Ângulo</span>
            <span class="val-readout" id="lbl-rotation-val">${Math.round(node.rotation || 0)}°</span>
          </div>
          <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
            <input
              type="range"
              class="touch-slider"
              style="flex: 1;"
              data-bind-prop="rotation"
              min="0"
              max="360"
              step="1"
              value="${Math.round(node.rotation || 0)}"
            />
            <input
              type="number"
              class="mini-num"
              style="width: 56px;"
              data-bind-prop="rotation"
              min="0"
              max="360"
              value="${Math.round(node.rotation || 0)}"
            />
          </div>
          <div style="display: flex; gap: 4px; margin-top: 6px;">
            <button class="btn-rot-step" data-rot-step="-90" title="Girar 90° à esquerda" style="flex: 1; height: 22px; font-size: 11px; background: var(--bg-input); border: 1px solid var(--border-input); border-radius: 3px; color: var(--text-primary); cursor: pointer;">&#8634; -90&deg;</button>
            <button class="btn-rot-step" data-rot-step="90" title="Girar 90° à direita" style="flex: 1; height: 22px; font-size: 11px; background: var(--bg-input); border: 1px solid var(--border-input); border-radius: 3px; color: var(--text-primary); cursor: pointer;">&#8635; +90&deg;</button>
            <button class="btn-rot-reset" data-rot-reset="0" title="Redefinir para 0°" style="flex: 1; height: 22px; font-size: 11px; background: var(--bg-input); border: 1px solid var(--border-input); border-radius: 3px; color: var(--text-primary); cursor: pointer;">0&deg; Reset</button>
          </div>
        </div>

        <!-- Preenchimento (Fill) e Contorno (Stroke) com <cortex-color-picker> Moderno -->
        <div class="grid-2">
          <cortex-color-picker
            id="picker-fill"
            label="${t('inspector.fill')}:"
            value="${node.fill || '#10b981'}"
          ></cortex-color-picker>
          <cortex-color-picker
            id="picker-stroke"
            label="${t('inspector.stroke')}:"
            value="${node.stroke || '#18181b'}"
          ></cortex-color-picker>
        </div>

        <!-- Espessura da Borda (Slider + Valor em 60 FPS) -->
        <div class="slider-group">
          <div class="row-between">
            <span class="prefix">Stroke Width</span>
            <span class="val-readout" id="lbl-strokew-val">${node.strokeWidth ?? 1}px</span>
          </div>
          <input
            type="range"
            class="touch-slider"
            data-bind-prop="strokeWidth"
            min="0"
            max="32"
            step="0.5"
            value="${node.strokeWidth ?? 1.5}"
          />
        </div>

        <!-- Opacidade (Slider 0 a 1) -->
        <div class="slider-group">
          <div class="row-between">
            <span class="prefix">Opacity</span>
            <span class="val-readout" id="lbl-opacity-val">${Math.round((node.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            class="touch-slider"
            data-bind-prop="opacity"
            min="0.05"
            max="1"
            step="0.05"
            value="${node.opacity ?? 1}"
          />
        </div>

        ${
          node.type === 'rect'
            ? `
            <div class="slider-group">
              <div class="row-between">
                <span class="prefix">Corner Radius</span>
                <input
                  type="number"
                  class="mini-num"
                  data-bind-prop="cornerRadius"
                  min="0"
                  max="200"
                  value="${node.cornerRadius ?? 0}"
                />
              </div>
              <input
                type="range"
                class="touch-slider"
                data-bind-prop="cornerRadius"
                min="0"
                max="100"
                step="1"
                value="${node.cornerRadius ?? 0}"
              />
            </div>`
            : ''
        }

        ${
          node.type === 'text'
            ? `
            <div class="section-title" style="margin-top: 4px;">Typography &amp; Font</div>
            <label class="input-prefixed">
              <span class="prefix">Text:</span>
              <input type="text" data-bind-prop="text" value="${node.text || ''}" />
            </label>
            <cortex-font-picker id="picker-font"></cortex-font-picker>`
            : ''
        }

        ${
          node.type === 'polygon'
            ? `
            <div class="slider-group">
              <div class="row-between">
                <span class="prefix">Lados do Polígono</span>
                <span class="val-readout">${node.sides ?? 3} lados</span>
              </div>
              <input
                type="range"
                class="touch-slider"
                data-bind-prop="sides"
                min="3"
                max="12"
                step="1"
                value="${node.sides ?? 3}"
              />
            </div>`
            : ''
        }

        ${
          node.type === 'star'
            ? `
            <div class="slider-group">
              <div class="row-between">
                <span class="prefix">Pontas da Estrela</span>
                <span class="val-readout">${node.pointsCount ?? 5} pontas</span>
              </div>
              <input
                type="range"
                class="touch-slider"
                data-bind-prop="pointsCount"
                min="3"
                max="16"
                step="1"
                value="${node.pointsCount ?? 5}"
              />
            </div>`
            : ''
        }

        ${
          node.type === 'callout'
            ? `
            <label class="input-prefixed">
              <span class="prefix">Texto:</span>
              <input type="text" data-bind-prop="text" value="${node.text || 'Mensagem'}" />
            </label>`
            : ''
        }

        ${
          node.type === 'path'
            ? `
            <label class="checkbox-label">
              <input type="checkbox" data-bind-prop="closed" ${node.closed ? 'checked' : ''} />
              <span>Closed Vector Path</span>
            </label>`
            : ''
        }
      </div>
    `;
  }

  _renderDocumentPropertiesSection() {
    const preset = AppState.get('pagePreset');
    const w = AppState.get('pageWidthMm');
    const h = AppState.get('pageHeightMm');
    const orientation = AppState.get('orientation');
    const facing = AppState.get('facingPages');
    const showRulers = AppState.get('showRulers');
    const showGuides = AppState.get('showGuides');
    const showGrid = AppState.get('showGrid');

    return `
      <!-- Seção Document -->
      <div class="section-group">
        <div class="section-title">${t('inspector.document')}</div>
        <select class="select-control" id="preset-select">
          ${Object.keys(PAGE_PRESETS)
            .map(
              (key) => `<option value="${key}" ${key === preset ? 'selected' : ''}>${key}</option>`
            )
            .join('')}
        </select>

        <div class="grid-2">
          <label class="input-prefixed">
            <span class="prefix">W:</span>
            <input type="number" id="input-doc-w" value="${w}" step="1" />
            <span class="unit">mm</span>
          </label>
          <label class="input-prefixed">
            <span class="prefix">H:</span>
            <input type="number" id="input-doc-h" value="${h}" step="1" />
            <span class="unit">mm</span>
          </label>
        </div>

        <div class="row-between">
          <div class="icon-toggle-group">
            <button class="orient-btn ${orientation === 'portrait' ? 'active' : ''}" data-orient="portrait" title="Portrait">
              &#9645;
            </button>
            <button class="orient-btn ${orientation === 'landscape' ? 'active' : ''}" data-orient="landscape" title="Landscape">
              &#9645;
            </button>
          </div>

          <label class="checkbox-label">
            <input type="checkbox" id="chk-facing" ${facing ? 'checked' : ''} />
            <span>${t('inspector.facingPages')}</span>
          </label>
        </div>
      </div>

      <!-- Seção Margins -->
      <div class="section-group">
        <div class="section-title">${t('inspector.margins')}</div>
        <div class="grid-2">
          <label class="input-prefixed">
            <span class="prefix">&perp;</span>
            <input type="number" data-doc-margin="marginTopMm" value="${AppState.get('marginTopMm')}" step="0.5" />
            <span class="unit">mm</span>
          </label>
          <label class="input-prefixed">
            <span class="prefix">&#8868;</span>
            <input type="number" data-doc-margin="marginBottomMm" value="${AppState.get('marginBottomMm')}" step="0.5" />
            <span class="unit">mm</span>
          </label>
          <label class="input-prefixed">
            <span class="prefix">&#8866;</span>
            <input type="number" data-doc-margin="marginLeftMm" value="${AppState.get('marginLeftMm')}" step="0.5" />
            <span class="unit">mm</span>
          </label>
          <label class="input-prefixed">
            <span class="prefix">&#8867;</span>
            <input type="number" data-doc-margin="marginRightMm" value="${AppState.get('marginRightMm')}" step="0.5" />
            <span class="unit">mm</span>
          </label>
        </div>
      </div>

      <!-- Seção Rulers & Grids -->
      <div class="section-group">
        <div class="section-title">${t('inspector.rulersAndGrids')}</div>
        <div class="grid-3">
          <button class="pill-toggle ${showRulers ? 'active' : ''}" data-toggle="showRulers">
            <span>&#128207;</span> ${t('inspector.rulers')}
          </button>
          <button class="pill-toggle ${showGuides ? 'active' : ''}" data-toggle="showGuides">
            <span>&#9635;</span> ${t('inspector.guides')}
          </button>
          <button class="pill-toggle ${showGrid ? 'active' : ''}" data-toggle="showGrid">
            <span>&#9638;</span> ${t('inspector.grid')}
          </button>
        </div>
      </div>

      <!-- Seção Quick Actions -->
      <div class="section-group" style="border-bottom: none;">
        <div class="section-title">${t('inspector.quickActions')}</div>
        <button class="btn-primary" id="btn-add-rect">${t('inspector.addRect')}</button>
        <div class="grid-2">
          <button class="btn-secondary" id="btn-export-json">&#128190; ${t('inspector.exportJson')}</button>
          <button class="btn-secondary" id="btn-import-json">&#128193; ${t('inspector.importJson')}</button>
        </div>
      </div>
    `;
  }

  _renderPagesSection() {
    const currentPage = Number(AppState.get('currentPage')) || 1;
    const totalPages = Number(AppState.get('totalPages')) || 1;
    const allNodes = AppState.get('sceneNodes') || [];
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return `
      <div class="section-group">
        <div class="row-between">
          <span class="section-title">${t('inspector.pages')} (${totalPages})</span>
          <button class="btn-secondary" id="btn-add-page" style="padding: 0 8px; height: 22px;">
            ${t('inspector.addPage')}
          </button>
        </div>

        <div class="pages-grid">
          ${pages
            .map((p) => {
              const count = allNodes.filter((n) => Number(n.page || 1) === p).length;
              return `
              <div class="page-thumb ${p === currentPage ? 'active' : ''}" data-page-num="${p}">
                <div class="page-sheet-mini"></div>
                <span>${t('inspector.page')} ${p} (${count})</span>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  render() {
    const activeTab = AppState.get('activeInspectorTab');
    const collapsed = AppState.get('inspectorCollapsed');
    const selectedNode = AppState.get('selectedNode');
    this._lastRenderedNodeId = selectedNode ? selectedNode.id : null;

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: flex;
          height: 100%;
          background-color: var(--bg-panel);
          border-left: 1px solid var(--border-subtle);
          font-size: var(--text-xs);
          position: relative;
        }

        .inspector-body {
          width: var(--inspector-width);
          display: ${collapsed ? 'none' : 'flex'};
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        /* Cabeçalho de Abas (Properties | Pages | Layers) */
        .tabs-header {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          height: var(--tabbar-height);
          background-color: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .tab-btn {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          height: 100%;
          transition: color var(--transition-fast), background var(--transition-fast);
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-hover);
        }

        .tab-btn.active {
          color: var(--text-primary);
          border-bottom-color: var(--accent-blue);
          background-color: var(--bg-panel);
          font-weight: 500;
        }

        /* Layout Multi-Colunas para Telas Grandes (> 18" / >= 1600px) */
        .columns-wrapper {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .col-primary,
        .col-secondary {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .col-secondary {
          display: none;
          border-left: 1px solid var(--border-subtle);
        }

        @media (min-width: 1600px) {
          .inspector-body {
            width: 520px;
          }
          .tabs-header {
            display: none; /* Em monitores >18", mostra todas as abas simultaneamente */
          }
          .col-primary {
            display: flex !important;
          }
          .col-secondary {
            display: flex !important;
          }
        }

        .selection-banner {
          color: var(--text-secondary);
          font-weight: 600;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .highlight-box {
          background-color: rgba(20, 115, 230, 0.06);
          border: 1px solid rgba(20, 115, 230, 0.25);
          border-radius: var(--radius-sm);
          padding: 10px !important;
        }

        .badge-z {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          background: var(--bg-input);
          padding: 1px 5px;
          border-radius: var(--radius-xs);
        }

        .section-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .section-title {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 11px;
        }

        .select-control {
          width: 100%;
          height: 26px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          font-size: var(--text-xs);
          padding: 0 8px;
          outline: none;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;
        }

        .input-prefixed {
          display: flex;
          align-items: center;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          height: 25px;
          padding: 0 6px;
        }

        .input-prefixed:focus-within {
          border-color: var(--border-focus);
        }

        .prefix {
          color: var(--text-muted);
          font-size: 11px;
          margin-right: 4px;
          flex-shrink: 0;
        }

        .unit {
          color: var(--text-muted);
          font-size: 10px;
          margin-left: 2px;
        }

        .input-prefixed input {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 11px;
          outline: none;
        }

        .color-row {
          display: flex;
          align-items: center;
          gap: 4px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          height: 25px;
          padding: 0 5px;
        }

        .color-row input[type="color"] {
          width: 18px;
          height: 18px;
          border: none;
          padding: 0;
          background: transparent;
          cursor: pointer;
        }

        .hex-input {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 10px;
          outline: none;
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .touch-slider {
          width: 100%;
          accent-color: var(--accent-blue);
          cursor: pointer;
        }

        .val-readout {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-secondary);
        }

        .mini-num {
          width: 48px;
          height: 20px;
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          font-size: 10px;
          padding: 0 4px;
          text-align: right;
        }

        .row-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .icon-toggle-group {
          display: inline-flex;
          gap: 3px;
        }

        .orient-btn {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-xs);
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .orient-btn.active {
          border-color: var(--accent-blue);
          color: var(--accent-blue);
          background-color: var(--accent-blue-alpha);
        }

        .checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 11px;
        }

        .checkbox-label input {
          accent-color: var(--accent-blue);
        }

        .pill-toggle {
          height: 25px;
          border-radius: var(--radius-xs);
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .pill-toggle.active {
          background-color: var(--accent-blue-alpha);
          border-color: var(--accent-blue);
          color: var(--accent-text);
          font-weight: 600;
        }

        .btn-primary {
          width: 100%;
          height: 28px;
          background-color: var(--accent-blue);
          color: #ffffff;
          border-radius: var(--radius-sm);
          box-shadow: var(--btn-bevel-shadow);
          font-weight: 600;
          font-size: var(--text-xs);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-primary:hover {
          background-color: var(--accent-blue-hover);
        }

        .btn-secondary {
          height: 26px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          box-shadow: var(--btn-bevel-shadow);
          color: var(--text-primary);
          border-radius: var(--radius-xs);
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .btn-secondary:hover {
          background-color: var(--bg-hover);
        }

        /* Miniaturas de Páginas */
        .pages-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .page-thumb {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 8px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 10px;
          color: var(--text-secondary);
        }

        .page-thumb.active {
          border-color: var(--accent-blue);
          background-color: var(--accent-blue-alpha);
          color: var(--text-primary);
          font-weight: 600;
        }

        .page-sheet-mini {
          width: 34px;
          height: 46px;
          background-color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.3);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
        }

        /* Dock Rail Vertical à Extrema Direita */
        .dock-rail {
          width: var(--dock-rail-width);
          background-color: var(--bg-panel-header);
          border-left: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 0;
          gap: 6px;
        }

        .rail-btn {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-xs);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 13px;
        }

        .rail-btn:hover,
        .rail-btn.active {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        /* Gaveta Mobile (Right Drawer com Controles Táteis Maiores) */
        .mobile-drawer-pull {
          display: none;
        }

        @media (max-width: 768px) {
          :host {
            position: fixed;
            top: var(--menubar-height);
            right: 0;
            bottom: var(--statusbar-height);
            z-index: 350;
            transform: translateX(${this._mobileDrawerOpen ? '0%' : '100%'});
            transition: transform var(--transition-normal);
            box-shadow: var(--shadow-dropdown);
          }

          .inspector-body {
            display: flex !important;
            width: min(86vw, 320px);
          }

          .dock-rail {
            display: none;
          }

          .mobile-drawer-pull {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            left: -36px;
            top: 12px;
            width: 36px;
            height: 36px;
            background-color: var(--accent-blue);
            color: #ffffff;
            border-radius: var(--radius-md) 0 0 var(--radius-md);
            box-shadow: var(--shadow-dropdown);
            font-size: 16px;
          }

          /* Inputs e botões adaptados para o toque no Mobile */
          .input-prefixed,
          .color-row,
          .select-control,
          .pill-toggle,
          .btn-primary,
          .btn-secondary {
            height: 34px;
            font-size: 12px;
          }
        }
      </style>

      <!-- Puxador da Gaveta lateral em Dispositivos Móveis -->
      <button class="mobile-drawer-pull" id="btn-mobile-drawer" title="${t('inspector.toggleDrawer')}">
        &#9881;
      </button>

      <div class="inspector-body">
        <div class="tabs-header" role="tablist">
          <button class="tab-btn ${activeTab === 'properties' ? 'active' : ''}" data-tab="properties">${t('inspector.tabProperties')}</button>
          <button class="tab-btn ${activeTab === 'pages' ? 'active' : ''}" data-tab="pages">${t('inspector.tabPages')}</button>
          <button class="tab-btn ${activeTab === 'layers' ? 'active' : ''}" data-tab="layers">${t('layers.title')}</button>
        </div>

        <div class="columns-wrapper">
          <!-- Coluna 1: Em Laptops alterna conforme a aba; em Telas >18" exibe sempre Properties -->
          <div class="col-primary">
            ${
              activeTab === 'properties'
                ? `
                  ${this._renderObjectPropertiesSection(selectedNode)}
                  ${this._renderDocumentPropertiesSection()}
                `
                : activeTab === 'pages'
                ? this._renderPagesSection()
                : `<cortex-layers></cortex-layers>`
            }
            <slot></slot>
          </div>

          <!-- Coluna 2 (Exibida simultaneamente em Monitores Grandes >= 1600px) -->
          <div class="col-secondary">
            ${this._renderPagesSection()}
            <div class="section-title" style="margin-top: 4px;">${t('layers.title')}</div>
            <cortex-layers></cortex-layers>
          </div>
        </div>
      </div>

      <!-- Dock Rail Direita -->
      <aside class="dock-rail" aria-label="Docked Panels">
        <button class="rail-btn ${!collapsed && activeTab === 'pages' ? 'active' : ''}" data-rail="pages" title="Pages">&#128196;</button>
        <button class="rail-btn ${!collapsed && activeTab === 'layers' ? 'active' : ''}" data-rail="layers" title="Layers">&#128450;</button>
        <button class="rail-btn ${!collapsed && activeTab === 'properties' ? 'active' : ''}" data-rail="properties" title="Properties">&#127912;</button>
        <button class="rail-btn" data-rail="toggle" title="Collapse / Expand Dock">&#8596;</button>
      </aside>
    `;

    this._bindInspectorEvents(selectedNode);
  }

  _bindInspectorEvents(selectedNode) {
    // Puxador Mobile Drawer
    this.shadowRoot.getElementById('btn-mobile-drawer')?.addEventListener('click', () => {
      this._mobileDrawerOpen = !this._mobileDrawerOpen;
      this.render();
    });

    // Abas Superiores
    this.shadowRoot.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        AppState.setState({ activeInspectorTab: btn.dataset.tab });
      });
    });

    // Dock Rail
    this.shadowRoot.querySelectorAll('.rail-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.rail;
        if (target === 'toggle') {
          AppState.setState({ inspectorCollapsed: !AppState.get('inspectorCollapsed') });
        } else {
          const isSameTab =
            AppState.get('activeInspectorTab') === target && !AppState.get('inspectorCollapsed');
          AppState.setState({
            activeInspectorTab: target,
            inspectorCollapsed: isSameTab
          });
        }
      });
    });

    // Two-Way Data Binding Manual dos campos do objeto selecionado (60 FPS no 'input' + Histórico no 'change')
    if (selectedNode) {
      const fillPicker = this.shadowRoot.getElementById('picker-fill');
      fillPicker?.addEventListener('cortex-color-change', (e) => {
        this.emit('cortex-update-property', {
          id: selectedNode.id,
          prop: 'fill',
          value: e.detail.value,
          commitHistory: e.detail.commitHistory
        });
      });

      const strokePicker = this.shadowRoot.getElementById('picker-stroke');
      strokePicker?.addEventListener('cortex-color-change', (e) => {
        this.emit('cortex-update-property', {
          id: selectedNode.id,
          prop: 'stroke',
          value: e.detail.value,
          commitHistory: e.detail.commitHistory
        });
      });

      const fontPicker = this.shadowRoot.getElementById('picker-font');
      if (fontPicker) {
        fontPicker.typography = {
          fontFamily: selectedNode.fontFamily || 'Inter, Segoe UI, sans-serif',
          fontWeight: selectedNode.fontWeight || '600',
          fontStyle: selectedNode.fontStyle || 'normal',
          underline: Boolean(selectedNode.underline),
          fontSize: selectedNode.fontSize || 20,
          lineHeight: selectedNode.lineHeight || 1.3,
          textAlign: selectedNode.textAlign || 'left'
        };
        fontPicker.addEventListener('cortex-font-change', (e) => {
          this.emit('cortex-update-property', {
            id: selectedNode.id,
            prop: e.detail.prop,
            value: e.detail.value,
            commitHistory: e.detail.commitHistory
          });
        });
      }

      this.shadowRoot.querySelectorAll('[data-bind-prop]').forEach((input) => {
        const prop = input.dataset.bindProp;

        const dispatchPropUpdate = (commitHistory) => {
          let val = input.value;
          if (input.type === 'checkbox') {
            val = input.checked;
          } else if (input.type === 'number' || input.type === 'range') {
            val = Number(input.value);
          }

          this.emit('cortex-update-property', {
            id: selectedNode.id,
            prop,
            value: val,
            commitHistory
          });
        };

        input.addEventListener('input', () => dispatchPropUpdate(false));
        input.addEventListener('change', () => dispatchPropUpdate(true));
      });

      // Botões de Rotação Rápida (-90°, +90°, Reset 0°)
      this.shadowRoot.querySelectorAll('[data-rot-step]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const step = Number(btn.dataset.rotStep);
          let next = ((selectedNode.rotation || 0) + step) % 360;
          if (next < 0) next += 360;
          this.emit('cortex-update-property', {
            id: selectedNode.id,
            prop: 'rotation',
            value: Math.round(next),
            commitHistory: true
          });
        });
      });

      this.shadowRoot.querySelectorAll('[data-rot-reset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.emit('cortex-update-property', {
            id: selectedNode.id,
            prop: 'rotation',
            value: 0,
            commitHistory: true
          });
        });
      });
    }

    // Controles do Documento (Preset, Dimensões, Orientação, Margens, Réguas/Guias/Grade)
    const presetSelect = this.shadowRoot.getElementById('preset-select');
    presetSelect?.addEventListener('change', (e) => {
      const key = e.target.value;
      const dims = PAGE_PRESETS[key];
      if (dims) {
        AppState.setState({
          pagePreset: key,
          pageWidthMm: dims.w,
          pageHeightMm: dims.h
        });
      }
    });

    const inputDocW = this.shadowRoot.getElementById('input-doc-w');
    const inputDocH = this.shadowRoot.getElementById('input-doc-h');
    inputDocW?.addEventListener('change', (e) => {
      AppState.setState({ pageWidthMm: Math.max(20, Number(e.target.value) || 210) });
    });
    inputDocH?.addEventListener('change', (e) => {
      AppState.setState({ pageHeightMm: Math.max(20, Number(e.target.value) || 297) });
    });

    this.shadowRoot.querySelectorAll('[data-doc-margin]').forEach((input) => {
      input.addEventListener('change', (e) => {
        const key = input.dataset.docMargin;
        AppState.setState({ [key]: Math.max(0, Number(e.target.value) || 0) });
      });
    });

    this.shadowRoot.querySelectorAll('.orient-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextOrient = btn.dataset.orient;
        if (nextOrient !== AppState.get('orientation')) {
          AppState.setState({
            orientation: nextOrient,
            pageWidthMm: AppState.get('pageHeightMm'),
            pageHeightMm: AppState.get('pageWidthMm')
          });
        }
      });
    });

    this.shadowRoot.getElementById('chk-facing')?.addEventListener('change', (e) => {
      AppState.setState({ facingPages: e.target.checked });
    });

    this.shadowRoot.querySelectorAll('.pill-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prop = btn.dataset.toggle;
        AppState.setState({ [prop]: !AppState.get(prop) });
      });
    });

    // Páginas
    this.shadowRoot.getElementById('btn-add-page')?.addEventListener('click', () => {
      const nextTotal = (AppState.get('totalPages') || 1) + 1;
      AppState.setState({ totalPages: nextTotal, currentPage: nextTotal });
    });

    this.shadowRoot.querySelectorAll('.page-thumb').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const pageNum = Number(thumb.dataset.pageNum);
        AppState.setState({ currentPage: pageNum });
      });
    });

    // Quick Actions
    this.shadowRoot.getElementById('btn-add-rect')?.addEventListener('click', () => {
      this.emit('cortex-quick-action', { action: 'add-rect' });
    });

    this.shadowRoot.getElementById('btn-export-json')?.addEventListener('click', () => {
      this.emit('cortex-menu-action', { action: 'save-json' });
    });

    this.shadowRoot.getElementById('btn-import-json')?.addEventListener('click', () => {
      this.emit('cortex-menu-action', { action: 'open-json' });
    });
  }
}

customElements.define('cortex-inspector', CortexInspector);
