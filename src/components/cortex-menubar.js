// src/components/cortex-menubar.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';
import { t, getLanguage, toggleLanguage } from '../core/i18n.js';

function getLocalizedMenus() {
  return [
    {
      id: 'file',
      label: t('menu.file'),
      items: [
        { action: 'new-doc', label: t('menu.newDoc'), shortcut: 'Ctrl+N' },
        { action: 'open-json', label: t('menu.openJson'), shortcut: 'Ctrl+O' },
        { type: 'divider' },
        { action: 'save-json', label: t('menu.saveJson'), shortcut: 'Ctrl+S' },
        { action: 'export-image', label: t('menu.exportImage'), shortcut: 'Ctrl+E' },
        { type: 'divider' },
        { action: 'close-tab', label: t('menu.close'), shortcut: 'Ctrl+W' }
      ]
    },
    {
      id: 'edit',
      label: t('menu.edit'),
      items: [
        { action: 'undo', label: t('menu.undo'), shortcut: 'Ctrl+Z' },
        { action: 'redo', label: t('menu.redo'), shortcut: 'Ctrl+Y' },
        { type: 'divider' },
        { action: 'cut', label: t('menu.cut'), shortcut: 'Ctrl+X' },
        { action: 'copy', label: t('menu.copy'), shortcut: 'Ctrl+C' },
        { action: 'paste', label: t('menu.paste'), shortcut: 'Ctrl+V' },
        { type: 'divider' },
        { action: 'duplicate', label: t('menu.duplicate'), shortcut: 'Ctrl+D' },
        { action: 'delete', label: t('menu.delete'), shortcut: 'Del' }
      ]
    },
    {
      id: 'layout',
      label: t('menu.layout'),
      items: [
        { action: 'add-page', label: t('menu.insertPage'), shortcut: 'Ctrl+Shift+P' },
        { action: 'margins-guides', label: t('menu.marginsGuides'), shortcut: '' },
        { action: 'toggle-facing', label: t('menu.toggleFacing'), shortcut: '' }
      ]
    },
    {
      id: 'type',
      label: t('menu.type'),
      items: [
        { action: 'tool-text', label: t('menu.insertText'), shortcut: 'T' },
        { action: 'font-size-up', label: t('menu.fontSizeUp'), shortcut: 'Ctrl+>' },
        { action: 'font-size-down', label: t('menu.fontSizeDown'), shortcut: 'Ctrl+<' }
      ]
    },
    {
      id: 'object',
      label: t('menu.object'),
      items: [
        { action: 'add-rect', label: t('menu.insertRect'), shortcut: 'M' },
        { action: 'add-line', label: t('menu.insertLine'), shortcut: 'L' },
        { type: 'divider' },
        { action: 'bring-front', label: t('menu.bringFront'), shortcut: 'Ctrl+]' },
        { action: 'send-back', label: t('menu.sendBack'), shortcut: 'Ctrl+[' }
      ]
    },
    {
      id: 'table',
      label: t('menu.table'),
      items: [
        { action: 'insert-table', label: t('menu.insertTable'), shortcut: 'Ctrl+Alt+T' }
      ]
    },
    {
      id: 'documents',
      label: t('menu.documents'),
      items: [
        { action: 'open-office-api-win', label: 'Office File API (Word, Excel & PDF)', shortcut: 'Ctrl+Alt+O' },
        { action: 'open-spreadsheet-win', label: 'Spreadsheet (Planilha com Gráficos)', shortcut: 'Ctrl+Alt+S' },
        { action: 'open-rich-edit-win', label: 'Rich Edit (Processador de Texto A4)', shortcut: 'Ctrl+Alt+R' },
        { type: 'divider' },
        { action: 'open-file-manager-win', label: 'File Manager (Gerenciador de Arquivos)', shortcut: 'Ctrl+Alt+F' },
        { action: 'open-file-uploader-win', label: 'File Uploader (Upload Drag & Drop)', shortcut: 'Ctrl+Alt+U' }
      ]
    },
    {
      id: 'chat',
      label: t('menu.chat'),
      items: [
        { action: 'open-chat-showcase-win', label: 'Chats Showcase (Foto vs Iniciais)', shortcut: 'Ctrl+Alt+C' },
        { type: 'divider' },
        { action: 'open-chat-photo-win', label: 'Chat Modelo 1 (Avatar com Foto)', shortcut: '' },
        { action: 'open-chat-initials-win', label: 'Chat Modelo 2 (Iniciais Monograma JD)', shortcut: '' }
      ]
    },
    {
      id: 'view',
      label: t('menu.view'),
      items: [
        { action: 'zoom-in', label: t('menu.zoomIn'), shortcut: 'Ctrl++' },
        { action: 'zoom-out', label: t('menu.zoomOut'), shortcut: 'Ctrl+-' },
        { action: 'zoom-reset', label: t('menu.zoomReset'), shortcut: 'Ctrl+1' },
        { type: 'divider' },
        { action: 'toggle-rulers', label: t('menu.rulers'), shortcut: 'Ctrl+R' },
        { action: 'toggle-guides', label: t('menu.guides'), shortcut: 'Ctrl+;' },
        { action: 'toggle-grid', label: t('menu.grid'), shortcut: "Ctrl+'" },
        { type: 'divider' },
        { action: 'theme-dark', label: 'Theme: Cortex Dark Pro (Padrão)', shortcut: '' },
        { action: 'theme-macos', label: 'Theme: macOS Light (Claro)', shortcut: '' },
        { action: 'theme-macos-ventura', label: 'Theme: macOS Ventura (Poppy & Ocean)', shortcut: '' },
        { action: 'theme-medium-green', label: 'Theme: Médio (Verde & Cinza Escuro)', shortcut: '' },
        { action: 'theme-medium-blue', label: 'Theme: Médio (Azul & Cinza Escuro)', shortcut: '' },
        { action: 'theme-win12', label: 'Theme: Windows 12 (Fluent Lavender)', shortcut: '' },
        { action: 'theme-winxp', label: 'Theme: Windows XP (Luna Blue & Beige)', shortcut: '' },
        { action: 'theme-win2000', label: 'Theme: Windows 2000 (Win2000)', shortcut: '' },
        { action: 'theme-win98', label: 'Theme: Windows 98 SE (Teal & Silver)', shortcut: '' },
        { action: 'theme-msdos', label: 'Theme: MS-DOS Editor (EDIT.COM VGA)', shortcut: '' },
        { type: 'divider' },
        { action: 'theme-hacker', label: 'Theme: Hacker Terminal (Matrix Phosphor)', shortcut: '' },
        { action: 'theme-futuristic', label: 'Theme: Ultra-Futurista (Quantum Holo 2099)', shortcut: '' }
      ]
    },
    {
      id: 'window',
      label: t('menu.window'),
      items: [
        { action: 'open-docs', label: 'Docs & Component Manual', shortcut: 'F1' },
        { action: 'open-login', label: 'Showcase: Login UI (10 Models)', shortcut: 'Ctrl+L' },
        { type: 'divider' },
        { action: 'open-datagrid-win', label: 'Data Grid Window (MDI)', shortcut: 'Ctrl+Alt+D' },
        { action: 'open-treeview-win', label: 'Scene TreeView Window (MDI)', shortcut: 'Ctrl+Alt+T' },
        { action: 'open-planning-win', label: 'Schedulers, Kanban & Gantt Window', shortcut: 'Ctrl+Alt+P' },
        { type: 'divider' },
        { action: 'open-office-api-win', label: 'Office File API (Invoice, Excel & Word)', shortcut: '' },
        { action: 'open-spreadsheet-win', label: 'Spreadsheet (Planilha com Gráficos)', shortcut: '' },
        { action: 'open-rich-edit-win', label: 'Rich Edit (Editor de Texto Word A4)', shortcut: '' },
        { action: 'open-file-manager-win', label: 'File Manager (Gerenciador de Arquivos)', shortcut: '' },
        { action: 'open-file-uploader-win', label: 'File Uploader (Upload 15 MB)', shortcut: '' },
        { type: 'divider' },
        { action: 'open-chat-showcase-win', label: 'Chats Showcase (Foto vs Iniciais)', shortcut: '' },
        { action: 'open-chat-photo-win', label: 'Chat Modelo 1 (Avatar com Foto)', shortcut: '' },
        { action: 'open-chat-initials-win', label: 'Chat Modelo 2 (Iniciais Monograma)', shortcut: '' },
        { type: 'divider' },
        { action: 'toggle-left-dock', label: 'Toggle Tools Panel', shortcut: 'Tab' },
        { action: 'toggle-right-dock', label: 'Toggle Inspector Panel', shortcut: 'Shift+Tab' },
        { action: 'reset-layout', label: 'Reset Workspace Layout', shortcut: '' }
      ]
    },
    {
      id: 'help',
      label: t('menu.help'),
      items: [
        { action: 'about', label: 'About Framework CortexUI...', shortcut: '' },
        { action: 'open-docs', label: 'Documentation & API...', shortcut: 'F1' }
      ]
    }
  ];
}

const DEFAULT_MENUS = getLocalizedMenus();

export class CortexMenubar extends CortexElement {
  constructor() {
    super();
    this._customMenus = null;
    this._windowTitle = null;
    this._activeMenuId = null;
    this._mobileDrawerOpen = false;
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    this._handleGlobalKeydown = this._handleGlobalKeydown.bind(this);
  }

  /**
   * Permite que qualquer aplicação Web injete seus próprios menus Desktop via JS:
   * document.querySelector('cortex-menubar').menus = [...]
   */
  set windowTitle(val) {
    this._windowTitle = val;
    this._updateTitle();
  }

  get windowTitle() {
    return this._windowTitle;
  }

  set menus(customMenus) {
    if (Array.isArray(customMenus)) {
      this._customMenus = customMenus;
      this.render();
    }
  }

  get menus() {
    return this._customMenus || getLocalizedMenus();
  }

  onMount() {
    document.addEventListener('pointerdown', this._handleOutsideClick);
    window.addEventListener('keydown', this._handleGlobalKeydown);

    this.watchState(['appName', 'openTabs', 'activeTabId'], () => {
      this._updateTitle();
    });

    this.watchState('theme', (nextTheme) => {
      const themeSel = this.shadowRoot.querySelector('.theme-select');
      if (themeSel && themeSel.value !== nextTheme) {
        themeSel.value = nextTheme;
      }
    });
  }

  onUnmount() {
    document.removeEventListener('pointerdown', this._handleOutsideClick);
    window.removeEventListener('keydown', this._handleGlobalKeydown);
  }

  _getComputedTitle() {
    if (this._windowTitle) return this._windowTitle;
    const attrTitle = this.getAttribute('window-title');
    if (attrTitle) return attrTitle;
    const appName = this.getAttribute('app-name') || AppState.get('appName') || 'CortexUI';
    const tabs = AppState.get('openTabs') || [];
    const activeTab = tabs.find((t) => t.id === AppState.get('activeTabId'));
    return activeTab ? `${appName} — ${activeTab.title}` : appName;
  }

  _updateTitle() {
    const el = this.shadowRoot.querySelector('.window-title');
    if (el) el.textContent = this._getComputedTitle();
  }

  _handleOutsideClick(e) {
    if (!e.composedPath().includes(this)) {
      this._closeAllMenus();
    }
  }

  _handleGlobalKeydown(e) {
    const target = e.composedPath()[0];
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }

    if (e.key === 'Escape') {
      this._closeAllMenus();
      AppState.setState({ activeTool: 'select' });
      return;
    }

    if (e.key === 'F1') {
      e.preventDefault();
      this._triggerAction('open-docs');
      return;
    }

    if (e.key === 'F8') {
      e.preventDefault();
      this._triggerAction('open-tree');
      return;
    }

    if (e.key === 'F9') {
      e.preventDefault();
      this._triggerAction('open-login');
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (k === '=' || k === '+') {
        e.preventDefault();
        this._triggerAction('zoom-in');
      } else if (k === '-') {
        e.preventDefault();
        this._triggerAction('zoom-out');
      } else if (k === '0' || k === '1') {
        e.preventDefault();
        this._triggerAction('zoom-reset');
      } else if (k === 'n') {
        e.preventDefault();
        this._triggerAction('new-doc');
      } else if (k === 's') {
        e.preventDefault();
        this._triggerAction('save-json');
      } else if (k === 'r') {
        e.preventDefault();
        this._triggerAction('toggle-rulers');
      }
      return;
    }

    const toolShortcuts = {
      v: 'select',
      a: 'direct-select',
      t: 'text',
      l: 'line',
      p: 'pen',
      m: 'rect',
      r: 'rect',
      h: 'pan',
      z: 'zoom'
    };
    const nextTool = toolShortcuts[e.key.toLowerCase()];
    if (nextTool) {
      AppState.setState({ activeTool: nextTool });
    }
  }

  _triggerAction(action) {
    switch (action) {
      case 'close-tab': {
        const tabs = AppState.get('openTabs').filter((t) => t.id !== AppState.get('activeTabId'));
        if (tabs.length > 0) {
          AppState.setState({ openTabs: tabs, activeTabId: tabs[tabs.length - 1].id });
        }
        break;
      }
      case 'zoom-in':
        AppState.setState({ zoom: Math.min(400, AppState.get('zoom') + 25) });
        break;
      case 'zoom-out':
        AppState.setState({ zoom: Math.max(25, AppState.get('zoom') - 25) });
        break;
      case 'zoom-reset':
        AppState.setState({ zoom: 100 });
        break;
      case 'toggle-rulers':
        AppState.setState({ showRulers: !AppState.get('showRulers') });
        break;
      case 'toggle-guides':
        AppState.setState({ showGuides: !AppState.get('showGuides') });
        break;
      case 'toggle-grid':
        AppState.setState({ showGrid: !AppState.get('showGrid') });
        break;
      case 'panel-properties':
        AppState.setState({ activeInspectorTab: 'properties', inspectorCollapsed: false });
        break;
      case 'panel-pages':
        AppState.setState({ activeInspectorTab: 'pages', inspectorCollapsed: false });
        break;
      case 'panel-layers':
        AppState.setState({ activeInspectorTab: 'layers', inspectorCollapsed: false });
        break;
      case 'tool-text':
        AppState.setState({ activeTool: 'text' });
        break;
      case 'add-rect':
        AppState.setState({ activeTool: 'rect' });
        break;
      case 'add-line':
        AppState.setState({ activeTool: 'line' });
        break;
      case 'theme-dark':
        AppState.setState({ theme: 'dark' });
        break;
      case 'theme-macos':
        AppState.setState({ theme: 'macos-light' });
        break;
      case 'theme-macos-ventura':
        AppState.setState({ theme: 'macos-ventura' });
        break;
      case 'theme-medium-green':
        AppState.setState({ theme: 'medium-green' });
        break;
      case 'theme-medium-blue':
        AppState.setState({ theme: 'medium-blue' });
        break;
      case 'theme-win12':
        AppState.setState({ theme: 'win12' });
        break;
      case 'theme-winxp':
        AppState.setState({ theme: 'winxp' });
        break;
      case 'theme-win2000':
        AppState.setState({ theme: 'win2000' });
        break;
      case 'theme-win98':
        AppState.setState({ theme: 'win98' });
        break;
      case 'theme-msdos':
        AppState.setState({ theme: 'msdos' });
        break;
      case 'theme-hacker':
        AppState.setState({ theme: 'hacker' });
        break;
      case 'theme-futuristic':
        AppState.setState({ theme: 'futuristic' });
        break;
      case 'toggle-lang':
        toggleLanguage();
        break;
      default:
        break;
    }

    this.emit('cortex-menu-action', { action });
    this._closeAllMenus();
  }

  _closeAllMenus() {
    this._activeMenuId = null;
    this._mobileDrawerOpen = false;
    this._syncMenuDOM();
  }

  _syncMenuDOM() {
    this.shadowRoot.querySelectorAll('.menu-root-item').forEach((item) => {
      const isOpen = item.dataset.menuId === this._activeMenuId;
      item.classList.toggle('open', isOpen);
      const btn = item.querySelector('.menu-trigger');
      if (btn) btn.setAttribute('aria-expanded', String(isOpen));
    });

    const drawer = this.shadowRoot.querySelector('.mobile-drawer');
    const backdrop = this.shadowRoot.querySelector('.mobile-backdrop');
    if (drawer && backdrop) {
      drawer.classList.toggle('open', this._mobileDrawerOpen);
      backdrop.classList.toggle('open', this._mobileDrawerOpen);
    }
  }

  render() {
    const hasBadgeAttr = this.hasAttribute('app-badge');
    const badgeAttr = this.getAttribute('app-badge');
    const noBadge = this.hasAttribute('no-badge') || (hasBadgeAttr && (!badgeAttr || badgeAttr === 'none'));
    const rawBadge = noBadge ? '' : (badgeAttr || AppState.get('appBadge') || 'cortex');
    const isCortexLogo = !rawBadge || rawBadge === 'cortex' || rawBadge === 'Id' || rawBadge === 'cx' || rawBadge === 'default';
    const showDocs = !this.hasAttribute('no-docs');
    const showLogin = !this.hasAttribute('no-login');
    const showPresets = !this.hasAttribute('no-presets') && !this.hasAttribute('no-preset');
    const showSearch = !this.hasAttribute('no-search');
    const preset = AppState.get('workspacePreset') || 'Essentials';
    const currentTheme = AppState.get('theme') || 'dark';
    const currentLang = getLanguage();
    const menus = this.menus;

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block !important;
          width: 100% !important;
          height: var(--menubar-height, 30px) !important;
          min-height: var(--menubar-height, 30px) !important;
          max-height: var(--menubar-height, 30px) !important;
          background-color: var(--bg-panel, #252526) !important;
          border-bottom: 1px solid var(--border-subtle, #333337) !important;
          box-sizing: border-box !important;
          position: relative !important;
          z-index: 1000 !important;
        }

        .menubar-bar {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          width: 100% !important;
          height: 100% !important;
          padding: 0 10px !important;
          box-sizing: border-box !important;
          position: relative !important;
        }

        .left-zone {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 2px !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
        }

        /* Emblema & Logo Oficial FrameworkCortexUI */
        .app-badge-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          padding: 0;
          margin-right: 8px;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform var(--transition-fast), filter var(--transition-fast);
        }

        .app-badge-btn:hover {
          transform: scale(1.08);
          filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.6));
        }

        .cortex-logo-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 5px;
          background: linear-gradient(135deg, #09090b 0%, #18181b 100%);
          border: 1px solid rgba(56, 189, 248, 0.4);
          box-shadow: 0 0 8px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          position: relative;
          overflow: hidden;
        }

        .app-badge-custom {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          border-radius: 4px;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          border: 1px solid #6366f1;
          color: #a5b4fc;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: -0.02em;
        }

        .menu-list {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 1px;
        }

        .menu-root-item {
          position: relative;
        }

        .menu-trigger {
          padding: 4px 8px;
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          font-size: var(--text-xs);
          transition: background var(--transition-fast);
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .menu-trigger:hover {
          background-color: var(--bg-hover);
        }

        .menu-root-item.open .menu-trigger {
          background-color: var(--accent-blue);
          color: #ffffff;
        }

        /* Menu Suspenso (Dropdown Desktop Fiel à Referência — sobrepõe todas as janelas internas) */
        .dropdown {
          display: none;
          position: absolute;
          top: calc(100% + 2px);
          left: 0;
          min-width: 215px;
          background-color: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-dropdown);
          padding: 4px 0;
          list-style: none;
          margin: 0;
          z-index: 8500;
        }

        .menu-root-item.open .dropdown {
          display: block;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 6px 14px;
          color: var(--text-primary);
          font-size: var(--text-xs);
          text-align: left;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background-color: var(--accent-blue);
          color: #ffffff;
        }

        .shortcut {
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--text-muted);
          margin-left: 24px;
        }

        .dropdown-item:hover .shortcut {
          color: rgba(255, 255, 255, 0.9);
        }

        .divider {
          height: 1px;
          background-color: var(--border-subtle);
          margin: 4px 0;
        }

        .window-title {
          position: absolute !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%) !important;
          color: var(--text-primary, #d1d5db) !important;
          font-size: 11.5px !important;
          font-weight: 600 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          text-align: center !important;
          pointer-events: none !important;
          max-width: 45vw !important;
          padding: 2px 14px !important;
          background: var(--bg-elevated, rgba(255, 255, 255, 0.05)) !important;
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1)) !important;
          border-radius: 12px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
          letter-spacing: 0.2px !important;
          z-index: 10 !important;
        }

        .right-zone {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 6px !important;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          margin-left: auto !important;
          z-index: 20 !important;
        }

        .workspace-select {
          background-color: var(--bg-input);
          color: var(--text-primary);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          font-size: 11px;
          padding: 2px 6px;
          height: 21px;
          outline: none;
          cursor: pointer;
        }

        .workspace-select:focus {
          border-color: var(--border-focus);
        }

        .search-box {
          display: flex;
          align-items: center;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          padding: 0 6px;
          height: 21px;
          width: 110px;
          transition: width var(--transition-fast), border-color var(--transition-fast);
        }

        .search-box:focus-within {
          width: 155px;
          border-color: var(--border-focus);
        }

        .search-box input {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 11px;
          outline: none;
        }

        .search-box input::placeholder {
          color: var(--text-muted);
        }

        .search-icon {
          font-size: 10px;
          color: var(--accent-blue);
          margin-left: 4px;
        }

        /* Mobile Hamburger & Off-Canvas */
        .hamburger-btn {
          display: none;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-xs);
          color: var(--text-primary);
        }

        .mobile-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: var(--bg-backdrop);
          z-index: 400;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: min(82vw, 290px);
          background: var(--bg-panel);
          border-right: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-dropdown);
          z-index: 410;
          transform: translateX(-100%);
          transition: transform var(--transition-normal);
          padding: var(--space-3);
          overflow-y: auto;
        }

        .mobile-drawer.open {
          transform: translateX(0);
        }

        .mobile-backdrop.open {
          display: block;
        }

        .mobile-group-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin: 10px 0 4px;
        }

        /* Responsividade para Telas Menores e Médias */
        @media (max-width: 980px) {
          .window-title {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .menu-list,
          .workspace-select.layout-select,
          .search-box,
          [data-action="open-docs"] {
            display: none !important;
          }
          .hamburger-btn {
            display: inline-flex !important;
          }
          .window-title {
            display: none !important;
          }
        }

        @media (max-width: 580px) {
          [data-action="open-login"] {
            display: none !important;
          }
          .workspace-select.theme-select {
            max-width: 120px;
          }
        }
      </style>

      <header class="menubar-bar">
      <!-- Esquerda: App Icon + Barra de Menus -->
      <div class="left-zone">
        <button class="hamburger-btn" aria-label="Menu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        ${
          noBadge
            ? ''
            : isCortexLogo
            ? `
          <button class="app-badge-btn" title="Framework CortexUI — Design &amp; Architecture" aria-label="CortexUI Logo">
            <span class="cortex-logo-badge">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cortexGradBar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00f2fe" />
                    <stop offset="60%" stop-color="#38bdf8" />
                    <stop offset="100%" stop-color="#818cf8" />
                  </linearGradient>
                  <linearGradient id="cortexGradBar2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#f43f5e" />
                    <stop offset="100%" stop-color="#c084fc" />
                  </linearGradient>
                </defs>
                <!-- Anel Órbita Neural C -->
                <path d="M 23 8 C 17.5 4.5 10 5.5 6.5 11 C 3.2 16.2 4.2 23 9.5 26.5 C 15 30 22 28.5 25.5 23" 
                      stroke="url(#cortexGradBar)" stroke-width="3" stroke-linecap="round" />
                <!-- Cruz / Vértice X -->
                <path d="M 17 11 L 26 21 M 26 11 L 17 21" 
                      stroke="url(#cortexGradBar2)" stroke-width="2.8" stroke-linecap="round" />
                <!-- Nó Sináptico Brilhante -->
                <circle cx="8" cy="15" r="2.8" fill="#00f2fe" />
                <circle cx="21.5" cy="16" r="1.8" fill="#ffffff" />
              </svg>
            </span>
          </button>`
            : `
          <button class="app-badge-btn" title="Aplicação: ${rawBadge}" aria-label="${rawBadge}">
            <span class="app-badge-custom">${rawBadge}</span>
          </button>`
        }

        <ul class="menu-list" role="menubar">
          ${menus
            .map(
              (menu) => `
            <li class="menu-root-item" data-menu-id="${menu.id}" role="none">
              <button class="menu-trigger" role="menuitem" aria-haspopup="true" aria-expanded="false">
                ${menu.label}
              </button>
              <ul class="dropdown" role="menu">
                ${menu.items
                  .map((item) =>
                    item.type === 'divider'
                      ? `<li class="divider" role="separator"></li>`
                      : `
                      <li role="none">
                        <button class="dropdown-item" role="menuitem" data-action="${item.action}">
                          <span>${item.label}</span>
                          <span class="shortcut">${item.shortcut || ''}</span>
                        </button>
                      </li>`
                  )
                  .join('')}
              </ul>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>

      <!-- Centro: Título do Documento/Aplicação -->
      <div class="window-title">${this._getComputedTitle()}</div>

      <!-- Direita: Botão Idioma + Botão Docs + Botão Showcase Login + Seletor de Tema + Seletor de Workspace + Busca -->
      <div class="right-zone">
        <button
          class="menu-trigger lang-toggle-btn"
          data-action="toggle-lang"
          style="background: var(--bg-input); border: 1px solid var(--border-input); color: var(--text-primary); font-weight: 700; height: 21px; padding: 0 7px; display: inline-flex; align-items: center; gap: 4px; box-shadow: var(--btn-bevel-shadow); cursor: pointer;"
          title="${t('lang.label')}: ${currentLang === 'pt-BR' ? 'Português (BR)' : 'English'}"
        >
          ${currentLang === 'pt-BR' ? '🇧🇷 PT' : '🇺🇸 EN'}
        </button>

        ${showDocs ? `
        <button
          class="menu-trigger"
          data-action="open-docs"
          style="background: var(--bg-input); border: 1px solid var(--border-input); color: var(--text-primary); font-weight: 600; height: 21px; padding: 0 8px; display: inline-flex; align-items: center; gap: 4px; box-shadow: var(--btn-bevel-shadow);"
          title="${currentLang === 'pt-BR' ? 'Abrir Manual Oficial &amp; Documentação de Componentes (F1)' : 'Open Official Manual &amp; Components Documentation (F1)'}"
        >
          &#128214; ${t('menubar.docs')}
        </button>` : ''}

        ${showLogin ? `
        <button
          class="menu-trigger"
          data-action="open-login"
          style="background: var(--accent-blue-alpha); border: 1px solid var(--accent-blue); color: var(--accent-text); font-weight: 600; height: 21px; padding: 0 8px; display: inline-flex; align-items: center; gap: 4px; box-shadow: var(--btn-bevel-shadow);"
          title="${currentLang === 'pt-BR' ? 'Visualizar os 10 Modelos de Tela de Login do CortexUI' : 'View CortexUI 10 Login Screen Models'}"
        >
          &#128274; ${t('menubar.login')}
        </button>` : ''}

        <select class="workspace-select theme-select" aria-label="CortexUI Theme" title="${currentLang === 'pt-BR' ? 'Alternar Tema Visual da Aplicação (12 Temas)' : 'Switch Visual Application Theme (12 Themes)'}">
          <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>&#127769; ${currentLang === 'pt-BR' ? 'Tema: Dark Pro (Padrão)' : 'Theme: Dark Pro (Default)'}</option>
          <option value="hacker" ${currentTheme === 'hacker' ? 'selected' : ''}>&#128126; ${currentLang === 'pt-BR' ? 'Tema: Hacker Terminal' : 'Theme: Hacker Terminal'}</option>
          <option value="futuristic" ${currentTheme === 'futuristic' ? 'selected' : ''}>&#128640; ${currentLang === 'pt-BR' ? 'Tema: Ultra-Futurista 2099' : 'Theme: Ultra-Futuristic 2099'}</option>
          <option value="macos-light" ${currentTheme === 'macos-light' ? 'selected' : ''}>&#63743; ${currentLang === 'pt-BR' ? 'Tema: macOS Claro' : 'Theme: macOS Light'}</option>
          <option value="macos-ventura" ${currentTheme === 'macos-ventura' ? 'selected' : ''}>&#127749; ${currentLang === 'pt-BR' ? 'Tema: macOS Ventura' : 'Theme: macOS Ventura'}</option>
          <option value="medium-green" ${currentTheme === 'medium-green' ? 'selected' : ''}>&#127807; ${currentLang === 'pt-BR' ? 'Tema: Médio Verde' : 'Theme: Medium Green'}</option>
          <option value="medium-blue" ${currentTheme === 'medium-blue' ? 'selected' : ''}>&#127754; ${currentLang === 'pt-BR' ? 'Tema: Médio Azul' : 'Theme: Medium Blue'}</option>
          <option value="win12" ${currentTheme === 'win12' ? 'selected' : ''}>&#128160; ${currentLang === 'pt-BR' ? 'Tema: Windows 12' : 'Theme: Windows 12'}</option>
          <option value="winxp" ${currentTheme === 'winxp' ? 'selected' : ''}>&#129695; ${currentLang === 'pt-BR' ? 'Tema: Windows XP' : 'Theme: Windows XP'}</option>
          <option value="win2000" ${currentTheme === 'win2000' ? 'selected' : ''}>&#128421; ${currentLang === 'pt-BR' ? 'Tema: Windows 2000' : 'Theme: Windows 2000'}</option>
          <option value="win98" ${currentTheme === 'win98' ? 'selected' : ''}>&#128190; ${currentLang === 'pt-BR' ? 'Tema: Windows 98 SE' : 'Theme: Windows 98 SE'}</option>
          <option value="msdos" ${currentTheme === 'msdos' ? 'selected' : ''}>&#9000; ${currentLang === 'pt-BR' ? 'Tema: MS-DOS (EDIT.COM)' : 'Theme: MS-DOS (EDIT.COM)'}</option>
        </select>

        ${showPresets ? `
        <select class="workspace-select layout-select" aria-label="Workspace Layout">
          <option value="Essentials" ${preset === 'Essentials' ? 'selected' : ''}>Essentials</option>
          <option value="Advanced" ${preset === 'Advanced' ? 'selected' : ''}>Advanced</option>
          <option value="Compact" ${preset === 'Compact' ? 'selected' : ''}>Compact</option>
        </select>` : ''}

        ${showSearch ? `
        <label class="search-box" aria-label="Search Commands">
          <input type="text" placeholder="${t('common.search')}" />
          <span class="search-icon">&#128269;</span>
        </label>` : ''}
      </div>
      </header>

      <!-- Gaveta Mobile (Off-Canvas) -->
      <div class="mobile-backdrop"></div>
      <aside class="mobile-drawer" aria-label="Mobile Navigation">
        ${menus
          .map(
            (menu) => `
          <div class="mobile-group">
            <div class="mobile-group-title">${menu.label}</div>
            ${menu.items
              .filter((i) => i.type !== 'divider')
              .map(
                (item) => `
                <button class="dropdown-item" data-action="${item.action}">
                  <span>${item.label}</span>
                  <span class="shortcut">${item.shortcut || ''}</span>
                </button>
              `
              )
              .join('')}
          </div>
        `
          )
          .join('')}
      </aside>
    `;

    this.shadowRoot.querySelectorAll('.menu-root-item').forEach((item) => {
      const menuId = item.dataset.menuId;
      const trigger = item.querySelector('.menu-trigger');

      trigger.addEventListener('click', () => {
        this._activeMenuId = this._activeMenuId === menuId ? null : menuId;
        this._syncMenuDOM();
      });

      item.addEventListener('mouseenter', () => {
        if (this._activeMenuId !== null && this._activeMenuId !== menuId) {
          this._activeMenuId = menuId;
          this._syncMenuDOM();
        }
      });
    });

    this.shadowRoot.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._triggerAction(btn.dataset.action);
      });
    });

    const themeSelect = this.shadowRoot.querySelector('.theme-select');
    themeSelect?.addEventListener('change', (e) => {
      const nextTheme = e.target.value;
      AppState.setState({ theme: nextTheme });
      this.emit('cortex-theme-change', { theme: nextTheme });
    });

    const wsSelect = this.shadowRoot.querySelector('.layout-select');
    wsSelect?.addEventListener('change', (e) => {
      const val = e.target.value;
      AppState.setState({
        workspacePreset: val,
        inspectorCollapsed: val === 'Compact'
      });
      this.emit('cortex-workspace-preset', { preset: val });
    });

    const searchInput = this.shadowRoot.querySelector('.search-box input');
    searchInput?.addEventListener('focus', () => {
      searchInput.blur();
      this.emit('cortex-menu-action', { action: 'open-palette' });
    });

    const hamburger = this.shadowRoot.querySelector('.hamburger-btn');
    const backdrop = this.shadowRoot.querySelector('.mobile-backdrop');

    hamburger.addEventListener('click', () => {
      this._mobileDrawerOpen = !this._mobileDrawerOpen;
      this._syncMenuDOM();
    });

    backdrop.addEventListener('click', () => {
      this._closeAllMenus();
    });
  }
}

customElements.define('cortex-menubar', CortexMenubar);
