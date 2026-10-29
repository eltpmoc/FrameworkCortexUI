// src/components/cortex-enterprise-views.js
import { CortexElement } from '../core/CortexElement.js';
import { CortexModal } from './cortex-modal.js';

/**
 * Retorna o caminho da foto IA da pessoa (img/docs/pessoa1.jpg ... pessoa12.jpg)
 * Compatível tanto com servidor web HTTP (localhost:3000/, /docs, /docs.html)
 * quanto com abertura direta via arquivo local (file://).
 */
function getPersonPhoto(index) {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.protocol === 'file:') {
      const p = (window.location.pathname || '').replace(/\\/g, '/');
      if (p.includes('/docs/')) {
        return `../img/docs/pessoa${index}.jpg`;
      }
      return `./img/docs/pessoa${index}.jpg`;
    }
    // Em servidor HTTP/HTTPS local ou produção, a rota absoluta /img/docs/pessoaX.jpg
    // carrega perfeitamente a partir de qualquer nível de rota.
    return `/img/docs/pessoa${index}.jpg`;
  }
  return `./img/docs/pessoa${index}.jpg`;
}

/**
 * Gera um retrato SVG executivo de fallback
 */
function buildExecutivePortraitSVG({ bg = '#f8fafc', suit = '#1e293b', shirt = '#ffffff', tie = '#1d4ed8', skin = '#eab696', hair = '#27272a', female = false }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 170" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
    </defs>
    <rect width="220" height="170" fill="url(#bgGrad)"/>
    <!-- Ombros / Terno -->
    <path d="M40 170 C44 126, 74 114, 110 114 C146 114, 176 126, 180 170 Z" fill="${suit}"/>
    <!-- Camisa -->
    <polygon points="92,114 110,158 128,114" fill="${shirt}"/>
    ${!female ? `<polygon points="106,120 114,120 116,162 110,168 104,162" fill="${tie}"/>` : ''}
    <!-- Pescoço -->
    <rect x="97" y="92" width="26" height="26" rx="8" fill="${skin}"/>
    ${female ? `<path d="M74 64 C70 105, 76 132, 88 138 C86 110, 86 80, 110 76 C134 80, 134 110, 132 138 C144 132, 150 105, 146 64 Z" fill="${hair}"/>` : ''}
    <!-- Rosto -->
    <ellipse cx="110" cy="68" rx="26" ry="32" fill="${skin}"/>
    <!-- Cabelo -->
    ${
      female
        ? `<path d="M82 62 C82 34, 138 34, 138 62 C132 46, 94 44, 82 62 Z" fill="${hair}"/>`
        : `<path d="M84 60 C84 32, 136 32, 136 60 C132 45, 90 45, 84 60 Z" fill="${hair}"/>`
    }
    <!-- Olhos e Sorriso -->
    <circle cx="100" cy="66" r="2.6" fill="#1e293b"/>
    <circle cx="120" cy="66" r="2.6" fill="#1e293b"/>
    <path d="M95 58 Q100 55 105 58" stroke="${hair}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M115 58 Q120 55 125 58" stroke="${hair}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M101 81 Q110 89 119 81" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M100 81 Q110 90 120 81" stroke="#b45309" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const CONTACTS_DATASET = [
  {
    id: 'c-1',
    photoIndex: 1,
    fullName: 'John Heart',
    firstName: 'John',
    lastName: 'Heart',
    position: 'CEO',
    company: 'Braeburn',
    status: 'Qualified',
    hrStatus: 'Salaried',
    assignedTo: 'Brett Johnson',
    phone: '+1(213)555-4276',
    email: 'jheart@dx-email.com',
    address: '645 Prospect Crescent',
    city: 'Pasadena',
    state: 'CA',
    zip: '91103',
    checked: true,
    opportunities: [
      { title: 'Enterprise Audio Upgrade Contract', amount: '$50,000' },
      { title: 'Annual Executive Licensing', amount: '$14,200' }
    ],
    avatar: getPersonPhoto(1)
  },
  {
    id: 'c-2',
    photoIndex: 2,
    fullName: 'Ed Holmes',
    firstName: 'Ed',
    lastName: 'Holmes',
    position: 'Sales Manager',
    company: 'Braeburn',
    status: 'Unqualified',
    hrStatus: 'Salaried',
    assignedTo: 'Harv Mudd',
    phone: '+1(805)555-3627',
    email: 'edwardh@dx-email.com',
    address: '1280 Ocean View Blvd',
    city: 'Malibu',
    state: 'CA',
    zip: '90265',
    checked: true,
    opportunities: [
      { title: 'Regional Retail Expansion', amount: '$8,450' }
    ],
    avatar: getPersonPhoto(2)
  },
  {
    id: 'c-3',
    photoIndex: 3,
    fullName: 'Arthur Miller',
    firstName: 'Arthur',
    lastName: 'Miller',
    position: 'CTO',
    company: 'Braeburn',
    status: 'Qualified',
    hrStatus: 'Salaried',
    assignedTo: 'Todd Hoffman',
    phone: '+1(818)555-7857',
    email: 'arthurm@dx-email.com',
    address: '890 Innovation Way',
    city: 'Burbank',
    state: 'CA',
    zip: '91502',
    checked: true,
    opportunities: [
      { title: 'Cloud Server Cluster Migration', amount: '$32,800' },
      { title: 'DevSecOps Tooling Renewal', amount: '$9,100' }
    ],
    avatar: getPersonPhoto(3)
  },
  {
    id: 'c-4',
    photoIndex: 4,
    fullName: 'Robert Reagan',
    firstName: 'Robert',
    lastName: 'Reagan',
    position: 'CMO',
    company: 'Braeburn',
    status: 'Qualified',
    hrStatus: 'Salaried',
    assignedTo: 'Todd Hoffman',
    phone: '+1(909)555-6939',
    email: 'robertr@dx-email.com',
    address: '410 Sunset Plaza',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90046',
    checked: true,
    opportunities: [
      { title: 'Global Brand Campaign Suite', amount: '$19,500' }
    ],
    avatar: getPersonPhoto(4)
  },
  {
    id: 'c-5',
    photoIndex: 5,
    fullName: 'Amelia Harper',
    firstName: 'Amelia',
    lastName: 'Harper',
    position: 'Network Admin',
    company: 'ACME',
    status: 'Qualified',
    hrStatus: 'Salaried',
    assignedTo: 'John Heart',
    phone: '+1(213)555-4276',
    email: 'ameliah@dx-email.com',
    address: '527 W 7th St',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90014',
    checked: true,
    opportunities: [
      { title: 'Incoming Request for Conference Room', amount: '$2,115' },
      { title: 'POS Touch Screens', amount: '$1,645' }
    ],
    avatar: getPersonPhoto(5)
  },
  {
    id: 'c-6',
    photoIndex: 6,
    fullName: 'Morgan Kennedy',
    firstName: 'Morgan',
    lastName: 'Kennedy',
    position: 'Sales Manager',
    company: 'Circuit Town',
    status: 'Unqualified',
    hrStatus: 'Salaried',
    assignedTo: 'Harv Mudd',
    phone: '+1(818)555-8238',
    email: 'morgank@dx-email.com',
    address: '302 Silicon Ave',
    city: 'San Jose',
    state: 'CA',
    zip: '95110',
    checked: false,
    opportunities: [{ title: 'Hardware Distribution Deal', amount: '$6,750' }],
    avatar: getPersonPhoto(6)
  },
  {
    id: 'c-7',
    photoIndex: 7,
    fullName: 'Brett Wade',
    firstName: 'Brett',
    lastName: 'Wade',
    position: 'IT Manager',
    company: 'ElectrixMax',
    status: 'Unqualified',
    hrStatus: 'Salaried',
    assignedTo: 'Brett Johnson',
    phone: '+1(562)555-9282',
    email: 'brettw@dx-email.com',
    address: '714 Harbor Blvd',
    city: 'Long Beach',
    state: 'CA',
    zip: '90802',
    checked: false,
    opportunities: [{ title: 'Data Center UPS Replacement', amount: '$11,400' }],
    avatar: getPersonPhoto(7)
  },
  {
    id: 'c-8',
    photoIndex: 8,
    fullName: 'Sandra Johnson',
    firstName: 'Sandra',
    lastName: 'Johnson',
    position: 'Controller',
    company: 'Electronics DPT',
    status: 'Lead',
    hrStatus: 'Salaried',
    assignedTo: 'Harv Mudd',
    phone: '+1(213)555-8357',
    email: 'sandraj@dx-email.com',
    address: '99 Financial District',
    city: 'San Francisco',
    state: 'CA',
    zip: '94111',
    checked: false,
    opportunities: [{ title: 'ERP Financial Audit Module', amount: '$15,900' }],
    avatar: getPersonPhoto(8)
  },
  {
    id: 'c-9',
    photoIndex: 9,
    fullName: 'Greta Sims',
    firstName: 'Greta',
    lastName: 'Sims',
    position: 'HR Manager',
    company: 'EZ Stop',
    status: 'Qualified',
    hrStatus: 'Salaried',
    assignedTo: 'Brett Johnson',
    phone: '+1(310)555-6625',
    email: 'gretas@dx-email.com',
    address: '450 Santa Monica Blvd',
    city: 'Santa Monica',
    state: 'CA',
    zip: '90401',
    checked: false,
    opportunities: [{ title: 'Workforce Portal Rollout', amount: '$7,300' }],
    avatar: getPersonPhoto(9)
  },
  {
    id: 'c-10',
    photoIndex: 10,
    fullName: 'Barb Banks',
    firstName: 'Barb',
    lastName: 'Banks',
    position: 'Support Manager',
    company: 'E-Mart',
    status: 'Qualified',
    hrStatus: 'Salaried',
    assignedTo: 'Brett Johnson',
    phone: '+1(310)555-5395',
    email: 'barbarab@dx-email.com',
    address: '220 Market St',
    city: 'San Diego',
    state: 'CA',
    zip: '92101',
    checked: false,
    opportunities: [{ title: '24/7 Helpdesk SLA Upgrade', amount: '$5,400' }],
    avatar: getPersonPhoto(10)
  },
  {
    id: 'c-11',
    photoIndex: 11,
    fullName: 'Gabe Jones',
    firstName: 'Gabe',
    lastName: 'Jones',
    position: 'Retail Coordinator',
    company: 'K&S Music',
    status: 'Lead',
    hrStatus: 'Terminated',
    assignedTo: 'Samantha Bright',
    phone: '+1(310)555-7277',
    email: 'gabrielj@dx-email.com',
    address: '88 Acoustic Lane',
    city: 'Hollywood',
    state: 'CA',
    zip: '90028',
    checked: false,
    opportunities: [{ title: 'Studio Monitors Supply', amount: '$3,980' }],
    avatar: getPersonPhoto(11)
  },
  {
    id: 'c-12',
    photoIndex: 12,
    fullName: 'Robin Cosworth',
    firstName: 'Robin',
    lastName: 'Cosworth',
    position: 'Shipping Assistant',
    company: 'Premier Buy',
    status: 'Lead',
    hrStatus: 'Salaried',
    assignedTo: 'Harv Mudd',
    phone: '+1(562)555-2082',
    email: 'robinc@dx-email.com',
    address: '19 Logistics Pkwy',
    city: 'Oakland',
    state: 'CA',
    zip: '94607',
    checked: false,
    opportunities: [{ title: 'Fleet Barcode Scanners', amount: '$4,250' }],
    avatar: getPersonPhoto(12)
  }
];

/* ============================================================================
   1. <cortex-card-view> — Card View Corporativo (Fiel à Imagem 1)
   ============================================================================ */
export class CortexCardView extends CortexElement {
  constructor() {
    super();
    this._items = CONTACTS_DATASET.map((c, idx) => ({ ...c, checked: idx === 0 }));
    this._sortField = 'company';
    this._sortAsc = true;
    this._statusFilter = 'all';
    this._page = 1;
    this._pageSize = 4;
  }

  _getStatusBadge(status) {
    const color =
      status === 'Qualified'
        ? '#16a34a'
        : status === 'Unqualified'
          ? '#dc2626'
          : '#2563eb';
    return `<span style="display:inline-flex; align-items:center; gap:6px; font-weight:600; color:${color};">
      <span style="width:8px; height:8px; border-radius:50%; background:${color}; display:inline-block;"></span>
      ${status}
    </span>`;
  }

  render() {
    const filterFields = [
      { key: 'status', label: 'Status' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'position', label: 'Position' },
      { key: 'company', label: 'Company' },
      { key: 'assignedTo', label: 'Assigned to' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' }
    ];

    const filtered = this._items
      .filter((item) => this._statusFilter === 'all' || item.status === this._statusFilter)
      .sort((a, b) => {
        const va = String(a[this._sortField] || '');
        const vb = String(b[this._sortField] || '');
        return this._sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });

    const totalPages = Math.max(1, Math.ceil(filtered.length / this._pageSize));
    if (this._page > totalPages) this._page = totalPages;
    const pagedItems = filtered.slice((this._page - 1) * this._pageSize, this._page * this._pageSize);

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host { display: block; }
        .cv-wrapper {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          padding: 16px;
          box-shadow: var(--btn-bevel-shadow);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        /* Barra de Filtros e Ordenação Superior (Fiel à Imagem 1) */
        .cv-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cv-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cv-pill {
          height: 30px;
          padding: 0 12px;
          border-radius: var(--radius-sm);
          background: var(--bg-elevated);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: var(--btn-bevel-shadow);
        }
        .cv-pill:hover {
          background: var(--bg-hover);
        }
        .cv-pill.active-sort {
          border-color: var(--accent-blue);
          background: var(--accent-blue-alpha);
          font-weight: 600;
        }
        .filter-icon {
          font-size: 10px;
          color: var(--text-muted);
        }

        /* Grid de 4 Cards (Fiel à Imagem 1) */
        .cv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));
          gap: 14px;
        }
        .person-card {
          background: var(--bg-app);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .person-card.checked {
          background: var(--accent-blue-alpha);
          border-color: var(--accent-blue);
        }
        .pcard-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .pcard-chk {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          border: 1.5px solid var(--border-strong, var(--text-secondary));
          background: var(--bg-input);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: transparent;
          cursor: pointer;
        }
        .person-card.checked .pcard-chk {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: var(--accent-text);
        }
        .pcard-actions {
          display: inline-flex;
          gap: 8px;
        }
        .icon-act {
          font-size: 13px;
          color: var(--text-secondary);
          padding: 2px 4px;
          border-radius: 3px;
        }
        .icon-act:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .pcard-photo {
          width: 100%;
          height: 165px;
          background: #ffffff;
          border-bottom: 1px solid var(--border-subtle);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pcard-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }
        .pcard-fields {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 11.5px;
          flex: 1;
        }
        .field-row {
          display: grid;
          grid-template-columns: 78px 1fr;
          align-items: center;
          gap: 6px;
        }
        .field-label {
          color: var(--text-secondary);
          font-weight: 600;
        }
        .field-val {
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .email-link {
          color: var(--accent-blue);
          text-decoration: underline;
          cursor: pointer;
        }
        .pcard-footer {
          padding: 0 12px 12px;
        }
        .send-mail-btn {
          width: 100%;
          height: 32px;
          border-radius: var(--radius-xs);
          background: var(--accent-blue);
          color: var(--accent-text);
          border: 1px solid var(--border-focus);
          box-shadow: var(--btn-bevel-shadow);
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .send-mail-btn:hover {
          filter: brightness(1.08);
        }

        /* Paginação Inferior Direita (Fiel à Imagem 1) */
        .cv-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .cv-page-btns {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .cv-pg-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: var(--text-primary);
        }
        .cv-pg-num:hover {
          background: var(--bg-hover);
        }
        .cv-pg-num.active {
          background: var(--accent-blue);
          color: var(--accent-text);
          font-weight: 700;
        }
      </style>

      <div class="cv-wrapper">
        <!-- Barra de Pílulas de Ordenação e Filtro -->
        <div class="cv-filter-bar">
          <div class="cv-pills">
            ${filterFields
              .map(
                (f) => `
              <button class="cv-pill ${this._sortField === f.key ? 'active-sort' : ''}" data-sort-col="${f.key}">
                <span>${f.label}</span>
                ${this._sortField === f.key ? `<span>${this._sortAsc ? '&uarr;' : '&darr;'}</span>` : ''}
                <span class="filter-icon">&#9776;</span>
              </button>
            `
              )
              .join('')}
          </div>

          <select class="cv-pill" id="cv-status-filter" title="Filtrar por Status">
            <option value="all" ${this._statusFilter === 'all' ? 'selected' : ''}>Status: Todos (${this._items.length})</option>
            <option value="Qualified" ${this._statusFilter === 'Qualified' ? 'selected' : ''}>● Qualified</option>
            <option value="Unqualified" ${this._statusFilter === 'Unqualified' ? 'selected' : ''}>● Unqualified</option>
            <option value="Lead" ${this._statusFilter === 'Lead' ? 'selected' : ''}>● Lead</option>
          </select>
        </div>

        <!-- Grade de 4 Cards -->
        <div class="cv-grid">
          ${pagedItems
            .map(
              (person) => `
            <article class="person-card ${person.checked ? 'checked' : ''}" data-card-id="${person.id}">
              <div class="pcard-top">
                <span class="pcard-chk" data-toggle-chk="${person.id}">${person.checked ? '&#10003;' : ''}</span>
                <div class="pcard-actions">
                  <button class="icon-act" data-edit-card="${person.id}" title="Editar Contato">&#9998;</button>
                  <button class="icon-act" data-del-card="${person.id}" title="Excluir Contato">&#128465;</button>
                </div>
              </div>

              <div class="pcard-photo">
                <img src="${person.avatar}" alt="${person.fullName}" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback='1'; this.src='img/docs/pessoa${person.photoIndex || 1}.jpg';}" />
              </div>

              <div class="pcard-fields">
                <div class="field-row">
                  <span class="field-label">Status:</span>
                  <span class="field-val">${this._getStatusBadge(person.status)}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Full Name:</span>
                  <span class="field-val"><strong>${person.fullName}</strong></span>
                </div>
                <div class="field-row">
                  <span class="field-label">Position:</span>
                  <span class="field-val">${person.position}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Company:</span>
                  <span class="field-val">${person.company}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Assigned to:</span>
                  <span class="field-val">${person.assignedTo}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Phone:</span>
                  <span class="field-val">${person.phone}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Email:</span>
                  <span class="field-val"><a class="email-link" data-mail="${person.email}">${person.email}</a></span>
                </div>
              </div>

              <div class="pcard-footer">
                <button class="send-mail-btn" data-mail="${person.email}">
                  <span>&#9993;</span>
                  <span>Send Email</span>
                </button>
              </div>
            </article>
          `
            )
            .join('')}
        </div>

        <!-- Rodapé de Paginação -->
        <div class="cv-pagination">
          <span>Page ${this._page} of ${totalPages} (${filtered.length} items)</span>
          <div class="cv-page-btns">
            <button class="cv-pg-num" data-cv-page="${Math.max(1, this._page - 1)}">&lsaquo;</button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1)
              .map(
                (p) => `
              <button class="cv-pg-num ${p === this._page ? 'active' : ''}" data-cv-page="${p}">${p}</button>
            `
              )
              .join('')}
            <button class="cv-pg-num" data-cv-page="${Math.min(totalPages, this._page + 1)}">&rsaquo;</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('[data-sort-col]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const col = btn.dataset.sortCol;
        if (this._sortField === col) {
          this._sortAsc = !this._sortAsc;
        } else {
          this._sortField = col;
          this._sortAsc = true;
        }
        this.render();
      });
    });

    this.shadowRoot.querySelector('#cv-status-filter')?.addEventListener('change', (e) => {
      this._statusFilter = e.target.value;
      this._page = 1;
      this.render();
    });

    this.shadowRoot.querySelectorAll('[data-toggle-chk]').forEach((chk) => {
      chk.addEventListener('click', () => {
        const item = this._items.find((i) => i.id === chk.dataset.toggleChk);
        if (item) {
          item.checked = !item.checked;
          this.render();
        }
      });
    });

    this.shadowRoot.querySelectorAll('[data-cv-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._page = Number(btn.dataset.cvPage);
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-mail]').forEach((el) => {
      el.addEventListener('click', () => {
        CortexModal.toast(`Redigindo e-mail para ${el.dataset.mail}...`, 'info');
      });
    });

    this.shadowRoot.querySelectorAll('[data-edit-card]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const target = this._items.find((i) => i.id === btn.dataset.editCard);
        if (!target) return;
        const nextName = await CortexModal.prompt({
          title: 'Editar Contato (Card View)',
          message: `Atualizar nome de ${target.fullName}:`,
          defaultValue: target.fullName
        });
        if (nextName) {
          target.fullName = nextName;
          this.render();
          CortexModal.toast('Card atualizado com sucesso!', 'success');
        }
      });
    });

    this.shadowRoot.querySelectorAll('[data-del-card]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const target = this._items.find((i) => i.id === btn.dataset.delCard);
        if (!target) return;
        const ok = await CortexModal.confirm({
          title: 'Remover Card',
          message: `Deseja remover "${target.fullName}" da visualização?`,
          danger: true
        });
        if (ok) {
          this._items = this._items.filter((i) => i.id !== target.id);
          this.render();
          CortexModal.toast('Contato removido', 'info');
        }
      });
    });
  }
}

/* ============================================================================
   2. <cortex-list-view> — List View Tabular Multi-Seleção (Fiel à Imagem 2)
   ============================================================================ */
export class CortexListView extends CortexElement {
  constructor() {
    super();
    this._items = CONTACTS_DATASET.map((c, idx) => ({ ...c, checked: idx < 5 }));
    this._sortCol = 'company';
    this._sortAsc = true;
  }

  _renderStatus(status) {
    const color =
      status === 'Qualified'
        ? '#16a34a'
        : status === 'Unqualified'
          ? '#dc2626'
          : '#2563eb';
    return `<span style="display:inline-flex; align-items:center; gap:6px; font-weight:600; color:${color};">
      <span style="width:8px; height:8px; border-radius:50%; background:${color};"></span>
      ${status}
    </span>`;
  }

  render() {
    const sorted = [...this._items].sort((a, b) => {
      const va = String(a[this._sortCol] || '');
      const vb = String(b[this._sortCol] || '');
      return this._sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

    const checkedCount = this._items.filter((i) => i.checked).length;
    const allChecked = checkedCount === this._items.length && this._items.length > 0;
    const indeterminate = checkedCount > 0 && checkedCount < this._items.length;

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host { display: block; }
        .lv-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--btn-bevel-shadow);
          overflow-x: auto;
        }
        .lv-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          text-align: left;
        }
        .lv-table th {
          padding: 11px 12px;
          background: var(--bg-panel-header);
          color: var(--text-primary);
          font-weight: 700;
          border-bottom: 1px solid var(--border-subtle);
          cursor: pointer;
          white-space: nowrap;
        }
        .lv-table th:hover {
          background: var(--bg-hover);
        }
        .lv-table td {
          padding: 9px 12px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-primary);
          vertical-align: middle;
        }
        .lv-table tr:hover td {
          background: var(--bg-hover);
        }
        .lv-table tr.checked-row td {
          background: var(--accent-blue-alpha);
        }
        .lv-chk {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          border: 1.5px solid var(--border-strong, var(--text-secondary));
          background: var(--bg-input);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: transparent;
          cursor: pointer;
        }
        .lv-chk.checked {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: var(--accent-text);
        }
        .lv-chk.indeterminate {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: var(--accent-text);
        }
        .name-stack {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .name-primary {
          font-weight: 600;
          color: var(--text-primary);
        }
        .name-sub {
          font-size: 10.5px;
          color: var(--text-muted);
        }
        .mail-link {
          color: var(--accent-blue);
          text-decoration: underline;
          cursor: pointer;
        }
      </style>

      <div class="lv-card">
        <table class="lv-table">
          <thead>
            <tr>
              <th style="width: 38px; text-align:center;" id="lv-master-chk">
                <span class="lv-chk ${allChecked ? 'checked' : indeterminate ? 'indeterminate' : ''}">
                  ${allChecked ? '&#10003;' : indeterminate ? '&#9632;' : ''}
                </span>
              </th>
              <th data-lv-sort="fullName">Full Name ${this._sortCol === 'fullName' ? (this._sortAsc ? '&uarr;' : '&darr;') : ''} <span style="opacity:0.5">&#9776;</span></th>
              <th data-lv-sort="company">Company ${this._sortCol === 'company' ? (this._sortAsc ? '&uarr;' : '&darr;') : ''} <span style="opacity:0.5">&#9776;</span></th>
              <th data-lv-sort="status">Status ${this._sortCol === 'status' ? (this._sortAsc ? '&uarr;' : '&darr;') : ''} <span style="opacity:0.5">&#9776;</span></th>
              <th data-lv-sort="assignedTo">Assigned to ${this._sortCol === 'assignedTo' ? (this._sortAsc ? '&uarr;' : '&darr;') : ''} <span style="opacity:0.5">&#9776;</span></th>
              <th data-lv-sort="phone">Phone <span style="opacity:0.5">&#9776;</span></th>
              <th data-lv-sort="email">Email <span style="opacity:0.5">&#9776;</span></th>
            </tr>
          </thead>
          <tbody>
            ${sorted
              .map(
                (row) => `
              <tr class="${row.checked ? 'checked-row' : ''}" data-lv-row="${row.id}">
                <td style="text-align:center;">
                  <span class="lv-chk ${row.checked ? 'checked' : ''}">${row.checked ? '&#10003;' : ''}</span>
                </td>
                <td>
                  <div class="name-stack">
                    <span class="name-primary">${row.fullName}</span>
                    <span class="name-sub">${row.position}</span>
                  </div>
                </td>
                <td>${row.company}</td>
                <td>${this._renderStatus(row.status)}</td>
                <td>${row.assignedTo}</td>
                <td style="font-family:var(--font-mono); font-size:11.5px;">${row.phone}</td>
                <td><span class="mail-link">${row.email}</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    this.shadowRoot.querySelector('#lv-master-chk')?.addEventListener('click', () => {
      const nextState = !allChecked;
      this._items.forEach((i) => {
        i.checked = nextState;
      });
      this.render();
    });

    this.shadowRoot.querySelectorAll('[data-lv-sort]').forEach((th) => {
      th.addEventListener('click', () => {
        const col = th.dataset.lvSort;
        if (this._sortCol === col) {
          this._sortAsc = !this._sortAsc;
        } else {
          this._sortCol = col;
          this._sortAsc = true;
        }
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-lv-row]').forEach((tr) => {
      tr.addEventListener('click', () => {
        const item = this._items.find((i) => i.id === tr.dataset.lvRow);
        if (item) {
          item.checked = !item.checked;
          this.render();
        }
      });
    });
  }
}

/* ============================================================================
   3. <cortex-datagrid-grouped> — jQuery Data Grid Agrupado (Fiel à Imagem 3)
   ============================================================================ */
const SALES_DATASET = [
  { id: 1, product: 'Eco Max', region: 'North America', amount: 9760, discount: 18, date: '1/5/2016', channel: 'Resellers', customer: 'Apollo Inc' },
  { id: 2, product: 'Eco Max', region: 'Europe', amount: 9830, discount: 14, date: '1/7/2016', channel: 'Consultants', customer: 'Arthur & Sons' },
  { id: 3, product: 'Eco Max', region: 'Asia', amount: 2360, discount: 11, date: '1/18/2016', channel: 'Direct', customer: 'Mercury Solar' },
  { id: 4, product: 'Eco Supreme', region: 'North America', amount: 1800, discount: 18, date: '1/1/2016', channel: 'Resellers', customer: 'Building M Inc' },
  { id: 5, product: 'Eco Supreme', region: 'Australia', amount: 3820, discount: 17, date: '1/2/2016', channel: 'VARs', customer: 'Get Solar Inc' },
  { id: 6, product: 'Eco Supreme', region: 'South America', amount: 1570, discount: 38, date: '1/3/2016', channel: 'Resellers', customer: 'Supply Warehous' },
  { id: 7, product: 'Eco Supreme', region: 'North America', amount: 3450, discount: 52, date: '1/5/2016', channel: 'Retail', customer: 'Johnson & Assoc' },
  { id: 8, product: 'Eco Supreme', region: 'North America', amount: 5730, discount: 25, date: '1/5/2016', channel: 'Retail', customer: 'Discovery Systems' },
  { id: 9, product: 'Eco Supreme', region: 'Asia', amount: 3360, discount: 60, date: '1/10/2016', channel: 'VARs', customer: 'Discovery Systems' },
  { id: 10, product: 'Eco Supreme', region: 'Europe', amount: 1450, discount: 52, date: '1/13/2016', channel: 'Retail', customer: 'Get Solar Inc' },
  { id: 11, product: 'Eco Supreme', region: 'Asia', amount: 5310, discount: 66, date: '1/15/2016', channel: 'Resellers', customer: 'Beacon Systems' },
  { id: 12, product: 'Eco Supreme', region: 'Australia', amount: 7620, discount: 34, date: '1/22/2016', channel: 'Resellers', customer: 'Beacon Systems' },
  { id: 13, product: 'Eco Supreme', region: 'North America', amount: 3560, discount: 42, date: '1/22/2016', channel: 'Retail', customer: 'Gemini Stores' },
  { id: 14, product: 'Eco Supreme', region: 'North America', amount: 1650, discount: 32, date: '1/24/2016', channel: 'VARs', customer: 'Discovery Systems' },
  { id: 15, product: 'Eco Supreme', region: 'South America', amount: 5550, discount: 42, date: '1/25/2016', channel: 'Retail', customer: 'Johnson & Assoc' }
];

export class CortexDataGridGrouped extends CortexElement {
  constructor() {
    super();
    this._search = '';
    this._groupBy = 'product';
    this._collapsedGroups = new Set();
    this._pageSize = 10;
    this._currentPage = 1;
  }

  render() {
    const q = this._search.trim().toLowerCase();
    const filtered = SALES_DATASET.filter(
      (r) =>
        !q ||
        r.product.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.channel.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q)
    );

    const groupsMap = new Map();
    filtered.forEach((row) => {
      const key = row[this._groupBy];
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key).push(row);
    });

    const groupLabel =
      this._groupBy === 'product' ? 'Product' : this._groupBy === 'region' ? 'Region' : 'Channel';

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host { display: block; }
        .jq-grid-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          padding: 14px;
          box-shadow: var(--btn-bevel-shadow);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .jq-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .group-chips {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .g-chip {
          height: 30px;
          padding: 0 12px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .g-chip.active {
          border-color: var(--accent-blue);
          background: var(--accent-blue-alpha);
          font-weight: 600;
        }
        .jq-search {
          height: 30px;
          width: 220px;
          padding: 0 10px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
          font-size: 12px;
        }
        .jq-table-wrap {
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          overflow-x: auto;
        }
        .jq-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .jq-table th {
          padding: 9px 12px;
          background: var(--bg-panel-header);
          color: var(--text-secondary);
          font-weight: 600;
          border-bottom: 1px solid var(--border-subtle);
          border-right: 1px solid var(--border-subtle);
          text-align: left;
        }
        .jq-table td {
          padding: 7px 12px;
          border-bottom: 1px solid var(--border-subtle);
          border-right: 1px solid var(--border-subtle);
          color: var(--text-primary);
        }
        .group-row td {
          background: var(--bg-elevated);
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px 12px;
        }
        .group-row:hover td {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .disc-bar-wrap {
          display: flex;
          align-items: center;
          height: 16px;
        }
        .disc-bar {
          height: 14px;
          background: #ea580c;
          border-radius: 1px;
          transition: width 0.2s ease;
        }
        .jq-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 4px;
        }
        .size-pills, .page-pills {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .p-pill {
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          border-radius: 3px;
          font-size: 12px;
          color: var(--text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .p-pill:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .p-pill.active {
          background: #ea580c;
          color: #ffffff;
          font-weight: 700;
        }
      </style>

      <div class="jq-grid-card">
        <div class="jq-top-bar">
          <div class="group-chips">
            <button class="g-chip ${this._groupBy === 'product' ? 'active' : ''}" data-grp="product">Product &uarr;</button>
            <button class="g-chip ${this._groupBy === 'region' ? 'active' : ''}" data-grp="region">Group: Region</button>
            <button class="g-chip ${this._groupBy === 'channel' ? 'active' : ''}" data-grp="channel">Group: Channel</button>
          </div>
          <input
            type="search"
            id="jq-search-input"
            class="jq-search"
            placeholder="&#128269; Search..."
            value="${this._search}"
          />
        </div>

        <div class="jq-table-wrap">
          <table class="jq-table">
            <thead>
              <tr>
                <th style="width: 28px;"></th>
                <th>Region</th>
                <th style="text-align:right;">Sale Amount</th>
                <th style="width: 140px; text-align:right;">Discount %</th>
                <th>Sale Date &uarr;</th>
                <th>Channel</th>
                <th>Customer</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from(groupsMap.entries())
                .map(([groupName, rows]) => {
                  const isCollapsed = this._collapsedGroups.has(groupName);
                  return `
                    <tr class="group-row" data-toggle-grp="${groupName}">
                      <td colspan="7">
                        <span style="display:inline-block; width:16px;">${isCollapsed ? '&#9656;' : '&#9662;'}</span>
                        ${groupLabel}: ${groupName} <span style="font-weight:400; opacity:0.75;">(${rows.length} items)</span>
                      </td>
                    </tr>
                    ${
                      isCollapsed
                        ? ''
                        : rows
                            .map(
                              (r) => `
                        <tr>
                          <td></td>
                          <td>${r.region}</td>
                          <td style="text-align:right; font-family:var(--font-mono);">$${r.amount.toLocaleString('en-US')}</td>
                          <td>
                            <div class="disc-bar-wrap" title="${r.discount}% Discount">
                              <div class="disc-bar" style="width: ${r.discount}%;"></div>
                            </div>
                          </td>
                          <td>${r.date}</td>
                          <td>${r.channel}</td>
                          <td>${r.customer}</td>
                        </tr>
                      `
                            )
                            .join('')
                    }
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="jq-footer">
          <div class="size-pills">
            ${[10, 25, 50, 100]
              .map(
                (sz) => `
              <button class="p-pill ${this._pageSize === sz ? 'active' : ''}" data-sz="${sz}">${sz}</button>
            `
              )
              .join('')}
          </div>
          <div class="page-pills">
            ${[1, 2, 3, 4, 5]
              .map(
                (p) => `
              <button class="p-pill ${this._currentPage === p ? 'active' : ''}" data-pg="${p}">${p}</button>
            `
              )
              .join('')}
            <span style="padding:0 4px; color:var(--text-muted);">...</span>
            <button class="p-pill ${this._currentPage === 36 ? 'active' : ''}" data-pg="36">36</button>
          </div>
        </div>
      </div>
    `;

    const sInput = this.shadowRoot.querySelector('#jq-search-input');
    sInput?.addEventListener('input', (e) => {
      const pos = e.target.selectionStart;
      this._search = e.target.value;
      this.render();
      const next = this.shadowRoot.querySelector('#jq-search-input');
      if (next) {
        next.focus();
        next.setSelectionRange(pos, pos);
      }
    });

    this.shadowRoot.querySelectorAll('[data-grp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._groupBy = btn.dataset.grp;
        this._collapsedGroups.clear();
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-toggle-grp]').forEach((tr) => {
      tr.addEventListener('click', () => {
        const g = tr.dataset.toggleGrp;
        if (this._collapsedGroups.has(g)) {
          this._collapsedGroups.delete(g);
        } else {
          this._collapsedGroups.add(g);
        }
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-sz]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._pageSize = Number(btn.dataset.sz);
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-pg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._currentPage = Number(btn.dataset.pg);
        this.render();
      });
    });
  }
}

/* ============================================================================
   3.1 <cortex-datagrid-detail> — jQuery Data Grid com Detalhes da Linha (Fiel ao Modelo)
   ============================================================================ */

const EMPLOYEES_GRID_DATASET = [
  {
    id: 'emp-1',
    firstName: 'Amelia',
    lastName: 'Harper',
    birthDate: '11/19/1983',
    hireDate: '2/10/2011',
    mobilePhone: '+1(213)555-4276',
    position: 'Network Admin',
    address: '1249 Pacific Ave, Venice, CA, 90291',
    email: 'ameliah@dx-email.com',
    photoIndex: 1,
    evaluations: [
      { date: '11/15/12', subject: '2012 Annual Network Audit' },
      { date: '11/20/13', subject: '2013 Performance Appraisal' }
    ]
  },
  {
    id: 'emp-2',
    firstName: 'Anthony',
    lastName: 'Remmen',
    birthDate: '2/19/1986',
    hireDate: '1/19/2013',
    mobilePhone: '+1(310)555-6625',
    position: 'Support Assistant',
    address: '1542 S Beacon St San Pedro, CA, 90731',
    email: 'anthonyr@dx-email.com',
    photoIndex: 2,
    evaluations: [
      { date: '12/2/12', subject: '2012 Employee Review' },
      { date: '12/17/12', subject: '2013 Employee Review' }
    ]
  },
  {
    id: 'emp-3',
    firstName: 'Arnold',
    lastName: 'Schwartz',
    birthDate: '2/28/1985',
    hireDate: '2/19/2009',
    mobilePhone: '+1(714)555-8882',
    position: 'Chief Financial Officer',
    address: '8820 Sunset Blvd, Hollywood, CA, 90069',
    email: 'arnolds@dx-email.com',
    photoIndex: 3,
    evaluations: [
      { date: '3/10/12', subject: '2012 Q1 Fiscal Audit' },
      { date: '4/15/13', subject: '2013 Strategic Planning Review' }
    ]
  },
  {
    id: 'emp-4',
    firstName: 'Arthur',
    lastName: 'Miller',
    birthDate: '7/11/1972',
    hireDate: '12/18/2007',
    mobilePhone: '1(310)555-8583',
    position: 'CTO',
    address: '5032 Wilshire Blvd, Los Angeles, CA, 90036',
    email: 'arthurm@dx-email.com',
    photoIndex: 4,
    evaluations: [
      { date: '1/12/12', subject: 'Architecture Strategy Review' }
    ]
  },
  {
    id: 'emp-5',
    firstName: 'Barbara',
    lastName: 'Banks',
    birthDate: '4/14/1979',
    hireDate: '4/14/2011',
    mobilePhone: '+1(310)555-3355',
    position: 'Sales Executive',
    address: '721 Ocean Avenue, Santa Monica, CA, 90401',
    email: 'barbarab@dx-email.com',
    photoIndex: 5,
    evaluations: [
      { date: '5/18/12', subject: 'Quarterly Sales Review' }
    ]
  },
  {
    id: 'emp-6',
    firstName: 'Kent',
    lastName: 'Samuelson',
    birthDate: '9/11/1972',
    hireDate: '8/7/2002',
    mobilePhone: '+1(310)542-3172',
    position: 'Product Manager',
    address: '3410 Pico Blvd, Santa Monica, CA, 90405',
    email: 'kents@dx-email.com',
    photoIndex: 6,
    evaluations: [
      { date: '8/14/12', subject: 'Product Roadmap Alignment' }
    ]
  },
  {
    id: 'emp-7',
    firstName: 'Oliviat',
    lastName: 'Peytont',
    birthDate: '6/3/1981',
    hireDate: '7/21/2010',
    mobilePhone: '1(310)555-3422',
    position: 'Lead Architect',
    address: '1940 Colorado Ave, Santa Monica, CA, 90404',
    email: 'oliviap@dx-email.com',
    photoIndex: 7,
    evaluations: [
      { date: '7/25/12', subject: 'Core Framework Milestone Review' }
    ]
  },
  {
    id: 'emp-8',
    firstName: 'Robert',
    lastName: 'Reagan',
    birthDate: '12/7/1974',
    hireDate: '11/12/2008',
    mobilePhone: '+1(818)555-2387',
    position: 'CMO',
    address: '4000 Warner Blvd, Burbank, CA, 91522',
    email: 'robertr@dx-email.com',
    photoIndex: 8,
    evaluations: [
      { date: '11/10/12', subject: 'Global Marketing Campaign Review' }
    ]
  },
  {
    id: 'emp-9',
    firstName: 'Sandra',
    lastName: 'Johnson',
    birthDate: '5/22/1983',
    hireDate: '5/11/2012',
    mobilePhone: '+1(213)555-7714',
    position: 'Controller',
    address: '900 Wilshire Blvd, Los Angeles, CA, 90017',
    email: 'sandraj@dx-email.com',
    photoIndex: 9,
    evaluations: [
      { date: '6/05/13', subject: 'Annual Tax Compliance Audit' }
    ]
  },
  {
    id: 'emp-10',
    firstName: 'Brett',
    lastName: 'Wade',
    birthDate: '10/15/1977',
    hireDate: '3/01/2006',
    mobilePhone: '+1(626)555-9011',
    position: 'IT Manager',
    address: '1200 S Arroyo Pkwy, Pasadena, CA, 91105',
    email: 'brettw@dx-email.com',
    photoIndex: 10,
    evaluations: [
      { date: '3/15/12', subject: 'IT Infrastructure Review' }
    ]
  }
];

export class CortexDataGridDetail extends CortexElement {
  constructor() {
    super();
    this._employees = EMPLOYEES_GRID_DATASET.map((e) => ({
      ...e,
      evaluations: [...e.evaluations]
    }));
    // Anthony Remmen expandido por padrão como na imagem de referência
    this._expandedId = 'emp-2';
    this._selectedId = 'emp-2';
    this._searchQuery = '';
    this._showFilterRow = false;
    this._filters = {
      firstName: '',
      lastName: '',
      birthDate: '',
      hireDate: '',
      mobilePhone: ''
    };
    this._showSummary = false;
    this._showColumnChooser = false;
    this._visibleColumns = {
      firstName: true,
      lastName: true,
      birthDate: true,
      hireDate: true,
      mobilePhone: true,
      details: true
    };
    this._sortField = '';
    this._sortAsc = true;
  }

  onLanguageChange() {
    this.render();
  }

  _getFilteredAndSortedData() {
    const q = this._searchQuery.trim().toLowerCase();

    let list = this._employees.filter((emp) => {
      // Busca geral
      if (q) {
        const full = `${emp.firstName} ${emp.lastName} ${emp.birthDate} ${emp.hireDate} ${emp.mobilePhone} ${emp.position} ${emp.address} ${emp.email}`.toLowerCase();
        if (!full.includes(q)) return false;
      }

      // Filtros inline por coluna
      if (this._showFilterRow) {
        if (this._filters.firstName && !emp.firstName.toLowerCase().includes(this._filters.firstName.toLowerCase())) return false;
        if (this._filters.lastName && !emp.lastName.toLowerCase().includes(this._filters.lastName.toLowerCase())) return false;
        if (this._filters.birthDate && !emp.birthDate.toLowerCase().includes(this._filters.birthDate.toLowerCase())) return false;
        if (this._filters.hireDate && !emp.hireDate.toLowerCase().includes(this._filters.hireDate.toLowerCase())) return false;
        if (this._filters.mobilePhone && !emp.mobilePhone.toLowerCase().includes(this._filters.mobilePhone.toLowerCase())) return false;
      }

      return true;
    });

    // Ordenação
    if (this._sortField) {
      list.sort((a, b) => {
        const valA = String(a[this._sortField] || '').toLowerCase();
        const valB = String(b[this._sortField] || '').toLowerCase();
        return this._sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return list;
  }

  render() {
    const items = this._getFilteredAndSortedData();
    const visibleColsCount = Object.values(this._visibleColumns).filter(Boolean).length;

    // Métricas analíticas para o Summary
    const totalEmployees = this._employees.length;
    const totalEvals = this._employees.reduce((acc, e) => acc + (e.evaluations ? e.evaluations.length : 0), 0);
    const uniquePositions = new Set(this._employees.map(e => e.position)).size;

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host {
          display: block;
          font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
          color: var(--text-primary, #1e293b);
        }

        .cdg-container {
          background: var(--bg-panel, var(--cx-surface, #ffffff));
          border: 1px solid var(--border-subtle, var(--cx-border, #e2e8f0));
          border-radius: var(--radius-md, 8px);
          overflow: visible;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        /* Toolbar Superior */
        .cdg-toolbar {
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: var(--bg-panel, var(--cx-surface, #ffffff));
          border-bottom: 1px solid var(--border-subtle, var(--cx-border, #e5e7eb));
          flex-wrap: wrap;
        }

        .cdg-toolbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cdg-btn-text {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-primary, #1e293b);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 7px 14px;
          border-radius: var(--radius-sm, 4px);
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .cdg-btn-text:hover {
          background: var(--bg-hover, var(--cx-surface-2, rgba(0, 0, 0, 0.04)));
          border-color: var(--border-subtle, var(--cx-border, #cbd5e1));
        }
        .cdg-btn-text:active {
          transform: translateY(1px);
        }
        .cdg-btn-danger:hover {
          color: #dc2626;
          border-color: #fca5a5;
          background: rgba(239, 68, 68, 0.08);
        }

        .cdg-toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .cdg-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm, 4px);
          border: 1px solid var(--border-subtle, var(--cx-border, #e2e8f0));
          background: var(--bg-panel, var(--cx-surface, #ffffff));
          color: var(--text-secondary, var(--cx-text-muted, #4b5563));
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          transition: all 0.15s ease;
        }
        .cdg-icon-btn:hover {
          background: var(--bg-hover, var(--cx-surface-2, rgba(0, 0, 0, 0.04)));
          color: var(--text-primary, #1e293b);
          border-color: var(--border-focus, #94a3b8);
        }
        .cdg-icon-btn.active {
          background: rgba(2, 132, 199, 0.12);
          border-color: #0284c7;
          color: #0284c7;
        }

        /* Campo de Busca */
        .cdg-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .cdg-search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted, #9ca3af);
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .cdg-search-input {
          padding: 7px 12px 7px 32px;
          font-size: 13px;
          border: 1px solid var(--border-input, var(--cx-border, #d1d5db));
          border-radius: var(--radius-sm, 4px);
          background: var(--bg-input, var(--cx-bg, #ffffff));
          color: var(--text-primary, #1e293b);
          outline: none;
          width: 170px;
          transition: all 0.15s ease;
        }
        .cdg-search-input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
          width: 210px;
        }

        /* Painel Popover de Seletor de Colunas */
        .cdg-popover {
          position: absolute;
          top: 42px;
          right: 48px;
          z-index: 50;
          background: var(--bg-panel, var(--cx-surface, #ffffff));
          border: 1px solid var(--border-input, var(--cx-border, #cbd5e1));
          border-radius: var(--radius-md, 6px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          padding: 12px;
          width: 210px;
          animation: cdgFade 0.15s ease;
        }
        @keyframes cdgFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cdg-popover-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted, #64748b);
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid var(--border-subtle, #e2e8f0);
        }
        .cdg-col-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 4px;
          font-size: 13px;
          color: var(--text-primary, #1e293b);
          cursor: pointer;
          border-radius: 4px;
          user-select: none;
        }
        .cdg-col-item:hover {
          background: var(--bg-hover, rgba(0, 0, 0, 0.04));
        }

        /* Barra de Resumo e Métricas (Analytics) */
        .cdg-summary-bar {
          background: var(--cx-surface-2, rgba(0, 0, 0, 0.02));
          border-bottom: 1px solid var(--border-subtle, var(--cx-border, #e5e7eb));
          padding: 12px 18px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }
        .cdg-kpi-card {
          background: var(--bg-panel, var(--cx-surface, #ffffff));
          border: 1px solid var(--border-subtle, var(--cx-border, #e2e8f0));
          border-radius: var(--radius-sm, 6px);
          padding: 8px 12px;
        }
        .cdg-kpi-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted, #64748b);
        }
        .cdg-kpi-val {
          font-size: 18px;
          font-weight: 700;
          color: #0284c7;
          margin-top: 2px;
        }

        /* Container da Tabela com Scroll Customizado */
        .cdg-table-wrap {
          overflow-x: auto;
          background: var(--bg-panel, var(--cx-surface, #ffffff));
          width: 100%;
        }

        table.cdg-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
          text-align: left;
        }

        table.cdg-table th {
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted, #64748b);
          background: var(--bg-panel, var(--cx-surface, #ffffff));
          border-bottom: 1px solid var(--border-subtle, var(--cx-border, #e5e7eb));
          white-space: nowrap;
          user-select: none;
        }
        table.cdg-table th.sortable {
          cursor: pointer;
        }
        table.cdg-table th.sortable:hover {
          color: var(--text-primary, #0f172a);
          background: var(--bg-hover, rgba(0, 0, 0, 0.02));
        }
        .cdg-sort-icon {
          font-size: 10px;
          margin-left: 4px;
          color: #0284c7;
        }

        /* Linha de Filtros por Coluna */
        .cdg-filter-row th {
          padding: 6px 12px 10px 12px !important;
          background: var(--cx-surface-2, rgba(0, 0, 0, 0.02)) !important;
        }
        .cdg-col-filter-input {
          width: 100%;
          padding: 5px 8px;
          font-size: 12px;
          border: 1px solid var(--border-input, #cbd5e1);
          border-radius: 4px;
          background: var(--bg-input, var(--cx-bg, #ffffff));
          color: var(--text-primary, #1e293b);
          box-sizing: border-box;
          outline: none;
        }
        .cdg-col-filter-input:focus {
          border-color: #0284c7;
        }

        /* Linhas de Dados */
        table.cdg-table tr.cdg-row {
          cursor: pointer;
          transition: background-color 0.12s ease;
          border-bottom: 1px solid var(--border-subtle, var(--cx-border, #f1f5f9));
        }
        table.cdg-table tr.cdg-row:hover {
          background-color: var(--bg-hover, rgba(2, 132, 199, 0.04));
        }
        table.cdg-table tr.cdg-row.selected-row {
          background-color: var(--bg-selected, rgba(2, 132, 199, 0.08));
        }
        table.cdg-table td {
          padding: 13px 16px;
          color: var(--text-primary, #1e293b);
          vertical-align: middle;
        }

        /* Botão de Detalhes (ⓘ) */
        .btn-detail-toggle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1.5px solid #0284c7;
          background: transparent;
          color: #0284c7;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          font-family: Georgia, serif;
          font-style: italic;
          cursor: pointer;
          transition: all 0.15s ease;
          line-height: 1;
          padding: 0;
        }
        .btn-detail-toggle:hover {
          transform: scale(1.08);
        }
        .btn-detail-toggle.expanded {
          background: #0284c7;
          color: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 1px 3px rgba(2, 132, 199, 0.3);
        }

        /* Linha e Card de Detalhes Master-Detail */
        table.cdg-table tr.detail-expanded-row {
          background: var(--bg-panel, var(--cx-surface, #ffffff));
        }
        .cdg-detail-cell {
          padding: 0 !important;
          border-bottom: 1px solid var(--border-subtle, var(--cx-border, #e5e7eb));
        }

        .cdg-detail-card {
          padding: 22px 28px;
          background: var(--cx-surface-2, rgba(0, 0, 0, 0.02));
          display: grid;
          grid-template-columns: 140px 1.4fr 1.6fr;
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .cdg-detail-card {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        /* Coluna Foto */
        .cdg-detail-photo-wrap {
          width: 135px;
          height: 135px;
          border-radius: var(--radius-sm, 6px);
          overflow: hidden;
          border: 1px solid var(--border-subtle, var(--cx-border, #e2e8f0));
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          background: #ffffff;
        }
        .cdg-detail-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Coluna Dados Pessoais */
        .cdg-detail-info {
          display: flex;
          flex-direction: column;
        }
        .cdg-detail-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        .cdg-detail-name {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
          letter-spacing: -0.2px;
        }
        .cdg-edit-icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted, #64748b);
          font-size: 17px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease;
        }
        .cdg-edit-icon-btn:hover {
          color: #0284c7;
          background: rgba(2, 132, 199, 0.08);
        }
        .cdg-detail-position {
          font-size: 14px;
          color: var(--text-muted, #64748b);
          margin-bottom: 14px;
        }
        .cdg-field-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted, #94a3b8);
          letter-spacing: 0.5px;
          margin-top: 6px;
        }
        .cdg-field-value {
          font-size: 13.5px;
          color: var(--text-primary, #1e293b);
          font-weight: 500;
          margin-bottom: 4px;
        }
        .cdg-email-link {
          color: #0284c7;
          text-decoration: none;
        }
        .cdg-email-link:hover {
          text-decoration: underline;
        }

        /* Coluna Avaliações */
        .cdg-detail-evals {
          display: flex;
          flex-direction: column;
        }
        .cdg-evals-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .cdg-evals-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
        }
        .cdg-btn-add-eval {
          font-size: 12px;
          font-weight: 600;
          color: #0284c7;
          background: transparent;
          border: 1px dashed #0284c7;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .cdg-btn-add-eval:hover {
          background: rgba(2, 132, 199, 0.08);
          border-style: solid;
        }
        table.cdg-subtable {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        table.cdg-subtable th {
          padding: 8px 10px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-muted, #64748b);
          border-bottom: 1px solid var(--border-subtle, var(--cx-border, #cbd5e1));
          text-align: left;
          background: transparent;
        }
        table.cdg-subtable td {
          padding: 8px 10px;
          color: var(--text-primary, #1e293b);
          border-bottom: 1px solid var(--border-subtle, var(--cx-border, #f1f5f9));
        }

        /* Estado Vazio */
        .cdg-empty {
          padding: 36px 20px;
          text-align: center;
          color: var(--text-muted, #94a3b8);
          font-size: 14px;
        }
      </style>

      <div class="cdg-container">
        <!-- Toolbar Principal -->
        <div class="cdg-toolbar">
          <div class="cdg-toolbar-left">
            <button id="btn-grid-new" class="cdg-btn-text" title="Adicionar Novo Colaborador">
              NEW
            </button>
            <button id="btn-grid-delete" class="cdg-btn-text cdg-btn-danger" title="Excluir Colaborador Selecionado">
              DELETE
            </button>
          </div>

          <div class="cdg-toolbar-right">
            <!-- 1. Botão Analytics / Summary -->
            <button id="btn-grid-summary" class="cdg-icon-btn ${this._showSummary ? 'active' : ''}" title="Alternar Resumo e Métricas">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </button>

            <!-- 2. Botão Funnel Filter -->
            <button id="btn-grid-filter" class="cdg-icon-btn ${this._showFilterRow ? 'active' : ''}" title="Alternar Linha de Filtros de Coluna">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            </button>

            <!-- 3. Botão Column Chooser -->
            <button id="btn-grid-columns" class="cdg-icon-btn ${this._showColumnChooser ? 'active' : ''}" title="Seletor de Colunas Visíveis">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </button>

            <!-- 4. Botão Export CSV -->
            <button id="btn-grid-export" class="cdg-icon-btn" title="Exportar Dados da Grade para CSV">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>

            <!-- Busca Textual -->
            <div class="cdg-search-box">
              <span class="cdg-search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                id="input-grid-search"
                class="cdg-search-input"
                type="text"
                placeholder="Search..."
                value="${this._searchQuery}"
              />
            </div>

            <!-- Popover do Seletor de Colunas -->
            ${
              this._showColumnChooser
                ? `
                  <div class="cdg-popover">
                    <div class="cdg-popover-title">Exibir Colunas</div>
                    <label class="cdg-col-item">
                      <input type="checkbox" data-col="firstName" ${this._visibleColumns.firstName ? 'checked' : ''} />
                      First Name
                    </label>
                    <label class="cdg-col-item">
                      <input type="checkbox" data-col="lastName" ${this._visibleColumns.lastName ? 'checked' : ''} />
                      Last Name
                    </label>
                    <label class="cdg-col-item">
                      <input type="checkbox" data-col="birthDate" ${this._visibleColumns.birthDate ? 'checked' : ''} />
                      Birth Date
                    </label>
                    <label class="cdg-col-item">
                      <input type="checkbox" data-col="hireDate" ${this._visibleColumns.hireDate ? 'checked' : ''} />
                      Hire Date
                    </label>
                    <label class="cdg-col-item">
                      <input type="checkbox" data-col="mobilePhone" ${this._visibleColumns.mobilePhone ? 'checked' : ''} />
                      Mobile Phone
                    </label>
                  </div>
                `
                : ''
            }
          </div>
        </div>

        <!-- Barra de Métricas Analytics (quando ativada) -->
        ${
          this._showSummary
            ? `
              <div class="cdg-summary-bar">
                <div class="cdg-kpi-card">
                  <div class="cdg-kpi-label">Colaboradores Registrados</div>
                  <div class="cdg-kpi-val">${totalEmployees}</div>
                </div>
                <div class="cdg-kpi-card">
                  <div class="cdg-kpi-label">Total de Avaliações</div>
                  <div class="cdg-kpi-val">${totalEvals}</div>
                </div>
                <div class="cdg-kpi-card">
                  <div class="cdg-kpi-label">Cargos / Funções</div>
                  <div class="cdg-kpi-val">${uniquePositions}</div>
                </div>
                <div class="cdg-kpi-card">
                  <div class="cdg-kpi-label">Itens Visíveis / Filtro</div>
                  <div class="cdg-kpi-val">${items.length}</div>
                </div>
              </div>
            `
            : ''
        }

        <!-- Tabela Master-Detail com Scroll Horizontal -->
        <div class="cdg-table-wrap">
          <table class="cdg-table">
            <thead>
              <tr>
                ${this._visibleColumns.firstName ? `
                  <th class="sortable" data-sort="firstName">
                    First Name ${this._sortField === 'firstName' ? `<span class="cdg-sort-icon">${this._sortAsc ? '▲' : '▼'}</span>` : ''}
                  </th>
                ` : ''}
                ${this._visibleColumns.lastName ? `
                  <th class="sortable" data-sort="lastName">
                    Last Name ${this._sortField === 'lastName' ? `<span class="cdg-sort-icon">${this._sortAsc ? '▲' : '▼'}</span>` : ''}
                  </th>
                ` : ''}
                ${this._visibleColumns.birthDate ? `
                  <th class="sortable" data-sort="birthDate">
                    Birth Date ${this._sortField === 'birthDate' ? `<span class="cdg-sort-icon">${this._sortAsc ? '▲' : '▼'}</span>` : ''}
                  </th>
                ` : ''}
                ${this._visibleColumns.hireDate ? `
                  <th class="sortable" data-sort="hireDate">
                    Hire Date ${this._sortField === 'hireDate' ? `<span class="cdg-sort-icon">${this._sortAsc ? '▲' : '▼'}</span>` : ''}
                  </th>
                ` : ''}
                ${this._visibleColumns.mobilePhone ? `
                  <th class="sortable" data-sort="mobilePhone">
                    Mobile Phone ${this._sortField === 'mobilePhone' ? `<span class="cdg-sort-icon">${this._sortAsc ? '▲' : '▼'}</span>` : ''}
                  </th>
                ` : ''}
                ${this._visibleColumns.details ? `
                  <th style="width: 70px; text-align: center;">Details</th>
                ` : ''}
              </tr>

              <!-- Linha de Filtros Inline (quando ativada pelo botão Funnel) -->
              ${
                this._showFilterRow
                  ? `
                    <tr class="cdg-filter-row">
                      ${this._visibleColumns.firstName ? `
                        <th><input type="text" class="cdg-col-filter-input" data-filter-col="firstName" placeholder="Filtrar..." value="${this._filters.firstName}" /></th>
                      ` : ''}
                      ${this._visibleColumns.lastName ? `
                        <th><input type="text" class="cdg-col-filter-input" data-filter-col="lastName" placeholder="Filtrar..." value="${this._filters.lastName}" /></th>
                      ` : ''}
                      ${this._visibleColumns.birthDate ? `
                        <th><input type="text" class="cdg-col-filter-input" data-filter-col="birthDate" placeholder="Filtrar..." value="${this._filters.birthDate}" /></th>
                      ` : ''}
                      ${this._visibleColumns.hireDate ? `
                        <th><input type="text" class="cdg-col-filter-input" data-filter-col="hireDate" placeholder="Filtrar..." value="${this._filters.hireDate}" /></th>
                      ` : ''}
                      ${this._visibleColumns.mobilePhone ? `
                        <th><input type="text" class="cdg-col-filter-input" data-filter-col="mobilePhone" placeholder="Filtrar..." value="${this._filters.mobilePhone}" /></th>
                      ` : ''}
                      ${this._visibleColumns.details ? `
                        <th style="text-align: center;"><button id="btn-clear-filters" style="font-size: 10px; cursor: pointer; padding: 2px 6px; border-radius: 3px; border: 1px solid var(--border-subtle, #cbd5e1); background: transparent;">Limpar</button></th>
                      ` : ''}
                    </tr>
                  `
                  : ''
              }
            </thead>
            <tbody>
              ${
                items.length === 0
                  ? `<tr><td colspan="${visibleColsCount}" class="cdg-empty">Nenhum colaborador encontrado com os filtros aplicados.</td></tr>`
                  : items
                      .map((emp) => {
                        const isSelected = this._selectedId === emp.id;
                        const isExpanded = this._expandedId === emp.id;
                        const photoUrl = getPersonPhoto(emp.photoIndex);
                        const fallbackSvg = buildExecutivePortraitSVG({ female: emp.photoIndex % 2 === 1 });

                        return `
                          <tr class="cdg-row ${isSelected ? 'selected-row' : ''}" data-row-id="${emp.id}">
                            ${this._visibleColumns.firstName ? `<td>${emp.firstName}</td>` : ''}
                            ${this._visibleColumns.lastName ? `<td>${emp.lastName}</td>` : ''}
                            ${this._visibleColumns.birthDate ? `<td>${emp.birthDate}</td>` : ''}
                            ${this._visibleColumns.hireDate ? `<td>${emp.hireDate}</td>` : ''}
                            ${this._visibleColumns.mobilePhone ? `<td>${emp.mobilePhone}</td>` : ''}
                            ${this._visibleColumns.details ? `
                              <td style="text-align: center;">
                                <button
                                  class="btn-detail-toggle ${isExpanded ? 'expanded' : ''}"
                                  data-toggle-id="${emp.id}"
                                  title="${isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}"
                                >
                                  i
                                </button>
                              </td>
                            ` : ''}
                          </tr>

                          <!-- Card Master-Detail Expansível -->
                          ${
                            isExpanded
                              ? `
                                <tr class="detail-expanded-row">
                                  <td colspan="${visibleColsCount}" class="cdg-detail-cell">
                                    <div class="cdg-detail-card">
                                      <!-- Coluna 1: Foto do Colaborador -->
                                      <div class="cdg-detail-photo-wrap">
                                        <img
                                          src="${photoUrl}"
                                          alt="${emp.firstName} ${emp.lastName}"
                                          class="cdg-detail-photo"
                                          onerror="this.src='${fallbackSvg}'"
                                        />
                                      </div>

                                      <!-- Coluna 2: Informações de Perfil e Contato -->
                                      <div class="cdg-detail-info">
                                        <div class="cdg-detail-name-row">
                                          <div class="cdg-detail-name">${emp.firstName} ${emp.lastName}</div>
                                          <button
                                            class="cdg-edit-icon-btn"
                                            data-edit-id="${emp.id}"
                                            title="Editar Dados de ${emp.firstName} ${emp.lastName}"
                                          >
                                            ✎
                                          </button>
                                        </div>
                                        <div class="cdg-detail-position">${emp.position}</div>

                                        <div class="cdg-field-label">Address</div>
                                        <div class="cdg-field-value">${emp.address}</div>

                                        <div class="cdg-field-label">Phone</div>
                                        <div class="cdg-field-value">${emp.mobilePhone}</div>

                                        <div class="cdg-field-label">Email</div>
                                        <div class="cdg-field-value">
                                          <a href="mailto:${emp.email}" class="cdg-email-link">${emp.email}</a>
                                        </div>
                                      </div>

                                      <!-- Coluna 3: Subtabela de Avaliações (Evaluations) -->
                                      <div class="cdg-detail-evals">
                                        <div class="cdg-evals-header">
                                          <div class="cdg-evals-title">Evaluations</div>
                                          <button
                                            class="cdg-btn-add-eval"
                                            data-add-eval-id="${emp.id}"
                                            title="Adicionar Avaliação"
                                          >
                                            + Adicionar
                                          </button>
                                        </div>

                                        <table class="cdg-subtable">
                                          <thead>
                                            <tr>
                                              <th style="width: 90px;">Date</th>
                                              <th>Subject</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            ${
                                              (emp.evaluations || []).length === 0
                                                ? `<tr><td colspan="2" style="color:var(--text-muted); font-style:italic;">Nenhuma avaliação registrada.</td></tr>`
                                                : emp.evaluations
                                                    .map(
                                                      (ev) => `
                                                        <tr>
                                                          <td style="color:var(--text-muted); font-weight:500;">${ev.date}</td>
                                                          <td style="font-weight:600;">${ev.subject}</td>
                                                        </tr>
                                                      `
                                                    )
                                                    .join('')
                                            }
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              `
                              : ''
                          }
                        `;
                      })
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    const root = this.shadowRoot;

    // 1. Botão NEW -> Abre modal form de cadastro
    root.querySelector('#btn-grid-new')?.addEventListener('click', async () => {
      const result = await CortexModal.form({
        title: 'Novo Colaborador',
        message: 'Preencha os dados do novo membro da equipe:',
        width: '460px',
        confirmText: 'Cadastrar',
        cancelText: 'Cancelar',
        fields: [
          { name: 'firstName', label: 'First Name', value: '', placeholder: 'Ex: Emily' },
          { name: 'lastName', label: 'Last Name', value: '', placeholder: 'Ex: Davis' },
          { name: 'birthDate', label: 'Birth Date', type: 'datepicker', value: '05/15/1990' },
          { name: 'hireDate', label: 'Hire Date', type: 'datepicker', value: '01/10/2020' },
          { name: 'mobilePhone', label: 'Mobile Phone', value: '+1(415)555-8921' },
          { name: 'position', label: 'Position', value: 'Support Assistant' },
          { name: 'address', label: 'Address', value: '100 Market St, San Francisco, CA, 94105' },
          { name: 'email', label: 'Email', value: 'emilyd@dx-email.com' }
        ]
      });

      if (result && !result.__action) {
        const nextPhotoIndex = ((this._employees.length % 12) + 1);
        const newEmp = {
          id: `emp-${Date.now()}`,
          firstName: result.firstName || 'Novo',
          lastName: result.lastName || 'Colaborador',
          birthDate: result.birthDate || '01/01/1990',
          hireDate: result.hireDate || '01/01/2024',
          mobilePhone: result.mobilePhone || '+1(555)000-0000',
          position: result.position || 'Specialist',
          address: result.address || 'Corporate Office',
          email: result.email || 'novo@dx-email.com',
          photoIndex: nextPhotoIndex,
          evaluations: [
            { date: '1/15/24', subject: 'Initial Onboarding Review' }
          ]
        };

        this._employees.unshift(newEmp);
        this._selectedId = newEmp.id;
        this._expandedId = newEmp.id;
        this.render();
        CortexModal.toast(`Colaborador ${newEmp.firstName} ${newEmp.lastName} adicionado com sucesso!`, 'success');
      }
    });

    // 2. Botão DELETE -> Exclui colaborador selecionado
    root.querySelector('#btn-grid-delete')?.addEventListener('click', async () => {
      const selectedEmp = this._employees.find(e => e.id === this._selectedId);
      if (!selectedEmp) {
        CortexModal.toast('Selecione uma linha para excluir.', 'warning');
        return;
      }

      const confirmed = await CortexModal.confirm({
        title: 'Excluir Colaborador',
        message: `Deseja realmente remover permanentemente ${selectedEmp.firstName} ${selectedEmp.lastName} da grade?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        danger: true
      });

      if (confirmed) {
        this._employees = this._employees.filter(e => e.id !== selectedEmp.id);
        if (this._expandedId === selectedEmp.id) {
          this._expandedId = null;
        }
        if (this._employees.length > 0) {
          this._selectedId = this._employees[0].id;
        } else {
          this._selectedId = null;
        }
        this.render();
        CortexModal.toast(`${selectedEmp.firstName} ${selectedEmp.lastName} foi removido com sucesso.`, 'info');
      }
    });

    // 3. Botão Analytics (Summary)
    root.querySelector('#btn-grid-summary')?.addEventListener('click', () => {
      this._showSummary = !this._showSummary;
      this.render();
    });

    // 4. Botão Filtro Funnel
    root.querySelector('#btn-grid-filter')?.addEventListener('click', () => {
      this._showFilterRow = !this._showFilterRow;
      this.render();
    });

    // 5. Botão Seletor de Colunas (Column Chooser)
    root.querySelector('#btn-grid-columns')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._showColumnChooser = !this._showColumnChooser;
      this.render();
    });

    // Checkboxes do Seletor de Colunas
    root.querySelectorAll('.cdg-col-item input[type="checkbox"]').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const col = e.target.getAttribute('data-col');
        if (col) {
          this._visibleColumns[col] = e.target.checked;
          this.render();
        }
      });
    });

    // 6. Botão Exportar CSV
    root.querySelector('#btn-grid-export')?.addEventListener('click', () => {
      const items = this._getFilteredAndSortedData();
      let csv = '﻿'; // UTF-8 BOM
      csv += '"First Name","Last Name","Birth Date","Hire Date","Mobile Phone","Position","Address","Email"\n';
      items.forEach(emp => {
        csv += `"${emp.firstName}","${emp.lastName}","${emp.birthDate}","${emp.hireDate}","${emp.mobilePhone}","${emp.position}","${emp.address.replace(/"/g, '""')}","${emp.email}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'employees_datagrid.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      CortexModal.toast('Arquivo employees_datagrid.csv exportado com sucesso!', 'success');
    });

    // 7. Busca Textual Geral
    const searchInput = root.querySelector('#input-grid-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this._searchQuery = e.target.value;
        // Evita re-render completo que rouba o foco do input
        const tbody = root.querySelector('table.cdg-table tbody');
        if (tbody) {
          this.render();
          const freshSearch = this.shadowRoot.querySelector('#input-grid-search');
          if (freshSearch) {
            freshSearch.focus();
            freshSearch.setSelectionRange(freshSearch.value.length, freshSearch.value.length);
          }
        }
      });
    }

    // 8. Filtros Inline de Coluna
    root.querySelectorAll('.cdg-col-filter-input').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        const col = e.target.getAttribute('data-filter-col');
        if (col) {
          this._filters[col] = e.target.value;
          this.render();
          const freshInp = this.shadowRoot.querySelector(`.cdg-col-filter-input[data-filter-col="${col}"]`);
          if (freshInp) {
            freshInp.focus();
            freshInp.setSelectionRange(freshInp.value.length, freshInp.value.length);
          }
        }
      });
    });

    // Botão Limpar Filtros
    root.querySelector('#btn-clear-filters')?.addEventListener('click', () => {
      this._filters = { firstName: '', lastName: '', birthDate: '', hireDate: '', mobilePhone: '' };
      this.render();
    });

    // 9. Ordenação por Cabeçalho
    root.querySelectorAll('table.cdg-table th.sortable').forEach((th) => {
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

    // 10. Seleção de Linha ao clicar na linha
    root.querySelectorAll('tr.cdg-row').forEach((tr) => {
      tr.addEventListener('click', (e) => {
        // Se o clique foi no botão de detalhe ou link, deixa propagar
        if (e.target.closest('.btn-detail-toggle') || e.target.closest('a')) return;
        const rowId = tr.getAttribute('data-row-id');
        if (rowId) {
          this._selectedId = rowId;
          this.render();
        }
      });
    });

    // 11. Botão de Expansão (ⓘ)
    root.querySelectorAll('.btn-detail-toggle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const toggleId = btn.getAttribute('data-toggle-id');
        if (toggleId) {
          this._selectedId = toggleId;
          this._expandedId = this._expandedId === toggleId ? null : toggleId;
          this.render();
        }
      });
    });

    // 12. Botão Editar Colaborador (✎)
    root.querySelectorAll('.cdg-edit-icon-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const empId = btn.getAttribute('data-edit-id');
        const emp = this._employees.find(x => x.id === empId);
        if (!emp) return;

        const updated = await CortexModal.form({
          title: `Editar: ${emp.firstName} ${emp.lastName}`,
          message: 'Atualize os dados cadastrais do colaborador:',
          width: '460px',
          confirmText: 'Salvar Alterações',
          cancelText: 'Cancelar',
          fields: [
            { name: 'firstName', label: 'First Name', value: emp.firstName },
            { name: 'lastName', label: 'Last Name', value: emp.lastName },
            { name: 'birthDate', label: 'Birth Date', type: 'datepicker', value: emp.birthDate },
            { name: 'hireDate', label: 'Hire Date', type: 'datepicker', value: emp.hireDate },
            { name: 'mobilePhone', label: 'Mobile Phone', value: emp.mobilePhone },
            { name: 'position', label: 'Position', value: emp.position },
            { name: 'address', label: 'Address', value: emp.address },
            { name: 'email', label: 'Email', value: emp.email }
          ]
        });

        if (updated && !updated.__action) {
          emp.firstName = updated.firstName || emp.firstName;
          emp.lastName = updated.lastName || emp.lastName;
          emp.birthDate = updated.birthDate || emp.birthDate;
          emp.hireDate = updated.hireDate || emp.hireDate;
          emp.mobilePhone = updated.mobilePhone || emp.mobilePhone;
          emp.position = updated.position || emp.position;
          emp.address = updated.address || emp.address;
          emp.email = updated.email || emp.email;

          this.render();
          CortexModal.toast(`Dados de ${emp.firstName} ${emp.lastName} atualizados com sucesso!`, 'success');
        }
      });
    });

    // 13. Botão + Adicionar Avaliação (Evaluations)
    root.querySelectorAll('.cdg-btn-add-eval').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const empId = btn.getAttribute('data-add-eval-id');
        const emp = this._employees.find(x => x.id === empId);
        if (!emp) return;

        const today = new Date();
        const defaultDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

        const newEval = await CortexModal.form({
          title: `Nova Avaliação - ${emp.firstName} ${emp.lastName}`,
          message: 'Informe a data e o assunto da avaliação de desempenho:',
          width: '420px',
          confirmText: 'Adicionar Avaliação',
          cancelText: 'Cancelar',
          fields: [
            { name: 'date', label: 'Data da Avaliação', type: 'datepicker', value: defaultDate },
            { name: 'subject', label: 'Assunto / Avaliação', value: `${today.getFullYear()} Performance Review` }
          ]
        });

        if (newEval && !newEval.__action) {
          if (!emp.evaluations) emp.evaluations = [];
          emp.evaluations.push({
            date: newEval.date || defaultDate,
            subject: newEval.subject || 'Employee Review'
          });

          this.render();
          CortexModal.toast('Nova avaliação adicionada com sucesso!', 'success');
        }
      });
    });
  }
}

/* ============================================================================
   4. <cortex-form-view> — Form View Split com Sizer & Chat/Tasks (Fiel à Imagem 5)
   ============================================================================ */
export class CortexFormView extends CortexElement {
  constructor() {
    super();
    this._splitPct = 50;
    this._activeRightTab = 'chat';
    this._record = { ...CONTACTS_DATASET[0], position: 'Sales Assistant' };
    this._messages = [
      {
        sender: 'John Heart',
        time: '01/03/2025 14:32',
        outgoing: false,
        text: "Hello,\nYesterday we talked about an audio equipment upgrade for your organization.\nI have great news for you.\nWe've discussed your requirements and I can offer a 15% discount if your order exceeds $50,000. If you'd like to lock-in a 3 year contract, we will be happy to increase our discount to 20%."
      },
      {
        sender: 'You',
        time: '15/03/2025 11:02',
        outgoing: true,
        text: "Hello John,\nAs promised I'm sending a quote for your recent equipment request.\nPlease note, we included pricing for our most recent models.\nIf your budget is limited, we can offer last year models instead.\nPlease let me know if you have any questions. Hope to hear from you soon."
      },
      {
        sender: 'John Heart',
        time: '01/05/2025 12:20',
        outgoing: false,
        text: 'Hi Sammy,\nDiscussed your counteroffer with our CEO.\nCould you please forward your final technical requirements, so we can prepare a binding quote?\nP.S. Do you offer any discounts for bulk orders?'
      }
    ];
    this._draftMsg = '';
  }

  _renderRightTabContent() {
    if (this._activeRightTab === 'chat') {
      return `
        <div class="chat-messages" id="fv-chat-scroll">
          ${this._messages
            .map(
              (m) => `
            <div class="msg-row ${m.outgoing ? 'outgoing' : 'incoming'}">
              ${!m.outgoing ? `<img class="chat-avatar" src="${this._record.avatar}" alt="${m.sender}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1'; this.src='img/docs/pessoa${this._record.photoIndex || 1}.jpg';}" />` : ''}
              <div class="msg-col">
                <div class="msg-meta">${m.outgoing ? '' : `<strong>${m.sender}</strong> `}<span>${m.time}</span></div>
                <div class="msg-bubble">${m.text.replace(/\n/g, '<br/>')}</div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="chat-composer">
          <input
            type="text"
            id="fv-chat-input"
            class="chat-input"
            placeholder="Type a message..."
            value="${this._draftMsg}"
          />
          <button class="chat-send-btn" id="fv-chat-send" title="Enviar Mensagem">&#10148;</button>
        </div>
      `;
    }

    if (this._activeRightTab === 'tasks') {
      return `
        <div style="padding: 16px; display:flex; flex-direction:column; gap:10px; font-size:12px;">
          <div style="padding:10px; background:var(--bg-input); border:1px solid var(--border-input); border-radius:4px;">
            <input type="checkbox" checked /> <strong>Enviar proposta comercial revisada (20% desc.)</strong>
            <div style="font-size:10.5px; color:var(--text-muted); margin-top:3px;">Prazo: Concluído • Responsável: Brett Johnson</div>
          </div>
          <div style="padding:10px; background:var(--bg-input); border:1px solid var(--border-input); border-radius:4px;">
            <input type="checkbox" /> <strong>Agendar call de validação técnica com CTO</strong>
            <div style="font-size:10.5px; color:var(--text-muted); margin-top:3px;">Prazo: Amanhã às 15:00 • Prioridade Alta</div>
          </div>
        </div>
      `;
    }

    if (this._activeRightTab === 'activities') {
      return `
        <div style="padding: 16px; display:flex; flex-direction:column; gap:10px; font-size:12px;">
          <div><strong>&#128222; Chamada Executiva Realizada</strong> — Duração: 28 min (Ontem)</div>
          <div><strong>&#128196; Contrato #CX-2099 Gerado</strong> — Valor: $50,000.00</div>
          <div><strong>&#9993; E-mail de Cotação Enviado</strong> — Destinatário: jheart@dx-email.com</div>
        </div>
      `;
    }

    return `
      <div style="padding: 16px;">
        <textarea style="width:100%; height:220px; padding:10px; background:var(--bg-input); color:var(--text-primary); border:1px solid var(--border-input); border-radius:4px; font-family:inherit; font-size:12px;">Cliente interessado em fechar contrato corporativo de 3 anos para atualização de equipamentos de áudio em todas as unidades Braeburn.</textarea>
      </div>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        :host { display: block; }
        .fv-split-shell {
          display: grid;
          grid-template-columns: ${this._splitPct}% 12px 1fr;
          gap: 0;
          align-items: stretch;
        }
        .fv-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--btn-bevel-shadow);
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow: hidden;
        }
        /* Sizer Central entre Form View e Painel de Chat (Fiel à Imagem 5) */
        .fv-sizer {
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: none;
        }
        .fv-sizer::after {
          content: "";
          width: 3px;
          height: 24px;
          border-radius: 99px;
          background: var(--text-primary);
          opacity: 0.65;
          transition: height 0.12s ease, background 0.12s ease;
        }
        .fv-sizer:hover::after,
        .fv-sizer.dragging::after {
          height: 48px;
          background: var(--accent-blue);
          opacity: 1;
        }

        /* Cabeçalho Details + Botões Save / Cancel */
        .fv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .fv-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .fv-actions {
          display: flex;
          gap: 8px;
        }
        .btn-save {
          height: 30px;
          padding: 0 16px;
          border-radius: var(--radius-xs);
          background: var(--accent-blue);
          color: var(--accent-text);
          font-size: 12px;
          font-weight: 600;
          box-shadow: var(--btn-bevel-shadow);
        }
        .btn-cancel {
          height: 30px;
          padding: 0 14px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
          font-size: 12px;
        }

        /* Topo do Form: Foto + Status / First Name / Last Name */
        .fv-top-grid {
          display: grid;
          grid-template-columns: 165px 1fr;
          gap: 16px;
          align-items: start;
        }
        .fv-photo {
          width: 165px;
          height: 175px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-input);
          overflow: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .fv-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }
        .fv-field-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .f-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .f-label {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .f-input {
          height: 32px;
          padding: 0 10px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          box-shadow: var(--input-bevel-shadow);
          color: var(--text-primary);
          font-size: 12px;
          width: 100%;
        }
        .fv-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .fv-row-3 {
          display: grid;
          grid-template-columns: 1.5fr 0.7fr 1fr;
          gap: 12px;
        }
        .fv-section-divider {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          padding-bottom: 6px;
          border-bottom: 1px solid var(--border-subtle);
          margin-top: 4px;
        }

        /* Painel Direito: Abas Chat | Tasks | Activities | Notes */
        .fv-tabs-bar {
          display: flex;
          gap: 18px;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 8px;
        }
        .fv-tab {
          font-size: 12.5px;
          color: var(--text-secondary);
          padding-bottom: 6px;
          border-bottom: 2px solid transparent;
        }
        .fv-tab.active {
          color: var(--text-primary);
          font-weight: 700;
          border-bottom-color: var(--accent-blue);
        }
        .chat-messages {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 410px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .msg-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .msg-row.outgoing {
          justify-content: flex-end;
        }
        .chat-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          object-position: center top;
          flex-shrink: 0;
          margin-top: 14px;
          border: 1px solid var(--border-input);
          background: #ffffff;
        }
        .msg-col {
          max-width: 84%;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .msg-row.outgoing .msg-col {
          align-items: flex-end;
        }
        .msg-meta {
          font-size: 10px;
          color: var(--text-muted);
        }
        .msg-bubble {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          font-size: 11.5px;
          line-height: 1.5;
        }
        .msg-row.outgoing .msg-bubble {
          background: var(--accent-blue-alpha);
          border-color: var(--accent-blue);
        }
        .chat-composer {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid var(--border-subtle);
          margin-top: auto;
        }
        .chat-input {
          flex: 1;
          height: 34px;
          padding: 0 12px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
          font-size: 12px;
        }
        .chat-send-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--accent-blue);
          font-size: 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .chat-send-btn:hover {
          background: var(--accent-blue);
          color: var(--accent-text);
        }

        @media (max-width: 900px) {
          .fv-split-shell {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .fv-sizer {
            display: none;
          }
          .fv-top-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <div class="fv-split-shell" id="fv-shell">
        <!-- Coluna Esquerda: Details & Contacts Form -->
        <div class="fv-card">
          <div class="fv-header">
            <span class="fv-title">Details</span>
            <div class="fv-actions">
              <button class="btn-save" id="fv-save-btn">Save</button>
              <button class="btn-cancel" id="fv-cancel-btn">Cancel</button>
            </div>
          </div>

          <div class="fv-top-grid">
            <div class="fv-photo">
              <img src="${this._record.avatar}" alt="${this._record.fullName}" onerror="if(!this.dataset.fallback){this.dataset.fallback='1'; this.src='img/docs/pessoa${this._record.photoIndex || 1}.jpg';}" />
            </div>
            <div class="fv-field-stack">
              <div class="f-group">
                <label class="f-label">Status</label>
                <select class="f-input" data-f="hrStatus" style="color:#16a34a; font-weight:700;">
                  <option value="Salaried" ${this._record.hrStatus === 'Salaried' ? 'selected' : ''}>● Salaried</option>
                  <option value="Commission" ${this._record.hrStatus === 'Commission' ? 'selected' : ''}>● Commission</option>
                  <option value="Terminated" ${this._record.hrStatus === 'Terminated' ? 'selected' : ''}>● Terminated</option>
                </select>
              </div>
              <div class="f-group">
                <label class="f-label">First Name</label>
                <input type="text" class="f-input" data-f="firstName" value="${this._record.firstName}" />
              </div>
              <div class="f-group">
                <label class="f-label">Last Name</label>
                <input type="text" class="f-input" data-f="lastName" value="${this._record.lastName}" />
              </div>
            </div>
          </div>

          <div class="fv-row-2">
            <div class="f-group">
              <label class="f-label">Position</label>
              <input type="text" class="f-input" data-f="position" value="${this._record.position}" />
            </div>
            <div class="f-group">
              <label class="f-label">Assigned to</label>
              <input type="text" class="f-input" data-f="assignedTo" value="${this._record.assignedTo}" />
            </div>
          </div>

          <div class="f-group">
            <label class="f-label">Company</label>
            <input type="text" class="f-input" data-f="company" value="${this._record.company}" />
          </div>

          <div class="fv-section-divider">Contacts</div>

          <div class="f-group">
            <label class="f-label">Address</label>
            <input type="text" class="f-input" data-f="address" value="${this._record.address}" />
          </div>

          <div class="fv-row-3">
            <div class="f-group">
              <label class="f-label">City</label>
              <input type="text" class="f-input" data-f="city" value="${this._record.city}" />
            </div>
            <div class="f-group">
              <label class="f-label">State</label>
              <input type="text" class="f-input" data-f="state" value="${this._record.state}" />
            </div>
            <div class="f-group">
              <label class="f-label">Zip Code</label>
              <input type="text" class="f-input" data-f="zip" value="${this._record.zip}" />
            </div>
          </div>

          <div class="fv-row-2">
            <div class="f-group">
              <label class="f-label">Phone</label>
              <input type="text" class="f-input" data-f="phone" value="${this._record.phone}" />
            </div>
            <div class="f-group">
              <label class="f-label">Email</label>
              <input type="email" class="f-input" data-f="email" value="${this._record.email}" style="text-decoration:underline;" />
            </div>
          </div>
        </div>

        <!-- Divisor Sizer Central (Fiel à Imagem 5) -->
        <div class="fv-sizer" id="fv-sizer-handle" title="Arraste para redimensionar as colunas do Form View"></div>

        <!-- Coluna Direita: Chat / Tasks / Activities / Notes -->
        <div class="fv-card">
          <div class="fv-tabs-bar">
            ${[
              ['chat', 'Chat'],
              ['tasks', 'Tasks'],
              ['activities', 'Activities'],
              ['notes', 'Notes']
            ]
              .map(
                ([id, label]) => `
              <button class="fv-tab ${this._activeRightTab === id ? 'active' : ''}" data-fv-tab="${id}">
                ${label}
              </button>
            `
              )
              .join('')}
          </div>

          ${this._renderRightTabContent()}
        </div>
      </div>
    `;

    // Sizer horizontal entre Details e Chat
    const shell = this.shadowRoot.querySelector('#fv-shell');
    const sizer = this.shadowRoot.querySelector('#fv-sizer-handle');
    if (shell && sizer) {
      let dragging = false;
      sizer.addEventListener('pointerdown', (e) => {
        sizer.setPointerCapture(e.pointerId);
        dragging = true;
        sizer.classList.add('dragging');
      });
      sizer.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const rect = shell.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        this._splitPct = Math.max(30, Math.min(70, pct));
        shell.style.gridTemplateColumns = `${this._splitPct}% 12px 1fr`;
      });
      const stop = () => {
        dragging = false;
        sizer.classList.remove('dragging');
      };
      sizer.addEventListener('pointerup', stop);
      sizer.addEventListener('pointercancel', stop);
      sizer.addEventListener('dblclick', () => {
        this._splitPct = 50;
        shell.style.gridTemplateColumns = '50% 12px 1fr';
      });
    }

    this.shadowRoot.querySelectorAll('[data-f]').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        this._record[inp.dataset.f] = e.target.value;
      });
    });

    this.shadowRoot.querySelector('#fv-save-btn')?.addEventListener('click', () => {
      CortexModal.toast(`Dados de ${this._record.firstName} ${this._record.lastName} salvos com sucesso!`, 'success');
    });

    this.shadowRoot.querySelector('#fv-cancel-btn')?.addEventListener('click', () => {
      this._record = { ...CONTACTS_DATASET[0], position: 'Sales Assistant' };
      this.render();
      CortexModal.toast('Alterações descartadas', 'info');
    });

    this.shadowRoot.querySelectorAll('[data-fv-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._activeRightTab = btn.dataset.fvTab;
        this.render();
      });
    });

    const sendChatMsg = () => {
      const chatInp = this.shadowRoot.querySelector('#fv-chat-input');
      const txt = chatInp?.value.trim();
      if (!txt) return;
      this._messages.push({
        sender: 'You',
        time: 'Agora',
        outgoing: true,
        text: txt
      });
      this._draftMsg = '';
      this.render();
    };

    this.shadowRoot.querySelector('#fv-chat-send')?.addEventListener('click', sendChatMsg);
    this.shadowRoot.querySelector('#fv-chat-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMsg();
      }
    });
  }
}

customElements.define('cortex-card-view', CortexCardView);
customElements.define('cortex-list-view', CortexListView);
customElements.define('cortex-datagrid-grouped', CortexDataGridGrouped);
customElements.define('cortex-datagrid-detail', CortexDataGridDetail);
customElements.define('cortex-form-view', CortexFormView);
