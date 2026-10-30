// src/components/document/cortex-file-uploader.js
import { CortexElement } from '../../core/CortexElement.js';
import { CortexModal } from '../cortex-modal.js';

/**
 * Componente nativo de Document Management: File Uploader
 * Upload moderno com área Drag & Drop tracejada, botão "Select Files...", aviso de limite de 15 MB,
 * botão "Remove All", lista de arquivos enviados com status "Uploaded" e barra de progresso
 * animada em tempo real com botão de cancelamento individual.
 * Totalmente compatível com todos os temas do CortexUI e 100% nativo.
 */
export class CortexFileUploader extends CortexElement {
  constructor() {
    super();
    this._isDraggingOver = false;
    this._files = [
      {
        id: 'up-1',
        name: 'Photo.png',
        size: '320 KB',
        bytes: 320 * 1024,
        progress: 100,
        status: 'Uploaded', // 'Uploading' | 'Uploaded' | 'Error'
        animating: false
      },
      {
        id: 'up-2',
        name: 'Portfolio.pdf',
        size: '2.4 MB',
        bytes: 2.4 * 1024 * 1024,
        progress: 68, // Exatamente 68% como na imagem 5
        status: 'Uploading',
        animating: true
      }
    ];

    this._startSimulatedUploads();
  }

  onMount() {
    this.watchState('theme', () => this.render());
  }

  // Simula o progresso realista de upload para itens ativos
  _startSimulatedUploads() {
    this._interval = setInterval(() => {
      let changed = false;
      this._files.forEach(f => {
        if (f.status === 'Uploading' && f.progress < 100) {
          f.progress = Math.min(100, f.progress + Math.floor(Math.random() * 4 + 2));
          if (f.progress >= 100) {
            f.status = 'Uploaded';
            f.animating = false;
          }
          changed = true;
        }
      });
      if (changed) {
        this._updateProgressDOM();
      }
    }, 400);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._interval) clearInterval(this._interval);
  }

  // Atualiza apenas os elementos de progresso no DOM para alta performance
  _updateProgressDOM() {
    const root = this.shadowRoot;
    if (!root) return;

    this._files.forEach(f => {
      const row = root.querySelector(`.upload-item[data-file-id="${f.id}"]`);
      if (row) {
        const bar = row.querySelector('.progress-fill');
        const pct = row.querySelector('.pct-text');
        const statusEl = row.querySelector('.file-status-sub');
        if (bar) bar.style.width = `${f.progress}%`;
        if (pct) pct.textContent = `${f.progress}%`;

        if (f.status === 'Uploaded' && statusEl && !statusEl.classList.contains('uploaded')) {
          statusEl.textContent = 'Uploaded';
          statusEl.classList.add('uploaded');
          const cancelBtn = row.querySelector('.btn-cancel-upload');
          if (cancelBtn) cancelBtn.style.display = 'none';
        }
      }
    });
  }

  _formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async _addFiles(fileList) {
    const MAX_SIZE = 15 * 1024 * 1024; // 15 MB
    let addedCount = 0;

    for (const f of Array.from(fileList)) {
      if (f.size > MAX_SIZE) {
        await CortexModal.alert({
          title: 'Limite de Arquivo Excedido',
          message: `O arquivo "${f.name}" (${this._formatBytes(f.size)}) excede o tamanho máximo permitido de 15 MB por arquivo.`,
          type: 'warning'
        });
        continue;
      }

      this._files.push({
        id: `up-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: f.name,
        size: this._formatBytes(f.size),
        bytes: f.size,
        progress: 5,
        status: 'Uploading',
        animating: true
      });
      addedCount++;
    }

    if (addedCount > 0) {
      this.render();
      CortexModal.toast(`${addedCount} arquivo(s) adicionado(s) para upload!`, 'success');
    }
  }

  _removeFile(fileId) {
    this._files = this._files.filter(f => f.id !== fileId);
    this.render();
  }

  async _removeAll() {
    if (this._files.length === 0) return;

    const confirmed = await CortexModal.confirm({
      title: 'Limpar Fila de Upload',
      message: `Deseja realmente remover todos os ${this._files.length} arquivos da lista de upload?`,
      confirmText: 'Remover Todos',
      cancelText: 'Cancelar',
      danger: true
    });

    if (confirmed) {
      this._files = [];
      this.render();
      CortexModal.toast('Todos os arquivos foram removidos da lista.', 'info');
    }
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
          overflow: auto;
          box-sizing: border-box;
          padding: 24px;
        }

        .uploader-card {
          max-width: 820px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Área Tracejada Drag & Drop */
        .dropzone-box {
          border: 1.5px dashed var(--border-input, #3c3c42);
          border-radius: var(--radius-md, 8px);
          padding: 44px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: var(--bg-panel, #252526);
          transition: all 0.2s ease;
          user-select: none;
        }

        .dropzone-box.drag-over {
          border-color: var(--accent-blue, #1473e6);
          background: var(--accent-blue-alpha, rgba(20, 115, 230, 0.15));
          transform: scale(1.008);
        }

        .upload-icon-symbol {
          width: 48px;
          height: 48px;
          color: var(--text-secondary, #a1a1aa);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropzone-title {
          font-size: var(--text-base, 15px);
          font-weight: 600;
          color: var(--text-primary, #e4e4e7);
          margin: 0;
        }

        .dropzone-or {
          font-size: 13px;
          color: var(--text-muted, #71717a);
          margin: -4px 0;
        }

        .btn-select-files {
          background: var(--accent-blue, #1473e6);
          color: #ffffff;
          border: none;
          border-radius: var(--radius-sm, 4px);
          padding: 8px 20px;
          font-size: var(--text-xs, 13px);
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        }

        .btn-select-files:hover {
          background: var(--accent-blue-hover, #0d66d0);
          transform: translateY(-1px);
        }

        /* Barra de Informações e Botão Remove All */
        .uploader-meta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
          font-size: var(--text-xs, 12.5px);
          color: var(--text-secondary, #a1a1aa);
          border-bottom: 1px solid var(--border-subtle, #333337);
          padding-bottom: 16px;
        }

        .btn-remove-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-panel, #252526);
          border: 1px solid var(--border-subtle, #333337);
          border-radius: var(--radius-sm, 4px);
          padding: 6px 14px;
          font-size: var(--text-xs, 12px);
          font-weight: 500;
          color: var(--text-secondary, #a1a1aa);
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .btn-remove-all:hover {
          background: rgba(239, 68, 68, 0.14);
          color: var(--status-error, #ef4444);
          border-color: var(--status-error, #ef4444);
        }

        /* Lista de Arquivos */
        .uploads-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .upload-item {
          background: var(--bg-panel, #252526);
          border: 1px solid var(--border-subtle, #333337);
          border-radius: var(--radius-sm, 4px);
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .upload-item:hover {
          border-color: var(--border-focus, #1473e6);
          background: var(--bg-hover, #37373d);
        }

        .upload-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .item-info-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-cancel-upload {
          background: transparent;
          border: none;
          color: var(--text-muted, #71717a);
          font-size: 14px;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: var(--radius-xs, 2px);
          line-height: 1;
        }
        .btn-cancel-upload:hover {
          color: var(--status-error, #ef4444);
          background: var(--bg-hover, #37373d);
        }

        .file-name {
          font-size: var(--text-xs, 13px);
          font-weight: 600;
          color: var(--text-primary, #e4e4e7);
        }

        .file-status-sub {
          font-size: 11px;
          color: var(--text-muted, #71717a);
          margin-top: 1px;
        }
        .file-status-sub.uploaded {
          color: var(--status-ok, #22c55e);
          font-weight: 500;
        }

        .item-info-right {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: var(--text-xs, 12px);
          color: var(--text-secondary, #a1a1aa);
        }

        .pct-text {
          font-weight: 600;
          color: var(--text-primary, #e4e4e7);
          font-family: var(--font-mono, monospace);
        }

        /* Barra de Progresso */
        .progress-track {
          width: 100%;
          height: 3.5px;
          background: var(--bg-input, #1b1b1d);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent-blue, #1473e6);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      </style>

      <div class="uploader-card">
        <!-- Zona Tracejada de Drag and Drop -->
        <div class="dropzone-box" id="dropzone">
          <div class="upload-icon-symbol">
            <!-- Ícone estilizado com barra no topo e seta para cima -->
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <line x1="4" y1="4" x2="20" y2="4" stroke-width="2.2"/>
              <polyline points="16 11 12 7 8 11" stroke-width="2"/>
              <line x1="12" y1="7" x2="12" y2="20" stroke-width="2"/>
            </svg>
          </div>
          <h3 class="dropzone-title">Drag and Drop Files Here</h3>
          <span class="dropzone-or">or</span>
          <button class="btn-select-files" id="btn-select">
            Select Files...
          </button>
          <input type="file" id="file-input-hidden" multiple style="display: none;" />
        </div>

        <!-- Barra Informativa -->
        <div class="uploader-meta-bar">
          <span>Uploads are limited to a single file up to 15 MB.</span>
          <button class="btn-remove-all" id="btn-remove-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Remove All
          </button>
        </div>

        <!-- Lista de Arquivos -->
        <div class="uploads-list">
          ${this._files.map(file => {
            const isCompleted = file.status === 'Uploaded';
            return `
              <div class="upload-item" data-file-id="${file.id}">
                <div class="upload-item-header">
                  <div class="item-info-left">
                    ${!isCompleted ? `
                      <button class="btn-cancel-upload" data-cancel-id="${file.id}" title="Cancelar">&times;</button>
                    ` : ''}
                    <div>
                      <div class="file-name">${file.name}</div>
                      <div class="file-status-sub ${isCompleted ? 'uploaded' : ''}">${file.status}</div>
                    </div>
                  </div>

                  <div class="item-info-right">
                    <span>${file.size}</span>
                    ${!isCompleted ? `<span class="pct-text">${file.progress}%</span>` : ''}
                    ${isCompleted ? `
                      <button class="btn-cancel-upload" data-cancel-id="${file.id}" title="Remover da lista">&times;</button>
                    ` : ''}
                  </div>
                </div>

                ${!isCompleted ? `
                  <div class="progress-track">
                    <div class="progress-fill" style="width: ${file.progress}%;"></div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const root = this.shadowRoot;
    const dropzone = root.querySelector('#dropzone');
    const hiddenInput = root.querySelector('#file-input-hidden');
    const selectBtn = root.querySelector('#btn-select');
    const removeAllBtn = root.querySelector('#btn-remove-all');

    // Botão Selecionar Arquivos
    selectBtn?.addEventListener('click', () => hiddenInput?.click());
    hiddenInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this._addFiles(e.target.files);
        hiddenInput.value = '';
      }
    });

    // Remove All
    removeAllBtn?.addEventListener('click', () => this._removeAll());

    // Remoção individual
    root.querySelectorAll('[data-cancel-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._removeFile(btn.dataset.cancelId);
      });
    });

    // Drag & Drop nativo
    if (dropzone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('drag-over');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
          this._addFiles(dt.files);
        }
      });
    }
  }
}

customElements.define('cortex-file-uploader', CortexFileUploader);
