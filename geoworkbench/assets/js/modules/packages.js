/**
 * packages.js
 * Módulo de interfaz para el catálogo de paquetes (Zona 3).
 * Responsabilidad: Renderizar el PackagesViewModel en una tabla.
 * NO conoce ScenarioState, UIState, EventBus ni el generador.
 */

class PackagesModule {
    constructor() {
        this.container = null;
        this.tableContainer = null;
        this.summaryEl = null;
        this._isInitialized = false;
    }

    init() {
        if (this._isInitialized) {
            console.warn('[Packages] El módulo ya está inicializado.');
            return true;
        }

        this.container = document.getElementById('module-packages');
        if (!this.container) {
            console.error('[Packages] Contenedor #module-packages no encontrado.');
            return false;
        }

        this.tableContainer = this.container.querySelector('.packages-table-container');
        if (!this.tableContainer) {
            console.error('[Packages] Contenedor .packages-table-container no encontrado.');
            return false;
        }

        this.summaryEl = this.container.querySelector('.packages-summary');
        if (!this.summaryEl) {
            console.error('[Packages] Contenedor .packages-summary no encontrado.');
            return false;
        }

        this._isInitialized = true;
        console.log('[Packages] Inicializado correctamente.');
        return true;
    }

    #isValidViewModel(vm) {
        if (!vm || typeof vm !== 'object' || Array.isArray(vm)) return false;
        if (!Array.isArray(vm.packages)) return false;
        if (vm.packages.length !== 110) return false;
        
        if (typeof vm.totalCount !== 'number' || !Number.isInteger(vm.totalCount) || vm.totalCount !== 110) return false;
        if (typeof vm.assignedCount !== 'number' || !Number.isInteger(vm.assignedCount) || vm.assignedCount !== vm.totalCount) return false;

        const ids = new Set();
        for (const p of vm.packages) {
            if (!p || typeof p !== 'object') return false;
            if (typeof p.id !== 'string' || p.id.trim() === '') return false;
            if (ids.has(p.id)) return false;
            ids.add(p.id);
            
            if (typeof p.weight !== 'number' || !Number.isFinite(p.weight) || p.weight < 0) return false;
            if (typeof p.vol !== 'number' || !Number.isFinite(p.vol) || p.vol < 0) return false;
            if (typeof p.vehicleId !== 'string' || p.vehicleId.trim() === '') return false;
            if (typeof p.stopId !== 'string' || p.stopId.trim() === '') return false;
        }

        return true;
    }

    render(viewModel) {
        if (!this._isInitialized) {
            console.warn('[Packages] No se puede renderizar: módulo no inicializado.');
            return false;
        }

        if (!this.#isValidViewModel(viewModel)) {
            console.error('[Packages] ViewModel inválido.');
            return false;
        }

        // 1. Limpiar contenedores
        this.tableContainer.textContent = '';

        // 2. Crear tabla
        const table = document.createElement('table');
        table.className = 'packages-table';

        // 3. Encabezado
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = [
            { text: 'ID', className: 'col-id' },
            { text: 'Peso', className: 'col-weight' },
            { text: 'Volumen', className: 'col-vol' },
            { text: 'Vehículo', className: 'col-vehicle' }
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

        // 4. Cuerpo
        const tbody = document.createElement('tbody');
        for (const p of viewModel.packages) {
            const tr = document.createElement('tr');
            
            const tdId = document.createElement('td');
            tdId.className = 'col-id';
            tdId.textContent = p.id;
            tr.appendChild(tdId);

            const tdWeight = document.createElement('td');
            tdWeight.className = 'col-weight';
            tdWeight.textContent = `${p.weight.toFixed(2)} kg`;
            tr.appendChild(tdWeight);

            const tdVol = document.createElement('td');
            tdVol.className = 'col-vol';
            tdVol.textContent = `${p.vol.toFixed(3)} m³`;
            tr.appendChild(tdVol);

            const tdVehicle = document.createElement('td');
            tdVehicle.className = 'col-vehicle';
            tdVehicle.textContent = p.vehicleId;
            tr.appendChild(tdVehicle);

            tbody.appendChild(tr);
        }
        table.appendChild(tbody);

        // 5. Inyectar tabla
        this.tableContainer.appendChild(table);

        // 6. Actualizar resumen (PM-06: fuera del scroll)
        this.summaryEl.textContent = `Total: ${viewModel.totalCount} · Asignados: ${viewModel.assignedCount}`;

        return true;
    }

    destroy() {
        console.log('[Packages] Destruyendo módulo...');
        if (this.tableContainer) {
            this.tableContainer.textContent = '';
        }
        if (this.summaryEl) {
            this.summaryEl.textContent = '';
        }
        this.container = null;
        this.tableContainer = null;
        this.summaryEl = null;
        this._isInitialized = false;
    }
}

export const Packages = new PackagesModule();