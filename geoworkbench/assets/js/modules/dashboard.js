/**
 * dashboard.js
 * Módulo de interfaz para el Dashboard.
 * Responsabilidad: Renderizar la vista de resumen (KPIs, Flota).
 * NO conoce EventBus, UIState ni app.js. Recibe un viewModel para pintar.
 */

// Constantes de validación y mapeo
const VALID_STATUSES = ['active', 'warning', 'inactive'];

class DashboardModule {
    constructor() {
        // D-01: Sin búsquedas de DOM en el constructor
        this.container = null;
        this.kpiGrid = null;
        this.fleetPanel = null;
        this.fleetRowsContainer = null;
        this._isInitialized = false;
    }

    /**
     * Inicialización del módulo. 
     * @returns {boolean} true si se inicializó correctamente, false si falló.
     */
    init() {
        if (this._isInitialized) {
            console.warn('[Dashboard] El módulo ya está inicializado.');
            return true;
        }

        this.container = document.getElementById('module-dashboard');
        if (!this.container) {
            console.error('[Dashboard] Contenedor #module-dashboard no encontrado.');
            return false;
        }

        this.kpiGrid = this.container.querySelector('.kpi-grid');
        this.fleetPanel = this.container.querySelector('.fleet-panel');

        if (!this.kpiGrid || !this.fleetPanel) {
            console.error('[Dashboard] Estructura DOM incompleta. Faltan .kpi-grid o .fleet-panel.');
            return false;
        }

        // D-05: Preservar estructura estática (cirugía DOM persistente)
        this.fleetRowsContainer = this.fleetPanel.querySelector('.fleet-rows-container');
        
        if (!this.fleetRowsContainer) {
            this.fleetRowsContainer = document.createElement('div');
            this.fleetRowsContainer.className = 'fleet-rows-container';
            
            const existingRows = this.fleetPanel.querySelectorAll('.fleet-row');
            existingRows.forEach(row => {
                this.fleetRowsContainer.appendChild(row);
            });
            
            const panelHeader = this.fleetPanel.querySelector('.panel-header');
            if (panelHeader && panelHeader.nextSibling) {
                this.fleetPanel.insertBefore(this.fleetRowsContainer, panelHeader.nextSibling);
            } else {
                this.fleetPanel.appendChild(this.fleetRowsContainer);
            }
        }

        this._isInitialized = true;
        console.log('[Dashboard] Inicializado correctamente.');
        return true;
    }

    /**
     * Valida un objeto KPI. (D-13)
     */
    _isValidKPI(kpi) {
        return kpi !== null 
            && typeof kpi === 'object' 
            && !Array.isArray(kpi)
            && (typeof kpi.label === 'string' || typeof kpi.label === 'number')
            && (typeof kpi.value === 'string' || typeof kpi.value === 'number');
    }

    /**
     * Valida un objeto Vehículo. (D-12, D-13)
     */
    _isValidVehicle(vehicle) {
        return vehicle !== null
            && typeof vehicle === 'object'
            && !Array.isArray(vehicle)
            && typeof vehicle.id === 'string'
            && typeof vehicle.type === 'string'
            && typeof vehicle.vol === 'number'        // D-12: Tipo estricto, sin coerción
            && Number.isFinite(vehicle.vol)           // D-12: Debe ser un número finito
            && VALID_STATUSES.includes(vehicle.status);
    }

    /**
     * Renderiza el módulo a partir de un ViewModel. (D-04, D-13)
     */
    render(viewModel) {
        if (!this._isInitialized) {
            console.warn('[Dashboard] No se puede renderizar: módulo no inicializado.');
            return false;
        }

        // 1. Validación estructural básica
        if (!viewModel || typeof viewModel !== 'object' || 
            !Array.isArray(viewModel.kpis) || 
            !Array.isArray(viewModel.vehicles)) {
            console.error('[Dashboard] ViewModel inválido. Se esperaban arreglos en "kpis" y "vehicles".');
            return false;
        }

        // 2. D-13: Validar CADA elemento antes de tocar el DOM
        if (!viewModel.kpis.every(k => this._isValidKPI(k))) {
            console.error('[Dashboard] ViewModel inválido: al menos un KPI no cumple el contrato (label/value).');
            return false;
        }

        if (!viewModel.vehicles.every(v => this._isValidVehicle(v))) {
            console.error('[Dashboard] ViewModel inválido: al menos un vehículo no cumple el contrato (id, type, vol number, status).');
            return false;
        }

        // 3. Si toda la validación pasó, recién ahora modificamos el DOM
        this._renderKPIs(viewModel.kpis);
        this._renderFleet(viewModel.vehicles);
        
        return true;
    }

    /**
     * Renderiza los KPIs. Asume datos previamente validados.
     */
    _renderKPIs(kpis) {
        if (!this.kpiGrid) return;

        this.kpiGrid.innerHTML = '';

        kpis.forEach(kpi => {
            const card = document.createElement('div');
            card.className = 'kpi-card';

            const label = document.createElement('div');
            label.className = 'kpi-label';
            label.textContent = String(kpi.label);

            const value = document.createElement('div');
            value.className = 'kpi-value';
            value.textContent = String(kpi.value);

            card.appendChild(label);
            card.appendChild(value);
            this.kpiGrid.appendChild(card);
        });
    }

    /**
     * Renderiza la lista de vehículos. Asume datos previamente validados.
     */
    _renderFleet(vehicles) {
        if (!this.fleetRowsContainer) return;

        // Limpiar filas dinámicas (preserva el panel-header)
        this.fleetRowsContainer.innerHTML = '';

        vehicles.forEach(vehicle => {
            // Aplicar límite visual 0-100
            const safeVol = Math.min(100, Math.max(0, vehicle.vol));
            const isInactive = vehicle.status === 'inactive';

            const row = document.createElement('div');
            row.className = `fleet-row ${isInactive ? 'fleet-inactive' : ''}`;

            // 1. ID
            const idEl = document.createElement('div');
            idEl.className = 'fleet-id';
            idEl.textContent = vehicle.id;

            // 2. Tipo
            const typeEl = document.createElement('div');
            typeEl.className = 'fleet-type';
            typeEl.textContent = vehicle.type;

            // 3. Progreso (Barra) según estado formalizado
            let barClass = '';
            if (vehicle.status === 'warning') barClass = 'bg-warning';
            else if (vehicle.status === 'active') barClass = 'bg-accent';

            const progressContainer = document.createElement('div');
            progressContainer.className = 'fleet-progress';
            
            const bar = document.createElement('div');
            bar.className = `fleet-bar ${barClass}`;
            bar.style.width = `${safeVol}%`;
            
            progressContainer.appendChild(bar);

            // 4. Valor textual
            let valClass = '';
            if (vehicle.status === 'warning') valClass = 'text-warning';
            else if (vehicle.status === 'active') valClass = 'text-accent';

            const valEl = document.createElement('div');
            valEl.className = `fleet-val ${valClass}`;
            valEl.textContent = `${vehicle.vol.toFixed(2)}%`;

            // Ensamblar fila
            row.appendChild(idEl);
            row.appendChild(typeEl);
            row.appendChild(progressContainer);
            row.appendChild(valEl);

            this.fleetRowsContainer.appendChild(row);
        });
    }

    /**
     * Limpieza del módulo. (D-01)
     * Nota: NO restaura el HTML original, solo libera referencias en memoria.
     */
    destroy() {
        console.log('[Dashboard] Destruyendo módulo...');
        
        this.container = null;
        this.kpiGrid = null;
        this.fleetPanel = null;
        this.fleetRowsContainer = null;
        
        this._isInitialized = false;
    }
}

// Exportamos la instancia única
export const Dashboard = new DashboardModule();