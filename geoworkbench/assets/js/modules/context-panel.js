/**
 * context-panel.js
 * Módulo de interfaz para la Zona 4 (Panel Contextual).
 * Responsabilidad: Renderizar el ViewModel. NO decide umbrales ni estados.
 */

const VALID_STATES = ['EMPTY', 'UNAVAILABLE', 'READY'];
const VM_KEYS = ['state', 'entityType', 'data', 'message'];
const DATA_KEYS = ['id', 'type', 'status', 'metrics'];
const METRICS_KEYS = ['vol', 'weight', 'weightStatus', 'stops', 'packages'];

class ContextPanelModule {
    constructor() {
        this.container = null;
        this._isInitialized = false;
    }

    init() {
        if (this._isInitialized) return true;
        this.container = document.getElementById('zone-context');
        if (!this.container) {
            console.error('[ContextPanel] Contenedor #zone-context no encontrado.');
            return false;
        }
        this._isInitialized = true;
        return true;
    }

    // --- Validadores Privados ---

    #isPlainObject(obj) {
        if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return false;
        const proto = Object.getPrototypeOf(obj);
        return proto === Object.prototype || proto === null;
    }

    #hasExactKeys(obj, expectedKeys) {
        const actualKeys = Reflect.ownKeys(obj);
        return actualKeys.length === expectedKeys.length &&
               expectedKeys.every(key => Object.hasOwn(obj, key));
    }

    #getSafeProp(obj, key) {
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (!desc) return undefined;
        if (desc.get || desc.set) throw new Error(`[ContextPanel] Getter/Setter no permitido en '${key}'.`);
        return desc.value;
    }

    /**
     * CPM-01: Validación estricta del ViewModel uniforme.
     */
    #isValidViewModel(vm) {
        if (!this.#isPlainObject(vm)) return false;
        if (!this.#hasExactKeys(vm, VM_KEYS)) return false;
        
        try {
            const state = this.#getSafeProp(vm, 'state');
            const entityType = this.#getSafeProp(vm, 'entityType');
            const data = this.#getSafeProp(vm, 'data');
            const message = this.#getSafeProp(vm, 'message');

            if (!VALID_STATES.includes(state)) return false;

            if (state === 'EMPTY') {
                return entityType === null && data === null && message === null;
            }

            if (state === 'UNAVAILABLE') {
                if (data !== null) return false;
                if (entityType !== null && typeof entityType !== 'string') return false;
                return typeof message === 'string';
            }

            if (state === 'READY') {
                if (entityType !== 'vehicle') return false;
                if (message !== null) return false;
                if (!this.#isPlainObject(data)) return false;
                if (!this.#hasExactKeys(data, DATA_KEYS)) return false;

                const id = this.#getSafeProp(data, 'id');
                const type = this.#getSafeProp(data, 'type');
                const status = this.#getSafeProp(data, 'status');
                const metrics = this.#getSafeProp(data, 'metrics');

                if (typeof id !== 'string' || !id.trim()) return false;
                if (typeof type !== 'string' || !type.trim()) return false;
                if (!['active', 'warning', 'inactive'].includes(status)) return false;

                if (!this.#isPlainObject(metrics)) return false;
                if (!this.#hasExactKeys(metrics, METRICS_KEYS)) return false;

                const vol = this.#getSafeProp(metrics, 'vol');
                const weight = this.#getSafeProp(metrics, 'weight');
                const weightStatus = this.#getSafeProp(metrics, 'weightStatus');
                const stops = this.#getSafeProp(metrics, 'stops');
                const packages = this.#getSafeProp(metrics, 'packages');

                if (typeof vol !== 'number' || !Number.isFinite(vol) || vol < 0 || vol > 100) return false;
                if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0 || weight > 100) return false;
                if (!['active', 'warning'].includes(weightStatus)) return false;
                if (typeof stops !== 'number' || !Number.isInteger(stops) || stops < 0) return false;
                if (typeof packages !== 'number' || !Number.isInteger(packages) || packages < 0) return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    }

    // --- Renderizado ---

    render(viewModel) {
        if (!this._isInitialized) return false;
        if (!this.#isValidViewModel(viewModel)) {
            console.error('[ContextPanel] ViewModel inválido.');
            return false;
        }

        this.container.textContent = '';

        if (viewModel.state === 'EMPTY') this._renderEmpty();
        else if (viewModel.state === 'UNAVAILABLE') this._renderUnavailable(viewModel.message);
        else if (viewModel.state === 'READY') this._renderReady(viewModel.data);

        return true;
    }

    _renderEmpty() {
        const body = document.createElement('div');
        body.className = 'ctx-body';
        body.style.display = 'flex';
        body.style.alignItems = 'center';
        body.style.justifyContent = 'center';
        body.style.height = '100%';
        body.style.color = 'var(--text-secondary)';
        body.style.fontSize = '12px';
        body.style.textAlign = 'center';
        body.textContent = 'Ningún elemento seleccionado.';
        this.container.appendChild(body);
    }

    _renderUnavailable(message) {
        const body = document.createElement('div');
        body.className = 'ctx-body';
        body.style.display = 'flex';
        body.style.alignItems = 'center';
        body.style.justifyContent = 'center';
        body.style.height = '100%';
        body.style.color = 'var(--state-warning)';
        body.style.fontSize = '12px';
        body.style.textAlign = 'center';
        body.textContent = message;
        this.container.appendChild(body);
    }

    _renderReady(data) {
        const header = document.createElement('div');
        header.className = 'ctx-header';
        const titleContainer = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'ctx-title';
        const idSpan = document.createElement('span');
        idSpan.className = 'ctx-id';
        idSpan.textContent = data.id;
        title.appendChild(idSpan);
        title.appendChild(document.createTextNode(` · ${data.type}`));
        
        const subtitle = document.createElement('div');
        subtitle.className = 'ctx-subtitle';
        subtitle.textContent = 'Vehículo'; // CPM-05: Coherente con la insignia

        titleContainer.appendChild(title);
        titleContainer.appendChild(subtitle);

        const badge = document.createElement('div');
        let badgeClass = 'ctx-badge-warning', badgeText = 'EN RIESGO';
        if (data.status === 'active') { badgeClass = 'ctx-badge-active'; badgeText = 'ACTIVO'; }
        else if (data.status === 'inactive') { badgeClass = 'ctx-badge-inactive'; badgeText = 'INACTIVO'; }
        badge.className = badgeClass;
        badge.textContent = badgeText;

        header.appendChild(titleContainer);
        header.appendChild(badge);
        this.container.appendChild(header);

        const tabs = document.createElement('div');
        tabs.className = 'ctx-tabs';
        ['Resumen', 'Ruta', 'Paquetes'].forEach((name, i) => {
            const tab = document.createElement('div');
            tab.className = `ctx-tab ${i === 0 ? 'active' : ''}`;
            tab.textContent = name;
            tabs.appendChild(tab);
        });
        this.container.appendChild(tabs);

        const body = document.createElement('div');
        body.className = 'ctx-body';

        body.appendChild(this._buildMetricRow('Volumen', data.metrics.vol, data.status));
        body.appendChild(this._buildMetricRow('Peso', data.metrics.weight, data.metrics.weightStatus));

        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';
        statsGrid.appendChild(this._buildStatItem(data.metrics.stops, 'Paradas'));
        statsGrid.appendChild(this._buildStatItem(data.metrics.packages, 'Paquetes'));
        body.appendChild(statsGrid);
        this.container.appendChild(body);

        const footer = document.createElement('div');
        footer.className = 'ctx-footer';
        const btn = document.createElement('button');
        btn.className = 'btn-full';
        btn.textContent = 'Centrar en Mapa';
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        footer.appendChild(btn);
        this.container.appendChild(footer);
    }

    _buildMetricRow(label, value, status) {
        const row = document.createElement('div');
        row.className = 'metric-row';
        const header = document.createElement('div');
        header.className = 'metric-header';
        const labelSpan = document.createElement('span');
        labelSpan.className = 'metric-label';
        labelSpan.textContent = label;
        const valueSpan = document.createElement('span');
        valueSpan.className = 'metric-value';
        if (status === 'warning') valueSpan.classList.add('text-warning');
        else if (status === 'active') valueSpan.classList.add('text-accent');
        valueSpan.textContent = `${value.toFixed(2)}%`;
        header.appendChild(labelSpan);
        header.appendChild(valueSpan);

        const track = document.createElement('div');
        track.className = 'progress-track';
        const fill = document.createElement('div');
        fill.className = 'progress-fill';
        let barColor = 'bg-accent';
        if (status === 'warning') barColor = 'bg-warning';
        else if (status === 'inactive') barColor = 'bg-error';
        fill.className += ` ${barColor}`;
        fill.style.setProperty('width', `${Math.min(100, Math.max(0, value))}%`);
        track.appendChild(fill);
        row.appendChild(header);
        row.appendChild(track);
        return row;
    }

    _buildStatItem(value, label) {
        const item = document.createElement('div');
        item.className = 'stat-item';
        const val = document.createElement('div');
        val.className = 'stat-val';
        val.textContent = value.toString();
        const lbl = document.createElement('div');
        lbl.className = 'stat-lbl';
        lbl.textContent = label;
        item.appendChild(val);
        item.appendChild(lbl);
        return item;
    }

    destroy() {
        console.log('[ContextPanel] Destruyendo módulo...');
        if (this.container) {
            this.container.textContent = '';
        }
        this.container = null;
        this._isInitialized = false;
    }
}

export const ContextPanel = new ContextPanelModule();