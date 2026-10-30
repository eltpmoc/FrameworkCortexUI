// src/components/cortex-workspace.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';
import { RulerRenderer } from '../engine/RulerRenderer.js';
import { CanvasEngine } from '../engine/CanvasEngine.js';
import {
  CortexRect,
  CortexLine,
  CortexText,
  CortexPath,
  CortexEllipse,
  CortexPolygon,
  CortexStar,
  CortexDiamond,
  CortexArrow,
  CortexCallout
} from '../engine/nodes/index.js';
import {
  executeBooleanOnNodes,
  alignSelectedNodes,
  distributeSelectedNodes
} from '../engine/BooleanOperations.js';
import { CortexModal } from './cortex-modal.js';

export class CortexWorkspace extends CortexElement {
  constructor() {
    super();
    this.engine = null;
    this.rulers = null;
    this._resizeObserver = null;

    // Estado de Navegação Híbrida (Pointer Events + Gestos Multi-Touch)
    this._activePointers = new Map(); // pointerId -> { x, y }
    this._lastPinchDist = null;
    this._lastPinchCenter = null;

    // Estado de Interação (Pan, Move, Resize pelas Alças, Rotate, Create, Draw Path)
    this._interactionMode = null; // 'pan' | 'move-node' | 'resize-node' | 'rotate-node' | 'create-node' | 'draw-path' | null
    this._activeResizeHandle = null;
    this._dragStartScreen = { x: 0, y: 0 };
    this._dragStartWorld = { x: 0, y: 0 };
    this._initialPan = { x: 0, y: 0 };
    this._initialBounds = { x: 0, y: 0, width: 0, height: 0 };
    this._rotateCenter = { x: 0, y: 0 };
    this._initialNodeRotation = 0;
    this._dragStartAngle = 0;
    this._draftNode = null;
    this._isSpacePressed = false;
    this._didModifyScene = false;
    this._initialNodesPositions = [];
    this._marqueeInitialSelected = [];

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  onLanguageChange() {
    // CortexWorkspace não possui texto ou UI de conteúdo no Shadow DOM para recriar.
    // Preserva intactos os elementos <canvas> (palco e réguas) e todos os event listeners,
    // apenas solicitando um redraw para sincronizar o motor gráfico 2D.
    this.engine?.requestRender();
    if (AppState.get('showRulers') && this.rulers && this.engine) {
      this.rulers.render(this.engine.panX, this.engine.panY, this.engine.zoomScale);
    }
  }

  onMount() {
    const stageCanvas = this.shadowRoot.getElementById('stage-canvas');
    const rulerH = this.shadowRoot.getElementById('ruler-h');
    const rulerV = this.shadowRoot.getElementById('ruler-v');
    const stageWrap = this.shadowRoot.getElementById('stage-wrap');

    this.rulers = new RulerRenderer(rulerH, rulerV);
    this.engine = new CanvasEngine(stageCanvas, this.rulers);

    // ResizeObserver Contínuo
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.engine.resize(width, height);
        }
      }
    });
    this._resizeObserver.observe(stageWrap);

    this.watchState('zoom', (zoom) => {
      this.engine.setZoomFromState(zoom);
    });

    this.watchState('showRulers', (show) => {
      const workspaceGrid = this.shadowRoot.querySelector('.workspace-grid');
      if (workspaceGrid) {
        workspaceGrid.classList.toggle('rulers-hidden', !show);
      }
      this.engine.requestRender();
    });

    this.watchState('currentPage', (nextPage) => {
      if (this.engine?.selectedNode && Number(this.engine.selectedNode.page) !== Number(nextPage)) {
        this.engine.selectNode(null);
      }
      this.engine?.requestRender();
    });

    this.watchState(
      [
        'pageWidthMm',
        'pageHeightMm',
        'marginTopMm',
        'marginBottomMm',
        'marginLeftMm',
        'marginRightMm',
        'showGuides',
        'showGrid'
      ],
      () => {
        this.engine.requestRender();
      }
    );

    this.watchState('fillColor', (fill) => {
      if (this.engine.selectedNode && this.engine.selectedNode.fill !== fill) {
        this.engine.selectedNode.fill = fill;
        this.engine.syncSceneState(true);
      }
    });

    this.watchState('strokeColor', (stroke) => {
      if (this.engine.selectedNode && this.engine.selectedNode.stroke !== stroke) {
        this.engine.selectedNode.stroke = stroke;
        this.engine.syncSceneState(true);
      }
    });

    this.watchState('activeTool', (tool) => {
      this._updateCursor(tool);
      this.engine?.requestRender();
      this._updateFloatingToolbar();
    });

    this.watchState(['selectedNode', 'selectedNodes'], () => {
      this._updateFloatingToolbar();
    });

    this._onInspectorAction = (e) => {
      const act = e.detail?.action;
      if (!act) return;
      if (act === 'boolean-union') this._executeSelectionToolbarAction('union');
      else if (act === 'boolean-intersect') this._executeSelectionToolbarAction('intersect');
      else if (act === 'boolean-subtract') this._executeSelectionToolbarAction('subtract');
      else if (act === 'boolean-subtract-reverse') this._executeSelectionToolbarAction('subtract-reverse');
      else if (act === 'boolean-exclude') this._executeSelectionToolbarAction('exclude');
      else if (act.startsWith('align-')) this._executeSelectionToolbarAction(act);
      else if (act.startsWith('distribute-')) this._executeSelectionToolbarAction(act);
      else if (act === 'duplicate') this._executeSelectionToolbarAction('duplicate');
      else if (act === 'delete') this._executeSelectionToolbarAction('delete');
    };
    window.addEventListener('cortex-inspector-action', this._onInspectorAction);
    window.addEventListener('cortex-menu-action', this._onInspectorAction);

    this._bindStageEvents(stageCanvas);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  onUnmount() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    if (this.engine) {
      this.engine.destroy();
    }
    if (this._onInspectorAction) {
      window.removeEventListener('cortex-inspector-action', this._onInspectorAction);
      window.removeEventListener('cortex-menu-action', this._onInspectorAction);
    }
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }

  _onKeyDown(e) {
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

    if (e.code === 'Space' && !this._isSpacePressed) {
      this._isSpacePressed = true;
      this._updateCursor(AppState.get('activeTool'));
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && this.engine) {
      if (this.engine.selectedNodes && this.engine.selectedNodes.length > 0) {
        e.preventDefault();
        const ids = this.engine.selectedNodes.map((n) => n.id);
        ids.forEach((id) => this.engine.removeNode(id));
        this.engine.selectNode(null);
      } else if (this.engine.selectedNode) {
        e.preventDefault();
        this.engine.removeNode(this.engine.selectedNode.id);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      const activePage = Number(AppState.get('currentPage')) || 1;
      const pageNodes = this.engine.nodes.filter((n) => Number(n.page || 1) === activePage);
      this.engine.selectNodes(pageNodes);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      this._duplicateSelection();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        AppState.redo();
      } else {
        AppState.undo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      AppState.redo();
    }
  }

  _onKeyUp(e) {
    if (e.code === 'Space') {
      this._isSpacePressed = false;
      this._updateCursor(AppState.get('activeTool'));
    }
  }

  _updateCursor(tool, customCursor = null) {
    const canvas = this.shadowRoot.getElementById('stage-canvas');
    if (!canvas) return;

    if (customCursor) {
      canvas.style.cursor = customCursor;
    } else if (this._interactionMode === 'pan') {
      canvas.style.cursor = 'grabbing';
    } else if (this._interactionMode === 'rotate-node' || tool === 'rotate') {
      canvas.style.cursor = 'crosshair';
    } else if (this._isSpacePressed || tool === 'pan') {
      canvas.style.cursor = 'grab';
    } else if (tool === 'zoom') {
      canvas.style.cursor = 'zoom-in';
    } else if (tool === 'text') {
      canvas.style.cursor = 'text';
    } else if (tool === 'eyedropper') {
      canvas.style.cursor = 'crosshair';
    } else if (tool === 'eraser') {
      canvas.style.cursor = 'not-allowed';
    } else if (
      tool === 'rect' ||
      tool === 'rounded-rect' ||
      tool === 'ellipse' ||
      tool === 'polygon' ||
      tool === 'star' ||
      tool === 'diamond' ||
      tool === 'arrow' ||
      tool === 'callout' ||
      tool === 'line' ||
      tool === 'pen' ||
      tool === 'pencil'
    ) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = 'default';
    }
  }

  _getCanvasRelativeCoords(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  _applyHandleResize(node, handleId, worldPt) {
    const init = this._initialBounds;
    const dx = worldPt.x - this._dragStartWorld.x;
    const dy = worldPt.y - this._dragStartWorld.y;

    if (node.type === 'line') {
      if (handleId === 'start') {
        node.x = Math.round(init.x + dx);
        node.y = Math.round(init.y + dy);
        node.width = Math.round(init.width - dx);
        node.height = Math.round(init.height - dy);
      } else if (handleId === 'end') {
        node.width = Math.round(init.width + dx);
        node.height = Math.round(init.height + dy);
      }
      return;
    }

    let nextX = init.x;
    let nextY = init.y;
    let nextW = init.width;
    let nextH = init.height;

    if (handleId.includes('e')) nextW = Math.max(8, init.width + dx);
    if (handleId.includes('s')) nextH = Math.max(8, init.height + dy);
    if (handleId.includes('w')) {
      const possibleW = init.width - dx;
      if (possibleW >= 8) {
        nextX = init.x + dx;
        nextW = possibleW;
      }
    }
    if (handleId.includes('n')) {
      const possibleH = init.height - dy;
      if (possibleH >= 8) {
        nextY = init.y + dy;
        nextH = possibleH;
      }
    }

    node.x = Math.round(nextX);
    node.y = Math.round(nextY);
    node.width = Math.round(nextW);
    node.height = Math.round(nextH);
  }

  _bindStageEvents(canvas) {
    // 1. Roda do Mouse (Desktop): Ctrl+Wheel = Zoom no Cursor | Wheel = Scroll/Pan
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const pt = this._getCanvasRelativeCoords(e, canvas);

        if (e.ctrlKey || e.metaKey) {
          const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
          const nextPercent = this.engine.zoomScale * zoomFactor * 100;
          this.engine.zoomAtScreenPoint(nextPercent, pt.x, pt.y);
        } else {
          const dx = e.shiftKey ? -e.deltaY : -e.deltaX;
          const dy = e.shiftKey ? 0 : -e.deltaY;
          this.engine.panX += dx;
          this.engine.panY += dy;
          this.engine.requestRender();
        }
      },
      { passive: false }
    );

    // 2. Duplo Clique em Objeto de Texto abre o Prompt Modal Desktop para editar o conteúdo
    canvas.addEventListener('dblclick', async (e) => {
      const pt = this._getCanvasRelativeCoords(e, canvas);
      const worldPt = this.engine.screenToWorld(pt.x, pt.y);
      const hitNode = this.engine.hitTest(worldPt.x, worldPt.y, 'mouse');

      if (hitNode && hitNode.type === 'text') {
        const updatedText = await CortexModal.prompt({
          title: 'Editar Quadro de Texto',
          message: 'Digite o texto para este elemento:',
          defaultValue: hitNode.text,
          confirmText: 'Atualizar'
        });
        if (updatedText !== null && updatedText.trim() !== '') {
          hitNode.text = updatedText;
          this.engine.syncSceneState(true);
        }
      }
    });

    // 2.5 Clique com Botão Direito (Menu de Contexto Nativo Desktop)
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const pt = this._getCanvasRelativeCoords(e, canvas);
      const worldPt = this.engine.screenToWorld(pt.x, pt.y);
      const hitNode = this.engine.hitTest(worldPt.x, worldPt.y, 'mouse');
      if (hitNode && hitNode !== this.engine.selectedNode) {
        this.engine.selectNode(hitNode);
      }
      this.emit('cortex-open-context-menu', {
        clientX: e.clientX,
        clientY: e.clientY,
        worldX: Math.round(worldPt.x),
        worldY: Math.round(worldPt.y),
        node: this.engine.selectedNode ? this.engine.selectedNode.toJSON() : null
      });
    });

    // 3. Pointer Down (Mouse, Caneta ou Toque)
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button === 2) return; // Botão direito tratado pelo contextmenu
      canvas.setPointerCapture(e.pointerId);
      const pt = this._getCanvasRelativeCoords(e, canvas);
      const pointerType = e.pointerType || 'mouse';
      this._activePointers.set(e.pointerId, pt);
      this._didModifyScene = false;

      // Multi-Touch (2 Dedos: Pinch-to-Zoom + Two-Finger Pan)
      if (this._activePointers.size === 2) {
        this._interactionMode = 'touch-gesture';
        const pts = Array.from(this._activePointers.values());
        this._lastPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        this._lastPinchCenter = {
          x: (pts[0].x + pts[1].x) / 2,
          y: (pts[0].y + pts[1].y) / 2
        };
        return;
      }

      if (this._activePointers.size > 2) return;

      const worldPt = this.engine.screenToWorld(pt.x, pt.y);
      const tool = AppState.get('activeTool');

      // Pan com botão do meio, barra de espaço ou ferramenta Hand ('pan')
      if (e.button === 1 || this._isSpacePressed || tool === 'pan') {
        this._interactionMode = 'pan';
        this._dragStartScreen = pt;
        this._initialPan = { x: this.engine.panX, y: this.engine.panY };
        this._updateCursor(tool);
        return;
      }

      // Ferramenta Zoom
      if (tool === 'zoom') {
        const step = e.altKey ? -25 : 25;
        this.engine.zoomAtScreenPoint(AppState.get('zoom') + step, pt.x, pt.y);
        return;
      }

      // Ferramenta Conta-gotas (Eyedropper)
      if (tool === 'eyedropper') {
        const hitNode = this.engine.hitTest(worldPt.x, worldPt.y, pointerType);
        if (hitNode) {
          if (hitNode.fill) AppState.setState({ fillColor: hitNode.fill });
          if (hitNode.stroke) AppState.setState({ strokeColor: hitNode.stroke });
          CortexModal.toast(`Cores copiadas: ${hitNode.fill || hitNode.stroke}`, 'info', 1500);
        }
        return;
      }

      // Ferramenta Borracha (Eraser)
      if (tool === 'eraser') {
        const hitNode = this.engine.hitTest(worldPt.x, worldPt.y, pointerType);
        if (hitNode) {
          this.engine.removeNode(hitNode.id);
          CortexModal.toast('Elemento apagado', 'info', 1200);
        }
        return;
      }

      // Ferramenta Rotação Direta (Rotate Tool)
      if (tool === 'rotate') {
        let targetNode = this.engine.selectedNode;

        // Se clicou em outro nó ou não havia seleção, seleciona nó sob o cursor
        const hitNode = this.engine.hitTest(worldPt.x, worldPt.y, pointerType);
        if (hitNode && hitNode !== targetNode) {
          this.engine.selectNode(hitNode);
          targetNode = hitNode;
        }

        // Se há um nó selecionado, qualquer clique/arrasto (nas alças de ancoragem ou no corpo) gira o objeto
        if (targetNode) {
          this._interactionMode = 'rotate-node';
          const center = targetNode.getCenter();
          this._rotateCenter = center;
          const cx = center.cx ?? center.x ?? 0;
          const cy = center.cy ?? center.y ?? 0;
          this._initialNodeRotation = Number(targetNode.rotation) || 0;
          this._dragStartAngle = Math.atan2(worldPt.y - cy, worldPt.x - cx) * (180 / Math.PI);
          this._updateCursor(tool, 'crosshair');
          this.engine.requestRender();
          return;
        }
      }

      // Ferramenta Caneta Vetorial (Pen) ou Lápis Livre (Pencil)
      const activePage = Number(AppState.get('currentPage')) || 1;
      if (tool === 'pen' || tool === 'pencil') {
        this._interactionMode = 'draw-path';
        this._draftNode = new CortexPath({
          page: activePage,
          x: Math.round(worldPt.x),
          y: Math.round(worldPt.y),
          points: [{ x: 0, y: 0 }],
          stroke: AppState.get('strokeColor') || '#1473e6',
          strokeWidth: tool === 'pencil' ? 2 : 2.5
        });
        this.engine.addNode(this._draftNode, true, false);
        this._didModifyScene = true;
        return;
      }

      // Ferramentas de Criação de Formas Vetoriais Geométricas
      const CREATION_TOOLS = [
        'rect',
        'rounded-rect',
        'ellipse',
        'polygon',
        'star',
        'diamond',
        'arrow',
        'callout',
        'line'
      ];
      if (CREATION_TOOLS.includes(tool)) {
        this._interactionMode = 'create-node';
        this._dragStartWorld = worldPt;
        const fill = AppState.get('fillColor') || '#10b981';
        const stroke = AppState.get('strokeColor') || '#18181b';
        const strokeWidth = 2;

        switch (tool) {
          case 'rect':
            this._draftNode = new CortexRect({
              page: activePage,
              x: Math.round(worldPt.x),
              y: Math.round(worldPt.y),
              width: 1,
              height: 1,
              fill,
              stroke,
              strokeWidth
            });
            break;
          case 'rounded-rect':
            this._draftNode = new CortexRect({
              page: activePage,
              x: Math.round(worldPt.x),
              y: Math.round(worldPt.y),
              width: 1,
              height: 1,
              fill,
              stroke,
              strokeWidth,
              cornerRadius: 16
            });
            break;
          case 'ellipse':
            this._draftNode = new CortexEllipse({
              page: activePage,
              x: Math.round(worldPt.x),
              y: Math.round(worldPt.y),
              width: 1,
              height: 1,
              fill,
              stroke,
              strokeWidth
            });
            break;
          case 'polygon':
            this._draftNode = new CortexPolygon({
              page: activePage,
              x: Math.round(worldPt.x),
              y: Math.round(worldPt.y),
              width: 1,
              height: 1,
              fill,
              stroke,
              strokeWidth,
              sides: 3
            });
            break;
          case 'star':
            this._draftNode = new CortexStar({
              page: activePage,
              x: Math.round(worldPt.x),
              y: Math.round(worldPt.y),
              width: 1,
              height: 1,
              fill,
              stroke,
              strokeWidth,
              pointsCount: 5
            });
            break;
          case 'diamond':
            this._draftNode = new CortexDiamond({
              page: activePage,
              x: Math.round(worldPt.x),
              y: Math.round(worldPt.y),
              width: 1,
              height: 1,
              fill,
              stroke,
              strokeWidth
            });
            break;
          case 'arrow':
            this._draftNode = new CortexArrow({
              page: activePage,
              x: Math.round(worldPt.x),
              y: Math.round(worldPt.y),
              width: 1,
              height: 1,
              fill,
              stroke,
              strokeWidth
            });
            break;
          case 'callout':
            this._draftNode = new CortexCallout({
              page: activePage,
              x: Math.round(worldPt.x),
              y: Math.round(worldPt.y),
              width: 1,
              height: 1,
              fill,
              stroke,
              strokeWidth
            });
            break;
          case 'line':
            this._draftNode = new CortexLine({
              page: activePage,
              x: Math.round(worldPt.x),
              y: Math.round(worldPt.y),
              width: 1,
              height: 1,
              stroke: AppState.get('strokeColor') || '#1473e6',
              strokeWidth: 2.5
            });
            break;
        }

        this.engine.addNode(this._draftNode, true, false);
        this._didModifyScene = true;
        return;
      }

      // Criação de Texto
      if (tool === 'text') {
        const textNode = new CortexText({
          page: activePage,
          x: Math.round(worldPt.x),
          y: Math.round(worldPt.y),
          text: 'CortexUI Text',
          fill: AppState.get('fillColor') || '#18181b',
          fontSize: 20
        });
        this.engine.addNode(textNode, true, true);
        AppState.setState({ activeTool: 'select' });
        return;
      }

      // Se já houver um objeto selecionado, verifica primeiro se clicou/tocou em uma Alça (Handle)
      if (this.engine.selectedNode && tool !== 'rotate') {
        const handle = this.engine.selectedNode.hitTestHandle(
          worldPt.x,
          worldPt.y,
          this.engine.zoomScale,
          pointerType,
          false
        );
        if (handle) {
          if (handle.id === 'rotate' || handle.isRotate) {
            this._interactionMode = 'rotate-node';
            const center = this.engine.selectedNode.getCenter();
            this._rotateCenter = center;
            const cx = center.cx ?? center.x ?? 0;
            const cy = center.cy ?? center.y ?? 0;
            this._initialNodeRotation = Number(this.engine.selectedNode.rotation) || 0;
            this._dragStartAngle = Math.atan2(worldPt.y - cy, worldPt.x - cx) * (180 / Math.PI);
            this._updateCursor(tool, 'crosshair');
            return;
          }

          this._interactionMode = 'resize-node';
          this._activeResizeHandle = handle.id;
          this._dragStartWorld = worldPt;
          const b =
            this.engine.selectedNode.type === 'line'
              ? {
                  x: this.engine.selectedNode.x,
                  y: this.engine.selectedNode.y,
                  width: this.engine.selectedNode.width,
                  height: this.engine.selectedNode.height
                }
              : this.engine.selectedNode.getBounds();
          this._initialBounds = { ...b };
          this._updateCursor(tool, handle.cursor);
          return;
        }
      }

      // Seleção e Arraste de Objetos (Hit Detection Adaptativo com Multi-Seleção e Marquee)
      const hitNode = this.engine.hitTest(worldPt.x, worldPt.y, pointerType);
      const isMultiKey = e.shiftKey || e.ctrlKey || e.metaKey;

      if (hitNode) {
        if (isMultiKey) {
          this.engine.selectNode(hitNode, true);
        } else if (!this.engine.selectedNodes.some((n) => n.id === hitNode.id)) {
          this.engine.selectNode(hitNode, false);
        }

        this._interactionMode = 'move-nodes';
        this._dragStartWorld = worldPt;
        this._initialNodesPositions = this.engine.selectedNodes.map((n) => ({
          id: n.id,
          x: n.x,
          y: n.y,
          width: n.width,
          height: n.height
        }));
      } else {
        if (!isMultiKey) {
          this.engine.selectNode(null);
        }
        if (tool === 'select') {
          this._interactionMode = 'marquee-select';
          this._dragStartWorld = worldPt;
          this._marqueeInitialSelected = isMultiKey ? [...this.engine.selectedNodes] : [];
        } else {
          this._interactionMode = null;
        }
      }

      this._updateFloatingToolbar();
    });

    // 4. Pointer Move
    canvas.addEventListener('pointermove', (e) => {
      const pt = this._getCanvasRelativeCoords(e, canvas);
      const pointerType = e.pointerType || 'mouse';

      if (this._activePointers.has(e.pointerId)) {
        this._activePointers.set(e.pointerId, pt);
      }

      const worldPt = this.engine.screenToWorld(pt.x, pt.y);
      this.rulers.cursorScreenX = pt.x;
      this.rulers.cursorScreenY = pt.y;
      AppState.setState({
        cursorX: Math.round(worldPt.x),
        cursorY: Math.round(worldPt.y)
      });

      // Gestos Multi-Touch (2 Dedos: Pinch-to-Zoom + Two-Finger Pan)
      if (this._activePointers.size === 2 && this._interactionMode === 'touch-gesture') {
        const pts = Array.from(this._activePointers.values());
        const curDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const curCenter = {
          x: (pts[0].x + pts[1].x) / 2,
          y: (pts[0].y + pts[1].y) / 2
        };

        if (this._lastPinchCenter) {
          this.engine.panX += curCenter.x - this._lastPinchCenter.x;
          this.engine.panY += curCenter.y - this._lastPinchCenter.y;
        }

        if (this._lastPinchDist && this._lastPinchDist > 10 && curDist > 10) {
          const ratio = curDist / this._lastPinchDist;
          const nextZoomPercent = this.engine.zoomScale * ratio * 100;
          this.engine.zoomAtScreenPoint(nextZoomPercent, curCenter.x, curCenter.y);
        }

        this._lastPinchDist = curDist;
        this._lastPinchCenter = curCenter;
        this.engine.requestRender();
        return;
      }

      // Pan
      if (this._interactionMode === 'pan') {
        this.engine.panX = this._initialPan.x + (pt.x - this._dragStartScreen.x);
        this.engine.panY = this._initialPan.y + (pt.y - this._dragStartScreen.y);
        this.engine.requestRender();
        return;
      }

      // Rotação Interativa de Objeto
      if (this._interactionMode === 'rotate-node' && this.engine.selectedNode) {
        const cx =
          this._rotateCenter?.cx ??
          this._rotateCenter?.x ??
          this.engine.selectedNode.x + this.engine.selectedNode.width / 2;
        const cy =
          this._rotateCenter?.cy ??
          this._rotateCenter?.y ??
          this.engine.selectedNode.y + this.engine.selectedNode.height / 2;
        const currentAngle = Math.atan2(worldPt.y - cy, worldPt.x - cx) * (180 / Math.PI);

        if (!isNaN(currentAngle) && !isNaN(this._dragStartAngle)) {
          const deltaAngle = currentAngle - this._dragStartAngle;
          let nextRot = ((this._initialNodeRotation || 0) + deltaAngle) % 360;
          if (nextRot < 0) nextRot += 360;

          // Ao segurar Shift, trava em passos de 15 graus (0°, 15°, 30°, 45°, 90°, etc.)
          if (e.shiftKey) {
            nextRot = Math.round(nextRot / 15) * 15;
          }

          const finalRot = Math.round(nextRot) % 360;
          this.engine.selectedNode.rotation = finalRot;
          this._didModifyScene = true;
          AppState.setState({ selectedNode: this.engine.selectedNode.toJSON() });
          this.engine.requestRender();
        }
        return;
      }

      // Redimensionamento pelas Alças (Handles)
      if (this._interactionMode === 'resize-node' && this.engine.selectedNode) {
        this._applyHandleResize(this.engine.selectedNode, this._activeResizeHandle, worldPt);
        this._didModifyScene = true;
        AppState.setState({ selectedNode: this.engine.selectedNode.toJSON() });
        this.engine.requestRender();
        return;
      }

      // Movimentação de Múltiplos Objetos Selecionados ou Objeto Individual
      if (this._interactionMode === 'move-nodes' && this.engine.selectedNodes.length > 0) {
        const dx = worldPt.x - this._dragStartWorld.x;
        const dy = worldPt.y - this._dragStartWorld.y;
        this._initialNodesPositions.forEach((pos) => {
          const target = this.engine.nodes.find((n) => n.id === pos.id);
          if (target) {
            target.x = Math.round(pos.x + dx);
            target.y = Math.round(pos.y + dy);
          }
        });
        this._didModifyScene = true;
        this.engine.requestRender();
        this._updateFloatingToolbar();
        return;
      }

      // Caixa de Seleção Elástica (Marquee Selection)
      if (this._interactionMode === 'marquee-select') {
        const minX = Math.min(this._dragStartWorld.x, worldPt.x);
        const minY = Math.min(this._dragStartWorld.y, worldPt.y);
        const w = Math.abs(worldPt.x - this._dragStartWorld.x);
        const h = Math.abs(worldPt.y - this._dragStartWorld.y);
        this.engine.setMarqueeRect({ x: minX, y: minY, width: w, height: h });

        const activePage = Number(AppState.get('currentPage')) || 1;
        const marqueeBox = { x: minX, y: minY, width: w, height: h };
        const hitNodes = this.engine.nodes.filter((n) => {
          if (Number(n.page || 1) !== activePage) return false;
          const b = n.getBounds ? n.getBounds() : { x: n.x, y: n.y, width: n.width, height: n.height };
          return (
            b.x < marqueeBox.x + marqueeBox.width &&
            b.x + b.width > marqueeBox.x &&
            b.y < marqueeBox.y + marqueeBox.height &&
            b.y + b.height > marqueeBox.y
          );
        });

        const combined = [...new Set([...this._marqueeInitialSelected, ...hitNodes])];
        this.engine.selectNodes(combined);
        this._updateFloatingToolbar();
        return;
      }

      // Desenho de Caminho Vetorial (CortexPath / Pencil)
      if (this._interactionMode === 'draw-path' && this._draftNode) {
        this._draftNode.addWorldPoint(worldPt.x, worldPt.y);
        this.engine.requestRender();
        return;
      }

      // Criação de Formas Vetoriais (com suporte a Shift para proporção 1:1)
      if (this._interactionMode === 'create-node' && this._draftNode) {
        let w = worldPt.x - this._dragStartWorld.x;
        let h = worldPt.y - this._dragStartWorld.y;

        if (e.shiftKey && this._draftNode.type !== 'line') {
          const side = Math.max(Math.abs(w), Math.abs(h));
          w = w < 0 ? -side : side;
          h = h < 0 ? -side : side;
        }

        this._draftNode.width = Math.round(w);
        this._draftNode.height = Math.round(h);
        AppState.setState({ selectedNode: this._draftNode.toJSON() });
        this.engine.requestRender();
        return;
      }

      // Hover sobre alças de redimensionamento / rotação quando em repouso
      if (!this._interactionMode && this.engine.selectedNode) {
        const isRotateTool = AppState.get('activeTool') === 'rotate';
        const hoverHandle = this.engine.selectedNode.hitTestHandle(
          worldPt.x,
          worldPt.y,
          this.engine.zoomScale,
          pointerType,
          isRotateTool
        );
        this._updateCursor(AppState.get('activeTool'), hoverHandle ? hoverHandle.cursor : null);
      }

      if (AppState.get('showRulers')) {
        this.rulers.render(this.engine.panX, this.engine.panY, this.engine.zoomScale);
      }
    });

    // 5. Pointer Up / Cancel
    const endPointer = (e) => {
      this._activePointers.delete(e.pointerId);

      if (this._activePointers.size < 2) {
        this._lastPinchDist = null;
        this._lastPinchCenter = null;
      }

      if (this._interactionMode === 'create-node' && this._draftNode) {
        if (Math.abs(this._draftNode.width) < 6 && Math.abs(this._draftNode.height) < 6) {
          this._draftNode.width = 140;
          this._draftNode.height = this._draftNode.type === 'line' ? 0 : 95;
        }
        // Normaliza largura/altura negativas se o usuário arrastou para cima/esquerda
        if (this._draftNode.type !== 'line') {
          const b = this._draftNode.getBounds();
          this._draftNode.x = b.x;
          this._draftNode.y = b.y;
          this._draftNode.width = b.width;
          this._draftNode.height = b.height;
        }
        this._draftNode = null;
        AppState.setState({ activeTool: 'select' });
        this.engine.syncSceneState(true);
      } else if (this._interactionMode === 'draw-path' && this._draftNode) {
        this._draftNode.recalculateBounds();
        this._draftNode = null;
        AppState.setState({ activeTool: 'select' });
        this.engine.syncSceneState(true);
      } else if (this._interactionMode === 'rotate-node') {
        if (this._didModifyScene) {
          this.engine.syncSceneState(true);
        }
        if (AppState.get('activeTool') === 'rotate') {
          // Mantém na ferramenta rotate se o usuário a selecionou explicitamente
        } else {
          AppState.setState({ activeTool: 'select' });
        }
      } else if (this._interactionMode === 'marquee-select') {
        this.engine.setMarqueeRect(null);
      } else if (this._didModifyScene) {
        this.engine.syncSceneState(true);
      }

      this._didModifyScene = false;
      this._activeResizeHandle = null;

      if (this._activePointers.size === 0) {
        this._interactionMode = null;
        this._updateCursor(AppState.get('activeTool'));
      }

      this._updateFloatingToolbar();
    };

    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);

    canvas.addEventListener('pointerleave', () => {
      this.rulers.cursorScreenX = null;
      this.rulers.cursorScreenY = null;
      if (AppState.get('showRulers')) {
        this.rulers.render(this.engine.panX, this.engine.panY, this.engine.zoomScale);
      }
    });

    // Atualiza a barra flutuante ao fazer zoom ou pan com a roda do mouse
    canvas.addEventListener('wheel', () => {
      this._updateFloatingToolbar();
    }, { passive: true });
  }

  /**
   * Duplica todos os objetos selecionados com um deslocamento elegante
   */
  _duplicateSelection() {
    if (!this.engine || !this.engine.selectedNodes || this.engine.selectedNodes.length === 0) return;
    const clonedNodes = [];

    this.engine.selectedNodes.forEach((node) => {
      const data = node.toJSON();
      data.id = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      data.name = `${node.name || 'Object'} (Cópia)`;
      data.x = (data.x || 0) + 20;
      data.y = (data.y || 0) + 20;
      const newNode = createNodeFromJSON(data);
      this.engine.nodes.push(newNode);
      clonedNodes.push(newNode);
    });

    this.engine.selectNodes(clonedNodes);
    this.engine.syncSceneState(true);
    CortexModal.toast(
      clonedNodes.length > 1 ? `${clonedNodes.length} objetos duplicados!` : 'Objeto duplicado!',
      'success',
      1500
    );
  }

  /**
   * Atualiza dinamicamente o posicionamento e os botões da Barra de Ferramentas Flutuante
   * com base na quantidade de objetos selecionados no palco (1 ou 2+).
   * Garante que a barra nunca fique cortada à esquerda, à direita ou sob réguas.
   */
  _updateFloatingToolbar() {
    const bar = this.shadowRoot?.getElementById('selection-toolbar');
    if (!bar || !this.engine) return;

    const count = this.engine.selectedNodes ? this.engine.selectedNodes.length : 0;
    if (count === 0) {
      bar.classList.add('hidden');
      return;
    }

    const bounds = this.engine.getSelectionBounds();
    if (!bounds) {
      bar.classList.add('hidden');
      return;
    }

    if (count >= 2) {
      // 2 ou mais objetos: Recursos Avançados de Design e Modelagem Estilo CorelDraw / Illustrator
      bar.innerHTML = `
        <div class="sel-group">
          <span class="sel-badge">${count} selecionados</span>
          <button class="sel-btn primary" data-sel-act="union" title="União / Soldar (Weld): Combina os objetos em um contorno único">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/></svg>
            <span>União</span>
          </button>
          <button class="sel-btn primary" data-sel-act="intersect" title="Interseção (Intersect): Mantém apenas a área de sobreposição comum">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 12a6 6 0 0 0 6 0 6 6 0 0 0-6 0Z" fill="currentColor"/><circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/></svg>
            <span>Interseção</span>
          </button>
          <button class="sel-btn" data-sel-act="subtract" title="Aparar (Frente corta Fundo): O objeto superior apara/recorta o inferior">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="10" height="10" rx="1"/><rect x="10" y="10" width="10" height="10" rx="1" stroke-dasharray="2 2"/></svg>
            <span>Aparar</span>
          </button>
          <button class="sel-btn" data-sel-act="subtract-reverse" title="Subtrair (Fundo corta Frente): O objeto inferior apara/recorta o superior">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="10" height="10" rx="1" stroke-dasharray="2 2"/><rect x="10" y="10" width="10" height="10" rx="1"/></svg>
            <span>Subtrair</span>
          </button>
          <button class="sel-btn" data-sel-act="exclude" title="Excluir Sobreposição (Exclude / XOR): Mantém apenas áreas não sobrepostas">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="8" cy="12" r="5"/><circle cx="16" cy="12" r="5"/></svg>
            <span>Excluir</span>
          </button>
        </div>

        <div class="sel-sep"></div>

        <div class="sel-group" title="Alinhamentos (CorelDraw)">
          <button class="sel-btn icon-only" data-sel-act="align-left" title="Alinhar à Esquerda (Align Left)">⇤</button>
          <button class="sel-btn icon-only" data-sel-act="align-center-h" title="Centralizar Horizontalmente">⇹</button>
          <button class="sel-btn icon-only" data-sel-act="align-right" title="Alinhar à Direita (Align Right)">⇥</button>
          <button class="sel-btn icon-only" data-sel-act="align-top" title="Alinhar ao Topo (Align Top)">⤒</button>
          <button class="sel-btn icon-only" data-sel-act="align-center-v" title="Centralizar Verticalmente">⇕</button>
          <button class="sel-btn icon-only" data-sel-act="align-bottom" title="Alinhar ao Fundo (Align Bottom)">⤓</button>
        </div>

        <div class="sel-sep"></div>

        <div class="sel-group">
          <button class="sel-btn icon-only" data-sel-act="distribute-h" title="Distribuir Horizontalmente">↔</button>
          <button class="sel-btn icon-only" data-sel-act="distribute-v" title="Distribuir Verticalmente">↕</button>
          <button class="sel-btn icon-only" data-sel-act="duplicate" title="Duplicar Selecionados (Ctrl+D)">📋</button>
          <button class="sel-btn icon-only danger" data-sel-act="delete" title="Excluir Objetos Selecionados (Del)">🗑️</button>
        </div>
      `;
    } else {
      // 1 objeto selecionado: Ações rápidas de elemento único
      const single = this.engine.selectedNodes[0] || this.engine.selectedNode;
      bar.innerHTML = `
        <div class="sel-group">
          <span class="sel-badge">${single.name || single.type}</span>
          <button class="sel-btn" data-sel-act="duplicate" title="Duplicar Objeto (Ctrl+D)">📋 Duplicar</button>
          <button class="sel-btn" data-sel-act="rotate-90" title="Girar 90 graus no sentido horário">↷ 90°</button>
          <button class="sel-btn" data-sel-act="bring-front" title="Trazer para a Frente">⇈ Frente</button>
          <button class="sel-btn" data-sel-act="send-back" title="Enviar para Trás">⇊ Trás</button>
          <button class="sel-btn icon-only danger" data-sel-act="delete" title="Excluir Objeto (Del)">🗑️</button>
        </div>
      `;
    }

    // Vincula ações de clique
    bar.querySelectorAll('[data-sel-act]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = btn.dataset.selAct;
        this._executeSelectionToolbarAction(act);
      });
    });

    bar.classList.remove('hidden');

    // Mede dimensões reais da barra e do palco
    const barW = bar.offsetWidth || (count >= 2 ? 560 : 340);
    const barH = bar.offsetHeight || 36;
    const stageW = this.engine.viewportWidth || 800;
    const stageH = this.engine.viewportHeight || 600;

    // Calcula coordenadas de tela relativas ao #stage-wrap
    const screenCenter = this.engine.worldToScreen(bounds.cx, bounds.y);
    const screenBottom = this.engine.worldToScreen(bounds.cx, bounds.y + bounds.height);

    // Posicionamento vertical: se o objeto estiver no topo do viewport, posiciona abaixo do objeto
    let top = screenCenter.y - barH - 12;
    if (top < 10) {
      top = screenBottom.y + 12;
    }
    // Garante que nunca saia da área de visualização vertical
    top = Math.max(8, Math.min(stageH - barH - 8, top));

    // Clamping Horizontal Perfeito:
    // A barra usa `transform: translateX(-50%)`, portanto sua ponta esquerda fica em `left - halfW`.
    // Para nunca cortar à esquerda (sob réguas): `left >= halfW + 12`.
    // Para nunca cortar à direita: `left <= stageW - halfW - 12`.
    const halfW = barW / 2;
    const minLeft = halfW + 12;
    const maxLeft = Math.max(minLeft, stageW - halfW - 12);
    const clampLeft = Math.max(minLeft, Math.min(maxLeft, screenCenter.x));

    bar.style.top = `${Math.round(top)}px`;
    bar.style.left = `${Math.round(clampLeft)}px`;
  }

  /**
   * Executa a ação clicada na Barra Flutuante de Seleção ou no Inspetor
   */
  _executeSelectionToolbarAction(action) {
    if (!this.engine) return;

    switch (action) {
      case 'union': {
        const result = executeBooleanOnNodes(this.engine, this.engine.selectedNodes, 'union');
        if (result) {
          CortexModal.toast('⚡ União de formas realizada com sucesso (Weld)!', 'success');
        } else {
          CortexModal.toast('Não foi possível calcular a união destas formas.', 'warning');
        }
        break;
      }

      case 'intersect': {
        const result = executeBooleanOnNodes(this.engine, this.engine.selectedNodes, 'intersect');
        if (result) {
          CortexModal.toast('⚡ Interseção criada a partir da área comum!', 'success');
        } else {
          CortexModal.toast('Os objetos não possuem área de sobreposição para interseção.', 'warning');
        }
        break;
      }

      case 'subtract': {
        const result = executeBooleanOnNodes(this.engine, this.engine.selectedNodes, 'subtract');
        if (result) {
          CortexModal.toast('⚡ Forma aparada com sucesso (Frente corta Fundo)!', 'success');
        } else {
          CortexModal.toast('Não foi possível aparar as formas selecionadas.', 'warning');
        }
        break;
      }

      case 'subtract-reverse': {
        const result = executeBooleanOnNodes(this.engine, this.engine.selectedNodes, 'subtract-reverse');
        if (result) {
          CortexModal.toast('⚡ Forma subtraída com sucesso (Fundo corta Frente)!', 'success');
        } else {
          CortexModal.toast('Não foi possível subtrair as formas selecionadas.', 'warning');
        }
        break;
      }

      case 'exclude': {
        const result = executeBooleanOnNodes(this.engine, this.engine.selectedNodes, 'exclude');
        if (result) {
          CortexModal.toast('⚡ Exclusão de sobreposição realizada (XOR)!', 'success');
        } else {
          CortexModal.toast('Não foi possível calcular a exclusão.', 'warning');
        }
        break;
      }

      case 'align-left':
      case 'align-center-h':
      case 'align-right':
      case 'align-top':
      case 'align-center-v':
      case 'align-bottom': {
        const type = action.replace('align-', '');
        alignSelectedNodes(this.engine, this.engine.selectedNodes, type);
        CortexModal.toast(`Objetos alinhados (${type})`, 'info', 1200);
        break;
      }

      case 'distribute-h':
        distributeSelectedNodes(this.engine, this.engine.selectedNodes, 'horizontal');
        CortexModal.toast('Objetos distribuídos horizontalmente', 'info', 1200);
        break;

      case 'distribute-v':
        distributeSelectedNodes(this.engine, this.engine.selectedNodes, 'vertical');
        CortexModal.toast('Objetos distribuídos verticalmente', 'info', 1200);
        break;

      case 'duplicate':
        this._duplicateSelection();
        break;

      case 'rotate-90': {
        this.engine.selectedNodes.forEach((n) => {
          n.rotation = ((Number(n.rotation) || 0) + 90) % 360;
        });
        this.engine.syncSceneState(true);
        CortexModal.toast('Objetos girados em 90°', 'info', 1200);
        break;
      }

      case 'bring-front':
        this.engine.bringToFront();
        CortexModal.toast('Trazido para a frente', 'info', 1000);
        break;

      case 'send-back':
        this.engine.sendToBack();
        CortexModal.toast('Enviado para trás', 'info', 1000);
        break;

      case 'delete': {
        if (this.engine.selectedNodes && this.engine.selectedNodes.length > 0) {
          const ids = this.engine.selectedNodes.map((n) => n.id);
          ids.forEach((id) => this.engine.removeNode(id));
          this.engine.selectNode(null);
          CortexModal.toast('Objetos excluídos', 'info', 1200);
        }
        break;
      }
    }

    this._updateFloatingToolbar();
  }

  render() {
    const showRulers = AppState.get('showRulers');

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          background-color: var(--bg-workspace);
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: var(--ruler-size) 1fr;
          grid-template-rows: var(--ruler-size) 1fr;
          grid-template-areas:
            "corner ruler-h"
            "ruler-v stage";
          width: 100%;
          height: 100%;
        }

        .workspace-grid.rulers-hidden {
          grid-template-columns: 0px 1fr;
          grid-template-rows: 0px 1fr;
        }

        .workspace-grid.rulers-hidden .ruler-corner,
        .workspace-grid.rulers-hidden #ruler-h,
        .workspace-grid.rulers-hidden #ruler-v {
          display: none;
        }

        .ruler-corner {
          grid-area: corner;
          background-color: var(--ruler-bg, var(--bg-panel));
          border-right: 1px solid var(--ruler-border, var(--border-subtle));
          border-bottom: 1px solid var(--ruler-border, var(--border-subtle));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: var(--ruler-text, var(--text-muted));
          z-index: 20;
        }

        #ruler-h {
          grid-area: ruler-h;
          display: block;
          z-index: 15;
        }

        #ruler-v {
          grid-area: ruler-v;
          display: block;
          z-index: 15;
        }

        #stage-wrap {
          grid-area: stage;
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: var(--bg-workspace);
        }

        #stage-canvas {
          display: block;
          width: 100%;
          height: 100%;
          touch-action: none;
        }

        /* Barra de Ferramentas Flutuante de Seleção e Modelagem (CorelDraw / Figma style) */
        .selection-floating-bar {
          position: absolute;
          z-index: 300;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background-color: var(--bg-panel, #1e1e24);
          border: 1px solid var(--border-color, #3f3f46);
          border-radius: var(--radius-sm, 6px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          pointer-events: auto;
          transform: translateX(-50%);
          transition: opacity 0.12s ease;
          user-select: none;
          max-width: calc(100% - 24px);
          box-sizing: border-box;
          white-space: nowrap;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .selection-floating-bar::-webkit-scrollbar {
          display: none;
        }

        .selection-floating-bar.hidden {
          display: none !important;
        }

        .sel-group {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .sel-badge {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-muted, #94a3b8);
          padding: 2px 6px;
          background: var(--bg-input, rgba(0, 0, 0, 0.2));
          border-radius: 4px;
          margin-right: 2px;
          white-space: nowrap;
        }

        .sel-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 24px;
          padding: 0 7px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-primary, #ffffff);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.12s ease;
          white-space: nowrap;
        }

        .sel-btn:hover {
          background-color: var(--bg-hover, rgba(255, 255, 255, 0.1));
          border-color: var(--border-subtle, rgba(255, 255, 255, 0.15));
        }

        .sel-btn.primary {
          background-color: var(--accent-blue-alpha, rgba(20, 115, 230, 0.2));
          border-color: var(--accent-blue, #1473e6);
          color: var(--accent-text, #38bdf8);
          font-weight: 600;
        }

        .sel-btn.primary:hover {
          background-color: var(--accent-blue, #1473e6);
          color: #ffffff;
        }

        .sel-btn.icon-only {
          padding: 0 5px;
          min-width: 24px;
          justify-content: center;
          font-size: 12px;
        }

        .sel-btn.danger:hover {
          background-color: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          color: #ef4444;
        }

        .sel-sep {
          width: 1px;
          height: 16px;
          background: var(--border-subtle, rgba(255, 255, 255, 0.15));
          margin: 0 2px;
          flex-shrink: 0;
        }
      </style>

      <div class="workspace-grid ${showRulers ? '' : 'rulers-hidden'}">
        <div class="ruler-corner" title="Origin (0, 0)">px</div>
        <canvas id="ruler-h"></canvas>
        <canvas id="ruler-v"></canvas>
        <div id="stage-wrap">
          <canvas id="stage-canvas"></canvas>
          <div id="selection-toolbar" class="selection-floating-bar hidden" role="toolbar" aria-label="Selection Toolbar"></div>
        </div>
      </div>
    `;

    this._updateFloatingToolbar();
  }
}

customElements.define('cortex-workspace', CortexWorkspace);
