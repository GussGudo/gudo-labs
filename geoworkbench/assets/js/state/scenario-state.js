/**
 * scenario-state.js
 * Fuente única de verdad para los datos del escenario (Dominio).
 * Implementa validación semántica estricta y transacciones atómicas.
 */

const VALID_OPERATIONAL_STATUSES = ['available', 'assigned', 'maintenance', 'inactive'];

const METADATA_KEYS = ['seed', 'generatedAt', 'isValid'];
const SUMMARY_KEYS = ['totalPackages', 'totalStops', 'assignedVehicles', 'totalVehicles', 'totalDistanceKm'];
const VEHICLE_KEYS = ['id', 'type', 'operationalStatus', 'metrics'];
const METRICS_KEYS = ['volPercentage', 'weightPercentage', 'stopsCount', 'packagesCount'];
const PACKAGE_KEYS = ['id', 'weight', 'vol', 'vehicleId', 'stopId'];

class ScenarioStateManager {
    #state = {
        metadata: {
            seed: '20261101',
            generatedAt: null,
            isValid: true
        },
        summary: {
            totalPackages: 110,
            totalStops: 93,
            assignedVehicles: 3,
            totalVehicles: 5,
            totalDistanceKm: 8.81
        },
        vehicles: [
            { id: 'v1', type: 'Van Pequeña', operationalStatus: 'assigned', metrics: { volPercentage: 99.88, weightPercentage: 27.86, stopsCount: 39, packagesCount: 43} },
            { id: 'v2', type: 'Van Pequeña', operationalStatus: 'assigned', metrics: { volPercentage: 99.91, weightPercentage: 27.86, stopsCount: 20, packagesCount: 26} },
            { id: 'v3', type: 'Van Mediana', operationalStatus: 'assigned', metrics: { volPercentage: 48.33, weightPercentage: 27.86, stopsCount: 34, packagesCount: 41 } },
            { id: 'v4', type: 'Van Mediana', operationalStatus: 'available', metrics: { volPercentage: 0.00, weightPercentage: 0.00, stopsCount: 0, packagesCount: 0 } },
            { id: 'v5', type: 'Van Grande', operationalStatus: 'inactive', metrics: { volPercentage: 0.00, weightPercentage: 0.00, stopsCount: 0, packagesCount: 0 } }
        ],
        packages: []
    };

    // SC-PKG-03B: Indicador de catálogo cargado
    #packagesLoaded = false;

    // --- Getters Públicos (Copias defensivas profundas) ---
    get metadata() { return structuredClone(this.#state.metadata); }
    get summary() { return structuredClone(this.#state.summary); }
    get vehicles() { return structuredClone(this.#state.vehicles); }
    get packages() { return structuredClone(this.#state.packages); }

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

    #isValidMetadata(metadata) {
        if (!this.#isPlainObject(metadata)) return false;
        if (!this.#hasExactKeys(metadata, METADATA_KEYS)) return false;
        
        if (typeof metadata.seed !== 'string' || !metadata.seed.trim()) return false;
        if (typeof metadata.isValid !== 'boolean') return false;
        
        if (metadata.generatedAt !== null) {
            if (typeof metadata.generatedAt !== 'string') return false;
            const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
            if (!isoRegex.test(metadata.generatedAt)) return false;
            const parsedDate = Date.parse(metadata.generatedAt);
            if (!Number.isFinite(parsedDate)) return false;
            if (new Date(parsedDate).toISOString() !== metadata.generatedAt) return false;
        }
        return true;
    }

    #isValidVehicle(vehicle) {
        if (!this.#isPlainObject(vehicle)) return false;
        if (!this.#hasExactKeys(vehicle, VEHICLE_KEYS)) return false;
        
        if (typeof vehicle.id !== 'string' || !vehicle.id.trim() || vehicle.id.trim() !== vehicle.id) return false;
        if (typeof vehicle.type !== 'string' || !vehicle.type.trim()) return false;
        if (!VALID_OPERATIONAL_STATUSES.includes(vehicle.operationalStatus)) return false;
        
        const m = vehicle.metrics;
        if (!this.#isPlainObject(m)) return false;
        if (!this.#hasExactKeys(m, METRICS_KEYS)) return false;
        
        if (typeof m.volPercentage !== 'number' || !Number.isFinite(m.volPercentage) || m.volPercentage < 0 || m.volPercentage > 100) return false;
        if (typeof m.weightPercentage !== 'number' || !Number.isFinite(m.weightPercentage) || m.weightPercentage < 0 || m.weightPercentage > 100) return false;
        if (!Number.isInteger(m.stopsCount) || m.stopsCount < 0) return false;
        if (!Number.isInteger(m.packagesCount) || m.packagesCount < 0) return false;
        return true;
    }

    #isValidVehiclesArray(vehicles) {
        if (!Array.isArray(vehicles)) return false;
        for (let i = 0; i < vehicles.length; i++) {
            if (!Object.hasOwn(vehicles, i)) return false;
            if (!this.#isValidVehicle(vehicles[i])) return false;
        }
        return true;
    }

    #isValidSummary(summary) {
        if (!this.#isPlainObject(summary)) return false;
        if (!this.#hasExactKeys(summary, SUMMARY_KEYS)) return false;

        if (!Number.isInteger(summary.totalPackages) || summary.totalPackages < 0) return false;
        if (!Number.isInteger(summary.totalStops) || summary.totalStops < 0) return false;
        if (!Number.isInteger(summary.assignedVehicles) || summary.assignedVehicles < 0) return false;
        if (!Number.isInteger(summary.totalVehicles) || summary.totalVehicles < 0) return false;
        if (typeof summary.totalDistanceKm !== 'number' || !Number.isFinite(summary.totalDistanceKm) || summary.totalDistanceKm < 0) return false;
        if (summary.assignedVehicles > summary.totalVehicles) return false;
        return true;
    }

    #isValidPackage(pkg) {
        if (!this.#isPlainObject(pkg)) return false;
        if (!this.#hasExactKeys(pkg, PACKAGE_KEYS)) return false;

        if (typeof pkg.id !== 'string' || !pkg.id.trim()) return false;
        if (typeof pkg.weight !== 'number' || !Number.isFinite(pkg.weight) || pkg.weight < 0) return false;
        if (typeof pkg.vol !== 'number' || !Number.isFinite(pkg.vol) || pkg.vol < 0) return false;
        if (typeof pkg.vehicleId !== 'string' || !pkg.vehicleId.trim()) return false;
        if (typeof pkg.stopId !== 'string' || !pkg.stopId.trim()) return false;

        return true;
    }

    #isValidPackagesArray(packages) {
        if (!Array.isArray(packages)) return false;
        for (let i = 0; i < packages.length; i++) {
            if (!Object.hasOwn(packages, i)) return false;
            if (!this.#isValidPackage(packages[i])) return false;
        }
        return true;
    }

    #validatePackageReferences(packages, vehicles) {
        const vehicleIds = new Set(vehicles.map(v => v.id));
        for (const pkg of packages) {
            if (!vehicleIds.has(pkg.vehicleId)) {
                throw new Error(`[ScenarioState] Contrato inválido: vehículo inexistente en paquete ${pkg.id}.`);
            }
        }
    }

    #checkUniqueIds(vehicles) {
        const ids = vehicles.map(v => v.id);
        if (new Set(ids).size !== ids.length) {
            throw new Error('[ScenarioState] Contrato inválido: existen IDs de vehículo duplicados.');
        }
    }

    #deriveAggregates(vehicles) {
        return {
            totalVehicles: vehicles.length,
            assignedVehicles: vehicles.filter(v => v.operationalStatus === 'assigned').length
        };
    }

    // --- Mutadores Transaccionales ---

    setSummary(newSummary) {
        if (!this.#isValidSummary(newSummary)) {
            throw new Error('[ScenarioState] Contrato inválido: setSummary recibió datos incorrectos.');
        }
        const currentAggregates = this.#deriveAggregates(this.#state.vehicles);
        if (newSummary.totalVehicles !== currentAggregates.totalVehicles || 
            newSummary.assignedVehicles !== currentAggregates.assignedVehicles) {
            throw new Error('[ScenarioState] Contrato inválido: el summary no coincide con la flota actual. Use loadScenario() para cambios integrales.');
        }

        // SC-PKG-03B: Validar cardinalidad solo si el catálogo está cargado
        if (this.#packagesLoaded && newSummary.totalPackages !== this.#state.packages.length) {
            throw new Error('[ScenarioState] Contrato inválido: totalPackages no coincide con el catálogo cargado.');
        }

        this.#state.summary = structuredClone(newSummary);
    }

    setVehicles(newVehicles) {
        if (!this.#isValidVehiclesArray(newVehicles)) {
            throw new Error('[ScenarioState] Contrato inválido: uno o más vehículos no cumplen la estructura del dominio o el arreglo contiene huecos.');
        }
        this.#checkUniqueIds(newVehicles);
        const newAggregates = this.#deriveAggregates(newVehicles);
        if (newAggregates.totalVehicles !== this.#state.summary.totalVehicles || 
            newAggregates.assignedVehicles !== this.#state.summary.assignedVehicles) {
            throw new Error('[ScenarioState] Contrato inválido: la nueva flota no coincide con el summary actual. Use loadScenario() para cambios integrales.');
        }

        // SC-PKG-03A: Validar referencias de paquetes a la nueva flota
        if (this.#packagesLoaded) {
            this.#validatePackageReferences(this.#state.packages, newVehicles);
        }

        this.#state.vehicles = structuredClone(newVehicles);
    }

    setPackages(newPackages) {
        if (!this.#isValidPackagesArray(newPackages)) {
            throw new Error('[ScenarioState] Contrato inválido: uno o más paquetes no cumplen la estructura del dominio.');
        }
        
        if (newPackages.length !== this.#state.summary.totalPackages) {
            throw new Error(`[ScenarioState] Contrato inválido: la cantidad de paquetes (${newPackages.length}) no coincide con el summary (${this.#state.summary.totalPackages}).`);
        }

        this.#validatePackageReferences(newPackages, this.#state.vehicles);
        
        const ids = newPackages.map(p => p.id);
        if (new Set(ids).size !== ids.length) {
            throw new Error('[ScenarioState] Contrato inválido: existen IDs de paquete duplicados.');
        }

        this.#state.packages = structuredClone(newPackages);
        this.#packagesLoaded = true; // SC-PKG-03B
    }

    loadScenario(newScenario) {
        if (!this.#isPlainObject(newScenario)) {
            throw new Error('[ScenarioState] Contrato inválido: loadScenario requiere un objeto.');
        }
        if (!this.#isValidMetadata(newScenario.metadata)) {
            throw new Error('[ScenarioState] Contrato inválido: metadata ausente o mal formada.');
        }
        if (!this.#isValidSummary(newScenario.summary)) {
            throw new Error('[ScenarioState] Contrato inválido: summary ausente o mal formado.');
        }
        if (!this.#isValidVehiclesArray(newScenario.vehicles)) {
            throw new Error('[ScenarioState] Contrato inválido: vehicles ausente, con huecos, o contiene datos mal formados.');
        }
        
        this.#checkUniqueIds(newScenario.vehicles);
        const derived = this.#deriveAggregates(newScenario.vehicles);
        if (newScenario.summary.totalVehicles !== derived.totalVehicles || 
            newScenario.summary.assignedVehicles !== derived.assignedVehicles) {
            throw new Error('[ScenarioState] Contrato inválido: el summary recibido no coincide con la flota derivada. Rechazando carga para evitar corrupción.');
        }

        let packagesToStore = [];

        // SC-PKG-03C: Distinguir entre propiedad omitida, presente con [] o presente inválida
        if (Object.hasOwn(newScenario, 'packages')) {
            if (!this.#isValidPackagesArray(newScenario.packages)) {
                throw new Error('[ScenarioState] Contrato inválido: packages presente pero mal formado.');
            }

            if (newScenario.packages.length !== newScenario.summary.totalPackages) {
                throw new Error(`[ScenarioState] Contrato inválido: la cantidad de paquetes (${newScenario.packages.length}) no coincide con el summary (${newScenario.summary.totalPackages}).`);
            }

            this.#validatePackageReferences(newScenario.packages, newScenario.vehicles);

            const pkgIds = newScenario.packages.map(p => p.id);
            if (new Set(pkgIds).size !== pkgIds.length) {
                throw new Error('[ScenarioState] Contrato inválido: existen IDs de paquete duplicados.');
            }

            packagesToStore = structuredClone(newScenario.packages);
        } else {
            // Propiedad omitida: solo permitida si totalPackages === 0
            if (newScenario.summary.totalPackages !== 0) {
                throw new Error(`[ScenarioState] Contrato inválido: summary indica ${newScenario.summary.totalPackages} paquetes pero no se proporcionó el catálogo.`);
            }
        }

        const nextState = {
            metadata: structuredClone(newScenario.metadata),
            summary: structuredClone(newScenario.summary),
            vehicles: structuredClone(newScenario.vehicles),
            packages: packagesToStore
        };

        this.#state = nextState;
        this.#packagesLoaded = true;
    }
}

export const ScenarioState = new ScenarioStateManager();