// src/components/cortex-color-picker.js
import { CortexElement } from '../core/CortexElement.js';

const PRESET_SWATCHES = [
  '#10b981', '#1473e6', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#06b6d4',
  '#ffffff', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a', '#18181b'
];

// Conversões matemáticas HSV <-> RGB <-> HEX
function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex) {
  const clean = String(hex || '#10b981').replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16) || 0,
      g: parseInt(clean[1] + clean[1], 16) || 0,
      b: parseInt(clean[2] + clean[2], 16) || 0
    };
  }
  return {
    r: parseInt(clean.slice(0, 2), 16) || 16,
    g: parseInt(clean.slice(2, 4), 16) || 185,
    b: parseInt(clean.slice(4, 6), 16) || 129
  };
}

function rgbToHsv(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, v };
}

export class CortexColorPicker extends CortexElement {
  static get observedAttributes() {
    return ['value', 'label'];
  }

  constructor() {
    super();
    this._value = '#10b981';
    this._hsv = { h: 160, s: 0.91, v: 0.72 };
    this._isOpen = false;
    this._isDraggingSV = false;
    this._handleOutside = this._handleOutside.bind(this);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'value' && newVal && newVal !== oldVal && newVal !== this._value) {
      this._setColorFromHex(newVal, false);
    }
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._setColorFromHex(val, false);
  }

  onLanguageChange() {
    this.render();
    this._setColorFromHex(this._value, false);
  }

  onMount() {
    const initial = this.getAttribute('value') || '#10b981';
    this._setColorFromHex(initial, false);
    document.addEventListener('pointerdown', this._handleOutside);
  }

  onUnmount() {
    document.removeEventListener('pointerdown', this._handleOutside);
  }

  _handleOutside(e) {
    if (this._isOpen && !e.composedPath().includes(this)) {
      this._isOpen = false;
      this._syncPopoverState();
    }
  }

  _setColorFromHex(hexStr, emitChange = true, commitHistory = false) {
    if (hexStr === 'transparent' || hexStr === 'none') {
      this._value = 'transparent';
    } else {
      const rgb = hexToRgb(hexStr);
      this._value = rgbToHex(rgb.r, rgb.g, rgb.b);
      this._hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    }
    this._updateUIFromState();

    if (emitChange) {
      this.emit('cortex-color-change', {
        value: this._value,
        commitHistory
      });
    }
  }

  _setColorFromHSV(emitChange = true, commitHistory = false) {
    const rgb = hsvToRgb(this._hsv.h, this._hsv.s, this._hsv.v);
    this._value = rgbToHex(rgb.r, rgb.g, rgb.b);
    this._updateUIFromState();

    if (emitChange) {
      this.emit('cortex-color-change', {
        value: this._value,
        commitHistory
      });
    }
  }

  _syncPopoverState() {
    const pop = this.shadowRoot.getElementById('popover');
    if (!pop) return;
    pop.classList.toggle('open', this._isOpen);

    if (this._isOpen) {
      // Posicionamento inteligente na viewport (Fixed) para não cortar nas bordas
      const triggerRect = this.shadowRoot.getElementById('trigger-btn').getBoundingClientRect();
      const popWidth = 236;
      const popHeight = 310;

      let left = triggerRect.left;
      let top = triggerRect.bottom + 6;

      if (left + popWidth > window.innerWidth - 12) {
        left = window.innerWidth - popWidth - 12;
      }
      if (left < 8) left = 8;

      if (top + popHeight > window.innerHeight - 12) {
        top = Math.max(8, triggerRect.top - popHeight - 6);
      }

      pop.style.left = `${Math.round(left)}px`;
      pop.style.top = `${Math.round(top)}px`;
      this._drawSVCanvas();
    }
  }

  _drawSVCanvas() {
    const canvas = this.shadowRoot.getElementById('sv-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // 1. Cor pura do Matiz (Hue)
    ctx.fillStyle = `hsl(${this._hsv.h}, 100%, 50%)`;
    ctx.fillRect(0, 0, w, h);

    // 2. Gradiente Horizontal Branco -> Transparente
    const gradWhite = ctx.createLinearGradient(0, 0, w, 0);
    gradWhite.addColorStop(0, 'rgba(255,255,255,1)');
    gradWhite.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradWhite;
    ctx.fillRect(0, 0, w, h);

    // 3. Gradiente Vertical Transparente -> Preto
    const gradBlack = ctx.createLinearGradient(0, 0, 0, h);
    gradBlack.addColorStop(0, 'rgba(0,0,0,0)');
    gradBlack.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = gradBlack;
    ctx.fillRect(0, 0, w, h);

    // 4. Cursor Circular de Seleção (S, V)
    const cx = this._hsv.s * w;
    const cy = (1 - this._hsv.v) * h;

    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _updateUIFromState() {
    const swatchEl = this.shadowRoot.getElementById('trigger-swatch');
    const hexLabel = this.shadowRoot.getElementById('trigger-hex');
    const hexInput = this.shadowRoot.getElementById('hex-input');
    const hueSlider = this.shadowRoot.getElementById('hue-slider');
    const rInput = this.shadowRoot.getElementById('rgb-r');
    const gInput = this.shadowRoot.getElementById('rgb-g');
    const bInput = this.shadowRoot.getElementById('rgb-b');

    const isTransparent = this._value === 'transparent';

    if (swatchEl) {
      swatchEl.style.background = isTransparent
        ? 'repeating-conic-gradient(#555 0% 25%, #222 0% 50%) 50% / 8px 8px'
        : this._value;
    }
    if (hexLabel) {
      hexLabel.textContent = isTransparent ? 'None' : this._value.toUpperCase();
    }
    if (hexInput && this.shadowRoot.activeElement !== hexInput) {
      hexInput.value = isTransparent ? 'transparent' : this._value.toUpperCase();
    }
    if (hueSlider && this.shadowRoot.activeElement !== hueSlider) {
      hueSlider.value = Math.round(this._hsv.h);
    }

    if (rInput && gInput && bInput && !isTransparent) {
      const rgb = hexToRgb(this._value);
      if (this.shadowRoot.activeElement !== rInput) rInput.value = rgb.r;
      if (this.shadowRoot.activeElement !== gInput) gInput.value = rgb.g;
      if (this.shadowRoot.activeElement !== bInput) bInput.value = rgb.b;
    }

    if (this._isOpen) {
      this._drawSVCanvas();
    }
  }

  render() {
    const label = this.getAttribute('label') || '';
    const hasEyeDropper = typeof window.EyeDropper === 'function';

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: inline-block;
          width: 100%;
          position: relative;
        }

        .picker-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          height: 26px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          padding: 0 6px;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .picker-trigger:hover {
          border-color: var(--accent-blue);
        }

        .lbl {
          color: var(--text-muted);
          font-size: 11px;
          flex-shrink: 0;
        }

        .swatch-preview {
          width: 18px;
          height: 18px;
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          flex-shrink: 0;
          margin-left: auto;
        }

        .hex-readout {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 65px;
          text-align: right;
        }

        /* Popover Flutuante Estilo Photoshop / Figma */
        .popover {
          display: none;
          position: fixed;
          width: 236px;
          background-color: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-dropdown);
          padding: 10px;
          z-index: 8000;
          flex-direction: column;
          gap: 8px;
        }

        .popover.open {
          display: flex;
        }

        .sv-wrap {
          width: 100%;
          height: 124px;
          border-radius: var(--radius-xs);
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          cursor: crosshair;
        }

        #sv-canvas {
          display: block;
          width: 100%;
          height: 100%;
          touch-action: none;
        }

        .hue-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hue-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 10px;
          border-radius: var(--radius-pill);
          background: linear-gradient(
            to right,
            #ff0000 0%,
            #ffff00 17%,
            #00ff00 33%,
            #00ffff 50%,
            #0000ff 67%,
            #ff00ff 83%,
            #ff0000 100%
          );
          outline: none;
          cursor: pointer;
        }

        .hue-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #18181b;
          box-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        .tool-mini-btn {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .tool-mini-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .inputs-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 4px;
        }

        .field-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .field-col input {
          width: 100%;
          height: 22px;
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 10px;
          text-align: center;
          outline: none;
        }

        .field-col span {
          font-size: 9px;
          color: var(--text-muted);
        }

        .swatches-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
          padding-top: 4px;
          border-top: 1px solid var(--border-subtle);
        }

        .swatch-cell {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          cursor: pointer;
          transition: transform 80ms ease;
        }

        .swatch-cell:hover {
          transform: scale(1.15);
          border-color: #ffffff;
        }
      </style>

      <button class="picker-trigger" id="trigger-btn" type="button">
        ${label ? `<span class="lbl">${label}</span>` : ''}
        <span class="swatch-preview" id="trigger-swatch"></span>
        <span class="hex-readout" id="trigger-hex">${this._value}</span>
      </button>

      <div class="popover" id="popover">
        <div class="sv-wrap">
          <canvas id="sv-canvas" width="216" height="124"></canvas>
        </div>

        <div class="hue-row">
          ${
            hasEyeDropper
              ? `<button class="tool-mini-btn" id="btn-eyedropper" title="Conta-Gotas (EyeDropper)">&#128167;</button>`
              : ''
          }
          <input type="range" class="hue-slider" id="hue-slider" min="0" max="360" value="${Math.round(this._hsv.h)}" />
          <button class="tool-mini-btn" id="btn-transparent" title="Sem Cor (Transparente)">&#8709;</button>
        </div>

        <div class="inputs-row">
          <div class="field-col">
            <input type="text" id="hex-input" value="${this._value}" />
            <span>HEX</span>
          </div>
          <div class="field-col">
            <input type="number" id="rgb-r" min="0" max="255" value="16" />
            <span>R</span>
          </div>
          <div class="field-col">
            <input type="number" id="rgb-g" min="0" max="255" value="185" />
            <span>G</span>
          </div>
          <div class="field-col">
            <input type="number" id="rgb-b" min="0" max="255" value="129" />
            <span>B</span>
          </div>
        </div>

        <div class="swatches-grid">
          ${PRESET_SWATCHES.map(
            (color) => `<button type="button" class="swatch-cell" data-swatch="${color}" style="background-color: ${color};" title="${color}"></button>`
          ).join('')}
        </div>
      </div>
    `;

    this._updateUIFromState();
    this._bindEvents();
  }

  _bindEvents() {
    const trigger = this.shadowRoot.getElementById('trigger-btn');
    const svCanvas = this.shadowRoot.getElementById('sv-canvas');
    const hueSlider = this.shadowRoot.getElementById('hue-slider');
    const hexInput = this.shadowRoot.getElementById('hex-input');
    const rInput = this.shadowRoot.getElementById('rgb-r');
    const gInput = this.shadowRoot.getElementById('rgb-g');
    const bInput = this.shadowRoot.getElementById('rgb-b');

    trigger.addEventListener('click', () => {
      this._isOpen = !this._isOpen;
      this._syncPopoverState();
    });

    // Interação no Canvas 2D de Saturação / Brilho (SV)
    const updateSVFromEvent = (e, commit) => {
      const rect = svCanvas.getBoundingClientRect();
      const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
      this._hsv.s = s;
      this._hsv.v = v;
      this._setColorFromHSV(true, commit);
    };

    svCanvas.addEventListener('pointerdown', (e) => {
      svCanvas.setPointerCapture(e.pointerId);
      this._isDraggingSV = true;
      updateSVFromEvent(e, false);
    });

    svCanvas.addEventListener('pointermove', (e) => {
      if (!this._isDraggingSV) return;
      updateSVFromEvent(e, false);
    });

    svCanvas.addEventListener('pointerup', (e) => {
      if (!this._isDraggingSV) return;
      this._isDraggingSV = false;
      updateSVFromEvent(e, true);
    });

    // Slider de Matiz (Hue)
    hueSlider.addEventListener('input', (e) => {
      this._hsv.h = Number(e.target.value);
      this._setColorFromHSV(true, false);
    });
    hueSlider.addEventListener('change', (e) => {
      this._hsv.h = Number(e.target.value);
      this._setColorFromHSV(true, true);
    });

    // Input HEX
    hexInput.addEventListener('change', (e) => {
      const val = e.target.value.trim();
      if (/^#?[0-9a-fA-F]{3,6}$/.test(val)) {
        this._setColorFromHex(val.startsWith('#') ? val : `#${val}`, true, true);
      }
    });

    // Inputs R, G, B
    const onRgbChange = () => {
      const hex = rgbToHex(Number(rInput.value), Number(gInput.value), Number(bInput.value));
      this._setColorFromHex(hex, true, true);
    };
    rInput.addEventListener('change', onRgbChange);
    gInput.addEventListener('change', onRgbChange);
    bInput.addEventListener('change', onRgbChange);

    // Botão Sem Cor (Transparente)
    this.shadowRoot.getElementById('btn-transparent').addEventListener('click', () => {
      this._setColorFromHex('transparent', true, true);
    });

    // Botão Conta-Gotas Nativo (EyeDropper API)
    const eyeBtn = this.shadowRoot.getElementById('btn-eyedropper');
    if (eyeBtn) {
      eyeBtn.addEventListener('click', async () => {
        try {
          const dropper = new window.EyeDropper();
          const result = await dropper.open();
          if (result?.sRGBHex) {
            this._setColorFromHex(result.sRGBHex, true, true);
          }
        } catch (_err) {
          // Cancelado pelo usuário
        }
      });
    }

    // Swatches Rápidos
    this.shadowRoot.querySelectorAll('.swatch-cell').forEach((cell) => {
      cell.addEventListener('click', () => {
        this._setColorFromHex(cell.dataset.swatch, true, true);
      });
    });
  }
}

customElements.define('cortex-color-picker', CortexColorPicker);
