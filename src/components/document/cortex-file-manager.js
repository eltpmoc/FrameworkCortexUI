// src/components/document/cortex-file-manager.js
import { CortexElement } from '../../core/CortexElement.js';
import { CortexModal } from '../cortex-modal.js';

/**
 * Componente nativo de Document Management: File Manager
 * Gerenciador de arquivos completo com árvore hierárquica lateral (Files > Cities, Contact, Widescreen...),
 * barra de ferramentas (+ New directory, Upload files, Refresh, Grid/List toggle),
 * tabela de arquivos com seleção múltipla e menu de contexto funcional (Rename, Move to, Copy to, Delete, Download).
 * Totalmente compatível com todos os temas do CortexUI e 100% nativo.
 */
export class CortexFileManager extends CortexElement {
  constructor() {
    super();
    this._viewMode = 'grid'; // 'list' | 'grid'
    this._activeFolder = 'Widescreen';
    this._selectedFileIds = new Set(['file-1']);
    this._contextMenu = {
      visible: false,
      targetFileId: null,
      x: 0,
      y: 0
    };

    // Árvore de Diretórios
    this._folders = [
      { id: 'cities', name: 'Cities', hasChildren: true },
      { id: 'contact', name: 'Contact', hasChildren: false },
      { id: 'landscapes', name: 'Landscapes', hasChildren: false },
      { id: 'portraits', name: 'Portraits', hasChildren: false },
      { id: 'widescreen', name: 'Widescreen', hasChildren: false }
    ];

    // Arquivos no diretório Widescreen (exatamente como na Imagem de referência)
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

  onMount() {
    this.watchState('theme', () => this.render());
  }

  async _newDirectory() {
    const name = await CortexModal.prompt({
      title: 'Novo Diretório',
      message: 'Digite o nome do novo diretório a ser criado na árvore:',
      defaultValue: 'New Folder',
      placeholder: 'Nome do diretório...',
      confirmText: 'Criar Pasta',
      cancelText: 'Cancelar'
    });
    if (name && name.trim()) {
      const cleanName = name.trim();
      const id = cleanName.toLowerCase().replace(/\s+/g, '-');
      this._folders.push({ id, name: cleanName, hasChildren: false });
      this._activeFolder = cleanName;
      this.render();
      CortexModal.toast(`Diretório "${cleanName}" criado com sucesso!`, 'success');
    }
  }

  _uploadFiles(_event) {
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

  async _renameFile(fileId) {
    const file = this._files.find(f => f.id === fileId);
    if (!file) return;

    const newName = await CortexModal.prompt({
      title: 'Renomear Arquivo',
      message: `Digite o novo nome para o arquivo "${file.name}":`,
      defaultValue: file.name,
      placeholder: 'Nome do arquivo...',
      confirmText: 'Renomear',
      cancelText: 'Cancelar'
    });
    if (newName && newName.trim()) {
      file.name = newName.trim();
      this._contextMenu.visible = false;
      this.render();
      CortexModal.toast(`Arquivo renomeado para "${file.name}"`, 'success');
    }
  }

  async _deleteFile(fileId) {
    const file = this._files.find(f => f.id === fileId);
    if (!file) return;

    const confirmed = await CortexModal.confirm({
      title: 'Excluir Arquivo',
      message: `Tem certeza que deseja excluir o arquivo "${file.name}"? Esta ação removerá o item permanentemente.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      danger: true
    });

    if (confirmed) {
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

  async _moveFile(fileId) {
    const file = this._files.find(f => f.id === fileId);
    if (!file) return;

    const folderNames = this._folders.map(f => f.name).join(', ');
    const target = await CortexModal.prompt({
      title: 'Mover Arquivo',
      message: `Mover o arquivo "${file.name}" para qual diretório?\nPastas disponíveis: ${folderNames}`,
      defaultValue: 'Landscapes',
      placeholder: 'Nome da pasta de destino...',
      confirmText: 'Mover',
      cancelText: 'Cancelar'
    });

    if (target && this._folders.some(f => f.name.toLowerCase() === target.trim().toLowerCase())) {
      const matchedFolder = this._folders.find(f => f.name.toLowerCase() === target.trim().toLowerCase());
      file.folder = matchedFolder.name;
      this._contextMenu.visible = false;
      this.render();
      CortexModal.toast(`"${file.name}" movido para ${file.folder}!`, 'success');
    } else if (target) {
      await CortexModal.alert({
        title: 'Diretório Não Encontrado',
        message: `O diretório "${target}" informado não existe na hierarquia atual. Pastas disponíveis: ${folderNames}`,
        type: 'warning'
      });
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
                <td style="text-align: center; color: var(--accent-text, #3b82f6);">
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
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue, #2563eb)" stroke-width="1.5">
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
        <button class="ctx-item" data-ctx="delete" style="color: var(--status-error, #ef4444);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete
        </button>
        <div style="height: 1px; background: var(--border-subtle, rgba(255,255,255,0.08)); margin: 4px 0;"></div>
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
          background: var(--bg-app, #18181b);
          color: var(--text-primary, #e4e4e7);
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
          overflow: hidden;
          box-sizing: border-box;
          position: relative;
        }

        /* Barra de Ações Superior */
        .fm-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          border-bottom: 1px solid var(--border-subtle, #333337);
          background: var(--bg-panel, #252526);
          user-select: none;
        }

        .action-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .fm-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-input, #1b1b1d);
          border: 1px solid var(--border-input, #3c3c42);
          border-radius: var(--radius-sm, 4px);
          padding: 6px 12px;
          font-size: var(--text-xs, 12px);
          font-weight: 500;
          color: var(--text-primary, #e4e4e7);
          cursor: pointer;
          transition: background 0.12s ease, border-color 0.12s ease;
        }

        .fm-btn:hover {
          background: var(--bg-hover, #37373d);
          border-color: var(--border-focus, #1473e6);
        }

        .icon-btn {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm, 4px);
          border: 1px solid var(--border-input, #3c3c42);
          background: var(--bg-input, #1b1b1d);
          cursor: pointer;
          color: var(--text-secondary, #a1a1aa);
          transition: all 0.12s ease;
        }

        .icon-btn:hover {
          background: var(--bg-hover, #37373d);
          color: var(--text-primary, #e4e4e7);
          border-color: var(--border-focus, #1473e6);
        }

        .icon-btn.active {
          background: var(--accent-blue-alpha, rgba(20, 115, 230, 0.22));
          border-color: var(--accent-blue, #1473e6);
          color: var(--accent-text, #60a5fa);
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
          min-width: 180px;
          border-right: 1px solid var(--border-subtle, #333337);
          padding: 12px 8px;
          background: var(--bg-panel, #252526);
          overflow-y: auto;
          user-select: none;
        }

        .tree-root-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-sm, 13px);
          font-weight: 600;
          color: var(--text-primary, #e4e4e7);
          padding: 6px 8px;
          border-radius: var(--radius-xs, 2px);
        }

        .tree-sub-list {
          padding-left: 14px;
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
          border-radius: var(--radius-sm, 4px);
          font-size: var(--text-xs, 12px);
          color: var(--text-secondary, #a1a1aa);
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease;
        }

        .tree-node:hover {
          background: var(--bg-hover, #37373d);
          color: var(--text-primary, #e4e4e7);
        }

        .tree-node.active {
          background: var(--bg-hover, #37373d);
          color: var(--accent-text, #60a5fa);
          font-weight: 600;
        }

        /* Coluna Principal da Tabela de Arquivos */
        .fm-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-app, #18181b);
        }

        /* Breadcrumb */
        .breadcrumb-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          border-bottom: 1px solid var(--border-subtle, #333337);
          background: var(--bg-panel-header, #1f1f22);
          font-size: var(--text-xs, 12px);
          color: var(--text-secondary, #a1a1aa);
          user-select: none;
        }

        .btn-up-dir {
          background: transparent;
          border: none;
          color: var(--text-secondary, #a1a1aa);
          cursor: pointer;
          font-size: 14px;
          padding: 2px 6px;
          border-radius: var(--radius-xs, 2px);
        }
        .btn-up-dir:hover {
          background: var(--bg-hover, #37373d);
          color: var(--text-primary, #e4e4e7);
        }

        .crumb-path {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .crumb-active {
          color: var(--text-primary, #e4e4e7);
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
          font-size: var(--text-xs, 12px);
          user-select: none;
        }

        .file-table th {
          background: var(--bg-panel-header, #1f1f22);
          color: var(--text-secondary, #a1a1aa);
          font-weight: 600;
          padding: 8px 14px;
          border-bottom: 1px solid var(--border-subtle, #333337);
          text-align: left;
        }

        .file-row {
          border-bottom: 1px solid var(--border-subtle, #333337);
          cursor: pointer;
          transition: background 0.1s ease;
        }

        .file-row:hover {
          background: var(--bg-hover, #37373d);
        }

        .file-row.selected {
          background: var(--accent-blue-alpha, rgba(20, 115, 230, 0.22));
        }

        .file-row td {
          padding: 8px 14px;
          color: var(--text-primary, #e4e4e7);
        }

        .file-name-cell {
          font-weight: 500;
        }

        .file-size-cell {
          text-align: right;
          color: var(--text-muted, #71717a);
        }

        /* Menu de Contexto Suspenso Posicionado em Fixed */
        .context-menu-box {
          position: fixed;
          background: var(--bg-elevated, #2a2a2d);
          border: 1px solid var(--border-input, #3c3c42);
          border-radius: var(--radius-md, 6px);
          box-shadow: var(--shadow-dropdown, 0 10px 30px rgba(0,0,0,0.5));
          width: 165px;
          padding: 4px 0;
          z-index: 999999;
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
          font-size: var(--text-xs, 12px);
          font-weight: 500;
          color: var(--text-primary, #e4e4e7);
          cursor: pointer;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
          transition: background 0.1s ease;
        }

        .ctx-item:hover {
          background: var(--bg-hover, #37373d);
        }

        /* Grid View */
        .file-grid-container {
          padding: 16px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
          gap: 14px;
        }

        .file-card {
          background: var(--bg-panel, #252526);
          border: 1px solid var(--border-subtle, #333337);
          border-radius: var(--radius-md, 6px);
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.12s ease;
        }

        .file-card:hover {
          background: var(--bg-hover, #37373d);
          border-color: var(--border-focus, #1473e6);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .file-card.selected {
          border-color: var(--accent-blue, #1473e6);
          background: var(--accent-blue-alpha, rgba(20, 115, 230, 0.22));
          box-shadow: 0 0 0 1px var(--accent-blue, #1473e6);
        }

        .card-name {
          font-size: var(--text-xs, 11.5px);
          font-weight: 500;
          text-align: center;
          word-break: break-all;
          max-height: 32px;
          overflow: hidden;
          color: var(--text-primary, #e4e4e7);
        }

        .card-size {
          font-size: 10.5px;
          color: var(--text-muted, #71717a);
        }
      </style>

      <!-- Topbar do Gerenciador -->
      <div class="fm-topbar">
        <div class="action-group">
          <button class="fm-btn" id="btn-new-dir">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            New directory
          </button>
          <button class="fm-btn" id="btn-upload-files">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
            Upload files
          </button>
        </div>

        <div class="action-group">
          <button class="icon-btn ${this._viewMode === 'grid' ? 'active' : ''}" id="btn-toggle-view" title="Alternar Lista/Grade">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <button class="icon-btn" id="btn-refresh" title="Atualizar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
        </div>
      </div>

      <!-- Corpo Principal -->
      <div class="fm-body">
        <!-- Árvore Lateral -->
        <div class="fm-sidebar">
          <div class="tree-root-item">
            <span>&#8964;</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-warn, #eab308)" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span>Files</span>
          </div>

          <div class="tree-sub-list">
            ${this._folders.map(folder => {
              const isActive = this._activeFolder.toLowerCase() === folder.name.toLowerCase();
              return `
                <div class="tree-node ${isActive ? 'active' : ''}" data-folder="${folder.name}">
                  ${folder.hasChildren ? `<span style="font-size:10px; color:var(--text-muted);">&rsaquo;</span>` : `<span style="width:7px;"></span>`}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${isActive ? 'var(--accent-text, #60a5fa)' : 'var(--text-secondary, #a1a1aa)'}" stroke-width="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
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

          <!-- Área da Tabela/Grade -->
          <div class="file-scroll-area">
            ${this._viewMode === 'list' ? this._renderFileList() : this._renderFileGrid()}
          </div>
        </div>
      </div>

      <!-- Menu de Contexto Flutuante (Fixed) -->
      ${this._renderContextMenu()}
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
      this._contextMenu.visible = false;
      this.render();
    });

    // Subir Diretório
    root.querySelector('#btn-up-dir')?.addEventListener('click', () => {
      this._activeFolder = 'Files';
      this._contextMenu.visible = false;
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

    // Seleção de Linhas/Cards e Abertura do Menu de Contexto no local exato do cursor
    root.querySelectorAll('.file-row, .file-card').forEach(row => {
      const fileId = row.dataset.fileId;

      row.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        this._selectedFileIds.clear();
        this._selectedFileIds.add(fileId);
        // Fecha menu de contexto em clique normal
        if (this._contextMenu.visible) {
          this._contextMenu.visible = false;
        }
        this.render();
      });

      // Clique direito abre o Menu de Contexto no ponto EXATO do clique (e.clientX, e.clientY)
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const menuWidth = 170;
        const menuHeight = 190;
        const posX = Math.max(10, Math.min(e.clientX, window.innerWidth - menuWidth - 10));
        const posY = Math.max(10, Math.min(e.clientY, window.innerHeight - menuHeight - 10));

        this._selectedFileIds.clear();
        this._selectedFileIds.add(fileId);
        this._contextMenu = {
          visible: true,
          targetFileId: fileId,
          x: posX,
          y: posY
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

    // Fechar menu de contexto ao clicar em qualquer lugar fora dele
    root.addEventListener('pointerdown', (e) => {
      if (!e.composedPath().some(el => el.classList && el.classList.contains('context-menu-box'))) {
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
