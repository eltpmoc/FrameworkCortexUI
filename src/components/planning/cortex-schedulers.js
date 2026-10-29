// src/components/planning/cortex-schedulers.js
/**
 * CortexUI — Schedulers Corporativos:
 * 1 & 2. <cortex-scheduler-resources>  (Scheduler por Recursos — Imagem 1)
 * 2.1.   <cortex-scheduler-workweek>   (Work Week Scheduler — Imagem 2)
 * 2.2.   <cortex-tasks-scheduler-grid> (DevExtreme Tasks Grid & Calendar Popover — Imagem 3)
 */

import { CortexElement } from '../../core/CortexElement.js';
import { CortexModal } from '../cortex-modal.js';
import { AppState } from '../../core/Store.js';
import { t, tx, getMonthNames, getWeekdayNames } from '../../core/i18n.js';

/* ============================================================================
 * 1 & 2. RESOURCE SCHEDULER (<cortex-scheduler-resources>) — IMAGEM 1
 * ============================================================================ */
const INITIAL_RESOURCES = [
  { id: 'maria', name: 'Maria Garcia', color: '#8cc657', initials: 'MG' },
  { id: 'barbara', name: 'Barbara Johnson', color: '#1db2f5', initials: 'BJ' },
  { id: 'william', name: 'William Smith', color: '#f59638', initials: 'WS' },
  { id: 'taylor', name: 'Taylor Riley', color: '#9c7bd3', initials: 'TR' },
  { id: 'kent', name: 'Kent Samuel', color: '#66c18c', initials: 'KS' },
  { id: 'walter', name: 'Walter Hobbs', color: '#eec01c', initials: 'WH' }
];

const INITIAL_RESOURCE_EVENTS = [
  // Maria Garcia (#8cc657)
  { id: 'ev-1', resourceId: 'maria', title: 'Room 523', subtitle: 'Regular cleaning', startSlot: 0, spanSlots: 2, day: 'Thu 22' },   // 8:00 - 9:00
  { id: 'ev-2', resourceId: 'maria', title: 'Room 522', subtitle: 'Regular cleaning', startSlot: 2, spanSlots: 2, day: 'Thu 22' },   // 9:00 - 10:00
  { id: 'ev-3', resourceId: 'maria', title: 'Room 507', subtitle: 'Spring cleaning', startSlot: 6, spanSlots: 4, day: 'Thu 22' },    // 11:00 - 1:00

  // Barbara Johnson (#1db2f5)
  { id: 'ev-4', resourceId: 'barbara', title: 'Room 112', subtitle: 'Regular cleaning', startSlot: 1, spanSlots: 2, day: 'Thu 22' }, // 8:30 - 9:30
  { id: 'ev-5', resourceId: 'barbara', title: 'Room 114', subtitle: 'Regular cleaning', startSlot: 3, spanSlots: 2, day: 'Thu 22' }, // 9:30 - 10:30
  { id: 'ev-6', resourceId: 'barbara', title: 'Room 105', subtitle: 'Spring cleaning', startSlot: 7, spanSlots: 4, day: 'Thu 22' },  // 11:30 - 1:30
  { id: 'ev-7', resourceId: 'barbara', title: 'Room 101', subtitle: 'Regular cleaning', startSlot: 11, spanSlots: 2, day: 'Thu 22' },// 1:30 - 2:30

  // William Smith (#f59638)
  { id: 'ev-8', resourceId: 'william', title: 'Room 208', subtitle: 'Spring cleaning', startSlot: 2, spanSlots: 4, day: 'Thu 22' },  // 9:00 - 11:00
  { id: 'ev-9', resourceId: 'william', title: 'Room 203', subtitle: 'Regular cleaning', startSlot: 6, spanSlots: 2, day: 'Thu 22' }, // 11:00 - 12:00
  { id: 'ev-10', resourceId: 'william', title: 'Room 203', subtitle: 'Regular cleaning', startSlot: 10, spanSlots: 2, day: 'Thu 22' },// 1:00 - 2:00

  // Taylor Riley (#9c7bd3)
  { id: 'ev-11', resourceId: 'taylor', title: 'Room 300', subtitle: 'Regular cleaning', startSlot: 0, spanSlots: 2, day: 'Thu 22' }, // 8:00 - 9:00
  { id: 'ev-12', resourceId: 'taylor', title: 'Room 301', subtitle: 'Regular cleaning', startSlot: 2, spanSlots: 2, day: 'Thu 22' }, // 9:00 - 10:00
  { id: 'ev-13', resourceId: 'taylor', title: 'Room 307', subtitle: 'Spring cleaning', startSlot: 6, spanSlots: 4, day: 'Thu 22' },  // 11:00 - 1:00

  // Kent Samuel (#66c18c)
  { id: 'ev-14', resourceId: 'kent', title: 'Room 311', subtitle: 'Spring cleaning', startSlot: 1, spanSlots: 4, day: 'Thu 22' },    // 8:30 - 10:30
  { id: 'ev-15', resourceId: 'kent', title: 'Room 314', subtitle: 'Regular cleaning', startSlot: 5, spanSlots: 2, day: 'Thu 22' },   // 10:30 - 11:30
  { id: 'ev-16', resourceId: 'kent', title: 'Room 315', subtitle: 'Regular cleaning', startSlot: 7, spanSlots: 2, day: 'Thu 22' },   // 11:30 - 12:30

  // Walter Hobbs (#eec01c)
  { id: 'ev-17', resourceId: 'walter', title: 'Room 423', subtitle: 'Regular cleaning', startSlot: 0, spanSlots: 2, day: 'Thu 22' }, // 8:00 - 9:00
  { id: 'ev-18', resourceId: 'walter', title: 'Room 422', subtitle: 'Regular cleaning', startSlot: 2, spanSlots: 2, day: 'Thu 22' }, // 9:00 - 10:00
  { id: 'ev-19', resourceId: 'walter', title: 'Room 407', subtitle: 'Spring cleaning', startSlot: 6, spanSlots: 4, day: 'Thu 22' },  // 11:00 - 1:00
  { id: 'ev-20', resourceId: 'walter', title: 'Room 427', subtitle: 'Regular cleaning', startSlot: 10, spanSlots: 2, day: 'Thu 22' } // 1:00 - 2:00
];

const RESOURCE_TIME_LABELS = [
  '8:00 AM',
  '8:30 AM',
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM'
];

export class CortexSchedulerResources extends CortexElement {
  constructor() {
    super();
    this._viewMode = 'Week';
    this._dateRangeIndex = 0;
    this._dateRanges = [
      '22-28 February 2018',
      '1-7 March 2018',
      '15-21 February 2018'
    ];
    this._dayLabels = [
      'Thursday, 22 February 2018',
      'Friday, 23 February 2018',
      'Saturday, 24 February 2018'
    ];
    this._monthLabels = [
      'February 2018',
      'March 2018',
      'January 2018'
    ];
    this._resources = INITIAL_RESOURCES.map((r) => ({ ...r }));
    this._events = INITIAL_RESOURCE_EVENTS.map((e) => ({ ...e }));
    this._draggingEventId = null;
  }

  _ensureState() {
    if (!this._resources) {
      this._viewMode = 'Week';
      this._dateRangeIndex = 0;
      this._dateRanges = ['22-28 February 2018', '1-7 March 2018', '15-21 February 2018'];
      this._dayLabels = ['Thursday, 22 February 2018', 'Friday, 23 February 2018', 'Saturday, 24 February 2018'];
      this._monthLabels = ['February 2018', 'March 2018', 'January 2018'];
      this._resources = INITIAL_RESOURCES.map((r) => ({ ...r }));
      this._events = INITIAL_RESOURCE_EVENTS.map((e) => ({ ...e }));
    }
  }

  _getCurrentDateTitle() {
    if (this._viewMode === 'Day') return this._dayLabels[this._dateRangeIndex % this._dayLabels.length];
    if (this._viewMode === 'Month') return this._monthLabels[this._dateRangeIndex % this._monthLabels.length];
    return this._dateRanges[this._dateRangeIndex % this._dateRanges.length];
  }

  async _openCreateModal(defaultResId = 'maria', defaultSlot = 0) {
    const res = await CortexModal.form({
      title: t('scheduler.newAppointment'),
      confirmText: t('common.create'),
      cancelText: t('common.cancel'),
      fields: [
        { name: 'title', label: t('scheduler.room'), type: 'text', defaultValue: 'Room 501' },
        {
          name: 'subtitle',
          label: t('scheduler.service'),
          type: 'select',
          defaultValue: 'Regular cleaning',
          options: [
            { value: 'Regular cleaning', label: 'Regular cleaning' },
            { value: 'Spring cleaning', label: 'Spring cleaning' },
            { value: 'Deep inspection', label: 'Deep inspection' }
          ]
        },
        {
          name: 'resourceId',
          label: t('scheduler.resource'),
          type: 'select',
          defaultValue: defaultResId,
          options: this._resources.map((r) => ({ value: r.id, label: r.name }))
        },
        {
          name: 'startSlot',
          label: t('scheduler.startTime'),
          type: 'select',
          defaultValue: String(defaultSlot),
          options: RESOURCE_TIME_LABELS.map((lbl, idx) => ({ value: String(idx), label: lbl }))
        },
        { name: 'spanSlots', label: t('scheduler.duration'), type: 'number', defaultValue: '2' }
      ]
    });

    if (res && res.title) {
      this._events.push({
        id: `ev-${Date.now()}`,
        resourceId: res.resourceId || defaultResId,
        title: res.title,
        subtitle: res.subtitle || 'Regular cleaning',
        startSlot: Number(res.startSlot) || defaultSlot,
        spanSlots: Math.max(1, Math.min(6, Number(res.spanSlots) || 2)),
        day: 'Thu 22'
      });
      this.render();
      CortexModal.toast(t('scheduler.appointmentCreated', { name: res.title }), 'success', 2000);
    }
  }

  onRender() {
    // Nav previous / next
    this.shadowRoot.querySelector('#prev-range')?.addEventListener('click', () => {
      this._dateRangeIndex = (this._dateRangeIndex + 2) % 3;
      this.render();
    });

    this.shadowRoot.querySelector('#next-range')?.addEventListener('click', () => {
      this._dateRangeIndex = (this._dateRangeIndex + 1) % 3;
      this.render();
    });

    // View Switcher (Day, Week, Month)
    this.shadowRoot.querySelectorAll('[data-view-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._viewMode = btn.getAttribute('data-view-mode');
        this.render();
      });
    });

    // Drag & Drop nos compromissos
    this.shadowRoot.querySelectorAll('[data-drag-event-id]').forEach((el) => {
      el.addEventListener('dragstart', (e) => {
        this._draggingEventId = el.getAttribute('data-drag-event-id');
        e.dataTransfer.setData('text/plain', this._draggingEventId);
        e.dataTransfer.effectAllowed = 'move';
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        this._draggingEventId = null;
        this.shadowRoot.querySelectorAll('.slot-cell.drag-over').forEach((c) => c.classList.remove('drag-over'));
      });
    });

    // Células de slot como Drop Targets
    this.shadowRoot.querySelectorAll('[data-slot-cell]').forEach((cell) => {
      cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        cell.classList.add('drag-over');
      });
      cell.addEventListener('dragleave', () => {
        cell.classList.remove('drag-over');
      });
      cell.addEventListener('drop', (e) => {
        e.preventDefault();
        cell.classList.remove('drag-over');
        const evId = e.dataTransfer.getData('text/plain') || this._draggingEventId;
        const targetResId = cell.getAttribute('data-res-id');
        const targetSlotIdx = Number(cell.getAttribute('data-slot-idx'));
        const ev = this._events.find((x) => x.id === evId);
        if (ev && targetResId) {
          ev.resourceId = targetResId;
          ev.startSlot = targetSlotIdx;
          const resObj = this._resources.find((r) => r.id === targetResId);
          const timeLbl = RESOURCE_TIME_LABELS[targetSlotIdx] || '';
          this.render();
          CortexModal.toast(t('scheduler.dragMoved', { title: ev.title, resource: resObj ? resObj.name : targetResId, time: timeLbl }), 'success', 2000);
        }
      });
    });

    // Click existing appointment to edit or delete
    this.shadowRoot.querySelectorAll('[data-event-id]').forEach((el) => {
      el.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = el.getAttribute('data-event-id');
        const ev = this._events.find((x) => x.id === id);
        if (!ev) return;

        const res = await CortexModal.form({
          title: `${t('scheduler.editAppointment')} — ${ev.title}`,
          confirmText: t('common.saveChanges'),
          cancelText: t('common.cancel'),
          deleteText: t('common.delete'),
          fields: [
            { name: 'title', label: t('scheduler.room'), type: 'text', defaultValue: ev.title },
            {
              name: 'subtitle',
              label: t('scheduler.service'),
              type: 'select',
              defaultValue: ev.subtitle,
              options: [
                { value: 'Regular cleaning', label: 'Regular cleaning' },
                { value: 'Spring cleaning', label: 'Spring cleaning' },
                { value: 'Deep inspection', label: 'Deep inspection' }
              ]
            },
            {
              name: 'resourceId',
              label: t('scheduler.resource'),
              type: 'select',
              defaultValue: ev.resourceId,
              options: this._resources.map((r) => ({ value: r.id, label: r.name }))
            },
            {
              name: 'spanSlots',
              label: t('scheduler.duration'),
              type: 'number',
              defaultValue: String(ev.spanSlots)
            }
          ]
        });

        if (res) {
          if (res.__action === 'delete') {
            this._events = this._events.filter((x) => x.id !== id);
            this.render();
            CortexModal.toast(t('scheduler.appointmentDeleted', { name: ev.title }), 'warning', 2000);
            return;
          }
          ev.title = res.title || ev.title;
          ev.subtitle = res.subtitle || ev.subtitle;
          ev.resourceId = res.resourceId || ev.resourceId;
          ev.spanSlots = Math.max(1, Math.min(6, Number(res.spanSlots) || 2));
          this.render();
          CortexModal.toast(t('scheduler.appointmentUpdated', { name: ev.title }), 'success', 2000);
        }
      });
    });

    // Click empty cell to create appointment
    this.shadowRoot.querySelectorAll('[data-slot-cell]').forEach((cell) => {
      cell.addEventListener('click', () => {
        const resourceId = cell.getAttribute('data-res-id');
        const slotIndex = Number(cell.getAttribute('data-slot-idx'));
        this._openCreateModal(resourceId, slotIndex);
      });
    });
  }

  _renderMonthView() {
    const days = [
      { d: 1, evts: ['Room 523'] }, { d: 2, evts: ['Room 112'] }, { d: 3, evts: [] }, { d: 4, evts: [] },
      { d: 5, evts: ['Room 208'] }, { d: 6, evts: ['Room 300'] }, { d: 7, evts: ['Room 311'] }, { d: 8, evts: [] },
      { d: 9, evts: ['Room 423'] }, { d: 10, evts: [] }, { d: 11, evts: [] }, { d: 12, evts: ['Room 522'] },
      { d: 13, evts: ['Room 114'] }, { d: 14, evts: [] }, { d: 15, evts: ['Room 203'] }, { d: 16, evts: ['Room 307'] },
      { d: 17, evts: [] }, { d: 18, evts: [] }, { d: 19, evts: ['Room 314'] }, { d: 20, evts: ['Room 407'] },
      { d: 21, evts: ['Room 315'] }, { d: 22, evts: ['Room 523', 'Room 112', 'Room 208', 'Room 300', 'Room 423'] },
      { d: 23, evts: ['Room 522', 'Room 114'] }, { d: 24, evts: ['Room 427'] }, { d: 25, evts: [] },
      { d: 26, evts: ['Room 101'] }, { d: 27, evts: ['Room 105'] }, { d: 28, evts: ['Room 507'] }
    ];

    return `
      <div class="month-view-grid">
        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          .map((w) => `<div class="month-weekday-head">${w}</div>`)
          .join('')}
        ${days
          .map(
            (item) => `
          <div class="month-cell">
            <div class="month-cell-day">${item.d}</div>
            <div class="month-cell-pills">
              ${item.evts
                .map(
                  (txt) => `
                <span class="month-evt-pill" title="${txt}">${txt}</span>
              `
                )
                .join('')}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  _renderDayView() {
    return `
      <div class="day-view-wrap">
        <div class="day-view-header">
          <div class="day-col-header" style="width:70px;">Time</div>
          ${this._resources
            .map(
              (r) => `
            <div class="day-col-header" style="flex:1;">
              <span class="res-avatar" style="background:${r.color};">${r.initials}</span>
              <span>${r.name}</span>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="day-view-body">
          ${RESOURCE_TIME_LABELS.map(
            (lbl, sIdx) => `
            <div class="day-time-row">
              <div class="day-time-cell" style="width:70px;">${sIdx % 2 === 0 ? lbl : ''}</div>
              ${this._resources
                .map((r) => {
                  const ev = this._events.find((x) => x.resourceId === r.id && x.startSlot === sIdx);
                  return `
                    <div class="day-slot-cell" data-slot-cell data-res-id="${r.id}" data-slot-idx="${sIdx}">
                      ${
                        ev
                          ? `
                        <div class="sched-card" draggable="true" data-drag-event-id="${ev.id}" data-event-id="${ev.id}" style="background-color: ${r.color}; height: calc(${ev.spanSlots} * 38px - 4px); z-index: 5;">
                          <div class="card-room">${ev.title}</div>
                          <div class="card-sub">${ev.subtitle}</div>
                        </div>
                      `
                          : ''
                      }
                    </div>
                  `;
                })
                .join('')}
            </div>
          `
          ).join('')}
        </div>
      </div>
    `;
  }

  render() {
    this._ensureState();

    const isMonth = this._viewMode === 'Month';
    const isDay = this._viewMode === 'Day';

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          width: 100%;
          font-family: var(--font-sans);
          color: var(--text-primary);
          box-sizing: border-box;
          --slot-h: 38px;
        }

        .sched-container {
          background: var(--bg-panel, #ffffff);
          border: 1px solid var(--border-subtle, #e0e0e0);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        /* Top Header */
        .sched-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border-subtle, #e9ecef);
          background: var(--bg-panel-header, var(--bg-elevated, #fafbfc));
        }

        .sched-nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary, #555);
          font-size: 14px;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .nav-btn:hover {
          background: var(--bg-hover, #eaeaea);
          color: var(--text-primary, #000);
          border-color: var(--border-subtle, transparent);
        }

        .date-range-label {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary, inherit);
        }

        .sched-actions-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* View Switcher: Day | Week | Month */
        .view-switcher {
          display: flex;
          align-items: center;
          background: var(--bg-input, var(--bg-app, #f0f1f3));
          border-radius: 6px;
          padding: 2px;
          border: 1px solid var(--border-input, var(--border-subtle, #e2e4e8));
        }

        .view-btn {
          border: none;
          background: transparent;
          color: var(--text-muted, #666);
          padding: 6px 14px;
          font-size: 12.5px;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .view-btn:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .view-btn.active {
          background: var(--accent-blue, #0284c7);
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }

        /* Schedule Body */
        .sched-scroll-area {
          overflow-x: auto;
          overflow-y: hidden;
          width: 100%;
        }

        .sched-scroll-area::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        .sched-scroll-area::-webkit-scrollbar-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .sched-scroll-area::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
          border: none;
        }
        .sched-scroll-area::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: var(--radius-pill, 9999px);
          border: 1px solid var(--scrollbar-track);
        }
        .sched-scroll-area::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover);
        }
        .sched-scroll-area::-webkit-scrollbar-thumb:active {
          background: var(--accent-blue);
        }
        .sched-scroll-area::-webkit-scrollbar-corner {
          background: var(--scrollbar-track);
        }

        .sched-grid-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          min-width: 820px;
        }

        /* Colunas de Recursos */
        .res-th {
          padding: 12px 8px;
          font-size: 13.5px;
          font-weight: 600;
          text-align: center;
          border-bottom: 1px solid var(--border-subtle, #e9ecef);
          border-left: 1px solid var(--border-subtle, #f0f0f0);
          background: var(--bg-elevated, #ffffff);
          color: var(--text-primary, inherit);
        }

        .res-th.time-corner {
          width: 78px;
          border-left: none;
        }

        /* Linhas de Horário */
        .time-label-cell {
          width: 78px;
          padding: 0 10px;
          font-size: 11.5px;
          font-weight: 500;
          color: var(--text-muted, #777);
          text-align: right;
          vertical-align: top;
          padding-top: 2px;
          border-bottom: 1px solid var(--border-subtle, #f0f0f0);
          background: var(--bg-panel, #ffffff);
          height: var(--slot-h);
          box-sizing: border-box;
          user-select: none;
        }

        .slot-cell {
          border-left: 1px solid var(--border-subtle, #f2f3f5);
          border-bottom: 1px solid var(--border-subtle, #f2f3f5);
          background: var(--bg-panel, #ffffff);
          height: var(--slot-h);
          position: relative;
          box-sizing: border-box;
          cursor: pointer;
          transition: background 0.12s;
        }

        .slot-cell:hover {
          background: var(--bg-hover, rgba(0, 120, 215, 0.06));
        }

        .slot-cell.drag-over {
          background: var(--accent-blue-alpha, rgba(29, 178, 245, 0.2)) !important;
          outline: 2px dashed var(--accent-blue, #1db2f5);
        }

        /* Event Cards */
        .sched-card {
          position: absolute;
          top: 2px;
          left: 4px;
          right: 4px;
          border-radius: 5px;
          color: #ffffff;
          padding: 5px 8px;
          box-sizing: border-box;
          cursor: grab;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          text-align: left;
        }

        .sched-card:active {
          cursor: grabbing;
        }

        .sched-card.dragging {
          opacity: 0.4;
          transform: scale(0.96);
        }

        .sched-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          filter: brightness(1.05);
        }

        .card-room {
          font-size: 12.5px;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-sub {
          font-size: 10.5px;
          opacity: 0.92;
          margin-top: 2px;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Month View Styles */
        .month-view-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--border-subtle, #e0e0e0);
          gap: 1px;
        }
        .month-weekday-head {
          background: var(--bg-panel-header, var(--bg-elevated, #fafbfc));
          padding: 8px 4px;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary, #555);
        }
        .month-cell {
          background: var(--bg-panel, #ffffff);
          min-height: 70px;
          padding: 4px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .month-cell-day {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted, #888);
        }
        .month-cell-pills {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 4px;
        }
        .month-evt-pill {
          background: var(--accent-blue, #1db2f5);
          color: #fff;
          font-size: 9.5px;
          padding: 1px 4px;
          border-radius: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Day View Styles */
        .day-view-wrap {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .day-view-header {
          display: flex;
          border-bottom: 1px solid var(--border-subtle, #e9ecef);
          background: var(--bg-panel-header, var(--bg-elevated, #fafbfc));
        }
        .day-col-header {
          padding: 10px 8px;
          font-size: 12.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--text-primary);
        }
        .res-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          color: #fff;
          font-size: 10px;
          font-weight: bold;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .day-time-row {
          display: flex;
          border-bottom: 1px solid var(--border-subtle, #f0f0f0);
          min-height: 38px;
          background: var(--bg-panel, #ffffff);
        }
        .day-time-cell {
          font-size: 11px;
          color: var(--text-muted, #888);
          padding: 4px 8px;
          text-align: right;
        }
        .day-slot-cell {
          flex: 1;
          border-left: 1px solid var(--border-subtle, #f2f3f5);
          position: relative;
          background: var(--bg-panel, #ffffff);
        }
        .day-slot-cell:hover {
          background: var(--bg-hover);
        }
      </style>

      <div class="sched-container">
        <!-- Barra de Navegação Superior (Exatamente como Imagem 1) -->
        <div class="sched-top-bar">
          <div class="sched-nav-left">
            <button class="nav-btn" id="prev-range" aria-label="${t('common.prevMonth')}">&#10094;</button>
            <span class="date-range-label">${this._getCurrentDateTitle()}</span>
            <button class="nav-btn" id="next-range" aria-label="${t('common.nextMonth')}">&#10095;</button>
          </div>

          <div class="sched-actions-right">
            <div class="view-switcher">
              <button class="view-btn ${this._viewMode === 'Day' ? 'active' : ''}" data-view-mode="Day">${t('scheduler.day')}</button>
              <button class="view-btn ${this._viewMode === 'Week' ? 'active' : ''}" data-view-mode="Week">${t('scheduler.week')}</button>
              <button class="view-btn ${this._viewMode === 'Month' ? 'active' : ''}" data-view-mode="Month">${t('scheduler.month')}</button>
            </div>
          </div>
        </div>

        <!-- Grade de Recursos (Week Mode Padrão da Imagem 1) -->
        <div class="sched-scroll-area">
          ${
            isMonth
              ? this._renderMonthView()
              : isDay
              ? this._renderDayView()
              : `
            <table class="sched-grid-table">
              <thead>
                <tr>
                  <th class="res-th time-corner"></th>
                  ${this._resources
                    .map(
                      (r) => `
                    <th class="res-th" style="width: calc((100% - 78px) / ${this._resources.length});">
                      ${r.name}
                    </th>
                  `
                    )
                    .join('')}
                </tr>
              </thead>
              <tbody>
                ${RESOURCE_TIME_LABELS.map((timeLabel, slotIdx) => {
                  const showLabel = slotIdx % 2 === 0;
                  return `
                    <tr>
                      <td class="time-label-cell">
                        ${showLabel ? timeLabel : ''}
                      </td>
                      ${this._resources
                        .map((r) => {
                          const ev = this._events.find(
                            (x) => x.resourceId === r.id && x.startSlot === slotIdx
                          );

                          return `
                            <td
                              class="slot-cell"
                              data-slot-cell
                              data-res-id="${r.id}"
                              data-slot-idx="${slotIdx}"
                              title="${r.name} — ${timeLabel}"
                            >
                              ${
                                ev
                                  ? `
                                <div
                                  class="sched-card"
                                  draggable="true"
                                  data-drag-event-id="${ev.id}"
                                  data-event-id="${ev.id}"
                                  style="
                                    background-color: ${r.color};
                                    height: calc(${ev.spanSlots} * var(--slot-h) - 4px);
                                    z-index: 5;
                                  "
                                  title="${ev.title} (${ev.subtitle}) - Arraste para mover"
                                >
                                  <div class="card-room">${ev.title}</div>
                                  <div class="card-sub">${ev.subtitle}</div>
                                </div>
                              `
                                  : ''
                              }
                            </td>
                          `;
                        })
                        .join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `
          }
        </div>
      </div>
    `;

    this.onRender();
  }
}

/* ============================================================================
 * 2.1. WORK WEEK SCHEDULER (<cortex-scheduler-workweek>) — IMAGEM 2
 * ============================================================================ */
const WORKWEEK_DAYS = [
  { id: 'mon', label: 'Mon 26' },
  { id: 'tue', label: 'Tue 27' },
  { id: 'wed', label: 'Wed 28' },
  { id: 'thu', label: 'Thu 29' },
  { id: 'fri', label: 'Fri 30' }
];

const WORKWEEK_ALLDAY = [
  { id: 'ad-1', dayId: 'mon', title: 'Book Flights to San Fran for Sales ...', color: '#1bc5eb' },
  { id: 'ad-2', dayId: 'thu', title: 'Customer Workshop', color: '#1e7ce8' }
];

const WORKWEEK_EVENTS = [
  {
    id: 'ww-1',
    dayId: 'mon',
    title: 'Website Re-Design Plan',
    timeText: '9:30 AM - 11:30 AM',
    color: '#8442ce',
    startSlot: 1, // 9:30 AM
    spanSlots: 4  // 2h = 4 slots
  },
  {
    id: 'ww-2',
    dayId: 'tue',
    title: 'Approve Personal Computer U...',
    timeText: '10:00 AM - 11:00 AM',
    color: '#2486f0',
    startSlot: 2, // 10:00 AM
    spanSlots: 2  // 1h
  },
  {
    id: 'ww-3',
    dayId: 'tue',
    title: 'Final Budget Review',
    timeText: '12:00 PM - 1:35 PM',
    color: '#6571cd',
    startSlot: 6, // 12:00 PM
    spanSlots: 3
  },
  {
    id: 'ww-4',
    dayId: 'wed',
    title: 'Install New Database',
    timeText: '9:45 AM - 11:15 AM',
    color: '#1dc5e8',
    startSlot: 1.5,
    spanSlots: 3
  },
  {
    id: 'ww-5',
    dayId: 'wed',
    title: 'Approve New Online Marketin...',
    timeText: '12:00 PM - 2:00 PM',
    color: '#8442ce',
    startSlot: 6, // 12:00 PM
    spanSlots: 4
  },
  {
    id: 'ww-6',
    dayId: 'thu',
    title: 'Prepare 2021 Marketing Plan',
    timeText: '11:00 AM - 1:30 PM',
    color: '#6c77d4',
    startSlot: 4, // 11:00 AM
    spanSlots: 5
  },
  {
    id: 'ww-7',
    dayId: 'thu',
    title: 'Brochure Design Review',
    timeText: '2:00 PM - 3:30 PM',
    color: '#8237cb',
    startSlot: 10, // 2:00 PM
    spanSlots: 3
  },
  {
    id: 'ww-8',
    dayId: 'fri',
    title: 'Create Icons for Website',
    timeText: '10:00 AM - 11:30 AM',
    color: '#2686ee',
    startSlot: 2, // 10:00 AM
    spanSlots: 3
  },
  {
    id: 'ww-9',
    dayId: 'fri',
    title: 'Launch New Website',
    timeText: '12:20 PM - 2:00 PM',
    color: '#22c5e5',
    startSlot: 6.6,
    spanSlots: 3.4
  }
];

const WORKWEEK_HOURS = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM'
];

export class CortexSchedulerWorkWeek extends CortexElement {
  constructor() {
    super();
    this._rangeIdx = 0;
    this._ranges = ['26-30 April 2021', '3-7 May 2021', '19-23 April 2021'];
    this._allDayEvents = WORKWEEK_ALLDAY.map((e) => ({ ...e }));
    this._events = WORKWEEK_EVENTS.map((e) => ({ ...e }));
    this._draggingWwId = null;
  }

  _ensureState() {
    if (!this._events) {
      this._rangeIdx = 0;
      this._ranges = ['26-30 April 2021', '3-7 May 2021', '19-23 April 2021'];
      this._allDayEvents = WORKWEEK_ALLDAY.map((e) => ({ ...e }));
      this._events = WORKWEEK_EVENTS.map((e) => ({ ...e }));
    }
  }

  async _openCreateEventModal(dayId = 'mon', slotIdx = 0) {
    const dayObj = WORKWEEK_DAYS.find((d) => d.id === dayId);
    const form = await CortexModal.form({
      title: `${t('scheduler.newAppointment')} — ${dayObj ? dayObj.label : 'Work Week'}`,
      confirmText: t('common.create'),
      cancelText: t('common.cancel'),
      fields: [
        { name: 'title', label: t('tasks.subject'), type: 'text', defaultValue: 'Client Strategy Meeting' },
        { name: 'timeText', label: t('scheduler.startTime'), type: 'text', defaultValue: '10:00 AM - 11:30 AM' },
        {
          name: 'color',
          label: 'Cor',
          type: 'select',
          defaultValue: '#8442ce',
          options: [
            { value: '#8442ce', label: 'Roxo (Website / Marketing)' },
            { value: '#2486f0', label: 'Azul (Computer / Icons)' },
            { value: '#1dc5e8', label: 'Ciano (Database / Launch)' },
            { value: '#6571cd', label: 'Índigo (Budget / Reviews)' }
          ]
        },
        {
          name: 'dayId',
          label: t('scheduler.day'),
          type: 'select',
          defaultValue: dayId,
          options: WORKWEEK_DAYS.map((d) => ({ value: d.id, label: d.label }))
        },
        { name: 'startSlot', label: 'Slot Inicial (0 = 9h, 2 = 10h, etc)', type: 'number', defaultValue: String(slotIdx) },
        { name: 'spanSlots', label: 'Duração (slots de 30m)', type: 'number', defaultValue: '2' }
      ]
    });

    if (form && form.title) {
      this._events.push({
        id: `ww-${Date.now()}`,
        dayId: form.dayId || dayId,
        title: form.title,
        timeText: form.timeText || '10:00 AM - 11:00 AM',
        color: form.color || '#2486f0',
        startSlot: Number(form.startSlot) || slotIdx,
        spanSlots: Math.max(1, Math.min(8, Number(form.spanSlots) || 2))
      });
      this.render();
      CortexModal.toast(t('scheduler.appointmentCreated', { name: form.title }), 'success', 2000);
    }
  }

  onRender() {
    // Nav previous / next
    this.shadowRoot.querySelector('#ww-prev')?.addEventListener('click', () => {
      this._rangeIdx = (this._rangeIdx + 2) % 3;
      this.render();
    });

    this.shadowRoot.querySelector('#ww-next')?.addEventListener('click', () => {
      this._rangeIdx = (this._rangeIdx + 1) % 3;
      this.render();
    });

    // Drag & Drop nos eventos do WorkWeek
    this.shadowRoot.querySelectorAll('[data-ww-drag-id]').forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        this._draggingWwId = card.getAttribute('data-ww-drag-id');
        e.dataTransfer.setData('text/plain', this._draggingWwId);
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this._draggingWwId = null;
        this.shadowRoot.querySelectorAll('.ww-slot-cell.drag-over').forEach((c) => c.classList.remove('drag-over'));
      });
    });

    // Drop targets nas células
    this.shadowRoot.querySelectorAll('[data-ww-slot-cell]').forEach((cell) => {
      cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        cell.classList.add('drag-over');
      });
      cell.addEventListener('dragleave', () => {
        cell.classList.remove('drag-over');
      });
      cell.addEventListener('drop', (e) => {
        e.preventDefault();
        cell.classList.remove('drag-over');
        const evId = e.dataTransfer.getData('text/plain') || this._draggingWwId;
        const targetDayId = cell.getAttribute('data-day-id');
        const targetSlot = Number(cell.getAttribute('data-hour-idx')) * 2;
        const ev = this._events.find((x) => x.id === evId);
        if (ev && targetDayId) {
          ev.dayId = targetDayId;
          ev.startSlot = targetSlot;
          const dayObj = WORKWEEK_DAYS.find((d) => d.id === targetDayId);
          this.render();
          CortexModal.toast(t('scheduler.appointmentUpdated', { name: `${ev.title} (${dayObj ? dayObj.label : ''})` }), 'success', 2000);
        }
      });
    });

    // Click timed event to edit or delete
    this.shadowRoot.querySelectorAll('[data-ww-event-id]').forEach((el) => {
      el.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = el.getAttribute('data-ww-event-id');
        const ev = this._events.find((x) => x.id === id);
        if (!ev) return;

        const res = await CortexModal.form({
          title: `${t('scheduler.editAppointment')} — ${ev.title}`,
          confirmText: t('common.saveChanges'),
          cancelText: t('common.cancel'),
          deleteText: t('common.delete'),
          fields: [
            { name: 'title', label: t('tasks.subject'), type: 'text', defaultValue: ev.title },
            { name: 'timeText', label: t('scheduler.startTime'), type: 'text', defaultValue: ev.timeText },
            {
              name: 'color',
              label: 'Cor',
              type: 'select',
              defaultValue: ev.color,
              options: [
                { value: '#8442ce', label: 'Roxo (Website / Marketing)' },
                { value: '#2486f0', label: 'Azul (Computer / Icons)' },
                { value: '#1dc5e8', label: 'Ciano (Database / Launch)' },
                { value: '#6571cd', label: 'Índigo (Budget / Reviews)' }
              ]
            },
            {
              name: 'dayId',
              label: t('scheduler.day'),
              type: 'select',
              defaultValue: ev.dayId,
              options: WORKWEEK_DAYS.map((d) => ({ value: d.id, label: d.label }))
            },
            { name: 'spanSlots', label: 'Duração (slots de 30m)', type: 'number', defaultValue: String(ev.spanSlots) }
          ]
        });

        if (res) {
          if (res.__action === 'delete') {
            this._events = this._events.filter((x) => x.id !== id);
            this.render();
            CortexModal.toast(t('scheduler.appointmentDeleted', { name: ev.title }), 'warning', 2000);
            return;
          }
          ev.title = res.title || ev.title;
          ev.timeText = res.timeText || ev.timeText;
          ev.color = res.color || ev.color;
          ev.dayId = res.dayId || ev.dayId;
          ev.spanSlots = Math.max(1, Math.min(8, Number(res.spanSlots) || 2));
          this.render();
          CortexModal.toast(t('scheduler.appointmentUpdated', { name: ev.title }), 'success', 2000);
        }
      });
    });

    // Click empty timed slot to create
    this.shadowRoot.querySelectorAll('[data-ww-slot-cell]').forEach((cell) => {
      cell.addEventListener('click', () => {
        const dayId = cell.getAttribute('data-day-id');
        const hourIdx = Number(cell.getAttribute('data-hour-idx'));
        this._openCreateEventModal(dayId, hourIdx * 2);
      });
    });

    // Click all-day event
    this.shadowRoot.querySelectorAll('[data-allday-id]').forEach((el) => {
      el.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = el.getAttribute('data-allday-id');
        const ad = this._allDayEvents.find((x) => x.id === id);
        if (!ad) return;

        const res = await CortexModal.form({
          title: `All Day Event — ${ad.title}`,
          confirmText: t('common.saveChanges'),
          cancelText: t('common.cancel'),
          deleteText: t('common.delete'),
          fields: [
            { name: 'title', label: t('tasks.subject'), type: 'text', defaultValue: ad.title },
            {
              name: 'dayId',
              label: t('scheduler.day'),
              type: 'select',
              defaultValue: ad.dayId,
              options: WORKWEEK_DAYS.map((d) => ({ value: d.id, label: d.label }))
            }
          ]
        });

        if (res) {
          if (res.__action === 'delete') {
            this._allDayEvents = this._allDayEvents.filter((x) => x.id !== id);
            this.render();
            CortexModal.toast(t('scheduler.appointmentDeleted', { name: ad.title }), 'warning', 2000);
            return;
          }
          ad.title = res.title || ad.title;
          ad.dayId = res.dayId || ad.dayId;
          this.render();
          CortexModal.toast(t('scheduler.appointmentUpdated', { name: ad.title }), 'success', 2000);
        }
      });
    });
  }

  render() {
    this._ensureState();

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          width: 100%;
          font-family: var(--font-sans);
          color: var(--text-primary);
          box-sizing: border-box;
          --ww-hour-h: 70px;
        }

        .ww-card {
          background: var(--bg-panel, #ffffff);
          border: 1px solid var(--border-subtle, #e0e0e0);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        /* Top Bar Exata da Imagem 2 */
        .ww-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: var(--bg-panel-header, var(--bg-elevated, #fafbfc));
          border-bottom: 1px solid var(--border-subtle, #e9ecef);
        }

        .ww-nav-box {
          display: inline-flex;
          align-items: center;
          background: var(--bg-input, var(--bg-app, #ffffff));
          border: 1px solid var(--border-input, var(--border-subtle, #d9d9d9));
          border-radius: 4px;
          overflow: hidden;
          height: 32px;
        }

        .ww-nav-arrow {
          background: transparent;
          border: none;
          padding: 0 10px;
          cursor: pointer;
          color: var(--text-secondary, #555);
          font-size: 13px;
          height: 100%;
          display: inline-flex;
          align-items: center;
          transition: background 0.15s, color 0.15s;
        }

        .ww-nav-arrow:hover {
          background: var(--bg-hover, #f0f0f0);
          color: var(--text-primary, #000);
        }

        .ww-date-text {
          padding: 0 16px;
          font-size: 13px;
          color: var(--text-primary, inherit);
          font-weight: 500;
        }

        /* Botão Work Week na direita (conforme Imagem 2) */
        .ww-single-tab {
          height: 32px;
          padding: 0 16px;
          border-radius: 4px;
          border: 1px solid var(--border-subtle, transparent);
          background: var(--bg-elevated, transparent);
          color: var(--accent-text, var(--accent-blue, #00ff66));
          font-size: 13px;
          font-weight: 600;
          cursor: default;
          display: inline-flex;
          align-items: center;
        }

        .ww-scroll {
          overflow-x: auto;
          width: 100%;
        }

        .ww-scroll::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        .ww-scroll::-webkit-scrollbar-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .ww-scroll::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
          border: none;
        }
        .ww-scroll::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: var(--radius-pill, 9999px);
          border: 1px solid var(--scrollbar-track);
        }
        .ww-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover);
        }
        .ww-scroll::-webkit-scrollbar-thumb:active {
          background: var(--accent-blue);
        }
        .ww-scroll::-webkit-scrollbar-corner {
          background: var(--scrollbar-track);
        }

        .ww-grid-wrap {
          min-width: 800px;
          width: 100%;
        }

        /* Cabeçalho dos Dias (Mon 26, Tue 27, Wed 28, Thu 29, Fri 30) */
        .ww-days-header {
          display: grid;
          grid-template-columns: 80px repeat(5, 1fr);
          background: var(--bg-elevated, #ffffff);
          border-bottom: 1px solid var(--border-subtle, #e9ecef);
        }

        .ww-day-cell {
          padding: 10px 8px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          border-left: 1px solid var(--border-subtle, #f0f0f0);
          color: var(--text-primary, inherit);
        }

        .ww-day-cell:first-child {
          border-left: none;
        }

        /* Faixa All Day */
        .ww-allday-row {
          display: grid;
          grid-template-columns: 80px repeat(5, 1fr);
          border-bottom: 2px solid var(--border-subtle, #e0e0e0);
          background: var(--bg-panel, #ffffff);
          min-height: 44px;
        }

        .ww-allday-label {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--text-muted, #555);
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid var(--border-subtle, #f0f0f0);
          background: var(--bg-elevated, #fafbfc);
        }

        .ww-allday-col {
          border-right: 1px solid var(--border-subtle, #f0f0f0);
          padding: 4px;
          display: flex;
          align-items: center;
          min-height: 44px;
          box-sizing: border-box;
          background: var(--bg-panel, #ffffff);
        }

        .allday-pill {
          width: 100%;
          padding: 5px 8px;
          color: #ffffff;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          transition: filter 0.15s, transform 0.15s;
        }

        .allday-pill:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        /* Eixo Horário + Colunas dos Dias */
        .ww-hours-body {
          position: relative;
          background: var(--bg-panel, #ffffff);
        }

        .ww-hour-row {
          display: grid;
          grid-template-columns: 80px repeat(5, 1fr);
          height: var(--ww-hour-h);
          border-bottom: 1px solid var(--border-subtle, #f2f3f5);
          box-sizing: border-box;
        }

        .ww-hour-time {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted, #777);
          text-align: right;
          padding: 6px 10px 0 0;
          border-right: 1px solid var(--border-subtle, #f2f3f5);
          background: var(--bg-panel, #ffffff);
          user-select: none;
        }

        .ww-slot-cell {
          border-right: 1px solid var(--border-subtle, #f2f3f5);
          height: 100%;
          cursor: pointer;
          background: var(--bg-panel, #ffffff);
          transition: background 0.1s;
        }

        .ww-slot-cell:hover {
          background: var(--bg-hover, rgba(0, 120, 215, 0.05));
        }

        .ww-slot-cell.drag-over {
          background: var(--accent-blue-alpha, rgba(36, 134, 240, 0.2)) !important;
          outline: 2px dashed #2486f0;
        }

        /* Overlay dos Eventos Posicionados Absolutamente por Dia */
        .ww-events-overlay {
          position: absolute;
          top: 0;
          left: 80px;
          right: 0;
          bottom: 0;
          pointer-events: none;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
        }

        .ww-day-events-column {
          position: relative;
          height: 100%;
          border-right: 1px solid transparent;
        }

        .ww-event-block {
          position: absolute;
          left: 4px;
          right: 4px;
          border-radius: 4px;
          color: #ffffff;
          padding: 6px 8px;
          box-sizing: border-box;
          pointer-events: auto;
          cursor: grab;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          text-align: left;
        }

        .ww-event-block:active {
          cursor: grabbing;
        }

        .ww-event-block.dragging {
          opacity: 0.4;
          transform: scale(0.96);
        }

        .ww-event-block:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
          filter: brightness(1.05);
        }

        .ww-event-title {
          font-size: 11.5px;
          font-weight: 700;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ww-event-time {
          font-size: 10px;
          opacity: 0.9;
          margin-top: 2px;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>

      <div class="ww-card">
        <!-- Top Bar Exata: < 26-30 April 2021 > à esquerda, [ Work Week ] à direita -->
        <div class="ww-header">
          <div class="ww-nav-box">
            <button class="ww-nav-arrow" id="ww-prev" aria-label="${t('common.prevMonth')}">&#10094;</button>
            <span class="ww-date-text">${this._ranges[this._rangeIdx]}</span>
            <button class="ww-nav-arrow" id="ww-next" aria-label="${t('common.nextMonth')}">&#10095;</button>
          </div>
          <div class="ww-single-tab">Work Week</div>
        </div>

        <div class="ww-scroll">
          <div class="ww-grid-wrap">
            <!-- Cabeçalho dos Dias -->
            <div class="ww-days-header">
              <div class="ww-day-cell"></div>
              ${WORKWEEK_DAYS.map((d) => `<div class="ww-day-cell">${d.label}</div>`).join('')}
            </div>

            <!-- Faixa All Day -->
            <div class="ww-allday-row">
              <div class="ww-allday-label">${t('scheduler.allDay')}</div>
              ${WORKWEEK_DAYS.map((d) => {
                const ad = this._allDayEvents.find((x) => x.dayId === d.id);
                return `
                  <div class="ww-allday-col">
                    ${
                      ad
                        ? `
                      <div
                        class="allday-pill"
                        data-allday-id="${ad.id}"
                        style="background-color: ${ad.color};"
                        title="${ad.title} (Clique para editar)"
                      >
                        ${ad.title}
                      </div>
                    `
                        : ''
                    }
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Corpo das Horas (9:00 AM - 2:00 PM) -->
            <div class="ww-hours-body">
              ${WORKWEEK_HOURS.map(
                (hLabel, hIdx) => `
                <div class="ww-hour-row">
                  <div class="ww-hour-time">${hLabel}</div>
                  ${WORKWEEK_DAYS.map(
                    (d) => `
                    <div
                      class="ww-slot-cell"
                      data-ww-slot-cell
                      data-day-id="${d.id}"
                      data-hour-idx="${hIdx}"
                      title="${d.label} — ${hLabel} (Clique para criar)"
                    ></div>
                  `
                  ).join('')}
                </div>
              `
              ).join('')}

              <!-- Overlay com Blocos de Evento -->
              <div class="ww-events-overlay">
                ${WORKWEEK_DAYS.map((d) => {
                  const dayEvents = this._events.filter((x) => x.dayId === d.id);
                  return `
                    <div class="ww-day-events-column">
                      ${dayEvents
                        .map((ev) => {
                          const topPx = (ev.startSlot / 2) * 70 + 2;
                          const heightPx = (ev.spanSlots / 2) * 70 - 4;
                          return `
                            <div
                              class="ww-event-block"
                              draggable="true"
                              data-ww-drag-id="${ev.id}"
                              data-ww-event-id="${ev.id}"
                              style="
                                top: ${topPx}px;
                                height: ${heightPx}px;
                                background-color: ${ev.color};
                              "
                              title="${ev.title} (${ev.timeText}) — Arraste para mover"
                            >
                              <div class="ww-event-title">${ev.title}</div>
                              <div class="ww-event-time">${ev.timeText}</div>
                            </div>
                          `;
                        })
                        .join('')}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.onRender();
  }
}

/* ============================================================================
 * 2.2. TASKS GRID & CALENDAR POPOVER (<cortex-tasks-scheduler-grid>) — IMAGEM 3
 * ============================================================================ */
const INITIAL_TASKS_GRID = [
  { id: 1, subject: 'Prepare 2013 Financial', status: 'Completed', priority: 'High', assignedTo: 'Sandra Johnson', startDate: '6/1/2025', dueDate: '6/10/2025', priorityCode: 4 },
  { id: 2, subject: 'Prepare 3013 Marketin...', status: 'Completed', priority: 'High', assignedTo: 'Robert Reagan', startDate: '6/3/2025', dueDate: '6/14/2025', priorityCode: 4 },
  { id: 3, subject: 'Update Personnel Files', status: 'Completed', priority: 'High', assignedTo: 'Samantha Bright', startDate: '6/6/2025', dueDate: '6/18/2025', priorityCode: 4 },
  { id: 4, subject: 'Review Health Insuranc...', status: 'In Progress', priority: 'High', assignedTo: 'Samantha Bright', startDate: '6/8/2025', dueDate: '6/21/2025', priorityCode: 4 },
  { id: 5, subject: 'Choose between PPO a...', status: 'In Progress', priority: 'High', assignedTo: 'John Heart', startDate: '6/11/2025', dueDate: '6/25/2025', priorityCode: 4 },
  { id: 6, subject: 'Google AdWords Strate...', status: 'Completed', priority: 'High', assignedTo: 'John Heart', startDate: '6/15/2025', dueDate: '6/28/2025', priorityCode: 4 },
  { id: 7, subject: 'New Brochures', status: 'Completed', priority: 'Normal', assignedTo: 'John Heart', startDate: '2/17/2013', dueDate: '2/24/2013', priorityCode: 2 },
  { id: 8, subject: '2013 Brochure Designs', status: 'Completed', priority: 'Urgent', assignedTo: 'Morgan Kennedy', startDate: '2/19/2013', dueDate: '2/24/2013', priorityCode: 3 },
  { id: 9, subject: 'Brochure Design Review', status: 'Completed', priority: 'Normal', assignedTo: 'Violet Bailey', startDate: '2/19/2013', dueDate: '2/22/2013', priorityCode: 2 },
  { id: 10, subject: 'Website Re-Design Plan', status: 'Completed', priority: 'High', assignedTo: 'Violet Bailey', startDate: '2/19/2013', dueDate: '2/24/2013', priorityCode: 4 }
];

const JUNE_2025_CELLS = [
  { day: 25, muted: true }, { day: 26, muted: true }, { day: 27, muted: true }, { day: 28, muted: true }, { day: 29, muted: true }, { day: 30, muted: true }, { day: 31, muted: true },
  { day: 1, muted: false }, { day: 2, muted: false }, { day: 3, muted: false }, { day: 4, muted: false }, { day: 5, muted: false }, { day: 6, muted: false }, { day: 7, muted: false },
  { day: 8, muted: false }, { day: 9, muted: false }, { day: 10, muted: false }, { day: 11, muted: false }, { day: 12, muted: false }, { day: 13, muted: false }, { day: 14, muted: false },
  { day: 15, muted: false }, { day: 16, muted: false }, { day: 17, muted: false }, { day: 18, muted: false }, { day: 19, muted: false }, { day: 20, muted: false }, { day: 21, muted: false },
  { day: 22, muted: false }, { day: 23, muted: false }, { day: 24, muted: false }, { day: 25, muted: false }, { day: 26, muted: false }, { day: 27, muted: false }, { day: 28, muted: false },
  { day: 29, muted: false }, { day: 30, muted: false }, { day: 1, muted: true }, { day: 2, muted: true }, { day: 3, muted: true }, { day: 4, muted: true }, { day: 5, muted: true }
];

const SVG_SEARCH = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>`;
const SVG_CALENDAR = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

export class CortexTasksSchedulerGrid extends CortexElement {
  constructor() {
    super();
    this._selectedRowId = 5;
    this._calendarOpen = false; // Fechado por padrão conforme Imagem 2
    this._selectedCalDay = 6;  // Dia 6 com círculo azul quando o calendário for aberto
    this._calMonthLabel = 'June 2025';
    this._filterSubject = '';
    this._filterPriority = 'All';
    this._filterStatus = 'All';
    this._sortField = 'id';
    this._sortAsc = true;
    this._pageSize = 10;
    this._currentPage = 1;
    this._tasks = INITIAL_TASKS_GRID.map((t) => ({ ...t }));
  }

  _ensureState() {
    if (!this._tasks) {
      this._selectedRowId = 5;
      this._calendarOpen = false;
      this._selectedCalDay = 6;
      this._calMonthLabel = 'June 2025';
      this._filterSubject = '';
      this._filterPriority = 'All';
      this._filterStatus = 'All';
      this._sortField = 'id';
      this._sortAsc = true;
      this._pageSize = 10;
      this._currentPage = 1;
      this._tasks = INITIAL_TASKS_GRID.map((t) => ({ ...t }));
    }
  }

  async _openTaskModal(task = null) {
    const isNew = !task;
    const res = await CortexModal.form({
      title: isNew ? t('tasks.createTask') : t('tasks.editTask', { id: task.id, subject: task.subject }),
      confirmText: isNew ? t('common.create') : t('common.saveChanges'),
      cancelText: t('common.cancel'),
      deleteText: isNew ? null : t('common.delete'),
      width: '500px',
      fields: [
        { name: 'subject', label: t('tasks.subject'), type: 'text', defaultValue: task ? task.subject : 'New Project Task' },
        {
          name: 'status',
          label: t('tasks.status'),
          type: 'select',
          defaultValue: task ? task.status : 'In Progress',
          options: [
            { value: 'Completed', label: 'Completed' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Need Assistance', label: 'Need Assistance' }
          ]
        },
        {
          name: 'priority',
          label: t('tasks.priority'),
          type: 'select',
          defaultValue: task ? task.priority : 'High',
          options: [
            { value: 'High', label: 'High' },
            { value: 'Normal', label: 'Normal' },
            { value: 'Urgent', label: 'Urgent' }
          ]
        },
        { name: 'assignedTo', label: t('tasks.assignedTo'), type: 'text', defaultValue: task ? task.assignedTo : 'Samantha Bright' },
        { name: 'startDate', label: t('tasks.startDate'), type: 'date', defaultValue: task ? task.startDate : '6/6/2025' },
        { name: 'dueDate', label: t('tasks.dueDate'), type: 'date', defaultValue: task ? task.dueDate : '6/18/2025' }
      ]
    });

    if (res) {
      if (res.__action === 'delete' && task) {
        this._tasks = this._tasks.filter((t) => t.id !== task.id);
        this.render();
        CortexModal.toast(t('common.deleteConfirm', { name: task.subject }), 'warning', 2000);
        return;
      }

      if (isNew) {
        const nextId = this._tasks.length > 0 ? Math.max(...this._tasks.map((t) => t.id)) + 1 : 1;
        this._tasks.unshift({
          id: nextId,
          subject: res.subject || 'Nova Tarefa',
          status: res.status || 'In Progress',
          priority: res.priority || 'Normal',
          assignedTo: res.assignedTo || 'John Heart',
          startDate: res.startDate || '6/1/2025',
          dueDate: res.dueDate || '6/10/2025',
          priorityCode: res.priority === 'Urgent' ? 3 : res.priority === 'High' ? 4 : 2
        });
        this.render();
        CortexModal.toast(`Tarefa #${nextId} criada com sucesso!`, 'success', 2000);
      } else {
        task.subject = res.subject || task.subject;
        task.status = res.status || task.status;
        task.priority = res.priority || task.priority;
        task.assignedTo = res.assignedTo || task.assignedTo;
        task.startDate = res.startDate || task.startDate;
        task.dueDate = res.dueDate || task.dueDate;
        task.priorityCode = task.priority === 'Urgent' ? 3 : task.priority === 'High' ? 4 : 2;
        this.render();
        CortexModal.toast(`Tarefa #${task.id} atualizada com sucesso!`, 'success', 2000);
      }
    }
  }

  onRender() {
    // Filtro Subject
    const subFilter = this.shadowRoot.querySelector('#filter-subject');
    subFilter?.addEventListener('input', (e) => {
      this._filterSubject = e.target.value.toLowerCase();
      this._currentPage = 1;
      this.render();
      const el = this.shadowRoot.querySelector('#filter-subject');
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });

    // Filtro Prioridade
    const prioFilter = this.shadowRoot.querySelector('#filter-priority');
    prioFilter?.addEventListener('change', (e) => {
      this._filterPriority = e.target.value;
      this._currentPage = 1;
      this.render();
    });

    // Alternar Popover do Calendário
    this.shadowRoot.querySelectorAll('[data-toggle-cal]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this._calendarOpen = !this._calendarOpen;
        this.render();
      });
    });

    // Fechar Popover do Calendário no botão ×
    this.shadowRoot.querySelector('#cal-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._calendarOpen = false;
      this.render();
    });

    // Fechar ao clicar fora do popover
    if (this._calendarOpen) {
      const handleOutsideClick = (e) => {
        if (!e.composedPath().some((node) => node.classList?.contains('cal-popover') || node.hasAttribute?.('data-toggle-cal'))) {
          this._calendarOpen = false;
          this.render();
          window.removeEventListener('click', handleOutsideClick);
        }
      };
      setTimeout(() => window.addEventListener('click', handleOutsideClick), 0);
    }

    // Seleção de dia no Popover de Calendário (June 2025)
    this.shadowRoot.querySelectorAll('[data-cal-day]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const day = Number(btn.getAttribute('data-cal-day'));
        if (this._selectedCalDay === day) {
          this._selectedCalDay = null; // Desmarca
        } else {
          this._selectedCalDay = day;
          // Seleciona a tarefa vinculada ao dia se houver
          const match = this._tasks.find((t) => t.startDate && t.startDate.includes(`6/${day}/2025`));
          if (match) {
            this._selectedRowId = match.id;
          }
        }
        this.render();
      });
    });

    // Clique nas linhas da tabela
    this.shadowRoot.querySelectorAll('[data-task-row]').forEach((tr) => {
      tr.addEventListener('click', () => {
        this._selectedRowId = Number(tr.getAttribute('data-task-row'));
        this.render();
      });
      tr.addEventListener('dblclick', () => {
        const id = Number(tr.getAttribute('data-task-row'));
        const task = this._tasks.find((t) => t.id === id);
        if (task) this._openTaskModal(task);
      });
    });

    // Botões de ação rápida por linha
    this.shadowRoot.querySelectorAll('[data-row-menu]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.getAttribute('data-row-menu'));
        const task = this._tasks.find((t) => t.id === id);
        if (task) this._openTaskModal(task);
      });
    });

    // Ordenação nas colunas
    this.shadowRoot.querySelectorAll('[data-sort]').forEach((th) => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (this._sortField === field) {
          this._sortAsc = !this._sortAsc;
        } else {
          this._sortField = field;
          this._sortAsc = true;
        }
        this.render();
      });
    });

    // Paginação
    this.shadowRoot.querySelectorAll('[data-psize]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._pageSize = Number(btn.getAttribute('data-psize'));
        this._currentPage = 1;
        this.render();
      });
    });

    this.shadowRoot.querySelector('#pg-prev')?.addEventListener('click', () => {
      if (this._currentPage > 1) {
        this._currentPage--;
        this.render();
      }
    });

    this.shadowRoot.querySelector('#pg-next')?.addEventListener('click', () => {
      const totalPages = Math.ceil(this._tasks.length / this._pageSize) || 1;
      if (this._currentPage < totalPages) {
        this._currentPage++;
        this.render();
      }
    });
  }

  render() {
    this._ensureState();

    // Filtros
    let filtered = this._tasks.filter((row) => {
      if (this._filterSubject && !row.subject.toLowerCase().includes(this._filterSubject)) return false;
      if (this._filterPriority !== 'All' && row.priority !== this._filterPriority) return false;
      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      const va = a[this._sortField];
      const vb = b[this._sortField];
      if (va == null) return 1;
      if (vb == null) return -1;
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
      else cmp = String(va).localeCompare(String(vb));
      return this._sortAsc ? cmp : -cmp;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / this._pageSize) || 1;
    const startIdx = (this._currentPage - 1) * this._pageSize;
    const pagedRows = filtered.slice(startIdx, startIdx + this._pageSize);

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          width: 100%;
          font-family: var(--font-sans);
          color: var(--text-primary);
          box-sizing: border-box;
          user-select: none;
        }

        /* Container Principal Fiel à Imagem 2 (sem topbar e sem rail lateral) */
        .dx-tasks-container {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: var(--panel-bevel-shadow, 0 8px 30px rgba(0, 0, 0, 0.45));
        }

        .dx-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dx-page-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: 0.2px;
        }

        /* Grid Table Card */
        .dx-grid-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          overflow: hidden;
          position: relative;
        }

        /* Container de Rolagem Horizontal e Vertical */
        .dx-table-scroll-container {
          width: 100%;
          overflow-x: auto;
          overflow-y: auto;
          max-height: 480px;
        }

        .dx-table-scroll-container::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        .dx-table-scroll-container::-webkit-scrollbar-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .dx-table-scroll-container::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
          border: none;
        }
        .dx-table-scroll-container::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: var(--radius-pill, 9999px);
          border: 1px solid var(--scrollbar-track);
        }
        .dx-table-scroll-container::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover);
        }
        .dx-table-scroll-container::-webkit-scrollbar-thumb:active {
          background: var(--accent-blue);
        }
        .dx-table-scroll-container::-webkit-scrollbar-corner {
          background: var(--scrollbar-track);
        }

        table {
          width: 100%;
          min-width: 880px;
          border-collapse: collapse;
          font-size: 13px;
          text-align: left;
        }

        thead tr:first-child th {
          background: var(--bg-panel-header);
          color: var(--text-primary);
          font-weight: 600;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-subtle);
          cursor: pointer;
          white-space: nowrap;
        }

        thead tr:first-child th:hover {
          color: var(--accent-blue);
        }

        /* Linha de Filtros por Coluna Fiel à Imagem 2 */
        .filter-row td {
          background: var(--bg-panel);
          padding: 6px 8px;
          border-bottom: 1px solid var(--border-input);
          white-space: nowrap;
        }

        .filter-lupa-cell {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
          padding: 0 4px;
          vertical-align: middle;
        }

        .filter-input-wrap {
          display: flex;
          align-items: center;
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          padding: 0 6px;
          height: 26px;
          gap: 4px;
        }

        .filter-input-wrap input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 11.5px;
          outline: none;
          width: 100%;
        }

        .filter-input-wrap input::placeholder {
          color: var(--text-muted);
        }

        .filter-select-wrap {
          display: flex;
          align-items: center;
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          padding: 0 4px;
          height: 26px;
          gap: 2px;
        }

        .filter-select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 11.5px;
          height: 100%;
          outline: none;
          width: 100%;
          cursor: pointer;
        }

        .filter-select option {
          background: var(--bg-panel);
          color: var(--text-primary);
        }

        .filter-dual-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cal-toggle-btn {
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-xs);
          padding: 2px 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
          transition: background 0.15s, border-color 0.15s;
        }

        .cal-toggle-btn:hover {
          background: var(--bg-hover);
          border-color: var(--border-input);
        }

        /* Linhas de Dados */
        .data-row {
          border-bottom: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: background 0.12s;
        }

        .data-row:hover {
          background: var(--bg-hover);
        }

        .data-row.selected {
          background: var(--accent-blue-alpha) !important;
          color: var(--text-primary);
          outline: 1px solid var(--accent-blue);
          outline-offset: -1px;
        }

        .data-row td {
          padding: 8px 12px;
          color: inherit;
          white-space: nowrap;
        }

        .row-action-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }
        .row-action-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        /* Popover de Calendário June 2025 (Fiel à Imagem 1 e 3) */
        .cal-popover {
          position: absolute;
          top: 75px;
          right: 80px;
          width: 290px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-dropdown);
          padding: 14px;
          z-index: 100;
          box-sizing: border-box;
          animation: calPop 120ms ease-out;
        }

        @keyframes calPop {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .cal-nav {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
          padding: 4px 8px;
          border-radius: var(--radius-xs);
        }
        .cal-nav:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .cal-title {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .cal-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 16px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          line-height: 1;
        }
        .cal-close:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .cal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .cal-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          text-align: center;
        }

        .cal-day-btn {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 12px;
          height: 32px;
          width: 32px;
          margin: 0 auto;
          border-radius: 50%;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .cal-day-btn:hover {
          background: var(--bg-hover);
        }

        .cal-day-btn.muted {
          color: var(--text-muted);
          opacity: 0.5;
        }

        /* Dia 6 Selecionado com Círculo Azul */
        .cal-day-btn.selected {
          border: 2px solid var(--accent-blue);
          color: var(--accent-blue);
          font-weight: 700;
          background: var(--accent-blue-alpha);
        }

        /* Rodapé de Paginação */
        .dx-grid-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: var(--bg-panel-header);
          border-top: 1px solid var(--border-subtle);
          font-size: 12px;
          color: var(--text-secondary);
        }

        .psize-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .psize-btn {
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
          font-size: 11px;
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          cursor: pointer;
        }
        .psize-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .psize-btn.active {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: #ffffff;
          font-weight: 600;
        }

        .dx-pg-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dx-pg-btn {
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
          font-size: 11px;
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          cursor: pointer;
        }
        .dx-pg-btn:hover:not(:disabled) {
          background: var(--bg-hover);
        }
        .dx-pg-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      </style>

      <div class="dx-tasks-container">
        <!-- Título Tasks Fiel à Imagem 2 -->
        <div class="dx-header-row">
          <h2 class="dx-page-title">${t('tasks.title')}</h2>
        </div>

        <div class="dx-grid-card">
          <!-- Rolagem de tabela que garante visualização completa de todas as colunas -->
          <div class="dx-table-scroll-container">
            <table>
              <thead>
                <tr>
                  <th data-sort="id" style="width:75px; text-align:right;">${t('tasks.taskId')} ${this._sortField === 'id' ? (this._sortAsc ? '▲' : '▼') : ''}</th>
                  <th data-sort="subject" style="min-width:220px;">${t('tasks.subject')} ${this._sortField === 'subject' ? (this._sortAsc ? '▲' : '▼') : ''}</th>
                  <th data-sort="status" style="min-width:110px;">${t('tasks.status')} ${this._sortField === 'status' ? (this._sortAsc ? '▲' : '▼') : ''}</th>
                  <th data-sort="priority" style="min-width:105px;">${t('tasks.priority')} ${this._sortField === 'priority' ? (this._sortAsc ? '▲' : '▼') : ''}</th>
                  <th data-sort="assignedTo" style="min-width:140px;">${t('tasks.assignedTo')} ${this._sortField === 'assignedTo' ? (this._sortAsc ? '▲' : '▼') : ''}</th>
                  <th data-sort="startDate" style="min-width:115px;">${t('tasks.startDate')} ${this._sortField === 'startDate' ? (this._sortAsc ? '▲' : '▼') : ''}</th>
                  <th data-sort="dueDate" style="min-width:115px;">${t('tasks.dueDate')} ${this._sortField === 'dueDate' ? (this._sortAsc ? '▲' : '▼') : ''}</th>
                  <th data-sort="priorityCode" style="width:75px; text-align:right;">${t('tasks.priorityCode')} ${this._sortField === 'priorityCode' ? (this._sortAsc ? '▲' : '▼') : ''}</th>
                  <th style="width:40px; text-align:center;"></th>
                </tr>

                <!-- Linha de Filtros Inline Fiel à Imagem 2 -->
                <tr class="filter-row">
                  <td style="text-align:right;">
                    <span class="filter-lupa-cell" title="Buscar">${SVG_SEARCH}</span>
                  </td>
                  <td>
                    <div class="filter-input-wrap">
                      <span class="filter-lupa-cell">${SVG_SEARCH}</span>
                      <input id="filter-subject" type="text" placeholder="${t('tasks.filterPlaceholder')}" value="${this._filterSubject}" />
                    </div>
                  </td>
                  <td>
                    <span class="filter-lupa-cell" title="Buscar">${SVG_SEARCH}</span>
                  </td>
                  <td>
                    <div class="filter-select-wrap">
                      <span class="filter-lupa-cell">${SVG_SEARCH}</span>
                      <select class="filter-select" id="filter-priority">
                        <option value="All" ${this._filterPriority === 'All' ? 'selected' : ''}>(All)</option>
                        <option value="High" ${this._filterPriority === 'High' ? 'selected' : ''}>High</option>
                        <option value="Normal" ${this._filterPriority === 'Normal' ? 'selected' : ''}>Normal</option>
                        <option value="Urgent" ${this._filterPriority === 'Urgent' ? 'selected' : ''}>Urgent</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <span class="filter-lupa-cell" title="Buscar">${SVG_SEARCH}</span>
                  </td>
                  <td>
                    <div class="filter-dual-cell">
                      <span class="filter-lupa-cell">${SVG_SEARCH}</span>
                      <button class="cal-toggle-btn" data-toggle-cal title="${t('common.openCalendar')}">
                        ${SVG_CALENDAR}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div class="filter-dual-cell">
                      <span class="filter-lupa-cell">${SVG_SEARCH}</span>
                      <button class="cal-toggle-btn" data-toggle-cal title="${t('common.openCalendar')}">
                        ${SVG_CALENDAR}
                      </button>
                    </div>
                  </td>
                  <td style="text-align:right;">
                    <span class="filter-lupa-cell" title="Buscar">${SVG_SEARCH}</span>
                  </td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                ${pagedRows
                  .map(
                    (row) => `
                  <tr class="data-row ${this._selectedRowId === row.id ? 'selected' : ''}" data-task-row="${row.id}" title="Duplo clique para editar">
                    <td style="text-align:right;">${row.id}</td>
                    <td>${row.subject}</td>
                    <td>${row.status}</td>
                    <td>${row.priority}</td>
                    <td>${row.assignedTo}</td>
                    <td>${row.startDate || ''}</td>
                    <td>${row.dueDate || ''}</td>
                    <td style="text-align:right;">${row.priorityCode}</td>
                    <td style="text-align:center;">
                      <button class="row-action-btn" data-row-menu="${row.id}" title="${t('common.edit')}">&#8943;</button>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <!-- Popover Flutuante June 2025 (abre somente ao clicar no ícone de calendário) -->
          ${
            this._calendarOpen
              ? `
            <div class="cal-popover">
              <div class="cal-header">
                <button class="cal-nav" id="cal-prev">&#10094;</button>
                <span class="cal-title">${this._calMonthLabel}</span>
                <button class="cal-nav" id="cal-next">&#10095;</button>
                <button class="cal-close" id="cal-close" title="${t('common.close')}">&times;</button>
              </div>
              <div class="cal-weekdays">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              <div class="cal-days">
                ${JUNE_2025_CELLS.map(
                  (c) => `
                  <button
                    class="cal-day-btn ${c.muted ? 'muted' : ''} ${!c.muted && c.day === this._selectedCalDay ? 'selected' : ''}"
                    data-cal-day="${c.day}"
                    title="June ${c.day}, 2025"
                  >${c.day}</button>
                `
                ).join('')}
              </div>
            </div>
          `
              : ''
          }

          <!-- Rodapé de Paginação -->
          <div class="dx-grid-footer">
            <div class="psize-group">
              <span>${t('tasks.itemsPerPage')}</span>
              ${[5, 10, 20]
                .map(
                  (n) => `
                <button class="psize-btn ${this._pageSize === n ? 'active' : ''}" data-psize="${n}">${n}</button>
              `
                )
                .join('')}
            </div>

            <div class="dx-pg-controls">
              <span>${t('tasks.page')} ${this._currentPage} ${t('tasks.of')} ${totalPages} (${totalItems} items)</span>
              <button class="dx-pg-btn" id="pg-prev" ${this._currentPage <= 1 ? 'disabled' : ''}>&#10094;</button>
              <button class="dx-pg-btn" id="pg-next" ${this._currentPage >= totalPages ? 'disabled' : ''}>&#10095;</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.onRender();
  }
}

customElements.define('cortex-scheduler-resources', CortexSchedulerResources);
customElements.define('cortex-scheduler-workweek', CortexSchedulerWorkWeek);
customElements.define('cortex-tasks-scheduler-grid', CortexTasksSchedulerGrid);
