// src/engine/nodes/CortexRect.js
import { CortexNode } from './CortexNode.js';

export class CortexRect extends CortexNode {
  constructor(options = {}) {
    super({ ...options, type: 'rect' });
    this.cornerRadius = Number(options.cornerRadius ?? 0);
  }

  buildPath() {
    const path = new Path2D();
    const b = this.getBounds();
    const r = Math.min(this.cornerRadius, b.width / 2, b.height / 2);

    if (r > 0 && typeof path.roundRect === 'function') {
      path.roundRect(b.x, b.y, b.width, b.height, r);
    } else {
      path.rect(b.x, b.y, b.width, b.height);
    }
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
      ctx.stroke(path);
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      cornerRadius: this.cornerRadius
    };
  }
}
