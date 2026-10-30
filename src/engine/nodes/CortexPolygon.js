// src/engine/nodes/CortexPolygon.js
import { CortexNode } from './CortexNode.js';

export class CortexPolygon extends CortexNode {
  constructor(options = {}) {
    super({
      ...options,
      type: 'polygon',
      name: options.name || `Polígono ${Date.now().toString().slice(-4)}`
    });
    this.sides = Number(options.sides ?? 3); // 3: Triângulo, 5: Pentágono, 6: Hexágono, 8: Octógono
  }

  buildPath() {
    const path = new Path2D();
    const b = this.getBounds();
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const rx = Math.max(0.5, b.width / 2);
    const ry = Math.max(0.5, b.height / 2);
    const n = Math.max(3, this.sides);

    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);
      if (i === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
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
      type: 'polygon',
      sides: this.sides
    };
  }
}
