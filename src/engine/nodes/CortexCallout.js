// src/engine/nodes/CortexCallout.js
import { CortexNode } from './CortexNode.js';

export class CortexCallout extends CortexNode {
  constructor(options = {}) {
    super({
      ...options,
      type: 'callout',
      name: options.name || `Balão ${Date.now().toString().slice(-4)}`
    });
    this.text = options.text || 'CortexUI';
    this.cornerRadius = Number(options.cornerRadius ?? 8);
  }

  buildPath() {
    const path = new Path2D();
    const b = this.getBounds();
    const r = Math.min(this.cornerRadius, b.width / 4, b.height / 4);
    const tailW = Math.min(20, b.width * 0.25);
    const tailH = Math.min(16, b.height * 0.3);
    const bodyH = Math.max(10, b.height - tailH);

    // Corpo retangular arredondado com cauda na borda inferior
    const x = b.x;
    const y = b.y;
    const w = b.width;
    const h = bodyH;

    path.moveTo(x + r, y);
    path.lineTo(x + w - r, y);
    path.quadraticCurveTo(x + w, y, x + w, y + r);
    path.lineTo(x + w, y + h - r);
    path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

    // Cauda do balão apontando para baixo/esquerda
    const tailBaseX = x + Math.max(r + 5, w * 0.35);
    path.lineTo(tailBaseX + tailW, y + h);
    path.lineTo(tailBaseX - 5, y + h + tailH);
    path.lineTo(tailBaseX, y + h);

    path.lineTo(x + r, y + h);
    path.quadraticCurveTo(x, y + h, x, y + h - r);
    path.lineTo(x, y + r);
    path.quadraticCurveTo(x, y, x + r, y);
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

    // Renderiza o texto centralizado do balão
    if (this.text) {
      ctx.save();
      const b = this.getBounds();
      const bodyH = Math.max(10, b.height - Math.min(16, b.height * 0.3));
      ctx.fillStyle = this.stroke || '#ffffff';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.text, b.x + b.width / 2, b.y + bodyH / 2);
      ctx.restore();
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: 'callout',
      text: this.text,
      cornerRadius: this.cornerRadius
    };
  }
}
