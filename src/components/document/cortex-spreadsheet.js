// src/components/document/cortex-spreadsheet.js
import { CortexElement } from '../../core/CortexElement.js';
import { CortexModal } from '../cortex-modal.js';

/**
 * Componente nativo de Document Management: Spreadsheet
 * Planilha completa estilo Excel / Office 365 com abas Ribbon, barra de fórmulas,
 * grid matricial interativo e dois gráficos vetoriais embutidos (Pie Chart e Horizontal Bar Chart)
 * Totalmente compatível com todos os temas do CortexUI e 100% nativo.
 */
export class CortexSpreadsheet extends CortexElement {
  constructor() {
    super();
    this._activeTab = 'home'; // 'home' | 'insert' | 'formulas' | 'data' | 'review' | 'view'
    this._activeCell = 'B4';
    this._editingCell = null;
    this._cellValue = '';
    this._selectedFont = 'Calibri';
    this._selectedSize = '11';
    this._isBold = false;
    this._isItalic = false;
    this._isUnderline = false;
    this._isStrikethrough = false;
    this._fillColor = '#ffff00'; // Amarelo padrão da imagem

    // Dimensões do grid
    this._cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
    this._totalRows = 24;

    // Dados das células (coordenada -> { value, style })
    this._data = {
      // Título 1
      'B2': { value: 'Portfolio Sectors', style: 'font-size: 16px; font-weight: bold; color: var(--text-primary);' },
      
      // Cabeçalho Setores
      'B4': { value: 'Sector', style: 'background: #2f5597; color: #ffffff; font-weight: bold; text-align: left;' },
      'C4': { value: 'Price by Sectors', style: 'background: #2f5597; color: #ffffff; font-weight: bold; text-align: right;' },

      // Dados dos Setores
      'B5': { value: 'Technology', style: 'text-align: left;' },
      'C5': { value: '$  5,212.35', style: 'text-align: right; font-family: monospace;' },
      'B6': { value: 'Energy', style: 'text-align: left;' },
      'C6': { value: '$  8,667.00', style: 'text-align: right; font-family: monospace;' },
      'B7': { value: 'Consumer Cyclical', style: 'text-align: left;' },
      'C7': { value: '$  9,084.41', style: 'text-align: right; font-family: monospace;' },
      'B8': { value: 'Industrials', style: 'text-align: left;' },
      'C8': { value: '$  4,780.84', style: 'text-align: right; font-family: monospace;' },
      'B9': { value: 'Consumer Defensive', style: 'text-align: left;' },
      'C9': { value: '$  6,438.00', style: 'text-align: right; font-family: monospace;' },
      'B10': { value: 'Financial Services', style: 'text-align: left;' },
      'C10': { value: '$  15,423.00', style: 'text-align: right; font-family: monospace;' },

      // Título 2
      'B13': { value: 'Top 10 of 12 Positions', style: 'font-size: 16px; font-weight: bold; color: var(--text-primary);' },

      // Cabeçalho Posições
      'B15': { value: 'Company Symbol', style: 'background: #2f5597; color: #ffffff; font-weight: bold; text-align: left;' },
      'C15': { value: 'Total', style: 'background: #2f5597; color: #ffffff; font-weight: bold; text-align: right;' },

      // Dados das Posições
      'B16': { value: 'NOK', style: 'text-align: left;' },
      'C16': { value: '$  173.50', style: 'text-align: right; font-family: monospace;' },
      'B17': { value: 'MGI', style: 'text-align: left;' },
      'C17': { value: '$  587.18', style: 'text-align: right; font-family: monospace;' },
      'B18': { value: 'GE', style: 'text-align: left;' },
      'C18': { value: '$  837.72', style: 'text-align: right; font-family: monospace;' },
      'B19': { value: 'BGSC', style: 'text-align: left;' },
      'C19': { value: '$  854.84', style: 'text-align: right; font-family: monospace;' },
      'B20': { value: 'JACK', style: 'text-align: left;' },
      'C20': { value: '$  1,716.66', style: 'text-align: right; font-family: monospace;' },
      'B21': { value: 'F', style: 'text-align: left;' },
      'C21': { value: '$  1,797.75', style: 'text-align: right; font-family: monospace;' }
    };
  }

  onMount() {
    this.watchState('theme', () => this.render());
  }

  // Gera o Gráfico de Pizza SVG nativo
  _renderPieChartSVG() {
    const sectors = [
      { name: 'Technology', val: 5212.35, color: '#4472c4' },
      { name: 'Energy', val: 8667.00, color: '#ed7d31' },
      { name: 'Consumer Cyclical', val: 9084.41, color: '#a5a5a5' },
      { name: 'Industrials', val: 4780.84, color: '#ffc000' },
      { name: 'Consumer Defensive', val: 6438.00, color: '#2f5597' },
      { name: 'Financial Services', val: 15423.00, color: '#70ad47' }
    ];

    const total = sectors.reduce((acc, s) => acc + s.val, 0);
    const cx = 110;
    const cy = 110;
    const r = 95;

    let currentAngle = -Math.PI / 2; // Começa no topo (12h)
    const slices = sectors.map(sec => {
      const sliceAngle = (sec.val / total) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(currentAngle);
      const y1 = cy + r * Math.sin(currentAngle);
      const x2 = cx + r * Math.cos(currentAngle + sliceAngle);
      const y2 = cy + r * Math.sin(currentAngle + sliceAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      currentAngle += sliceAngle;

      return `
        <path d="${pathData}" fill="${sec.color}" stroke="var(--bg-panel, #252526)" stroke-width="1.5" class="chart-slice" data-sector="${sec.name}" data-val="${sec.val.toFixed(2)}">
          <title>${sec.name}: $${sec.val.toLocaleString()} (${((sec.val/total)*100).toFixed(1)}%)</title>
        </path>
      `;
    }).join('');

    const legend = sectors.map(sec => `
      <div class="legend-item" title="${sec.name}: $${sec.val.toLocaleString()}">
        <span class="legend-swatch" style="background:${sec.color}"></span>
        <span class="legend-label">${sec.name}</span>
      </div>
    `).join('');

    return `
      <div class="embedded-chart pie-chart-widget">
        <div class="chart-content-row">
          <svg class="pie-svg" viewBox="0 0 220 220" width="200" height="200">
            ${slices}
          </svg>
          <div class="chart-legend">
            ${legend}
          </div>
        </div>
      </div>
    `;
  }

  // Gera o Gráfico de Barras Horizontais SVG nativo
  _renderBarChartSVG() {
    const bars = [
      { name: 'LNCO', val: 3400 },
      { name: '', val: 2100 },
      { name: 'SBUX', val: 1700 },
      { name: '', val: 1400 },
      { name: 'R', val: 900 },
      { name: '', val: 750 },
      { name: 'JACK', val: 700 },
      { name: '', val: 400 },
      { name: 'GE', val: 400 },
      { name: '', val: 320 }
    ];

    const maxVal = 3600;
    const svgWidth = 320;
    const svgHeight = 160;
    const barHeight = 7.5;
    const gap = 8;
    const startY = 15;
    const leftMargin = 55;

    // Gridlines verticais
    const gridLines = [0, 1000, 2000, 3000].map(v => {
      const x = leftMargin + (v / maxVal) * (svgWidth - leftMargin - 20);
      return `
        <line x1="${x}" y1="10" x2="${x}" y2="${svgHeight - 15}" stroke="var(--border-subtle, #333337)" stroke-width="1"/>
      `;
    }).join('');

    const barElements = bars.map((b, idx) => {
      const y = startY + idx * (barHeight + gap);
      const w = (b.val / maxVal) * (svgWidth - leftMargin - 20);
      return `
        ${b.name ? `<text x="${leftMargin - 8}" y="${y + barHeight - 1}" font-size="9" fill="var(--text-secondary, #a1a1aa)" text-anchor="end" font-weight="600">${b.name}</text>` : ''}
        <rect x="${leftMargin}" y="${y}" width="${w}" height="${barHeight}" rx="1.5" fill="var(--accent-blue, #4472c4)" class="chart-bar">
          <title>${b.name || 'Pos'}: $${b.val}</title>
        </rect>
      `;
    }).join('');

    return `
      <div class="embedded-chart bar-chart-widget">
        <div class="bar-chart-title">Total</div>
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="150">
          ${gridLines}
          <line x1="${leftMargin}" y1="10" x2="${leftMargin}" y2="${svgHeight - 15}" stroke="var(--border-input, #3c3c42)" stroke-width="1.5"/>
          <line x1="${leftMargin}" y1="${svgHeight - 15}" x2="${svgWidth - 20}" y2="${svgHeight - 15}" stroke="var(--border-input, #3c3c42)" stroke-width="1.5"/>
          ${barElements}
        </svg>
      </div>
    `;
  }

  // Exportação nativa CSV
  exportCSV() {
    let csv = '';
    for (let r = 1; r <= this._totalRows; r++) {
      const rowVals = this._cols.map(c => {
        const val = this._data[`${c}${r}`]?.value || '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csv += rowVals.join(',') + '\r\n';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Spreadsheet_Portfolio.csv';
    a.click();
    URL.revokeObjectURL(url);
    CortexModal.toast('Planilha exportada em CSV com sucesso!', 'success');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          background: var(--bg-app, #18181b);
          color: var(--text-primary, #e4e4e7);
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
          overflow: hidden;
          box-sizing: border-box;
        }

        /* Abas Ribbon Superiores (Home, Insert, Formulas...) */
        .ribbon-tabs-bar {
          display: flex;
          align-items: center;
          background: var(--bg-panel-header, #1f1f22);
          border-bottom: 1px solid var(--border-subtle, #333337);
          padding: 0 12px;
          height: 34px;
          user-select: none;
        }

        .tab-btn {
          background: transparent;
          border: none;
          padding: 0 14px;
          height: 100%;
          font-size: var(--text-xs, 12.5px);
          font-weight: 500;
          color: var(--text-secondary, #a1a1aa);
          cursor: pointer;
          position: relative;
          transition: color 0.15s ease;
        }

        .tab-btn:hover {
          color: var(--text-primary, #e4e4e7);
        }

        .tab-btn.active {
          color: var(--accent-text, #60a5fa);
          font-weight: 600;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 8px;
          right: 8px;
          height: 2.5px;
          background: var(--accent-blue, #1473e6);
          border-radius: 2px 2px 0 0;
        }

        /* Toolbar Ribbon (Ferramentas de Formatação) */
        .ribbon-toolbar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: var(--bg-panel, #252526);
          border-bottom: 1px solid var(--border-subtle, #333337);
          flex-wrap: wrap;
          user-select: none;
        }

        .tool-btn {
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-xs, 3px);
          padding: 4px 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary, #e4e4e7);
          cursor: pointer;
          font-size: 13px;
          min-width: 26px;
          height: 26px;
          box-sizing: border-box;
          transition: background 0.12s ease;
        }

        .tool-btn:hover {
          background: var(--bg-hover, #37373d);
          border-color: var(--border-subtle, #333337);
        }

        .tool-btn.active {
          background: var(--accent-blue-alpha, rgba(20, 115, 230, 0.22));
          border-color: var(--accent-blue, #1473e6);
          color: var(--accent-text, #60a5fa);
          font-weight: bold;
        }

        .tool-divider {
          width: 1px;
          height: 18px;
          background: var(--border-subtle, #333337);
          margin: 0 4px;
        }

        .select-font {
          height: 26px;
          border: 1px solid var(--border-input, #3c3c42);
          border-radius: var(--radius-xs, 3px);
          padding: 0 6px;
          font-size: var(--text-xs, 12px);
          color: var(--text-primary, #e4e4e7);
          background: var(--bg-input, #1b1b1d);
          outline: none;
        }

        /* Barra de Fórmulas */
        .formula-bar-container {
          display: flex;
          align-items: center;
          background: var(--bg-panel, #252526);
          border-bottom: 1px solid var(--border-subtle, #333337);
          padding: 4px 10px;
          gap: 8px;
          height: 30px;
          font-size: 12px;
        }

        .name-box {
          width: 58px;
          height: 22px;
          border: 1px solid var(--border-input, #3c3c42);
          border-radius: 2px;
          background: var(--bg-input, #1b1b1d);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-family: var(--font-mono, monospace);
          color: var(--text-primary, #e4e4e7);
        }

        .fx-icon {
          color: var(--text-secondary, #a1a1aa);
          font-style: italic;
          font-weight: 800;
          font-family: serif;
          font-size: 14px;
          user-select: none;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .fx-icon:hover {
          background: var(--bg-hover, #37373d);
          color: var(--accent-text, #60a5fa);
        }

        .formula-input {
          flex: 1;
          height: 22px;
          border: none;
          outline: none;
          font-size: 13px;
          color: var(--text-primary, #e4e4e7);
          padding: 0 4px;
          background: transparent;
        }

        /* Grade da Planilha (Grid) */
        .spreadsheet-workspace {
          flex: 1;
          display: flex;
          position: relative;
          overflow: auto;
          background: var(--bg-app, #18181b);
        }

        .sheet-table {
          border-collapse: collapse;
          table-layout: fixed;
          user-select: none;
        }

        .corner-cell {
          width: 38px;
          min-width: 38px;
          background: var(--bg-panel-header, #1f1f22);
          border: 1px solid var(--border-subtle, #333337);
          position: sticky;
          top: 0;
          left: 0;
          z-index: 20;
        }

        .col-header {
          background: var(--bg-panel-header, #1f1f22);
          color: var(--text-secondary, #a1a1aa);
          font-size: 11.5px;
          font-weight: 600;
          text-align: center;
          height: 24px;
          border: 1px solid var(--border-subtle, #333337);
          position: sticky;
          top: 0;
          z-index: 10;
          min-width: 90px;
        }

        .row-header {
          background: var(--bg-panel-header, #1f1f22);
          color: var(--text-secondary, #a1a1aa);
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          width: 38px;
          min-width: 38px;
          border: 1px solid var(--border-subtle, #333337);
          position: sticky;
          left: 0;
          z-index: 10;
        }

        .grid-cell {
          border: 1px solid var(--border-subtle, #333337);
          padding: 3px 6px;
          font-size: 12.5px;
          color: var(--text-primary, #e4e4e7);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 22px;
          box-sizing: border-box;
          cursor: cell;
          position: relative;
        }

        .grid-cell.selected {
          outline: 2px solid var(--accent-blue, #1473e6);
          outline-offset: -1px;
          z-index: 2;
          background: var(--accent-blue-alpha, rgba(20, 115, 230, 0.16));
        }

        .grid-cell.selected::after {
          content: '';
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 5px;
          height: 5px;
          background: var(--accent-blue, #1473e6);
          border: 1px solid var(--bg-app, #18181b);
        }

        .cell-editor {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 2px solid var(--accent-blue, #1473e6);
          padding: 2px 4px;
          font-size: 12.5px;
          outline: none;
          background: var(--bg-input, #1b1b1d);
          color: var(--text-primary, #e4e4e7);
          z-index: 5;
          box-sizing: border-box;
        }

        /* Gráficos Embutidos Flutuantes */
        .embedded-chart {
          position: absolute;
          background: var(--bg-panel, #252526);
          border: 1px solid var(--border-subtle, #333337);
          border-radius: var(--radius-md, 6px);
          box-shadow: var(--shadow-dropdown, 0 8px 24px rgba(0,0,0,0.3));
          z-index: 8;
          padding: 10px;
          box-sizing: border-box;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }

        .embedded-chart:hover {
          box-shadow: 0 10px 28px rgba(0,0,0,0.45);
          border-color: var(--border-focus, #1473e6);
        }

        .pie-chart-widget {
          top: 35px;
          left: 360px;
          width: 380px;
          height: 230px;
        }

        .chart-content-row {
          display: flex;
          align-items: center;
          gap: 14px;
          height: 100%;
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 11px;
          color: var(--text-secondary, #a1a1aa);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-swatch {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .bar-chart-widget {
          top: 290px;
          left: 360px;
          width: 380px;
          height: 200px;
        }

        .bar-chart-title {
          font-size: 12px;
          font-weight: 700;
          text-align: center;
          color: var(--text-primary, #e4e4e7);
          margin-bottom: 4px;
        }

        .chart-slice {
          transition: transform 0.15s ease, opacity 0.15s ease;
          cursor: pointer;
        }
        .chart-slice:hover {
          opacity: 0.88;
        }

        .chart-bar {
          transition: opacity 0.15s ease;
          cursor: pointer;
        }
        .chart-bar:hover {
          opacity: 0.82;
        }
      </style>

      <!-- Abas Ribbon -->
      <div class="ribbon-tabs-bar">
        <button class="tab-btn ${this._activeTab === 'home' ? 'active' : ''}" data-tab="home">Home</button>
        <button class="tab-btn ${this._activeTab === 'insert' ? 'active' : ''}" data-tab="insert">Insert</button>
        <button class="tab-btn ${this._activeTab === 'formulas' ? 'active' : ''}" data-tab="formulas">Formulas</button>
        <button class="tab-btn ${this._activeTab === 'data' ? 'active' : ''}" data-tab="data">Data</button>
        <button class="tab-btn ${this._activeTab === 'review' ? 'active' : ''}" data-tab="review">Review</button>
        <button class="tab-btn ${this._activeTab === 'view' ? 'active' : ''}" data-tab="view">View</button>
      </div>

      <!-- Barra de Ferramentas Ribbon -->
      <div class="ribbon-toolbar">
        <button class="tool-btn" data-act="undo" title="Desfazer (Ctrl+Z)">&#8630;</button>
        <button class="tool-btn" data-act="redo" title="Refazer (Ctrl+Y)">&#8631;</button>
        <button class="tool-btn" data-act="print" title="Imprimir">&#128424;</button>
        <div class="tool-divider"></div>
        <button class="tool-btn" data-act="cut" title="Recortar">&#9986;</button>
        <button class="tool-btn" data-act="copy" title="Copiar">&#128203;</button>
        <div class="tool-divider"></div>

        <select class="select-font" id="font-family">
          <option value="Calibri" selected>Calibri</option>
          <option value="Arial">Arial</option>
          <option value="Segoe UI">Segoe UI</option>
          <option value="Inter">Inter</option>
        </select>

        <select class="select-font" id="font-size" style="width: 46px;">
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11" selected>11</option>
          <option value="12">12</option>
          <option value="14">14</option>
          <option value="16">16</option>
        </select>

        <button class="tool-btn ${this._isBold ? 'active' : ''}" data-act="bold" title="Negrito"><b>B</b></button>
        <button class="tool-btn ${this._isItalic ? 'active' : ''}" data-act="italic" title="Itálico"><i>I</i></button>
        <button class="tool-btn ${this._isUnderline ? 'active' : ''}" data-act="underline" title="Sublinhado"><u>U</u></button>
        <button class="tool-btn ${this._isStrikethrough ? 'active' : ''}" data-act="strike" title="Tachado"><s>S</s></button>
        <div class="tool-divider"></div>

        <!-- Preenchimento Amarelo (Conforme a imagem) -->
        <button class="tool-btn" data-act="fill-color" title="Cor de Preenchimento" style="display:flex;gap:3px;align-items:center;">
          &#127912;
          <span style="display:inline-block;width:12px;height:12px;background:${this._fillColor};border:1px solid #999;"></span>
        </button>
        <div class="tool-divider"></div>

        <button class="tool-btn" data-act="export-csv" title="Exportar CSV">&#128190; CSV</button>
      </div>

      <!-- Barra de Fórmulas -->
      <div class="formula-bar-container">
        <div class="name-box" id="cell-address">${this._activeCell}</div>
        <div class="fx-icon" title="Assistente de Funções Matemáticas">fx</div>
        <input class="formula-input" id="formula-input" value="${this._data[this._activeCell]?.value || ''}" placeholder="Digite um valor ou fórmula..." />
      </div>

      <!-- Workspace com Grid e Gráficos -->
      <div class="spreadsheet-workspace" id="workspace">
        <table class="sheet-table">
          <thead>
            <tr>
              <th class="corner-cell"></th>
              ${this._cols.map(c => `<th class="col-header">${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: this._totalRows }, (_, rIdx) => {
              const rowNum = rIdx + 1;
              return `
                <tr>
                  <td class="row-header">${rowNum}</td>
                  ${this._cols.map(c => {
                    const coord = `${c}${rowNum}`;
                    const cell = this._data[coord];
                    const isSelected = this._activeCell === coord;
                    return `
                      <td class="grid-cell ${isSelected ? 'selected' : ''}" data-coord="${coord}" style="${cell?.style || ''}">
                        ${cell?.value || ''}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Gráficos Embutidos -->
        ${this._renderPieChartSVG()}
        ${this._renderBarChartSVG()}
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const root = this.shadowRoot;

    // Clique nas abas
    root.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeTab = btn.dataset.tab;
        this.render();
      });
    });

    // Seleção de Células
    root.querySelectorAll('.grid-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        this._activeCell = cell.dataset.coord;
        const input = root.querySelector('#formula-input');
        const addr = root.querySelector('#cell-address');
        if (addr) addr.textContent = this._activeCell;
        if (input) input.value = this._data[this._activeCell]?.value || '';

        root.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
      });

      // Duplo clique para edição rápida
      cell.addEventListener('dblclick', () => {
        const coord = cell.dataset.coord;
        const currentVal = this._data[coord]?.value || '';
        const editor = document.createElement('input');
        editor.className = 'cell-editor';
        editor.value = currentVal;
        cell.appendChild(editor);
        editor.focus();

        const commit = () => {
          this._data[coord] = { ...(this._data[coord] || {}), value: editor.value };
          if (editor.parentElement) editor.remove();
          this.render();
        };

        editor.addEventListener('blur', commit);
        editor.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            if (editor.parentElement) editor.remove();
          }
        });
      });
    });

    // Atualização da Fórmula
    const formulaInput = root.querySelector('#formula-input');
    if (formulaInput) {
      formulaInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (!this._data[this._activeCell]) this._data[this._activeCell] = {};
        this._data[this._activeCell].value = val;

        const cellEl = root.querySelector(`.grid-cell[data-coord="${this._activeCell}"]`);
        if (cellEl) cellEl.textContent = val;
      });
    }

    // Assistente de Função fx via CortexModal
    root.querySelector('.fx-icon')?.addEventListener('click', async () => {
      const func = await CortexModal.prompt({
        title: 'Inserir Função (Formula Wizard)',
        message: `Insira uma fórmula ou função para a célula ${this._activeCell}:\nExemplos: =SUM(C5:C10) | =AVERAGE(C5:C10) | =MAX(C5:C10)`,
        defaultValue: '=SUM(C5:C10)',
        placeholder: '=SUM(...)',
        confirmText: 'Inserir Fórmula',
        cancelText: 'Cancelar'
      });
      if (func && func.trim()) {
        if (!this._data[this._activeCell]) this._data[this._activeCell] = {};
        this._data[this._activeCell].value = func.trim();
        this.render();
        CortexModal.toast(`Fórmula aplicada na célula ${this._activeCell}`, 'success');
      }
    });

    // Ações de formatação
    root.querySelector('[data-act="bold"]')?.addEventListener('click', () => {
      this._isBold = !this._isBold;
      if (this._data[this._activeCell]) {
        this._data[this._activeCell].style = (this._data[this._activeCell].style || '') + (this._isBold ? '; font-weight: bold;' : '; font-weight: normal;');
      }
      this.render();
    });

    root.querySelector('[data-act="fill-color"]')?.addEventListener('click', () => {
      if (!this._data[this._activeCell]) this._data[this._activeCell] = {};
      this._data[this._activeCell].style = (this._data[this._activeCell].style || '') + `; background: ${this._fillColor};`;
      this.render();
    });

    root.querySelector('[data-act="print"]')?.addEventListener('click', () => {
      window.print();
    });

    root.querySelector('[data-act="export-csv"]')?.addEventListener('click', () => {
      this.exportCSV();
    });
  }
}

customElements.define('cortex-spreadsheet', CortexSpreadsheet);
