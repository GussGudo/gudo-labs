import { EventBus } from '../events/event-bus.js';

const ALLOWED_MODULES = ['dashboard', 'map', 'fleet', 'packages', 'assignments', 'routes', 'capacity', 'validation']; // <-- 'fleet' ESTÁ AQUÍ
const ALLOWED_ITEM_TYPES = ['vehicle', 'package', 'stop'];
const ALLOWED_TERMINAL_KEYS = ['activeFilter', 'searchQuery', 'clearedThroughSequence'];
const ALLOWED_TERMINAL_FILTERS = ['all', 'info', 'success', 'warning', 'error'];

class UIStateManager {
    #state = {
        activeModule: 'dashboard',
        selectedItem: null,
        navigationCollapsed: false,
        terminal: {
            activeFilter: 'all',
            searchQuery: '',
            clearedThroughSequence: null
        }
    };

    get activeModule() { return this.#state.activeModule; }
    get navigationCollapsed() { return this.#state.navigationCollapsed; }
    get selectedItem() { return this.#state.selectedItem ? { ...this.#state.selectedItem } : null; }
    get terminal() { return { ...this.#state.terminal }; }

    setActiveModule(moduleName) {
        if (!ALLOWED_MODULES.includes(moduleName)) {
            console.warn(`UIState: Módulo no permitido '${moduleName}'`);
            return;
        }
        if (this.#state.activeModule !== moduleName) {
            this.#state.activeModule = moduleName;
            this._notifyChange();
        }
    }

    setSelectedItem(type, id) {
        if (type === null && id === null) {
            if (this.#state.selectedItem !== null) {
                this.#state.selectedItem = null;
                this._notifyChange();
            }
            return;
        }
        if (!ALLOWED_ITEM_TYPES.includes(type) || typeof id !== 'string' || id.trim() === '') return;
        
        const normalizedId = id.trim();
        const current = this.#state.selectedItem;
        if (current && current.type === type && current.id === normalizedId) return;

        this.#state.selectedItem = { type, id: normalizedId };
        this._notifyChange();
    }

    toggleNavigation() {
        this.#state.navigationCollapsed = !this.#state.navigationCollapsed;
        this._notifyChange();
    }

    updateTerminalSettings(settings) {
        if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return;

        let hasChanges = false;
        const newTerminal = { ...this.#state.terminal };

        for (const key of Object.keys(settings)) {
            if (!ALLOWED_TERMINAL_KEYS.includes(key)) continue;

            const value = settings[key];
            let isValid = false;

            if (key === 'activeFilter') isValid = ALLOWED_TERMINAL_FILTERS.includes(value);
            else if (key === 'searchQuery') isValid = typeof value === 'string';
            else if (key === 'clearedThroughSequence') isValid = (value === null) || (Number.isSafeInteger(value) && value >= 0);

            if (!isValid) continue;

            if (newTerminal[key] !== value) {
                newTerminal[key] = value;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            this.#state.terminal = newTerminal;
            this._notifyChange();
        }
    }

    _notifyChange() {
        const snapshot = Object.freeze({
            activeModule: this.#state.activeModule,
            selectedItem: this.#state.selectedItem ? Object.freeze({ ...this.#state.selectedItem }) : null,
            navigationCollapsed: this.#state.navigationCollapsed,
            terminal: Object.freeze({ ...this.#state.terminal })
        });
        EventBus.emit('STATE_CHANGED', snapshot);
    }
}

export const UIState = new UIStateManager();