// src/engine/nodes/CortexImage.js
import { CortexNode } from './CortexNode.js';

export class CortexImage extends CortexNode {
  constructor(options = {}) {
    super({
      ...options,
      type: 'image',
      name: options.name || `Imagem ${Date.now().toString().slice(-4)}`
    });

    this.src = options.src || '';
    this.naturalWidth = Number(options.naturalWidth || 0);
    this.naturalHeight = Number(options.naturalHeight || 0);
    this.preserveAspectRatio = options.preserveAspectRatio !== false;
    this.cornerRadius = Number(options.cornerRadius || 0);
    this.flipX = Boolean(options.flipX);
    this.flipY = Boolean(options.flipY);
    this.stroke = options.stroke ?? 'none';
    this.strokeWidth = Number(options.strokeWidth ?? 0);
    this.fill = options.fill ?? 'transparent';

    this._img = null;
    this._loaded = false;
    this._loadError = false;

    if (this.src) {
      this._loadImage(this.src);
    }
  }

  _loadImage(src) {
    if (!src) return;
    this._img = new Image();
    this._img.crossOrigin = 'anonymous';
    this._img.onload = () => {
      this._loaded = true;
      this._loadError = false;
      this.naturalWidth = this._img.naturalWidth || this.naturalWidth;
      this.naturalHeight = this._img.naturalHeight || this.naturalHeight;

      // Se as dimensões do nó forem o padrão de 100x100 e a imagem tiver dimensões nativas
      if ((this.width === 100 && this.height === 100) || (!this.width && !this.height)) {
        const maxDim = 400;
        const nw = this.naturalWidth || 400;
        const nh = this.naturalHeight || 300;
        const ratio = nw / nh;
        if (nw > nh) {
          this.width = Math.min(maxDim, nw);
          this.height = Math.round(this.width / ratio);
        } else {
          this.height = Math.min(maxDim, nh);
          this.width = Math.round(this.height * ratio);
        }
      }

      if (this._engine) {
        this._engine.requestRender();
      }
    };
    this._img.onerror = () => {
      this._loaded = false;
      this._loadError = true;
      if (this._engine) {
        this._engine.requestRender();
      }
    };
    this._img.src = src;
  }

  setSource(newSrc, newName) {
    this.src = newSrc;
    if (newName) this.name = newName;
    this._loaded = false;
    this._loadError = false;
    this._loadImage(newSrc);
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
    const b = this.getBounds();
    const r = Math.min(this.cornerRadius, b.width / 2, b.height / 2);

    ctx.save();

    // Espelhamento horizontal ou vertical se ativado
    if (this.flipX || this.flipY) {
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      ctx.translate(cx, cy);
      ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);
      ctx.translate(-cx, -cy);
    }

    // Clip path com cantos arredondados se cornerRadius > 0
    if (r > 0) {
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(b.x, b.y, b.width, b.height, r);
      } else {
        ctx.rect(b.x, b.y, b.width, b.height);
      }
      ctx.clip();
    }

    if (this._img && this._img.complete && this._loaded && this._img.naturalWidth > 0) {
      // Desenha a imagem JPG ou PNG com fidelidade de interpolação suave
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(this._img, b.x, b.y, b.width, b.height);
    } else if (this._loadError) {
      // Placeholder elegante de erro
      ctx.fillStyle = '#27272a';
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x, b.y, b.width, b.height);

      ctx.fillStyle = '#f87171';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠️ Erro ao carregar imagem', b.x + b.width / 2, b.y + b.height / 2);
    } else {
      // Placeholder elegante de carregamento
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, b.width, b.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🖼️ Carregando imagem...', b.x + b.width / 2, b.y + b.height / 2);
    }

    // Contorno / Borda opcional
    if (this.stroke && this.stroke !== 'none' && this.strokeWidth > 0) {
      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = this.strokeWidth;
      if (r > 0 && typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, r);
        ctx.stroke();
      } else {
        ctx.strokeRect(b.x, b.y, b.width, b.height);
      }
    }

    ctx.restore();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: 'image',
      src: this.src,
      naturalWidth: this.naturalWidth,
      naturalHeight: this.naturalHeight,
      preserveAspectRatio: this.preserveAspectRatio,
      cornerRadius: this.cornerRadius,
      flipX: this.flipX,
      flipY: this.flipY
    };
  }
}
