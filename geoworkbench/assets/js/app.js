import { UIState } from './state/ui-state.js';
import { EventBus } from './events/event-bus.js';
import { ScenarioState } from './state/scenario-state.js';
import { DiagnosticState } from './state/diagnostic-state.js';
import { Dashboard } from './modules/dashboard.js';
import { Terminal } from './modules/terminal.js';
import { Fleet } from './modules/fleet.js';
import { ContextPanel } from './modules/context-panel.js';
import { mapModule } from './modules/map.js';
import { Packages } from './modules/packages.js';
import { Routes } from './modules/routes.js';
import { Validation } from './modules/validation.js'; // NUEVO: VALIDACIÓN
import { dashboardAdapter } from './adapters/dashboard-adapter.js';
import { terminalAdapter } from './adapters/terminal-adapter.js';
import { fleetAdapter } from './adapters/fleet-adapter.js';
import { contextPanelAdapter } from './adapters/context-panel-adapter.js';
import { mapAdapter } from './adapters/map-adapter.js';
import { packagesAdapter } from './adapters/packages-adapter.js';
import { routesAdapter } from './adapters/routes-adapter.js';
import { validationAdapter } from './adapters/validation-adapter.js'; // NUEVO: VALIDACIÓN
import { generateSyntheticMap } from './data/synthetic-map.js';
import { generateSyntheticPackages } from './data/synthetic-packages.js';
import { diagnosticCoordinator } from './services/diagnostic-coordinator.js';
import { queryScenario } from './adapters/application-layer-adapter.js';

class GeoWorkbenchApp {
    constructor() {
        this.subscriptions = [];
        this.abortController = null;
        this._isInitialized = false;
        this._lastDashboardViewModel = null;
        this._lastTerminalViewModel = null;
        this._lastFleetViewModel = null;
        this._lastContextPanelViewModel = null;
        this._lastMapViewModel = null;
        this._lastPackagesViewModel = null;
        this._lastRoutesViewModel = null;
        this._lastValidationViewModel = null; // NUEVO: VALIDACIÓN
        this._syntheticMap = null;
        this._syntheticPackages = null;
    }

    init() {
        if (this._isInitialized) return;
        console.log('[App] Iniciando GeoWorkbench...');
        try {
            this.abortController = new AbortController();
            
            // 1. Generar mapa y paquetes UNA SOLA VEZ
            this._syntheticMap = generateSyntheticMap();
            this._syntheticPackages = generateSyntheticPackages(this._syntheticMap);
            
            // 2. Cargar paquetes en ScenarioState
            ScenarioState.setPackages(this._syntheticPackages.packages);

            // 3. Inicializar módulos
            if (!Dashboard.init()) throw new Error('[App] Fallo el módulo Dashboard.');
            if (!Terminal.init()) throw new Error('[App] Fallo el módulo Terminal.');
            if (!Fleet.init({ onSelect: (vehicleId) => UIState.setSelectedItem('vehicle', vehicleId) })) throw new Error('[App] Fallo el módulo Flota.');
            if (!ContextPanel.init()) throw new Error('[App] Fallo el módulo ContextPanel.');
            if (!mapModule.init()) throw new Error('[App] Fallo el módulo Mapa.');
            if (!Packages.init()) throw new Error('[App] Fallo el módulo Paquetes.');
            if (!Routes.init()) throw new Error('[App] Fallo el módulo Rutas.');
            if (!Validation.init()) throw new Error('[App] Fallo el módulo Validación.'); // NUEVO: VALIDACIÓN

            // Conectar exportación de validación con la lógica existente
            Validation.setExportHandler(() => this._exportDiagnostics()); // NUEVO: VALIDACIÓN

            this._bindDomEvents(this.abortController.signal);
            this._setupSubscriptions();
            this._renderState(UIState);
            // Conexión inicial con FlowCore (Application Layer)
            this._syncGovernance();

            this._isInitialized = true;
            diagnosticCoordinator.log('info', 'App', 'INIT_SUCCESS', 'Aplicación inicializada correctamente.');
            console.log('[App] Inicialización completada con éxito.');
        } catch (error) {
            console.error('[App] Error crítico:', error);
            try { diagnosticCoordinator.log('error', 'App', 'INIT_FAILED', error.message); } catch (e) {}
            this.destroy(); 
            throw error; 
        }
    }

    _bindDomEvents(signal) {
        const nav = document.getElementById('zone-nav');
        if (nav) {
            nav.addEventListener('click', (e) => {
                const navItem = e.target.closest('.nav-item');
                if (!navItem || !nav.contains(navItem)) return;
                let moduleName = navItem.dataset.module;
                if (!moduleName) {
                    const textEl = navItem.querySelector('.nav-text');
                    if (!textEl) return;
                    moduleName = textEl.textContent.trim().toLowerCase();
                    const moduleMap = {
                        'dashboard': 'dashboard', 'mapa': 'map', 'flota': 'fleet',
                        'paquetes': 'packages', 'asignaciones': 'assignments', 
                        'rutas': 'routes', 'capacidad': 'capacity', 'validación': 'validation'
                    };
                    moduleName = moduleMap[moduleName] || moduleName;
                }
                UIState.setActiveModule(moduleName);
            }, { signal });
        }

        const actionsContainer = document.querySelector('.actions');
        if (actionsContainer) {
            actionsContainer.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button || !actionsContainer.contains(button)) return;
                const action = button.dataset.action || button.textContent.trim();
                if (action === 'generate-plan' || action === 'Generar Plan') {
                    console.log('[App] Solicitud de generación de plan.');
                }
            }, { signal });
        }

        const termFilters = document.querySelector('.term-filters');
        if (termFilters) {
            termFilters.addEventListener('click', (e) => {
                const filterBtn = e.target.closest('.term-filter');
                if (!filterBtn) return;
                const text = filterBtn.textContent.trim().toLowerCase();
                const filterMap = { 'todos': 'all', 'warn': 'warning' };
                const filterLevel = filterMap[text] || text;
                UIState.updateTerminalSettings({ activeFilter: filterLevel });
            }, { signal });
        }

        const termSearch = document.querySelector('.term-search');
        if (termSearch) {
            termSearch.addEventListener('input', (e) => {
                UIState.updateTerminalSettings({ searchQuery: e.target.value });
            }, { signal });
        }

        const termActions = document.querySelector('.term-actions');
        if (termActions) {
            termActions.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-icon');
                if (!btn) return;
                const title = btn.getAttribute('title');
                if (title === 'Limpiar Vista') {
                    const events = DiagnosticState.events;
                    const maxSeq = events.length > 0 ? events[events.length - 1].sequence : null;
                    UIState.updateTerminalSettings({ clearedThroughSequence: maxSeq });
                } else if (title === 'Exportar JSON') {
                    this._exportDiagnostics();
                }
            }, { signal });
        }
    }

    _setupSubscriptions() {
        const unsubState = EventBus.on('STATE_CHANGED', (state) => this._renderState(state));
        this.subscriptions.push(unsubState);
        const unsubDiag = EventBus.on('DIAGNOSTIC_UPDATED', () => this._renderTerminal());
        this.subscriptions.push(unsubDiag);
    }

    _renderState(state) {
        const navItems = document.querySelectorAll('.nav-item');
        const moduleMapReverse = {
            'dashboard': 'dashboard', 'map': 'mapa', 'fleet': 'flota',
            'packages': 'paquetes', 'assignments': 'asignaciones', 
            'routes': 'rutas', 'capacity': 'capacidad', 'validation': 'validación'
        };
        navItems.forEach(item => {
            let isActive = false;
            if (item.dataset.module) {
                isActive = (state.activeModule === item.dataset.module);
            } else {
                const textEl = item.querySelector('.nav-text');
                if (textEl) {
                    isActive = (moduleMapReverse[state.activeModule] === textEl.textContent.trim().toLowerCase());
                }
            }
            if (isActive) item.classList.add('active');
            else item.classList.remove('active');
        });

        const dashEl = document.getElementById('module-dashboard');
        const fleetEl = document.getElementById('module-fleet');
        const mapEl = document.getElementById('module-map');
        const packagesEl = document.getElementById('module-packages');
        const routesEl = document.getElementById('module-routes');
        const validationEl = document.getElementById('module-validation'); // NUEVO: VALIDACIÓN

        // Ocultar todos por defecto
        if (dashEl) dashEl.classList.add('hidden');
        if (fleetEl) fleetEl.classList.add('hidden');
        if (mapEl) mapEl.classList.add('hidden');
        if (packagesEl) packagesEl.classList.add('hidden');
        if (routesEl) routesEl.classList.add('hidden');
        if (validationEl) validationEl.classList.add('hidden'); // NUEVO: VALIDACIÓN

        if (state.activeModule === 'dashboard' && dashEl) {
            dashEl.classList.remove('hidden');
            const titleEl = dashEl.querySelector('.workspace-title');
            if (titleEl) titleEl.textContent = 'Resumen del Escenario';
            this._renderDashboard();
        } else if (state.activeModule === 'fleet' && fleetEl) {
            fleetEl.classList.remove('hidden');
            const titleEl = fleetEl.querySelector('.workspace-title');
            if (titleEl) titleEl.textContent = 'Gestión de Flota';
            this._renderFleet();
        } else if (state.activeModule === 'map' && mapEl) {
            mapEl.classList.remove('hidden');
            const titleEl = mapEl.querySelector('.workspace-title');
            if (titleEl) titleEl.textContent = 'Visualización Geográfica';
            this._renderMap();
        } else if (state.activeModule === 'packages' && packagesEl) {
            packagesEl.classList.remove('hidden');
            const titleEl = packagesEl.querySelector('.workspace-title');
            if (titleEl) titleEl.textContent = 'Catálogo de Paquetes';
            this._renderPackages();
        } else if (state.activeModule === 'routes' && routesEl) {
            routesEl.classList.remove('hidden');
            const titleEl = routesEl.querySelector('.workspace-title');
            if (titleEl) titleEl.textContent = 'Visualización de Rutas';
            this._renderRoutes();
        } else if (state.activeModule === 'validation' && validationEl) { // NUEVO: VALIDACIÓN
            validationEl.classList.remove('hidden');
            const titleEl = validationEl.querySelector('.workspace-title');
            if (titleEl) titleEl.textContent = 'Validación de Integridad';
            this._renderValidation();
        }

        // Renderizar Panel Contextual (independiente del módulo activo)
        this._renderContextPanel(state);

        if (this._isInitialized) this._renderTerminal(); 
    }

    _renderDashboard() {
        try {
            const viewModel = dashboardAdapter.project(ScenarioState.summary, ScenarioState.vehicles);
            const vmString = JSON.stringify(viewModel);
            if (this._lastDashboardViewModel === vmString) return;
            if (Dashboard.render(viewModel)) this._lastDashboardViewModel = vmString;
        } catch (error) {
            diagnosticCoordinator.log('error', 'DashboardAdapter', 'PROJECTION_FAILED', 'Falló la proyección del Dashboard.', { error: error.message });
        }
    }

    _renderFleet() {
        try {
            const viewModel = fleetAdapter.project(ScenarioState.vehicles);
            const vmString = JSON.stringify(viewModel);
            if (this._lastFleetViewModel === vmString) return;
            if (Fleet.render(viewModel)) this._lastFleetViewModel = vmString;
        } catch (error) {
            diagnosticCoordinator.log('error', 'FleetAdapter', 'PROJECTION_FAILED', 'Falló la proyección de la Flota.', { error: error.message });
        }
    }

    _renderMap() {
        try {
            const canvas = document.getElementById('map-canvas');
            if (!canvas) {
                console.warn('[App] Canvas del mapa no encontrado.');
                return;
            }

            const container = canvas.parentElement;
            if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
            }

            const width = canvas.width;
            const height = canvas.height;
            if (width === 0 || height === 0) return;

            const fleetVM = fleetAdapter.project(ScenarioState.vehicles);
            const viewModel = mapAdapter.project(this._syntheticMap, fleetVM, UIState.selectedItem, width, height);
            
            const vmString = JSON.stringify(viewModel);
            if (this._lastMapViewModel === vmString) return;

            if (mapModule.render(viewModel)) {
                this._lastMapViewModel = vmString;
            }
        } catch (error) {
            diagnosticCoordinator.log('error', 'MapAdapter', 'PROJECTION_FAILED', 'Falló la proyección del Mapa.', { error: error.message });
            console.error('[App] Error al proyectar el Mapa:', error);
        }
    }

    _renderPackages() {
        try {
            const packages = ScenarioState.packages;
            const fleetVM = fleetAdapter.project(ScenarioState.vehicles);
            const viewModel = packagesAdapter.project(
                { packages: packages }, 
                fleetVM
            );
            
            const vmString = JSON.stringify(viewModel);
            if (this._lastPackagesViewModel === vmString) return;

            if (Packages.render(viewModel)) {
                this._lastPackagesViewModel = vmString;
            }
        } catch (error) {
            diagnosticCoordinator.log('error', 'PackagesAdapter', 'PROJECTION_FAILED', 'Falló la proyección de Paquetes.', { error: error.message });
        }
    }

    _renderRoutes() {
        try {
            if (!this._syntheticMap) {
                throw new Error('[App] No existe el escenario geoespacial para rutas.');
            }

            const viewModel = routesAdapter.project(this._syntheticMap);
            const vmString = JSON.stringify(viewModel);
            
            if (this._lastRoutesViewModel === vmString) return;

            if (Routes.render(viewModel)) {
                this._lastRoutesViewModel = vmString;
            }
        } catch (error) {
            diagnosticCoordinator.log('error', 'RoutesAdapter', 'PROJECTION_FAILED', 'Falló la proyección de Rutas.', { error: error.message });
            console.error('[App] Error al proyectar Rutas:', error);
        }
    }

    // NUEVO: VALIDACIÓN
    _renderValidation() {
        try {
            // Validación lee directamente del estado del dominio (independiente del terminal)
            const summary = ScenarioState.summary;
            const vehicles = ScenarioState.vehicles;
            const packages = ScenarioState.packages;

            const viewModel = validationAdapter.project(summary, vehicles, packages);
            const vmString = JSON.stringify(viewModel);
            
            if (this._lastValidationViewModel === vmString) return;

            if (Validation.render(viewModel)) {
                this._lastValidationViewModel = vmString;
            }
        } catch (error) {
            diagnosticCoordinator.log('error', 'ValidationAdapter', 'PROJECTION_FAILED', 'Falló la proyección de Validación.', { error: error.message });
            console.error('[App] Error al proyectar Validación:', error);
        }
    }

    _renderContextPanel(state) {
        try {
            const selectedItem = state.selectedItem;
            let entity = null;

            if (selectedItem && selectedItem.type === 'vehicle') {
                const vehicles = ScenarioState.vehicles;
                entity = vehicles.find(v => v.id === selectedItem.id);
            }

            const viewModel = contextPanelAdapter.project(selectedItem, entity);
            const vmString = JSON.stringify(viewModel);
            
            if (this._lastContextPanelViewModel === vmString) return;
            
            if (ContextPanel.render(viewModel)) {
                this._lastContextPanelViewModel = vmString;
            }
        } catch (error) {
            diagnosticCoordinator.log('error', 'ContextPanelAdapter', 'PROJECTION_FAILED', 'Falló la proyección del Panel Contextual.', { error: error.message });
        }
    }

    _renderTerminal() {
        try {
            const prefs = UIState.terminal;
            const viewModel = terminalAdapter.project(DiagnosticState.events, prefs);
            const vmString = JSON.stringify(viewModel);
            if (this._lastTerminalViewModel === vmString) return;
            if (Terminal.render(viewModel)) this._lastTerminalViewModel = vmString;
        } catch (error) {
            console.error('[App] Error al proyectar datos para la Terminal:', error);
        }
    }

    _exportDiagnostics() {
        try {
            const snapshot = DiagnosticState.getSnapshot();
            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `geoworkbench_diagnostics_${Date.now()}.json`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('[App] Error al exportar:', error);
        }
    }

        async _syncGovernance() {
        try {
            const res = await queryScenario({
                scenarioId: 's1',
                include: ['activeProposals', 'activeAssignments'],
                token: 'test-token-planner'
            });
            
            if (res.status === 'success') {
                const proposals = res.data.activeProposals || [];
                const assignments = res.data.activeAssignments || [];
                diagnosticCoordinator.log('info', 'FlowCore', 'SYNC_SUCCESS', `Sincronizadas ${proposals.length} propuestas y ${assignments.length} asignaciones desde el backend.`);
            } else {
                diagnosticCoordinator.log('warning', 'FlowCore', 'SYNC_FAILED', `Error de gobernanza: ${res.error.code}`);
            }
        } catch (e) {
            diagnosticCoordinator.log('error', 'FlowCore', 'NETWORK_ERROR', 'Backend no disponible.');
        }
    }

    destroy() {
        Dashboard.destroy();
        Terminal.destroy();
        Fleet.destroy();
        ContextPanel.destroy();
        mapModule.destroy();
        Packages.destroy();
        Routes.destroy();
        Validation.destroy(); // NUEVO: VALIDACIÓN
        
        if (this.subscriptions.length > 0) {
            this.subscriptions.forEach(unsubscribe => unsubscribe());
            this.subscriptions = [];
        }
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        this._lastDashboardViewModel = null;
        this._lastTerminalViewModel = null;
        this._lastFleetViewModel = null;
        this._lastContextPanelViewModel = null;
        this._lastMapViewModel = null;
        this._lastPackagesViewModel = null;
        this._lastRoutesViewModel = null;
        this._lastValidationViewModel = null; // NUEVO: VALIDACIÓN
        this._syntheticMap = null;
        this._syntheticPackages = null;
        this._isInitialized = false;
    }
}

const app = new GeoWorkbenchApp();
window.GeoWorkbench = app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}