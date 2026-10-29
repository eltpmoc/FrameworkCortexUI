// src/core/EventBus.js
class CortexEventBus {
  constructor() {
    this._events = new Map(); // eventName -> Set<listener>
  }

  /**
   * Registra um listener para um evento do barramento central.
   * @param {string} eventName
   * @param {Function} listener
   * @returns {Function} Função de desinscrição (unsubscribe)
   */
  on(eventName, listener) {
    if (!this._events.has(eventName)) {
      this._events.set(eventName, new Set());
    }
    this._events.get(eventName).add(listener);
    return () => this.off(eventName, listener);
  }

  /**
   * Registra um listener que executa apenas uma única vez.
   */
  once(eventName, listener) {
    const wrapper = (payload) => {
      this.off(eventName, wrapper);
      listener(payload);
    };
    return this.on(eventName, wrapper);
  }

  /**
   * Remove um listener específico.
   */
  off(eventName, listener) {
    const set = this._events.get(eventName);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        this._events.delete(eventName);
      }
    }
  }

  /**
   * Emite um evento síncrono para todos os ouvintes inscritos.
   */
  emit(eventName, payload = {}) {
    const set = this._events.get(eventName);
    if (!set) return;
    set.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error(`[CortexEventBus] Erro no evento "${eventName}":`, err);
      }
    });
  }
}

export const EventBus = new CortexEventBus();
