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
   * Retorna o ponto central do objeto em coordenadas de mundo.
   */
  getCenter() {
    return {
      cx: this.x + this.width / 2,
      cy: this.y + this.height / 2
    };
  }

  /**
   * Converte um ponto de mundo para o espaço local (desrotacionado) do nó.
   */
  toLocalPoint(worldX, worldY) {
    if (!this.rotation) return { x: worldX, y: worldY };
    const { cx, cy } = this.getCenter();
    const rad = (-this.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = worldX - cx;
    const dy = worldY - cy;
    return {
      x: cx + (dx * cos - dy * sin),
      y: cy + (dx * sin + dy * cos)
    };
  }

  /**
   * Converte um ponto local do nó para o espaço de mundo rotacionado.
   */
  toWorldPoint(localX, localY) {
    if (!this.rotation) return { x: localX, y: localY };
    const { cx, cy } = this.getCenter();
    const rad = (this.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = localX - cx;
    const dy = localY - cy;
    return {
      x: cx + (dx * cos - dy * sin),
      y: cy + (dx * sin + dy * cos)
    };
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
   * - Suporta rotação arbitrária do objeto em torno do centro.
   * - Mouse (Desktop): Precisão de pixel via ctx.isPointInPath / Bounding Box exata.
   * - Touch (Mobile/Tablet): Tolerância expandida ("Fat Finger" slop = 14px em tela).
   */
  containsPoint(ctx, worldX, worldY, zoomScale = 1, pointerType = 'mouse') {
    if (!this.visible || this.locked) return false;

    // Converte worldX/Y para coordenadas locais do objeto (desrotacionadas)
    const localPt = this.toLocalPoint(worldX, worldY);
    const lx = localPt.x;
    const ly = localPt.y;

    const b = this.getBounds();
    const touchPadding = pointerType === 'touch' ? 14 / zoomScale : 2 / zoomScale;

    const insideExpandedBox =
      lx >= b.x - touchPadding &&
      lx <= b.x + b.width + touchPadding &&
      ly >= b.y - touchPadding &&
      ly <= b.y + b.height + touchPadding;

    if (!insideExpandedBox) return false;

    if (pointerType === 'touch') {
      return true;
    }

    const path = this.buildPath();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    let hit = ctx.isPointInPath(path, lx, ly);
    if (!hit && this.stroke && this.stroke !== 'none' && this.strokeWidth > 0) {
      ctx.lineWidth = Math.max(this.strokeWidth, 6 / zoomScale);
      hit = ctx.isPointInStroke(path, lx, ly);
    }
    ctx.restore();
    return hit;
  }

  /**
   * Retorna as coordenadas das 8 alças de redimensionamento e da alça de rotação.
   * Quando isRotateMode é true, todas as alças de ancoragem atuam como pontos de rotação.
   * @param {number} stemHeight - Altura da haste de rotação em coordenadas locais
   * @param {boolean} isRotateMode - Se a ferramenta ou modo de rotação está ativo
   */
  getHandlePoints(stemHeight = 22, isRotateMode = false) {
    const b = this.getBounds();
    const cx = b.x + b.width / 2;
    const defaultCursor = isRotateMode ? 'crosshair' : 'grab';

    return [
      { id: 'rotate', x: cx, y: b.y - stemHeight, cursor: defaultCursor, isRotate: true },
      { id: 'nw', x: b.x, y: b.y, cursor: isRotateMode ? 'crosshair' : 'nwse-resize', isRotate: isRotateMode },
      { id: 'n', x: b.x + b.width / 2, y: b.y, cursor: isRotateMode ? 'crosshair' : 'ns-resize', isRotate: isRotateMode },
      { id: 'ne', x: b.x + b.width, y: b.y, cursor: isRotateMode ? 'crosshair' : 'nesw-resize', isRotate: isRotateMode },
      { id: 'e', x: b.x + b.width, y: b.y + b.height / 2, cursor: isRotateMode ? 'crosshair' : 'ew-resize', isRotate: isRotateMode },
      { id: 'se', x: b.x + b.width, y: b.y + b.height, cursor: isRotateMode ? 'crosshair' : 'nwse-resize', isRotate: isRotateMode },
      { id: 's', x: b.x + b.width / 2, y: b.y + b.height, cursor: isRotateMode ? 'crosshair' : 'ns-resize', isRotate: isRotateMode },
      { id: 'sw', x: b.x, y: b.y + b.height, cursor: isRotateMode ? 'crosshair' : 'nesw-resize', isRotate: isRotateMode },
      { id: 'w', x: b.x, y: b.y + b.height / 2, cursor: isRotateMode ? 'crosshair' : 'ew-resize', isRotate: isRotateMode }
    ];
  }

  /**
   * Verifica se o clique/toque acertou alguma das alças (redimensionamento ou rotação).
   */
  hitTestHandle(worldX, worldY, zoomScale = 1, pointerType = 'mouse', isRotateMode = false) {
    if (!this.visible || this.locked) return null;
    const invScale = 1 / zoomScale;
    const hitRadius = (pointerType === 'touch' ? 16 : (isRotateMode ? 10 : 8)) * invScale;
    const stemHeight = 22 * invScale;

    // Converte o ponto de clique para o espaço local rotacionado do objeto
    const localPt = this.toLocalPoint(worldX, worldY);

    for (const h of this.getHandlePoints(stemHeight, isRotateMode)) {
      if (
        Math.abs(localPt.x - h.x) <= hitRadius &&
        Math.abs(localPt.y - h.y) <= hitRadius
      ) {
        if (isRotateMode) {
          return { ...h, id: 'rotate', cursor: 'crosshair', isRotate: true };
        }
        return h;
      }
    }
    return null;
  }

  draw(ctx) {
    if (!this.visible) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.rotation) {
      const { cx, cy } = this.getCenter();
      ctx.translate(cx, cy);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    this.renderShape(ctx);
    ctx.restore();
  }

  renderShape(_ctx) {}

  drawSelection(ctx, zoomScale = 1, isRotateMode = false) {
    const b = this.getBounds();
    const invScale = 1 / zoomScale;
    const handleSize = 6.5 * invScale;
    const rotHandleRadius = 5.5 * invScale;
    const stemHeight = 22 * invScale;

    ctx.save();
    const { cx, cy } = this.getCenter();

    // Rotação síncrona de toda a moldura de seleção
    if (this.rotation) {
      ctx.translate(cx, cy);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    if (isRotateMode) {
      // ==========================================
      // MODO ROTAÇÃO: Pontos de ancoragem transformados em pontos de giro
      // ==========================================

      // 1. Moldura tracejada ciano neon
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.5 * invScale;
      ctx.setLineDash([4 * invScale, 3 * invScale]);
      ctx.strokeRect(b.x, b.y, b.width, b.height);
      ctx.setLineDash([]);

      // 2. Pivô Central de Rotação (Ancoragem / Centro de Giro)
      ctx.save();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.5 * invScale;
      ctx.beginPath();
      ctx.arc(cx, cy, 8 * invScale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 12 * invScale, cy);
      ctx.lineTo(cx + 12 * invScale, cy);
      ctx.moveTo(cx, cy - 12 * invScale);
      ctx.lineTo(cx, cy + 12 * invScale);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5 * invScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Os Pontos de Ancoragem se transformam em Pontos de Rotação Circulares Azuis/Ciano
      const handles = this.getHandlePoints(stemHeight, true);
      for (const h of handles) {
        if (h.id === 'rotate') {
          // Alça superior conectora
          const rotX = cx;
          const rotY = b.y - stemHeight;
          ctx.beginPath();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.25 * invScale;
          ctx.moveTo(cx, b.y);
          ctx.lineTo(rotX, rotY);
          ctx.stroke();

          // Círculo com halo
          ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
          ctx.beginPath();
          ctx.arc(rotX, rotY, rotHandleRadius + 3.5 * invScale, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5 * invScale;
          ctx.beginPath();
          ctx.arc(rotX, rotY, rotHandleRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#00f2fe';
          ctx.beginPath();
          ctx.arc(rotX, rotY, 2.2 * invScale, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        // Cada ponto de ancoragem do objeto transformado em círculo de rotação
        ctx.save();
        // Halo luminoso azul ciano
        ctx.fillStyle = 'rgba(6, 182, 212, 0.28)';
        ctx.beginPath();
        ctx.arc(h.x, h.y, 7 * invScale, 0, Math.PI * 2);
        ctx.fill();

        // Círculo de rotação
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 * invScale;
        ctx.beginPath();
        ctx.arc(h.x, h.y, 4.8 * invScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ponto central de ancoragem
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.arc(h.x, h.y, 1.8 * invScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Badge estilizado do Ângulo de Rotação
      const rotVal = Math.round(this.rotation || 0);
      const badgeY = b.y - stemHeight - 14 * invScale;
      ctx.save();
      ctx.font = `700 ${Math.max(10, Math.round(11 * invScale))}px Inter, sans-serif`;
      const text = `Rotacionar: ${rotVal}°`;
      const textW = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(9, 9, 11, 0.9)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1 * invScale;
      const padX = 7 * invScale;
      const padY = 4 * invScale;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(cx - textW / 2 - padX, badgeY - 10 * invScale, textW + padX * 2, 18 * invScale, 4 * invScale);
      } else {
        ctx.rect(cx - textW / 2 - padX, badgeY - 10 * invScale, textW + padX * 2, 18 * invScale);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, cx, badgeY - 1 * invScale);
      ctx.restore();

    } else {
      // ==========================================
      // MODO NORMAL DE SELEÇÃO
      // ==========================================

      // 1. Moldura de seleção
      ctx.strokeStyle = '#1473e6';
      ctx.lineWidth = 1.25 * invScale;
      ctx.strokeRect(b.x, b.y, b.width, b.height);

      // 2. Haste de rotação superior (Stem)
      const rotX = cx;
      const rotY = b.y - stemHeight;
      ctx.beginPath();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.25 * invScale;
      ctx.moveTo(cx, b.y);
      ctx.lineTo(rotX, rotY);
      ctx.stroke();

      // 3. Alça circular de rotação (Rotate Handle)
      ctx.fillStyle = '#0ea5e9';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 * invScale;
      ctx.beginPath();
      ctx.arc(rotX, rotY, rotHandleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 4. As 8 alças quadradas de redimensionamento
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1473e6';
      ctx.lineWidth = 1 * invScale;
      for (const h of this.getHandlePoints(stemHeight, false)) {
        if (h.id === 'rotate') continue;
        ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      }

      // 5. Exibe badge do ângulo de rotação se diferente de zero
      if (this.rotation) {
        const rotVal = Math.round(this.rotation);
        ctx.font = `600 ${Math.max(9, Math.round(11 * invScale))}px Inter, sans-serif`;
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(`${rotVal}°`, rotX, rotY - 7 * invScale);
      }
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
