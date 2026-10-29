// src/components/cortex-login.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';
import { CortexModal } from './cortex-modal.js';

const LOGIN_MODELS = [
  { id: '1', name: '1. Creative Splash' },
  { id: '2', name: '2. Enterprise ERP' },
  { id: '3', name: '3. Minimal Glass' },
  { id: '4', name: '4. Workstation OS' },
  { id: '5', name: '5. Developer IDE' },
  { id: '6', name: '6. Bento Studio + QR' },
  { id: '7', name: '7. MedTech & BioLab' },
  { id: '8', name: '8. Quant Trading Desk' },
  { id: '9', name: '9. Zero-Trust Stepper' },
  { id: '10', name: '10. CAD & 3D Launcher' }
];

const ERROR_PRESETS = {
  none: null,
  auth_401: {
    type: 'access',
    code: 'AUTH_ERR_401',
    title: 'Falha de Autenticação (Credenciais Inválidas)',
    message: 'O usuário, matrícula ou senha informados não conferem. Restam 2 tentativas antes do bloqueio temporário.'
  },
  locked_403: {
    type: 'access',
    code: 'SEC_LOCKED_403',
    title: 'Acesso Bloqueado por Política de Segurança',
    message: 'Token 2FA expirado ou estação fora do horário permitido. Solicite liberação ao administrador.'
  },
  app_503: {
    type: 'application',
    code: 'APP_NET_503',
    title: 'Erro de Aplicação — Servidor Indisponível',
    message: 'Não foi possível estabelecer conexão segura com o cluster de autenticação (Timeout 5000ms em auth.cortexui.local).'
  },
  app_500: {
    type: 'application',
    code: 'CORE_EXCEPTION_500',
    title: 'Erro Crítico de Aplicação / Licença',
    message: 'Falha ao validar a assinatura do módulo criptográfico local (ERR_MODULE_SIGNATURE_MISMATCH).'
  }
};

export class CortexLogin extends CortexElement {
  static get observedAttributes() {
    return ['model', 'open'];
  }

  constructor() {
    super();
    this._model = '1';
    this._isOpen = false;
    this._showPassword = false;
    this._selectedOsUser = 'Elton Alves';
    this._simulatedOutcome = 'none'; // 'none' | 'auth_401' | 'locked_403' | 'app_503' | 'app_500'
    this._activeError = null;
    this._wizardStep = 1;
  }

  onMount() {
    this.watchState('theme', (nextTheme) => {
      const sel = this.shadowRoot.getElementById('login-theme-select');
      if (sel && sel.value !== nextTheme) {
        sel.value = nextTheme;
      }
    });
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'model' && newVal) {
      this._model = String(newVal);
      if (this.isConnected) this.render();
    } else if (name === 'open') {
      this._isOpen = newVal !== null && newVal !== 'false';
      if (this.isConnected) this.render();
    }
  }

  open(modelNumber = this._model) {
    this._model = String(modelNumber || '1');
    this._isOpen = true;
    this.render();
  }

  close() {
    this._isOpen = false;
    this.render();
  }

  /**
   * API Pública para exibir erros de acesso ou erros de aplicação dentro de qualquer tela de login.
   */
  showError({
    type = 'access',
    code = 'AUTH_ERROR',
    title = 'Erro de Acesso',
    message = 'Não foi possível autenticar sua sessão.'
  } = {}) {
    this._activeError = { type, code, title, message };
    this.render();
    const card = this.shadowRoot.querySelector('.login-card');
    if (card) {
      card.classList.remove('shake-error');
      void card.offsetWidth; // Reflow para reiniciar animação shake
      card.classList.add('shake-error');
    }
  }

  clearError() {
    this._activeError = null;
    this.render();
  }

  /**
   * Renderiza o Banner Contextual de Erro de Acesso ou Erro de Aplicação dentro dos formulários.
   */
  _renderErrorAlert() {
    if (!this._activeError) return '';
    const isAppErr = this._activeError.type === 'application';

    return `
      <div class="login-error-banner ${isAppErr ? 'err-application' : 'err-access'}" role="alert">
        <div class="err-icon">${isAppErr ? '&#9888;' : '&#128274;'}</div>
        <div class="err-content">
          <div class="err-head">
            <strong>${this._activeError.title}</strong>
            <span class="err-code">${this._activeError.code}</span>
          </div>
          <p class="err-desc">${this._activeError.message}</p>
          ${
            isAppErr
              ? `<div class="err-actions">
                  <button type="button" class="err-btn" data-diag-modal>Ver Diagnóstico Técnico</button>
                  <button type="button" class="err-btn" data-clear-err>Tentar Novamente</button>
                </div>`
              : ''
          }
        </div>
        <button type="button" class="err-close" data-clear-err title="Fechar Alerta">&times;</button>
      </div>
    `;
  }

  _renderModel1() {
    return `
      <!-- MODELO 1: Creative Cloud / InDesign Desktop Splash Screen -->
      <div class="login-card model-1">
        <div class="m1-artwork">
          <div class="m1-brand-row">
            <span class="badge-id">Id</span>
            <div>
              <div class="m1-suite-title">CortexUI Creative Suite</div>
              <div class="m1-suite-sub">2026 Release • v4.0.2 (64-bit)</div>
            </div>
          </div>

          <div class="m1-vector-hero">
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>
            <div class="hero-quote">
              <h3>Desktop Precision.<br/>Web Native Power.</h3>
              <p>Motor Canvas 2D DPR, Web Components encapsulados e reatividade a 60 FPS.</p>
            </div>
          </div>

          <div class="m1-footer-meta">
            <span><span class="dot-ok"></span> License Server Online</span>
            <span>GPU Canvas 2D</span>
          </div>
        </div>

        <form class="m1-form" data-login-form="Creative Splash">
          <div class="form-head">
            <h2>Sign In</h2>
            <p>Entre com sua Cortex ID para sincronizar workspaces e plugins.</p>
          </div>

          ${this._renderErrorAlert()}

          <label class="field">
            <span>E-mail Corporativo ou Cortex ID</span>
            <div class="input-box ${this._activeError ? 'input-err' : ''}">
              <input type="email" name="email" value="elton.alves@cortexui.dev" required />
            </div>
          </label>

          <label class="field">
            <div class="row-between">
              <span>Senha</span>
              <a href="#recover" class="link-sm" data-recover>Esqueceu a senha?</a>
            </div>
            <div class="input-box ${this._activeError ? 'input-err' : ''}">
              <input
                type="${this._showPassword ? 'text' : 'password'}"
                name="password"
                value="••••••••••••"
                required
              />
              <button type="button" class="eye-btn" data-toggle-pass title="Mostrar/Ocultar Senha">
                ${this._showPassword ? '&#128584;' : '&#128065;'}
              </button>
            </div>
          </label>

          <label class="chk-row">
            <input type="checkbox" checked />
            <span>Manter sessão ativa nesta estação de trabalho</span>
          </label>

          <button type="submit" class="btn-submit">Autenticar no Workspace &rarr;</button>

          <div class="sso-divider"><span>ou continue com SSO</span></div>

          <div class="sso-grid">
            <button type="button" class="btn-sso" data-sso="Google">G &nbsp;Google</button>
            <button type="button" class="btn-sso" data-sso="GitHub">&#128187; &nbsp;GitHub</button>
          </div>
        </form>
      </div>
    `;
  }

  _renderModel2() {
    return `
      <!-- MODELO 2: Enterprise ERP & Financial Terminal -->
      <div class="login-card model-2">
        <div class="m2-HeaderBar">
          <div class="m2-title">
            <span class="status-pill">PRODUCTION</span>
            <span>CORTEX ENTERPRISE ERP — ACESSO SEGURO</span>
          </div>
          <span class="mono-sm">TLS 1.3 • AES-256</span>
        </div>

        <div class="m2-body">
          <div class="m2-telemetry">
            <div class="sec-label">DIAGNÓSTICO DE INFRAESTRUTURA</div>
            <div class="metric-card">
              <div class="row-between">
                <span>Cluster (SA-East)</span>
                <span class="txt-green">&#9679; 99.99% Online</span>
              </div>
              <div class="bar-track"><div class="bar-fill" style="width: 92%;"></div></div>
            </div>

            <div class="metric-card">
              <div class="row-between">
                <span>Latência do Barramento</span>
                <span class="mono-sm">11.4 ms</span>
              </div>
              <div class="bar-track"><div class="bar-fill cyan" style="width: 35%;"></div></div>
            </div>

            <div class="sec-label" style="margin-top: 6px;">MÓDULOS HABILITADOS</div>
            <ul class="erp-modules">
              <li>&#10003; Controle Financeiro &amp; Contábil</li>
              <li>&#10003; Faturamento &amp; Emissão Fiscal (NFe)</li>
              <li>&#10003; Business Intelligence &amp; Data Grid</li>
              <li>&#10003; Auditoria &amp; Controle RBAC</li>
            </ul>
          </div>

          <form class="m2-form" data-login-form="Enterprise ERP">
            <div class="form-head">
              <h2>Credenciais do Operador</h2>
              <p>Selecione a filial e informe seu token de operador.</p>
            </div>

            ${this._renderErrorAlert()}

            <div class="grid-2-col">
              <label class="field">
                <span>Ambiente</span>
                <select class="select-box" name="env">
                  <option>Produção (Principal)</option>
                  <option>Homologação (QA)</option>
                  <option>Sandbox Local</option>
                </select>
              </label>
              <label class="field">
                <span>Unidade / Filial</span>
                <select class="select-box" name="branch">
                  <option>001 — Matriz SP</option>
                  <option>002 — Filial PR</option>
                  <option>003 — Unidade US</option>
                </select>
              </label>
            </div>

            <label class="field">
              <span>Matrícula / Usuário AD</span>
              <div class="input-box ${this._activeError ? 'input-err' : ''}">
                <span class="in-prefix">CORP\\</span>
                <input type="text" name="username" value="elton.arquitetura" required />
              </div>
            </label>

            <div class="grid-2-col">
              <label class="field">
                <span>Senha</span>
                <div class="input-box ${this._activeError ? 'input-err' : ''}">
                  <input type="${this._showPassword ? 'text' : 'password'}" name="password" value="••••••••••" required />
                </div>
              </label>
              <label class="field">
                <span>Token 2FA (Opcional)</span>
                <div class="input-box">
                  <input type="text" placeholder="000 000" maxlength="7" class="mono-sm" />
                </div>
              </label>
            </div>

            <button type="submit" class="btn-submit">Iniciar Sessão no ERP</button>
          </form>
        </div>
      </div>
    `;
  }

  _renderModel3() {
    return `
      <!-- MODELO 3: Minimal Glassmorphism (VS Code / Linear / Raycast Pro) -->
      <div class="login-card model-3">
        <form class="m3-inner" data-login-form="Minimal Glass">
          <div class="m3-logo-circle">Cx</div>
          <h2>Bem-vindo ao CortexUI</h2>
          <p class="sub">Autenticação rápida para desenvolvedores e equipes de produto.</p>

          ${this._renderErrorAlert()}

          <button type="button" class="btn-passkey" data-sso="Passkey Biometrics">
            &#128273; &nbsp;Entrar com Passkey / Biometria
          </button>

          <div class="sso-divider"><span>ou use seu e-mail</span></div>

          <label class="field">
            <span>Endereço de E-mail</span>
            <div class="input-box ${this._activeError ? 'input-err' : ''}">
              <input type="email" value="dev@cortexui.io" required />
              <span class="kbd-tag">&#9166;</span>
            </div>
          </label>

          <label class="field">
            <span>Senha de Acesso</span>
            <div class="input-box ${this._activeError ? 'input-err' : ''}">
              <input type="${this._showPassword ? 'text' : 'password'}" name="password" value="••••••••••••" required />
              <button type="button" class="eye-btn" data-toggle-pass>&#128065;</button>
            </div>
          </label>

          <button type="submit" class="btn-submit">Continuar para a Aplicação</button>

          <div class="m3-foot">
            <span>Pressione <kbd>Enter</kbd> para enviar ou <kbd>ESC</kbd> para voltar</span>
          </div>
        </form>
      </div>
    `;
  }

  _renderModel4() {
    const users = [
      { name: 'Elton Alves', role: 'Lead Software Engineer', initials: 'EA', color: '#1473e6' },
      { name: 'Admin DevOps', role: 'System Administrator', initials: 'AD', color: '#10b981' },
      { name: 'Guest Viewer', role: 'Read-Only Inspector', initials: 'GV', color: '#8b5cf6' }
    ];
    const activeUser = users.find((u) => u.name === this._selectedOsUser) || users[0];

    return `
      <!-- MODELO 4: Workstation Desktop OS Lock Screen (Multi-Perfil) -->
      <div class="login-card model-4">
        <div class="m4-topbar">
          <span>CortexOS Workstation 4.0</span>
          <span>&#128246; 10Gbps &nbsp;&bull;&nbsp; &#128267; 100%</span>
        </div>

        <div class="m4-center">
          <div class="m4-clock">09:42</div>
          <div class="m4-date">Quarta-feira, 28 de Outubro</div>

          <div class="m4-profiles">
            ${users
              .map(
                (u) => `
              <button
                type="button"
                class="os-user-card ${u.name === activeUser.name ? 'active' : ''}"
                data-os-user="${u.name}"
              >
                <div class="os-avatar" style="background:${u.color};">${u.initials}</div>
                <div class="os-user-info">
                  <strong>${u.name}</strong>
                  <span>${u.role}</span>
                </div>
              </button>
            `
              )
              .join('')}
          </div>

          <div style="width: min(100%, 420px);">
            ${this._renderErrorAlert()}
          </div>

          <form class="m4-auth-row" data-login-form="Workstation OS (${activeUser.name})">
            <div class="input-box m4-pin-box ${this._activeError ? 'input-err' : ''}">
              <input
                type="${this._showPassword ? 'text' : 'password'}"
                name="password"
                placeholder="PIN ou Senha de ${activeUser.name}..."
                value="••••••••"
                required
              />
              <button type="submit" class="m4-go-btn" title="Desbloquear Sessão">&rarr;</button>
            </div>
          </form>
        </div>

        <div class="m4-bottombar">
          <button type="button" class="os-act" data-sso="Switch Domain">&#128260; Trocar Domínio</button>
          <button type="button" class="os-act" data-close-showcase>&#9211; Voltar ao App</button>
        </div>
      </div>
    `;
  }

  _renderModel5() {
    return `
      <!-- MODELO 5: Developer Cloud IDE & DevOps CLI Auth -->
      <div class="login-card model-5">
        <div class="m5-header">
          <div class="term-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="m5-header-title">
            <span class="m5-branch-badge">&#9741; main</span>
            <span>cortex-cloud-ide — auth-gateway</span>
          </div>
          <span class="status-pill">SSH / OAUTH 2.1</span>
        </div>

        <div class="m5-body">
          <div class="m5-dev-sidebar">
            <div>
              <div class="sec-label">DEVELOPER WORKSPACE</div>
              <h3 class="m5-side-title">Cortex Cloud Engine</h3>
              <p class="m5-side-desc">
                Conecte sua IDE local, repositórios Git e pipelines CI/CD com isolamento de containers.
              </p>
            </div>

            <div class="m5-cli-box">
              <div class="row-between" style="margin-bottom: 6px;">
                <span class="sec-label">LOGIN VIA TERMINAL CLI</span>
                <span class="txt-green">Ed25519 Verified</span>
              </div>
              <code class="cli-code">$ npx cortex-ui login --sso</code>
            </div>

            <div class="m5-specs">
              <div class="spec-item">
                <span class="spec-k">REGIÃO</span>
                <span class="spec-v">sa-east-1 (SP)</span>
              </div>
              <div class="spec-item">
                <span class="spec-k">RUNTIME</span>
                <span class="spec-v">Node 24 + Canvas 2D</span>
              </div>
              <div class="spec-item">
                <span class="spec-k">LATÊNCIA</span>
                <span class="spec-v txt-green">9.2 ms</span>
              </div>
            </div>
          </div>

          <form class="m5-form" data-login-form="Developer Cloud IDE">
            ${this._renderErrorAlert()}

            <div class="sso-grid">
              <button type="button" class="btn-sso" data-sso="GitHub Dev">
                &#128187; &nbsp;GitHub OAuth
              </button>
              <button type="button" class="btn-sso" data-sso="GitLab Dev">
                &#128736; &nbsp;GitLab SSO
              </button>
            </div>

            <div class="sso-divider"><span>ou autentique com chave de desenvolvedor</span></div>

            <label class="field">
              <span>Developer Handle / E-mail</span>
              <div class="input-box ${this._activeError ? 'input-err' : ''}">
                <span class="in-prefix">@</span>
                <input type="text" value="elton.alves" class="mono-sm" required />
              </div>
            </label>

            <label class="field">
              <div class="row-between">
                <span>Personal Access Token / SSH Passphrase</span>
                <span class="mono-sm" style="color: var(--text-muted);">SHA-256</span>
              </div>
              <div class="input-box ${this._activeError ? 'input-err' : ''}">
                <input
                  type="${this._showPassword ? 'text' : 'password'}"
                  name="password"
                  value="ghp_CortexDevToken982341xYz"
                  class="mono-sm"
                  required
                />
                <button type="button" class="eye-btn" data-toggle-pass>
                  ${this._showPassword ? '&#128584;' : '&#128065;'}
                </button>
              </div>
            </label>

            <div class="field">
              <div class="row-between">
                <span>Authenticator 2FA (6 dígitos)</span>
                <span class="txt-green">TOTP Ativo</span>
              </div>
              <div class="otp-row">
                <input type="text" maxlength="1" value="4" aria-label="Digit 1" />
                <input type="text" maxlength="1" value="8" aria-label="Digit 2" />
                <input type="text" maxlength="1" value="2" aria-label="Digit 3" />
                <input type="text" maxlength="1" value="9" aria-label="Digit 4" />
                <input type="text" maxlength="1" value="1" aria-label="Digit 5" />
                <input type="text" maxlength="1" value="0" aria-label="Digit 6" />
              </div>
            </div>

            <button type="submit" class="btn-submit m5-submit-btn">
              &#9889; Conectar ao Cluster de Desenvolvimento
            </button>
          </form>
        </div>
      </div>
    `;
  }

  _renderModel6() {
    return `
      <!-- MODELO 6: Bento Grid Studio + QR Code Mobile Instant Auth -->
      <div class="login-card model-6">
        <div class="bento-grid">
          <form class="bento-cell bento-main" data-login-form="Bento Studio">
            <div class="row-between">
              <span class="badge-id">Cx</span>
              <span class="status-pill">STUDIO PRO</span>
            </div>
            <h2>Cortex Studio Hub</h2>
            <p class="sub">Acesse seus projetos, componentes e nuvem colaborativa.</p>

            ${this._renderErrorAlert()}

            <label class="field">
              <span>Conta Studio</span>
              <div class="input-box ${this._activeError ? 'input-err' : ''}">
                <input type="email" value="studio@cortexui.design" required />
              </div>
            </label>

            <label class="field">
              <span>Senha</span>
              <div class="input-box ${this._activeError ? 'input-err' : ''}">
                <input type="${this._showPassword ? 'text' : 'password'}" name="password" value="••••••••••" required />
              </div>
            </label>

            <button type="submit" class="btn-submit">Entrar no Studio</button>
          </form>

          <div class="bento-cell bento-qr">
            <div class="sec-label">LOGIN COM QR CODE</div>
            <div class="qr-mock" title="QR Code Simulado em SVG">
              <svg viewBox="0 0 100 100" width="92" height="92">
                <rect width="100" height="100" fill="#ffffff" rx="6"/>
                <rect x="10" y="10" width="26" height="26" fill="#18181b"/>
                <rect x="15" y="15" width="16" height="16" fill="#ffffff"/>
                <rect x="19" y="19" width="8" height="8" fill="#1473e6"/>
                <rect x="64" y="10" width="26" height="26" fill="#18181b"/>
                <rect x="69" y="15" width="16" height="16" fill="#ffffff"/>
                <rect x="73" y="19" width="8" height="8" fill="#18181b"/>
                <rect x="10" y="64" width="26" height="26" fill="#18181b"/>
                <rect x="15" y="69" width="16" height="16" fill="#ffffff"/>
                <rect x="19" y="73" width="8" height="8" fill="#18181b"/>
                <rect x="44" y="14" width="12" height="12" fill="#18181b"/>
                <rect x="42" y="42" width="16" height="16" fill="#1473e6" rx="2"/>
                <rect x="66" y="46" width="20" height="8" fill="#18181b"/>
                <rect x="44" y="66" width="10" height="22" fill="#18181b"/>
                <rect x="62" y="64" width="26" height="10" fill="#18181b"/>
                <rect x="62" y="80" width="14" height="10" fill="#18181b"/>
              </svg>
            </div>
            <p class="qr-desc">Escaneie com o app <strong>Cortex Authenticator</strong> no celular para entrar sem digitar senha.</p>
          </div>

          <div class="bento-cell bento-news">
            <div class="row-between" style="flex-wrap: wrap; gap: 4px;">
              <span class="sec-label">NOVIDADES NA VERSÃO 4.0</span>
              <span class="txt-green">&#9679; Todos os Serviços Operacionais</span>
            </div>
            <div class="news-pills">
              <span class="news-tag">Novo Seletor HSV 2D</span>
              <span class="news-tag">Font Picker com Preview</span>
              <span class="news-tag">Data Grid &amp; TreeView MDI</span>
              <span class="news-tag">Command Palette (Ctrl+K)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderModel7() {
    return `
      <!-- MODELO 7 (NOVO): MedTech / Clinical PACS & BioLab Workstation -->
      <div class="login-card model-7">
        <div class="m7-top-ribbon">
          <div class="row-between">
            <div class="m7-brand">
              <span class="m7-cross">+</span>
              <div>
                <strong>CortexMed PACS &amp; BioLab Workstation</strong>
                <span class="m7-sub">DICOM 3.0 Imaging &amp; Prontuário Eletrônico Hospitalar</span>
              </div>
            </div>
            <div class="m7-badges">
              <span class="hipaa-badge">HIPAA / LGPD</span>
              <span class="smartcard-badge">&#128179; e-CPF / SmartCard Ready</span>
            </div>
          </div>
        </div>

        <form class="m7-form" data-login-form="MedTech Clinical PACS">
          ${this._renderErrorAlert()}

          <div class="grid-2-col">
            <label class="field">
              <span>Unidade Hospitalar / Laboratório</span>
              <select class="select-box">
                <option>Hospital Central — Diagnóstico por Imagem</option>
                <option>UTI Cardiológica &amp; Monitoramento</option>
                <option>Laboratório de Genômica &amp; Patologia</option>
              </select>
            </label>
            <label class="field">
              <span>Conselho Profissional (CRM / COREN / CRF)</span>
              <div class="input-box ${this._activeError ? 'input-err' : ''}">
                <span class="in-prefix">CRM-SP</span>
                <input type="text" value="194820" required />
              </div>
            </label>
          </div>

          <div class="grid-2-col">
            <label class="field">
              <span>Identificação do Médico / Especialista</span>
              <div class="input-box ${this._activeError ? 'input-err' : ''}">
                <input type="text" value="dr.elton.alves" required />
              </div>
            </label>
            <label class="field">
              <span>PIN do Certificado Digital / Senha</span>
              <div class="input-box ${this._activeError ? 'input-err' : ''}">
                <input type="${this._showPassword ? 'text' : 'password'}" name="password" value="••••••••••" required />
                <button type="button" class="eye-btn" data-toggle-pass>&#128065;</button>
              </div>
            </label>
          </div>

          <div class="m7-actions">
            <button type="submit" class="btn-submit m7-btn-teal">
              &#129658; Autenticar com Certificado Clínico
            </button>
            <button type="button" class="btn-sso m7-btn-emergency" data-sso="Plantão de Emergência (Break-Glass)">
              &#128680; Acesso de Emergência (UTI)
            </button>
          </div>
        </form>
      </div>
    `;
  }

  _renderModel8() {
    return `
      <!-- MODELO 8 (NOVO): Quant Trading & Institutional Bloomberg Desk -->
      <div class="login-card model-8">
        <!-- Barra de Cotações (Live Market Ticker) -->
        <div class="m8-ticker">
          <span><b>IBOV</b> 131.420 <i class="up">&#9650; +0.84%</i></span>
          <span><b>S&amp;P 500</b> 5,985.40 <i class="up">&#9650; +1.12%</i></span>
          <span><b>USD/BRL</b> 5.1420 <i class="down">&#9660; -0.41%</i></span>
          <span><b>BTC/USD</b> 94,810 <i class="up">&#9650; +3.25%</i></span>
          <span><b>DI1F29</b> 11.85% <i class="down">&#9660; -0.08%</i></span>
        </div>

        <div class="m8-body">
          <div class="m8-market-panel">
            <div class="row-between">
              <span class="sec-label" style="color:#f59e0b;">CORTEX QUANT TERMINAL</span>
              <span class="mono-sm txt-green">FIX 4.4 CONNECTED</span>
            </div>

            <!-- Gráfico Sparkline Institucional em SVG -->
            <div class="m8-chart-box">
              <div class="row-between" style="margin-bottom:4px;">
                <span class="mono-sm">LIQUIDEZ AGREGADA (24H)</span>
                <span class="mono-sm" style="color:#f59e0b;">$4.82B VOL</span>
              </div>
              <svg viewBox="0 0 240 64" width="100%" height="64">
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <path d="M0 52 L30 44 L60 48 L90 28 L120 34 L150 18 L180 24 L210 10 L240 6 L240 64 L0 64 Z" fill="url(#goldGrad)"/>
                <path d="M0 52 L30 44 L60 48 L90 28 L120 34 L150 18 L180 24 L210 10 L240 6" fill="none" stroke="#f59e0b" stroke-width="2"/>
              </svg>
            </div>

            <div class="m8-anti-phishing">
              <span class="sec-label">SELO ANTI-PHISHING VERIFICADO</span>
              <div class="phish-phrase">&#128272; Frase Secreta: <strong>"FALCON-OMEGA-92"</strong></div>
            </div>
          </div>

          <form class="m8-form" data-login-form="Quant Trading Desk">
            <div class="form-head">
              <h2>Institutional Desk Login</h2>
              <p>Acesso restrito a operadores de mesa proprietária e tesouraria.</p>
            </div>

            ${this._renderErrorAlert()}

            <label class="field">
              <span>Mesa de Operação (Trading Desk)</span>
              <select class="select-box">
                <option>Mesa Institucional — Renda Variável &amp; Derivativos</option>
                <option>Tesouraria Internacional — FX &amp; Commodities</option>
                <option>Algoritmos HFT &amp; Execução Automatizada</option>
              </select>
            </label>

            <div class="grid-2-col">
              <label class="field">
                <span>ID do Trader / B3 Operator</span>
                <div class="input-box ${this._activeError ? 'input-err' : ''}">
                  <input type="text" value="TRD-8841-EA" class="mono-sm" required />
                </div>
              </label>
              <label class="field">
                <span>Chave de Execução (PIN)</span>
                <div class="input-box ${this._activeError ? 'input-err' : ''}">
                  <input type="${this._showPassword ? 'text' : 'password'}" name="password" value="••••••••" required />
                </div>
              </label>
            </div>

            <button type="submit" class="btn-submit m8-btn-gold">
              &#128200; Desbloquear Terminal de Ordens
            </button>
          </form>
        </div>
      </div>
    `;
  }

  _renderModel9() {
    const step = this._wizardStep || 1;

    return `
      <!-- MODELO 9 (NOVO): Zero-Trust Step-by-Step Security Wizard -->
      <div class="login-card model-9">
        <div class="m9-stepper">
          <div class="step-item ${step >= 1 ? 'active' : ''}">
            <span class="step-num">1</span>
            <span>Identidade</span>
          </div>
          <div class="step-line ${step >= 2 ? 'active' : ''}"></div>
          <div class="step-item ${step >= 2 ? 'active' : ''}">
            <span class="step-num">2</span>
            <span>Postura do Dispositivo</span>
          </div>
          <div class="step-line ${step >= 3 ? 'active' : ''}"></div>
          <div class="step-item ${step >= 3 ? 'active' : ''}">
            <span class="step-num">3</span>
            <span>Sessão Zero-Trust</span>
          </div>
        </div>

        <form class="m9-form" data-login-form="Zero-Trust Wizard">
          <div class="row-between">
            <div>
              <h2>Verificação Zero-Trust</h2>
              <p>Validação de conformidade do dispositivo antes da conexão.</p>
            </div>
            <span class="status-pill">ETAPA ${step} DE 3</span>
          </div>

          ${this._renderErrorAlert()}

          <div class="m9-posture-grid">
            <div class="posture-chip ok">
              <span>&#10003; Firewall Ativo</span>
            </div>
            <div class="posture-chip ok">
              <span>&#10003; Disco Criptografado</span>
            </div>
            <div class="posture-chip ok">
              <span>&#10003; Certificado TLS Válido</span>
            </div>
          </div>

          <label class="field">
            <span>Identidade Federada (Zero-Trust ID)</span>
            <div class="input-box ${this._activeError ? 'input-err' : ''}">
              <input type="email" value="elton.alves@corp.cortexui.com" required />
            </div>
          </label>

          <label class="field">
            <span>Credencial de Domínio / Senha Mestre</span>
            <div class="input-box ${this._activeError ? 'input-err' : ''}">
              <input type="${this._showPassword ? 'text' : 'password'}" name="password" value="••••••••••••" required />
              <button type="button" class="eye-btn" data-toggle-pass>&#128065;</button>
            </div>
          </label>

          <div class="sso-grid">
            <button type="button" class="btn-sso" data-step-prev ${step <= 1 ? 'disabled style="opacity:0.4;"' : ''}>
              &larr; Etapa Anterior
            </button>
            <button type="submit" class="btn-submit" style="margin-top:0;">
              ${step < 3 ? 'Avançar Verificação &rarr;' : '&#10003; Concluir &amp; Entrar'}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  _renderModel10() {
    return `
      <!-- MODELO 10 (NOVO): 3D CAD / Engineering & Digital Twin Launcher -->
      <div class="login-card model-10">
        <!-- Cabeçalho Blueprint Wireframe CAD -->
        <div class="m10-blueprint">
          <div class="row-between">
            <div>
              <span class="m10-tag">AUTODESK / CAD ENGINE STYLE</span>
              <h2 style="color:#ffffff; margin-top:4px;">CortexCAD &amp; Digital Twin 2026</h2>
            </div>
            <div class="m10-gpu-badge">
              <span>&#9881; GPU WORKSTATION READY</span>
              <small>60 FPS Vector &amp; Mesh Pipeline</small>
            </div>
          </div>
        </div>

        <form class="m10-form" data-login-form="3D CAD Launcher">
          ${this._renderErrorAlert()}

          <div class="grid-2-col">
            <label class="field">
              <span>Servidor de Licença Flutuante (FlexNet)</span>
              <select class="select-box">
                <option>27000@licenses.cortexcad.internal (Ativo)</option>
                <option>Licença Nuvem Individual (Named User)</option>
                <option>Modo Offline Temporário (30 dias)</option>
              </select>
            </label>
            <label class="field">
              <span>Abrir Projeto Recente ao Iniciar</span>
              <select class="select-box">
                <option>Turbina_Aeroespacial_v4.cortex</option>
                <option>Planta_Industrial_BIM_2026.cortex</option>
                <option>Novo Desenho Técnico em Branco</option>
              </select>
            </label>
          </div>

          <div class="grid-2-col">
            <label class="field">
              <span>Engenheiro Responsável (CREA / ID)</span>
              <div class="input-box ${this._activeError ? 'input-err' : ''}">
                <input type="text" value="eng.elton.alves" required />
              </div>
            </label>
            <label class="field">
              <span>Chave de Acesso CAD</span>
              <div class="input-box ${this._activeError ? 'input-err' : ''}">
                <input type="${this._showPassword ? 'text' : 'password'}" name="password" value="••••••••••" required />
                <button type="button" class="eye-btn" data-toggle-pass>&#128065;</button>
              </div>
            </label>
          </div>

          <button type="submit" class="btn-submit m10-btn-orange">
            &#128736; Alocar Licença &amp; Iniciar Estação CAD
          </button>
        </form>
      </div>
    `;
  }

  _renderSelectedModel() {
    switch (String(this._model)) {
      case '1': return this._renderModel1();
      case '2': return this._renderModel2();
      case '3': return this._renderModel3();
      case '4': return this._renderModel4();
      case '5': return this._renderModel5();
      case '6': return this._renderModel6();
      case '7': return this._renderModel7();
      case '8': return this._renderModel8();
      case '9': return this._renderModel9();
      case '10': return this._renderModel10();
      default: return this._renderModel1();
    }
  }

  render() {
    const currentTheme = AppState.get('theme') || 'dark';
    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}
        .login-overlay {
          display: ${this._isOpen ? 'flex' : 'none'};
          flex-direction: column;
          position: fixed;
          inset: 0;
          background: var(--bg-login-stage, #121215);
          z-index: 8900;
          overflow-y: auto;
          overflow-x: hidden;
          transition: background 180ms ease;
        }

        /* Barra Superior de Alternância dos 10 Modelos + Simulador de Erros */
        .showcase-switcher {
          display: flex;
          flex-direction: column;
          padding: 8px 14px;
          background-color: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          gap: 8px;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .switcher-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .switcher-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-primary);
        }

        .error-simulator {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sim-label {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .sim-select {
          height: 26px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          font-size: 11px;
          padding: 0 8px;
          outline: none;
          cursor: pointer;
        }

        .sim-select.has-err {
          border-color: var(--status-error);
          color: #fca5a5;
          background-color: rgba(239, 68, 68, 0.12);
        }

        .model-pills {
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
          max-width: 100%;
          padding-bottom: 2px;
        }

        .model-tab {
          height: 26px;
          padding: 0 10px;
          border-radius: var(--radius-xs);
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          color: var(--text-secondary);
          font-size: 11px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }

        .model-tab:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .model-tab.active {
          background-color: var(--accent-blue);
          border-color: var(--accent-blue);
          color: #ffffff;
          font-weight: 600;
        }

        .close-showcase {
          height: 26px;
          padding: 0 10px;
          border-radius: var(--radius-xs);
          background-color: var(--bg-elevated);
          border: 1px solid var(--border-input);
          color: var(--text-primary);
          font-size: 11px;
          white-space: nowrap;
        }

        .close-showcase:hover {
          background-color: var(--status-error);
          border-color: var(--status-error);
          color: #ffffff;
        }

        .stage-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px 16px;
          width: 100%;
        }

        /* ================= SISTEMA DE MENSAGENS DE ERRO (ACESSO & APLICAÇÃO) ================= */
        .login-error-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          line-height: 1.4;
          width: 100%;
          animation: errSlideDown 160ms ease-out;
        }

        @keyframes errSlideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Erro de Acesso (401 / 403): Vermelho/Coral */
        .login-error-banner.err-access {
          background-color: var(--err-access-bg, rgba(239, 68, 68, 0.14));
          border: 1px solid rgba(239, 68, 68, 0.55);
          border-left: 3px solid #ef4444;
          color: var(--err-access-text, #fecaca);
        }

        /* Erro de Aplicação / Servidor (500 / 503): Âmbar/Laranja Alerta */
        .login-error-banner.err-application {
          background-color: var(--err-app-bg, rgba(245, 158, 11, 0.14));
          border: 1px solid rgba(245, 158, 11, 0.55);
          border-left: 3px solid #f59e0b;
          color: var(--err-app-text, #fde68a);
        }

        .err-icon {
          font-size: 15px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .err-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .err-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          flex-wrap: wrap;
        }

        .err-head strong {
          color: var(--err-title-text, #ffffff);
          font-size: 11px;
        }

        .err-code {
          font-family: var(--font-mono);
          font-size: 9px;
          padding: 1px 5px;
          border-radius: 2px;
          background: rgba(0, 0, 0, 0.18);
          color: inherit;
          font-weight: 700;
        }

        .err-desc {
          margin: 0;
          font-size: 11px;
          color: inherit;
          opacity: 0.92;
        }

        .err-actions {
          display: flex;
          gap: 6px;
          margin-top: 6px;
          flex-wrap: wrap;
        }

        .err-btn {
          height: 22px;
          padding: 0 8px;
          border-radius: 3px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
        }

        .err-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .err-close {
          color: inherit;
          opacity: 0.7;
          font-size: 14px;
          line-height: 1;
          padding: 0 2px;
        }

        .err-close:hover {
          opacity: 1;
        }

        .input-box.input-err {
          border-color: rgba(239, 68, 68, 0.75);
        }

        @keyframes shakeCard {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }

        .login-card.shake-error {
          animation: shakeCard 320ms ease-in-out;
        }

        /* ================= ESTILOS BASE DOS CARDS ================= */
        .login-card {
          width: 100%;
          background-color: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75);
          overflow: hidden;
          animation: cardFadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-card *,
        .bento-grid * {
          min-width: 0;
        }

        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        h2 {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        p {
          margin: 0;
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 11px;
          color: var(--text-secondary);
          width: 100%;
        }

        .input-box {
          display: flex;
          align-items: center;
          width: 100%;
          height: 34px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          padding: 0 10px;
          transition: border-color var(--transition-fast);
        }

        .input-box:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 1px var(--border-focus);
        }

        .input-box input {
          flex: 1;
          width: 100%;
          min-width: 0;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 12px;
          outline: none;
        }

        .select-box {
          width: 100%;
          height: 34px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          font-size: 12px;
          padding: 0 8px;
          outline: none;
        }

        .in-prefix {
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 11px;
          margin-right: 4px;
          flex-shrink: 0;
        }

        .eye-btn {
          color: var(--text-muted);
          font-size: 13px;
          padding: 0 4px;
          flex-shrink: 0;
        }

        .row-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .link-sm {
          color: var(--accent-text);
          text-decoration: none;
          font-size: 11px;
          font-weight: 500;
        }

        .chk-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .chk-row input {
          accent-color: var(--accent-blue);
          flex-shrink: 0;
        }

        .btn-submit {
          width: 100%;
          height: 36px;
          background-color: var(--accent-blue);
          color: #ffffff;
          border-radius: var(--radius-xs);
          box-shadow: var(--btn-bevel-shadow);
          font-weight: 600;
          font-size: 12px;
          transition: background var(--transition-fast);
          margin-top: 4px;
          padding: 0 12px;
        }

        .btn-submit:hover {
          background-color: var(--accent-blue-hover);
        }

        .sso-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-muted);
          font-size: 10px;
          margin: 2px 0;
        }

        .sso-divider::before,
        .sso-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-subtle);
        }

        .sso-divider span {
          padding: 0 8px;
        }

        .sso-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          width: 100%;
        }

        .btn-sso {
          width: 100%;
          height: 32px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          font-size: 11px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .btn-sso:hover {
          background-color: var(--bg-hover);
        }

        .badge-id {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 5px;
          background-color: #2c1320;
          border: 1px solid #f43f5e;
          color: #fb7185;
          font-weight: 700;
          font-size: 13px;
          flex-shrink: 0;
        }

        /* Modelos 1 a 6 */
        .model-1 { max-width: 720px; display: grid; grid-template-columns: 320px 1fr; }
        .m1-artwork {
          background: linear-gradient(155deg, #161822 0%, #0f172a 55%, #1e1b4b 100%);
          border-right: 1px solid var(--border-subtle);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .m1-brand-row { display: flex; align-items: center; gap: 10px; z-index: 2; }
        .m1-suite-title { font-weight: 700; font-size: 13px; color: #ffffff; }
        .m1-suite-sub { font-size: 10px; color: #94a3b8; }
        .m1-vector-hero { position: relative; padding: 24px 0; z-index: 2; }
        .m1-vector-hero h3 { margin: 0 0 8px; font-size: 20px; line-height: 1.2; color: #ffffff; }
        .orb { position: absolute; border-radius: 50%; filter: blur(28px); pointer-events: none; }
        .orb-1 { width: 120px; height: 120px; background: rgba(20, 115, 230, 0.45); top: -10px; right: -20px; }
        .orb-2 { width: 90px; height: 90px; background: rgba(236, 72, 153, 0.35); bottom: 0; left: 10px; }
        .m1-footer-meta { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #94a3b8; z-index: 2; gap: 8px; }
        .dot-ok { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--status-ok); margin-right: 4px; }
        .m1-form { padding: 24px; display: flex; flex-direction: column; gap: 13px; }

        .model-2 { max-width: 720px; display: flex; flex-direction: column; }
        .m2-HeaderBar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 16px; background: var(--bg-panel-header); border-bottom: 1px solid var(--border-subtle); font-size: 11px; flex-wrap: wrap; }
        .m2-title { display: flex; align-items: center; gap: 8px; font-weight: 600; flex-wrap: wrap; }
        .status-pill { background: rgba(16, 185, 129, 0.16); border: 1px solid #10b981; color: #34d399; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: var(--radius-xs); white-space: nowrap; }
        .m2-body { display: grid; grid-template-columns: 260px 1fr; }
        .m2-telemetry { padding: 20px; background: var(--bg-panel-header); border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 10px; }
        .sec-label { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; color: var(--text-muted); }
        .metric-card { background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); padding: 8px 10px; font-size: 11px; display: flex; flex-direction: column; gap: 6px; }
        .txt-green { color: #16a34a; font-size: 10px; font-weight: 600; }
        .bar-track { height: 4px; background: var(--border-subtle); border-radius: 2px; overflow: hidden; }
        .bar-fill { height: 100%; background: #22c55e; }
        .bar-fill.cyan { background: #06b6d4; }
        .erp-modules { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: var(--text-secondary); }
        .m2-form { padding: 22px; display: flex; flex-direction: column; gap: 12px; }
        .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }

        .model-3 { max-width: 400px; background: var(--bg-panel); backdrop-filter: blur(20px); border: 1px solid var(--border-input); }
        .m3-inner { padding: 26px; display: flex; flex-direction: column; gap: 12px; text-align: center; }
        .m3-inner .field { text-align: left; }
        .m3-logo-circle { width: 42px; height: 42px; border-radius: 10px; background: linear-gradient(135deg, var(--accent-blue), #06b6d4); color: #ffffff; font-weight: 800; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 4px; box-shadow: 0 8px 20px var(--accent-blue-alpha); }
        .btn-passkey { width: 100%; height: 34px; background: var(--bg-input); border: 1px solid var(--border-input); border-radius: var(--radius-xs); color: var(--text-primary); font-size: 11px; font-weight: 500; box-shadow: var(--btn-bevel-shadow); }
        .kbd-tag { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); background: var(--bg-panel); padding: 1px 5px; border-radius: 3px; flex-shrink: 0; }
        .m3-foot { font-size: 10px; color: var(--text-muted); margin-top: 4px; }

        .model-4 { max-width: 620px; min-height: 390px; background: var(--bg-panel); display: flex; flex-direction: column; justify-content: space-between; }
        .m4-topbar, .m4-bottombar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: var(--bg-panel-header); border-bottom: 1px solid var(--border-subtle); font-size: 11px; color: var(--text-secondary); gap: 8px; flex-wrap: wrap; }
        .m4-bottombar { border-bottom: none; border-top: 1px solid var(--border-subtle); }
        .m4-center { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 20px 16px; }
        .m4-clock { font-size: 40px; font-weight: 300; letter-spacing: -0.03em; color: var(--text-primary); line-height: 1; }
        .m4-date { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
        .m4-profiles { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; width: 100%; }
        .os-user-card { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-input); border-radius: var(--radius-md); text-align: left; }
        .os-user-card.active { border-color: var(--accent-blue); background: var(--accent-blue-alpha); }
        .os-avatar { width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; color: #ffffff; flex-shrink: 0; }
        .os-user-info { display: flex; flex-direction: column; }
        .os-user-info strong { font-size: 12px; color: var(--text-primary); }
        .os-user-info span { font-size: 10px; color: var(--text-muted); }
        .m4-auth-row { width: min(100%, 310px); margin-top: 4px; }
        .m4-pin-box { padding-right: 4px; border-radius: var(--radius-pill); }
        .m4-go-btn { width: 26px; height: 26px; border-radius: 50%; background: var(--accent-blue); color: #ffffff; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .os-act { font-size: 11px; color: var(--text-secondary); }

        .model-5 { max-width: 720px; background: var(--bg-panel); border: 1px solid var(--border-input); }
        .m5-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 16px; background: var(--bg-panel-header); border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; }
        .m5-header-title { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); }
        .m5-branch-badge { background: var(--accent-blue-alpha); border: 1px solid var(--accent-blue); color: var(--accent-text); padding: 1px 6px; border-radius: var(--radius-xs); font-size: 10px; }
        .term-dots { display: flex; gap: 6px; flex-shrink: 0; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.red { background: #ef4444; }
        .dot.yellow { background: #f59e0b; }
        .dot.green { background: #22c55e; }
        .m5-body { display: grid; grid-template-columns: 270px 1fr; }
        .m5-dev-sidebar { padding: 22px; background: linear-gradient(180deg, #101216 0%, #151821 100%); border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; gap: 16px; }
        .m5-side-title { margin: 4px 0 6px; font-size: 16px; color: #ffffff; }
        .m5-side-desc { font-size: 11px; color: #9ca3af; line-height: 1.5; }
        .m5-cli-box { background: #0b0c0e; border: 1px solid #272a34; border-radius: var(--radius-sm); padding: 10px 12px; }
        .cli-code { display: block; font-family: var(--font-mono); font-size: 11px; color: #38bdf8; word-break: break-all; }
        .m5-specs { display: flex; flex-direction: column; gap: 6px; border-top: 1px solid #262932; padding-top: 12px; }
        .spec-item { display: flex; align-items: center; justify-content: space-between; font-size: 11px; }
        .spec-k { color: #9ca3af; font-size: 10px; font-weight: 600; }
        .spec-v { font-family: var(--font-mono); font-size: 11px; color: #e4e4e7; }
        .m5-form { padding: 22px; display: flex; flex-direction: column; gap: 12px; }
        .mono-sm { font-family: var(--font-mono); font-size: 11px; }
        .otp-row { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; width: 100%; }
        .otp-row input { width: 100%; min-width: 0; height: 36px; padding: 0; background: var(--bg-input); border: 1px solid var(--border-input); border-radius: var(--radius-xs); color: var(--accent-text); font-family: var(--font-mono); font-size: 14px; font-weight: 700; text-align: center; outline: none; }
        .m5-submit-btn { background: linear-gradient(90deg, #1473e6 0%, #0284c7 100%); }

        .model-6 { max-width: 660px; background: transparent; border: none; box-shadow: none; }
        .bento-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 12px; width: 100%; }
        .bento-cell { background: var(--bg-panel); border: 1px solid var(--border-input); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-dropdown); }
        .bento-main { display: flex; flex-direction: column; gap: 12px; }
        .bento-qr { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 10px; }
        .qr-mock { padding: 8px; background: #ffffff; border-radius: 8px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4); }
        .qr-desc { font-size: 11px; color: var(--text-secondary); }
        .bento-news { grid-column: 1 / -1; display: flex; flex-direction: column; gap: 8px; padding: 14px 20px; }
        .news-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .news-tag { background: var(--bg-input); border: 1px solid var(--border-input); border-radius: var(--radius-pill); padding: 3px 10px; font-size: 10px; color: var(--text-primary); }

        /* ================= MODELO 7: MedTech & BioLab PACS ================= */
        .model-7 {
          max-width: 660px;
          border-top: 3px solid #0d9488;
        }
        .m7-top-ribbon {
          padding: 14px 20px;
          background: linear-gradient(90deg, rgba(13, 148, 136, 0.16) 0%, rgba(20, 115, 230, 0.06) 100%);
          border-bottom: 1px solid var(--border-subtle);
        }
        .m7-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .m7-brand strong { display: block; font-size: 14px; color: var(--text-primary); }
        .m7-sub { font-size: 11px; color: #0d9488; font-weight: 600; }
        .m7-cross {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: #0d9488;
          color: #ffffff;
          font-size: 20px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .m7-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .hipaa-badge, .smartcard-badge {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: var(--radius-xs);
          font-weight: 600;
        }
        .hipaa-badge { background: rgba(13, 148, 136, 0.16); border: 1px solid #0d9488; color: #0d9488; }
        .smartcard-badge { background: var(--bg-input); border: 1px solid var(--border-input); color: var(--text-secondary); }
        .m7-form { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
        .m7-actions { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; align-items: center; }
        .m7-btn-teal { background: #0d9488; margin-top: 0; }
        .m7-btn-teal:hover { background: #0f766e; }
        .m7-btn-emergency { height: 36px; border-color: rgba(239, 68, 68, 0.55); color: #dc2626; }
        .m7-btn-emergency:hover { background: rgba(239, 68, 68, 0.15); }

        /* ================= MODELO 8: Quant Trading Desk ================= */
        .model-8 {
          max-width: 720px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
        }
        .m8-ticker {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 7px 14px;
          background: #090a0c;
          color: #e4e4e7;
          border-bottom: 1px solid var(--border-subtle);
          font-family: var(--font-mono);
          font-size: 10px;
          overflow-x: auto;
          white-space: nowrap;
        }
        .m8-ticker i { font-style: normal; font-weight: 700; }
        .m8-ticker i.up { color: #22c55e; }
        .m8-ticker i.down { color: #ef4444; }
        .m8-body { display: grid; grid-template-columns: 270px 1fr; }
        .m8-market-panel {
          padding: 20px;
          background: #0e1013;
          color: #e4e4e7;
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 14px;
        }
        .m8-chart-box {
          background: #14161b;
          border: 1px solid #27272a;
          border-radius: var(--radius-xs);
          padding: 10px;
        }
        .m8-anti-phishing {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          border-radius: var(--radius-xs);
          padding: 8px 10px;
        }
        .phish-phrase { font-size: 11px; color: #fde68a; margin-top: 4px; }
        .m8-form { padding: 22px; display: flex; flex-direction: column; gap: 13px; }
        .m8-btn-gold { background: linear-gradient(90deg, #d97706 0%, #b45309 100%); }
        .m8-btn-gold:hover { background: #b45309; }

        /* ================= MODELO 9: Zero-Trust Step-by-Step Wizard ================= */
        .model-9 {
          max-width: 500px;
        }
        .m9-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 22px;
          background: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          gap: 8px;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .step-item.active { color: var(--text-primary); font-weight: 600; }
        .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }
        .step-item.active .step-num {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: #ffffff;
        }
        .step-line {
          flex: 1;
          height: 2px;
          background: var(--border-subtle);
        }
        .step-line.active { background: var(--accent-blue); }
        .m9-form { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
        .m9-posture-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .posture-chip {
          background: rgba(34, 197, 94, 0.14);
          border: 1px solid rgba(34, 197, 94, 0.45);
          color: #16a34a;
          font-weight: 600;
          font-size: 10px;
          padding: 5px 6px;
          border-radius: var(--radius-xs);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ================= MODELO 10: 3D CAD & Engineering Launcher ================= */
        .model-10 {
          max-width: 650px;
        }
        .m10-blueprint {
          padding: 20px 24px;
          background:
            linear-gradient(rgba(20, 115, 230, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 115, 230, 0.12) 1px, transparent 1px),
            linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          background-size: 18px 18px, 18px 18px, 100% 100%;
          border-bottom: 1px solid #334155;
        }
        .m10-tag {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #38bdf8;
          letter-spacing: 0.08em;
          font-weight: 700;
        }
        .m10-gpu-badge {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid #38bdf8;
          border-radius: var(--radius-xs);
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          text-align: right;
        }
        .m10-gpu-badge span { font-size: 10px; font-weight: 700; color: #38bdf8; }
        .m10-gpu-badge small { font-size: 9px; color: #94a3b8; }
        .m10-form { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
        .m10-btn-orange { background: #ea580c; }
        .m10-btn-orange:hover { background: #c2410c; }

        /* ================= RESPONSIVIDADE MOBILE & TABLET ================= */
        @media (max-width: 768px) {
          .stage-center {
            align-items: flex-start;
            padding: 12px 10px 28px;
          }

          .model-1,
          .m2-body,
          .m5-body,
          .m8-body,
          .bento-grid,
          .m7-actions {
            grid-template-columns: 1fr;
          }

          .m1-artwork,
          .m2-telemetry,
          .m5-dev-sidebar,
          .m8-market-panel {
            border-right: none;
            border-bottom: 1px solid var(--border-subtle);
            padding: 16px;
          }

          .m1-form,
          .m2-form,
          .m3-inner,
          .m5-form,
          .m7-form,
          .m8-form,
          .m9-form,
          .m10-form,
          .bento-cell {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .grid-2-col,
          .sso-grid,
          .m9-posture-grid {
            grid-template-columns: 1fr;
          }

          .os-user-card {
            width: 100%;
          }
        }
      </style>

      <div class="login-overlay" id="login-overlay">
        <!-- Barra Superior: 10 Modelos + Simulador de Erros de Acesso e Aplicação -->
        <div class="showcase-switcher">
          <div class="switcher-top-bar">
            <div class="switcher-title">
              <span class="badge-id" style="width:20px; height:20px; font-size:10px;">Cx</span>
              <span>CortexUI Login Suite — 10 Modelos Desktop</span>
            </div>

            <div class="error-simulator">
              <span class="sim-label">Tema UI:</span>
              <select class="sim-select" id="login-theme-select" title="Alternar Tema Visual (12 Temas)">
                <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>&#127769; Dark Pro</option>
                <option value="hacker" ${currentTheme === 'hacker' ? 'selected' : ''}>&#128126; Hacker Terminal</option>
                <option value="futuristic" ${currentTheme === 'futuristic' ? 'selected' : ''}>&#128640; Ultra-Futurista</option>
                <option value="macos-light" ${currentTheme === 'macos-light' ? 'selected' : ''}>&#63743; macOS Claro</option>
                <option value="macos-ventura" ${currentTheme === 'macos-ventura' ? 'selected' : ''}>&#127749; macOS Ventura</option>
                <option value="medium-green" ${currentTheme === 'medium-green' ? 'selected' : ''}>&#127807; Médio Verde</option>
                <option value="medium-blue" ${currentTheme === 'medium-blue' ? 'selected' : ''}>&#127754; Médio Azul</option>
                <option value="win12" ${currentTheme === 'win12' ? 'selected' : ''}>&#128160; Windows 12</option>
                <option value="winxp" ${currentTheme === 'winxp' ? 'selected' : ''}>&#129695; Windows XP</option>
                <option value="win2000" ${currentTheme === 'win2000' ? 'selected' : ''}>&#128421; Windows 2000</option>
                <option value="win98" ${currentTheme === 'win98' ? 'selected' : ''}>&#128190; Windows 98 SE</option>
                <option value="msdos" ${currentTheme === 'msdos' ? 'selected' : ''}>&#9000; MS-DOS</option>
              </select>

              <span class="sim-label">Testar Estado / Mensagem:</span>
              <select class="sim-select ${this._simulatedOutcome !== 'none' ? 'has-err' : ''}" id="sim-outcome-select">
                <option value="none" ${this._simulatedOutcome === 'none' ? 'selected' : ''}>&#9989; Login Normal (Sucesso)</option>
                <option value="auth_401" ${this._simulatedOutcome === 'auth_401' ? 'selected' : ''}>&#128274; Erro de Acesso: Senha Inválida (401)</option>
                <option value="locked_403" ${this._simulatedOutcome === 'locked_403' ? 'selected' : ''}>&#128737; Erro de Acesso: Conta Bloqueada / 2FA (403)</option>
                <option value="app_503" ${this._simulatedOutcome === 'app_503' ? 'selected' : ''}>&#9888; Erro de Aplicação: Servidor Offline (503)</option>
                <option value="app_500" ${this._simulatedOutcome === 'app_500' ? 'selected' : ''}>&#128165; Erro Crítico de Aplicação / Licença (500)</option>
              </select>

              <button type="button" class="close-showcase" data-close-showcase>
                Voltar ao Workspace &times;
              </button>
            </div>
          </div>

          <div class="model-pills">
            ${LOGIN_MODELS.map(
              (m) => `
              <button
                type="button"
                class="model-tab ${m.id === String(this._model) ? 'active' : ''}"
                data-select-model="${m.id}"
              >
                ${m.name}
              </button>
            `
            ).join('')}
          </div>
        </div>

        <div class="stage-center">
          ${this._renderSelectedModel()}
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    // Alternância entre os 10 modelos
    this.shadowRoot.querySelectorAll('[data-select-model]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._model = btn.dataset.selectModel;
        this.render();
      });
    });

    // Alternância de Tema dentro do Showcase de Login
    const themeSel = this.shadowRoot.getElementById('login-theme-select');
    themeSel?.addEventListener('change', (e) => {
      const nextTheme = e.target.value;
      AppState.setState({ theme: nextTheme });
      this.emit('cortex-theme-change', { theme: nextTheme });
    });

    // Seletor de Simulação de Erro de Acesso / Erro de Aplicação
    const simSelect = this.shadowRoot.getElementById('sim-outcome-select');
    simSelect?.addEventListener('change', (e) => {
      this._simulatedOutcome = e.target.value;
      const preset = ERROR_PRESETS[this._simulatedOutcome];
      if (preset) {
        this.showError(preset);
      } else {
        this.clearError();
      }
    });

    // Fechar Alerta de Erro Inline
    this.shadowRoot.querySelectorAll('[data-clear-err]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._simulatedOutcome = 'none';
        this.clearError();
      });
    });

    // Botão de Diagnóstico Técnico para Erros de Aplicação
    this.shadowRoot.querySelectorAll('[data-diag-modal]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!this._activeError) return;
        await CortexModal.alert({
          title: `Diagnóstico de Aplicação [${this._activeError.code}]`,
          message: `${this._activeError.message}\n\nTimestamp: ${new Date().toISOString()}\nEndpoint: wss://auth.cortexui.local:8443/v4/session`,
          type: 'error'
        });
      });
    });

    // Navegação do Wizard Zero-Trust (Modelo 9)
    this.shadowRoot.querySelectorAll('[data-step-prev]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this._wizardStep > 1) {
          this._wizardStep--;
          this.render();
        }
      });
    });

    // Fechar Showcase
    this.shadowRoot.querySelectorAll('[data-close-showcase]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.close();
      });
    });

    // Mostrar/Ocultar Senha
    this.shadowRoot.querySelectorAll('[data-toggle-pass]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._showPassword = !this._showPassword;
        this.render();
      });
    });

    // Seleção de Perfil no Modelo 4 (Workstation OS)
    this.shadowRoot.querySelectorAll('[data-os-user]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._selectedOsUser = btn.dataset.osUser;
        this.render();
      });
    });

    // Botões SSO / Passkey / Emergência
    this.shadowRoot.querySelectorAll('[data-sso]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this._simulatedOutcome !== 'none') {
          this.showError(ERROR_PRESETS[this._simulatedOutcome]);
          return;
        }
        const provider = btn.dataset.sso;
        CortexModal.toast(`Autenticado via ${provider}!`, 'success');
        this.close();
      });
    });

    // Recuperação de Senha
    this.shadowRoot.querySelectorAll('[data-recover]').forEach((link) => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = await CortexModal.prompt({
          title: 'Recuperação de Credenciais',
          message: 'Informe seu e-mail corporativo para receber o link de redefinição:',
          defaultValue: 'elton.alves@cortexui.dev',
          confirmText: 'Enviar Link'
        });
        if (email) {
          CortexModal.toast(`Link de recuperação enviado para ${email}`, 'info');
        }
      });
    });

    // Submissão dos 10 Formulários de Login (com Validação de Senha e Simulação de Erros)
    this.shadowRoot.querySelectorAll('[data-login-form]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Se o simulador de erro estiver ativo, dispara o erro com animação Shake
        if (this._simulatedOutcome !== 'none') {
          this.showError(ERROR_PRESETS[this._simulatedOutcome]);
          return;
        }

        // Validação real: se o usuário digitou uma senha com menos de 4 caracteres, dispara erro de acesso
        const passInput = form.querySelector('input[name="password"]');
        if (passInput && passInput.value.trim().length < 4) {
          this.showError({
            type: 'access',
            code: 'AUTH_SHORT_PASS',
            title: 'Credencial Inválida',
            message: 'A senha ou PIN deve conter no mínimo 4 caracteres.'
          });
          return;
        }

        // No Modelo 9 (Wizard), avança as 3 etapas antes de finalizar
        if (String(this._model) === '9' && this._wizardStep < 3) {
          this._wizardStep++;
          this.render();
          return;
        }

        const modelTitle = form.dataset.loginForm;
        this._wizardStep = 1;
        this.emit('cortex-login-submit', { model: this._model, modelTitle });
        CortexModal.toast(`Sessão autenticada com sucesso (${modelTitle})!`, 'success');
        this.close();
      });
    });
  }
}

customElements.define('cortex-login', CortexLogin);
