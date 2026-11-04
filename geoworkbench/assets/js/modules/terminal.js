/**
 * terminal.js
 * Módulo de interfaz para la Terminal de Diagnóstico.
 * Responsabilidad: Renderizar los eventos proyectados por el TerminalAdapter.
 * NO conoce DiagnosticState, UIState, EventBus ni app.js.
 */

const VALID_LEVELS = ['info', 'success', 'warning', 'error'];
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

class TerminalModule {
    constructor() {
        this.container = null;
        this.logContainer = null;
        this._isInitialized = false;
    }

    init() {
        if (this._isInitialized) {
            console.warn('[Terminal] El módulo ya está inicializado.');
            return true;
        }

        this.container = document.getElementById('zone-terminal');
        if (!this.container) {
            console.error('[Terminal] Contenedor #zone-terminal no encontrado.');
            return false;
        }

        const termContent = this.container.querySelector('.term-content');
        if (!termContent) {
            console.error('[Terminal] Contenedor .term-content no encontrado.');
            return false;
        }

        this.logContainer = termContent.querySelector('.term-log-container');
        
        if (!this.logContainer) {
            this.logContainer = document.createElement('div');
            this.logContainer.className = 'term-log-container';

            const existingLines = termContent.querySelectorAll('.log-line');
            existingLines.forEach(line => {
                this.logContainer.appendChild(line);
            });

            termContent.appendChild(this.logContainer);
        }

        this._isInitialized = true;
        console.log('[Terminal] Inicializado correctamente.');
        return true;
    }

    #getSafeProp(obj, key) {
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (!desc) return undefined;
        if (desc.get || desc.set) {
            throw new Error(`[Terminal] Getter/Setter no permitido en la propiedad '${key}'.`);
        }
        return desc.value;
    }

    #isValidViewModel(viewModel) {
        if (!Array.isArray(viewModel)) return false;

        for (let i = 0; i < viewModel.length; i++) {
            if (!Object.hasOwn(viewModel, i)) return false;

            const evt = viewModel[i];
            if (!evt || typeof evt !== 'object' || Array.isArray(evt)) return false;
            const proto = Object.getPrototypeOf(evt);
            if (proto !== Object.prototype && proto !== null) return false;

            try {
                const id = this.#getSafeProp(evt, 'id');
                const sequence = this.#getSafeProp(evt, 'sequence');
                const timeStr = this.#getSafeProp(evt, 'timeStr');
                const level = this.#getSafeProp(evt, 'level');
                const tag = this.#getSafeProp(evt, 'tag');
                const message = this.#getSafeProp(evt, 'message');

                if (typeof id !== 'string' || !id.trim()) return false;
                if (!Number.isSafeInteger(sequence) || sequence <= 0) return false;
                if (typeof timeStr !== 'string' || !TIME_REGEX.test(timeStr)) return false;
                if (!VALID_LEVELS.includes(level)) return false;
                if (tag !== `[${level.toUpperCase()}]`) return false;
                if (typeof message !== 'string') return false;

            } catch (e) {
                return false; 
            }
        }
        return true;
    }

    render(viewModel) {
        if (!this._isInitialized) {
            console.warn('[Terminal] No se puede renderizar: módulo no inicializado.');
            return false;
        }

        if (!this.#isValidViewModel(viewModel)) {
            console.error('[Terminal] ViewModel inválido. Se esperaba un arreglo de eventos estructurados y seguros.');
            return false;
        }

        const fragment = document.createDocumentFragment();

        viewModel.forEach(evt => {
            const logLine = document.createElement('div');
            logLine.className = 'log-line';

            const timeSpan = document.createElement('span');
            timeSpan.className = 'log-time';
            timeSpan.textContent = `[${evt.timeStr}]`;

            const tagSpan = document.createElement('span');
            tagSpan.className = `log-tag tag-${evt.level}`;
            tagSpan.textContent = evt.tag;

            const msgSpan = document.createElement('span');
            msgSpan.className = 'log-msg';
            msgSpan.textContent = evt.message;

            logLine.appendChild(timeSpan);
            logLine.appendChild(tagSpan);
            logLine.appendChild(msgSpan);

            fragment.appendChild(logLine);
        });

        this.logContainer.textContent = '';
        this.logContainer.appendChild(fragment);

        const termContent = this.container.querySelector('.term-content');
        if (termContent) {
            termContent.scrollTop = termContent.scrollHeight;
        }

        return true;
    }

    destroy() {
        console.log('[Terminal] Destruyendo módulo...');
        this.container = null;
        this.logContainer = null;
        this._isInitialized = false;
    }
}

export const Terminal = new TerminalModule();