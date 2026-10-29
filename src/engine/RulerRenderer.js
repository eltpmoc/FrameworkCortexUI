// src/engine/RulerRenderer.js
export class RulerRenderer {
  constructor(hCanvas, vCanvas) {
    this.hCanvas = hCanvas;
    this.vCanvas = vCanvas;
    this.hCtx = hCanvas.getContext('2d');
    this.vCtx = vCanvas.getContext('2d');

    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.rulerSize = 20;

    // Coordenadas do cursor no espaço de tela (relativas ao canvas principal)
    this.cursorScreenX = null;
    this.cursorScreenY = null;
  }

  /**
   * Ajusta os buffers das réguas considerando o Device Pixel Ratio (Retina / 4K).
   */
  resize(stageWidth, stageHeight, dpr = window.devicePixelRatio || 1) {
    this.dpr = Math.max(1, dpr);
    this.width = Math.max(1, Math.floor(stageWidth));
    this.height = Math.max(1, Math.floor(stageHeight));

    this.hCanvas.width = Math.floor(this.width * this.dpr);
    this.hCanvas.height = Math.floor(this.rulerSize * this.dpr);
    this.hCanvas.style.width = `${this.width}px`;
    this.hCanvas.style.height = `${this.rulerSize}px`;

    this.vCanvas.width = Math.floor(this.rulerSize * this.dpr);
    this.vCanvas.height = Math.floor(this.height * this.dpr);
    this.vCanvas.style.width = `${this.rulerSize}px`;
    this.vCanvas.style.height = `${this.height}px`;
  }

  /**
   * Determina o intervalo principal de marcação (step) em unidades de mundo conforme o zoom.
   */
  _computeStep(zoomScale) {
    const rawStep = 90 / zoomScale;
    const steps = [10, 20, 50, 100, 200, 500, 1000];
    for (const s of steps) {
      if (s >= rawStep) return s;
    }
    return 1000;
  }

  /**
   * Desenha ambas as réguas sincronizadas com (panX, panY, zoomScale) e marcador do mouse.
   */
  render(panX, panY, zoomScale) {
    if (this.width <= 1 || this.height <= 1) return;

    const majorStep = this._computeStep(zoomScale);
    const minorStep = majorStep / 10;

    this._renderHorizontal(panX, zoomScale, majorStep, minorStep);
    this._renderVertical(panY, zoomScale, majorStep, minorStep);
  }

  _getThemeColors() {
    const rs = getComputedStyle(document.documentElement);
    return {
      bg: rs.getPropertyValue('--ruler-bg').trim() || '#252526',
      border: rs.getPropertyValue('--ruler-border').trim() || '#333337',
      tick: rs.getPropertyValue('--ruler-tick').trim() || '#6e6e77',
      text: rs.getPropertyValue('--ruler-text').trim() || '#9ca3af',
      accent: rs.getPropertyValue('--accent-blue').trim() || '#1473e6'
    };
  }

  _renderHorizontal(panX, zoomScale, majorStep, minorStep) {
    const ctx = this.hCtx;
    const w = this.width;
    const h = this.rulerSize;
    const colors = this._getThemeColors();

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Fundo e borda inferior conforme Tema Ativo
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h - 0.5);
    ctx.lineTo(w, h - 0.5);
    ctx.stroke();

    // Limites visíveis em World Space
    const worldStart = (0 - panX) / zoomScale;
    const worldEnd = (w - panX) / zoomScale;
    const firstTick = Math.floor(worldStart / minorStep) * minorStep;

    ctx.strokeStyle = colors.tick;
    ctx.fillStyle = colors.text;
    ctx.font = '500 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, sans-serif';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    ctx.beginPath();
    for (let val = firstTick; val <= worldEnd; val += minorStep) {
      const sx = Math.round(panX + val * zoomScale) + 0.5;
      if (sx < 0 || sx > w) continue;

      const roundedVal = Math.round(val * 100) / 100;
      const isMajor = Math.abs(roundedVal % majorStep) < 0.001;
      const isMedium = Math.abs(roundedVal % (majorStep / 2)) < 0.001;

      const tickHeight = isMajor ? 12 : isMedium ? 6 : 3.5;
      ctx.moveTo(sx, h - tickHeight);
      ctx.lineTo(sx, h - 1);

      if (isMajor) {
        ctx.fillText(String(Math.round(roundedVal)), sx + 3, 2);
      }
    }
    ctx.stroke();

    // Marcador Dinâmico do Cursor
    if (this.cursorScreenX !== null && this.cursorScreenX >= 0 && this.cursorScreenX <= w) {
      const cx = Math.round(this.cursorScreenX) + 0.5;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();
    }

    ctx.restore();
  }

  _renderVertical(panY, zoomScale, majorStep, minorStep) {
    const ctx = this.vCtx;
    const w = this.rulerSize;
    const h = this.height;
    const colors = this._getThemeColors();

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Fundo e borda direita conforme Tema Ativo
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w - 0.5, 0);
    ctx.lineTo(w - 0.5, h);
    ctx.stroke();

    const worldStart = (0 - panY) / zoomScale;
    const worldEnd = (h - panY) / zoomScale;
    const firstTick = Math.floor(worldStart / minorStep) * minorStep;

    ctx.strokeStyle = colors.tick;
    ctx.fillStyle = colors.text;
    ctx.font = '500 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, sans-serif';

    ctx.beginPath();
    for (let val = firstTick; val <= worldEnd; val += minorStep) {
      const sy = Math.round(panY + val * zoomScale) + 0.5;
      if (sy < 0 || sy > h) continue;

      const roundedVal = Math.round(val * 100) / 100;
      const isMajor = Math.abs(roundedVal % majorStep) < 0.001;
      const isMedium = Math.abs(roundedVal % (majorStep / 2)) < 0.001;

      const tickWidth = isMajor ? 12 : isMedium ? 6 : 3.5;
      ctx.moveTo(w - tickWidth, sy);
      ctx.lineTo(w - 1, sy);

      if (isMajor) {
        ctx.save();
        ctx.translate(2, sy + 3);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(String(Math.round(roundedVal)), 0, 0);
        ctx.restore();
      }
    }
    ctx.stroke();

    // Marcador Dinâmico do Cursor
    if (this.cursorScreenY !== null && this.cursorScreenY >= 0 && this.cursorScreenY <= h) {
      const cy = Math.round(this.cursorScreenY) + 0.5;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();
    }

    ctx.restore();
  }
}
