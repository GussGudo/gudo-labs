/**
 * fleet.js
 * Módulo de interfaz para la vista detallada de la Flota.
 * Responsabilidad: Renderizar una tabla con los vehículos del ViewModel.
 * NO conoce ScenarioState, UIState, EventBus ni app.js.
 */

const VALID_STATUSES = ['active', 'warning', 'inactive'];
const VEHICLE_KEYS = ['id', 'type', 'status', 'vol', 'weight', 'stops', 'packages'];

class FleetModule {
    constructor() {
        this.container = null;
        this.tableContainer = null;
        this._isInitialized = false;
        this._onSelect = null;
        
        // Referencias para el listener delegado
        this._delegatedTbody = null;
        this._handleRowClick = null;
    }

    /**
     * Inicialización atómica con configuración opcional.
     */
    init(config = {}) {
        if (this._isInitialized) {
            console.warn('[Fleet] El módulo ya está inicializado.');
            return true;
        }

        // 1. Validar config
        if (config === null || typeof config !== 'object' || Array.isArray(config)) {
            console.error('[Fleet] init: configuración inválida.');
            return false;
        }

        // 2. Validar onSelect
        if (config.onSelect !== undefined && typeof config.onSelect !== 'function') {
            console.error('[Fleet] init: onSelect debe ser una función.');
            return false;
        }

        // 3. Localizar y validar DOM en variables locales
        const container = document.getElementById('module-fleet');
        if (!container) {
            console.error('[Fleet] Contenedor #module-fleet no encontrado.');
            return false;
        }

        const tableContainer = container.querySelector('.fleet-table-container');
        if (!tableContainer) {
            console.error('[Fleet] Contenedor .fleet-table-container no encontrado.');
            return false;
        }

        // 4. Asignación atómica (solo si todo es válido)
        this.container = container;
        this.tableContainer = tableContainer;
        this._onSelect = config.onSelect || null;
        this._isInitialized = true;
        
        console.log('[Fleet] Inicializado correctamente.');
        return true;
    }

    // --- Validación Estricta (Certificada) ---

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
        if (desc.get || desc.set) {
            throw new Error(`[Fleet] Getter/Setter no permitido en la propiedad '${key}'.`);
        }
        return desc.value;
    }

    #isValidVehicle(v) {
        if (!this.#isPlainObject(v)) return false;
        if (!this.#hasExactKeys(v, VEHICLE_KEYS)) return false;

        try {
            const id = this.#getSafeProp(v, 'id');
            const type = this.#getSafeProp(v, 'type');
            const status = this.#getSafeProp(v, 'status');
            const vol = this.#getSafeProp(v, 'vol');
            const weight = this.#getSafeProp(v, 'weight');
            const stops = this.#getSafeProp(v, 'stops');
            const packages = this.#getSafeProp(v, 'packages');

            if (typeof id !== 'string' || !id.trim() || id !== id.trim()) return false;
            
            if (typeof type !== 'string' || !type.trim()) return false;
            if (!VALID_STATUSES.includes(status)) return false;
            
            if (typeof vol !== 'number' || !Number.isFinite(vol) || vol < 0 || vol > 100) return false;
            if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0 || weight > 100) return false;
            if (!Number.isInteger(stops) || stops < 0) return false;
            if (!Number.isInteger(packages) || packages < 0) return false;

            return true;
        } catch (e) {
            return false;
        }
    }

    #isValidVehiclesArray(vehicles) {
        if (!Array.isArray(vehicles)) return false;

        const lengthDesc = Object.getOwnPropertyDescriptor(vehicles, 'length');
        if (!lengthDesc || lengthDesc.writable !== true || lengthDesc.enumerable !== false || lengthDesc.configurable !== false) return false;

        const keys = Reflect.ownKeys(vehicles);
        for (const key of keys) {
            if (key === 'length') continue;
            if (typeof key === 'symbol') return false;
            const numKey = Number(key);
            if (!Number.isInteger(numKey) || numKey < 0 || numKey >= vehicles.length || String(numKey) !== key) {
                return false;
            }
        }

        const seenIds = new Set();

        for (let i = 0; i < vehicles.length; i++) {
            if (!Object.hasOwn(vehicles, i)) return false;
            const desc = Object.getOwnPropertyDescriptor(vehicles, i);
            if (!desc || desc.get || desc.set || !desc.enumerable) return false;
            
            const v = desc.value;
            if (!this.#isValidVehicle(v)) return false;

            const id = v.id;
            if (seenIds.has(id)) return false;
            seenIds.add(id);
        }

        return true;
    }

    #isValidViewModel(viewModel) {
        if (!this.#isPlainObject(viewModel)) return false;
        if (!this.#hasExactKeys(viewModel, ['vehicles'])) return false;
        
        try {
            const vehicles = this.#getSafeProp(viewModel, 'vehicles');
            return this.#isValidVehiclesArray(vehicles);
        } catch (e) {
            return false;
        }
    }

    // --- Renderizado Seguro (Certificado) ---

    #buildVehicleRow(v) {
        const tr = document.createElement('tr');
        tr.dataset.vehicleId = v.id;

        const tdId = document.createElement('td');
        tdId.className = 'col-id';
        tdId.textContent = v.id;
        tr.appendChild(tdId);

        const tdType = document.createElement('td');
        tdType.className = 'col-type';
        tdType.textContent = v.type;
        tr.appendChild(tdType);

        const tdStatus = document.createElement('td');
        const badge = document.createElement('span');
        let badgeClass = 'fleet-status-badge';
        if (v.status === 'warning') badgeClass += ' badge-warn';
        else if (v.status === 'active') badgeClass += ' badge-active';
        else badgeClass += ' badge-inactive';
        
        badge.className = badgeClass;
        badge.textContent = v.status.toUpperCase();
        tdStatus.appendChild(badge);
        tr.appendChild(tdStatus);

        const tdVol = document.createElement('td');
        tdVol.className = 'col-progress';
        const volLabel = document.createElement('div');
        volLabel.className = 'fleet-progress-label';
        volLabel.textContent = `${v.vol.toFixed(2)}%`;
        const volTrack = document.createElement('div');
        volTrack.className = 'progress-track-sm';
        const volFill = document.createElement('div');
        const volColorClass = v.vol > 95 ? 'bg-warning' : 'bg-accent';
        volFill.className = `progress-fill-sm ${volColorClass}`;
        volFill.style.setProperty('width', `${Math.min(100, Math.max(0, v.vol))}%`);
        volTrack.appendChild(volFill);
        tdVol.appendChild(volLabel);
        tdVol.appendChild(volTrack);
        tr.appendChild(tdVol);

        const tdWeight = document.createElement('td');
        tdWeight.className = 'col-progress';
        const weightLabel = document.createElement('div');
        weightLabel.className = 'fleet-progress-label';
        weightLabel.textContent = `${v.weight.toFixed(2)}%`;
        const weightTrack = document.createElement('div');
        weightTrack.className = 'progress-track-sm';
        const weightFill = document.createElement('div');
        const weightColorClass = v.weight > 95 ? 'bg-warning' : 'bg-accent';
        weightFill.className = `progress-fill-sm ${weightColorClass}`;
        weightFill.style.setProperty('width', `${Math.min(100, Math.max(0, v.weight))}%`);
        weightTrack.appendChild(weightFill);
        tdWeight.appendChild(weightLabel);
        tdWeight.appendChild(weightTrack);
        tr.appendChild(tdWeight);

        const tdStops = document.createElement('td');
        tdStops.className = 'col-stats';
        tdStops.textContent = v.stops.toString();
        tr.appendChild(tdStops);

        const tdPackages = document.createElement('td');
        tdPackages.className = 'col-stats';
        tdPackages.textContent = v.packages.toString();
        tr.appendChild(tdPackages);

        return tr;
    }

    render(viewModel) {
        if (!this._isInitialized) {
            console.warn('[Fleet] No se puede renderizar: módulo no inicializado.');
            return false;
        }

        if (!this.#isValidViewModel(viewModel)) {
            console.error('[Fleet] ViewModel inválido. Se esperaba un contrato estricto de flota.');
            return false;
        }

        if (this._delegatedTbody && this._handleRowClick) {
            this._delegatedTbody.removeEventListener('click', this._handleRowClick);
        }

        const table = document.createElement('table');
        table.className = 'fleet-table';

        const caption = document.createElement('caption');
        caption.className = 'sr-only';
        caption.textContent = 'Detalle operativo de vehículos';
        table.appendChild(caption);

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['ID', 'Tipo', 'Estado', 'Volumen', 'Peso', 'Paradas', 'Paquetes'];
        
        headers.forEach(text => {
            const th = document.createElement('th');
            th.setAttribute('scope', 'col');
            th.textContent = text;
            if (text === 'ID') th.className = 'col-id';
            else if (text === 'Tipo') th.className = 'col-type';
            else if (text === 'Volumen' || text === 'Peso') th.className = 'col-progress';
            else if (text === 'Paradas' || text === 'Paquetes') th.className = 'col-stats';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        const vehicles = this.#getSafeProp(viewModel, 'vehicles');
        
        for (let i = 0; i < vehicles.length; i++) {
            const desc = Object.getOwnPropertyDescriptor(vehicles, i);
            tbody.appendChild(this.#buildVehicleRow(desc.value));
        }

        if (this._onSelect) {
            this._handleRowClick = (e) => {
                const tr = e.target.closest('tr');
                if (!tr || !tbody.contains(tr)) return;
                const vehicleId = tr.dataset.vehicleId;
                if (vehicleId) {
                    this._onSelect?.(vehicleId);
                }
            };
            tbody.addEventListener('click', this._handleRowClick);
            this._delegatedTbody = tbody;
        }

        table.appendChild(tbody);

        this.tableContainer.textContent = '';
        this.tableContainer.appendChild(table);

        return true;
    }

    destroy() {
        console.log('[Fleet] Destruyendo módulo...');
        
        if (this._delegatedTbody && this._handleRowClick) {
            this._delegatedTbody.removeEventListener('click', this._handleRowClick);
        }
        
        this.container = null;
        this.tableContainer = null;
        this._onSelect = null;
        this._delegatedTbody = null;
        this._handleRowClick = null;
        this._isInitialized = false;
    }
}

export const Fleet = new FleetModule();