// src/components/cortex-tabbar.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';
import { t } from '../core/i18n.js';

export class CortexTabbar extends CortexElement {
  onLanguageChange() {
    this.render();
  }

  onMount() {
    this.watchState(['openTabs', 'activeTabId'], () => {
      this.render();
    });
  }

  render() {
    const tabs = AppState.get('openTabs') || [];
    const activeId = AppState.get('activeTabId');

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: flex;
          align-items: flex-end;
          height: var(--tabbar-height);
          background-color: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          padding: 0 var(--space-1);
          overflow-x: auto;
          scrollbar-width: none;
        }
        :host::-webkit-scrollbar {
          display: none;
        }

        .tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: calc(var(--tabbar-height) - 3px);
          padding: 0 10px;
          background-color: var(--bg-panel);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
          border-bottom: none;
          border-radius: 3px 3px 0 0;
          font-size: var(--text-xs);
          margin-right: 2px;
          cursor: pointer;
          transition: background var(--transition-fast), color var(--transition-fast);
        }

        .tab:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .tab.active {
          background-color: var(--bg-tab-active, var(--bg-workspace));
          color: var(--text-primary);
          border-top: 2px solid var(--accent-blue);
          font-weight: 500;
        }

        .close-tab {
          width: 14px;
          height: 14px;
          border-radius: 2px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 11px;
          line-height: 1;
        }

        .close-tab:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .new-tab-btn {
          width: 22px;
          height: 22px;
          margin-bottom: 2px;
          border-radius: var(--radius-xs);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .new-tab-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }
      </style>

      ${tabs
        .map(
          (tab) => `
        <div class="tab ${tab.id === activeId ? 'active' : ''}" data-tab-id="${tab.id}" role="tab" aria-selected="${tab.id === activeId}">
          <span>${tab.dirty ? '*' : ''}${tab.title}</span>
          <button class="close-tab" data-close-id="${tab.id}" title="${t('common.close')}" aria-label="${t('common.close')}">&times;</button>
        </div>
      `
        )
        .join('')}

      <button class="new-tab-btn" title="${t('menu.newDoc')} (Ctrl+N)" aria-label="${t('menu.newDoc')}">+</button>
    `;

    this.shadowRoot.querySelectorAll('.tab').forEach((tabEl) => {
      tabEl.addEventListener('click', (e) => {
        if (e.target.closest('.close-tab')) return;
        const id = tabEl.dataset.tabId;
        AppState.setState({ activeTabId: id });
        this.emit('cortex-tab-change', { tabId: id });
      });
    });

    this.shadowRoot.querySelectorAll('.close-tab').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.closeId;
        const currentTabs = AppState.get('openTabs');
        if (currentTabs.length <= 1) return;
        const nextTabs = currentTabs.filter((t) => t.id !== id);
        const nextActive =
          AppState.get('activeTabId') === id
            ? nextTabs[nextTabs.length - 1].id
            : AppState.get('activeTabId');
        AppState.setState({ openTabs: nextTabs, activeTabId: nextActive });
      });
    });

    this.shadowRoot.querySelector('.new-tab-btn').addEventListener('click', () => {
      const currentTabs = [...AppState.get('openTabs')];
      const nextNum = currentTabs.length + 1;
      const newTab = { id: `doc-${Date.now()}`, title: `Untitled-${nextNum}`, dirty: true };
      currentTabs.push(newTab);
      AppState.setState({ openTabs: currentTabs, activeTabId: newTab.id });
    });
  }
}

customElements.define('cortex-tabbar', CortexTabbar);
