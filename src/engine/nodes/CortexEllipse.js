// src/engine/nodes/CortexEllipse.js
import { CortexNode } from './CortexNode.js';

export class CortexEllipse extends CortexNode {
  constructor(options = {}) {
    super({
      ...options,
      type: 'ellipse',
      name: options.name || `Círculo ${Date.now().toString().slice(-4)}`
    });
  }

  buildPath() {
    const path = new Path2D();
    const b = this.getBounds();
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const rx = Math.max(0.5, b.width / 2);
    const ry = Math.max(0.5, b.height / 2);
    path.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    return path;
  }

  containsPoint(ctx, worldX, worldY, zoomScale = 1, pointerType = 'mouse') {
    if (!this.visible || this.locked) return false;

    // Converte worldX, worldY para o espaço local rotacionado do nó
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    let lx = worldX;
    let ly = worldY;
    if (this.rotation) {
      const rad = (-this.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = worldX - cx;
      const dy = worldY - cy;
      lx = cx + (dx * cos - dy * sin);
      ly = cy + (dx * sin + dy * cos);
    }

    const b = this.getBounds();
    const rx = Math.max(0.5, b.width / 2);
    const ry = Math.max(0.5, b.height / 2);
    const touchPadding = pointerType === 'touch' ? 14 / zoomScale : 2 / zoomScale;

    const normX = (lx - cx) / (rx + touchPadding);
    const normY = (ly - cy) / (ry + touchPadding);
    return normX * normX + normY * normY <= 1;
  }

  renderShape(ctx) {
    const path = this.buildPath();

    if (this.fill && this.fill !== 'transparent' && this.fill !== 'none') {
      ctx.fillStyle = this.fill;
      ctx.fill(path);
    }

    if (this.stroke && this.stroke !== 'none' && this.strokeWidth > 0) {
      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = this.strokeWidth;
      ctx.stroke(path);
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: 'ellipse'
    };
  }
}
