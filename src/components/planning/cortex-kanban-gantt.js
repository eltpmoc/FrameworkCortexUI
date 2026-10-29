// src/components/planning/cortex-kanban-gantt.js
/**
 * CortexUI — Kanban & Gantt Corporativos:
 * 3. <cortex-kanban-board> (Kanban com Drag & Drop entre colunas e reordenação interna)
 * 4. <cortex-gantt-chart>  (Gantt WBS com árvore, barras, marcos e conectores SVG de dependência)
 */

import { CortexElement } from '../../core/CortexElement.js';
import { CortexModal } from '../cortex-modal.js';
import { t, tx } from '../../core/i18n.js';

/* ============================================================================
 * 3. KANBAN BOARD (<cortex-kanban-board>) — IMAGEM 4
 * ============================================================================ */
const INITIAL_KANBAN_TASKS = [
  // Planned
  { id: 'kb-1', status: 'Planned', title: 'Spring cleaning', room: '507', time: '11:00 AM', initials: 'MG', color: '#8cc657' },
  { id: 'kb-2', status: 'Planned', title: 'Spring cleaning', room: '105', time: '11:30 AM', initials: 'BJ', color: '#1db2f5' },
  { id: 'kb-3', status: 'Planned', title: 'Regular cleaning', room: '203', time: '11:00 AM', initials: 'WS', color: '#f59638' },
  { id: 'kb-4', status: 'Planned', title: 'Spring cleaning', room: '307', time: '11:00 AM', initials: 'TR', color: '#9c7bd3' },
  { id: 'kb-5', status: 'Planned', title: 'Regular cleaning', room: '315', time: '11:30 AM', initials: 'KS', color: '#66c18c' },

  // In Progress
  { id: 'kb-6', status: 'In Progress', title: 'Regular cleaning', room: '522', time: '9:00 AM', initials: 'MG', color: '#8cc657' },
  { id: 'kb-7', status: 'In Progress', title: 'Regular cleaning', room: '114', time: '9:30 AM', initials: 'BJ', color: '#1db2f5' },
  { id: 'kb-8', status: 'In Progress', title: 'Spring cleaning', room: '208', time: '9:00 AM', initials: 'WS', color: '#f59638' },
  { id: 'kb-9', status: 'In Progress', title: 'Spring cleaning', room: '311', time: '8:30 AM', initials: 'KS', color: '#66c18c' },

  // Done
  { id: 'kb-10', status: 'Done', title: 'Regular cleaning', room: '523', time: '8:00 AM', initials: 'MG', color: '#8cc657' },
  { id: 'kb-11', status: 'Done', title: 'Regular cleaning', room: '314', time: '10:30 AM', initials: 'KS', color: '#66c18c' }
];

const KANBAN_COLUMNS = ['Planned', 'In Progress', 'Done'];

export class CortexKanbanBoard extends CortexElement {
  constructor() {
    super();
    this._search = '';
    this._dragTaskId = null;
    this._tasks = INITIAL_KANBAN_TASKS.map((t) => ({ ...t }));
  }

  _ensureState() {
    if (!this._tasks) {
      this._search = '';
      this._dragTaskId = null;
      this._tasks = INITIAL_KANBAN_TASKS.map((t) => ({ ...t }));
    }
  }

  async _openAddTaskModal(defaultColumn = 'Planned') {
    const res = await CortexModal.form({
      title: `${t('common.add')} — Kanban (${defaultColumn})`,
      confirmText: t('common.create'),
      cancelText: t('common.cancel'),
      fields: [
        {
          name: 'title',
          label: t('scheduler.service'),
          type: 'select',
          defaultValue: 'Spring cleaning',
          options: [
            { value: 'Spring cleaning', label: 'Spring cleaning' },
            { value: 'Regular cleaning', label: 'Regular cleaning' },
            { value: 'VIP Suite inspection', label: 'VIP Suite inspection' }
          ]
        },
        { name: 'room', label: t('scheduler.room'), type: 'text', defaultValue: '408' },
        { name: 'time', label: t('scheduler.startTime'), type: 'text', defaultValue: '10:00 AM' },
        {
          name: 'status',
          label: t('tasks.status'),
          type: 'select',
          defaultValue: defaultColumn,
          options: KANBAN_COLUMNS.map((c) => ({ value: c, label: c }))
        },
        {
          name: 'staff',
          label: t('scheduler.resource'),
          type: 'select',
          defaultValue: 'maria',
          options: [
            { value: 'maria', label: 'Maria Garcia (MG)' },
            { value: 'barbara', label: 'Barbara Johnson (BJ)' },
            { value: 'william', label: 'William Smith (WS)' },
            { value: 'taylor', label: 'Taylor Riley (TR)' },
            { value: 'kent', label: 'Kent Samuel (KS)' }
          ]
        }
      ]
    });

    if (res && res.room) {
      const staffMap = {
        maria: { initials: 'MG', color: '#8cc657' },
        barbara: { initials: 'BJ', color: '#1db2f5' },
        william: { initials: 'WS', color: '#f59638' },
        taylor: { initials: 'TR', color: '#9c7bd3' },
        kent: { initials: 'KS', color: '#66c18c' }
      };
      const s = staffMap[res.staff] || staffMap.maria;
      this._tasks.push({
        id: `kb-${Date.now()}`,
        status: res.status || defaultColumn,
        title: res.title || 'Spring cleaning',
        room: res.room,
        time: res.time || '10:00 AM',
        initials: s.initials,
        color: s.color
      });
      this.render();
      CortexModal.toast(`Card Quarto ${res.room} adicionado!`, 'success', 2000);
    }
  }

  _moveTask(taskId, targetColumn, targetIndex = null) {
    const taskIdx = this._tasks.findIndex((t) => t.id === taskId);
    if (taskIdx === -1) return;
    const task = this._tasks[taskIdx];
    task.status = targetColumn;

    // Se houver índice alvo para reordenação
    if (targetIndex != null) {
      this._tasks.splice(taskIdx, 1);
      const colTasks = this._tasks.filter((t) => t.status === targetColumn);
      const insertAt = Math.min(targetIndex, colTasks.length);
      const beforeTask = colTasks[insertAt];
      if (beforeTask) {
        const destIdx = this._tasks.indexOf(beforeTask);
        this._tasks.splice(destIdx, 0, task);
      } else {
        this._tasks.push(task);
      }
    }

    this.render();
    CortexModal.toast(t('kanban.cardMoved', { room: task.room, col: targetColumn }), 'info', 1500);
  }

  onRender() {
    // Add task button
    this.shadowRoot.querySelector('#kb-add-task-btn')?.addEventListener('click', () => {
      this._openAddTaskModal('Planned');
    });

    // Refresh board
    this.shadowRoot.querySelector('#kb-refresh')?.addEventListener('click', () => {
      this._tasks = INITIAL_KANBAN_TASKS.map((t) => ({ ...t }));
      this._search = '';
      this.render();
      CortexModal.toast(t('kanban.resetBoard'), 'success', 1500);
    });

    // Export JSON
    this.shadowRoot.querySelector('#kb-export-json')?.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this._tasks, null, 2));
      const dl = document.createElement('a');
      dl.setAttribute('href', dataStr);
      dl.setAttribute('download', 'cortex-kanban.json');
      dl.click();
      CortexModal.toast('Quadro Kanban exportado como JSON!', 'success', 1500);
    });

    // Search input
    const searchEl = this.shadowRoot.querySelector('#kb-search');
    searchEl?.addEventListener('input', (e) => {
      this._search = e.target.value;
      this.render();
      const input = this.shadowRoot.querySelector('#kb-search');
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });

    // Drag & Drop nos Cards
    this.shadowRoot.querySelectorAll('[data-drag-task-id]').forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        this._dragTaskId = card.getAttribute('data-drag-task-id');
        e.dataTransfer.setData('text/plain', this._dragTaskId);
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this._dragTaskId = null;
        this.shadowRoot.querySelectorAll('.kb-col.drag-over').forEach((c) => c.classList.remove('drag-over'));
      });
    });

    // Drop Targets nas Colunas do Kanban
    this.shadowRoot.querySelectorAll('[data-kb-column]').forEach((col) => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-over');
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain') || this._dragTaskId;
        const targetCol = col.getAttribute('data-kb-column');
        if (taskId && targetCol) {
          this._moveTask(taskId, targetCol);
        }
      });
    });

    // Edit card button
    this.shadowRoot.querySelectorAll('[data-edit-kb]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-edit-kb');
        const task = this._tasks.find((t) => t.id === id);
        if (!task) return;

        const res = await CortexModal.form({
          title: `${t('common.edit')} — Room ${task.room}`,
          confirmText: t('common.saveChanges'),
          cancelText: t('common.cancel'),
          deleteText: t('common.delete'),
          fields: [
            {
              name: 'title',
              label: t('scheduler.service'),
              type: 'select',
              defaultValue: task.title,
              options: [
                { value: 'Spring cleaning', label: 'Spring cleaning' },
                { value: 'Regular cleaning', label: 'Regular cleaning' },
                { value: 'VIP Suite inspection', label: 'VIP Suite inspection' }
              ]
            },
            { name: 'room', label: t('scheduler.room'), type: 'text', defaultValue: task.room },
            { name: 'time', label: t('scheduler.startTime'), type: 'text', defaultValue: task.time },
            {
              name: 'status',
              label: t('tasks.status'),
              type: 'select',
              defaultValue: task.status,
              options: KANBAN_COLUMNS.map((c) => ({ value: c, label: c }))
            }
          ]
        });

        if (res) {
          if (res.__action === 'delete') {
            this._tasks = this._tasks.filter((t) => t.id !== id);
            this.render();
            CortexModal.toast(t('common.deleteConfirm', { name: `Room ${task.room}` }), 'warning', 2000);
            return;
          }
          task.title = res.title || task.title;
          task.room = res.room || task.room;
          task.time = res.time || task.time;
          task.status = res.status || task.status;
          this.render();
          CortexModal.toast(`Card Quarto ${task.room} atualizado!`, 'success', 2000);
        }
      });
    });

    // Delete card button
    this.shadowRoot.querySelectorAll('[data-del-kb]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-del-kb');
        const task = this._tasks.find((t) => t.id === id);
        if (task) {
          this._tasks = this._tasks.filter((t) => t.id !== id);
          this.render();
          CortexModal.toast(`Card Quarto ${task.room} removido.`, 'warning', 1500);
        }
      });
    });
  }

  render() {
    this._ensureState();

    const q = this._search.toLowerCase().trim();

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          width: 100%;
          font-family: var(--font-sans);
          color: var(--text-primary);
        }

        .kb-container {
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md, 8px);
          padding: 18px 20px;
          box-shadow: var(--shadow-sm);
        }

        /* Toolbar Superior */
        .kb-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .kb-btn-add {
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 4px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s;
        }
        .kb-btn-add:hover {
          background: #1d4ed8;
        }

        .kb-tools-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kb-icon-btn {
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: 4px;
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.15s, color 0.15s;
        }
        .kb-icon-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .kb-search-box {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 10px;
          border: 1px solid var(--border-input);
          border-radius: 4px;
          background: var(--bg-input);
        }
        .kb-search-box input {
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 12.5px;
          outline: none;
          width: 150px;
        }

        /* Colunas do Kanban */
        .kb-columns {
          display: grid;
          grid-template-columns: repeat(3, minmax(240px, 1fr));
          gap: 20px;
          align-items: start;
          overflow-x: auto;
        }

        .kb-col {
          background: var(--bg-panel-header, rgba(255,255,255,0.03));
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          min-height: 480px;
          transition: background 0.15s, border-color 0.15s;
        }

        .kb-col.drag-over {
          background: rgba(37, 99, 235, 0.08);
          border-color: #2563eb;
        }

        .kb-col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .kb-col-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .kb-col-count {
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 600;
          padding: 1px 7px;
          border-radius: 10px;
        }

        .kb-task-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        /* Card do Kanban */
        .kb-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          padding: 12px 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          cursor: grab;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .kb-card:active {
          cursor: grabbing;
        }

        .kb-card.dragging {
          opacity: 0.35;
          transform: scale(0.96);
        }

        .kb-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.14);
          border-color: var(--border-focus);
        }

        .kb-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kb-card-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .kb-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .kb-card-action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 12px;
          padding: 2px 4px;
          border-radius: 3px;
          transition: color 0.15s;
        }
        .kb-card-action-btn:hover {
          color: var(--text-primary);
        }

        .kb-card-meta {
          font-size: 11.5px;
          color: var(--text-secondary);
        }

        .kb-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
        }

        .kb-card-time {
          font-size: 11px;
          color: var(--text-muted);
        }

        .kb-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      </style>

      <div class="kb-container">
        <!-- Toolbar Superior (Fiel à Imagem 4) -->
        <div class="kb-toolbar">
          <button class="kb-btn-add" id="kb-add-task-btn">${t('kanban.addTask')}</button>

          <div class="kb-tools-right">
            <button class="kb-icon-btn" id="kb-export-json" title="${t('common.export')} JSON">&#128190;</button>
            <button class="kb-icon-btn" id="kb-refresh" title="${t('kanban.resetBoard')}">&#8635;</button>
            <div class="kb-search-box">
              <span style="color:var(--text-muted); font-size:12px;">&#128269;</span>
              <input id="kb-search" type="text" placeholder="${t('kanban.taskSearch')}" value="${this._search}" />
            </div>
          </div>
        </div>

        <!-- 3 Colunas Kanban -->
        <div class="kb-columns">
          ${KANBAN_COLUMNS.map((colName) => {
            const colTasks = this._tasks.filter(
              (t) =>
                t.status === colName &&
                (!q ||
                  t.title.toLowerCase().includes(q) ||
                  t.room.toLowerCase().includes(q) ||
                  t.initials.toLowerCase().includes(q))
            );

            return `
              <div class="kb-col" data-kb-column="${colName}">
                <div class="kb-col-header">
                  <span class="kb-col-title">${colName}</span>
                  <span class="kb-col-count">${colTasks.length}</span>
                </div>

                <div class="kb-task-list">
                  ${colTasks
                    .map(
                      (task) => `
                    <div
                      class="kb-card"
                      draggable="true"
                      data-drag-task-id="${task.id}"
                      title="Arraste para mover entre colunas"
                    >
                      <div class="kb-card-top">
                        <span class="kb-card-title">${task.title}</span>
                        <div class="kb-card-actions">
                          <button class="kb-card-action-btn" data-edit-kb="${task.id}" title="${t('common.edit')}">&#9998;</button>
                          <button class="kb-card-action-btn" data-del-kb="${task.id}" title="${t('common.delete')}">&#128465;</button>
                        </div>
                      </div>

                      <div class="kb-card-meta">
                        <span>Room: <strong>${task.room}</strong></span>
                      </div>

                      <div class="kb-card-bottom">
                        <span class="kb-card-time">${task.time}</span>
                        <div class="kb-avatar" style="background-color: ${task.color};">${task.initials}</div>
                      </div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.onRender();
  }
}

/* ============================================================================
 * 4. GANTT CHART (<cortex-gantt-chart>) — IMAGEM 5 (com Conectores SVG Reais)
 * ============================================================================ */
const INITIAL_GANTT_TASKS = [
  {
    id: 'g-root',
    parentId: null,
    type: 'project',
    subject: 'Software Development',
    startDate: '2/21/2019',
    startDayOffset: 4,
    durationDays: 17,
    progress: 65,
    resource: '',
    expanded: true
  },
  {
    id: 'g-scope',
    parentId: 'g-root',
    type: 'phase',
    subject: 'Scope',
    startDate: '2/21/2019',
    startDayOffset: 4,
    durationDays: 4.5,
    progress: 100,
    resource: '',
    expanded: true
  },
  {
    id: 'g-s1',
    parentId: 'g-scope',
    type: 'task',
    subject: 'Determine project scope',
    startDate: '2/21/2019',
    startDayOffset: 4,
    durationDays: 0.6,
    progress: 100,
    resource: 'Management'
  },
  {
    id: 'g-s2',
    parentId: 'g-scope',
    type: 'task',
    subject: 'Secure project sponsorship',
    startDate: '2/21/2019',
    startDayOffset: 4.3,
    durationDays: 1.2,
    progress: 100,
    resource: 'Project Manager',
    dependsOn: 'g-s1'
  },
  {
    id: 'g-s3',
    parentId: 'g-scope',
    type: 'task',
    subject: 'Define preliminary resources',
    startDate: '2/22/2019',
    startDayOffset: 5.3,
    durationDays: 1.2,
    progress: 100,
    resource: 'Management',
    dependsOn: 'g-s2'
  },
  {
    id: 'g-s4',
    parentId: 'g-scope',
    type: 'task',
    subject: 'Secure core resources',
    startDate: '2/23/2019',
    startDayOffset: 6.3,
    durationDays: 1.8,
    progress: 80,
    resource: 'Project Manager',
    dependsOn: 'g-s3'
  },
  {
    id: 'g-s5',
    parentId: 'g-scope',
    type: 'milestone',
    subject: 'Scope complete',
    startDate: '2/25/2019',
    startDayOffset: 8.2,
    durationDays: 0,
    progress: 100,
    resource: '',
    dependsOn: 'g-s4'
  },
  {
    id: 'g-analysis',
    parentId: 'g-root',
    type: 'phase',
    subject: 'Analysis/Software Requirements',
    startDate: '2/25/2019',
    startDayOffset: 8.5,
    durationDays: 12.5,
    progress: 40,
    resource: '',
    expanded: true,
    dependsOn: 'g-s5'
  },
  {
    id: 'g-a1',
    parentId: 'g-analysis',
    type: 'task',
    subject: 'Conduct needs analysis',
    startDate: '2/25/2019',
    startDayOffset: 8.5,
    durationDays: 2.2,
    progress: 100,
    resource: 'Analyst',
    dependsOn: 'g-s5'
  },
  {
    id: 'g-a2',
    parentId: 'g-analysis',
    type: 'task',
    subject: 'Draft Preliminary Software Specifications',
    startDate: '2/27/2019',
    startDayOffset: 10.7,
    durationDays: 1.4,
    progress: 100,
    resource: 'Analyst',
    dependsOn: 'g-a1'
  },
  {
    id: 'g-a3',
    parentId: 'g-analysis',
    type: 'task',
    subject: 'Develop preliminary budget',
    startDate: '2/28/2019',
    startDayOffset: 12.0,
    durationDays: 1.2,
    progress: 80,
    resource: 'Project Manager',
    dependsOn: 'g-a2'
  },
  {
    id: 'g-a4',
    parentId: 'g-analysis',
    type: 'task',
    subject: 'Review software specifications/budget',
    startDate: '3/3/2019',
    startDayOffset: 14.5,
    durationDays: 2.5,
    progress: 50,
    resource: 'Management',
    dependsOn: 'g-a3'
  },
  {
    id: 'g-a5',
    parentId: 'g-analysis',
    type: 'task',
    subject: 'Incorporate feedback on software sp...',
    startDate: '3/6/2019',
    startDayOffset: 17.5,
    durationDays: 2.0,
    progress: 0,
    resource: 'Analyst',
    dependsOn: 'g-a4'
  },
  {
    id: 'g-a6',
    parentId: 'g-analysis',
    type: 'task',
    subject: 'Develop delivery timeline',
    startDate: '3/8/2019',
    startDayOffset: 19.8,
    durationDays: 1.0,
    progress: 0,
    resource: 'Project Manager',
    dependsOn: 'g-a5'
  },
  {
    id: 'g-a7',
    parentId: 'g-analysis',
    type: 'task',
    subject: 'Obtain approvals to proceed (concep...',
    startDate: '3/9/2019',
    startDayOffset: 20.6,
    durationDays: 0.8,
    progress: 0,
    resource: 'Management',
    dependsOn: 'g-a6'
  }
];

const GANTT_WEEKS = [
  { label: 'Sun, 17 Feb - Sat, 23 Feb', days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] },
  { label: 'Sun, 24 Feb - Sat, 2 Mar', days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] },
  { label: 'Sun, 3 Mar - Sat, 9 Mar', days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] }
];

export class CortexGanttChart extends CortexElement {
  constructor() {
    super();
    this._search = '';
    this._selectedId = 'g-s2';
    this._dayWidth = 26;
    this._history = [];
    this._redoStack = [];
    this._tasks = INITIAL_GANTT_TASKS.map((t) => ({ ...t }));
  }

  _ensureState() {
    if (!this._tasks) {
      this._search = '';
      this._selectedId = 'g-s2';
      this._dayWidth = 26;
      this._history = [];
      this._redoStack = [];
      this._tasks = INITIAL_GANTT_TASKS.map((t) => ({ ...t }));
    }
  }

  _saveHistory() {
    this._history.push(JSON.stringify(this._tasks));
    if (this._history.length > 30) this._history.shift();
    this._redoStack = [];
  }

  _undo() {
    if (this._history.length === 0) {
      CortexModal.toast('Nenhuma ação para desfazer.', 'info', 1500);
      return;
    }
    this._redoStack.push(JSON.stringify(this._tasks));
    this._tasks = JSON.parse(this._history.pop());
    this.render();
    CortexModal.toast(t('gantt.undoSuccess'), 'info', 1500);
  }

  _redo() {
    if (this._redoStack.length === 0) {
      CortexModal.toast('Nenhuma ação para refazer.', 'info', 1500);
      return;
    }
    this._history.push(JSON.stringify(this._tasks));
    this._tasks = JSON.parse(this._redoStack.pop());
    this.render();
    CortexModal.toast(t('gantt.redoSuccess'), 'info', 1500);
  }

  _getVisibleTasks() {
    const q = this._search.trim().toLowerCase();
    const byId = new Map(this._tasks.map((t) => [t.id, t]));

    const isTaskVisible = (t) => {
      if (q) {
        return (
          t.subject.toLowerCase().includes(q) ||
          (t.resource && t.resource.toLowerCase().includes(q))
        );
      }
      let curr = t.parentId ? byId.get(t.parentId) : null;
      while (curr) {
        if (curr.expanded === false) return false;
        curr = curr.parentId ? byId.get(curr.parentId) : null;
      }
      return true;
    };

    return this._tasks.filter(isTaskVisible);
  }

  async _openTaskModal(task = null) {
    this._saveHistory();
    const isNew = !task;

    const res = await CortexModal.form({
      title: isNew ? t('common.create') : `${t('gantt.editTask')} — ${task.subject}`,
      confirmText: isNew ? t('common.create') : t('common.saveChanges'),
      cancelText: t('common.cancel'),
      deleteText: isNew ? null : t('common.delete'),
      fields: [
        { name: 'subject', label: t('gantt.task'), type: 'text', defaultValue: task ? task.subject : 'Nova Atividade' },
        { name: 'startDate', label: t('gantt.start'), type: 'date', defaultValue: task ? task.startDate : '2/21/2019' },
        { name: 'durationDays', label: `${t('gantt.duration')} (${t('gantt.days')})`, type: 'number', defaultValue: task ? String(task.durationDays) : '2' },
        { name: 'progress', label: `${t('gantt.progress')} (%)`, type: 'number', defaultValue: task ? String(task.progress) : '0' },
        {
          name: 'resource',
          label: t('scheduler.resource'),
          type: 'select',
          defaultValue: task ? task.resource : 'Project Manager',
          options: [
            { value: '', label: '(Nenhum)' },
            { value: 'Management', label: 'Management' },
            { value: 'Project Manager', label: 'Project Manager' },
            { value: 'Analyst', label: 'Analyst' }
          ]
        }
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
        const nextId = `g-task-${Date.now()}`;
        this._tasks.push({
          id: nextId,
          parentId: 'g-analysis',
          type: 'task',
          subject: res.subject || 'Nova Tarefa',
          startDate: res.startDate || '2/25/2019',
          startDayOffset: 8.5,
          durationDays: Math.max(0.5, Number(res.durationDays) || 1),
          progress: Math.min(100, Math.max(0, Number(res.progress) || 0)),
          resource: res.resource || ''
        });
        this.render();
        CortexModal.toast(`Tarefa "${res.subject}" criada!`, 'success', 2000);
      } else {
        task.subject = res.subject || task.subject;
        task.startDate = res.startDate || task.startDate;
        task.durationDays = Math.max(0, Number(res.durationDays) || task.durationDays);
        task.progress = Math.min(100, Math.max(0, Number(res.progress) || 0));
        task.resource = res.resource || '';
        this.render();
        CortexModal.toast(`Tarefa "${task.subject}" atualizada!`, 'success', 2000);
      }
    }
  }

  onRender() {
    // Toolbar buttons
    this.shadowRoot.querySelector('#gantt-undo')?.addEventListener('click', () => this._undo());
    this.shadowRoot.querySelector('#gantt-redo')?.addEventListener('click', () => this._redo());
    this.shadowRoot.querySelector('#gantt-add')?.addEventListener('click', () => this._openTaskModal(null));

    this.shadowRoot.querySelector('#gantt-zoom-in')?.addEventListener('click', () => {
      this._dayWidth = Math.min(50, this._dayWidth + 4);
      this.render();
    });

    this.shadowRoot.querySelector('#gantt-zoom-out')?.addEventListener('click', () => {
      this._dayWidth = Math.max(16, this._dayWidth - 4);
      this.render();
    });

    // Search input
    const searchEl = this.shadowRoot.querySelector('#gantt-search');
    searchEl?.addEventListener('input', (e) => {
      this._search = e.target.value;
      this.render();
      const input = this.shadowRoot.querySelector('#gantt-search');
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });

    // Expand / Collapse toggles
    this.shadowRoot.querySelectorAll('[data-toggle-expand]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-toggle-expand');
        const task = this._tasks.find((t) => t.id === id);
        if (task) {
          task.expanded = !task.expanded;
          this.render();
        }
      });
    });

    // Row selection and edit
    this.shadowRoot.querySelectorAll('[data-gantt-row]').forEach((row) => {
      row.addEventListener('click', () => {
        this._selectedId = row.getAttribute('data-gantt-row');
        this.render();
      });
      row.addEventListener('dblclick', () => {
        const id = row.getAttribute('data-gantt-row');
        const task = this._tasks.find((t) => t.id === id);
        if (task) this._openTaskModal(task);
      });
    });

    // Click bar to edit
    this.shadowRoot.querySelectorAll('[data-gantt-bar-id]').forEach((bar) => {
      bar.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = bar.getAttribute('data-gantt-bar-id');
        const task = this._tasks.find((t) => t.id === id);
        if (task) this._openTaskModal(task);
      });
    });
  }

  render() {
    this._ensureState();

    const visibleTasks = this._getVisibleTasks();
    const totalDays = 21;
    const timelineWidth = totalDays * this._dayWidth;
    const rowHeight = 34;

    // Conectores SVG de dependência entre tarefas
    const svgConnections = [];
    visibleTasks.forEach((task, taskIdx) => {
      if (task.dependsOn) {
        const predIdx = visibleTasks.findIndex((t) => t.id === task.dependsOn);
        if (predIdx !== -1) {
          const predTask = visibleTasks[predIdx];
          const fromX = Math.round((predTask.startDayOffset + (predTask.durationDays || 0)) * this._dayWidth);
          const fromY = predIdx * rowHeight + rowHeight / 2;
          const toX = Math.round(task.startDayOffset * this._dayWidth);
          const toY = taskIdx * rowHeight + rowHeight / 2;
          const midX = fromX + Math.max(8, (toX - fromX) / 2);

          svgConnections.push(`
            <path
              d="M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}"
              fill="none"
              stroke="#60a5fa"
              stroke-width="1.8"
              marker-end="url(#gantt-arrow)"
              opacity="0.8"
            />
          `);
        }
      }
    });

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          width: 100%;
          font-family: var(--font-sans);
          color: var(--text-primary);
          --border-color: var(--border-input, #3c3c42);
        }

        .gantt-shell {
          background: var(--bg-panel);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        /* Toolbar Superior (Fiel à Imagem 5) */
        .gantt-toolbar {
          height: 44px;
          background: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          gap: 10px;
        }

        .gantt-actions-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .gantt-btn {
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: 4px;
          color: var(--text-secondary);
          height: 28px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.15s, color 0.15s;
        }
        .gantt-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .gantt-btn.primary {
          background: #2563eb;
          border-color: #2563eb;
          color: #ffffff;
          font-weight: 600;
        }
        .gantt-btn.primary:hover {
          background: #1d4ed8;
        }

        .gantt-separator {
          width: 1px;
          height: 18px;
          background: var(--border-color);
          margin: 0 4px;
        }

        /* Split WBS + Timeline */
        .gantt-split {
          display: grid;
          grid-template-columns: 350px 1fr;
          overflow-x: auto;
        }

        .wbs-pane {
          border-right: 2px solid var(--border-color);
          background: var(--bg-panel);
        }

        .wbs-header {
          height: 50px;
          display: grid;
          grid-template-columns: 1fr 92px;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-panel-header);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .wbs-header-cell {
          padding: 0 12px;
        }

        .wbs-row {
          height: ${rowHeight}px;
          display: grid;
          grid-template-columns: 1fr 92px;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
          cursor: pointer;
          transition: background 0.1s;
        }
        .wbs-row:hover {
          background: var(--bg-hover);
        }
        .wbs-row.selected {
          background: rgba(37, 99, 235, 0.18);
        }

        .wbs-title-cell {
          padding-right: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .wbs-expander {
          width: 14px;
          height: 14px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .wbs-icon {
          font-size: 13px;
        }

        .wbs-date-cell {
          padding: 0 8px;
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Right Timeline Pane */
        .timeline-pane {
          overflow-x: auto;
          background: var(--bg-panel);
          position: relative;
        }

        .timeline-inner {
          min-width: ${timelineWidth}px;
          position: relative;
        }

        .tl-header {
          height: 50px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-panel-header);
          display: flex;
          flex-direction: column;
        }

        .tl-weeks-row {
          height: 25px;
          display: flex;
          border-bottom: 1px solid var(--border-color);
        }

        .tl-week-cell {
          width: ${7 * this._dayWidth}px;
          padding: 0 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          border-right: 1px solid var(--border-color);
          box-sizing: border-box;
        }

        .tl-days-row {
          height: 24px;
          display: flex;
        }

        .tl-day-cell {
          width: ${this._dayWidth}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10.5px;
          color: var(--text-muted);
          border-right: 1px solid var(--border-color);
          box-sizing: border-box;
        }

        /* SVG Connectors Layer */
        .gantt-svg-layer {
          position: absolute;
          top: 50px;
          left: 0;
          width: ${timelineWidth}px;
          height: ${visibleTasks.length * rowHeight}px;
          pointer-events: none;
          z-index: 2;
        }

        .tl-row {
          height: ${rowHeight}px;
          border-bottom: 1px solid var(--border-color);
          position: relative;
          background-size: ${this._dayWidth}px 100%;
          background-image: linear-gradient(to right, transparent ${this._dayWidth - 1}px, var(--border-color) ${this._dayWidth - 1}px);
        }

        .tl-row.selected {
          background-color: rgba(37, 99, 235, 0.08);
        }

        /* Barras de Gantt */
        .gantt-bar-project {
          position: absolute;
          height: 8px;
          top: 13px;
          background: #475569;
          border-radius: 2px;
          cursor: pointer;
          z-index: 3;
        }

        .gantt-bar-phase {
          position: absolute;
          height: 10px;
          top: 12px;
          background: #3b82f6;
          border-radius: 2px;
          cursor: pointer;
          z-index: 3;
        }

        .gantt-bar-task {
          position: absolute;
          height: 16px;
          top: 9px;
          background: #3b82f6;
          border-radius: 3px;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          z-index: 3;
        }

        .gantt-progress-fill {
          height: 100%;
          background: #1d4ed8;
        }

        .gantt-milestone {
          position: absolute;
          width: 14px;
          height: 14px;
          top: 10px;
          background: #ef4444;
          transform: rotate(45deg);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          z-index: 3;
        }

        .gantt-resource-tag {
          position: absolute;
          font-size: 10.5px;
          color: var(--text-secondary);
          white-space: nowrap;
          top: 9px;
          margin-left: 8px;
          pointer-events: none;
        }
      </style>

      <div class="gantt-shell">
        <!-- Toolbar Superior (Fiel à Imagem 5) -->
        <div class="gantt-toolbar">
          <div class="gantt-actions-left">
            <button class="gantt-btn primary" id="gantt-add">&#10010; ${t('common.add')}</button>
            <button class="gantt-btn" id="gantt-undo" title="${t('common.undo')}">&#8630;</button>
            <button class="gantt-btn" id="gantt-redo" title="${t('common.redo')}">&#8631;</button>

            <div class="gantt-separator"></div>

            <button class="gantt-btn" id="gantt-zoom-in" title="Zoom In">&#43;</button>
            <button class="gantt-btn" id="gantt-zoom-out" title="Zoom Out">&#8722;</button>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <input
              id="gantt-search"
              type="text"
              placeholder="${t('common.search')}..."
              value="${this._search}"
              style="background:var(--bg-input); border:1px solid var(--border-input); border-radius:4px; color:var(--text-primary); font-size:12px; height:28px; padding:0 8px; outline:none;"
            />
          </div>
        </div>

        <!-- Split Grid (WBS esquerda + Timeline direita com Conectores SVG) -->
        <div class="gantt-split">
          <!-- WBS Tree Table -->
          <div class="wbs-pane">
            <div class="wbs-header">
              <div class="wbs-header-cell">${t('gantt.task')}</div>
              <div class="wbs-header-cell">${t('gantt.start')}</div>
            </div>

            ${visibleTasks
              .map((t) => {
                const indent = t.parentId === 'g-root' ? 16 : t.parentId ? 32 : 4;
                const isSelected = this._selectedId === t.id;
                const hasChildren = t.type === 'project' || t.type === 'phase';
                const icon = t.type === 'project' ? '&#128193;' : t.type === 'phase' ? '&#128194;' : t.type === 'milestone' ? '&#9670;' : '&#9632;';

                return `
                  <div class="wbs-row ${isSelected ? 'selected' : ''}" data-gantt-row="${t.id}" title="${t.subject}">
                    <div class="wbs-title-cell" style="padding-left: ${indent}px;">
                      ${
                        hasChildren
                          ? `<button class="wbs-expander" data-toggle-expand="${t.id}">${t.expanded ? '&#9660;' : '&#9654;'}</button>`
                          : '<span style="width:14px;"></span>'
                      }
                      <span class="wbs-icon">${icon}</span>
                      <span style="font-weight:${hasChildren ? '600' : '400'};">${t.subject}</span>
                    </div>
                    <div class="wbs-date-cell">${t.startDate}</div>
                  </div>
                `;
              })
              .join('')}
          </div>

          <!-- Timeline com Conectores SVG -->
          <div class="timeline-pane">
            <div class="timeline-inner">
              <div class="tl-header">
                <div class="tl-weeks-row">
                  ${GANTT_WEEKS.map((w) => `<div class="tl-week-cell">${w.label}</div>`).join('')}
                </div>
                <div class="tl-days-row">
                  ${GANTT_WEEKS.map((w) => w.days.map((d) => `<div class="tl-day-cell">${d}</div>`).join('')).join('')}
                </div>
              </div>

              <!-- Camada de Conectores SVG Reais com pontas de seta -->
              <svg class="gantt-svg-layer">
                <defs>
                  <marker id="gantt-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#60a5fa" />
                  </marker>
                </defs>
                ${svgConnections.join('')}
              </svg>

              <!-- Linhas de Barras de Gantt -->
              ${visibleTasks
                .map((t) => {
                  const leftPx = Math.round(t.startDayOffset * this._dayWidth);
                  const widthPx = Math.max(14, Math.round(t.durationDays * this._dayWidth));

                  let barHtml = '';
                  if (t.type === 'project') {
                    barHtml = `<div class="gantt-bar-project" data-gantt-bar-id="${t.id}" style="left:${leftPx}px; width:${widthPx}px;" title="${t.subject} (${t.progress}%)"></div>`;
                  } else if (t.type === 'phase') {
                    barHtml = `<div class="gantt-bar-phase" data-gantt-bar-id="${t.id}" style="left:${leftPx}px; width:${widthPx}px;" title="${t.subject} (${t.progress}%)"></div>`;
                  } else if (t.type === 'milestone') {
                    barHtml = `<div class="gantt-milestone" data-gantt-bar-id="${t.id}" style="left:${leftPx}px;" title="${t.subject} (Milestone)"></div>`;
                  } else {
                    barHtml = `
                      <div class="gantt-bar-task" data-gantt-bar-id="${t.id}" style="left:${leftPx}px; width:${widthPx}px;" title="${t.subject} (${t.progress}%)">
                        <div class="gantt-progress-fill" style="width:${t.progress}%;"></div>
                      </div>
                      ${t.resource ? `<span class="gantt-resource-tag" style="left:${leftPx + widthPx}px;">${t.resource}</span>` : ''}
                    `;
                  }

                  return `
                    <div class="tl-row ${this._selectedId === t.id ? 'selected' : ''}">
                      ${barHtml}
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.onRender();
  }
}

customElements.define('cortex-kanban-board', CortexKanbanBoard);
customElements.define('cortex-gantt-chart', CortexGanttChart);
