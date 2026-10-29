// src/engine/nodes/CortexLine.js
import { CortexNode } from './CortexNode.js';

export class CortexLine extends CortexNode {
  constructor(options = {}) {
    super({
      ...options,
      type: 'line',
      stroke: options.stroke ?? '#1473e6',
      strokeWidth: Number(options.strokeWidth ?? 2)
    });
  }

  get x2() {
    return this.x + this.width;
  }

  set x2(val) {
    this.width = val - this.x;
  }

  get y2() {
    return this.y + this.height;
  }

  set y2(val) {
    this.height = val - this.y;
  }

  buildPath() {
    const path = new Path2D();
    path.moveTo(this.x, this.y);
    path.lineTo(this.x + this.width, this.y + this.height);
    return path;
  }

  containsPoint(ctx, worldX, worldY, zoomScale = 1, pointerType = 'mouse') {
    if (!this.visible || this.locked) return false;
    const path = this.buildPath();
    const minStrokeHit = (pointerType === 'touch' ? 24 : 9) / zoomScale;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineWidth = Math.max(this.strokeWidth, minStrokeHit);
    const hit = ctx.isPointInStroke(path, worldX, worldY);
    ctx.restore();
    return hit;
  }

  getHandlePoints() {
    return [
      { id: 'start', x: this.x, y: this.y, cursor: 'move' },
      { id: 'end', x: this.x + this.width, y: this.y + this.height, cursor: 'move' }
    ];
  }

  renderShape(ctx) {
    const path = this.buildPath();
    ctx.strokeStyle = this.stroke || '#1473e6';
    ctx.lineWidth = Math.max(0.5, this.strokeWidth);
    ctx.lineCap = 'round';
    ctx.stroke(path);
  }

  drawSelection(ctx, zoomScale = 1) {
    const invScale = 1 / zoomScale;
    const handleSize = 6.5 * invScale;

    ctx.save();
    ctx.strokeStyle = '#1473e6';
    ctx.lineWidth = 1 * invScale;
    ctx.setLineDash([4 * invScale, 3 * invScale]);

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    for (const h of this.getHandlePoints()) {
      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    }
    ctx.restore();
  }
}
