// src/engine/nodes/CortexDiamond.js
import { CortexNode } from './CortexNode.js';

export class CortexDiamond extends CortexNode {
  constructor(options = {}) {
    super({
      ...options,
      type: 'diamond',
      name: options.name || `Losango ${Date.now().toString().slice(-4)}`
    });
  }

  buildPath() {
    const path = new Path2D();
    const b = this.getBounds();
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;

    path.moveTo(cx, b.y);
    path.lineTo(b.x + b.width, cy);
    path.lineTo(cx, b.y + b.height);
    path.lineTo(b.x, cy);
    path.closePath();
    return path;
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
      ctx.lineJoin = 'round';
      ctx.stroke(path);
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: 'diamond'
    };
  }
}
