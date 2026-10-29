// src/core/RouterAndUtils.js
import { EventBus } from './EventBus.js';

/**
 * Utilitário Nativo de Máscaras de Entrada (CPF, CNPJ, Moeda BRL, Telefone, CEP, Data, IP)
 */
export const CortexMask = {
  cpf(val = '') {
    const d = String(val).replace(/\D/g, '').slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  },

  cnpj(val = '') {
    const d = String(val).replace(/\D/g, '').slice(0, 14);
    return d
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  },

  phone(val = '') {
    const d = String(val).replace(/\D/g, '').slice(0, 11);
    if (d.length <= 10) {
      return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  },

  cep(val = '') {
    const d = String(val).replace(/\D/g, '').slice(0, 8);
    return d.replace(/^(\d{5})(\d)/, '$1-$2');
  },

  currencyBRL(val = '') {
    const num = Number(String(val).replace(/\D/g, '')) / 100;
    if (Number.isNaN(num)) return 'R$ 0,00';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  apply(type, value) {
    if (typeof this[type] === 'function') {
      return this[type](value);
    }
    return value;
  }
};

/**
 * Validador Declarativo de Formulários do CortexUI
 */
export const CortexValidator = {
  validate(fields, rules) {
    const errors = {};
    let valid = true;

    Object.entries(rules).forEach(([key, rule]) => {
      const val = String(fields[key] ?? '').trim();

      if (rule.required && !val) {
        errors[key] = rule.message || 'Este campo é obrigatório.';
        valid = false;
        return;
      }

      if (rule.minLength && val.length < rule.minLength) {
        errors[key] = `Mínimo de ${rule.minLength} caracteres (atual: ${val.length}).`;
        valid = false;
        return;
      }

      if (rule.email && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errors[key] = 'Informe um endereço de e-mail válido.';
        valid = false;
        return;
      }

      if (rule.pattern && val && !rule.pattern.test(val)) {
        errors[key] = rule.message || 'Formato inválido para este campo.';
        valid = false;
      }
    });

    return { valid, errors };
  }
};

/**
 * Roteador SPA Nativo (Hash/History) com Guardas de Navegação
 */
export class CortexRouter {
  constructor() {
    this._routes = new Map();
    this._guards = [];
    this.currentRoute = window.location.hash.slice(1) || '/';

    window.addEventListener('hashchange', () => {
      this._handleRouteChange(window.location.hash.slice(1) || '/');
    });
  }

  register(path, handler) {
    this._routes.set(path, handler);
    return this;
  }

  beforeEach(guardFn) {
    this._guards.push(guardFn);
    return this;
  }

  navigate(path) {
    window.location.hash = path.startsWith('#') ? path : `#${path}`;
  }

  _handleRouteChange(nextPath) {
    for (const guard of this._guards) {
      const allow = guard(nextPath, this.currentRoute);
      if (allow === false) return;
    }
    const prev = this.currentRoute;
    this.currentRoute = nextPath;
    const handler = this._routes.get(nextPath);
    if (handler) handler({ path: nextPath, from: prev });
    EventBus.emit('router:change', { path: nextPath, from: prev });
  }
}

export const AppRouter = new CortexRouter();
