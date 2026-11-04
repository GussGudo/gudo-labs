/**
 * event-bus.js
 * Sistema de publicación/suscripción para desacoplar los módulos.
 */
class EventBusManager {
    #listeners = new Map();

    /**
     * Suscribe una función a un evento. (E-05)
     * @returns {function} Función de desuscripción individual
     */
    on(eventName, callback) {
        // E-05: Validación temprana del contrato
        if (typeof eventName !== 'string' || eventName.trim() === '') {
            throw new TypeError('EventBus: eventName debe ser una cadena no vacía');
        }

        if (typeof callback !== 'function') {
            throw new TypeError('EventBus: callback debe ser una función');
        }

        if (!this.#listeners.has(eventName)) {
            this.#listeners.set(eventName, []);
        }
        
        const subscription = { id: Symbol(eventName), callback };
        this.#listeners.get(eventName).push(subscription);

        return () => {
            const subs = this.#listeners.get(eventName);
            if (!subs) return;
            
            const filtered = subs.filter(s => s.id !== subscription.id);
            if (filtered.length === 0) {
                this.#listeners.delete(eventName);
            } else {
                this.#listeners.set(eventName, filtered);
            }
        };
    }

    /**
     * Desuscribe TODAS las funciones asociadas a un callback de un evento.
     */
    off(eventName, callback) {
        if (!this.#listeners.has(eventName)) return;
        
        const subs = this.#listeners.get(eventName);
        const filtered = subs.filter(s => s.callback !== callback);
        
        if (filtered.length === 0) {
            this.#listeners.delete(eventName);
        } else {
            this.#listeners.set(eventName, filtered);
        }
    }

    /**
     * Emite un evento y pasa datos a los suscriptores.
     */
    emit(eventName, data) {
        if (!this.#listeners.has(eventName)) return;
        
        const subscribersSnapshot = [...this.#listeners.get(eventName)];
        
        for (const sub of subscribersSnapshot) {
            try {
                sub.callback(data);
            } catch (error) {
                console.error(`Error en listener del evento "${eventName}":`, error);
            }
        }
    }
}

export const EventBus = new EventBusManager();