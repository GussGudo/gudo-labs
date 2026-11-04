/**
 * terminal-adapter.js
 * Adaptador puro para proyectar el historial de eventos y las preferencias de UI
 * en un ViewModel listo para ser renderizado por la Terminal.
 */

const VALID_LEVELS = ['info', 'success', 'warning', 'error'];
const VALID_FILTERS = ['all', ...VALID_LEVELS];
const ISO_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

class TerminalAdapter {
    static #getSafePref(prefs, key) {
        const descriptor = Object.getOwnPropertyDescriptor(prefs, key);
        if (!descriptor) return undefined; 
        if (descriptor.get || descriptor.set) {
            throw new TypeError(`[TerminalAdapter] La preferencia '${key}' no debe usar getters/setters.`);
        }
        return descriptor.value;
    }

    static #validatePrefs(prefs) {
        if (!prefs || typeof prefs !== 'object' || Array.isArray(prefs)) {
            throw new TypeError('[TerminalAdapter] prefs debe ser un objeto plano.');
        }
        const proto = Object.getPrototypeOf(prefs);
        if (proto !== Object.prototype && proto !== null) {
            throw new TypeError('[TerminalAdapter] prefs debe ser un objeto plano (prototipo inválido).');
        }

        const activeFilter = this.#getSafePref(prefs, 'activeFilter');
        if (!VALID_FILTERS.includes(activeFilter)) {
            throw new TypeError(`[TerminalAdapter] activeFilter inválido: '${activeFilter}'.`);
        }

        const searchQuery = this.#getSafePref(prefs, 'searchQuery');
        if (typeof searchQuery !== 'string') {
            throw new TypeError('[TerminalAdapter] searchQuery debe ser un string.');
        }

        const clearedThroughSequence = this.#getSafePref(prefs, 'clearedThroughSequence');
        if (clearedThroughSequence !== null) {
            if (!Number.isSafeInteger(clearedThroughSequence) || clearedThroughSequence < 0) {
                throw new TypeError('[TerminalAdapter] clearedThroughSequence debe ser un entero seguro no negativo o null.');
            }
        }
    }

    static #validateEvent(evt) {
        if (!evt || typeof evt !== 'object' || Array.isArray(evt)) {
            throw new TypeError('[TerminalAdapter] Un evento del historial no es un objeto válido.');
        }

        if (typeof evt.id !== 'string' || !evt.id.trim()) {
            throw new TypeError('[TerminalAdapter] El evento no tiene un "id" válido.');
        }
        if (!Number.isSafeInteger(evt.sequence) || evt.sequence <= 0) {
            throw new TypeError(`[TerminalAdapter] El evento ${evt.id} no tiene una "sequence" válida.`);
        }
        if (typeof evt.level !== 'string' || !VALID_LEVELS.includes(evt.level)) {
            throw new TypeError(`[TerminalAdapter] El evento ${evt.id} tiene un "level" inválido.`);
        }
        if (typeof evt.source !== 'string' || typeof evt.code !== 'string' || typeof evt.message !== 'string') {
            throw new TypeError(`[TerminalAdapter] El evento ${evt.id} tiene campos de texto mal formados.`);
        }

        if (typeof evt.timestamp !== 'string') {
            throw new TypeError(`[TerminalAdapter] El evento ${evt.id} no tiene un "timestamp" válido.`);
        }
        if (!ISO_UTC_REGEX.test(evt.timestamp)) {
            throw new TypeError(`[TerminalAdapter] El evento ${evt.id} tiene un "timestamp" con formato inválido.`);
        }
        const parsedDate = Date.parse(evt.timestamp);
        if (!Number.isFinite(parsedDate) || new Date(parsedDate).toISOString() !== evt.timestamp) {
            throw new TypeError(`[TerminalAdapter] El evento ${evt.id} tiene un "timestamp" que no corresponde a una fecha real.`);
        }
    }

    static #formatTime(isoString) {
        const d = new Date(isoString);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    }

    static project(events, prefs) {
        if (!Array.isArray(events)) {
            throw new TypeError('[TerminalAdapter] El historial de eventos debe ser un arreglo.');
        }
        
        this.#validatePrefs(prefs);

        const activeFilter = this.#getSafePref(prefs, 'activeFilter');
        const searchQuery = this.#getSafePref(prefs, 'searchQuery');
        const clearedThroughSequence = this.#getSafePref(prefs, 'clearedThroughSequence');

        const normalizedQuery = searchQuery.trim().toLowerCase();
        const projectedEvents = [];

        for (const evt of events) {
            this.#validateEvent(evt);

            if (clearedThroughSequence !== null && evt.sequence <= clearedThroughSequence) {
                continue;
            }

            if (activeFilter !== 'all' && evt.level !== activeFilter) {
                continue;
            }

            if (normalizedQuery !== '') {
                const searchTarget = `${evt.source} ${evt.code} ${evt.message}`.toLowerCase();
                if (!searchTarget.includes(normalizedQuery)) {
                    continue;
                }
            }

            projectedEvents.push({
                id: evt.id,
                sequence: evt.sequence,
                timeStr: this.#formatTime(evt.timestamp),
                level: evt.level,
                tag: `[${evt.level.toUpperCase()}]`,
                message: evt.message
            });
        }

        return projectedEvents;
    }
}

export const terminalAdapter = TerminalAdapter;