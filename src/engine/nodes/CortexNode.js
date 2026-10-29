// src/engine/nodes/CortexNode.js
let _nodeCounter = 1;

export class CortexNode {
  constructor(options = {}) {
    this.id = options.id || `node-${Date.now()}-${_nodeCounter++}`;
    this.type = options.type || 'node';
    this.name = options.name || `${this.type.toUpperCase()} ${_nodeCounter - 1}`;
    // Se options.page não for informado, fica null para que o CanvasEngine atribua a página ativa (currentPage)
    this.page = options.page !== undefined && options.page !== null ? Number(options.page) : null;
    this.zIndex = Number(options.zIndex ?? _nodeCounter);

    this.x = Number(options.x ?? 0);
    this.y = Number(options.y ?? 0);
    this.width = Number(options.width ?? 100);
    this.height = Number(options.height ?? 100);
    this.rotation = Number(options.rotation ?? 0);

    this.fill = options.fill ?? '#10b981';
    this.stroke = options.stroke ?? '#18181b';
    this.strokeWidth = Number(options.strokeWidth ?? 1.5);
    this.opacity = Number(options.opacity ?? 1);

    this.visible = options.visible !== false;
    this.locked = Boolean(options.locked);
  }

  /**
   * Retorna o retângulo delimitador (Bounding Box) normalizado em coordenadas de mundo.
   */
  getBounds() {
    const x = Math.min(this.x, this.x + this.width);
    const y = Math.min(this.y, this.y + this.height);
    const width = Math.abs(this.width);
    const height = Math.abs(this.height);
    return { x, y, width, height };
  }

  /**
   * Constrói e retorna o Path2D em coordenadas de mundo.
   */
  buildPath() {
    const path = new Path2D();
    const b = this.getBounds();
    path.rect(b.x, b.y, b.width, b.height);
    return path;
  }

  /**
   * Motor de Intersecção Analítica (Hit Detection) adaptado para:
   * - Mouse (Desktop): Precisão de pixel via ctx.isPointInPath / Bounding Box exata.
   * - Touch (Mobile/Tablet): Tolerância expandida ("Fat Finger" slop = 14px em tela).
   */
  containsPoint(ctx, worldX, worldY, zoomScale = 1, pointerType = 'mouse') {
    if (!this.visible || this.locked) return false;

    const b = this.getBounds();
    const touchPadding = pointerType === 'touch' ? 14 / zoomScale : 2 / zoomScale;

    const insideExpandedBox =
      worldX >= b.x - touchPadding &&
      worldX <= b.x + b.width + touchPadding &&
      worldY >= b.y - touchPadding &&
      worldY <= b.y + b.height + touchPadding;

    if (!insideExpandedBox) return false;

    if (pointerType === 'touch') {
      return true;
    }

    const path = this.buildPath();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    let hit = ctx.isPointInPath(path, worldX, worldY);
    if (!hit && this.stroke && this.stroke !== 'none' && this.strokeWidth > 0) {
      ctx.lineWidth = Math.max(this.strokeWidth, 6 / zoomScale);
      hit = ctx.isPointInStroke(path, worldX, worldY);
    }
    ctx.restore();
    return hit;
  }

  /**
   * Retorna as coordenadas das 8 alças de redimensionamento da Bounding Box.
   */
  getHandlePoints() {
    const b = this.getBounds();
    return [
      { id: 'nw', x: b.x, y: b.y, cursor: 'nwse-resize' },
      { id: 'n', x: b.x + b.width / 2, y: b.y, cursor: 'ns-resize' },
      { id: 'ne', x: b.x + b.width, y: b.y, cursor: 'nesw-resize' },
      { id: 'e', x: b.x + b.width, y: b.y + b.height / 2, cursor: 'ew-resize' },
      { id: 'se', x: b.x + b.width, y: b.y + b.height, cursor: 'nwse-resize' },
      { id: 's', x: b.x + b.width / 2, y: b.y + b.height, cursor: 'ns-resize' },
      { id: 'sw', x: b.x, y: b.y + b.height, cursor: 'nesw-resize' },
      { id: 'w', x: b.x, y: b.y + b.height / 2, cursor: 'ew-resize' }
    ];
  }

  /**
   * Verifica se o clique/toque acertou alguma das alças de redimensionamento.
   */
  hitTestHandle(worldX, worldY, zoomScale = 1, pointerType = 'mouse') {
    if (!this.visible || this.locked) return null;
    const hitRadius = (pointerType === 'touch' ? 14 : 6) / zoomScale;

    for (const h of this.getHandlePoints()) {
      if (
        Math.abs(worldX - h.x) <= hitRadius &&
        Math.abs(worldY - h.y) <= hitRadius
      ) {
        return h;
      }
    }
    return null;
  }

  draw(ctx) {
    if (!this.visible) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    this.renderShape(ctx);
    ctx.restore();
  }

  renderShape(_ctx) {}

  drawSelection(ctx, zoomScale = 1) {
    const b = this.getBounds();
    const invScale = 1 / zoomScale;
    const handleSize = 6.5 * invScale;

    ctx.save();
    ctx.strokeStyle = '#1473e6';
    ctx.lineWidth = 1.25 * invScale;
    ctx.strokeRect(b.x, b.y, b.width, b.height);

    ctx.fillStyle = '#ffffff';
    for (const h of this.getHandlePoints()) {
      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    }
    ctx.restore();
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      page: this.page || 1,
      zIndex: this.zIndex,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      opacity: this.opacity,
      visible: this.visible,
      locked: this.locked
    };
  }
}
