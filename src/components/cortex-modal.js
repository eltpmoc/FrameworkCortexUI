// src/components/cortex-modal.js
import { CortexElement } from '../core/CortexElement.js';
import { t, getMonthNames, getWeekdayNames } from '../core/i18n.js';

let _singletonModalInstance = null;

const ICONS = {
  info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  question: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1473e6" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
};

export class CortexModalElement extends CortexElement {
  constructor() {
    super();
    this._currentResolver = null;
    this._mode = null; // 'alert' | 'confirm' | 'prompt' | 'form'
    this._dragOffset = { x: 0, y: 0 };
    this._isDragging = false;
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  onMount() {
    _singletonModalInstance = this;
    window.addEventListener('keydown', this._onKeyDown);
  }

  /**
   * O modal não é re-renderizado ao trocar o idioma (preserva diálogos e toasts abertos);
   * os textos são resolvidos a cada abertura via t().
   */
  onLanguageChange() {}

  onUnmount() {
    if (_singletonModalInstance === this) {
      _singletonModalInstance = null;
    }
    window.removeEventListener('keydown', this._onKeyDown);
  }

  _onKeyDown(e) {
    const backdrop = this.shadowRoot.getElementById('modal-backdrop');
    if (!backdrop || !backdrop.classList.contains('open')) return;

    if (e.key === 'Escape') {
      const openPopovers = this.shadowRoot.querySelectorAll('.modal-cal-popover[style*="display: block"]');
      if (openPopovers.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        openPopovers.forEach((p) => {
          p.style.display = 'none';
          p.closest('.modal-date-picker-wrap')?.classList.remove('is-open');
        });
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this._resolveModal(this._mode === 'confirm' ? false : null);
    } else if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      e.stopPropagation();
      this._submitModal();
    }
  }

  _submitModal() {
    if (this._mode === 'alert') {
      this._resolveModal(true);
    } else if (this._mode === 'confirm') {
      this._resolveModal(true);
    } else if (this._mode === 'prompt') {
      const input = this.shadowRoot.getElementById('prompt-input');
      this._resolveModal(input ? input.value : '');
    } else if (this._mode === 'form') {
      const values = {};
      this.shadowRoot.querySelectorAll('[data-field-name]').forEach((el) => {
        const key = el.dataset.fieldName;
        if (el.type === 'checkbox') {
          values[key] = el.checked;
        } else if (el.type === 'number') {
          values[key] = Number(el.value);
        } else {
          values[key] = el.value;
        }
      });
      this._resolveModal(values);
    }
  }

  _resolveModal(result) {
    const backdrop = this.shadowRoot.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
    }
    if (this._currentResolver) {
      const resolve = this._currentResolver;
      this._currentResolver = null;
      this._mode = null;
      resolve(result);
    }
  }

  /**
   * Abre um diálogo modal Desktop configurável.
   */
  openDialog(config = {}) {
    const targetParent = document.fullscreenElement || document.body;
    if (this.parentElement !== targetParent) {
      targetParent.appendChild(this);
    }

    return new Promise((resolve) => {
      this._currentResolver = resolve;
      this._mode = config.mode || 'alert';

      const title = config.title || 'CortexUI System';
      const message = config.message || '';
      const iconType = config.type || (this._mode === 'confirm' ? 'question' : 'info');
      const confirmText = config.confirmText || t('common.ok');
      const cancelText = config.cancelText || t('common.cancel');
      const showCancel = this._mode !== 'alert';
      const isDanger = Boolean(config.danger);
      const width = config.width || '380px';

      const dialogWin = this.shadowRoot.getElementById('modal-window');
      const titleEl = this.shadowRoot.getElementById('modal-title');
      const iconEl = this.shadowRoot.getElementById('modal-icon');
      const bodyEl = this.shadowRoot.getElementById('modal-body');
      const footerEl = this.shadowRoot.getElementById('modal-footer');
      const backdrop = this.shadowRoot.getElementById('modal-backdrop');

      dialogWin.style.width = `min(92vw, ${width})`;
      dialogWin.style.transform = 'translate(0px, 0px)';
      this._dragOffset = { x: 0, y: 0 };

      titleEl.textContent = title;
      iconEl.innerHTML = ICONS[iconType] || ICONS.info;

      // Renderiza o corpo conforme o modo
      let bodyHTML = message ? `<div class="modal-msg">${message}</div>` : '';

      if (this._mode === 'prompt') {
        bodyHTML += `
          <input
            id="prompt-input"
            class="modal-input"
            type="${config.inputType || 'text'}"
            value="${config.defaultValue ?? ''}"
            placeholder="${config.placeholder ?? ''}"
          />
        `;
      } else if (this._mode === 'form' && Array.isArray(config.fields)) {
        bodyHTML += `<div class="form-grid">
          ${config.fields
            .map((f) => {
              const curVal = f.value ?? f.defaultValue ?? '';
              if (f.type === 'select') {
                return `
                  <label class="form-row">
                    <span class="form-label">${f.label}</span>
                    <select class="modal-input" data-field-name="${f.name}">
                      ${(f.options || [])
                        .map((opt) => {
                          const val = typeof opt === 'object' && opt !== null ? opt.value : opt;
                          const lbl = typeof opt === 'object' && opt !== null ? (opt.label ?? opt.value) : opt;
                          return `<option value="${val}" ${String(val) === String(curVal) ? 'selected' : ''}>${lbl}</option>`;
                        })
                        .join('')}
                    </select>
                  </label>
                `;
              }
              if (f.type === 'checkbox') {
                return `
                  <label class="form-row checkbox-row">
                    <input type="checkbox" data-field-name="${f.name}" ${curVal ? 'checked' : ''} />
                    <span class="form-label">${f.label}</span>
                  </label>
                `;
              }
              if (f.type === 'date' || f.type === 'datepicker') {
                return `
                  <label class="form-row">
                    <span class="form-label">${f.label}</span>
                    <div class="modal-date-picker-wrap">
                      <input
                        class="modal-input modal-date-input"
                        type="text"
                        data-field-name="${f.name}"
                        data-is-date="true"
                        value="${curVal}"
                        placeholder="${f.placeholder || 'M/D/YYYY'}"
                      />
                      <button type="button" class="modal-cal-btn" data-cal-trigger="${f.name}" title="${t('common.openCalendar')}">📅</button>
                      <div class="modal-cal-popover" data-cal-popover="${f.name}" style="display: none;"></div>
                    </div>
                  </label>
                `;
              }
              return `
                <label class="form-row">
                  <span class="form-label">${f.label}</span>
                  <input
                    class="modal-input"
                    type="${f.type || 'text'}"
                    data-field-name="${f.name}"
                    value="${curVal}"
                    step="${f.step ?? 'any'}"
                  />
                </label>
              `;
            })
            .join('')}
        </div>`;
      }

      bodyEl.innerHTML = bodyHTML;

      footerEl.innerHTML = `
        ${
          config.deleteText
            ? `<button class="btn-modal btn-delete" id="btn-delete">🗑 ${config.deleteText}</button>`
            : ''
        }
        ${
          showCancel
            ? `<button class="btn-modal btn-cancel" id="btn-cancel">${cancelText}</button>`
            : ''
        }
        <button class="btn-modal ${isDanger ? 'btn-danger' : 'btn-confirm'}" id="btn-confirm">
          ${confirmText}
        </button>
      `;

      backdrop.classList.add('open');

      // Botão "Excluir" dedicado (opcional): resolve a Promise com { __action: 'delete' }
      const btnDelete = this.shadowRoot.getElementById('btn-delete');
      if (btnDelete) {
        btnDelete.addEventListener('click', () => {
          this._resolveModal({ __action: 'delete' });
        });
      }

      const btnCancel = this.shadowRoot.getElementById('btn-cancel');
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          this._resolveModal(this._mode === 'confirm' ? false : null);
        });
      }

      const btnConfirm = this.shadowRoot.getElementById('btn-confirm');
      btnConfirm.addEventListener('click', () => {
        this._submitModal();
      });

      this._initModalDatePickers();

      requestAnimationFrame(() => {
        const firstInput =
          this.shadowRoot.getElementById('prompt-input') ||
          this.shadowRoot.querySelector('[data-field-name]');
        if (firstInput) {
          firstInput.focus();
          if (typeof firstInput.select === 'function') firstInput.select();
        } else {
          btnConfirm.focus();
        }
      });
    });
  }

  _initModalDatePickers() {
    const wrapList = this.shadowRoot.querySelectorAll('.modal-date-picker-wrap');
    wrapList.forEach((wrap) => {
      const input = wrap.querySelector('.modal-date-input');
      const btn = wrap.querySelector('.modal-cal-btn');
      const popover = wrap.querySelector('.modal-cal-popover');
      if (!input || !btn || !popover) return;

      let viewDate = new Date();
      let selMonth = -1, selDay = -1, selYear = -1;
      if (input.value) {
        const parts = input.value.split(/[-/]/);
        if (parts.length === 3) {
          // Supports M/D/YYYY or YYYY-MM-DD
          if (parts[0].length === 4) {
            selYear = Number(parts[0]);
            selMonth = Number(parts[1]) - 1;
            selDay = Number(parts[2]);
          } else {
            selYear = Number(parts[2]);
            selMonth = Number(parts[0]) - 1;
            selDay = Number(parts[1]);
          }
          viewDate = new Date(selYear, selMonth, selDay);
        }
      }
      if (isNaN(viewDate.getTime())) viewDate = new Date();

      const renderCal = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const monthNames = getMonthNames('long');
        const weekdayNames = getWeekdayNames('narrow');

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        popover.innerHTML = `
          <div class="cal-mini-header">
            <button type="button" class="cal-mini-nav" id="m-cal-prev">&#10094;</button>
            <span class="cal-mini-title">${monthNames[month]} ${year}</span>
            <button type="button" class="cal-mini-nav" id="m-cal-next">&#10095;</button>
          </div>
          <div class="cal-mini-weekdays">
            ${weekdayNames.map((w) => `<span>${w}</span>`).join('')}
          </div>
          <div class="cal-mini-days">
            ${Array(firstDay).fill(0).map(() => `<span class="cal-mini-empty"></span>`).join('')}
            ${Array(daysInMonth).fill(0).map((_, i) => {
              const d = i + 1;
              const isSelected = (d === selDay && month === selMonth && year === selYear);
              return `<button type="button" class="cal-mini-day ${isSelected ? 'selected' : ''}" data-m-day="${d}">${d}</button>`;
            }).join('')}
          </div>
        `;

        popover.querySelector('#m-cal-prev')?.addEventListener('click', (e) => {
          e.stopPropagation();
          viewDate.setMonth(viewDate.getMonth() - 1);
          renderCal();
        });

        popover.querySelector('#m-cal-next')?.addEventListener('click', (e) => {
          e.stopPropagation();
          viewDate.setMonth(viewDate.getMonth() + 1);
          renderCal();
        });

        popover.querySelectorAll('[data-m-day]').forEach((dayBtn) => {
          dayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const d = Number(dayBtn.getAttribute('data-m-day'));
            selDay = d;
            selMonth = month;
            selYear = year;
            input.value = `${month + 1}/${d}/${year}`;
            popover.style.display = 'none';
            wrap.classList.remove('is-open');
            input.dispatchEvent(new Event('change', { bubbles: true }));
          });
        });
      };

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = popover.style.display === 'block';
        this.shadowRoot.querySelectorAll('.modal-cal-popover').forEach((p) => {
          p.style.display = 'none';
          p.closest('.modal-date-picker-wrap')?.classList.remove('is-open');
        });
        if (!isOpen) {
          wrap.classList.add('is-open');
          popover.style.display = 'block';

          // Posicionamento inteligente: se estiver próximo ao rodapé do modal (ex: dueDate), abre para cima
          const wrapRect = wrap.getBoundingClientRect();
          const win = this.shadowRoot.getElementById('modal-window');
          const winRect = win ? win.getBoundingClientRect() : null;
          if (winRect && (wrapRect.bottom + 210 > winRect.bottom)) {
            popover.style.top = 'auto';
            popover.style.bottom = '32px';
          } else {
            popover.style.top = '32px';
            popover.style.bottom = 'auto';
          }

          renderCal();
        }
      });
    });

    // Fechar popovers ao clicar no diálogo fora do date-picker-wrap
    const win = this.shadowRoot.getElementById('modal-window');
    win?.addEventListener('click', (e) => {
      if (!e.target.closest('.modal-date-picker-wrap')) {
        this.shadowRoot.querySelectorAll('.modal-cal-popover').forEach((p) => {
          p.style.display = 'none';
          p.closest('.modal-date-picker-wrap')?.classList.remove('is-open');
        });
      }
    });
  }

  /**
   * Exibe uma notificação Toast não-bloqueante no canto inferior direito.
   */
  showToast(message, type = 'info', duration = 2800) {
    const targetParent = document.fullscreenElement || document.body;
    if (this.parentElement !== targetParent) {
      targetParent.appendChild(this);
    }

    const container = this.shadowRoot.getElementById('toast-stack');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
      <span class="toast-text">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 220);
    }, duration);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 25000;
        }

        .modal-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.62);
          backdrop-filter: blur(3px);
          align-items: center;
          justify-content: center;
          z-index: 25000;
          pointer-events: auto;
        }

        .modal-backdrop.open {
          display: flex;
        }

        /* Janela Modal Estilo Aplicação Desktop */
        .modal-window {
          background-color: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-dropdown);
          display: flex;
          flex-direction: column;
          overflow: visible;
          position: relative;
          animation: modalPop 140ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 32px;
          padding: 0 12px;
          background: var(--win-header-bg, var(--bg-panel-header));
          color: var(--win-header-text, var(--text-primary));
          border-bottom: 1px solid var(--border-subtle);
          border-top-left-radius: var(--radius-md);
          border-top-right-radius: var(--radius-md);
          cursor: move;
        }

        .modal-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: inherit;
        }

        .modal-close {
          width: 20px;
          height: 20px;
          border-radius: var(--radius-xs);
          color: inherit;
          opacity: 0.8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .modal-close:hover {
          background-color: var(--status-error);
          color: #ffffff;
        }

        .modal-content {
          display: flex;
          gap: 12px;
          padding: 16px;
          align-items: flex-start;
          overflow: visible;
        }

        .modal-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .modal-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: var(--text-sm);
          color: var(--text-primary);
          overflow: visible;
        }

        .modal-msg {
          line-height: 1.45;
          color: var(--text-secondary);
          font-size: var(--text-xs);
        }

        .modal-input {
          width: 100%;
          height: 28px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          padding: 0 8px;
          font-size: var(--text-xs);
          outline: none;
        }

        .modal-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 1px var(--border-focus);
        }

        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: visible;
        }

        .form-row {
          display: grid;
          grid-template-columns: 110px 1fr;
          align-items: center;
          gap: 8px;
          overflow: visible;
        }

        .checkbox-row {
          grid-template-columns: auto 1fr;
          cursor: pointer;
        }

        .form-label {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }

        .modal-date-picker-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .modal-date-picker-wrap.is-open {
          z-index: 100;
        }

        .modal-date-input {
          padding-right: 28px !important;
        }

        .modal-cal-btn {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: var(--text-secondary);
          padding: 2px 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-cal-btn:hover {
          color: var(--accent-blue);
        }

        .modal-cal-popover {
          position: absolute;
          top: 32px;
          left: 0;
          z-index: 20000;
          background: var(--bg-panel, #24252b);
          border: 1px solid var(--border-input, #3a3b43);
          border-radius: var(--radius-sm, 6px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65);
          padding: 8px 10px;
          width: 220px;
          font-family: var(--font-sans);
          box-sizing: border-box;
        }

        .cal-mini-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .cal-mini-nav {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .cal-mini-nav:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .cal-mini-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .cal-mini-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 9.5px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .cal-mini-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }

        .cal-mini-empty {
          height: 22px;
        }

        .cal-mini-day {
          height: 22px;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 10.5px;
          cursor: pointer;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cal-mini-day.selected {
          background: var(--accent-blue, #2563eb);
          color: #ffffff !important;
          font-weight: 700;
        }

        .cal-mini-day:hover {
          background: var(--accent-blue, #2563eb);
          color: #ffffff;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 10px 16px;
          background-color: var(--bg-panel-header);
          border-top: 1px solid var(--border-subtle);
          border-bottom-left-radius: var(--radius-md);
          border-bottom-right-radius: var(--radius-md);
        }

        .btn-modal {
          height: 26px;
          padding: 0 14px;
          border-radius: var(--radius-xs);
          font-size: var(--text-xs);
          font-weight: 500;
          transition: background var(--transition-fast);
        }

        .btn-delete {
          margin-right: auto;
          background-color: transparent;
          border: 1px solid var(--status-error, #ef4444);
          color: var(--status-error, #ef4444);
        }

        .btn-delete:hover {
          background-color: var(--status-error, #ef4444);
          color: #ffffff;
        }

        .btn-cancel {
          background-color: var(--bg-elevated);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
        }

        .btn-cancel:hover {
          background-color: var(--bg-hover);
        }

        .btn-confirm {
          background-color: var(--accent-blue);
          color: #ffffff;
        }

        .btn-confirm:hover {
          background-color: var(--accent-blue-hover);
        }

        .btn-danger {
          background-color: var(--status-error);
          color: #ffffff;
        }

        /* Notificações Toast (Canto Inferior Direito) */
        .toast-stack {
          position: fixed;
          right: 14px;
          bottom: calc(var(--statusbar-height) + 12px);
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 16000;
          pointer-events: none;
        }

        .toast-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-left: 3px solid var(--accent-blue);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          box-shadow: var(--shadow-dropdown);
          font-size: var(--text-xs);
          color: var(--text-primary);
          transition: opacity 200ms ease, transform 200ms ease;
        }

        .toast-item.fade-out {
          opacity: 0;
          transform: translateY(6px);
        }
      </style>

      <div class="modal-backdrop" id="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-window" id="modal-window">
          <div class="modal-header" id="modal-header">
            <span class="modal-title" id="modal-title">CortexUI</span>
            <button class="modal-close" id="modal-close" aria-label="Close">&times;</button>
          </div>
          <div class="modal-content">
            <div class="modal-icon" id="modal-icon"></div>
            <div class="modal-body" id="modal-body"></div>
          </div>
          <div class="modal-footer" id="modal-footer"></div>
        </div>
      </div>

      <div class="toast-stack" id="toast-stack"></div>
    `;

    this.shadowRoot.getElementById('modal-close').addEventListener('click', () => {
      this._resolveModal(this._mode === 'confirm' ? false : null);
    });

    // Arraste da barra de título da janela modal (Desktop Window Dragging)
    const header = this.shadowRoot.getElementById('modal-header');
    const win = this.shadowRoot.getElementById('modal-window');
    let startX = 0;
    let startY = 0;

    header.addEventListener('pointerdown', (e) => {
      if (e.target.closest('#modal-close')) return;
      header.setPointerCapture(e.pointerId);
      this._isDragging = true;
      startX = e.clientX - this._dragOffset.x;
      startY = e.clientY - this._dragOffset.y;
    });

    header.addEventListener('pointermove', (e) => {
      if (!this._isDragging) return;
      this._dragOffset.x = e.clientX - startX;
      this._dragOffset.y = e.clientY - startY;
      win.style.transform = `translate(${this._dragOffset.x}px, ${this._dragOffset.y}px)`;
    });

    header.addEventListener('pointerup', () => {
      this._isDragging = false;
    });
  }
}

customElements.define('cortex-modal', CortexModalElement);

/**
 * Garante que a tag <cortex-modal> exista no documento (ou no elemento em tela cheia) e retorna a instância.
 */
function ensureModalInstance() {
  const targetParent = (typeof document !== 'undefined' && document.fullscreenElement) ? document.fullscreenElement : (typeof document !== 'undefined' ? document.body : null);
  if (!_singletonModalInstance) {
    const el = document.createElement('cortex-modal');
    if (targetParent) targetParent.appendChild(el);
    return el;
  }
  if (targetParent && _singletonModalInstance.parentElement !== targetParent) {
    targetParent.appendChild(_singletonModalInstance);
  }
  return _singletonModalInstance;
}

if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', () => {
    const targetParent = document.fullscreenElement || document.body;
    if (_singletonModalInstance && _singletonModalInstance.parentElement !== targetParent) {
      targetParent.appendChild(_singletonModalInstance);
    }
  });
}

/**
 * API Global para Caixas de Mensagens Desktop (Alert, Confirm, Prompt, Form, Toast).
 */
export const CortexModal = {
  alert({ title = t('common.systemNotice'), message = '', type = 'info', confirmText = t('common.ok') } = {}) {
    return ensureModalInstance().openDialog({
      mode: 'alert',
      title,
      message,
      type,
      confirmText
    });
  },

  confirm({
    title = t('common.confirmation'),
    message = t('common.confirmContinue'),
    type = 'question',
    confirmText = t('common.confirm'),
    cancelText = t('common.cancel'),
    danger = false
  } = {}) {
    return ensureModalInstance().openDialog({
      mode: 'confirm',
      title,
      message,
      type,
      confirmText,
      cancelText,
      danger
    });
  },

  prompt({
    title = t('common.dataEntry'),
    message = '',
    defaultValue = '',
    placeholder = '',
    inputType = 'text',
    confirmText = t('common.save'),
    cancelText = t('common.cancel')
  } = {}) {
    return ensureModalInstance().openDialog({
      mode: 'prompt',
      title,
      message,
      type: 'info',
      defaultValue,
      placeholder,
      inputType,
      confirmText,
      cancelText
    });
  },

  /**
   * Form modal. Opcional: deleteText -> exibe botão "Excluir" dedicado no rodapé;
   * ao clicar, a Promise resolve com { __action: 'delete' }.
   */
  form({
    title = t('common.settings'),
    message = '',
    fields = [],
    width = '400px',
    confirmText = t('common.apply'),
    cancelText = t('common.cancel'),
    deleteText = ''
  } = {}) {
    return ensureModalInstance().openDialog({
      mode: 'form',
      title,
      message,
      type: 'info',
      fields,
      width,
      confirmText,
      cancelText,
      deleteText
    });
  },

  toast(message, type = 'info', duration = 2800) {
    ensureModalInstance().showToast(message, type, duration);
  }
};

// Expõe também globalmente em window para fácil uso em scripts externos
window.CortexModal = CortexModal;
