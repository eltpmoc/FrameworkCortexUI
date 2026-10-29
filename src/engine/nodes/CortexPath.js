// src/engine/nodes/CortexPath.js
import { CortexNode } from './CortexNode.js';

export class CortexPath extends CortexNode {
  constructor(options = {}) {
    super({
      ...options,
      type: 'path',
      fill: options.fill ?? 'transparent',
      stroke: options.stroke ?? '#1473e6',
      strokeWidth: Number(options.strokeWidth ?? 2.5)
    });

    // Pontos armazenados como offsets relativos a (this.x, this.y) para facilitar translação e serialização
    this.points = Array.isArray(options.points)
      ? options.points.map((p) => ({ x: Number(p.x), y: Number(p.y) }))
      : [
          { x: 0, y: 0 },
          { x: 60, y: -30 },
          { x: 120, y: 20 }
        ];
    this.closed = Boolean(options.closed);
    this.recalculateBounds();
  }

  /**
   * Adiciona um ponto em coordenadas de mundo (World Space) e recalcula a Bounding Box.
   */
  addWorldPoint(worldX, worldY) {
    if (this.points.length === 0) {
      this.x = Math.round(worldX);
      this.y = Math.round(worldY);
      this.points.push({ x: 0, y: 0 });
    } else {
      this.points.push({
        x: Math.round(worldX - this.x),
        y: Math.round(worldY - this.y)
      });
    }
    this.recalculateBounds();
  }

  /**
   * Normaliza os pontos para que o canto superior esquerdo seja (this.x, this.y)
   * e atualiza (this.width, this.height).
   */
  recalculateBounds() {
    if (!this.points || this.points.length === 0) {
      this.width = 1;
      this.height = 1;
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const pt of this.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }

    if (minX !== 0 || minY !== 0) {
      this.x += minX;
      this.y += minY;
      this.points = this.points.map((pt) => ({
        x: pt.x - minX,
        y: pt.y - minY
      }));
      maxX -= minX;
      maxY -= minY;
    }

    this.width = Math.max(4, Math.round(maxX));
    this.height = Math.max(4, Math.round(maxY));
  }

  buildPath() {
    const path = new Path2D();
    if (!this.points || this.points.length === 0) return path;

    const first = this.points[0];
    path.moveTo(this.x + first.x, this.y + first.y);

    for (let i = 1; i < this.points.length; i++) {
      const pt = this.points[i];
      path.lineTo(this.x + pt.x, this.y + pt.y);
    }

    if (this.closed) {
      path.closePath();
    }
    return path;
  }

  containsPoint(ctx, worldX, worldY, zoomScale = 1, pointerType = 'mouse') {
    if (!this.visible || this.locked) return false;

    const b = this.getBounds();
    const pad = (pointerType === 'touch' ? 16 : 6) / zoomScale;
    if (
      worldX < b.x - pad ||
      worldX > b.x + b.width + pad ||
      worldY < b.y - pad ||
      worldY > b.y + b.height + pad
    ) {
      return false;
    }

    const path = this.buildPath();
    const strokeTolerance = (pointerType === 'touch' ? 24 : 9) / zoomScale;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineWidth = Math.max(this.strokeWidth, strokeTolerance);
    let hit = ctx.isPointInStroke(path, worldX, worldY);
    if (!hit && this.closed && this.fill && this.fill !== 'transparent') {
      hit = ctx.isPointInPath(path, worldX, worldY);
    }
    ctx.restore();
    return hit;
  }

  renderShape(ctx) {
    const path = this.buildPath();

    if (this.closed && this.fill && this.fill !== 'transparent' && this.fill !== 'none') {
      ctx.fillStyle = this.fill;
      ctx.fill(path);
    }

    if (this.stroke && this.stroke !== 'none' && this.strokeWidth > 0) {
      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = this.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke(path);
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      points: this.points,
      closed: this.closed
    };
  }
}
