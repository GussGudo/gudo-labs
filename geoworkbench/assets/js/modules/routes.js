/**
 * routes.js
 * Módulo de interfaz para la vista de rutas (Zona 3).
 */

class RoutesModule {
    constructor() {
        this.container = null;
        this.tableContainer = null;
        this._isInitialized = false;
        this._expandedRoutes = new Set();
        this._lastViewModel = null;
        this._handleToggle = null;
    }

    init() {
        if (this._isInitialized) {
            console.warn('[Routes] El módulo ya está inicializado.');
            return true;
        }

        this.container = document.getElementById('module-routes');
        if (!this.container) {
            console.error('[Routes] Contenedor #module-routes no encontrado.');
            return false;
        }

        this.tableContainer = this.container.querySelector('.routes-table-container');
        if (!this.tableContainer) {
            console.error('[Routes] Contenedor .routes-table-container no encontrado.');
            return false;
        }

        this._isInitialized = true;
        console.log('[Routes] Inicializado correctamente.');
        return true;
    }

    #isValidViewModel(vm) {
        if (!vm || typeof vm !== 'object' || Array.isArray(vm)) return false;
        if (!Array.isArray(vm.routes)) return false;
        if (typeof vm.totalRoutes !== 'number' || vm.totalRoutes !== vm.routes.length) return false;

        const vehicleIds = new Set();
        for (const r of vm.routes) {
            if (!r || typeof r !== 'object') return false;
            if (typeof r.vehicleId !== 'string' || r.vehicleId.trim() === '') return false;
            if (vehicleIds.has(r.vehicleId)) return false;
            vehicleIds.add(r.vehicleId);

            if (typeof r.stopsCount !== 'number' || !Number.isInteger(r.stopsCount) || r.stopsCount < 1) return false;
            if (!Array.isArray(r.sequence) || r.sequence.length < 3) return false;
            if (!Array.isArray(r.deliveryStops)) return false;
            if (r.deliveryStops.length !== r.stopsCount) return false;

            // Validación defensiva de los elementos
            if (!r.sequence.every(id => typeof id === 'string' && id.trim() !== '')) {
                return false;
            }

            if (!r.deliveryStops.every(stop =>
                stop &&
                typeof stop === 'object' &&
                typeof stop.id === 'string' &&
                stop.id.trim() !== '' &&
                Number.isInteger(stop.order) &&
                stop.order > 0
            )) {
                return false;
            }
        }

        return true;
    }

    render(viewModel) {
        if (!this._isInitialized) {
            console.warn('[Routes] No se puede renderizar: módulo no inicializado.');
            return false;
        }

        if (!this.#isValidViewModel(viewModel)) {
            console.error('[Routes] ViewModel inválido.');
            return false;
        }

        this._lastViewModel = viewModel;
        this.tableContainer.textContent = '';

        const table = document.createElement('table');
        table.className = 'routes-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = [
            { text: 'Vehículo', className: 'col-vehicle' },
            { text: 'Paradas', className: 'col-stops' },
            { text: 'Secuencia', className: 'col-sequence' }
        ];

        headers.forEach(h => {
            const th = document.createElement('th');
            th.setAttribute('scope', 'col');
            th.textContent = h.text;
            th.className = h.className;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (const route of viewModel.routes) {
            const isExpanded = this._expandedRoutes.has(route.vehicleId);

            const tr = document.createElement('tr');
            tr.className = 'route-row';
            tr.dataset.vehicleId = route.vehicleId;

            const tdVehicle = document.createElement('td');
            tdVehicle.className = 'col-vehicle';
            tdVehicle.textContent = route.vehicleId;
            tr.appendChild(tdVehicle);

            const tdStops = document.createElement('td');
            tdStops.className = 'col-stops';
            tdStops.textContent = route.stopsCount.toString();
            tr.appendChild(tdStops);

            const tdSeq = document.createElement('td');
            tdSeq.className = 'col-sequence';

            const summary = document.createElement('span');
            summary.className = 'sequence-summary';
            const firstStop = route.deliveryStops[0].id;
            const lastStop = route.deliveryStops[route.deliveryStops.length - 1].id;
            summary.textContent = `CEDIS → ${firstStop} → … → ${lastStop} → CEDIS`;

            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'route-toggle';
            toggleBtn.textContent = isExpanded ? '▼' : '▶';
            toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            toggleBtn.setAttribute('aria-label', isExpanded ? 'Colapsar' : 'Expandir');

            tdSeq.appendChild(toggleBtn);
            tdSeq.appendChild(summary);
            tr.appendChild(tdSeq);

            tbody.appendChild(tr);

            if (isExpanded) {
                const detailTr = document.createElement('tr');
                detailTr.className = 'route-detail-row';
                const detailTd = document.createElement('td');
                detailTd.colSpan = 3;
                detailTd.className = 'col-detail';

                const sequenceDiv = document.createElement('div');
                sequenceDiv.className = 'sequence-full';
                sequenceDiv.textContent = route.sequence.join(' → ');
                detailTd.appendChild(sequenceDiv);

                detailTr.appendChild(detailTd);
                tbody.appendChild(detailTr);
            }
        }
        table.appendChild(tbody);

        this.tableContainer.appendChild(table);

        this._attachEventListeners();

        return true;
    }

    _attachEventListeners() {
        if (this._handleToggle) {
            this.tableContainer.removeEventListener('click', this._handleToggle);
        }

        this._handleToggle = (e) => {
            if (!(e.target instanceof Element)) return;

            const btn = e.target.closest('.route-toggle');
            if (!btn) return;

            const row = btn.closest('tr');
            if (!row) return;

            const vehicleId = row.dataset.vehicleId;
            if (!vehicleId) return;

            if (this._expandedRoutes.has(vehicleId)) {
                this._expandedRoutes.delete(vehicleId);
            } else {
                this._expandedRoutes.add(vehicleId);
            }

            if (this._lastViewModel) {
                this.render(this._lastViewModel);
            }
        };

        this.tableContainer.addEventListener('click', this._handleToggle);
    }

    destroy() {
        console.log('[Routes] Destruyendo módulo...');
        if (this.tableContainer) {
            this.tableContainer.textContent = '';
        }
        if (this._handleToggle && this.tableContainer) {
            this.tableContainer.removeEventListener('click', this._handleToggle);
        }
        this._handleToggle = null;
        this.container = null;
        this.tableContainer = null;
        this._lastViewModel = null;
        this._expandedRoutes.clear();
        this._isInitialized = false;
    }
}

export const Routes = new RoutesModule();