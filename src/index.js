// src/index.js
import { AppState } from './core/Store.js';
import { EventBus } from './core/EventBus.js';
import { CortexMask, CortexValidator, AppRouter } from './core/RouterAndUtils.js';
import { CortexModal } from './components/cortex-modal.js';
import { I18n, t, tx, setLanguage, getLanguage, toggleLanguage } from './core/i18n.js';
import './components/cortex-widgets.js';
import './components/cortex-enterprise-views.js';
import './components/cortex-planning-views.js';
import './components/cortex-document-management.js';
import './components/cortex-chat.js';
import './components/cortex-menubar.js';
import './components/cortex-tabbar.js';
import './components/cortex-toolbar.js';
import './components/cortex-workspace.js';
import './components/cortex-inspector.js';
import './components/cortex-statusbar.js';
import './components/cortex-color-picker.js';
import './components/cortex-font-picker.js';
import './components/cortex-context-menu.js';
import './components/cortex-command-palette.js';
import './components/cortex-floating-window.js';
import './components/cortex-login.js';
import './components/cortex-docs.js';

const workspaceEl = document.querySelector('cortex-workspace');
const contextMenuEl = document.querySelector('cortex-context-menu');
const commandPaletteEl = document.querySelector('cortex-command-palette');
const floatingWindowsEl = document.querySelector('cortex-floating-window');
const loginShowcaseEl = document.querySelector('cortex-login');
const docsManualEl = document.querySelector('cortex-docs');

const THEME_LABELS = {
  dark: 'Cortex Dark Pro (Padrão)',
  hacker: 'Hacker Terminal (Matrix Phosphor #00ff66)',
  futuristic: 'Ultra-Futurista (Quantum Holo-HUD 2099)',
  'macos-light': 'macOS Light (Cupertino Claro)',
  'macos-ventura': 'macOS Ventura (Poppy & Ocean)',
  'medium-green': 'Médio (Verde Suave & Cinza Escuro)',
  'medium-blue': 'Médio (Azul Suave & Cinza Escuro)',
  win12: 'Windows 12 (Fluent Lavender-Blue)',
  winxp: 'Windows XP (Luna Royal Blue & Beige)',
  win2000: 'Windows 2000 Classic (Win2000)',
  win98: 'Windows 98 SE (Classic Teal & Silver)',
  msdos: 'MS-DOS Editor (EDIT.COM VGA Text Mode)'
};

window.addEventListener('cortex-theme-change', (e) => {
  const { theme } = e.detail;
  const label = THEME_LABELS[theme] || theme;
  CortexModal.toast(`Tema aplicado: ${label}`, 'info', 2000);
});

// Ações Rápidas do Inspector
window.addEventListener('cortex-quick-action', (e) => {
  const { action } = e.detail;
  if (!workspaceEl?.engine) return;

  if (action === 'add-rect') {
    workspaceEl.engine.addDefaultRect();
    CortexModal.toast(
      `Retângulo adicionado na Página ${AppState.get('currentPage')}`,
      'success'
    );
  }
});

// Ações de Modelagem e Multi-Seleção (CorelDraw style) disparadas pelo Inspector
window.addEventListener('cortex-inspector-action', (e) => {
  const { action } = e.detail;
  if (!workspaceEl) return;
  workspaceEl._executeSelectionToolbarAction(action);
});

// Two-Way Data Binding Manual (Inspector / Color Picker / Font Picker / Layers -> CanvasEngine em 60 FPS)
window.addEventListener('cortex-update-property', (e) => {
  if (!workspaceEl?.engine) return;
  const { id, prop, key, value, commitHistory } = e.detail;
  const targetProp = prop || (key === 'fillColor' ? 'fill' : key === 'strokeColor' ? 'stroke' : key);
  if (targetProp) {
    workspaceEl.engine.updateNodeProperty(id, targetProp, value, Boolean(commitHistory));
  }
});

// Gerenciador de Camadas (<cortex-layers>) -> Seleção, Reordenação Drag & Drop e Exclusão
window.addEventListener('cortex-layer-action', (e) => {
  if (!workspaceEl?.engine) return;
  const { action, id, sourceId, targetId } = e.detail;

  switch (action) {
    case 'select': {
      const found = workspaceEl.engine.nodes.find((n) => n.id === id) || null;
      workspaceEl.engine.selectNode(found);
      break;
    }
    case 'bring-front':
      workspaceEl.engine.bringToFront();
      break;
    case 'send-back':
      workspaceEl.engine.sendToBack();
      break;
    case 'reorder':
      workspaceEl.engine.reorderNodes(sourceId, targetId);
      break;
    case 'delete':
      workspaceEl.engine.removeNode(id);
      break;
    default:
      break;
  }
});

// Menu de Contexto Nativo de Botão Direito (<cortex-context-menu>)
window.addEventListener('cortex-open-context-menu', (e) => {
  const { clientX, clientY, node } = e.detail;
  if (!contextMenuEl) return;

  if (node) {
    contextMenuEl.open(clientX, clientY, [
      { label: `Camada: ${node.name}`, action: 'focus-properties' },
      { type: 'divider' },
      { label: 'Duplicar', shortcut: 'Ctrl+D', action: 'duplicate' },
      { label: 'Trazer para Frente', shortcut: 'Ctrl+]', action: 'bring-front' },
      { label: 'Enviar para Trás', shortcut: 'Ctrl+[', action: 'send-back' },
      { type: 'divider' },
      { label: 'Excluir Elemento', shortcut: 'Del', action: 'delete', danger: true }
    ]);
  } else {
    contextMenuEl.open(clientX, clientY, [
      { label: '+ Adicionar Retângulo Aqui', shortcut: 'M', action: 'add-rect' },
      { label: '+ Inserir Quadro de Texto', shortcut: 'T', action: 'tool-text' },
      { label: '+Nova Página no Documento', shortcut: 'Ctrl+Shift+P', action: 'add-page' },
      { type: 'divider' },
      { label: 'Centralizar Página no Palco', shortcut: 'Ctrl+0', action: 'center-stage' },
      { label: 'Abrir Tabela de Dados (Data Grid)', shortcut: 'Ctrl+Alt+T', action: 'insert-table' },
      { label: 'Abrir Árvore de Objetos (TreeView)', shortcut: 'F8', action: 'open-tree' }
    ]);
  }
});

window.addEventListener('cortex-context-action', (e) => {
  const { action } = e.detail;
  if (action === 'center-stage' && workspaceEl?.engine) {
    workspaceEl.engine.centerPage(true);
    return;
  }
  if (action === 'focus-properties') {
    AppState.setState({ activeInspectorTab: 'properties', inspectorCollapsed: false });
    return;
  }
  window.dispatchEvent(new CustomEvent('cortex-menu-action', { detail: { action } }));
});

// Ações da Barra de Menus Desktop, Command Palette e Janelas Flutuantes
window.addEventListener('cortex-menu-action', async (e) => {
  const { action } = e.detail;
  if (!workspaceEl?.engine) return;

  switch (action) {
    case 'open-docs':
      docsManualEl?.open();
      break;

    case 'open-login':
      loginShowcaseEl?.open('1');
      break;

    case 'open-palette':
      commandPaletteEl?.open();
      break;

    case 'theme-dark':
      AppState.setState({ theme: 'dark' });
      CortexModal.toast('Tema alterado: Cortex Dark Pro (Padrão)', 'info', 2000);
      break;

    case 'theme-macos':
      AppState.setState({ theme: 'macos-light' });
      CortexModal.toast('Tema alterado: macOS Light (Cupertino Claro)', 'info', 2000);
      break;

    case 'theme-macos-ventura':
      AppState.setState({ theme: 'macos-ventura' });
      CortexModal.toast('Tema alterado: macOS Ventura (Poppy & Ocean)', 'info', 2000);
      break;

    case 'theme-medium-green':
      AppState.setState({ theme: 'medium-green' });
      CortexModal.toast('Tema alterado: Médio (Verde Suave & Cinza Escuro)', 'info', 2000);
      break;

    case 'theme-medium-blue':
      AppState.setState({ theme: 'medium-blue' });
      CortexModal.toast('Tema alterado: Médio (Azul Suave & Cinza Escuro)', 'info', 2000);
      break;

    case 'theme-win12':
      AppState.setState({ theme: 'win12' });
      CortexModal.toast('Tema alterado: Windows 12 (Fluent Lavender)', 'info', 2000);
      break;

    case 'theme-winxp':
      AppState.setState({ theme: 'winxp' });
      CortexModal.toast('Tema alterado: Windows XP (Luna Blue & Beige)', 'info', 2000);
      break;

    case 'theme-win2000':
      AppState.setState({ theme: 'win2000' });
      CortexModal.toast('Tema alterado: Windows 2000 Classic (Win2000)', 'info', 2000);
      break;

    case 'theme-win98':
      AppState.setState({ theme: 'win98' });
      CortexModal.toast('Tema alterado: Windows 98 SE (Teal & Silver)', 'info', 2000);
      break;

    case 'theme-msdos':
      AppState.setState({ theme: 'msdos' });
      CortexModal.toast('Tema alterado: MS-DOS Editor (EDIT.COM VGA)', 'info', 2000);
      break;

    case 'theme-hacker':
      AppState.setState({ theme: 'hacker' });
      CortexModal.toast('Tema alterado: Hacker Terminal (Matrix Phosphor #00ff66)', 'info', 2000);
      break;

    case 'theme-futuristic':
      AppState.setState({ theme: 'futuristic' });
      CortexModal.toast('Tema alterado: Ultra-Futurista (Quantum Holo-HUD 2099)', 'info', 2000);
      break;

    case 'insert-table':
    case 'open-datagrid-win':
      floatingWindowsEl?.openWindow({
        id: 'win-datagrid',
        title: 'Desktop Data Grid — Objetos do Documento',
        type: 'datatable'
      });
      break;

    case 'open-tree':
    case 'open-treeview-win':
      floatingWindowsEl?.openWindow({
        id: 'win-treeview',
        title: 'Scene TreeView Explorer',
        type: 'tree'
      });
      break;

    case 'open-planning-win':
      floatingWindowsEl?.openWindow({
        id: 'win-planning',
        title: 'CortexUI Schedulers, Kanban & Gantt',
        type: 'planning'
      });
      break;

    case 'open-office-api-win':
      floatingWindowsEl?.openWindow({
        id: 'win-office-api',
        title: 'Office File API — Word, Excel & PDF (Faturas & Balanços)',
        type: 'office-api'
      });
      break;

    case 'open-spreadsheet-win':
      floatingWindowsEl?.openWindow({
        id: 'win-spreadsheet',
        title: 'Cortex Spreadsheet — Planilha & Gráficos',
        type: 'spreadsheet'
      });
      break;

    case 'open-rich-edit-win':
      floatingWindowsEl?.openWindow({
        id: 'win-rich-edit',
        title: 'Cortex Rich Edit — Processador de Texto A4',
        type: 'rich-edit'
      });
      break;

    case 'open-file-manager-win':
      floatingWindowsEl?.openWindow({
        id: 'win-file-manager',
        title: 'Cortex File Manager — Gerenciador de Arquivos',
        type: 'file-manager'
      });
      break;

    case 'open-file-uploader-win':
      floatingWindowsEl?.openWindow({
        id: 'win-file-uploader',
        title: 'Cortex File Uploader — Drag & Drop (15 MB)',
        type: 'file-uploader'
      });
      break;

    case 'open-chat-photo-win':
      floatingWindowsEl?.openWindow({
        id: 'win-chat-photo',
        title: 'Cortex Chat (Modelo 1 — Foto / Avatar)',
        type: 'chat-photo'
      });
      break;

    case 'open-chat-initials-win':
      floatingWindowsEl?.openWindow({
        id: 'win-chat-initials',
        title: 'Cortex Chat (Modelo 2 — Iniciais Monograma)',
        type: 'chat-initials'
      });
      break;

    case 'open-chat-showcase-win':
      floatingWindowsEl?.openWindow({
        id: 'win-chat-showcase',
        title: 'Cortex Chats Showcase — Modelo 1 (Foto) & Modelo 2 (Iniciais)',
        type: 'chat-showcase'
      });
      break;

    case 'boolean-union':
      workspaceEl?._executeSelectionToolbarAction('union');
      break;

    case 'boolean-intersect':
      workspaceEl?._executeSelectionToolbarAction('intersect');
      break;

    case 'boolean-subtract':
      workspaceEl?._executeSelectionToolbarAction('subtract');
      break;

    case 'boolean-exclude':
      workspaceEl?._executeSelectionToolbarAction('exclude');
      break;

    case 'add-page': {
      const nextTotal = (AppState.get('totalPages') || 1) + 1;
      AppState.setState({ totalPages: nextTotal, currentPage: nextTotal });
      CortexModal.toast(`Página ${nextTotal} criada e selecionada`, 'info');
      break;
    }

    case 'add-rect':
      workspaceEl.engine.addDefaultRect();
      CortexModal.toast(`Retângulo adicionado na Página ${AppState.get('currentPage')}`, 'success');
      break;

    case 'tool-pen':
      AppState.setState({ activeTool: 'pen' });
      break;

    case 'new-doc': {
      const formResult = await CortexModal.form({
        title: 'New Document',
        message: 'Configure os parâmetros do novo documento Desktop:',
        fields: [
          {
            name: 'title',
            label: 'Nome:',
            type: 'text',
            value: `Untitled-${AppState.get('openTabs').length + 1}`
          },
          {
            name: 'preset',
            label: 'Formato:',
            type: 'select',
            value: AppState.get('pagePreset'),
            options: [
              'A4 (210 × 297 mm)',
              'Letter (215.9 × 279.4 mm)',
              'Web 1080p (508 × 285.7 mm)'
            ]
          },
          { name: 'widthMm', label: 'Largura (mm):', type: 'number', value: 210 },
          { name: 'heightMm', label: 'Altura (mm):', type: 'number', value: 297 },
          { name: 'facingPages', label: 'Facing Pages', type: 'checkbox', value: true }
        ],
        confirmText: 'Criar Documento'
      });

      if (formResult) {
        const tabs = [...AppState.get('openTabs')];
        const newTab = {
          id: `doc-${Date.now()}`,
          title: formResult.title || 'Untitled',
          dirty: true
        };
        tabs.push(newTab);
        AppState.setState({
          openTabs: tabs,
          activeTabId: newTab.id,
          pagePreset: formResult.preset,
          pageWidthMm: formResult.widthMm || 210,
          pageHeightMm: formResult.heightMm || 297,
          facingPages: Boolean(formResult.facingPages)
        });
        workspaceEl.engine.centerPage(true);
        CortexModal.toast(`Documento "${newTab.title}" criado`, 'success');
      }
      break;
    }

    case 'margins-guides': {
      const margins = await CortexModal.form({
        title: 'Margins and Columns',
        message: 'Defina as margens da página em milímetros (mm):',
        fields: [
          { name: 'top', label: 'Topo (mm):', type: 'number', value: AppState.get('marginTopMm'), step: 0.5 },
          { name: 'bottom', label: 'Base (mm):', type: 'number', value: AppState.get('marginBottomMm'), step: 0.5 },
          { name: 'left', label: 'Esquerda (mm):', type: 'number', value: AppState.get('marginLeftMm'), step: 0.5 },
          { name: 'right', label: 'Direita (mm):', type: 'number', value: AppState.get('marginRightMm'), step: 0.5 }
        ],
        confirmText: 'Aplicar Margens'
      });

      if (margins) {
        AppState.setState({
          marginTopMm: margins.top,
          marginBottomMm: margins.bottom,
          marginLeftMm: margins.left,
          marginRightMm: margins.right
        });
        CortexModal.toast('Margens atualizadas', 'info');
      }
      break;
    }

    case 'save-json': {
      const json = workspaceEl.engine.exportSceneJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${AppState.get('appName') || 'document'}.cortex.json`;
      a.click();
      URL.revokeObjectURL(url);
      CortexModal.toast('Projeto exportado em JSON com sucesso!', 'success');
      break;
    }

    case 'open-json': {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          workspaceEl.engine.importSceneJSON(text);
          CortexModal.toast(`Arquivo "${file.name}" importado!`, 'success');
        } catch (err) {
          await CortexModal.alert({
            title: 'Erro ao Importar JSON',
            message: `O arquivo selecionado não é um documento CortexUI válido (${err.message}).`,
            type: 'error'
          });
        }
      });
      input.click();
      break;
    }

    case 'export-image': {
      const dataUrl = workspaceEl.engine.canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'cortex-stage.png';
      a.click();
      CortexModal.toast('Imagem PNG exportada!', 'success');
      break;
    }

    case 'undo':
      if (AppState.canUndo()) {
        AppState.undo();
        CortexModal.toast('Ação desfeita (Undo)', 'info', 1600);
      }
      break;

    case 'redo':
      if (AppState.canRedo()) {
        AppState.redo();
        CortexModal.toast('Ação refeita (Redo)', 'info', 1600);
      }
      break;

    case 'bring-front':
      workspaceEl.engine.bringToFront();
      break;

    case 'send-back':
      workspaceEl.engine.sendToBack();
      break;

    case 'delete': {
      if (!workspaceEl.engine.selectedNode) {
        await CortexModal.alert({
          title: 'Nenhum Elemento Selecionado',
          message: 'Selecione primeiro uma forma, linha ou texto no palco para excluí-lo.',
          type: 'warning'
        });
        return;
      }
      const confirmed = await CortexModal.confirm({
        title: 'Excluir Elemento',
        message: `Deseja realmente excluir "${workspaceEl.engine.selectedNode.name}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        danger: true
      });
      if (confirmed) {
        workspaceEl.engine.removeNode(workspaceEl.engine.selectedNode.id);
        CortexModal.toast('Elemento removido', 'info');
      }
      break;
    }

    case 'duplicate': {
      if (!workspaceEl.engine.selectedNode) return;
      const cloneData = {
        ...workspaceEl.engine.selectedNode.toJSON(),
        id: undefined,
        page: Number(AppState.get('currentPage')) || 1,
        x: workspaceEl.engine.selectedNode.x + 20,
        y: workspaceEl.engine.selectedNode.y + 20
      };
      workspaceEl.engine.importSceneJSON({
        nodes: [...workspaceEl.engine.nodes.map((n) => n.toJSON()), cloneData]
      });
      break;
    }

    case 'about': {
      await CortexModal.alert({
        title: 'About CortexUI Framework',
        message:
          'CortexUI v4.0 — Framework Web de estética Desktop com Web Components, Store Reativo, Motor Canvas 2D DPR, Color Picker HSV 2D, Font Picker, Context Menu, Command Palette (Ctrl+K) e Janelas Flutuantes MDI.',
        type: 'info'
      });
      break;
    }

    default:
      break;
  }
});

window.CortexUI = {
  AppState,
  EventBus,
  CortexModal,
  CortexMask,
  CortexValidator,
  AppRouter,
  I18n,
  t,
  tx,
  setLanguage,
  getLanguage,
  toggleLanguage
};

// Suporte automático caso o servidor SPA redirecione /docs ou #docs para index.html
if (
  window.location.pathname.endsWith('/docs') ||
  window.location.pathname.endsWith('/docs/') ||
  window.location.hash === '#docs' ||
  new URLSearchParams(window.location.search).has('docs')
) {
  docsManualEl?.open();
}
