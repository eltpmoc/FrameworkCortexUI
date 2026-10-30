// src/engine/nodes/CortexArrow.js
import { CortexNode } from './CortexNode.js';

export class CortexArrow extends CortexNode {
  constructor(options = {}) {
    super({
      ...options,
      type: 'arrow',
      name: options.name || `Seta ${Date.now().toString().slice(-4)}`,
      stroke: options.stroke ?? '#1473e6',
      strokeWidth: Number(options.strokeWidth ?? 2.5),
      fill: options.fill ?? '#1473e6'
    });
    this.headSize = Number(options.headSize ?? 14);
  }

  buildPath() {
    const path = new Path2D();
    const x1 = this.x;
    const y1 = this.y;
    const x2 = this.x + this.width;
    const y2 = this.y + this.height;

    path.moveTo(x1, y1);
    path.lineTo(x2, y2);
    return path;
  }

  renderShape(ctx) {
    const x1 = this.x;
    const y1 = this.y;
    const x2 = this.x + this.width;
    const y2 = this.y + this.height;
    const sw = Math.max(1, this.strokeWidth);

    ctx.save();
    ctx.strokeStyle = this.stroke || '#1473e6';
    ctx.fillStyle = this.stroke || '#1473e6';
    ctx.lineWidth = sw;
    ctx.lineCap = 'round';

    // 1. Linha base
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 2. Ponta da seta (Arrowhead)
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = Math.max(10, Math.min(28, this.headSize + sw * 2));
    const arrowAngle = Math.PI / 6; // 30 graus

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - arrowAngle),
      y2 - headLen * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      x2 - (headLen * 0.75) * Math.cos(angle),
      y2 - (headLen * 0.75) * Math.sin(angle)
    );
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + arrowAngle),
      y2 - headLen * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  containsPoint(ctx, worldX, worldY, zoomScale = 1, pointerType = 'mouse') {
    if (!this.visible || this.locked) return false;
    const path = this.buildPath();
    const minHit = (pointerType === 'touch' ? 24 : 10) / zoomScale;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineWidth = Math.max(this.strokeWidth, minHit);
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

  toJSON() {
    return {
      ...super.toJSON(),
      type: 'arrow',
      headSize: this.headSize
    };
  }
}
