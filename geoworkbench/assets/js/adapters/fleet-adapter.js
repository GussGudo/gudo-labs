/**
 * fleet-adapter.js
 * Adaptador puro para transformar datos del dominio (ScenarioState.vehicles) 
 * en un ViewModel de presentación para el módulo de Flota.
 */

const VALID_OPERATIONAL_STATUSES = ['available', 'assigned', 'maintenance', 'inactive'];
const VEHICLE_KEYS = ['id', 'type', 'operationalStatus', 'metrics'];
const METRICS_KEYS = ['volPercentage', 'weightPercentage', 'stopsCount', 'packagesCount'];

class FleetAdapter {
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
        if (desc.get || desc.set) {
            throw new TypeError(`[FleetAdapter] Getter/Setter no permitido en la propiedad '${key}'.`);
        }
        return desc.value;
    }

    /**
     * Valida el contrato completo de un vehículo. (F-04)
     */
    #isValidVehicle(v) {
        if (!this.#isPlainObject(v)) return false;
        if (!this.#hasExactKeys(v, VEHICLE_KEYS)) return false;

        const id = this.#getSafeProp(v, 'id');
        const type = this.#getSafeProp(v, 'type');
        const status = this.#getSafeProp(v, 'operationalStatus');
        const metrics = this.#getSafeProp(v, 'metrics');

        // F-04: ID canónico
        if (typeof id !== 'string' || !id.trim() || id !== id.trim()) return false;
        
        if (typeof type !== 'string' || !type.trim()) return false;
        if (!VALID_OPERATIONAL_STATUSES.includes(status)) return false;
        
        if (!this.#isPlainObject(metrics)) return false;
        if (!this.#hasExactKeys(metrics, METRICS_KEYS)) return false;

        const vol = this.#getSafeProp(metrics, 'volPercentage');
        const weight = this.#getSafeProp(metrics, 'weightPercentage');
        const stops = this.#getSafeProp(metrics, 'stopsCount');
        const packages = this.#getSafeProp(metrics, 'packagesCount');

        if (typeof vol !== 'number' || !Number.isFinite(vol) || vol < 0 || vol > 100) return false;
        if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0 || weight > 100) return false;
        if (!Number.isInteger(stops) || stops < 0) return false;
        if (!Number.isInteger(packages) || packages < 0) return false;

        return true;
    }

    /**
     * Valida el arreglo completo detectando sparse arrays, getters, propiedades extra y descriptor de length.
     * (F-01, F-02, F-06)
     */
    #isValidVehiclesArray(vehicles) {
        if (!Array.isArray(vehicles)) return false;

        // F-06: Validar el descriptor de length
        const lengthDesc = Object.getOwnPropertyDescriptor(vehicles, 'length');
        if (!lengthDesc || lengthDesc.writable !== true || lengthDesc.enumerable !== false || lengthDesc.configurable !== false) {
            return false; 
        }

        // 1. Validar que no haya propiedades extra (solo length e índices válidos)
        const keys = Reflect.ownKeys(vehicles);
        for (const key of keys) {
            if (key === 'length') continue;
            if (typeof key === 'symbol') return false;
            
            const numKey = Number(key);
            if (!Number.isInteger(numKey) || numKey < 0 || numKey >= vehicles.length || String(numKey) !== key) {
                return false; // Propiedad extra detectada
            }
        }

        // 2. Validar cada posición
        for (let i = 0; i < vehicles.length; i++) {
            if (!Object.hasOwn(vehicles, i)) return false; // Sparse array (hueco)

            // F-01: Inspección de descriptor para evitar ejecución de getters
            const desc = Object.getOwnPropertyDescriptor(vehicles, i);
            if (!desc) return false;
            if (desc.get || desc.set) return false;
            if (!desc.enumerable) return false; // Los índices de arreglo deben ser enumerables

            // Validar el vehículo usando el valor seguro
            if (!this.#isValidVehicle(desc.value)) return false;
        }

        return true;
    }

    /**
     * F-05: Detección de IDs duplicados sin usar .map()
     */
    #checkUniqueIds(vehicles) {
        const seen = new Set();
        for (let i = 0; i < vehicles.length; i++) {
            const id = vehicles[i].id; // Ya validado, es seguro leer
            if (seen.has(id)) {
                throw new TypeError('[FleetAdapter] Contrato inválido: existen IDs de vehículo duplicados.');
            }
            seen.add(id);
        }
    }

    // --- Proyección de Estado ---
    
    #projectStatus(vehicle) {
        switch (vehicle.operationalStatus) {
            case 'inactive':
            case 'maintenance':
                return 'inactive';
            case 'available':
                return 'active';
            case 'assigned':
                return vehicle.metrics.volPercentage > 95 ? 'warning' : 'active';
            default:
                throw new TypeError(`[FleetAdapter] Estado operativo desconocido: ${vehicle.operationalStatus}`);
        }
    }

    // --- API Pública ---

    /**
     * Proyecta el arreglo de vehículos al ViewModel de Flota.
     */
    static project(vehicles) {
        const adapter = new FleetAdapter();
        
        // 1. Validar la frontera de entrada
        if (!adapter.#isValidVehiclesArray(vehicles)) {
            throw new TypeError('[FleetAdapter] El arreglo de vehículos es inválido, contiene huecos, getters o propiedades no permitidas.');
        }

        // 2. Validar unicidad de IDs (F-05)
        adapter.#checkUniqueIds(vehicles);

        // 3. F-03: Construcción de la salida con un bucle for
        const projectedVehicles = [];
        for (let i = 0; i < vehicles.length; i++) {
            const v = vehicles[i];
            projectedVehicles.push({
                id: v.id,
                type: v.type,
                status: adapter.#projectStatus(v),
                vol: v.metrics.volPercentage,
                weight: v.metrics.weightPercentage,
                stops: v.metrics.stopsCount,
                packages: v.metrics.packagesCount
            });
        }

        return {
            vehicles: projectedVehicles
        };
    }
}

export const fleetAdapter = FleetAdapter;