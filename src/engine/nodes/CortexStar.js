// src/engine/nodes/CortexStar.js
import { CortexNode } from './CortexNode.js';

export class CortexStar extends CortexNode {
  constructor(options = {}) {
    super({
      ...options,
      type: 'star',
      name: options.name || `Estrela ${Date.now().toString().slice(-4)}`
    });
    this.points = Number(options.points ?? 5);
    this.innerRadiusRatio = Number(options.innerRadiusRatio ?? 0.42);
  }

  /**
   * Retorna os vértices 2D exatos da estrela (pontas externas e internas)
   * em coordenadas locais relativas a (this.x, this.y).
   */
  getVertices() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rx = Math.max(0.5, this.width / 2);
    const ry = Math.max(0.5, this.height / 2);
    const n = Math.max(3, this.points);
    const totalVertices = n * 2;
    const verts = [];

    for (let i = 0; i < totalVertices; i++) {
      const isInner = i % 2 !== 0;
      const angle = -Math.PI / 2 + (i * Math.PI) / n;
      const rRatio = isInner ? this.innerRadiusRatio : 1.0;
      verts.push({
        x: cx + rx * rRatio * Math.cos(angle),
        y: cy + ry * rRatio * Math.sin(angle)
      });
    }
    return verts;
  }

  buildPath() {
    const path = new Path2D();
    const b = this.getBounds();
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const rx = Math.max(0.5, b.width / 2);
    const ry = Math.max(0.5, b.height / 2);
    const n = Math.max(3, this.points);
    const totalVertices = n * 2;

    for (let i = 0; i < totalVertices; i++) {
      const isInner = i % 2 !== 0;
      const angle = -Math.PI / 2 + (i * Math.PI) / n;
      const rRatio = isInner ? this.innerRadiusRatio : 1.0;
      const x = cx + rx * rRatio * Math.cos(angle);
      const y = cy + ry * rRatio * Math.sin(angle);
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
      type: 'star',
      points: this.points,
      innerRadiusRatio: this.innerRadiusRatio
    };
  }
}
