// src/engine/nodes/CortexText.js
import { CortexNode } from './CortexNode.js';

export class CortexText extends CortexNode {
  constructor(options = {}) {
    super({
      ...options,
      type: 'text',
      fill: options.fill ?? '#18181b',
      stroke: options.stroke ?? 'none',
      strokeWidth: Number(options.strokeWidth ?? 0),
      width: Number(options.width ?? 180),
      height: Number(options.height ?? 36)
    });

    this.text = options.text ?? 'CortexUI Text Frame';
    this.fontFamily = options.fontFamily ?? 'Inter, Segoe UI, sans-serif';
    this.fontSize = Number(options.fontSize ?? 20);
    this.fontWeight = options.fontWeight ?? '600';
    this.fontStyle = options.fontStyle ?? 'normal';
    this.underline = Boolean(options.underline);
    this.textAlign = options.textAlign ?? 'left';
    this.lineHeight = Number(options.lineHeight ?? 1.3);
  }

  _getFontString() {
    return `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
  }

  renderShape(ctx) {
    ctx.font = this._getFontString();
    ctx.textBaseline = 'top';
    ctx.textAlign = this.textAlign;
    ctx.fillStyle = this.fill || '#18181b';

    const lines = String(this.text).split('\n');
    const stepY = this.fontSize * this.lineHeight;
    let maxLineWidth = 40;

    lines.forEach((line, index) => {
      const metrics = ctx.measureText(line);
      if (metrics.width > maxLineWidth) {
        maxLineWidth = metrics.width;
      }

      let drawX = this.x;
      if (this.textAlign === 'center') drawX = this.x + this.width / 2;
      else if (this.textAlign === 'right') drawX = this.x + this.width;

      const drawY = this.y + index * stepY;
      ctx.fillText(line, drawX, drawY);

      if (this.underline) {
        ctx.save();
        ctx.strokeStyle = this.fill || '#18181b';
        ctx.lineWidth = Math.max(1, this.fontSize / 14);
        let lineStartX = this.x;
        if (this.textAlign === 'center') lineStartX = drawX - metrics.width / 2;
        else if (this.textAlign === 'right') lineStartX = drawX - metrics.width;

        ctx.beginPath();
        ctx.moveTo(lineStartX, drawY + this.fontSize * 1.05);
        ctx.lineTo(lineStartX + metrics.width, drawY + this.fontSize * 1.05);
        ctx.stroke();
        ctx.restore();
      }
    });

    this.width = Math.max(40, Math.ceil(maxLineWidth + 10));
    this.height = Math.max(24, Math.ceil(lines.length * stepY + 6));
  }

  toJSON() {
    return {
      ...super.toJSON(),
      text: this.text,
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      fontWeight: this.fontWeight,
      fontStyle: this.fontStyle,
      underline: this.underline,
      textAlign: this.textAlign,
      lineHeight: this.lineHeight
    };
  }
}
