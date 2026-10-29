// src/engine/CanvasEngine.js
import { AppState } from '../core/Store.js';
import { EventBus } from '../core/EventBus.js';
import {
  CortexRect,
  CortexLine,
  CortexText,
  CortexPath,
  createNodeFromJSON
} from './nodes/index.js';

// Fator de conversão milímetros -> unidades lógicas de página (96 DPI / 25.4 ≈ 3.7795 px/mm)
export const MM_TO_PX = 3.7795275591;

export class CanvasEngine {
  constructor(canvas, rulerRenderer = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.rulerRenderer = rulerRenderer;

    // Estado de Viewport e Alta Densidade (DPR)
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this.viewportWidth = 1;
    this.viewportHeight = 1;

    // Câmera 2D: (panX, panY) representam a posição na tela da origem (0, 0) da Folha
    this.panX = 0;
    this.panY = 0;
    this.zoomScale = 1; // 1.0 = 100%

    // Árvore de Elementos (DOM Virtual Interno do Canvas)
    this.nodes = [];
    this.selectedNode = null;
    this._tabDocuments = new Map(); // tabId -> { nodes, currentPage, totalPages }
    this._currentTabId = AppState.get('activeTabId') || 'doc-1';

    // Controle de Dirty Flag (Redesenha apenas quando necessário)
    this._isDirty = false;
    this._rafId = null;
    this._hasCenteredInitially = false;

    // Escuta restaurações de Undo/Redo vindas do Store
    this._unsubHistory = EventBus.on('history:restore', ({ nodes }) => {
      this.nodes = (nodes || []).map((n) => createNodeFromJSON(n));
      this.selectedNode = null;
      this.requestRender();
    });

    // Alterna os objetos e páginas quando o usuário troca de Aba no <cortex-tabbar>
    this._unsubTabChange = AppState.subscribe('activeTabId', (nextTabId) => {
      if (!nextTabId || nextTabId === this._currentTabId) return;
      this._tabDocuments.set(this._currentTabId, {
        nodes: this.nodes.map((n) => n.toJSON()),
        currentPage: AppState.get('currentPage') || 1,
        totalPages: AppState.get('totalPages') || 1
      });

      this._currentTabId = nextTabId;
      const savedDoc = this._tabDocuments.get(nextTabId);
      if (savedDoc) {
        this.nodes = savedDoc.nodes.map((n) => createNodeFromJSON(n));
        this.selectedNode = null;
        AppState.setState({
          currentPage: savedDoc.currentPage,
          totalPages: savedDoc.totalPages
        });
      } else {
        this.nodes = [];
        this.selectedNode = null;
        AppState.setState({
          currentPage: 1,
          totalPages: 1
        });
      }
      this.syncSceneState(false);
    });

    // Redesenha o palco e as réguas instantaneamente quando o Tema Desktop mudar
    this._unsubThemeChange = AppState.subscribe('theme', () => {
      requestAnimationFrame(() => this.requestRender());
    });

    // Salva estado inicial vazio na pilha de histórico
    AppState.pushHistory([]);
  }

  /**
   * Retorna as dimensões lógicas da página atual em pixels (World Space).
   */
  getPageDimensionsPx() {
    const wMm = Number(AppState.get('pageWidthMm') || 210);
    const hMm = Number(AppState.get('pageHeightMm') || 297);
    return {
      width: Math.round(wMm * MM_TO_PX),
      height: Math.round(hMm * MM_TO_PX)
    };
  }

  /**
   * Sincroniza a Árvore de Elementos (DOM Virtual Interno) com o Store Reativo e EventBus.
   */
  syncSceneState(recordHistory = false) {
    // Ordena por zIndex crescente
    this.nodes.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    const serialized = this.nodes.map((n) => n.toJSON());

    AppState.setState({
      sceneNodes: serialized,
      selectedNode: this.selectedNode ? this.selectedNode.toJSON() : null,
      selectedNodeId: this.selectedNode ? this.selectedNode.id : null
    });

    if (recordHistory) {
      AppState.pushHistory(serialized);
    }

    EventBus.emit('scene:updated', {
      nodes: serialized,
      selectedNode: this.selectedNode ? this.selectedNode.toJSON() : null
    });
    this.requestRender();
  }

  /**
   * Ajusta o tamanho físico do canvas com Device Pixel Ratio (Retina / 4K / Mobile).
   */
  resize(cssWidth, cssHeight) {
    const nextW = Math.max(1, Math.floor(cssWidth));
    const nextH = Math.max(1, Math.floor(cssHeight));
    const nextDpr = Math.max(1, window.devicePixelRatio || 1);

    const prevW = this.viewportWidth;
    const prevH = this.viewportHeight;

    this.viewportWidth = nextW;
    this.viewportHeight = nextH;
    this.dpr = nextDpr;

    this.canvas.width = Math.floor(nextW * nextDpr);
    this.canvas.height = Math.floor(nextH * nextDpr);
    this.canvas.style.width = `${nextW}px`;
    this.canvas.style.height = `${nextH}px`;

    if (this.rulerRenderer) {
      this.rulerRenderer.resize(nextW, nextH, nextDpr);
    }

    if (!this._hasCenteredInitially && nextW > 50 && nextH > 50) {
      this._hasCenteredInitially = true;
      this.centerPage();
    } else if (prevW > 1 && prevH > 1) {
      this.panX += (nextW - prevW) / 2;
      this.panY += (nextH - prevH) / 2;
    }

    this.requestRender();
  }

  /**
   * Centraliza a página ativa no meio do palco.
   */
  centerPage(fitToView = true) {
    const page = this.getPageDimensionsPx();

    if (fitToView && this.viewportWidth > 100 && this.viewportHeight > 100) {
      const padding = 96;
      const scaleX = (this.viewportWidth - padding) / page.width;
      const scaleY = (this.viewportHeight - padding) / page.height;
      const idealScale = Math.min(1, Math.max(0.25, Math.min(scaleX, scaleY)));
      const roundedPercent = Math.round(idealScale * 100);
      this.zoomScale = roundedPercent / 100;
      AppState.setState({ zoom: roundedPercent });
    }

    this.panX = Math.round((this.viewportWidth - page.width * this.zoomScale) / 2);
    this.panY = Math.round((this.viewportHeight - page.height * this.zoomScale) / 2);
    this.requestRender();
  }

  /**
   * Aplica zoom mantendo fixo um ponto de ancoragem na tela.
   */
  zoomAtScreenPoint(nextZoomPercent, screenX, screenY) {
    const clampedPercent = Math.min(400, Math.max(25, Math.round(nextZoomPercent)));
    const nextScale = clampedPercent / 100;

    const worldPt = this.screenToWorld(screenX, screenY);

    this.zoomScale = nextScale;
    this.panX = screenX - worldPt.x * this.zoomScale;
    this.panY = screenY - worldPt.y * this.zoomScale;

    if (AppState.get('zoom') !== clampedPercent) {
      AppState.setState({ zoom: clampedPercent });
    }
    this.requestRender();
  }

  setZoomFromState(zoomPercent) {
    const targetScale = zoomPercent / 100;
    if (Math.abs(targetScale - this.zoomScale) < 0.001) return;
    this.zoomAtScreenPoint(zoomPercent, this.viewportWidth / 2, this.viewportHeight / 2);
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.panX) / this.zoomScale,
      y: (screenY - this.panY) / this.zoomScale
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: this.panX + worldX * this.zoomScale,
      y: this.panY + worldY * this.zoomScale
    };
  }

  /**
   * Adiciona um objeto gráfico (CortexRect, CortexLine, CortexText, CortexPath) na página ativa.
   */
  addNode(node, selectAfterAdd = true, recordHistory = true) {
    const activePage = Number(AppState.get('currentPage')) || 1;
    node.page = Number(node.page) || activePage;

    const maxZ = this.nodes.reduce((max, n) => Math.max(max, n.zIndex || 0), 0);
    node.zIndex = maxZ + 1;

    this.nodes.push(node);
    if (selectAfterAdd) {
      this.selectedNode = node;
    }
    this.syncSceneState(recordHistory);
    return node;
  }

  /**
   * Remove um nó gráfico pelo ID ou o nó atualmente selecionado.
   */
  removeNode(nodeId = this.selectedNode?.id) {
    if (!nodeId) return;
    this.nodes = this.nodes.filter((n) => n.id !== nodeId);
    if (this.selectedNode?.id === nodeId) {
      this.selectedNode = null;
    }
    this.syncSceneState(true);
  }

  /**
   * Atualiza uma propriedade de qualquer nó em tempo real (Two-Way Data Binding 60 FPS).
   */
  updateNodeProperty(nodeId, prop, value, commitHistory = false) {
    const target =
      (this.selectedNode && this.selectedNode.id === nodeId
        ? this.selectedNode
        : this.nodes.find((n) => n.id === nodeId)) || this.selectedNode;

    if (!target) return;

    target[prop] = value;

    if (prop === 'fill' && target === this.selectedNode) {
      AppState.setState({ fillColor: value });
    } else if (prop === 'stroke' && target === this.selectedNode) {
      AppState.setState({ strokeColor: value });
    }

    this.syncSceneState(commitHistory);
  }

  /**
   * Reordena o Z-Index via Drag & Drop da lista <cortex-layers>.
   */
  reorderNodes(sourceId, targetId) {
    const sourceNode = this.nodes.find((n) => n.id === sourceId);
    const targetNode = this.nodes.find((n) => n.id === targetId);
    if (!sourceNode || !targetNode || sourceNode === targetNode) return;

    // Ordena do maior zIndex (topo visual) para o menor (base)
    const orderedDesc = [...this.nodes].sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));
    const fromIdx = orderedDesc.indexOf(sourceNode);
    const toIdx = orderedDesc.indexOf(targetNode);
    if (fromIdx === -1 || toIdx === -1) return;

    orderedDesc.splice(fromIdx, 1);
    orderedDesc.splice(toIdx, 0, sourceNode);

    // Reatribui zIndex limpos de cima para baixo
    const total = orderedDesc.length;
    orderedDesc.forEach((n, idx) => {
      n.zIndex = total - idx;
    });

    this.syncSceneState(true);
  }

  /**
   * Altera a ordem Z (Bring to Front / Send to Back) do nó selecionado.
   */
  bringToFront(node = this.selectedNode) {
    if (!node) return;
    const maxZ = this.nodes.reduce((max, n) => Math.max(max, n.zIndex || 0), 0);
    node.zIndex = maxZ + 1;
    this.syncSceneState(true);
  }

  sendToBack(node = this.selectedNode) {
    if (!node) return;
    const minZ = this.nodes.reduce((min, n) => Math.min(min, n.zIndex || 0), 0);
    node.zIndex = minZ - 1;
    this.syncSceneState(true);
  }

  /**
   * Cria rapidamente um retângulo padrão no centro da folha ativa (currentPage).
   */
  addDefaultRect() {
    const page = this.getPageDimensionsPx();
    const activePage = Number(AppState.get('currentPage')) || 1;
    const nodesOnActivePage = this.nodes.filter((n) => Number(n.page) === activePage);
    const w = 180;
    const h = 120;
    const offset = (nodesOnActivePage.length % 6) * 18;
    const rect = new CortexRect({
      page: activePage,
      x: Math.round((page.width - w) / 2 + offset),
      y: Math.round((page.height - h) / 2 + offset),
      width: w,
      height: h,
      fill: AppState.get('fillColor') || '#10b981',
      stroke: AppState.get('strokeColor') || '#18181b',
      strokeWidth: 2
    });
    return this.addNode(rect, true, true);
  }

  selectNode(nodeOrNull) {
    this.selectedNode = nodeOrNull;
    AppState.setState({
      selectedNode: nodeOrNull ? nodeOrNull.toJSON() : null,
      selectedNodeId: nodeOrNull ? nodeOrNull.id : null
    });
    EventBus.emit('node:selected', {
      node: nodeOrNull ? nodeOrNull.toJSON() : null
    });
    this.requestRender();
  }

  /**
   * Hit Detection de cima para baixo (maior Z-Index primeiro),
   * diferenciando precisão de pixel (mouse) e tolerância expandida (touch).
   */
  hitTest(worldX, worldY, pointerType = 'mouse') {
    const currentPage = Number(AppState.get('currentPage')) || 1;
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      if (Number(node.page || 1) !== currentPage) continue;
      if (node.containsPoint(this.ctx, worldX, worldY, this.zoomScale, pointerType)) {
        return node;
      }
    }
    return null;
  }

  exportSceneJSON() {
    return JSON.stringify(
      {
        version: '3.0.0',
        framework: 'CortexUI',
        document: {
          pagePreset: AppState.get('pagePreset'),
          pageWidthMm: AppState.get('pageWidthMm'),
          pageHeightMm: AppState.get('pageHeightMm'),
          orientation: AppState.get('orientation'),
          facingPages: AppState.get('facingPages'),
          totalPages: AppState.get('totalPages')
        },
        nodes: this.nodes.map((n) => n.toJSON())
      },
      null,
      2
    );
  }

  importSceneJSON(jsonString) {
    const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    if (parsed.document) {
      AppState.setState(parsed.document);
    }
    if (Array.isArray(parsed.nodes)) {
      this.nodes = parsed.nodes.map((n) => createNodeFromJSON(n));
      this.selectedNode = null;
      this.syncSceneState(true);
    }
    this.centerPage(true);
    this.requestRender();
  }

  requestRender() {
    if (this._isDirty) return;
    this._isDirty = true;
    this._rafId = requestAnimationFrame(() => {
      this._isDirty = false;
      this.render();
    });
  }

  render() {
    const ctx = this.ctx;
    const w = this.viewportWidth;
    const h = this.viewportHeight;
    if (w <= 1 || h <= 1) return;

    const page = this.getPageDimensionsPx();
    const currentPage = AppState.get('currentPage') || 1;
    const showGrid = AppState.get('showGrid');
    const showGuides = AppState.get('showGuides');
    const showRulers = AppState.get('showRulers');

    // 1. Limpa o Pasteboard com a cor do Tema Ativo
    const rootStyles = getComputedStyle(document.documentElement);
    const workspaceBg = rootStyles.getPropertyValue('--bg-workspace').trim() || '#323234';
    const workspaceFrameBg = rootStyles.getPropertyValue('--bg-workspace-frame').trim() || '#3e3e42';

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = workspaceBg;
    ctx.fillRect(0, 0, w, h);

    // 2. Aplica Matriz da Câmera
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.zoomScale, this.zoomScale);

    // 3. Moldura do Pasteboard
    const pasteboardPad = 48;
    ctx.fillStyle = workspaceFrameBg;
    ctx.fillRect(
      -pasteboardPad,
      -pasteboardPad,
      page.width + pasteboardPad * 2,
      page.height + pasteboardPad * 2
    );

    // 4. Folha Branca com Sombra
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18 / this.zoomScale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5 / this.zoomScale;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, page.width, page.height);
    ctx.restore();

    // 5. Grade Opcional
    if (showGrid) {
      this._drawDocumentGrid(ctx, page.width, page.height);
    }

    // 6. Guias de Margem Magenta
    if (showGuides) {
      this._drawMarginGuides(ctx, page.width, page.height);
    }

    // 7. Nós Gráficos da página ativa (em ordem de Z-Index)
    const activePageNum = Number(currentPage) || 1;
    for (const node of this.nodes) {
      if (Number(node.page || 1) === activePageNum) {
        node.draw(ctx);
      }
    }

    // 8. Caixa de Seleção e Alças
    if (this.selectedNode && Number(this.selectedNode.page || 1) === activePageNum) {
      this.selectedNode.drawSelection(ctx, this.zoomScale);
    }

    ctx.restore();

    // 9. Réguas
    if (this.rulerRenderer && showRulers) {
      this.rulerRenderer.render(this.panX, this.panY, this.zoomScale);
    }
  }

  _drawDocumentGrid(ctx, pageW, pageH) {
    const step = 20;
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.07)';
    ctx.lineWidth = 1 / this.zoomScale;
    ctx.beginPath();

    for (let x = step; x < pageW; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, pageH);
    }
    for (let y = step; y < pageH; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(pageW, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  _drawMarginGuides(ctx, pageW, pageH) {
    const top = Number(AppState.get('marginTopMm') ?? 12.7) * MM_TO_PX;
    const bottom = Number(AppState.get('marginBottomMm') ?? 12.7) * MM_TO_PX;
    const left = Number(AppState.get('marginLeftMm') ?? 12.7) * MM_TO_PX;
    const right = Number(AppState.get('marginRightMm') ?? 12.7) * MM_TO_PX;

    const mw = Math.max(0, pageW - left - right);
    const mh = Math.max(0, pageH - top - bottom);

    ctx.save();
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1 / this.zoomScale;
    ctx.strokeRect(left, top, mw, mh);
    ctx.restore();
  }

  destroy() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
    if (this._unsubHistory) {
      this._unsubHistory();
    }
  }
}
