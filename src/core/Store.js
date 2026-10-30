// src/core/Store.js
import { EventBus } from './EventBus.js';

class CortexStore {
  constructor(initialState = {}) {
    this._state = { ...initialState };
    this._listeners = new Map(); // key -> Set<callback>
    this._globalListeners = new Set();
    this._undoStack = [];
    this._redoStack = [];
    this._maxHistory = 50;
  }

  get state() {
    return this._state;
  }

  get(key) {
    return this._state[key];
  }

  /**
   * Atualiza uma ou mais chaves do estado e emite eventos no Store e no EventBus central.
   * @param {Object} partialState
   */
  setState(partialState) {
    const changedKeys = [];

    for (const [key, value] of Object.entries(partialState)) {
      if (this._state[key] !== value) {
        this._state[key] = value;
        changedKeys.push(key);
      }
    }

    if (changedKeys.length === 0) return;

    for (const key of changedKeys) {
      const topicListeners = this._listeners.get(key);
      if (topicListeners) {
        topicListeners.forEach((cb) => cb(this._state[key], this._state));
      }
      EventBus.emit(`state:${key}`, { value: this._state[key], state: this._state });
    }

    this._globalListeners.forEach((cb) => cb(this._state, changedKeys));
    EventBus.emit('state:change', { state: this._state, changedKeys });
  }

  /**
   * Salva um snapshot da árvore de nós (DOM Virtual Interno) na pilha de Undo.
   */
  pushHistory(serializedNodes) {
    const snapshot = JSON.stringify(serializedNodes ?? this._state.sceneNodes ?? []);
    if (this._undoStack.length > 0 && this._undoStack[this._undoStack.length - 1] === snapshot) {
      return;
    }
    this._undoStack.push(snapshot);
    if (this._undoStack.length > this._maxHistory) {
      this._undoStack.shift();
    }
    this._redoStack = [];
  }

  canUndo() {
    return this._undoStack.length > 1;
  }

  canRedo() {
    return this._redoStack.length > 0;
  }

  undo() {
    if (!this.canUndo()) return null;
    const current = this._undoStack.pop();
    this._redoStack.push(current);
    const previous = JSON.parse(this._undoStack[this._undoStack.length - 1]);
    this.setState({ sceneNodes: previous, selectedNode: null, selectedNodeId: null });
    EventBus.emit('history:restore', { nodes: previous });
    return previous;
  }

  redo() {
    if (!this.canRedo()) return null;
    const nextSnapshot = this._redoStack.pop();
    this._undoStack.push(nextSnapshot);
    const restored = JSON.parse(nextSnapshot);
    this.setState({ sceneNodes: restored, selectedNode: null, selectedNodeId: null });
    EventBus.emit('history:restore', { nodes: restored });
    return restored;
  }

  /**
   * Inscreve um callback em uma ou mais chaves (ou '*' para qualquer mudança).
   */
  subscribe(keyOrKeys, callback) {
    if (keyOrKeys === '*') {
      this._globalListeners.add(callback);
      return () => this._globalListeners.delete(callback);
    }

    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    keys.forEach((k) => {
      if (!this._listeners.has(k)) {
        this._listeners.set(k, new Set());
      }
      this._listeners.get(k).add(callback);
    });

    return () => {
      keys.forEach((k) => {
        this._listeners.get(k)?.delete(callback);
      });
    };
  }

  /**
   * Alias amigável de conveniência para subscribe()
   */
  watch(keyOrKeys, callback) {
    return this.subscribe(keyOrKeys, callback);
  }
}

const savedTheme =
  (typeof localStorage !== 'undefined' && localStorage.getItem('cortex_theme')) || 'dark';

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

export const AppState = new CortexStore({
  // Identidade da Aplicação Desktop na Web e Tema Ativo
  appName: 'DesignCraft',
  appBadge: 'Id',
  workspacePreset: 'Essentials',
  theme: savedTheme, // 'dark' | 'macos-light' | 'medium-green' | 'medium-blue' | 'win2000'

  // Abas / Documentos Abertos
  openTabs: [
    { id: 'doc-1', title: 'Untitled-1', dirty: true }
  ],
  activeTabId: 'doc-1',

  // Ferramenta e Cores Ativas
  activeTool: 'select',
  fillColor: '#10b981',
  strokeColor: '#18181b',

  // Configuração da Página / Viewport
  zoom: 100,
  currentPage: 1,
  totalPages: 1,
  pagePreset: 'A4 (210 × 297 mm)',
  pageWidthMm: 210,
  pageHeightMm: 297,
  orientation: 'portrait',
  facingPages: true,
  marginTopMm: 12.7,
  marginBottomMm: 12.7,
  marginLeftMm: 12.7,
  marginRightMm: 12.7,

  // Auxiliares Visuais
  showRulers: true,
  showGuides: true,
  showGrid: false,

  // Árvore de Elementos (DOM Virtual Interno do Canvas) e Seleção
  sceneNodes: [],
  cursorX: 0,
  cursorY: 0,
  selectedNode: null,
  selectedNodeId: null,

  // Painel Lateral / Inspector
  activeInspectorTab: 'properties', // 'properties' | 'pages' | 'layers'
  inspectorCollapsed: false,

  // Status Bar (Centro e Direita)
  statusMessage: '[Basic] (working) • No errors',
  engineStatus: 'Canvas 2D Engine Ativo (60 FPS)'
});

// Sincroniza automaticamente a mudança de Tema com o atributo data-theme do HTML e localStorage
AppState.subscribe('theme', (nextTheme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', nextTheme || 'dark');
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cortex_theme', nextTheme || 'dark');
    }
  } catch (_e) {
    // Ignora caso localStorage esteja bloqueado
  }
});
