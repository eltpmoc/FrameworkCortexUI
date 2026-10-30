// src/components/document/cortex-file-manager.js
import { CortexElement } from '../../core/CortexElement.js';
import { CortexModal } from '../cortex-modal.js';

/**
 * Componente nativo de Document Management: File Manager
 * Gerenciador de arquivos completo com árvore hierárquica lateral (Files > Cities, Contact, Widescreen...),
 * barra de ferramentas (+ New directory, Upload files, Refresh, Grid/List toggle),
 * tabela de arquivos com seleção múltipla e menu de contexto funcional (Rename, Move to, Copy to, Delete, Download).
 * 100% nativo, sem bibliotecas externas.
 */
export class CortexFileManager extends CortexElement {
  constructor() {
    super();
    this._viewMode = 'list'; // 'list' | 'grid'
    this._activeFolder = 'Widescreen';
    this._selectedFileIds = new Set(['file-2']); // swimmer-underwater.jpg selecionado por padrão como na imagem
    this._contextMenu = {
      visible: true, // Aberto por padrão sobre o item selecionado como na imagem 4
      targetFileId: 'file-2',
      x: 520,
      y: 140
    };

    // Árvore de Diretórios
    this._folders = [
      { id: 'cities', name: 'Cities', hasChildren: true },
      { id: 'contact', name: 'Contact', hasChildren: false },
      { id: 'landscapes', name: 'Landscapes', hasChildren: false },
      { id: 'portraits', name: 'Portraits', hasChildren: false },
      { id: 'widescreen', name: 'Widescreen', hasChildren: false }
    ];

    // Arquivos no diretório Widescreen (exatamente como na Imagem 4)
    this._files = [
      { id: 'file-1', name: 'man-climbing-on-limestone-wall.jpg', size: '34.3 kb', type: 'image', folder: 'Widescreen' },
      { id: 'file-2', name: 'swimmer-underwater.jpg', size: '51.8 kb', type: 'image', folder: 'Widescreen' },
      { id: 'file-3', name: 'typing-male-hands.jpg', size: '31.2 kb', type: 'image', folder: 'Widescreen' },
      { id: 'file-4', name: 'woman-using-laptop.jpg', size: '23.8 kb', type: 'image', folder: 'Widescreen' },
      { id: 'file-5', name: 'woman-using-notebook.jpg', size: '45.2 kb', type: 'image', folder: 'Widescreen' },
      { id: 'file-6', name: 'Alfredo_Gomez.jpg', size: '30.9 kb', type: 'image', folder: 'Widescreen' },
      { id: 'file-7', name: 'Connor_Jenkins.jpg', size: '7.5 kb', type: 'image', folder: 'Widescreen' },
      { id: 'file-8', name: 'Destiny_Clark.jpg', size: '12.2 kb', type: 'image', folder: 'Widescreen' },
      { id: 'file-9', name: 'Gary_Rubio.jpg', size: '9.1 kb', type: 'image', folder: 'Widescreen' }
    ];
  }

  _newDirectory() {
    const name = window.prompt('Digite o nome do novo diretório:', 'New Folder');
    if (name && name.trim()) {
      const cleanName = name.trim();
      const id = cleanName.toLowerCase().replace(/\s+/g, '-');
      this._folders.push({ id, name: cleanName, hasChildren: false });
      this._activeFolder = cleanName;
      this.render();
      CortexModal.toast(`Diretório "${cleanName}" criado com sucesso!`, 'success');
    }
  }

  _uploadFiles(event) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const fileList = Array.from(e.target.files || []);
      if (fileList.length === 0) return;

      fileList.forEach((f, idx) => {
        const sizeKb = (f.size / 1024).toFixed(1) + ' kb';
        this._files.unshift({
          id: `file-up-${Date.now()}-${idx}`,
          name: f.name,
          size: sizeKb,
          type: f.type.includes('image') ? 'image' : 'doc',
          folder: this._activeFolder
        });
      });
      this.render();
      CortexModal.toast(`${fileList.length} arquivo(s) carregado(s) em ${this._activeFolder}!`, 'success');
    };
    input.click();
  }

  _renameFile(fileId) {
    const file = this._files.find(f => f.id === fileId);
    if (!file) return;

    const newName = window.prompt('Renomear arquivo:', file.name);
    if (newName && newName.trim()) {
      file.name = newName.trim();
      this._contextMenu.visible = false;
      this.render();
      CortexModal.toast(`Arquivo renomeado para "${file.name}"`, 'success');
    }
  }

  _deleteFile(fileId) {
    const file = this._files.find(f => f.id === fileId);
    if (!file) return;

    if (window.confirm(`Tem certeza que deseja excluir "${file.name}"?`)) {
      this._files = this._files.filter(f => f.id !== fileId);
      this._selectedFileIds.delete(fileId);
      this._contextMenu.visible = false;
      this.render();
      CortexModal.toast(`Arquivo "${file.name}" excluído.`, 'info');
    }
  }

  _copyFile(fileId) {
    const file = this._files.find(f => f.id === fileId);
    if (!file) return;

    const copy = {
      ...file,
      id: `file-${Date.now()}`,
      name: `Cópia_de_${file.name}`
    };
    this._files.push(copy);
    this._contextMenu.visible = false;
    this.render();
    CortexModal.toast(`Cópia criada: "${copy.name}"`, 'success');
  }

  _moveFile(fileId) {
    const file = this._files.find(f => f.id === fileId);
    if (!file) return;

    const folderNames = this._folders.map(f => f.name).join(', ');
    const target = window.prompt(`Mover para qual pasta? (${folderNames})`, 'Landscapes');
    if (target && this._folders.some(f => f.name.toLowerCase() === target.trim().toLowerCase())) {
      file.folder = target.trim();
      this._contextMenu.visible = false;
      this.render();
      CortexModal.toast(`"${file.name}" movido para ${file.folder}!`, 'success');
    }
  }

  _downloadFile(fileId) {
    const file = this._files.find(f => f.id === fileId);
    if (!file) return;

    const blob = new Blob([`Arquivo simulado CortexUI: ${file.name}\nTamanho: ${file.size}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    this._contextMenu.visible = false;
    CortexModal.toast(`Download iniciado: ${file.name}`, 'success');
  }

  _renderFileList() {
    const currentFiles = this._files.filter(f => f.folder.toLowerCase() === this._activeFolder.toLowerCase());
    const allSelected = currentFiles.length > 0 && currentFiles.every(f => this._selectedFileIds.has(f.id));

    return `
      <table class="file-table">
        <thead>
          <tr>
            <th style="width: 38px; text-align: center;">
              <input type="checkbox" id="chk-select-all" ${allSelected ? 'checked' : ''} />
            </th>
            <th style="width: 32px;"></th>
            <th>Name</th>
            <th style="width: 120px; text-align: right;">File Size</th>
          </tr>
        </thead>
        <tbody>
          ${currentFiles.map(file => {
            const isSelected = this._selectedFileIds.has(file.id);
            return `
              <tr class="file-row ${isSelected ? 'selected' : ''}" data-file-id="${file.id}">
                <td style="text-align: center;">
                  <input type="checkbox" class="file-chk" data-file-id="${file.id}" ${isSelected ? 'checked' : ''} />
                </td>
                <td style="text-align: center; color: #64748b;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </td>
                <td class="file-name-cell">
                  <span>${file.name}</span>
                </td>
                <td class="file-size-cell">
                  ${file.size}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  _renderFileGrid() {
    const currentFiles = this._files.filter(f => f.folder.toLowerCase() === this._activeFolder.toLowerCase());
    return `
      <div class="file-grid-container">
        ${currentFiles.map(file => {
          const isSelected = this._selectedFileIds.has(file.id);
          return `
            <div class="file-card ${isSelected ? 'selected' : ''}" data-file-id="${file.id}">
              <div class="card-thumb">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div class="card-name" title="${file.name}">${file.name}</div>
              <div class="card-size">${file.size}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  _renderContextMenu() {
    if (!this._contextMenu.visible) return '';

    return `
      <div class="context-menu-box" style="top: ${this._contextMenu.y}px; left: ${this._contextMenu.x}px;">
        <button class="ctx-item" data-ctx="rename">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Rename
        </button>
        <button class="ctx-item" data-ctx="move">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><polyline points="12 11 16 14 12 17"/></svg>
          Move to
        </button>
        <button class="ctx-item" data-ctx="copy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy to
        </button>
        <button class="ctx-item" data-ctx="delete" style="color: #ef4444;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete
        </button>
        <div style="height: 1px; background: #e2e8f0; margin: 4px 0;"></div>
        <button class="ctx-item" data-ctx="download">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </button>
      </div>
    `;
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
          background: #ffffff;
          color: #1e293b;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
          box-sizing: border-box;
          position: relative;
        }

        /* Barra de Ações Superior */
        .fm-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
          user-select: none;
        }

        .action-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fm-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
          transition: background 0.12s ease;
        }

        .fm-btn:hover {
          background: #f1f5f9;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          cursor: pointer;
          color: #475569;
          transition: all 0.12s ease;
        }

        .icon-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Layout Dividido (Árvore + Arquivos) */
        .fm-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* Coluna Lateral da Árvore */
        .fm-sidebar {
          width: 220px;
          min-width: 200px;
          border-right: 1px solid #e2e8f0;
          padding: 14px 10px;
          background: #ffffff;
          overflow-y: auto;
          user-select: none;
        }

        .tree-root-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #1e293b;
          padding: 6px 8px;
          border-radius: 4px;
        }

        .tree-sub-list {
          padding-left: 18px;
          margin-top: 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tree-node {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease;
        }

        .tree-node:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .tree-node.active {
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 600;
        }

        /* Coluna Principal da Tabela de Arquivos */
        .fm-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #ffffff;
        }

        /* Breadcrumb */
        .breadcrumb-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 18px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          color: #64748b;
          user-select: none;
        }

        .btn-up-dir {
          background: transparent;
          border: none;
          color: #475569;
          cursor: pointer;
          font-size: 14px;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .btn-up-dir:hover { background: #f1f5f9; }

        .crumb-path {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .crumb-active {
          color: #0f172a;
          font-weight: 600;
        }

        /* Tabela de Arquivos */
        .file-scroll-area {
          flex: 1;
          overflow-y: auto;
          position: relative;
        }

        .file-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          user-select: none;
        }

        .file-table th {
          background: #ffffff;
          color: #475569;
          font-weight: 600;
          padding: 10px 14px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }

        .file-row {
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: background 0.1s ease;
        }

        .file-row:hover {
          background: #f8fafc;
        }

        .file-row.selected {
          background: #eef5ff;
        }

        .file-row td {
          padding: 9px 14px;
          color: #1e293b;
        }

        .file-name-cell {
          font-weight: 500;
        }

        .file-size-cell {
          text-align: right;
          color: #64748b;
          font-size: 12.5px;
        }

        /* Menu de Contexto Suspenso (Imagem 4) */
        .context-menu-box {
          position: absolute;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          width: 155px;
          padding: 6px 0;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .ctx-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: none;
          padding: 7px 14px;
          font-size: 12.5px;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
          transition: background 0.1s ease;
        }

        .ctx-item:hover {
          background: #f1f5f9;
        }

        /* Grid View */
        .file-grid-container {
          padding: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 16px;
        }

        .file-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .file-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .file-card.selected {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .card-name {
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          word-break: break-all;
          max-height: 32px;
          overflow: hidden;
        }

        .card-size {
          font-size: 11px;
          color: #64748b;
        }
      </style>

      <!-- Topbar do Gerenciador -->
      <div class="fm-topbar">
        <div class="action-group">
          <button class="fm-btn" id="btn-new-dir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            New directory
          </button>
          <button class="fm-btn" id="btn-upload-files">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            Upload files
          </button>
        </div>

        <div class="action-group">
          <button class="icon-btn" id="btn-toggle-view" title="Alternar Lista/Grade">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <button class="icon-btn" id="btn-refresh" title="Atualizar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
        </div>
      </div>

      <!-- Corpo Principal -->
      <div class="fm-body">
        <!-- Árvore Lateral -->
        <div class="fm-sidebar">
          <div class="tree-root-item">
            <span>&#8964;</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span>Files</span>
          </div>

          <div class="tree-sub-list">
            ${this._folders.map(folder => {
              const isActive = this._activeFolder.toLowerCase() === folder.name.toLowerCase();
              return `
                <div class="tree-node ${isActive ? 'active' : ''}" data-folder="${folder.name}">
                  ${folder.hasChildren ? `<span style="font-size:10px; color:#94a3b8;">&rsaquo;</span>` : `<span style="width:7px;"></span>`}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${isActive ? '#2563eb' : '#64748b'}" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <span>${folder.name}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Conteúdo dos Arquivos -->
        <div class="fm-main">
          <!-- Breadcrumb -->
          <div class="breadcrumb-bar">
            <button class="btn-up-dir" id="btn-up-dir" title="Subir um nível">&#8617;</button>
            <div class="crumb-path">
              <span>Files</span>
              <span>&rarr;</span>
              <span class="crumb-active">${this._activeFolder}</span>
            </div>
          </div>

          <!-- Área da Tabela/Grade com Menu de Contexto -->
          <div class="file-scroll-area">
            ${this._viewMode === 'list' ? this._renderFileList() : this._renderFileGrid()}
            ${this._renderContextMenu()}
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const root = this.shadowRoot;

    // Novo Diretório
    root.querySelector('#btn-new-dir')?.addEventListener('click', () => this._newDirectory());

    // Upload
    root.querySelector('#btn-upload-files')?.addEventListener('click', (e) => this._uploadFiles(e));

    // Atualizar
    root.querySelector('#btn-refresh')?.addEventListener('click', () => {
      CortexModal.toast('Lista de arquivos atualizada com sucesso!', 'info');
      this.render();
    });

    // Alternar Visualização (Lista / Grade)
    root.querySelector('#btn-toggle-view')?.addEventListener('click', () => {
      this._viewMode = this._viewMode === 'list' ? 'grid' : 'list';
      this.render();
    });

    // Subir Diretório
    root.querySelector('#btn-up-dir')?.addEventListener('click', () => {
      this._activeFolder = 'Files';
      this.render();
    });

    // Navegação na Árvore Lateral
    root.querySelectorAll('.tree-node').forEach(node => {
      node.addEventListener('click', () => {
        this._activeFolder = node.dataset.folder;
        this._selectedFileIds.clear();
        this._contextMenu.visible = false;
        this.render();
      });
    });

    // Selecionar Todos os Checkboxes
    const chkAll = root.querySelector('#chk-select-all');
    if (chkAll) {
      chkAll.addEventListener('change', (e) => {
        const checked = e.target.checked;
        const currentFiles = this._files.filter(f => f.folder.toLowerCase() === this._activeFolder.toLowerCase());
        if (checked) {
          currentFiles.forEach(f => this._selectedFileIds.add(f.id));
        } else {
          currentFiles.forEach(f => this._selectedFileIds.delete(f.id));
        }
        this.render();
      });
    }

    // Seleção de Linhas de Arquivo e Abertura do Menu de Contexto
    root.querySelectorAll('.file-row, .file-card').forEach(row => {
      const fileId = row.dataset.fileId;

      row.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        this._selectedFileIds.clear();
        this._selectedFileIds.add(fileId);
        this.render();
      });

      // Clique direito abre o Menu de Contexto na posição exata
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const rect = root.host.getBoundingClientRect();
        this._selectedFileIds.clear();
        this._selectedFileIds.add(fileId);
        this._contextMenu = {
          visible: true,
          targetFileId: fileId,
          x: Math.min(e.clientX - rect.left, rect.width - 170),
          y: Math.min(e.clientY - rect.top, rect.height - 200)
        };
        this.render();
      });
    });

    // Checkbox individual
    root.querySelectorAll('.file-chk').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const fileId = chk.dataset.fileId;
        if (chk.checked) {
          this._selectedFileIds.add(fileId);
        } else {
          this._selectedFileIds.delete(fileId);
        }
        this.render();
      });
    });

    // Fechar menu de contexto ao clicar fora
    root.addEventListener('click', (e) => {
      if (!e.target.closest('.context-menu-box') && !e.target.closest('.file-row')) {
        if (this._contextMenu.visible) {
          this._contextMenu.visible = false;
          this.render();
        }
      }
    });

    // Ações do Menu de Contexto
    root.querySelectorAll('[data-ctx]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = btn.dataset.ctx;
        const targetId = this._contextMenu.targetFileId;

        if (act === 'rename') this._renameFile(targetId);
        if (act === 'delete') this._deleteFile(targetId);
        if (act === 'copy') this._copyFile(targetId);
        if (act === 'move') this._moveFile(targetId);
        if (act === 'download') this._downloadFile(targetId);
      });
    });
  }
}

customElements.define('cortex-file-manager', CortexFileManager);
