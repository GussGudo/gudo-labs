/**
 * validation.js
 * Módulo de interfaz para la vista de validación (Zona 3).
 * Responsabilidad: Presentar el ValidationViewModel y permitir la exportación.
 */

class ValidationModule {
    constructor() {
        this.container = null;
        this.bodyContainer = null;
        this._isInitialized = false;
    }

    init() {
        if (this._isInitialized) {
            console.warn('[Validation] El módulo ya está inicializado.');
            return true;
        }

        this.container = document.getElementById('module-validation');
        if (!this.container) {
            console.error('[Validation] Contenedor #module-validation no encontrado.');
            return false;
        }

        this.bodyContainer = this.container.querySelector('.validation-body');
        if (!this.bodyContainer) {
            console.error('[Validation] Contenedor .validation-body no encontrado.');
            return false;
        }

        this._isInitialized = true;
        console.log('[Validation] Inicializado correctamente.');
        return true;
    }

    #isValidViewModel(vm) {
        if (!vm || typeof vm !== 'object' || Array.isArray(vm)) return false;
        if (!['PASS', 'FAIL'].includes(vm.status)) return false;
        if (!Array.isArray(vm.checks) || vm.checks.length !== 7) return false;

        // Validar conteos
        if (!Number.isInteger(vm.totalChecks) || vm.totalChecks !== 7) return false;
        if (!Number.isInteger(vm.passedChecks) || vm.passedChecks < 0) return false;
        if (!Number.isInteger(vm.failedChecks) || vm.failedChecks < 0) return false;
        if (vm.passedChecks + vm.failedChecks !== vm.totalChecks) return false;

        const actualPassed = vm.checks.filter(c => c.passed).length;
        if (actualPassed !== vm.passedChecks) return false;
        if (vm.failedChecks !== vm.checks.length - actualPassed) return false;
        if (vm.status !== (vm.failedChecks === 0 ? 'PASS' : 'FAIL')) return false;

        // Validar estructura de cada check
        const expectedIds = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'];
        const actualIds = [];
        for (const c of vm.checks) {
            if (!c || typeof c !== 'object') return false;
            if (typeof c.id !== 'string' || typeof c.name !== 'string') return false;
            if (typeof c.passed !== 'boolean') return false;
            if (typeof c.details !== 'string') return false;
            actualIds.push(c.id);
        }

        // Validar que los IDs sean exactamente C1-C7 sin duplicados
        if (new Set(actualIds).size !== actualIds.length) return false;
        if (!expectedIds.every(id => actualIds.includes(id))) return false;

        return true;
    }

    render(viewModel) {
        if (!this._isInitialized) {
            console.warn('[Validation] No se puede renderizar: módulo no inicializado.');
            return false;
        }

        if (!this.#isValidViewModel(viewModel)) {
            console.error('[Validation] ViewModel inválido.');
            return false;
        }

        // 1. Limpiar contenedor
        this.bodyContainer.textContent = '';

        // 2. Tarjeta de estado general
        const statusCard = document.createElement('div');
        statusCard.className = `validation-status ${viewModel.status === 'PASS' ? 'status-pass' : 'status-fail'}`;

        const statusIcon = document.createElement('div');
        statusIcon.className = 'status-icon';
        statusIcon.textContent = viewModel.status === 'PASS' ? '✓' : '✗';

        const statusText = document.createElement('div');
        statusText.className = 'status-text';
        statusText.textContent = viewModel.status === 'PASS' ? 'PASS' : 'FAIL';

        const statusDetails = document.createElement('div');
        statusDetails.className = 'status-details';
        statusDetails.textContent = `${viewModel.passedChecks} de ${viewModel.totalChecks} comprobaciones aprobadas`;

        statusCard.appendChild(statusIcon);
        statusCard.appendChild(statusText);
        statusCard.appendChild(statusDetails);
        this.bodyContainer.appendChild(statusCard);

        // 3. Lista de comprobaciones
        const checksList = document.createElement('div');
        checksList.className = 'validation-checks';

        for (const check of viewModel.checks) {
            const checkItem = document.createElement('div');
            checkItem.className = `check-item ${check.passed ? 'check-pass' : 'check-fail'}`;

            const checkIcon = document.createElement('span');
            checkIcon.className = 'check-icon';
            checkIcon.textContent = check.passed ? '✓' : '✗';

            const checkId = document.createElement('span');
            checkId.className = 'check-id';
            checkId.textContent = check.id;

            const checkName = document.createElement('span');
            checkName.className = 'check-name';
            checkName.textContent = check.name;

            const checkDetails = document.createElement('span');
            checkDetails.className = 'check-details';
            checkDetails.textContent = check.details;

            checkItem.appendChild(checkIcon);
            checkItem.appendChild(checkId);
            checkItem.appendChild(checkName);
            checkItem.appendChild(checkDetails);
            checksList.appendChild(checkItem);
        }
        this.bodyContainer.appendChild(checksList);

        // 4. Botón de exportación
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn-full validation-export';
        exportBtn.textContent = 'Exportar Diagnóstico';
        exportBtn.addEventListener('click', () => {
            if (this._onExport) {
                this._onExport();
            }
        });
        this.bodyContainer.appendChild(exportBtn);

        return true;
    }

    setExportHandler(handler) {
        this._onExport = handler;
    }

    destroy() {
        console.log('[Validation] Destruyendo módulo...');
        if (this.bodyContainer) {
            this.bodyContainer.textContent = '';
        }
        this._onExport = null;
        this.container = null;
        this.bodyContainer = null;
        this._isInitialized = false;
    }
}

export const Validation = new ValidationModule();