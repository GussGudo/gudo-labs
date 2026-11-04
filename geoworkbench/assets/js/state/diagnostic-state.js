/**
 * diagnostic-state.js
 * Historial de eventos del sistema (Inmutable, append-only).
 * NO conoce la interfaz, NO emite eventos. Solo almacena la verdad.
 */

const VALID_LEVELS = ['info', 'success', 'warning', 'error'];
const MAX_DETAILS_DEPTH = 3;

class DiagnosticStateManager {
    #sequence = 0;
    #events = [];

    // --- Validadores Privados ---

    #isPlainObject(obj) {
        if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return false;
        const proto = Object.getPrototypeOf(obj);
        return proto === Object.prototype || proto === null;
    }

    /**
     * D-08 a D-15: Clonación segura, simétrica y estricta.
     * Rechaza: getters/setters, símbolos, ciclos, tipos no JSON, huecos,
     * índices inválidos, propiedades extras y propiedades no enumerables.
     */
    #cloneSafe(val, depth = 1, seen = new WeakSet()) {
        if (depth > MAX_DETAILS_DEPTH) {
            throw new TypeError(`[DiagnosticState] details excede la profundidad máxima permitida (${MAX_DETAILS_DEPTH}).`);
        }

        // 1. Primitivos JSON-safe
        if (val === null) return null;
        if (typeof val === 'string' || typeof val === 'boolean') return val;
        if (typeof val === 'number') {
            if (!Number.isFinite(val)) {
                throw new TypeError('[DiagnosticState] Números no finitos (NaN/Infinity) no están permitidos.');
            }
            return val;
        }

        // 2. Tipos explícitamente rechazados
        if (typeof val === 'undefined' || typeof val === 'function' || typeof val === 'symbol' || typeof val === 'bigint') {
            throw new TypeError(`[DiagnosticState] Tipo no permitido: ${typeof val}`);
        }

        // 3. Objetos y Arreglos
        if (typeof val === 'object') {
            if (seen.has(val)) {
                throw new TypeError('[DiagnosticState] Referencias circulares detectadas.');
            }
            seen.add(val);

            // --- VALIDACIÓN DE ARREGLOS (D-12, D-14, D-15) ---
            if (Array.isArray(val)) {
                const descriptors = Object.getOwnPropertyDescriptors(val);
                
                for (const key of Reflect.ownKeys(descriptors)) {
                    if (key === 'length') continue; // 'length' es estructural
                    
                    if (typeof key === 'symbol') {
                        throw new TypeError('[DiagnosticState] Claves Symbol no permitidas en arreglos.');
                    }

                    // D-14: Validar que la clave sea un índice de arreglo real
                    const numKey = Number(key);
                    if (!Number.isInteger(numKey) || numKey < 0 || numKey >= 2**32 - 1 || String(numKey) !== key || numKey >= val.length) {
                        throw new TypeError(`[DiagnosticState] Propiedad no válida '${key}' en arreglo (debe ser un índice de arreglo válido).`);
                    }

                    const desc = descriptors[key];

                    // D-15: Rechazar propiedades no enumerables
                    if (!desc.enumerable) {
                        throw new TypeError(`[DiagnosticState] Propiedad no enumerable '${key}' no permitida en arreglo.`);
                    }

                    if (desc.get || desc.set) {
                        throw new TypeError(`[DiagnosticState] Getter/Setter no permitido en arreglo índice '${key}'.`);
                    }
                }

                const arrClone = [];
                // Iterar sobre los índices garantiza que no hay huecos (D-12)
                for (let i = 0; i < val.length; i++) {
                    if (!Object.hasOwn(descriptors, i)) {
                        throw new TypeError(`[DiagnosticState] Hueco (sparse array) detectado en el índice ${i}.`);
                    }
                    arrClone.push(this.#cloneSafe(descriptors[i].value, depth + 1, seen));
                }
                
                seen.delete(val);
                return arrClone;
            }

            // --- VALIDACIÓN DE OBJETOS PLANOS (D-10, D-15) ---
            if (this.#isPlainObject(val)) {
                const objClone = {};
                const descriptors = Object.getOwnPropertyDescriptors(val);
                
                for (const key of Reflect.ownKeys(descriptors)) {
                    if (typeof key === 'symbol') {
                        throw new TypeError('[DiagnosticState] Claves Symbol no permitidas.');
                    }
                    
                    const desc = descriptors[key];
                    
                    // D-15: Rechazar propiedades no enumerables
                    if (!desc.enumerable) {
                        throw new TypeError(`[DiagnosticState] Propiedad no enumerable '${key}' no permitida.`);
                    }

                    if (desc.get || desc.set) {
                        throw new TypeError(`[DiagnosticState] Propiedades accesoras (getters/setters) no permitidas en la clave '${key}'.`);
                    }
                    
                    // Asignación segura contra __proto__
                    Object.defineProperty(objClone, key, {
                        value: this.#cloneSafe(desc.value, depth + 1, seen),
                        enumerable: true,
                        configurable: true,
                        writable: true
                    });
                }
                seen.delete(val);
                return objClone;
            }

            throw new TypeError('[DiagnosticState] details contiene un objeto que no es un objeto plano ni un arreglo.');
        }
    }

    #deepFreeze(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        Object.freeze(obj);
        for (const key of Reflect.ownKeys(obj)) {
            const desc = Object.getOwnPropertyDescriptor(obj, key);
            if (desc && desc.value) {
                this.#deepFreeze(desc.value);
            }
        }
        return obj;
    }

    // --- API Pública ---

    record(level, source, code, message, details = null) {
        if (!VALID_LEVELS.includes(level)) {
            throw new TypeError(`[DiagnosticState] Nivel inválido: '${level}'.`);
        }
        if (typeof source !== 'string' || !source.trim()) {
            throw new TypeError('[DiagnosticState] El origen (source) debe ser un string no vacío.');
        }
        if (typeof code !== 'string' || !code.trim()) {
            throw new TypeError('[DiagnosticState] El código (code) debe ser un string no vacío.');
        }
        if (typeof message !== 'string' || !message.trim()) {
            throw new TypeError('[DiagnosticState] El mensaje no puede estar vacío.');
        }

        let clonedDetails = null;
        if (details !== null) {
            if (!this.#isPlainObject(details)) {
                throw new TypeError('[DiagnosticState] details debe ser un objeto plano o null.');
            }
            clonedDetails = this.#cloneSafe(details, 1);
        }

        this.#sequence += 1;
        const eventId = `diag-${String(this.#sequence).padStart(6, '0')}`;

        const event = {
            id: eventId,
            sequence: this.#sequence,
            timestamp: new Date().toISOString(),
            level,
            source,
            code,
            message,
            details: clonedDetails
        };

        this.#deepFreeze(event);
        this.#events.push(event);
        return event;
    }

    get events() {
        return Object.freeze([...this.#events]);
    }

    get count() {
        return this.#events.length;
    }

    getSnapshot() {
        const clonedEvents = this.#events.map(evt => {
            return {
                id: evt.id,
                sequence: evt.sequence,
                timestamp: evt.timestamp,
                level: evt.level,
                source: evt.source,
                code: evt.code,
                message: evt.message,
                details: evt.details ? this.#cloneSafe(evt.details, 1) : null
            };
        });
        
        const snapshot = {
            exportedAt: new Date().toISOString(),
            totalEvents: this.#events.length,
            events: clonedEvents
        };

        return this.#deepFreeze(snapshot);
    }
}

export const DiagnosticState = new DiagnosticStateManager();